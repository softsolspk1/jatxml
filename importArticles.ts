import fs from 'fs';
import path from 'path';
import { db } from './src/lib/db';
import { extractMetadataFromDocx } from './src/lib/extractor/docxParser';
import { extractMetadataWithLLM } from './src/lib/extractor/llmParser';

const articlesDir = path.join(process.cwd(), 'articles');

async function processLocalFiles() {
  const files = fs.readdirSync(articlesDir).filter(f => f.endsWith('.docx'));
  
  if (files.length === 0) {
    console.log("No .docx files found in /articles folder.");
    return;
  }

  const user = await db.user.findFirst();
  if (!user) {
    console.log("No user found in DB to assign as uploader.");
    return;
  }

  for (const fileName of files) {
    const existing = await db.article.findFirst({ where: { originalFileName: fileName } });
    if (existing) {
      console.log(`Skipping ${fileName} as it is already in the database (ID: ${existing.id}).`);
      continue;
    }

    console.log(`\n================================`);
    console.log(`Processing: ${fileName}`);
    console.log(`================================`);
    
    const filePath = path.join(articlesDir, fileName);
    const buffer = fs.readFileSync(filePath);
    
    try {
      console.log(`1. Parsing DOCX Images and HTML... (${(buffer.length / 1024 / 1024).toFixed(2)} MB)`);
      const { figures: images, tables, rawHtml } = await extractMetadataFromDocx(buffer);
      console.log(`   - Extracted ${images?.length || 0} images, ${tables?.length || 0} tables.`);

      console.log(`2. Extracting Metadata with LLM...`);
      const extraction = await extractMetadataWithLLM(buffer);
      console.log(`   - Extracted Title: ${extraction.metadata.title?.substring(0, 50)}...`);
      
      console.log(`3. Saving to Database...`);
      const article = await db.article.create({
        data: {
          originalFileName: fileName,
          status: 'METADATA_EXTRACTED',
          uploaderId: user.id,
          metadata: {
            create: {
              title: extraction.metadata.title,
              abstract: extraction.metadata.abstract,
              keywords: extraction.metadata.keywords,
              journalName: extraction.metadata.journalName || 'PJPS',
              volume: extraction.metadata.volume,
              issue: extraction.metadata.issue,
              pages: extraction.metadata.pages,
              doi: extraction.metadata.doi,
              publicationDate: new Date(),
              bodyHtml: rawHtml,
            }
          },
          authors: {
            create: extraction.authors.map((a: any) => ({
              name: `${a.firstName} ${a.lastName}`.trim(),
              email: a.email,
              affiliation: a.affiliation,
              isCorresponding: a.isCorresponding,
              order: a.order
            }))
          },
          references: {
            create: extraction.references.map((r: any) => ({
              rawText: r.citationText,
              authors: r.authors,
              year: r.year,
              title: r.articleTitle,
              journal: r.journalTitle,
              volume: r.volume,
              issue: r.issue,
              pages: r.pages,
              doi: r.doi,
            }))
          },
          figures: {
            create: images.map((img: any) => ({
              base64Data: img.base64Data,
              caption: img.caption,
              label: img.originalId,
            }))
          },
          tables: {
            create: tables.map((tbl: any) => ({
              htmlContent: tbl.htmlContent,
              caption: tbl.caption,
              label: tbl.originalId,
            }))
          }
        }
      });
      console.log(`   ✅ Successfully saved article ID: ${article.id}`);
      
    } catch (e) {
      console.error(`❌ Failed to process ${fileName}:`, e);
    }
    console.log("Sleeping for 20s to prevent rate limits...");
    await new Promise(r => setTimeout(r, 20000));
  }
  
  console.log("\n🎉 Finished processing all files.");
}

processLocalFiles();
