export function validateXMLStructure(xml: string) {
  const errors: string[] = [];

  // Basic structural DTD validation simulation
  if (!xml.includes('<article')) {
    errors.push('CRITICAL: Missing root <article> element.');
  }
  if (!xml.includes('<front>')) {
    errors.push('CRITICAL: Missing <front> matter element.');
  }
  if (!xml.includes('<article-title>')) {
    errors.push('PMC VALIDATION: Missing <article-title> element. PMC strict rules require a title.');
  }
  if (!xml.includes('<journal-id')) {
    errors.push('PMC VALIDATION: Missing <journal-id> element.');
  }
  if (!xml.includes('<abstract>')) {
    errors.push('WARNING: Missing <abstract>. Ensure the article does not require an abstract.');
  }

  return {
    isValid: errors.filter(e => e.includes('CRITICAL') || e.includes('PMC')).length === 0,
    errors
  };
}
