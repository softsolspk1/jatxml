import * as fs from 'fs';
import * as path from 'path';
const mammoth = require('mammoth');

async function extractRaw() {
  const filePath = path.join(__dirname, '2.docx');
  const buffer = fs.readFileSync(filePath);
  
  const result = await mammoth.extractRawText({ buffer });
  const lines = result.value.split('\n').filter((l: string) => l.trim().length > 0);
  
  console.log("=== FIRST 20 LINES ===");
  for (let i = 0; i < Math.min(20, lines.length); i++) {
    console.log(`[${i}] ${lines[i]}`);
  }
}

extractRaw();
