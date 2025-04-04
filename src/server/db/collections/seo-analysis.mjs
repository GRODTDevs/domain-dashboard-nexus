
// Initialize the SEO analysis collection with sample data
export async function initializeSeoAnalysisCollection(db) {
  const results = {};
  console.log('Server: Adding sample data to seo_analysis collection');
  
  const seoResult = await db.collection('seo_analysis').insertOne({
    url: "https://example.com",
    score: 85,
    recommendations: ["Add meta description", "Optimize images"],
    createdAt: new Date().toISOString()
  });
  
  console.log('Server: SEO analysis collection created with sample analysis:', seoResult.insertedId);
  results.seoCollection = seoResult.insertedId;
  
  return results;
}
