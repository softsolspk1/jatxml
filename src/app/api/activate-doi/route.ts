import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { generateCrossrefXML } from '@/lib/xml/specializedGenerators';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { dois } = await req.json();

    if (!dois || !Array.isArray(dois) || dois.length === 0) {
      return NextResponse.json({ error: "An array of DOIs is required" }, { status: 400 });
    }

    const settings = await db.systemSettings.findUnique({ where: { id: "global" } });
    if (!settings?.crossrefUsername || !settings?.crossrefPassword) {
      return NextResponse.json({ error: "Crossref credentials missing in system settings" }, { status: 400 });
    }

    const results = [];

    // Process each DOI
    for (const doi of dois) {
      try {
        // Find article by exact DOI match
        const article = await db.article.findFirst({
          where: { metadata: { doi: doi } },
          include: {
            metadata: true,
            authors: true,
            references: true,
            figures: true,
            tables: true,
          }
        });

        if (!article || !article.metadata) {
          results.push({
            doi,
            success: false,
            message: "Metadata not found in the local database. You must upload and extract the article metadata before activating the DOI."
          });
          continue;
        }

        // Generate Crossref XML
        const xml = generateCrossrefXML(article);

        // Prepare deposit payload
        const formData = new FormData();
        formData.append('operation', 'doMDUpload');
        formData.append('login_id', settings.crossrefUsername);
        formData.append('login_passwd', settings.crossrefPassword);
        
        const blob = new Blob([xml], { type: 'application/xml' });
        formData.append('fname', blob, `${article.id}_crossref.xml`);

        // Submit to Crossref Deposit API
        const response = await fetch('https://doi.crossref.org/servlet/deposit', {
          method: 'POST',
          body: formData,
        });

        const responseText = await response.text();

        if (!response.ok) {
          console.error(`Crossref API Error for ${doi}:`, responseText);
          results.push({
            doi,
            success: false,
            message: `Crossref API error: ${response.statusText}`
          });
        } else {
          // Success
          results.push({
            doi,
            success: true,
            message: "Successfully deposited metadata to Crossref."
          });

          // Mark article as submitted in DB if it's not already
          if (article.status !== 'SUBMITTED') {
            await db.article.update({
              where: { id: article.id },
              data: { status: 'SUBMITTED' }
            });
          }

          // Log action
          await db.systemLog.create({
            data: {
              action: `Deposited DOI ${doi} to Crossref via bulk activate`,
              userId: (session.user as any)?.id,
              status: "SUCCESS",
              details: `Crossref Response: ${responseText.substring(0, 150)}...`
            }
          });
        }

      } catch (err: any) {
        results.push({
          doi,
          success: false,
          message: err.message || "An unexpected error occurred"
        });
      }
    }

    return NextResponse.json({ success: true, results });

  } catch (error: any) {
    console.error("Activate DOI Error:", error);
    return NextResponse.json({ error: error.message || "Failed to process DOIs" }, { status: 500 });
  }
}
