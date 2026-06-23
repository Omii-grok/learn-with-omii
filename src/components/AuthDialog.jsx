import React, { useState } from "react";
import { X, LogIn, AlertCircle } from "lucide-react";
import { isFirebaseConfigured, auth as firebaseAuth } from "../utils/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { mockStorage } from "../utils/mockStorage";

export default function AuthDialog({ isOpen, onClose, onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (isFirebaseConfigured && firebaseAuth) {
      try {
        const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
        // Successful login
        onLoginSuccess({
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: userCredential.user.displayName || "Teacher",
          isAdmin: true
        });
        onClose();
      } catch (err) {
        console.error(err);
        setError("Invalid email or password. Please try again.");
      } finally {
        setLoading(false);
      }
    } else {
      // Mock Login Mode
      setTimeout(() => {
        const user = mockStorage.loginMockTeacher(email, password);
        if (user) {
          onLoginSuccess(user);
          onClose();
        } else {
          setError("Invalid mock credentials. Hint: use 'teacher@school.com' and 'password'.");
        }
        setLoading(false);
      }, 800);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LogIn size={20} className="text-primary" /> Teacher Login
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
              <label className="form-label" htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                className="form-control"
                placeholder="teacher@school.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '8px' }}>
              <label className="form-label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {!isFirebaseConfigured && (
              <p style={{ fontSize: '12px', color: '#84cc16', marginTop: '12px', fontWeight: '500' }}>
                💡 Running in demo mode. Log in with: <br />
                <strong>teacher@school.com</strong> / <strong>password</strong>
              </p>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-outline" onClick={onClose} disabled={loading} style={{ width: 'auto' }}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading} style={{ width: 'auto' }}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
