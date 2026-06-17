const fs = require('fs');
const path = require('path');
const readline = require('readline');

const logsDir = 'C:\\Users\\PMCoding\\.gemini\\antigravity\\brain\\1d11f820-d4f7-4903-bc6b-55e708400d63\\.system_generated\\logs';
const transcriptFile = path.join(logsDir, 'transcript_full.jsonl');

async function findOriginalHTML() {
  const fileStream = fs.createReadStream(transcriptFile);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let lastHtmlContent = null;
  let lineNum = 0;

  for await (const line of rl) {
    lineNum++;
    try {
      const obj = JSON.parse(line);
      
      // Check for tool calls or results
      if (obj.tool_calls) {
        for (const tc of obj.tool_calls) {
          if (tc.name === 'write_to_file' && tc.args && tc.args.TargetFile && tc.args.TargetFile.endsWith('index.html')) {
            if (tc.args.CodeContent) {
              lastHtmlContent = tc.args.CodeContent;
              console.log(`Found HTML write_to_file at line ${lineNum}`);
            }
          }
        }
      }
    } catch (e) {
      // ignore parse errors
    }
  }

  if (lastHtmlContent) {
    fs.writeFileSync('C:\\Users\\PMCoding\\Documents\\Antigravity\\ictschool\\index.html.restored', lastHtmlContent);
    console.log(`Restored index.html to index.html.restored! Size: ${lastHtmlContent.length} bytes`);
  } else {
    console.log("No full index.html write_to_file found in the transcript logs.");
  }
}

findOriginalHTML();
