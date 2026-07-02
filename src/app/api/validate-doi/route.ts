import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const dois: string[] = body.dois;

    if (!dois || !Array.isArray(dois)) {
      return NextResponse.json({ error: "Invalid DOIs provided" }, { status: 400 });
    }

    const results = [];
    const cleanDois = dois.map(doi => doi.trim()).filter(Boolean);
    
    // Process in chunks to avoid timeout and excessive rate limiting
    const chunkSize = 5;
    for (let i = 0; i < cleanDois.length; i += chunkSize) {
      const chunk = cleanDois.slice(i, i + chunkSize);
      
      const chunkResults = await Promise.all(
        chunk.map(async (cleanDoi) => {
          try {
            // Using polite pool by providing mailto
            const response = await fetch(`https://api.crossref.org/works/${encodeURIComponent(cleanDoi)}`, {
              headers: {
                'User-Agent': 'JatXML/1.0 (mailto:support@jatxml.com)'
              }
            });
            
            if (response.ok) {
              const data = await response.json();
              const title = data.message?.title?.[0] || 'Unknown Title';
              return { doi: cleanDoi, active: true, title };
            } else if (response.status === 404) {
              // Try doi.org resolution for DOIs not in Crossref (e.g. DataCite)
              const doiRes = await fetch(`https://doi.org/api/handles/${encodeURIComponent(cleanDoi)}`);
              if (doiRes.ok) {
                return { doi: cleanDoi, active: true, title: 'Unknown Title (Not in Crossref)' };
              }
              return { doi: cleanDoi, active: false, title: null };
            } else {
              return { doi: cleanDoi, active: false, title: null };
            }
          } catch (err) {
            return { doi: cleanDoi, active: false, title: null };
          }
        })
      );
      
      results.push(...chunkResults);
      
      // Small delay between chunks to respect rate limits further
      if (i + chunkSize < cleanDois.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error("DOI Validation Error:", error);
    return NextResponse.json({ error: "Failed to validate DOIs" }, { status: 500 });
  }
}
