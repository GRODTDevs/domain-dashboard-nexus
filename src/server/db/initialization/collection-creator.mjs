
// Create the initialization marker collection
export const createInitCollection = async (db) => {
  console.log('Server: Force creating database with initialization marker');
  
  // Set a timeout for the operation
  const insertPromise = db.collection('_dbinit').insertOne({ 
    initialized: true,
    timestamp: new Date().toISOString() 
  });
  
  // Create a timeout promise
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Timeout inserting initialization marker')), 3000);
  });
  
  // Race between the operation and the timeout
  await Promise.race([insertPromise, timeoutPromise]);
  console.log('Server: Database creation forced with _dbinit collection');
};

// Utility function for creating a collection with timeout
export const createCollectionWithTimeout = async (db, collName) => {
  console.log(`Server: Creating ${collName} collection`);
  
  // Set timeout for collection creation
  const createPromise = db.createCollection(collName).catch(() => {
    // Collection might already exist, which is fine
    console.log(`Server: Collection ${collName} already exists or couldn't be created`);
  });
  
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Timeout creating ${collName} collection`)), 2000);
  });
  
  // Race between the operation and the timeout
  await Promise.race([createPromise, timeoutPromise]);
  
  // Set timeout for insertion of marker document
  const insertPromise = db.collection(collName).insertOne({
    _id: `${collName}_creation_marker`,
    _creationMarker: true,
    collectionName: collName,
    createdAt: new Date().toISOString()
  });
  
  const insertTimeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Timeout inserting marker into ${collName}`)), 2000);
  });
  
  await Promise.race([insertPromise, insertTimeoutPromise]);
  
  return true;
};
