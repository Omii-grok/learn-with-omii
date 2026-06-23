import React, { useState, useEffect } from "react";
import { X, Settings, Database, ShieldAlert, KeyRound } from "lucide-react";
import { getStorageConfig, saveStorageConfig } from "../utils/storageConfig";

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

export default function StorageSettingsDialog({ isOpen, onClose, onSave }) {
  const [storageType, setStorageType] = useState("local");
  
  // GitHub States
  const [ghOwner, setGhOwner] = useState("");
  const [ghRepo, setGhRepo] = useState("");
  const [ghBranch, setGhBranch] = useState("main");
  const [ghToken, setGhToken] = useState("");

  // Firebase States
  const [fbConfigText, setFbConfigText] = useState("");

  useEffect(() => {
    if (isOpen) {
      const config = getStorageConfig();
      setStorageType(config.type || "local");
      if (config.type === "github") {
        setGhOwner(config.owner || "");
        setGhRepo(config.repo || "");
        setGhBranch(config.branch || "main");
        setGhToken(config.token || "");
      } else if (config.type === "firebase") {
        setFbConfigText(config.configJSON ? JSON.stringify(config.configJSON, null, 2) : "");
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();

    let config = { type: storageType };

    if (storageType === "github") {
      if (!ghOwner.trim() || !ghRepo.trim() || !ghToken.trim()) {
        alert("Please fill in all GitHub credentials (Username, Repository Name, and Personal Access Token).");
        return;
      }
      config = {
        type: "github",
        owner: ghOwner.trim(),
        repo: ghRepo.trim(),
        branch: ghBranch.trim() || "main",
        token: ghToken.trim()
      };
    } else if (storageType === "firebase") {
      if (!fbConfigText.trim()) {
        alert("Please paste your Firebase configuration JSON.");
        return;
      }
      try {
        const parsed = JSON.parse(fbConfigText.trim());
        if (!parsed.apiKey || !parsed.projectId) {
          alert("Firebase Configuration JSON must at least contain 'apiKey' and 'projectId'.");
          return;
        }
        config = {
          type: "firebase",
          configJSON: parsed
        };
      } catch (err) {
        alert("Invalid JSON format. Please verify your Firebase configuration JSON.");
        return;
      }
    }

    saveStorageConfig(config);
    onSave(config);
    onClose();
    
    // Alert user that settings changed and a reload is advised
    alert("Storage settings saved successfully! The app will reload to apply the new database connection.");
    window.location.reload();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '520px', width: '90%' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Settings size={20} className="text-primary" />
            <h2 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>Storage Settings</h2>
          </div>
          <button className="action-btn" onClick={onClose} title="Close Settings">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px 0' }}>
          {/* Storage Type Selector */}
          <div className="form-group">
            <label style={{ fontWeight: '600', marginBottom: '8px', display: 'block' }}>Choose Storage Engine</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                className={`btn-outline ${storageType === "local" ? "active" : ""}`}
                onClick={() => setStorageType("local")}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 8px',
                  borderColor: storageType === "local" ? "var(--accent-primary)" : "var(--border-color)",
                  backgroundColor: storageType === "local" ? "rgba(99, 102, 241, 0.05)" : "transparent"
                }}
              >
                <Database size={20} />
                <span style={{ fontSize: '11px', fontWeight: '600' }}>Local Offline</span>
              </button>

              <button
                type="button"
                className={`btn-outline ${storageType === "github" ? "active" : ""}`}
                onClick={() => setStorageType("github")}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 8px',
                  borderColor: storageType === "github" ? "var(--accent-primary)" : "var(--border-color)",
                  backgroundColor: storageType === "github" ? "rgba(99, 102, 241, 0.05)" : "transparent"
                }}
              >
                <GithubIcon size={20} />
                <span style={{ fontSize: '11px', fontWeight: '600' }}>GitHub Storage</span>
              </button>

              <button
                type="button"
                className={`btn-outline ${storageType === "firebase" ? "active" : ""}`}
                onClick={() => setStorageType("firebase")}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 8px',
                  borderColor: storageType === "firebase" ? "var(--accent-primary)" : "var(--border-color)",
                  backgroundColor: storageType === "firebase" ? "rgba(99, 102, 241, 0.05)" : "transparent"
                }}
              >
                <KeyRound size={20} />
                <span style={{ fontSize: '11px', fontWeight: '600' }}>Real Firebase</span>
              </button>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '4px 0' }} />

          {/* Form details based on storage type */}
          {storageType === "local" && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{
                display: 'flex',
                gap: '12px',
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: 'rgba(99, 102, 241, 0.08)',
                border: '1px solid rgba(99, 102, 241, 0.15)',
                color: 'var(--text-secondary)',
                fontSize: '13px',
                lineHeight: '1.4'
              }}>
                <Database size={24} style={{ flexShrink: 0, color: 'var(--accent-primary)' }} />
                <div>
                  <strong>Local Database Fallback</strong>
                  <p style={{ marginTop: '4px', fontSize: '12px' }}>
                    Saves files directly in IndexedDB browser memory. Perfect for offline usage or quick smartboard presentations. Files are saved locally to this browser profile.
                  </p>
                </div>
              </div>
            </div>
          )}

          {storageType === "github" && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{
                display: 'flex',
                gap: '12px',
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.15)',
                color: 'var(--text-secondary)',
                fontSize: '12px',
                lineHeight: '1.4'
              }}>
                <GithubIcon size={24} style={{ flexShrink: 0, color: '#10b981' }} />
                <div>
                  <strong>Permanent GitHub File Storage</strong>
                  <p style={{ marginTop: '4px' }}>
                    Uploads files directly into your GitHub repository. Your files will be saved permanently as commits in your repo and served with fast, secure CDN links.
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label htmlFor="ghOwner">GitHub Username (Owner)</label>
                  <input
                    id="ghOwner"
                    type="text"
                    required
                    placeholder="e.g. Omii-grok"
                    value={ghOwner}
                    onChange={(e) => setGhOwner(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="ghRepo">Repository Name</label>
                  <input
                    id="ghRepo"
                    type="text"
                    required
                    placeholder="e.g. learn-with-omii"
                    value={ghRepo}
                    onChange={(e) => setGhRepo(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="ghBranch">Branch</label>
                <input
                  id="ghBranch"
                  type="text"
                  placeholder="main"
                  value={ghBranch}
                  onChange={(e) => setGhBranch(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="ghToken">Personal Access Token (PAT)</label>
                <input
                  id="ghToken"
                  type="password"
                  required
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxx"
                  value={ghToken}
                  onChange={(e) => setGhToken(e.target.value)}
                  style={{ fontFamily: 'monospace' }}
                />
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                  {"Create a token at GitHub -> Settings -> Developer Settings -> Personal Access Tokens (Tokens classic) with "}<strong>repo</strong> permissions.
                </span>
              </div>
            </div>
          )}

          {storageType === "firebase" && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{
                display: 'flex',
                gap: '12px',
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.15)',
                color: 'var(--text-secondary)',
                fontSize: '12px',
                lineHeight: '1.4'
              }}>
                <ShieldAlert size={24} style={{ flexShrink: 0, color: '#f59e0b' }} />
                <div>
                  <strong>Live Google Firebase Integration</strong>
                  <p style={{ marginTop: '4px' }}>
                    Connects directly to your Firebase Firestore and Cloud Storage bucket. Uploads and updates will be synchronized instantly across all smartboards.
                  </p>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="fbConfig">Firebase Config JSON Object</label>
                <textarea
                  id="fbConfig"
                  required
                  rows={6}
                  placeholder={`{\n  "apiKey": "AIzaSy...",\n  "authDomain": "...",\n  "projectId": "...",\n  "storageBucket": "...",\n  "messagingSenderId": "...",\n  "appId": "..."\n}`}
                  value={fbConfigText}
                  onChange={(e) => setFbConfigText(e.target.value)}
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    width: '100%',
                    padding: '8px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <button type="button" className="btn-outline" onClick={onClose} style={{ width: 'auto', padding: '8px 16px' }}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '8px 24px' }}>
              Save & Apply
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
