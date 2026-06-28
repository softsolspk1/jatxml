import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const verb = searchParams.get('verb');
  const metadataPrefix = searchParams.get('metadataPrefix');

  const oaiHeader = `<?xml version="1.0" encoding="UTF-8"?>
<OAI-PMH xmlns="http://www.openarchives.org/OAI/2.0/" 
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://www.openarchives.org/OAI/2.0/ 
         http://www.openarchives.org/OAI/2.0/OAI-PMH.xsd">
  <responseDate>${new Date().toISOString()}</responseDate>
  <request verb="${verb || ''}" ${metadataPrefix ? `metadataPrefix="${metadataPrefix}"` : ''}>${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/oai</request>`;

  const oaiFooter = `\n</OAI-PMH>`;

  try {
    const settings = await db.systemSettings.findUnique({ where: { id: "global" } });
    if (!settings?.oaiEnabled) {
       return new NextResponse("OAI-PMH Harvesting is disabled by Administrator.", { status: 403 });
    }

    if (verb === 'Identify') {
      const identifyResponse = `
  <Identify>
    <repositoryName>Scholarly Publishing Repository</repositoryName>
    <baseURL>${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/oai</baseURL>
    <protocolVersion>2.0</protocolVersion>
    <adminEmail>admin@example.com</adminEmail>
    <earliestDatestamp>2020-01-01T00:00:00Z</earliestDatestamp>
    <deletedRecord>no</deletedRecord>
    <granularity>YYYY-MM-DDThh:mm:ssZ</granularity>
  </Identify>`;
      return new NextResponse(oaiHeader + identifyResponse + oaiFooter, { headers: { 'Content-Type': 'text/xml' } });
    }

    if (verb === 'ListMetadataFormats') {
      const formatsResponse = `
  <ListMetadataFormats>
    <metadataFormat>
      <metadataPrefix>oai_dc</metadataPrefix>
      <schema>http://www.openarchives.org/OAI/2.0/oai_dc.xsd</schema>
      <metadataNamespace>http://www.openarchives.org/OAI/2.0/oai_dc/</metadataNamespace>
    </metadataFormat>
  </ListMetadataFormats>`;
      return new NextResponse(oaiHeader + formatsResponse + oaiFooter, { headers: { 'Content-Type': 'text/xml' } });
    }

    if (verb === 'ListRecords' || verb === 'ListIdentifiers') {
      if (metadataPrefix !== 'oai_dc') {
        const errorResp = `\n  <error code="cannotDisseminateFormat">metadataPrefix not supported</error>`;
        return new NextResponse(oaiHeader + errorResp + oaiFooter, { headers: { 'Content-Type': 'text/xml' } });
      }

      // Fetch approved/submitted articles
      const articles = await db.article.findMany({
        where: { status: { in: ['READY_FOR_EXPORT', 'SUBMITTED'] } },
        include: { metadata: true, authors: true },
        orderBy: { updatedAt: 'desc' }
      });

      let records = verb === 'ListRecords' ? `<ListRecords>` : `<ListIdentifiers>`;
      
      for (const article of articles) {
        if (!article.metadata) continue;
        const datestamp = article.updatedAt.toISOString();
        const identifier = `oai:example.com:${article.id}`;

        if (verb === 'ListIdentifiers') {
          records += `
    <header>
      <identifier>${identifier}</identifier>
      <datestamp>${datestamp}</datestamp>
    </header>`;
        } else {
          records += `
    <record>
      <header>
        <identifier>${identifier}</identifier>
        <datestamp>${datestamp}</datestamp>
      </header>
      <metadata>
        <oai_dc:dc 
            xmlns:oai_dc="http://www.openarchives.org/OAI/2.0/oai_dc/" 
            xmlns:dc="http://purl.org/dc/elements/1.1/" 
            xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
            xsi:schemaLocation="http://www.openarchives.org/OAI/2.0/oai_dc/ http://www.openarchives.org/OAI/2.0/oai_dc.xsd">
          <dc:title>${article.metadata.title || article.originalFileName}</dc:title>
          ${article.authors.map(a => `<dc:creator>${a.name}</dc:creator>`).join('\n          ')}
          ${article.metadata.abstract ? `<dc:description>${article.metadata.abstract.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</dc:description>` : ''}
          <dc:date>${datestamp}</dc:date>
          <dc:type>text</dc:type>
          <dc:identifier>${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/article/${article.id}</dc:identifier>
        </oai_dc:dc>
      </metadata>
    </record>`;
        }
      }
      
      records += verb === 'ListRecords' ? `\n  </ListRecords>` : `\n  </ListIdentifiers>`;
      return new NextResponse(oaiHeader + records + oaiFooter, { headers: { 'Content-Type': 'text/xml' } });
    }

    const badVerb = `\n  <error code="badVerb">Illegal OAI verb</error>`;
    return new NextResponse(oaiHeader + badVerb + oaiFooter, { headers: { 'Content-Type': 'text/xml' } });

  } catch (err) {
    console.error('OAI Error:', err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
