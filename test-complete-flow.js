#!/usr/bin/env node

// Complete OAuth Flow Test
// This script tests the entire authentication flow and identifies issues

const http = require('http');
const { URL } = require('url');
const crypto = require('crypto');

// Configuration
const SERVER_BASE = 'http://127.0.0.1:5001';
const CLIENT_BASE = 'http://127.0.0.1:3000';

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
      timeout: 10000
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

// Test the complete authentication flow
async function testCompleteFlow() {
  console.log('🔐 Testing Complete OAuth Flow...');
  console.log('=' .repeat(60));
  
  // Step 1: Test Google OAuth initiation
  console.log('\n📍 Step 1: Testing Google OAuth initiation...');
  try {
    const response = await makeRequest(`${SERVER_BASE}/api/auth/google`);
    if (response.status === 302 && response.headers.location) {
      console.log('✅ Google OAuth redirect is working');
      console.log(`📍 Redirect URL: ${response.headers.location}`);
    } else {
      console.log(`❌ Google OAuth not redirecting properly (Status: ${response.status})`);
    }
  } catch (error) {
    console.log(`❌ Google OAuth error: ${error.message}`);
  }
  
  // Step 2: Test auth/user endpoint without token
  console.log('\n📍 Step 2: Testing auth/user without token...');
  try {
    const response = await makeRequest(`${SERVER_BASE}/api/auth/user`);
    console.log(`✅ Auth endpoint responds with status: ${response.status}`);
    if (response.parsed) {
      console.log(`📄 Response:`, response.parsed);
    }
  } catch (error) {
    console.log(`❌ Auth endpoint error: ${error.message}`);
  }
  
  // Step 3: Test auth/user endpoint with invalid token
  console.log('\n📍 Step 3: Testing auth/user with invalid token...');
  try {
    const response = await makeRequest(`${SERVER_BASE}/api/auth/user`, {
      headers: {
        'Authorization': 'Bearer invalid-token-123',
        'Content-Type': 'application/json'
      }
    });
    console.log(`✅ Auth endpoint with invalid token responds with status: ${response.status}`);
    if (response.parsed) {
      console.log(`📄 Response:`, response.parsed);
    }
  } catch (error) {
    console.log(`❌ Auth endpoint with invalid token error: ${error.message}`);
  }
  
  // Step 4: Test client callback handling
  console.log('\n📍 Step 4: Testing client callback page...');
  try {
    const response = await makeRequest(`${CLIENT_BASE}/auth/callback`);
    console.log(`✅ Client callback page responds with status: ${response.status}`);
    
    // Check if the page contains the expected JavaScript
    if (response.data.includes('localStorage') || response.data.includes('jwt_token')) {
      console.log('✅ Client callback page contains token handling logic');
    } else {
      console.log('⚠️  Client callback page may not have token handling logic');
    }
  } catch (error) {
    console.log(`❌ Client callback page error: ${error.message}`);
  }
  
  // Step 5: Test client main page
  console.log('\n📍 Step 5: Testing client main page...');
  try {
    const response = await makeRequest(CLIENT_BASE);
    console.log(`✅ Client main page responds with status: ${response.status}`);
    
    // Check if the page contains authentication logic
    if (response.data.includes('checkAuth') || response.data.includes('Login')) {
      console.log('✅ Client main page contains authentication logic');
    } else {
      console.log('⚠️  Client main page may not have authentication logic');
    }
  } catch (error) {
    console.log(`❌ Client main page error: ${error.message}`);
  }
  
  // Step 6: Test tasks endpoint without authentication
  console.log('\n📍 Step 6: Testing tasks endpoint without authentication...');
  try {
    const response = await makeRequest(`${SERVER_BASE}/api/tasks`);
    console.log(`✅ Tasks endpoint responds with status: ${response.status}`);
    if (response.parsed) {
      console.log(`📄 Response:`, response.parsed);
    }
  } catch (error) {
    console.log(`❌ Tasks endpoint error: ${error.message}`);
  }
}

// Test JWT token structure
function testJWTStructure() {
  console.log('\n🔍 Testing JWT Token Structure...');
  console.log('=' .repeat(60));
  
  // Create a sample JWT token structure
  const header = {
    "alg": "HS256",
    "typ": "JWT"
  };
  
  const payload = {
    "sub": "test-user-id",
    "email": "test@example.com",
    "iat": Math.floor(Date.now() / 1000),
    "exp": Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
  };
  
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', 'test-secret')
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');
  
  const testToken = `${encodedHeader}.${encodedPayload}.${signature}`;
  
  console.log('✅ Sample JWT token structure:');
  console.log(`📄 Header: ${JSON.stringify(header)}`);
  console.log(`📄 Payload: ${JSON.stringify(payload)}`);
  console.log(`📄 Full token: ${testToken.substring(0, 50)}...`);
  
  // Test token parsing
  try {
    const parts = testToken.split('.');
    const decodedPayload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    console.log('✅ Token parsing works correctly');
    console.log(`📄 Decoded payload:`, decodedPayload);
  } catch (error) {
    console.log(`❌ Token parsing failed: ${error.message}`);
  }
}

// Analyze potential issues
function analyzeIssues() {
  console.log('\n🔍 Potential Issues Analysis...');
  console.log('=' .repeat(60));
  
  console.log('\n🔍 Common JWT Authentication Issues:');
  console.log('1. ❓ JWT Secret Mismatch: Server and client using different secrets');
  console.log('2. ❓ Token Expiration: Tokens expiring too quickly');
  console.log('3. ❓ CORS Issues: Cross-origin requests being blocked');
  console.log('4. ❓ Token Storage: localStorage not persisting tokens');
  console.log('5. ❓ URL Parsing: Token not being extracted from callback URL');
  console.log('6. ❓ Authentication Middleware: JWT validation failing on server');
  console.log('7. ❓ Database Issues: User lookup failing after token validation');
  
  console.log('\n🔍 Debugging Steps:');
  console.log('1. 🔧 Check browser localStorage: localStorage.getItem("jwt_token")');
  console.log('2. 🔧 Check browser console for JavaScript errors');
  console.log('3. 🔧 Check server logs for authentication errors');
  console.log('4. 🔧 Verify Google OAuth configuration in .env file');
  console.log('5. 🔧 Test manual token creation and validation');
  console.log('6. 🔧 Check database connection and user table structure');
  
  console.log('\n🔍 Manual Testing Commands:');
  console.log('• Test Google OAuth: curl -v http://127.0.0.1:5001/api/auth/google');
  console.log('• Test auth endpoint: curl -v -H "Authorization: Bearer TOKEN" http://127.0.0.1:5001/api/auth/user');
  console.log('• Check client: open http://localhost:3000');
  console.log('• Check server logs: check the server terminal output');
}

// Main test runner
async function runCompleteTests() {
  console.log('🚀 Starting Complete Authentication Flow Tests...');
  console.log('=' .repeat(80));
  
  await testCompleteFlow();
  testJWTStructure();
  analyzeIssues();
  
  console.log('\n' + '='.repeat(80));
  console.log('🎯 SUMMARY: Complete authentication flow tested');
  console.log('📋 Next steps: Check browser console and server logs for specific errors');
  console.log('🔧 Use the debugging commands above to identify the exact issue');
  console.log('=' .repeat(80));
}

// Run the complete tests
runCompleteTests().catch(console.error);