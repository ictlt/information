const fs = require('fs');
const path = require('path');
const readline = require('readline');

const logsDir = 'C:\\Users\\PMCoding\\.gemini\\antigravity\\brain\\1d11f820-d4f7-4903-bc6b-55e708400d63\\.system_generated\\logs';
const transcriptFile = path.join(logsDir, 'transcript_full.jsonl');

async function recover() {
  const fileStream = fs.createReadStream(transcriptFile);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let lineNum = 0;
  for await (const line of rl) {
    lineNum++;
    if (line.includes('toggleNotificationDropdown')) {
      console.log(`Line ${lineNum} matches`);
      try {
        const obj = JSON.parse(line);
        if (obj.tool_calls) {
          obj.tool_calls.forEach(tc => {
            if (tc.args && (tc.args.ReplacementContent || tc.args.CodeContent)) {
              const content = tc.args.ReplacementContent || tc.args.CodeContent;
              if (content.includes('function toggleNotificationDropdown') || content.includes('const toggleNotificationDropdown')) {
                console.log(`=== Found Definition in Tool Call (Line ${lineNum}) ===`);
                console.log(content);
              }
            }
          });
        }
      } catch (e) {
        // ignore
      }
    }
  }
}

recover();
