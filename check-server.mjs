
import fetch from 'node-fetch';

async function checkServer() {
  console.log('Checking if server is running...');
  
  try {
    const response = await fetch('http://localhost:3001/api/health');
    
    if (response.ok) {
      const data = await response.json();
      console.log('Server is running! Response:', data);
      return true;
    } else {
      console.error('Server returned an error:', response.status);
      return false;
    }
  } catch (error) {
    console.error('Server is not running or not accessible:', error.message);
    return false;
  }
}

checkServer().then((isRunning) => {
  if (!isRunning) {
    console.log('Please make sure the server is running using "node server.mjs"');
    process.exit(1);
  }
});
