import React from "react";
import { Folder, FileText, Database, Clock, ChevronRight, Eye } from "lucide-react";

export default function Dashboard({ files, folders, onOpenFile, setCurrentView, setSelectedFolderId }) {
  // Sort files by date descending
  const recentFiles = [...files]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4);

  // Compute total size
  const totalSizeBytes = files.reduce((acc, f) => acc + (f.size || 0), 0);
  const formatSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const getFileIconClass = (type) => {
    switch (type) {
      case "pdf": return "file-preview-icon pdf";
      case "ppt":
      case "pptx": return "file-preview-icon ppt";
      case "doc":
      case "docx": return "file-preview-icon doc";
      case "mp4": return "file-preview-icon mp4";
      default: return "file-preview-icon";
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '6px' }}>Welcome to Learn With Omii IT</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Manage and present your digital classroom content effortlessly.</p>
      </div>

      {/* Stats Counter Section */}
      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Folder size={24} />
          </div>
          <div>
            <div className="stat-value">{folders.length}</div>
            <div className="stat-label">Total Folders</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent-secondary)' }}>
            <FileText size={24} />
          </div>
          <div>
            <div className="stat-value">{files.length}</div>
            <div className="stat-label">Total Files</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(234, 179, 8, 0.1)', color: '#ea580c' }}>
            <Database size={24} />
          </div>
          <div>
            <div className="stat-value">{formatSize(totalSizeBytes)}</div>
            <div className="stat-label">Total Size Used</div>
          </div>
        </div>
      </div>

      {/* Recent Uploads Section */}
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'between', marginBottom: '20px', width: '100%', justifyContent: 'space-between' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={20} className="text-secondary" /> Recent Uploads
          </h3>
          <button 
            onClick={() => setCurrentView("files")} 
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--accent-primary)', 
              fontWeight: '600', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            View All Files <ChevronRight size={16} />
          </button>
        </div>

        {recentFiles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            No files uploaded yet. Select "Upload File" in the sidebar to get started!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentFiles.map(file => {
              const parentFolder = folders.find(f => f.id === file.folderId);
              return (
                <div 
                  key={file.id} 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    backgroundColor: 'var(--bg-primary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => onOpenFile(file)}
                  className="recent-file-item"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontSize: '20px' }}>
                      {/* Check dynamic styling based on file ext */}
                      {file.type === "pdf" && "📄"}
                      {(file.type === "ppt" || file.type === "pptx") && "📊"}
                      {(file.type === "doc" || file.type === "docx") && "📝"}
                      {(file.type === "jpg" || file.type === "png" || file.type === "jpeg") && "🖼️"}
                      {file.type === "mp4" && "🎥"}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                      <span style={{ fontWeight: '600', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {file.name}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        In: {parentFolder ? parentFolder.name : "Root"} • {formatSize(file.size)}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {new Date(file.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                    <button className="action-btn" title="Open File">
                      <Eye size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
