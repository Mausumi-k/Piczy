import React, { useState, useEffect } from 'react';
import { API, Auth } from '../../utils/api';
import ReplayViewer from '../ReplayViewer/ReplayViewer';
import './Profile.css';
import { Play, UploadCloud } from 'lucide-react';

export default function Profile() {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replayArt, setReplayArt] = useState(null);

  useEffect(() => {
    loadMyArtworks();
  }, []);

  const loadMyArtworks = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/user/artworks', {
        headers: { 'Authorization': `Bearer ${Auth.getToken()}` }
      });
      if (res.ok) {
        const data = await res.json();
        setArtworks(data);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handlePublish = async (art) => {
    if (confirm("Are you sure you want to publish this to the public gallery?")) {
      // Re-publish with is_private = false
      const result = await API.publishArtwork(art.title, art.image_data, JSON.parse(art.stroke_history || '[]'), false);
      if (result.success) {
        alert("Published!");
        loadMyArtworks();
      }
    }
  };

  if (loading) return <div className="profile-loading">Loading your studio...</div>;

  return (
    <div className="profile-container" id="profile">
      <div className="profile-header">
        <h2>{Auth.getUser()?.username}'s Studio</h2>
        <p>Your private saves and masterpieces.</p>
      </div>

      <div className="profile-grid">
        {artworks.map(art => (
          <div key={art.id} className="profile-card glass-panel">
            <div className="profile-art-preview">
              <img src={art.image_data} alt={art.title} />
              {art.is_private === 1 && <span className="private-badge">Private</span>}
            </div>
            <div className="profile-art-info">
              <h3>{art.title || 'Untitled'}</h3>
              <p>{new Date(art.created_at).toLocaleDateString()}</p>
            </div>
            <div className="profile-art-actions">
              {art.stroke_history && art.stroke_history !== '[]' && (
                <button className="cozy-button small" onClick={() => setReplayArt(art)}>
                  <Play size={14} style={{marginRight: '4px'}}/> Replay
                </button>
              )}
              {art.is_private === 1 && (
                <button className="cozy-button small" onClick={() => handlePublish(art)}>
                  <UploadCloud size={14} style={{marginRight: '4px'}}/> Publish
                </button>
              )}
            </div>
          </div>
        ))}
        {artworks.length === 0 && (
          <div style={{gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--color-text-light)'}}>
            You haven't saved any art yet! Open the Studio and start drawing.
          </div>
        )}
      </div>

      {replayArt && (
        <ReplayViewer artwork={replayArt} onClose={() => setReplayArt(null)} />
      )}
    </div>
  );
}
