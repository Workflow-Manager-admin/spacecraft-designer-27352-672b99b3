import React from "react";

/**
 * PUBLIC_INTERFACE
 * SidebarPalette
 * Renders draggable items (rooms, walls, doors, windows, furniture) as a palette for dragging onto the canvas.
 */
function SidebarPalette({ onDragStart }) {
  const paletteItems = [
    { type: "room", label: "Room" },
    { type: "wall", label: "Wall" },
    { type: "door", label: "Door" },
    { type: "window", label: "Window" },
    { type: "furniture", label: "Furniture" }
  ];

  return (
    <aside
      className="designer-sidebar designer-sidebar-left"
      aria-label="Elements palette"
    >
      <h3 className="sidebar-title">Palette</h3>
      <div className="draggable-list">
        {paletteItems.map((item) => (
          <div
            key={item.type}
            className={`draggable-item ${item.type}`}
            draggable
            onDragStart={(e) => onDragStart(e, item.type)}
            tabIndex={0}
            aria-label={`Drag ${item.label}`}
          >
            {item.label}
          </div>
        ))}
      </div>
    </aside>
  );
}

export default SidebarPalette;
