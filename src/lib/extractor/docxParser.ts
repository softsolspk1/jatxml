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
  
  // 1. Try to find the title, authors, and affiliations
  if ($('h1').length > 0) {
    title = $('h1').first().text().trim();
  } else {
    // Fallback: use the first non-empty paragraph as title
    const firstP = $('p').first().text().trim();
    if (firstP.length > 0 && firstP.length < 200) {
      title = firstP;
    }
  }

  // Very basic heuristic for authors: text immediately following the title, often containing commas or superscripts
  let authorsRaw = '';
  let affiliationsRaw = '';
  let foundAuthors = false;

  $('p').each((i, el) => {
    const text = $(el).text().trim();
    // Skip empty lines or the title itself
    if (!text || text === title) return true; 
    
    // If we haven't found authors yet, and it's short-ish and looks like names
    if (!foundAuthors && text.length < 300 && !text.toLowerCase().startsWith('abstract')) {
       authorsRaw = text;
       foundAuthors = true;
       // The next paragraph might be affiliations
       const nextText = $(el).next('p').text().trim();
       if (nextText && nextText.length < 400 && !nextText.toLowerCase().startsWith('abstract')) {
         affiliationsRaw = nextText;
       }
       return false; // Break
    }
  });

  // Extract DOI if present anywhere in the doc
  let doi = '';
  const doiMatch = html.match(/10\.\d{4,9}\/[-._;()/:A-Z0-9]+/i);
  if (doiMatch) {
    doi = doiMatch[0];
  }

  // Find Funding / Conflict of Interest
  let fundingInfo = '';
  let conflictOfInterest = '';
  
  $('p, strong, b, h1, h2, h3').each((i, el) => {
    const text = $(el).text().trim().toLowerCase();
    
    if (text.includes('funding') || text.includes('grant') || text.includes('financial support')) {
       let current = $(el).is('p') ? $(el) : $(el).parent().is('p') ? $(el).parent() : $(el).next('p');
       if (current.is('p')) {
         fundingInfo = current.text().replace(/funding:?/i, '').trim();
       }
    }
    
    if (text.includes('conflict of interest') || text.includes('competing interest')) {
       let current = $(el).is('p') ? $(el) : $(el).parent().is('p') ? $(el).parent() : $(el).next('p');
       if (current.is('p')) {
         conflictOfInterest = current.text().replace(/conflict of interest:?/i, '').replace(/competing interest(s)?:?/i, '').trim();
       }
    }
  });

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

  // 4. Try to find References
  let rawReferences = '';
  $('h1, h2, h3, p, strong, b').each((i, el) => {
    const text = $(el).text().trim().toLowerCase();
    if (text === 'references' || text === 'bibliography') {
      let current = $(el).parent().is('p') ? $(el).parent().next() : $(el).next();
      while (current.length > 0) {
        if (current.is('p')) {
          rawReferences += current.text().trim() + '\n';
        }
        current = current.next();
      }
      return false; // Break
    }
  });

  const { parseReferences } = require('./referenceParser');
  const parsedReferences = parseReferences(rawReferences);

  // 5. Try to find Figures (Images embedded in docx)
  const figures: any[] = [];
  $('img').each((i, el) => {
    const src = $(el).attr('src');
    if (src && src.startsWith('data:image')) {
      figures.push({
        label: `Figure ${i + 1}`,
        base64Data: src,
        caption: $(el).next('p').text() || `Extracted Image ${i + 1}`
      });
    }
  });

  // 6. Try to find Tables
  const tables: any[] = [];
  $('table').each((i, el) => {
    tables.push({
      label: `Table ${i + 1}`,
      htmlContent: $.html(el),
      caption: $(el).prev('p').text() || `Extracted Table ${i + 1}`
    });
  });

  return {
    title,
    abstract: abstract.trim(),
    keywords,
    rawHtml: html,
    references: parsedReferences,
    figures,
    tables,
    authorsRaw,
    affiliationsRaw,
    doi,
    fundingInfo,
    conflictOfInterest
  };
}
