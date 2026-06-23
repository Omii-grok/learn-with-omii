import React, { useState, useEffect } from "react";
import { isFirebaseConfigured, auth as firebaseAuth, db, storage } from "./utils/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { mockStorage } from "./utils/mockStorage";

// UI Components
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import FolderView from "./components/FolderView";
import FileViewer from "./components/FileViewer";
import AuthDialog from "./components/AuthDialog";
import FolderDialog from "./components/FolderDialog";
import MoveFileDialog from "./components/MoveFileDialog";

export default function App() {
  // Theme & Layout state
  const [theme, setTheme] = useState(() => localStorage.getItem("omii_theme") || "light");
  const [isSmartBoard, setIsSmartBoard] = useState(false);
  const [currentView, setCurrentView] = useState("dashboard"); // dashboard, files
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Data states
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [user, setUser] = useState(null);

  // Upload tracking states
  const [uploadingFile, setUploadingFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Modal dialog toggles
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isFolderOpen, setIsFolderOpen] = useState(false);
  const [folderModalMode, setFolderModalMode] = useState("create"); // create, rename
  const [activeFolderToEdit, setActiveFolderToEdit] = useState(null);

  const [activeFileToMove, setActiveFileToMove] = useState(null);
  const [isMoveOpen, setIsMoveOpen] = useState(false);

  const [activeFileToView, setActiveFileToView] = useState(null);

  // 1. Sync Theme with HTML Document Element
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("omii_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === "light" ? "dark" : "light");
  };

  // 2. Sync Smart Board Mode with body class (for layout size variables scaling)
  const toggleSmartBoard = () => {
    setIsSmartBoard(prev => {
      const next = !prev;
      if (next) {
        document.body.classList.add("smartboard-mode");
      } else {
        document.body.classList.remove("smartboard-mode");
      }
      return next;
    });
  };

  // 3. User & Data Subscriptions (Firebase vs Mock storage fallback)
  useEffect(() => {
    if (isFirebaseConfigured && firebaseAuth && db) {
      // Firebase auth listener
      const unsubscribeAuth = onAuthStateChanged(firebaseAuth, (firebaseUser) => {
        if (firebaseUser) {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || "Teacher",
            isAdmin: true
          });
        } else {
          setUser(null);
        }
      });

      // Firebase Firestore Folders sync
      const unsubscribeFolders = onSnapshot(
        query(collection(db, "folders")),
        (snapshot) => {
          const list = [];
          snapshot.forEach(doc => {
            list.push({ id: doc.id, ...doc.data() });
          });
          setFolders(list);
        },
        (error) => console.error("Firestore folders sync error:", error)
      );

      // Firebase Firestore Files sync
      const unsubscribeFiles = onSnapshot(
        query(collection(db, "files")),
        (snapshot) => {
          const list = [];
          snapshot.forEach(doc => {
            list.push({ id: doc.id, ...doc.data() });
          });
          setFiles(list);
        },
        (error) => console.error("Firestore files sync error:", error)
      );

      return () => {
        unsubscribeAuth();
        unsubscribeFolders();
        unsubscribeFiles();
      };
    } else {
      // Mock Storage loading (persists in LocalStorage)
      setFolders(mockStorage.getFolders());
      setFiles(mockStorage.getFiles());

      // Attempt restoring mock session if saved
      const storedUser = localStorage.getItem("omii_user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
  }, []);

  // 4. Authentication success handler
  const handleLoginSuccess = (teacherProfile) => {
    setUser(teacherProfile);
    if (!isFirebaseConfigured) {
      localStorage.setItem("omii_user", JSON.stringify(teacherProfile));
    }
  };

  const handleLogout = async () => {
    if (isFirebaseConfigured && firebaseAuth) {
      await signOut(firebaseAuth);
    } else {
      setUser(null);
      localStorage.removeItem("omii_user");
    }
    setSelectedFolderId(null);
    setCurrentView("dashboard");
  };

  // 5. Folder CRUD Controllers
  const handleFolderConfirm = async (folderName) => {
    if (folderModalMode === "create") {
      if (isFirebaseConfigured && db) {
        await addDoc(collection(db, "folders"), {
          name: folderName,
          parentId: selectedFolderId,
          createdAt: new Date().toISOString()
        });
      } else {
        mockStorage.createFolder(folderName, selectedFolderId);
        setFolders(mockStorage.getFolders());
      }
    } else if (folderModalMode === "rename" && activeFolderToEdit) {
      if (isFirebaseConfigured && db) {
        await updateDoc(doc(db, "folders", activeFolderToEdit.id), {
          name: folderName
        });
      } else {
        mockStorage.renameFolder(activeFolderToEdit.id, folderName);
        setFolders(mockStorage.getFolders());
      }
    }
    setIsFolderOpen(false);
    setActiveFolderToEdit(null);
  };

  const handleDeleteFolder = async (folderId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this folder? Any files inside will be moved to the root folder.");
    if (!confirmDelete) return;

    if (isFirebaseConfigured && db) {
      // Firestore delete operations
      try {
        await deleteDoc(doc(db, "folders", folderId));
        // Move files in this folder to Root
        const filesInFolder = files.filter(f => f.folderId === folderId);
        for (const file of filesInFolder) {
          await updateDoc(doc(db, "files", file.id), { folderId: null });
        }
      } catch (err) {
        console.error("Failed to delete Firestore folder:", err);
      }
    } else {
      mockStorage.deleteFolder(folderId);
      setFolders(mockStorage.getFolders());
      setFiles(mockStorage.getFiles());
    }
  };

  // 6. File Upload Controllers
  const handleUploadFiles = async (fileList) => {
    if (!user) return;
    
    // Process files sequentially
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      setUploadingFile(file.name);
      setUploadProgress(0);

      // Support keywords creation from filename
      const keywords = file.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, " ")
        .split(" ")
        .filter(w => w.length > 2);

      if (isFirebaseConfigured && storage && db) {
        // Upload to real Firebase Cloud Storage
        try {
          const storageRef = ref(storage, `uploads/${Date.now()}_${file.name}`);
          const uploadTask = uploadBytesResumable(storageRef, file);

          await new Promise((resolve, reject) => {
            uploadTask.on(
              "state_changed",
              (snapshot) => {
                const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                setUploadProgress(pct);
              },
              (error) => {
                console.error("Firebase Storage Upload Error:", error);
                reject(error);
              },
              async () => {
                const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
                
                // Save document metadata in Firestore
                await addDoc(collection(db, "files"), {
                  name: file.name,
                  type: file.name.split('.').pop().toLowerCase(),
                  size: file.size,
                  folderId: selectedFolderId,
                  keywords: keywords,
                  createdAt: new Date().toISOString(),
                  url: downloadUrl
                });
                resolve();
              }
            );
          });
        } catch (err) {
          alert(`Failed to upload ${file.name}: ` + err.message);
        }
      } else {
        // Mock Local Upload
        const mockInterval = setInterval(() => {
          setUploadProgress(prev => {
            if (prev >= 90) {
              clearInterval(mockInterval);
              return 90;
            }
            return prev + 15;
          });
        }, 150);

        await mockStorage.uploadFile(file, selectedFolderId, keywords);
        setUploadProgress(100);
        clearInterval(mockInterval);
        setFiles(mockStorage.getFiles());
      }
    }

    // Done uploading
    setUploadingFile(null);
    setUploadProgress(0);
    setCurrentView("files"); // Go to files view to see new files
  };

  // 7. File Move & Delete Controllers
  const handleMoveFileConfirm = async (targetFolderId) => {
    if (!activeFileToMove) return;

    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, "files", activeFileToMove.id), {
          folderId: targetFolderId
        });
      } catch (err) {
        console.error("Failed to move Firestore file:", err);
      }
    } else {
      mockStorage.moveFile(activeFileToMove.id, targetFolderId);
      setFiles(mockStorage.getFiles());
    }

    setIsMoveOpen(false);
    setActiveFileToMove(null);
  };

  const handleDeleteFile = async (fileId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this file permanently?");
    if (!confirmDelete) return;

    const fileToDelete = files.find(f => f.id === fileId);
    if (!fileToDelete) return;

    if (isFirebaseConfigured && db && storage) {
      try {
        // Delete from Firestore
        await deleteDoc(doc(db, "files", fileId));

        // If it's a real Firebase url, delete from Storage
        if (fileToDelete.url && !fileToDelete.url.startsWith("mock://")) {
          // Attempt parsing ref path from storage url
          const fileRef = ref(storage, fileToDelete.url);
          await deleteObject(fileRef);
        }
      } catch (err) {
        console.error("Failed to delete cloud resources:", err);
      }
    } else {
      mockStorage.deleteFile(fileId);
      setFiles(mockStorage.getFiles());
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Panel Layout */}
      <Sidebar 
        currentView={currentView}
        setCurrentView={setCurrentView}
        onNewFolderClick={() => { setFolderModalMode("create"); setIsFolderOpen(true); }}
        onUploadClick={() => {
          const input = document.createElement("input");
          input.type = "file";
          input.multiple = true;
          input.onchange = (e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleUploadFiles(e.target.files);
            }
          };
          input.click();
        }}
        user={user}
        totalFiles={files.length}
        totalFolders={folders.length}
      />

      <div className="main-content">
        {/* Navbar Header Layout */}
        <Navbar 
          searchQuery={searchQuery}
          setSearchQuery={(query) => {
            setSearchQuery(query);
            if (query && currentView !== "files") {
              setCurrentView("files"); // Automatically jump to files view when searching
            }
          }}
          user={user}
          onLoginClick={() => setIsAuthOpen(true)}
          onLogoutClick={handleLogout}
          isSmartBoard={isSmartBoard}
          toggleSmartBoard={toggleSmartBoard}
          theme={theme}
          toggleTheme={toggleTheme}
        />

        {/* Content Workspace Panel */}
        <main className="content-wrapper">
          {currentView === "dashboard" ? (
            <Dashboard 
              files={files}
              folders={folders}
              onOpenFile={(file) => setActiveFileToView(file)}
              setCurrentView={setCurrentView}
              setSelectedFolderId={setSelectedFolderId}
            />
          ) : (
            <FolderView 
              files={files}
              folders={folders}
              selectedFolderId={selectedFolderId}
              setSelectedFolderId={setSelectedFolderId}
              user={user}
              searchQuery={searchQuery}
              onOpenFile={(file) => setActiveFileToView(file)}
              onMoveFile={(file) => { setActiveFileToMove(file); setIsMoveOpen(true); }}
              onDeleteFile={handleDeleteFile}
              onRenameFolder={(folder) => { setActiveFolderToEdit(folder); setFolderModalMode("rename"); setIsFolderOpen(true); }}
              onDeleteFolder={handleDeleteFolder}
              onUploadFiles={handleUploadFiles}
            />
          )}
        </main>
      </div>

      {/* 8. FLOATING DIALOGS & OVERLAYS */}

      {/* Floating Upload Progress Widget */}
      {uploadingFile && (
        <div className="upload-status-card">
          <div className="upload-header">
            <span>Uploading content...</span>
            <span style={{ color: 'var(--accent-primary)', fontSize: '13px' }}>{uploadProgress}%</span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {uploadingFile}
          </div>
          <div className="upload-progress-container">
            <div className="upload-progress-bar" style={{ width: `${uploadProgress}%` }} />
          </div>
        </div>
      )}

      {/* Teacher Authentication Modal */}
      <AuthDialog 
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Folder CRUD Dialog */}
      <FolderDialog 
        isOpen={isFolderOpen}
        onClose={() => { setIsFolderOpen(false); setActiveFolderToEdit(null); }}
        onConfirm={handleFolderConfirm}
        initialValue={folderModalMode === "rename" && activeFolderToEdit ? activeFolderToEdit.name : ""}
        mode={folderModalMode}
      />

      {/* Move File Folder Tree Selection Dialog */}
      <MoveFileDialog 
        isOpen={isMoveOpen}
        onClose={() => { setIsMoveOpen(false); setActiveFileToMove(null); }}
        folders={folders}
        file={activeFileToMove}
        onConfirm={handleMoveFileConfirm}
      />

      {/* Full screen Presentation File Player with annotations drawing */}
      <FileViewer 
        file={activeFileToView}
        isOpen={!!activeFileToView}
        onClose={() => setActiveFileToView(null)}
        isSmartBoard={isSmartBoard}
      />
    </div>
  );
}
