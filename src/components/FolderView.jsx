import React, { useState, useRef, useEffect } from "react";
import { Folder, MoreVertical, Trash2, Edit, Move, FileText, ArrowLeft, Upload, File, Eye, Download } from "lucide-react";

export default function FolderView({
  files,
  folders,
  selectedFolderId,
  setSelectedFolderId,
  user,
  searchQuery,
  onOpenFile,
  onMoveFile,
  onDeleteFile,
  onRenameFolder,
  onDeleteFolder,
  onUploadFiles
}) {
  const [activeMenuId, setActiveMenuId] = useState(null); // id of folder or file having open menu
  const [activeMenuType, setActiveMenuType] = useState(null); // "folder" | "file"
  const [isDragging, setIsDragging] = useState(false);
  
  const menuRef = useRef(null);
  const dragCounter = useRef(0);

  const isTeacher = !!user;

  // Handle clicking outside to close context menu
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setActiveMenuId(null);
        setActiveMenuType(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filter items based on active folder or search query
  const currentFolders = searchQuery 
    ? [] // don't show folders in search query view, only show matching files
    : folders.filter(f => f.parentId === selectedFolderId);

  const currentFiles = searchQuery
    ? files.filter(file => {
        const matchesName = file.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesKeywords = file.keywords && file.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()));
        
        // Find folder name if present
        const parentFolder = folders.find(f => f.id === file.folderId);
        const matchesFolder = parentFolder && parentFolder.name.toLowerCase().includes(searchQuery.toLowerCase());
        
        return matchesName || matchesKeywords || matchesFolder;
      })
    : files.filter(f => f.folderId === selectedFolderId);

  // Helper formatting size
  const formatSize = (bytes) => {
    if (!bytes) return "0 KB";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  // Breadcrumbs path calculations
  const getBreadcrumbs = () => {
    const crumbs = [];
    let currentId = selectedFolderId;
    
    while (currentId) {
      const folder = folders.find(f => f.id === currentId);
      if (folder) {
        crumbs.unshift(folder);
        currentId = folder.parentId;
      } else {
        break;
      }
    }
    
    return crumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  // Context Menu handlers
  const handleMenuClick = (e, id, type) => {
    e.stopPropagation();
    if (activeMenuId === id && activeMenuType === type) {
      setActiveMenuId(null);
      setActiveMenuType(null);
    } else {
      setActiveMenuId(id);
      setActiveMenuType(type);
    }
  };

  // Drag and drop handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (isTeacher) {
        onUploadFiles(e.dataTransfer.files);
      } else {
        alert("Teacher authorization is required to upload files.");
      }
      e.dataTransfer.clearData();
    }
  };

  // File input click handler
  const triggerFileInput = () => {
    if (!isTeacher) return;
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.onchange = (e) => {
      if (e.target.files && e.target.files.length > 0) {
        onUploadFiles(e.target.files);
      }
    };
    input.click();
  };

  return (
    <div 
      style={{ display: 'flex', flexDirection: 'column', minHeight: '60vh', position: 'relative' }}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Drag & Drop Overlay */}
      {isDragging && isTeacher && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          border: '3px dashed var(--accent-primary)',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
          backdropFilter: 'blur(2px)',
          gap: '12px'
        }}>
          <Upload size={48} className="text-primary" style={{ animation: 'bounce 1s infinite' }} />
          <h3 style={{ color: 'var(--accent-primary)', fontWeight: '700' }}>Drop your files here to upload</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Supports PDFs, PPTs, PPTXs, DOCXs, Images, and MP4 videos</p>
        </div>
      )}

      {/* Header controls & Breadcrumbs */}
      {searchQuery ? (
        <div className="folder-header-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '18px', fontWeight: '500', color: 'var(--text-secondary)' }}>
              Search results for:
            </span>
            <span style={{ fontSize: '18px', fontWeight: '700', color: 'var(--accent-primary)' }}>
              "{searchQuery}"
            </span>
          </div>
        </div>
      ) : (
        <div className="breadcrumbs">
          <span 
            className="breadcrumb-item" 
            onClick={() => setSelectedFolderId(null)}
          >
            My Files
          </span>
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb.id}>
              <span className="breadcrumb-separator">/</span>
              <span 
                className="breadcrumb-item"
                onClick={() => setSelectedFolderId(crumb.id)}
                style={{ fontWeight: idx === breadcrumbs.length - 1 ? '600' : 'normal' }}
              >
                {crumb.name}
              </span>
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Up One Level back button */}
      {!searchQuery && selectedFolderId && (
        <button 
          className="btn-outline" 
          onClick={() => {
            const currentFolder = folders.find(f => f.id === selectedFolderId);
            setSelectedFolderId(currentFolder ? currentFolder.parentId : null);
          }}
          style={{ width: 'auto', alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '24px', padding: '6px 12px' }}
        >
          <ArrowLeft size={16} /> Up a folder
        </button>
      )}

      {/* Folders display */}
      {!searchQuery && currentFolders.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h4 style={{ fontSize: '14px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '16px', letterSpacing: '0.05em' }}>
            Folders
          </h4>
          <div className="folders-grid">
            {currentFolders.map(folder => (
              <div 
                key={folder.id} 
                className="folder-card"
                onClick={() => setSelectedFolderId(folder.id)}
              >
                <div className="folder-info">
                  <Folder className="folder-icon" />
                  <span className="folder-name">{folder.name}</span>
                </div>

                {isTeacher && (
                  <div style={{ position: 'relative' }}>
                    <button 
                      className="action-btn"
                      onClick={(e) => handleMenuClick(e, folder.id, "folder")}
                    >
                      <MoreVertical size={16} />
                    </button>
                    {activeMenuId === folder.id && activeMenuType === "folder" && (
                      <div className="context-menu" ref={menuRef}>
                        <button 
                          className="context-menu-item"
                          onClick={(e) => { e.stopPropagation(); onRenameFolder(folder); setActiveMenuId(null); }}
                        >
                          <Edit size={14} /> Rename
                        </button>
                        <button 
                          className="context-menu-item danger"
                          onClick={(e) => { e.stopPropagation(); onDeleteFolder(folder.id); setActiveMenuId(null); }}
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Files display */}
      <div>
        {!searchQuery && (
          <h4 style={{ fontSize: '14px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '16px', letterSpacing: '0.05em' }}>
            Files
          </h4>
        )}

        {currentFiles.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px 20px',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px dashed var(--border-color)',
            borderRadius: '16px',
            textAlign: 'center',
            color: 'var(--text-muted)'
          }}>
            <FileText size={44} style={{ marginBottom: '12px' }} />
            <p style={{ fontWeight: '600', marginBottom: '4px' }}>
              {searchQuery ? "No search results match." : "This folder is empty."}
            </p>
            {isTeacher ? (
              <button 
                className="btn-primary" 
                onClick={triggerFileInput}
                style={{ width: 'auto', marginTop: '12px', fontSize: '13px', padding: '8px 16px' }}
              >
                Upload Files Now
              </button>
            ) : (
              <p style={{ fontSize: '13px' }}>Files will appear here once uploaded by the teacher.</p>
            )}
          </div>
        ) : (
          <div className="files-grid">
            {currentFiles.map(file => (
              <div 
                key={file.id} 
                className="file-card"
                onClick={() => onOpenFile(file)}
              >
                {/* File Thumbnail Preview */}
                <div className="file-preview">
                  {["jpg", "png", "jpeg"].includes(file.type.toLowerCase()) ? (
                    <img src={file.url} alt={file.name} loading="lazy" />
                  ) : file.type.toLowerCase() === "pdf" ? (
                    <div style={{ fontSize: '40px' }}>📄</div>
                  ) : ["ppt", "pptx"].includes(file.type.toLowerCase()) ? (
                    <div style={{ fontSize: '40px' }}>📊</div>
                  ) : ["doc", "docx"].includes(file.type.toLowerCase()) ? (
                    <div style={{ fontSize: '40px' }}>📝</div>
                  ) : file.type.toLowerCase() === "mp4" ? (
                    <div style={{ fontSize: '40px' }}>🎥</div>
                  ) : (
                    <File className="file-preview-icon" />
                  )}
                </div>

                {/* File Info */}
                <div className="file-details">
                  <div className="file-title-row">
                    <span className="file-name" title={file.name}>{file.name}</span>
                    
                    <div style={{ position: 'relative' }}>
                      <button 
                        className="action-btn"
                        onClick={(e) => handleMenuClick(e, file.id, "file")}
                      >
                        <MoreVertical size={16} />
                      </button>
                      {activeMenuId === file.id && activeMenuType === "file" && (
                        <div className="context-menu" ref={menuRef}>
                          <button 
                            className="context-menu-item"
                            onClick={(e) => { e.stopPropagation(); onOpenFile(file); setActiveMenuId(null); }}
                          >
                            <Eye size={14} /> Open
                          </button>
                          <a 
                            href={file.url} 
                            download={file.name} 
                            target="_blank" 
                            rel="noreferrer"
                            className="context-menu-item"
                            style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '10px' }}
                            onClick={() => setActiveMenuId(null)}
                          >
                            <Download size={14} /> Download
                          </a>
                          {isTeacher && (
                            <>
                              <button 
                                className="context-menu-item"
                                onClick={(e) => { e.stopPropagation(); onMoveFile(file); setActiveMenuId(null); }}
                              >
                                <Move size={14} /> Move
                              </button>
                              <button 
                                className="context-menu-item danger"
                                onClick={(e) => { e.stopPropagation(); onDeleteFile(file.id); setActiveMenuId(null); }}
                              >
                                <Trash2 size={14} /> Delete
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="file-meta-row">
                    <span>{formatSize(file.size)}</span>
                    <span>{new Date(file.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                  </div>

                  {file.keywords && file.keywords.length > 0 && (
                    <div className="file-keywords">
                      {file.keywords.slice(0, 3).map((keyword, index) => (
                        <span key={index} className="keyword-tag">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
