import { useEffect, useMemo, useRef, useState } from "react";
import {
  getAlbumFotosEventoRequest,
  addFotoAlbumEventoRequest,
  updateFotoAlbumEventoRequest,
  deleteFotoAlbumEventoRequest,
  descargarAlbumZipEventoRequest,
  getAlbumPhotoUrl,
} from "../../api/eventos.js";
import {
  QUALITY_PRESETS,
  captureVideoFrameDual,
  optimizeImageFileDual,
  renderOverlayOnImageElementDual,
  generateOnTheFly2KBlob,
} from "../../utils/imageOptimizer.js";
import {
  OVERLAY_DESIGNS,
  drawPhotoOverlayOnCanvas,
} from "../../utils/photoOverlays.js";

function formatShortDate(isoStr) {
  if (!isoStr) return "—";
  try {
    const d = new Date(isoStr);
    if (Number.isNaN(d.getTime())) return String(isoStr).slice(0, 10);
    return d.toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return String(isoStr).slice(0, 10);
  }
}

function formatDateTime(isoStr) {
  if (!isoStr) return "";
  try {
    const d = new Date(isoStr);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString("es-MX", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export default function CamaraAlbumEvento({ evento, onShowNotice }) {
  const [loading, setLoading] = useState(true);
  const [fotos, setFotos] = useState([]);
  const [photoQuality, setPhotoQuality] = useState("hd");
  const [totalMb, setTotalMb] = useState(0);
  const [retention, setRetention] = useState({
    retentionDays: 30,
    expiresAt: "",
    daysRemaining: 30,
    isExpired: false,
  });

  // Configuración del Overlay Automático por Evento (5 diseños + texto libre tomado del nombre del evento)
  const defaultMainText = String(evento?.nombre || "Mi Evento").trim();
  const defaultSubText = useMemo(() => {
    const datePart = evento?.fecha_evento
      ? formatShortDate(evento.fecha_evento)
      : "";
    const placePart = String(evento?.lugar || "").trim();
    if (datePart && placePart) return `${datePart} • ${placePart}`;
    return datePart || placePart || "Recuerdalo.com.mx";
  }, [evento?.fecha_evento, evento?.lugar]);

  const [overlayDesignId, setOverlayDesignId] = useState("gala-gold");
  const [overlayMainText, setOverlayMainText] = useState(defaultMainText);
  const [overlaySubText, setOverlaySubText] = useState(defaultSubText);
  const [overlayThirdText, setOverlayThirdText] = useState("");

  // Sincronizar texto por defecto cuando el usuario cambia de evento seleccionado
  useEffect(() => {
    if (!evento?.idevento) return;
    const storageKey = `recuerdalo_overlay_ev_${evento.idevento}`;
    try {
      const savedRaw = localStorage.getItem(storageKey);
      if (savedRaw) {
        const parsed = JSON.parse(savedRaw);
        setOverlayDesignId(parsed.designId || "gala-gold");
        setOverlayMainText(
          parsed.mainText !== undefined ? parsed.mainText : defaultMainText
        );
        setOverlaySubText(
          parsed.subText !== undefined ? parsed.subText : defaultSubText
        );
        setOverlayThirdText(
          parsed.thirdText !== undefined ? parsed.thirdText : ""
        );
        return;
      }
    } catch {
      // Ignorar errores de localStorage
    }
    setOverlayDesignId("gala-gold");
    setOverlayMainText(defaultMainText);
    setOverlaySubText(defaultSubText);
    setOverlayThirdText("");
  }, [evento?.idevento, defaultMainText, defaultSubText]);

  // Guardar cambios de overlay en la sesión del evento actual
  useEffect(() => {
    if (!evento?.idevento) return;
    const storageKey = `recuerdalo_overlay_ev_${evento.idevento}`;
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          designId: overlayDesignId,
          mainText: overlayMainText,
          subText: overlaySubText,
          thirdText: overlayThirdText,
        })
      );
    } catch {
      // Ignorar
    }
  }, [
    evento?.idevento,
    overlayDesignId,
    overlayMainText,
    overlaySubText,
    overlayThirdText,
  ]);

  const activeOverlayConfig = useMemo(
    () => ({
      designId: overlayDesignId,
      mainText: overlayMainText,
      subText: overlaySubText,
      thirdText: overlayThirdText,
      badgeText: evento?.tipo_evento || "RECUERDO OFICIAL",
      eventDate: evento?.fecha_evento || "",
      eventPlace: evento?.lugar || "",
    }),
    [
      overlayDesignId,
      overlayMainText,
      overlaySubText,
      overlayThirdText,
      evento?.tipo_evento,
      evento?.fecha_evento,
      evento?.lugar,
    ]
  );

  // Cámara en vivo (WebRTC)
  const [cameraOpen, setCameraOpen] = useState(false);
  const [facingMode, setFacingMode] = useState("environment"); // "environment" | "user"
  const [cameraError, setCameraError] = useState("");
  const [captionText, setCaptionText] = useState("");
  const [capturing, setCapturing] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [deletingPhotoId, setDeletingPhotoId] = useState(null);
  const [downloading2KId, setDownloading2KId] = useState(null);

  // Visor HD en pantalla completa (Lightbox de fotos del álbum)
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [visorOverlayId, setVisorOverlayId] = useState("none");
  const [visorLiveCanvasReady, setVisorLiveCanvasReady] = useState(false);
  const [applyingOverlayInVisor, setApplyingOverlayInVisor] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);
  const nativeCameraInputRef = useRef(null);
  const samplePreviewCanvasRef = useRef(null);
  const liveOverlayCanvasRef = useRef(null);
  const lightboxCanvasRef = useRef(null);
  const lightboxBaseImgRef = useRef(null);

  const notify = (msg) => {
    if (typeof onShowNotice === "function") {
      onShowNotice(msg);
    }
  };

  const activeLightboxPhoto =
    lightboxIndex !== null && fotos[lightboxIndex] ? fotos[lightboxIndex] : null;

  const drawActivePhotoOnLightboxCanvas = (targetOverlayId) => {
    const canvas = lightboxCanvasRef.current;
    const baseImg = lightboxBaseImgRef.current;
    if (!canvas || !baseImg) return;

    const iw = Number(baseImg.naturalWidth || baseImg.width) || 1280;
    const ih = Number(baseImg.naturalHeight || baseImg.height) || 960;
    const maxPreviewSide = 1600;
    const scale =
      Math.max(iw, ih) > maxPreviewSide ? maxPreviewSide / Math.max(iw, ih) : 1;
    const cw = Math.max(1, Math.round(iw * scale));
    const ch = Math.max(1, Math.round(ih * scale));

    canvas.width = cw;
    canvas.height = ch;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, cw, ch);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    if (targetOverlayId === "club-party") {
      ctx.filter = "contrast(1.22) brightness(0.92) saturate(1.15)";
    } else if (targetOverlayId === "kinetic") {
      ctx.filter = "contrast(1.18) brightness(0.95) saturate(1.14)";
    } else if (targetOverlayId === "vortex") {
      ctx.filter = "contrast(1.26) brightness(0.92) saturate(0.42)";
    } else if (targetOverlayId === "color-veil") {
      ctx.filter = "contrast(1.16) brightness(0.95) saturate(1.12)";
    } else if (targetOverlayId === "haze") {
      ctx.filter = "contrast(1.08) brightness(0.95) saturate(0.88) sepia(0.14)";
    } else if (targetOverlayId === "prisma") {
      ctx.filter = "contrast(1.22) brightness(0.94) saturate(1.20)";
    } else if (targetOverlayId === "solstice") {
      ctx.filter = "contrast(1.16) brightness(0.96) saturate(1.14)";
    } else if (targetOverlayId === "shadows") {
      ctx.filter = "grayscale(100%) contrast(1.42) brightness(0.86)";
    } else if (targetOverlayId === "polar") {
      ctx.filter = "grayscale(100%) contrast(1.22) brightness(0.96)";
    } else if (targetOverlayId === "metro") {
      ctx.filter = "contrast(1.20) brightness(0.93) saturate(1.12)";
    }
    ctx.drawImage(baseImg, 0, 0, cw, ch);
    ctx.filter = "none";

    if (targetOverlayId && targetOverlayId !== "none") {
      drawPhotoOverlayOnCanvas(ctx, cw, ch, {
        ...activeOverlayConfig,
        designId: targetOverlayId,
      });
    }
  };

  // Cargar imagen base (origUrl) cuando se abre una foto en el Visor HD
  useEffect(() => {
    if (!activeLightboxPhoto) {
      lightboxBaseImgRef.current = null;
      setVisorLiveCanvasReady(false);
      return;
    }

    const initialOv =
      activeLightboxPhoto.overlayId && activeLightboxPhoto.overlayId !== "none"
        ? activeLightboxPhoto.overlayId
        : overlayDesignId;
    setVisorOverlayId(activeLightboxPhoto.overlayId || "none");
    setVisorLiveCanvasReady(false);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      lightboxBaseImgRef.current = img;
    };
    img.onerror = () => {
      // Respaldo a hdUrl si origUrl no estuviera disponible
      const fallbackImg = new Image();
      fallbackImg.crossOrigin = "anonymous";
      fallbackImg.onload = () => {
        lightboxBaseImgRef.current = fallbackImg;
      };
      fallbackImg.src = getAlbumPhotoUrl(activeLightboxPhoto.hdUrl);
    };
    img.src = getAlbumPhotoUrl(
      activeLightboxPhoto.origUrl || activeLightboxPhoto.hdUrl
    );
    void initialOv;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLightboxPhoto?.idFoto]);

  // Redibujar en tiempo real el lienzo del visor cuando cambia el texto o el overlay seleccionado en el visor
  useEffect(() => {
    if (!activeLightboxPhoto || !visorLiveCanvasReady) return;
    drawActivePhotoOnLightboxCanvas(visorOverlayId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    visorOverlayId,
    visorLiveCanvasReady,
    overlayMainText,
    overlaySubText,
    overlayThirdText,
    activeLightboxPhoto?.idFoto,
  ]);

  const handleSelectAndApplyOverlayInVisor = async (nextDesignId) => {
    if (!activeLightboxPhoto || !evento?.idevento) return;

    setVisorOverlayId(nextDesignId);
    setOverlayDesignId(nextDesignId);

    // Asegurar que la imagen base esté cargada para renderizar y guardar al instante
    let baseImg = lightboxBaseImgRef.current;
    if (!baseImg) {
      baseImg = await new Promise((resolve) => {
        const tempImg = new Image();
        tempImg.crossOrigin = "anonymous";
        tempImg.onload = () => resolve(tempImg);
        tempImg.onerror = () => resolve(null);
        tempImg.src = getAlbumPhotoUrl(
          activeLightboxPhoto.origUrl || activeLightboxPhoto.hdUrl
        );
      });
      if (baseImg) {
        lightboxBaseImgRef.current = baseImg;
      }
    }

    if (!baseImg) {
      notify("No se pudo cargar la imagen base para aplicar el overlay.");
      return;
    }

    // 1. Mostrar inmediatamente el overlay sobre la imagen activa en el visor
    setVisorLiveCanvasReady(true);
    setTimeout(() => {
      drawActivePhotoOnLightboxCanvas(nextDesignId);
    }, 0);

    // 2. Al mismo tiempo codificar y aplicar el overlay en la fotografía activa del álbum
    setApplyingOverlayInVisor(true);
    try {
      const targetConfig = {
        ...activeOverlayConfig,
        designId: nextDesignId,
      };
      const optimized = renderOverlayOnImageElementDual(
        baseImg,
        photoQuality,
        targetConfig
      );

      const { data } = await updateFotoAlbumEventoRequest(
        evento.idevento,
        activeLightboxPhoto.idFoto,
        {
          titulo: activeLightboxPhoto.titulo,
          hdDataUrl: optimized.hdDataUrl,
          thumbDataUrl: optimized.thumbDataUrl,
          overlayId: nextDesignId,
          width: optimized.width,
          height: optimized.height,
        }
      );

      if (data?.foto) {
        setFotos((prev) => {
          const next = prev.map((f) =>
            f.idFoto === data.foto.idFoto ? data.foto : f
          );
          const kbSum = next.reduce((acc, f) => acc + (f.sizeKb || 0), 0);
          setTotalMb(Number((kbSum / 1024).toFixed(2)));
          return next;
        });
      }

      const designObj = OVERLAY_DESIGNS.find((d) => d.id === nextDesignId);
      notify(
        nextDesignId === "none"
          ? "✓ Se restauró la fotografía original sin overlay."
          : `✨ Overlay «${designObj?.shortName || nextDesignId}» aplicado a la fotografía activa.`
      );
    } catch (err) {
      notify(
        err.response?.data?.message ||
          "No se pudo guardar el overlay en la fotografía activa."
      );
    } finally {
      setApplyingOverlayInVisor(false);
    }
  };

  // Dibujar muestra interactiva del Overlay en la tarjeta de vista previa y sobre el visor de cámara en vivo
  useEffect(() => {
    // 1. Lienzo de muestra en el panel de selección de diseños
    const sampleCanvas = samplePreviewCanvasRef.current;
    if (sampleCanvas) {
      const w = 640;
      const h = 440;
      sampleCanvas.width = w;
      sampleCanvas.height = h;
      const ctx = sampleCanvas.getContext("2d");
      if (ctx) {
        // Fondo fotográfico simulado (escena cálida de celebración nocturna con bokeh)
        const bgGrad = ctx.createLinearGradient(0, 0, w, h);
        bgGrad.addColorStop(0, "#1e1b4b");
        bgGrad.addColorStop(0.5, "#312e81");
        bgGrad.addColorStop(1, "#0f172a");
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);

        // Luces bokeh decorativas de fondo para simular una foto real de fiesta
        const bokehCircles = [
          { x: 110, y: 95, r: 42, c: "rgba(251, 191, 36, 0.22)" },
          { x: 520, y: 80, r: 55, c: "rgba(244, 114, 182, 0.18)" },
          { x: 320, y: 150, r: 70, c: "rgba(99, 102, 241, 0.24)" },
          { x: 190, y: 210, r: 35, c: "rgba(52, 211, 153, 0.18)" },
          { x: 460, y: 200, r: 48, c: "rgba(251, 191, 36, 0.20)" },
        ];
        bokehCircles.forEach((b) => {
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
          ctx.fillStyle = b.c;
          ctx.fill();
        });

        // Icono central sutil indicando vista previa
        ctx.font = "600 15px 'Segoe UI', sans-serif";
        ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("✨ VISTA PREVIA DEL OVERLAY ✨", w / 2, h * 0.42);

        // Dibujar el overlay elegido encima
        drawPhotoOverlayOnCanvas(ctx, w, h, activeOverlayConfig);
      }
    }

    // 2. Lienzo transparente superpuesto al visor de cámara en vivo
    const liveCanvas = liveOverlayCanvasRef.current;
    if (liveCanvas && cameraOpen) {
      const lw = 960;
      const lh = 720;
      liveCanvas.width = lw;
      liveCanvas.height = lh;
      const lctx = liveCanvas.getContext("2d");
      if (lctx) {
        lctx.clearRect(0, 0, lw, lh);
        drawPhotoOverlayOnCanvas(lctx, lw, lh, {
          ...activeOverlayConfig,
          isLiveOverlay: true,
        });
      }
    }
  }, [activeOverlayConfig, cameraOpen]);

  const fetchAlbum = async () => {
    if (!evento?.idevento) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data } = await getAlbumFotosEventoRequest(evento.idevento);
      setFotos(Array.isArray(data.fotos) ? data.fotos : []);
      setPhotoQuality(data.photoQuality || "hd");
      setTotalMb(Number(data.totalMb || 0));
      if (data.retention) {
        setRetention(data.retention);
      }
    } catch (err) {
      notify(
        err.response?.data?.message ||
          "No se pudo cargar el álbum de recuerdos de este evento."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlbum();
    return () => {
      stopCameraStream();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [evento?.idevento]);

  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const startCameraStream = async (desiredFacing = facingMode) => {
    setCameraError("");
    stopCameraStream();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError(
        "Tu navegador requiere usar el botón de Cámara Nativa del dispositivo."
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: desiredFacing },
          width: { ideal: 2560 },
          height: { ideal: 1920 },
        },
      });
      streamRef.current = stream;
      setCameraOpen(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }, 60);
    } catch {
      setCameraError(
        "No se pudo acceder a la cámara en vivo. Verifica el permiso de cámara en tu navegador o usa el botón 'Cámara del Celular / Subir Foto'."
      );
    }
  };

  const handleToggleCameraOpen = async () => {
    if (cameraOpen) {
      stopCameraStream();
      setCameraOpen(false);
      return;
    }
    await startCameraStream(facingMode);
  };

  const handleSwitchCameraFacing = async () => {
    const nextFacing = facingMode === "environment" ? "user" : "environment";
    setFacingMode(nextFacing);
    if (cameraOpen) {
      await startCameraStream(nextFacing);
    }
  };

  const handleCaptureFromLiveVideo = async () => {
    if (!videoRef.current || !evento?.idevento) return;
    setCapturing(true);
    try {
      const optimized = captureVideoFrameDual(
        videoRef.current,
        photoQuality,
        activeOverlayConfig
      );
      const { data } = await addFotoAlbumEventoRequest(evento.idevento, {
        titulo:
          captionText.trim() ||
          overlayMainText.trim() ||
          `Recuerdo · ${evento.nombre}`,
        autor: "Anfitrión",
        hdDataUrl: optimized.hdDataUrl,
        thumbDataUrl: optimized.thumbDataUrl,
        origDataUrl: optimized.origDataUrl,
        overlayId: optimized.overlayId,
        width: optimized.width,
        height: optimized.height,
      });

      if (data?.foto) {
        setFotos((prev) => {
          const next = [data.foto, ...prev];
          const kbSum = next.reduce((acc, f) => acc + (f.sizeKb || 0), 0);
          setTotalMb(Number((kbSum / 1024).toFixed(2)));
          return next;
        });
      }
      if (data?.retention) {
        setRetention(data.retention);
      }
      setCaptionText("");
      notify("📸 ¡Fotografía capturada con tu diseño y guardada en Alta Definición!");
    } catch (err) {
      notify(
        err.response?.data?.message ||
          "Error al capturar y guardar la fotografía."
      );
    } finally {
      setCapturing(false);
    }
  };

  const handleFilesSelected = async (e) => {
    const fileList = Array.from(e.target.files || []);
    e.target.value = "";
    if (fileList.length === 0 || !evento?.idevento) return;

    setUploadingFiles(true);
    let uploadedCount = 0;

    try {
      for (const file of fileList) {
        const optimized = await optimizeImageFileDual(
          file,
          photoQuality,
          activeOverlayConfig
        );
        const cleanFileName = String(file.name || "")
          .replace(/\.[^/.]+$/, "")
          .replace(/[_-]+/g, " ")
          .trim();

        const { data } = await addFotoAlbumEventoRequest(evento.idevento, {
          titulo:
            captionText.trim() ||
            cleanFileName ||
            overlayMainText.trim() ||
            `Recuerdo · ${evento.nombre}`,
          autor: "Anfitrión",
          hdDataUrl: optimized.hdDataUrl,
          thumbDataUrl: optimized.thumbDataUrl,
          origDataUrl: optimized.origDataUrl,
          overlayId: optimized.overlayId,
          width: optimized.width,
          height: optimized.height,
        });

        if (data?.foto) {
          uploadedCount++;
          setFotos((prev) => {
            const next = [data.foto, ...prev];
            const kbSum = next.reduce((acc, f) => acc + (f.sizeKb || 0), 0);
            setTotalMb(Number((kbSum / 1024).toFixed(2)));
            return next;
          });
        }
        if (data?.retention) {
          setRetention(data.retention);
        }
      }
      setCaptionText("");
      notify(
        uploadedCount === 1
          ? "✓ Fotografía optimizada en HD con tu diseño y agregada al álbum."
          : `✓ ${uploadedCount} fotografías optimizadas en HD y agregadas al álbum.`
      );
    } catch (err) {
      notify(
        err.response?.data?.message ||
          "Ocurrió un error al procesar o subir las fotografías."
      );
    } finally {
      setUploadingFiles(false);
    }
  };

  const handleDeletePhoto = async (foto) => {
    if (!evento?.idevento || !foto?.idFoto) return;
    setDeletingPhotoId(foto.idFoto);
    try {
      await deleteFotoAlbumEventoRequest(evento.idevento, foto.idFoto);
      setFotos((prev) => {
        const next = prev.filter((f) => f.idFoto !== foto.idFoto);
        const kbSum = next.reduce((acc, f) => acc + (f.sizeKb || 0), 0);
        setTotalMb(Number((kbSum / 1024).toFixed(2)));
        return next;
      });
      if (lightboxIndex !== null) {
        setLightboxIndex(null);
      }
      notify("🗑️ Fotografía eliminada del álbum del evento.");
    } catch (err) {
      notify(
        err.response?.data?.message || "No se pudo eliminar la fotografía."
      );
    } finally {
      setDeletingPhotoId(null);
    }
  };

  const handleDownloadSinglePhoto = async (foto, idx = 0) => {
    try {
      const fullUrl = getAlbumPhotoUrl(foto.hdUrl);
      const response = await fetch(fullUrl);
      const blob = await response.blob();
      const ext = blob.type.includes("webp")
        ? "webp"
        : blob.type.includes("png")
        ? "png"
        : "jpg";
      const safeName = String(foto.titulo || `Recuerdo_${idx + 1}`)
        .replace(/[^a-zA-Z0-9_-]+/g, "_")
        .slice(0, 40);
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `${safeName}_HD.${ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(getAlbumPhotoUrl(foto.hdUrl), "_blank", "noopener,noreferrer");
    }
  };

  // Conversión y descarga instantánea en 2K (2560px) en memoria RAM del navegador (sin guardar en BD ni servidor)
  const handleDownloadPhoto2K = async (
    foto,
    idx = 0,
    overrideOverlayId = null
  ) => {
    if (!foto?.idFoto) return;
    setDownloading2KId(foto.idFoto);
    try {
      const effectiveOverlayId =
        overrideOverlayId !== null
          ? overrideOverlayId
          : foto.overlayId || "none";

      // Si tiene un overlay activo, usamos origUrl (base limpia) para redibujar el overlay vectorial en 2K nativo (2560px)
      const useCleanBase =
        Boolean(foto.origUrl) && effectiveOverlayId !== "none";
      const sourceUrl = getAlbumPhotoUrl(
        useCleanBase ? foto.origUrl : foto.hdUrl
      );
      const overlayFor2K = useCleanBase
        ? { ...activeOverlayConfig, designId: effectiveOverlayId }
        : { designId: "none" };

      const res = await generateOnTheFly2KBlob(sourceUrl, overlayFor2K);
      const safeName = String(foto.titulo || `Recuerdo_${idx + 1}`)
        .replace(/[^a-zA-Z0-9_-]+/g, "_")
        .slice(0, 40);

      const blobUrl = URL.createObjectURL(res.blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `${safeName}_2K_${res.width}x${res.height}.jpg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      // Liberar inmediatamente la memoria temporal del navegador
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1500);

      notify(
        `✨ Foto convertida al vuelo a 2K (${res.width}×${res.height}px) y descargada sin ocupar espacio en servidor.`
      );
    } catch {
      notify("No se pudo convertir la fotografía a 2K en este momento.");
    } finally {
      setDownloading2KId(null);
    }
  };

  const handleDownloadZip = async () => {
    if (!evento?.idevento || fotos.length === 0) return;
    setDownloadingZip(true);
    try {
      const response = await descargarAlbumZipEventoRequest(evento.idevento);
      const blob = new Blob([response.data], { type: "application/zip" });
      const url = URL.createObjectURL(blob);
      const safeEventName = String(evento.nombre || `Evento_${evento.idevento}`)
        .replace(/[^a-zA-Z0-9_-]+/g, "_")
        .slice(0, 40);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Album_Recuerdos_${safeEventName}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      notify(
        "⬇️ Descarga del álbum completo (.ZIP) en Alta Definición iniciada."
      );
    } catch (err) {
      notify(
        err.response?.data?.message ||
          "No se pudo generar el archivo .ZIP del álbum."
      );
    } finally {
      setDownloadingZip(false);
    }
  };

  if (!evento?.idevento) {
    return (
      <div className="rounded-3xl border border-[#2A2C4A] bg-[#141526] p-6 text-center shadow-[0_24px_60px_rgba(10,8,28,0.65)] sm:p-10">
        <span className="text-4xl">📸</span>
        <h3 className="mt-3 text-lg font-extrabold text-[#F4F5FB]">
          Guarda primero tu evento para activar su Álbum de Fotografías HD
        </h3>
        <p className="mx-auto mt-1 max-w-md text-xs text-[#8E92B2]">
          Cada evento cuenta con su propio álbum de recuerdos independiente con
          toma de fotos ilimitada en Alta Definición.
        </p>
      </div>
    );
  }

  const activePreset =
    QUALITY_PRESETS[photoQuality] || QUALITY_PRESETS.hd;
  const activeDesignObj =
    OVERLAY_DESIGNS.find((d) => d.id === overlayDesignId) || OVERLAY_DESIGNS[1];

  return (
    <div className="space-y-4 rounded-2xl border border-[#2A2C4A] bg-[#141526] p-2.5 text-[#F4F5FB] shadow-[0_24px_65px_rgba(12,9,34,0.75)] sm:space-y-5 sm:rounded-3xl sm:p-5">
      {/* Input oculto para subir una o múltiples fotos de galería */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFilesSelected}
        className="hidden"
      />
      {/* Input oculto de respaldo para cámara nativa en móviles */}
      <input
        ref={nativeCameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFilesSelected}
        className="hidden"
      />

      {/* =====================================================================
          1. CABECERA DEL ÁLBUM DEL EVENTO + ACCIONES DE CÁMARA Y DESCARGA
         ===================================================================== */}
      <div className="rounded-2xl border border-[#2F324D] bg-[#222437] p-3.5 shadow-[0_12px_30px_rgba(8,9,20,0.45)] sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#3CE7B6]/20 to-[#2BC496]/20 px-2.5 py-1 text-[10px] font-extrabold text-[#3CE7B6] ring-1 ring-[#3CE7B6]/35 sm:px-3 sm:text-[11px]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#3CE7B6]" />
                <span>∞ Fotos Ilimitadas</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#8A4FFF]/20 to-[#6E38E0]/20 px-2.5 py-1 text-[10px] font-extrabold text-[#B794FF] ring-1 ring-[#8A4FFF]/40 sm:px-3 sm:text-[11px]">
                <span>✨ {activePreset.label.split("(")[0].trim()}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#262942] bg-[#141526] px-2.5 py-1 text-[10px] font-bold text-[#9CA0C3] sm:px-3 sm:text-[11px]">
                📷 {fotos.length} {fotos.length === 1 ? "foto" : "fotos"} ({totalMb} MB)
              </span>
            </div>

            <h2 className="mt-2.5 break-words font-display text-lg font-extrabold uppercase tracking-wide text-white sm:text-xl lg:text-2xl">
              📸 Cámara y Álbum de Recuerdos — {evento.nombre}
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-[#8E92B2]">
              Este álbum es exclusivo de este evento. Toma fotografías en vivo con tu
              cámara o súbelas desde tu galería con tu diseño de overlay personalizado.
            </p>
          </div>

          {/* Botonera Responsiva (Móvil: cuadrícula adaptativa, Tablet/Desk: fila flexible) */}
          <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2 sm:flex sm:flex-row sm:flex-wrap lg:shrink-0">
            <button
              type="button"
              onClick={handleToggleCameraOpen}
              className={`inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full px-4 py-2.5 text-xs font-extrabold text-white transition sm:w-auto ${
                cameraOpen
                  ? "bg-gradient-to-r from-[#F25767] to-[#E03E52] shadow-[0_6px_18px_rgba(242,87,103,0.38)] hover:brightness-110"
                  : "bg-gradient-to-r from-[#2ED47A] to-[#38CB89] shadow-[0_6px_18px_rgba(56,203,137,0.35)] hover:brightness-110"
              }`}
            >
              <span>{cameraOpen ? "✕ Cerrar Cámara" : "📷 Abrir Cámara en Vivo"}</span>
            </button>

            <button
              type="button"
              onClick={() => nativeCameraInputRef.current?.click()}
              disabled={uploadingFiles}
              className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-[#3CE7B6]/40 bg-[#3CE7B6]/15 px-4 py-2.5 text-xs font-extrabold text-[#3CE7B6] transition hover:bg-[#3CE7B6]/25 disabled:opacity-50 sm:hidden"
            >
              <span>📱 Cámara del Celular</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingFiles}
              className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#8A4FFF] to-[#6E38E0] px-4 py-2.5 text-xs font-extrabold text-white shadow-[0_6px_18px_rgba(138,79,255,0.38)] transition hover:brightness-110 disabled:opacity-50 sm:w-auto"
            >
              <span>
                {uploadingFiles ? "⏳ Procesando HD..." : "⬆️ Subir Foto(s)"}
              </span>
            </button>

            <button
              type="button"
              onClick={handleDownloadZip}
              disabled={downloadingZip || fotos.length === 0}
              className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-[#323552] bg-[#141526] px-4 py-2.5 text-xs font-extrabold text-[#D5D8F0] shadow-xs transition hover:border-[#4BA6FF]/60 hover:bg-[#1B1D33] hover:text-white disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto"
            >
              <span>
                {downloadingZip
                  ? "⏳ Empaquetando .ZIP..."
                  : `⬇️ Descargar Álbum (.ZIP)`}
              </span>
            </button>
          </div>
        </div>

        {/* =====================================================================
            2. AVISO VISIBLE DE VIGENCIA DE 30 DÍAS PARA DESCARGAR AL DISPOSITIVO
           ===================================================================== */}
        <div className="mt-4 rounded-2xl border border-[#FFAE73]/30 bg-gradient-to-r from-[#2B2239] via-[#26233A] to-[#2B2438] p-3 sm:p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FFB836]/20 text-base leading-none text-[#FFB836] ring-1 ring-[#FFB836]/35">
                ⏳
              </span>
              <div className="min-w-0">
                <p className="text-xs font-extrabold text-[#FFE2B8]">
                  Importante: Tienes un periodo de {retention.retentionDays} días para descargar tus fotografías a tu dispositivo
                </p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-[#B8B5D1]">
                  Puedes tomar y subir fotografías{" "}
                  <strong className="text-white">de forma ilimitada</strong> en este evento. Pasando los{" "}
                  <strong className="text-[#FFB836]">{retention.retentionDays} días</strong> (fecha programada
                  de autolimpieza:{" "}
                  <strong className="text-white">{formatShortDate(retention.expiresAt)}</strong>), el álbum
                  de este evento se eliminará automáticamente del servidor para
                  liberar espacio.
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 self-start rounded-full border border-[#FFAE73]/40 bg-[#141526] px-3.5 py-1.5 text-xs font-extrabold text-[#FFE2B8] shadow-2xs md:self-center">
              <span>🗓️ Restan:</span>
              <span className="text-sm text-[#FFB836]">
                {retention.daysRemaining} días
              </span>
            </div>
          </div>
        </div>

        {/* Mensaje de error de cámara si el navegador bloqueó el permiso */}
        {cameraError && (
          <div className="mt-4 flex flex-col gap-2 rounded-2xl border border-[#F25767]/40 bg-[#F25767]/15 p-3.5 text-xs text-[#FFB3BC] sm:flex-row sm:items-center sm:justify-between">
            <span>⚠️ {cameraError}</span>
            <button
              type="button"
              onClick={() => nativeCameraInputRef.current?.click()}
              className="shrink-0 cursor-pointer rounded-full bg-[#F25767] px-3.5 py-1.5 text-[11px] font-extrabold text-white hover:bg-[#E03E52]"
            >
              📱 Abrir Cámara Nativa / Elegir Foto
            </button>
          </div>
        )}

        {/* =====================================================================
            3. PERSONALIZADOR DE OVERLAY AUTOMÁTICO (DISEÑOS + TEXTO EDITABLE)
           ===================================================================== */}
        <div className="mt-5 rounded-2xl border border-[#2F324D] bg-[#181A2C] p-3.5 sm:p-5">
          <div className="mb-3.5 flex flex-col justify-between gap-2 border-b border-[#2A2D47] pb-3 sm:flex-row sm:items-center">
            <div className="min-w-0">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#8A4FFF]">
                MARCO CONMEMORATIVO EN TUS FOTOS
              </span>
              <h3 className="text-sm font-extrabold uppercase tracking-wide text-white sm:text-base">
                🎨 Overlay Automático (Diseños Exclusivos + Texto Editable)
              </h3>
              <p className="text-[11px] text-[#8E92B2]">
                Elige uno de los diseños y personaliza el texto. Se aplicará
                automáticamente al capturar con la cámara o al subir fotos.
              </p>
            </div>
            <span className="self-start shrink-0 rounded-full bg-gradient-to-r from-[#8A4FFF] to-[#6E38E0] px-3.5 py-1 text-[11px] font-extrabold text-white shadow-[0_4px_14px_rgba(138,79,255,0.35)] sm:self-center">
              Activo: {activeDesignObj.shortName}
            </span>
          </div>

          <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-12 lg:gap-5">
            {/* Columna Izquierda (7 cols en lg/xl): Selector de diseños + Inputs de texto */}
            <div className="space-y-4 lg:col-span-7">
              <div>
                <label className="mb-2 block text-xs font-extrabold text-[#D5D8F0]">
                  1. Elige el Diseño del Overlay:
                </label>
                <div className="grid max-h-[270px] grid-cols-1 gap-2 overflow-y-auto pr-1 min-[370px]:grid-cols-2 sm:max-h-[320px] sm:grid-cols-3 lg:max-h-none lg:overflow-visible">
                  {OVERLAY_DESIGNS.map((design) => {
                    const isSelected = overlayDesignId === design.id;
                    return (
                      <button
                        key={design.id}
                        type="button"
                        onClick={() => setOverlayDesignId(design.id)}
                        className={`flex cursor-pointer flex-col items-start rounded-xl border p-2.5 text-left transition ${
                          isSelected
                            ? "border-[#A478FF] bg-gradient-to-r from-[#8A4FFF]/25 to-[#6E38E0]/25 text-white shadow-[0_4px_16px_rgba(138,79,255,0.28)] ring-1 ring-[#8A4FFF]"
                            : "border-[#2D304B] bg-[#222437] text-[#D5D8F0] hover:border-[#8A4FFF]/50 hover:bg-[#282B42]"
                        }`}
                      >
                        <div className="flex w-full items-center justify-between gap-1">
                          <span className="truncate text-xs font-extrabold text-white">
                            {design.shortName}
                          </span>
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-white/20"
                            style={{ backgroundColor: design.accentHex }}
                          />
                        </div>
                        <span className="mt-1 line-clamp-2 text-[10px] leading-tight text-[#8E92B2]">
                          {design.subtitle}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Campos de texto del Overlay */}
              {overlayDesignId !== "none" && (
                <div className="grid grid-cols-1 gap-3 rounded-2xl border border-[#2D304B] bg-[#222437] p-3 sm:grid-cols-2 sm:p-3.5">
                  <div>
                    <div className="mb-1 flex flex-wrap items-center justify-between gap-1">
                      <label className="flex items-center gap-1.5 text-xs font-bold text-[#F4F5FB]">
                        <span className="h-2 w-2 shrink-0 rounded-full bg-[#8A4FFF]" />
                        <span>2. Titulo Principal</span>
                      </label>
                      {overlayMainText !== defaultMainText && (
                        <button
                          type="button"
                          onClick={() => setOverlayMainText(defaultMainText)}
                          className="cursor-pointer text-[10px] font-extrabold text-[#B794FF] hover:underline"
                        >
                          ↺ Usar nombre del evento
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={overlayMainText}
                      onChange={(e) => setOverlayMainText(e.target.value)}
                      placeholder={defaultMainText}
                      maxLength={80}
                      className="w-full rounded-xl border border-[#313452] bg-[#141526] px-3 py-2 text-xs font-semibold text-[#F4F5FB] placeholder-[#6E7293] outline-none transition focus:border-[#8A4FFF] focus:ring-2 focus:ring-[#8A4FFF]/25"
                    />
                    <p className="mt-1 text-[10px] text-[#8E92B2]">
                      {overlayDesignId === "club-party"
                        ? "Tip Club Party: Usa «|» para separar el bloque blanco y la letra cursiva rosa (ej. CLUB | Party)."
                        : "Tomado del nombre de tu evento; puedes editarlo libremente."}
                    </p>
                  </div>

                  <div>
                    <div className="mb-1 flex flex-wrap items-center justify-between gap-1">
                      <label className="flex items-center gap-1.5 text-xs font-bold text-[#F4F5FB]">
                        <span className="h-2 w-2 shrink-0 rounded-full bg-[#3CE7B6]" />
                        <span>3. Subtítulo 1 / Ej. Fecha-Lugar</span>
                      </label>
                      {overlaySubText !== defaultSubText && (
                        <button
                          type="button"
                          onClick={() => setOverlaySubText(defaultSubText)}
                          className="cursor-pointer text-[10px] font-extrabold text-[#3CE7B6] hover:underline"
                        >
                          ↺ Restaurar fecha
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={overlaySubText}
                      onChange={(e) => setOverlaySubText(e.target.value)}
                      placeholder="Ej. 26 Oct 2026 • Recuerdo Especial"
                      maxLength={80}
                      className="w-full rounded-xl border border-[#313452] bg-[#141526] px-3 py-2 text-xs font-semibold text-[#F4F5FB] placeholder-[#6E7293] outline-none transition focus:border-[#3CE7B6] focus:ring-2 focus:ring-[#3CE7B6]/25"
                    />
                    <p className="mt-1 text-[10px] text-[#8E92B2]">
                      {overlayDesignId === "club-party"
                        ? "En Club Party puedes escribir «SAT / JUNE / 27TH» o tu subtítulo inferior."
                        : "Aparece debajo del título principal (déjalo vacío si no lo deseas)."}
                    </p>
                  </div>

                  <div className="sm:col-span-2">
                    <div className="mb-1 flex flex-wrap items-center justify-between gap-1">
                      <label className="flex items-center gap-1.5 text-xs font-bold text-[#F4F5FB]">
                        <span className="h-2 w-2 shrink-0 rounded-full bg-[#FF8E8E]" />
                        <span>4. Subtítulo 2 (Opcional)</span>
                      </label>
                      {overlayThirdText && (
                        <button
                          type="button"
                          onClick={() => setOverlayThirdText("")}
                          className="cursor-pointer text-[10px] font-extrabold text-[#FF8E8E] hover:underline"
                        >
                          ✕ Limpiar
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={overlayThirdText}
                      onChange={(e) => setOverlayThirdText(e.target.value)}
                      placeholder={
                        overlayDesignId === "club-party"
                          ? "Ej. MUSIC & CHAMPAGNE • #NocheInolvidable"
                          : "Ej. #RecuerdoInolvidable • ¡Gracias por acompañarnos!"
                      }
                      maxLength={80}
                      className="w-full rounded-xl border border-[#313452] bg-[#141526] px-3 py-2 text-xs font-semibold text-[#F4F5FB] placeholder-[#6E7293] outline-none transition focus:border-[#FF8E8E] focus:ring-2 focus:ring-[#FF8E8E]/25"
                    />
                    <p className="mt-1 text-[10px] text-[#8E92B2]">
                      {overlayDesignId === "club-party"
                        ? "Aparece en la tercera línea inferior derecha (el signo «&» se resalta automáticamente en rosa neón)."
                        : "Agrega una tercera línea de texto, hashtag o dedicatoria al pie del overlay."}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Columna Derecha (5 cols en lg/xl): Lienzo de Vista Previa en Vivo del Overlay */}
            <div className="lg:sticky lg:top-4 lg:col-span-5">
              <div className="overflow-hidden rounded-2xl border border-[#2F324D] bg-[#141526] p-2.5 shadow-[0_12px_28px_rgba(6,7,18,0.6)] sm:p-3">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-1 px-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#9CA0C3]">
                    👁️ Vista Previa en Tiempo Real
                  </span>
                  <span className="truncate rounded-full bg-[#3CE7B6]/15 px-2.5 py-0.5 text-[10px] font-extrabold text-[#3CE7B6]">
                    {activeDesignObj.name}
                  </span>
                </div>
                <canvas
                  ref={samplePreviewCanvasRef}
                  className="aspect-16/11 w-full rounded-xl border border-[#252842] object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================================
            4. VISOR DE CÁMARA EN VIVO INTEGRADA CON OVERLAY SUPERPUESTO
           ===================================================================== */}
        {cameraOpen && (
          <div className="mt-5 overflow-hidden rounded-2xl border-2 border-[#38CB89]/60 bg-[#141526] p-3 text-white shadow-[0_16px_40px_rgba(8,9,22,0.75)] sm:p-5">
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-[#38CB89]" />
                <span className="truncate text-xs font-extrabold uppercase tracking-wider text-[#3CE7B6]">
                  Visor de Cámara en Vivo · {activeDesignObj.shortName}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSwitchCameraFacing}
                  className="flex-1 cursor-pointer rounded-full border border-[#323552] bg-[#222437] px-3 py-1.5 text-[11px] font-bold text-[#F4F5FB] transition hover:border-[#4BA6FF] hover:bg-[#2A2D46] sm:flex-initial sm:px-3.5"
                >
                  🔄 Girar Cámara ({facingMode === "environment" ? "Trasera" : "Frontal"})
                </button>
                <button
                  type="button"
                  onClick={handleToggleCameraOpen}
                  className="cursor-pointer rounded-full border border-[#F25767]/40 bg-[#F25767]/20 px-3.5 py-1.5 text-[11px] font-bold text-[#FF9AA6] transition hover:bg-[#F25767] hover:text-white"
                >
                  ✕ Cerrar
                </button>
              </div>
            </div>

            <div className="relative mx-auto max-w-2xl overflow-hidden rounded-2xl border border-[#2D304B] bg-[#0B0C17]">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={
                  overlayDesignId === "club-party"
                    ? { filter: "contrast(1.22) brightness(0.92) saturate(1.15)" }
                    : overlayDesignId === "kinetic"
                    ? { filter: "contrast(1.18) brightness(0.95) saturate(1.14)" }
                    : overlayDesignId === "vortex"
                    ? { filter: "contrast(1.26) brightness(0.92) saturate(0.42)" }
                    : overlayDesignId === "color-veil"
                    ? { filter: "contrast(1.16) brightness(0.95) saturate(1.12)" }
                    : overlayDesignId === "haze"
                    ? { filter: "contrast(1.08) brightness(0.95) saturate(0.88) sepia(0.14)" }
                    : overlayDesignId === "prisma"
                    ? { filter: "contrast(1.22) brightness(0.94) saturate(1.20)" }
                    : overlayDesignId === "solstice"
                    ? { filter: "contrast(1.16) brightness(0.96) saturate(1.14)" }
                    : overlayDesignId === "shadows"
                    ? { filter: "grayscale(100%) contrast(1.42) brightness(0.86)" }
                    : overlayDesignId === "polar"
                    ? { filter: "grayscale(100%) contrast(1.22) brightness(0.96)" }
                    : overlayDesignId === "metro"
                    ? { filter: "contrast(1.20) brightness(0.93) saturate(1.12)" }
                    : undefined
                }
                className="max-h-[52dvh] w-full object-contain sm:max-h-[440px]"
              />
              {/* Superposición en vivo del Overlay directamente sobre el video */}
              {overlayDesignId !== "none" && (
                <canvas
                  ref={liveOverlayCanvasRef}
                  className="pointer-events-none absolute inset-0 h-full w-full object-contain"
                />
              )}
            </div>

            <div className="mx-auto mt-3.5 flex max-w-2xl flex-col gap-2.5 sm:mt-4 sm:flex-row sm:items-center">
              <input
                type="text"
                value={captionText}
                onChange={(e) => setCaptionText(e.target.value)}
                placeholder="✏️ Etiqueta en galería (opcional, ej. Brindis de honor, Mesa 3...)"
                maxLength={140}
                className="w-full flex-1 rounded-full border border-[#313452] bg-[#0D0E1B] px-4 py-2.5 text-xs text-white placeholder-[#6E7293] outline-none focus:border-[#38CB89]"
              />
              <button
                type="button"
                onClick={handleCaptureFromLiveVideo}
                disabled={capturing}
                className="inline-flex w-full shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#2ED47A] to-[#38CB89] px-6 py-2.5 text-xs font-extrabold text-white shadow-[0_6px_18px_rgba(56,203,137,0.4)] transition hover:brightness-110 disabled:opacity-50 sm:w-auto"
              >
                <span>
                  {capturing
                    ? "⏳ Guardando HD..."
                    : "📸 Tomar Foto y Guardar en HD"}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* =====================================================================
          5. CUADRÍCULA DE GALERÍA DEL EVENTO (MINIATURAS LIGERAS + ACCIONES HD)
         ===================================================================== */}
      <div className="rounded-2xl border border-[#2F324D] bg-[#222437] p-3.5 shadow-[0_12px_30px_rgba(8,9,20,0.45)] sm:p-6">
        <div className="mb-4 flex flex-col gap-2.5 border-b border-[#2E314B] pb-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2.5">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#4BA6FF] to-[#2B82EB] text-xs shadow-[0_4px_12px_rgba(75,166,255,0.35)]">
              🖼️
            </span>
            <div className="min-w-0">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-white">
                Galería Fotográfica del Evento ({fotos.length})
              </h3>
              <p className="text-[11px] text-[#8E92B2]">
                La cuadrícula muestra miniaturas ligeras para carga instantánea. Toca
                cualquier foto para abrirla o descargarla en Alta Definición.
              </p>
            </div>
          </div>
          {fotos.length > 0 && (
            <button
              type="button"
              onClick={handleDownloadZip}
              disabled={downloadingZip}
              className="w-full cursor-pointer rounded-full border border-[#343857] bg-[#141526] px-4 py-2 text-center text-xs font-extrabold text-[#D5D8F0] transition hover:border-[#8A4FFF] hover:bg-[#1B1D34] hover:text-white sm:w-auto sm:self-center"
            >
              {downloadingZip
                ? "⏳ Generando archivo .ZIP..."
                : `⬇️ Descargar las ${fotos.length} fotos en .ZIP`}
            </button>
          )}
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs font-semibold text-[#8E92B2]">
            ⏳ Cargando álbum fotográfico del evento...
          </div>
        ) : fotos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#343857] bg-[#181A2C] px-4 py-10 text-center sm:py-12">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8A4FFF]/25 to-[#6E38E0]/25 text-2xl ring-1 ring-[#8A4FFF]/40">
              📷
            </div>
            <h4 className="mt-3 text-sm font-extrabold text-white">
              Aún no hay fotografías en el álbum de "{evento.nombre}"
            </h4>
            <p className="mx-auto mt-1 max-w-md text-xs text-[#8E92B2]">
              Elige tu diseño de overlay arriba y presiona{" "}
              <strong className="text-[#3CE7B6]">"📷 Abrir Cámara en Vivo"</strong> o{" "}
              <strong className="text-[#B794FF]">"⬆️ Subir Foto(s)"</strong> para capturar tus primeros
              recuerdos en Alta Definición.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3.5 min-[480px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {fotos.map((foto, idx) => (
              <div
                key={foto.idFoto}
                className="group flex flex-col overflow-hidden rounded-2xl border border-[#2E314B] bg-[#181A2C] shadow-[0_8px_20px_rgba(7,8,19,0.4)] transition hover:border-[#8A4FFF]/60 hover:shadow-[0_12px_28px_rgba(138,79,255,0.2)]"
              >
                <div
                  onClick={() => setLightboxIndex(idx)}
                  className="relative aspect-4/3 w-full cursor-pointer overflow-hidden bg-[#0D0E1B]"
                >
                  <img
                    src={getAlbumPhotoUrl(foto.thumbUrl)}
                    alt={foto.titulo}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-[#0D0E1B]/90 via-[#0D0E1B]/45 to-transparent px-3 py-2 text-[10px] font-bold text-[#F4F5FB]">
                    <span className="rounded-full bg-[#141526]/80 px-2 py-0.5 text-[9px] text-[#3CE7B6] ring-1 ring-[#3CE7B6]/30">
                      {foto.width && foto.height
                        ? `${foto.width}×${foto.height}px`
                        : "HD"}
                    </span>
                    <span className="text-[#C5C8E6]">{foto.sizeKb ? `${foto.sizeKb} KB` : ""}</span>
                  </div>
                </div>

                <div className="flex flex-1 flex-col justify-between p-3">
                  <div>
                    <p
                      className="truncate text-xs font-extrabold text-[#F4F5FB]"
                      title={foto.titulo}
                    >
                      {foto.titulo}
                    </p>
                    <p className="mt-0.5 text-[10px] text-[#8E92B2]">
                      🕒 {formatDateTime(foto.capturadaEn)}
                    </p>
                  </div>

                  <div className="mt-3 grid grid-cols-4 gap-1.5 border-t border-[#262942] pt-2.5">
                    <button
                      type="button"
                      onClick={() => setLightboxIndex(idx)}
                      className="cursor-pointer whitespace-nowrap rounded-full bg-[#4BA6FF]/15 px-1 py-1.5 text-[10px] font-extrabold text-[#5EB2FF] ring-1 ring-[#4BA6FF]/30 transition hover:bg-[#4BA6FF] hover:text-white"
                      title="Abrir en el Visor HD"
                    >
                      🔍 Ver
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownloadSinglePhoto(foto, idx)}
                      className="cursor-pointer whitespace-nowrap rounded-full bg-[#38CB89]/15 px-1 py-1.5 text-[10px] font-extrabold text-[#3CE7B6] ring-1 ring-[#38CB89]/30 transition hover:bg-[#38CB89] hover:text-white"
                      title="Descargar en resolución guardada (HD)"
                    >
                      ⬇️ HD
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownloadPhoto2K(foto, idx)}
                      disabled={downloading2KId === foto.idFoto}
                      className="cursor-pointer whitespace-nowrap rounded-full bg-[#FFB836]/15 px-1 py-1.5 text-[10px] font-extrabold text-[#FFB836] ring-1 ring-[#FFB836]/35 transition hover:bg-[#FFB836] hover:text-[#141526] disabled:opacity-45"
                      title="Convertir al momento a 2K (2560px) en memoria y descargar sin guardar en servidor"
                    >
                      {downloading2KId === foto.idFoto ? "⏳..." : "✨ 2K"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePhoto(foto)}
                      disabled={deletingPhotoId === foto.idFoto}
                      className="cursor-pointer whitespace-nowrap rounded-full bg-[#F25767]/15 px-1 py-1.5 text-[10px] font-extrabold text-[#FF7A88] ring-1 ring-[#F25767]/30 transition hover:bg-[#F25767] hover:text-white disabled:opacity-45"
                      title="Eliminar fotografía"
                    >
                      {deletingPhotoId === foto.idFoto ? "..." : "🗑️"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* =====================================================================
          6. MODAL VISOR EN PANTALLA COMPLETA (LIGHTBOX ALTA DEFINICIÓN + SELECTOR DE OVERLAY EN VIVO)
         ===================================================================== */}
      {activeLightboxPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-1.5 backdrop-blur-md sm:p-4 lg:p-6"
          style={{
            background:
              "radial-gradient(circle at 82% 78%, rgba(138, 79, 255, 0.42) 0%, rgba(56, 22, 128, 0.86) 45%, rgba(11, 9, 28, 0.96) 100%)",
          }}
          onClick={() => setLightboxIndex(null)}
        >
          <div
            className="relative flex max-h-[96dvh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-[#2E3150] bg-[#141526] text-[#F4F5FB] shadow-[0_30px_90px_rgba(5,4,18,0.92)] sm:max-h-[95vh] sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Barra superior del visor (compacta y responsiva en móvil, tablet y desktop) */}
            <div className="shrink-0 flex flex-col gap-2.5 border-b border-[#252842] bg-[#141526] px-3 py-2.5 sm:px-5 sm:py-3.5 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#8A4FFF] to-[#6E38E0] text-[11px] shadow-[0_4px_12px_rgba(138,79,255,0.45)] sm:h-7 sm:w-7 sm:text-xs">
                    📸
                  </span>
                  <p className="max-w-[200px] truncate text-xs font-extrabold text-white min-[420px]:max-w-[280px] sm:max-w-md sm:text-sm">
                    {activeLightboxPhoto.titulo}
                  </p>
                  {applyingOverlayInVisor ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#FF8E8E]/25 to-[#FFAE73]/25 px-2.5 py-0.5 text-[10px] font-extrabold text-[#FFAE73] ring-1 ring-[#FFAE73]/40">
                      ⏳ Aplicando overlay...
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#8A4FFF]/25 to-[#6E38E0]/25 px-2.5 py-0.5 text-[10px] font-extrabold text-[#C4A6FF] ring-1 ring-[#8A4FFF]/45">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#3CE7B6]" />
                      🎨 Overlay:{" "}
                      {OVERLAY_DESIGNS.find((d) => d.id === visorOverlayId)
                        ?.shortName || "🚫 Sin Overlay"}
                    </span>
                  )}
                </div>
                <div className="mt-1 inline-flex max-w-full flex-wrap items-center gap-1.5 rounded-xl border border-[#22243A] bg-[#0B0C18] px-2.5 py-0.5 text-[10px] font-medium text-[#8E92B2] sm:mt-1.5 sm:rounded-full sm:px-3 sm:text-[11px]">
                  <span className="text-[#3CE7B6]">●</span>
                  <span className="truncate">
                    Foto {lightboxIndex + 1} de {fotos.length} · HD (
                    {activeLightboxPhoto.width}×{activeLightboxPhoto.height}px ·{" "}
                    {activeLightboxPhoto.sizeKb} KB)
                  </span>
                </div>
              </div>

              {/* Botonera superior del visor: 2x2 en móvil, fila en tablet/desktop */}
              <div className="grid grid-cols-2 gap-1.5 sm:flex sm:flex-wrap sm:items-center sm:gap-2 lg:shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    handleDownloadSinglePhoto(activeLightboxPhoto, lightboxIndex)
                  }
                  className="cursor-pointer rounded-full bg-gradient-to-r from-[#2ED47A] to-[#38CB89] px-3 py-1.5 text-center text-[11px] font-extrabold text-white shadow-[0_5px_16px_rgba(56,203,137,0.38)] transition hover:brightness-110 sm:px-4 sm:text-xs"
                >
                  ⬇️ Descargar HD
                </button>
                <button
                  type="button"
                  disabled={downloading2KId === activeLightboxPhoto.idFoto}
                  onClick={() =>
                    handleDownloadPhoto2K(
                      activeLightboxPhoto,
                      lightboxIndex,
                      visorOverlayId
                    )
                  }
                  className="cursor-pointer rounded-full bg-gradient-to-r from-[#FFB836] to-[#FF8E6E] px-3 py-1.5 text-center text-[11px] font-extrabold text-[#141526] shadow-[0_5px_16px_rgba(255,184,54,0.35)] transition hover:brightness-110 disabled:opacity-50 sm:px-4 sm:text-xs"
                  title="Convierte la imagen y el overlay activo a 2K (2560px) en memoria RAM y la descarga al instante sin guardarla en BD local"
                >
                  {downloading2KId === activeLightboxPhoto.idFoto
                    ? "⏳ Generando 2K..."
                    : "✨ Descargar 2K"}
                </button>
                <button
                  type="button"
                  onClick={() => handleDeletePhoto(activeLightboxPhoto)}
                  className="cursor-pointer rounded-full border border-[#F25767]/40 bg-[#F25767]/20 px-3 py-1.5 text-center text-[11px] font-extrabold text-[#FF8A96] transition hover:bg-[#F25767] hover:text-white sm:px-3.5 sm:text-xs"
                >
                  🗑️ Eliminar
                </button>
                <button
                  type="button"
                  onClick={() => setLightboxIndex(null)}
                  className="cursor-pointer rounded-full border border-[#323552] bg-[#222437] px-3 py-1.5 text-center text-[11px] font-extrabold text-[#E2E4F6] transition hover:border-[#8A4FFF] hover:bg-[#2A2D46] hover:text-white sm:px-3.5 sm:text-xs"
                >
                  ✕ Cerrar
                </button>
              </div>
            </div>

            {/* Imagen en Alta Definición (adaptable en altura según dispositivo) */}
            <div className="relative flex min-h-[190px] flex-1 items-center justify-center overflow-hidden bg-[#0B0C18] p-2 sm:min-h-[250px] sm:p-4">
              <canvas
                ref={lightboxCanvasRef}
                className={`max-h-[38dvh] w-auto max-w-full rounded-xl border border-[#252842] object-contain shadow-[0_16px_45px_rgba(0,0,0,0.65)] sm:max-h-[46dvh] sm:rounded-2xl lg:max-h-[52vh] ${
                  visorLiveCanvasReady ? "block" : "hidden"
                }`}
              />
              {!visorLiveCanvasReady && (
                <img
                  src={getAlbumPhotoUrl(activeLightboxPhoto.hdUrl)}
                  alt={activeLightboxPhoto.titulo}
                  className="max-h-[38dvh] w-auto max-w-full rounded-xl border border-[#252842] object-contain shadow-[0_16px_45px_rgba(0,0,0,0.65)] sm:max-h-[46dvh] sm:rounded-2xl lg:max-h-[52vh]"
                />
              )}

              {fotos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setLightboxIndex(
                        (lightboxIndex - 1 + fotos.length) % fotos.length
                      )
                    }
                    className="absolute left-2 top-1/2 -translate-y-1/2 cursor-pointer rounded-xl border border-[#36395A] bg-[#222437]/90 px-2.5 py-1.5 text-xs font-extrabold text-white shadow-lg transition hover:border-[#8A4FFF] hover:bg-[#8A4FFF] sm:left-3 sm:px-3.5 sm:py-2 sm:text-sm"
                  >
                    ◀
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setLightboxIndex((lightboxIndex + 1) % fotos.length)
                    }
                    className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer rounded-xl border border-[#36395A] bg-[#222437]/90 px-2.5 py-1.5 text-xs font-extrabold text-white shadow-lg transition hover:border-[#8A4FFF] hover:bg-[#8A4FFF] sm:right-3 sm:px-3.5 sm:py-2 sm:text-sm"
                  >
                    ▶
                  </button>
                </>
              )}
            </div>

            {/* Panel Inferior del Visor: Scroll interno automático en pantallas bajas, tira deslizable en móvil */}
            <div className="shrink-0 max-h-[42dvh] space-y-2.5 overflow-y-auto border-t border-[#2E3150] bg-[#222437] px-3 py-2.5 sm:max-h-[40vh] sm:space-y-3 sm:px-5 sm:py-3.5 lg:max-h-none lg:overflow-visible">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#FFB836]/20 text-xs text-[#FFB836] ring-1 ring-[#FFB836]/40">
                    🎨
                  </span>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#E2E4F6] sm:text-[11px]">
                    Selecciona un Overlay para aplicarlo al instante a esta fotografía:
                  </span>
                </div>
                {visorOverlayId !== "none" && (
                  <button
                    type="button"
                    disabled={applyingOverlayInVisor}
                    onClick={() =>
                      handleSelectAndApplyOverlayInVisor(visorOverlayId)
                    }
                    className="w-full cursor-pointer rounded-full bg-gradient-to-r from-[#8A4FFF] to-[#6E38E0] px-4 py-1.5 text-center text-[11px] font-extrabold text-white shadow-[0_4px_15px_rgba(138,79,255,0.4)] transition hover:brightness-110 disabled:opacity-50 sm:w-auto"
                  >
                    {applyingOverlayInVisor
                      ? "⏳ Guardando en foto..."
                      : "✨ Actualizar Texto en Foto"}
                  </button>
                )}
              </div>

              {/* Botones de Overlays: tira horizontal deslizable en móvil, envuelta en tablet/desktop */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
                {OVERLAY_DESIGNS.map((design) => {
                  const isSelected = visorOverlayId === design.id;
                  return (
                    <button
                      key={design.id}
                      type="button"
                      disabled={applyingOverlayInVisor}
                      onClick={() =>
                        handleSelectAndApplyOverlayInVisor(design.id)
                      }
                      className={`inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-[11px] font-extrabold transition disabled:opacity-60 sm:px-3 sm:text-xs ${
                        isSelected
                          ? "border-[#A478FF] bg-gradient-to-r from-[#8A4FFF] to-[#6E38E0] text-white shadow-[0_4px_14px_rgba(138,79,255,0.42)] ring-2 ring-[#8A4FFF]/40"
                          : "border-[#313452] bg-[#141526] text-[#C5C8E6] hover:border-[#8A4FFF]/60 hover:bg-[#1B1D34] hover:text-white"
                      }`}
                    >
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-white/25"
                        style={{ backgroundColor: design.accentHex }}
                      />
                      <span className="whitespace-nowrap">{design.shortName}</span>
                    </button>
                  );
                })}
              </div>

              {/* Campos para personalizar el Título Principal y los 2 Subtítulos desde el mismo visor */}
              <div className="grid grid-cols-1 gap-2 pt-0.5 sm:grid-cols-3 sm:gap-2.5">
                <div className="rounded-xl border border-[#2E314E] bg-[#181A2C] p-2">
                  <label className="mb-1 flex items-center gap-1.5 text-[10px] font-extrabold text-[#C5C8E6]">
                    <span className="h-2 w-2 shrink-0 rounded-full bg-[#8A4FFF]" />
                    <span className="truncate">Titulo Principal</span>
                  </label>
                  <input
                    type="text"
                    value={overlayMainText}
                    onChange={(e) => {
                      setOverlayMainText(e.target.value);
                      if (visorOverlayId !== "none") {
                        setVisorLiveCanvasReady(true);
                      }
                    }}
                    placeholder={defaultMainText}
                    maxLength={80}
                    className="w-full rounded-lg border border-[#313452] bg-[#0D0E1B] px-2.5 py-1.5 text-xs font-semibold text-white placeholder-[#6E7293] outline-none transition focus:border-[#8A4FFF] focus:ring-2 focus:ring-[#8A4FFF]/25"
                  />
                </div>
                <div className="rounded-xl border border-[#2E314E] bg-[#181A2C] p-2">
                  <label className="mb-1 flex items-center gap-1.5 text-[10px] font-extrabold text-[#C5C8E6]">
                    <span className="h-2 w-2 shrink-0 rounded-full bg-[#3CE7B6]" />
                    <span className="truncate">Subtítulo 1 / Ej. Fecha-Lugar</span>
                  </label>
                  <input
                    type="text"
                    value={overlaySubText}
                    onChange={(e) => {
                      setOverlaySubText(e.target.value);
                      if (visorOverlayId !== "none") {
                        setVisorLiveCanvasReady(true);
                      }
                    }}
                    placeholder="Ej. 26 Oct 2026 • Recuerdo Especial"
                    maxLength={80}
                    className="w-full rounded-lg border border-[#313452] bg-[#0D0E1B] px-2.5 py-1.5 text-xs font-semibold text-white placeholder-[#6E7293] outline-none transition focus:border-[#3CE7B6] focus:ring-2 focus:ring-[#3CE7B6]/25"
                  />
                </div>
                <div className="rounded-xl border border-[#2E314E] bg-[#181A2C] p-2">
                  <label className="mb-1 flex items-center gap-1.5 text-[10px] font-extrabold text-[#C5C8E6]">
                    <span className="h-2 w-2 shrink-0 rounded-full bg-[#FF8E8E]" />
                    <span className="truncate">Subtítulo 2 (Opcional)</span>
                  </label>
                  <input
                    type="text"
                    value={overlayThirdText}
                    onChange={(e) => {
                      setOverlayThirdText(e.target.value);
                      if (visorOverlayId !== "none") {
                        setVisorLiveCanvasReady(true);
                      }
                    }}
                    placeholder="Ej. MUSIC & CHAMPAGNE / #MiEvento"
                    maxLength={80}
                    className="w-full rounded-lg border border-[#313452] bg-[#0D0E1B] px-2.5 py-1.5 text-xs font-semibold text-white placeholder-[#6E7293] outline-none transition focus:border-[#FF8E8E] focus:ring-2 focus:ring-[#FF8E8E]/25"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
