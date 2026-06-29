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
        .reference-list { list-style-type: decimal; padding-left: 20px; text-align: left; }
        .reference-list li { margin-bottom: 10px; }
        .supp-list { list-style-type: square; padding-left: 20px; text-align: left; }
        footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 0.8em; text-align: center; color: #777; }
    </style>
</head>
<body>
    <header>
        <h1>${metadata.title || 'Untitled Article'}</h1>
        
        ${authors && authors.length > 0 ? `
        <div class="authors" style="margin-top: 15px; font-size: 1.1em; color: #444;">
            ${authors.map(a => `<span style="margin-right: 15px;"><strong>${a.name}</strong>${a.affiliation ? `<br><small style="color: #666;">${a.affiliation}</small>` : ''}</span>`).join('')}
        </div>
        ` : ''}
        
        <div class="publication-details" style="margin-top: 20px; padding: 15px; background: #f0f7ff; border-radius: 5px; font-size: 0.9em;">
            ${metadata.journalName ? `<strong>Journal:</strong> ${metadata.journalName} &nbsp;|&nbsp; ` : ''}
            ${metadata.volume ? `<strong>Volume:</strong> ${metadata.volume} &nbsp;|&nbsp; ` : ''}
            ${metadata.issue ? `<strong>Issue:</strong> ${metadata.issue} &nbsp;|&nbsp; ` : ''}
            ${metadata.pages ? `<strong>Pages:</strong> ${metadata.pages} &nbsp;|&nbsp; ` : ''}
            ${metadata.publicationDate ? `<strong>Date:</strong> ${new Date(metadata.publicationDate).toISOString().split('T')[0]} &nbsp;|&nbsp; ` : ''}
            ${metadata.doi ? `<strong>DOI:</strong> <a href="https://doi.org/${metadata.doi}" target="_blank">${metadata.doi}</a>` : ''}
        </div>
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
        ${figures.map(f => {
            if (!f.base64Data) return '';
            const imgSrc = f.base64Data.startsWith('data:image') 
              ? f.base64Data 
              : `data:image/png;base64,${f.base64Data}`;
            
            const isUnsupported = imgSrc.includes('x-wmf') || imgSrc.includes('x-emf');
            
            if (isUnsupported) {
                return `
                <div class="figure">
                    <div style="width: 100%; height: 200px; display: flex; align-items: center; justify-content: center; background-color: #f3f4f6; border: 1px dashed #ccc; color: #666; text-align: center; border-radius: 4px;">
                        <p style="margin: 0; padding: 20px;">🖼️ <strong>Image format is not supported for browser preview.</strong><br/>It will be included in the exported package.</p>
                    </div>
                    <div class="caption"><strong>${f.label || 'Figure'}:</strong> ${f.caption || ''}</div>
                </div>
                `;
            }

            return `
            <div class="figure">
                <img src="${imgSrc}" alt="${f.caption || ''}" />
                <div class="caption"><strong>${f.label || 'Figure'}:</strong> ${f.caption || ''}</div>
            </div>
        `}).join('')}
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
