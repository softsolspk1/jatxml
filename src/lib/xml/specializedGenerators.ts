import { generateJATSXML } from './jatsGenerator';

export function generatePMCXML(article: any) {
  const xml = generateJATSXML(article);
  return xml.replace('dtd-version="1.3"', 'dtd-version="1.3" specific-use="pmc"');
}

export function generateSciELOXML(article: any) {
  const xml = generateJATSXML(article);
  return xml.replace('dtd-version="1.3"', 'dtd-version="1.1" specific-use="sps-1.9"');
}

export function generateCrossrefXML(article: any) {
  const xml = generateJATSXML(article);
  return xml.replace('dtd-version="1.3"', 'dtd-version="1.3" specific-use="crossref"');
}

export function generateDOAJXML(article: any) {
  const xml = generateJATSXML(article);
  return xml.replace('dtd-version="1.3"', 'dtd-version="1.3" specific-use="doaj"');
}

export function generateOpenAIREXML(article: any) {
  const xml = generateJATSXML(article);
  return xml.replace('dtd-version="1.3"', 'dtd-version="1.3" specific-use="openaire"');
}

export function generateScopusXML(article: any) {
  const xml = generateJATSXML(article);
  return xml.replace('dtd-version="1.3"', 'dtd-version="1.3" specific-use="scopus"');
}

export function generateWebOfScienceXML(article: any) {
  const xml = generateJATSXML(article);
  return xml.replace('dtd-version="1.3"', 'dtd-version="1.3" specific-use="wos"');
}

export function generatePorticoXML(article: any) {
  const xml = generateJATSXML(article);
  return xml.replace('dtd-version="1.3"', 'dtd-version="1.3" specific-use="portico"');
}
