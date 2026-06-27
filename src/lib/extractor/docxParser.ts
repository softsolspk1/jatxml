import mammoth from 'mammoth';
import * as cheerio from 'cheerio';

export async function extractMetadataFromDocx(buffer: Buffer) {
  // Convert docx to HTML
  const result = await mammoth.convertToHtml({ buffer });
  const html = result.value;
  
  const $ = cheerio.load(html);
  
  let title = '';
  let runningTitle = '';
  let subtitle = '';
  let abstract = '';
  let keywords = '';
  
  // 1. Title Extraction
  if ($('h1').length > 0) {
    title = $('h1').first().text().trim();
  } else {
    const firstP = $('p').first().text().trim();
    if (firstP.length > 0 && firstP.length < 200) {
      title = firstP;
    }
  }

  // 2. Authors and Affiliations parsing
  let authorsRaw = '';
  let affiliationsRaw = '';
  let foundAuthors = false;

  $('p').each((i, el) => {
    const text = $(el).text().trim();
    if (!text || text === title) return true; 
    
    if (!foundAuthors && text.length < 300 && !text.toLowerCase().startsWith('abstract')) {
       authorsRaw = text;
       foundAuthors = true;
       const nextText = $(el).next('p').text().trim();
       if (nextText && nextText.length < 400 && !nextText.toLowerCase().startsWith('abstract')) {
         affiliationsRaw = nextText;
       }
       return false; 
    }
  });

  // Structure Authors
  let structuredAuthors: any[] = [];
  if (authorsRaw) {
     const names = authorsRaw.split(/,|and/).map(n => n.trim()).filter(Boolean);
     names.forEach((n, idx) => {
        const isCorresponding = n.includes('*') || n.toLowerCase().includes('corresponding');
        
        let email = '';
        const emailMatch = n.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
        if (emailMatch) {
          email = emailMatch[0];
          n = n.replace(email, '');
        }

        let orcid = '';
        const orcidMatch = n.match(/(\d{4}-\d{4}-\d{4}-\d{3}[0-9X])/gi);
        if (orcidMatch) {
          orcid = orcidMatch[0];
          n = n.replace(orcid, '');
        }

        let cleanName = n.replace(/[^a-zA-Z\s.-]/g, '').trim(); 
        if (cleanName.length < 2) cleanName = n; // fallback

        structuredAuthors.push({
           name: cleanName,
           affiliation: affiliationsRaw, // shared heuristic
           email,
           orcid,
           isCorresponding,
           order: idx + 1
        });
     });
  }

  // 3. Document Scanning (DOI, Funding, Ethics, Grants)
  let doi = '';
  const doiMatch = html.match(/10\.\d{4,9}\/[-._;()/:A-Z0-9]+/i);
  if (doiMatch) doi = doiMatch[0];

  let fundingInfo = '';
  let grantNumbers = '';
  let conflictOfInterest = '';
  let ethicalApproval = '';
  let acknowledgements = '';
  
  $('p, strong, b, h1, h2, h3').each((i, el) => {
    const text = $(el).text().trim().toLowerCase();
    
    // Running Title
    if (text.startsWith('running title:')) {
      runningTitle = $(el).text().replace(/running title:?/i, '').trim();
    }
    // Subtitle
    if (text.startsWith('subtitle:')) {
      subtitle = $(el).text().replace(/subtitle:?/i, '').trim();
    }

    if (text.includes('funding') || text.includes('financial support')) {
       let current = $(el).is('p') ? $(el) : $(el).parent().is('p') ? $(el).parent() : $(el).next('p');
       if (current.is('p')) fundingInfo = current.text().replace(/funding:?/i, '').trim();
    }
    
    if (text.includes('grant number') || text.includes('award number')) {
       let current = $(el).is('p') ? $(el) : $(el).parent().is('p') ? $(el).parent() : $(el).next('p');
       if (current.is('p')) grantNumbers = current.text().replace(/grant number:?/i, '').trim();
    }

    if (text.includes('conflict of interest') || text.includes('competing interest')) {
       let current = $(el).is('p') ? $(el) : $(el).parent().is('p') ? $(el).parent() : $(el).next('p');
       if (current.is('p')) conflictOfInterest = current.text().replace(/conflict of interest:?/i, '').trim();
    }

    if (text.includes('ethical approval') || text.includes('ethics statement')) {
       let current = $(el).is('p') ? $(el) : $(el).parent().is('p') ? $(el).parent() : $(el).next('p');
       if (current.is('p')) ethicalApproval = current.text().replace(/ethical approval:?/i, '').trim();
    }

    if (text === 'acknowledgements' || text === 'acknowledgments') {
       let current = $(el).parent().is('p') ? $(el).parent().next() : $(el).next();
       if (current.is('p')) acknowledgements = current.text().trim();
    }
  });

  // 4. Abstract
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
      return false;
    }
  });

  // 5. Keywords
  $('p, strong, b').each((i, el) => {
    const text = $(el).text().trim().toLowerCase();
    if (text.startsWith('keywords:') || text.startsWith('keywords')) {
      keywords = $(el).text().replace(/keywords?:/i, '').trim();
      return false;
    }
  });

  // 6. References
  let rawReferences = '';
  $('h1, h2, h3, p, strong, b').each((i, el) => {
    const text = $(el).text().trim().toLowerCase();
    if (text === 'references' || text === 'bibliography') {
      let current = $(el).parent().is('p') ? $(el).parent().next() : $(el).next();
      while (current.length > 0) {
        if (current.is('p')) rawReferences += current.text().trim() + '\n';
        current = current.next();
      }
      return false; 
    }
  });
  
  const { parseReferences } = require('./referenceParser');
  const parsedReferences = parseReferences(rawReferences);

  // 7. Figures & Tables
  const figures: any[] = [];
  $('img').each((i, el) => {
    const src = $(el).attr('src');
    if (src && src.startsWith('data:image')) {
      figures.push({ label: `Figure ${i + 1}`, base64Data: src, caption: $(el).next('p').text() || `Image ${i + 1}` });
    }
  });

  const tables: any[] = [];
  $('table').each((i, el) => {
    tables.push({ label: `Table ${i + 1}`, htmlContent: $.html(el), caption: $(el).prev('p').text() || `Table ${i + 1}` });
  });

  return {
    title,
    runningTitle,
    subtitle,
    abstract: abstract.trim(),
    keywords,
    rawHtml: html,
    references: parsedReferences,
    figures,
    tables,
    authorsRaw,
    affiliationsRaw,
    structuredAuthors,
    doi,
    fundingInfo,
    grantNumbers,
    conflictOfInterest,
    ethicalApproval,
    acknowledgements
  };
}
