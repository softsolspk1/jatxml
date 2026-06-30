export function convertToHTML(metadata: any, authors: any[] = [], references: any[] = [], figures: any[] = [], tables: any[] = [], supplementaryFiles: any[] = []) {
  
  let processedBodyHtml = metadata.bodyHtml || '';
  let processedAbstract = metadata.abstract || '';

  if (references && references.length > 0) {
    // Regex for bracketed citations: [1], [1, 2], [1-3]
    const bracketRegex = /\[([0-9,\s-]+)\]/g;
    const bracketReplacer = (match: string, p1: string) => {
      const innerLinked = p1.replace(/\b(\d+)\b/g, '<a href="#ref-$1" style="color: #0056b3; text-decoration: none;">$1</a>');
      return `[${innerLinked}]`;
    };
    
    // Regex for superscript citations: <sup>1</sup>, <sup>1, 2</sup>
    const supRegex = /<sup[^>]*>([0-9,\s-]+)<\/sup>/g;
    const supReplacer = (match: string, p1: string) => {
      const innerLinked = p1.replace(/\b(\d+)\b/g, '<a href="#ref-$1" style="color: #0056b3; text-decoration: none;">$1</a>');
      return `<sup>${innerLinked}</sup>`;
    };

    processedBodyHtml = processedBodyHtml.replace(bracketRegex, bracketReplacer).replace(supRegex, supReplacer);
    processedAbstract = processedAbstract.replace(bracketRegex, bracketReplacer).replace(supRegex, supReplacer);
  }

  // A clean, stylized HTML representation of the extracted metadata and article contents.
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${metadata.title || 'Research Article'}</title>
    
    <!-- HighWire Press tags for Google Scholar Indexing -->
    <meta name="citation_title" content="${metadata.title || 'Untitled Article'}">
    ${metadata.journalName ? `<meta name="citation_journal_title" content="${metadata.journalName}">` : ''}
    ${metadata.publicationDate ? `<meta name="citation_publication_date" content="${new Date(metadata.publicationDate).getFullYear()}">` : ''}
    ${metadata.volume ? `<meta name="citation_volume" content="${metadata.volume}">` : ''}
    ${metadata.issue ? `<meta name="citation_issue" content="${metadata.issue}">` : ''}
    ${metadata.doi ? `<meta name="citation_doi" content="${metadata.doi}">` : ''}
    ${metadata.pages ? `<meta name="citation_firstpage" content="${metadata.pages.split(/[-–]/)[0]?.trim() || ''}">` : ''}
    ${metadata.abstract ? `<meta name="citation_abstract" content="${metadata.abstract.replace(/"/g, '&quot;')}">` : ''}
    ${(authors || []).map((author: any) => `<meta name="citation_author" content="${author.name}">
    ${author.affiliation ? `<meta name="citation_author_institution" content="${author.affiliation}">` : ''}`).join('\n    ')}
    
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; max-width: 900px; margin: 0 auto; padding: 40px; color: #333; text-align: justify; }
        h1, h2, h3, h4, h5, h6 { text-align: left; }
        h1 { color: #0A2540; font-size: 2.5em; border-bottom: 2px solid #2ECC71; padding-bottom: 10px; }
        h2 { color: #0A2540; margin-top: 40px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
        .abstract { background: #f9f9f9; padding: 20px; border-left: 4px solid #2ECC71; margin-bottom: 30px; text-align: justify; }
        .main-body { margin-top: 30px; }
        .main-body p { margin-bottom: 15px; text-align: justify; }
        .keywords { font-weight: bold; color: #555; text-align: left; }
        .figure { text-align: center; margin: 30px 0; }
        .figure img { max-width: 100%; border: 1px solid #ddd; padding: 5px; }
        .table-wrap { margin: 30px 0; overflow-x: auto; text-align: left; }
        .table-wrap table { width: 100%; border-collapse: collapse; }
        .table-wrap th, .table-wrap td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .table-wrap th { background-color: #f2f2f2; }
        .caption { font-size: 0.9em; color: #666; margin-top: 10px; font-style: italic; text-align: center; }
        .reference-list { list-style-type: none; padding-left: 0; text-align: left; }
        .reference-list li { margin-bottom: 15px; padding-left: 2em; text-indent: -2em; }
        .reference-list li a { color: #0056b3; text-decoration: none; }
        .reference-list li a:hover { text-decoration: underline; }
        .supp-list { list-style-type: square; padding-left: 20px; text-align: left; }
        footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 0.8em; text-align: center; color: #777; }
        .author-list { font-size: 1.2em; font-weight: bold; color: #000; margin-top: 20px; }
        .affiliation-list { font-size: 0.9em; color: #444; margin-top: 10px; list-style: none; padding-left: 0; }
        .affiliation-list li { margin-bottom: 5px; }
    </style>
</head>
<body>
    <header>
        <h1>${metadata.title || 'Untitled Article'}</h1>
        
        ${(function() {
            if (!authors || authors.length === 0) return '';
            
            const uniqueAffiliations: string[] = [];
            const authorStrings: string[] = authors.map((a: any) => {
                let rawName = a.name ? a.name.trim() : '';
                // Extract any combination of digits, #, *, comma at the end of the string
                let match = rawName.match(/^(.*?)([\d#*,]+)$/);
                let cleanName = rawName;
                let marks = '';
                if (match) {
                    cleanName = match[1].trim();
                    marks = match[2];
                }

                if (a.affiliation) {
                    // Try splitting the giant affiliation string by newlines or numbers followed by a letter
                    let splitAffils = a.affiliation.split(/\n|(?=\b[1-9]+[a-zA-Z])/).map((s: string) => s.trim()).filter((s: string) => s.length > 0);
                    splitAffils.forEach((affil: string) => {
                        if (!uniqueAffiliations.includes(affil)) {
                            uniqueAffiliations.push(affil);
                        }
                    });
                }
                
                // If the author has a special mark like # or *, but didn't have one baked into the name string
                if (a.isCorresponding && !marks.includes('*')) marks += '*';
                
                return `${cleanName}${marks ? `<sup>${marks}</sup>` : ''}`;
            });
            
            let authorsHtml = '';
            if (authorStrings.length === 1) {
                authorsHtml = authorStrings[0];
            } else if (authorStrings.length > 1) {
                authorsHtml = authorStrings.slice(0, -1).join(', ') + ' and ' + authorStrings[authorStrings.length - 1];
            }
            
            const affiliationsHtml = uniqueAffiliations.map((affil, idx) => {
                // If it already starts with a number, we wrap it nicely
                let match = affil.match(/^([1-9]+)(.*)/);
                if (match) {
                   return `<li><sup>${match[1]}</sup>${match[2].trim()}</li>`;
                }
                return `<li><sup>${idx + 1}</sup>${affil}</li>`;
            }).join('');
            
            return `
            <div class="author-section">
                <div class="author-list">${authorsHtml}</div>
                ${uniqueAffiliations.length > 0 ? `<ul class="affiliation-list">${affiliationsHtml}</ul>` : ''}
            </div>
            `;
        })()}
        
        <div class="publication-details" style="margin-top: 20px; padding: 15px; background: #f0f7ff; border-radius: 5px; font-size: 0.9em;">
            ${metadata.journalName ? `<strong>Journal:</strong> ${metadata.journalName} &nbsp;|&nbsp; ` : ''}
            ${metadata.volume ? `<strong>Volume:</strong> ${metadata.volume} &nbsp;|&nbsp; ` : ''}
            ${metadata.issue ? `<strong>Issue:</strong> ${metadata.issue} &nbsp;|&nbsp; ` : ''}
            ${metadata.pages ? `<strong>Pages:</strong> ${metadata.pages} &nbsp;|&nbsp; ` : ''}
            ${metadata.publicationDate ? `<strong>Date:</strong> ${new Date(metadata.publicationDate).toISOString().split('T')[0]} &nbsp;|&nbsp; ` : ''}
            ${metadata.doi ? `<strong>DOI:</strong> <a href="https://doi.org/${metadata.doi}" target="_blank">${metadata.doi}</a>` : ''}
        </div>
    </header>

    ${processedAbstract ? `
    <section class="abstract">
        <h2>Abstract</h2>
        <p>${processedAbstract}</p>
        ${metadata.keywords ? `<p class="keywords">Keywords: ${metadata.keywords}</p>` : ''}
    </section>
    ` : ''}

    ${processedBodyHtml ? `
    <section class="main-body">
        ${processedBodyHtml}
    </section>
    ` : ''}

    ${references && references.length > 0 ? `
    <section class="references" id="references-section">
        <h2>References</h2>
        <ul class="reference-list">
            ${references.map((r, idx) => `
                <li id="ref-${idx + 1}">
                    ${r.rawText}
                    ${r.doi ? `<br><a href="https://doi.org/${r.doi}" target="_blank">https://doi.org/${r.doi}</a>` : ''}
                </li>
            `).join('')}
        </ul>
    </section>
    ` : ''}

    <section class="supplementary">
        ${supplementaryFiles && supplementaryFiles.length > 0 ? '<h2>Supplementary Materials</h2><ul class="supp-list">' : ''}
        ${supplementaryFiles ? supplementaryFiles.map((s, idx) => `
            <li>
                <strong>Supplementary File ${idx + 1}:</strong> ${s.filename} (${s.type}) - ${(s.size / 1024).toFixed(2)} KB
            </li>
        `).join('') : ''}
        ${supplementaryFiles && supplementaryFiles.length > 0 ? '</ul>' : ''}
    </section>

    <footer>
        <p>Generated by Automated JATS XML Conversion Platform &copy; 2026 Softsols Pakistan</p>
    </footer>

    <!-- WMF/EMF Image Renderer Script -->
    <script src="https://unpkg.com/wmf@1.0.2/wmf.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            var imgs = document.querySelectorAll('img[src^="data:image/x-wmf"], img[src^="data:image/x-emf"]');
            imgs.forEach(function(img) {
                try {
                    var src = img.src;
                    var base64Data = src.split(';base64,')[1];
                    if (!base64Data) return;
                    
                    // Decode base64 to Uint8Array
                    var binaryString = atob(base64Data);
                    var len = binaryString.length;
                    var bytes = new Uint8Array(len);
                    for (var i = 0; i < len; i++) {
                        bytes[i] = binaryString.charCodeAt(i);
                    }
                    
                    // Parse WMF
                    var wmfObj = WMF.parse(bytes);
                    var canvas = document.createElement("canvas");
                    
                    // Draw to canvas
                    WMF.draw_canvas(wmfObj, canvas);
                    
                    // Replace img src with standard PNG data URL
                    img.src = canvas.toDataURL("image/png");
                    img.style.maxWidth = "100%";
                    img.style.border = "1px solid #ccc";
                } catch (e) {
                    console.error("Failed to render WMF/EMF image", e);
                }
            });
        });
    </script>
</body>
</html>
  `.trim();
}
