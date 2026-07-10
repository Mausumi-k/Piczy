import React from 'react';
import { motion } from 'framer-motion';
import './PixelBackground.css';

export default function PixelBackground() {
  return (
    <div className="pixel-bg-container">
      {/* Sky Gradient */}
      <div className="pixel-sky"></div>

      {/* Floating Pixel Clouds */}
      <motion.div 
        className="pixel-cloud cloud-1"
        animate={{ x: [0, 40, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      ></motion.div>
      <motion.div 
        className="pixel-cloud cloud-2"
        animate={{ x: [0, -30, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear", delay: 2 }}
      ></motion.div>
      <motion.div 
        className="pixel-cloud cloud-3"
        animate={{ x: [0, 50, 0] }}
        transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
      ></motion.div>

      {/* Rain / Shooting stars effect */}
      <div className="pixel-rain rain-1"></div>
      <div className="pixel-rain rain-2"></div>
      <div className="pixel-rain rain-3"></div>

      {/* Stepped Pixel Mountains */}
      <div className="pixel-mountain mountain-back"></div>
      <div className="pixel-mountain mountain-mid"></div>
      <div className="pixel-mountain mountain-front"></div>

      {/* Tiny Character / Cliff detail from reference */}
      <div className="pixel-cliff">
        <div className="pixel-character"></div>
      </div>
    </div>
  );
}
