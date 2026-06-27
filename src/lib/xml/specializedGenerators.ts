import { generateJATSXML } from './jatsGenerator';

export function generatePMCXML(article: any) {
  // PMC enforces strict subsets of JATS. We generate JATS and apply PMC specific headers.
  const xml = generateJATSXML(article);
  // Add PMC specific use attribute
  return xml.replace('dtd-version="1.3"', 'dtd-version="1.3" specific-use="pmc"');
}

export function generateSciELOXML(article: any) {
  // SciELO has its own Publishing Schema (SPS) based on JATS.
  const xml = generateJATSXML(article);
  // Replace DTD version with SciELO SPS required attributes
  return xml.replace('dtd-version="1.3"', 'dtd-version="1.1" specific-use="sps-1.9"');
}
