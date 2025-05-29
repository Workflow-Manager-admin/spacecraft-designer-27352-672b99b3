import React, { useRef } from "react";
import CanvasItem from "./CanvasItem";

/**
 * PUBLIC_INTERFACE
 * CanvasArea
 * Central design canvas. Handles drop, rendering, selection, and moving of design items.
 * 
 * Props:
 * - items: array of items to display
 * - onDropItem: function({type, x, y}) called when an item is dropped from palette
 * - onSelectItem: function(id) for selection
 * - onMoveItem: function(id, newX, newY) for moving
 * - selectedItemId: id of currently selected item
 * - onDeleteSelected: function to call to delete selected item
 */
function CanvasArea({
  items,
  onDropItem,
  onSelectItem,
  onMoveItem,
  selectedItemId,
  onDeleteSelected,
  viewMode = "2D"
}) {
  const canvasRef = useRef();

  // Handle drop from palette to canvas (new item)
  const handleDrop = (e) => {
    e.preventDefault();
    const type = e.dataTransfer.getData("application/x-item-type");
    // Calculate drop position relative to the canvas bounds
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - canvasRect.left;
    const y = e.clientY - canvasRect.top;
    if (type) {
      onDropItem({ type, x, y });
    }
  };

  return (
    <section className="designer-canvas-section" aria-label="Design canvas">
      <div
        className={`canvas-container ${viewMode.toLowerCase()}-mode`}
        ref={canvasRef}
        tabIndex={0}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onKeyDown={(e) => {
          if (e.key === "Delete" && selectedItemId != null) {
            onDeleteSelected();
          }
        }}
        style={{ outline: "none", position: "relative" }}
      >
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
            onSelect={() => onSelectItem(item.id)}
            onMove={onMoveItem}
          />
        ))}
      </div>
    </section>
  );
}

export default CanvasArea;
