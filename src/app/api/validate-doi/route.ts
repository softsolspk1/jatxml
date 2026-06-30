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

    // Process sequentially to avoid aggressive rate limiting from Crossref
    for (const doi of dois) {
      const cleanDoi = doi.trim();
      if (!cleanDoi) continue;

      try {
        const response = await fetch(`https://api.crossref.org/works/${encodeURIComponent(cleanDoi)}`);
        
        if (response.ok) {
          const data = await response.json();
          const title = data.message?.title?.[0] || 'Unknown Title';
          results.push({ doi: cleanDoi, active: true, title });
        } else {
          results.push({ doi: cleanDoi, active: false, title: null });
        }
      } catch (err) {
        results.push({ doi: cleanDoi, active: false, title: null });
      }
    }

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error("DOI Validation Error:", error);
    return NextResponse.json({ error: "Failed to validate DOIs" }, { status: 500 });
  }
}
