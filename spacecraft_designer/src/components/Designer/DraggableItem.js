import React from "react";

/**
 * PUBLIC_INTERFACE
 * DraggableItem - Renders a palette item that can be dragged onto the canvas.
 * Not used directly in v1 since SidebarPalette inlines the logic, but provided for modular future use.
 */
function DraggableItem({ type, label, onDragStart }) {
  return (
    <div
      className={`draggable-item ${type}`}
      draggable
      onDragStart={onDragStart}
      tabIndex={0}
      aria-label={`Drag ${label}`}
    >
      {label}
    </div>
  );
}

export default DraggableItem;
