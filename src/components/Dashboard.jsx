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
    </div>
  );
}
