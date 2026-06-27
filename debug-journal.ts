import * as fs from 'fs';
import * as path from 'path';
const mammoth = require('mammoth');
import * as cheerio from 'cheerio';

async function extractRaw() {
  const filePath = path.join(__dirname, '2.docx');
  const buffer = fs.readFileSync(filePath);
  
  const result = await mammoth.convertToHtml({ buffer });
  const html = result.value;
  const $ = cheerio.load(html);

  const earlyElements: string[] = [];
  $('p, h1, h2, h3').slice(0, 15).each((i, el) => {
    const text = $(el).text().trim();
    if (text.length > 3) earlyElements.push(text);
  });
  
  for (let i = 0; i < earlyElements.length; i++) {
    console.log(`[${i}] ${earlyElements[i]}`);
  }
}

extractRaw();
