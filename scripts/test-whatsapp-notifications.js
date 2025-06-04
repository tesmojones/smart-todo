#!/usr/bin/env node

/**
 * Test script for WhatsApp daily notifications
 * This script helps test the notification functionality before setting up the cron job
 */

const { Client } = require('pg');
const { sendWhatsAppMessage, createTaskMessage } = require('./whatsapp-daily-notifications');
require('dotenv').config({ path: '../server-new/.env' });

// Database configuration
const client = new Client({
  connectionString: process.env.DATABASE_URL
});

/**
 * Test database connection and schema
 */
async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...');
  
  try {
    await client.connect();
    console.log('✅ Database connection successful');
    
    // Test tasks table schema
    const schemaQuery = `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'tasks' 
      ORDER BY ordinal_position
    `;
    
    const schemaResult = await client.query(schemaQuery);
    console.log('📋 Tasks table schema:');
    schemaResult.rows.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(required)' : '(optional)'}`);
    });
    
    // Test users table schema
    const userSchemaQuery = `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `;
    
    const userSchemaResult = await client.query(userSchemaQuery);
    console.log('\n👥 Users table schema:');
    userSchemaResult.rows.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(required)' : '(optional)'}`);
    });
    
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

/**
 * Test WAHA API configuration
 */
async function testWAHAConfiguration() {
  console.log('\n🔍 Testing WAHA API configuration...');
  
  const wahaBaseUrl = process.env.WAHA_BASE_URL || 'http://localhost:3001';
  const wahaSession = process.env.WAHA_SESSION || 'default';
  const wahaApiKey = process.env.WAHA_API_KEY || '';
  
  console.log(`📡 WAHA Base URL: ${wahaBaseUrl}`);
  console.log(`📱 WAHA Session: ${wahaSession}`);
  console.log(`🔑 WAHA API Key: ${wahaApiKey ? '***configured***' : 'not configured'}`);
  
  // Test WAHA API availability (basic ping)
  return new Promise((resolve) => {
    const https = require('https');
    const http = require('http');
    
    try {
      const url = new URL('/api/sessions', wahaBaseUrl);
      const protocol = url.protocol === 'https:' ? https : http;
      
      const req = protocol.get({
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname,
        timeout: 5000
      }, (res) => {
        console.log(`✅ WAHA API is reachable (Status: ${res.statusCode})`);
        resolve(true);
      });
      
      req.on('error', (error) => {
        console.error(`❌ WAHA API is not reachable: ${error.message}`);
        console.log('💡 Make sure WAHA is running on the configured URL');
        resolve(false);
      });
      
      req.on('timeout', () => {
        console.error('❌ WAHA API request timed out');
        req.destroy();
        resolve(false);
      });
      
    } catch (error) {
      console.error(`❌ Invalid WAHA URL: ${error.message}`);
      resolve(false);
    }
  });
}

/**
 * Test message formatting
 */
function testMessageFormatting() {
  console.log('\n🔍 Testing message formatting...');
  
  const testTasks = [
    {
      id: '1',
      title: 'Complete project proposal',
      priority: 'high',
      status: 'in_progress',
      tags: ['work', 'urgent'],
      dueDate: new Date()
    },
    {
      id: '2',
      title: 'Buy groceries',
      priority: 'medium',
      status: 'not_started',
      tags: ['personal', 'shopping'],
      dueDate: new Date()
    },
    {
      id: '3',
      title: 'Call dentist for appointment',
      priority: 'low',
      status: 'not_started',
      tags: ['health'],
      dueDate: new Date()
    }
  ];
  
  const message = createTaskMessage('John Doe', testTasks);
  
  console.log('📱 Sample WhatsApp message:');
  console.log('━'.repeat(50));
  console.log(message);
  console.log('━'.repeat(50));
  
  // Test empty tasks
  const emptyMessage = createTaskMessage('Jane Smith', []);
  console.log('\n📱 Sample message for user with no due tasks:');
  console.log('━'.repeat(50));
  console.log(emptyMessage);
  console.log('━'.repeat(50));
  
  return true;
}

/**
 * Test querying tasks due today
 */
async function testTaskQuery() {
  console.log('\n🔍 Testing task query for today...');
  
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);
    
    console.log(`📅 Querying tasks due today: ${today.toISOString()} to ${todayEnd.toISOString()}`);
    
    const query = `
      SELECT 
        u.id as user_id,
        u.name as user_name,
        u.email as user_email,
        t.id as task_id,
        t.title,
        t.priority,
        t.status,
        t.tags,
        t.due_date
      FROM users u
      LEFT JOIN tasks t ON u.id = t.user_id
      WHERE 
        t.due_date >= $1 
        AND t.due_date <= $2
        AND t.status != 'completed'
      ORDER BY u.id, t.priority DESC, t.created_at ASC
    `;
    
    const result = await client.query(query, [today, todayEnd]);
    
    console.log(`📋 Found ${result.rows.length} tasks due today`);
    
    if (result.rows.length > 0) {
      console.log('\n📝 Sample tasks:');
      result.rows.slice(0, 5).forEach((row, index) => {
        console.log(`   ${index + 1}. ${row.title} (${row.user_name}) - ${row.priority} priority`);
      });
      
      if (result.rows.length > 5) {
        console.log(`   ... and ${result.rows.length - 5} more tasks`);
      }
    } else {
      console.log('ℹ️  No tasks due today found');
      
      // Check if there are any tasks at all
      const totalTasksResult = await client.query('SELECT COUNT(*) as count FROM tasks');
      const totalTasks = totalTasksResult.rows[0].count;
      console.log(`📊 Total tasks in database: ${totalTasks}`);
      
      if (totalTasks > 0) {
        // Show some sample tasks with due dates
        const sampleTasksResult = await client.query(`
          SELECT title, due_date, status, priority 
          FROM tasks 
          WHERE due_date IS NOT NULL 
          ORDER BY due_date DESC 
          LIMIT 5
        `);
        
        if (sampleTasksResult.rows.length > 0) {
          console.log('\n📝 Sample tasks with due dates:');
          sampleTasksResult.rows.forEach((row, index) => {
            const dueDate = new Date(row.due_date).toLocaleDateString();
            console.log(`   ${index + 1}. ${row.title} - Due: ${dueDate} (${row.status})`);
          });
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Task query failed:', error.message);
    return false;
  }
}

/**
 * Test WhatsApp message sending (optional)
 */
async function testWhatsAppSending() {
  console.log('\n🔍 Testing WhatsApp message sending...');
  
  const testPhoneNumber = process.env.TEST_WHATSAPP_NUMBER;
  
  if (!testPhoneNumber) {
    console.log('⚠️  No test phone number configured (TEST_WHATSAPP_NUMBER env var)');
    console.log('💡 Set TEST_WHATSAPP_NUMBER=+1234567890 to test actual message sending');
    return true;
  }
  
  console.log(`📱 Sending test message to: ${testPhoneNumber}`);
  
  const testMessage = `🧪 *WhatsApp Notification Test*\n\nThis is a test message from AI Todo.\n\nTime: ${new Date().toLocaleString()}\n\n_If you received this, the integration is working!_ ✅`;
  
  try {
    const success = await sendWhatsAppMessage(testPhoneNumber, testMessage);
    
    if (success) {
      console.log('✅ Test message sent successfully!');
      return true;
    } else {
      console.log('❌ Test message failed to send');
      return false;
    }
  } catch (error) {
    console.error('❌ Error sending test message:', error.message);
    return false;
  }
}

/**
 * Main test function
 */
async function runTests() {
  console.log('🧪 WhatsApp Daily Notifications - Test Suite');
  console.log('='.repeat(50));
  
  const tests = [
    { name: 'Database Connection', fn: testDatabaseConnection },
    { name: 'WAHA Configuration', fn: testWAHAConfiguration },
    { name: 'Message Formatting', fn: testMessageFormatting },
    { name: 'Task Query', fn: testTaskQuery },
    { name: 'WhatsApp Sending', fn: testWhatsAppSending }
  ];
  
  const results = [];
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      results.push({ name: test.name, success: result });
    } catch (error) {
      console.error(`❌ Test '${test.name}' threw an error:`, error.message);
      results.push({ name: test.name, success: false, error: error.message });
    }
  }
  
  // Summary
  console.log('\n📊 Test Results Summary:');
  console.log('='.repeat(30));
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.name}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  const passedTests = results.filter(r => r.success).length;
  const totalTests = results.length;
  
  console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed! The WhatsApp notification system is ready.');
    console.log('\n📋 Next steps:');
    console.log('   1. Configure WhatsApp numbers in WHATSAPP_NUMBERS object');
    console.log('   2. Run: ./setup-whatsapp-cron.sh');
    console.log('   3. Monitor logs: tail -f logs/whatsapp-notifications.log');
  } else {
    console.log('\n⚠️  Some tests failed. Please fix the issues before setting up the cron job.');
  }
  
  return passedTests === totalTests;
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('❌ Test suite failed:', error);
      process.exit(1);
    })
    .finally(async () => {
      try {
        await client.end();
      } catch (error) {
        // Ignore connection close errors
      }
    });
}

module.exports = { runTests };