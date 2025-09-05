const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api/v1';

// Test configuration
const testConfig = {
  // You'll need to get a real JWT token from login
  authToken: 'YOUR_JWT_TOKEN_HERE',
  businessId: 1
};

// Helper function to make authenticated requests
const makeRequest = async (method, endpoint, data = null) => {
  try {
    const config = {
      method,
      url: `${API_BASE_URL}${endpoint}`,
      headers: {
        'Authorization': `Bearer ${testConfig.authToken}`,
        'Content-Type': 'application/json'
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`Error ${method} ${endpoint}:`, error.response?.data || error.message);
    return null;
  }
};

// Test functions
const testGetJobs = async () => {
  console.log('\n🧪 Testing GET /jobs...');
  const result = await makeRequest('GET', '/jobs');
  if (result) {
    console.log('✅ GET /jobs successful');
    console.log(`Found ${result.data.jobs.length} jobs`);
    console.log(`Pagination: ${result.data.pagination.total_items} total items`);
  }
};

const testGetJobStats = async () => {
  console.log('\n🧪 Testing GET /jobs/stats...');
  const result = await makeRequest('GET', '/jobs/stats');
  if (result) {
    console.log('✅ GET /jobs/stats successful');
    console.log('Stats:', result.data.stats);
  }
};

const testCreateJob = async () => {
  console.log('\n🧪 Testing POST /jobs...');
  const jobData = {
    customer_id: 1,
    title: 'Test Job',
    description: 'This is a test job created by the API test script',
    scheduled_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    total_cost: 150.00
  };
  
  const result = await makeRequest('POST', '/jobs', jobData);
  if (result) {
    console.log('✅ POST /jobs successful');
    console.log('Created job ID:', result.data.job.id);
    return result.data.job.id;
  }
  return null;
};

const testGetJob = async (jobId) => {
  console.log('\n🧪 Testing GET /jobs/:id...');
  const result = await makeRequest('GET', `/jobs/${jobId}`);
  if (result) {
    console.log('✅ GET /jobs/:id successful');
    console.log('Job title:', result.data.job.title);
  }
};

const testUpdateJob = async (jobId) => {
  console.log('\n🧪 Testing PUT /jobs/:id...');
  const updateData = {
    status: 'in_progress',
    description: 'Updated description from API test'
  };
  
  const result = await makeRequest('PUT', `/jobs/${jobId}`, updateData);
  if (result) {
    console.log('✅ PUT /jobs/:id successful');
    console.log('Updated status:', result.data.job.status);
  }
};

const testDeleteJob = async (jobId) => {
  console.log('\n🧪 Testing DELETE /jobs/:id...');
  const result = await makeRequest('DELETE', `/jobs/${jobId}`);
  if (result) {
    console.log('✅ DELETE /jobs/:id successful');
    console.log('Message:', result.message);
  }
};

// Main test function
const runTests = async () => {
  console.log('🚀 Starting Jobs API Tests...');
  console.log('Make sure the server is running on http://localhost:3000');
  console.log('And you have a valid JWT token in testConfig.authToken');
  
  if (testConfig.authToken === 'YOUR_JWT_TOKEN_HERE') {
    console.log('\n❌ Please update testConfig.authToken with a real JWT token');
    console.log('You can get one by logging in through the frontend or auth API');
    return;
  }
  
  try {
    // Test basic endpoints
    await testGetJobs();
    await testGetJobStats();
    
    // Test CRUD operations
    const jobId = await testCreateJob();
    if (jobId) {
      await testGetJob(jobId);
      await testUpdateJob(jobId);
      await testDeleteJob(jobId);
    }
    
    console.log('\n🎉 All tests completed!');
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
  }
};

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = {
  runTests,
  makeRequest,
  testConfig
};
