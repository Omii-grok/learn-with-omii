import React from "react";
import { Search, Sun, Moon, Monitor, LogIn, LogOut, User, Sparkles } from "lucide-react";

export default function Navbar({
  searchQuery,
  setSearchQuery,
  user,
  onLoginClick,
  onLogoutClick,
  isSmartBoard,
  toggleSmartBoard,
  theme,
  toggleTheme
}) {
  return (
    <nav className="navbar">
      <div className="nav-left">
        <span className="nav-logo">
          <Sparkles size={24} />
          Learn With Omii IT
        </span>
        {isSmartBoard && <span className="smartboard-badge">Smart Board</span>}
      </div>

      <div className="search-container">
        <Search className="search-icon" />
        <input
          type="text"
          placeholder="Search by file name, folder, or keywords..."
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="nav-actions">
        {/* Smart Board Toggle */}
        <button 
          className={`mode-toggle-btn ${isSmartBoard ? 'active' : ''}`}
          onClick={toggleSmartBoard}
          title="Toggle Smart Board Presentation Mode"
          style={{ 
            borderColor: isSmartBoard ? 'var(--accent-secondary)' : 'var(--border-color)',
            backgroundColor: isSmartBoard ? 'rgba(6, 182, 212, 0.1)' : 'var(--bg-tertiary)',
            color: isSmartBoard ? 'var(--accent-secondary)' : 'var(--text-primary)'
          }}
        >
          <Monitor size={18} />
          <span className="menu-item-text" style={{ fontSize: '13px' }}>Smart Board Mode</span>
        </button>

        {/* Theme Toggler */}
        <button 
          className="theme-toggle-btn" 
          onClick={toggleTheme} 
          title="Toggle Light/Dark Theme"
          style={{ width: '40px', height: '40px', padding: 0, justifyContent: 'center' }}
        >
          {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* Authentication removed - admin capabilities active by default */}
      </div>
    </nav>
  );
}
