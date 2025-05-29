import React, { useRef, useState } from "react";
import "./CanvasItem.css";

/**
 * PUBLIC_INTERFACE
 * CanvasItem
 * Render a draggable/selectable design item on the canvas.
 * Props:
 * - id, type, x, y, width, height, selected
 * - onSelect: select callback
 * - onMove: move callback (id, newX, newY)
 * - onResize: (id, newWidth, newHeight) callback for resizing
 */
function CanvasItem({
  id,
  type,
  x,
  y,
  width,
  height,
  selected,
  onSelect,
  onMove,
  onResize,
}) {
  const itemRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // Resize state
  const [resizing, setResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState(null); // 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w'
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0, itemX: 0, itemY: 0 });

  // Default sizes per type
  const typeDefaults = {
    room: { width: 100, height: 70 },
    wall: { width: 100, height: 14 },
    door: { width: 28, height: 40 },
    window: { width: 38, height: 22 },
    furniture: { width: 50, height: 36 },
    default: { width: 40, height: 40 },
  };
  const minSizes = {
    room: { width: 40, height: 30 },
    wall: { width: 25, height: 8 },
    furniture: { width: 18, height: 12 },
    default: { width: 16, height: 12 },
  };

  const itemW = typeof width === "number" ? width : typeDefaults[type]?.width || typeDefaults.default.width;
  const itemH = typeof height === "number" ? height : typeDefaults[type]?.height || typeDefaults.default.height;

  // Begin dragging existing canvas item
  const handleMouseDown = (e) => {
    // If resize, ignore drag
    if (resizing) return;
    e.stopPropagation();
    setDragging(true);
    setOffset({
      x: e.clientX - x,
      y: e.clientY - y,
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

  // Begin resizing
  const handleResizeMouseDown = (handle, e) => {
    e.stopPropagation();
    // Prevent text selection
    e.preventDefault && e.preventDefault();
    setResizing(true);
    setResizeHandle(handle);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: itemW,
      height: itemH,
      itemX: x,
      itemY: y,
    });
    if (onSelect) onSelect(id);
  };

  // Resize drag - interactive
  const handleResizeMouseMove = (e) => {
    if (!resizing) return;
    const dx = e.clientX - resizeStart.x;
    const dy = e.clientY - resizeStart.y;
    let newW = resizeStart.width, newH = resizeStart.height;
    let newX = resizeStart.itemX, newY = resizeStart.itemY;

    // Corner/side handles logic (basic, no rotation)
    switch (resizeHandle) {
      case "se":
        newW = resizeStart.width + dx;
        newH = resizeStart.height + dy;
        break;
      case "s":
        newH = resizeStart.height + dy;
        break;
      case "e":
        newW = resizeStart.width + dx;
        break;
      case "ne":
        newW = resizeStart.width + dx;
        newH = resizeStart.height - dy;
        newY = resizeStart.itemY + dy;
        break;
      case "n":
        newH = resizeStart.height - dy;
        newY = resizeStart.itemY + dy;
        break;
      case "nw":
        newW = resizeStart.width - dx;
        newH = resizeStart.height - dy;
        newX = resizeStart.itemX + dx;
        newY = resizeStart.itemY + dy;
        break;
      case "w":
        newW = resizeStart.width - dx;
        newX = resizeStart.itemX + dx;
        break;
      case "sw":
        newW = resizeStart.width - dx;
        newX = resizeStart.itemX + dx;
        newH = resizeStart.height + dy;
        break;
      default:
        break;
    }
    const minW = minSizes[type]?.width || minSizes.default.width;
    const minH = minSizes[type]?.height || minSizes.default.height;
    if (newW < minW) {
      newX += newW - minW;
      newW = minW;
    }
    if (newH < minH) {
      newY += newH - minH;
      newH = minH;
    }

    // Only call onResize if changing (let parent handle state)
    if (onResize) {
      onResize(id, {
        x: newX,
        y: newY,
        width: newW,
        height: newH,
      });
    }
  };

  // End resizing
  const handleResizeMouseUp = () => {
    if (resizing) {
      setResizing(false);
      setResizeHandle(null);
      setResizeStart({ x: 0, y: 0, width: 0, height: 0, itemX: 0, itemY: 0 });
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
    if (resizing) {
      document.addEventListener("mousemove", handleResizeMouseMove);
      document.addEventListener("mouseup", handleResizeMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleResizeMouseMove);
        document.removeEventListener("mouseup", handleResizeMouseUp);
      };
    }
    // eslint-disable-next-line
  }, [dragging, resizing, handleMouseMove, handleMouseUp, handleResizeMouseMove, handleResizeMouseUp]);

  // Visuals for different types (simple shape & color per type)
  // Use the current width, height for shapes where relevant (rooms, walls, furniture only for now)
  const renderShape = () => {
    switch (type) {
      case "room":
        return (
          <div
            style={{
              width: itemW,
              height: itemH,
              background: "#E2F0FB",
              border: selected ? "2px solid #1976D2" : "2px solid #a3c9f7",
              borderRadius: 7,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "width 0.08s, height 0.08s"
            }}
          >
            🏠 Room
          </div>
        );
      case "wall":
        return (
          <div
            style={{
              width: itemW,
              height: itemH,
              background: "#bbb",
              borderRadius: 6,
              border: selected ? "2px solid #1976D2" : "2px solid #888",
              margin: "auto",
              transition: "width 0.08s, height 0.08s"
            }}
          >
            {/* Wall Visual */}
          </div>
        );
      case "furniture":
        return (
          <div
            style={{
              width: itemW,
              height: itemH,
              background: "#fff8e6",
              border: selected ? "2px solid #FFC107" : "2px dashed #FFC107",
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "width 0.08s, height 0.08s"
            }}
          >
            🪑
          </div>
        );
      case "door":
        return (
          <div
            style={{
              width: itemW,
              height: itemH,
              background: "#fff8e1",
              border: selected ? "2px solid #FFC107" : "2px solid #DDD096",
              borderRadius: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "width 0.08s, height 0.08s"
            }}
          >
            🚪
          </div>
        );
      case "window":
        return (
          <div
            style={{
              width: itemW,
              height: itemH,
              background: "#e1f7fa",
              border: selected ? "2px solid #61b5be" : "2px solid #a2d1d6",
              borderRadius: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "width 0.08s, height 0.08s"
            }}
          >
            🪟
          </div>
        );
      default:
        return (
          <div
            style={{
              width: itemW,
              height: itemH,
              background: "#ddd",
              border: selected ? "2px solid #000" : "2px solid #aaa",
              transition: "width 0.08s, height 0.08s"
            }}
          >
            {type}
          </div>
        );
    }
  };

  // PUBLIC_INTERFACE
  // Draw resize handles if selected and type supports resizing
  const resizableTypes = ["room", "wall"];
  const showResizeHandles = selected && resizableTypes.includes(type);

  // Resize handle positions - corners and edges for boxes
  const resizeHandles = [
    { key: "nw", style: { left: -6, top: -6, cursor: "nwse-resize" } },
    { key: "n", style: { left: itemW / 2 - 6, top: -6, cursor: "ns-resize" } },
    { key: "ne", style: { right: -6, top: -6, cursor: "nesw-resize" } },
    { key: "e", style: { right: -6, top: itemH / 2 - 6, cursor: "ew-resize" } },
    { key: "se", style: { right: -6, bottom: -6, cursor: "nwse-resize" } },
    { key: "s", style: { left: itemW / 2 - 6, bottom: -6, cursor: "ns-resize" } },
    { key: "sw", style: { left: -6, bottom: -6, cursor: "nesw-resize" } },
    { key: "w", style: { left: -6, top: itemH / 2 - 6, cursor: "ew-resize" } },
  ];

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
        cursor: dragging ? "grabbing" : (showResizeHandles ? "default" : "pointer"),
        zIndex: selected ? 1 : 0,
        outline: selected ? "2px solid #1976D2" : "none",
        userSelect: resizing ? "none" : undefined,
      }}
      aria-label={`${type} ${selected ? "selected" : ""}`}
    >
      {renderShape()}
      {/* Draw resize handles for rooms/walls when selected */}
      {showResizeHandles &&
        resizeHandles.map((h) => (
          <div
            key={h.key}
            className={"resize-handle"}
            style={{
              position: "absolute",
              width: 12,
              height: 12,
              borderRadius: "50%",
              border: "2px solid #1976D2",
              background: "#fff",
              ...h.style,
              boxSizing: "border-box",
              zIndex: 10,
              boxShadow: "0 0 4px #1976D222",
            }}
            onMouseDown={(e) => handleResizeMouseDown(h.key, e)}
            role="presentation"
            data-testid={`resize-handle-${h.key}`}
          ></div>
        ))}
    </div>
  );
}

export default CanvasItem;
