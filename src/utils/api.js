const API_BASE = 'http://localhost:3001/api';

export const Auth = {
  getToken: () => localStorage.getItem('pixelia_token'),
  setToken: (token) => localStorage.setItem('pixelia_token', token),
  getUser: () => {
    const user = localStorage.getItem('pixelia_user');
    return user ? JSON.parse(user) : null;
  },
  setUser: (user) => localStorage.setItem('pixelia_user', JSON.stringify(user)),
  logout: () => {
    localStorage.removeItem('pixelia_token');
    localStorage.removeItem('pixelia_user');
  }
};

export const API = {
  login: async (username, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    return res.json();
  },

  register: async (username, password) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    return res.json();
  },

  fetchGallery: async () => {
    try {
      const res = await fetch(`${API_BASE}/gallery`);
      if (!res.ok) throw new Error('Failed to fetch gallery');
      return await res.json();
    } catch (err) {
      console.error(err);
      return [];
    }
  },

  publishArtwork: async (title, imageData, strokeHistory = [], isPrivate = false) => {
    try {
      const user = Auth.getUser();
      if (!user) throw new Error('Not logged in');

      const res = await fetch(`${API_BASE}/gallery`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Auth.getToken()}`
        },
        body: JSON.stringify({
          author_id: user.id,
          author_name: user.username,
          title,
          image_data: imageData,
          stroke_history: strokeHistory,
          is_private: isPrivate
        })
      });
      return await res.json();
    } catch (err) {
      console.error(err);
      return { success: false, error: err.message };
    }
  },

  generateAIArt: async (prompt, canvasSize = 32) => {
    try {
      const res = await fetch(`${API_BASE}/generate-ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, canvasSize })
      });
      return await res.json();
    } catch (err) {
      console.error(err);
      return { success: false, error: err.message };
    }
  }
};
