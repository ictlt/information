const fs = require('fs');

const content = fs.readFileSync('C:\\Users\\PMCoding\\Documents\\Antigravity\\ictschool\\index.html.restored', 'utf8');
const lines = content.split('\n');

lines.forEach((line, idx) => {
  if (line.includes('history') || line.includes('requests-list') || line.includes('borrow-list') || line.includes('request-list')) {
    console.log(`Line ${idx + 1}: ${line.trim()}`);
  }
});
