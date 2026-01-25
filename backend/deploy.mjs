/**
 * Deploy Security Report Server to OpalStack
 * 
 * This script:
 * 1. Builds the frontend (if --build flag is passed)
 * 2. Creates a deployment archive of the server
 * 3. Uploads and deploys to OpalStack
 * 
 * Usage:
 *   npm run deploy             - Deploy server only (preserves storage/data)
 *   npm run deploy -- --build  - Build frontend first, then deploy
 *   npm run deploy:reset       - Full reset: deletes storage and data on server
 */

import { Client } from 'ssh2';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import archiver from 'archiver';
import { execSync } from 'child_process';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration from .env
const CONFIG = {
  host: 'opal20.opalstack.com',
  username: 'advran',
  password: process.env.OPALSTACK_PASSWORD,
  port: 22,
  remotePath: `/home/advran/apps`,
};

// Validate configuration
if (!CONFIG.password) {
  console.error('❌ Error: OPALSTACK_PASSWORD environment variable is not set');
  console.error('   Create a .env file with: OPALSTACK_PASSWORD=your_password');
  process.exit(1);
}

// Safety check: Never deploy with DEV_MODE enabled
if (process.env.DEV_MODE === 'true') {
  console.error('❌ Error: DEV_MODE is enabled in .env');
  console.error('   DEV_MODE disables authentication and should NEVER be deployed to production.');
  console.error('   Remove DEV_MODE=true from your .env file before deploying.');
  process.exit(1);
}

const APP_NAME = process.env.APP_NAME;
const PROJECT_NAME = 'myproject';
const REMOTE_APP_DIR = `${CONFIG.remotePath}/${APP_NAME}`;
const REMOTE_PROJECT_DIR = `${REMOTE_APP_DIR}/${PROJECT_NAME}`;
const TMP_DIR = path.join(__dirname, '.deploy-tmp');
const ARCHIVE_PATH = path.join(TMP_DIR, 'deploy.zip');

// Files and directories to exclude from deployment
// IMPORTANT: These are NEVER uploaded to the server to preserve server-side data
const EXCLUDE_PATTERNS = [
  'node_modules',
  '.git',
  '.deploy-tmp',
  '*.log',
  '.DS_Store',
  'deploy.mjs',
  'backup.mjs',
  'backups',    // Don't upload local backups
  'storage',    // Don't upload storage
  'data',       // CRITICAL: Never upload data folder - user data lives on server only
];

// Check flags
const shouldBuild = process.argv.includes('--build');
const shouldReset = process.argv.includes('--reset');

function buildFrontend() {
  console.log('🔨 Building frontend...');
  const frontendDir = path.join(__dirname, '..', 'frontend');
  const distSource = path.join(frontendDir, 'dist');
  const distDest = path.join(__dirname, 'dist');
  
  try {
    // Build the frontend
    console.log('   Running npm run build in frontend...');
    execSync('npm run build', {
      cwd: frontendDir,
      stdio: 'inherit',
    });
    
    // Remove existing dist in backend if it exists
    if (fs.existsSync(distDest)) {
      console.log('   Removing existing backend/dist...');
      fs.rmSync(distDest, { recursive: true, force: true });
    }
    
    // Copy dist from frontend to backend
    console.log('   Copying dist to backend...');
    copyDirSync(distSource, distDest);
    
    // Remove dist from frontend
    console.log('   Cleaning up frontend/dist...');
    fs.rmSync(distSource, { recursive: true, force: true });
    
    console.log('✅ Frontend built and deployed to backend/dist');
  } catch (error) {
    console.error('❌ Failed to build frontend:', error.message);
    process.exit(1);
  }
}

/**
 * Recursively copy a directory
 */
function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function createArchive() {
  return new Promise((resolve, reject) => {
    // Create temp directory
    if (!fs.existsSync(TMP_DIR)) {
      fs.mkdirSync(TMP_DIR, { recursive: true });
    }

    console.log('📦 Creating deployment archive...');
    const output = fs.createWriteStream(ARCHIVE_PATH);
    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    output.on('close', () => {
      console.log(`✅ Archive created: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`);
      resolve(ARCHIVE_PATH);
    });

    archive.on('error', (err) => {
      reject(err);
    });

    archive.pipe(output);

    // Add files from server directory
    const files = fs.readdirSync(__dirname);

    console.log(`   📁 Adding server files...`);
    
    files.forEach(file => {
      const filePath = path.join(__dirname, file);
      
      if (!fs.existsSync(filePath)) {
        console.warn(`   ⚠️  File not found (skipping): ${file}`);
        return;
      }
      
      const stat = fs.statSync(filePath);
      
      // Check if file should be excluded
      let matchedPattern = null;
      const shouldExclude = EXCLUDE_PATTERNS.some(pattern => {
        let matches = false;
        if (pattern.includes('*')) {
          const escapedPattern = pattern
            .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
            .replace(/\*/g, '.*');
          const regex = new RegExp(`^${escapedPattern}$`);
          matches = regex.test(file);
        } else {
          matches = file === pattern;
        }
        if (matches) {
          matchedPattern = pattern;
        }
        return matches;
      });

      if (shouldExclude) {
        console.log(`   ⏭️  Excluding: ${file} (matched: ${matchedPattern})`);
      } else {
        try {
          if (stat.isDirectory()) {
            console.log(`   📁 Adding directory: ${file}`);
            archive.directory(filePath, file);
          } else {
            console.log(`   📄 Adding file: ${file}`);
            archive.file(filePath, { name: file });
          }
        } catch (err) {
          console.error(`   ❌ Error adding ${file}: ${err.message}`);
        }
      }
    });

    archive.finalize();
  });
}

function executeCommand(conn, command, captureOutput = false) {
  return new Promise((resolve, reject) => {
    let output = '';
    let errorOutput = '';

    conn.exec(command, (err, stream) => {
      if (err) {
        reject(err);
        return;
      }

      if (captureOutput) {
        stream.on('data', (data) => {
          output += data.toString();
        });
      } else {
        stream.on('data', (data) => {
          process.stdout.write(data);
        });
      }

      stream.stderr.on('data', (data) => {
        const errorData = data.toString();
        errorOutput += errorData;
        if (!captureOutput) {
          process.stderr.write(data);
        }
      });

      stream.on('close', (code) => {
        resolve({
          code,
          stdout: output,
          stderr: errorOutput,
        });
      });
    });
  });
}

function uploadAndDeploy() {
  return new Promise((resolve, reject) => {
    console.log('🔌 Connecting to OpalStack...');
    const conn = new Client();

    conn.on('ready', async () => {
      try {
        console.log('✅ Connected to OpalStack');
        
        // Read archive file
        const archiveData = fs.readFileSync(ARCHIVE_PATH);
        
        // Upload archive
        console.log('📤 Uploading files...');
        const sftp = await new Promise((resolve, reject) => {
          conn.sftp((err, sftp) => {
            if (err) reject(err);
            else resolve(sftp);
          });
        });

        const remoteArchivePath = `${REMOTE_APP_DIR}/deploy.zip`;
        
        await new Promise((resolve, reject) => {
          sftp.writeFile(remoteArchivePath, archiveData, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });

        console.log('✅ Files uploaded');
        console.log('\n📦 Extracting files on server...');

        // Build extraction commands based on reset flag
        let extractCommands;
        
        if (shouldReset) {
          console.log('⚠️  RESET MODE: Will delete ALL data including user data!');
          console.log('⚠️  This is irreversible! Press Ctrl+C within 5 seconds to cancel...');
          await new Promise(resolve => setTimeout(resolve, 5000));
          extractCommands = [
            // Create project directory if it doesn't exist
            `mkdir -p ${REMOTE_PROJECT_DIR}`,
            // Remove ALL old files in myproject (except node_modules)
            `cd ${REMOTE_PROJECT_DIR} && find . -mindepth 1 -maxdepth 1 ! -name 'node_modules' -exec rm -rf {} + || true`,
            // Extract archive to project directory
            `cd ${REMOTE_APP_DIR} && unzip -o deploy.zip -d ${REMOTE_PROJECT_DIR}`,
            // Remove archive
            `rm -f ${REMOTE_APP_DIR}/deploy.zip`,
            // Create empty data directory
            `mkdir -p ${REMOTE_PROJECT_DIR}/data`,
          ];
        } else {
          console.log('✅ SAFE MODE: Preserving data/, .env, and storage/ on server');
          extractCommands = [
            // Create project directory if it doesn't exist
            `mkdir -p ${REMOTE_PROJECT_DIR}`,
            // Remove old files in myproject (PRESERVING: node_modules, .env, storage, data)
            `cd ${REMOTE_PROJECT_DIR} && find . -mindepth 1 -maxdepth 1 ! -name 'node_modules' ! -name '.env' ! -name 'storage' ! -name 'data' -exec rm -rf {} + || true`,
            // Extract archive to project directory (data not in archive, so server data is safe)
            `cd ${REMOTE_APP_DIR} && unzip -o deploy.zip -d ${REMOTE_PROJECT_DIR}`,
            // Remove archive
            `rm -f ${REMOTE_APP_DIR}/deploy.zip`,
            // Create storage and data directories if they don't exist (won't affect existing)
            `mkdir -p ${REMOTE_PROJECT_DIR}/storage`,
            `mkdir -p ${REMOTE_PROJECT_DIR}/data`,
          ];
        }

        // Execute extraction commands
        for (const command of extractCommands) {
          console.log(`   Executing: ${command}`);
          const result = await executeCommand(conn, command);
          if (result.code !== 0) {
            console.warn(`⚠️  Command exited with code ${result.code}`);
          }
        }

        console.log('✅ Files extracted');

        // Verify critical files exist
        console.log('\n🔍 Verifying critical files...');
        const criticalFiles = ['server.js', 'package.json'];
        for (const file of criticalFiles) {
          const checkCommand = `test -f ${REMOTE_PROJECT_DIR}/${file} && echo "EXISTS" || echo "MISSING"`;
          const checkResult = await executeCommand(conn, checkCommand, true);
          if (checkResult.stdout && checkResult.stdout.includes('EXISTS')) {
            console.log(`   ✅ ${file} exists`);
          } else {
            console.error(`   ❌ ${file} is MISSING!`);
          }
        }

        // Check if dist folder exists
        const distCheckCommand = `test -d ${REMOTE_PROJECT_DIR}/dist && echo "EXISTS" || echo "MISSING"`;
        const distCheckResult = await executeCommand(conn, distCheckCommand, true);
        if (distCheckResult.stdout && distCheckResult.stdout.includes('EXISTS')) {
          console.log(`   ✅ dist/ folder exists (frontend deployed)`);
        } else {
          console.warn(`   ⚠️  dist/ folder is MISSING (run with --build flag)`);
        }

        // Check if data folder exists and has content
        const dataCheckCommand = `test -d ${REMOTE_PROJECT_DIR}/data && ls -la ${REMOTE_PROJECT_DIR}/data | wc -l`;
        const dataCheckResult = await executeCommand(conn, dataCheckCommand, true);
        const dataLineCount = parseInt(dataCheckResult.stdout?.trim() || '0', 10);
        if (dataLineCount > 3) { // More than just . and .. and users.json
          console.log(`   ✅ data/ folder preserved (${dataLineCount - 3} user folders)`);
        } else {
          console.log(`   ℹ️  data/ folder exists (empty or new)`);
        }

        // Run deployment sequence
        console.log('\n🔄 Running deployment sequence...');
        
        // Stop application
        console.log('🛑 Stopping application...');
        const stopCommand = `cd ${REMOTE_APP_DIR} && source activate && bash stop 2>/dev/null || true`;
        const stopResult = await executeCommand(conn, stopCommand, true);
        if (stopResult.code === 0) {
          console.log('✅ Application stopped');
        } else {
          console.log('ℹ️  Application may not have been running');
        }
        
        // Install dependencies (from myproject directory)
        console.log('\n📦 Installing dependencies...');
        const npmInstallCommand = `cd ${REMOTE_PROJECT_DIR} && source ${REMOTE_APP_DIR}/activate && npm install --omit=dev`;
        const npmResult = await executeCommand(conn, npmInstallCommand, true);
        if (npmResult.code === 0) {
          console.log('✅ Dependencies installed');
        } else {
          console.error('❌ Failed to install dependencies!');
          if (npmResult.stderr) {
            console.error(`   Error: ${npmResult.stderr.trim()}`);
          }
        }
        
        // Start application
        console.log('\n🚀 Starting application...');
        const startCommand = `cd ${REMOTE_APP_DIR} && source activate && bash start`;
        const startResult = await executeCommand(conn, startCommand, true);
        if (startResult.code === 0) {
          console.log('✅ Application started!');
        } else {
          console.warn('⚠️  Start command may have had issues, check logs');
        }
        
        console.log('\n✅ Deployment sequence completed!');

        conn.end();
        resolve({ code: 0, stdout: 'Deployment completed', stderr: '' });
      } catch (error) {
        conn.end();
        reject(error);
      }
    });

    conn.on('error', (err) => {
      reject(err);
    });

    conn.connect({
      host: CONFIG.host,
      port: CONFIG.port,
      username: CONFIG.username,
      password: CONFIG.password,
    });
  });
}

function cleanup() {
  console.log('🧹 Cleaning up temporary files...');
  if (fs.existsSync(TMP_DIR)) {
    fs.rmSync(TMP_DIR, { recursive: true, force: true });
  }
}

async function deploy() {
  try {
    console.log('🚀 Starting deployment to OpalStack...');
    console.log(`   App: ${APP_NAME}`);
    console.log(`   Project: ${PROJECT_NAME}`);
    console.log(`   Host: ${CONFIG.host}`);
    console.log(`   Remote Path: ${REMOTE_PROJECT_DIR}`);
    console.log(`   Mode: ${shouldReset ? '⚠️  RESET (will delete storage/data)' : 'Update (preserves storage/data)'}\n`);

    // Build frontend if requested
    if (shouldBuild) {
      buildFrontend();
    } else {
      // Check if dist exists
      const distPath = path.join(__dirname, 'dist');
      if (!fs.existsSync(distPath)) {
        console.warn('⚠️  Warning: dist folder not found. Frontend may not be included.');
        console.warn('   Run with --build flag to build frontend first.\n');
      }
    }

    await createArchive();
    await uploadAndDeploy();
    cleanup();
    
    console.log('\n✨ Deployment complete!');
    console.log(`   Your app is deployed to: ${REMOTE_PROJECT_DIR}`);
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    cleanup();
    process.exit(1);
  }
}

deploy();
