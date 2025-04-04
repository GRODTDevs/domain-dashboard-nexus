
// Import collection initializers
import { initializeUsersCollection } from '../collections/users.mjs';
import { initializeDomainsCollection } from '../collections/domains.mjs';
import { initializeFilesCollection } from '../collections/files.mjs';
import { initializeNotesCollection } from '../collections/notes.mjs';
import { initializeSeoAnalysisCollection } from '../collections/seo-analysis.mjs';

// Initialize all required collections with baseline data
export async function createRequiredCollections(db) {
  console.log('Server: Creating required collections...');
  
  const results = {};
  const errors = [];
  
  try {
    console.log('Server: Initializing users collection');
    results.users = await initializeUsersCollection(db);
  } catch (error) {
    console.error('Server: Failed to initialize users collection:', error);
    errors.push({ collection: 'users', error: error.message });
  }
  
  try {
    console.log('Server: Initializing domains collection');
    results.domains = await initializeDomainsCollection(db);
  } catch (error) {
    console.error('Server: Failed to initialize domains collection:', error);
    errors.push({ collection: 'domains', error: error.message });
  }
  
  try {
    console.log('Server: Initializing files collection');
    results.files = await initializeFilesCollection(db);
  } catch (error) {
    console.error('Server: Failed to initialize files collection:', error);
    errors.push({ collection: 'files', error: error.message });
  }
  
  try {
    console.log('Server: Initializing notes collection');
    results.notes = await initializeNotesCollection(db);
  } catch (error) {
    console.error('Server: Failed to initialize notes collection:', error);
    errors.push({ collection: 'notes', error: error.message });
  }
  
  try {
    console.log('Server: Initializing SEO analysis collection');
    results.seoAnalysis = await initializeSeoAnalysisCollection(db);
  } catch (error) {
    console.error('Server: Failed to initialize SEO analysis collection:', error);
    errors.push({ collection: 'seoAnalysis', error: error.message });
  }
  
  console.log('Server: Required collections initialization complete with results:', results);
  
  if (errors.length > 0) {
    console.warn('Server: Some collections had initialization errors:', errors);
  }
  
  return {
    success: Object.keys(results).length > 0,
    results,
    errors: errors.length > 0 ? errors : null
  };
}
