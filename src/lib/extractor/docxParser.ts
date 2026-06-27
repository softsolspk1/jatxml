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

  const headings: { level: number; text: string }[] = [];
  $('h1, h2, h3, h4, h5, h6').each((_, el) => {
    const text = $(el).text().trim();
    const tagName = $(el).prop('tagName');
    if (text && tagName) {
      const level = parseInt(tagName.substring(1), 10);
      headings.push({ level, text });
    }
  });
  
  // Collect early text elements for Title and Authors
  const earlyElements: string[] = [];
  $('p, h1, h2, h3').slice(0, 20).each((i, el) => {
    const text = $(el).text().trim();
    if (text.length > 3) earlyElements.push(text);
  });

  // 1. Title and Journal Extraction
  let titleIndex = -1;
  let journalName = '';
  
  for (let i = 0; i < earlyElements.length; i++) {
    const t = earlyElements[i].toLowerCase();
    
    // Check if this line looks like a journal name at the very top
    if (i < 5 && (t.includes('journal') || t.includes('bmc') || t.includes('springer') || t.includes('review') || t.includes('pjps') || t.includes('science'))) {
       if (!journalName) journalName = earlyElements[i];
       continue;
    }

    // Skip common publisher headers, DOI strings, Volume info, etc
    if (
      t.includes('open access') || 
      t.includes('research article') || 
      t.includes('original article') || 
      t.includes('doi:') || 
      t.includes('10.') || 
      t.includes('vol.') ||
      t.includes('volume') ||
      t.includes('issue') ||
      t.includes('pp.') ||
      t.includes('pages') ||
      t.length < 10
    ) {
       continue;
    }
    // First substantial line is likely the Title
    if (earlyElements[i].length > 15 && earlyElements[i].length < 400 && !t.startsWith('abstract')) {
       title = earlyElements[i];
       titleIndex = i;
       break;
    }
  }

  // Fallback
  if (!title) {
    title = $('h1').first().text().trim() || $('p').first().text().trim();
  }

  // 2. Authors and Affiliations parsing
  let authorsRaw = '';
  let affiliationsRaw = '';
  
  if (titleIndex !== -1 && titleIndex + 1 < earlyElements.length) {
    authorsRaw = earlyElements[titleIndex + 1];
    // Next line might be affiliations if it doesn't say abstract
    if (titleIndex + 2 < earlyElements.length && !earlyElements[titleIndex + 2].toLowerCase().startsWith('abstract')) {
       affiliationsRaw = earlyElements[titleIndex + 2];
    }
  }

  // Structure Authors
  let structuredAuthors: any[] = [];
  if (authorsRaw) {
     const names = authorsRaw.split(/,\s*|\s+and\s+/i).map(n => n.trim()).filter(n => n.length > 2);
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

  // 3. Document Scanning (DOI, Funding, Ethics, Grants, Volume)
  let doi = '';
  const doiMatch = html.match(/10\.\d{4,9}\/[-._;()/:A-Z0-9]+/i);
  if (doiMatch) doi = doiMatch[0];

  let volume = '';
  let issue = '';
  let pages = '';
  let publicationDate = '';


  let fundingInfo = '';
  let grantNumbers = '';
  let conflictOfInterest = '';
  let ethicalApproval = '';
  let acknowledgements = '';
  
  $('p, strong, b, h1, h2, h3').each((i, el) => {
    const text = $(el).text().trim().toLowerCase();
    const originalText = $(el).text().trim();
    
    // Running Title
    if (text.startsWith('running title:')) {
      runningTitle = originalText.replace(/^running title:?\s*/i, '').trim();
    }
    // Subtitle
    if (text.startsWith('subtitle:')) {
      subtitle = originalText.replace(/^subtitle:?\s*/i, '').trim();
    }

    if (text.includes('funding') || text.includes('financial support')) {
       let current = $(el).is('p') ? $(el) : $(el).parent().is('p') ? $(el).parent() : $(el).next('p');
       if (current.is('p')) {
         fundingInfo = current.text().trim();
         if (fundingInfo.toLowerCase().startsWith('funding')) {
           fundingInfo = fundingInfo.replace(/^funding:?\s*/i, '').trim();
         }
       }
    }
    
    if (text.includes('grant number') || text.includes('award number')) {
       let current = $(el).is('p') ? $(el) : $(el).parent().is('p') ? $(el).parent() : $(el).next('p');
       if (current.is('p')) {
         grantNumbers = current.text().trim();
         if (grantNumbers.toLowerCase().startsWith('grant number')) {
           grantNumbers = grantNumbers.replace(/^grant number:?\s*/i, '').trim();
         }
       }
    }

    if (text.includes('conflict of interest') || text.includes('competing interest')) {
       let current = $(el).is('p') ? $(el) : $(el).parent().is('p') ? $(el).parent() : $(el).next('p');
       if (current.is('p')) {
         conflictOfInterest = current.text().trim();
         if (conflictOfInterest.toLowerCase().startsWith('conflict of interest')) {
           conflictOfInterest = conflictOfInterest.replace(/^conflict of interest:?\s*/i, '').trim();
         }
       }
    }

    if (text.includes('ethical approval') || text.includes('ethics statement')) {
       let current = $(el).is('p') ? $(el) : $(el).parent().is('p') ? $(el).parent() : $(el).next('p');
       if (current.is('p')) {
         ethicalApproval = current.text().trim();
         if (ethicalApproval.toLowerCase().startsWith('ethical approval')) {
           ethicalApproval = ethicalApproval.replace(/^ethical approval:?\s*/i, '').trim();
         }
       }
    }

    if (text === 'acknowledgements' || text === 'acknowledgments') {
       let current = $(el).parent().is('p') ? $(el).parent().next() : $(el).next();
       if (current.is('p')) acknowledgements = current.text().trim();
    }
  });

  // 4. Abstract
  $('h1, h2, h3, p, strong, b').each((i, el) => {
    const text = $(el).text().trim().toLowerCase();
    if (text.startsWith('abstract') || text.startsWith('summary')) {
      // Sometimes abstract is all in one paragraph
      if ($(el).text().length > 50) {
        abstract = $(el).text().replace(/^abstract:?\s*/i, '').replace(/^summary:?\s*/i, '').trim();
        return false;
      }
      // Or it's the following paragraphs
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
      keywords = $(el).text().replace(/^keywords?:?\s*/i, '').trim();
      return false;
    }
  });

  // 6. References
  let rawReferences = '';
  $('h1, h2, h3, p, strong, b').each((i, el) => {
    const text = $(el).text().trim().toLowerCase();
    if (text === 'references' || text === 'reference' || text === 'bibliography' || text === 'literature cited') {
      let current = $(el).parent().is('p') ? $(el).parent().next() : $(el).next();
      while (current.length > 0) {
        const curText = current.text().toLowerCase();
        // Break out of references if we hit publisher notes, declarations, or a new major section
        if (current.is('h1, h2') || curText.includes("publisher's note") || curText.includes("springer nature") || curText.includes("declarations")) {
           break;
        }
        if (current.is('p') && current.text().trim().length > 10) {
          rawReferences += current.text().trim() + '\n';
        }
        current = current.next();
      }
      return false; 
    }
  });
  
  const { parseReferences } = require('./referenceParser');
  const parsedReferences = parseReferences(rawReferences);

  // 7. Figures & Tables
  const figures: any[] = [];
  let figCounter = 1;
  $('img').each((i, el) => {
    const src = $(el).attr('src');
    if (src && src.startsWith('data:image')) {
      let caption = '';
      let nextP = $(el).next('p');
      if (!nextP.length) nextP = $(el).parent().next('p');
      
      const textNext = nextP.text().trim();
      if (textNext.toLowerCase().startsWith('fig') || textNext.toLowerCase().startsWith('image')) {
        caption = textNext;
      } else {
        caption = `Figure ${figCounter}`;
      }
      
      // Attempt to extract explicit figure numbering
      const labelMatch = caption.match(/^(?:Figure|Fig\.?)\s*(\d+[a-zA-Z]*)/i);
      const label = labelMatch ? `Figure ${labelMatch[1]}` : `Figure ${figCounter}`;
      
      figures.push({ label, base64Data: src, caption });
      figCounter++;
    }
  });

  const tables: any[] = [];
  let tableCounter = 1;
  $('table').each((i, el) => {
    let caption = '';
    let prevP = $(el).prev('p');
    if (!prevP.length) prevP = $(el).parent().prev('p');
    
    const textPrev = prevP.text().trim();
    if (textPrev.toLowerCase().startsWith('table')) {
      caption = textPrev;
    } else {
      caption = `Table ${tableCounter}`;
    }

    const labelMatch = caption.match(/^Table\s*([I\d]+)/i);
    const label = labelMatch ? `Table ${labelMatch[1]}` : `Table ${tableCounter}`;

    // Structure conversion: Ensure <thead> exists
    const $table = $(el);
    if ($table.find('thead').length === 0 && $table.find('tr').length > 1) {
       const firstRow = $table.find('tr').first();
       // wrap first row in thead
       const thead = $('<thead></thead>');
       firstRow.wrap(thead);
       
       // convert td to th in thead
       firstRow.find('td').each((_, td) => {
          const $td = $(td);
          $td.replaceWith(`<th>${$td.html()}</th>`);
       });
       
       // wrap rest in tbody if not already
       if ($table.find('tbody').length === 0) {
          const tbody = $('<tbody></tbody>');
          $table.find('tr').not(firstRow).wrapAll(tbody);
       }
    }

    tables.push({ label, htmlContent: $.html(el), caption });
    tableCounter++;
  });

  // Scan for Volume, Issue, Pages in early elements
  for (let i = 0; i < earlyElements.length; i++) {
    const text = earlyElements[i];
    const volMatch = text.match(/Vol(?:ume|\.)?\s*(\d+)/i);
    if (volMatch && !volume) volume = volMatch[1];
    
    const issueMatch = text.match(/Issue\s*(\d+)/i) || text.match(/No\.\s*(\d+)/i);
    if (issueMatch && !issue) issue = issueMatch[1];

    const pagesMatch = text.match(/(?:pp\.|pages?)\s*(\d+\s*[-–]\s*\d+|\d+)/i);
    if (pagesMatch && !pages) pages = pagesMatch[1];

    const dateMatch = text.match(/\b(?:January|February|March|April|May|June|July|August|September|October|November|December)?\s*(?:20\d{2}|19\d{2})\b/i);
    if (dateMatch && !publicationDate) publicationDate = dateMatch[0];
  }

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
    acknowledgements,
    journalName,
    volume,
    issue,
    pages,
    publicationDate,
    headings
  };
}
