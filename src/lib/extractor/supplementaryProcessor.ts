import AdmZip from 'adm-zip';
import path from 'path';

export interface SupplementaryFile {
  filename: string;
  size: number;
  type: 'PDF' | 'DOCX' | 'XLSX' | 'Image' | 'ZIP' | 'Other';
  mimeType: string;
  buffer: Buffer;
}

export function processSupplementaryZip(zipBuffer: Buffer): SupplementaryFile[] {
  const zip = new AdmZip(zipBuffer);
  const zipEntries = zip.getEntries();
  
  const files: SupplementaryFile[] = [];

  zipEntries.forEach((entry) => {
    if (!entry.isDirectory) {
      const filename = entry.entryName;
      // Skip hidden files or macOS artifacts
      if (filename.includes('__MACOSX') || filename.startsWith('.')) return;

      const ext = path.extname(filename).toLowerCase();
      let type: SupplementaryFile['type'] = 'Other';
      let mimeType = 'application/octet-stream';

      if (ext === '.pdf') {
        type = 'PDF';
        mimeType = 'application/pdf';
      } else if (ext === '.docx' || ext === '.doc') {
        type = 'DOCX';
        mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      } else if (ext === '.xlsx' || ext === '.xls') {
        type = 'XLSX';
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      } else if (['.jpg', '.jpeg', '.png', '.gif', '.tif', '.tiff'].includes(ext)) {
        type = 'Image';
        if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
        else if (ext === '.png') mimeType = 'image/png';
        else if (ext === '.gif') mimeType = 'image/gif';
        else if (ext === '.tif' || ext === '.tiff') mimeType = 'image/tiff';
      } else if (ext === '.zip') {
        type = 'ZIP';
        mimeType = 'application/zip';
      }

      files.push({
        filename: path.basename(filename),
        size: entry.header.size,
        type,
        mimeType,
        buffer: entry.getData()
      });
    }
  });

  return files;
}
