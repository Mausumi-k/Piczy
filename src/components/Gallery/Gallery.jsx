import React, { useState, useEffect } from 'react';
import { Play } from 'lucide-react';
import { API } from '../../utils/api';
import ReplayViewer from '../ReplayViewer/ReplayViewer';
import './Gallery.css';

export default function Gallery() {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replayArt, setReplayArt] = useState(null);

  const fetchArt = async () => {
    setLoading(true);
    const data = await API.fetchGallery();
    setArtworks(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchArt();
  }, []);

  return (
    <section className="gallery" id="gallery">
      <div className="gallery-container">
        <h2>The Pixel Garden</h2>
        <p className="gallery-subtitle">A collection of cozy creations from our community.</p>
        
        <div className="gallery-grid">
          {loading ? (
            <p className="gallery-loading">Loading beautiful art...</p>
          ) : artworks.length === 0 ? (
            <p className="gallery-loading">The garden is empty. Be the first to plant a pixel!</p>
          ) : artworks.map((art, i) => (
            <div className="gallery-item" key={art.id || i}>
              <div className="wooden-frame">
                <div className="art-canvas pixel-art" style={{ backgroundColor: 'white', padding: 0 }}>
                  <img src={art.image_data} alt={art.title} style={{ width: '100%', height: '100%', imageRendering: 'pixelated' }} />
                </div>
                
                {/* Decorative flowers on frame */}
                <div className="frame-flower top-left">🌸</div>
                <div className="frame-leaf bottom-right">🌿</div>
              </div>
              <div className="art-info">
                <h3>{art.title || 'Untitled'}</h3>
                <p>by {art.author_name}</p>
                {art.stroke_history && art.stroke_history !== '[]' && (
                  <button 
                    className="cozy-button small" 
                    style={{marginTop: '10px', width: '100%', padding: '6px'}}
                    onClick={() => setReplayArt(art)}
                  >
                    <Play size={14} style={{marginRight: '6px'}}/> Watch Replay
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {replayArt && (
        <ReplayViewer artwork={replayArt} onClose={() => setReplayArt(null)} />
      )}
      
      {/* Garden Grass Decor at bottom */}
      <div className="gallery-grass">
        <span>🌱</span><span>🌿</span><span>🌱</span><span>🍄</span><span>🌿</span><span>🌱</span>
      </div>
    </section>
  );
}
