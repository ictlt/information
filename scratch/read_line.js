const fs = require('fs');
const path = require('path');
const readline = require('readline');

const logsDir = 'C:\\Users\\PMCoding\\.gemini\\antigravity\\brain\\1d11f820-d4f7-4903-bc6b-55e708400d63\\.system_generated\\logs';
const transcriptFile = path.join(logsDir, 'transcript_full.jsonl');

async function printLines() {
  const fileStream = fs.createReadStream(transcriptFile);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let lineNum = 0;
  for await (const line of rl) {
    lineNum++;
    if (lineNum >= 750 && lineNum <= 760) {
      console.log(`--- Line ${lineNum} ---`);
      try {
        const obj = JSON.parse(line);
        console.log("Type:", obj.type);
        if (obj.tool_calls) {
          obj.tool_calls.forEach(tc => {
            console.log("  Tool Call:", tc.name);
            console.log("  Args:", JSON.stringify(tc.args).substring(0, 200));
          });
        }
      } catch (e) {
        console.log("  JSON Parse error or raw line preview:", line.substring(0, 200));
      }
    }
  }
}

printLines();
