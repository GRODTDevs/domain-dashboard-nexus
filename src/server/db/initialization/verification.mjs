
// Verify database initialization
export async function verifyInitialization(db) {
  console.log('Server: Verifying database initialization...');
  
  try {
    // Check that required collections exist
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(coll => coll.name);
    
    console.log('Server: Found collections:', collectionNames);
    
    // Define required collections
    const requiredCollections = ['users', 'domains', 'files', 'notes', 'seoAnalysis'];
    const missingCollections = requiredCollections.filter(name => !collectionNames.includes(name));
    
    // Check if users exist in the users collection (most critical)
    let usersExist = false;
    if (collectionNames.includes('users')) {
      const userCount = await db.collection('users').countDocuments();
      usersExist = userCount > 0;
      console.log(`Server: Users collection contains ${userCount} documents`);
    }
    
    // Return verification results
    const success = missingCollections.length === 0 && usersExist;
    
    console.log('Server: Verification complete, success:', success);
    
    return {
      success,
      collections: collectionNames,
      missingCollections: missingCollections.length > 0 ? missingCollections : null,
      usersExist,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Server: Verification error:', error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}
