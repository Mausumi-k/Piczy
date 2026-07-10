import React, { useState } from 'react';
import { Download, Grid, Wand2, UploadCloud } from 'lucide-react';
import './Sidebar.css';

const PRESET_COLORS = [
  '#000000', '#FFFFFF', '#FF3B30', '#FF9500', '#FFCC00', 
  '#4CD964', '#5AC8FA', '#007AFF', '#5856D6', '#FF2D55',
  '#A3C9F0', '#D0BFFF', '#FFCBA4', '#A8E6CF', '#FFB7B2'
];

export default function Sidebar({ color, onColorChange, gridVisible, onGridToggle, onExport, onPublish, onSavePrivate, onReplay, onAIRequest, aiReferenceGrid, onResize }) {
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAIRequest = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    await onAIRequest(aiPrompt);
    setIsGenerating(false);
    setAiPrompt('');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-section">
        <h3>Colors</h3>
        <input 
          type="color" 
          className="color-picker" 
          value={color} 
          onChange={(e) => onColorChange(e.target.value)} 
        />
        
        <div className="preset-colors">
          {PRESET_COLORS.map(c => (
            <button 
              key={c}
              className={`preset-color ${color === c ? 'selected' : ''}`}
              style={{ backgroundColor: c }}
              onClick={() => onColorChange(c)}
            />
          ))}
        </div>
      </div>

      <div className="sidebar-section">
        <h3>Magic Wand 🪄</h3>
        <p style={{ fontSize: '0.85rem', marginBottom: '8px' }}>Ask for a pattern to copy!</p>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input 
            type="text" 
            placeholder="e.g. A tiny frog"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            style={{ flex: 1, padding: '8px', fontFamily: 'var(--font-pixel)', border: '4px solid var(--color-text-main)' }}
          />
          <button 
            className="sidebar-btn" 
            style={{ width: isGenerating ? 'auto' : '40px', padding: isGenerating ? '0 8px' : '0', display: 'flex', justifyContent: 'center' }}
            onClick={handleAIRequest}
            disabled={isGenerating}
          >
            {isGenerating ? 'Waiting for few secs... ✨' : <Wand2 size={18} />}
          </button>
        </div>
        
        {/* Render AI Reference Pattern if it exists */}
        {aiReferenceGrid && (
          <div className="ai-reference-container">
            <p style={{ fontSize: '0.75rem', marginTop: '12px', marginBottom: '4px', color: 'var(--color-text-light)' }}>
              Reference Pattern:
            </p>
            <div 
              className="ai-reference-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${aiReferenceGrid[0].length}, 1fr)`,
                width: '100%',
                aspectRatio: '1',
                border: '4px solid var(--color-text-main)',
                backgroundColor: 'white'
              }}
            >
              {aiReferenceGrid.map((row, y) => 
                row.map((color, x) => (
                  <div 
                    key={`${x}-${y}`} 
                    style={{ backgroundColor: color === 'transparent' ? 'transparent' : color }}
                  />
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <div className="sidebar-section">
        <h3>Settings</h3>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontFamily: 'var(--font-pixel)', fontSize: '1.1rem' }}>
          <input 
            type="checkbox" 
            checked={gridVisible} 
            onChange={onGridToggle}
          />
          Show Grid
        </label>
        
        <div style={{ marginTop: '16px' }}>
          <p style={{ fontSize: '0.85rem', marginBottom: '8px', color: 'var(--color-text-light)' }}>Canvas Size (clears drawing)</p>
          <select 
            onChange={(e) => onResize(Number(e.target.value))}
            style={{ width: '100%', padding: '8px', fontFamily: 'var(--font-pixel)', border: '4px solid var(--color-border)', borderRadius: '8px' }}
            defaultValue={64}
          >
            <option value={16}>16 x 16</option>
            <option value={32}>32 x 32</option>
            <option value={64}>64 x 64</option>
          </select>
        </div>
      </div>

      <div className="sidebar-section">
        <h3>Actions</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button className="sidebar-btn outline" onClick={onExport}>
            <Download size={18} style={{marginRight: '8px'}} /> Export PNG
          </button>
          <button className="sidebar-btn outline" onClick={onReplay}>
            ▶ Watch Replay
          </button>
          <button className="sidebar-btn" style={{ backgroundColor: 'var(--color-peach)', color: 'white', borderColor: 'var(--color-peach)' }} onClick={onSavePrivate}>
            💾 Save Privately
          </button>
          <button className="sidebar-btn" onClick={onPublish}>
            <UploadCloud size={18} style={{marginRight: '8px'}} /> Publish to Gallery
          </button>
        </div>
      </div>
    </div>
  );
}
