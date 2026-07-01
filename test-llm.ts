import fs from "fs";
import { extractMetadataWithLLM } from "./src/lib/extractor/llmParser";

async function test() {
  try {
    const buf = fs.readFileSync("55.docx");
    const res = await extractMetadataWithLLM(buf);
    console.log(JSON.stringify(res, null, 2));
  } catch(e) {
    console.error(e);
  }
}
test();
