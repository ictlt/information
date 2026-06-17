const fs = require('fs');

const content = fs.readFileSync('C:\\Users\\PMCoding\\Documents\\Antigravity\\ictschool\\index.html', 'utf8');
const lines = content.split('\n');

lines.forEach((line, idx) => {
  if (line.includes('borrow') || line.includes('Borrow') || line.includes('History') || line.includes('history')) {
    if (line.includes('function') || line.includes('id=') || line.includes('class=')) {
      console.log(`Line ${idx + 1}: ${line.trim()}`);
    }
  }
});
