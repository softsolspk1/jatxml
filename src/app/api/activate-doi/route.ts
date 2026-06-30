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
    const { articleId } = await req.json();

    if (!articleId) {
      return NextResponse.json({ error: "Article ID is required" }, { status: 400 });
    }

    const settings = await db.systemSettings.findUnique({ where: { id: "global" } });
    if (!settings?.crossrefUsername || !settings?.crossrefPassword) {
      return NextResponse.json({ error: "Crossref credentials missing in system settings" }, { status: 400 });
    }

    const article = await db.article.findUnique({
      where: { id: articleId },
      include: {
        metadata: true,
        authors: true,
        references: true,
        figures: true,
        tables: true,
      }
    });

    if (!article || !article.metadata) {
      return NextResponse.json({ error: "Article or metadata not found" }, { status: 404 });
    }

    if (!article.metadata.doi) {
      return NextResponse.json({ error: "Article has no DOI assigned. Please edit the metadata to assign a DOI." }, { status: 400 });
    }

    // Generate Crossref XML
    const xml = generateCrossrefXML(article);

    // Prepare deposit payload
    const formData = new FormData();
    formData.append('operation', 'doMDUpload');
    formData.append('login_id', settings.crossrefUsername);
    formData.append('login_passwd', settings.crossrefPassword);
    
    // Crossref expects the file as 'fname'
    const blob = new Blob([xml], { type: 'application/xml' });
    formData.append('fname', blob, `${article.id}_crossref.xml`);

    // Submit to Crossref Deposit API
    const response = await fetch('https://doi.crossref.org/servlet/deposit', {
      method: 'POST',
      body: formData,
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.error("Crossref API Error Response:", responseText);
      return NextResponse.json({ error: `Crossref API error: ${response.statusText}` }, { status: response.status });
    }

    // Crossref returns an XML response on success that contains a batch ID and message
    // Usually a successful HTTP 200 means the payload was accepted for processing.
    
    // We log the action
    await db.systemLog.create({
      data: {
        action: `Deposited DOI ${article.metadata.doi} to Crossref`,
        userId: (session.user as any)?.id,
        status: "SUCCESS",
        details: `Crossref Response: ${responseText.substring(0, 200)}...`
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: "Successfully deposited to Crossref for processing.",
      crossrefResponse: responseText 
    });

  } catch (error: any) {
    console.error("Activate DOI Error:", error);
    return NextResponse.json({ error: error.message || "Failed to activate DOI" }, { status: 500 });
  }
}
