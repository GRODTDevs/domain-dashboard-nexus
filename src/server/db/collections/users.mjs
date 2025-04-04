
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
    
    return results;
  } catch (error) {
    console.error('Server: Error creating users:', error);
    throw error;
  }
}
