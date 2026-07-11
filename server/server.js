require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const connectDB = require('./database');
const User = require('./models/User');
const Artwork = require('./models/Artwork');

const JWT_SECRET = process.env.JWT_SECRET || 'pixelia-super-secret-key-99';

// Connect to MongoDB
connectDB();

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
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ error: 'Username already taken' });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password_hash: hash });
      
    const token = jwt.sign({ id: user._id, username }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ success: true, token, user: { id: user._id, username } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, user: { id: user._id, username: user.username } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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
app.get('/api/gallery', async (req, res) => {
  try {
    const artworks = await Artwork.find({ is_private: 0 })
      .sort({ created_at: -1 })
      .limit(20)
      .lean(); // Return plain JS objects
    
    // Map _id to id for frontend compatibility
    const formatted = artworks.map(art => ({ ...art, id: art._id }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Publish or Save a new artwork (Protected)
app.post('/api/gallery', authenticateToken, async (req, res) => {
  const { author_id, author_name, title, image_data, stroke_history, is_private } = req.body;
  
  if (!author_id || !image_data) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const historyStr = stroke_history ? JSON.stringify(stroke_history) : '[]';
  const isPrivateInt = is_private ? 1 : 0;

  try {
    const artwork = await Artwork.create({
      author_id,
      author_name,
      title: title || 'Untitled',
      image_data,
      stroke_history: historyStr,
      is_private: isPrivateInt
    });
    res.status(201).json({ id: artwork._id, success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch user's personal artworks (Protected)
app.get('/api/user/artworks', authenticateToken, async (req, res) => {
  try {
    const artworks = await Artwork.find({ author_id: req.user.id })
      .sort({ created_at: -1 })
      .lean();
      
    const formatted = artworks.map(art => ({ ...art, id: art._id }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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
