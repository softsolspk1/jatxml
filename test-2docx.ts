import * as fs from 'fs';
import * as path from 'path';
import { extractMetadataFromDocx } from './src/lib/extractor/docxParser';
import { generateJATSXML } from './src/lib/xml/jatsGenerator';
import { generatePMCXML, generateSciELOXML, generateCrossrefXML, generateDOAJXML, generateOpenAIREXML, generateScopusXML, generateWebOfScienceXML } from './src/lib/xml/specializedGenerators';
import { convertToHTML } from './src/lib/xml/htmlConverter';

async function processDocx() {
  const filePath = path.join(__dirname, '2.docx');
  console.log(`Processing ${filePath}...`);
  
  if (!fs.existsSync(filePath)) {
    console.error("2.docx not found!");
    return;
  }

  const buffer = fs.readFileSync(filePath);
  
  try {
    const data = await extractMetadataFromDocx(buffer);
    console.log("Extraction Successful!");
    console.log(`Title: ${data.title}`);
    console.log(`Authors Count: ${data.structuredAuthors ? data.structuredAuthors.length : 0}`);
    console.log(`References Count: ${data.references ? data.references.length : 0}`);
    console.log(`Figures Count: ${data.figures ? data.figures.length : 0}`);
    console.log(`Tables Count: ${data.tables ? data.tables.length : 0}`);

    const articleMock = {
      id: "live-test-2docx",
      title: data.title,
      originalFileName: "2.docx",
      metadata: {
        title: data.title,
        abstract: data.abstract,
        journalName: "Live Test Journal",
        doi: data.doi || "10.1234/test-2docx",
        publicationDate: new Date(),
        bodyHtml: data.rawHtml
      },
      authors: data.structuredAuthors || [],
      references: data.references || [],
      figures: data.figures || [],
      tables: data.tables || [],
      headings: data.headings || []
    };

    const jatsXml = generateJATSXML(articleMock); fs.writeFileSync('output-JATS.xml', jatsXml); console.log("✅ JATS.xml");
    const pmcXml = generatePMCXML(articleMock); fs.writeFileSync('output-PMC.xml', pmcXml); console.log("✅ PMC.xml");
    const scieloXml = generateSciELOXML(articleMock); fs.writeFileSync('output-SciELO.xml', scieloXml); console.log("✅ SciELO.xml");
    const crossrefXml = generateCrossrefXML(articleMock); fs.writeFileSync('output-Crossref.xml', crossrefXml); console.log("✅ Crossref.xml");
    const doajXml = generateDOAJXML(articleMock); fs.writeFileSync('output-DOAJ.xml', doajXml); console.log("✅ DOAJ.xml");
    const openaireXml = generateOpenAIREXML(articleMock); fs.writeFileSync('output-OpenAIRE.xml', openaireXml); console.log("✅ OpenAIRE.xml");
    const scopusXml = generateScopusXML(articleMock); fs.writeFileSync('output-Scopus.xml', scopusXml); console.log("✅ Scopus.xml");
    const wosXml = generateWebOfScienceXML(articleMock); fs.writeFileSync('output-WoS.xml', wosXml); console.log("✅ WebOfScience.xml");
    
    // HTML / Google Scholar Meta Tags are embedded
    const html = convertToHTML(articleMock.metadata, articleMock.authors, articleMock.references, articleMock.figures, articleMock.tables, []);
    fs.writeFileSync('output-Web.html', html); console.log("✅ output-Web.html generated with Scholar Meta Tags");

    console.log("\nAll 8 required database formats + HTML have been successfully generated from 2.docx!");

  } catch (error) {
    console.error("Pipeline failed:", error);
  }
}

processDocx();
