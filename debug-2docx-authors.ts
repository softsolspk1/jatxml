import * as fs from 'fs';
import * as path from 'path';
const mammoth = require('mammoth');

async function extractRaw() {
  const filePath = path.join(__dirname, '2.docx');
  const buffer = fs.readFileSync(filePath);
  
  const result = await mammoth.extractRawText({ buffer });
  const lines = result.value.split('\n').filter((l: string) => l.trim().length > 0);
  
  console.log("=== LINES 0 to 40 ===");
  for (let i = 0; i < 40; i++) {
    console.log(`[${i}] ${lines[i]}`);
  }
}

extractRaw();
