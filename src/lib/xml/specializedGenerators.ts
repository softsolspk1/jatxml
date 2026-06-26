import { generateJATSXML } from './jatsGenerator';

export function generatePMCXML(metadata: any) {
  // PMC enforces strict subsets of JATS. We generate JATS and apply PMC specific headers.
  const xml = generateJATSXML(metadata);
  return xml.replace('dtd-version="1.3"', 'dtd-version="1.3" specific-use="pmc"');
}

export function generateSciELOXML(metadata: any) {
  // SciELO has its own Publishing Schema based on JATS.
  const xml = generateJATSXML(metadata);
  return xml.replace('dtd-version="1.3"', 'dtd-version="1.1" specific-use="sps-1.9"');
}
