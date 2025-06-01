// Debug script to check JWT token and authentication status
// Run this in the browser console at http://localhost:3000

console.log('=== JWT Token Debug ===');

// Check if JWT token exists in localStorage
const token = localStorage.getItem('jwt_token');
console.log('JWT Token in localStorage:', token ? 'EXISTS' : 'NOT FOUND');
if (token) {
  console.log('Token value:', token);
  
  // Try to decode JWT payload (without verification)
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('Token payload:', payload);
    console.log('Token expiry:', new Date(payload.exp * 1000));
    console.log('Is token expired?', Date.now() > payload.exp * 1000);
  } catch (e) {
    console.error('Failed to decode token:', e);
  }
}

// Check current URL for token parameter
const urlParams = new URLSearchParams(window.location.search);
const urlToken = urlParams.get('token');
console.log('Token in URL:', urlToken ? 'EXISTS' : 'NOT FOUND');
if (urlToken) {
  console.log('URL token value:', urlToken);
}

// Test authentication endpoint
console.log('Testing auth endpoint...');
fetch('http://127.0.0.1:5001/api/auth/user', {
  headers: {
    'Authorization': token ? `Bearer ${token}` : ''
  }
})
.then(response => {
  console.log('Auth response status:', response.status);
  return response.json();
})
.then(data => {
  console.log('Auth response data:', data);
})
.catch(error => {
  console.error('Auth request failed:', error);
});

// Check if we're on callback path
console.log('Current path:', window.location.pathname);
console.log('Is callback path?', window.location.pathname === '/auth/callback');

console.log('=== End Debug ===');