#!/usr/bin/env node

/**
 * Cron script to copy repetitive tasks from previous day
 * Runs daily at 00:05 to copy incomplete tasks where is_repetitive=true
 */

const { Client } = require('pg');
require('dotenv').config({ path: '../server-new/.env' });

// Database configuration using DATABASE_URL
const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function copyRepetitiveTasks() {
  try {
    console.log(`[${new Date().toISOString()}] Starting repetitive task copy process...`);
    
    await client.connect();
    console.log('Connected to database');

    // Calculate yesterday's date range
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    
    const yesterdayEnd = new Date(yesterday);
    yesterdayEnd.setHours(23, 59, 59, 999);

    console.log(`Looking for tasks from ${yesterday.toISOString()} to ${yesterdayEnd.toISOString()}`);

    // Find incomplete repetitive tasks from previous day
    const findTasksQuery = `
      SELECT 
        id, title, due_date, priority, tags, user_id, position
      FROM tasks 
      WHERE 
        (is_repetitive = true 
        OR status != 'completed')
        AND created_at >= $1 
        AND created_at <= $2
      ORDER BY created_at ASC
    `;

    const tasksResult = await client.query(findTasksQuery, [yesterday, yesterdayEnd]);
    const tasksToRepeat = tasksResult.rows;

    console.log(`Found ${tasksToRepeat.length} repetitive tasks to copy`);

    if (tasksToRepeat.length === 0) {
      console.log('No repetitive tasks found to copy');
      return;
    }

    // Copy each task with new creation date
    let copiedCount = 0;
    const today = new Date();
    
    for (const task of tasksToRepeat) {
      try {
        // Adjust due date to today if it was set for yesterday
        let newDueDate = task.due_date;
        if (newDueDate) {
          const taskDueDate = new Date(newDueDate);
          const wasYesterday = taskDueDate.toDateString() === yesterday.toDateString();
          
          if (wasYesterday) {
            // Move due date to today
            newDueDate = new Date(today);
            newDueDate.setHours(taskDueDate.getHours(), taskDueDate.getMinutes(), taskDueDate.getSeconds());
          }
        }

        // Get the highest position for this user to append the new task
        const maxPositionResult = await client.query(
          'SELECT COALESCE(MAX(position), 0) as max_pos FROM tasks WHERE user_id = $1',
          [task.user_id]
        );
        const newPosition = maxPositionResult.rows[0].max_pos + 1;

        // Insert the copied task
        const insertQuery = `
          INSERT INTO tasks (
            title, due_date, priority, status, tags, 
            is_repetitive, position, user_id, created_at, updated_at
          ) VALUES (
            $1, $2, $3, 'not_started', $4, 
            true, $5, $6, $7, $7
          )
          RETURNING id, title
        `;

        const insertResult = await client.query(insertQuery, [
          task.title,
          newDueDate,
          task.priority,
          task.tags,
          newPosition,
          task.user_id,
          today
        ]);

        const newTask = insertResult.rows[0];
        console.log(`✓ Copied task: "${newTask.title}" (ID: ${newTask.id})`);
        copiedCount++;

      } catch (taskError) {
        console.error(`✗ Failed to copy task "${task.title}":`, taskError.message);
      }
    }

    console.log(`\n[${new Date().toISOString()}] Process completed successfully!`);
    console.log(`Total tasks copied: ${copiedCount}/${tasksToRepeat.length}`);

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in copyRepetitiveTasks:`, error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

// Run the script
if (require.main === module) {
  copyRepetitiveTasks()
    .then(() => {
      console.log('Script execution completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script execution failed:', error);
      process.exit(1);
    });
}

module.exports = { copyRepetitiveTasks };