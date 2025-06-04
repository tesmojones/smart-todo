#!/usr/bin/env node

/**
 * Test script for repetitive task copying functionality
 * This script helps verify the copy logic without actually copying tasks
 */

const { Client } = require('pg');
require('dotenv').config({ path: './.env' });

// Database configuration using DATABASE_URL
const client = new Client({
  connectionString: process.env.DATABASE_URL
});


async function testCopyRepetitiveTasks() {
  try {
    console.log('🧪 Testing repetitive task copy functionality...');
    console.log('=' .repeat(60));
    
    await client.connect();
    console.log('✓ Connected to database successfully');

    // Test database connection and schema
    console.log('📋 Checking database schema...');
    const schemaQuery = `
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'tasks' 
      ORDER BY ordinal_position
    `;
    
    const schemaResult = await client.query(schemaQuery);
    console.log('✓ Tasks table schema:');
    schemaResult.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(required)' : '(optional)'}`);
    });
    console.log('');

    // Check for required columns
    const requiredColumns = ['id', 'title', 'status', 'is_repetitive', 'created_at', 'user_id'];
    const existingColumns = schemaResult.rows.map(row => row.column_name);
    const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));
    
    if (missingColumns.length > 0) {
      console.log('❌ Missing required columns:', missingColumns.join(', '));
      return;
    }
    console.log('✓ All required columns present');
    console.log('');

    // Calculate yesterday's date range
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    
    const yesterdayEnd = new Date(yesterday);
    yesterdayEnd.setHours(23, 59, 59, 999);

    console.log('📅 Date range analysis:');
    console.log(`  Yesterday start: ${yesterday.toISOString()}`);
    console.log(`  Yesterday end: ${yesterdayEnd.toISOString()}`);
    console.log('');

    // Count total tasks
    const totalTasksResult = await client.query('SELECT COUNT(*) as count FROM tasks');
    console.log(`📊 Total tasks in database: ${totalTasksResult.rows[0].count}`);

    // Count repetitive tasks
    const repetitiveTasksResult = await client.query(
      'SELECT COUNT(*) as count FROM tasks WHERE is_repetitive = true'
    );
    console.log(`🔄 Total repetitive tasks: ${repetitiveTasksResult.rows[0].count}`);

    // Count tasks by status
    const statusCountResult = await client.query(`
      SELECT status, COUNT(*) as count 
      FROM tasks 
      GROUP BY status 
      ORDER BY status
    `);
    console.log('📈 Tasks by status:');
    statusCountResult.rows.forEach(row => {
      console.log(`  - ${row.status}: ${row.count}`);
    });
    console.log('');

    // Find tasks that would be copied (DRY RUN)
    console.log('🔍 Analyzing tasks that would be copied...');
    const findTasksQuery = `
      SELECT 
        id, title, due_date, priority, status, tags, user_id, 
        created_at, is_repetitive
      FROM tasks 
      WHERE 
        is_repetitive = true 
        AND status != 'completed'
        AND created_at >= $1 
        AND created_at <= $2
      ORDER BY created_at ASC
    `;

    const tasksResult = await client.query(findTasksQuery, [yesterday, yesterdayEnd]);
    const tasksToRepeat = tasksResult.rows;

    console.log(`📋 Found ${tasksToRepeat.length} tasks that would be copied:`);
    
    if (tasksToRepeat.length === 0) {
      console.log('  ℹ️  No repetitive incomplete tasks from yesterday');
      console.log('');
      
      // Show some example repetitive tasks for reference
      const exampleTasksResult = await client.query(`
        SELECT id, title, status, created_at, is_repetitive
        FROM tasks 
        WHERE is_repetitive = true
        ORDER BY created_at DESC
        LIMIT 5
      `);
      
      if (exampleTasksResult.rows.length > 0) {
        console.log('📝 Recent repetitive tasks (for reference):');
        exampleTasksResult.rows.forEach((task, index) => {
          console.log(`  ${index + 1}. "${task.title}" (${task.status}) - ${task.created_at.toDateString()}`);
        });
      }
    } else {
      tasksToRepeat.forEach((task, index) => {
        const dueInfo = task.due_date ? ` | Due: ${task.due_date.toLocaleString()}` : '';
        console.log(`  ${index + 1}. "${task.title}" (${task.status})${dueInfo}`);
        console.log(`     Created: ${task.created_at.toLocaleString()} | User: ${task.user_id}`);
        if (task.tags && task.tags.length > 0) {
          console.log(`     Tags: ${task.tags.join(', ')}`);
        }
        console.log('');
      });
    }

    // Test user analysis
    console.log('👥 User analysis:');
    const userTasksResult = await client.query(`
      SELECT 
        user_id,
        COUNT(*) as total_tasks,
        COUNT(CASE WHEN is_repetitive = true THEN 1 END) as repetitive_tasks,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks
      FROM tasks 
      GROUP BY user_id
      ORDER BY total_tasks DESC
    `);
    
    userTasksResult.rows.forEach(user => {
      console.log(`  User ${user.user_id}:`);
      console.log(`    - Total tasks: ${user.total_tasks}`);
      console.log(`    - Repetitive tasks: ${user.repetitive_tasks}`);
      console.log(`    - Completed tasks: ${user.completed_tasks}`);
      console.log('');
    });

    // Simulate the copy process
    if (tasksToRepeat.length > 0) {
      console.log('🎯 Simulation of copy process:');
      const today = new Date();
      
      for (const task of tasksToRepeat) {
        let newDueDate = task.due_date;
        if (newDueDate) {
          const taskDueDate = new Date(newDueDate);
          const wasYesterday = taskDueDate.toDateString() === yesterday.toDateString();
          
          if (wasYesterday) {
            newDueDate = new Date(today);
            newDueDate.setHours(taskDueDate.getHours(), taskDueDate.getMinutes());
            console.log(`  ✓ Would copy: "${task.title}"`);
            console.log(`    - Due date adjusted: ${taskDueDate.toLocaleString()} → ${newDueDate.toLocaleString()}`);
          } else {
            console.log(`  ✓ Would copy: "${task.title}"`);
            console.log(`    - Due date unchanged: ${newDueDate.toLocaleString()}`);
          }
        } else {
          console.log(`  ✓ Would copy: "${task.title}" (no due date)`);
        }
      }
    }

    console.log('');
    console.log('=' .repeat(60));
    console.log('✅ Test completed successfully!');
    console.log('');
    console.log('Next steps:');
    console.log('1. If everything looks good, run: ./setup-cron.sh');
    console.log('2. Or test the actual copy: npm run copy-tasks');
    console.log('3. Monitor logs: tail -f logs/copy-tasks.log');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('');
    console.error('Common issues:');
    console.error('- Database connection: Check .env file and PostgreSQL service');
    console.error('- Missing columns: Run database migrations');
    console.error('- Permission denied: Check database user permissions');
    console.error('');
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run the test
if (require.main === module) {
  testCopyRepetitiveTasks()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('Test execution failed:', error);
      process.exit(1);
    });
}

module.exports = { testCopyRepetitiveTasks };