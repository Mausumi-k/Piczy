import React, { useState, useEffect, useRef } from 'react';
import { PixelEngine } from '../../engine/PixelEngine';
import CanvasArea from './CanvasArea/CanvasArea';
import Toolbar from './Toolbar/Toolbar';
import Sidebar from './Sidebar/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { API } from '../../utils/api';
import './DrawingApp.css';

export default function DrawingApp({ onClose }) {
  const canvasRef = useRef(null);
  const [engine, setEngine] = useState(null);
  const [activeTool, setActiveTool] = useState('pencil');
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(1);
  const [gridVisible, setGridVisible] = useState(true);
  const [aiReferenceGrid, setAiReferenceGrid] = useState(null);

  useEffect(() => {
    if (canvasRef.current && !engine) {
      // Check for autosave
      const savedData = localStorage.getItem('pixelia_autosave');
      let w = 64;
      let h = 64;
      let shouldRestore = false;
      let parsed = null;

      if (savedData) {
        try {
          parsed = JSON.parse(savedData);
          if (parsed.history && parsed.history.length > 0) {
            shouldRestore = confirm("You have an unsaved drawing. Do you want to restore it?");
            if (shouldRestore) {
              w = parsed.width || 64;
              h = parsed.height || 64;
            }
          }
        } catch (e) {
          console.error('Failed to parse autosave', e);
        }
      }

      const newEngine = new PixelEngine(canvasRef.current, w, h);
      
      if (shouldRestore && parsed) {
        newEngine._loadImageData(parsed.dataUrl);
        newEngine.actionHistory = parsed.history;
      }

      newEngine.onColorPicked((hex) => {
        setColor(hex);
        setActiveTool('pencil');
        newEngine.setTool('pencil');
      });
      setEngine(newEngine);
    }
  }, [engine]);

  const handleToolChange = (tool) => {
    setActiveTool(tool);
    if (engine) engine.setTool(tool);
  };

  const handleColorChange = (newColor) => {
    setColor(newColor);
    if (engine) engine.setColor(newColor);
  };

  const handleBrushSizeChange = (size) => {
    setBrushSize(size);
    if (engine) engine.setBrushSize(size);
  };

  const handlePublish = async (isPrivate = false) => {
    if (!engine) return;
    const title = prompt(isPrivate ? "Give your private save a title:" : "Give your masterpiece a title for the public gallery:");
    if (!title) return;
    
    const imageData = engine.canvas.toDataURL('image/png');
    const history = engine.actionHistory;
    
    const result = await API.publishArtwork(title, imageData, history, isPrivate);
    
    if (result.success) {
      alert(isPrivate ? "Successfully saved to your profile!" : "Successfully published to the Pixel Garden!");
    } else {
      alert("Failed to save: " + result.error);
    }
  };

  const handleReplay = async () => {
    if (!engine) return;
    if (engine.actionHistory.length === 0) {
      alert("Nothing to replay yet!");
      return;
    }
    
    // Copy history so we can replay it
    const historyCopy = [...engine.actionHistory];
    
    // Disable drawing tools during replay? Optional, but let's just let it play
    await engine.playHistory(historyCopy);
  };

  const handleAIRequest = async (promptText) => {
    if (!engine) return;
    setAiReferenceGrid(null); // clear old reference
    const result = await API.generateAIArt(promptText, 16);
    
    if (result.success && result.pixels) {
      // Instead of drawing on canvas, we save it as a reference
      setAiReferenceGrid(result.pixels);
    } else {
      alert("AI failed to generate art. Check terminal for errors.");
    }
  };

  const handleResize = (size) => {
    if (confirm(`Resize canvas to ${size}x${size}? This will clear your current drawing.`)) {
      if (engine) engine.clear(false); // clear without saving history
      const newEngine = new PixelEngine(canvasRef.current, size, size);
      newEngine.onColorPicked((hex) => {
        setColor(hex);
        setActiveTool('pencil');
        newEngine.setTool('pencil');
      });
      newEngine.setBrushSize(brushSize);
      newEngine.setColor(color);
      setEngine(newEngine);
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        className="drawing-app-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div 
          className="drawing-app-container glass-panel"
          initial={{ scale: 0.9, y: 50, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.4, duration: 0.6 }}
        >
          <div className="drawing-app-header">
            <h2>Canvas</h2>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
          
          <div className="drawing-app-layout">
            <Toolbar 
              activeTool={activeTool} 
              onToolChange={handleToolChange}
              onUndo={() => engine?.undo()}
              onRedo={() => engine?.redo()}
              onClear={() => engine?.clear()}
              brushSize={brushSize}
              onBrushSizeChange={handleBrushSizeChange}
            />
            
            <CanvasArea 
              canvasRef={canvasRef} 
              engine={engine}
              gridVisible={gridVisible}
            />
            
            <Sidebar 
              color={color}
              onColorChange={handleColorChange}
              gridVisible={gridVisible}
              onGridToggle={() => setGridVisible(!gridVisible)}
              onExport={() => engine?.exportPNG()}
              onPublish={() => handlePublish(false)}
              onSavePrivate={() => handlePublish(true)}
              onReplay={handleReplay}
              onAIRequest={handleAIRequest}
              aiReferenceGrid={aiReferenceGrid}
              onResize={handleResize}
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
