import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { uploadToFtp } from '@/lib/ftpClient';
import { generateCrossrefXML, generateDOAJXML, generatePMCXML, generateScopusXML, generateWebOfScienceXML } from '@/lib/xml/specializedGenerators';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  if (!session || (role !== 'ADMIN' && role !== 'EDITORIAL_MANAGER')) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resolvedParams = await params;

  try {
    const article = await db.article.findUnique({
      where: { id: resolvedParams.id },
      include: { metadata: true, authors: { orderBy: { order: 'asc' } }, references: true, figures: true, tables: true }
    });

    if (!article || article.status !== 'READY_FOR_EXPORT') {
      return NextResponse.json({ error: "Article is not ready for submission" }, { status: 400 });
    }

    const settings = await db.systemSettings.findUnique({ where: { id: "global" } });
    if (!settings) {
       return NextResponse.json({ error: "System Settings not configured" }, { status: 400 });
    }

    const submissionLogs = [];

    // 1. DOAJ API Submission
    if (settings.doajApiKey) {
       try {
         const doajXml = generateDOAJXML(article as any);
         const doajRes = await fetch('https://doaj.org/api/v3/articles', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/xml',
               'Authorization': `Bearer ${settings.doajApiKey}`
            },
            body: doajXml
         });
         
         if (doajRes.ok) {
           submissionLogs.push('DOAJ: Success');
         } else {
           submissionLogs.push(`DOAJ: Failed (${doajRes.status})`);
         }
       } catch (e: any) {
         submissionLogs.push(`DOAJ: Error - ${e.message}`);
       }
    }

    // 2. Crossref API Submission
    if (settings.crossrefUsername && settings.crossrefPassword) {
       try {
         const crossrefXml = generateCrossrefXML(article as any);
         
         const authBuffer = Buffer.from(`${settings.crossrefUsername}:${settings.crossrefPassword}`).toString('base64');
         const crossrefRes = await fetch('https://doi.crossref.org/servlet/deposit', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/vnd.crossref.deposit+xml',
               'Authorization': `Basic ${authBuffer}`
            },
            body: crossrefXml
         });
         
         if (crossrefRes.ok) {
           submissionLogs.push('Crossref: Success');
         } else {
           submissionLogs.push(`Crossref: Failed (${crossrefRes.status})`);
         }
       } catch (e: any) {
         submissionLogs.push(`Crossref: Error - ${e.message}`);
       }
    }

    // 3. PMC/Scopus/WoS FTP Submission
    if (settings.pmcFtpHost && settings.pmcFtpUser && settings.pmcFtpPassword) {
       try {
          const pmcXml = generatePMCXML(article as any);
          const scopusXml = generateScopusXML(article as any);
          const wosXml = generateWebOfScienceXML(article as any);
          
          const xmlFiles = [
            { name: `${article.id}_PMC.xml`, content: pmcXml },
            { name: `${article.id}_Scopus.xml`, content: scopusXml },
            { name: `${article.id}_WoS.xml`, content: wosXml }
          ];

          await uploadToFtp(article.id, xmlFiles);
          submissionLogs.push('FTP (PMC/Scopus/WoS): Success');
       } catch (e: any) {
          submissionLogs.push(`FTP (PMC/Scopus/WoS): Error - ${e.message}`);
       }
    }

    // Update article status
    await db.article.update({
      where: { id: article.id },
      data: { status: 'SUBMITTED' }
    });

    return NextResponse.json({ success: true, logs: submissionLogs });

  } catch (error: any) {
    console.error("Submission error:", error);
    return NextResponse.json({ error: error.message || "Failed to submit article" }, { status: 500 });
  }
}
