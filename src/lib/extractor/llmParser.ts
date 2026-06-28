import { GoogleGenAI, Type, Schema } from '@google/genai';
import mammoth from 'mammoth';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Define the structured schema for Gemini output
const metadataSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "The full title of the article. Do NOT include the journal name here." },
    runningTitle: { type: Type.STRING, description: "The short running title of the article, if present." },
    subtitle: { type: Type.STRING, description: "The subtitle of the article, if present." },
    abstract: { type: Type.STRING, description: "The exact abstract or summary text. Do NOT include keywords or intro." },
    keywords: { type: Type.STRING, description: "A comma separated list of keywords." },
    journalName: { type: Type.STRING, description: "The name of the Journal this article is published in or submitted to (e.g., Pakistan Journal of Pharmaceutical Sciences)." },
    volume: { type: Type.STRING, description: "The volume number of the journal publication, if present." },
    issue: { type: Type.STRING, description: "The issue number of the journal publication, if present." },
    pages: { type: Type.STRING, description: "The page range (e.g. 10-15), if present." },
    publicationDate: { type: Type.STRING, description: "The date of publication, if present." },
    doi: { type: Type.STRING, description: "The Digital Object Identifier (DOI) of the article, if present." },
    fundingInfo: { type: Type.STRING, description: "Information about funding or financial support." },
    grantNumbers: { type: Type.STRING, description: "Grant numbers associated with funding." },
    conflictOfInterest: { type: Type.STRING, description: "Conflict of interest or competing interest declarations." },
    ethicalApproval: { type: Type.STRING, description: "Ethical approval statements." },
    acknowledgements: { type: Type.STRING, description: "Acknowledgements section text." },
    authors: {
      type: Type.ARRAY,
      description: "A list of all authors of the article.",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "The full name of the author." },
          email: { type: Type.STRING, description: "The email address of the author, if available." },
          orcid: { type: Type.STRING, description: "The ORCID ID of the author, if available." },
          affiliation: { type: Type.STRING, description: "The full affiliation or address of the author." },
          isCorresponding: { type: Type.BOOLEAN, description: "True if this author is marked as the corresponding author." },
          order: { type: Type.INTEGER, description: "The order of this author in the author list (1, 2, 3...)." }
        },
        required: ["name", "order"]
      }
    },
    references: {
      type: Type.ARRAY,
      description: "A list of all references or citations at the end of the document.",
      items: {
        type: Type.OBJECT,
        properties: {
          rawText: { type: Type.STRING, description: "The original full text of the reference." },
          authors: { type: Type.STRING, description: "The authors of the referenced work." },
          title: { type: Type.STRING, description: "The title of the referenced work." },
          journal: { type: Type.STRING, description: "The journal name of the referenced work." },
          year: { type: Type.STRING, description: "The year of publication." },
          volume: { type: Type.STRING, description: "The volume." },
          issue: { type: Type.STRING, description: "The issue." },
          pages: { type: Type.STRING, description: "The pages." },
          doi: { type: Type.STRING, description: "The DOI of the reference." },
          pmid: { type: Type.STRING, description: "The PMID of the reference." }
        },
        required: ["rawText"]
      }
    }
  },
  required: ["title", "abstract", "authors", "references"]
};

export async function extractMetadataWithLLM(buffer: Buffer) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured in the environment.");
  }

  // Extract raw text using Mammoth
  const result = await mammoth.extractRawText({ buffer });
  const rawText = result.value;

  if (!rawText || rawText.trim().length === 0) {
    throw new Error("Could not extract any text from the document.");
  }

  const prompt = `
You are an expert scientific manuscript metadata extractor.
Analyze the following raw text extracted from a scholarly article (.docx).
Your job is to cleanly and accurately extract all metadata fields and format them into the requested JSON schema.

CRITICAL INSTRUCTIONS:
- The title must NOT include the journal name.
- The abstract must strictly be the abstract, with no introductory text or keywords attached.
- Carefully link each author to their specific affiliation. Extract their email and ORCID if present.
- Identify the corresponding author.
- Completely parse the references section at the end of the text.

Here is the raw text:
====================
${rawText}
====================
  `;

  // Call Gemini using structured output
  const response = await ai.models.generateContent({
    model: 'gemini-1.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: metadataSchema,
      temperature: 0.1, // Low temperature for high accuracy/authenticity
    }
  });

  const jsonString = response.text;
  if (!jsonString) {
      throw new Error("Empty response from Gemini.");
  }
  
  const metadata = JSON.parse(jsonString);
  return metadata;
}
