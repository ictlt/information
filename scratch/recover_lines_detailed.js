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
    if (lineNum === 370 || lineNum === 371) {
      const obj = JSON.parse(line);
      if (obj.tool_calls) {
        obj.tool_calls.forEach(tc => {
          if (tc.args && tc.args.ReplacementChunks) {
            tc.args.ReplacementChunks.forEach((chunk, i) => {
              console.log(`=== LINE ${lineNum} Chunk ${i + 1} Target ===`);
              console.log(chunk.TargetContent);
              console.log(`=== LINE ${lineNum} Chunk ${i + 1} Replacement ===`);
              console.log(chunk.ReplacementContent);
            });
          }
        });
      }
    }
  }
}

recover();
