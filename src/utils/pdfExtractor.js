import * as pdfjsLib from 'pdfjs-dist';
import { extractTextWithOcr } from './ocrEngine';

// Configure PDF.js worker using matching CDN
if (typeof window !== 'undefined' && pdfjsLib) {
  try {
    const version = pdfjsLib.version || '4.10.38';
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.mjs`;
  } catch (e) {
    console.warn('PDF.js worker setup fallback:', e);
  }
}

/**
 * Extract clean text from a PDF File or ArrayBuffer.
 * If the PDF has text layers, extracts with spatial layout.
 * If the PDF is scanned / image-based, renders pages to canvas and runs OCR.
 * 
 * @param {File|ArrayBuffer} fileOrBuffer
 * @param {Function} onProgress Optional progress callback (page, totalPages)
 * @returns {Promise<{ text: string, pageCount: number }>}
 */
export async function extractTextFromPdf(fileOrBuffer, onProgress = null) {
  let arrayBuffer;
  if (fileOrBuffer instanceof ArrayBuffer) {
    arrayBuffer = fileOrBuffer;
  } else if (fileOrBuffer && typeof fileOrBuffer.arrayBuffer === 'function') {
    arrayBuffer = await fileOrBuffer.arrayBuffer();
  } else {
    throw new Error('Geçersiz PDF verisi.');
  }

  // Load document with pdf.js
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    useSystemFonts: true,
    disableFontFace: true,
    isEvalSupported: false
  });

  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;
  const fullTextPages = [];
  let totalTextLength = 0;

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    if (onProgress) {
      onProgress(pageNum, numPages);
    }

    const page = await pdfDoc.getPage(pageNum);
    const textContent = await page.getTextContent({
      normalizeWhitespace: true,
      disableCombineTextItems: false
    });

    const items = textContent.items || [];
    
    // If text layer exists on this page
    if (items.length > 0) {
      const lineMap = new Map();
      const Y_TOLERANCE = 4;

      items.forEach(item => {
        if (!item.str || item.str.trim() === '') return;
        const [, , , , x, y] = item.transform;
        
        let foundLineKey = null;
        for (const existingY of lineMap.keys()) {
          if (Math.abs(existingY - y) <= Y_TOLERANCE) {
            foundLineKey = existingY;
            break;
          }
        }

        if (foundLineKey === null) {
          foundLineKey = y;
          lineMap.set(foundLineKey, []);
        }

        lineMap.get(foundLineKey).push({ text: item.str, x, y });
      });

      const sortedYKeys = Array.from(lineMap.keys()).sort((a, b) => b - a);
      const pageLines = sortedYKeys.map(yKey => {
        const lineItems = lineMap.get(yKey);
        lineItems.sort((a, b) => a.x - b.x);

        let lineStr = '';
        let prevX = null;
        lineItems.forEach(item => {
          if (prevX !== null && (item.x - prevX) > 15) {
            lineStr += '   ';
          } else if (lineStr.length > 0 && !lineStr.endsWith(' ')) {
            lineStr += ' ';
          }
          lineStr += item.text.trim();
          prevX = item.x + (item.text.length * 5);
        });

        return lineStr;
      });

      const pageText = pageLines.join('\n');
      totalTextLength += pageText.trim().length;
      fullTextPages.push(pageText);
    } else {
      fullTextPages.push('');
    }
  }

  // If text layer yielded very little or no text (e.g. Scanned PDF invoice), run OCR on rendered canvases
  if (totalTextLength < 30) {
    const ocrTextPages = [];
    for (let pageNum = 1; pageNum <= Math.min(numPages, 10); pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2.0 }); // 2x scale for crisp OCR
      
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const canvasContext = canvas.getContext('2d');

      await page.render({ canvasContext, viewport }).promise;
      
      const ocrPageText = await extractTextWithOcr(canvas);
      if (ocrPageText) {
        ocrTextPages.push(ocrPageText);
      }
    }

    if (ocrTextPages.length > 0) {
      return {
        text: ocrTextPages.join('\n\n'),
        pageCount: numPages
      };
    }
  }

  const combinedText = fullTextPages.join('\n\n--- SAYFA AYRACI ---\n\n');
  return {
    text: combinedText,
    pageCount: numPages
  };
}
