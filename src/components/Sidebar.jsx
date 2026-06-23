import React from "react";
import { FolderPlus, Upload, LayoutDashboard, FolderOpen, Database, Lock, AlertTriangle } from "lucide-react";
import { isFirebaseConfigured } from "../utils/firebase";

export default function Sidebar({
  currentView,
  setCurrentView,
  onNewFolderClick,
  onUploadClick,
  user,
  totalFiles,
  totalFolders
}) {
  const isTeacher = !!user;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-brand">OMII IT LIBRARY</span>
      </div>

      {/* Main Teacher Actions */}
      <div className="sidebar-upload-container">
        {isTeacher ? (
          <>
            <button className="btn-primary" onClick={onUploadClick} title="Upload New File">
              <Upload size={18} />
              <span className="menu-item-text">Upload File</span>
            </button>
            <button className="btn-outline" onClick={onNewFolderClick} title="Create New Folder">
              <FolderPlus size={18} />
              <span className="menu-item-text">New Folder</span>
            </button>
          </>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            padding: '12px',
            backgroundColor: 'var(--bg-tertiary)',
            borderRadius: '8px',
            fontSize: '11px',
            color: 'var(--text-secondary)',
            alignItems: 'center',
            textAlign: 'center'
          }} className="menu-item-text">
            <Lock size={16} style={{ color: 'var(--text-muted)' }} />
            <span>Login as Teacher to manage files & folders</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <ul className="sidebar-menu">
        <li 
          className={`menu-item ${currentView === "dashboard" ? "active" : ""}`}
          onClick={() => setCurrentView("dashboard")}
          title="Go to Dashboard"
        >
          <LayoutDashboard size={20} />
          <span className="menu-item-text">Dashboard</span>
        </li>
        
        <li 
          className={`menu-item ${currentView === "files" ? "active" : ""}`}
          onClick={() => setCurrentView("files")}
          title="Browse All Files"
        >
          <FolderOpen size={20} />
          <span className="menu-item-text">My Files</span>
        </li>
      </ul>

      {/* Footer Metrics */}
      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Database size={14} />
          <span style={{ fontWeight: '600' }}>Storage Details</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '22px' }}>
          <div>Folders: {totalFolders}</div>
          <div>Files: {totalFiles}</div>
        </div>

        <div style={{
          marginTop: '16px',
          padding: '8px',
          borderRadius: '6px',
          backgroundColor: isFirebaseConfigured ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)',
          border: `1px solid ${isFirebaseConfigured ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)'}`,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '10px'
        }}>
          {isFirebaseConfigured ? (
            <>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
              <span style={{ color: '#10b981', fontWeight: '500' }}>Firebase Cloud Active</span>
            </>
          ) : (
            <>
              <AlertTriangle size={12} style={{ color: '#f59e0b' }} />
              <span style={{ color: '#d97706', fontWeight: '500' }}>Local Offline Storage</span>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
