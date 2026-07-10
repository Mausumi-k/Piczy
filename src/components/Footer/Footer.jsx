import React from 'react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="pixel-footer">
      <div className="footer-content">
        <div className="footer-logo">
          ✨ Pixelia
        </div>
        <div className="footer-links">
          <a href="#home">Home</a>
          <a href="#gallery">Gallery</a>
          <a href="#about">Features</a>
          <a href="#">GitHub</a>
        </div>
        <div className="footer-bottom">
          <p>Made with ❤️ by PixeliaFan</p>
          <p className="copyright">© {new Date().getFullYear()} Pixelia. Draw Tiny. Imagine Big.</p>
        </div>
      </div>
      
      {/* Decorative Pixel Grass Bottom Border */}
      <div className="footer-grass-border"></div>
    </footer>
  );
}
