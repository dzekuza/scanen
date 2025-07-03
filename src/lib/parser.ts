import fs from 'fs/promises';
import path from 'path';
import pdfParse from 'pdf-parse';
import * as XLSX from 'xlsx';

export async function parseFile(filePath: string): Promise<string> {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.pdf') {
    const data = await fs.readFile(filePath);
    const pdf = await pdfParse(data);
    return pdf.text;
  } else if (ext === '.xlsx') {
    const data = await fs.readFile(filePath);
    const workbook = XLSX.read(data, { type: 'buffer' });
    let text = '';
    workbook.SheetNames.forEach(sheetName => {
      const sheet = workbook.Sheets[sheetName];
      text += XLSX.utils.sheet_to_csv(sheet) + '\n';
    });
    return text;
  } else {
    throw new Error('Unsupported file type');
  }
} 