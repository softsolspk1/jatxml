import { create } from 'xmlbuilder2';

export function generateJATSXML(metadata: any) {
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
  body.ele('p').txt('Article body content parsing will be mapped here.');

  // Back Matter
  const back = root.ele('back');
  if (metadata.fundingInfo) {
    back.ele('ack').ele('p').txt(`Funding: ${metadata.fundingInfo}`);
  }
  
  return root.end({ prettyPrint: true });
}
