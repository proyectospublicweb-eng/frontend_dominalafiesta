// =============================================================================
// MOTOR GENERADOR DE REELS 9:16 PARA INSTAGRAM / REDES SOCIALES (100% EN RAM)
// =============================================================================
// - Renderiza animaciones verticales 9:16 en HTML5 Canvas a 30/60 FPS.
// - No guarda ningún archivo en el servidor ni en la base de datos: el video se
//   codifica en memoria del navegador (MediaRecorder) y se descarga al instante.
// =============================================================================

export const REEL_DESIGNS = [
  {
    id: "glam-pulse",
    name: "Diseño 1 · Glam Pulse (Story Nocturno)",
    shortName: "✨ 1. Glam Pulse",
    subtitle:
      "Barras tipo Story, zoom Ken Burns, bokeh flotante y tarjeta editorial 9:16",
    accentHex: "#8A4FFF",
    badge: "STORY 9:16",
  },
  {
    id: "polaroid-stack",
    name: "Diseño 2 · Polaroid Collage (Instantáneas Apiladas)",
    shortName: "📸 2. Polaroid Collage",
    subtitle:
      "Fotos tipo Polaroid inclinadas que caen sobre mesa difuminada con cinta adhesiva",
    accentHex: "#FFB836",
    badge: "VINTAGE SNAP",
  },
  {
    id: "cinema-film",
    name: "Diseño 3 · Cinema 35mm (Rollo de Película)",
    shortName: "🎞️ 3. Cinema 35mm",
    subtitle:
      "Perforaciones de cine en movimiento continuo, avance vertical de rollo y código de tiempo",
    accentHex: "#FF6B4A",
    badge: "KODAK 35MM",
  },
  {
    id: "split-triptych",
    name: "Diseño 4 · Tríptico Dinámico (3 Paneles)",
    shortName: "🖼️ 4. Tríptico 3x1",
    subtitle:
      "Pantalla dividida en 3 paneles simultáneos (anterior, central y siguiente) con paneo opuesto",
    accentHex: "#3CE7B6",
    badge: "COLLAGE 3X",
  },
  {
    id: "neon-cyber",
    name: "Diseño 5 · Neon Club Beat (Fiesta + Ecualizador)",
    shortName: "⚡ 5. Neon Club Beat",
    subtitle:
      "Pulso rítmico tipo club, barras de audio animadas en vivo y marcos láser cian/magenta",
    accentHex: "#00F0FF",
    badge: "PARTY BEAT",
  },
  {
    id: "vogue-luxe",
    name: "Diseño 6 · Editorial Gold (Gala & Revista)",
    shortName: "👑 6. Editorial Gold",
    subtitle:
      "Ventana en arco de gala, paspartú champán/dorado y tipografía de portada de lujo",
    accentHex: "#D4AF37",
    badge: "LUXE GALA",
  },
  {
    id: "vinyl-retro",
    name: "Diseño 7 · Vinyl Jukebox (Disco Giratorio 33 RPM)",
    shortName: "💿 7. Vinyl Jukebox",
    subtitle:
      "Disco de vinilo giratorio a 33 RPM, brazo de tocadiscos y carátula musical retro",
    accentHex: "#F472B6",
    badge: "RETRO LP",
  },
  {
    id: "scrapbook-journal",
    name: "Diseño 8 · Scrapbook Paper (Bitácora Editorial)",
    shortName: "📒 8. Scrapbook Paper",
    subtitle:
      "Bitácora en papel crema texturizado, esquineros clásicos, sello postal y doble recuerdo",
    accentHex: "#E07A5F",
    badge: "PAPER ART",
  },
  {
    id: "vhs-camcorder",
    name: "Diseño 9 · VHS Camcorder 90s (Handycam Retro)",
    shortName: "📼 9. VHS Camcorder",
    subtitle:
      "Visor Handycam 90s con indicador REC parpadeante, scanlines y código de tiempo SP",
    accentHex: "#EF4444",
    badge: "REC 1998",
  },
  {
    id: "aurora-glass",
    name: "Diseño 10 · Aurora Glass UI (Smart Cristal Boreal)",
    shortName: "🌌 10. Aurora Glass UI",
    subtitle:
      "Ondas boreales animadas, tarjeta cristal esmerilado con anillo luminoso y miniatura viva",
    accentHex: "#818CF8",
    badge: "FROST UI",
  },
  {
    id: "mosaic-carousel",
    name: "Diseño 11 · Carrusel 3D (Escenario Coverflow)",
    shortName: "🎠 11. Carrusel 3D",
    subtitle:
      "Escenario Coverflow con paneles laterales en perspectiva, reflejo en piso y marquesina",
    accentHex: "#34D399",
    badge: "COVERFLOW",
  },
  {
    id: "insta-frame",
    name: "Diseño 12 · Insta Reels Frame (Doble Capa & Marco Blanco)",
    shortName: "📱 12. Insta Reels Frame",
    subtitle:
      "Doble capa espejo con ventana central blanca, íconos nativos de Reels y cortes dinámicos",
    accentHex: "#38BDF8",
    badge: "IG VIRAL",
  },
  {
    id: "pulso-creativo",
    name: "Diseño 13 · Pulso Creativo (Editorial 3 Franjas a Sangre)",
    shortName: "🎬 13. Pulso Creativo",
    subtitle:
      "Tres franjas horizontales a sangre completa con cambios escalonados al pulso y firma editorial",
    accentHex: "#F472B6",
    badge: "EDITORIAL 3X",
  },
];

function drawCoverImageWithTransform(
  ctx,
  img,
  canvasW,
  canvasH,
  scale = 1,
  panX = 0,
  panY = 0
) {
  if (!img) return;
  const iw = Number(img.naturalWidth || img.width) || canvasW;
  const ih = Number(img.naturalHeight || img.height) || canvasH;
  const baseRatio = Math.max(canvasW / iw, canvasH / ih);
  const drawW = iw * baseRatio * scale;
  const drawH = ih * baseRatio * scale;
  const dx = (canvasW - drawW) / 2 + panX * canvasW;
  const dy = (canvasH - drawH) / 2 + panY * canvasH;

  ctx.drawImage(img, dx, dy, drawW, drawH);
}

function drawCoverImageInBox(
  ctx,
  img,
  boxX,
  boxY,
  boxW,
  boxH,
  scale = 1,
  panX = 0,
  panY = 0,
  radius = 0
) {
  if (!img) return;
  ctx.save();
  if (radius > 0) {
    const r = Math.min(radius, boxW / 2, boxH / 2);
    ctx.beginPath();
    ctx.moveTo(boxX + r, boxY);
    ctx.arcTo(boxX + boxW, boxY, boxX + boxW, boxY + boxH, r);
    ctx.arcTo(boxX + boxW, boxY + boxH, boxX, boxY + boxH, r);
    ctx.arcTo(boxX, boxY + boxH, boxX, boxY, r);
    ctx.arcTo(boxX, boxY, boxX + boxW, boxY, r);
    ctx.closePath();
    ctx.clip();
  } else {
    ctx.beginPath();
    ctx.rect(boxX, boxY, boxW, boxH);
    ctx.clip();
  }

  const iw = Number(img.naturalWidth || img.width) || boxW;
  const ih = Number(img.naturalHeight || img.height) || boxH;
  const baseRatio = Math.max(boxW / iw, boxH / ih);
  const drawW = iw * baseRatio * scale;
  const drawH = ih * baseRatio * scale;
  const dx = boxX + (boxW - drawW) / 2 + panX * boxW;
  const dy = boxY + (boxH - drawH) / 2 + panY * boxH;

  ctx.drawImage(img, dx, dy, drawW, drawH);
  ctx.restore();
}

function fillRoundedRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
  ctx.fill();
}

function strokeRoundedRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
  ctx.stroke();
}

/**
 * Dibuja un fotograma completo del Reel 9:16 en el contexto de Canvas indicado.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} width  Ancho del lienzo (ej. 720 o 1080)
 * @param {number} height Alto del lienzo (ej. 1280 o 1920)
 * @param {Object} params
 * @param {HTMLImageElement[]} params.images Arreglo de imágenes cargadas
 * @param {number} params.elapsedMs Tiempo transcurrido en ms
 * @param {number} params.slideDurationMs Duración por foto en ms (ej. 2000)
 * @param {string} params.designId ID del diseño de reel elegido
 * @param {string} params.mainText Título principal del evento/reel
 * @param {string} params.subText Subtítulo / Fecha y lugar
 * @param {string} params.tagText Etiqueta superior o hashtag
 */
export function renderReelFrameOnCanvas(ctx, width, height, params = {}) {
  const {
    images = [],
    elapsedMs = 0,
    slideDurationMs = 2000,
    designId = "glam-pulse",
    mainText = "Mi Evento",
    subText = "Recuerdalo.com.mx",
    tagText = "RECUERDO OFICIAL",
    audioTitle = "",
  } = params;

  ctx.save();
  ctx.clearRect(0, 0, width, height);

  // Fondo base oscuro nocturno
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, "#0D0E1B");
  bgGrad.addColorStop(0.5, "#191536");
  bgGrad.addColorStop(1, "#0B0918");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  const count = images.length;
  if (count === 0) {
    ctx.fillStyle = "#8E92B2";
    ctx.font = `700 ${Math.round(width * 0.042)}px 'Segoe UI', sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      "Selecciona al menos 1 foto para el Reel",
      width / 2,
      height / 2
    );
    ctx.restore();
    return;
  }

  const safeDuration = Math.max(800, Number(slideDurationMs) || 2000);
  const totalCycleMs = count * safeDuration;
  const loopMs = ((elapsedMs % totalCycleMs) + totalCycleMs) % totalCycleMs;
  const currentIndex = Math.min(count - 1, Math.floor(loopMs / safeDuration));
  const slideProgress = (loopMs - currentIndex * safeDuration) / safeDuration; // 0..1
  const prevIndex = (currentIndex - 1 + count) % count;

  const currentImg = images[currentIndex];
  const prevImg = images[prevIndex];

  // ===========================================================================
  // DISEÑO 1: GLAM PULSE (INSTAGRAM STORY / REEL 9:16)
  // ===========================================================================
  if (designId === "glam-pulse" || !designId) {
    // 1. Efecto Ken Burns (zoom suave + paneo alternado por cada foto)
    const dir = currentIndex % 2 === 0 ? 1 : -1;
    const zoomScale = 1.04 + slideProgress * 0.11;
    const panX = dir * (slideProgress - 0.5) * 0.035;
    const panY = -dir * (slideProgress - 0.5) * 0.025;

    // Transición suave (crossfade + ligero destello durante el primer 18% del slide)
    const transitionWindow = 0.18;
    if (slideProgress < transitionWindow && count > 1 && prevImg) {
      const t = slideProgress / transitionWindow; // 0..1
      const prevZoom = 1.15;
      ctx.globalAlpha = 1;
      drawCoverImageWithTransform(
        ctx,
        prevImg,
        width,
        height,
        prevZoom,
        -dir * 0.018,
        dir * 0.012
      );

      ctx.globalAlpha = t;
      drawCoverImageWithTransform(
        ctx,
        currentImg,
        width,
        height,
        zoomScale,
        panX,
        panY
      );
      ctx.globalAlpha = 1;

      // Destello suave de transición tipo cámara/reel
      const flashAlpha = Math.sin(t * Math.PI) * 0.22;
      ctx.fillStyle = `rgba(196, 166, 255, ${flashAlpha.toFixed(3)})`;
      ctx.fillRect(0, 0, width, height);
    } else {
      drawCoverImageWithTransform(
        ctx,
        currentImg,
        width,
        height,
        zoomScale,
        panX,
        panY
      );
    }

    // 2. Viñeta cinematográfica superior e inferior para legibilidad de UI de Instagram
    const topVignette = ctx.createLinearGradient(0, 0, 0, height * 0.28);
    topVignette.addColorStop(0, "rgba(10, 9, 24, 0.82)");
    topVignette.addColorStop(0.6, "rgba(10, 9, 24, 0.32)");
    topVignette.addColorStop(1, "rgba(10, 9, 24, 0)");
    ctx.fillStyle = topVignette;
    ctx.fillRect(0, 0, width, height * 0.28);

    const bottomVignette = ctx.createLinearGradient(
      0,
      height * 0.56,
      0,
      height
    );
    bottomVignette.addColorStop(0, "rgba(10, 9, 24, 0)");
    bottomVignette.addColorStop(0.45, "rgba(14, 12, 34, 0.65)");
    bottomVignette.addColorStop(1, "rgba(10, 8, 26, 0.94)");
    ctx.fillStyle = bottomVignette;
    ctx.fillRect(0, height * 0.56, width, height * 0.44);

    // 3. Partículas / Bokeh luminoso flotante en movimiento continuo
    const timeSec = elapsedMs / 1000;
    const particles = [
      { bx: 0.14, by: 0.22, r: 0.022, speed: 0.55, color: "rgba(138, 79, 255, 0.28)" },
      { bx: 0.84, by: 0.18, r: 0.032, speed: 0.42, color: "rgba(60, 231, 182, 0.24)" },
      { bx: 0.78, by: 0.68, r: 0.028, speed: 0.62, color: "rgba(255, 142, 142, 0.24)" },
      { bx: 0.22, by: 0.72, r: 0.035, speed: 0.48, color: "rgba(75, 166, 255, 0.25)" },
      { bx: 0.52, by: 0.14, r: 0.018, speed: 0.75, color: "rgba(255, 184, 54, 0.30)" },
    ];
    particles.forEach((p, idx) => {
      const px =
        (p.bx + Math.sin(timeSec * p.speed + idx * 1.7) * 0.05) * width;
      const py =
        (p.by + Math.cos(timeSec * p.speed + idx * 1.3) * 0.04) * height;
      const pr = p.r * width;
      const radGrad = ctx.createRadialGradient(px, py, 0, px, py, pr * 2.2);
      radGrad.addColorStop(0, p.color);
      radGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = radGrad;
      ctx.beginPath();
      ctx.arc(px, py, pr * 2.2, 0, Math.PI * 2);
      ctx.fill();
    });

    // 4. Marco interior estilizado con esquinas redondeadas
    const padX = width * 0.052;
    const padY = height * 0.032;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
    ctx.lineWidth = Math.max(1.5, width * 0.0028);
    strokeRoundedRect(
      ctx,
      padX,
      padY,
      width - padX * 2,
      height - padY * 2,
      width * 0.045
    );

    // 5. Barras superiores de progreso estilo Instagram Story/Reel (1 segmento por foto)
    const barAreaX = padX + width * 0.035;
    const barAreaW = width - (padX + width * 0.035) * 2;
    const barY = padY + height * 0.022;
    const barH = Math.max(3, height * 0.0038);
    const gap = Math.max(4, width * 0.01);
    const segW = (barAreaW - gap * (count - 1)) / count;

    for (let i = 0; i < count; i++) {
      const sx = barAreaX + i * (segW + gap);
      // Riel de fondo
      ctx.fillStyle = "rgba(255, 255, 255, 0.26)";
      fillRoundedRect(ctx, sx, barY, segW, barH, barH / 2);

      // Relleno activo
      let fillFraction = 0;
      if (i < currentIndex) fillFraction = 1;
      else if (i === currentIndex) fillFraction = Math.min(1, Math.max(0, slideProgress));

      if (fillFraction > 0) {
        const barGrad = ctx.createLinearGradient(sx, barY, sx + segW, barY);
        barGrad.addColorStop(0, "#3CE7B6");
        barGrad.addColorStop(0.5, "#8A4FFF");
        barGrad.addColorStop(1, "#FF8E8E");
        ctx.fillStyle = barGrad;
        fillRoundedRect(ctx, sx, barY, segW * fillFraction, barH, barH / 2);
      }
    }

    // 6. Píldora superior de cabecera (Estilo cuenta/etiqueta de Instagram Reel)
    const headerY = barY + barH + height * 0.02;
    const badgeLabel = String(tagText || "RECUERDO OFICIAL").toUpperCase();
    ctx.font = `800 ${Math.round(width * 0.025)}px 'Segoe UI', sans-serif`;
    const badgeTextW = ctx.measureText(badgeLabel).width;
    const pillW = badgeTextW + width * 0.1;
    const pillH = height * 0.032;
    const pillX = barAreaX;

    ctx.fillStyle = "rgba(20, 21, 38, 0.78)";
    fillRoundedRect(ctx, pillX, headerY, pillW, pillH, pillH / 2);
    ctx.strokeStyle = "rgba(138, 79, 255, 0.65)";
    ctx.lineWidth = Math.max(1, width * 0.002);
    strokeRoundedRect(ctx, pillX, headerY, pillW, pillH, pillH / 2);

    // Punto verde menta pulsante en la píldora
    const pulseR = width * 0.009 * (0.88 + 0.22 * Math.sin(timeSec * 5));
    ctx.fillStyle = "#3CE7B6";
    ctx.beginPath();
    ctx.arc(
      pillX + width * 0.032,
      headerY + pillH / 2,
      pulseR,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.fillStyle = "#F4F5FB";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(badgeLabel, pillX + width * 0.054, headerY + pillH / 2 + 1);

    // Contador de foto a la derecha (ej. "02 / 06")
    const counterLabel = `${String(currentIndex + 1).padStart(2, "0")} / ${String(
      count
    ).padStart(2, "0")}`;
    const cntW = width * 0.14;
    const cntX = width - barAreaX - cntW;
    ctx.fillStyle = "rgba(20, 21, 38, 0.72)";
    fillRoundedRect(ctx, cntX, headerY, cntW, pillH, pillH / 2);
    ctx.fillStyle = "#C4A6FF";
    ctx.font = `800 ${Math.round(width * 0.024)}px 'Segoe UI', sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(counterLabel, cntX + cntW / 2, headerY + pillH / 2 + 1);

    // 7. Tarjeta Inferior Editorial con Animación Suave de Entrada en cada Slide
    const cardW = width - (padX + width * 0.032) * 2;
    const cardH = height * 0.155;
    const cardX = padX + width * 0.032;
    const entryLift =
      slideProgress < 0.2
        ? (1 - slideProgress / 0.2) * (height * 0.012)
        : 0;
    const cardY = height - padY - cardH - height * 0.025 + entryLift;

    // Fondo oscuro translúcido de la tarjeta inferior
    const cardGrad = ctx.createLinearGradient(
      cardX,
      cardY,
      cardX + cardW,
      cardY + cardH
    );
    cardGrad.addColorStop(0, "rgba(20, 21, 38, 0.88)");
    cardGrad.addColorStop(1, "rgba(34, 36, 55, 0.82)");
    ctx.fillStyle = cardGrad;
    fillRoundedRect(ctx, cardX, cardY, cardW, cardH, width * 0.038);

    ctx.strokeStyle = "rgba(138, 79, 255, 0.48)";
    ctx.lineWidth = Math.max(1.5, width * 0.0025);
    strokeRoundedRect(ctx, cardX, cardY, cardW, cardH, width * 0.038);

    // Barra vertical de acento con gradiente Violeta -> Menta dentro de la tarjeta
    const accentX = cardX + width * 0.035;
    const accentY = cardY + cardH * 0.18;
    const accentW = Math.max(4, width * 0.009);
    const accentH = cardH * 0.64;
    const barAccentGrad = ctx.createLinearGradient(
      accentX,
      accentY,
      accentX,
      accentY + accentH
    );
    barAccentGrad.addColorStop(0, "#8A4FFF");
    barAccentGrad.addColorStop(0.5, "#3CE7B6");
    barAccentGrad.addColorStop(1, "#FF8E8E");
    ctx.fillStyle = barAccentGrad;
    fillRoundedRect(ctx, accentX, accentY, accentW, accentH, accentW / 2);

    // Título Principal del Evento
    const textStartX = accentX + accentW + width * 0.03;
    const maxTextW = cardW - (textStartX - cardX) - width * 0.035;

    ctx.fillStyle = "#FFFFFF";
    ctx.font = `900 ${Math.round(width * 0.05)}px 'Segoe UI', sans-serif`;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    const cleanMain = String(mainText || "Mi Evento").trim();
    ctx.fillText(cleanMain, textStartX, cardY + cardH * 0.2, maxTextW);

    // Subtítulo / Fecha y Lugar
    const cleanSub = String(subText || "").trim();
    if (cleanSub) {
      ctx.fillStyle = "#3CE7B6";
      ctx.font = `700 ${Math.round(width * 0.031)}px 'Segoe UI', sans-serif`;
      ctx.fillText(cleanSub, textStartX, cardY + cardH * 0.54, maxTextW);
    }

    // Sello inferior discreto
    ctx.fillStyle = "rgba(197, 200, 230, 0.72)";
    ctx.font = `600 ${Math.round(width * 0.022)}px 'Segoe UI', sans-serif`;
    ctx.fillText(
      "✨ Creado con Recuerdalo.com.mx · Instagram Reel",
      textStartX,
      cardY + cardH * 0.77,
      maxTextW
    );
  }
  // ===========================================================================
  // DISEÑO 2: POLAROID COLLAGE (FOTOS INSTANTÁNEAS APILADAS CON CINTA ADHESIVA)
  // ===========================================================================
  else if (designId === "polaroid-stack") {
    const timeSec = elapsedMs / 1000;
    const cleanMain = String(mainText || "Mi Evento").trim();
    const cleanSub = String(subText || "").trim();
    const cleanTag = String(tagText || "INSTANT MEMORY").toUpperCase();

    // 1. Fondo atmosférico oscuro + imagen activa desenfocada/oscurecida
    ctx.save();
    ctx.globalAlpha = 0.34;
    drawCoverImageWithTransform(
      ctx,
      currentImg,
      width,
      height,
      1.26,
      Math.sin(timeSec * 0.6) * 0.03,
      Math.cos(timeSec * 0.5) * 0.03
    );
    ctx.restore();

    const warmOverlay = ctx.createRadialGradient(
      width * 0.5,
      height * 0.45,
      width * 0.1,
      width * 0.5,
      height * 0.5,
      height * 0.75
    );
    warmOverlay.addColorStop(0, "rgba(38, 26, 20, 0.52)");
    warmOverlay.addColorStop(1, "rgba(12, 9, 14, 0.92)");
    ctx.fillStyle = warmOverlay;
    ctx.fillRect(0, 0, width, height);

    // Cuadrícula sutil de mesa de estudio / scrapbook
    ctx.strokeStyle = "rgba(255, 224, 178, 0.06)";
    ctx.lineWidth = 1;
    const gridStep = width * 0.08;
    for (let gx = 0; gx < width; gx += gridStep) {
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, height);
      ctx.stroke();
    }
    for (let gy = 0; gy < height; gy += gridStep) {
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(width, gy);
      ctx.stroke();
    }

    // 2. Cabecera Vintage "INSTAX / POLAROID SNAP"
    const topY = height * 0.055;
    ctx.fillStyle = "rgba(255, 184, 54, 0.18)";
    fillRoundedRect(
      ctx,
      width * 0.08,
      topY,
      width * 0.84,
      height * 0.048,
      height * 0.024
    );
    ctx.strokeStyle = "rgba(255, 184, 54, 0.55)";
    ctx.lineWidth = Math.max(1.2, width * 0.0022);
    strokeRoundedRect(
      ctx,
      width * 0.08,
      topY,
      width * 0.84,
      height * 0.048,
      height * 0.024
    );

    ctx.fillStyle = "#FFD27D";
    ctx.font = `800 ${Math.round(width * 0.026)}px 'Courier New', monospace`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(
      `📸 ${cleanTag}`,
      width * 0.12,
      topY + height * 0.024,
      width * 0.55
    );

    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "right";
    ctx.fillText(
      `SNAP #${String(currentIndex + 1).padStart(2, "0")}/${String(
        count
      ).padStart(2, "0")}`,
      width * 0.88,
      topY + height * 0.024
    );

    // Función auxiliar para dibujar una tarjeta Polaroid completa
    const drawPolaroidCard = (
      img,
      cx,
      cy,
      angleRad,
      cardScale,
      captionTitle,
      captionSub,
      isBackCard = false
    ) => {
      if (!img) return;
      const cardW = width * 0.78 * cardScale;
      const cardH = height * 0.58 * cardScale;
      const padSide = cardW * 0.055;
      const padTop = cardW * 0.055;
      const photoW = cardW - padSide * 2;
      const photoH = cardH * 0.76;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angleRad);

      // Sombra profunda de papel fotográfico
      ctx.shadowColor = "rgba(0, 0, 0, 0.65)";
      ctx.shadowBlur = width * 0.055;
      ctx.shadowOffsetY = height * 0.015;

      ctx.fillStyle = isBackCard ? "#E6DFD5" : "#FCF9F2";
      fillRoundedRect(
        ctx,
        -cardW / 2,
        -cardH / 2,
        cardW,
        cardH,
        width * 0.018
      );

      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      // Foto interior con ligero zoom vivo
      const innerZoom = isBackCard ? 1.03 : 1.02 + slideProgress * 0.08;
      drawCoverImageInBox(
        ctx,
        img,
        -cardW / 2 + padSide,
        -cardH / 2 + padTop,
        photoW,
        photoH,
        innerZoom,
        0,
        0,
        width * 0.008
      );

      // Marco interior fino oscuro
      ctx.strokeStyle = "rgba(20, 18, 15, 0.18)";
      ctx.lineWidth = Math.max(1, width * 0.002);
      ctx.strokeRect(
        -cardW / 2 + padSide,
        -cardH / 2 + padTop,
        photoW,
        photoH
      );

      // Cinta adhesiva semitransparente arriba al centro (Washi Tape)
      if (!isBackCard) {
        ctx.save();
        ctx.translate(0, -cardH / 2 - height * 0.004);
        ctx.rotate(-0.04);
        ctx.fillStyle = "rgba(255, 206, 115, 0.72)";
        fillRoundedRect(
          ctx,
          -cardW * 0.18,
          -height * 0.016,
          cardW * 0.36,
          height * 0.032,
          4
        );
        ctx.restore();

        // Texto estilo firma en la barbilla blanca del Polaroid
        const chinCenterY = -cardH / 2 + padTop + photoH + (cardH - padTop - photoH) * 0.42;
        ctx.fillStyle = "#1E1B18";
        ctx.font = `900 ${Math.round(width * 0.046)}px 'Georgia', serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(captionTitle, 0, chinCenterY, photoW * 0.94);

        if (captionSub) {
          ctx.fillStyle = "#8C6239";
          ctx.font = `700 ${Math.round(width * 0.027)}px 'Segoe UI', sans-serif`;
          ctx.fillText(
            captionSub,
            0,
            chinCenterY + cardH * 0.068,
            photoW * 0.92
          );
        }
      }

      ctx.restore();
    };

    // 3. Dibujar Polaroid anterior debajo (inclinada en sentido opuesto)
    if (count > 1 && prevImg) {
      const backAngle = (currentIndex % 2 === 0 ? -1 : 1) * 0.11;
      drawPolaroidCard(
        prevImg,
        width * 0.48,
        height * 0.47,
        backAngle,
        0.92,
        cleanMain,
        cleanSub,
        true
      );
    }

    // 4. Dibujar Polaroid activa encima con animación de caída suave al entrar
    const entryEase =
      slideProgress < 0.22
        ? 1 - Math.pow(1 - slideProgress / 0.22, 3)
        : 1;
    const dropScale = 1 + (1 - entryEase) * 0.14;
    const frontAngle =
      (currentIndex % 2 === 0 ? 1 : -1) *
      (0.045 - slideProgress * 0.03);

    drawPolaroidCard(
      currentImg,
      width * 0.5,
      height * 0.475,
      frontAngle,
      dropScale,
      cleanMain,
      cleanSub,
      false
    );

    // 5. Indicador inferior de puntos estilo carrete instantáneo
    const dotsY = height * 0.875;
    const dotGap = width * 0.042;
    const totalDotsW = (count - 1) * dotGap;
    for (let i = 0; i < count; i++) {
      const dx = width / 2 - totalDotsW / 2 + i * dotGap;
      ctx.fillStyle =
        i === currentIndex ? "#FFB836" : "rgba(255, 255, 255, 0.28)";
      ctx.beginPath();
      ctx.arc(
        dx,
        dotsY,
        i === currentIndex ? width * 0.013 : width * 0.008,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    ctx.fillStyle = "rgba(255, 232, 198, 0.78)";
    ctx.font = `700 ${Math.round(width * 0.023)}px 'Courier New', monospace`;
    ctx.textAlign = "center";
    ctx.fillText(
      "✨ RECUERDALO.COM.MX · POLAROID REEL",
      width / 2,
      height * 0.925
    );
  }
  // ===========================================================================
  // DISEÑO 3: CINEMA 35MM (ROLLO DE PELÍCULA EN MOVIMIENTO VERTICAL + TIMECODE)
  // ===========================================================================
  else if (designId === "cinema-film") {
    const timeSec = elapsedMs / 1000;
    const cleanMain = String(mainText || "Mi Evento").trim();
    const cleanSub = String(subText || "").trim();
    const cleanTag = String(tagText || "KODAK PORTRA 400").toUpperCase();

    // Franjas laterales del negativo de 35mm
    const stripSideW = width * 0.115;
    const frameX = stripSideW;
    const frameW = width - stripSideW * 2;
    const frameY = height * 0.08;
    const frameH = height * 0.68;

    // 1. Avance vertical de rollo en transición (efecto proyector de cine)
    const rollWindow = 0.2;
    if (slideProgress < rollWindow && count > 1 && prevImg) {
      const t = slideProgress / rollWindow;
      const ease = t * t * (3 - 2 * t);
      const offsetPx = ease * frameH;

      drawCoverImageInBox(
        ctx,
        prevImg,
        frameX,
        frameY - offsetPx,
        frameW,
        frameH,
        1.06,
        0,
        0,
        width * 0.015
      );
      drawCoverImageInBox(
        ctx,
        currentImg,
        frameX,
        frameY + (frameH - offsetPx),
        frameW,
        frameH,
        1.04,
        0,
        0,
        width * 0.015
      );
    } else {
      const zoom = 1.03 + slideProgress * 0.08;
      drawCoverImageInBox(
        ctx,
        currentImg,
        frameX,
        frameY,
        frameW,
        frameH,
        zoom,
        0,
        (slideProgress - 0.5) * 0.03,
        width * 0.015
      );
    }

    // 2. Fuga de luz cálida analógica (Light Leak) animada en el borde del negativo
    const leakAlpha = 0.18 + 0.12 * Math.sin(timeSec * 3.2);
    const leakGrad = ctx.createLinearGradient(frameX, frameY, frameX + frameW * 0.45, frameY + frameH);
    leakGrad.addColorStop(0, `rgba(255, 94, 36, ${leakAlpha.toFixed(3)})`);
    leakGrad.addColorStop(0.5, `rgba(255, 184, 54, ${(leakAlpha * 0.5).toFixed(3)})`);
    leakGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = leakGrad;
    ctx.fillRect(frameX, frameY, frameW, frameH);

    // 3. Bandas negras laterales con perforaciones de 35mm corriendo continuamente
    ctx.fillStyle = "#08080C";
    ctx.fillRect(0, 0, stripSideW, height);
    ctx.fillRect(width - stripSideW, 0, stripSideW, height);

    const holeW = stripSideW * 0.44;
    const holeH = height * 0.022;
    const holeSpacing = height * 0.046;
    const scrollOffset = (timeSec * height * 0.14) % holeSpacing;

    ctx.fillStyle = "#EAE6DF";
    for (let y = -holeSpacing + scrollOffset; y < height + holeSpacing; y += holeSpacing) {
      fillRoundedRect(
        ctx,
        (stripSideW - holeW) / 2,
        y,
        holeW,
        holeH,
        width * 0.006
      );
      fillRoundedRect(
        ctx,
        width - stripSideW + (stripSideW - holeW) / 2,
        y,
        holeW,
        holeH,
        width * 0.006
      );
    }

    // Códigos naranjas verticales del rollo analógico
    ctx.save();
    ctx.fillStyle = "#FF8B3D";
    ctx.font = `800 ${Math.round(width * 0.018)}px 'Courier New', monospace`;
    ctx.translate(stripSideW * 0.86, height * 0.5);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = "center";
    ctx.fillText(
      `◄ ${cleanTag} · FRAME ${currentIndex + 1}A ►`,
      0,
      0
    );
    ctx.restore();

    // 4. Barra superior del visor de cámara (REC + Timecode)
    ctx.fillStyle = "#08080C";
    ctx.fillRect(frameX, 0, frameW, frameY);

    const recDotOn = Math.floor(timeSec * 2) % 2 === 0;
    if (recDotOn) {
      ctx.fillStyle = "#FF3B30";
      ctx.beginPath();
      ctx.arc(frameX + width * 0.03, frameY * 0.54, width * 0.011, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "#F5F2EB";
    ctx.font = `800 ${Math.round(width * 0.025)}px 'Courier New', monospace`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("REC · 24FPS", frameX + width * 0.052, frameY * 0.54);

    const secWhole = Math.floor(timeSec);
    const framesPart = Math.floor((timeSec % 1) * 24);
    const tcStr = `00:00:${String(secWhole).padStart(2, "0")}:${String(
      framesPart
    ).padStart(2, "0")}`;
    ctx.fillStyle = "#FFB836";
    ctx.textAlign = "right";
    ctx.fillText(tcStr, frameX + frameW - width * 0.02, frameY * 0.54);

    // 5. Panel inferior cinematográfico (Debajo de la ventanilla 35mm)
    const bottomY = frameY + frameH;
    const bottomH = height - bottomY;
    ctx.fillStyle = "#08080C";
    ctx.fillRect(frameX, bottomY, frameW, bottomH);

    // Línea divisoria ámbar con barra de progreso del rollo
    ctx.fillStyle = "rgba(255, 139, 61, 0.25)";
    ctx.fillRect(frameX, bottomY + height * 0.015, frameW, 4);
    const overallPct = (currentIndex + slideProgress) / count;
    ctx.fillStyle = "#FF6B4A";
    ctx.fillRect(frameX, bottomY + height * 0.015, frameW * overallPct, 4);

    // Subtítulo tipo subtítulo de película en amarillo cine y Título grande
    ctx.fillStyle = "#FFFFFF";
    ctx.font = `900 ${Math.round(width * 0.052)}px 'Segoe UI', sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(cleanMain, width / 2, bottomY + height * 0.042, frameW * 0.94);

    if (cleanSub) {
      ctx.fillStyle = "#FFD166";
      ctx.font = `italic 700 ${Math.round(width * 0.03)}px 'Georgia', serif`;
      ctx.fillText(
        `"${cleanSub}"`,
        width / 2,
        bottomY + height * 0.11,
        frameW * 0.92
      );
    }

    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.font = `700 ${Math.round(width * 0.02)}px 'Courier New', monospace`;
    ctx.fillText(
      `TOMA ${String(currentIndex + 1).padStart(2, "0")} DE ${String(
        count
      ).padStart(2, "0")} · RECUERDALO CINEMA`,
      width / 2,
      bottomY + height * 0.175,
      frameW * 0.92
    );
  }
  // ===========================================================================
  // DISEÑO 4: TRÍPTICO DINÁMICO (3 PANELES HORIZONTALES SIMULTÁNEOS)
  // ===========================================================================
  else if (designId === "split-triptych") {
    const nextIndex = (currentIndex + 1) % count;
    const nextImg = images[nextIndex] || currentImg;
    const topImg = prevImg || currentImg;

    const cleanMain = String(mainText || "Mi Evento").trim();
    const cleanSub = String(subText || "").trim();
    const cleanTag = String(tagText || "TRÍPTICO ESPECIAL").toUpperCase();

    const pad = width * 0.032;
    const gap = height * 0.012;
    const usableW = width - pad * 2;
    const topH = height * 0.25;
    const midH = height * 0.42;
    const botH = height - pad * 2 - topH - midH - gap * 2;

    const topY = pad;
    const midY = topY + topH + gap;
    const botY = midY + midH + gap;

    // 1. Panel Superior (Foto anterior con paneo hacia la izquierda)
    drawCoverImageInBox(
      ctx,
      topImg,
      pad,
      topY,
      usableW,
      topH,
      1.12,
      -0.04 + slideProgress * 0.08,
      0,
      width * 0.03
    );
    ctx.fillStyle = "rgba(12, 14, 28, 0.38)";
    fillRoundedRect(ctx, pad, topY, usableW, topH, width * 0.03);

    // 2. Panel Central Protagonista (Foto activa con zoom central nítido)
    drawCoverImageInBox(
      ctx,
      currentImg,
      pad,
      midY,
      usableW,
      midH,
      1.02 + slideProgress * 0.1,
      0,
      0,
      width * 0.035
    );
    ctx.strokeStyle = "#3CE7B6";
    ctx.lineWidth = Math.max(2, width * 0.004);
    strokeRoundedRect(ctx, pad, midY, usableW, midH, width * 0.035);

    // 3. Panel Inferior (Foto siguiente con paneo hacia la derecha)
    drawCoverImageInBox(
      ctx,
      nextImg,
      pad,
      botY,
      usableW,
      botH,
      1.12,
      0.04 - slideProgress * 0.08,
      0,
      width * 0.03
    );
    ctx.fillStyle = "rgba(12, 14, 28, 0.46)";
    fillRoundedRect(ctx, pad, botY, usableW, botH, width * 0.03);

    // 4. Píldora flotante superior sobre la unión del panel 1 y 2
    const badgeW = width * 0.64;
    const badgeH = height * 0.036;
    const badgeX = (width - badgeW) / 2;
    const badgeY = midY - badgeH / 2;

    ctx.fillStyle = "#141526";
    fillRoundedRect(ctx, badgeX, badgeY, badgeW, badgeH, badgeH / 2);
    ctx.strokeStyle = "#3CE7B6";
    ctx.lineWidth = Math.max(1.5, width * 0.003);
    strokeRoundedRect(ctx, badgeX, badgeY, badgeW, badgeH, badgeH / 2);

    ctx.fillStyle = "#3CE7B6";
    ctx.font = `800 ${Math.round(width * 0.024)}px 'Segoe UI', sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      `✦ ${cleanTag} · ${currentIndex + 1}/${count} ✦`,
      width / 2,
      badgeY + badgeH / 2 + 1,
      badgeW * 0.9
    );

    // 5. Tarjeta editorial flotante sobre la unión entre el panel central y el inferior
    const cardW = width * 0.84;
    const cardH = height * 0.135;
    const cardX = (width - cardW) / 2;
    const cardY = botY - cardH * 0.45;

    ctx.fillStyle = "rgba(16, 18, 34, 0.92)";
    fillRoundedRect(ctx, cardX, cardY, cardW, cardH, width * 0.035);
    ctx.strokeStyle = "rgba(60, 231, 182, 0.65)";
    ctx.lineWidth = Math.max(1.5, width * 0.0028);
    strokeRoundedRect(ctx, cardX, cardY, cardW, cardH, width * 0.035);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = `900 ${Math.round(width * 0.046)}px 'Segoe UI', sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(cleanMain, width / 2, cardY + cardH * 0.18, cardW * 0.9);

    if (cleanSub) {
      ctx.fillStyle = "#3CE7B6";
      ctx.font = `700 ${Math.round(width * 0.028)}px 'Segoe UI', sans-serif`;
      ctx.fillText(cleanSub, width / 2, cardY + cardH * 0.56, cardW * 0.88);
    }

    // Barra de progreso integrada en la base de la tarjeta
    const progW = cardW * 0.7;
    const progX = (width - progW) / 2;
    const progY = cardY + cardH * 0.84;
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    fillRoundedRect(ctx, progX, progY, progW, 4, 2);
    ctx.fillStyle = "#3CE7B6";
    fillRoundedRect(
      ctx,
      progX,
      progY,
      progW * ((currentIndex + slideProgress) / count),
      4,
      2
    );
  }
  // ===========================================================================
  // DISEÑO 5: NEON CLUB BEAT (PULSO RÍTMICO + ECUALIZADOR DE AUDIO ANIMADO)
  // ===========================================================================
  else if (designId === "neon-cyber") {
    const timeSec = elapsedMs / 1000;
    const cleanMain = String(mainText || "Mi Evento").trim();
    const cleanSub = String(subText || "").trim();
    const cleanTag = String(tagText || "VIP PARTY BEAT").toUpperCase();

    // Pulso rítmico tipo bajo de club (128 BPM aprox)
    const beatPulse = Math.pow((Math.sin(timeSec * Math.PI * 4.2) + 1) / 2, 2);
    const beatZoom = 1.05 + slideProgress * 0.08 + beatPulse * 0.035;

    // Transición lateral rápida (Whip-Pan) al cambiar de foto
    const whipWindow = 0.16;
    if (slideProgress < whipWindow && count > 1 && prevImg) {
      const t = slideProgress / whipWindow;
      const ease = 1 - Math.pow(1 - t, 3);
      drawCoverImageInBox(
        ctx,
        prevImg,
        -ease * width,
        0,
        width,
        height,
        1.1,
        0,
        0,
        0
      );
      drawCoverImageInBox(
        ctx,
        currentImg,
        width * (1 - ease),
        0,
        width,
        height,
        beatZoom,
        0,
        0,
        0
      );
      // Destello láser cian/magenta en el corte
      ctx.fillStyle = `rgba(0, 240, 255, ${((1 - t) * 0.28).toFixed(3)})`;
      ctx.fillRect(0, 0, width, height);
    } else {
      drawCoverImageWithTransform(
        ctx,
        currentImg,
        width,
        height,
        beatZoom,
        0,
        0
      );
    }

    // Gradiente club nocturno Cian / Magenta en bordes superior e inferior
    const clubGrad = ctx.createLinearGradient(0, 0, 0, height);
    clubGrad.addColorStop(0, "rgba(8, 6, 24, 0.85)");
    clubGrad.addColorStop(0.25, "rgba(0, 240, 255, 0.08)");
    clubGrad.addColorStop(0.65, "rgba(255, 30, 110, 0.14)");
    clubGrad.addColorStop(1, "rgba(6, 4, 18, 0.95)");
    ctx.fillStyle = clubGrad;
    ctx.fillRect(0, 0, width, height);

    // Esquinas láser neón (brackets de club)
    const padX = width * 0.06;
    const padY = height * 0.045;
    const cornerLen = width * 0.11;
    ctx.lineWidth = Math.max(3, width * 0.006);

    // Esquina superior izquierda e inferior derecha en Cian (#00F0FF)
    ctx.strokeStyle = "#00F0FF";
    ctx.beginPath();
    ctx.moveTo(padX, padY + cornerLen);
    ctx.lineTo(padX, padY);
    ctx.lineTo(padX + cornerLen, padY);
    ctx.moveTo(width - padX - cornerLen, height - padY);
    ctx.lineTo(width - padX, height - padY);
    ctx.lineTo(width - padX, height - padY - cornerLen);
    ctx.stroke();

    // Esquina superior derecha e inferior izquierda en Magenta (#FF1E6E)
    ctx.strokeStyle = "#FF1E6E";
    ctx.beginPath();
    ctx.moveTo(width - padX - cornerLen, padY);
    ctx.lineTo(width - padX, padY);
    ctx.lineTo(width - padX, padY + cornerLen);
    ctx.moveTo(padX, height - padY - cornerLen);
    ctx.lineTo(padX, height - padY);
    ctx.lineTo(padX + cornerLen, height - padY);
    ctx.stroke();

    // Cabecera HUD Neón
    const hudY = padY + height * 0.025;
    ctx.fillStyle = "rgba(8, 10, 26, 0.82)";
    fillRoundedRect(
      ctx,
      padX + width * 0.03,
      hudY,
      width - (padX + width * 0.03) * 2,
      height * 0.042,
      height * 0.021
    );
    ctx.strokeStyle = "#00F0FF";
    ctx.lineWidth = Math.max(1.2, width * 0.0022);
    strokeRoundedRect(
      ctx,
      padX + width * 0.03,
      hudY,
      width - (padX + width * 0.03) * 2,
      height * 0.042,
      height * 0.021
    );

    ctx.fillStyle = "#00F0FF";
    ctx.font = `900 ${Math.round(width * 0.025)}px 'Segoe UI', sans-serif`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(
      `⚡ ${cleanTag}`,
      padX + width * 0.065,
      hudY + height * 0.021,
      width * 0.55
    );

    ctx.fillStyle = "#FF1E6E";
    ctx.textAlign = "right";
    ctx.fillText(
      `TRACK ${String(currentIndex + 1).padStart(2, "0")}/${String(
        count
      ).padStart(2, "0")}`,
      width - padX - width * 0.065,
      hudY + height * 0.021
    );

    // Ecualizador de barras de audio animadas en la zona inferior
    const eqBars = 28;
    const eqAreaW = width * 0.78;
    const eqStartX = (width - eqAreaW) / 2;
    const eqBaseY = height * 0.76;
    const maxBarH = height * 0.065;
    const barGap = width * 0.008;
    const barW = (eqAreaW - barGap * (eqBars - 1)) / eqBars;

    for (let b = 0; b < eqBars; b++) {
      const wave =
        0.22 +
        0.45 * Math.abs(Math.sin(timeSec * 6.5 + b * 0.45)) +
        0.33 * Math.abs(Math.cos(timeSec * 4.2 - b * 0.3));
      const bh = Math.max(6, maxBarH * Math.min(1, wave));
      const bx = eqStartX + b * (barW + barGap);
      const by = eqBaseY - bh;

      const bGrad = ctx.createLinearGradient(bx, by, bx, eqBaseY);
      bGrad.addColorStop(0, "#00F0FF");
      bGrad.addColorStop(0.5, "#8A4FFF");
      bGrad.addColorStop(1, "#FF1E6E");
      ctx.fillStyle = bGrad;
      fillRoundedRect(ctx, bx, by, barW, bh, barW / 2);
    }

    // Título Principal con brillo neón debajo del ecualizador
    ctx.fillStyle = "#FFFFFF";
    ctx.font = `900 ${Math.round(width * 0.056)}px 'Segoe UI', sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(
      cleanMain.toUpperCase(),
      width / 2,
      height * 0.785,
      width * 0.82
    );

    if (cleanSub) {
      ctx.fillStyle = "#00F0FF";
      ctx.font = `800 ${Math.round(width * 0.03)}px 'Segoe UI', sans-serif`;
      ctx.fillText(cleanSub, width / 2, height * 0.855, width * 0.8);
    }

    ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
    ctx.font = `700 ${Math.round(width * 0.021)}px 'Segoe UI', sans-serif`;
    ctx.fillText(
      "⚡ RECUERDALO.COM.MX · NEON CLUB REEL",
      width / 2,
      height * 0.905
    );
  }
  // ===========================================================================
  // DISEÑO 6: EDITORIAL GOLD (VENTANA EN ARCO DE GALA & PORTADA DE REVISTA)
  // ===========================================================================
  else if (designId === "vogue-luxe") {
    const cleanMain = String(mainText || "Mi Evento").trim();
    const cleanSub = String(subText || "").trim();
    const cleanTag = String(tagText || "EDICIÓN DE GALA").toUpperCase();

    // 1. Paspartú Editorial de Lujo (Marfil / Champán Oscuro y Dorado)
    const luxeBg = ctx.createLinearGradient(0, 0, width, height);
    luxeBg.addColorStop(0, "#171411");
    luxeBg.addColorStop(0.5, "#231E18");
    luxeBg.addColorStop(1, "#120F0C");
    ctx.fillStyle = luxeBg;
    ctx.fillRect(0, 0, width, height);

    // Doble marco perimetral en hilo de oro (#D4AF37)
    const outerPadX = width * 0.048;
    const outerPadY = height * 0.032;
    ctx.strokeStyle = "rgba(212, 175, 55, 0.65)";
    ctx.lineWidth = Math.max(1.5, width * 0.0028);
    ctx.strokeRect(
      outerPadX,
      outerPadY,
      width - outerPadX * 2,
      height - outerPadY * 2
    );

    ctx.strokeStyle = "rgba(212, 175, 55, 0.25)";
    ctx.lineWidth = 1;
    ctx.strokeRect(
      outerPadX + width * 0.014,
      outerPadY + height * 0.008,
      width - (outerPadX + width * 0.014) * 2,
      height - (outerPadY + height * 0.008) * 2
    );

    // 2. Cabecera tipo Masthead de Revista Editorial
    ctx.fillStyle = "#D4AF37";
    ctx.font = `700 ${Math.round(width * 0.024)}px 'Georgia', serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(
      `— ${cleanTag} · N° ${String(currentIndex + 1).padStart(2, "0")}/${String(
        count
      ).padStart(2, "0")} —`,
      width / 2,
      height * 0.058,
      width * 0.82
    );

    // 3. Ventana Central en Arco Clásico (Arch Window) para la Fotografía
    const archW = width * 0.76;
    const archH = height * 0.6;
    const archX = (width - archW) / 2;
    const archY = height * 0.105;
    const archRadius = archW / 2;

    const drawArchClip = () => {
      ctx.beginPath();
      ctx.arc(
        archX + archRadius,
        archY + archRadius,
        archRadius,
        Math.PI,
        0,
        false
      );
      ctx.lineTo(archX + archW, archY + archH);
      ctx.lineTo(archX, archY + archH);
      ctx.closePath();
    };

    ctx.save();
    drawArchClip();
    ctx.clip();

    // Efecto Zoom suave editorial dentro del arco + transición crossfade
    const zoom = 1.03 + slideProgress * 0.09;
    if (slideProgress < 0.2 && count > 1 && prevImg) {
      const t = slideProgress / 0.2;
      drawCoverImageInBox(
        ctx,
        prevImg,
        archX,
        archY,
        archW,
        archH,
        1.12,
        0,
        0,
        0
      );
      ctx.globalAlpha = t;
      drawCoverImageInBox(
        ctx,
        currentImg,
        archX,
        archY,
        archW,
        archH,
        zoom,
        0,
        0,
        0
      );
      ctx.globalAlpha = 1;
    } else {
      drawCoverImageInBox(
        ctx,
        currentImg,
        archX,
        archY,
        archW,
        archH,
        zoom,
        0,
        0,
        0
      );
    }

    // Sombra suave en la base del arco
    const archShadow = ctx.createLinearGradient(
      0,
      archY + archH * 0.72,
      0,
      archY + archH
    );
    archShadow.addColorStop(0, "rgba(18, 15, 12, 0)");
    archShadow.addColorStop(1, "rgba(18, 15, 12, 0.65)");
    ctx.fillStyle = archShadow;
    ctx.fillRect(archX, archY + archH * 0.72, archW, archH * 0.28);
    ctx.restore();

    // Borde dorado alrededor del arco
    ctx.strokeStyle = "#D4AF37";
    ctx.lineWidth = Math.max(2, width * 0.004);
    drawArchClip();
    ctx.stroke();

    // 4. Tipografía de Gala en la Base del Paspartú
    const titleY = archY + archH + height * 0.04;
    ctx.fillStyle = "#FBF7EE";
    ctx.font = `italic 900 ${Math.round(width * 0.056)}px 'Georgia', serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(cleanMain, width / 2, titleY, width * 0.82);

    // Ornamento divisor dorado
    const lineY = titleY + height * 0.064;
    ctx.strokeStyle = "rgba(212, 175, 55, 0.7)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(width * 0.32, lineY);
    ctx.lineTo(width * 0.68, lineY);
    ctx.stroke();

    ctx.fillStyle = "#D4AF37";
    ctx.beginPath();
    ctx.arc(width / 2, lineY, width * 0.008, 0, Math.PI * 2);
    ctx.fill();

    if (cleanSub) {
      ctx.fillStyle = "#E6C770";
      ctx.font = `700 ${Math.round(width * 0.029)}px 'Segoe UI', sans-serif`;
      ctx.fillText(
        cleanSub.toUpperCase(),
        width / 2,
        lineY + height * 0.018,
        width * 0.8
      );
    }

    // Barra de progreso dorada minimalista abajo
    const progW = width * 0.44;
    const progX = (width - progW) / 2;
    const progY = height * 0.915;
    ctx.fillStyle = "rgba(212, 175, 55, 0.22)";
    fillRoundedRect(ctx, progX, progY, progW, 3, 1.5);
    ctx.fillStyle = "#D4AF37";
    fillRoundedRect(
      ctx,
      progX,
      progY,
      progW * ((currentIndex + slideProgress) / count),
      3,
      1.5
    );
  }
  // ===========================================================================
  // DISEÑO 7: VINYL JUKEBOX (DISCO DE VINILO GIRATORIO 33 RPM + CARÁTULA LP)
  // ===========================================================================
  else if (designId === "vinyl-retro") {
    const cleanMain = String(mainText || "Mi Evento").trim();
    const cleanSub = String(subText || "").trim();
    const cleanTag = String(tagText || "RETRO JUKEBOX LP").toUpperCase();
    const timeSec = elapsedMs / 1000;
    const nextIdx = (currentIndex + 1) % count;
    const nextImg = images[nextIdx] || currentImg;

    // 1. Fondo atmosférico con foto desenfocada y tinte cálido magenta/ámbar
    ctx.save();
    ctx.filter = "blur(26px) brightness(0.32) saturate(1.4)";
    drawCoverImageWithTransform(ctx, currentImg, width, height, 1.18, 0, 0);
    ctx.restore();

    const jukeGrad = ctx.createLinearGradient(0, 0, width, height);
    jukeGrad.addColorStop(0, "rgba(28, 12, 36, 0.78)");
    jukeGrad.addColorStop(0.5, "rgba(18, 14, 28, 0.68)");
    jukeGrad.addColorStop(1, "rgba(12, 10, 20, 0.92)");
    ctx.fillStyle = jukeGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Cabecera tipo Jukebox Tracklist
    ctx.fillStyle = "#F472B6";
    ctx.font = `800 ${Math.round(width * 0.025)}px 'Courier New', monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(
      `💿 ${cleanTag} · SIDE A · TRACK ${String(currentIndex + 1).padStart(
        2,
        "0"
      )}/${String(count).padStart(2, "0")}`,
      width / 2,
      height * 0.048,
      width * 0.88
    );

    // 3. Disco de Vinilo LP Giratorio en la parte superior/central
    const discCx = width * 0.56;
    const discCy = height * 0.255;
    const discR = width * 0.26;
    const rotAngle = timeSec * 1.85;

    ctx.save();
    ctx.translate(discCx, discCy);
    ctx.rotate(rotAngle);

    // Cuerpo negro del vinilo
    const vinylGrad = ctx.createRadialGradient(0, 0, discR * 0.1, 0, 0, discR);
    vinylGrad.addColorStop(0, "#1F2430");
    vinylGrad.addColorStop(0.45, "#0B0D13");
    vinylGrad.addColorStop(0.85, "#191D28");
    vinylGrad.addColorStop(1, "#07080C");
    ctx.fillStyle = vinylGrad;
    ctx.beginPath();
    ctx.arc(0, 0, discR, 0, Math.PI * 2);
    ctx.fill();

    // Surcos concéntricos brillantes del LP
    for (let r = discR * 0.42; r < discR * 0.94; r += discR * 0.055) {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Reflejo cónico satinado sobre el vinilo
    ctx.fillStyle = "rgba(244, 114, 182, 0.12)";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, discR, -0.35, 0.35);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, discR, Math.PI - 0.35, Math.PI + 0.35);
    ctx.closePath();
    ctx.fill();

    // Etiqueta central circular con la foto siguiente/actual girando
    const labelR = discR * 0.36;
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, labelR, 0, Math.PI * 2);
    ctx.clip();
    drawCoverImageInBox(
      ctx,
      nextImg,
      -labelR,
      -labelR,
      labelR * 2,
      labelR * 2,
      1.1,
      0,
      0,
      0
    );
    ctx.restore();

    ctx.strokeStyle = "#F472B6";
    ctx.lineWidth = Math.max(2, width * 0.004);
    ctx.beginPath();
    ctx.arc(0, 0, labelR, 0, Math.PI * 2);
    ctx.stroke();

    // Perforación central del tocadiscos
    ctx.fillStyle = "#0F111A";
    ctx.beginPath();
    ctx.arc(0, 0, discR * 0.055, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Brazo fonocaptor (Tonearm) estilizado a la derecha
    ctx.save();
    ctx.strokeStyle = "rgba(226, 232, 240, 0.78)";
    ctx.lineWidth = Math.max(3, width * 0.006);
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(width * 0.86, height * 0.12);
    ctx.quadraticCurveTo(
      width * 0.84,
      height * 0.24,
      discCx + discR * 0.58,
      discCy + discR * 0.22
    );
    ctx.stroke();
    ctx.fillStyle = "#F472B6";
    ctx.beginPath();
    ctx.arc(width * 0.86, height * 0.12, width * 0.018, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 4. Carátula Principal del Álbum (Sleeve) con la foto activa
    const sleeveW = width * 0.76;
    const sleeveH = height * 0.44;
    const sleeveX = width * 0.08;
    const sleeveY = height * 0.33;
    const zoom = 1.03 + slideProgress * 0.09;

    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.72)";
    ctx.shadowBlur = 32;
    ctx.shadowOffsetY = 14;
    ctx.fillStyle = "#181C26";
    fillRoundedRect(
      ctx,
      sleeveX - 6,
      sleeveY - 6,
      sleeveW + 12,
      sleeveH + 12,
      width * 0.04
    );
    ctx.restore();

    drawCoverImageInBox(
      ctx,
      currentImg,
      sleeveX,
      sleeveY,
      sleeveW,
      sleeveH,
      zoom,
      (slideProgress - 0.5) * 0.03,
      0,
      width * 0.034
    );

    ctx.strokeStyle = "rgba(244, 114, 182, 0.65)";
    ctx.lineWidth = Math.max(2, width * 0.0035);
    strokeRoundedRect(
      ctx,
      sleeveX,
      sleeveY,
      sleeveW,
      sleeveH,
      width * 0.034
    );

    // 5. Panel inferior estilo reproductor Jukebox con barra de progreso
    const cardX = width * 0.08;
    const cardY = height * 0.805;
    const cardW = width * 0.84;
    const cardH = height * 0.125;

    ctx.fillStyle = "rgba(20, 24, 36, 0.86)";
    fillRoundedRect(ctx, cardX, cardY, cardW, cardH, width * 0.035);
    ctx.strokeStyle = "rgba(244, 114, 182, 0.35)";
    ctx.lineWidth = 1.5;
    strokeRoundedRect(ctx, cardX, cardY, cardW, cardH, width * 0.035);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = `900 ${Math.round(width * 0.048)}px 'Segoe UI', sans-serif`;
    ctx.textAlign = "left";
    ctx.fillText(cleanMain, cardX + width * 0.05, cardY + height * 0.022, cardW * 0.88);

    if (cleanSub) {
      ctx.fillStyle = "#F9A8D4";
      ctx.font = `600 ${Math.round(width * 0.028)}px 'Segoe UI', sans-serif`;
      ctx.fillText(
        cleanSub,
        cardX + width * 0.05,
        cardY + height * 0.064,
        cardW * 0.88
      );
    }

    const barX = cardX + width * 0.05;
    const barY = cardY + height * 0.1;
    const barW = cardW - width * 0.1;
    ctx.fillStyle = "rgba(255, 255, 255, 0.16)";
    fillRoundedRect(ctx, barX, barY, barW, 4, 2);
    const fillGrad = ctx.createLinearGradient(barX, barY, barX + barW, barY);
    fillGrad.addColorStop(0, "#38BDF8");
    fillGrad.addColorStop(0.5, "#818CF8");
    fillGrad.addColorStop(1, "#F472B6");
    ctx.fillStyle = fillGrad;
    fillRoundedRect(
      ctx,
      barX,
      barY,
      barW * ((currentIndex + slideProgress) / count),
      4,
      2
    );
  }
  // ===========================================================================
  // DISEÑO 8: SCRAPBOOK PAPER (BITÁCORA EDITORIAL EN PAPEL CREMA + SELLO POSTAL)
  // ===========================================================================
  else if (designId === "scrapbook-journal") {
    const cleanMain = String(mainText || "Mi Evento").trim();
    const cleanSub = String(subText || "").trim();
    const cleanTag = String(tagText || "MEMORIA ESPECIAL").toUpperCase();
    const nextImg = images[(currentIndex + 1) % count] || currentImg;

    // 1. Fondo papel artesanal crema/arena con retícula punteada editorial
    const paperGrad = ctx.createLinearGradient(0, 0, width, height);
    paperGrad.addColorStop(0, "#F6F0E4");
    paperGrad.addColorStop(0.5, "#EFE6D5");
    paperGrad.addColorStop(1, "#E5D9C3");
    ctx.fillStyle = paperGrad;
    ctx.fillRect(0, 0, width, height);

    // Retícula sutil tipo cuaderno de bitácora
    ctx.fillStyle = "rgba(140, 118, 92, 0.18)";
    const step = Math.max(18, Math.round(width * 0.045));
    for (let gx = step; gx < width; gx += step) {
      for (let gy = step; gy < height; gy += step) {
        ctx.fillRect(gx, gy, 2, 2);
      }
    }

    // 2. Sello postal decorativo en la esquina superior derecha
    const stampW = width * 0.22;
    const stampH = height * 0.075;
    const stampX = width * 0.71;
    const stampY = height * 0.05;
    ctx.strokeStyle = "#C86D51";
    ctx.lineWidth = 2;
    ctx.strokeRect(stampX, stampY, stampW, stampH);
    ctx.fillStyle = "#C86D51";
    ctx.font = `800 ${Math.round(width * 0.022)}px 'Courier New', monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("POSTAL", stampX + stampW / 2, stampY + stampH * 0.38);
    ctx.fillText(
      `#${String(currentIndex + 1).padStart(2, "0")}`,
      stampX + stampW / 2,
      stampY + stampH * 0.68
    );

    // Etiqueta editorial superior izquierda
    ctx.fillStyle = "#5C4938";
    ctx.font = `700 ${Math.round(width * 0.026)}px 'Georgia', serif`;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(cleanTag, width * 0.07, height * 0.062, width * 0.6);

    // 3. Fotografía principal montada sobre cartulina blanca inclinada con esquineros
    const frameW = width * 0.78;
    const frameH = height * 0.52;
    const zoom = 1.03 + slideProgress * 0.08;
    const tilt = (currentIndex % 2 === 0 ? -1 : 1) * 0.025;

    ctx.save();
    ctx.translate(width * 0.48, height * 0.4);
    ctx.rotate(tilt);

    ctx.save();
    ctx.shadowColor = "rgba(62, 45, 28, 0.28)";
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 10;
    ctx.fillStyle = "#FFFDF9";
    ctx.fillRect(-frameW / 2 - 14, -frameH / 2 - 14, frameW + 28, frameH + 46);
    ctx.restore();

    drawCoverImageInBox(
      ctx,
      currentImg,
      -frameW / 2,
      -frameH / 2,
      frameW,
      frameH,
      zoom,
      0,
      0,
      4
    );

    // Esquineros clásicos color bronce/terracota
    const cLen = width * 0.045;
    ctx.strokeStyle = "#B5654D";
    ctx.lineWidth = Math.max(3, width * 0.006);
    // Sup-Izq
    ctx.beginPath();
    ctx.moveTo(-frameW / 2 - 4, -frameH / 2 + cLen);
    ctx.lineTo(-frameW / 2 - 4, -frameH / 2 - 4);
    ctx.lineTo(-frameW / 2 + cLen, -frameH / 2 - 4);
    ctx.stroke();
    // Sup-Der
    ctx.beginPath();
    ctx.moveTo(frameW / 2 - cLen, -frameH / 2 - 4);
    ctx.lineTo(frameW / 2 + 4, -frameH / 2 - 4);
    ctx.lineTo(frameW / 2 + 4, -frameH / 2 + cLen);
    ctx.stroke();
    // Inf-Izq
    ctx.beginPath();
    ctx.moveTo(-frameW / 2 - 4, frameH / 2 - cLen);
    ctx.lineTo(-frameW / 2 - 4, frameH / 2 + 4);
    ctx.lineTo(-frameW / 2 + cLen, frameH / 2 + 4);
    ctx.stroke();
    // Inf-Der
    ctx.beginPath();
    ctx.moveTo(frameW / 2 - cLen, frameH / 2 + 4);
    ctx.lineTo(frameW / 2 + 4, frameH / 2 + 4);
    ctx.lineTo(frameW / 2 + 4, frameH / 2 - cLen);
    ctx.stroke();
    ctx.restore();

    // 4. Mini-recuerdo superpuesto abajo a la derecha (siguiente foto)
    if (count > 1) {
      const miniW = width * 0.28;
      const miniH = height * 0.16;
      ctx.save();
      ctx.translate(width * 0.76, height * 0.67);
      ctx.rotate(0.08);
      ctx.fillStyle = "#FFFDF9";
      ctx.shadowColor = "rgba(62, 45, 28, 0.25)";
      ctx.shadowBlur = 14;
      ctx.fillRect(-miniW / 2 - 6, -miniH / 2 - 6, miniW + 12, miniH + 18);
      drawCoverImageInBox(
        ctx,
        nextImg,
        -miniW / 2,
        -miniH / 2,
        miniW,
        miniH,
        1.05,
        0,
        0,
        2
      );
      ctx.restore();
    }

    // 5. Tarjeta de nota editorial en la base
    const noteX = width * 0.07;
    const noteY = height * 0.77;
    const noteW = width * 0.86;
    const noteH = height * 0.14;
    ctx.fillStyle = "rgba(255, 253, 248, 0.94)";
    fillRoundedRect(ctx, noteX, noteY, noteW, noteH, width * 0.025);
    ctx.strokeStyle = "rgba(181, 101, 77, 0.45)";
    ctx.lineWidth = 1.5;
    strokeRoundedRect(ctx, noteX, noteY, noteW, noteH, width * 0.025);

    ctx.fillStyle = "#2E241D";
    ctx.font = `italic 900 ${Math.round(width * 0.052)}px 'Georgia', serif`;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(cleanMain, noteX + width * 0.045, noteY + height * 0.024, noteW * 0.9);

    if (cleanSub) {
      ctx.fillStyle = "#9C523B";
      ctx.font = `700 ${Math.round(width * 0.028)}px 'Segoe UI', sans-serif`;
      ctx.fillText(
        cleanSub.toUpperCase(),
        noteX + width * 0.045,
        noteY + height * 0.082,
        noteW * 0.9
      );
    }
  }
  // ===========================================================================
  // DISEÑO 10: VHS CAMCORDER 90s (VISOR HANDYCAM RETRO + SCANLINES + OSD HUD)
  // ===========================================================================
  else if (designId === "vhs-camcorder") {
    const cleanMain = String(mainText || "Mi Evento").trim();
    const cleanSub = String(subText || "").trim();
    const timeSec = elapsedMs / 1000;

    // 1. Imagen a pantalla completa con zoom lento tipo lente de videocámara
    const zoom = 1.04 + slideProgress * 0.11;
    const jitterY = Math.sin(timeSec * 28) * 0.002;
    drawCoverImageWithTransform(
      ctx,
      currentImg,
      width,
      height,
      zoom,
      (slideProgress - 0.5) * 0.025,
      jitterY
    );

    // Tinte nostálgico VHS 90s
    ctx.fillStyle = "rgba(24, 16, 42, 0.24)";
    ctx.fillRect(0, 0, width, height);

    // 2. Líneas de escaneo horizontales (Scanlines CRT)
    ctx.fillStyle = "rgba(0, 0, 0, 0.16)";
    for (let sy = 0; sy < height; sy += 6) {
      ctx.fillRect(0, sy, width, 2);
    }

    // Banda de tracking VHS sutil que recorre la pantalla
    const trackY = ((timeSec * 0.22) % 1) * height;
    const trackGrad = ctx.createLinearGradient(
      0,
      trackY - 18,
      0,
      trackY + 18
    );
    trackGrad.addColorStop(0, "rgba(255,255,255,0)");
    trackGrad.addColorStop(0.5, "rgba(255,255,255,0.12)");
    trackGrad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = trackGrad;
    ctx.fillRect(0, trackY - 18, width, 36);

    // 3. Esquinas del visor de cámara (Viewfinder Brackets) + Cruz central
    const padX = width * 0.065;
    const padY = height * 0.05;
    const bLen = width * 0.075;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
    ctx.lineWidth = Math.max(2, width * 0.004);

    // 4 esquinas del encuadre
    ctx.beginPath();
    ctx.moveTo(padX, padY + bLen);
    ctx.lineTo(padX, padY);
    ctx.lineTo(padX + bLen, padY);
    ctx.moveTo(width - padX - bLen, padY);
    ctx.lineTo(width - padX, padY);
    ctx.lineTo(width - padX, padY + bLen);
    ctx.moveTo(padX, height - padY - bLen);
    ctx.lineTo(padX, height - padY);
    ctx.lineTo(padX + bLen, height - padY);
    ctx.moveTo(width - padX - bLen, height - padY);
    ctx.lineTo(width - padX, height - padY);
    ctx.lineTo(width - padX, height - padY - bLen);
    ctx.stroke();

    // Mira central (+)
    const chSize = width * 0.025;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(width / 2 - chSize, height / 2);
    ctx.lineTo(width / 2 + chSize, height / 2);
    ctx.moveTo(width / 2, height / 2 - chSize);
    ctx.lineTo(width / 2, height / 2 + chSize);
    ctx.stroke();

    // 4. HUD OSD Superior: ● REC parpadeante + PLAY ▶ SP + Batería
    const blinkOn = Math.floor(timeSec * 2) % 2 === 0;
    const hudX = padX + width * 0.03;
    const hudY = padY + height * 0.025;

    if (blinkOn) {
      ctx.fillStyle = "#EF4444";
      ctx.beginPath();
      ctx.arc(hudX + width * 0.018, hudY + height * 0.012, width * 0.016, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "#FFFFFF";
    ctx.font = `900 ${Math.round(width * 0.036)}px 'Courier New', monospace`;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.shadowColor = "rgba(0,0,0,0.85)";
    ctx.shadowBlur = 4;
    ctx.fillText("REC", hudX + width * 0.048, hudY);

    ctx.textAlign = "right";
    ctx.fillText(
      `SP · CAM ${String(currentIndex + 1).padStart(2, "0")}/${String(
        count
      ).padStart(2, "0")}`,
      width - hudX,
      hudY
    );

    // 5. Texto OSD Inferior estilo cinta VHS con código de tiempo en vivo
    const mins = String(Math.floor(timeSec / 60)).padStart(2, "0");
    const secs = String(Math.floor(timeSec % 60)).padStart(2, "0");
    const frames = String(Math.floor((timeSec % 1) * 30)).padStart(2, "0");

    const bottomGrad = ctx.createLinearGradient(0, height * 0.68, 0, height);
    bottomGrad.addColorStop(0, "rgba(0,0,0,0)");
    bottomGrad.addColorStop(1, "rgba(0,0,0,0.82)");
    ctx.fillStyle = bottomGrad;
    ctx.fillRect(0, height * 0.68, width, height * 0.32);

    ctx.textAlign = "left";
    ctx.fillStyle = "#FACC15";
    ctx.font = `800 ${Math.round(width * 0.032)}px 'Courier New', monospace`;
    ctx.fillText(
      `PLAY ▶ 00:${mins}:${secs}:${frames}`,
      hudX,
      height * 0.78
    );

    ctx.fillStyle = "#FFFFFF";
    ctx.font = `900 ${Math.round(width * 0.05)}px 'Courier New', monospace`;
    ctx.fillText(cleanMain.toUpperCase(), hudX, height * 0.825, width * 0.8);

    if (cleanSub) {
      ctx.fillStyle = "#E2E8F0";
      ctx.font = `700 ${Math.round(width * 0.028)}px 'Courier New', monospace`;
      ctx.fillText(cleanSub.toUpperCase(), hudX, height * 0.875, width * 0.8);
    }
    ctx.shadowBlur = 0;
  }
  // ===========================================================================
  // DISEÑO 11: AURORA GLASS UI (TARJETA CRISTAL ESMERILADO + ONDAS BOREALES)
  // ===========================================================================
  else if (designId === "aurora-glass") {
    const cleanMain = String(mainText || "Mi Evento").trim();
    const cleanSub = String(subText || "").trim();
    const cleanTag = String(tagText || "SMART GLASS EDITION").toUpperCase();
    const timeSec = elapsedMs / 1000;
    const nextImg = images[(currentIndex + 1) % count] || currentImg;

    // 1. Fondo Slate profundo con ondas boreales animadas (#38BDF8, #818CF8, #F472B6)
    const baseGrad = ctx.createLinearGradient(0, 0, width, height);
    baseGrad.addColorStop(0, "#0F141E");
    baseGrad.addColorStop(0.5, "#151B28");
    baseGrad.addColorStop(1, "#10131C");
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, width, height);

    const blobs = [
      {
        x: width * (0.25 + 0.1 * Math.sin(timeSec * 0.8)),
        y: height * 0.2,
        r: width * 0.45,
        c: "rgba(56, 189, 248, 0.26)",
      },
      {
        x: width * (0.78 - 0.1 * Math.cos(timeSec * 0.7)),
        y: height * 0.48,
        r: width * 0.48,
        c: "rgba(129, 140, 248, 0.24)",
      },
      {
        x: width * 0.35,
        y: height * (0.78 + 0.05 * Math.sin(timeSec * 0.9)),
        r: width * 0.45,
        c: "rgba(244, 114, 182, 0.22)",
      },
    ];
    blobs.forEach((b) => {
      const rg = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
      rg.addColorStop(0, b.c);
      rg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = rg;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
    });

    // 2. Píldora superior segmentada estilo Smart Home
    const pillW = width * 0.66;
    const pillH = height * 0.036;
    const pillX = (width - pillW) / 2;
    const pillY = height * 0.048;
    ctx.fillStyle = "rgba(14, 17, 23, 0.78)";
    fillRoundedRect(ctx, pillX, pillY, pillW, pillH, pillH / 2);
    ctx.strokeStyle = "rgba(86, 180, 252, 0.38)";
    ctx.lineWidth = 1.2;
    strokeRoundedRect(ctx, pillX, pillY, pillW, pillH, pillH / 2);

    ctx.fillStyle = "#7DD3FC";
    ctx.font = `700 ${Math.round(width * 0.023)}px 'Segoe UI', sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      `🌌 ${cleanTag} · ${currentIndex + 1}/${count}`,
      width / 2,
      pillY + pillH / 2
    );

    // 3. Ventana Principal Frosted Glass con la foto activa
    const cardX = width * 0.07;
    const cardY = height * 0.105;
    const cardW = width * 0.86;
    const cardH = height * 0.56;
    const zoom = 1.04 + slideProgress * 0.09;

    ctx.fillStyle = "rgba(28, 34, 48, 0.78)";
    fillRoundedRect(ctx, cardX, cardY, cardW, cardH, width * 0.055);
    ctx.strokeStyle = "rgba(86, 180, 252, 0.45)";
    ctx.lineWidth = Math.max(1.5, width * 0.003);
    strokeRoundedRect(ctx, cardX, cardY, cardW, cardH, width * 0.055);

    const imgPad = width * 0.028;
    drawCoverImageInBox(
      ctx,
      currentImg,
      cardX + imgPad,
      cardY + imgPad,
      cardW - imgPad * 2,
      cardH - imgPad * 2,
      zoom,
      (slideProgress - 0.5) * 0.03,
      0,
      width * 0.04
    );

    // 4. Dos tarjetas inferiores estilo Widgets (Anillo de Progreso + Título / Miniatura)
    const botY = height * 0.69;
    const botH = height * 0.22;
    const leftW = width * 0.34;
    const rightW = width * 0.49;

    // Widget Izquierdo: Anillo luminoso cyan-indigo-rose con porcentaje del Reel
    ctx.fillStyle = "rgba(27, 33, 45, 0.88)";
    fillRoundedRect(ctx, cardX, botY, leftW, botH, width * 0.045);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
    ctx.lineWidth = 1.2;
    strokeRoundedRect(ctx, cardX, botY, leftW, botH, width * 0.045);

    const ringCx = cardX + leftW / 2;
    const ringCy = botY + botH * 0.5;
    const ringR = leftW * 0.32;
    const totalPct = (currentIndex + slideProgress) / count;

    ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
    ctx.lineWidth = Math.max(6, width * 0.014);
    ctx.beginPath();
    ctx.arc(ringCx, ringCy, ringR, 0, Math.PI * 2);
    ctx.stroke();

    const ringGrad = ctx.createLinearGradient(
      ringCx - ringR,
      ringCy - ringR,
      ringCx + ringR,
      ringCy + ringR
    );
    ringGrad.addColorStop(0, "#38BDF8");
    ringGrad.addColorStop(0.5, "#818CF8");
    ringGrad.addColorStop(1, "#F472B6");
    ctx.strokeStyle = ringGrad;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(
      ringCx,
      ringCy,
      ringR,
      -Math.PI / 2,
      -Math.PI / 2 + Math.PI * 2 * totalPct
    );
    ctx.stroke();

    ctx.fillStyle = "#FFFFFF";
    ctx.font = `800 ${Math.round(width * 0.04)}px 'Segoe UI', sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${Math.round(totalPct * 100)}%`, ringCx, ringCy);

    // Widget Derecho: Información del evento + Miniatura siguiente
    const rightX = cardX + leftW + width * 0.03;
    ctx.fillStyle = "rgba(33, 44, 62, 0.9)";
    fillRoundedRect(ctx, rightX, botY, rightW, botH, width * 0.045);
    ctx.strokeStyle = "rgba(86, 180, 252, 0.45)";
    ctx.lineWidth = 1.5;
    strokeRoundedRect(ctx, rightX, botY, rightW, botH, width * 0.045);

    ctx.fillStyle = "#34D399";
    ctx.font = `700 ${Math.round(width * 0.022)}px 'Segoe UI', sans-serif`;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(
      "● LIVE MEMORY",
      rightX + width * 0.035,
      botY + height * 0.022
    );

    ctx.fillStyle = "#FFFFFF";
    ctx.font = `800 ${Math.round(width * 0.038)}px 'Segoe UI', sans-serif`;
    ctx.fillText(
      cleanMain,
      rightX + width * 0.035,
      botY + height * 0.055,
      rightW * 0.86
    );

    if (cleanSub) {
      ctx.fillStyle = "#94A3B8";
      ctx.font = `600 ${Math.round(width * 0.025)}px 'Segoe UI', sans-serif`;
      ctx.fillText(
        cleanSub,
        rightX + width * 0.035,
        botY + height * 0.1,
        rightW * 0.86
      );
    }

    // Miniatura viva en la esquina inferior derecha del widget
    const thumbW = rightW * 0.42;
    const thumbH = botH * 0.28;
    drawCoverImageInBox(
      ctx,
      nextImg,
      rightX + rightW - thumbW - width * 0.03,
      botY + botH - thumbH - height * 0.018,
      thumbW,
      thumbH,
      1.05,
      0,
      0,
      width * 0.02
    );
  }
  // ===========================================================================
  // DISEÑO 12: CARRUSEL 3D (ESCENARIO COVERFLOW CON PANELES LATERALES Y REFLEJO)
  // ===========================================================================
  else if (designId === "mosaic-carousel") {
    const cleanMain = String(mainText || "Mi Evento").trim();
    const cleanSub = String(subText || "").trim();
    const cleanTag = String(tagText || "CARRUSEL 3D").toUpperCase();
    const nextImg = images[(currentIndex + 1) % count] || currentImg;
    const prevImgSide = images[prevIndex] || currentImg;

    // 1. Escenario oscuro con foco cenital esmeralda/azul
    const stageGrad = ctx.createLinearGradient(0, 0, 0, height);
    stageGrad.addColorStop(0, "#0A0F18");
    stageGrad.addColorStop(0.55, "#131C2B");
    stageGrad.addColorStop(1, "#070A10");
    ctx.fillStyle = stageGrad;
    ctx.fillRect(0, 0, width, height);

    const spotGrad = ctx.createRadialGradient(
      width * 0.5,
      height * 0.38,
      0,
      width * 0.5,
      height * 0.38,
      width * 0.65
    );
    spotGrad.addColorStop(0, "rgba(52, 211, 153, 0.22)");
    spotGrad.addColorStop(0.6, "rgba(56, 189, 248, 0.10)");
    spotGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = spotGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Marquesina superior
    ctx.fillStyle = "#34D399";
    ctx.font = `800 ${Math.round(width * 0.025)}px 'Segoe UI', sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(
      `🎠 ${cleanTag} · ESCENA ${currentIndex + 1} DE ${count}`,
      width / 2,
      height * 0.055
    );

    // 3. Paneles laterales (Izquierdo = anterior, Derecho = siguiente) en segundo plano
    const sideW = width * 0.44;
    const sideH = height * 0.4;
    const sideY = height * 0.2;

    // Panel Izquierdo
    ctx.save();
    ctx.globalAlpha = 0.42;
    drawCoverImageInBox(
      ctx,
      prevImgSide,
      -width * 0.06,
      sideY,
      sideW,
      sideH,
      1.08,
      0,
      0,
      width * 0.035
    );
    ctx.restore();

    // Panel Derecho
    ctx.save();
    ctx.globalAlpha = 0.42;
    drawCoverImageInBox(
      ctx,
      nextImg,
      width * 0.62,
      sideY,
      sideW,
      sideH,
      1.08,
      0,
      0,
      width * 0.035
    );
    ctx.restore();

    // 4. Panel Central Protagonista + Reflejo de piso debajo
    const mainW = width * 0.68;
    const mainH = height * 0.48;
    const mainX = (width - mainW) / 2;
    const mainY = height * 0.155;
    const zoom = 1.03 + slideProgress * 0.09;

    // Reflejo invertido en el piso del escenario
    ctx.save();
    ctx.globalAlpha = 0.22;
    drawCoverImageInBox(
      ctx,
      currentImg,
      mainX + width * 0.02,
      mainY + mainH + height * 0.012,
      mainW - width * 0.04,
      height * 0.12,
      zoom,
      0,
      0.25,
      width * 0.03
    );
    const floorFade = ctx.createLinearGradient(
      0,
      mainY + mainH,
      0,
      mainY + mainH + height * 0.14
    );
    floorFade.addColorStop(0, "rgba(10, 15, 24, 0.2)");
    floorFade.addColorStop(1, "rgba(7, 10, 16, 1)");
    ctx.globalAlpha = 1;
    ctx.fillStyle = floorFade;
    ctx.fillRect(mainX, mainY + mainH, mainW, height * 0.14);
    ctx.restore();

    // Sombra y marco de la tarjeta central
    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.78)";
    ctx.shadowBlur = 35;
    ctx.shadowOffsetY = 16;
    ctx.fillStyle = "#111827";
    fillRoundedRect(ctx, mainX, mainY, mainW, mainH, width * 0.045);
    ctx.restore();

    drawCoverImageInBox(
      ctx,
      currentImg,
      mainX,
      mainY,
      mainW,
      mainH,
      zoom,
      (slideProgress - 0.5) * 0.03,
      0,
      width * 0.045
    );

    ctx.strokeStyle = "rgba(52, 211, 153, 0.7)";
    ctx.lineWidth = Math.max(2, width * 0.004);
    strokeRoundedRect(ctx, mainX, mainY, mainW, mainH, width * 0.045);

    // 5. Indicadores de puntos de carrusel (Dots) y Título inferior
    const dotsY = height * 0.74;
    const maxDots = Math.min(count, 8);
    const dotGap = width * 0.032;
    const startDotX = width / 2 - ((maxDots - 1) * dotGap) / 2;
    for (let d = 0; d < maxDots; d++) {
      const isCur = d === currentIndex % maxDots;
      ctx.fillStyle = isCur ? "#34D399" : "rgba(255, 255, 255, 0.25)";
      fillRoundedRect(
        ctx,
        startDotX + d * dotGap - (isCur ? 8 : 4),
        dotsY,
        isCur ? 16 : 8,
        8,
        4
      );
    }

    ctx.fillStyle = "#FFFFFF";
    ctx.font = `900 ${Math.round(width * 0.052)}px 'Segoe UI', sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(cleanMain, width / 2, height * 0.785, width * 0.86);

    if (cleanSub) {
      ctx.fillStyle = "#6EE7B7";
      ctx.font = `600 ${Math.round(width * 0.028)}px 'Segoe UI', sans-serif`;
      ctx.fillText(cleanSub, width / 2, height * 0.848, width * 0.84);
    }
  }
  // ===========================================================================
  // DISEÑO 13: INSTA REELS FRAME (DOBLE CAPA ESPEJO + VENTANA BLANCA + UI REELS)
  // Basado en el video de referencia tr1.mp4
  // ===========================================================================
  else if (designId === "insta-frame") {
    const cleanMain = String(mainText || "Mi Evento").trim();
    const cleanSub = String(
      subText || "#recuerdalo #momentos #evento"
    ).trim();
    const dir = currentIndex % 2 === 0 ? 1 : -1;

    // 1. Capa exterior a pantalla completa (9:16): misma foto con mayor escala y oscurecida
    const outerZoom = 1.14 + slideProgress * 0.07;
    const outerPanX = dir * (0.022 - slideProgress * 0.015);
    const outerPanY = -dir * (0.016 - slideProgress * 0.012);

    const cutWindow = 0.12;
    if (slideProgress < cutWindow && count > 1 && prevImg) {
      const t = slideProgress / cutWindow;
      drawCoverImageWithTransform(
        ctx,
        prevImg,
        width,
        height,
        1.2,
        -dir * 0.015,
        0
      );
      ctx.globalAlpha = t;
      drawCoverImageWithTransform(
        ctx,
        currentImg,
        width,
        height,
        outerZoom,
        outerPanX,
        outerPanY
      );
      ctx.globalAlpha = 1;
    } else {
      drawCoverImageWithTransform(
        ctx,
        currentImg,
        width,
        height,
        outerZoom,
        outerPanX,
        outerPanY
      );
    }

    // Oscurecimiento del marco perimetral exterior (como en el video de referencia)
    ctx.fillStyle = "rgba(8, 10, 15, 0.48)";
    ctx.fillRect(0, 0, width, height);

    // 2. Ventana rectangular central con borde blanco nítido y la foto al 100% de brillo
    const boxX = Math.round(width * 0.155);
    const boxY = Math.round(height * 0.162);
    const boxW = Math.round(width * 0.69);
    const boxH = Math.round(height * 0.676);

    const innerZoom = 1.02 + slideProgress * 0.065;
    const innerPanX = dir * (slideProgress - 0.5) * 0.022;
    const innerPanY = -dir * (slideProgress - 0.5) * 0.015;

    ctx.save();
    ctx.beginPath();
    ctx.rect(boxX, boxY, boxW, boxH);
    ctx.clip();

    if (slideProgress < cutWindow && count > 1 && prevImg) {
      const t = slideProgress / cutWindow;
      drawCoverImageInBox(
        ctx,
        prevImg,
        boxX,
        boxY,
        boxW,
        boxH,
        1.08,
        0,
        0,
        0
      );
      ctx.globalAlpha = t;
      drawCoverImageInBox(
        ctx,
        currentImg,
        boxX,
        boxY,
        boxW,
        boxH,
        innerZoom,
        innerPanX,
        innerPanY,
        0
      );
      ctx.globalAlpha = 1;
    } else {
      drawCoverImageInBox(
        ctx,
        currentImg,
        boxX,
        boxY,
        boxW,
        boxH,
        innerZoom,
        innerPanX,
        innerPanY,
        0
      );
    }

    // Sombra sutil superior e inferior dentro del recuadro para máxima legibilidad del texto blanco e íconos
    const innerTopGrad = ctx.createLinearGradient(
      0,
      boxY,
      0,
      boxY + boxH * 0.18
    );
    innerTopGrad.addColorStop(0, "rgba(0, 0, 0, 0.34)");
    innerTopGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = innerTopGrad;
    ctx.fillRect(boxX, boxY, boxW, boxH * 0.18);

    const innerBotGrad = ctx.createLinearGradient(
      0,
      boxY + boxH * 0.68,
      0,
      boxY + boxH
    );
    innerBotGrad.addColorStop(0, "rgba(0, 0, 0, 0)");
    innerBotGrad.addColorStop(1, "rgba(0, 0, 0, 0.52)");
    ctx.fillStyle = innerBotGrad;
    ctx.fillRect(boxX, boxY + boxH * 0.68, boxW, boxH * 0.32);

    ctx.restore();

    // Marco rectangular blanco nítido
    ctx.strokeStyle = "rgba(255, 255, 255, 0.96)";
    ctx.lineWidth = Math.max(2, width * 0.0038);
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    // 3. Cabecera "Reels" en la esquina superior izquierda dentro del marco blanco
    const padLeft = boxX + width * 0.044;
    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.45)";
    ctx.shadowBlur = 8;
    ctx.fillStyle = "#FFFFFF";
    ctx.font = `800 ${Math.round(width * 0.052)}px 'Inter', 'Segoe UI', sans-serif`;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("Reels", padLeft, boxY + height * 0.022);

    // 4. Textos inferiores izquierdos dentro del marco (@handle / título + #hashtags / subtítulo)
    const handleText = cleanMain.startsWith("@") ? cleanMain : cleanMain;
    ctx.font = `700 ${Math.round(width * 0.033)}px 'Inter', 'Segoe UI', sans-serif`;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(
      handleText,
      padLeft,
      boxY + boxH - height * 0.066,
      boxW * 0.72
    );

    if (cleanSub) {
      ctx.font = `500 ${Math.round(width * 0.026)}px 'Inter', 'Segoe UI', sans-serif`;
      ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
      ctx.fillText(
        cleanSub,
        padLeft,
        boxY + boxH - height * 0.033,
        boxW * 0.72
      );
    }

    // 5. Columna derecha de íconos vectoriales de Instagram Reels (Corazón, Comentario y Avión de papel)
    const iconCx = boxX + boxW - width * 0.068;
    const iconStrokeW = Math.max(2, width * 0.0038);
    ctx.strokeStyle = "#FFFFFF";
    ctx.fillStyle = "#FFFFFF";
    ctx.lineWidth = iconStrokeW;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.textAlign = "center";

    // 5a. Ícono de Corazón (♡) + contador "1134"
    const heartCy = boxY + boxH - height * 0.192;
    const hr = width * 0.022;
    ctx.beginPath();
    ctx.moveTo(iconCx, heartCy + hr * 0.85);
    ctx.bezierCurveTo(
      iconCx - hr * 1.45,
      heartCy + hr * 0.1,
      iconCx - hr * 1.35,
      heartCy - hr * 0.95,
      iconCx - hr * 0.5,
      heartCy - hr * 0.95
    );
    ctx.bezierCurveTo(
      iconCx - hr * 0.1,
      heartCy - hr * 0.95,
      iconCx,
      heartCy - hr * 0.45,
      iconCx,
      heartCy - hr * 0.35
    );
    ctx.bezierCurveTo(
      iconCx,
      heartCy - hr * 0.45,
      iconCx + hr * 0.1,
      heartCy - hr * 0.95,
      iconCx + hr * 0.5,
      heartCy - hr * 0.95
    );
    ctx.bezierCurveTo(
      iconCx + hr * 1.35,
      heartCy - hr * 0.95,
      iconCx + hr * 1.45,
      heartCy + hr * 0.1,
      iconCx,
      heartCy + hr * 0.85
    );
    ctx.closePath();
    ctx.stroke();

    ctx.font = `600 ${Math.round(width * 0.025)}px 'Inter', 'Segoe UI', sans-serif`;
    ctx.fillText("1134", iconCx, heartCy + height * 0.021);

    // 5b. Ícono de Burbuja de Comentario (💬) + contador "321"
    const commCy = boxY + boxH - height * 0.103;
    const cr = width * 0.021;
    ctx.beginPath();
    ctx.arc(iconCx, commCy, cr, 0.35 * Math.PI, 1.92 * Math.PI, false);
    ctx.lineTo(iconCx + cr * 1.05, commCy + cr * 0.95);
    ctx.closePath();
    ctx.stroke();

    ctx.fillText("321", iconCx, commCy + height * 0.021);

    // 5c. Ícono de Compartir / Avión de papel (Instagram Direct)
    const shareCy = boxY + boxH - height * 0.029;
    const sr = width * 0.022;
    ctx.beginPath();
    ctx.moveTo(iconCx - sr, shareCy - sr * 0.72);
    ctx.lineTo(iconCx + sr, shareCy - sr * 0.72);
    ctx.lineTo(iconCx - sr * 0.08, shareCy + sr * 0.95);
    ctx.lineTo(iconCx - sr * 0.32, shareCy + sr * 0.05);
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(iconCx + sr, shareCy - sr * 0.72);
    ctx.lineTo(iconCx - sr * 0.32, shareCy + sr * 0.05);
    ctx.stroke();

    ctx.restore();
  }
  // ===========================================================================
  // DISEÑO 13: PULSO CREATIVO (3 FRANJAS HORIZONTALES A SANGRE + PULSO ESCALONADO)
  // Basado en el video de referencia tr2.mp4
  // ===========================================================================
  else if (designId === "pulso-creativo") {
    const cleanMain = String(mainText || "Mi Evento").trim();
    const cleanSub = String(subText || "").trim();

    // 1. Tres franjas horizontales a sangre completa (0 márgenes, 1/3 de altura cada una)
    const bandH = height / 3;
    const bands = [
      { idx: 0, y: 0, h: Math.ceil(bandH), phaseOffset: 0 },
      { idx: 1, y: Math.floor(bandH), h: Math.ceil(bandH), phaseOffset: 0.333 },
      {
        idx: 2,
        y: Math.floor(bandH * 2),
        h: height - Math.floor(bandH * 2),
        phaseOffset: 0.666,
      },
    ];

    bands.forEach((band) => {
      // Cada franja cambia en un pulso escalonado (1/3 de desfase entre superior, central e inferior)
      const staggeredMs = elapsedMs + band.phaseOffset * safeDuration;
      const bandLoopMs =
        ((staggeredMs % totalCycleMs) + totalCycleMs) % totalCycleMs;
      const bandStep = Math.floor(bandLoopMs / safeDuration);
      const bandProgress =
        (bandLoopMs - bandStep * safeDuration) / safeDuration; // 0..1

      const imgIdx = (bandStep + band.idx) % count;
      const prevBandIdx = (imgIdx - 1 + count) % count;
      const bandImg = images[imgIdx] || currentImg;
      const prevBandImg = images[prevBandIdx] || bandImg;

      // Zoom que entra con pulso suave (1.10 -> 1.03) y paneo sutil alternado
      const dir = (bandStep + band.idx) % 2 === 0 ? 1 : -1;
      const zoom = 1.1 - bandProgress * 0.07;
      const panX = dir * (bandProgress - 0.5) * 0.028;
      const panY = -dir * (bandProgress - 0.5) * 0.018;

      const cutWindow = 0.1;
      if (bandProgress < cutWindow && count > 1 && prevBandImg) {
        const t = bandProgress / cutWindow;
        drawCoverImageInBox(
          ctx,
          prevBandImg,
          0,
          band.y,
          width,
          band.h,
          1.03,
          -dir * 0.014,
          0,
          0
        );
        ctx.save();
        ctx.globalAlpha = t;
        drawCoverImageInBox(
          ctx,
          bandImg,
          0,
          band.y,
          width,
          band.h,
          zoom,
          panX,
          panY,
          0
        );
        ctx.restore();
      } else {
        drawCoverImageInBox(
          ctx,
          bandImg,
          0,
          band.y,
          width,
          band.h,
          zoom,
          panX,
          panY,
          0
        );
      }

      // Tinte editorial cinematográfico sutil tipo campaña de moda europea
      ctx.fillStyle = "rgba(18, 16, 14, 0.10)";
      ctx.fillRect(0, band.y, width, band.h);
    });

    // 2. Líneas divisorias ultrafinas entre las 3 franjas (corte limpio de cine)
    ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
    ctx.lineWidth = Math.max(1, width * 0.0018);
    ctx.beginPath();
    ctx.moveTo(0, Math.floor(bandH));
    ctx.lineTo(width, Math.floor(bandH));
    ctx.moveTo(0, Math.floor(bandH * 2));
    ctx.lineTo(width, Math.floor(bandH * 2));
    ctx.stroke();

    // 3. Firma editorial minimalista en la franja inferior (estilo "PANDORA" del video tr2.mp4)
    const sigCenterY = Math.floor(bandH * 2) + bandH * 0.48;

    // Velo suave radial detrás de la firma para garantizar contraste tanto en fondos claros como oscuros
    const sigGlow = ctx.createRadialGradient(
      width / 2,
      sigCenterY,
      0,
      width / 2,
      sigCenterY,
      width * 0.42
    );
    sigGlow.addColorStop(0, "rgba(12, 12, 14, 0.42)");
    sigGlow.addColorStop(1, "rgba(12, 12, 14, 0)");
    ctx.fillStyle = sigGlow;
    ctx.fillRect(0, Math.floor(bandH * 2), width, bandH);

    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(0, 0, 0, 0.65)";
    ctx.shadowBlur = 10;

    // Espaciado editorial tipo firma de alta costura (ej. P A N D O R A)
    const upperTitle = cleanMain.toUpperCase();
    const spacedTitle =
      upperTitle.length <= 16
        ? upperTitle.split("").join(" ")
        : upperTitle;

    ctx.fillStyle = "#FFFFFF";
    ctx.font = `400 ${Math.round(width * 0.052)}px 'Georgia', 'Times New Roman', serif`;
    ctx.fillText(spacedTitle, width / 2, sigCenterY, width * 0.86);

    if (cleanSub) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.88)";
      ctx.font = `600 ${Math.round(width * 0.023)}px 'Inter', 'Segoe UI', sans-serif`;
      ctx.fillText(
        cleanSub.toUpperCase(),
        width / 2,
        sigCenterY + height * 0.036,
        width * 0.82
      );
    }
    ctx.restore();
  }

  // Etiqueta flotante de pista musical estilo Instagram Reel si el usuario subió audio
  const cleanAudioTitle = String(audioTitle || "").trim();
  if (cleanAudioTitle) {
    const timeSec = elapsedMs / 1000;
    const pillH = height * 0.028;
    const pillY = height * 0.952;
    ctx.font = `700 ${Math.round(width * 0.021)}px 'Segoe UI', sans-serif`;
    const labelStr = `🎵 ${cleanAudioTitle.slice(0, 38)}`;
    const textW = Math.min(width * 0.72, ctx.measureText(labelStr).width);
    const pillW = textW + width * 0.08;
    const pillX = (width - pillW) / 2;

    ctx.fillStyle = "rgba(12, 14, 28, 0.82)";
    fillRoundedRect(ctx, pillX, pillY, pillW, pillH, pillH / 2);
    ctx.strokeStyle = "rgba(60, 231, 182, 0.55)";
    ctx.lineWidth = Math.max(1, width * 0.0018);
    strokeRoundedRect(ctx, pillX, pillY, pillW, pillH, pillH / 2);

    // Pequeñas barras de onda junto al texto
    const waveX = pillX + width * 0.024;
    const waveH = pillH * (0.35 + 0.25 * Math.abs(Math.sin(timeSec * 6)));
    ctx.fillStyle = "#3CE7B6";
    fillRoundedRect(
      ctx,
      waveX,
      pillY + (pillH - waveH) / 2,
      Math.max(2, width * 0.004),
      waveH,
      1
    );

    ctx.fillStyle = "#F4F5FB";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      labelStr,
      width / 2 + width * 0.006,
      pillY + pillH / 2 + 1,
      pillW * 0.86
    );
  }

  ctx.restore();
}

/**
 * Carga una lista de URLs de imágenes como elementos HTMLImageElement listos para dibujar en Canvas.
 */
export async function preloadImagesForReel(urls = []) {
  const loaded = await Promise.all(
    urls.map(
      (url) =>
        new Promise((resolve) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => resolve(img);
          img.onerror = () => resolve(null);
          img.src = url;
        })
    )
  );
  return loaded.filter(Boolean);
}

/**
 * Detecta el formato de video soportado por MediaRecorder priorizando MP4/WebM con soporte de audio.
 */
export function getPreferredReelMimeType(hasAudio = false) {
  if (typeof MediaRecorder === "undefined") return "";
  const candidates = hasAudio
    ? [
        "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
        "video/mp4",
        "video/webm;codecs=vp9,opus",
        "video/webm;codecs=vp8,opus",
        "video/webm",
      ]
    : [
        "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
        "video/mp4;codecs=avc1",
        "video/mp4",
        "video/webm;codecs=vp9",
        "video/webm;codecs=vp8",
        "video/webm",
      ];
  for (const mime of candidates) {
    if (MediaRecorder.isTypeSupported(mime)) {
      return mime;
    }
  }
  return "";
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result || ""));
    reader.onerror = () =>
      reject(new Error("No se pudo convertir el video Reel."));
    reader.readAsDataURL(blob);
  });
}

function captureReelThumbnailDataUrl({
  images,
  designId,
  slideDurationMs,
  mainText,
  subText,
  tagText,
  audioTitle = "",
}) {
  const thumbCanvas = document.createElement("canvas");
  thumbCanvas.width = 270;
  thumbCanvas.height = 480;
  const thumbCtx = thumbCanvas.getContext("2d");
  if (!thumbCtx) return "";

  renderReelFrameOnCanvas(thumbCtx, 270, 480, {
    images,
    elapsedMs: Math.min(900, Math.round(slideDurationMs * 0.45)),
    slideDurationMs,
    designId,
    mainText,
    subText,
    tagText,
    audioTitle,
  });

  try {
    return thumbCanvas.toDataURL("image/webp", 0.85);
  } catch {
    return thumbCanvas.toDataURL("image/jpeg", 0.85);
  }
}

/**
 * Renderiza y graba en memoria RAM el ciclo completo del Reel en formato vertical 9:16
 * con duración total configurable (10s, 15s o 20s) y pista de audio opcional,
 * devolviendo `{ blob, ext, mimeType, videoDataUrl, thumbDataUrl }`
 * listo para guardarse en el álbum del evento (vigencia 30 días) y descargarse.
 */
export async function generateReelVideoBlobInMemory({
  images = [],
  designId = "glam-pulse",
  totalDurationSec = 15,
  slideDurationMs,
  mainText = "Mi Evento",
  subText = "",
  tagText = "RECUERDO OFICIAL",
  audioFile = null,
  audioStartSec = 0,
  audioTitle = "",
  width = 720,
  height = 1280,
  fps = 30,
  onProgress,
}) {
  if (!images.length) {
    throw new Error("Selecciona al menos una fotografía para generar el Reel.");
  }
  if (typeof MediaRecorder === "undefined") {
    throw new Error(
      "Tu navegador no soporta grabación de video en memoria (MediaRecorder)."
    );
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("No se pudo inicializar el lienzo de video 9:16.");
  }

  const targetTotalMs = Math.max(5000, (Number(totalDurationSec) || 15) * 1000);
  const targetTotalSec = targetTotalMs / 1000;
  const computedSlideMs = slideDurationMs
    ? Math.max(500, Number(slideDurationMs))
    : Math.max(500, targetTotalMs / Math.max(1, images.length));
  const totalDurationMs = slideDurationMs
    ? images.length * computedSlideMs
    : targetTotalMs;

  // Preparar pista de audio opcional usando Web Audio API
  let audioCtx = null;
  let audioSource = null;
  let audioDest = null;
  let audioStartOffset = 0;

  if (audioFile) {
    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      try {
        audioCtx = new AudioContextClass();
        if (audioCtx.state === "suspended") {
          await audioCtx.resume();
        }
        const arrayBuf = await audioFile.arrayBuffer();
        const decodedBuffer = await audioCtx.decodeAudioData(
          arrayBuf.slice(0)
        );
        audioDest = audioCtx.createMediaStreamDestination();
        const gainNode = audioCtx.createGain();

        // Suavizado de entrada (fade-in 0.35s) y salida (fade-out 0.6s)
        const nowAudio = audioCtx.currentTime;
        gainNode.gain.setValueAtTime(0.01, nowAudio);
        gainNode.gain.linearRampToValueAtTime(1.0, nowAudio + 0.35);
        if (targetTotalSec > 1.2) {
          gainNode.gain.setValueAtTime(
            1.0,
            nowAudio + Math.max(0.4, targetTotalSec - 0.65)
          );
          gainNode.gain.linearRampToValueAtTime(0.01, nowAudio + targetTotalSec);
        }

        audioSource = audioCtx.createBufferSource();
        audioSource.buffer = decodedBuffer;
        const bufDur = Number(decodedBuffer.duration) || 0;
        const maxValidStart =
          bufDur > targetTotalSec
            ? Math.max(0, bufDur - targetTotalSec)
            : Math.max(0, bufDur - 0.5);
        audioStartOffset =
          bufDur > 0
            ? Math.max(0, Math.min(Number(audioStartSec) || 0, maxValidStart))
            : 0;

        // Si la canción cubre la duración del Reel (10s, 15s o 20s), tomar exactamente ese segmento sin repetir;
        // solo activar loop si el archivo de audio subido es más corto que la duración elegida del Reel.
        audioSource.loop = bufDur > 0 && bufDur < targetTotalSec;
        audioSource.connect(gainNode);
        gainNode.connect(audioDest);
      } catch (audioErr) {
        console.warn("No se pudo decodificar el archivo de audio para el Reel:", audioErr);
        if (audioCtx) {
          audioCtx.close().catch(() => {});
        }
        audioCtx = null;
        audioSource = null;
        audioDest = null;
      }
    }
  }

  const hasAudioTrack = Boolean(
    audioDest && audioDest.stream.getAudioTracks().length > 0
  );
  const mimeType = getPreferredReelMimeType(hasAudioTrack);
  const canvasStream = canvas.captureStream(fps);
  const combinedTracks = [
    ...canvasStream.getVideoTracks(),
    ...(hasAudioTrack ? audioDest.stream.getAudioTracks() : []),
  ];
  const stream = new MediaStream(combinedTracks);

  const recorderOptions = mimeType
    ? {
        mimeType,
        videoBitsPerSecond: 2_800_000,
        ...(hasAudioTrack ? { audioBitsPerSecond: 128_000 } : {}),
      }
    : {
        videoBitsPerSecond: 2_800_000,
        ...(hasAudioTrack ? { audioBitsPerSecond: 128_000 } : {}),
      };

  const recorder = new MediaRecorder(stream, recorderOptions);
  const chunks = [];
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      chunks.push(e.data);
    }
  };

  const effectiveAudioTitle =
    audioTitle || (audioFile?.name ? String(audioFile.name).replace(/\.[^.]+$/, "") : "");

  const thumbDataUrl = captureReelThumbnailDataUrl({
    images,
    designId,
    slideDurationMs: computedSlideMs,
    mainText,
    subText,
    tagText,
    audioTitle: effectiveAudioTitle,
  });

  return new Promise((resolve, reject) => {
    const cleanupAudio = () => {
      if (audioSource) {
        try {
          audioSource.stop();
        } catch {
          // Ignorar si ya se detuvo
        }
        audioSource = null;
      }
      if (audioCtx) {
        audioCtx.close().catch(() => {});
        audioCtx = null;
      }
    };

    recorder.onerror = (err) => {
      cleanupAudio();
      reject(err?.error || new Error("Error al codificar el Reel en memoria."));
    };

    recorder.onstop = async () => {
      try {
        cleanupAudio();
        canvasStream.getTracks().forEach((t) => t.stop());
        stream.getTracks().forEach((t) => t.stop());
        const finalMime = recorder.mimeType || mimeType || "video/webm";
        const ext = finalMime.includes("mp4") ? "mp4" : "webm";
        const cleanMime = ext === "mp4" ? "video/mp4" : "video/webm";
        const blob = new Blob(chunks, { type: cleanMime });
        const videoDataUrl = await blobToDataUrl(blob);
        resolve({ blob, ext, mimeType: cleanMime, videoDataUrl, thumbDataUrl });
      } catch (e) {
        reject(e);
      }
    };

    // Dibujar primer frame antes de iniciar la grabación
    renderReelFrameOnCanvas(ctx, width, height, {
      images,
      elapsedMs: 0,
      slideDurationMs: computedSlideMs,
      designId,
      mainText,
      subText,
      tagText,
      audioTitle: effectiveAudioTitle,
    });

    recorder.start(100);
    if (audioSource) {
      try {
        if (audioSource.loop) {
          audioSource.start(0, audioStartOffset);
        } else {
          audioSource.start(0, audioStartOffset, targetTotalSec);
        }
      } catch {
        // Ignorar si no pudo iniciar la fuente de audio
      }
    }
    const startTime = performance.now();

    const stepFrame = () => {
      const elapsed = performance.now() - startTime;
      const clamped = Math.min(elapsed, totalDurationMs - 1);

      renderReelFrameOnCanvas(ctx, width, height, {
        images,
        elapsedMs: clamped,
        slideDurationMs: computedSlideMs,
        designId,
        mainText,
        subText,
        tagText,
        audioTitle: effectiveAudioTitle,
      });

      if (typeof onProgress === "function") {
        const pct = Math.min(100, Math.round((elapsed / totalDurationMs) * 100));
        onProgress(pct);
      }

      if (elapsed < totalDurationMs) {
        requestAnimationFrame(stepFrame);
      } else {
        if (typeof onProgress === "function") onProgress(100);
        recorder.stop();
      }
    };

    requestAnimationFrame(stepFrame);
  });
}

