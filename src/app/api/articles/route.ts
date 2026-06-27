import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { r2Client } from "@/lib/r2";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { extractMetadataFromDocx } from "@/lib/extractor/docxParser";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    
    if (!session || (role !== 'ADMIN' && role !== 'EDITORIAL_MANAGER')) {
      return NextResponse.json({ error: "Unauthorized. Only Admins and Editorial Managers can upload articles." }, { status: 403 });
    }

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
    // Determine Uploader ID
    let uploaderId = "admin-dummy-id"; // Fallback
    if (session && (session.user as any)?.email) {
      const dbUser = await db.user.findUnique({
        where: { email: (session.user as any).email }
      });
      if (dbUser) {
        uploaderId = dbUser.id;
      }
    } else {
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
      uploaderId = user.id;
    }

    // 2. Extract Metadata & Save
    if (originalFileName.toLowerCase().endsWith('.zip')) {
      const AdmZip = (await import('adm-zip')).default;
      const zip = new AdmZip(buffer);
      const zipEntries = zip.getEntries();
      const articleIds = [];

      for (const entry of zipEntries) {
        if (!entry.isDirectory && entry.entryName.toLowerCase().endsWith('.docx')) {
          const docxBuffer = entry.getData();
          
          let extractedData: any = { title: entry.name, abstract: "", keywords: "", references: [], figures: [], tables: [] };
          try {
            if (docxBuffer.length > 0) {
              extractedData = await extractMetadataFromDocx(docxBuffer);
            }
          } catch (e) {
            console.warn(`Could not extract metadata from ${entry.name}`, e);
          }

          const article = await db.article.create({
            data: {
              title: extractedData.title || entry.name,
              originalFileName: entry.name,
              fileUrl: key,
              status: "METADATA_EXTRACTED",
              uploaderId: uploaderId,
              metadata: {
                create: {
                  title: extractedData.title,
                  abstract: extractedData.abstract,
                  keywords: extractedData.keywords,
                  doi: extractedData.doi,
                  fundingInfo: extractedData.fundingInfo,
                  conflictOfInterest: extractedData.conflictOfInterest,
                }
              },
              authors: {
                create: extractedData.authorsRaw ? [{ name: extractedData.authorsRaw, affiliation: extractedData.affiliationsRaw }] : []
              },
              references: { create: extractedData.references || [] },
              figures: { create: extractedData.figures || [] },
              tables: { create: extractedData.tables || [] }
            },
          });
          articleIds.push(article.id);
        }
      }
      return NextResponse.json({ isZip: true, articleIds, count: articleIds.length });
    } else {
      let extractedData: any = { title: "Draft Title", abstract: "", keywords: "", references: [], figures: [], tables: [] };
      if (buffer.length > 0) {
        extractedData = await extractMetadataFromDocx(buffer);
      }

      const article = await db.article.create({
        data: {
          title: extractedData.title,
          originalFileName: originalFileName || key.split('-').pop() || "Document.docx",
          fileUrl: key,
          status: "METADATA_EXTRACTED",
          uploaderId: uploaderId,
          metadata: {
            create: {
              title: extractedData.title,
              abstract: extractedData.abstract,
              keywords: extractedData.keywords,
              doi: extractedData.doi,
              fundingInfo: extractedData.fundingInfo,
              conflictOfInterest: extractedData.conflictOfInterest,
            }
          },
          authors: {
            create: extractedData.authorsRaw ? [{ name: extractedData.authorsRaw, affiliation: extractedData.affiliationsRaw }] : []
          },
          references: { create: extractedData.references || [] },
          figures: { create: extractedData.figures || [] },
          tables: { create: extractedData.tables || [] }
        },
      });

      return NextResponse.json({ isZip: false, articleId: article.id });
    }
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
