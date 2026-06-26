import { create } from 'xmlbuilder2';

export function generateCrossrefXML(metadata: any, references: any[] = []) {
  const root = create({ version: '1.0', encoding: 'UTF-8' })
    .ele('doi_batch', {
      version: '4.3.7',
      xmlns: 'http://www.crossref.org/schema/4.3.7',
    });

  const head = root.ele('head');
  head.ele('doi_batch_id').txt(`batch_${Date.now()}`);
  head.ele('timestamp').txt(Date.now().toString());
  head.ele('depositor').ele('depositor_name').txt('Softsols Pakistan').up().ele('email_address').txt('kashiffareed01@gmail.com');

  const body = root.ele('body');
  const journal = body.ele('journal');
  const journalMeta = journal.ele('journal_metadata');
  journalMeta.ele('full_title').txt(metadata.journalName || 'Unknown Journal');

  const journalArticle = journal.ele('journal_article', { publication_type: 'full_text' });
  const titles = journalArticle.ele('titles');
  titles.ele('title').txt(metadata.title || 'Untitled Article');

  if (metadata.doi) {
    const doiData = journalArticle.ele('doi_data');
    doiData.ele('doi').txt(metadata.doi);
    doiData.ele('resource').txt(`https://doi.org/${metadata.doi}`);
  }

  // Crossref Citation list
  if (references && references.length > 0) {
    const citationList = journalArticle.ele('citation_list');
    references.forEach((ref, index) => {
      const citation = citationList.ele('citation', { key: `ref${index + 1}` });
      if (ref.doi) {
        citation.ele('doi').txt(ref.doi);
      } else {
        citation.ele('unstructured_citation').txt(ref.rawText);
      }
    });
  }

  return root.end({ prettyPrint: true });
}
