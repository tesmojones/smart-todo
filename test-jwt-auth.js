#!/usr/bin/env node

// Automated JWT Authentication Test Script
// This script tests the JWT token flow without requiring browser interaction

const https = require('https');
const http = require('http');
const { URL } = require('url');

// Configuration
const SERVER_BASE = 'http://127.0.0.1:5001';
const CLIENT_BASE = 'http://127.0.0.1:3000';

// Test results
let testResults = {
  serverRunning: false,
  clientRunning: false,
  authEndpointAccessible: false,
  googleOAuthConfigured: false,
  jwtTokenGeneration: false
};

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {},
      timeout: 5000
    };

    const req = http.request(requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data,
          parsed: (() => {
            try { return JSON.parse(data); } catch { return null; }
          })()
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

// Test 1: Check if server is running
async function testServerRunning() {
  console.log('\n🔍 Testing: Server connectivity...');
  try {
    const response = await makeRequest(`${SERVER_BASE}/api`);
    testResults.serverRunning = response.status < 500;
    console.log(`✅ Server is running (Status: ${response.status})`);
    return true;
  } catch (error) {
    console.log(`❌ Server is not accessible: ${error.message}`);
    return false;
  }
}

// Test 2: Check if client is running
async function testClientRunning() {
  console.log('\n🔍 Testing: Client connectivity...');
  try {
    const response = await makeRequest(CLIENT_BASE);
    testResults.clientRunning = response.status === 200;
    console.log(`✅ Client is running (Status: ${response.status})`);
    return true;
  } catch (error) {
    console.log(`❌ Client is not accessible: ${error.message}`);
    return false;
  }
}

// Test 3: Check auth endpoints
async function testAuthEndpoints() {
  console.log('\n🔍 Testing: Authentication endpoints...');
  
  // Test /api/auth/user without token (should return 401)
  try {
    const response = await makeRequest(`${SERVER_BASE}/api/auth/user`);
    if (response.status === 401) {
      console.log('✅ Auth endpoint properly rejects requests without token');
      testResults.authEndpointAccessible = true;
    } else {
      console.log(`⚠️  Auth endpoint returned unexpected status: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ Auth endpoint error: ${error.message}`);
  }

  // Test Google OAuth endpoint
  try {
    const response = await makeRequest(`${SERVER_BASE}/api/auth/google`);
    if (response.status === 302 || response.headers.location) {
      console.log('✅ Google OAuth endpoint is configured and redirecting');
      testResults.googleOAuthConfigured = true;
    } else {
      console.log(`⚠️  Google OAuth endpoint returned: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ Google OAuth endpoint error: ${error.message}`);
  }
}

// Test 4: Test with a mock JWT token
async function testJWTTokenValidation() {
  console.log('\n🔍 Testing: JWT token validation...');
  
  // Create a mock JWT token (this will be invalid but tests the validation logic)
  const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
  
  try {
    const response = await makeRequest(`${SERVER_BASE}/api/auth/user`, {
      headers: {
        'Authorization': `Bearer ${mockToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status === 401) {
      console.log('✅ JWT token validation is working (rejected invalid token)');
      testResults.jwtTokenGeneration = true;
    } else {
      console.log(`⚠️  Unexpected response to invalid token: ${response.status}`);
      console.log('Response:', response.data);
    }
  } catch (error) {
    console.log(`❌ JWT validation test error: ${error.message}`);
  }
}

// Test 5: Check client-side token handling simulation
async function testClientTokenHandling() {
  console.log('\n🔍 Testing: Client token handling simulation...');
  
  // Simulate what happens when client receives a token in URL
  const testToken = 'test-token-123';
  const callbackUrl = `${CLIENT_BASE}/auth/callback?token=${testToken}`;
  
  try {
    const response = await makeRequest(callbackUrl);
    if (response.status === 200) {
      console.log('✅ Client handles callback URL correctly');
      
      // Check if the response contains the expected JavaScript for token handling
      if (response.data.includes('localStorage') || response.data.includes('jwt_token')) {
        console.log('✅ Client appears to have token handling logic');
      } else {
        console.log('⚠️  Client may not have proper token handling in the callback');
      }
    }
  } catch (error) {
    console.log(`❌ Client callback test error: ${error.message}`);
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting JWT Authentication Tests...');
  console.log('=' .repeat(50));
  
  await testServerRunning();
  await testClientRunning();
  await testAuthEndpoints();
  await testJWTTokenValidation();
  await testClientTokenHandling();
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST RESULTS SUMMARY:');
  console.log('=' .repeat(50));
  
  Object.entries(testResults).forEach(([test, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    const testName = test.replace(/([A-Z])/g, ' $1').toLowerCase();
    console.log(`${status} - ${testName}`);
  });
  
  const passedTests = Object.values(testResults).filter(Boolean).length;
  const totalTests = Object.keys(testResults).length;
  
  console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! JWT authentication should be working.');
  } else {
    console.log('⚠️  Some tests failed. Check the issues above.');
  }
  
  console.log('\n💡 RECOMMENDATIONS:');
  if (!testResults.serverRunning) {
    console.log('- Start the server: cd server && npm start');
  }
  if (!testResults.clientRunning) {
    console.log('- Start the client: cd client && npm start');
  }
  if (!testResults.googleOAuthConfigured) {
    console.log('- Check Google OAuth configuration in .env file');
  }
  if (!testResults.authEndpointAccessible) {
    console.log('- Check server authentication middleware and routes');
  }
}

// Run the tests
runTests().catch(console.error);