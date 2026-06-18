import { Readable } from 'stream';
import busboy from 'busboy';

export interface ParsedFile {
  fieldname: string;
  filename: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
}

export async function parseFormData(
  req: Request
): Promise<{ fields: Record<string, string>; files: ParsedFile[] }> {
  const contentType = req.headers.get('content-type') || '';

  if (!contentType.includes('multipart/form-data')) {
    throw new Error('Invalid content type');
  }

  const fields: Record<string, string> = {};
  const files: ParsedFile[] = [];

  const bb = busboy({ headers: { 'content-type': contentType } });

  const body = await req.arrayBuffer();
  const stream = Readable.from(Buffer.from(body));

  return new Promise((resolve, reject) => {
    bb.on('file', (fieldname: string, file: any, info: any) => {
      const { filename, encoding, mimetype } = info;
      const chunks: Buffer[] = [];

      file.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });

      file.on('end', () => {
        files.push({
          fieldname,
          filename,
          encoding,
          mimetype,
          buffer: Buffer.concat(chunks),
        });
      });

      file.on('error', reject);
    });

    bb.on('field', (fieldname: string, val: string) => {
      fields[fieldname] = val;
    });

    bb.on('finish', () => {
      resolve({ fields, files });
    });

    bb.on('error', reject);

    stream.pipe(bb);
  });
}
