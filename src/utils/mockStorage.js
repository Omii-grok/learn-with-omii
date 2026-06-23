// Mock storage utility for running 'Learn With Omii IT' without a backend or when Firebase is not yet configured.
// Uses IndexedDB to store the actual file blobs permanently in the user's browser.

const PRELOADED_FOLDERS = [
  { id: "f-root-1", name: "Class 6", parentId: null, createdAt: new Date(2026, 5, 10).toISOString() },
  { id: "f-root-2", name: "Class 7", parentId: null, createdAt: new Date(2026, 5, 11).toISOString() },
  { id: "f-root-3", name: "Worksheets", parentId: null, createdAt: new Date(2026, 5, 12).toISOString() },
  { id: "f-root-4", name: "My Notes", parentId: null, createdAt: new Date(2026, 5, 13).toISOString() },
  { id: "f-c6-science", name: "Science", parentId: "f-root-1", createdAt: new Date(2026, 5, 14).toISOString() },
  { id: "f-c6-math", name: "Math", parentId: "f-root-1", createdAt: new Date(2026, 5, 14).toISOString() },
  { id: "f-c7-english", name: "English", parentId: "f-root-2", createdAt: new Date(2026, 5, 15).toISOString() }
];

const PRELOADED_FILES = [
  {
    id: "file-1",
    name: "solar_system_presentation.pptx",
    type: "pptx",
    size: 4500000,
    folderId: "f-c6-science",
    keywords: ["space", "planets", "astronomy", "presentation"],
    createdAt: new Date(2026, 5, 20, 10, 30).toISOString(),
    url: "mock://solar_system_presentation.pptx",
    slides: [
      { title: "The Solar System", content: "An overview of our cosmic neighborhood. Presented by Omii IT.", bg: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)" },
      { title: "The Sun: Our Star", content: "• Accounts for 99.86% of the solar system's mass\n• Surface temperature is ~5,500°C\n• Center temperature is ~15 Million °C", bg: "linear-gradient(135deg, #7c2d12 0%, #3f1a04 100%)" },
      { title: "Inner Terrestrial Planets", content: "• Mercury (closest, extreme temperatures)\n• Venus (thick atmosphere, hottest planet)\n• Earth (our water world, supports life)\n• Mars (the red planet, thin atmosphere)", bg: "linear-gradient(135deg, #3b0764 0%, #0f172a 100%)" },
      { title: "Outer Gas Giants", content: "• Jupiter (largest planet, storm giant)\n• Saturn (spectacular ring system)\n• Uranus (tilted on its side, ice giant)\n• Neptune (windiest planet, blue methane skies)", bg: "linear-gradient(135deg, #0c4a6e 0%, #082f49 100%)" }
    ]
  },
  {
    id: "file-2",
    name: "algebra_basics_worksheet.pdf",
    type: "pdf",
    size: 1200000,
    folderId: "f-c6-math",
    keywords: ["math", "equations", "variables", "test"],
    createdAt: new Date(2026, 5, 21, 14, 15).toISOString(),
    url: "https://pdfobject.com/pdf/sample.pdf", // Real sample PDF that can load in standard iframe
    pdfPagesCount: 3
  },
  {
    id: "file-3",
    name: "classroom_rules.png",
    type: "png",
    size: 850000,
    folderId: "f-root-4",
    keywords: ["rules", "decor", "classroom", "discipline"],
    createdAt: new Date(2026, 5, 22, 9, 0).toISOString(),
    url: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "file-4",
    name: "earth_rotation_video.mp4",
    type: "mp4",
    size: 15400000,
    folderId: "f-c6-science",
    keywords: ["earth", "rotation", "animation", "science"],
    createdAt: new Date(2026, 5, 22, 11, 45).toISOString(),
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" // Real sample mp4 url
  },
  {
    id: "file-5",
    name: "english_grammar_tenses.docx",
    type: "docx",
    size: 320000,
    folderId: "f-c7-english",
    keywords: ["english", "verbs", "grammar", "notes"],
    createdAt: new Date(2026, 5, 23, 8, 30).toISOString(),
    url: "mock://english_grammar_tenses.docx",
    documentContent: `
# English Grammar: Verb Tenses Guide

## 1. Present Tense
- **Simple Present**: Used for habits, general truths. *Example: The sun rises in the east.*
- **Present Continuous**: Action happening right now. *Example: The students are listening.*
- **Present Perfect**: Action that happened at an indefinite time. *Example: I have finished my reading.*

## 2. Past Tense
- **Simple Past**: Completed action in the past. *Example: We wrote a test yesterday.*
- **Past Continuous**: Ongoing past action. *Example: She was explaining the rules.*
- **Past Perfect**: Action completed before another past action. *Example: They had left before it started raining.*

## 3. Future Tense
- **Simple Future**: An action yet to happen. *Example: Class will start at 9:00 AM.*
- **Future Continuous**: Ongoing future action. *Example: Next week we will be learning algebra.*
    `
  }
];

// --- INDEXEDDB IMPLEMENTATION FOR MOCK STORAGE ---
const DB_NAME = "OmiiLibraryDB";
const STORE_NAME = "filesData";

const initDB = () => {
  return new Promise((resolve, reject) => {
    try {
      if (typeof window === "undefined" || !window.indexedDB) {
        reject(new Error("IndexedDB is not supported or accessible in this environment."));
        return;
      }
      
      const request = indexedDB.open(DB_NAME, 1);
      
      request.onblocked = () => {
        console.warn("IndexedDB connection is blocked by another connection.");
        reject(new Error("IndexedDB connection blocked."));
      };

      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };

      request.onsuccess = (e) => {
        resolve(e.target.result);
      };

      request.onerror = (e) => {
        reject(e.target.error || new Error("IndexedDB open request failed."));
      };
    } catch (err) {
      reject(err);
    }
  });
};

export const saveFileBlob = async (id, blob) => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction(STORE_NAME, "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(blob, id);
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error || new Error("Put blob failed."));
        
        transaction.onabort = () => reject(new Error("Transaction aborted."));
        transaction.onerror = () => reject(transaction.error || new Error("Transaction error."));
      } catch (txErr) {
        reject(txErr);
      }
    });
  } catch (err) {
    console.error("saveFileBlob failed:", err);
    throw err;
  }
};

export const getFileBlob = async (id) => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction(STORE_NAME, "readonly");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(id);
        
        request.onsuccess = (e) => resolve(e.target.result);
        request.onerror = () => reject(request.error || new Error("Get blob failed."));
        
        transaction.onerror = () => reject(transaction.error || new Error("Transaction error."));
      } catch (txErr) {
        reject(txErr);
      }
    });
  } catch (err) {
    console.error("getFileBlob failed for ID:", id, err);
    throw err;
  }
};

export const deleteFileBlob = async (id) => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction(STORE_NAME, "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error || new Error("Delete blob failed."));
        
        transaction.onabort = () => reject(new Error("Transaction aborted."));
        transaction.onerror = () => reject(transaction.error || new Error("Transaction error."));
      } catch (txErr) {
        reject(txErr);
      }
    });
  } catch (err) {
    console.error("deleteFileBlob failed for ID:", id, err);
    throw err;
  }
};

// Initialize localStorage if not present
const getStoredData = () => {
  let folders = localStorage.getItem("omii_folders");
  let files = localStorage.getItem("omii_files");

  if (!folders) {
    localStorage.setItem("omii_folders", JSON.stringify(PRELOADED_FOLDERS));
    folders = JSON.stringify(PRELOADED_FOLDERS);
  }
  if (!files) {
    localStorage.setItem("omii_files", JSON.stringify(PRELOADED_FILES));
    files = JSON.stringify(PRELOADED_FILES);
  }

  return {
    folders: JSON.parse(folders),
    files: JSON.parse(files)
  };
};

const saveStoredData = (data) => {
  localStorage.setItem("omii_folders", JSON.stringify(data.folders));
  localStorage.setItem("omii_files", JSON.stringify(data.files));
};

export const mockStorage = {
  // Folders operations
  getFolders: () => {
    const data = getStoredData();
    return data.folders;
  },

  createFolder: (name, parentId = null) => {
    const data = getStoredData();
    const newFolder = {
      id: "f-" + Date.now(),
      name,
      parentId,
      createdAt: new Date().toISOString()
    };
    data.folders.push(newFolder);
    saveStoredData(data);
    return newFolder;
  },

  renameFolder: (id, newName) => {
    const data = getStoredData();
    data.folders = data.folders.map(f => f.id === id ? { ...f, name: newName } : f);
    saveStoredData(data);
    return true;
  },

  deleteFolder: (id) => {
    const data = getStoredData();
    const folderIdsToDelete = [id];
    let checkLength = 0;
    while (folderIdsToDelete.length > checkLength) {
      checkLength = folderIdsToDelete.length;
      data.folders.forEach(f => {
        if (f.parentId && folderIdsToDelete.includes(f.parentId) && !folderIdsToDelete.includes(f.id)) {
          folderIdsToDelete.push(f.id);
        }
      });
    }

    data.folders = data.folders.filter(f => !folderIdsToDelete.includes(f.id));
    data.files = data.files.map(file => 
      folderIdsToDelete.includes(file.folderId) ? { ...file, folderId: null } : file
    );

    saveStoredData(data);
    return true;
  },

  // Files operations
  getFiles: () => {
    const data = getStoredData();
    return data.files;
  },

  uploadFile: async (file, folderId = null, keywords = []) => {
    const ext = file.name.split('.').pop().toLowerCase();
    const fileId = "file-" + Date.now();
    let isSavedToDB = false;

    // Store the actual file blob in IndexedDB permanently
    try {
      await saveFileBlob(fileId, file);
      isSavedToDB = true;
    } catch (dbErr) {
      console.warn("IndexedDB storage failed, creating local file without IndexedDB backup:", dbErr);
    }
    
    let slides = null;
    let documentContent = "";

    if (["ppt", "pptx"].includes(ext)) {
      slides = [
        { title: file.name, content: "Mock Slides generated from your presentation upload.\nReady to teach on the smartboard!", bg: "linear-gradient(135deg, #1e40af 0%, #1e1b4b 100%)" },
        { title: "Slide 2: Summary", content: "• High quality visual elements\n• Interactive Smart Board support\n• Drawing overlay features active", bg: "linear-gradient(135deg, #0d9488 0%, #115e59 100%)" },
        { title: "Slide 3: Q & A", content: "Discussion topics and question boards.", bg: "linear-gradient(135deg, #4f46e5 0%, #312e81 100%)" }
      ];
    } else if (["doc", "docx"].includes(ext)) {
      documentContent = `# ${file.name.replace(/\.[^/.]+$/, "")}\n\nThis is a mock DOCX preview content.\nYou uploaded a word document file of type .${ext} with size ${Math.round(file.size / 1024)} KB.\n\nReady for classroom study!`;
    }

    const data = getStoredData();
    const newFile = {
      id: fileId,
      name: file.name,
      type: ext,
      size: file.size,
      folderId,
      keywords: keywords.length > 0 ? keywords : [ext, "uploaded"],
      createdAt: new Date().toISOString(),
      url: isSavedToDB ? "indexeddb://" + fileId : "memory://" + fileId,
      isBlobInIndexedDB: isSavedToDB,
      slides,
      documentContent
    };

    data.files.push(newFile);
    saveStoredData(data);
    return newFile;
  },

  // Resolves the temporary blob URLs for files stored in IndexedDB upon startup
  resolveIndexedDBUrls: async (filesList) => {
    const updatedList = [];
    for (const file of filesList) {
      if (file.isBlobInIndexedDB) {
        try {
          const blob = await getFileBlob(file.id);
          if (blob) {
            const objectUrl = URL.createObjectURL(blob);
            updatedList.push({ ...file, url: objectUrl });
          } else {
            updatedList.push(file);
          }
        } catch (e) {
          console.error("Failed to resolve IndexedDB blob URL for file:", file.name, e);
          updatedList.push(file);
        }
      } else {
        updatedList.push(file);
      }
    }
    return updatedList;
  },

  deleteFile: async (id) => {
    const data = getStoredData();
    const file = data.files.find(f => f.id === id);
    
    // Clean up IndexedDB file blob
    if (file && file.isBlobInIndexedDB) {
      try {
        await deleteFileBlob(id);
      } catch (e) {
        console.error("Failed to delete IndexedDB blob for file ID:", id, e);
      }
    }

    data.files = data.files.filter(f => f.id !== id);
    saveStoredData(data);
    return true;
  },

  moveFile: (fileId, targetFolderId) => {
    const data = getStoredData();
    data.files = data.files.map(f => f.id === fileId ? { ...f, folderId: targetFolderId } : f);
    saveStoredData(data);
    return true;
  },

  getFileBlob: async (id) => {
    return await getFileBlob(id);
  },

  // Auth mock
  loginMockTeacher: (email, password) => {
    if (email === "teacher@school.com" && password === "password") {
      return {
        uid: "teacher-admin",
        email: "teacher@school.com",
        displayName: "Omii IT Teacher",
        isAdmin: true
      };
    }
    return null;
  }
};
