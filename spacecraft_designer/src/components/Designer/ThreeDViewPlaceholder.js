import React from "react";

/**
 * PUBLIC_INTERFACE
 * ThreeDViewPlaceholder
 * Shows a placeholder for eventual 3D visualization of the floor plan.
 * Replace this with a real 3D renderer (e.g., Three.js) in the future.
 */
function ThreeDViewPlaceholder() {
  return (
    <section className="designer-canvas-section" aria-label="3D Visualization">
      <div
        className="canvas-container threed-mode"
        tabIndex={0}
        style={{
          outline: "none",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 350,
          minWidth: 380,
          background: "#222b38",
          color: "#FFF",
          border: "2.5px dashed #ffa64d",
          borderRadius: 14,
          fontWeight: 500,
          fontSize: "1.35rem"
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2.6rem", marginBottom: 10, color: "#FFC107" }}>🛰️</div>
          <div>3D Visualization Coming Soon</div>
          <div style={{ color: "#FFA64D", fontSize: "0.98rem", marginTop: "0.6em" }}>
            Switch back to 2D to edit your floor plan.
          </div>
        </div>
      </div>
    </section>
  );
}

export default ThreeDViewPlaceholder;
