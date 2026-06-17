const fs = require('fs');
const path = require('path');
const readline = require('readline');

const logsDir = 'C:\\Users\\PMCoding\\.gemini\\antigravity\\brain\\1d11f820-d4f7-4903-bc6b-55e708400d63\\.system_generated\\logs';
const transcriptFile = path.join(logsDir, 'transcript_full.jsonl');

async function search() {
  const fileStream = fs.createReadStream(transcriptFile);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let lineNum = 0;
  for await (const line of rl) {
    lineNum++;
    try {
      const obj = JSON.parse(line);
      if (obj.tool_calls) {
        for (const tc of obj.tool_calls) {
          if (tc.args && tc.args.TargetFile && tc.args.TargetFile.toLowerCase().includes('index.html')) {
            console.log(`Line ${lineNum}: Tool=${tc.name}, TargetFile=${tc.args.TargetFile}, Overwrite=${tc.args.Overwrite || false}`);
          }
        }
      }
    } catch (e) {
      // ignore
    }
  }
}

search();
