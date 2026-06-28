import { create } from 'xmlbuilder2';
import * as cheerio from 'cheerio';

export function generateJATSXML(article: any) {
  const metadata = article.metadata || {};
  const authors = article.authors || [];
  const references = article.references || [];
  const figures = article.figures || [];
  const tables = article.tables || [];
  const supplementaryFiles = article.supplementaryFiles || [];
  const headings = metadata.headings || [];
  
  // Create XML Root using xmlbuilder2
  const doc = create({ version: '1.0', encoding: 'UTF-8' });
  
  // Inject the strict JATS 1.3 DOCTYPE
  doc.dtd({
    name: 'article',
    pubID: '-//NLM//DTD JATS (Z39.96) Journal Publishing DTD v1.3 20210610//EN',
    sysID: 'JATS-journalpublishing1-3.dtd'
  });

  const root = doc.ele('article', {
    'xmlns:mml': 'http://www.w3.org/1998/Math/MathML',
    'xmlns:xlink': 'http://www.w3.org/1999/xlink',
    'article-type': 'research-article',
    'dtd-version': '1.3',
    'xml:lang': 'en'
  });

  // ============================================================
  // FRONT MATTER: Journal and Article Metadata
  // ============================================================
  const front = root.ele('front');
  
  const journalMeta = front.ele('journal-meta');
  journalMeta.ele('journal-id', { 'journal-id-type': 'publisher-id' }).txt(metadata.journalName || 'Unknown-Journal');
  journalMeta.ele('journal-title-group').ele('journal-title').txt(metadata.journalName || 'Unknown Journal Title');
  journalMeta.ele('issn', { 'pub-type': 'epub' }).txt(metadata.issn || '0000-0000');
  journalMeta.ele('publisher').ele('publisher-name').txt(metadata.publisher || 'Standard Publisher');

  const articleMeta = front.ele('article-meta');
  if (metadata.doi) {
    articleMeta.ele('article-id', { 'pub-id-type': 'doi' }).txt(metadata.doi);
  } else {
    articleMeta.ele('article-id', { 'pub-id-type': 'publisher-id' }).txt(article.id || 'article-001');
  }

  const titleGroup = articleMeta.ele('title-group');
  titleGroup.ele('article-title').txt(metadata.title || 'Untitled Article');
  if (metadata.subtitle) {
    titleGroup.ele('subtitle').txt(metadata.subtitle);
  }

  // Authors (contrib-group)
  if (authors.length > 0) {
    const contribGroup = articleMeta.ele('contrib-group');
    
    // Group authors and link to affiliations uniquely
    authors.forEach((author: any, index: number) => {
      const contrib = contribGroup.ele('contrib', { 'contrib-type': 'author' });
      if (author.isCorresponding) {
        contrib.att('corresp', 'yes');
      }

      const nameNode = contrib.ele('name');
      const parts = author.name.split(' ');
      const surname = parts.pop() || '';
      const givenNames = parts.join(' ') || author.name;
      
      if (surname) nameNode.ele('surname').txt(surname);
      if (givenNames) nameNode.ele('given-names').txt(givenNames);
      
      if (author.email) {
        contrib.ele('email').txt(author.email);
      }

      if (author.orcid) {
        contrib.ele('contrib-id', { 'contrib-id-type': 'orcid' }).txt(`https://orcid.org/${author.orcid}`);
      }

      if (author.affiliation) {
        // Cross-reference to affiliation
        contrib.ele('xref', { 'ref-type': 'aff', 'rid': `aff${index + 1}` }).txt((index + 1).toString());
      }
    });

    // Output strictly structured Affiliations
    authors.forEach((author: any, index: number) => {
      if (author.affiliation) {
        const affNode = articleMeta.ele('aff', { id: `aff${index + 1}` });
        affNode.ele('label').txt((index + 1).toString());
        affNode.ele('institution').txt(author.affiliation);
      }
    });
  }

  // Publication Date
  if (metadata.publicationDate) {
    const pubDate = new Date(metadata.publicationDate);
    const dateNode = articleMeta.ele('pub-date', { 'pub-type': 'epub' });
    dateNode.ele('day').txt(pubDate.getDate().toString().padStart(2, '0'));
    dateNode.ele('month').txt((pubDate.getMonth() + 1).toString().padStart(2, '0'));
    dateNode.ele('year').txt(pubDate.getFullYear().toString());
  }

  // Volume, Issue, Pages
  if (metadata.volume) articleMeta.ele('volume').txt(metadata.volume);
  if (metadata.issue) articleMeta.ele('issue').txt(metadata.issue);
  if (metadata.pages) {
    const pages = metadata.pages.split(/[-–]/);
    if (pages[0]) articleMeta.ele('fpage').txt(pages[0].trim());
    if (pages[1]) articleMeta.ele('lpage').txt(pages[1].trim());
  }

  // Abstract
  if (metadata.abstract) {
    const abstractNode = articleMeta.ele('abstract');
    const paragraphs = metadata.abstract.split('\\n');
    paragraphs.forEach((p: string) => {
      if (p.trim()) abstractNode.ele('p').txt(p.trim());
    });
  }

  // Keywords
  if (metadata.keywords) {
    const kwdGroup = articleMeta.ele('kwd-group');
    const kwds = metadata.keywords.split(',').map((k: string) => k.trim());
    kwds.forEach((k: string) => {
      if (k) kwdGroup.ele('kwd').txt(k);
    });
  }

  // ============================================================
  // BODY MATTER: Main Content
  // ============================================================
  const body = root.ele('body');
  
  if (metadata.bodyHtml) {
    const $ = cheerio.load(metadata.bodyHtml);
    let currentSec: any = null;
    let secCounter = 1;

    $('body').children().each((_, el) => {
      const tag = $(el).prop('tagName')?.toLowerCase();
      const text = $(el).text().trim();
      
      if (!text) return; // Skip empty elements
      
      // Stop processing if we hit references or acknowledgements to avoid duplication
      if (text.toLowerCase() === 'references' || text.toLowerCase() === 'acknowledgements' || text.toLowerCase() === 'acknowledgments') {
        return false; 
      }

      if (tag && tag.match(/^h[1-6]$/)) {
         currentSec = body.ele('sec', { id: `sec${secCounter++}` });
         currentSec.ele('title').txt(text);
      } else if (tag === 'p') {
         if (!currentSec) {
            currentSec = body.ele('sec', { id: `sec${secCounter++}` });
            // Only add an Introduction title if we aren't just reading abstract/title stuff
            if (text.length > 50) currentSec.ele('title').txt('Introduction');
         }
         // Filter out standard non-body paragraphs if they leaked
         if (!text.toLowerCase().startsWith('abstract') && !text.toLowerCase().startsWith('keywords')) {
            currentSec.ele('p').txt(text);
         }
      }
    });
    
    // Fallback if the body section is still empty after parsing
    if (!currentSec) {
      const sec = body.ele('sec', { id: 'sec1' });
      sec.ele('title').txt('Content');
      sec.ele('p').txt('Parsed content did not yield valid paragraphs.');
    }

  } else if (headings && headings.length > 0) {
    // Basic flat implementation for nested sections using h1/h2 mapping
    let currentSec: any = null;
    headings.forEach((heading: any, index: number) => {
      if (heading.level === 1 || heading.level === 2) {
        currentSec = body.ele('sec', { id: `sec${index + 1}` });
        currentSec.ele('title').txt(heading.text);
      } else if (currentSec) {
        const subSec = currentSec.ele('sec', { id: `sec${index + 1}` });
        subSec.ele('title').txt(heading.text);
      }
    });
  } else {
    // Fallback if no structured headings exist
    const sec = body.ele('sec', { id: 'sec1' });
    sec.ele('title').txt('Introduction');
    sec.ele('p').txt('Article body content parsing mapped from raw HTML.');
  }

  // Floats Group (Figures and Tables)
  if (figures.length > 0 || tables.length > 0) {
    const floatsGroup = body.ele('floats-group');
    
    figures.forEach((fig: any, index: number) => {
      const figNode = floatsGroup.ele('fig', { id: `fig${index + 1}` });
      figNode.ele('label').txt(fig.label || `Figure ${index + 1}`);
      figNode.ele('caption').ele('p').txt(fig.caption);
      figNode.ele('graphic', { 'xlink:href': `figure_${index + 1}.png` });
    });

    tables.forEach((table: any, index: number) => {
      const tableWrapNode = floatsGroup.ele('table-wrap', { id: `tbl${index + 1}` });
      tableWrapNode.ele('label').txt(table.label || `Table ${index + 1}`);
      tableWrapNode.ele('caption').ele('p').txt(table.caption);
      
      if (table.htmlContent) {
        const $ = cheerio.load(table.htmlContent);
        const jatsTable = tableWrapNode.ele('table');
        
        $('thead').each((_, thead) => {
          const tNode = jatsTable.ele('thead');
          $(thead).find('tr').each((_, tr) => {
            const trNode = tNode.ele('tr');
            $(tr).find('th, td').each((_, cell) => {
              trNode.ele('th').txt($(cell).text().trim());
            });
          });
        });

        $('tbody').each((_, tbody) => {
          const tNode = jatsTable.ele('tbody');
          $(tbody).find('tr').each((_, tr) => {
            const trNode = tNode.ele('tr');
            $(tr).find('th, td').each((_, cell) => {
              trNode.ele('td').txt($(cell).text().trim());
            });
          });
        });
      }
    });
  }

  // ============================================================
  // BACK MATTER: Acknowledgments, Funding, and References
  // ============================================================
  const back = root.ele('back');
  
  if (metadata.acknowledgements || metadata.fundingInfo || metadata.grantNumbers) {
    const ack = back.ele('ack');
    ack.ele('title').txt('Acknowledgments');
    if (metadata.acknowledgements) ack.ele('p').txt(metadata.acknowledgements);
    if (metadata.fundingInfo) ack.ele('p').txt(`Funding: ${metadata.fundingInfo}`);
    if (metadata.grantNumbers) ack.ele('p').txt(`Grant Numbers: ${metadata.grantNumbers}`);
  }
  
  if (metadata.conflictOfInterest) {
    back.ele('fn-group').ele('fn', { 'fn-type': 'coi-statement' }).ele('p').txt(metadata.conflictOfInterest);
  }

  // Supplementary Material
  if (supplementaryFiles.length > 0) {
    const secSupp = back.ele('sec', { 'sec-type': 'supplementary-material' });
    secSupp.ele('title').txt('Supplementary Material');
    supplementaryFiles.forEach((file: any, index: number) => {
      const suppNode = secSupp.ele('supplementary-material', {
        id: `supp${index + 1}`,
        'mimetype': file.mimeType?.split('/')[0] || 'application',
        'mime-subtype': file.mimeType?.split('/')[1] || 'octet-stream'
      });
      suppNode.ele('label').txt(`Supplementary File ${index + 1}`);
      suppNode.ele('caption').ele('title').txt(file.filename);
      suppNode.ele('media', { 'xlink:href': file.filename });
    });
  }

  // References
  if (references.length > 0) {
    const refList = back.ele('ref-list');
    refList.ele('title').txt('References');
    references.forEach((ref: any, index: number) => {
      const refNode = refList.ele('ref', { id: `ref${index + 1}` });
      const citation = refNode.ele('mixed-citation', { 'publication-type': 'journal' });
      
      // Map Authors
      if (ref.authors && ref.authors.length > 0) {
        const personGroup = citation.ele('person-group', { 'person-group-type': 'author' });
        ref.authors.forEach((authorName: string) => {
          const nameNode = personGroup.ele('name');
          const parts = authorName.split(' ');
          const surname = parts.pop() || '';
          const givenNames = parts.join(' ') || authorName;
          if (surname) nameNode.ele('surname').txt(surname);
          if (givenNames) nameNode.ele('given-names').txt(givenNames);
        });
      }

      if (ref.title) citation.ele('article-title').txt(ref.title);
      if (ref.journal) citation.ele('source').txt(ref.journal);
      if (ref.year) citation.ele('year').txt(ref.year);
      if (ref.volume) citation.ele('volume').txt(ref.volume);
      if (ref.issue) citation.ele('issue').txt(ref.issue);
      
      if (ref.pages) {
        const pageParts = ref.pages.split(/[-–]/);
        if (pageParts[0]) citation.ele('fpage').txt(pageParts[0].trim());
        if (pageParts[1]) citation.ele('lpage').txt(pageParts[1].trim());
      }
      
      if (ref.doi) {
        citation.ele('pub-id', { 'pub-id-type': 'doi' }).txt(ref.doi);
      }
      if (ref.pmid) {
        citation.ele('pub-id', { 'pub-id-type': 'pmid' }).txt(ref.pmid);
      }
      
      // Add raw text as fallback if parsing was incomplete
      if (!ref.title && !ref.journal) {
        citation.txt(ref.rawText);
      }
    });
  }
  
  return doc.end({ prettyPrint: true });
}
