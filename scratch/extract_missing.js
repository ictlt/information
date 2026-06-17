const fs = require('fs');
const restoredPath = 'C:\\Users\\PMCoding\\Documents\\Antigravity\\ictschool\\index.html.restored';
const content = fs.readFileSync(restoredPath, 'utf8');

// List of functions that were overwritten
const functionsToExtract = [
  'openScanQrModal',
  'closeScanQrModal',
  'onScanSuccess',
  'onScanError',
  'openInspectAssetModal',
  'closeInspectAssetModal',
  'submitAssetInspection',
  'openAddAssetModal',
  'closeAddAssetModal',
  'editAssetItem',
  'compressAndUploadImage',
  'deleteAssetItem',
  'renderAssetChecksHistory'
];

console.log("Extracting functions from index.html.restored...");

// We will find the block of code in index.html.restored that contains these functions.
// Specifically, it starts at '// SUBVIEW 4: ANNUAL INSPECTIONS' (line 2900)
// and ends before '// SUBVIEW 5: REPAIR REQUESTS & STATUSES' (line 3064).
// Also need to get 'openAddAssetModal', 'closeAddAssetModal', 'editAssetItem', 'compressAndUploadImage', 'deleteAssetItem'
// which were in SUBVIEW 3 (Assets Management). Let's find where they are in index.html.restored.

const lines = content.split('\n');
let block1 = ''; // SUBVIEW 3 helpers
let block2 = ''; // SUBVIEW 4 helpers

// Let's find "openAddAssetModal" in lines
let subview3Start = -1;
let subview3End = -1;
let subview4Start = -1;
let subview4End = -1;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('function openAddAssetModal')) {
    subview3Start = i;
  }
  if (line.includes('// SUBVIEW 4: ANNUAL INSPECTIONS')) {
    subview4Start = i;
    if (subview3Start !== -1) {
      subview3End = i;
    }
  }
  if (line.includes('// SUBVIEW 5: REPAIR REQUESTS & STATUSES')) {
    subview4End = i;
  }
}

console.log(`Subview 3 Helpers: lines ${subview3Start + 1} to ${subview3End}`);
console.log(`Subview 4 Helpers: lines ${subview4Start + 1} to ${subview4End}`);

if (subview3Start !== -1 && subview3End !== -1) {
  block1 = lines.slice(subview3Start, subview3End).join('\n');
}
if (subview4Start !== -1 && subview4End !== -1) {
  block2 = lines.slice(subview4Start, subview4End).join('\n');
}

fs.writeFileSync('C:\\Users\\PMCoding\\Documents\\Antigravity\\ictschool\\scratch\\extracted_blocks.txt', 
  `=== BLOCK 1 ===\n${block1}\n\n=== BLOCK 2 ===\n${block2}`
);

console.log("Extracted blocks written to scratch/extracted_blocks.txt");
