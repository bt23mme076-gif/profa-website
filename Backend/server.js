const express = require('express');
const cors = require('cors');
const axios = require('axios');
const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin
try {
  const serviceAccount = require('./serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('Firebase Admin initialized successfully');
} catch (error) {
  console.error('Firebase Admin initialization error:', error.message);
  console.log('Please add serviceAccountKey.json file to Backend folder');
}

const db = admin.firestore();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// YouTube API endpoint
app.get('/api/youtube/videos', async (req, res) => {
  try {
    const { channelId } = req.query;
    
    if (!channelId) {
      return res.status(400).json({ error: 'Channel ID is required' });
    }

    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
    
    if (!YOUTUBE_API_KEY) {
      return res.status(500).json({ error: 'YouTube API key not configured' });
    }

    // Fetch latest videos from channel
    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/search`,
      {
        params: {
          key: YOUTUBE_API_KEY,
          channelId: channelId,
          part: 'snippet',
          order: 'date',
          maxResults: 3,
          type: 'video'
        }
      }
    );

    // Transform the response to a simpler format
    const videos = response.data.items.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.medium.url,
      publishedAt: item.snippet.publishedAt,
      videoUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`
    }));

    res.json({ success: true, videos });
    
  } catch (error) {
    console.error('YouTube API Error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to fetch YouTube videos',
      details: error.response?.data?.error?.message || error.message
    });
  }
});

// Contact form endpoint - Save to Firestore
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Save to Firestore
    const contactData = {
      name,
      email,
      message,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      status: 'unread'
    };

    const docRef = await db.collection('contactMessages').add(contactData);
    console.log('Contact form saved with ID:', docRef.id);
    
    res.json({ 
      success: true, 
      message: 'Message received. We will get back to you soon!',
      id: docRef.id
    });
    
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Newsletter subscription endpoint - Save to Firestore
app.post('/api/newsletter/subscribe', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if email already exists
    const existingSubscriber = await db.collection('newsletterSubscribers')
      .where('email', '==', email)
      .limit(1)
      .get();

    if (!existingSubscriber.empty) {
      return res.status(400).json({ 
        error: 'This email is already subscribed!' 
      });
    }

    // Save to Firestore
    const subscriberData = {
      email,
      subscribedAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'active'
    };

    const docRef = await db.collection('newsletterSubscribers').add(subscriberData);
    console.log('Newsletter subscriber saved with ID:', docRef.id);
    
    res.json({ 
      success: true, 
      message: 'Successfully subscribed to newsletter!',
      id: docRef.id
    });
    
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    res.status(500).json({ error: 'Failed to subscribe' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
