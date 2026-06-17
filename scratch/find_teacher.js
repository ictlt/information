const fs = require('fs');

const content = fs.readFileSync('C:\\Users\\PMCoding\\Documents\\Antigravity\\ictschool\\index.html.restored', 'utf8');
const lines = content.split('\n');

lines.forEach((line, idx) => {
  if (line.includes('teacher')) {
    console.log(`Line ${idx + 1}: ${line.trim()}`);
  }
});
