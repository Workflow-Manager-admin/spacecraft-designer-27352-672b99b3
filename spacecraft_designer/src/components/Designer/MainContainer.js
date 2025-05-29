import React, { useState } from "react";
import "./MainContainer.css";

/**
 * PUBLIC_INTERFACE
 * MainContainer for the SpaceCraft Designer.
 * Organizes overall layout: TopBar, LeftSidebar, CanvasArea, RightSidebar.
 * Handles 2D/3D view toggle and basic layout state.
 */
function MainContainer() {
  // Canvas mode state
  const [viewMode, setViewMode] = useState("2D"); // "2D" | "3D"

  // Handler to switch view modes
  // PUBLIC_INTERFACE
  const handleToggleView = () => {
    setViewMode(viewMode === "2D" ? "3D" : "2D");
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
        <aside className="designer-sidebar designer-sidebar-left" aria-label="Elements palette">
          <h3 className="sidebar-title">Palette</h3>
          <div className="draggable-list">
            <div className="draggable-item room">Room</div>
            <div className="draggable-item wall">Wall</div>
            <div className="draggable-item door">Door</div>
            <div className="draggable-item window">Window</div>
            <div className="draggable-item furniture">Furniture</div>
          </div>
        </aside>

        {/* Central Canvas */}
        <section className="designer-canvas-section" aria-label="Design canvas">
          <div className={`canvas-container ${viewMode.toLowerCase()}-mode`}>
            <span className="canvas-placeholder">
              {viewMode} Canvas (Drag &amp; drop elements here)
            </span>
          </div>
        </section>

        {/* Right Sidebar: Properties, Measurements */}
        <aside className="designer-sidebar designer-sidebar-right" aria-label="Element properties">
          <h3 className="sidebar-title">Properties</h3>
          <div className="properties-placeholder">
            {/* Placeholder for properties/measurements panel */}
            <p>Select an element to view details.</p>
            <div className="measurements">
              <strong>Measurement Tools</strong>
              <ul>
                <li>Distance: --</li>
                <li>Area: --</li>
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default MainContainer;
