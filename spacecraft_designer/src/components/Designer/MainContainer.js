import React, { useState, useRef } from "react";
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

  // Ref for the SVG canvas snapshot (used for export as image)
  const canvasSnapshotRef = useRef(null);

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

  // Measurement UI state
  const [measurementMode, setMeasurementMode] = useState(null); // 'distance' | 'area' | null
  const [measurementResult, setMeasurementResult] = useState({ distance: null, area: null });

  // Handlers for measurement tool activation
  const handleToggleMeasurement = (tool) => {
    if (measurementMode === tool) {
      setMeasurementMode(null);
      setMeasurementResult({ distance: null, area: null });
    } else {
      setMeasurementMode(tool);
      setMeasurementResult({ distance: null, area: null });
    }
  };

  // Handler for measurement result updates
  const handleMeasurementResult = (result) => {
    setMeasurementResult(result || { distance: null, area: null });
  };

  // PUBLIC_INTERFACE
  // Save design to localStorage
  const handleSave = () => {
    try {
      const state = {
        canvasItems,
        lastItemId,
      };
      localStorage.setItem("spacecraft_designer_saved", JSON.stringify(state));
      alert("Design saved to your browser!");
    } catch (err) {
      alert("Failed to save: " + err.message);
    }
  };

  // PUBLIC_INTERFACE
  // Export design as image (PNG) using an SVG-to-image approach
  const handleExportAsImage = async () => {
    // We'll render the canvas items into a temporary <svg> node in the DOM and export it.
    // For simplicity, we'll do a very minimal SVG export matching core item shapes and positions.

    // Find canvas size heuristically
    const padding = 30;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    if (canvasItems.length > 0) {
      canvasItems.forEach(({ x, y, type }) => {
        let w = 60, h = 40; // Default for unknown types
        if (type === "room") { w = 100; h = 70; }
        else if (type === "wall") { w = 100; h = 14; }
        else if (type === "door") { w = 28; h = 40; }
        else if (type === "window") { w = 38; h = 22; }
        else if (type === "furniture") { w = 50; h = 36; }
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x + w);
        maxY = Math.max(maxY, y + h);
      });
    } else {
      minX = 0; minY = 0; maxX = 400; maxY = 270;
    }
    const width = Math.max(400, maxX - minX + padding * 2);
    const height = Math.max(270, maxY - minY + padding * 2);

    // Build SVG content
    const getSvgForType = (item) => {
      switch (item.type) {
        case "room":
          return `<rect x="${item.x + padding}" y="${item.y + padding}" width="100" height="70" rx="7" fill="#E2F0FB" stroke="#1976D2" stroke-width="2"/><text x="${item.x + 100 / 2 + padding}" y="${item.y + 70 / 2 + padding + 7}" font-size="18" text-anchor="middle" fill="#1976D2" font-family="Inter,Arial">🏠</text>`;
        case "wall":
          return `<rect x="${item.x + padding}" y="${item.y + padding}" width="100" height="14" rx="6" fill="#bbb" stroke="#1976D2" stroke-width="2"/>`;
        case "door":
          return `<rect x="${item.x + padding}" y="${item.y + padding}" width="28" height="40" rx="3" fill="#fff8e1" stroke="#FFC107" stroke-width="2"/><text x="${item.x + 14 + padding}" y="${item.y + 20 + padding + 2}" font-size="18" text-anchor="middle" fill="#FFC107" font-family="Inter,Arial">🚪</text>`;
        case "window":
          return `<rect x="${item.x + padding}" y="${item.y + padding}" width="38" height="22" rx="3" fill="#e1f7fa" stroke="#61b5be" stroke-width="2"/><text x="${item.x + 19 + padding}" y="${item.y + 14 + padding}" font-size="14" text-anchor="middle" fill="#1a7491" font-family="Inter,Arial">🪟</text>`;
        case "furniture":
          return `<rect x="${item.x + padding}" y="${item.y + padding}" width="50" height="36" rx="6" fill="#fff8e6" stroke="#FFC107" stroke-width="2" stroke-dasharray="5,2"/><text x="${item.x + 25 + padding}" y="${item.y + 21 + padding}" font-size="16" text-anchor="middle" fill="#FFC107" font-family="Inter,Arial">🪑</text>`;
        default:
          return `<rect x="${item.x + padding}" y="${item.y + padding}" width="40" height="40" rx="7" fill="#ddd" stroke="#000" stroke-width="2"/><text x="${item.x + 20 + padding}" y="${item.y + 27 + padding}" font-size="14" text-anchor="middle" fill="#222" font-family="Inter,Arial">${item.type}</text>`;
      }
    };

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">`;
    svg += `<rect x="0" y="0" width="${width}" height="${height}" fill="#fdfdfd"/>`;
    svg += canvasItems.map(getSvgForType).join("");
    svg += "</svg>";

    // Convert SVG to Image and then to PNG for download
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const img = new window.Image();
    img.onload = function () {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#fdfdfd";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0);

      // Download as PNG
      canvas.toBlob((pngBlob) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(pngBlob);
        a.download = "spacecraft-design.png";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }, "image/png");

      URL.revokeObjectURL(url);
    };
    img.onerror = function () {
      alert("Export failed: Image conversion error.");
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  // PUBLIC_INTERFACE
  // Export design as PDF (mock: offer browser alert instead of actual PDF generation if jsPDF not present)
  const handleExportAsPDF = async () => {
    if (typeof window.jsPDF !== "undefined") {
      // Optional: if jsPDF is loaded globally, use it
      // We'll just draw the PNG export as an image for now
      try {
        // Generate a PNG to add to PDF
        const padding = 30;
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        if (canvasItems.length > 0) {
          canvasItems.forEach(({ x, y, type }) => {
            let w = 60, h = 40;
            if (type === "room") { w = 100; h = 70; }
            else if (type === "wall") { w = 100; h = 14; }
            else if (type === "door") { w = 28; h = 40; }
            else if (type === "window") { w = 38; h = 22; }
            else if (type === "furniture") { w = 50; h = 36; }
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x + w);
            maxY = Math.max(maxY, y + h);
          });
        } else {
          minX = 0; minY = 0; maxX = 400; maxY = 270;
        }
        const width = Math.max(400, maxX - minX + padding * 2);
        const height = Math.max(270, maxY - minY + padding * 2);

        // Build SVG
        const getSvgForType = (item) => {
          switch (item.type) {
            case "room":
              return `<rect x="${item.x + padding}" y="${item.y + padding}" width="100" height="70" rx="7" fill="#E2F0FB" stroke="#1976D2" stroke-width="2"/><text x="${item.x + 100 / 2 + padding}" y="${item.y + 70 / 2 + padding + 7}" font-size="18" text-anchor="middle" fill="#1976D2" font-family="Inter,Arial">🏠</text>`;
            case "wall":
              return `<rect x="${item.x + padding}" y="${item.y + padding}" width="100" height="14" rx="6" fill="#bbb" stroke="#1976D2" stroke-width="2"/>`;
            case "door":
              return `<rect x="${item.x + padding}" y="${item.y + padding}" width="28" height="40" rx="3" fill="#fff8e1" stroke="#FFC107" stroke-width="2"/><text x="${item.x + 14 + padding}" y="${item.y + 20 + padding + 2}" font-size="18" text-anchor="middle" fill="#FFC107" font-family="Inter,Arial">🚪</text>`;
            case "window":
              return `<rect x="${item.x + padding}" y="${item.y + padding}" width="38" height="22" rx="3" fill="#e1f7fa" stroke="#61b5be" stroke-width="2"/><text x="${item.x + 19 + padding}" y="${item.y + 14 + padding}" font-size="14" text-anchor="middle" fill="#1a7491" font-family="Inter,Arial">🪟</text>`;
            case "furniture":
              return `<rect x="${item.x + padding}" y="${item.y + padding}" width="50" height="36" rx="6" fill="#fff8e6" stroke="#FFC107" stroke-width="2" stroke-dasharray="5,2"/><text x="${item.x + 25 + padding}" y="${item.y + 21 + padding}" font-size="16" text-anchor="middle" fill="#FFC107" font-family="Inter,Arial">🪑</text>`;
            default:
              return `<rect x="${item.x + padding}" y="${item.y + padding}" width="40" height="40" rx="7" fill="#ddd" stroke="#000" stroke-width="2"/><text x="${item.x + 20 + padding}" y="${item.y + 27 + padding}" font-size="14" text-anchor="middle" fill="#222" font-family="Inter,Arial">${item.type}</text>`;
          }
        };

        let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">`;
        svg += `<rect x="0" y="0" width="${width}" height="${height}" fill="#fdfdfd"/>`;
        svg += canvasItems.map(getSvgForType).join("");
        svg += "</svg>";

        // Convert SVG to Image and then to PNG data URL
        const blob = new Blob([svg], { type: "image/svg+xml" });
        const url = URL.createObjectURL(blob);
        const img = new window.Image();
        img.onload = function () {
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.fillStyle = "#fdfdfd";
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0);
          const pngDataUrl = canvas.toDataURL("image/png");
          const doc = new window.jsPDF({
            orientation: width > height ? "l" : "p",
            unit: "px",
            format: [width, height]
          });
          doc.addImage(pngDataUrl, "PNG", 0, 0, width, height);
          doc.save("spacecraft-design.pdf");
          URL.revokeObjectURL(url);
        };
        img.onerror = function () {
          alert("PDF Export failed: Image conversion error.");
          URL.revokeObjectURL(url);
        };
        img.src = url;
      } catch (err) {
        alert("PDF Export error: " + err.message);
      }
    } else {
      // No jsPDF library detected, show alert
      alert(
        "PDF export requires jsPDF. Please add jsPDF to your project to enable this feature."
      );
    }
  };

  // PUBLIC_INTERFACE
  // Mock for future: save design to user account (stubbed only)
  const handleSaveToAccount = () => {
    // Here, one would call a backend API with the design/job/user info.
    setTimeout(() => {
      alert("Saved to your SpaceCraft Designer account! (stubbed)");
    }, 600);
  };

  // Export dropdown menu logic for Export button
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  const handleExportClick = () => setShowExportDropdown((v) => !v);

  // Close dropdown when clicking away
  React.useEffect(() => {
    if (!showExportDropdown) return;
    function handleClick(e) {
      setShowExportDropdown(false);
    }
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [showExportDropdown]);

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
        <div className="designer-actions" style={{ position: "relative" }}>
          <button
            className="btn primary"
            onClick={handleSave}
            title="Save to your browser"
          >
            Save
          </button>

          <div style={{ display: "inline-block", position: "relative" }}>
            <button
              className="btn accent"
              onClick={(e) => {
                e.stopPropagation();
                handleExportClick();
              }}
              title="Export your design"
            >
              Export ▾
            </button>
            {showExportDropdown && (
              <div
                style={{
                  position: "absolute",
                  top: "120%",
                  right: 0,
                  background: "#fff",
                  border: "1px solid #eee",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.10)",
                  borderRadius: 6,
                  zIndex: 1000,
                  minWidth: 166,
                  padding: "0.2em 0",
                  fontSize: "0.98em"
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="btn"
                  style={{
                    display: "block",
                    width: "100%",
                    border: "none",
                    borderRadius: 0,
                    textAlign: "left",
                    background: "none",
                    padding: "10px 18px",
                    color: "#222"
                  }}
                  onClick={handleExportAsImage}
                >
                  Export as PNG
                </button>
                <button
                  className="btn"
                  style={{
                    display: "block",
                    width: "100%",
                    border: "none",
                    borderRadius: 0,
                    textAlign: "left",
                    background: "none",
                    padding: "10px 18px",
                    color: "#222"
                  }}
                  onClick={handleExportAsPDF}
                >
                  Export as PDF
                </button>
              </div>
            )}
          </div>
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
                    (canvasItems.find((it) => it.id === selectedItemId) || {})
                      .type
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
            <button
              className="btn"
              style={{
                marginTop: "12px",
                background: "#e6fff3",
                color: "#236d32",
              }}
              onClick={handleSaveToAccount}
            >
              Save to Account (mock)
            </button>
            {selectedItemId && (
              <button
                className="btn"
                style={{
                  marginTop: "12px",
                  background: "#ffecec",
                  color: "#c01010",
                }}
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
