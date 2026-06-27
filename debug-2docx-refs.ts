import * as fs from 'fs';
import * as path from 'path';
const mammoth = require('mammoth');

async function extractRaw() {
  const filePath = path.join(__dirname, '2.docx');
  const buffer = fs.readFileSync(filePath);
  
  const result = await mammoth.extractRawText({ buffer });
  const lines = result.value.split('\n').filter((l: string) => l.trim().length > 0);
  
  console.log("=== LAST 40 LINES ===");
  for (let i = Math.max(0, lines.length - 40); i < lines.length; i++) {
    console.log(`[${i}] ${lines[i]}`);
  }
}

extractRaw();
