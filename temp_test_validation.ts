import { extractMetadataFromDocx } from './src/lib/extractor/docxParser';
import { generateJATSXML } from './src/lib/xml/jatsGenerator';
import { validateXMLStructure } from './src/lib/xml/validator';
import * as fs from 'fs';
import * as path from 'path';

async function test() {
  const filePath = path.join(__dirname, './2.docx');
  const buffer = fs.readFileSync(filePath);
  const data = await extractMetadataFromDocx(buffer);
  
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
        headings: data.headings,
        bodyHtml: data.rawHtml
      },
      authors: data.structuredAuthors || [],
      references: data.references || [],
      figures: data.figures || [],
      tables: data.tables || []
  };

  const xml = generateJATSXML(articleMock);
  const report = validateXMLStructure(xml);
  console.log("Validation Report:", JSON.stringify(report, null, 2));
}

test();
