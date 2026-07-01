import fs from 'fs';
import path from 'path';

// Load .env manually
const envPath = path.resolve('.env');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf-8');
  envFile.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      process.env[key.trim()] = valueParts.join('=').trim().replace(/['"]/g, '');
    }
  });
}

import { extractMetadataFromDocx } from './src/lib/extractor/docxParser';
import { generateJATSXML } from './src/lib/xml/jatsGenerator';
import { generatePMCXML, generateSciELOXML } from './src/lib/xml/specializedGenerators';
import { validateXMLStructure } from './src/lib/xml/validator';
import { convertToHTML } from './src/lib/xml/htmlConverter';

async function runPipeline() {
  console.log("Starting pipeline test for 55.docx...");
  const buffer = fs.readFileSync(path.resolve('./55.docx'));
  
  console.log("1. Running docxParser...");
  const htmlData = await extractMetadataFromDocx(buffer);
  
  console.log("2. Mocking llmParser...");
  const llmData = {
    title: "MOCK TITLE",
    abstract: "MOCK ABSTRACT",
    keywords: "MOCK KEYWORDS",
    structuredAuthors: [{ name: "John Doe", order: 1, isCorresponding: true, affiliation: "Test Affiliation" }],
    references: [{ rawText: "1. Mock Reference 2026." }]
  };
  
  console.log("3. Merging data...");
  const extractedData = { ...htmlData, ...llmData };
  
  // Create mock DB object
  const mockArticle = {
    id: "test-article-id-123",
    metadata: {
      title: extractedData.title,
      runningTitle: extractedData.runningTitle,
      subtitle: extractedData.subtitle,
      abstract: extractedData.abstract,
      keywords: extractedData.keywords,
      journalName: extractedData.journalName || 'Test Journal',
      volume: extractedData.volume || '1',
      issue: extractedData.issue || '1',
      pages: extractedData.pages || '1-10',
      doi: extractedData.doi || '10.1234/test',
      publicationDate: extractedData.publicationDate ? new Date(extractedData.publicationDate) : new Date(),
      fundingInfo: extractedData.fundingInfo,
      grantNumbers: extractedData.grantNumbers,
      conflictOfInterest: extractedData.conflictOfInterest,
      ethicalApproval: extractedData.ethicalApproval,
      acknowledgements: extractedData.acknowledgements,
      bodyHtml: extractedData.rawHtml,
      headings: extractedData.headings,
    },
    authors: extractedData.structuredAuthors || [],
    references: extractedData.references || [],
    figures: extractedData.figures || [],
    tables: extractedData.tables || [],
    supplementaryFiles: []
  };

  console.log("4. Generating JATS XML...");
  const jatsXml = generateJATSXML(mockArticle);
  
  console.log("5. Generating PMC XML...");
  const pmcXml = generatePMCXML(mockArticle);
  
  console.log("6. Generating SciELO XML...");
  const scieloXml = generateSciELOXML(mockArticle);
  
  console.log("7. Validating XML...");
  const report = validateXMLStructure(pmcXml); // Test against the most strict one (or test each)
  const scieloReport = validateXMLStructure(scieloXml);
  
  console.log("\n--- VALIDATION RESULTS (PMC base) ---");
  console.log(JSON.stringify(report, null, 2));
  
  console.log("\n--- VALIDATION RESULTS (SciELO base) ---");
  console.log(JSON.stringify(scieloReport, null, 2));

  console.log("\n8. Generating HTML...");
  const html = convertToHTML(mockArticle.metadata, mockArticle.authors, mockArticle.references, mockArticle.figures, mockArticle.tables);
  console.log("HTML generation successful. Length:", html.length);
  if (html.includes("main-body")) {
    console.log("SUCCESS: HTML contains main-body section.");
  } else {
    console.error("ERROR: HTML is missing main-body section!");
  }
}

runPipeline().catch(console.error);
