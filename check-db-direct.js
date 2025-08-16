const { Client } = require('pg');
require('dotenv').config({ path: './apps/backend/.env' });

async function checkNotificationTable() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_DATABASE || 'signalspot',
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    
    // Check if notification table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'notification'
      );
    `);
    
    console.log('Notification table exists:', tableCheck.rows[0].exists);
    
    if (tableCheck.rows[0].exists) {
      // Count notifications
      const countResult = await client.query('SELECT COUNT(*) as count FROM notification');
      console.log('Total notifications in database:', countResult.rows[0].count);
      
      // Get recent notifications
      const recentResult = await client.query(`
        SELECT id, type, title, status, created_at 
        FROM notification 
        ORDER BY created_at DESC 
        LIMIT 5
      `);
      
      if (recentResult.rows.length > 0) {
        console.log('\nRecent notifications:');
        recentResult.rows.forEach(notif => {
          console.log(`- ${notif.title} (${notif.type}) - ${notif.status} - ${new Date(notif.created_at).toLocaleString()}`);
        });
      } else {
        console.log('\nNo notifications found in database');
      }
      
      // Check table structure
      const columnsResult = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'notification'
        ORDER BY ordinal_position
      `);
      
      console.log('\nNotification table columns:');
      columnsResult.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
      
    } else {
      console.log('\n⚠️ Notification table does not exist!');
      console.log('Creating notification table...');
      
      // Try to create the table
      await client.query(`
        CREATE TABLE IF NOT EXISTS notification (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL,
          type VARCHAR(50) NOT NULL,
          title VARCHAR(255) NOT NULL,
          body TEXT NOT NULL,
          data JSONB,
          status VARCHAR(20) DEFAULT 'pending',
          priority VARCHAR(20) DEFAULT 'normal',
          image_url VARCHAR(500),
          action_url VARCHAR(500),
          deep_link_url VARCHAR(500),
          group_key VARCHAR(100),
          expires_at TIMESTAMP,
          scheduled_for TIMESTAMP,
          delivered_at TIMESTAMP,
          read_at TIMESTAMP,
          failure_reason TEXT,
          retry_count INTEGER DEFAULT 0,
          max_retries INTEGER DEFAULT 3,
          fcm_response JSONB,
          metadata JSONB,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE
        );
      `);
      
      console.log('✅ Notification table created successfully');
    }
    
  } catch (error) {
    console.error('Database error:', error.message);
    console.error('Full error:', error);
  } finally {
    await client.end();
    console.log('\nDatabase connection closed');
  }
}

checkNotificationTable();