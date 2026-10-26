import { drawPhotoOverlayOnCanvas } from "./photoOverlays.js";

export const QUALITY_PRESETS = {
  standard: {
    id: "standard",
    label: "Estándar Full HD (1920px · ~180 KB)",
    maxDim: 1920,
    quality: 0.85,
  },
  hd: {
    id: "hd",
    label: "Alta Definición HD 2.5K (2560px · ~480 KB)",
    maxDim: 2560,
    quality: 0.9,
  },
  ultrahd: {
    id: "ultrahd",
    label: "Ultra HD 4K Fotográfico (3840px · ~950 KB)",
    maxDim: 3840,
    quality: 0.92,
  },
};

function encodeCanvasDual(
  sourceElement,
  srcWidth,
  srcHeight,
  presetKey = "hd",
  overlayConfig = null
) {
  const preset = QUALITY_PRESETS[presetKey] || QUALITY_PRESETS.hd;

  // 1. Calcular dimensiones HD respetando proporción original (sin agrandar fotos pequeñas)
  const maxSide = Math.max(srcWidth, srcHeight, 1);
  const scaleHd = maxSide > preset.maxDim ? preset.maxDim / maxSide : 1;
  const hdWidth = Math.max(1, Math.round(srcWidth * scaleHd));
  const hdHeight = Math.max(1, Math.round(srcHeight * scaleHd));

  const hdCanvas = document.createElement("canvas");
  hdCanvas.width = hdWidth;
  hdCanvas.height = hdHeight;
  const hdCtx = hdCanvas.getContext("2d");
  if (hdCtx) {
    hdCtx.imageSmoothingEnabled = true;
    hdCtx.imageSmoothingQuality = "high";
    hdCtx.drawImage(sourceElement, 0, 0, hdWidth, hdHeight);
    if (overlayConfig && overlayConfig.designId && overlayConfig.designId !== "none") {
      drawPhotoOverlayOnCanvas(hdCtx, hdWidth, hdHeight, overlayConfig);
    }
  }

  let hdDataUrl = hdCanvas.toDataURL("image/webp", preset.quality);
  if (!hdDataUrl.startsWith("data:image/webp")) {
    hdDataUrl = hdCanvas.toDataURL("image/jpeg", preset.quality);
  }

  // 2. Generar miniatura ultraligera (~420px) para la galería rápida
  const thumbMaxDim = 420;
  const scaleThumb = maxSide > thumbMaxDim ? thumbMaxDim / maxSide : 1;
  const thumbWidth = Math.max(1, Math.round(srcWidth * scaleThumb));
  const thumbHeight = Math.max(1, Math.round(srcHeight * scaleThumb));

  const thumbCanvas = document.createElement("canvas");
  thumbCanvas.width = thumbWidth;
  thumbCanvas.height = thumbHeight;
  const thumbCtx = thumbCanvas.getContext("2d");
  if (thumbCtx) {
    thumbCtx.imageSmoothingEnabled = true;
    thumbCtx.imageSmoothingQuality = "high";
    thumbCtx.drawImage(sourceElement, 0, 0, thumbWidth, thumbHeight);
    if (overlayConfig && overlayConfig.designId && overlayConfig.designId !== "none") {
      drawPhotoOverlayOnCanvas(thumbCtx, thumbWidth, thumbHeight, overlayConfig);
    }
  }

  let thumbDataUrl = thumbCanvas.toDataURL("image/webp", 0.8);
  if (!thumbDataUrl.startsWith("data:image/webp")) {
    thumbDataUrl = thumbCanvas.toDataURL("image/jpeg", 0.8);
  }

  return {
    hdDataUrl,
    thumbDataUrl,
    width: hdWidth,
    height: hdHeight,
  };
}

/**
 * Captura un cuadro directamente del elemento <video> de la cámara en vivo
 * y genera la versión WebP HD + Miniatura (con el Overlay elegido si está activo).
 */
export function captureVideoFrameDual(
  videoEl,
  presetKey = "hd",
  overlayConfig = null
) {
  const vw = Number(videoEl?.videoWidth) || 1920;
  const vh = Number(videoEl?.videoHeight) || 1080;
  return encodeCanvasDual(videoEl, vw, vh, presetKey, overlayConfig);
}

/**
 * Procesa un archivo de imagen (File/Blob) desde la galería o cámara nativa del celular
 * y genera la versión WebP HD + Miniatura (con el Overlay elegido si está activo).
 */
export function optimizeImageFileDual(
  file,
  presetKey = "hd",
  overlayConfig = null
) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("No se seleccionó ningún archivo."));
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const result = encodeCanvasDual(
          img,
          img.naturalWidth || img.width || 1920,
          img.naturalHeight || img.height || 1080,
          presetKey,
          overlayConfig
        );
        URL.revokeObjectURL(objectUrl);
        resolve(result);
      } catch (err) {
        URL.revokeObjectURL(objectUrl);
        reject(err);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("No se pudo procesar el archivo de imagen seleccionado."));
    };
    img.src = objectUrl;
  });
}

