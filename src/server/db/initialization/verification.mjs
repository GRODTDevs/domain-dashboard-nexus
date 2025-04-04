
// Verify the initialization was successful
export const verifyInitialization = async (db) => {
  try {
    const listPromise = db.listCollections().toArray();
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout listing collections')), 3000);
    });
    
    const finalCollections = await Promise.race([listPromise, timeoutPromise]);
    const finalCollectionNames = finalCollections.map(c => c.name);
    console.log('Server: Final list of collections after initialization:', finalCollectionNames);
    
    // Consider initialization successful if we have at least created the _dbinit collection
    const success = finalCollectionNames.includes('_dbinit');
    
    return {
      success,
      collections: finalCollectionNames
    };
  } catch (error) {
    console.error('Server: Error listing collections after initialization:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
