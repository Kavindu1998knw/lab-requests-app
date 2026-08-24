import { execSync } from 'child_process';
import fs from 'fs';

console.log('🚀 Starting GSMB Laboratory build process...');

try {
  if (fs.existsSync('./frontend')) {
    console.log('📦 Installing frontend dependencies and building bundle...');
    execSync('npm --prefix frontend install', { stdio: 'inherit' });
    execSync('npm --prefix frontend run build', { stdio: 'inherit' });
  } else {
    console.log('📦 Building in current working directory...');
    execSync('npm install', { stdio: 'inherit' });
    execSync('npm run build', { stdio: 'inherit' });
  }
  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
