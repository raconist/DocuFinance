import { createWorker } from 'tesseract.js';

/**
 * DocuFinance AI - Client-Side OCR Engine
 * Extracts text from scanned document images (PNG, JPG, WEBP)
 * or rendered PDF page canvases entirely inside the browser.
 */

let workerInstance = null;

export async function getOcrWorker(onProgress = null) {
  if (!workerInstance) {
    workerInstance = await createWorker('tur+eng', 1, {
      logger: m => {
        if (onProgress && m.status === 'recognizing text') {
          onProgress(Math.round(m.progress * 100));
        }
      }
    });
  }
  return workerInstance;
}

/**
 * Perform OCR on an image File, Blob, or Canvas
 * @param {File|Blob|HTMLCanvasElement|string} imageSource 
 * @param {Function} onProgress Optional progress callback (0-100)
 * @returns {Promise<string>} Extracted raw text
 */
export async function extractTextWithOcr(imageSource, onProgress = null) {
  try {
    const worker = await getOcrWorker(onProgress);
    const ret = await worker.recognize(imageSource);
    return ret.data.text || '';
  } catch (err) {
    console.error('OCR recognition error:', err);
    throw new Error('Görsel üzerindeki metinler taranırken bir hata oluştu: ' + err.message);
  }
}
