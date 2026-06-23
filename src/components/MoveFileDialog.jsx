import React, { useState } from "react";
import { X, Folder, Move, FolderOpen } from "lucide-react";

export default function MoveFileDialog({ isOpen, onClose, folders, file, onConfirm }) {
  const [selectedFolderId, setSelectedFolderId] = useState(null); // default to root

  if (!isOpen || !file) return null;

  // Let's create an indented hierarchy tree of folders
  const getNestedFolders = (parentId = null, depth = 0) => {
    const list = folders.filter(f => f.parentId === parentId);
    let result = [];
    
    list.forEach(folder => {
      result.push({ ...folder, depth });
      const children = getNestedFolders(folder.id, depth + 1);
      result = [...result, ...children];
    });
    
    return result;
  };

  const hierarchy = getNestedFolders(null, 0);

  const handleMove = () => {
    onConfirm(selectedFolderId);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Move size={20} className="text-secondary" /> Move File
          </h3>
          <button className="action-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Choose a target folder to move <strong>{file.name}</strong>:
          </p>

          <div className="folder-tree">
            {/* Root Option */}
            <div 
              className={`folder-tree-item ${selectedFolderId === null ? 'selected' : ''}`}
              onClick={() => setSelectedFolderId(null)}
              style={{ fontWeight: selectedFolderId === null ? '600' : 'normal' }}
            >
              <FolderOpen size={18} style={{ color: '#0284c7' }} />
              <span>My Files (Root Directory)</span>
            </div>

            {/* Folder Hierarchy List */}
            {hierarchy.map(folder => (
              <div 
                key={folder.id} 
                className={`folder-tree-item ${selectedFolderId === folder.id ? 'selected' : ''}`}
                onClick={() => setSelectedFolderId(folder.id)}
                style={{ 
                  paddingLeft: `${(folder.depth + 1) * 20}px`,
                  fontWeight: selectedFolderId === folder.id ? '600' : 'normal'
                }}
              >
                <Folder size={18} style={{ color: '#eab308' }} />
                <span>{folder.name}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-outline" onClick={onClose} style={{ width: 'auto' }}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleMove} style={{ width: 'auto' }}>
            Move Here
          </button>
        </div>
      </div>
    </div>
  );
}
