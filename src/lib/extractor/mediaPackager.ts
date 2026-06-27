import JSZip from 'jszip';

export interface Figure {
  label: string;
  base64Data: string; // expected to be like "data:image/png;base64,iVBORw0KGgo..."
  caption: string;
}

export interface Table {
  label: string;
  htmlContent: string;
  caption: string;
}

export async function packageMedia(figures: Figure[], tables: Table[]): Promise<Buffer> {
  const zip = new JSZip();

  const figuresFolder = zip.folder("figures");
  if (figuresFolder && figures.length > 0) {
    figures.forEach((fig, index) => {
      const parts = fig.base64Data.split(';base64,');
      let extension = 'png';
      
      if (parts.length === 2) {
        const mimeMatch = parts[0].match(/image\/(jpeg|png|gif|webp|svg\+xml)/);
        if (mimeMatch) {
          extension = mimeMatch[1] === 'svg+xml' ? 'svg' : mimeMatch[1];
        }
        const base64Data = parts[1];
        
        // Clean label for filename
        const cleanLabel = fig.label.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const filename = `${cleanLabel || `figure_${index + 1}`}.${extension}`;
        
        figuresFolder.file(filename, base64Data, { base64: true });
      }
    });
  }

  const tablesFolder = zip.folder("tables");
  if (tablesFolder && tables.length > 0) {
    tables.forEach((table, index) => {
      const cleanLabel = table.label.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const filename = `${cleanLabel || `table_${index + 1}`}.html`;
      
      // Simple HTML wrapper for the table
      const htmlDoc = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${table.label}</title>
<style>
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
  th { background-color: #f2f2f2; }
</style>
</head>
<body>
  <h2>${table.label}</h2>
  <p>${table.caption}</p>
  ${table.htmlContent}
</body>
</html>`;
      
      tablesFolder.file(filename, htmlDoc);
    });
  }

  const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
  return zipBuffer;
}
