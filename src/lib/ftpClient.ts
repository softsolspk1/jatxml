import Client from 'ssh2-sftp-client';
import { ZipArchive } from 'archiver';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { db } from './db';

/**
 * Packages XML and images into a zip and uploads via SFTP to NLM/Elsevier
 */
export async function uploadToFtp(articleId: string, xmlFiles: { name: string, content: string }[]) {
  const settings = await db.systemSettings.findUnique({ where: { id: "global" } });
  if (!settings?.pmcFtpHost || !settings?.pmcFtpUser || !settings?.pmcFtpPassword) {
    throw new Error('FTP Credentials not configured in System Settings.');
  }

  const sftp = new Client();
  const tmpDir = os.tmpdir();
  const zipPath = path.join(tmpDir, `article_${articleId}.zip`);

  try {
    // 1. Create ZIP Archive
    await new Promise<void>((resolve, reject) => {
      const output = fs.createWriteStream(zipPath);
      const archive = new ZipArchive({ zlib: { level: 9 } });

      output.on('close', () => resolve());
      archive.on('error', (err: any) => reject(err));

      archive.pipe(output);

      // Append XML files
      for (const file of xmlFiles) {
        archive.append(file.content, { name: file.name });
      }

      archive.finalize();
    });

    // 2. Upload via SFTP
    await sftp.connect({
      host: settings.pmcFtpHost,
      port: 22,
      username: settings.pmcFtpUser,
      password: settings.pmcFtpPassword
    });

    const remotePath = `/incoming/article_${articleId}.zip`; // Standard NLM incoming path
    await sftp.put(zipPath, remotePath);

    return true;
  } catch (error) {
    console.error('SFTP Upload Error:', error);
    throw error;
  } finally {
    // Cleanup
    if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
    try { await sftp.end(); } catch (e) {}
  }
}
