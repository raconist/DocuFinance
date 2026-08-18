import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker using unpkg / CDN fallback for reliable browser execution
if (typeof window !== 'undefined' && pdfjsLib) {
  try {
    // Set standard worker source matching pdfjs-dist version or cdnjs
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs`;
  } catch (e) {
    console.warn('PDF.js worker setup fallback:', e);
  }
}

/**
 * Extract clean, spatially-ordered text from a PDF File or ArrayBuffer.
 * Preserves horizontal alignment so bank statement tables (Date, Description, Debit, Credit, Balance)
 * are kept on the same line.
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
    if (items.length === 0) continue;

    // Group items by line based on their vertical (Y) coordinate
    // PDF coordinates have (0,0) at bottom-left, so higher Y is higher on page
    const lineMap = new Map();
    const Y_TOLERANCE = 4; // Pixel tolerance for items on the same line

    items.forEach(item => {
      if (!item.str || item.str.trim() === '') return;
      
      const [, , , , x, y] = item.transform;
      
      // Find existing line within Y tolerance
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

      lineMap.get(foundLineKey).push({
        text: item.str,
        x: x,
        y: y
      });
    });

    // Sort lines from top to bottom (descending Y)
    const sortedYKeys = Array.from(lineMap.keys()).sort((a, b) => b - a);

    const pageLines = sortedYKeys.map(yKey => {
      const lineItems = lineMap.get(yKey);
      // Sort items on the same line from left to right (ascending X)
      lineItems.sort((a, b) => a.x - b.x);

      // Join items with intelligent spacing
      let lineStr = '';
      let prevX = null;
      lineItems.forEach(item => {
        if (prevX !== null && (item.x - prevX) > 15) {
          lineStr += '   '; // Tab-like spacing for columns
        } else if (lineStr.length > 0 && !lineStr.endsWith(' ')) {
          lineStr += ' ';
        }
        lineStr += item.text.trim();
        prevX = item.x + (item.text.length * 5); // Approximate text width
      });

      return lineStr;
    });

    fullTextPages.push(pageLines.join('\n'));
  }

  const combinedText = fullTextPages.join('\n\n--- SAYFA AYRACI ---\n\n');
  return {
    text: combinedText,
    pageCount: numPages
  };
}
