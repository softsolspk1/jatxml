export function parseReferences(rawText: string) {
  if (!rawText) return [];

  // A simple heuristic parser for reference strings
  // Expects rawText to be the entire References block, separated by newlines
  const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 5);
  
  return lines.map(line => {
    // Attempt to parse standard APA/Vancouver components:
    const doiMatch = line.match(/doi:?\s*(10\.\d{4,9}\/[-._;()/:a-zA-Z0-9]+)/i);
    const doi = doiMatch ? doiMatch[1] : null;

    const pmidMatch = line.match(/PMID:?\s*(\d{5,8})/i) || line.match(/PubMed:?\s*(\d{5,8})/i);
    const pmid = pmidMatch ? pmidMatch[1] : null;

    const yearMatch = line.match(/\((\d{4})\)/) || line.match(/\b(19\d{2}|20\d{2})\b/);
    const year = yearMatch ? yearMatch[1] : null;

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
