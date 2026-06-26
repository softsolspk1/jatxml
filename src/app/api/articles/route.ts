import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { r2Client } from "@/lib/r2";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { extractMetadataFromDocx } from "@/lib/extractor/docxParser";

export async function POST(req: NextRequest) {
  try {
    const { key, originalFileName } = await req.json();
    if (!key) return NextResponse.json({ error: "Missing key" }, { status: 400 });

    const bucketName = process.env.R2_BUCKET_NAME || "softsols1";

    // 1. Download file from R2
    const getCommand = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });
    
    let buffer: Buffer;
    try {
      const r2Response = await r2Client.send(getCommand);
      const byteArray = await r2Response.Body?.transformToByteArray();
      if (!byteArray) throw new Error("Empty body");
      buffer = Buffer.from(byteArray);
    } catch (e) {
      console.warn("Could not fetch from R2 (check credentials). Running dummy extraction.", e);
      // Fallback for demonstration without real R2 keys
      buffer = Buffer.from("");
    }

    // 2. Extract Metadata (mock if buffer is empty due to lack of R2 keys)
    let extractedData: any = { title: "Draft Title", abstract: "", keywords: "", references: [], figures: [], tables: [] };
    if (buffer.length > 0) {
      extractedData = await extractMetadataFromDocx(buffer);
    }

    // 3. Save to Database
    const uploaderId = "admin-dummy-id"; 
    
    // Create dummy user if not exists for testing purposes
    const user = await db.user.upsert({
      where: { email: "admin@example.com" },
      update: {},
      create: {
        id: uploaderId,
        email: "admin@example.com",
        password: "hashed",
        name: "Admin User",
      }
    });

    const article = await db.article.create({
      data: {
        title: extractedData.title,
        originalFileName: originalFileName || key.split('-').pop() || "Document.docx",
        fileUrl: key,
        status: "METADATA_EXTRACTED",
        uploaderId: user.id,
        metadata: {
          create: {
            title: extractedData.title,
            abstract: extractedData.abstract,
            keywords: extractedData.keywords,
          }
        },
        references: {
          create: extractedData.references || []
        },
        figures: {
          create: extractedData.figures || []
        },
        tables: {
          create: extractedData.tables || []
        }
      },
    });

    return NextResponse.json({ articleId: article.id });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
