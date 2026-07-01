import { generateJATSXML } from './src/lib/xml/jatsGenerator';
import { generatePMCXML, generateSciELOXML } from './src/lib/xml/specializedGenerators';
import { convertToHTML } from './src/lib/xml/htmlConverter';
import { validateXMLStructure } from './src/lib/xml/validator';

const mockArticle = {
  id: 'mock-123',
  metadata: {
    title: 'A Test Article for Validation',
    abstract: 'This is a test abstract.\\nSecond paragraph.',
    journalName: 'Test Journal',
    doi: '10.1234/test.567',
    keywords: 'test, validation, xml',
    publicationDate: new Date('2026-06-28'),
    volume: '1',
    issue: '2',
    pages: '10-20',
    bodyHtml: '<body><h1>Introduction</h1><p>Test paragraph</p><h2>Methods</h2><p>Methods paragraph</p></body>'
  },
  authors: [
    { name: 'John Doe', affiliation: 'University of Testing', email: 'john@example.com', isCorresponding: true }
  ],
  references: [
    { rawText: 'Doe, J. (2020). Testing. Journal of Tests, 1(1), 1-2.', title: 'Testing', journal: 'Journal of Tests', year: '2020', doi: '10.1234/test.ref1' }
  ],
  figures: [
    { label: 'Figure 1', caption: 'A test figure', base64Data: 'data:image/png;base64,iVBORw0KGgo...' }
  ],
  tables: [
    { label: 'Table 1', caption: 'A test table', htmlContent: '<table><thead><tr><th>Header 1</th></tr></thead><tbody><tr><td>Data 1</td></tr></tbody></table>' }
  ],
  supplementaryFiles: []
};

try {
  const jatsXml = generateJATSXML(mockArticle);
  const pmcXml = generatePMCXML(mockArticle);
  const scieloXml = generateSciELOXML(mockArticle);
  const html = convertToHTML(mockArticle.metadata, mockArticle.authors, mockArticle.references, mockArticle.figures, mockArticle.tables, mockArticle.supplementaryFiles);

  console.log("=== JATS VALIDATION ===");
  console.log(JSON.stringify(validateXMLStructure(jatsXml), null, 2));
  
  console.log("\\n=== PMC VALIDATION ===");
  console.log(JSON.stringify(validateXMLStructure(pmcXml), null, 2));

  console.log("\\n=== SciELO VALIDATION ===");
  console.log(JSON.stringify(validateXMLStructure(scieloXml), null, 2));

  console.log("\\n=== JATS OUTPUT SNIPPET ===");
  console.log(jatsXml.substring(0, 500) + '...');

} catch (e) {
  console.error("Generation Error:", e);
}
