import { create } from 'xmlbuilder2';
import * as cheerio from 'cheerio';

export function generateJATSXML(article: any) {
  const metadata = article.metadata || {};
  const authors = article.authors || [];
  const references = article.references || [];
  const figures = article.figures || [];
  const tables = article.tables || [];
  const supplementaryFiles = article.supplementaryFiles || [];
  
  const root = create({ version: '1.0', encoding: 'UTF-8' })
    .ele('article', {
      'xmlns:mml': 'http://www.w3.org/1998/Math/MathML',
      'xmlns:xlink': 'http://www.w3.org/1999/xlink',
      'article-type': 'research-article',
      'dtd-version': '1.3',
      'xml:lang': 'en'
    });

  // Front Matter
  const front = root.ele('front');
  
  const journalMeta = front.ele('journal-meta');
  journalMeta.ele('journal-id', { 'journal-id-type': 'publisher-id' }).txt(metadata.journalName || 'Unknown-Journal');
  journalMeta.ele('journal-title-group').ele('journal-title').txt(metadata.journalName || 'Unknown Journal Title');
  journalMeta.ele('publisher').ele('publisher-name').txt('Standard Publisher');

  const articleMeta = front.ele('article-meta');
  if (metadata.doi) {
    articleMeta.ele('article-id', { 'pub-id-type': 'doi' }).txt(metadata.doi);
  }

  const titleGroup = articleMeta.ele('title-group');
  titleGroup.ele('article-title').txt(metadata.title || 'Untitled Article');
  if (metadata.subtitle) {
    titleGroup.ele('subtitle').txt(metadata.subtitle);
  }

  // Authors (contrib-group)
  if (authors.length > 0) {
    const contribGroup = articleMeta.ele('contrib-group');
    authors.forEach((author: any, index: number) => {
      const contrib = contribGroup.ele('contrib', { 'contrib-type': 'author' });
      const nameNode = contrib.ele('name');
      
      const parts = author.name.split(' ');
      const surname = parts.pop() || '';
      const givenNames = parts.join(' ') || author.name;
      
      if (surname) nameNode.ele('surname').txt(surname);
      if (givenNames) nameNode.ele('given-names').txt(givenNames);
      
      if (author.affiliation) {
        const affNode = contribGroup.ele('aff', { id: `aff${index + 1}` });
        affNode.ele('institution').txt(author.affiliation);
        contrib.ele('xref', { 'ref-type': 'aff', 'rid': `aff${index + 1}` });
      }
    });
  }

  // Abstract
  if (metadata.abstract) {
    articleMeta.ele('abstract').ele('p').txt(metadata.abstract);
  }

  // Keywords
  if (metadata.keywords) {
    const kwdGroup = articleMeta.ele('kwd-group');
    const kwds = metadata.keywords.split(',').map((k: string) => k.trim());
    kwds.forEach((k: string) => {
      if (k) kwdGroup.ele('kwd').txt(k);
    });
  }

  // Body
  const body = root.ele('body');
  const sec = body.ele('sec');
  sec.ele('title').txt('Introduction');
  sec.ele('p').txt('Article body content parsing mapped from raw HTML.');

  // Floats Group (Figures and Tables)
  if (figures.length > 0 || tables.length > 0) {
    const floatsGroup = body.ele('floats-group');
    
    figures.forEach((fig: any, index: number) => {
      const figNode = floatsGroup.ele('fig', { id: `fig${index + 1}` });
      figNode.ele('label').txt(fig.label || `Figure ${index + 1}`);
      figNode.ele('caption').ele('p').txt(fig.caption);
      
      // We assume the base64Data is packaged, we use a placeholder reference here for JATS
      figNode.ele('graphic', { 'xlink:href': `figure_${index + 1}.png` });
    });

    tables.forEach((table: any, index: number) => {
      const tableWrapNode = floatsGroup.ele('table-wrap', { id: `tbl${index + 1}` });
      tableWrapNode.ele('label').txt(table.label || `Table ${index + 1}`);
      tableWrapNode.ele('caption').ele('p').txt(table.caption);
      
      // Convert HTML Table to JATS Table
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

  // Back Matter
  const back = root.ele('back');
  
  if (metadata.fundingInfo) {
    back.ele('ack').ele('title').txt('Acknowledgements');
    back.ele('ack').ele('p').txt(`Funding: ${metadata.fundingInfo}`);
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
      const citation = refNode.ele('element-citation', { 'publication-type': 'journal' });
      
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

      if (ref.year) citation.ele('year').txt(ref.year);
      if (ref.title) citation.ele('article-title').txt(ref.title);
      if (ref.journal) citation.ele('source').txt(ref.journal);
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
      if (ref.isbn) {
        citation.ele('pub-id', { 'pub-id-type': 'isbn' }).txt(ref.isbn);
      }
      
      // Add raw text as comment fallback
      citation.ele('comment').txt(ref.rawText);
    });
  }
  
  return root.end({ prettyPrint: true });
}
