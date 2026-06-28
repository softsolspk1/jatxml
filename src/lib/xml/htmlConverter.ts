export function convertToHTML(metadata: any, authors: any[] = [], references: any[] = [], figures: any[] = [], tables: any[] = [], supplementaryFiles: any[] = []) {
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
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; max-width: 900px; margin: 0 auto; padding: 40px; color: #333; }
        h1 { color: #0A2540; font-size: 2.5em; border-bottom: 2px solid #2ECC71; padding-bottom: 10px; }
        h2 { color: #0A2540; margin-top: 40px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
        .abstract { background: #f9f9f9; padding: 20px; border-left: 4px solid #2ECC71; margin-bottom: 30px; }
        .main-body { margin-top: 30px; }
        .main-body p { margin-bottom: 15px; }
        .keywords { font-weight: bold; color: #555; }
        .figure { text-align: center; margin: 30px 0; }
        .figure img { max-width: 100%; border: 1px solid #ddd; padding: 5px; }
        .table-wrap { margin: 30px 0; overflow-x: auto; }
        .table-wrap table { width: 100%; border-collapse: collapse; }
        .table-wrap th, .table-wrap td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .table-wrap th { background-color: #f2f2f2; }
        .caption { font-size: 0.9em; color: #666; margin-top: 10px; font-style: italic; text-align: center; }
        .reference-list { list-style-type: decimal; padding-left: 20px; }
        .reference-list li { margin-bottom: 10px; }
        .supp-list { list-style-type: square; padding-left: 20px; }
        footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 0.8em; text-align: center; color: #777; }
    </style>
</head>
<body>
    <header>
        <h1>${metadata.title || 'Untitled Article'}</h1>
    </header>

    ${metadata.abstract ? `
    <section class="abstract">
        <h2>Abstract</h2>
        <p>${metadata.abstract}</p>
        ${metadata.keywords ? `<p class="keywords">Keywords: ${metadata.keywords}</p>` : ''}
    </section>
    ` : ''}

    ${metadata.bodyHtml ? `
    <section class="main-body">
        ${metadata.bodyHtml}
    </section>
    ` : ''}

    <section class="figures">
        ${figures.length > 0 ? '<h2>Figures</h2>' : ''}
        ${figures.map(f => `
            <div class="figure">
                <img src="${f.base64Data}" alt="${f.caption}" />
                <div class="caption"><strong>${f.label}:</strong> ${f.caption}</div>
            </div>
        `).join('')}
    </section>

    <section class="tables">
        ${tables.length > 0 ? '<h2>Tables</h2>' : ''}
        ${tables.map(t => `
            <div class="table-wrap">
                <div class="caption"><strong>${t.label}:</strong> ${t.caption}</div>
                ${t.htmlContent}
            </div>
        `).join('')}
    </section>

    <section class="supplementary">
        ${supplementaryFiles.length > 0 ? '<h2>Supplementary Materials</h2><ul class="supp-list">' : ''}
        ${supplementaryFiles.map((s, idx) => `
            <li>
                <strong>Supplementary File ${idx + 1}:</strong> ${s.filename} (${s.type}) - ${(s.size / 1024).toFixed(2)} KB
            </li>
        `).join('')}
        ${supplementaryFiles.length > 0 ? '</ul>' : ''}
    </section>

    <section class="references">
        ${references.length > 0 ? '<h2>References</h2><ol class="reference-list">' : ''}
        ${references.map(r => `
            <li>
                ${r.rawText}
                ${r.doi ? `<br/><a href="https://doi.org/${r.doi}" target="_blank">doi:${r.doi}</a>` : ''}
            </li>
        `).join('')}
        ${references.length > 0 ? '</ol>' : ''}
    </section>

    <footer>
        <p>Generated by Automated JATS XML Conversion Platform &copy; 2026 Softsols Pakistan</p>
    </footer>
</body>
</html>
  `.trim();
}
