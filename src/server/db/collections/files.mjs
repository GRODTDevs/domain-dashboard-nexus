
// Initialize the files collection with sample data
export async function initializeFilesCollection(db) {
  const results = {};
  console.log('Server: Adding sample data to files collection');
  
  const fileResult = await db.collection('files').insertOne({
    name: "sample-file.txt",
    type: "text/plain",
    size: 1024,
    createdAt: new Date().toISOString(),
    path: "/uploads/sample-file.txt"
  });
  
  console.log('Server: Files collection created with sample file:', fileResult.insertedId);
  results.fileCollection = fileResult.insertedId;
  
  return results;
}
