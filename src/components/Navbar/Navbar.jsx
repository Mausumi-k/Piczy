import React, { useState, useEffect } from 'react';
import { Palette } from 'lucide-react';
import { Auth } from '../../utils/api';
import './Navbar.css';

export default function Navbar({ onLaunch, onGoHome, onGoProfile }) {
  const user = Auth.getUser();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''} glass-panel`}>
      <div className="navbar-logo" onClick={onGoHome} style={{ cursor: 'pointer' }}>
        <Palette size={28} color="var(--color-lavender)" />
        <span className="logo-text">Pixelia</span>
      </div>
      <div className="navbar-links">
        <button className="nav-link" onClick={onGoHome}>Gallery</button>
        {user && <button className="nav-link" onClick={onGoProfile}>My Profile</button>}
        {user && <button className="nav-link" onClick={() => { Auth.logout(); window.location.reload(); }}>Log out</button>}
        <button className="cozy-button" onClick={onLaunch}>
          Studio ✨
        </button>
      </div>
    </nav>
  );
}
