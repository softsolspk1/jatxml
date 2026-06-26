import mammoth from 'mammoth';
import * as cheerio from 'cheerio';

export async function extractMetadataFromDocx(buffer: Buffer) {
  // Convert docx to HTML
  const result = await mammoth.convertToHtml({ buffer });
  const html = result.value;
  
  const $ = cheerio.load(html);
  
  let title = '';
  let abstract = '';
  let keywords = '';
  
  // 1. Try to find the title
  if ($('h1').length > 0) {
    title = $('h1').first().text().trim();
  } else {
    // Fallback: use the first non-empty paragraph as title
    const firstP = $('p').first().text().trim();
    if (firstP.length > 0 && firstP.length < 200) {
      title = firstP;
    }
  }

  // 2. Try to find the abstract
  $('h1, h2, h3, p, strong, b').each((i, el) => {
    const text = $(el).text().trim().toLowerCase();
    if (text === 'abstract' || text === 'summary') {
      let current = $(el).parent().is('p') ? $(el).parent().next() : $(el).next();
      while (current.length > 0 && !current.is('h1, h2, h3')) {
        if (current.is('p')) {
          abstract += current.text().trim() + '\n';
        }
        current = current.next();
      }
      return false; // Break
    }
  });

  // 3. Try to find keywords
  $('p, strong, b').each((i, el) => {
    const text = $(el).text().trim().toLowerCase();
    if (text.startsWith('keywords:') || text.startsWith('keywords')) {
      keywords = $(el).text().replace(/keywords?:/i, '').trim();
      return false;
    }
  });

  return {
    title,
    abstract: abstract.trim(),
    keywords,
    rawHtml: html
  };
}
