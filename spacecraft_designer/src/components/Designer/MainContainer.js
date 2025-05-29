import React, { useState, useCallback } from "react";
import "./MainContainer.css";
import SidebarPalette from "./SidebarPalette";
import CanvasArea from "./CanvasArea";
import ThreeDViewPlaceholder from "./ThreeDViewPlaceholder";

/**
 * PUBLIC_INTERFACE
 * MainContainer for the SpaceCraft Designer.
 * Contains global state and orchestrates layout, drag-drop, and editor logic.
 */
function MainContainer() {
  // Canvas mode state
  const [viewMode, setViewMode] = useState("2D"); // "2D" | "3D"

  // Items on the canvas: {id, type, x, y}
  const [canvasItems, setCanvasItems] = useState([]);

  // Selected item id for interaction
  const [selectedItemId, setSelectedItemId] = useState(null);

  // Counter for new ids
  const [lastItemId, setLastItemId] = useState(0);

  // Handler to switch view modes
  // PUBLIC_INTERFACE
  const handleToggleView = () => {
    setViewMode(viewMode === "2D" ? "3D" : "2D");
  };

  // Called when a palette item begins drag
  const handlePaletteDragStart = (e, type) => {
    e.dataTransfer.setData("application/x-item-type", type);
  };

  // Called when an item is dropped from palette to canvas
  const handleDropItem = ({ type, x, y }) => {
    const id = lastItemId + 1;
    setCanvasItems([
      ...canvasItems,
      { id, type, x, y }
    ]);
    setLastItemId(id);
    setSelectedItemId(id);
  };

  // Select an item (by id)
  const handleSelectItem = (id) => {
    setSelectedItemId(id);
  };

  // Move item (when dragged on canvas)
  // PUBLIC_INTERFACE
  const handleMoveItem = (id, newX, newY) => {
    setCanvasItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, x: newX, y: newY } : item
      )
    );
  };

  // Delete selected item
  const handleDeleteSelected = () => {
    if (selectedItemId == null) return;
    setCanvasItems((items) =>
      items.filter((item) => item.id !== selectedItemId)
    );
    setSelectedItemId(null);
  };

  return (
    <div className="designer-root light-theme">
      {/* Top action bar */}
      <header className="designer-topbar">
        <div className="designer-project-title">
          <span role="img" aria-label="rocket" className="project-emoji">
            🚀
          </span>
          SpaceCraft Designer
        </div>
        <div className="designer-actions">
          <button className="btn primary">Save</button>
          <button className="btn accent">Export</button>
          <button className="btn" title="Undo" disabled>
            ⟲ Undo
          </button>
          <button className="btn" title="Redo" disabled>
            ⟳ Redo
          </button>
          <button
            className="btn view-toggle"
            onClick={handleToggleView}
            aria-label="Toggle 2D/3D"
          >
            {viewMode === "2D" ? "Switch to 3D" : "Switch to 2D"}
          </button>
        </div>
      </header>

      <div className="designer-content">
        {/* Left Sidebar: Draggable palette */}
        <SidebarPalette onDragStart={handlePaletteDragStart} />

        {/* Central Canvas or 3D View */}
        {viewMode === "2D" ? (
          <CanvasArea
            items={canvasItems}
            onDropItem={handleDropItem}
            onSelectItem={handleSelectItem}
            onMoveItem={handleMoveItem}
            selectedItemId={selectedItemId}
            onDeleteSelected={handleDeleteSelected}
            viewMode={viewMode}
          />
        ) : (
          <ThreeDViewPlaceholder />
        )}

        {/* Right Sidebar: Properties, Measurements */}
        <aside className="designer-sidebar designer-sidebar-right" aria-label="Element properties">
          <h3 className="sidebar-title">Properties</h3>
          <div className="properties-placeholder">
            {/* Placeholder for properties/measurements panel */}
            <p>
              {selectedItemId
                ? `Selected: ${
                    (canvasItems.find((it) => it.id === selectedItemId) || {}).type
                  } #${selectedItemId}`
                : "Select an element to view details."}
            </p>
            <div className="measurements">
              <strong>Measurement Tools</strong>
              <ul>
                <li>Distance: --</li>
                <li>Area: --</li>
              </ul>
            </div>
            {selectedItemId && (
              <button
                className="btn"
                style={{ marginTop: "12px", background: "#ffecec", color: "#c01010" }}
                onClick={handleDeleteSelected}
              >
                Delete Element
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default MainContainer;
