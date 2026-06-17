const fs = require('fs');

const htmlPath = 'C:\\Users\\PMCoding\\Documents\\Antigravity\\ictschool\\index.html';
const content = fs.readFileSync(htmlPath, 'utf8');
const lines = content.split('\n');

// Extract lines 2963 to 3531 (1-indexed, so array indices 2962 to 3530)
const targetLines = lines.slice(2962, 3531);
const targetText = targetLines.join('\n');

fs.writeFileSync('C:\\Users\\PMCoding\\Documents\\Antigravity\\ictschool\\scratch\\target_corrupted.txt', targetText);
console.log("Written corrupted target text to scratch/target_corrupted.txt. Length:", targetText.length);
