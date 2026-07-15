const fs = require('fs');
const path = require('path');

const srcFiles = [
  { src: 'backend/db.js', dest: 'backup/backend/db.js' },
  { src: 'backend/server.js', dest: 'backup/backend/server.js' },
  { src: 'frontend/src/App.tsx', dest: 'backup/frontend/src/App.tsx' }
];

console.log("Real-time file backup watcher started...");

srcFiles.forEach(file => {
  const srcPath = path.resolve(__dirname, file.src);
  const destPath = path.resolve(__dirname, file.dest);

  // Ensure destination directory exists
  const destDir = path.dirname(destPath);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  // Watch for changes
  fs.watch(srcPath, (eventType, filename) => {
    if (eventType === 'change') {
      try {
        // Small delay to ensure the file write is complete
        setTimeout(() => {
          fs.copyFileSync(srcPath, destPath);
          console.log(`[Backup Sync] Updated ${file.src} -> ${file.dest} at ${new Date().toLocaleTimeString()}`);
        }, 100);
      } catch (err) {
        console.error(`[Backup Sync] Failed to copy ${file.src}:`, err.message);
      }
    }
  });
});
