const fs = require('fs');

function analyzeFile(filePath) {
  console.log(`Analyzing file: ${filePath}`);
  if (!fs.existsSync(filePath)) {
    console.log("File does not exist");
    return;
  }
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  console.log(`Total lines: ${lines.length}`);
  
  lines.forEach((line, idx) => {
    if (line.includes('function switchView') || line.includes('switchView(')) {
      console.log(`  Line ${idx + 1}: ${line.trim()}`);
    }
  });
}

analyzeFile('C:\\Users\\PMCoding\\Documents\\Antigravity\\ictschool\\index.html');
analyzeFile('C:\\Users\\PMCoding\\Documents\\Antigravity\\ictschool\\index.html.restored');
