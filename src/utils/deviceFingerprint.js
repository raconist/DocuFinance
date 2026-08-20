/**
 * DocuFinance AI - Hardware & Browser Device Fingerprinting Engine
 * Generates a privacy-friendly, unique device signature using Canvas, WebGL, Audio,
 * Screen and Hardware metrics to prevent multi-account abuse per computer/device.
 */

import { generateDocumentHash } from './security';

const DEVICE_STORAGE_KEY = 'docufinance_device_sig_v1';

/**
 * Generate Canvas 2D Fingerprint
 */
function getCanvasFingerprint() {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 240;
    canvas.height = 60;
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'canvas_unsupported';

    ctx.textBaseline = 'top';
    ctx.font = "14px 'Arial', sans-serif";
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);

    ctx.fillStyle = '#069';
    ctx.fillText('DocuFinance,Secure!✨', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('DocuFinance,Secure!✨', 4, 17);

    return canvas.toDataURL();
  } catch (e) {
    return 'canvas_error';
  }
}

/**
 * Generate WebGL GPU Renderer Fingerprint
 */
function getWebGLFingerprint() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return 'webgl_unsupported';

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) return 'webgl_nodebug';

    const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || '';
    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '';
    return `${vendor}~${renderer}`;
  } catch (e) {
    return 'webgl_error';
  }
}

/**
 * Generate Hardware & Environment Metrics
 */
function getEnvironmentMetrics() {
  if (typeof window === 'undefined') return {};

  return {
    screenRes: `${window.screen?.width || 0}x${window.screen?.height || 0}x${window.screen?.colorDepth || 0}`,
    availRes: `${window.screen?.availWidth || 0}x${window.screen?.availHeight || 0}`,
    cores: navigator.hardwareConcurrency || 2,
    deviceMemory: navigator.deviceMemory || 4,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    language: navigator.language || 'tr',
    languages: (navigator.languages || []).join(','),
    platform: navigator.platform || '',
    pixelRatio: window.devicePixelRatio || 1
  };
}

/**
 * Get or compute persistent unique device fingerprint
 */
export async function getDeviceFingerprint() {
  if (typeof window === 'undefined') return 'device_server_fallback';

  try {
    // 1. Check cached local signature
    const cached = localStorage.getItem(DEVICE_STORAGE_KEY);
    if (cached && cached.length >= 16) {
      return cached;
    }

    // 2. Gather hardware & rendering signals
    const canvasSig = getCanvasFingerprint();
    const webglSig = getWebGLFingerprint();
    const metrics = getEnvironmentMetrics();

    const rawPayload = JSON.stringify({
      canvas: canvasSig,
      webgl: webglSig,
      ...metrics
    });

    // 3. Hash to produce a unique 32-char device ID
    const hash = await generateDocumentHash(rawPayload);
    const deviceId = `dev_${hash.substring(0, 24)}`;

    // 4. Cache locally
    localStorage.setItem(DEVICE_STORAGE_KEY, deviceId);
    return deviceId;
  } catch (e) {
    console.warn('Device fingerprint computation error:', e);
    const fallbackId = `dev_fb_${Date.now()}`;
    localStorage.setItem(DEVICE_STORAGE_KEY, fallbackId);
    return fallbackId;
  }
}

/**
 * Check if current device already has a registered account
 */
export function isDeviceAlreadyRegistered(existingUsers = [], currentDeviceId = '') {
  if (!currentDeviceId || !existingUsers.length) return null;
  return existingUsers.find(u => u.deviceFingerprint === currentDeviceId);
}
