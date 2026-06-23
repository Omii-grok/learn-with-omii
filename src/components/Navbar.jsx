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

        {/* Login / Profile */}
        {user ? (
          <div className="user-avatar-widget" style={{ gap: '8px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-primary)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '600',
              fontSize: '12px'
            }}>
              {user.displayName.charAt(0)}
            </div>
            <span style={{ fontSize: '13px', fontWeight: '500' }} className="menu-item-text">
              Teacher
            </span>
            <button 
              className="action-btn" 
              onClick={onLogoutClick} 
              title="Sign Out"
              style={{ marginLeft: '4px' }}
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button 
            className="btn-primary" 
            onClick={onLoginClick}
            style={{ padding: '8px 16px', fontSize: '13px', width: 'auto', borderRadius: '8px' }}
          >
            <LogIn size={16} />
            <span>Teacher Login</span>
          </button>
        )}
      </div>
    </nav>
  );
}
