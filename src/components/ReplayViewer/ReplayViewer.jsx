import React, { useEffect, useRef, useState } from 'react';
import { PixelEngine } from '../../engine/PixelEngine';
import './ReplayViewer.css';

export default function ReplayViewer({ artwork, onClose }) {
  const canvasRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    let engine;
    if (canvasRef.current) {
      engine = new PixelEngine(canvasRef.current, 64, 64);
      
      const history = JSON.parse(artwork.stroke_history || '[]');
      if (history.length > 0) {
        engine.playHistory(history, () => setIsPlaying(false));
      } else {
        // Fallback to just drawing the image if no history
        engine._loadImageData(artwork.image_data);
        setIsPlaying(false);
      }
    }
  }, [artwork]);

  return (
    <div className="replay-overlay">
      <div className="replay-modal glass-panel">
        <button className="replay-close" onClick={onClose}>×</button>
        <div className="replay-header">
          <h3>Replay: {artwork.title || 'Untitled'}</h3>
          <p>by {artwork.author_name}</p>
        </div>
        
        <div className="replay-canvas-container">
          <canvas ref={canvasRef} className="replay-canvas" />
        </div>
        
        <div className="replay-status">
          {isPlaying ? '▶ Playing time-lapse...' : '✨ Finished!'}
        </div>
      </div>
    </div>
  );
}
