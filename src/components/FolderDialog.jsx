import React, { useState, useEffect } from "react";
import { X, Folder, AlertCircle } from "lucide-react";

export default function FolderDialog({ isOpen, onClose, onConfirm, initialValue = "", mode = "create" }) {
  const [folderName, setFolderName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setFolderName(initialValue);
      setError("");
    }
  }, [isOpen, initialValue]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!folderName.trim()) {
      setError("Folder name cannot be empty.");
      return;
    }
    onConfirm(folderName.trim());
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Folder size={20} className="text-secondary" style={{ color: '#eab308' }} />
            {mode === "create" ? "Create New Folder" : "Rename Folder"}
          </h3>
          <button className="action-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '8px',
                color: '#ef4444',
                marginBottom: '16px',
                fontSize: '14px'
              }}>
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="folderName">Folder Name</label>
              <input
                id="folderName"
                type="text"
                className="form-control"
                placeholder="e.g., Mathematics Class 6"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                autoFocus
                required
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-outline" onClick={onClose} style={{ width: 'auto' }}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" style={{ width: 'auto' }}>
              {mode === "create" ? "Create" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
