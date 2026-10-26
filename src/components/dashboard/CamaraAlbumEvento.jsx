import { useEffect, useMemo, useRef, useState } from "react";
import {
  getAlbumFotosEventoRequest,
  addFotoAlbumEventoRequest,
  deleteFotoAlbumEventoRequest,
  descargarAlbumZipEventoRequest,
  getAlbumPhotoUrl,
} from "../../api/eventos.js";
import {
  QUALITY_PRESETS,
  captureVideoFrameDual,
  optimizeImageFileDual,
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
        return;
      }
    } catch {
      // Ignorar errores de localStorage
    }
    setOverlayDesignId("gala-gold");
    setOverlayMainText(defaultMainText);
    setOverlaySubText(defaultSubText);
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
        })
      );
    } catch {
      // Ignorar
    }
  }, [evento?.idevento, overlayDesignId, overlayMainText, overlaySubText]);

  const activeOverlayConfig = useMemo(
    () => ({
      designId: overlayDesignId,
      mainText: overlayMainText,
      subText: overlaySubText,
      badgeText: evento?.tipo_evento || "RECUERDO OFICIAL",
    }),
    [overlayDesignId, overlayMainText, overlaySubText, evento?.tipo_evento]
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

  // Visor HD en pantalla completa (Lightbox)
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);
  const nativeCameraInputRef = useRef(null);
  const samplePreviewCanvasRef = useRef(null);
  const liveOverlayCanvasRef = useRef(null);

  const notify = (msg) => {
    if (typeof onShowNotice === "function") {
      onShowNotice(msg);
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
        drawPhotoOverlayOnCanvas(lctx, lw, lh, activeOverlayConfig);
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
      <div className="rounded-2xl border border-[#E6E9F4] bg-white p-6 text-center shadow-xs sm:p-10">
        <span className="text-4xl">📸</span>
        <h3 className="mt-3 text-lg font-extrabold text-[#2D3047]">
          Guarda primero tu evento para activar su Álbum de Fotografías HD
        </h3>
        <p className="mx-auto mt-1 max-w-md text-xs text-[#5B617A]">
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
  const activeLightboxPhoto =
    lightboxIndex !== null && fotos[lightboxIndex] ? fotos[lightboxIndex] : null;

  return (
    <div className="space-y-5">
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
      <div className="rounded-2xl border border-[#E6E9F4] bg-white p-4 shadow-xs sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/12 px-3 py-1 text-[11px] font-extrabold text-emerald-700">
                <span>∞ Fotos Ilimitadas</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#6C7EE1]/12 px-3 py-1 text-[11px] font-extrabold text-[#6C7EE1]">
                <span>✨ {activePreset.label.split("(")[0].trim()}</span>
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#F7F8FC] px-3 py-1 text-[11px] font-bold text-[#5B617A]">
                📷 {fotos.length} {fotos.length === 1 ? "foto" : "fotos"} ({totalMb} MB)
              </span>
            </div>

            <h2 className="mt-2 font-display text-xl font-extrabold uppercase tracking-wide text-[#2D3047] sm:text-2xl">
              📸 Cámara y Álbum de Recuerdos — {evento.nombre}
            </h2>
            <p className="mt-1 text-xs text-[#5B617A]">
              Este álbum es exclusivo de este evento. Toma fotografías en vivo con tu
              cámara o súbelas desde tu galería con tu diseño de overlay personalizado.
            </p>
          </div>

          {/* Botonera Responsiva */}
          <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap lg:shrink-0">
            <button
              type="button"
              onClick={handleToggleCameraOpen}
              className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold shadow-sm transition ${
                cameraOpen
                  ? "bg-rose-600 text-white hover:bg-rose-700"
                  : "bg-emerald-600 text-white hover:bg-emerald-700"
              }`}
            >
              <span>{cameraOpen ? "✕ Cerrar Cámara" : "📷 Abrir Cámara en Vivo"}</span>
            </button>

            <button
              type="button"
              onClick={() => nativeCameraInputRef.current?.click()}
              disabled={uploadingFiles}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-xs font-extrabold text-emerald-800 transition hover:bg-emerald-100 disabled:opacity-50 sm:hidden"
            >
              <span>📱 Cámara del Celular</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingFiles}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#6C7EE1] px-4 py-2.5 text-xs font-extrabold text-white shadow-sm transition hover:bg-[#5A6CD0] disabled:opacity-50"
            >
              <span>
                {uploadingFiles ? "⏳ Procesando HD..." : "⬆️ Subir Foto(s)"}
              </span>
            </button>

            <button
              type="button"
              onClick={handleDownloadZip}
              disabled={downloadingZip || fotos.length === 0}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#DCE0F0] bg-[#2D3047] px-4 py-2.5 text-xs font-extrabold text-white shadow-sm transition hover:bg-[#1E2135] disabled:cursor-not-allowed disabled:opacity-45"
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
        <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50/90 p-3.5 sm:p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-2.5">
              <span className="text-lg leading-none">⏳</span>
              <div>
                <p className="text-xs font-extrabold text-amber-950">
                  Importante: Tienes un periodo de {retention.retentionDays} días para descargar tus fotografías a tu dispositivo
                </p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-amber-900">
                  Puedes tomar y subir fotografías{" "}
                  <strong>de forma ilimitada</strong> en este evento. Pasando los{" "}
                  <strong>{retention.retentionDays} días</strong> (fecha programada
                  de autolimpieza:{" "}
                  <strong>{formatShortDate(retention.expiresAt)}</strong>), el álbum
                  de este evento se eliminará automáticamente del servidor para
                  liberar espacio.
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 self-start rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-extrabold text-amber-900 shadow-2xs sm:self-center">
              <span>🗓️ Restan:</span>
              <span className="text-sm text-amber-700">
                {retention.daysRemaining} días
              </span>
            </div>
          </div>
        </div>

        {/* Mensaje de error de cámara si el navegador bloqueó el permiso */}
        {cameraError && (
          <div className="mt-4 flex flex-col gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800 sm:flex-row sm:items-center sm:justify-between">
            <span>⚠️ {cameraError}</span>
            <button
              type="button"
              onClick={() => nativeCameraInputRef.current?.click()}
              className="shrink-0 cursor-pointer rounded-lg bg-rose-600 px-3 py-1.5 text-[11px] font-extrabold text-white hover:bg-rose-700"
            >
              📱 Abrir Cámara Nativa / Elegir Foto
            </button>
          </div>
        )}

        {/* =====================================================================
            3. PERSONALIZADOR DE OVERLAY AUTOMÁTICO (5 DISEÑOS + TEXTO EDITABLE)
           ===================================================================== */}
        <div className="mt-5 rounded-2xl border border-[#DCE0F0] bg-[#F7F8FC] p-4 sm:p-5">
          <div className="mb-3.5 flex flex-col justify-between gap-2 border-b border-[#E6E9F4] pb-3 sm:flex-row sm:items-center">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#6C7EE1]">
                MARCO CONMEMORATIVO EN TUS FOTOS
              </span>
              <h3 className="text-sm font-extrabold uppercase tracking-wide text-[#2D3047] sm:text-base">
                🎨 Overlay Automático (5 Diseños Exclusivos + Texto Editable)
              </h3>
              <p className="text-[11px] text-[#5B617A]">
                Elige uno de los 5 diseños y personaliza el texto. Se aplicará
                automáticamente al capturar con la cámara o al subir fotos.
              </p>
            </div>
            <span className="self-start rounded-full bg-[#6C7EE1]/15 px-3 py-1 text-[11px] font-extrabold text-[#6C7EE1] sm:self-center">
              Activo: {activeDesignObj.shortName}
            </span>
          </div>

          <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-12">
            {/* Columna Izquierda (7 cols): Selector de los 5 diseños + Inputs de texto */}
            <div className="space-y-4 xl:col-span-7">
              <div>
                <label className="mb-2 block text-xs font-extrabold text-[#2D3047]">
                  1. Elige el Diseño del Overlay:
                </label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {OVERLAY_DESIGNS.map((design) => {
                    const isSelected = overlayDesignId === design.id;
                    return (
                      <button
                        key={design.id}
                        type="button"
                        onClick={() => setOverlayDesignId(design.id)}
                        className={`flex cursor-pointer flex-col items-start rounded-xl border p-2.5 text-left transition ${
                          isSelected
                            ? "border-[#6C7EE1] bg-white shadow-sm ring-2 ring-[#6C7EE1]/25"
                            : "border-[#DCE0F0] bg-white/70 hover:border-[#6C7EE1]/50 hover:bg-white"
                        }`}
                      >
                        <div className="flex w-full items-center justify-between gap-1">
                          <span className="truncate text-xs font-extrabold text-[#2D3047]">
                            {design.shortName}
                          </span>
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: design.accentHex }}
                          />
                        </div>
                        <span className="mt-1 line-clamp-2 text-[10px] leading-tight text-[#5B617A]">
                          {design.subtitle}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Campos de texto del Overlay (solo activos cuando hay un diseño 1..5 elegido) */}
              {overlayDesignId !== "none" && (
                <div className="grid grid-cols-1 gap-3 rounded-xl border border-[#E6E9F4] bg-white p-3.5 sm:grid-cols-2">
                  <div>
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <label className="text-xs font-bold text-[#2D3047]">
                        2. Texto Principal del Overlay
                      </label>
                      {overlayMainText !== defaultMainText && (
                        <button
                          type="button"
                          onClick={() => setOverlayMainText(defaultMainText)}
                          className="cursor-pointer text-[10px] font-extrabold text-[#6C7EE1] hover:underline"
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
                      className="w-full rounded-xl border border-[#DCE0F0] bg-[#F7F8FC] px-3 py-2 text-xs font-semibold text-[#2D3047] outline-none focus:border-[#6C7EE1] focus:bg-white"
                    />
                    <p className="mt-1 text-[10px] text-[#8E94A9]">
                      Tomado del nombre de tu evento; puedes editarlo libremente.
                    </p>
                  </div>

                  <div>
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <label className="text-xs font-bold text-[#2D3047]">
                        3. Subtítulo / Fecha (Opcional)
                      </label>
                      {overlaySubText !== defaultSubText && (
                        <button
                          type="button"
                          onClick={() => setOverlaySubText(defaultSubText)}
                          className="cursor-pointer text-[10px] font-extrabold text-[#6C7EE1] hover:underline"
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
                      className="w-full rounded-xl border border-[#DCE0F0] bg-[#F7F8FC] px-3 py-2 text-xs font-semibold text-[#2D3047] outline-none focus:border-[#6C7EE1] focus:bg-white"
                    />
                    <p className="mt-1 text-[10px] text-[#8E94A9]">
                      Aparece debajo del título principal (déjalo vacío si no lo deseas).
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Columna Derecha (5 cols): Lienzo de Vista Previa en Vivo del Overlay */}
            <div className="xl:col-span-5">
              <div className="overflow-hidden rounded-2xl border border-[#DCE0F0] bg-[#0F172A] p-2.5 shadow-sm">
                <div className="mb-1.5 flex items-center justify-between px-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-300">
                    👁️ Vista Previa en Tiempo Real
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-400">
                    {activeDesignObj.name}
                  </span>
                </div>
                <canvas
                  ref={samplePreviewCanvasRef}
                  className="aspect-16/11 w-full rounded-xl object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================================
            4. VISOR DE CÁMARA EN VIVO INTEGRADA CON OVERLAY SUPERPUESTO
           ===================================================================== */}
        {cameraOpen && (
          <div className="mt-5 overflow-hidden rounded-2xl border-2 border-emerald-500/60 bg-[#0F172A] p-4 text-white shadow-lg sm:p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400" />
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-300">
                  Visor de Cámara en Vivo · {activeDesignObj.shortName}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSwitchCameraFacing}
                  className="cursor-pointer rounded-lg bg-white/15 px-3 py-1.5 text-[11px] font-bold text-white transition hover:bg-white/25"
                >
                  🔄 Girar Cámara ({facingMode === "environment" ? "Trasera" : "Frontal"})
                </button>
                <button
                  type="button"
                  onClick={handleToggleCameraOpen}
                  className="cursor-pointer rounded-lg bg-rose-500/25 px-3 py-1.5 text-[11px] font-bold text-rose-200 transition hover:bg-rose-500/40"
                >
                  ✕ Cerrar
                </button>
              </div>
            </div>

            <div className="relative mx-auto max-w-2xl overflow-hidden rounded-xl border border-white/15 bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="max-h-[440px] w-full object-contain"
              />
              {/* Superposición en vivo del Overlay directamente sobre el video */}
              {overlayDesignId !== "none" && (
                <canvas
                  ref={liveOverlayCanvasRef}
                  className="pointer-events-none absolute inset-0 h-full w-full object-contain"
                />
              )}
            </div>

            <div className="mx-auto mt-4 flex max-w-2xl flex-col gap-2.5 sm:flex-row sm:items-center">
              <input
                type="text"
                value={captionText}
                onChange={(e) => setCaptionText(e.target.value)}
                placeholder="✏️ Etiqueta en galería (opcional, ej. Brindis de honor, Mesa 3...)"
                maxLength={140}
                className="w-full flex-1 rounded-xl border border-white/20 bg-white/10 px-3.5 py-2.5 text-xs text-white placeholder-slate-400 outline-none focus:border-emerald-400"
              />
              <button
                type="button"
                onClick={handleCaptureFromLiveVideo}
                disabled={capturing}
                className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-2.5 text-xs font-extrabold text-slate-950 shadow-md transition hover:bg-emerald-400 disabled:opacity-50"
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
      <div className="rounded-2xl border border-[#E6E9F4] bg-white p-4 shadow-xs sm:p-6">
        <div className="mb-4 flex flex-col gap-2 border-b border-[#E6E9F4] pb-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#2D3047]">
              🖼️ Galería Fotográfica del Evento ({fotos.length})
            </h3>
            <p className="text-[11px] text-[#5B617A]">
              La cuadrícula muestra miniaturas ligeras para carga instantánea. Toca
              cualquier foto para abrirla o descargarla en Alta Definición.
            </p>
          </div>
          {fotos.length > 0 && (
            <button
              type="button"
              onClick={handleDownloadZip}
              disabled={downloadingZip}
              className="self-start rounded-xl bg-[#F0F2F8] px-3.5 py-2 text-xs font-extrabold text-[#2D3047] transition hover:bg-[#E2E6F3] sm:self-center"
            >
              {downloadingZip
                ? "⏳ Generando archivo .ZIP..."
                : `⬇️ Descargar las ${fotos.length} fotos en .ZIP`}
            </button>
          )}
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs font-semibold text-[#5B617A]">
            ⏳ Cargando álbum fotográfico del evento...
          </div>
        ) : fotos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#CBD2EC] bg-[#F7F8FC] px-4 py-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#6C7EE1]/12 text-2xl">
              📷
            </div>
            <h4 className="mt-3 text-sm font-extrabold text-[#2D3047]">
              Aún no hay fotografías en el álbum de "{evento.nombre}"
            </h4>
            <p className="mx-auto mt-1 max-w-md text-xs text-[#5B617A]">
              Elige tu diseño de overlay arriba y presiona{" "}
              <strong>"📷 Abrir Cámara en Vivo"</strong> o{" "}
              <strong>"⬆️ Subir Foto(s)"</strong> para capturar tus primeros
              recuerdos en Alta Definición.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {fotos.map((foto, idx) => (
              <div
                key={foto.idFoto}
                className="group flex flex-col overflow-hidden rounded-2xl border border-[#E6E9F4] bg-[#F7F8FC] shadow-2xs transition hover:border-[#6C7EE1]/50 hover:shadow-md"
              >
                <div
                  onClick={() => setLightboxIndex(idx)}
                  className="relative aspect-4/3 w-full cursor-pointer overflow-hidden bg-[#1E2135]"
                >
                  <img
                    src={getAlbumPhotoUrl(foto.thumbUrl)}
                    alt={foto.titulo}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/75 via-black/30 to-transparent px-3 py-2 text-[10px] font-bold text-white">
                    <span>
                      {foto.width && foto.height
                        ? `${foto.width}×${foto.height}px`
                        : "HD"}
                    </span>
                    <span>{foto.sizeKb ? `${foto.sizeKb} KB` : ""}</span>
                  </div>
                </div>

                <div className="flex flex-1 flex-col justify-between p-3">
                  <div>
                    <p
                      className="truncate text-xs font-extrabold text-[#2D3047]"
                      title={foto.titulo}
                    >
                      {foto.titulo}
                    </p>
                    <p className="mt-0.5 text-[10px] text-[#5B617A]">
                      🕒 {formatDateTime(foto.capturadaEn)}
                    </p>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-1.5 border-t border-[#E6E9F4] pt-2.5">
                    <button
                      type="button"
                      onClick={() => setLightboxIndex(idx)}
                      className="cursor-pointer rounded-lg bg-[#6C7EE1]/12 py-1.5 text-[11px] font-extrabold text-[#6C7EE1] transition hover:bg-[#6C7EE1] hover:text-white"
                    >
                      🔍 Ver HD
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownloadSinglePhoto(foto, idx)}
                      className="cursor-pointer rounded-lg bg-emerald-500/12 py-1.5 text-[11px] font-extrabold text-emerald-700 transition hover:bg-emerald-600 hover:text-white"
                    >
                      ⬇️ Bajar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePhoto(foto)}
                      disabled={deletingPhotoId === foto.idFoto}
                      className="cursor-pointer rounded-lg bg-rose-500/12 py-1.5 text-[11px] font-extrabold text-rose-700 transition hover:bg-rose-600 hover:text-white disabled:opacity-45"
                    >
                      {deletingPhotoId === foto.idFoto ? "..." : "🗑️ Borrar"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* =====================================================================
          6. MODAL VISOR EN PANTALLA COMPLETA (LIGHTBOX ALTA DEFINICIÓN)
         ===================================================================== */}
      {activeLightboxPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-3 backdrop-blur-xs sm:p-6"
          onClick={() => setLightboxIndex(null)}
        >
          <div
            className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/15 bg-[#0F172A] text-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Barra superior del visor */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-extrabold text-white">
                  {activeLightboxPhoto.titulo}
                </p>
                <p className="text-[11px] text-slate-400">
                  Foto {lightboxIndex + 1} de {fotos.length} · Alta Definición (
                  {activeLightboxPhoto.width}×{activeLightboxPhoto.height}px ·{" "}
                  {activeLightboxPhoto.sizeKb} KB)
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handleDownloadSinglePhoto(activeLightboxPhoto, lightboxIndex)
                  }
                  className="cursor-pointer rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-extrabold text-slate-950 hover:bg-emerald-400"
                >
                  ⬇️ Descargar HD
                </button>
                <button
                  type="button"
                  onClick={() => handleDeletePhoto(activeLightboxPhoto)}
                  className="cursor-pointer rounded-lg bg-rose-500/20 px-3 py-1.5 text-xs font-bold text-rose-200 hover:bg-rose-500/40"
                >
                  🗑️ Eliminar
                </button>
                <button
                  type="button"
                  onClick={() => setLightboxIndex(null)}
                  className="cursor-pointer rounded-lg bg-white/15 px-3 py-1.5 text-xs font-extrabold text-white hover:bg-white/25"
                >
                  ✕ Cerrar
                </button>
              </div>
            </div>

            {/* Imagen en Alta Definición */}
            <div className="relative flex min-h-[300px] flex-1 items-center justify-center bg-black p-2 sm:p-4">
              <img
                src={getAlbumPhotoUrl(activeLightboxPhoto.hdUrl)}
                alt={activeLightboxPhoto.titulo}
                className="max-h-[74vh] w-auto max-w-full rounded-lg object-contain"
              />

              {fotos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setLightboxIndex(
                        (lightboxIndex - 1 + fotos.length) % fotos.length
                      )
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 cursor-pointer rounded-full bg-black/65 px-3.5 py-2 text-sm font-extrabold text-white ring-1 ring-white/25 transition hover:bg-black"
                  >
                    ◀
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setLightboxIndex((lightboxIndex + 1) % fotos.length)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer rounded-full bg-black/65 px-3.5 py-2 text-sm font-extrabold text-white ring-1 ring-white/25 transition hover:bg-black"
                  >
                    ▶
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
