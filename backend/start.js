// Simple production start script
const { spawn } = require('child_process');
const path = require('path');

// Set environment variables
process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || '3001';

// Run database setup and start server
async function start() {
  try {
    console.log('🚀 Starting Buy Lead App Backend...');
    
    // Generate Prisma client
    console.log('📦 Generating Prisma client...');
    await runCommand('npx', ['prisma', 'generate']);
    
    // Run migrations
    console.log('🗄️ Running database migrations...');
    await runCommand('npx', ['prisma', 'migrate', 'deploy']);
    
    // Start the server
    console.log('🌐 Starting server...');
    const server = spawn('node', ['dist/index.js'], {
      stdio: 'inherit',
      env: process.env
    });
    
    server.on('error', (err) => {
      console.error('❌ Server error:', err);
      process.exit(1);
    });
    
  } catch (error) {
    console.error('❌ Startup error:', error);
    process.exit(1);
  }
}

function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit' });
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });
  });
}

start();
