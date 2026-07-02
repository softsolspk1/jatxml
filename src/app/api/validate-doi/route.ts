import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

async function fetchDoiWithRetry(doi: string, retries = 3, delayMs = 1000): Promise<{ doi: string; active: boolean; title: string | null }> {
  // Use a generic email or session email to enter Crossref's polite pool
  const email = 'validator@example.com';
  
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}?mailto=${encodeURIComponent(email)}`);
      
      if (response.ok) {
        const data = await response.json();
        const title = data.message?.title?.[0] || 'Unknown Title';
        return { doi, active: true, title };
      } else if (response.status === 404) {
        // DOI definitely not found
        return { doi, active: false, title: null };
      } else if (response.status === 429 || response.status >= 500) {
        // Rate limit or server error, wait and retry
        if (i < retries - 1) {
          await new Promise(res => setTimeout(res, delayMs * (i + 1))); // Exponential backoff
          continue;
        } else {
          return { doi, active: false, title: null };
        }
      } else {
        // Other unhandled errors
        return { doi, active: false, title: null };
      }
    } catch (err) {
      if (i < retries - 1) {
        await new Promise(res => setTimeout(res, delayMs * (i + 1)));
        continue;
      }
    }
  }
  return { doi, active: false, title: null };
}

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

    const cleanDois = dois.map(d => d.trim()).filter(d => d);
    
    // Deduplicate to minimize API requests
    const uniqueDois = Array.from(new Set(cleanDois));
    const uniqueResults = new Map();

    const batchSize = 10;
    for (let i = 0; i < uniqueDois.length; i += batchSize) {
      const batch = uniqueDois.slice(i, i + batchSize);
      const batchPromises = batch.map(doi => fetchDoiWithRetry(doi));
      const batchResults = await Promise.all(batchPromises);
      
      for (const res of batchResults) {
        uniqueResults.set(res.doi, res);
      }
      
      // Delay between batches to respect rate limits politely
      if (i + batchSize < uniqueDois.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // Map back to original list to maintain order (and duplicates if they exist)
    const results = cleanDois.map(doi => uniqueResults.get(doi));

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error("DOI Validation Error:", error);
    return NextResponse.json({ error: "Failed to validate DOIs" }, { status: 500 });
  }
}
