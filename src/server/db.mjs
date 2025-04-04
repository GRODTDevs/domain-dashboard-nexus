
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
      
      // Use "fsh" as the database name
      let dbName = 'fsh';
      console.log(`Server: Using database name: ${dbName}`);
      
      db = mongoClient.db(dbName);
      
      // Explicitly check if database exists by inserting a ping document
      // MongoDB Atlas creates databases lazily on first insert
      try {
        console.log('Server: Testing database existence with ping document');
        await db.collection('_ping').insertOne({ 
          timestamp: new Date().toISOString(),
          message: 'Database existence check'
        });
        console.log('Server: Successfully created database with ping');
      } catch (dbTestError) {
        console.log('Server: Database ping test error:', dbTestError.message);
        // Non-fatal error, continue
      }
      
      console.log(`Server: MongoDB connected successfully to database: ${dbName}`);
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
      
      // Use "fsh" as the database name
      const dbName = 'fsh';
      console.log(`Server: Using database name: ${dbName}`);
      
      db = mongoClient.db(dbName);
      console.log(`Server: MongoDB connected for initialization to database: ${dbName}`);
    } else {
      console.log('Server: Using existing MongoDB client');
    }
    
    console.log('Server: Initializing database collections...');
    
    // IMPORTANT: For MongoDB Atlas, we need to force database creation by inserting a document first
    console.log('Server: Force creating database with initialization marker');
    await db.collection('_dbinit').insertOne({ 
      initialized: true,
      timestamp: new Date().toISOString() 
    });
    console.log('Server: Database creation forced with _dbinit collection');
    
    // Now check what collections exist
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    console.log('Server: Existing collections after force creation:', collectionNames);
    
    // Initialize collections one by one
    console.log('Server: Starting individual collection initialization');
    const initResult = await initializeCollections();
    console.log('Server: All collections initialized with results:', initResult);
    
    // Verify collections were created
    const verifyCollections = await db.listCollections().toArray();
    const verifyCollectionNames = verifyCollections.map(c => c.name);
    console.log('Server: Collections after initialization:', verifyCollectionNames);
    
    // Check if expected collections were created
    const expectedCollections = ['users', 'files', 'notes', 'seo_analysis', 'domains'];
    const missingCollections = expectedCollections.filter(name => !verifyCollectionNames.includes(name));
    
    if (missingCollections.length > 0) {
      console.error('Server: Some collections were not created:', missingCollections);
      return {
        status: 'error',
        message: `Database initialization incomplete. Missing collections: ${missingCollections.join(', ')}`,
        collections: verifyCollectionNames,
        statusCode: 500
      };
    }
    
    console.log('Server: Database initialization completed successfully');
    return { 
      status: 'ok', 
      message: 'Database initialized successfully',
      collections: verifyCollectionNames,
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
async function initializeCollections() {
  console.log('Server: Starting collection initialization');
  const results = {};
  
  // Create collections one by one with verification
  const collectionsToCreate = [
    { name: 'users', sampleDocs: [] },
    { name: 'files', sampleDocs: [] },
    { name: 'notes', sampleDocs: [] },
    { name: 'seo_analysis', sampleDocs: [] },
    { name: 'domains', sampleDocs: [] }
  ];
  
  // First ensure all collections exist (force creation)
  for (const col of collectionsToCreate) {
    try {
      console.log(`Server: Creating ${col.name} collection`);
      // This will create the collection if it doesn't exist
      await db.createCollection(col.name);
      console.log(`Server: Collection ${col.name} created successfully`);
      results[`${col.name}Created`] = true;
    } catch (error) {
      console.error(`Server: Error creating ${col.name} collection:`, error.message);
      // If collection already exists, this is fine
      if (error.code === 48) { // NamespaceExists error code
        console.log(`Server: Collection ${col.name} already exists`);
        results[`${col.name}Created`] = true;
      } else {
        results[`${col.name}Error`] = error.message;
      }
    }
  }
  
  try {
    // Users collection with admin user
    console.log('Server: Adding users to users collection');
    
    // Create default admin user
    const adminResult = await db.collection('users').insertOne({
      name: "Admin User",
      email: "admin@example.com",
      role: "admin",
      active: true,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    });
    console.log('Server: Admin user created with ID:', adminResult.insertedId);
    results.adminUser = adminResult.insertedId;
    
    // Create default regular user
    const userResult = await db.collection('users').insertOne({
      name: "Regular User",
      email: "user@example.com",
      role: "user",
      active: true,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    });
    console.log('Server: Regular user created with ID:', userResult.insertedId);
    results.regularUser = userResult.insertedId;
    
    console.log('Server: Users collection created with admin and regular users');
  } catch (error) {
    console.error('Server: Error creating users collection:', error);
    results.usersError = error.message;
  }
  
  try {
    // Files collection for storing file metadata
    console.log('Server: Adding sample data to files collection');
    const fileResult = await db.collection('files').insertOne({
      name: "sample-file.txt",
      type: "text/plain",
      size: 1024,
      createdAt: new Date().toISOString(),
      path: "/uploads/sample-file.txt"
    });
    console.log('Server: Files collection created with sample file');
    results.fileCollection = fileResult.insertedId;
  } catch (error) {
    console.error('Server: Error creating files collection:', error);
    results.filesError = error.message;
  }
  
  try {
    // Notes collection
    console.log('Server: Adding sample data to notes collection');
    const noteResult = await db.collection('notes').insertOne({
      title: "Sample Note",
      content: "This is a sample note for testing",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    console.log('Server: Notes collection created with sample note');
    results.noteCollection = noteResult.insertedId;
  } catch (error) {
    console.error('Server: Error creating notes collection:', error);
    results.notesError = error.message;
  }
  
  try {
    // SEO analysis collection
    console.log('Server: Adding sample data to seo_analysis collection');
    const seoResult = await db.collection('seo_analysis').insertOne({
      url: "https://example.com",
      score: 85,
      recommendations: ["Add meta description", "Optimize images"],
      createdAt: new Date().toISOString()
    });
    console.log('Server: SEO analysis collection created with sample analysis');
    results.seoCollection = seoResult.insertedId;
  } catch (error) {
    console.error('Server: Error creating SEO analysis collection:', error);
    results.seoError = error.message;
  }
  
  try {
    // Domains collection
    console.log('Server: Adding sample data to domains collection');
    
    // Create some sample domains
    const domainsResult = await db.collection('domains').insertMany([
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
    
    console.log(`Server: Domains collection created with ${domainsResult.insertedCount} sample domains`);
    results.domainsCollection = domainsResult.insertedCount;
  } catch (error) {
    console.error('Server: Error creating domains collection:', error);
    results.domainsError = error.message;
  }
  
  console.log('Server: Finished initializing collections with results:', results);
  return results;
}

// Make the MongoDB client and db available for other modules
export const getMongoClient = () => mongoClient;
export const getDb = () => db;
