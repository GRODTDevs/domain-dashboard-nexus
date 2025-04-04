
// Initialize the notes collection with sample data
export async function initializeNotesCollection(db) {
  const results = {};
  console.log('Server: Adding sample data to notes collection');
  
  const noteResult = await db.collection('notes').insertOne({
    title: "Sample Note",
    content: "This is a sample note for testing",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  
  console.log('Server: Notes collection created with sample note:', noteResult.insertedId);
  results.noteCollection = noteResult.insertedId;
  
  return results;
}
