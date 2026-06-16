const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'dist', 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

if (!html.includes('manifest.json')) {
  const pwaHead = [
    '<link rel="manifest" href="/manifest.json">',
    '<meta name="theme-color" content="#208AEF">',
    '<meta name="apple-mobile-web-app-capable" content="yes">',
    '<meta name="apple-mobile-web-app-status-bar-style" content="default">',
    '<link rel="apple-touch-icon" href="/icon-512.png">',
  ].join('\n    ');

  html = html.replace('</head>', `    ${pwaHead}\n  </head>`);
  fs.writeFileSync(indexPath, html);
  console.log('✅ PWA meta tags injected into index.html');
} else {
  console.log('ℹ️ manifest.json already present, skipping injection');
}
