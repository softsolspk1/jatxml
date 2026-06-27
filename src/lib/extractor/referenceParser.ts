export interface ParsedReference {
  rawText: string;
  formatDetected: 'Vancouver' | 'APA' | 'Harvard' | 'AMA' | 'Unknown';
  doi: string | null;
  pmid: string | null;
  isbn: string | null;
  url: string | null;
  year: string | null;
  title: string | null;
  authors: string[] | null;
  journal: string | null;
  volume: string | null;
  issue: string | null;
  pages: string | null;
}

export function parseReferences(rawText: string): ParsedReference[] {
  if (!rawText) return [];

  const lines = rawText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 5);

  return lines.map((line) => {
    // 1. Extract Identifiers
    const doiMatch =
      line.match(/(?:doi\.org\/|doi:?\s*)(10\.\d{4,9}\/[-._;()/:a-zA-Z0-9]+)/i) ||
      line.match(/10\.\d{4,9}\/[-._;()/:a-zA-Z0-9]+/i);
    const doi = doiMatch ? doiMatch[1] || doiMatch[0] : null;

    const pmidMatch =
      line.match(/PMID:?\s*(\d{5,8})/i) || line.match(/PubMed:?\s*(\d{5,8})/i);
    const pmid = pmidMatch ? pmidMatch[1] : null;

    const isbnMatch = line.match(/ISBN(?:-13|-10)?[:\s]*([0-9X-]{10,17})/i);
    const isbn = isbnMatch ? isbnMatch[1] : null;

    const urlMatch = line.match(/(https?:\/\/[^\s]+)/i);
    const url = urlMatch ? urlMatch[1] : null;

    // 2. Extract Year
    const bestYearMatch =
      line.match(/\((19\d{2}|20\d{2})\)/) ||
      line.match(/(?:^|\.\s*|\s)(19\d{2}|20\d{2})(?:\.|;|:|\s*$)/);
    let year = bestYearMatch ? bestYearMatch[1] : null;

    if (!year) {
      const yearMatches = [...line.matchAll(/\b(19\d{2}|20\d{2})\b/g)];
      if (yearMatches.length > 0) year = yearMatches[yearMatches.length - 1][1];
    }

    // 3. Format Detection & Data Extraction
    let formatDetected: 'Vancouver' | 'APA' | 'Harvard' | 'AMA' | 'Unknown' = 'Unknown';
    let title: string | null = null;
    let authors: string[] | null = null;
    let journal: string | null = null;
    let volume: string | null = null;
    let issue: string | null = null;
    let pages: string | null = null;

    // Clean up numbered lists (e.g. "1. ", "[1] ")
    let cleanLine = line.replace(/^(\[\d+\]|\d+\.)\s*/, '').trim();

    // Heuristic: APA usually has Year in parentheses right after authors: "Author, A. (Year)."
    const apaMatch = cleanLine.match(/^(.*?)\s*\((19\d{2}|20\d{2})\)\.\s*(.*?)\.\s*(?:(?:In\s+)?(.*?)(?:,\s*(\d+)(?:\((\d+)\))?)?(?:,\s*([\d-]+))?\.)?/);
    
    // Heuristic: Vancouver/AMA often has: "Author AA, Author BB. Title. Journal. Year;Vol(Issue):Pages"
    const vancouverMatch = cleanLine.match(/^(.*?)\.\s*(.*?)\.\s*(.*?)\.?\s*(19\d{2}|20\d{2})\s*;\s*(\d+)(?:\((.*?)\))?\s*:\s*([\d-]+)\.?/);

    // Heuristic: Harvard usually has Year after authors without parentheses: "Author, A., Year. Title. Journal, Vol(Issue), pp."
    const harvardMatch = cleanLine.match(/^(.*?)[.,]\s*(19\d{2}|20\d{2})\.\s*(.*?)\.\s*(.*?)(?:,\s*(\d+)(?:\((.*?)\))?)?(?:,\s*(?:pp\.?|pages?)\s*([\d-]+))?\.?/);

    if (apaMatch && cleanLine.includes(`(${year})`)) {
      formatDetected = 'APA';
      authors = apaMatch[1].split(/,|&/).map(a => a.trim()).filter(a => a.length > 0);
      title = apaMatch[3];
      journal = apaMatch[4] || null;
      volume = apaMatch[5] || null;
      issue = apaMatch[6] || null;
      pages = apaMatch[7] || null;
    } else if (vancouverMatch) {
      // Very typical for medical journals
      formatDetected = line.match(/^\[\d+\]/) ? 'AMA' : 'Vancouver'; // AMA often uses [1]
      authors = vancouverMatch[1].split(',').map(a => a.trim());
      title = vancouverMatch[2];
      journal = vancouverMatch[3];
      // year is vancouverMatch[4]
      volume = vancouverMatch[5];
      issue = vancouverMatch[6] || null;
      pages = vancouverMatch[7];
    } else if (harvardMatch) {
      formatDetected = 'Harvard';
      authors = harvardMatch[1].split(/,|and/).map(a => a.trim());
      title = harvardMatch[3];
      journal = harvardMatch[4];
      volume = harvardMatch[5] || null;
      issue = harvardMatch[6] || null;
      pages = harvardMatch[7] || null;
    }

    // Fallback parsing if regexes miss (try to extract what we can)
    if (!title) {
        // If we still don't have title, we'll try a generic split
        const parts = cleanLine.split('.');
        if (parts.length >= 3) {
            // Usually Authors. Title. Journal...
            authors = parts[0].split(',').map(a => a.trim());
            title = parts[1].trim();
        }
    }

    return {
      rawText: line,
      formatDetected,
      doi,
      pmid,
      isbn,
      url,
      year,
      title,
      authors,
      journal,
      volume,
      issue,
      pages,
    };
  });
}
