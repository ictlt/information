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
    // Search for write_to_file or replace_file_content tool calls
    if (line.includes('index.html') && line.includes('replace_file_content')) {
      console.log(`Line ${lineNum} mentions index.html and replace_file_content`);
    }
    if (line.includes('index.html') && line.includes('write_to_file')) {
      console.log(`Line ${lineNum} mentions index.html and write_to_file`);
    }
  }
}

search();
