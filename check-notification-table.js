const { MikroORM } = require('@mikro-orm/postgresql');
const config = require('./apps/backend/mikro-orm.config').default;

async function checkNotificationTable() {
  let orm;
  try {
    console.log('Connecting to database...');
    
    // Initialize MikroORM
    orm = await MikroORM.init(config);
    
    // Check if notification table exists
    const result = await orm.em.getConnection().execute(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'notification'
      );
    `);
    
    console.log('Notification table exists:', result[0].exists);
    
    if (result[0].exists) {
      // Count notifications
      const countResult = await orm.em.getConnection().execute(`
        SELECT COUNT(*) as count FROM notification;
      `);
      console.log('Total notifications in database:', countResult[0].count);
      
      // Get recent notifications
      const recentResult = await orm.em.getConnection().execute(`
        SELECT id, type, title, status, created_at 
        FROM notification 
        ORDER BY created_at DESC 
        LIMIT 5;
      `);
      
      if (recentResult.length > 0) {
        console.log('\nRecent notifications:');
        recentResult.forEach(notif => {
          console.log(`- ${notif.title} (${notif.type}) - ${notif.status} - ${new Date(notif.created_at).toLocaleString()}`);
        });
      } else {
        console.log('\nNo notifications found in database');
      }
    } else {
      console.log('\n⚠️ Notification table does not exist!');
      console.log('You may need to run migrations:');
      console.log('  cd apps/backend && npx mikro-orm migration:up');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (orm) {
      await orm.close();
    }
  }
}

checkNotificationTable();