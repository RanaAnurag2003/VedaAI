const mongoose = require('mongoose');

async function test() {
  console.log('Connecting to mongodb://127.0.0.1:27017/vedaai ...');
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/vedaai', {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ Connection successful!');
    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Connection failed:', err);
  }
}

test();
