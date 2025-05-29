import React, { useRef, useState } from "react";

/**
 * PUBLIC_INTERFACE
 * MeasurementTools
 * Overlay SVG-based measurement tools for the canvas.
 *
 * Props:
 * - mode: "distance" | "area" | null (which tool is active)
 * - onResult: function({distance, area}) callback with computed values, or null
 * - width, height: dimensions of the drawing area (canvas in px)
 * - offsetLeft, offsetTop: pixel offsets of the drawing area (for mouse coordinates)
 * - onDeactivate: callback to turn off measurement mode
 */
function MeasurementTools({
  mode,
  onResult,
  width,
  height,
  offsetLeft,
  offsetTop,
  onDeactivate,
}) {
  // For distance tool: [start, end]
  const [points, setPoints] = useState([]);
  // For area tool: array of points in polygon
  const [polygon, setPolygon] = useState([]);
  // Area preview (closed or not)
  const [isDrawingArea, setIsDrawingArea] = useState(false);

  // Track mouse position for live preview
  const [livePoint, setLivePoint] = useState(null);
  const svgRef = useRef();

  // Convert event to [x,y] relative to canvas
  const getCoords = (e) => {
    let x, y;
    if (e.touches && e.touches.length) {
      x = e.touches[0].clientX - offsetLeft;
      y = e.touches[0].clientY - offsetTop;
    } else {
      x = e.clientX - offsetLeft;
      y = e.clientY - offsetTop;
    }
    // Boundaries
    x = Math.max(0, Math.min(width, x));
    y = Math.max(0, Math.min(height, y));
    return [x, y];
  };

  // Distance mode: handle clicks and drags
  const handleDistanceMouseDown = (e) => {
    if (points.length === 0) {
      // Start point
      setPoints([getCoords(e)]);
      setLivePoint(null);
    } else if (points.length === 1) {
      // End point
      const end = getCoords(e);
      setPoints([points[0], end]);
      if (onResult) {
        const d = calcDistance(points[0], end);
        onResult({ distance: d, area: null });
      }
    } else {
      // Reset selection
      setPoints([]);
      if (onResult) onResult({ distance: null, area: null });
    }
    e.stopPropagation();
  };

  // Distance mode: live endpoint preview
  const handleDistanceMouseMove = (e) => {
    if (points.length === 1) {
      setLivePoint(getCoords(e));
    }
  };

  // Area mode: handle clicks (add verts) and double click (close)
  const handleAreaMouseDown = (e) => {
    const pt = getCoords(e);
    if (!isDrawingArea) {
      setPolygon([pt]);
      setIsDrawingArea(true);
      setLivePoint(null);
    } else if (polygon.length < 50) {
      setPolygon((prev) => [...prev, pt]);
      setLivePoint(null);
    }
    e.stopPropagation();
  };

  // Area mode: preview next vert
  const handleAreaMouseMove = (e) => {
    if (isDrawingArea && polygon.length > 0) {
      setLivePoint(getCoords(e));
    }
  };

  // Area mode: double click or right click closes polygon
  const handleAreaDoubleClick = (e) => {
    e.preventDefault();
    if (polygon.length >= 3) {
      // Close polygon
      setPolygon((prev) => [...prev]);
      setIsDrawingArea(false);
      if (onResult) {
        const a = calcArea(polygon);
        onResult({ distance: null, area: a });
      }
    }
  };
  const handleAreaRightClick = (e) => {
    e.preventDefault();
    if (polygon.length >= 3) {
      setIsDrawingArea(false);
      if (onResult) {
        const a = calcArea(polygon);
        onResult({ distance: null, area: a });
      }
    }
  };

  // Utility: Euclidean distance between 2 points
  function calcDistance([x1, y1], [x2, y2]) {
    return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
  }
  // Utility: Shoelace formula for area, px^2
  function calcArea(pts) {
    let n = pts.length, area = 0;
    for (let i = 0; i < n; i++) {
      const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % n];
      area += (x1 * y2) - (x2 * y1);
    }
    return Math.abs(area) / 2;
  }

  // Keydown - Escape cancels current interaction
  React.useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setPoints([]);
        setPolygon([]);
        setIsDrawingArea(false);
        setLivePoint(null);
        if (onResult) onResult({ distance: null, area: null });
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
    // eslint-disable-next-line
  }, [onResult]);

  // Deactivate when mode is turned off
  React.useEffect(() => {
    if (!mode) {
      setPoints([]);
      setPolygon([]);
      setIsDrawingArea(false);
      setLivePoint(null);
    }
  }, [mode]);

  // SVG event handlers
  const svgProps =
    mode === "distance"
      ? {
          onMouseDown: handleDistanceMouseDown,
          onMouseMove: handleDistanceMouseMove,
          style: { cursor: points.length === 1 ? "crosshair" : "pointer" }
        }
      : mode === "area"
      ? {
          onMouseDown: handleAreaMouseDown,
          onDoubleClick: handleAreaDoubleClick,
          onContextMenu: handleAreaRightClick,
          onMouseMove: handleAreaMouseMove,
          style: { cursor: isDrawingArea ? "crosshair" : "pointer" }
        }
      : {};

  // Render measurement overlay
  return mode ? (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        pointerEvents: "all",
        zIndex: 30
      }}
      {...svgProps}
    >
      {/* Distance tool overlay */}
      {mode === "distance" && points.length === 1 && livePoint && (
        <g>
          <circle cx={points[0][0]} cy={points[0][1]} r={4} fill="#1976D2" />
          <line
            x1={points[0][0]}
            y1={points[0][1]}
            x2={livePoint[0]}
            y2={livePoint[1]}
            stroke="#3489ea"
            strokeDasharray="5,4"
            strokeWidth={2}
          />
          <circle cx={livePoint[0]} cy={livePoint[1]} r={4} fill="#00ca8d" />
        </g>
      )}
      {mode === "distance" && points.length === 2 && (
        <g>
          <circle cx={points[0][0]} cy={points[0][1]} r={5} fill="#1976D2" />
          <circle cx={points[1][0]} cy={points[1][1]} r={5} fill="#e45531" />
          <line
            x1={points[0][0]}
            y1={points[0][1]}
            x2={points[1][0]}
            y2={points[1][1]}
            stroke="#1976D2"
            strokeWidth={3}
          />
          <text
            x={(points[0][0] + points[1][0]) / 2}
            y={(points[0][1] + points[1][1]) / 2 - 10}
            fill="#1976D2" fontSize={16} textAnchor="middle"
            style={{ background: "#fff" }}
          >
            {calcDistance(points[0], points[1]).toFixed(1)} px
          </text>
        </g>
      )}

      {/* Area tool overlay (polygon preview + area result) */}
      {mode === "area" && polygon.length > 0 && (
        <g>
          {polygon.length > 1 && (
            <polyline
              points={
                polygon
                  .map(([x, y]) => `${x},${y}`)
                  .concat(livePoint ? `${livePoint[0]},${livePoint[1]}` : [])
                  .join(" ")
              }
              fill={
                isDrawingArea && polygon.length > 2 && livePoint
                  ? "rgba(25, 118, 210, 0.16)"
                  : "none"
              }
              stroke="#1976D2"
              strokeWidth={2.5}
              strokeDasharray={isDrawingArea ? "5,2" : undefined}
            />
          )}
          {/* Vertices */}
          {polygon.map(([x, y], i) => (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={5}
              fill={i === 0 ? "#1976D2" : "#ffc107"}
              stroke="#fff"
              strokeWidth={i === 0 ? 2.5 : 1}
            />
          ))}
          {/* Live preview vertex (while adding) */}
          {isDrawingArea && livePoint && (
            <circle cx={livePoint[0]} cy={livePoint[1]} r={5} fill="#00ca8d" />
          )}
          {/* Area label (once closed) */}
          {!isDrawingArea &&
            polygon.length >= 3 &&
            (() => {
              // Place label at centroid
              const c = polygon.reduce(
                (acc, [x, y]) => [acc[0] + x, acc[1] + y],
                [0, 0]
              ).map((s) => s / polygon.length);
              return (
                <text
                  x={c[0]}
                  y={c[1]}
                  fill="#1976D2"
                  fontSize={16}
                  textAnchor="middle"
                  style={{ background: "#fff" }}
                >
                  {calcArea(polygon).toFixed(2)} px²
                </text>
              );
            })()}
        </g>
      )}
      {/* Deactivate button in-canvas, top right */}
      <g>
        <foreignObject x={width - 110} y={8} width={102} height={40}>
          <button
            onClick={onDeactivate}
            style={{
              padding: "7px 16px",
              border: "1.5px solid #aaa",
              borderRadius: 6,
              fontWeight: "bold",
              background: "#fff",
              color: "#1976D2",
              marginLeft: 3,
              cursor: "pointer",
            }}
          >
            Exit Measure
          </button>
        </foreignObject>
      </g>
    </svg>
  ) : null;
}

export default MeasurementTools;
