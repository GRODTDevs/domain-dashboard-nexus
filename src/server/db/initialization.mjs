
import { getDb } from './connection.mjs';

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
    
    // Get database reference from connection module
    const db = getDb();
    if (!db) {
      return {
        status: 'error',
        message: 'Database connection not established',
        statusCode: 500
      };
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

// Initialize collection helper functions
import { initializeUsersCollection } from './collections/users.mjs';
import { initializeFilesCollection } from './collections/files.mjs';
import { initializeNotesCollection } from './collections/notes.mjs';
import { initializeSeoAnalysisCollection } from './collections/seo-analysis.mjs';
import { initializeDomainsCollection } from './collections/domains.mjs';

// Helper function to initialize collections
async function initializeCollections() {
  console.log('Server: Starting collection initialization');
  const results = {};
  const db = getDb();
  
  // Create collections one by one with verification
  const collectionsToCreate = [
    { name: 'users', sampleDocs: [] },
    { name: 'files', sampleDocs: [] },
    { name: 'notes', sampleDocs: [] },
    { name: 'seo_analysis', sampleDocs: [] },
    { name: 'domains', sampleDocs: [] }
  ];
  
  // Clear out any existing collections to avoid conflicts
  for (const col of collectionsToCreate) {
    try {
      console.log(`Server: Force dropping ${col.name} collection if it exists`);
      await db.collection(col.name).drop().catch(() => {
        console.log(`Server: Collection ${col.name} did not exist or couldn't be dropped`);
      });
    } catch (error) {
      console.log(`Server: Error dropping collection ${col.name}:`, error.message);
      // Continue anyway - dropping is just to ensure a clean slate
    }
  }
  
  // Now create each collection with a creation document
  for (const col of collectionsToCreate) {
    try {
      console.log(`Server: Force creating ${col.name} collection with creation document`);
      // Insert a creation document to force collection creation
      const creationResult = await db.collection(col.name).insertOne({
        _id: `${col.name}_collection_creation`,
        _creationMarker: true,
        collectionName: col.name,
        createdAt: new Date().toISOString()
      });
      console.log(`Server: ${col.name} collection created successfully with creation document ID:`, creationResult.insertedId);
      results[`${col.name}Created`] = true;
      
      // Immediately verify the collection was created
      const collExists = await db.listCollections({ name: col.name }).hasNext();
      console.log(`Server: Verified ${col.name} collection exists: ${collExists}`);
      
      if (!collExists) {
        console.error(`Server: Failed to create ${col.name} collection despite no error`);
        results[`${col.name}Error`] = "Collection not created despite successful document insertion";
      }
    } catch (error) {
      console.error(`Server: Error creating ${col.name} collection:`, error);
      
      // If collection already exists, this is fine
      if (error.code === 48) { // NamespaceExists error code
        console.log(`Server: Collection ${col.name} already exists`);
        results[`${col.name}Created`] = true;
      } else {
        results[`${col.name}Error`] = error.message;
      }
    }
  }
  
  // Initialize each collection with sample data
  try {
    const usersResult = await initializeUsersCollection(db);
    Object.assign(results, usersResult);
  } catch (error) {
    console.error('Server: Error initializing users collection:', error);
    results.usersError = error.message;
  }
  
  try {
    const filesResult = await initializeFilesCollection(db);
    Object.assign(results, filesResult);
  } catch (error) {
    console.error('Server: Error initializing files collection:', error);
    results.filesError = error.message;
  }
  
  try {
    const notesResult = await initializeNotesCollection(db);
    Object.assign(results, notesResult);
  } catch (error) {
    console.error('Server: Error initializing notes collection:', error);
    results.notesError = error.message;
  }
  
  try {
    const seoResult = await initializeSeoAnalysisCollection(db);
    Object.assign(results, seoResult);
  } catch (error) {
    console.error('Server: Error initializing SEO analysis collection:', error);
    results.seoError = error.message;
  }
  
  try {
    const domainsResult = await initializeDomainsCollection(db);
    Object.assign(results, domainsResult);
  } catch (error) {
    console.error('Server: Error initializing domains collection:', error);
    results.domainsError = error.message;
  }
  
  // Print a final verification of which collections exist
  try {
    const finalCollections = await db.listCollections().toArray();
    const finalCollectionNames = finalCollections.map(c => c.name);
    console.log('Server: Final list of all collections after initialization:', finalCollectionNames);
  } catch (error) {
    console.error('Server: Error listing collections after initialization:', error);
  }
  
  console.log('Server: Finished initializing collections with results:', results);
  return results;
}
