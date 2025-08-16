const Bull = require('bull');

// Create a test queue
const testQueue = new Bull('test-queue', {
  redis: {
    host: 'localhost',
    port: 6379,
  }
});

// Add a job processor
testQueue.process(async (job) => {
  console.log('Processing job:', job.data);
  return { success: true, processed: job.data };
});

// Add event listeners
testQueue.on('completed', (job, result) => {
  console.log(`Job ${job.id} completed with result:`, result);
});

testQueue.on('failed', (job, err) => {
  console.log(`Job ${job.id} failed with error:`, err.message);
});

// Test adding jobs
async function runQueueTest() {
  console.log('Testing Bull queue with Redis...\n');
  
  try {
    // Add a test job
    const job = await testQueue.add('test-job', {
      message: 'Hello from Bull queue!',
      timestamp: new Date().toISOString()
    });
    
    console.log(`Added job ${job.id} to queue`);
    
    // Wait for processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check queue status
    const waiting = await testQueue.getWaitingCount();
    const active = await testQueue.getActiveCount();
    const completed = await testQueue.getCompletedCount();
    const failed = await testQueue.getFailedCount();
    
    console.log('\nQueue Status:');
    console.log(`  Waiting: ${waiting}`);
    console.log(`  Active: ${active}`);
    console.log(`  Completed: ${completed}`);
    console.log(`  Failed: ${failed}`);
    
    // Clean up
    await testQueue.close();
    console.log('\nQueue test completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Queue test failed:', error);
    process.exit(1);
  }
}

runQueueTest();