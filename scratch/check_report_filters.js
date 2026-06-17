const fs = require('fs');

function checkFile(path) {
  console.log(`Checking ${path}:`);
  if (!fs.existsSync(path)) return;
  const content = fs.readFileSync(path, 'utf8');
  const lines = content.split('\n');
  lines.forEach((l, idx) => {
    if (l.includes('report-filter-department') || l.includes('report-details-panel')) {
      console.log(`  Line ${idx + 1}: ${l.trim()}`);
    }
  });
}

checkFile('C:\\Users\\PMCoding\\Documents\\Antigravity\\ictschool\\index.html');
checkFile('C:\\Users\\PMCoding\\Documents\\Antigravity\\ictschool\\index.html.restored');
