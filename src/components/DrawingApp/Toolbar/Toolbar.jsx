import React from 'react';
import { Pencil, Eraser, PaintBucket, Pipette, Undo, Redo, Trash2 } from 'lucide-react';
import './Toolbar.css';

export default function Toolbar({ activeTool, onToolChange, onUndo, onRedo, onClear, brushSize, onBrushSizeChange }) {
  return (
    <div className="toolbar">
      <div className="tool-group">
        <button 
          className={`tool-button ${activeTool === 'pencil' ? 'active' : ''}`}
          onClick={() => onToolChange('pencil')}
          title="Pencil"
        >
          <Pencil size={20} />
        </button>
        <button 
          className={`tool-button ${activeTool === 'eraser' ? 'active' : ''}`}
          onClick={() => onToolChange('eraser')}
          title="Eraser"
        >
          <Eraser size={20} />
        </button>
        <button 
          className={`tool-button ${activeTool === 'fill' ? 'active' : ''}`}
          onClick={() => onToolChange('fill')}
          title="Fill Bucket"
        >
          <PaintBucket size={20} />
        </button>
        <button 
          className={`tool-button ${activeTool === 'eyedropper' ? 'active' : ''}`}
          onClick={() => onToolChange('eyedropper')}
          title="Eyedropper"
        >
          <Pipette size={20} />
        </button>
      </div>

      <div className="toolbar-divider"></div>

      <div className="tool-group">
        <button className={`tool-button brush-size ${brushSize === 1 ? 'active' : ''}`} onClick={() => onBrushSizeChange(1)} title="1px">
          <div className="brush-dot" style={{width: '2px', height: '2px'}}></div>
        </button>
        <button className={`tool-button brush-size ${brushSize === 2 ? 'active' : ''}`} onClick={() => onBrushSizeChange(2)} title="2px">
          <div className="brush-dot" style={{width: '4px', height: '4px'}}></div>
        </button>
        <button className={`tool-button brush-size ${brushSize === 3 ? 'active' : ''}`} onClick={() => onBrushSizeChange(3)} title="3px">
          <div className="brush-dot" style={{width: '6px', height: '6px'}}></div>
        </button>
        <button className={`tool-button brush-size ${brushSize === 4 ? 'active' : ''}`} onClick={() => onBrushSizeChange(4)} title="4px">
          <div className="brush-dot" style={{width: '8px', height: '8px'}}></div>
        </button>
      </div>

      <div className="toolbar-divider"></div>

      <div className="tool-group">
        <button className="tool-button" onClick={onUndo} title="Undo">
          <Undo size={20} />
        </button>
        <button className="tool-button" onClick={onRedo} title="Redo">
          <Redo size={20} />
        </button>
      </div>

      <div className="toolbar-divider"></div>

      <div className="tool-group">
        <button className="tool-button danger" onClick={onClear} title="Clear Canvas">
          <Trash2 size={20} />
        </button>
      </div>
    </div>
  );
}
