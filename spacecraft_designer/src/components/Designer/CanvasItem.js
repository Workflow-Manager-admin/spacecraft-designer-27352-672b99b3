import React, { useRef, useState } from "react";

/**
 * PUBLIC_INTERFACE
 * CanvasItem
 * Render a draggable/selectable design item on the canvas.
 * Props:
 * - id, type, x, y, selected
 * - onSelect: select callback
 * - onMove: move callback (id, newX, newY)
 */
function CanvasItem({ id, type, x, y, selected, onSelect, onMove }) {
  const itemRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // Begin dragging existing canvas item
  const handleMouseDown = (e) => {
    e.stopPropagation();
    setDragging(true);
    setOffset({
      x: e.clientX - x,
      y: e.clientY - y
    });
    if (onSelect) onSelect(id);
  };

  // Drag over document for move
  const handleMouseMove = (e) => {
    if (!dragging) return;
    const newX = e.clientX - offset.x;
    const newY = e.clientY - offset.y;
    onMove(id, newX, newY);
  };

  // End dragging
  const handleMouseUp = () => {
    if (dragging) {
      setDragging(false);
    }
  };

  React.useEffect(() => {
    if (dragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  // eslint-disable-next-line
  }, [dragging, handleMouseMove, handleMouseUp]);

  // Visuals for different types (simple shape & color per type)
  const renderShape = () => {
    switch (type) {
      case "room":
        return (
          <div
            style={{
              width: 100,
              height: 70,
              background: "#E2F0FB",
              border: selected ? "2px solid #1976D2" : "2px solid #a3c9f7",
              borderRadius: 7,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            🏠 Room
          </div>
        );
      case "wall":
        return (
          <div
            style={{
              width: 100,
              height: 14,
              background: "#bbb",
              borderRadius: 6,
              border: selected ? "2px solid #1976D2" : "2px solid #888",
              margin: "auto"
            }}
          >
            {/* Wall Visual */}
          </div>
        );
      case "door":
        return (
          <div
            style={{
              width: 28,
              height: 40,
              background: "#fff8e1",
              border: selected ? "2px solid #FFC107" : "2px solid #DDD096",
              borderRadius: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            🚪
          </div>
        );
      case "window":
        return (
          <div
            style={{
              width: 38,
              height: 22,
              background: "#e1f7fa",
              border: selected ? "2px solid #61b5be" : "2px solid #a2d1d6",
              borderRadius: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            🪟
          </div>
        );
      case "furniture":
        return (
          <div
            style={{
              width: 50,
              height: 36,
              background: "#fff8e6",
              border: selected ? "2px solid #FFC107" : "2px dashed #FFC107",
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            🪑
          </div>
        );
      default:
        return (
          <div
            style={{
              width: 40,
              height: 40,
              background: "#ddd",
              border: selected ? "2px solid #000" : "2px solid #aaa"
            }}
          >
            {type}
          </div>
        );
    }
  };

  return (
    <div
      ref={itemRef}
      className={`canvas-item ${type}${selected ? " selected" : ""}`}
      onMouseDown={handleMouseDown}
      onClick={() => onSelect && onSelect(id)}
      role="button"
      tabIndex={0}
      style={{
        position: "absolute",
        left: x,
        top: y,
        cursor: dragging ? "grabbing" : "pointer",
        zIndex: selected ? 1 : 0,
        outline: selected ? "2px solid #1976D2" : "none"
      }}
      aria-label={`${type} ${selected ? "selected" : ""}`}
    >
      {renderShape()}
      {/* Add resize/move handles as needed in future */}
    </div>
  );
}

export default CanvasItem;
