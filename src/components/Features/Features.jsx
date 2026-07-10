import React from 'react';
import './Features.css';

export default function Features() {
  const features = [
    {
      title: "Easy Drawing",
      desc: "No complicated menus. Just select a color and start dropping pixels instantly.",
      icon: "🖌️"
    },
    {
      title: "Export PNG",
      desc: "Save your masterpiece as a crisp, pixel-perfect PNG with one click.",
      icon: "💾"
    },
    {
      title: "Undo & Redo",
      desc: "Made a mistake? Easily undo and redo your brush strokes without fear.",
      icon: "↩️"
    },
    {
      title: "Infinite Creativity",
      desc: "Draw characters, landscapes, or game assets in a distraction-free space.",
      icon: "✨"
    },
    {
      title: "Fast Performance",
      desc: "Built with a custom pixel engine that runs smoothly directly in your browser.",
      icon: "⚡"
    },
    {
      title: "Cozy Vibe",
      desc: "Relaxing aesthetics inspired by your favorite cozy indie games.",
      icon: "🍄"
    }
  ];

  return (
    <section className="features" id="about">
      <div className="features-container">
        <h2>Why Pixelia?</h2>
        
        <div className="features-grid">
          {features.map((feature, i) => (
            <div className="feature-card" key={i}>
              <div className="feature-icon pixel-art">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
              
              {/* Decorative corner pixels */}
              <div className="corner-pixel top-left"></div>
              <div className="corner-pixel top-right"></div>
              <div className="corner-pixel bottom-left"></div>
              <div className="corner-pixel bottom-right"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
