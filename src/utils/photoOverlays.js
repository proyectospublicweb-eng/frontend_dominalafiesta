export const OVERLAY_DESIGNS = [
  {
    id: "none",
    number: 0,
    name: "Sin Overlay",
    shortName: "🚫 Sin Marco",
    subtitle: "Fotografía limpia original",
    badgeColor: "bg-slate-200 text-slate-700",
    accentHex: "#64748b",
  },
  {
    id: "gala-gold",
    number: 1,
    name: "Diseño 1 · Gala Dorada",
    shortName: "✨ 1. Gala Dorada",
    subtitle: "Marco doble dorado champaña y tipografía editorial",
    badgeColor: "bg-amber-500/15 text-amber-800 border-amber-400/50",
    accentHex: "#D4AF37",
  },
  {
    id: "polaroid",
    number: 2,
    name: "Diseño 2 · Polaroid Instantánea",
    shortName: "📸 2. Polaroid Retro",
    subtitle: "Marco blanco cálido tipo cámara instantánea",
    badgeColor: "bg-stone-200 text-stone-800 border-stone-400/50",
    accentHex: "#334155",
  },
  {
    id: "neon-vip",
    number: 3,
    name: "Diseño 3 · Neón VIP Party",
    shortName: "🎉 3. Neón VIP",
    subtitle: "Borde luminoso neón e insignia nocturna VIP",
    badgeColor: "bg-indigo-500/15 text-indigo-800 border-indigo-400/50",
    accentHex: "#00F0FF",
  },
  {
    id: "glass-minimal",
    number: 4,
    name: "Diseño 4 · Cristal Minimalista",
    shortName: "🌿 4. Cristal Glass",
    subtitle: "Cintillo flotante translúcido con acento moderno",
    badgeColor: "bg-emerald-500/15 text-emerald-800 border-emerald-400/50",
    accentHex: "#4CE0B3",
  },
  {
    id: "magazine-cinema",
    number: 5,
    name: "Diseño 5 · Sello Magazine / Cine",
    shortName: "🎬 5. Sello Magazine",
    subtitle: "Estética de portada con sello superior y titular",
    badgeColor: "bg-rose-500/15 text-rose-800 border-rose-400/50",
    accentHex: "#F98880",
  },
];

function fitFontSize(ctx, text, maxWidth, initialSize, minSize, fontSpecBuilder) {
  let size = initialSize;
  while (size > minSize) {
    ctx.font = fontSpecBuilder(size);
    if (ctx.measureText(text).width <= maxWidth) {
      return size;
    }
    size -= Math.max(1, Math.round(size * 0.06));
  }
  ctx.font = fontSpecBuilder(minSize);
  return minSize;
}

function drawRoundedRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Dibuja el diseño de Overlay seleccionado directamente sobre el contexto 2D del Canvas.
 * Escala automáticamente grosores, márgenes y fuentes según las dimensiones (HD o Miniatura).
 */
export function drawPhotoOverlayOnCanvas(ctx, width, height, overlayConfig = {}) {
  if (!ctx || !overlayConfig) return;
  const designId = String(overlayConfig.designId || "none");
  if (designId === "none") return;

  const mainText = String(overlayConfig.mainText || "").trim();
  const subText = String(overlayConfig.subText || "").trim();
  const badgeText = String(
    overlayConfig.badgeText || "RECUERDALO.COM.MX"
  ).trim();

  const minDim = Math.min(width, height);
  const u = minDim / 1000; // Unidad base escalable (1.0 en 1000px, 1.92 en 1920px, etc.)

  ctx.save();

  // =========================================================================
  // DISEÑO 1: ✨ GALA DORADA (EDITORIAL)
  // =========================================================================
  if (designId === "gala-gold") {
    const pad = Math.round(28 * u);
    const padInner = Math.round(36 * u);

    // Degradado oscuro suave en la parte inferior para lectura impecable
    const gradH = Math.round(height * 0.28);
    const grad = ctx.createLinearGradient(0, height - gradH, 0, height);
    grad.addColorStop(0, "rgba(10, 12, 20, 0)");
    grad.addColorStop(0.55, "rgba(10, 12, 20, 0.58)");
    grad.addColorStop(1, "rgba(10, 12, 20, 0.86)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, height - gradH, width, gradH);

    // Marco exterior dorado champaña
    ctx.strokeStyle = "rgba(212, 175, 55, 0.88)";
    ctx.lineWidth = Math.max(1.5, 3 * u);
    ctx.strokeRect(pad, pad, width - pad * 2, height - pad * 2);

    // Marco interior fino
    ctx.strokeStyle = "rgba(243, 229, 171, 0.55)";
    ctx.lineWidth = Math.max(1, 1.4 * u);
    ctx.strokeRect(
      padInner,
      padInner,
      width - padInner * 2,
      height - padInner * 2
    );

    // Esquinas ornamentales
    const cornerLen = Math.round(28 * u);
    ctx.strokeStyle = "#F3E5AB";
    ctx.lineWidth = Math.max(2, 3.8 * u);
    const corners = [
      [pad, pad, 1, 1],
      [width - pad, pad, -1, 1],
      [pad, height - pad, 1, -1],
      [width - pad, height - pad, -1, -1],
    ];
    corners.forEach(([cx, cy, dx, dy]) => {
      ctx.beginPath();
      ctx.moveTo(cx, cy + dy * cornerLen);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx + dx * cornerLen, cy);
      ctx.stroke();
    });

    // Ornamento superior al texto
    const centerX = width / 2;
    const bottomBaseY = height - padInner - Math.round(22 * u);

    if (subText) {
      fitFontSize(
        ctx,
        subText.toUpperCase(),
        width - padInner * 4,
        Math.round(22 * u),
        Math.round(12 * u),
        (s) => `600 ${s}px "Georgia", "Times New Roman", serif`
      );
      ctx.fillStyle = "#F3E5AB";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.shadowColor = "rgba(0,0,0,0.75)";
      ctx.shadowBlur = 8 * u;
      ctx.fillText(subText.toUpperCase(), centerX, bottomBaseY);
    }

    if (mainText) {
      const mainY = subText
        ? bottomBaseY - Math.round(30 * u)
        : bottomBaseY - Math.round(6 * u);
      fitFontSize(
        ctx,
        mainText,
        width - padInner * 3,
        Math.round(48 * u),
        Math.round(18 * u),
        (s) => `bold ${s}px "Georgia", "Times New Roman", serif`
      );
      ctx.fillStyle = "#FFFFFF";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.shadowColor = "rgba(0,0,0,0.85)";
      ctx.shadowBlur = 12 * u;
      ctx.fillText(mainText, centerX, mainY);

      // Línea ornamental dorada arriba del título
      const lineY = mainY - Math.round(56 * u);
      const lineHalf = Math.round(90 * u);
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "rgba(212, 175, 55, 0.85)";
      ctx.lineWidth = Math.max(1, 1.8 * u);
      ctx.beginPath();
      ctx.moveTo(centerX - lineHalf, lineY);
      ctx.lineTo(centerX - Math.round(18 * u), lineY);
      ctx.moveTo(centerX + Math.round(18 * u), lineY);
      ctx.lineTo(centerX + lineHalf, lineY);
      ctx.stroke();

      ctx.font = `${Math.max(10, Math.round(18 * u))}px Georgia, serif`;
      ctx.fillStyle = "#D4AF37";
      ctx.textBaseline = "middle";
      ctx.fillText("✦", centerX, lineY);
    }
  }

  // =========================================================================
  // DISEÑO 2: 📸 POLAROID INSTANTÁNEA (RETRO)
  // =========================================================================
  else if (designId === "polaroid") {
    const sideBorder = Math.round(28 * u);
    const topBorder = Math.round(28 * u);
    const bottomBorder = Math.round(138 * u);

    // Marco blanco cálido perimetral (4 bandas para enmarcar la foto)
    ctx.fillStyle = "#FAF8F5";
    // Arriba
    ctx.fillRect(0, 0, width, topBorder);
    // Abajo
    ctx.fillRect(0, height - bottomBorder, width, bottomBorder);
    // Izquierda
    ctx.fillRect(0, 0, sideBorder, height);
    // Derecha
    ctx.fillRect(width - sideBorder, 0, sideBorder, height);

    // Borde interior sutil alrededor de la ventana de la foto
    ctx.strokeStyle = "rgba(30, 41, 59, 0.16)";
    ctx.lineWidth = Math.max(1, 2 * u);
    ctx.strokeRect(
      sideBorder,
      topBorder,
      width - sideBorder * 2,
      height - topBorder - bottomBorder
    );

    const centerX = width / 2;
    const textAreaTop = height - bottomBorder;

    if (mainText) {
      const titleY = subText
        ? textAreaTop + Math.round(bottomBorder * 0.48)
        : textAreaTop + Math.round(bottomBorder * 0.58);
      fitFontSize(
        ctx,
        mainText,
        width - sideBorder * 3,
        Math.round(44 * u),
        Math.round(16 * u),
        (s) => `800 ${s}px "Segoe UI", "Helvetica Neue", sans-serif`
      );
      ctx.fillStyle = "#1E293B";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(mainText, centerX, titleY);
    }

    if (subText) {
      const subY = textAreaTop + Math.round(bottomBorder * 0.78);
      fitFontSize(
        ctx,
        subText,
        width - sideBorder * 3,
        Math.round(22 * u),
        Math.round(11 * u),
        (s) => `600 ${s}px "Segoe UI", "Helvetica Neue", sans-serif`
      );
      ctx.fillStyle = "#64748B";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(subText, centerX, subY);
    }
  }

  // =========================================================================
  // DISEÑO 3: 🎉 NEÓN VIP PARTY
  // =========================================================================
  else if (designId === "neon-vip") {
    const pad = Math.round(22 * u);

    // Degradado inferior profundo
    const gradH = Math.round(height * 0.27);
    const grad = ctx.createLinearGradient(0, height - gradH, 0, height);
    grad.addColorStop(0, "rgba(11, 19, 54, 0)");
    grad.addColorStop(0.5, "rgba(11, 19, 54, 0.68)");
    grad.addColorStop(1, "rgba(11, 19, 54, 0.92)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, height - gradH, width, gradH);

    // Borde Neón con degradado Cyan -> Índigo -> Rosa
    const neonGrad = ctx.createLinearGradient(0, 0, width, height);
    neonGrad.addColorStop(0, "#00F0FF");
    neonGrad.addColorStop(0.5, "#6C7EE1");
    neonGrad.addColorStop(1, "#FF2E93");

    ctx.save();
    ctx.strokeStyle = neonGrad;
    ctx.lineWidth = Math.max(2, 4.5 * u);
    ctx.shadowColor = "#00F0FF";
    ctx.shadowBlur = 16 * u;
    drawRoundedRect(
      ctx,
      pad,
      pad,
      width - pad * 2,
      height - pad * 2,
      Math.round(20 * u)
    );
    ctx.stroke();
    ctx.restore();

    // Cápsula superior "★ VIP MEMORY ★"
    const pillW = Math.round(220 * u);
    const pillH = Math.round(34 * u);
    const pillX = (width - pillW) / 2;
    const pillY = pad + Math.round(14 * u);

    ctx.fillStyle = "rgba(15, 23, 42, 0.82)";
    ctx.strokeStyle = "#00F0FF";
    ctx.lineWidth = Math.max(1, 1.8 * u);
    drawRoundedRect(ctx, pillX, pillY, pillW, pillH, pillH / 2);
    ctx.fill();
    ctx.stroke();

    ctx.font = `800 ${Math.max(9, Math.round(15 * u))}px "Segoe UI", sans-serif`;
    ctx.fillStyle = "#00F0FF";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("★ VIP PARTY MEMORY ★", width / 2, pillY + pillH / 2);

    const centerX = width / 2;
    const baseBottom = height - pad - Math.round(24 * u);

    if (subText) {
      fitFontSize(
        ctx,
        subText.toUpperCase(),
        width - pad * 4,
        Math.round(21 * u),
        Math.round(11 * u),
        (s) => `700 ${s}px "Segoe UI", sans-serif`
      );
      ctx.fillStyle = "#00F0FF";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText(subText.toUpperCase(), centerX, baseBottom);
    }

    if (mainText) {
      const mainY = subText
        ? baseBottom - Math.round(28 * u)
        : baseBottom - Math.round(6 * u);
      fitFontSize(
        ctx,
        mainText.toUpperCase(),
        width - pad * 3,
        Math.round(46 * u),
        Math.round(18 * u),
        (s) => `900 ${s}px "Segoe UI", sans-serif`
      );
      ctx.fillStyle = "#FFFFFF";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.shadowColor = "rgba(108, 126, 225, 0.9)";
      ctx.shadowBlur = 14 * u;
      ctx.fillText(mainText.toUpperCase(), centerX, mainY);
    }
  }

  // =========================================================================
  // DISEÑO 4: 🌿 CRISTAL MINIMALISTA (GLASSMORPHISM)
  // =========================================================================
  else if (designId === "glass-minimal") {
    const marginX = Math.round(34 * u);
    const marginB = Math.round(30 * u);
    const cardH = Math.round(108 * u);
    const cardW = width - marginX * 2;
    const cardX = marginX;
    const cardY = height - marginB - cardH;

    // Fondo traslúcido oscuro tipo cristal
    ctx.save();
    ctx.fillStyle = "rgba(20, 24, 41, 0.78)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
    ctx.lineWidth = Math.max(1, 1.8 * u);
    ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
    ctx.shadowBlur = 18 * u;
    drawRoundedRect(ctx, cardX, cardY, cardW, cardH, Math.round(22 * u));
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Barra vertical de acento esmeralda/índigo dentro de la tarjeta
    const barX = cardX + Math.round(22 * u);
    const barY = cardY + Math.round(20 * u);
    const barW = Math.round(6 * u);
    const barH = cardH - Math.round(40 * u);
    ctx.fillStyle = "#4CE0B3";
    drawRoundedRect(ctx, barX, barY, barW, barH, barW / 2);
    ctx.fill();

    const textStartX = barX + Math.round(20 * u);
    const maxTextW = cardW - Math.round(70 * u);

    if (mainText) {
      const titleY = subText
        ? cardY + Math.round(cardH * 0.44)
        : cardY + Math.round(cardH * 0.54);
      fitFontSize(
        ctx,
        mainText,
        maxTextW,
        Math.round(38 * u),
        Math.round(15 * u),
        (s) => `800 ${s}px "Segoe UI", sans-serif`
      );
      ctx.fillStyle = "#FFFFFF";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(mainText, textStartX, titleY);
    }

    if (subText) {
      const subY = cardY + Math.round(cardH * 0.74);
      fitFontSize(
        ctx,
        subText,
        maxTextW,
        Math.round(20 * u),
        Math.round(11 * u),
        (s) => `600 ${s}px "Segoe UI", sans-serif`
      );
      ctx.fillStyle = "#4CE0B3";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(subText, textStartX, subY);
    }
  }

  // =========================================================================
  // DISEÑO 5: 🎬 SELLO MAGAZINE / CINE
  // =========================================================================
  else if (designId === "magazine-cinema") {
    const pad = Math.round(32 * u);

    // Degradado superior e inferior cinematográfico
    const topGradH = Math.round(height * 0.16);
    const topGrad = ctx.createLinearGradient(0, 0, 0, topGradH);
    topGrad.addColorStop(0, "rgba(0, 0, 0, 0.72)");
    topGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = topGrad;
    ctx.fillRect(0, 0, width, topGradH);

    const botGradH = Math.round(height * 0.28);
    const botGrad = ctx.createLinearGradient(0, height - botGradH, 0, height);
    botGrad.addColorStop(0, "rgba(0, 0, 0, 0)");
    botGrad.addColorStop(0.55, "rgba(0, 0, 0, 0.65)");
    botGrad.addColorStop(1, "rgba(0, 0, 0, 0.88)");
    ctx.fillStyle = botGrad;
    ctx.fillRect(0, height - botGradH, width, botGradH);

    // Encabezado editorial superior
    const topY = pad + Math.round(10 * u);
    ctx.font = `700 ${Math.max(10, Math.round(16 * u))}px "Segoe UI", sans-serif`;
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(`✦  ${badgeText.toUpperCase()}  ✦`, width / 2, topY);

    // Líneas laterales inferiores y título grande estilo portada
    const centerX = width / 2;
    const bottomY = height - pad;

    if (subText) {
      fitFontSize(
        ctx,
        `[ ${subText.toUpperCase()} ]`,
        width - pad * 3,
        Math.round(20 * u),
        Math.round(11 * u),
        (s) => `700 ${s}px "Segoe UI", monospace`
      );
      ctx.fillStyle = "#F98880";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText(`[ ${subText.toUpperCase()} ]`, centerX, bottomY);
    }

    if (mainText) {
      const mainY = subText
        ? bottomY - Math.round(30 * u)
        : bottomY - Math.round(6 * u);
      fitFontSize(
        ctx,
        mainText.toUpperCase(),
        width - pad * 2.5,
        Math.round(52 * u),
        Math.round(18 * u),
        (s) => `900 ${s}px "Segoe UI", "Impact", sans-serif`
      );
      ctx.fillStyle = "#FFFFFF";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.shadowColor = "rgba(0, 0, 0, 0.85)";
      ctx.shadowBlur = 10 * u;
      ctx.fillText(mainText.toUpperCase(), centerX, mainY);
    }
  }

  ctx.restore();
}

