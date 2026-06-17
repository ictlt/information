const fs = require('fs');
const vm = require('vm');

const content = fs.readFileSync('C:\\Users\\PMCoding\\Documents\\Antigravity\\ictschool\\index.html', 'utf8');

// Extract all <script> contents to check for JavaScript syntax errors
const scriptRegex = /<script>([\s\S]*?)<\/script>/gi;
let match;
let scriptIndex = 0;

while ((match = scriptRegex.exec(content)) !== null) {
  scriptIndex++;
  const jsCode = match[1];
  try {
    new vm.Script(jsCode);
    console.log(`Script ${scriptIndex} syntax is OK`);
  } catch (err) {
    console.error(`Syntax error in script ${scriptIndex}:`, err.message);
    
    // Print lines around the error
    const lines = jsCode.split('\n');
    // Simple line parsing to locate the issue if stack trace gives line number
    const errLineMatch = err.stack.match(/evalmachine\.<anonymous>:(\d+)/);
    if (errLineMatch) {
      const errorLine = parseInt(errLineMatch[1], 10);
      console.log(`Error line inside script: ${errorLine}`);
      for (let i = Math.max(0, errorLine - 10); i < Math.min(lines.length, errorLine + 10); i++) {
        console.log(`${i + 1 === errorLine ? '>>>' : '   '} ${i + 1}: ${lines[i]}`);
      }
    } else {
      console.error(err.stack);
    }
  }
}
