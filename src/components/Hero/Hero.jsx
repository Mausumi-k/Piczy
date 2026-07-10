import React from 'react';
import { motion } from 'framer-motion';
import PixelBackground from './PixelBackground';
import './Hero.css';

export default function Hero({ onLaunch }) {
  return (
    <section className="hero full-bg-hero" id="home">
      
      {/* Pure CSS Pixel Art Background */}
      <PixelBackground />

      <div className="hero-container flex-center">
        <motion.div 
          className="hero-glass-card glass-panel"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          <h1>
            Draw Tiny.<br/>
            <span className="highlight-lavender">Imagine Big.</span>
          </h1>
          
          <div className="hero-actions" style={{ marginTop: '20px' }}>
            <button className="cozy-button huge-button" onClick={onLaunch}>
              Start Drawing ✨
            </button>
            <a href="#gallery" className="secondary-button huge-button" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
              View Gallery
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
