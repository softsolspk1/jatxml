export interface ValidationReport {
  errors: string[];
  warnings: string[];
  compliance: {
    jats: boolean;
    pmc: boolean;
    scielo: boolean;
  };
}

export function validateXMLStructure(xml: string): ValidationReport {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // 1. Basic JATS Structural Validation
  if (!xml.includes('<article')) {
    errors.push('JATS CRITICAL: Missing root <article> element.');
  }
  if (!xml.includes('<front>')) {
    errors.push('JATS CRITICAL: Missing <front> matter element.');
  }
  if (!xml.includes('<body>')) {
    warnings.push('JATS WARNING: Missing <body>. Is this a front-matter only article?');
  }
  if (!xml.includes('<back>')) {
    warnings.push('JATS WARNING: Missing <back> matter. No references or acknowledgements?');
  }
  if (!xml.includes('<journal-meta>')) {
    errors.push('JATS CRITICAL: Missing <journal-meta>.');
  }
  if (!xml.includes('<article-meta>')) {
    errors.push('JATS CRITICAL: Missing <article-meta>.');
  }

  // 2. PMC Validation Rules
  let pmcErrors = 0;
  if (!xml.includes('<article-title>')) {
    errors.push('PMC CRITICAL: Missing <article-title> element. PMC strict rules require a title.');
    pmcErrors++;
  }
  if (!xml.includes('<journal-id')) {
    errors.push('PMC CRITICAL: Missing <journal-id> element.');
    pmcErrors++;
  }
  if (!xml.includes('<abstract>')) {
    warnings.push('PMC WARNING: Missing <abstract>. Ensure the article does not require an abstract for PMC deposition.');
  }
  
  // Check for graphics missing xlink:href (crude regex check)
  const graphicMatches = xml.match(/<graphic[^>]*>/g);
  if (graphicMatches) {
    graphicMatches.forEach(g => {
      if (!g.includes('xlink:href')) {
        errors.push('PMC CRITICAL: Found <graphic> without xlink:href attribute.');
        pmcErrors++;
      }
    });
  }

  // 3. SciELO Validation Rules
  let scieloErrors = 0;
  if (!xml.includes('specific-use="sps')) {
    // SciELO expects SPS identifier in root, but if we are just validating the base JATS it might not be there.
    warnings.push('SciELO WARNING: Root <article> missing specific-use="sps-1.9" attribute.');
  }
  if (!xml.includes('<pub-id pub-id-type="doi">') && !xml.includes('<article-id pub-id-type="doi">')) {
    errors.push('SciELO CRITICAL: Missing DOI in <article-id> or <pub-id>. SciELO mandates DOI.');
    scieloErrors++;
  }
  if (!xml.includes('<contrib-group')) {
    warnings.push('SciELO WARNING: Missing <contrib-group>. Authors are highly recommended.');
  }
  if (!xml.includes('<kwd-group')) {
    warnings.push('SciELO WARNING: Missing <kwd-group>. Keywords are required in most SciELO collections.');
  }

  // Calculate compliance flags
  const jatsCompliance = errors.filter(e => e.startsWith('JATS CRITICAL')).length === 0;
  const pmcCompliance = jatsCompliance && pmcErrors === 0;
  const scieloCompliance = jatsCompliance && scieloErrors === 0;

  return {
    errors,
    warnings,
    compliance: {
      jats: jatsCompliance,
      pmc: pmcCompliance,
      scielo: scieloCompliance
    }
  };
}
