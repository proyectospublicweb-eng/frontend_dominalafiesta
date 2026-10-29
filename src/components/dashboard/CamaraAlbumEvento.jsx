import { useEffect, useMemo, useRef, useState } from "react";
import {
  getAlbumFotosEventoRequest,
  toggleCompartirAlbumEventoRequest,
  addFotoAlbumEventoRequest,
  updateFotoAlbumEventoRequest,
  deleteFotoAlbumEventoRequest,
  addReelAlbumEventoRequest,
  deleteReelAlbumEventoRequest,
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
import {
  REEL_DESIGNS,
  renderReelFrameOnCanvas,
  preloadImagesForReel,
  generateReelVideoBlobInMemory,
} from "../../utils/reelGenerator.js";

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

function formatAudioMinSec(totalSec) {
  const safe = Math.max(0, Number(totalSec) || 0);
  const mins = Math.floor(safe / 60);
  const secs = Math.floor(safe % 60);
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export default function CamaraAlbumEvento({
  evento,
  onShowNotice,
  modoInvitado = false,
  onCloseModoInvitado,
}) {
  const [loading, setLoading] = useState(true);
  const [fotos, setFotos] = useState([]);
  const [reels, setReels] = useState([]);
  const [compartirConInvitados, setCompartirConInvitados] = useState(
    Boolean(evento?.compartir_album_invitados)
  );
  const [togglingCompartir, setTogglingCompartir] = useState(false);
  const [guestActiveReel, setGuestActiveReel] = useState(null);
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

  const [overlayDesignId, setOverlayDesignId] = useState("none");
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
        setOverlayDesignId(parsed.designId || "none");
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
    setOverlayDesignId("none");
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

  // Creador flotante de Reels para Instagram / Redes Sociales (guardados en álbum con vigencia de 30 días)
  const [reelModalOpen, setReelModalOpen] = useState(false);
  const [reelDesignId, setReelDesignId] = useState(
    REEL_DESIGNS[0]?.id || "glam-pulse"
  );
  const [reelSelectedIds, setReelSelectedIds] = useState([]);
  const [reelDurationSec, setReelDurationSec] = useState(15); // 10s, 15s, 20s
  const [reelAudioFile, setReelAudioFile] = useState(null);
  const [reelAudioUrl, setReelAudioUrl] = useState("");
  const [reelAudioDurationSec, setReelAudioDurationSec] = useState(0);
  const [reelAudioStartSec, setReelAudioStartSec] = useState(0);
  const [reelAudioPlayheadSec, setReelAudioPlayheadSec] = useState(0);
  const [reelAudioPreviewPlaying, setReelAudioPreviewPlaying] = useState(false);
  const [liveReelPlaying, setLiveReelPlaying] = useState(false);
  const [activePreviewReel, setActivePreviewReel] = useState(null);
  const [reelGenerating, setReelGenerating] = useState(false);
  const [reelProgress, setReelProgress] = useState(0);
  const [deletingReelId, setDeletingReelId] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);
  const nativeCameraInputRef = useRef(null);
  const reelAudioInputRef = useRef(null);
  const reelAudioPlayerRef = useRef(null);
  const liveOverlayCanvasRef = useRef(null);
  const lightboxCanvasRef = useRef(null);
  const lightboxBaseImgRef = useRef(null);
  const reelPreviewCanvasRef = useRef(null);
  const reelPreviewSectionRef = useRef(null);
  const reelLoadedImagesRef = useRef([]);
  const liveReelStartRef = useRef(0);

  const handleSelectPreviewReel = (reel) => {
    setActivePreviewReel(reel);
    if (reel && typeof window !== "undefined" && window.innerWidth < 1024) {
      setTimeout(() => {
        reelPreviewSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }, 80);
    }
  };

  // Mostrar el scrollbar estilizado únicamente mientras el usuario está haciendo scroll
  const handleSmartScroll = (e) => {
    const el = e.currentTarget;
    if (!el) return;
    el.classList.add("is-scrolling");
    if (el._scrollHideTimer) {
      clearTimeout(el._scrollHideTimer);
    }
    el._scrollHideTimer = setTimeout(() => {
      el.classList.remove("is-scrolling");
    }, 850);
  };

  const notify = (msg) => {
    if (typeof onShowNotice === "function") {
      onShowNotice(msg);
    }
  };

  const activeLightboxPhoto =
    lightboxIndex !== null && fotos[lightboxIndex] ? fotos[lightboxIndex] : null;

  // Bloquear el scroll vertical del Dashboard mientras el Visor de Fotografías o el Creador de Reels estén activos
  const isModalOverlayOpen = Boolean(activeLightboxPhoto) || reelModalOpen;
  useEffect(() => {
    if (!isModalOverlayOpen || typeof document === "undefined") return undefined;

    const htmlEl = document.documentElement;
    const bodyEl = document.body;
    const mainEls = Array.from(document.querySelectorAll("main"));

    const prevHtmlOverflow = htmlEl.style.overflow;
    const prevBodyOverflow = bodyEl.style.overflow;
    const prevMainOverflows = mainEls.map((el) => el.style.overflow);

    htmlEl.style.overflow = "hidden";
    bodyEl.style.overflow = "hidden";
    mainEls.forEach((el) => {
      el.style.overflow = "hidden";
    });

    return () => {
      htmlEl.style.overflow = prevHtmlOverflow;
      bodyEl.style.overflow = prevBodyOverflow;
      mainEls.forEach((el, idx) => {
        el.style.overflow = prevMainOverflows[idx] || "";
      });
    };
  }, [isModalOverlayOpen]);

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

  // Dibujar superposición del Overlay sobre el visor de cámara en vivo cuando esté activo
  useEffect(() => {
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
      setReels(Array.isArray(data.reels) ? data.reels : []);
      if (data.compartir_album_invitados !== undefined) {
        setCompartirConInvitados(Boolean(data.compartir_album_invitados));
      }
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

  const handleToggleCompartirConInvitados = async () => {
    if (!evento?.idevento || togglingCompartir || modoInvitado) return;
    setTogglingCompartir(true);
    try {
      const nextVal = !compartirConInvitados;
      const { data } = await toggleCompartirAlbumEventoRequest(
        evento.idevento,
        nextVal
      );
      setCompartirConInvitados(Boolean(data.compartir_album_invitados));
      notify(
        data.message ||
          (data.compartir_album_invitados
            ? "✓ Fotos y Reels compartidos con los invitados que confirmaron asistencia."
            : "🔒 Se revocó el permiso de ver Fotos y Reels a los invitados.")
      );
    } catch (err) {
      notify(
        err.response?.data?.message ||
          "No se pudo actualizar el permiso para compartir fotos y reels."
      );
    } finally {
      setTogglingCompartir(false);
    }
  };

  useEffect(() => {
    setCompartirConInvitados(Boolean(evento?.compartir_album_invitados));
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

  // ===========================================================================
  // CREADOR DE REELS 9:16 PARA INSTAGRAM (GUARDADOS EN EL ÁLBUM CON VIGENCIA DE 30 DÍAS)
  // ===========================================================================
  const handleOpenReelCreator = () => {
    if (fotos.length === 0 && reels.length === 0) {
      notify(
        "Agrega o captura al menos una fotografía en el álbum para crear un Reel."
      );
      return;
    }
    // Al entrar al creador de Reels, seleccionar únicamente la primera fotografía por defecto
    setReelSelectedIds(fotos.length > 0 ? [fotos[0].idFoto] : []);
    setActivePreviewReel(null);
    setReelModalOpen(true);
  };

  const handleRemoveReelAudio = (silent = false) => {
    if (reelAudioPlayerRef.current) {
      try {
        reelAudioPlayerRef.current.pause();
      } catch {
        // Ignorar
      }
    }
    if (reelAudioUrl) {
      URL.revokeObjectURL(reelAudioUrl);
    }
    setReelAudioFile(null);
    setReelAudioUrl("");
    setReelAudioDurationSec(0);
    setReelAudioStartSec(0);
    setReelAudioPlayheadSec(0);
    setReelAudioPreviewPlaying(false);
    if (reelAudioInputRef.current) {
      reelAudioInputRef.current.value = "";
    }
    if (!silent) {
      notify("🔇 Se quitó el archivo de audio del Reel.");
    }
  };

  const maxReelAudioStartSec = useMemo(() => {
    const songDur = Number(reelAudioDurationSec) || 0;
    const reelDur = Number(reelDurationSec) || 15;
    if (songDur <= 0) return 0;
    if (songDur > reelDur) {
      return Math.max(0, Math.floor((songDur - reelDur) * 10) / 10);
    }
    return Math.max(0, Math.floor((songDur - 0.5) * 10) / 10);
  }, [reelAudioDurationSec, reelDurationSec]);

  const handleSelectReelAudioStart = (nextVal, seekPlayer = true) => {
    const numeric = Math.max(0, Number(nextVal) || 0);
    const clamped =
      maxReelAudioStartSec > 0
        ? Math.min(numeric, maxReelAudioStartSec)
        : numeric;
    const rounded = Math.round(clamped * 2) / 2;
    setReelAudioStartSec(rounded);
    setReelAudioPlayheadSec(rounded);
    if (seekPlayer && reelAudioPlayerRef.current) {
      try {
        reelAudioPlayerRef.current.currentTime = rounded;
      } catch {
        // Ignorar
      }
    }
  };

  const handleTogglePreviewAudioSegment = () => {
    const player = reelAudioPlayerRef.current;
    if (!player) return;
    if (reelAudioPreviewPlaying) {
      player.pause();
      try {
        player.currentTime = reelAudioStartSec;
      } catch {
        // Ignorar
      }
      setReelAudioPreviewPlaying(false);
      setLiveReelPlaying(false);
      setReelAudioPlayheadSec(reelAudioStartSec);
      return;
    }
    try {
      player.currentTime = reelAudioStartSec;
      setReelAudioPlayheadSec(reelAudioStartSec);
      liveReelStartRef.current = performance.now();
      player
        .play()
        .then(() => setReelAudioPreviewPlaying(true))
        .catch(() => {
          setReelAudioPreviewPlaying(false);
          setReelAudioPlayheadSec(reelAudioStartSec);
        });
    } catch {
      setReelAudioPreviewPlaying(false);
      setReelAudioPlayheadSec(reelAudioStartSec);
    }
  };

  const handleToggleLiveReelPreview = () => {
    setActivePreviewReel(null);
    const player = reelAudioPlayerRef.current;

    if (liveReelPlaying) {
      setLiveReelPlaying(false);
      if (player) {
        player.pause();
        try {
          player.currentTime = reelAudioStartSec;
        } catch {
          // Ignorar
        }
      }
      setReelAudioPreviewPlaying(false);
      setReelAudioPlayheadSec(reelAudioStartSec);
      return;
    }

    liveReelStartRef.current = performance.now();
    setLiveReelPlaying(true);

    if (player && reelAudioUrl) {
      try {
        player.currentTime = reelAudioStartSec;
        setReelAudioPlayheadSec(reelAudioStartSec);
        player
          .play()
          .then(() => setReelAudioPreviewPlaying(true))
          .catch(() => setReelAudioPreviewPlaying(false));
      } catch {
        setReelAudioPreviewPlaying(false);
      }
    }
  };

  // Avance automático fluido de la marca de tiempo y contador al escuchar el tramo, regresando al inicio elegido al detenerse
  useEffect(() => {
    if (!reelAudioPreviewPlaying && !liveReelPlaying) return undefined;
    let rafId = null;

    const syncPlayhead = () => {
      const player = reelAudioPlayerRef.current;
      const reelDurSec = Number(reelDurationSec) || 15;

      if (player && !player.paused && reelAudioPreviewPlaying) {
        const cur = Number(player.currentTime) || 0;
        const endLimit = reelAudioStartSec + reelDurSec;
        const totalDur = Number(player.duration) || 9999;

        if (cur >= endLimit || cur >= totalDur - 0.05) {
          player.pause();
          try {
            player.currentTime = reelAudioStartSec;
          } catch {
            // Ignorar
          }
          setReelAudioPreviewPlaying(false);
          setLiveReelPlaying(false);
          setReelAudioPlayheadSec(reelAudioStartSec);
          return;
        }
        setReelAudioPlayheadSec(cur);
      } else if (liveReelPlaying && !reelAudioPreviewPlaying) {
        const elapsedSec =
          (performance.now() - (liveReelStartRef.current || performance.now())) /
          1000;
        if (elapsedSec >= reelDurSec) {
          setLiveReelPlaying(false);
          return;
        }
      }
      rafId = window.requestAnimationFrame(syncPlayhead);
    };

    rafId = window.requestAnimationFrame(syncPlayhead);
    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [reelAudioPreviewPlaying, liveReelPlaying, reelAudioStartSec, reelDurationSec]);

  const handleToggleReelPhoto = (idFoto) => {
    setActivePreviewReel(null);
    setReelSelectedIds((prev) => {
      const next = prev.includes(idFoto)
        ? prev.filter((id) => id !== idFoto)
        : [...prev, idFoto];
      if (next.length === 0 && reelAudioFile) {
        handleRemoveReelAudio(true);
      }
      return next;
    });
  };

  const handleClickSelectReelAudio = () => {
    if (reelSelectedIds.length === 0) {
      notify(
        "⚠️ Primero debes seleccionar al menos una fotografía en el Paso 2 para poder subir audio al Reel."
      );
      return;
    }
    reelAudioInputRef.current?.click();
  };

  const handleReelAudioFileChange = (e) => {
    const file = e.target.files?.[0];
    if (e.target) e.target.value = "";
    if (!file) return;

    // Validación estricta: no permitir subir audio si no hay fotografías seleccionadas
    if (reelSelectedIds.length === 0) {
      notify(
        "⚠️ Primero debes seleccionar al menos una fotografía en el Paso 2 para poder subir audio al Reel."
      );
      return;
    }

    if (
      !String(file.type || "").startsWith("audio/") &&
      !/\.(mp3|m4a|wav|ogg|aac|flac)$/i.test(file.name || "")
    ) {
      notify(
        "⚠️ Selecciona un archivo de audio válido (.mp3, .m4a, .wav u .ogg)."
      );
      return;
    }

    if (reelAudioUrl) {
      URL.revokeObjectURL(reelAudioUrl);
    }
    const nextUrl = URL.createObjectURL(file);
    setReelAudioFile(file);
    setReelAudioUrl(nextUrl);
    setReelAudioDurationSec(0);
    setReelAudioStartSec(0);
    setReelAudioPlayheadSec(0);
    setReelAudioPreviewPlaying(false);
    setActivePreviewReel(null);
    notify(`🎵 Audio «${file.name}» listo para integrarse en tu Reel.`);
  };

  const computedSlideDurationMs = useMemo(() => {
    const count = Math.max(1, reelSelectedIds.length);
    return Math.max(500, ((Number(reelDurationSec) || 15) * 1000) / count);
  }, [reelDurationSec, reelSelectedIds.length]);

  const activeReelAudioTitle = useMemo(() => {
    if (!reelAudioFile?.name) return "";
    return String(reelAudioFile.name).replace(/\.[^.]+$/, "");
  }, [reelAudioFile]);

  // Precargar imágenes seleccionadas y animar la vista previa 9:16 en tiempo real cuando el modal esté abierto
  useEffect(() => {
    if (!reelModalOpen || activePreviewReel) return;

    let cancelled = false;
    let rafId = null;

    const selectedPhotos = reelSelectedIds
      .map((id) => fotos.find((f) => f.idFoto === id))
      .filter(Boolean);

    const urls = selectedPhotos.map((f) =>
      getAlbumPhotoUrl(f.hdUrl || f.thumbUrl)
    );

    preloadImagesForReel(urls).then((imgs) => {
      if (cancelled) return;
      reelLoadedImagesRef.current = imgs;

      const start = performance.now();
      liveReelStartRef.current = start;
      const loop = (now) => {
        if (cancelled) return;
        const canvas = reelPreviewCanvasRef.current;
        if (canvas) {
          const pw = 360;
          const ph = 640;
          if (canvas.width !== pw) canvas.width = pw;
          if (canvas.height !== ph) canvas.height = ph;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            const baseStart = liveReelStartRef.current || start;
            renderReelFrameOnCanvas(ctx, pw, ph, {
              images: reelLoadedImagesRef.current,
              elapsedMs: Math.max(0, now - baseStart),
              slideDurationMs: computedSlideDurationMs,
              designId: reelDesignId,
              mainText: overlayMainText || defaultMainText,
              subText: overlaySubText || defaultSubText,
              tagText:
                overlayThirdText || evento?.tipo_evento || "RECUERDO OFICIAL",
              audioTitle: activeReelAudioTitle,
            });
          }
        }
        rafId = requestAnimationFrame(loop);
      };

      rafId = requestAnimationFrame(loop);
    });

    return () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [
    reelModalOpen,
    activePreviewReel,
    reelSelectedIds,
    reelDesignId,
    computedSlideDurationMs,
    overlayMainText,
    overlaySubText,
    overlayThirdText,
    defaultMainText,
    defaultSubText,
    evento?.tipo_evento,
    activeReelAudioTitle,
    fotos,
  ]);

  const handleGenerateAndSaveReel = async () => {
    if (reelSelectedIds.length === 0) {
      notify("Selecciona al menos una fotografía en miniatura para crear tu Reel.");
      return;
    }

    if (reelAudioPlayerRef.current) {
      try {
        reelAudioPlayerRef.current.pause();
      } catch {
        // Ignorar
      }
    }
    setReelAudioPreviewPlaying(false);
    setLiveReelPlaying(false);
    setReelGenerating(true);
    setReelProgress(0);

    let generatedLocalVideoUrl = "";
    let generatedThumbDataUrl = "";
    let generatedReelTitle = "";
    let generatedSizeKb = 0;
    let generatedExt = "webm";
    let generatedPhotosCount = 0;

    try {
      const selectedPhotos = reelSelectedIds
        .map((id) => fotos.find((f) => f.idFoto === id))
        .filter(Boolean);

      const hdUrls = selectedPhotos.map((f) =>
        getAlbumPhotoUrl(f.hdUrl || f.thumbUrl)
      );
      const imgs = await preloadImagesForReel(hdUrls);
      if (!imgs.length) {
        throw new Error(
          "No se pudieron cargar las fotografías seleccionadas para el Reel."
        );
      }

      generatedPhotosCount = imgs.length;
      const designObj = REEL_DESIGNS.find((d) => d.id === reelDesignId);
      const { blob, ext, videoDataUrl, thumbDataUrl } =
        await generateReelVideoBlobInMemory({
          images: imgs,
          designId: reelDesignId,
          totalDurationSec: reelDurationSec,
          mainText: overlayMainText || defaultMainText,
          subText: overlaySubText || defaultSubText,
          tagText: overlayThirdText || evento?.tipo_evento || "RECUERDO OFICIAL",
          audioFile: reelAudioFile,
          audioStartSec: reelAudioStartSec,
          audioTitle: activeReelAudioTitle,
          width: 720,
          height: 1280,
          fps: 30,
          onProgress: (pct) => setReelProgress(pct),
        });

      generatedLocalVideoUrl = blob ? URL.createObjectURL(blob) : "";
      generatedThumbDataUrl = thumbDataUrl || "";
      generatedSizeKb = Math.max(1, Math.round((blob?.size || 0) / 1024));
      generatedExt = ext || "webm";
      generatedReelTitle = `${designObj?.shortName || "Reel"} · ${reelDurationSec}s (${imgs.length} fotos)${
        reelAudioFile ? " 🎵" : ""
      }`;

      const { data } = await addReelAlbumEventoRequest(evento.idevento, {
        titulo: generatedReelTitle,
        videoDataUrl,
        thumbDataUrl,
        designId: reelDesignId,
        durationSec: reelDurationSec,
        photosCount: imgs.length,
        width: 720,
        height: 1280,
      });

      const savedReel = data?.reel
        ? {
            ...data.reel,
            localVideoUrl: generatedLocalVideoUrl,
            localThumbUrl: generatedThumbDataUrl,
          }
        : {
            idReel: `local_${Date.now()}`,
            idevento: evento.idevento,
            titulo: generatedReelTitle,
            designId: reelDesignId,
            durationSec: reelDurationSec,
            photosCount: generatedPhotosCount,
            sizeKb: generatedSizeKb,
            ext: generatedExt,
            localVideoUrl: generatedLocalVideoUrl,
            localThumbUrl: generatedThumbDataUrl,
            videoUrl: "",
            thumbUrl: "",
          };

      setReels((prev) => {
        const next = [savedReel, ...prev];
        const kbFotos = fotos.reduce((acc, f) => acc + (f.sizeKb || 0), 0);
        const kbReels = next.reduce((acc, r) => acc + (r.sizeKb || 0), 0);
        setTotalMb(Number(((kbFotos + kbReels) / 1024).toFixed(2)));
        return next;
      });
      setActivePreviewReel(savedReel);

      if (data?.retention) {
        setRetention(data.retention);
      }

      notify(
        `🎬 ¡Reel de ${reelDurationSec}s (${imgs.length} fotos) creado, guardado en "Reels Creados" y listo para reproducirse en la vista previa!`
      );
    } catch (err) {
      if (generatedLocalVideoUrl) {
        const fallbackReel = {
          idReel: `local_${Date.now()}`,
          idevento: evento.idevento,
          titulo: generatedReelTitle || `Reel · ${reelDurationSec}s`,
          designId: reelDesignId,
          durationSec: reelDurationSec,
          photosCount: generatedPhotosCount || reelSelectedIds.length,
          sizeKb: generatedSizeKb,
          ext: generatedExt,
          localVideoUrl: generatedLocalVideoUrl,
          localThumbUrl: generatedThumbDataUrl,
          videoUrl: "",
          thumbUrl: "",
        };
        setReels((prev) => [fallbackReel, ...prev]);
        setActivePreviewReel(fallbackReel);
        notify(
          `🎬 ¡Reel creado y agregado a "Reels Creados"! Puedes reproducirlo en la vista previa o descargarlo.`
        );
      } else {
        notify(
          err.response?.data?.message ||
            err?.message ||
            "No se pudo generar o guardar el Reel en este momento."
        );
      }
    } finally {
      setReelGenerating(false);
      setReelProgress(0);
    }
  };

  const handleDownloadSavedReel = async (reel, idx = 0) => {
    const safeEventName = String(evento?.nombre || "Evento")
      .replace(/[^a-zA-Z0-9_-]+/g, "_")
      .slice(0, 32);
    const ext =
      reel.ext ||
      (String(reel.filename || "").endsWith(".mp4") ? "mp4" : "webm");
    const downloadName = `Reel_${safeEventName}_${idx + 1}_${reel.durationSec || 15}s.${ext}`;

    if (reel.localVideoUrl) {
      const a = document.createElement("a");
      a.href = reel.localVideoUrl;
      a.download = downloadName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      notify(`⬇️ Descargando Reel (${reel.durationSec || 15}s)...`);
      return;
    }

    try {
      const url = `${getAlbumPhotoUrl(reel.videoUrl)}?download=1`;
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = downloadName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1500);
      notify(`⬇️ Descargando Reel (${reel.durationSec || 15}s)...`);
    } catch {
      const a = document.createElement("a");
      a.href = `${getAlbumPhotoUrl(reel.videoUrl)}?download=1`;
      a.download = reel.filename || downloadName;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  };

  const handleDeleteSavedReel = async (reel) => {
    if (!evento?.idevento || !reel?.idReel) return;
    setDeletingReelId(reel.idReel);
    try {
      if (!String(reel.idReel).startsWith("local_")) {
        await deleteReelAlbumEventoRequest(evento.idevento, reel.idReel);
      }
      if (reel.localVideoUrl) {
        URL.revokeObjectURL(reel.localVideoUrl);
      }
      if (activePreviewReel?.idReel === reel.idReel) {
        setActivePreviewReel(null);
      }
      setReels((prev) => {
        const next = prev.filter((r) => r.idReel !== reel.idReel);
        const kbFotos = fotos.reduce((acc, f) => acc + (f.sizeKb || 0), 0);
        const kbReels = next.reduce((acc, r) => acc + (r.sizeKb || 0), 0);
        setTotalMb(Number(((kbFotos + kbReels) / 1024).toFixed(2)));
        return next;
      });
      notify("🗑️ Reel eliminado del álbum del evento.");
    } catch (err) {
      notify(
        err.response?.data?.message || "No se pudo eliminar el Reel."
      );
    } finally {
      setDeletingReelId(null);
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
              {modoInvitado && typeof onCloseModoInvitado === "function" && (
                <button
                  type="button"
                  onClick={onCloseModoInvitado}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#4BA6FF]/40 bg-[#4BA6FF]/15 px-3 py-1 text-[10px] font-extrabold text-[#7DD3FC] transition hover:bg-[#4BA6FF] hover:text-white sm:text-[11px]"
                >
                  ← Volver a Mis Invitaciones
                </button>
              )}
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#3CE7B6]/20 to-[#2BC496]/20 px-2.5 py-1 text-[10px] font-extrabold text-[#3CE7B6] ring-1 ring-[#3CE7B6]/35 sm:px-3 sm:text-[11px]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#3CE7B6]" />
                <span>
                  {modoInvitado
                    ? "🎉 Compartido por el Anfitrión"
                    : "∞ Fotos Ilimitadas"}
                </span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#8A4FFF]/20 to-[#6E38E0]/20 px-2.5 py-1 text-[10px] font-extrabold text-[#B794FF] ring-1 ring-[#8A4FFF]/40 sm:px-3 sm:text-[11px]">
                <span>✨ {activePreset.label.split("(")[0].trim()}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#262942] bg-[#141526] px-2.5 py-1 text-[10px] font-bold text-[#9CA0C3] sm:px-3 sm:text-[11px]">
                📷 {fotos.length} {fotos.length === 1 ? "foto" : "fotos"} · 🎬{" "}
                {reels.length} {reels.length === 1 ? "reel" : "reels"} ({totalMb}{" "}
                MB)
              </span>
            </div>

            <h2 className="mt-2.5 break-words font-display text-lg font-extrabold uppercase tracking-wide text-white sm:text-xl lg:text-2xl">
              {modoInvitado
                ? `📸 Fotos y Reels del Evento — ${evento.nombre}`
                : `📸 Cámara y Álbum de Recuerdos — ${evento.nombre}`}
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-[#8E92B2]">
              {modoInvitado
                ? "El anfitrión de este evento te otorgó permiso para ver y descargar en Alta Definición las fotografías y reels oficiales por haber confirmado tu invitación."
                : "Este álbum es exclusivo de este evento. Toma fotografías en vivo con tu cámara o súbelas desde tu galería con tu diseño de overlay personalizado."}
            </p>
          </div>

          {/* Botonera Responsiva (Móvil: cuadrícula adaptativa, Tablet/Desk: fila flexible) */}
          <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2 sm:flex sm:flex-row sm:flex-wrap lg:shrink-0">
            {!modoInvitado && (
              <>
                <button
                  type="button"
                  disabled={togglingCompartir}
                  onClick={handleToggleCompartirConInvitados}
                  className={`inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full px-4 py-2.5 text-xs font-extrabold transition sm:w-auto ${
                    compartirConInvitados
                      ? "border border-[#38CB89]/55 bg-gradient-to-r from-[#1E9E63] to-[#2ED47A] text-white shadow-[0_6px_20px_rgba(46,212,122,0.4)] hover:brightness-110"
                      : "border border-[#FFB836]/45 bg-[#FFB836]/15 text-[#FFE2B8] hover:bg-[#FFB836]/25"
                  }`}
                  title="Otorga o revoca el permiso para que los invitados con asistencia confirmada vean las fotos y reels en su sección Mis Invitaciones"
                >
                  <span>
                    {togglingCompartir
                      ? "⏳ Actualizando permiso..."
                      : compartirConInvitados
                      ? "🟢 Compartiendo Fotos y Reels a Invitados"
                      : "🤝 Compartir Fotos y Reels a Invitados"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleToggleCameraOpen}
                  className={`inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full px-4 py-2.5 text-xs font-extrabold text-white transition sm:w-auto ${
                    cameraOpen
                      ? "bg-gradient-to-r from-[#F25767] to-[#E03E52] shadow-[0_6px_18px_rgba(242,87,103,0.38)] hover:brightness-110"
                      : "bg-gradient-to-r from-[#2ED47A] to-[#38CB89] shadow-[0_6px_18px_rgba(56,203,137,0.35)] hover:brightness-110"
                  }`}
                >
                  <span>
                    {cameraOpen ? "✕ Cerrar Cámara" : "📷 Abrir Cámara en Vivo"}
                  </span>
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
              </>
            )}

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

        {/* Estado del Permiso para Invitados Confirmados (Solo visible para el Anfitrión) */}
        {!modoInvitado && (
          <div
            className={`mt-4 flex flex-col gap-2.5 rounded-2xl border p-3 sm:flex-row sm:items-center sm:justify-between sm:p-3.5 ${
              compartirConInvitados
                ? "border-[#38CB89]/40 bg-[#38CB89]/10 text-[#D1FAE5]"
                : "border-[#343857] bg-[#181A2C] text-[#9CA0C3]"
            }`}
          >
            <div className="flex items-start gap-2.5">
              <span className="text-base leading-none">
                {compartirConInvitados ? "🟢" : "🔒"}
              </span>
              <div className="text-[11px] leading-relaxed">
                <strong className="text-white">
                  {compartirConInvitados
                    ? "Permiso activo para invitados confirmados:"
                    : "Álbum privado (solo visible para ti como anfitrión):"}
                </strong>{" "}
                {compartirConInvitados
                  ? "Todos los invitados que confirmaron su invitación en este evento pueden ver y descargar estas fotos y reels desde su sesión en la sección «💌 Mis Invitaciones»."
                  : "Activa el botón «🤝 Compartir Fotos y Reels a Invitados» cuando quieras que los invitados que confirmaron asistencia puedan ver las fotos y reels desde «💌 Mis Invitaciones»."}
              </div>
            </div>
            <button
              type="button"
              disabled={togglingCompartir}
              onClick={handleToggleCompartirConInvitados}
              className={`shrink-0 cursor-pointer rounded-full px-3.5 py-1.5 text-[11px] font-extrabold transition ${
                compartirConInvitados
                  ? "border border-white/20 bg-[#141526]/80 text-[#FCA5A5] hover:bg-[#F25767] hover:text-white"
                  : "bg-[#38CB89] text-[#0E131F] hover:brightness-110"
              }`}
            >
              {compartirConInvitados
                ? "Ocultar a Invitados"
                : "Otorgar Permiso Ahora"}
            </button>
          </div>
        )}

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
            3. VISOR DE CÁMARA EN VIVO INTEGRADA CON OVERLAY SUPERPUESTO
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
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:self-center">
            {!modoInvitado && (
              <button
                type="button"
                onClick={handleOpenReelCreator}
                disabled={fotos.length === 0 && reels.length === 0}
                className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#8A4FFF] via-[#E1306C] to-[#FF8E53] px-4 py-2 text-center text-xs font-extrabold text-white shadow-[0_6px_18px_rgba(225,48,108,0.38)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto"
                title="Abrir el creador flotante de Reels 9:16 para Instagram"
              >
                <span>
                  🎬 Crear Reel para Instagram
                  {reels.length > 0 ? ` (${reels.length})` : ""}
                </span>
              </button>
            )}
            {fotos.length > 0 && (
              <button
                type="button"
                onClick={handleDownloadZip}
                disabled={downloadingZip}
                className="w-full cursor-pointer rounded-full border border-[#343857] bg-[#141526] px-4 py-2 text-center text-xs font-extrabold text-[#D5D8F0] transition hover:border-[#8A4FFF] hover:bg-[#1B1D34] hover:text-white sm:w-auto"
              >
                {downloadingZip
                  ? "⏳ Generando archivo .ZIP..."
                  : `⬇️ Descargar las ${fotos.length} fotos en .ZIP`}
              </button>
            )}
          </div>
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
              {modoInvitado ? (
                "El anfitrión aún no ha subido fotografías a este evento."
              ) : (
                <>
                  Presiona{" "}
                  <strong className="text-[#3CE7B6]">
                    "📷 Abrir Cámara en Vivo"
                  </strong>{" "}
                  o{" "}
                  <strong className="text-[#B794FF]">"⬆️ Subir Foto(s)"</strong>{" "}
                  para capturar tus primeros recuerdos en Alta Definición y
                  personalízalos con los overlays al abrir cada foto.
                </>
              )}
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

                  <div
                    className={`mt-3 grid gap-1.5 border-t border-[#262942] pt-2.5 ${
                      modoInvitado ? "grid-cols-3" : "grid-cols-4"
                    }`}
                  >
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
                    {!modoInvitado && (
                      <button
                        type="button"
                        onClick={() => handleDeletePhoto(foto)}
                        disabled={deletingPhotoId === foto.idFoto}
                        className="cursor-pointer whitespace-nowrap rounded-full bg-[#F25767]/15 px-1 py-1.5 text-[10px] font-extrabold text-[#FF7A88] ring-1 ring-[#F25767]/30 transition hover:bg-[#F25767] hover:text-white disabled:opacity-45"
                        title="Eliminar fotografía"
                      >
                        {deletingPhotoId === foto.idFoto ? "..." : "🗑️"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* =====================================================================
          5.B SECCIÓN DE REELS DEL EVENTO (VISIBLE PARA INVITADOS CONFIRMADOS Y ANFITRIÓN)
         ===================================================================== */}
      {(modoInvitado || reels.length > 0) && (
        <div className="rounded-2xl border border-[#2F324D] bg-[#222437] p-3.5 shadow-[0_12px_30px_rgba(8,9,20,0.45)] sm:p-6">
          <div className="mb-4 flex flex-col gap-2.5 border-b border-[#2E314B] pb-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#8A4FFF] via-[#E1306C] to-[#FF8E53] text-xs shadow-[0_4px_12px_rgba(225,48,108,0.35)]">
                🎬
              </span>
              <div className="min-w-0">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-white">
                  Reels del Evento ({reels.length})
                </h3>
                <p className="text-[11px] text-[#8E92B2]">
                  Reels verticales (9:16) creados con los mejores momentos y música del evento. Toca cualquier Reel para reproducirlo o descargarlo.
                </p>
              </div>
            </div>
          </div>

          {reels.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#343857] bg-[#181A2C] px-4 py-8 text-center">
              <p className="text-xs font-extrabold text-white">
                Aún no hay Reels publicados en este evento
              </p>
              <p className="mt-1 text-[11px] text-[#8E92B2]">
                Cuando el anfitrión genere Reels del evento aparecerán aquí para que puedas reproducirlos y descargarlos.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {reels.map((reel, idx) => {
                const thumbSrc =
                  reel.localThumbUrl ||
                  (reel.thumbUrl ? getAlbumPhotoUrl(reel.thumbUrl) : "");
                const videoSrc =
                  reel.localVideoUrl ||
                  (reel.videoUrl ? getAlbumPhotoUrl(reel.videoUrl) : "");
                const isPlayingInline = guestActiveReel?.idReel === reel.idReel;

                return (
                  <div
                    key={reel.idReel}
                    className="flex flex-col overflow-hidden rounded-2xl border border-[#2E314B] bg-[#181A2C] shadow-[0_8px_22px_rgba(0,0,0,0.45)] transition hover:border-[#E1306C]/60"
                  >
                    <div className="relative aspect-9/16 w-full overflow-hidden bg-[#0B0C17]">
                      {isPlayingInline && videoSrc ? (
                        <video
                          src={videoSrc}
                          poster={thumbSrc || undefined}
                          controls
                          autoPlay
                          playsInline
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <div
                          onClick={() => setGuestActiveReel(reel)}
                          className="group relative h-full w-full cursor-pointer"
                        >
                          {thumbSrc ? (
                            <img
                              src={thumbSrc}
                              alt={reel.titulo}
                              loading="lazy"
                              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-3xl">
                              🎬
                            </div>
                          )}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/35 transition group-hover:bg-black/20">
                            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-base text-[#0F141D] shadow-lg transition group-hover:scale-110">
                              ▶
                            </span>
                          </div>
                          <span className="absolute right-2.5 top-2.5 rounded-full bg-[#141526]/85 px-2.5 py-0.5 text-[10px] font-extrabold text-[#7DD3FC] ring-1 ring-white/15">
                            {reel.durationSec || 15}s
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col justify-between p-3">
                      <div>
                        <p
                          className="truncate text-xs font-extrabold text-[#F4F5FB]"
                          title={reel.titulo}
                        >
                          {reel.titulo}
                        </p>
                        <p className="mt-0.5 text-[10px] text-[#8E92B2]">
                          🎞️ {reel.photosCount || 1} fotos ·{" "}
                          {reel.sizeKb ? `${reel.sizeKb} KB` : "HD 9:16"}
                        </p>
                      </div>

                      <div className="mt-3 flex items-center gap-1.5 border-t border-[#262942] pt-2.5">
                        <button
                          type="button"
                          onClick={() =>
                            setGuestActiveReel(isPlayingInline ? null : reel)
                          }
                          className="flex-1 cursor-pointer rounded-full bg-[#4BA6FF]/15 px-2.5 py-1.5 text-[10px] font-extrabold text-[#5EB2FF] ring-1 ring-[#4BA6FF]/30 transition hover:bg-[#4BA6FF] hover:text-white"
                        >
                          {isPlayingInline ? "⏹ Cerrar Video" : "▶ Ver Reel"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadSavedReel(reel, idx)}
                          className="flex-1 cursor-pointer rounded-full bg-[#38CB89]/15 px-2.5 py-1.5 text-[10px] font-extrabold text-[#3CE7B6] ring-1 ring-[#38CB89]/30 transition hover:bg-[#38CB89] hover:text-white"
                        >
                          ⬇️ Descargar
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          6. MODAL VISOR EN PANTALLA COMPLETA (LIGHTBOX ALTA DEFINICIÓN + SELECTOR DE OVERLAY EN VIVO)
         ===================================================================== */}
      {activeLightboxPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overscroll-contain p-1.5 backdrop-blur-xl sm:p-4 lg:p-6"
          style={{
            background:
              "radial-gradient(circle at 18% 22%, rgba(56, 189, 248, 0.16) 0%, rgba(129, 140, 248, 0.12) 42%, rgba(9, 12, 18, 0.94) 100%)",
          }}
          onClick={() => setLightboxIndex(null)}
        >
          <div
            className="relative flex max-h-[96dvh] w-full max-w-5xl flex-col overflow-hidden rounded-[22px] border border-white/[0.10] bg-gradient-to-br from-[#191E29]/95 via-[#141821]/98 to-[#1A1726]/95 text-[#F1F5F9] shadow-[0_32px_90px_rgba(0,0,0,0.88),inset_0_1px_0_rgba(255,255,255,0.12)] sm:max-h-[95vh] sm:rounded-[30px]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Luz ambiental decorativa superior izquierda e inferior derecha tipo Smart Home Glass */}
            <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-[#38BDF8]/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-[#EC4899]/10 blur-3xl" />

            {/* Barra superior del visor (Compacta y responsiva en móvil, tablet y desktop) */}
            <div className="relative z-10 shrink-0 flex flex-col gap-2.5 border-b border-white/[0.07] bg-[#161B24]/85 px-3 py-2.5 backdrop-blur-md sm:gap-3 sm:px-6 sm:py-3.5 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#56B4FC]/35 bg-[#56B4FC]/15 text-xs text-[#7DD3FC] shadow-[0_0_14px_rgba(56,189,248,0.2)] sm:h-7 sm:w-7">
                    📸
                  </span>
                  <h3 className="max-w-[180px] truncate text-xs font-semibold tracking-tight text-white/95 min-[400px]:max-w-[240px] sm:max-w-md sm:text-lg">
                    {activeLightboxPhoto.titulo}
                  </h3>
                  {applyingOverlayInVisor ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-[#38BDF8]/40 bg-[#38BDF8]/15 px-2 py-0.5 text-[10px] font-medium text-[#7DD3FC] sm:px-2.5 sm:text-[11px]">
                      ⏳ Aplicando overlay...
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.09] bg-[#232936]/90 px-2 py-0.5 text-[10px] font-medium text-[#CBD5E1] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:px-2.5 sm:text-[11px]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#34D399] shadow-[0_0_8px_#34D399]" />
                      Overlay:{" "}
                      <strong className="font-semibold text-white">
                        {OVERLAY_DESIGNS.find((d) => d.id === visorOverlayId)
                          ?.shortName || "🚫 Sin Overlay"}
                      </strong>
                    </span>
                  )}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] font-medium text-[#8A94A6] sm:text-[11px]">
                  <span className="text-[#38BDF8]">●</span>
                  <span className="truncate">
                    Fotografía {lightboxIndex + 1} de {fotos.length} · HD (
                    {activeLightboxPhoto.width}×{activeLightboxPhoto.height}px ·{" "}
                    {activeLightboxPhoto.sizeKb} KB)
                  </span>
                </div>
              </div>

              {/* Botonera superior del visor: 2x2 en móvil, fila flexible en tablet/desktop */}
              <div className="grid grid-cols-2 gap-1.5 sm:flex sm:flex-wrap sm:items-center sm:gap-2 lg:shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    handleDownloadSinglePhoto(activeLightboxPhoto, lightboxIndex)
                  }
                  className="cursor-pointer rounded-full border border-[#56B4FC]/45 bg-gradient-to-r from-[#2563EB] to-[#38BDF8] px-3 py-1.5 text-center text-[11px] font-semibold text-white shadow-[0_6px_18px_rgba(56,189,248,0.32),inset_0_1px_0_rgba(255,255,255,0.22)] transition hover:brightness-110 sm:px-4 sm:text-xs"
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
                  className="cursor-pointer rounded-full border border-white/[0.12] bg-[#2B3344] px-3 py-1.5 text-center text-[11px] font-medium text-[#7DD3FC] shadow-[0_4px_12px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.12)] transition hover:bg-[#353F54] hover:text-white disabled:opacity-50 sm:px-4 sm:text-xs"
                  title="Convierte la imagen y el overlay activo a 2K (2560px) en memoria RAM y la descarga al instante sin guardarla en BD local"
                >
                  {downloading2KId === activeLightboxPhoto.idFoto
                    ? "⏳ Generando 2K..."
                    : "✨ Descargar 2K"}
                </button>
                {!modoInvitado && (
                  <button
                    type="button"
                    onClick={() => handleDeletePhoto(activeLightboxPhoto)}
                    className="cursor-pointer rounded-full border border-white/[0.08] bg-[#222836] px-3 py-1.5 text-center text-[11px] font-medium text-[#FCA5A5] shadow-[0_4px_12px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:border-[#F87171]/40 hover:bg-[#35232B] hover:text-white sm:px-3.5 sm:text-xs"
                  >
                    🗑️ Eliminar
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setLightboxIndex(null)}
                  className="cursor-pointer rounded-full border border-white/[0.09] bg-[#232936]/90 px-3 py-1.5 text-center text-[11px] font-medium text-[#CBD5E1] shadow-[0_4px_12px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.10)] transition hover:bg-[#2E3646] hover:text-white sm:px-4 sm:text-xs"
                >
                  ✕ Cerrar
                </button>
              </div>
            </div>

            {/* Cuerpo unificado scrollable para garantizar visibilidad total en móvil (incluso con teclado virtual), tablet y desktop */}
            <div
              onScroll={handleSmartScroll}
              className="smart-glass-scroll relative z-10 flex flex-1 flex-col overflow-y-auto overscroll-contain"
            >
              {/* Escenario central de la Imagen en Alta Definición (shrink-0 + aire superior e inferior garantizado) */}
              <div className="relative flex shrink-0 items-center justify-center bg-[#0E121A]/90 px-3 py-5 shadow-inner sm:px-6 sm:py-6 lg:px-8 lg:py-7">
                <div className="relative flex max-w-[calc(100%-4.5rem)] items-center justify-center rounded-[18px] bg-gradient-to-tr from-[#38BDF8]/30 via-[#818CF8]/25 to-[#F472B6]/30 p-[2px] shadow-[0_20px_55px_rgba(0,0,0,0.75)] sm:max-w-[calc(100%-6.5rem)] sm:rounded-[20px] lg:max-w-[calc(100%-7.5rem)]">
                  <canvas
                    ref={lightboxCanvasRef}
                    className={`max-h-[35dvh] w-auto max-w-full rounded-[16px] bg-[#0B0E14] object-contain sm:max-h-[38dvh] sm:rounded-[18px] lg:max-h-[40vh] ${
                      visorLiveCanvasReady ? "block" : "hidden"
                    }`}
                  />
                  {!visorLiveCanvasReady && (
                    <img
                      src={getAlbumPhotoUrl(activeLightboxPhoto.hdUrl)}
                      alt={activeLightboxPhoto.titulo}
                      className="block max-h-[35dvh] w-auto max-w-full rounded-[16px] bg-[#0B0E14] object-contain sm:max-h-[38dvh] sm:rounded-[18px] lg:max-h-[40vh]"
                    />
                  )}
                </div>

                {fotos.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setLightboxIndex(
                          (lightboxIndex - 1 + fotos.length) % fotos.length
                        )
                      }
                      className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/[0.12] bg-[#242B38]/90 text-xs font-semibold text-[#E2E8F0] shadow-[0_6px_18px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-md transition hover:border-[#56B4FC]/50 hover:bg-[#30394B] hover:text-white sm:left-4 sm:h-11 sm:w-11 sm:text-sm"
                      title="Fotografía anterior"
                    >
                      ◀
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setLightboxIndex((lightboxIndex + 1) % fotos.length)
                      }
                      className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/[0.12] bg-[#242B38]/90 text-xs font-semibold text-[#E2E8F0] shadow-[0_6px_18px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-md transition hover:border-[#56B4FC]/50 hover:bg-[#30394B] hover:text-white sm:right-4 sm:h-11 sm:w-11 sm:text-sm"
                      title="Siguiente fotografía"
                    >
                      ▶
                    </button>
                  </>
                )}
              </div>

              {/* Panel Inferior del Visor estilo tarjetas "Lighting Master / Living Room / Smart Lock" (Solo Anfitrión) */}
              {!modoInvitado && (
              <div className="shrink-0 space-y-2.5 border-t border-white/[0.08] bg-gradient-to-b from-[#212735]/95 to-[#171B24]/95 px-3 py-3 backdrop-blur-md sm:space-y-3.5 sm:px-6 sm:py-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#56B4FC]/35 bg-[#56B4FC]/15 text-xs text-[#7DD3FC]">
                      🎨
                    </span>
                    <span className="text-xs font-semibold tracking-tight text-white/95 sm:text-sm">
                      Selecciona un Overlay para aplicarlo al instante a esta fotografía
                    </span>
                  </div>
                  {visorOverlayId !== "none" && (
                    <button
                      type="button"
                      disabled={applyingOverlayInVisor}
                      onClick={() =>
                        handleSelectAndApplyOverlayInVisor(visorOverlayId)
                      }
                      className="w-full cursor-pointer rounded-full border border-[#56B4FC]/45 bg-gradient-to-r from-[#2563EB] via-[#38BDF8] to-[#818CF8] px-4 py-1.5 text-center text-xs font-semibold text-white shadow-[0_6px_18px_rgba(56,189,248,0.32),inset_0_1px_0_rgba(255,255,255,0.22)] transition hover:brightness-110 disabled:opacity-50 sm:w-auto"
                    >
                      {applyingOverlayInVisor
                        ? "⏳ Guardando en foto..."
                        : "✨ Actualizar Texto en Foto"}
                    </button>
                  )}
                </div>

                {/* Botones de Overlays: tira deslizable en móvil, envuelta en tablet/desktop */}
                <div
                  onScroll={handleSmartScroll}
                  className="smart-glass-scroll flex items-center gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0"
                >
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
                        className={`inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-[14px] border px-3 py-1.5 text-xs font-medium transition-all disabled:opacity-60 sm:px-3.5 sm:py-2 ${
                          isSelected
                            ? "border-[#56B4FC]/55 bg-gradient-to-br from-[#273549] via-[#202938] to-[#2C4663] text-white shadow-[0_6px_18px_rgba(56,189,248,0.22),inset_0_1px_0_rgba(255,255,255,0.18)]"
                            : "border-white/[0.07] bg-[#181C26]/90 text-[#9AA4B8] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] hover:border-white/15 hover:bg-[#232937] hover:text-white"
                        }`}
                      >
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-white/30"
                          style={{ backgroundColor: design.accentHex }}
                        />
                        <span className="whitespace-nowrap">{design.shortName}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Campos para personalizar el Título Principal y los 2 Subtítulos (1 col en móvil, 2 en tablet, 3 en desktop) */}
                <div className="grid grid-cols-1 gap-2 pt-0.5 sm:grid-cols-2 sm:gap-2.5 lg:grid-cols-3 lg:gap-3">
                  <div className="rounded-[16px] border border-white/[0.07] bg-[#181C26]/90 p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                    <label className="mb-1 flex items-center gap-1.5 text-[11px] font-medium text-[#9AA4B8]">
                      <span className="h-2 w-2 shrink-0 rounded-full bg-[#38BDF8] shadow-[0_0_6px_#38BDF8]" />
                      <span className="truncate">Título Principal</span>
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
                      className="w-full rounded-[12px] border border-white/[0.08] bg-[#11151D] px-3 py-1.5 text-xs font-medium text-white placeholder-[#647084] shadow-inner outline-none transition focus:border-[#56B4FC]/60 focus:bg-[#141923]"
                    />
                  </div>
                  <div className="rounded-[16px] border border-white/[0.07] bg-[#181C26]/90 p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                    <label className="mb-1 flex items-center gap-1.5 text-[11px] font-medium text-[#9AA4B8]">
                      <span className="h-2 w-2 shrink-0 rounded-full bg-[#34D399] shadow-[0_0_6px_#34D399]" />
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
                      className="w-full rounded-[12px] border border-white/[0.08] bg-[#11151D] px-3 py-1.5 text-xs font-medium text-white placeholder-[#647084] shadow-inner outline-none transition focus:border-[#56B4FC]/60 focus:bg-[#141923]"
                    />
                  </div>
                  <div className="rounded-[16px] border border-white/[0.07] bg-[#181C26]/90 p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] sm:col-span-2 lg:col-span-1">
                    <label className="mb-1 flex items-center gap-1.5 text-[11px] font-medium text-[#9AA4B8]">
                      <span className="h-2 w-2 shrink-0 rounded-full bg-[#F472B6] shadow-[0_0_6px_#F472B6]" />
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
                      className="w-full rounded-[12px] border border-white/[0.08] bg-[#11151D] px-3 py-1.5 text-xs font-medium text-white placeholder-[#647084] shadow-inner outline-none transition focus:border-[#56B4FC]/60 focus:bg-[#141923]"
                    />
                  </div>
                </div>
              </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          7. MODAL FLOTANTE CREADOR DE REELS PARA INSTAGRAM / REDES SOCIALES (9:16)
         ===================================================================== */}
      {reelModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overscroll-contain p-1.5 backdrop-blur-xl sm:p-4 lg:p-6"
          style={{
            background:
              "radial-gradient(circle at 18% 22%, rgba(56, 189, 248, 0.16) 0%, rgba(129, 140, 248, 0.12) 42%, rgba(9, 12, 18, 0.94) 100%)",
          }}
          onClick={() => !reelGenerating && setReelModalOpen(false)}
        >
          <div
            className="relative flex max-h-[96dvh] w-full max-w-5xl flex-col overflow-hidden rounded-[22px] border border-white/[0.10] bg-gradient-to-br from-[#191E29]/95 via-[#141821]/98 to-[#1A1726]/95 text-[#F1F5F9] shadow-[0_32px_90px_rgba(0,0,0,0.88),inset_0_1px_0_rgba(255,255,255,0.12)] sm:max-h-[94vh] sm:rounded-[30px]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Luz ambiental decorativa superior izquierda e inferior derecha tipo Smart Home Glass */}
            <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-[#38BDF8]/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-[#EC4899]/10 blur-3xl" />

            {/* Barra superior del Creador de Reels (Responsiva en móvil, tablet y desktop) */}
            <div className="relative z-10 shrink-0 flex flex-wrap items-center justify-between gap-2.5 border-b border-white/[0.07] bg-[#161B24]/80 px-3.5 py-3 backdrop-blur-md sm:gap-3 sm:px-6 sm:py-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate text-sm font-semibold tracking-tight text-white/95 sm:text-xl">
                    Creador de Reels para Instagram
                  </h3>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#56B4FC]/30 bg-[#56B4FC]/10 px-2.5 py-0.5 text-[10px] font-medium text-[#7DD3FC] sm:text-[11px]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#38BDF8] shadow-[0_0_8px_#38BDF8]" />
                    {reelSelectedIds.length}{" "}
                    {reelSelectedIds.length === 1
                      ? "foto seleccionada"
                      : "fotos seleccionadas"}{" "}
                    · {reelDurationSec}s
                  </span>
                </div>
                <p className="mt-0.5 hidden truncate text-xs font-medium text-[#8A94A6] sm:block">
                  Formato vertical 9:16 · Elige diseño, duración, fotografías y música personalizada
                </p>
              </div>

              {/* Selector segmentado central estilo "Devices | Automations" + Botón cerrar matte */}
              <div className="flex items-center gap-2 sm:gap-2.5">
                <div className="hidden items-center rounded-full border border-white/[0.07] bg-[#0E1117]/90 p-1 shadow-inner md:inline-flex">
                  {[10, 15, 20].map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => {
                        setActivePreviewReel(null);
                        setReelDurationSec(sec);
                        if (
                          reelAudioDurationSec > sec &&
                          reelAudioStartSec + sec > reelAudioDurationSec
                        ) {
                          const clampedStart = Math.max(
                            0,
                            Math.floor((reelAudioDurationSec - sec) * 2) / 2
                          );
                          setReelAudioStartSec(clampedStart);
                          setReelAudioPlayheadSec(clampedStart);
                        }
                      }}
                      className={`cursor-pointer rounded-full px-3.5 py-1 text-xs font-medium transition-all ${
                        reelDurationSec === sec
                          ? "border border-white/[0.10] bg-[#2B3240] text-white shadow-[0_2px_8px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.12)]"
                          : "text-[#8A94A6] hover:text-white/90"
                      }`}
                    >
                      {sec}s
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={reelGenerating}
                  onClick={() => setReelModalOpen(false)}
                  className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full border border-white/[0.09] bg-[#232936]/90 px-3 text-xs font-medium text-[#CBD5E1] shadow-[0_4px_12px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.10)] transition hover:bg-[#2E3646] hover:text-white disabled:opacity-50 sm:h-9 sm:px-3.5"
                >
                  <span>✕</span>
                  <span>Cerrar</span>
                </button>
              </div>
            </div>

            {/* Cuerpo scrollable del formulario flotante */}
            <div
              onScroll={handleSmartScroll}
              className="smart-glass-scroll relative z-10 flex-1 overflow-y-auto overscroll-contain p-3 sm:p-5"
            >
              {/* Aviso de vigencia de 30 días estilo tarjeta "Security · Armed Away" */}
              <div className="mb-3.5 rounded-[18px] border border-white/[0.08] bg-gradient-to-r from-[#212735]/90 via-[#1D222E]/90 to-[#221F30]/90 p-3 shadow-[0_10px_28px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.08)] sm:mb-4 sm:rounded-[20px] sm:p-3.5">
                <div className="flex items-start gap-2.5 sm:gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#38BDF8]/35 bg-[#38BDF8]/15 text-xs text-[#38BDF8] shadow-[0_0_14px_rgba(56,189,248,0.2)] sm:h-8 sm:w-8 sm:text-sm">
                    ⏳
                  </span>
                  <div className="min-w-0 text-[11px] leading-relaxed text-[#B0B8C8] sm:text-xs">
                    <strong className="font-semibold text-white/95">
                      Reels guardados en el álbum (Vigencia de {retention.retentionDays || 30} días):
                    </strong>{" "}
                    Cada Reel que crees se guardará aquí abajo con su miniatura para que puedas{" "}
                    <strong className="font-medium text-[#7DD3FC]">
                      reproducirlo, descargarlo o eliminarlo
                    </strong>{" "}
                    cuando gustes. Al igual que las fotografías del evento, los Reels se eliminan automáticamente después de{" "}
                    <strong className="font-semibold text-white">
                      {retention.retentionDays || 30} días
                    </strong>
                    .
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 items-start gap-3.5 sm:gap-4 lg:grid-cols-12 lg:gap-5">
                {/* Columna Izquierda (7 cols): 1. Diseño y Duración + 2. Selección de Fotos + 3. Audio + 4. Reels Creados */}
                <div className="space-y-3.5 sm:space-y-4 lg:col-span-7">
                  {/* PASO 1: Escoger el Diseño y Duración del Reel (10s, 15s, 20s) */}
                  <div className="rounded-[20px] border border-white/[0.08] bg-gradient-to-b from-[#232936]/90 to-[#1B202B]/90 p-3.5 shadow-[0_14px_34px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md sm:rounded-[22px] sm:p-4">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <label className="flex items-center gap-2 text-xs font-semibold tracking-tight text-white/95 sm:text-sm">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[#56B4FC]/40 bg-[#56B4FC]/15 text-xs font-bold text-[#7DD3FC]">
                          1
                        </span>
                        <span>Elige el Diseño y Duración</span>
                      </label>
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="text-[11px] font-medium text-[#8A94A6]">
                          Duración:
                        </span>
                        <div className="inline-flex items-center rounded-full border border-white/[0.07] bg-[#12161F] p-0.5">
                          {[10, 15, 20].map((sec) => (
                            <button
                              key={sec}
                              type="button"
                              onClick={() => {
                                setActivePreviewReel(null);
                                setReelDurationSec(sec);
                                if (
                                  reelAudioDurationSec > sec &&
                                  reelAudioStartSec + sec > reelAudioDurationSec
                                ) {
                                  const clampedStart = Math.max(
                                    0,
                                    Math.floor((reelAudioDurationSec - sec) * 2) /
                                      2
                                  );
                                  setReelAudioStartSec(clampedStart);
                                  setReelAudioPlayheadSec(clampedStart);
                                }
                              }}
                              className={`cursor-pointer rounded-full px-2.5 py-1 text-[11px] font-medium transition-all sm:px-3 ${
                                reelDurationSec === sec
                                  ? "border border-white/[0.12] bg-[#323A4B] text-white shadow-[0_2px_8px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.14)]"
                                  : "text-[#8A94A6] hover:text-white"
                              }`}
                            >
                              {sec}s
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Tarjetas de diseño (muestra 4 diseños visibles a la vez con scroll vertical) */}
                    <div
                      onScroll={handleSmartScroll}
                      className="smart-glass-scroll grid max-h-[376px] grid-cols-1 gap-2 overflow-y-auto overscroll-contain pr-1 sm:max-h-[216px] sm:grid-cols-2 sm:gap-2.5"
                    >
                      {REEL_DESIGNS.map((design) => {
                        const isSelected = reelDesignId === design.id;
                        return (
                          <button
                            key={design.id}
                            type="button"
                            onClick={() => {
                              setActivePreviewReel(null);
                              setReelDesignId(design.id);
                            }}
                            className={`flex cursor-pointer flex-col items-start rounded-[16px] border p-3 text-left transition-all sm:rounded-[18px] sm:p-3.5 ${
                              isSelected
                                ? "border-[#56B4FC]/50 bg-gradient-to-br from-[#273447]/95 via-[#202836]/95 to-[#2C4663]/90 text-white shadow-[0_10px_26px_rgba(56,189,248,0.18),inset_0_1px_0_rgba(255,255,255,0.16)]"
                                : "border-white/[0.06] bg-[#181C26]/85 text-[#9AA4B8] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:border-white/15 hover:bg-[#222836] hover:text-white"
                            }`}
                          >
                            <div className="flex w-full items-center justify-between gap-2">
                              <span className="truncate text-xs font-semibold text-white/95">
                                {design.shortName}
                              </span>
                              <span
                                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                  isSelected
                                    ? "border border-[#56B4FC]/40 bg-[#56B4FC]/20 text-[#7DD3FC]"
                                    : "border border-white/[0.07] bg-[#252B39] text-[#9AA4B8]"
                                }`}
                              >
                                {design.badge || "9:16"}
                              </span>
                            </div>
                            <span
                              className={`mt-1 text-[11px] leading-snug ${
                                isSelected ? "text-[#CBD5E1]" : "text-[#8A94A6]"
                              }`}
                            >
                              {design.subtitle}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Textos del Reel (sincronizados con los del evento y editables al vuelo) */}
                    <div className="mt-3 grid grid-cols-1 gap-2.5 sm:mt-3.5 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-[11px] font-medium text-[#9AA4B8]">
                          Título Principal en el Reel
                        </label>
                        <input
                          type="text"
                          value={overlayMainText}
                          onChange={(e) => setOverlayMainText(e.target.value)}
                          placeholder={defaultMainText}
                          maxLength={80}
                          className="w-full rounded-[14px] border border-white/[0.08] bg-[#141821] px-3 py-2 text-xs font-medium text-white placeholder-[#647084] shadow-inner outline-none transition focus:border-[#56B4FC]/60 focus:bg-[#171C27]"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-[11px] font-medium text-[#9AA4B8]">
                          Subtítulo / Fecha-Lugar
                        </label>
                        <input
                          type="text"
                          value={overlaySubText}
                          onChange={(e) => setOverlaySubText(e.target.value)}
                          placeholder={defaultSubText}
                          maxLength={80}
                          className="w-full rounded-[14px] border border-white/[0.08] bg-[#141821] px-3 py-2 text-xs font-medium text-white placeholder-[#647084] shadow-inner outline-none transition focus:border-[#56B4FC]/60 focus:bg-[#171C27]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* PASO 2: Listado de Fotos en Miniatura para Seleccionar */}
                  <div className="rounded-[20px] border border-white/[0.08] bg-gradient-to-b from-[#232936]/90 to-[#1B202B]/90 p-3.5 shadow-[0_14px_34px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md sm:rounded-[22px] sm:p-4">
                    <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
                      <label className="flex items-center gap-2 text-xs font-semibold tracking-tight text-white/95 sm:text-sm">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[#56B4FC]/40 bg-[#56B4FC]/15 text-xs font-bold text-[#7DD3FC]">
                          2
                        </span>
                        <span>
                          Selecciona las Fotos del Reel ({reelSelectedIds.length} de{" "}
                          {fotos.length})
                        </span>
                      </label>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setActivePreviewReel(null);
                            setReelSelectedIds(fotos.map((f) => f.idFoto));
                          }}
                          className="cursor-pointer rounded-full border border-white/[0.10] bg-[#2B3242] px-2.5 py-1 text-[10px] font-medium text-[#E2E8F0] shadow-[0_3px_10px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] transition hover:bg-[#353E52] hover:text-white sm:px-3 sm:text-[11px]"
                        >
                          ✓ Seleccionar Todas
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActivePreviewReel(null);
                            setReelSelectedIds([]);
                            if (reelAudioFile) {
                              handleRemoveReelAudio(true);
                            }
                          }}
                          className="cursor-pointer rounded-full border border-white/[0.08] bg-[#1B202B] px-2.5 py-1 text-[10px] font-medium text-[#9AA4B8] transition hover:border-[#F87171]/40 hover:bg-[#2A2028] hover:text-[#FCA5A5] sm:px-3 sm:text-[11px]"
                        >
                          ✕ Limpiar
                        </button>
                      </div>
                    </div>

                    <p className="mb-2.5 text-[11px] text-[#8A94A6] sm:mb-3 sm:text-xs">
                      Toca las miniaturas en el orden en que deseas que aparezcan en tu Reel de Instagram:
                    </p>

                    <div
                      onScroll={handleSmartScroll}
                      className="smart-glass-scroll grid max-h-[260px] grid-cols-3 gap-2 overflow-y-auto pr-1 sm:max-h-[290px] sm:grid-cols-4 sm:gap-2.5 md:grid-cols-5"
                    >
                      {fotos.map((foto) => {
                        const orderIdx = reelSelectedIds.indexOf(foto.idFoto);
                        const isSelected = orderIdx !== -1;
                        return (
                          <button
                            key={foto.idFoto}
                            type="button"
                            onClick={() => handleToggleReelPhoto(foto.idFoto)}
                            className={`group relative aspect-square cursor-pointer overflow-hidden rounded-[14px] border text-left transition-all sm:rounded-[16px] ${
                              isSelected
                                ? "border-[#56B4FC] shadow-[0_6px_18px_rgba(56,189,248,0.28)] ring-2 ring-[#56B4FC]/40"
                                : "border-white/[0.08] opacity-75 hover:border-white/25 hover:opacity-100"
                            }`}
                          >
                            <img
                              src={getAlbumPhotoUrl(foto.thumbUrl)}
                              alt={foto.titulo}
                              loading="lazy"
                              className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
                            />
                            <div
                              className={`absolute inset-0 transition ${
                                isSelected
                                  ? "bg-gradient-to-t from-[#0F141D]/80 via-transparent to-[#0F141D]/30"
                                  : "bg-black/25"
                              }`}
                            />
                            <span
                              className={`absolute right-1.5 top-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold shadow-md ${
                                isSelected
                                  ? "bg-[#38BDF8] text-[#0F141D]"
                                  : "border border-white/30 bg-[#181C26]/80 text-white/90"
                              }`}
                            >
                              {isSelected ? `#${orderIdx + 1}` : "+"}
                            </span>
                            <span className="absolute inset-x-1.5 bottom-1.5 truncate text-[10px] font-medium text-white/95 drop-shadow">
                              {foto.titulo}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* PASO 3: Subir Audio / Música para el Reel (Bloqueado si no hay fotos seleccionadas) */}
                  <div className="rounded-[20px] border border-white/[0.08] bg-gradient-to-b from-[#232936]/90 to-[#1B202B]/90 p-3.5 shadow-[0_14px_34px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md sm:rounded-[22px] sm:p-4">
                    <input
                      ref={reelAudioInputRef}
                      type="file"
                      accept="audio/*,.mp3,.m4a,.wav,.ogg,.aac"
                      onChange={handleReelAudioFileChange}
                      className="hidden"
                    />
                    <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2 sm:mb-3">
                      <label className="flex items-center gap-2 text-xs font-semibold tracking-tight text-white/95 sm:text-sm">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[#56B4FC]/40 bg-[#56B4FC]/15 text-xs font-bold text-[#7DD3FC]">
                          3
                        </span>
                        <span>Subir Audio para el Reel (Opcional)</span>
                      </label>
                      {reelAudioFile ? (
                        <button
                          type="button"
                          onClick={() => handleRemoveReelAudio(false)}
                          className="cursor-pointer rounded-full border border-white/[0.09] bg-[#262B38] px-3 py-1 text-[11px] font-medium text-[#FCA5A5] transition hover:border-[#F87171]/40 hover:bg-[#33242B] hover:text-white"
                        >
                          ✕ Quitar Audio
                        </button>
                      ) : (
                        <span className="rounded-full border border-white/[0.08] bg-[#181C26] px-2.5 py-0.5 text-[10px] font-medium text-[#9AA4B8]">
                          🎵 .MP3 / .M4A / .WAV
                        </span>
                      )}
                    </div>

                    {reelSelectedIds.length === 0 ? (
                      <div className="rounded-[16px] border border-white/[0.07] bg-[#171B24] px-3.5 py-3">
                        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-xs font-medium text-[#9AA4B8]">
                            ⚠️ Selecciona primero al menos 1 fotografía en el Paso 2 para poder subir audio al Reel.
                          </p>
                          <button
                            type="button"
                            onClick={handleClickSelectReelAudio}
                            className="w-full shrink-0 cursor-not-allowed rounded-full border border-white/[0.06] bg-[#1E232E] px-3.5 py-1.5 text-center text-[11px] font-medium text-[#647084] opacity-60 sm:w-auto"
                          >
                            🔒 Subir Audio
                          </button>
                        </div>
                      </div>
                    ) : !reelAudioFile ? (
                      <div className="flex flex-col gap-3 rounded-[18px] border border-white/[0.07] bg-[#181C26]/90 p-3.5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-white/95">
                            Agrega música o audio de fondo a tu Reel de {reelDurationSec}s
                          </p>
                          <p className="mt-0.5 text-[11px] text-[#8A94A6]">
                            El audio se mezclará automáticamente con tus {reelSelectedIds.length} fotos seleccionadas.
                          </p>
                        </div>
                        <button
                          type="button"
                          disabled={reelGenerating}
                          onClick={handleClickSelectReelAudio}
                          className="inline-flex w-full shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-full border border-white/[0.12] bg-[#2D3546] px-4 py-2 text-xs font-medium text-white shadow-[0_6px_16px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.14)] transition hover:bg-[#384257] disabled:opacity-50 sm:w-auto"
                        >
                          <span>🎵 Subir Audio</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3 rounded-[18px] border border-white/[0.08] bg-[#171B24]/95 p-3 sm:p-3.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex min-w-0 items-center gap-2.5">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#34D399]/35 bg-[#34D399]/15 text-xs text-[#34D399]">
                              🎵
                            </span>
                            <div className="min-w-0">
                              <p
                                className="truncate text-xs font-semibold text-white/95"
                                title={reelAudioFile.name}
                              >
                                {reelAudioFile.name}
                              </p>
                              <p className="text-[11px] font-medium text-[#34D399]">
                                {(reelAudioFile.size / 1024).toFixed(0)} KB
                                {reelAudioDurationSec > 0
                                  ? ` · Duración pista: ${Math.round(reelAudioDurationSec)}s`
                                  : ""}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            disabled={reelGenerating}
                            onClick={handleClickSelectReelAudio}
                            className="cursor-pointer rounded-full border border-white/[0.10] bg-[#282F3E] px-3 py-1 text-[11px] font-medium text-[#E2E8F0] shadow-[0_2px_8px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] transition hover:bg-[#333C4F] hover:text-white"
                          >
                            🔄 Cambiar Audio
                          </button>
                        </div>

                        <audio
                          ref={reelAudioPlayerRef}
                          src={reelAudioUrl}
                          onLoadedMetadata={(e) => {
                            const dur = Number(e.currentTarget.duration) || 0;
                            if (dur > 0 && Number.isFinite(dur)) {
                              setReelAudioDurationSec(dur);
                              if (
                                dur > reelDurationSec &&
                                reelAudioStartSec + reelDurationSec > dur
                              ) {
                                const clampedStart = Math.max(
                                  0,
                                  Math.floor((dur - reelDurationSec) * 2) / 2
                                );
                                setReelAudioStartSec(clampedStart);
                                setReelAudioPlayheadSec(clampedStart);
                              }
                            }
                          }}
                          onPlay={() => setReelAudioPreviewPlaying(true)}
                          onPause={() => {
                            setReelAudioPreviewPlaying(false);
                            setReelAudioPlayheadSec(reelAudioStartSec);
                          }}
                          onEnded={() => {
                            setReelAudioPreviewPlaying(false);
                            setReelAudioPlayheadSec(reelAudioStartSec);
                          }}
                          onTimeUpdate={(e) => {
                            const cur = Number(e.currentTarget.currentTime) || 0;
                            const endLimit =
                              reelAudioStartSec + (Number(reelDurationSec) || 15);
                            if (reelAudioPreviewPlaying) {
                              if (
                                cur >= endLimit &&
                                cur < (Number(e.currentTarget.duration) || 9999) - 0.05
                              ) {
                                e.currentTarget.pause();
                                e.currentTarget.currentTime = reelAudioStartSec;
                                setReelAudioPreviewPlaying(false);
                                setReelAudioPlayheadSec(reelAudioStartSec);
                              } else {
                                setReelAudioPlayheadSec(cur);
                              }
                            }
                          }}
                          className="hidden"
                        />

                        {/* Selector interactivo del punto de inicio y ventana de duración del audio (10s, 15s o 20s) */}
                        <div className="space-y-3 rounded-[16px] border border-white/[0.07] bg-[#1E232F]/90 p-3 shadow-inner sm:p-3.5">
                          <div className="flex flex-wrap items-center justify-between gap-1.5">
                            <span className="text-xs font-medium text-white/95">
                              ✂️ Elige desde qué punto empezará a sonar la canción:
                            </span>
                            <span className="rounded-full border border-[#56B4FC]/30 bg-[#56B4FC]/15 px-2.5 py-0.5 text-[10px] font-medium text-[#7DD3FC]">
                              ⏱️ Se tomarán {reelDurationSec}s de audio
                            </span>
                          </div>

                          {/* Resumen de Inicio, Fin y Duración Tomada (responsivo en móviles pequeños, tablets y desktop) */}
                          <div className="grid grid-cols-1 gap-2 text-center min-[420px]:grid-cols-3">
                            <div className="rounded-[14px] border border-[#56B4FC]/35 bg-gradient-to-br from-[#253244] to-[#1C2330] px-2.5 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                              <span className="block text-[10px] font-medium text-[#9AA4B8]">
                                📍 Inicia en
                              </span>
                              <span className="mt-0.5 block text-xs font-semibold text-white">
                                {formatAudioMinSec(reelAudioStartSec)}{" "}
                                <span className="text-[10px] font-normal text-[#7DD3FC]">
                                  ({reelAudioStartSec}s)
                                </span>
                              </span>
                            </div>
                            <div className="rounded-[14px] border border-white/[0.07] bg-[#181C26] px-2.5 py-2">
                              <span className="block text-[10px] font-medium text-[#8A94A6]">
                                🏁 Termina en
                              </span>
                              <span className="mt-0.5 block text-xs font-semibold text-white/95">
                                {formatAudioMinSec(
                                  reelAudioDurationSec > 0
                                    ? Math.min(
                                        reelAudioDurationSec,
                                        reelAudioStartSec + reelDurationSec
                                      )
                                    : reelAudioStartSec + reelDurationSec
                                )}{" "}
                                <span className="text-[10px] font-normal text-[#8A94A6]">
                                  (
                                  {reelAudioDurationSec > 0
                                    ? Math.round(
                                        Math.min(
                                          reelAudioDurationSec,
                                          reelAudioStartSec + reelDurationSec
                                        ) * 10
                                      ) / 10
                                    : reelAudioStartSec + reelDurationSec}
                                  s)
                                </span>
                              </span>
                            </div>
                            <div className="rounded-[14px] border border-white/[0.07] bg-[#181C26] px-2.5 py-2">
                              <span className="block text-[10px] font-medium text-[#8A94A6]">
                                🎵 Fragmento Reel
                              </span>
                              <span className="mt-0.5 block text-xs font-semibold text-[#7DD3FC]">
                                {reelDurationSec} segundos
                              </span>
                            </div>
                          </div>

                          {/* Barra visual del tramo con el gradiente cyan-indigo-coral de "Lighting Master" */}
                          {reelAudioDurationSec > 0 && (
                            <div className="space-y-1.5">
                              <div className="relative h-2.5 w-full overflow-hidden rounded-full border border-white/[0.08] bg-[#11151D]">
                                <div
                                  className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-[#38BDF8] via-[#818CF8] to-[#F472B6] shadow-[0_0_12px_rgba(56,189,248,0.55)] transition-all duration-100"
                                  style={{
                                    left: `${Math.min(
                                      100,
                                      (reelAudioStartSec / reelAudioDurationSec) *
                                        100
                                    )}%`,
                                    width: `${Math.min(
                                      100 -
                                        Math.min(
                                          100,
                                          (reelAudioStartSec /
                                            reelAudioDurationSec) *
                                            100
                                        ),
                                      (reelDurationSec / reelAudioDurationSec) *
                                        100
                                    )}%`,
                                  }}
                                />
                              </div>
                              <div className="flex flex-wrap items-center justify-between gap-1 text-[10px] font-medium text-[#8A94A6]">
                                <span
                                  className={`tabular-nums transition-colors ${
                                    reelAudioPreviewPlaying
                                      ? "font-semibold text-[#38BDF8]"
                                      : "text-[#CBD5E1]"
                                  }`}
                                >
                                  {formatAudioMinSec(
                                    reelAudioPreviewPlaying
                                      ? reelAudioPlayheadSec
                                      : reelAudioStartSec
                                  )}
                                </span>
                                <span className="text-center">
                                  Ventana:{" "}
                                  <strong className="font-medium text-white/90">
                                    {formatAudioMinSec(reelAudioStartSec)} —{" "}
                                    {formatAudioMinSec(
                                      Math.min(
                                        reelAudioDurationSec,
                                        reelAudioStartSec + reelDurationSec
                                      )
                                    )}
                                  </strong>
                                </span>
                                <span className="tabular-nums">
                                  {formatAudioMinSec(reelAudioDurationSec)}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Control deslizable estilo barra blanca/azul cielo de "Lighting Master" */}
                          <div>
                            <input
                              type="range"
                              min={0}
                              max={
                                reelAudioDurationSec > 0
                                  ? reelAudioDurationSec
                                  : maxReelAudioStartSec || 0
                              }
                              step={0.1}
                              disabled={maxReelAudioStartSec <= 0}
                              value={
                                reelAudioPreviewPlaying
                                  ? reelAudioPlayheadSec
                                  : reelAudioStartSec
                              }
                              onChange={(e) =>
                                handleSelectReelAudioStart(e.target.value, true)
                              }
                              className="w-full cursor-pointer accent-[#38BDF8] disabled:cursor-not-allowed disabled:opacity-50"
                            />
                          </div>

                          {/* Botones rápidos estilo "Climate Control" + botón pill de prueba */}
                          <div className="flex flex-col gap-2 pt-0.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:justify-start">
                              {[-5, -1, 1, 5].map((delta) => (
                                <button
                                  key={delta}
                                  type="button"
                                  disabled={maxReelAudioStartSec <= 0}
                                  onClick={() =>
                                    handleSelectReelAudioStart(
                                      reelAudioStartSec + delta,
                                      true
                                    )
                                  }
                                  className="cursor-pointer rounded-full border border-white/[0.09] bg-[#282F3D] px-3 py-1 text-[11px] font-medium text-[#D8E0EE] shadow-[0_2px_8px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.1)] transition hover:bg-[#343D4F] hover:text-white disabled:opacity-40"
                                >
                                  {delta > 0 ? `+${delta}s` : `${delta}s`}
                                </button>
                              ))}
                            </div>

                            <button
                              type="button"
                              onClick={handleTogglePreviewAudioSegment}
                              className={`w-full cursor-pointer rounded-full px-3.5 py-2 text-center text-[11px] font-medium transition-all sm:w-auto sm:py-1.5 ${
                                reelAudioPreviewPlaying
                                  ? "border border-[#F472B6]/50 bg-gradient-to-r from-[#E11D48] to-[#EC4899] text-white shadow-[0_4px_14px_rgba(236,72,153,0.4)]"
                                  : "border border-[#56B4FC]/40 bg-gradient-to-r from-[#2563EB] to-[#38BDF8] text-white shadow-[0_4px_14px_rgba(56,189,248,0.32),inset_0_1px_0_rgba(255,255,255,0.2)] hover:brightness-110"
                              }`}
                            >
                              {reelAudioPreviewPlaying
                                ? "⏹️ Detener prueba"
                                : `▶️ Escuchar tramo (${reelDurationSec}s)`}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Miniaturas de los Reels Creados estilo "Devices" (Smart Lock / Smart Plug / Blinds) */}
                  <div className="rounded-[20px] border border-white/[0.08] bg-gradient-to-b from-[#232936]/90 to-[#1B202B]/90 p-3.5 shadow-[0_14px_34px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md sm:rounded-[22px] sm:p-4">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <label className="flex items-center gap-2 text-xs font-semibold tracking-tight text-white/95 sm:text-sm">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[#56B4FC]/40 bg-[#56B4FC]/15 text-xs">
                          🎞️
                        </span>
                        <span>Reels Creados ({reels.length})</span>
                      </label>
                      <span className="rounded-full border border-white/[0.08] bg-[#181C26] px-2.5 py-0.5 text-[10px] font-medium text-[#9AA4B8]">
                        ⏳ Se borran a los {retention.retentionDays || 30} días
                      </span>
                    </div>

                    {reels.length === 0 ? (
                      <div className="rounded-[18px] border border-dashed border-white/[0.10] bg-[#171B24]/80 px-4 py-6 text-center">
                        <p className="text-xs font-semibold text-white/90">
                          Aún no has creado ningún Reel en este evento
                        </p>
                        <p className="mt-1 text-[11px] text-[#8A94A6]">
                          Selecciona tus fotos arriba, elige la duración (10s, 15s o 20s) y presiona{" "}
                          <strong className="font-semibold text-[#7DD3FC]">
                            "🎬 Crear y Guardar Reel"
                          </strong>{" "}
                          para que aparezcan aquí sus miniaturas listas para reproducir, descargar o eliminar.
                        </p>
                      </div>
                    ) : (
                      <div
                        onScroll={handleSmartScroll}
                        className="smart-glass-scroll grid max-h-[340px] grid-cols-1 gap-3 overflow-y-auto overscroll-contain pr-1 min-[420px]:grid-cols-2 sm:max-h-[355px] sm:grid-cols-3"
                      >
                        {reels.map((reel, idx) => {
                          const isPlayingInPreview =
                            activePreviewReel?.idReel === reel.idReel;
                          const thumbSrc =
                            reel.localThumbUrl ||
                            (reel.thumbUrl
                              ? getAlbumPhotoUrl(reel.thumbUrl)
                              : "");
                          const videoSrc =
                            reel.localVideoUrl ||
                            (reel.videoUrl
                              ? getAlbumPhotoUrl(reel.videoUrl)
                              : "");

                          return (
                            <div
                              key={reel.idReel}
                              className={`group flex flex-col overflow-hidden rounded-[18px] border bg-[#181C26]/95 shadow-[0_8px_22px_rgba(0,0,0,0.4)] transition-all ${
                                isPlayingInPreview
                                  ? "border-[#56B4FC] ring-2 ring-[#56B4FC]/40"
                                  : "border-white/[0.08] hover:border-white/20"
                              }`}
                            >
                              <div
                                onClick={() => handleSelectPreviewReel(reel)}
                                className="relative aspect-9/16 w-full cursor-pointer overflow-hidden bg-[#0E1117]"
                                title="Haz clic para reproducir este Reel en la Vista Previa"
                              >
                                {thumbSrc ? (
                                  <img
                                    src={thumbSrc}
                                    alt={reel.titulo}
                                    loading="lazy"
                                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                  />
                                ) : videoSrc ? (
                                  <video
                                    src={videoSrc}
                                    muted
                                    playsInline
                                    preload="metadata"
                                    className="h-full w-full object-cover"
                                  />
                                ) : null}

                                {/* Botón central de Play sobre la miniatura */}
                                <div className="absolute inset-0 flex items-center justify-center bg-[#0B0E14]/30 opacity-90 transition group-hover:bg-[#0B0E14]/45">
                                  <span
                                    className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm shadow-lg backdrop-blur-md transition group-hover:scale-110 ${
                                      isPlayingInPreview
                                        ? "border-[#7DD3FC] bg-[#38BDF8] text-[#0F141D]"
                                        : "border-white/20 bg-[#232936]/90 text-white"
                                    }`}
                                  >
                                    ▶️
                                  </span>
                                </div>

                                <div className="absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-[#0E1117]/85 to-transparent p-2">
                                  <span className="rounded-full border border-white/15 bg-[#232936]/90 px-2 py-0.5 text-[9px] font-semibold text-white backdrop-blur-sm">
                                    ⏱️ {reel.durationSec || 15}s
                                  </span>
                                  <span className="rounded-full border border-[#56B4FC]/30 bg-[#141821]/90 px-2 py-0.5 text-[9px] font-medium text-[#7DD3FC]">
                                    {reel.photosCount || 0} fotos
                                  </span>
                                </div>
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0E1117]/95 via-[#0E1117]/65 to-transparent p-2.5">
                                  <p
                                    className="truncate text-[10px] font-semibold text-white"
                                    title={reel.titulo}
                                  >
                                    {reel.titulo}
                                  </p>
                                  <p className="text-[9px] font-medium text-[#34D399]">
                                    {reel.sizeKb
                                      ? reel.sizeKb >= 1024
                                        ? `${(reel.sizeKb / 1024).toFixed(1)} MB · Activo`
                                        : `${reel.sizeKb} KB · Activo`
                                      : "9:16 · Activo"}
                                  </p>
                                </div>
                              </div>

                              <div className="space-y-1.5 p-2.5">
                                <button
                                  type="button"
                                  onClick={() => handleSelectPreviewReel(reel)}
                                  className={`w-full cursor-pointer rounded-full px-2.5 py-1.5 text-[10px] font-medium transition-all ${
                                    isPlayingInPreview
                                      ? "border border-[#56B4FC]/50 bg-gradient-to-r from-[#2563EB] to-[#38BDF8] text-white shadow-[0_4px_12px_rgba(56,189,248,0.3)]"
                                      : "border border-white/[0.09] bg-[#282F3E] text-[#E2E8F0] hover:bg-[#333C4F] hover:text-white"
                                  }`}
                                >
                                  {isPlayingInPreview
                                    ? "🔊 Reproduciendo"
                                    : "▶️ Reproducir en Vista Previa"}
                                </button>
                                <div className="grid grid-cols-2 gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleDownloadSavedReel(reel, idx)}
                                    className="cursor-pointer truncate rounded-full border border-white/[0.08] bg-[#222836] px-2 py-1.5 text-[10px] font-medium text-[#7DD3FC] transition hover:border-[#56B4FC]/40 hover:bg-[#2A3346] hover:text-white"
                                    title="Descargar este Reel"
                                  >
                                    ⬇️ Descargar
                                  </button>
                                  <button
                                    type="button"
                                    disabled={deletingReelId === reel.idReel}
                                    onClick={() => handleDeleteSavedReel(reel)}
                                    className="cursor-pointer truncate rounded-full border border-white/[0.08] bg-[#222836] px-2 py-1.5 text-[10px] font-medium text-[#FCA5A5] transition hover:border-[#F87171]/40 hover:bg-[#35232B] hover:text-white disabled:opacity-45"
                                    title="Eliminar este Reel"
                                  >
                                    {deletingReelId === reel.idReel
                                      ? "..."
                                      : "🗑️ Eliminar"}
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Columna Derecha (5 cols): Vista Previa 9:16 estilo "Lighting Master / Climate Control" */}
                <div
                  ref={reelPreviewSectionRef}
                  className="lg:sticky lg:top-0 lg:col-span-5"
                >
                  <div className="flex flex-col items-center rounded-[22px] border border-white/[0.09] bg-gradient-to-b from-[#232936]/95 to-[#181C26]/95 p-3.5 shadow-[0_18px_42px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-md sm:rounded-[24px] sm:p-5">
                    <div className="mb-3 flex w-full items-center justify-between gap-2">
                      <span className="truncate text-xs font-semibold tracking-tight text-white/95">
                        {activePreviewReel
                          ? "🎬 Reproductor de Reel · 9:16"
                          : "📱 Vista Previa en Vivo · 9:16"}
                      </span>
                      <span className="shrink-0 rounded-full border border-white/[0.09] bg-[#2B3242] px-2.5 py-0.5 text-[10px] font-medium text-[#7DD3FC]">
                        Instagram Reel ·{" "}
                        {activePreviewReel
                          ? `${activePreviewReel.durationSec || 15}s`
                          : `${reelDurationSec}s`}
                      </span>
                    </div>

                    {/* Marco de teléfono vertical 9:16 adaptable en móvil, tablet y desktop */}
                    <div className="relative mx-auto w-full max-w-[205px] rounded-[26px] bg-gradient-to-tr from-[#38BDF8]/35 via-[#818CF8]/30 to-[#F472B6]/35 p-[2px] shadow-[0_18px_45px_rgba(0,0,0,0.65)] sm:max-w-[230px] sm:rounded-[28px] lg:max-w-[242px]">
                      <div className="overflow-hidden rounded-[24px] bg-[#0B0E14] sm:rounded-[26px]">
                        {activePreviewReel ? (
                          <video
                            key={activePreviewReel.idReel}
                            src={
                              activePreviewReel.localVideoUrl ||
                              getAlbumPhotoUrl(activePreviewReel.videoUrl)
                            }
                            controls
                            autoPlay
                            playsInline
                            className="aspect-9/16 w-full bg-black object-cover"
                          />
                        ) : (
                          <canvas
                            ref={reelPreviewCanvasRef}
                            className="aspect-9/16 w-full object-cover"
                          />
                        )}
                      </div>
                    </div>

                    {/* Controles de reproducción de la Vista Previa 9:16 */}
                    <div className="mt-3.5 flex w-full flex-col gap-2">
                      {activePreviewReel ? (
                        <div className="flex flex-wrap items-center justify-between gap-2 rounded-[16px] border border-white/[0.08] bg-[#141821] px-3 py-2">
                          <span className="truncate text-[11px] font-medium text-[#34D399]">
                            ▶️ {activePreviewReel.titulo}
                          </span>
                          <button
                            type="button"
                            onClick={() => setActivePreviewReel(null)}
                            className="w-full cursor-pointer rounded-full border border-white/[0.10] bg-[#282F3E] px-3 py-1 text-center text-[10px] font-medium text-white shadow-[0_2px_8px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] transition hover:bg-[#343D4F] sm:w-auto"
                          >
                            🎨 Volver al editor en vivo
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={reelSelectedIds.length === 0 || reelGenerating}
                          onClick={handleToggleLiveReelPreview}
                          className={`inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium transition-all disabled:cursor-not-allowed disabled:opacity-45 ${
                            liveReelPlaying || reelAudioPreviewPlaying
                              ? "border border-[#F472B6]/50 bg-gradient-to-r from-[#E11D48] to-[#EC4899] text-white shadow-[0_4px_14px_rgba(236,72,153,0.4)]"
                              : "border border-white/[0.10] bg-[#282F3E] text-[#E2E8F0] shadow-[0_4px_12px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.12)] hover:bg-[#333C4F] hover:text-white"
                          }`}
                        >
                          {liveReelPlaying || reelAudioPreviewPlaying
                            ? "⏹️ Detener reproducción en Vista Previa"
                            : `▶️ Reproducir Reel en Vista Previa (${reelDurationSec}s)`}
                        </button>
                      )}
                    </div>

                    {/* Barra de progreso mientras se codifica y guarda el video */}
                    {reelGenerating && (
                      <div className="mt-3.5 w-full space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-medium text-[#7DD3FC]">
                          <span>⏳ Renderizando y guardando Reel ({reelDurationSec}s)...</span>
                          <span>{reelProgress}%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-[#11151D]">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#38BDF8] via-[#818CF8] to-[#F472B6] transition-all duration-150"
                            style={{ width: `${reelProgress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <button
                      type="button"
                      disabled={reelGenerating || reelSelectedIds.length === 0}
                      onClick={handleGenerateAndSaveReel}
                      className="mt-3 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-[#56B4FC]/45 bg-gradient-to-r from-[#2563EB] via-[#38BDF8] to-[#818CF8] px-5 py-3 text-xs font-semibold text-white shadow-[0_10px_28px_rgba(56,189,248,0.32),inset_0_1px_0_rgba(255,255,255,0.25)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      <span>
                        {reelGenerating
                          ? `⏳ Creando y Guardando (${reelProgress}%)...`
                          : `🎬 Crear y Guardar Reel (${reelDurationSec}s · ${reelSelectedIds.length} fotos)`}
                      </span>
                    </button>

                    <p className="mt-2.5 text-center text-[11px] leading-snug text-[#8A94A6]">
                      Se guardará en la sección de Reels Creados con vigencia de {retention.retentionDays || 30} días.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
