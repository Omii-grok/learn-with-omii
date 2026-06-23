import React, { useState, useEffect } from "react";
import { FolderPlus, Upload, LayoutDashboard, FolderOpen, Database, AlertTriangle, Trash2, Settings } from "lucide-react";
import { isFirebaseConfigured } from "../utils/firebase";
import { getStorageConfig } from "../utils/storageConfig";

const GithubIcon = ({ size = 20, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

export default function Sidebar({
  currentView,
  setCurrentView,
  onNewFolderClick,
  onUploadClick,
  user,
  totalFiles,
  totalFolders,
  onResetAllClick,
  onStorageSettingsClick
}) {
  const isTeacher = !!user;
  const [storageType, setStorageType] = useState("local");

  useEffect(() => {
    const config = getStorageConfig();
    setStorageType(config.type || "local");
  }, []);

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-brand">OMII IT LIBRARY</span>
      </div>

      {/* Main Teacher Actions */}
      <div className="sidebar-upload-container">
        <button className="btn-primary" onClick={onUploadClick} title="Upload New File">
          <Upload size={18} />
          <span className="menu-item-text">Upload File</span>
        </button>
        <button className="btn-outline" onClick={onNewFolderClick} title="Create New Folder">
          <FolderPlus size={18} />
          <span className="menu-item-text">New Folder</span>
        </button>
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

        <button 
          onClick={onStorageSettingsClick}
          className="btn-outline" 
          style={{ 
            marginTop: '12px', 
            padding: '6px 10px', 
            fontSize: '11px', 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            width: '100%',
            cursor: 'pointer'
          }}
          title="Configure cloud database or GitHub repo storage"
        >
          <Settings size={12} /> Storage Settings
        </button>

        <button 
          onClick={onResetAllClick}
          className="btn-outline" 
          style={{ 
            marginTop: '8px', 
            padding: '6px 10px', 
            fontSize: '11px', 
            borderColor: '#ef4444', 
            color: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            width: '100%',
            cursor: 'pointer'
          }}
          title="Delete all custom files and folders"
        >
          <Trash2 size={12} /> Clear Library (Reset)
        </button>

        <div style={{
          marginTop: '16px',
          padding: '8px',
          borderRadius: '6px',
          backgroundColor: isFirebaseConfigured 
            ? 'rgba(16, 185, 129, 0.08)' 
            : storageType === "github" 
              ? 'rgba(99, 102, 241, 0.08)' 
              : 'rgba(245, 158, 11, 0.08)',
          border: `1px solid ${isFirebaseConfigured 
            ? 'rgba(16, 185, 129, 0.15)' 
            : storageType === "github" 
              ? 'rgba(99, 102, 241, 0.15)' 
              : 'rgba(245, 158, 11, 0.15)'}`,
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
          ) : storageType === "github" ? (
            <>
              <GithubIcon size={12} style={{ color: 'var(--accent-primary)' }} />
              <span style={{ color: 'var(--accent-primary)', fontWeight: '500' }}>GitHub Cloud Active</span>
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
