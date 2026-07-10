import React, { useEffect, useRef } from 'react';
import './CanvasArea.css';

export default function CanvasArea({ canvasRef, engine, gridVisible }) {
  const containerRef = useRef(null);

  // We need to attach event listeners to the canvas via React, 
  // but call the engine's methods.
  useEffect(() => {
    if (!engine || !canvasRef.current) return;

    const canvas = canvasRef.current;

    const onPointerDown = (e) => engine.onPointerDown(e);
    const onPointerMove = (e) => engine.onPointerMove(e);
    const onPointerUp = (e) => engine.onPointerUp(e);

    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    return () => {
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [engine, canvasRef]);

  return (
    <div className="canvas-container" ref={containerRef}>
      <div className="canvas-wrapper">
        <canvas 
          ref={canvasRef} 
          className={`pixel-canvas ${gridVisible ? 'show-grid' : ''}`}
          style={{ touchAction: 'none' }}
        />
      </div>
    </div>
  );
}
