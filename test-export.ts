import { db } from './src/lib/db';
import { convertToHTML } from './src/lib/xml/htmlConverter';
import { generateJATSXML } from "./src/lib/xml/jatsGenerator";
import { generatePMCXML, generateSciELOXML } from "./src/lib/xml/specializedGenerators";

async function testExport() {
  const article = await db.article.findFirst({
    include: { metadata: true, references: true, figures: true, tables: true, authors: { orderBy: { order: 'asc' } } }
  });
  if (!article) return console.log("No article found");

  try {
    const pmcXml = generatePMCXML(article as any);
    const htmlContent = convertToHTML(article.metadata, article.authors, article.references, article.figures, article.tables, []);
    console.log("HTML generated successfully! Length:", htmlContent.length);
  } catch (e) {
    console.error("Error generating export:", e);
  }
}

testExport();
