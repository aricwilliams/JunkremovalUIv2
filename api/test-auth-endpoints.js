const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1/auth';

// Test data
const testBusiness = {
  business_name: 'Test Junk Removal LLC',
  business_phone: '+1234567890',
  business_address: '123 Main St',
  business_city: 'Test City',
  business_state: 'CA',
  business_zip_code: '12345',
  owner_first_name: 'John',
  owner_last_name: 'Doe',
  owner_email: 'john.doe@testjunkremoval.com',
  owner_phone: '+1234567890',
  username: 'testjunkremoval',
  password: 'TestPass123!',
  license_number: 'LIC123456',
  insurance_number: 'INS123456',
  service_radius: 25,
  number_of_trucks: 2,
  years_in_business: 5
};

let authToken = '';

// Helper function to make API calls
const apiCall = async (method, endpoint, data = null, headers = {}) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      data: error.response?.data, 
      status: error.response?.status,
      message: error.message 
    };
  }
};

// Test functions
const testSignup = async () => {
  console.log('\n🧪 Testing Business Signup...');
  const result = await apiCall('POST', '/signup', testBusiness);
  
  if (result.success) {
    console.log('✅ Signup successful');
    console.log(`   Business ID: ${result.data.data.business.id}`);
    console.log(`   Business Name: ${result.data.data.business.business_name}`);
    console.log(`   Token: ${result.data.data.token.substring(0, 20)}...`);
    authToken = result.data.data.token;
    return true;
  } else {
    console.log('❌ Signup failed');
    console.log(`   Status: ${result.status}`);
    console.log(`   Error: ${JSON.stringify(result.data, null, 2)}`);
    return false;
  }
};

const testLogin = async () => {
  console.log('\n🧪 Testing Business Login...');
  const loginData = {
    username: testBusiness.username,
    password: testBusiness.password
  };
  
  const result = await apiCall('POST', '/login', loginData);
  
  if (result.success) {
    console.log('✅ Login successful');
    console.log(`   Business ID: ${result.data.data.business.id}`);
    console.log(`   Last Login: ${result.data.data.business.last_login}`);
    console.log(`   Token: ${result.data.data.token.substring(0, 20)}...`);
    authToken = result.data.data.token;
    return true;
  } else {
    console.log('❌ Login failed');
    console.log(`   Status: ${result.status}`);
    console.log(`   Error: ${JSON.stringify(result.data, null, 2)}`);
    return false;
  }
};

const testGetProfile = async () => {
  console.log('\n🧪 Testing Get Profile...');
  const result = await apiCall('GET', '/profile', null, {
    'Authorization': `Bearer ${authToken}`
  });
  
  if (result.success) {
    console.log('✅ Get profile successful');
    console.log(`   Business Name: ${result.data.data.business.business_name}`);
    console.log(`   Owner: ${result.data.data.business.owner_first_name} ${result.data.data.business.owner_last_name}`);
    console.log(`   Status: ${result.data.data.business.status}`);
    return true;
  } else {
    console.log('❌ Get profile failed');
    console.log(`   Status: ${result.status}`);
    console.log(`   Error: ${JSON.stringify(result.data, null, 2)}`);
    return false;
  }
};

const testUpdateProfile = async () => {
  console.log('\n🧪 Testing Update Profile...');
  const updateData = {
    business_name: 'Updated Test Junk Removal LLC',
    service_radius: 30,
    number_of_trucks: 3
  };
  
  const result = await apiCall('PUT', '/profile', updateData, {
    'Authorization': `Bearer ${authToken}`
  });
  
  if (result.success) {
    console.log('✅ Update profile successful');
    console.log(`   Updated Business Name: ${result.data.data.business.business_name}`);
    console.log(`   Updated Service Radius: ${result.data.data.business.service_radius}`);
    console.log(`   Updated Trucks: ${result.data.data.business.number_of_trucks}`);
    return true;
  } else {
    console.log('❌ Update profile failed');
    console.log(`   Status: ${result.status}`);
    console.log(`   Error: ${JSON.stringify(result.data, null, 2)}`);
    return false;
  }
};

const testInvalidLogin = async () => {
  console.log('\n🧪 Testing Invalid Login...');
  const invalidLoginData = {
    username: 'nonexistent',
    password: 'wrongpassword'
  };
  
  const result = await apiCall('POST', '/login', invalidLoginData);
  
  if (!result.success && result.status === 401) {
    console.log('✅ Invalid login correctly rejected');
    console.log(`   Error: ${result.data.error}`);
    return true;
  } else {
    console.log('❌ Invalid login test failed');
    console.log(`   Status: ${result.status}`);
    console.log(`   Response: ${JSON.stringify(result.data, null, 2)}`);
    return false;
  }
};

const testUnauthorizedAccess = async () => {
  console.log('\n🧪 Testing Unauthorized Access...');
  const result = await apiCall('GET', '/profile');
  
  if (!result.success && result.status === 401) {
    console.log('✅ Unauthorized access correctly rejected');
    console.log(`   Error: ${result.data.error}`);
    return true;
  } else {
    console.log('❌ Unauthorized access test failed');
    console.log(`   Status: ${result.status}`);
    console.log(`   Response: ${JSON.stringify(result.data, null, 2)}`);
    return false;
  }
};

// Main test runner
const runTests = async () => {
  console.log('🚀 Starting API Tests...');
  console.log(`📍 Base URL: ${BASE_URL}`);
  
  const tests = [
    { name: 'Signup', fn: testSignup },
    { name: 'Login', fn: testLogin },
    { name: 'Get Profile', fn: testGetProfile },
    { name: 'Update Profile', fn: testUpdateProfile },
    { name: 'Invalid Login', fn: testInvalidLogin },
    { name: 'Unauthorized Access', fn: testUnauthorizedAccess }
  ];
  
  let passed = 0;
  let total = tests.length;
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) passed++;
    } catch (error) {
      console.log(`❌ ${test.name} test crashed: ${error.message}`);
    }
  }
  
  console.log('\n📊 Test Results:');
  console.log(`   Passed: ${passed}/${total}`);
  console.log(`   Failed: ${total - passed}/${total}`);
  
  if (passed === total) {
    console.log('🎉 All tests passed!');
  } else {
    console.log('⚠️  Some tests failed. Check the output above.');
  }
};

// Check if server is running
const checkServer = async () => {
  try {
    await axios.get('http://localhost:3000/health');
    return true;
  } catch (error) {
    console.log('❌ Server is not running on port 3000');
    console.log('   Please start the server with: npm start');
    return false;
  }
};

// Run tests
const main = async () => {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await runTests();
  }
  process.exit(0);
};

main();
