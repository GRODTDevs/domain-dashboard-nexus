
// Initialize the users collection with sample data
export async function initializeUsersCollection(db) {
  const results = {};
  console.log('Server: Adding users to users collection');
  
  try {
    // Check if users already exist
    const existingUsers = await db.collection('users').countDocuments();
    if (existingUsers > 0) {
      console.log(`Server: Users collection already has ${existingUsers} documents, skipping creation`);
      return { usersExist: true, count: existingUsers };
    }
    
    // Force create the collection to ensure it exists
    try {
      await db.createCollection('users');
      console.log('Server: Users collection created');
    } catch (error) {
      // Collection might already exist, which is fine
      console.log('Server: Users collection may already exist:', error.message);
    }
    
    // Create default admin user with more robust error handling
    try {
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
    } catch (adminError) {
      console.error('Server: Error creating admin user:', adminError);
      results.adminUserError = adminError.message;
    }
    
    // Create default regular user with separate try/catch
    try {
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
    } catch (userError) {
      console.error('Server: Error creating regular user:', userError);
      results.regularUserError = userError.message;
    }
    
    // Verify the users were actually created
    try {
      const createdUsers = await db.collection('users').countDocuments();
      console.log(`Server: Verified ${createdUsers} users exist in the collection`);
      results.verifiedCount = createdUsers;
    } catch (verifyError) {
      console.error('Server: Error verifying user count:', verifyError);
    }
    
    console.log('Server: Users collection creation completed with results:', results);
    
    return results;
  } catch (error) {
    console.error('Server: Error creating users collection:', error);
    throw error;
  }
}
