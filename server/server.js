require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./database');

const JWT_SECRET = process.env.JWT_SECRET || 'pixelia-super-secret-key-99';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// --- Auth API ---

app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  try {
    const hash = await bcrypt.hash(password, 10);
    db.run(`INSERT INTO users (username, password_hash) VALUES (?, ?)`, [username, hash], function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) return res.status(400).json({ error: 'Username already taken' });
        return res.status(500).json({ error: err.message });
      }
      
      const token = jwt.sign({ id: this.lastID, username }, JWT_SECRET, { expiresIn: '7d' });
      res.status(201).json({ success: true, token, user: { id: this.lastID, username } });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, user: { id: user.id, username: user.username } });
  });
});

// Middleware to verify token for protected routes
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Forbidden' });
    req.user = user;
    next();
  });
};

// --- Gallery API ---

// Fetch recent public artworks
app.get('/api/gallery', (req, res) => {
  const sql = `SELECT * FROM artworks WHERE is_private = 0 ORDER BY created_at DESC LIMIT 20`;
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Publish or Save a new artwork (Protected)
app.post('/api/gallery', authenticateToken, (req, res) => {
  const { author_id, author_name, title, image_data, stroke_history, is_private } = req.body;
  
  if (!author_id || !image_data) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const historyStr = stroke_history ? JSON.stringify(stroke_history) : '[]';
  const isPrivateInt = is_private ? 1 : 0;

  const sql = `INSERT INTO artworks (author_id, author_name, title, image_data, stroke_history, is_private) VALUES (?, ?, ?, ?, ?, ?)`;
  db.run(sql, [author_id, author_name, title || 'Untitled', image_data, historyStr, isPrivateInt], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: this.lastID, success: true });
  });
});

// Fetch user's personal artworks (Protected)
app.get('/api/user/artworks', authenticateToken, (req, res) => {
  const sql = `SELECT * FROM artworks WHERE author_id = ? ORDER BY created_at DESC`;
  db.all(sql, [req.user.id], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// --- AI Magic Wand API ---

app.post('/api/generate-ai', async (req, res) => {
  const { prompt, canvasSize } = req.body;
  
  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: "Gemini API key is missing on the server. Please add it to the .env file." });
  }

  try {
    const size = canvasSize || 32;
    // We ask Gemini to act as a pixel art generator
    const systemInstruction = `You are an expert pixel artist. You generate pixel art by outputting a JSON array. 
The array must be exactly ${size} elements long (rows), and each element is an array of exactly ${size} strings (columns).
Each string must be a valid hex color code (e.g. "#000000") or "transparent" for empty space.
Do not output anything other than valid JSON. 
Ensure the subject matches the user's prompt perfectly. 
Keep the background "transparent". 

CRITICAL: DO NOT fill in the object with colors! You must ONLY draw the OUTLINE/BORDER of the object using a dark color like "#000000". Leave the inside of the object completely "transparent" so the user can color it in themselves.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      }
    });

    const result = JSON.parse(response.text);
    res.json({ success: true, pixels: result });
  } catch (error) {
    console.error('AI Generation Error:', error);
    res.status(500).json({ error: 'Failed to generate AI art', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Pixelia Backend running on http://localhost:${PORT}`);
});
