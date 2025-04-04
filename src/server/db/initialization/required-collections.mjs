
import { createCollectionWithTimeout } from './collection-creator.mjs';

// Create all required collections
export const createRequiredCollections = async (db) => {
  const collections = ['users', 'files', 'notes', 'seo_analysis', 'domains'];
  const results = {};
  
  // Create all collections in parallel rather than sequentially
  await Promise.all(collections.map(async (collName) => {
    try {
      await createCollectionWithTimeout(db, collName);
      results[`${collName}Created`] = true;
    } catch (error) {
      console.error(`Server: Error creating collection ${collName}:`, error);
      results[`${collName}Error`] = error.message;
      // Continue with other collections
    }
  }));
  
  return results;
};
