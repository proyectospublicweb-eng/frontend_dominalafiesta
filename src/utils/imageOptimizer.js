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

  const hasOverlay = Boolean(
    overlayConfig && overlayConfig.designId && overlayConfig.designId !== "none"
  );
  const isClubPartyFilter = overlayConfig?.designId === "club-party";
  const isKineticFilter = overlayConfig?.designId === "kinetic";
  const isVortexFilter = overlayConfig?.designId === "vortex";
  const isColorVeilFilter = overlayConfig?.designId === "color-veil";
  const isHazeFilter = overlayConfig?.designId === "haze";
  const isPrismaFilter = overlayConfig?.designId === "prisma";
  const isSolsticeFilter = overlayConfig?.designId === "solstice";
  const isShadowsFilter = overlayConfig?.designId === "shadows";
  const isPolarFilter = overlayConfig?.designId === "polar";
  const isMetroFilter = overlayConfig?.designId === "metro";

  const hdCanvas = document.createElement("canvas");
  hdCanvas.width = hdWidth;
  hdCanvas.height = hdHeight;
  const hdCtx = hdCanvas.getContext("2d");
  let origDataUrl = "";

  if (hdCtx) {
    hdCtx.imageSmoothingEnabled = true;
    hdCtx.imageSmoothingQuality = "high";
    // Capturar primero la imagen base limpia (origDataUrl) cuando se aplica un overlay
    if (hasOverlay) {
      hdCtx.drawImage(sourceElement, 0, 0, hdWidth, hdHeight);
      origDataUrl = hdCanvas.toDataURL("image/webp", preset.quality);
      if (!origDataUrl.startsWith("data:image/webp")) {
        origDataUrl = hdCanvas.toDataURL("image/jpeg", preset.quality);
      }
      hdCtx.clearRect(0, 0, hdWidth, hdHeight);
    }

    if (isClubPartyFilter) {
      hdCtx.filter = "contrast(1.22) brightness(0.92) saturate(1.15)";
    } else if (isKineticFilter) {
      hdCtx.filter = "contrast(1.18) brightness(0.95) saturate(1.14)";
    } else if (isVortexFilter) {
      hdCtx.filter = "contrast(1.26) brightness(0.92) saturate(0.42)";
    } else if (isColorVeilFilter) {
      hdCtx.filter = "contrast(1.16) brightness(0.95) saturate(1.12)";
    } else if (isHazeFilter) {
      hdCtx.filter = "contrast(1.08) brightness(0.95) saturate(0.88) sepia(0.14)";
    } else if (isPrismaFilter) {
      hdCtx.filter = "contrast(1.22) brightness(0.94) saturate(1.20)";
    } else if (isSolsticeFilter) {
      hdCtx.filter = "contrast(1.16) brightness(0.96) saturate(1.14)";
    } else if (isShadowsFilter) {
      hdCtx.filter = "grayscale(100%) contrast(1.42) brightness(0.86)";
    } else if (isPolarFilter) {
      hdCtx.filter = "grayscale(100%) contrast(1.22) brightness(0.96)";
    } else if (isMetroFilter) {
      hdCtx.filter = "contrast(1.20) brightness(0.93) saturate(1.12)";
    }
    hdCtx.drawImage(sourceElement, 0, 0, hdWidth, hdHeight);
    hdCtx.filter = "none";
    if (hasOverlay) {
      drawPhotoOverlayOnCanvas(hdCtx, hdWidth, hdHeight, overlayConfig);
    }
  }

  let hdDataUrl = hdCanvas.toDataURL("image/webp", preset.quality);
  if (!hdDataUrl.startsWith("data:image/webp")) {
    hdDataUrl = hdCanvas.toDataURL("image/jpeg", preset.quality);
  }
  if (!origDataUrl) {
    origDataUrl = hdDataUrl;
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
    if (isClubPartyFilter) {
      thumbCtx.filter = "contrast(1.22) brightness(0.92) saturate(1.15)";
    } else if (isKineticFilter) {
      thumbCtx.filter = "contrast(1.18) brightness(0.95) saturate(1.14)";
    } else if (isVortexFilter) {
      thumbCtx.filter = "contrast(1.26) brightness(0.92) saturate(0.42)";
    } else if (isColorVeilFilter) {
      thumbCtx.filter = "contrast(1.16) brightness(0.95) saturate(1.12)";
    } else if (isHazeFilter) {
      thumbCtx.filter = "contrast(1.08) brightness(0.95) saturate(0.88) sepia(0.14)";
    } else if (isPrismaFilter) {
      thumbCtx.filter = "contrast(1.22) brightness(0.94) saturate(1.20)";
    } else if (isSolsticeFilter) {
      thumbCtx.filter = "contrast(1.16) brightness(0.96) saturate(1.14)";
    } else if (isShadowsFilter) {
      thumbCtx.filter = "grayscale(100%) contrast(1.42) brightness(0.86)";
    } else if (isPolarFilter) {
      thumbCtx.filter = "grayscale(100%) contrast(1.22) brightness(0.96)";
    } else if (isMetroFilter) {
      thumbCtx.filter = "contrast(1.20) brightness(0.93) saturate(1.12)";
    }
    thumbCtx.drawImage(sourceElement, 0, 0, thumbWidth, thumbHeight);
    thumbCtx.filter = "none";
    if (hasOverlay) {
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
    origDataUrl,
    overlayId: hasOverlay ? String(overlayConfig.designId) : "none",
    width: hdWidth,
    height: hdHeight,
  };
}

/**
 * Re-renderiza un elemento HTMLImageElement existente aplicando un nuevo Overlay
 * y devuelve { hdDataUrl, thumbDataUrl, overlayId, width, height }.
 */
export function renderOverlayOnImageElementDual(
  imgEl,
  presetKey = "hd",
  overlayConfig = null
) {
  const iw = Number(imgEl?.naturalWidth || imgEl?.width) || 1920;
  const ih = Number(imgEl?.naturalHeight || imgEl?.height) || 1080;
  return encodeCanvasDual(imgEl, iw, ih, presetKey, overlayConfig);
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

/**
 * Convierte cualquier fotografía al vuelo a resolución 2K (2560px en su lado mayor)
 * directamente en la memoria RAM del navegador, redibujando su Overlay en resolución
 * vectorial 2K nativa y devolviendo un Blob listo para descarga inmediata
 * SIN guardar ni ocupar espacio extra en la base de datos o servidor.
 */
export function generateOnTheFly2KBlob(imageUrl, overlayConfig = null) {
  return new Promise((resolve, reject) => {
    if (!imageUrl) {
      reject(new Error("URL de imagen no válida."));
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const srcW = Number(img.naturalWidth || img.width) || 1920;
        const srcH = Number(img.naturalHeight || img.height) || 1080;
        const target2KMax = 2560;
        const maxSide = Math.max(srcW, srcH, 1);
        const scale2K = target2KMax / maxSide;

        const w2k = Math.max(1, Math.round(srcW * scale2K));
        const h2k = Math.max(1, Math.round(srcH * scale2K));

        const canvas = document.createElement("canvas");
        canvas.width = w2k;
        canvas.height = h2k;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("No se pudo inicializar el lienzo 2K en memoria."));
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        const hasOverlay = Boolean(
          overlayConfig &&
            overlayConfig.designId &&
            overlayConfig.designId !== "none"
        );
        const isClubPartyFilter = overlayConfig?.designId === "club-party";
        const isKineticFilter = overlayConfig?.designId === "kinetic";
        const isVortexFilter = overlayConfig?.designId === "vortex";
        const isColorVeilFilter = overlayConfig?.designId === "color-veil";
        const isHazeFilter = overlayConfig?.designId === "haze";
        const isPrismaFilter = overlayConfig?.designId === "prisma";
        const isSolsticeFilter = overlayConfig?.designId === "solstice";
        const isShadowsFilter = overlayConfig?.designId === "shadows";
        const isPolarFilter = overlayConfig?.designId === "polar";
        const isMetroFilter = overlayConfig?.designId === "metro";

        if (isClubPartyFilter) {
          ctx.filter = "contrast(1.22) brightness(0.92) saturate(1.15)";
        } else if (isKineticFilter) {
          ctx.filter = "contrast(1.18) brightness(0.95) saturate(1.14)";
        } else if (isVortexFilter) {
          ctx.filter = "contrast(1.26) brightness(0.92) saturate(0.42)";
        } else if (isColorVeilFilter) {
          ctx.filter = "contrast(1.16) brightness(0.95) saturate(1.12)";
        } else if (isHazeFilter) {
          ctx.filter = "contrast(1.08) brightness(0.95) saturate(0.88) sepia(0.14)";
        } else if (isPrismaFilter) {
          ctx.filter = "contrast(1.22) brightness(0.94) saturate(1.20)";
        } else if (isSolsticeFilter) {
          ctx.filter = "contrast(1.16) brightness(0.96) saturate(1.14)";
        } else if (isShadowsFilter) {
          ctx.filter = "grayscale(100%) contrast(1.42) brightness(0.86)";
        } else if (isPolarFilter) {
          ctx.filter = "grayscale(100%) contrast(1.22) brightness(0.96)";
        } else if (isMetroFilter) {
          ctx.filter = "contrast(1.20) brightness(0.93) saturate(1.12)";
        } else {
          ctx.filter = "contrast(1.03) saturate(1.03)";
        }
        ctx.drawImage(img, 0, 0, w2k, h2k);
        ctx.filter = "none";

        if (hasOverlay) {
          drawPhotoOverlayOnCanvas(ctx, w2k, h2k, overlayConfig);
        }

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("No se pudo codificar el archivo 2K."));
              return;
            }
            resolve({
              blob,
              width: w2k,
              height: h2k,
              ext: "jpg",
            });
          },
          "image/jpeg",
          0.95
        );
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => {
      reject(new Error("No se pudo cargar la imagen para convertirla a 2K."));
    };
    img.src = imageUrl;
  });
}


