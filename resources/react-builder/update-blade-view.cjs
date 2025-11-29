#!/usr/bin/env node

/**
 * Automatically updates admin.blade.php with the latest asset paths from index.html
 * Run this script after npm run build to sync asset references
 */

const fs = require('fs');
const path = require('path');

const indexHtmlPath = path.join(__dirname, '../../public/admin/index.html');
const bladeViewPath = path.join(__dirname, '../views/admin.blade.php');

try {
  // Read the built index.html
  const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');

  // Extract script and link tags with regex
  const scriptMatch = indexHtml.match(/<script type="module" crossorigin src="([^"]+)"><\/script>/);
  const linkMatch = indexHtml.match(/<link rel="stylesheet" crossorigin href="([^"]+)">/);

  if (!scriptMatch || !linkMatch) {
    console.error('❌ Could not find asset references in index.html');
    process.exit(1);
  }

  const scriptSrc = scriptMatch[1];
  const linkHref = linkMatch[1];

  console.log('📦 Found assets:');
  console.log('   JS:', scriptSrc);
  console.log('   CSS:', linkHref);

  // Read the blade view
  let bladeContent = fs.readFileSync(bladeViewPath, 'utf8');

  // Replace script tag
  bladeContent = bladeContent.replace(
    /<script type="module" crossorigin src="[^"]+"><\/script>/,
    `<script type="module" crossorigin src="${scriptSrc}"></script>`
  );

  // Replace link tag
  bladeContent = bladeContent.replace(
    /<link rel="stylesheet" crossorigin href="[^"]+">/,
    `<link rel="stylesheet" crossorigin href="${linkHref}">`
  );

  // Write updated blade view
  fs.writeFileSync(bladeViewPath, bladeContent, 'utf8');

  console.log('✅ Updated admin.blade.php with new asset paths');

} catch (error) {
  console.error('❌ Error updating blade view:', error.message);
  process.exit(1);
}
