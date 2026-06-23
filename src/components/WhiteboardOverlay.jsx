import React, { useRef, useState, useEffect } from "react";
import { Pencil, Highlighter, Eraser, Trash2, Undo, CircleOff, Sparkles } from "lucide-react";

export default function WhiteboardOverlay({ isOpen, isSmartBoard }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState("pen"); // pen, highlighter, eraser, laser
  const [color, setColor] = useState("#ef4444"); // Default red pen
  const [laserPos, setLaserPos] = useState({ x: 0, y: 0 });
  const [showLaser, setShowLaser] = useState(false);
  
  const [history, setHistory] = useState([]); // Save actions for undo

  // Brush sizing based on tool
  const getLineWidth = () => {
    const scale = isSmartBoard ? 1.5 : 1;
    if (tool === "highlighter") return 18 * scale;
    if (tool === "eraser") return 30 * scale;
    return 4 * scale; // pen
  };

  // Adjust canvas size to match layout container
  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      
      // Save canvas contents before resizing
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext("2d");
      tempCtx.drawImage(canvas, 0, 0);

      canvas.width = rect.width;
      canvas.height = rect.height;

      // Draw content back
      const ctx = canvas.getContext("2d");
      ctx.drawImage(tempCanvas, 0, 0, rect.width, rect.height);
    }
  };

  useEffect(() => {
    if (isOpen) {
      // Small timeout to let viewer size settle
      const t = setTimeout(() => {
        resizeCanvas();
      }, 300);
      
      window.addEventListener("resize", resizeCanvas);
      return () => {
        window.removeEventListener("resize", resizeCanvas);
        clearTimeout(t);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    // Support touch details
    if (e.touches && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    e.stopPropagation();
    
    const coords = getCoordinates(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    
    if (tool === "laser") {
      setShowLaser(true);
      setLaserPos(coords);
      return;
    }

    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    
    // Save state for undo history
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory(prev => [...prev, imgData]);
  };

  const draw = (e) => {
    e.stopPropagation();
    
    const coords = getCoordinates(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    if (tool === "laser") {
      setLaserPos(coords);
      setShowLaser(true);
      return;
    }

    if (!isDrawing) return;

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = getLineWidth();

    if (tool === "pen") {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = color;
      ctx.globalAlpha = 1.0;
    } else if (tool === "highlighter") {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.4;
    } else if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0,0,0,1)";
      ctx.globalAlpha = 1.0;
    }

    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = (e) => {
    e.stopPropagation();
    setIsDrawing(false);
    if (tool === "laser") {
      setShowLaser(false);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      
      // Save state to undo history before clearing
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory(prev => [...prev, imgData]);
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const undo = () => {
    if (history.length === 0) return;
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      const previousState = history[history.length - 1];
      ctx.putImageData(previousState, 0, 0);
      setHistory(prev => prev.slice(0, prev.length - 1));
    }
  };

  const handlePointerLeave = () => {
    setIsDrawing(false);
    setShowLaser(false);
  };

  // Color options
  const markerColors = [
    "#ef4444", // Red
    "#3b82f6", // Blue
    "#10b981", // Green
    "#eab308", // Yellow
    "#a855f7", // Purple
    "#ffffff", // White
    "#000000"  // Black
  ];

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
      {/* Floating Markup Panel */}
      <div className="drawing-toolbar" style={{ pointerEvents: 'auto' }}>
        <button 
          className={`drawing-tool-btn ${tool === "pen" ? 'active' : ''}`}
          onClick={() => setTool("pen")}
          title="Pen Tool"
        >
          <Pencil size={18} />
        </button>
        <button 
          className={`drawing-tool-btn ${tool === "highlighter" ? 'active' : ''}`}
          onClick={() => setTool("highlighter")}
          title="Highlighter Tool"
        >
          <Highlighter size={18} />
        </button>
        <button 
          className={`drawing-tool-btn ${tool === "laser" ? 'active' : ''}`}
          onClick={() => setTool("laser")}
          title="Laser Pointer"
        >
          <Sparkles size={18} />
        </button>
        <button 
          className={`drawing-tool-btn ${tool === "eraser" ? 'active' : ''}`}
          onClick={() => setTool("eraser")}
          title="Eraser Tool"
        >
          <Eraser size={18} />
        </button>
        
        <div className="drawing-separator" />
        
        {/* Colors selector (hidden if eraser active) */}
        {tool !== "eraser" && tool !== "laser" && markerColors.map(c => (
          <div 
            key={c}
            className={`color-dot ${color === c ? 'active' : ''}`}
            style={{ backgroundColor: c }}
            onClick={() => setColor(c)}
          />
        ))}

        <div className="drawing-separator" />

        <button className="drawing-tool-btn" onClick={undo} disabled={history.length === 0} title="Undo last draw">
          <Undo size={18} />
        </button>

        <button className="drawing-tool-btn" onClick={clearCanvas} title="Clear board annotations">
          <Trash2 size={18} />
        </button>
      </div>

      {/* Actual Drawing Canvas Layer */}
      <canvas
        ref={canvasRef}
        className={`whiteboard-canvas ${tool === "laser" ? 'laser-pointer-active' : ''}`}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={handlePointerLeave}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        style={{ pointerEvents: 'auto' }}
      />

      {/* Floating Laser Point marker */}
      {tool === "laser" && showLaser && (
        <div 
          className="laser-pointer-cursor"
          style={{ left: laserPos.x, top: laserPos.y }}
        />
      )}
    </div>
  );
}
