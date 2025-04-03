
import { MongoClient } from 'mongodb';

// MongoDB connection
let mongoClient = null;
let db = null;

// MongoDB connection status check
export const checkConnectionStatus = async (mongoUri) => {
  console.log('Server: MongoDB status endpoint called');
  try {
    console.log(`Server: Checking MongoDB connection with URI ${mongoUri ? 'provided' : 'missing'}`);
    console.log('Server: MongoDB URI first 10 chars:', mongoUri ? mongoUri.substring(0, 10) + '...' : 'undefined');
    
    if (!mongoUri) {
      console.error('Server: No MongoDB connection string provided');
      return { 
        status: 'error', 
        connected: false, 
        message: 'No MongoDB connection string provided',
        statusCode: 400
      };
    }
    
    // Log connection attempt (without exposing sensitive data)
    console.log('Server: Attempting to connect to MongoDB...');
    
    // Try to connect to MongoDB if not already connected
    if (!mongoClient) {
      console.log('Server: Creating new MongoDB client');
      mongoClient = new MongoClient(mongoUri);
      await mongoClient.connect();
      db = mongoClient.db();
      console.log('Server: MongoDB connected successfully');
    } else {
      console.log('Server: Using existing MongoDB client');
    }
    
    // Check if connection is alive with a ping
    console.log('Server: Pinging MongoDB to verify connection');
    await db.command({ ping: 1 });
    console.log('Server: MongoDB ping successful');
    
    return { 
      status: 'ok', 
      connected: true,
      statusCode: 200
    };
  } catch (error) {
    console.error('Server: MongoDB connection error:', error);
    
    // Close the client if connection failed
    if (mongoClient) {
      console.log('Server: Closing MongoDB client due to connection error');
      await mongoClient.close();
      mongoClient = null;
      db = null;
    }
    
    return { 
      status: 'error', 
      connected: false, 
      message: error.message,
      statusCode: 500
    };
  }
};

// Initialize database with collections
export const initializeDatabase = async (mongoUri) => {
  console.log('Server: Database initialization endpoint called');
  try {
    console.log(`Server: Initializing database with URI ${mongoUri ? 'provided' : 'missing'}`);
    
    if (!mongoUri) {
      console.error('Server: No MongoDB connection string provided for initialization');
      return { 
        status: 'error', 
        message: 'No MongoDB connection string provided',
        statusCode: 400
      };
    }
    
    // Connect to MongoDB if not already connected
    if (!mongoClient) {
      console.log('Server: Connecting to MongoDB for initialization...');
      mongoClient = new MongoClient(mongoUri);
      await mongoClient.connect();
      db = mongoClient.db();
      console.log('Server: MongoDB connected for initialization');
    } else {
      console.log('Server: Using existing MongoDB client for initialization');
    }
    
    console.log('Server: Initializing database collections...');
    
    // Create collections if they don't exist
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    console.log('Server: Existing collections:', collectionNames);
    
    // Initialize collections
    await initializeCollections(collectionNames);
    
    console.log('Server: Database initialization completed successfully');
    return { 
      status: 'ok', 
      message: 'Database initialized successfully',
      collections: await db.listCollections().toArray(),
      statusCode: 200
    };
    
  } catch (error) {
    console.error('Server: Database initialization error:', error);
    
    return { 
      status: 'error', 
      message: error.message,
      statusCode: 500
    };
  }
};

// Helper function to initialize collections
async function initializeCollections(collectionNames) {
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
}

// Make the MongoDB client and db available for other modules
export const getMongoClient = () => mongoClient;
export const getDb = () => db;
