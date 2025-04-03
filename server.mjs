
'use strict';

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoClient } from 'mongodb';

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();
const DEFAULT_PORT = 3000;
let PORT = process.env.PORT || DEFAULT_PORT;

// MongoDB connection
let mongoClient = null;
let db = null;

// Middleware
app.use(cors({
  origin: '*',  // Allow all origins for development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Serve static files from the dist directory after build
app.use(express.static(path.join(__dirname, 'dist')));

// API routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// MongoDB connection status endpoint
app.get('/api/db/status', async (req, res) => {
  try {
    const mongoUri = process.env.MONGODB_URI || req.query.uri;
    
    if (!mongoUri) {
      return res.status(400).json({ 
        status: 'error', 
        connected: false, 
        message: 'No MongoDB connection string provided' 
      });
    }
    
    // Try to connect to MongoDB if not already connected
    if (!mongoClient) {
      mongoClient = new MongoClient(mongoUri);
      await mongoClient.connect();
      db = mongoClient.db();
      console.log('MongoDB connected successfully');
    }
    
    // Check if connection is alive with a ping
    await db.command({ ping: 1 });
    
    res.json({ status: 'ok', connected: true });
  } catch (error) {
    console.error('MongoDB connection error:', error);
    
    // Close the client if connection failed
    if (mongoClient) {
      await mongoClient.close();
      mongoClient = null;
      db = null;
    }
    
    res.status(500).json({ 
      status: 'error', 
      connected: false, 
      message: error.message 
    });
  }
});

// Database initialization endpoint
app.post('/api/db/init', async (req, res) => {
  try {
    const mongoUri = process.env.MONGODB_URI || req.body.uri;
    
    if (!mongoUri) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'No MongoDB connection string provided' 
      });
    }
    
    // Connect to MongoDB if not already connected
    if (!mongoClient) {
      mongoClient = new MongoClient(mongoUri);
      await mongoClient.connect();
      db = mongoClient.db();
    }
    
    console.log('Initializing database collections...');
    
    // Create collections if they don't exist
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    // Users collection with admin user
    if (!collectionNames.includes('users')) {
      await db.createCollection('users');
      
      // Create default admin user
      await db.collection('users').insertOne({
        name: "Admin User",
        email: "admin@example.com",
        role: "admin",
        active: true,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      });
      
      // Create default regular user
      await db.collection('users').insertOne({
        name: "Regular User",
        email: "user@example.com",
        role: "user",
        active: true,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      });
      
      console.log('Users collection created with admin and regular users');
    }
    
    // Files collection for storing file metadata
    if (!collectionNames.includes('files')) {
      await db.createCollection('files');
      console.log('Files collection created');
    }
    
    // Notes collection
    if (!collectionNames.includes('notes')) {
      await db.createCollection('notes');
      console.log('Notes collection created');
    }
    
    // SEO analysis collection
    if (!collectionNames.includes('seo_analysis')) {
      await db.createCollection('seo_analysis');
      console.log('SEO analysis collection created');
    }
    
    // Domains collection
    if (!collectionNames.includes('domains')) {
      await db.createCollection('domains');
      
      // Create some sample domains
      await db.collection('domains').insertMany([
        {
          name: "example.com",
          registrar: "GoDaddy",
          registeredDate: "2022-01-15",
          expiryDate: "2025-01-15",
          status: "active",
          autoRenew: true,
          nameservers: ["ns1.godaddy.com", "ns2.godaddy.com"],
          notes: [
            {
              id: "n1",
              domainId: "1",
              content: "Main company domain",
              createdAt: "2022-01-15T08:30:00Z",
              updatedAt: "2022-01-15T08:30:00Z",
            }
          ],
          links: [
            {
              id: "l1",
              domainId: "1",
              url: "https://example.com",
              title: "Company Website",
              createdAt: "2022-01-15T08:35:00Z",
            }
          ],
          files: [],
          seoAnalyses: [
            {
              id: "seo1",
              domainId: "1",
              createdAt: "2023-03-15T10:30:00Z",
              metaTagsScore: 85,
              speedScore: 92,
              mobileScore: 88,
              accessibilityScore: 76,
              seoScore: 82,
              recommendations: [
                "Add alt text to all images",
                "Improve mobile page speed",
                "Fix broken links"
              ]
            }
          ]
        },
        {
          name: "store-example.com",
          registrar: "Namecheap",
          registeredDate: "2022-02-10",
          expiryDate: "2023-05-10",
          status: "expired",
          autoRenew: false,
          nameservers: [],
          notes: [],
          links: [],
          files: [],
          seoAnalyses: []
        },
        {
          name: "blog-example.com",
          registrar: "Cloudflare",
          registeredDate: "2023-01-01",
          expiryDate: "2024-06-01",
          status: "expiring-soon",
          autoRenew: true,
          nameservers: ["ns3.cloudflare.com", "ns4.cloudflare.com"],
          notes: [],
          links: [],
          files: [],
          seoAnalyses: []
        }
      ]);
      
      console.log('Domains collection created with sample data');
    }
    
    res.json({ 
      status: 'ok', 
      message: 'Database initialized successfully',
      collections: await db.listCollections().toArray()
    });
    
  } catch (error) {
    console.error('Database initialization error:', error);
    
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
});

// For any other routes, send the index.html file
// This enables client-side routing
app.get('*', (req, res) => {
  // Don't send index.html for API routes
  if (req.url.startsWith('/api/')) {
    return res.status(404).json({ error: "API endpoint not found" });
  }
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start server with fallback if port is in use
function startServer(port) {
  const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
  
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`Port ${port} is already in use, trying ${port + 1}`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
    }
  });

  return server;
}

const server = startServer(PORT);

export default app;
