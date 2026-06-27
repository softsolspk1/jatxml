import { create } from 'xmlbuilder2';

export function generateJATSXML(article: any) {
  const metadata = article.metadata || {};
  const authors = article.authors || [];
  const references = article.references || [];
  
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
      
      // Simple split for surname/given-names (heuristics)
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
  sec.ele('p').txt('Article body content parsing mapped from DOCX raw HTML.');

  // Back Matter
  const back = root.ele('back');
  
  if (metadata.fundingInfo) {
    back.ele('ack').ele('title').txt('Acknowledgements');
    back.ele('ack').ele('p').txt(`Funding: ${metadata.fundingInfo}`);
  }
  
  if (metadata.conflictOfInterest) {
    back.ele('fn-group').ele('fn', { 'fn-type': 'coi-statement' }).ele('p').txt(metadata.conflictOfInterest);
  }

  // References
  if (references.length > 0) {
    const refList = back.ele('ref-list');
    refList.ele('title').txt('References');
    references.forEach((ref: any, index: number) => {
      const refNode = refList.ele('ref', { id: `ref${index + 1}` });
      const citation = refNode.ele('element-citation', { 'publication-type': 'journal' });
      // Basic text insertion for citation
      citation.ele('comment').txt(ref.rawText);
      if (ref.doi) {
        citation.ele('pub-id', { 'pub-id-type': 'doi' }).txt(ref.doi);
      }
    });
  }
  
  return root.end({ prettyPrint: true });
}
