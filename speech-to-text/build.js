#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔨 Starting build process...\n');

// Step 1: Clean previous builds
console.log('🧹 Cleaning previous builds...');
if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
}
if (fs.existsSync('dist-browser')) {
    fs.rmSync('dist-browser', { recursive: true, force: true });
}

// Step 2: Build Node.js version
console.log('📦 Building Node.js version...');
try {
    execSync('tsc', { stdio: 'inherit' });
    console.log('✅ Node.js build completed\n');
} catch (error) {
    console.error('❌ Node.js build failed');
    process.exit(1);
}

// Step 3: Build browser version
console.log('🌐 Building browser version...');
try {
    execSync('tsc --project tsconfig.browser.json', { stdio: 'inherit' });
    console.log('✅ Browser build completed\n');
} catch (error) {
    console.error('❌ Browser build failed');
    process.exit(1);
}

// Step 4: Copy browser files to dist
console.log('📋 Copying browser files to dist...');

const distBrowserDir = path.join(__dirname, 'dist-browser');
const distDir = path.join(__dirname, 'dist');

// Copy all files from dist-browser to dist
function copyDirectoryContents(source, destination) {
    const files = fs.readdirSync(source);
    
    for (const file of files) {
        const sourcePath = path.join(source, file);
        const destPath = path.join(destination, file);
        
        if (fs.statSync(sourcePath).isDirectory()) {
            // Recursively copy subdirectories if any
            if (!fs.existsSync(destPath)) {
                fs.mkdirSync(destPath, { recursive: true });
            }
            copyDirectoryContents(sourcePath, destPath);
        } else {
            // Copy file
            fs.copyFileSync(sourcePath, destPath);
            console.log(`  ✓ Copied ${file}`);
        }
    }
}

copyDirectoryContents(distBrowserDir, distDir);

// Step 5: Clean up temporary directory
console.log('\n🧹 Cleaning up temporary files...');
fs.rmSync(distBrowserDir, { recursive: true, force: true });

console.log('\n✅ Build completed successfully!\n');
console.log('📦 Output files in dist/:');
console.log('  Node.js: index.js, TalkscriberTranscriptionService.js');
console.log('  Browser: index.browser.js, TalkscriberTranscriptionService.browser.js, TalkscriberBase.js');

