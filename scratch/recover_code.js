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
    if (line.includes('editInventoryItem') || line.includes('addInventory') || line.includes('ลงทะเบียนพัสดุ')) {
      console.log(`Line ${lineNum} matches`);
      try {
        const obj = JSON.parse(line);
        // If it's a model response or tool call, print it
        if (obj.tool_calls) {
          obj.tool_calls.forEach(tc => {
            if (tc.args && tc.args.ReplacementContent) {
              console.log(`=== Tool Call ReplacementContent (Line ${lineNum}) ===`);
              console.log(tc.args.ReplacementContent);
            }
            if (tc.args && tc.args.CodeContent) {
              console.log(`=== Tool Call CodeContent (Line ${lineNum}) ===`);
              console.log(tc.args.CodeContent);
            }
          });
        }
        if (obj.content && obj.type === 'PLANNER_RESPONSE') {
          console.log(`=== Planner Content (Line ${lineNum}) ===`);
          console.log(obj.content);
        }
      } catch (e) {
        console.log(`Failed to parse line ${lineNum}: ${e.message}`);
      }
    }
  }
}

recover();
