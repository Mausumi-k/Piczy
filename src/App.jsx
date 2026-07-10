import React, { useState } from 'react';
import Navbar from './components/Navbar/Navbar';
import Hero from './components/Hero/Hero';
import Features from './components/Features/Features';
import Gallery from './components/Gallery/Gallery';
import Footer from './components/Footer/Footer';
import DrawingApp from './components/DrawingApp/DrawingApp';
import AuthModal from './components/Auth/AuthModal';
import Profile from './components/Profile/Profile';
import { Auth } from './utils/api';

function App() {
  const [appOpen, setAppOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [currentView, setCurrentView] = useState('home'); // 'home' or 'profile'

  const handleLaunchRequest = () => {
    if (Auth.getUser()) {
      setAppOpen(true);
    } else {
      setShowAuth(true);
    }
  };

  return (
    <>
      <Navbar 
        onLaunch={handleLaunchRequest} 
        onGoHome={() => setCurrentView('home')}
        onGoProfile={() => setCurrentView('profile')}
      />
      
      {currentView === 'home' ? (
        <>
          <Hero onLaunch={handleLaunchRequest} />
          {/* Scrollable sections */}
          <Gallery />
          <Features />
        </>
      ) : (
        <Profile />
      )}
      
      <Footer />

      {/* Auth Modal Overlay */}
      {showAuth && (
        <AuthModal 
          onClose={() => setShowAuth(false)}
          onLoginSuccess={() => {
            setShowAuth(false);
            setAppOpen(true);
          }}
        />
      )}

      {/* Overlay Application */}
      {appOpen && <DrawingApp onClose={() => setAppOpen(false)} />}
    </>
  );
}

export default App;
