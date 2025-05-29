import React, { useRef, useState, useEffect } from "react";
import CanvasItem from "./CanvasItem";
import MeasurementTools from "./MeasurementTools";

/**
 * PUBLIC_INTERFACE
 * CanvasArea
 * Central design canvas. Handles drop, rendering, selection, and moving of design items.
 * Adds in-canvas measurement tool overlays (distance & area), controlled via props.
 *
 * Props:
 * - items: array of items to display
 * - onDropItem: function({type, x, y}) called when an item is dropped from palette
 * - onSelectItem: function(id) for selection
 * - onMoveItem: function(id, newX, newY) for moving
 * - selectedItemId: id of currently selected item
 * - onDeleteSelected: function to call to delete selected item
 * - viewMode: canvas mode ("2D" | "3D")
 * - measurementMode: "distance" | "area" | null (active tool, or not active)
 * - onMeasurementResult: function({distance, area}) -> displays in sidebar
 * - onToggleMeasurement: (toolMode: string | null) => void
 */
function CanvasArea({
  items,
  onDropItem,
  onSelectItem,
  onMoveItem,
  selectedItemId,
  onDeleteSelected,
  viewMode = "2D",
  // New props for measurement
  measurementMode = null,
  onMeasurementResult = () => {},
  onToggleMeasurement = () => {},
}) {
  const canvasRef = useRef();

  // Local state for canvas bounding rect (for correct overlay positioning)
  const [canvasBounds, setCanvasBounds] = useState({
    width: 800,
    height: 400,
    left: 0,
    top: 0
  });

  // Re-measure bounding box after mount or when mode changes
  useEffect(() => {
    const updateBounds = () => {
      if (canvasRef.current) {
        const r = canvasRef.current.getBoundingClientRect();
        setCanvasBounds({
          width: Math.round(r.width),
          height: Math.round(r.height),
          left: Math.round(r.left),
          top: Math.round(r.top)
        });
      }
    };
    updateBounds();
    window.addEventListener("resize", updateBounds);
    return () => window.removeEventListener("resize", updateBounds);
  }, [viewMode]);

  // Handle drop from palette to canvas (new item)
  const handleDrop = (e) => {
    e.preventDefault();
    const type = e.dataTransfer.getData("application/x-item-type");
    // Calculate drop position relative to the canvas bounds
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - canvasRect.left;
    const y = e.clientY - canvasRect.top;
    if (type && !measurementMode) {
      onDropItem({ type, x, y });
    }
  };

  // If measuring, suppress normal click functionality
  const isMeasuring = measurementMode != null;

  return (
    <section className="designer-canvas-section" aria-label="Design canvas">
      <div
        className={`canvas-container ${viewMode.toLowerCase()}-mode`}
        ref={canvasRef}
        tabIndex={0}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onKeyDown={(e) => {
          if (e.key === "Delete" && selectedItemId != null && !isMeasuring) {
            onDeleteSelected();
          }
        }}
        style={{ outline: "none", position: "relative" }}
      >
        {/* Measurement overlay */}
        {isMeasuring && (
          <MeasurementTools
            mode={measurementMode}
            onResult={onMeasurementResult}
            width={canvasBounds.width}
            height={canvasBounds.height}
            offsetLeft={canvasBounds.left}
            offsetTop={canvasBounds.top}
            onDeactivate={() => onToggleMeasurement(null)}
          />
        )}
        {/* Render Canvas Items */}
        {items.length === 0 && (
          <span className="canvas-placeholder">
            {viewMode} Canvas (Drag & drop elements here)
          </span>
        )}
        {items.map((item) => (
          <CanvasItem
            key={item.id}
            {...item}
            selected={selectedItemId === item.id}
            onSelect={() => !isMeasuring && onSelectItem(item.id)}
            onMove={onMoveItem}
            width={item.width}
            height={item.height}
            onResize={
              item.type === "room" || item.type === "wall"
                ? (id, data) => onMoveItem(id, data.x, data.y, { width: data.width, height: data.height })
                : undefined
            }
          />
        ))}
      </div>
    </section>
  );
}

export default CanvasArea;
