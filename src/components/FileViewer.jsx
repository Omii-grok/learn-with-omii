import React, { useState, useEffect, useRef } from "react";
import { X, Maximize2, Minimize2, Edit3, CircleOff, Presentation, ArrowLeft, ArrowRight, FileText, Download } from "lucide-react";
import WhiteboardOverlay from "./WhiteboardOverlay";
import { isFirebaseConfigured } from "../utils/firebase";
import { downloadFile } from "../utils/downloadHelper";

export default function FileViewer({ file, isOpen, onClose, isSmartBoard }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAnnotating, setIsAnnotating] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const viewerRef = useRef(null);

  const handleDownload = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    downloadFile(file);
  };

  useEffect(() => {
    // Reset state on open
    if (isOpen) {
      setIsAnnotating(false);
      setCurrentSlide(0);
    }
  }, [isOpen, file]);

  if (!isOpen || !file) return null;

  // Toggle fullscreen mode utilizing Browser Fullscreen API on the specific viewer container
  const toggleFullscreen = () => {
    const element = viewerRef.current;
    if (!element) return;

    if (!document.fullscreenElement) {
      element.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error("Error attempting to enable full-screen:", err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  // Keep state updated if user exits fullscreen via Escape key
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Keyboard navigation for PPT presentation slides
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (file.slides) {
        if (e.key === "ArrowRight" || e.key === "Space") {
          e.preventDefault();
          setCurrentSlide(prev => Math.min(file.slides.length - 1, prev + 1));
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          setCurrentSlide(prev => Math.max(0, prev - 1));
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [file, currentSlide]);

  const isMockUrl = (url) => url ? url.startsWith("mock://") : true;

  // Render the appropriate viewer based on file type and environment
  const renderViewerContent = () => {
    const ext = file.type.toLowerCase();

    // 1. IMAGES (JPG, PNG, JPEG)
    if (["jpg", "png", "jpeg"].includes(ext)) {
      return (
        <img 
          src={file.url} 
          alt={file.name} 
          className="viewer-image"
        />
      );
    }

    // 2. VIDEOS (MP4)
    if (ext === "mp4") {
      return (
        <video 
          src={file.url} 
          controls 
          autoPlay
          className="viewer-video"
        />
      );
    }

    // 3. PPT / PPTX (Presentation)
    if (["ppt", "pptx"].includes(ext)) {
      if (isFirebaseConfigured && !isMockUrl(file.url)) {
        // Real online mode: Embed via Microsoft Web Viewer
        const officeUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(file.url)}`;
        return (
          <iframe 
            src={officeUrl} 
            title={file.name} 
            className="viewer-iframe"
          />
        );
      } else {
        // Offline / Local mock mode: Render our custom presentations slide deck player
        const slides = file.slides || [];
        if (slides.length === 0) {
          return (
            <div style={{ padding: '40px', color: '#ffffff', textAlign: 'center' }}>
              No slide details found for this mock presentation.
            </div>
          );
        }
        const slide = slides[currentSlide];
        return (
          <div className="slide-container" style={{ background: slide.bg || '#1e293b' }}>
            <h2 className="slide-title">{slide.title}</h2>
            <p className="slide-content">{slide.content}</p>

            <div className="slide-controls">
              <button 
                className="slide-nav-btn" 
                onClick={(e) => { e.stopPropagation(); setCurrentSlide(prev => Math.max(0, prev - 1)); }}
                disabled={currentSlide === 0}
                style={{ opacity: currentSlide === 0 ? 0.3 : 1 }}
              >
                <ArrowLeft size={20} />
              </button>
              <span style={{ fontSize: '18px', fontWeight: '600' }}>
                Slide {currentSlide + 1} of {slides.length}
              </span>
              <button 
                className="slide-nav-btn" 
                onClick={(e) => { e.stopPropagation(); setCurrentSlide(prev => Math.min(slides.length - 1, prev + 1)); }}
                disabled={currentSlide === slides.length - 1}
                style={{ opacity: currentSlide === slides.length - 1 ? 0.3 : 1 }}
              >
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        );
      }
    }

    // 4. DOC / DOCX (Word Document)
    if (["doc", "docx"].includes(ext)) {
      if (isFirebaseConfigured && !isMockUrl(file.url)) {
        // Real online mode: Embed via Microsoft Web Viewer
        const officeUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(file.url)}`;
        return (
          <iframe 
            src={officeUrl} 
            title={file.name} 
            className="viewer-iframe"
          />
        );
      } else {
        // Offline / Local mock mode: Render styled text document content
        return (
          <div className="docx-viewer">
            <div dangerouslySetInnerHTML={{ __html: file.documentContent || 'Empty Document' }} />
          </div>
        );
      }
    }

    // 5. PDF Documents
    if (ext === "pdf") {
      // For PDFs, browser native iframe support works beautifully for standard PDF URLs
      return (
        <iframe 
          src={`${file.url}#toolbar=0`} 
          title={file.name} 
          className="viewer-iframe"
        />
      );
    }

    // Fallback unsupported types
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', color: '#ffffff', padding: '40px' }}>
        <FileText size={48} style={{ color: 'var(--text-muted)' }} />
        <span>Preview is not supported for this file type.</span>
        <button 
          onClick={handleDownload}
          className="btn-primary" 
          style={{ width: 'auto', padding: '8px 16px', border: 'none', cursor: 'pointer' }}
        >
          Download File
        </button>
      </div>
    );
  };

  return (
    <div className="modal-overlay" style={{ padding: isFullscreen ? 0 : '24px' }}>
      <div 
        ref={viewerRef}
        className="modal-content viewer-modal-content"
        style={{
          width: isFullscreen ? '100vw' : '90vw',
          height: isFullscreen ? '100vh' : '85vh',
          maxHeight: isFullscreen ? 'none' : '90vh'
        }}
      >
        {/* Header toolbar */}
        <div 
          className="modal-header"
          style={{ 
            backgroundColor: '#0f172a', 
            color: '#f8fafc', 
            borderColor: '#334155',
            padding: '12px 24px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
            <span style={{ fontSize: '20px' }}>
              {(file.type === "ppt" || file.type === "pptx") ? "📊" : file.type === "pdf" ? "📄" : "📁"}
            </span>
            <span style={{ fontWeight: '600', fontSize: '15px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {file.name}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Draw markup annotation mode toggler */}
            <button 
              className={`mode-toggle-btn ${isAnnotating ? 'active' : ''}`}
              onClick={() => setIsAnnotating(!isAnnotating)}
              style={{
                backgroundColor: isAnnotating ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255,255,255,0.05)',
                color: isAnnotating ? '#f87171' : '#f8fafc',
                border: `1px solid ${isAnnotating ? '#f87171' : 'rgba(255,255,255,0.1)'}`,
                padding: '6px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
              title="Draw Annotations / Toggle Whiteboard Mode"
            >
              {isAnnotating ? <CircleOff size={16} /> : <Edit3 size={16} />}
              <span className="menu-item-text" style={{ fontSize: '12px', fontWeight: '600' }}>
                {isAnnotating ? "Disable Ink" : "Annotate"}
              </span>
            </button>

            {/* Download Button */}
            <button 
              className="action-btn"
              onClick={handleDownload}
              style={{ color: '#f8fafc', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Download File"
            >
              <Download size={20} />
            </button>

            {/* Presentation fullscreen switch */}
            <button 
              className="action-btn"
              onClick={toggleFullscreen}
              style={{ color: '#f8fafc' }}
              title="Fullscreen Presentation Mode"
            >
              {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>

            {/* Exit/Close */}
            <button 
              className="action-btn" 
              onClick={onClose}
              style={{ color: '#f8fafc', hover: { backgroundColor: 'rgba(255,255,255,0.1)' } }}
              title="Close Viewer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Viewer Body panel */}
        <div className="viewer-body">
          {renderViewerContent()}

          {/* Interactive drawing whiteboard overlay */}
          <WhiteboardOverlay 
            isOpen={isAnnotating} 
            isSmartBoard={isSmartBoard}
          />
        </div>
      </div>
    </div>
  );
}
