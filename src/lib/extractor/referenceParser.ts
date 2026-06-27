export function parseReferences(rawText: string) {
  if (!rawText) return [];

  // A simple heuristic parser for reference strings
  // Expects rawText to be the entire References block, separated by newlines
  const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 5);
  
  return lines.map(line => {
    // Attempt to parse standard APA/Vancouver components:
    const doiMatch = line.match(/(?:doi\.org\/|doi:?\s*)(10\.\d{4,9}\/[-._;()/:a-zA-Z0-9]+)/i) || line.match(/10\.\d{4,9}\/[-._;()/:a-zA-Z0-9]+/i);
    const doi = doiMatch ? doiMatch[1] || doiMatch[0] : null;

    const pmidMatch = line.match(/PMID:?\s*(\d{5,8})/i) || line.match(/PubMed:?\s*(\d{5,8})/i);
    const pmid = pmidMatch ? pmidMatch[1] : null;

    // Year: try to find it in parentheses first (APA), then at end of string or before semicolon (Vancouver)
    const bestYearMatch = line.match(/\((19\d{2}|20\d{2})\)/) || line.match(/(?:^|\.\s*|\s)(19\d{2}|20\d{2})(?:\.|;|:|\s*$)/);
    let year = bestYearMatch ? bestYearMatch[1] : null;
    
    if (!year) {
      // fallback to last 4 digit number in string
      const yearMatches = [...line.matchAll(/\b(19\d{2}|20\d{2})\b/g)];
      if (yearMatches.length > 0) year = yearMatches[yearMatches.length - 1][1];
    }

    return {
      rawText: line,
      doi,
      pmid,
      year,
      title: null, // Full NLP parsing needed for high accuracy, omitted for heuristic limits
      authors: null,
      journal: null,
      volume: null,
      issue: null,
      pages: null
    };
  });
}
