
// Initialize the users collection with sample data
export async function initializeUsersCollection(db) {
  console.log('Server: Adding users to users collection');
  
  try {
    // Check if users already exist
    const existingUsers = await db.collection('users').countDocuments();
    if (existingUsers > 0) {
      console.log(`Server: Users collection already has ${existingUsers} documents, skipping creation`);
      return { usersExist: true, count: existingUsers };
    }
    
    // Create the collection explicitly
    try {
      await db.createCollection('users');
      console.log('Server: Users collection created successfully');
    } catch (error) {
      // Collection might already exist, which is fine
      console.log('Server: Users collection may already exist:', error.message);
    }
    
    // Create users
    const users = [
      {
        name: "Admin User",
        email: "admin@example.com",
        role: "admin",
        active: true,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      },
      {
        name: "Regular User",
        email: "user@example.com",
        role: "user",
        active: true,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      }
    ];
    
    // Attempt direct inserts for maximum reliability
    try {
      console.log('Server: Inserting admin user directly');
      await db.collection('users').insertOne(users[0]);
      console.log('Server: Admin user created successfully');
      
      console.log('Server: Inserting regular user directly');
      await db.collection('users').insertOne(users[1]);
      console.log('Server: Regular user created successfully');
      
      // Verify users were created
      const createdUsers = await db.collection('users').countDocuments();
      console.log(`Server: Verified ${createdUsers} users exist in the collection`);
      
      return {
        usersCreated: true,
        count: createdUsers,
        message: 'Created users successfully'
      };
    } catch (error) {
      console.error('Server: Error creating users:', error);
      return {
        usersCreated: false,
        error: error.message,
        message: 'Failed to create users, but continuing anyway'
      };
    }
  } catch (error) {
    console.error('Server: Error in user collection initialization:', error);
    // Return partial success to prevent blocking app initialization
    return {
      usersCreated: false,
      error: error.message,
      message: 'User initialization error but continuing anyway'
    };
  }
}
