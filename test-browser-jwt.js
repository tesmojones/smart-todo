#!/usr/bin/env node

// Browser-side JWT Token Test Simulation
// This script simulates browser localStorage and tests the actual token flow

const http = require('http');
const { URL } = require('url');

// Mock localStorage for testing
class MockLocalStorage {
  constructor() {
    this.store = {};
  }
  
  getItem(key) {
    return this.store[key] || null;
  }
  
  setItem(key, value) {
    this.store[key] = value;
  }
  
  removeItem(key) {
    delete this.store[key];
  }
  
  clear() {
    this.store = {};
  }
  
  get length() {
    return Object.keys(this.store).length;
  }
}

// Mock window object
const mockWindow = {
  localStorage: new MockLocalStorage(),
  location: {
    pathname: '/',
    search: '',
    href: 'http://localhost:3000/'
  },
  history: {
    replaceState: (state, title, url) => {
      console.log(`📍 History replaceState called: ${url}`);
      mockWindow.location.href = url;
    }
  }
};

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

// Simulate the client-side token extraction logic
function simulateTokenExtraction(url) {
  console.log(`\n🔍 Simulating token extraction from URL: ${url}`);
  
  const urlObj = new URL(url);
  const token = urlObj.searchParams.get('token');
  
  if (token) {
    console.log(`✅ Token found in URL: ${token.substring(0, 20)}...`);
    
    // Simulate setToken function
    mockWindow.localStorage.setItem('jwt_token', token);
    console.log(`✅ Token stored in localStorage`);
    
    // Simulate URL cleanup
    if (urlObj.pathname === '/auth/callback') {
      mockWindow.history.replaceState({}, 'AI Todo', '/');
      console.log(`✅ URL cleaned up and redirected to main page`);
    }
    
    return token;
  } else {
    console.log(`❌ No token found in URL`);
    return null;
  }
}

// Simulate the checkAuth function
async function simulateCheckAuth() {
  console.log(`\n🔍 Simulating authentication check...`);
  
  const token = mockWindow.localStorage.getItem('jwt_token');
  
  if (!token) {
    console.log(`❌ No token in localStorage`);
    return false;
  }
  
  console.log(`✅ Token found in localStorage: ${token.substring(0, 20)}...`);
  
  try {
    const response = await makeRequest(`${SERVER_BASE}/api/auth/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status === 200 && response.parsed) {
      console.log(`✅ Authentication successful`);
      console.log(`✅ User data:`, response.parsed.user || response.parsed);
      return true;
    } else {
      console.log(`❌ Authentication failed (Status: ${response.status})`);
      console.log(`❌ Response:`, response.data);
      
      // Simulate removeToken on auth failure
      mockWindow.localStorage.removeItem('jwt_token');
      console.log(`🗑️  Invalid token removed from localStorage`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Authentication request failed: ${error.message}`);
    return false;
  }
}

// Test different scenarios
async function testScenario1_ValidTokenInCallback() {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📋 SCENARIO 1: Valid token in callback URL`);
  console.log(`${'='.repeat(60)}`);
  
  // Reset state
  mockWindow.localStorage.clear();
  
  // Simulate receiving a callback with a token
  const callbackUrl = `${CLIENT_BASE}/auth/callback?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0LXVzZXItaWQiLCJlbWFpbCI6InRlc3RAdGVzdC5jb20iLCJpYXQiOjE3MzM5NjI4MDAsImV4cCI6OTk5OTk5OTk5OX0.test-signature`;
  
  const token = simulateTokenExtraction(callbackUrl);
  
  if (token) {
    const authResult = await simulateCheckAuth();
    return authResult;
  }
  
  return false;
}

async function testScenario2_NoTokenInCallback() {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📋 SCENARIO 2: No token in callback URL`);
  console.log(`${'='.repeat(60)}`);
  
  // Reset state
  mockWindow.localStorage.clear();
  
  // Simulate callback without token
  const callbackUrl = `${CLIENT_BASE}/auth/callback`;
  
  const token = simulateTokenExtraction(callbackUrl);
  
  if (!token) {
    console.log(`✅ Correctly handled callback without token`);
    return true;
  }
  
  return false;
}

async function testScenario3_ExistingTokenInStorage() {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📋 SCENARIO 3: Existing token in localStorage`);
  console.log(`${'='.repeat(60)}`);
  
  // Reset state and add a token
  mockWindow.localStorage.clear();
  mockWindow.localStorage.setItem('jwt_token', 'existing-token-123');
  
  console.log(`✅ Simulated existing token in localStorage`);
  
  const authResult = await simulateCheckAuth();
  return authResult;
}

async function testScenario4_ExpiredToken() {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📋 SCENARIO 4: Expired token handling`);
  console.log(`${'='.repeat(60)}`);
  
  // Reset state
  mockWindow.localStorage.clear();
  
  // Create an expired token (exp in the past)
  const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0LXVzZXItaWQiLCJlbWFpbCI6InRlc3RAdGVzdC5jb20iLCJpYXQiOjE2MzM5NjI4MDAsImV4cCI6MTYzMzk2MjgwMX0.test-signature';
  
  mockWindow.localStorage.setItem('jwt_token', expiredToken);
  console.log(`✅ Simulated expired token in localStorage`);
  
  const authResult = await simulateCheckAuth();
  
  // Check if token was removed after failed auth
  const tokenAfterAuth = mockWindow.localStorage.getItem('jwt_token');
  if (!tokenAfterAuth) {
    console.log(`✅ Expired token was properly removed`);
    return true;
  } else {
    console.log(`❌ Expired token was not removed`);
    return false;
  }
}

// Main test runner
async function runBrowserTests() {
  console.log('🌐 Starting Browser-side JWT Token Tests...');
  console.log('=' .repeat(80));
  
  const results = {
    scenario1: await testScenario1_ValidTokenInCallback(),
    scenario2: await testScenario2_NoTokenInCallback(),
    scenario3: await testScenario3_ExistingTokenInStorage(),
    scenario4: await testScenario4_ExpiredToken()
  };
  
  console.log(`\n${'='.repeat(80)}`);
  console.log('📊 BROWSER TEST RESULTS SUMMARY:');
  console.log('=' .repeat(80));
  
  const scenarios = {
    scenario1: 'Valid token in callback URL',
    scenario2: 'No token in callback URL',
    scenario3: 'Existing token in localStorage',
    scenario4: 'Expired token handling'
  };
  
  Object.entries(results).forEach(([key, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} - ${scenarios[key]}`);
  });
  
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n🎯 Overall: ${passedTests}/${totalTests} scenarios passed`);
  
  console.log(`\n📋 CURRENT LOCALSTORAGE STATE:`);
  console.log(`Token: ${mockWindow.localStorage.getItem('jwt_token') || 'None'}`);
  
  if (passedTests < totalTests) {
    console.log(`\n⚠️  POTENTIAL ISSUES DETECTED:`);
    if (!results.scenario1) {
      console.log(`- Token extraction from callback URL may not be working`);
    }
    if (!results.scenario3) {
      console.log(`- Authentication with existing tokens may be failing`);
    }
    if (!results.scenario4) {
      console.log(`- Expired token cleanup may not be working`);
    }
  } else {
    console.log(`\n🎉 All browser-side JWT scenarios are working correctly!`);
  }
}

// Run the browser tests
runBrowserTests().catch(console.error);