export const OVERLAY_DESIGNS = [
  {
    id: "none",
    number: 0,
    name: "Sin Overlay",
    shortName: "🚫 Sin Overlay",
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
  {
    id: "club-party",
    number: 6,
    name: "Diseño 6 · Club Party Duotone",
    shortName: "🎧 6. Club Party",
    subtitle: "Filtro gel rosa/cyan, puntos halftone y doble tipografía",
    badgeColor: "bg-pink-500/15 text-pink-800 border-pink-400/50",
    accentHex: "#FF1675",
  },
  {
    id: "kinetic",
    number: 7,
    name: "Diseño 7 · Glamour Pink",
    shortName: "🌸 7. Glamour Pink",
    subtitle: "Franja negra vertical, letras gigantes huecas y titular rosa orquídea",
    badgeColor: "bg-fuchsia-500/15 text-fuchsia-800 border-fuchsia-400/50",
    accentHex: "#EB7BC0",
  },
  {
    id: "vortex",
    number: 8,
    name: "Diseño 8 · Vortex",
    shortName: "🌊 8. Vortex",
    subtitle: "Filtro plata/teal, titular vertical bicolor con recorte blanco y script",
    badgeColor: "bg-cyan-500/15 text-cyan-800 border-cyan-400/50",
    accentHex: "#15A6C4",
  },
  {
    id: "color-veil",
    number: 9,
    name: "Diseño 9 · Kinetic",
    shortName: "🔶 9. Kinetic",
    subtitle: "Tríptico B&N con franja central terracota, serif bicolor y HUD editorial",
    badgeColor: "bg-orange-500/15 text-orange-800 border-orange-400/50",
    accentHex: "#E2502B",
  },
  {
    id: "haze",
    number: 10,
    name: "Diseño 10 · Haze",
    shortName: "🍷 10. Haze",
    subtitle: "Mosaico arquitectónico vino tinto, filtro cálido vintage y letras huecas",
    badgeColor: "bg-rose-900/15 text-rose-950 border-rose-800/50",
    accentHex: "#5A1F27",
  },
  {
    id: "prisma",
    number: 11,
    name: "Diseño 11 · Prisma",
    shortName: "🔮 11. Prisma",
    subtitle: "Gel neón cyan/carmesí, franja blanca y columna púrpura con recorte",
    badgeColor: "bg-purple-500/15 text-purple-900 border-purple-400/50",
    accentHex: "#7C5280",
  },
  {
    id: "solstice",
    number: 12,
    name: "Diseño 12 · Solstice",
    shortName: "☀️ 12. Solstice",
    subtitle: "Mitad B&N plata, cuadro carmesí/ámbar y titular condensado blanco/rojo",
    badgeColor: "bg-red-500/15 text-red-900 border-red-400/50",
    accentHex: "#DC1E24",
  },
  {
    id: "shadows",
    number: 13,
    name: "Diseño 13 · Shadows",
    shortName: "🌑 13. Shadows",
    subtitle: "Noir B&N con humo, bloque turquesa 09 y titular con líneas scanline",
    badgeColor: "bg-teal-500/15 text-teal-900 border-teal-400/50",
    accentHex: "#05DFD9",
  },
  {
    id: "polar",
    number: 14,
    name: "Diseño 14 · Polar",
    shortName: "📷 14. Polar",
    subtitle: "Monocromo B&N alto contraste, visor blanco encuadrado y serif RECORD",
    badgeColor: "bg-slate-500/15 text-slate-900 border-slate-400/50",
    accentHex: "#334155",
  },
  {
    id: "metro",
    number: 15,
    name: "Diseño 15 · Metro",
    shortName: "⚡ 15. Metro",
    subtitle: "Contraste urbano carbón/mostaza, cuadros dobles y titular STRONG traslúcido",
    badgeColor: "bg-amber-500/15 text-amber-900 border-amber-500/50",
    accentHex: "#DCB028",
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

function extractClubDateLines(eventDateRaw, subTextRaw = "") {
  // Si el usuario escribió 3 bloques separados por "/" en el subtítulo (ej. "SAT / JUNE / 27TH"), usarlos
  const slashParts = String(subTextRaw || "")
    .split("/")
    .map((p) => p.trim().toUpperCase())
    .filter(Boolean);
  if (slashParts.length === 3 && slashParts.every((p) => p.length <= 8)) {
    return slashParts;
  }

  if (eventDateRaw) {
    const raw = String(eventDateRaw).trim();
    const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
    const dt = match
      ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
      : new Date(raw);

    if (!Number.isNaN(dt.getTime())) {
      const days = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];
      const months = [
        "ENE",
        "FEB",
        "MAR",
        "ABR",
        "MAY",
        "JUN",
        "JUL",
        "AGO",
        "SEP",
        "OCT",
        "NOV",
        "DIC",
      ];
      const dName = days[dt.getDay()];
      const mName = months[dt.getMonth()];
      const dNum = String(dt.getDate()).padStart(2, "0");
      return [dName, mName, `${dNum}TH`];
    }
  }
  return ["SAT", "JUNE", "27TH"];
}

function splitClubPartyTitle(mainText) {
  const clean = String(mainText || "").trim();
  if (!clean) {
    return { condensedLine: "CLUB", scriptLine: "Party" };
  }

  if (clean.includes("|")) {
    const [first, ...rest] = clean.split("|");
    return {
      condensedLine: (first || "CLUB").trim().toUpperCase(),
      scriptLine: rest.join(" ").trim() || "Party",
    };
  }

  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length === 1) {
    return {
      condensedLine: words[0].toUpperCase(),
      scriptLine: "Party",
    };
  }

  if (words.length === 2) {
    return {
      condensedLine: words[0].toUpperCase(),
      scriptLine: words[1],
    };
  }

  const firstUpper = words[0].toUpperCase();
  const secondUpper = (words[1] || "").toUpperCase();
  const eventPrefixes = new Set([
    "BODA",
    "XV",
    "CLUB",
    "FIESTA",
    "GALA",
    "PARTY",
    "GRADUACIÓN",
    "GRADUACION",
    "BAUTIZO",
    "CUMPLE",
    "CUMPLEAÑOS",
    "ANIVERSARIO",
  ]);

  if (firstUpper === "MIS" && secondUpper === "XV" && words.length > 2) {
    return {
      condensedLine: "MIS XV",
      scriptLine: words.slice(2).join(" "),
    };
  }

  if (eventPrefixes.has(firstUpper)) {
    return {
      condensedLine: firstUpper,
      scriptLine: words.slice(1).join(" "),
    };
  }

  const mid = Math.ceil(words.length / 2);
  return {
    condensedLine: words.slice(0, mid).join(" ").toUpperCase(),
    scriptLine: words.slice(mid).join(" "),
  };
}

function splitKineticTitle(mainTextRaw) {
  const clean = String(mainTextRaw || "KINETIC").trim();
  if (!clean) {
    return {
      verticalWord: "KINETIC",
      bottomPinkWord: "KINETIC",
    };
  }

  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length === 1) {
    const single = words[0].toUpperCase();
    return {
      verticalWord: single.slice(0, 7),
      bottomPinkWord: single,
    };
  }

  // Si la primera palabra es muy corta (ej. "XV" o "MI"), combinar o usar la palabra principal en vertical
  const firstClean = words[0].replace(/[^a-zA-Z0-9ÁÉÍÓÚÑáéíóúñ]/g, "").toUpperCase();
  if (firstClean.length >= 3 && firstClean.length <= 7) {
    return {
      verticalWord: firstClean,
      bottomPinkWord: words.slice(1).join(" ").toUpperCase(),
    };
  }

  if (firstClean.length < 3 && words.length >= 2) {
    const secondClean = words[1]
      .replace(/[^a-zA-Z0-9ÁÉÍÓÚÑáéíóúñ]/g, "")
      .toUpperCase();
    const combined = `${firstClean}${secondClean}`.slice(0, 7);
    const rest = words.slice(2).join(" ").toUpperCase();
    return {
      verticalWord: combined || "KINETIC",
      bottomPinkWord: rest || words.slice(1).join(" ").toUpperCase(),
    };
  }

  return {
    verticalWord: firstClean.slice(0, 7) || "KINETIC",
    bottomPinkWord: words.slice(1).join(" ").toUpperCase() || clean.toUpperCase(),
  };
}

function splitVortexTitle(mainTextRaw) {
  const clean = String(mainTextRaw || "VORTEX").trim();
  if (!clean) {
    return {
      verticalBannerWord: "VORTEX",
      scriptPhrase: "Save the Date",
    };
  }

  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length === 1) {
    return {
      verticalBannerWord: words[0].toUpperCase().slice(0, 9),
      scriptPhrase: "Save the Date",
    };
  }

  const firstClean = words[0]
    .replace(/[^a-zA-Z0-9ÁÉÍÓÚÑáéíóúñ]/g, "")
    .toUpperCase();

  if (firstClean.length < 3 && words.length >= 2) {
    const secondClean = words[1]
      .replace(/[^a-zA-Z0-9ÁÉÍÓÚÑáéíóúñ]/g, "")
      .toUpperCase();
    const combined = `${firstClean}${secondClean}`.slice(0, 9);
    const rest = words.slice(2).join(" ");
    return {
      verticalBannerWord: combined || "VORTEX",
      scriptPhrase: rest || "Save the Date",
    };
  }

  return {
    verticalBannerWord: firstClean.slice(0, 9) || "VORTEX",
    scriptPhrase: words.slice(1).join(" ") || "Save the Date",
  };
}

function splitVortexFooterLines(subTextRaw, thirdTextRaw, badgeTextRaw) {
  const sub = String(subTextRaw || "").trim();
  const third = String(thirdTextRaw || "").trim();

  if (sub && third) {
    return [sub.toUpperCase(), third.toUpperCase()];
  }

  if (sub) {
    if (sub.includes("•")) {
      const parts = sub
        .split("•")
        .map((p) => p.trim().toUpperCase())
        .filter(Boolean);
      if (parts.length >= 2) {
        return [parts[0], parts.slice(1).join(" • ")];
      }
    }
    const words = sub.toUpperCase().split(/\s+/).filter(Boolean);
    if (words.length >= 4) {
      const mid = Math.ceil(words.length / 2);
      return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
    }
    return [
      sub.toUpperCase(),
      String(badgeTextRaw || "SPECIAL EVENT SHOW").toUpperCase(),
    ];
  }

  if (third) {
    return [
      String(badgeTextRaw || "EXCLUSIVE EVENT").toUpperCase(),
      third.toUpperCase(),
    ];
  }

  return ["MEN AND WOMEN ARE", "INVITED IN COMPETITION SHOW"];
}

function splitColorVeilTitle(mainTextRaw) {
  const clean = String(mainTextRaw || "COLOR VEIL").trim();
  if (!clean) {
    return {
      ivoryLine: "COLOR",
      terracottaLine: "VEIL",
    };
  }

  if (clean.includes("|")) {
    const [p1, p2] = clean.split("|").map((s) => s.trim().toUpperCase());
    return {
      ivoryLine: p1 || "COLOR",
      terracottaLine: p2 || "VEIL",
    };
  }

  const words = clean.toUpperCase().split(/\s+/).filter(Boolean);
  if (words.length === 1) {
    return {
      ivoryLine: words[0],
      terracottaLine: "KINETIC",
    };
  }

  if (words.length === 2) {
    return {
      ivoryLine: words[0],
      terracottaLine: words[1],
    };
  }

  const mid = Math.ceil(words.length / 2);
  return {
    ivoryLine: words.slice(0, mid).join(" "),
    terracottaLine: words.slice(mid).join(" "),
  };
}

function wrapTextIntoLines(ctx, text, maxWidth, maxLines = 6) {
  const words = String(text || "")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);
  if (words.length === 0) return [];

  const lines = [];
  let current = words[0];

  for (let i = 1; i < words.length; i++) {
    const candidate = `${current} ${words[i]}`;
    if (ctx.measureText(candidate).width <= maxWidth) {
      current = candidate;
    } else {
      lines.push(current);
      current = words[i];
      if (lines.length >= maxLines - 1) {
        const remaining = [current, ...words.slice(i + 1)].join(" ");
        lines.push(remaining);
        return lines;
      }
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, maxLines);
}

function splitPrismaTitle(mainTextRaw) {
  const clean = String(mainTextRaw || "PRISMA").trim();
  if (!clean) {
    return {
      verticalWord: "PRISMA",
      extraHeadline: "",
    };
  }

  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length === 1) {
    return {
      verticalWord: words[0].toUpperCase().slice(0, 7),
      extraHeadline: "",
    };
  }

  const firstClean = words[0]
    .replace(/[^a-zA-Z0-9ÁÉÍÓÚÑáéíóúñ]/g, "")
    .toUpperCase();

  if (firstClean.length < 3 && words.length >= 2) {
    const secondClean = words[1]
      .replace(/[^a-zA-Z0-9ÁÉÍÓÚÑáéíóúñ]/g, "")
      .toUpperCase();
    return {
      verticalWord: `${firstClean}${secondClean}`.slice(0, 7) || "PRISMA",
      extraHeadline: words.slice(2).join(" ").toUpperCase(),
    };
  }

  return {
    verticalWord: firstClean.slice(0, 7) || "PRISMA",
    extraHeadline: words.slice(1).join(" ").toUpperCase(),
  };
}

function splitSolsticeLines(mainTextRaw) {
  const clean = String(mainTextRaw || "CREATE. ENHANCE. STAND OUT.")
    .trim()
    .toUpperCase();
  if (!clean) {
    return {
      whiteLines: ["CREATE.", "ENHANCE."],
      redLine: "STAND OUT.",
    };
  }

  // Si el usuario separa con "|" o "/"
  if (clean.includes("|") || clean.includes("/")) {
    const sep = clean.includes("|") ? "|" : "/";
    const parts = clean
      .split(sep)
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length >= 2) {
      return {
        whiteLines: parts.slice(0, -1),
        redLine: parts[parts.length - 1],
      };
    }
  }

  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length === 1) {
    const w0 = words[0].endsWith(".") ? words[0] : `${words[0]}.`;
    return {
      whiteLines: [w0],
      redLine: "SOLSTICE.",
    };
  }

  if (words.length === 2) {
    const w0 = words[0].endsWith(".") ? words[0] : `${words[0]}.`;
    const w1 = words[1].endsWith(".") ? words[1] : `${words[1]}.`;
    return {
      whiteLines: [w0],
      redLine: w1,
    };
  }

  if (words.length === 3) {
    const w0 = words[0].endsWith(".") ? words[0] : `${words[0]}.`;
    const w1 = words[1].endsWith(".") ? words[1] : `${words[1]}.`;
    const w2 = words[2].endsWith(".") ? words[2] : `${words[2]}.`;
    return {
      whiteLines: [w0, w1],
      redLine: w2,
    };
  }

  // 4 o más palabras: repartir en 2 líneas blancas y 1 línea roja final
  const step = Math.ceil(words.length / 3);
  const l1 = words.slice(0, step).join(" ");
  const l2 = words.slice(step, step * 2).join(" ");
  const l3 = words.slice(step * 2).join(" ");
  return {
    whiteLines: [l1, l2].filter(Boolean),
    redLine: l3 || l2,
  };
}

function splitShadowsTitle(mainTextRaw, eventDateRaw) {
  const clean = String(mainTextRaw || "WEDNESDAY OCTOBER")
    .trim()
    .toUpperCase();

  // Extraer día de 2 dígitos (ej. "09") de la fecha del evento o si el texto empieza con 2 dígitos
  let dayDigits = "09";
  const leadingNumMatch = clean.match(/^(\d{1,2})\b/);
  if (leadingNumMatch) {
    dayDigits = leadingNumMatch[1].padStart(2, "0");
  } else if (eventDateRaw) {
    const dm = String(eventDateRaw)
      .trim()
      .match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (dm) {
      dayDigits = dm[3];
    } else {
      const dObj = new Date(eventDateRaw);
      if (!Number.isNaN(dObj.getTime())) {
        dayDigits = String(dObj.getDate()).padStart(2, "0");
      }
    }
  }

  const textWithoutLeadingDay = clean.replace(/^(\d{1,2})\s+/, "").trim() || clean;

  if (textWithoutLeadingDay.includes("|") || textWithoutLeadingDay.includes("/")) {
    const sep = textWithoutLeadingDay.includes("|") ? "|" : "/";
    const [p1, p2] = textWithoutLeadingDay
      .split(sep)
      .map((s) => s.trim())
      .filter(Boolean);
    return {
      dayDigits,
      topThinLine: p1 || "WEDNESDAY",
      bottomSlicedLine: p2 || "OCTOBER",
    };
  }

  const words = textWithoutLeadingDay.split(/\s+/).filter(Boolean);
  if (words.length === 1) {
    return {
      dayDigits,
      topThinLine: "SHADOWS",
      bottomSlicedLine: words[0] || "OCTOBER",
    };
  }

  if (words.length === 2) {
    return {
      dayDigits,
      topThinLine: words[0],
      bottomSlicedLine: words[1],
    };
  }

  const mid = Math.floor(words.length / 2);
  return {
    dayDigits,
    topThinLine: words.slice(0, mid).join(" "),
    bottomSlicedLine: words.slice(mid).join(" "),
  };
}

function drawPolarBulletText(ctx, textRaw, maxW, initialFont, minFont, u) {
  const clean = String(textRaw || "RECORD")
    .trim()
    .toUpperCase();
  const fontSize = fitFontSize(
    ctx,
    clean,
    maxW,
    initialFont,
    minFont,
    (s) => `400 ${s}px "Georgia", "Times New Roman", "Playfair Display", serif`
  );
  ctx.font = `400 ${fontSize}px "Georgia", "Times New Roman", "Playfair Display", serif`;
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const tracking = Math.round(2.5 * u);
  const chars = Array.from(clean);
  const charWidths = chars.map((ch) => ctx.measureText(ch).width);
  const textW =
    charWidths.reduce((acc, w) => acc + w, 0) +
    tracking * Math.max(0, chars.length - 1);

  drawTrackedText(ctx, clean, 0, 0, tracking);

  // Dos puntos circulares blancos ("• TEXTO •") a los lados
  const dotR = Math.max(2.5, Math.round(fontSize * 0.16));
  const dotGap = Math.max(8, Math.round(16 * u));
  const leftDotX = -textW / 2 - dotGap;
  const rightDotX = textW / 2 + dotGap;

  ctx.beginPath();
  ctx.arc(leftDotX, 0, dotR, 0, Math.PI * 2);
  ctx.arc(rightDotX, 0, dotR, 0, Math.PI * 2);
  ctx.fill();
}

function drawTrackedText(ctx, text, centerX, y, trackingPx = 0) {
  const chars = Array.from(String(text || ""));
  if (chars.length === 0) return;
  const charWidths = chars.map((ch) => ctx.measureText(ch).width);
  const totalWidth =
    charWidths.reduce((acc, w) => acc + w, 0) +
    trackingPx * Math.max(0, chars.length - 1);
  let cursorX = centerX - totalWidth / 2;
  const prevAlign = ctx.textAlign;
  ctx.textAlign = "left";
  chars.forEach((ch, idx) => {
    ctx.fillText(ch, cursorX, y);
    cursorX += charWidths[idx] + trackingPx;
  });
  ctx.textAlign = prevAlign;
}

function drawRightAlignedAmpersandLine(
  ctx,
  text,
  rightX,
  y,
  pinkColor = "#FF1675",
  whiteColor = "#FFFFFF"
) {
  const raw = String(text || "").toUpperCase();
  const prevAlign = ctx.textAlign;
  ctx.textAlign = "left";

  if (!raw.includes("&")) {
    const w = ctx.measureText(raw).width;
    ctx.fillStyle = whiteColor;
    ctx.fillText(raw, rightX - w, y);
    ctx.textAlign = prevAlign;
    return;
  }

  const parts = raw.split("&");
  const segments = [];
  parts.forEach((part, idx) => {
    if (part) segments.push({ str: part, color: whiteColor });
    if (idx < parts.length - 1) {
      segments.push({ str: "&", color: pinkColor });
    }
  });

  const totalW = segments.reduce(
    (acc, seg) => acc + ctx.measureText(seg.str).width,
    0
  );
  let cursorX = rightX - totalW;
  segments.forEach((seg) => {
    ctx.fillStyle = seg.color;
    ctx.fillText(seg.str, cursorX, y);
    cursorX += ctx.measureText(seg.str).width;
  });

  ctx.textAlign = prevAlign;
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
  const thirdText = String(overlayConfig.thirdText || "").trim();
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
    const bottomBaseY = height - padInner - Math.round(18 * u);

    if (thirdText) {
      fitFontSize(
        ctx,
        thirdText,
        width - padInner * 4,
        Math.round(19 * u),
        Math.round(11 * u),
        (s) => `italic 600 ${s}px "Georgia", "Times New Roman", serif`
      );
      ctx.fillStyle = "#E6D7A3";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.shadowColor = "rgba(0,0,0,0.75)";
      ctx.shadowBlur = 8 * u;
      ctx.fillText(thirdText, centerX, bottomBaseY);
    }

    const subBaseY = thirdText
      ? bottomBaseY - Math.round(24 * u)
      : bottomBaseY;

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
      ctx.fillText(subText.toUpperCase(), centerX, subBaseY);
    }

    if (mainText) {
      const mainY = subText
        ? subBaseY - Math.round(28 * u)
        : thirdText
        ? bottomBaseY - Math.round(28 * u)
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
    const bottomBorder = Math.round((thirdText ? 152 : 138) * u);

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
      const titleY =
        subText && thirdText
          ? textAreaTop + Math.round(bottomBorder * 0.34)
          : subText || thirdText
          ? textAreaTop + Math.round(bottomBorder * 0.46)
          : textAreaTop + Math.round(bottomBorder * 0.56);
      fitFontSize(
        ctx,
        mainText,
        width - sideBorder * 3,
        Math.round(42 * u),
        Math.round(16 * u),
        (s) => `800 ${s}px "Segoe UI", "Helvetica Neue", sans-serif`
      );
      ctx.fillStyle = "#1E293B";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(mainText, centerX, titleY);
    }

    if (subText) {
      const subY = thirdText
        ? textAreaTop + Math.round(bottomBorder * 0.63)
        : textAreaTop + Math.round(bottomBorder * 0.78);
      fitFontSize(
        ctx,
        subText,
        width - sideBorder * 3,
        Math.round(21 * u),
        Math.round(11 * u),
        (s) => `600 ${s}px "Segoe UI", "Helvetica Neue", sans-serif`
      );
      ctx.fillStyle = "#64748B";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(subText, centerX, subY);
    }

    if (thirdText) {
      const thirdY = subText
        ? textAreaTop + Math.round(bottomBorder * 0.84)
        : textAreaTop + Math.round(bottomBorder * 0.78);
      fitFontSize(
        ctx,
        thirdText,
        width - sideBorder * 3,
        Math.round(18 * u),
        Math.round(10 * u),
        (s) => `600 ${s}px "Segoe UI", "Helvetica Neue", sans-serif`
      );
      ctx.fillStyle = "#94A3B8";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(thirdText, centerX, thirdY);
    }
  }

  // =========================================================================
  // DISEÑO 3: 🎉 NEÓN VIP PARTY
  // =========================================================================
  else if (designId === "neon-vip") {
    const pad = Math.round(22 * u);

    // Degradado inferior profundo
    const gradH = Math.round(height * 0.31);
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
    const baseBottom = height - pad - Math.round(20 * u);

    if (thirdText) {
      fitFontSize(
        ctx,
        thirdText.toUpperCase(),
        width - pad * 4,
        Math.round(18 * u),
        Math.round(10 * u),
        (s) => `700 ${s}px "Segoe UI", sans-serif`
      );
      ctx.fillStyle = "#FF73B9";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText(thirdText.toUpperCase(), centerX, baseBottom);
    }

    const subBaseY = thirdText
      ? baseBottom - Math.round(24 * u)
      : baseBottom;

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
      ctx.fillText(subText.toUpperCase(), centerX, subBaseY);
    }

    if (mainText) {
      const mainY = subText
        ? subBaseY - Math.round(28 * u)
        : thirdText
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
    const cardH = Math.round((thirdText ? 128 : 108) * u);
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
      const titleY =
        subText && thirdText
          ? cardY + Math.round(cardH * 0.32)
          : subText || thirdText
          ? cardY + Math.round(cardH * 0.44)
          : cardY + Math.round(cardH * 0.54);
      fitFontSize(
        ctx,
        mainText,
        maxTextW,
        Math.round(36 * u),
        Math.round(15 * u),
        (s) => `800 ${s}px "Segoe UI", sans-serif`
      );
      ctx.fillStyle = "#FFFFFF";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(mainText, textStartX, titleY);
    }

    if (subText) {
      const subY = thirdText
        ? cardY + Math.round(cardH * 0.61)
        : cardY + Math.round(cardH * 0.74);
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

    if (thirdText) {
      const thirdY = subText
        ? cardY + Math.round(cardH * 0.82)
        : cardY + Math.round(cardH * 0.74);
      fitFontSize(
        ctx,
        thirdText,
        maxTextW,
        Math.round(17 * u),
        Math.round(10 * u),
        (s) => `500 ${s}px "Segoe UI", sans-serif`
      );
      ctx.fillStyle = "#CBD5E1";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(thirdText, textStartX, thirdY);
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

    const botGradH = Math.round(height * 0.31);
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

    if (thirdText) {
      fitFontSize(
        ctx,
        thirdText.toUpperCase(),
        width - pad * 3,
        Math.round(18 * u),
        Math.round(10 * u),
        (s) => `600 ${s}px "Segoe UI", sans-serif`
      );
      ctx.fillStyle = "#E2E8F0";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText(thirdText.toUpperCase(), centerX, bottomY);
    }

    const subBaseY = thirdText
      ? bottomY - Math.round(24 * u)
      : bottomY;

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
      ctx.fillText(`[ ${subText.toUpperCase()} ]`, centerX, subBaseY);
    }

    if (mainText) {
      const mainY = subText
        ? subBaseY - Math.round(28 * u)
        : thirdText
        ? bottomY - Math.round(28 * u)
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

  // =========================================================================
  // DISEÑO 6: 🎧 CLUB PARTY DUOTONE (FILTRO GEL ROSA/CYAN + HALFTONE + SCRIPT)
  // =========================================================================
  else if (designId === "club-party") {
    const maxDim = Math.max(width, height);
    const isLiveOverlay = Boolean(overlayConfig.isLiveOverlay);

    // -----------------------------------------------------------------------
    // 1. FILTRO DE IMAGEN: ILUMINACIÓN GEL DUOTONO (CYAN DERECHA + ROSA IZQ)
    // -----------------------------------------------------------------------
    ctx.save();
    // 1a. Tinte Gel Azul/Cyan Eléctrico (centro y derecha)
    ctx.globalCompositeOperation = isLiveOverlay ? "source-over" : "color";
    const cyanColorGrad = ctx.createLinearGradient(width, 0, 0, height * 0.85);
    cyanColorGrad.addColorStop(
      0,
      isLiveOverlay ? "rgba(0, 195, 255, 0.34)" : "rgba(0, 195, 255, 0.78)"
    );
    cyanColorGrad.addColorStop(
      0.55,
      isLiveOverlay ? "rgba(0, 140, 255, 0.22)" : "rgba(0, 145, 255, 0.58)"
    );
    cyanColorGrad.addColorStop(1, "rgba(0, 110, 255, 0)");
    ctx.fillStyle = cyanColorGrad;
    ctx.fillRect(0, 0, width, height);

    // 1b. Resplandor lateral derecho Cyan Hielo (modo screen / soft-light)
    ctx.globalCompositeOperation = isLiveOverlay ? "source-over" : "screen";
    const cyanGlow = ctx.createRadialGradient(
      width * 0.92,
      height * 0.36,
      maxDim * 0.04,
      width * 0.82,
      height * 0.42,
      maxDim * 0.72
    );
    cyanGlow.addColorStop(
      0,
      isLiveOverlay ? "rgba(0, 220, 255, 0.28)" : "rgba(0, 215, 255, 0.48)"
    );
    cyanGlow.addColorStop(
      0.55,
      isLiveOverlay ? "rgba(0, 150, 255, 0.14)" : "rgba(0, 155, 255, 0.24)"
    );
    cyanGlow.addColorStop(1, "rgba(0, 120, 255, 0)");
    ctx.fillStyle = cyanGlow;
    ctx.fillRect(0, 0, width, height);

    // 1c. Resplandor Gel Hot-Pink / Magenta intenso en el costado izquierdo
    ctx.globalCompositeOperation = isLiveOverlay ? "source-over" : "screen";
    const pinkGlow = ctx.createRadialGradient(
      width * 0.06,
      height * 0.52,
      maxDim * 0.02,
      width * 0.12,
      height * 0.52,
      maxDim * 0.56
    );
    pinkGlow.addColorStop(
      0,
      isLiveOverlay ? "rgba(255, 16, 117, 0.48)" : "rgba(255, 16, 117, 0.78)"
    );
    pinkGlow.addColorStop(
      0.45,
      isLiveOverlay ? "rgba(255, 22, 130, 0.24)" : "rgba(255, 22, 130, 0.38)"
    );
    pinkGlow.addColorStop(1, "rgba(255, 22, 130, 0)");
    ctx.fillStyle = pinkGlow;
    ctx.fillRect(0, 0, width, height);

    // 1d. Viñeta oscura en esquina superior izquierda (para resaltar matriz cyan)
    ctx.globalCompositeOperation = "source-over";
    const topLeftDark = ctx.createRadialGradient(
      0,
      0,
      minDim * 0.04,
      0,
      0,
      minDim * 0.52
    );
    topLeftDark.addColorStop(0, "rgba(4, 7, 18, 0.72)");
    topLeftDark.addColorStop(0.6, "rgba(4, 7, 18, 0.28)");
    topLeftDark.addColorStop(1, "rgba(4, 7, 18, 0)");
    ctx.fillStyle = topLeftDark;
    ctx.fillRect(0, 0, width, height);

    // 1e. Degradado nocturno profundo en la mitad inferior (escenario club)
    const botDarkH = Math.round(height * 0.48);
    const botDarkGrad = ctx.createLinearGradient(
      0,
      height - botDarkH,
      0,
      height
    );
    botDarkGrad.addColorStop(0, "rgba(3, 5, 14, 0)");
    botDarkGrad.addColorStop(0.42, "rgba(3, 5, 14, 0.55)");
    botDarkGrad.addColorStop(0.76, "rgba(3, 5, 14, 0.88)");
    botDarkGrad.addColorStop(1, "rgba(2, 3, 8, 0.96)");
    ctx.fillStyle = botDarkGrad;
    ctx.fillRect(0, height - botDarkH, width, botDarkH);
    ctx.restore();

    // -----------------------------------------------------------------------
    // 2. MATRICES DE PUNTOS HALFTONE (ESQUINA SUP-IZQ CYAN & INF-IZQ ROSA)
    // -----------------------------------------------------------------------
    const dotStep = Math.max(8, Math.round(18 * u));
    const startX = Math.round(14 * u);

    // 2a. Matriz Superior Izquierda (Puntos / Diamantes Cyan #00E5FF)
    const topCols = 9;
    const topRows = 14;
    const topStartY = Math.round(18 * u);
    for (let r = 0; r < topRows; r++) {
      for (let c = 0; c < topCols; c++) {
        const distWeight = 1 - (c / topCols) * 0.55 - (r / topRows) * 0.35;
        if (distWeight <= 0.12) continue;
        const radius = Math.max(1.2, 3.8 * u * distWeight);
        const alpha = Math.min(0.92, Math.max(0.18, distWeight * 0.95));
        const cx = startX + c * dotStep;
        const cy = topStartY + r * dotStep;
        ctx.fillStyle = `rgba(0, 229, 255, ${alpha.toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 2b. Matriz Inferior Izquierda (Puntos Hot-Pink #FF2A7A)
    const botCols = 9;
    const botRows = 16;
    const botEndY = height - Math.round(16 * u);
    const botStartY = botEndY - (botRows - 1) * dotStep;
    for (let r = 0; r < botRows; r++) {
      for (let c = 0; c < botCols; c++) {
        const rowProgress = r / (botRows - 1); // más intenso abajo
        const colFade = 1 - (c / botCols) * 0.55;
        const weight = (0.35 + rowProgress * 0.65) * colFade;
        if (weight <= 0.14) continue;
        const radius = Math.max(1.2, 3.7 * u * weight);
        const alpha = Math.min(0.92, Math.max(0.2, weight * 0.92));
        const cx = startX + c * dotStep;
        const cy = botStartY + r * dotStep;
        ctx.fillStyle = `rgba(255, 42, 122, ${alpha.toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // -----------------------------------------------------------------------
    // 3. BLOQUE DE FECHA APILADA SUPERIOR DERECHA + REJILLA 3x5 DE PUNTOS
    // -----------------------------------------------------------------------
    const dateLines = extractClubDateLines(overlayConfig.eventDate, subText);
    const dateCenterX = width - Math.round(108 * u);
    const dateTopY = Math.round(78 * u);
    const dateFontSize = Math.max(14, Math.round(32 * u));
    const dateLineStep = Math.round(35 * u);

    ctx.save();
    ctx.font = `900 ${dateFontSize}px "Arial Narrow", "Impact", "Segoe UI", sans-serif`;
    ctx.fillStyle = "#F0FAFF";
    ctx.textBaseline = "top";
    ctx.shadowColor = "rgba(0, 20, 45, 0.65)";
    ctx.shadowBlur = 8 * u;

    dateLines.forEach((lineStr, idx) => {
      drawTrackedText(
        ctx,
        lineStr,
        dateCenterX,
        dateTopY + idx * dateLineStep,
        Math.round(5.5 * u)
      );
    });

    // Rejilla de 3 filas x 5 columnas de puntos blancos/cyan debajo de la fecha
    ctx.shadowBlur = 0;
    const gridCols = 5;
    const gridRows = 3;
    const gridSpacingX = Math.round(18 * u);
    const gridSpacingY = Math.round(16 * u);
    const gridTotalW = (gridCols - 1) * gridSpacingX;
    const gridStartX = dateCenterX - gridTotalW / 2;
    const gridStartY = dateTopY + dateLines.length * dateLineStep + Math.round(14 * u);
    const smallDotR = Math.max(1.5, 2.7 * u);

    ctx.fillStyle = "rgba(224, 248, 255, 0.92)";
    for (let r = 0; r < gridRows; r++) {
      for (let c = 0; c < gridCols; c++) {
        ctx.beginPath();
        ctx.arc(
          gridStartX + c * gridSpacingX,
          gridStartY + r * gridSpacingY,
          smallDotR,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    }
    ctx.restore();

    // -----------------------------------------------------------------------
    // 4. TIPOGRAFÍA CENTRAL DOBLE CAPA: "CLUB" (CONDENSADA) + "Party" (SCRIPT)
    // -----------------------------------------------------------------------
    const { condensedLine, scriptLine } = splitClubPartyTitle(mainText);
    const titleCenterX = width * 0.56;
    const condensedBaseY = height - Math.round(218 * u);

    // 4a. Capa 1: Texto superior alto, ultra-condensado en blanco puro ("CLUB")
    ctx.save();
    const maxCondensedW = width * 0.72;
    const condensedFontSize = fitFontSize(
      ctx,
      condensedLine,
      maxCondensedW,
      Math.round(118 * u),
      Math.round(42 * u),
      (s) => `900 ${s}px "Impact", "Arial Narrow", "Segoe UI", sans-serif`
    );
    ctx.translate(titleCenterX, condensedBaseY);
    ctx.scale(0.88, 1.32); // Efecto alto y condensado estilo póster
    ctx.font = `900 ${condensedFontSize}px "Impact", "Arial Narrow", "Segoe UI", sans-serif`;
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.shadowColor = "rgba(0, 0, 0, 0.75)";
    ctx.shadowBlur = 14 * u;
    drawTrackedText(ctx, condensedLine, 0, 0, Math.round(5 * u));
    ctx.restore();

    // 4b. Capa 2: Texto cursivo Hot-Pink ("Party") superpuesto con inclinación
    if (scriptLine) {
      ctx.save();
      const scriptCenterX = titleCenterX - Math.round(8 * u);
      const scriptCenterY = condensedBaseY + Math.round(18 * u);
      const maxScriptW = width * 0.76;
      const scriptFontSize = fitFontSize(
        ctx,
        scriptLine,
        maxScriptW,
        Math.round(108 * u),
        Math.round(36 * u),
        (s) =>
          `italic 700 ${s}px "Brush Script MT", "Segoe Script", "Lucida Handwriting", "Georgia", cursive`
      );
      ctx.translate(scriptCenterX, scriptCenterY);
      ctx.rotate((-7 * Math.PI) / 180);
      ctx.font = `italic 700 ${scriptFontSize}px "Brush Script MT", "Segoe Script", "Lucida Handwriting", "Georgia", cursive`;
      ctx.fillStyle = "#FF1675";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowColor = "rgba(255, 22, 117, 0.55)";
      ctx.shadowBlur = 12 * u;
      ctx.fillText(scriptLine, 0, 0);

      // Trazo fino luminoso para acentuar la caligrafía sobre el texto blanco
      ctx.lineWidth = Math.max(1, 1.8 * u);
      ctx.strokeStyle = "#FF2E88";
      ctx.strokeText(scriptLine, 0, 0);
      ctx.restore();
    }

    // -----------------------------------------------------------------------
    // 5. BLOQUE INFERIOR DERECHO (3 LÍNEAS) + BARRA VERTICAL CYAN (#00C8FF)
    // -----------------------------------------------------------------------
    const barRightMargin = Math.round(88 * u);
    const barW = Math.max(3, Math.round(6.5 * u));
    const barH = Math.round(86 * u);
    const barX = width - barRightMargin;
    const barBottomY = height - Math.round(24 * u);
    const barTopY = barBottomY - barH;

    // Barra vertical Cyan eléctrico
    ctx.save();
    ctx.fillStyle = "#00C8FF";
    ctx.shadowColor = "rgba(0, 200, 255, 0.65)";
    ctx.shadowBlur = 8 * u;
    ctx.fillRect(barX, barTopY, barW, barH);
    ctx.restore();

    // 3 líneas de texto alineadas a la derecha junto a la barra cyan
    const footerRightX = barX - Math.round(14 * u);
    const footerLine1 = (badgeText || "VIP PARTY").toUpperCase();
    const footerLine2 = (
      subText && !subText.includes("/")
        ? subText
        : overlayConfig.eventPlace || "GUEST LIST ONLY"
    ).toUpperCase();
    const footerLine3 = (
      thirdText ||
      (subText.includes("&") ? subText : "MUSIC & CHAMPAGNE")
    ).toUpperCase();

    const footerLines = [footerLine1, footerLine2, footerLine3];
    const maxFooterW = footerRightX - Math.round(90 * u);

    ctx.save();
    ctx.textBaseline = "top";
    ctx.shadowColor = "rgba(0, 0, 0, 0.85)";
    ctx.shadowBlur = 6 * u;

    footerLines.forEach((lineText, idx) => {
      fitFontSize(
        ctx,
        lineText,
        maxFooterW,
        Math.round(21 * u),
        Math.round(11 * u),
        (s) => `600 ${s}px "Segoe UI", "Helvetica Neue", Arial, sans-serif`
      );
      const lineY = barTopY + Math.round(3 * u) + idx * Math.round(28 * u);
      drawRightAlignedAmpersandLine(
        ctx,
        lineText,
        footerRightX,
        lineY,
        "#FF1675",
        "#F8FAFC"
      );
    });
    ctx.restore();
  }

  // =========================================================================
  // DISEÑO 7: 🌸 KINETIC (FRANJA NEGRA VERTICAL + LETRAS HUECAS + ROSA ORQUÍDEA)
  // =========================================================================
  else if (designId === "kinetic") {
    const maxDim = Math.max(width, height);
    const isLiveOverlay = Boolean(overlayConfig.isLiveOverlay);

    // -----------------------------------------------------------------------
    // 1. FILTRO DE IMAGEN: ESTUDIO EDITORIAL GLAMOUR + RESPLANDOR ORQUÍDEA
    // -----------------------------------------------------------------------
    ctx.save();
    // 1a. Resplandor suave Rosa Orquídea / Magenta de estudio sobre el sujeto
    ctx.globalCompositeOperation = isLiveOverlay ? "source-over" : "soft-light";
    const orchidBloom = ctx.createRadialGradient(
      width * 0.48,
      height * 0.34,
      maxDim * 0.04,
      width * 0.52,
      height * 0.38,
      maxDim * 0.62
    );
    orchidBloom.addColorStop(
      0,
      isLiveOverlay ? "rgba(235, 123, 192, 0.22)" : "rgba(244, 114, 182, 0.46)"
    );
    orchidBloom.addColorStop(
      0.55,
      isLiveOverlay ? "rgba(217, 70, 239, 0.10)" : "rgba(217, 70, 239, 0.20)"
    );
    orchidBloom.addColorStop(1, "rgba(15, 15, 22, 0)");
    ctx.fillStyle = orchidBloom;
    ctx.fillRect(0, 0, width, height);

    // 1b. Viñeta oscura de estudio en el borde derecho y esquina superior derecha
    ctx.globalCompositeOperation = "source-over";
    const rightStudioDark = ctx.createLinearGradient(
      width * 0.62,
      0,
      width,
      0
    );
    rightStudioDark.addColorStop(0, "rgba(10, 10, 15, 0)");
    rightStudioDark.addColorStop(0.7, "rgba(10, 10, 15, 0.38)");
    rightStudioDark.addColorStop(1, "rgba(8, 8, 12, 0.72)");
    ctx.fillStyle = rightStudioDark;
    ctx.fillRect(0, 0, width, height);

    // 1c. Degradado oscuro inferior para máxima legibilidad del titular "WITH / LIKEME"
    const botGradH = Math.round(height * 0.32);
    const botGrad = ctx.createLinearGradient(0, height - botGradH, 0, height);
    botGrad.addColorStop(0, "rgba(6, 6, 10, 0)");
    botGrad.addColorStop(0.55, "rgba(6, 6, 10, 0.58)");
    botGrad.addColorStop(1, "rgba(4, 4, 7, 0.90)");
    ctx.fillStyle = botGrad;
    ctx.fillRect(0, height - botGradH, width, botGradH);
    ctx.restore();

    // -----------------------------------------------------------------------
    // 2. FRANJA VERTICAL NEGRA SÓLIDA EN EL COSTADO IZQUIERDO (~22.5% ANCHO)
    // -----------------------------------------------------------------------
    const sidebarW = Math.round(width * 0.225);
    ctx.save();
    ctx.fillStyle = "#040406";
    ctx.fillRect(0, 0, sidebarW, height);
    ctx.restore();

    // -----------------------------------------------------------------------
    // 3. TEXTO VERTICAL APILADO EN EL EXTREMO IZQUIERDO ("GET YOUR TRUE")
    // -----------------------------------------------------------------------
    const rawSideCaption = String(
      thirdText ||
        (subText ? subText.split("•")[0] : "") ||
        badgeText ||
        "GET YOUR TRUE"
    )
      .trim()
      .toUpperCase();
    // Conservar letras, números y espacios simples hasta 14 caracteres (como "GET YOUR TRUE")
    const sideCaptionClean =
      rawSideCaption
        .replace(/\s+/g, " ")
        .slice(0, 14)
        .trim() || "GET YOUR TRUE";

    const sideChars = Array.from(sideCaptionClean);
    const farLeftX = Math.round(width * 0.038);
    const sideTopY = Math.round(height * 0.038);
    const sideMaxSpanH = Math.round(height * 0.465);
    const sideStepY =
      sideChars.length > 1
        ? Math.min(Math.round(35 * u), sideMaxSpanH / sideChars.length)
        : Math.round(32 * u);
    const sideFontSize = Math.max(
      10,
      Math.min(Math.round(24 * u), Math.round(sideStepY * 0.78))
    );

    ctx.save();
    ctx.font = `800 ${sideFontSize}px "Segoe UI", "Arial Black", "Helvetica Neue", sans-serif`;
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    sideChars.forEach((ch, idx) => {
      if (ch !== " ") {
        ctx.fillText(ch, farLeftX, sideTopY + idx * sideStepY);
      }
    });
    ctx.restore();

    // -----------------------------------------------------------------------
    // 4. LETRAS GIGANTES HUECAS (OUTLINE BLANCO) EN COLUMNA ("B E A U T Y")
    //    Cabalgando exactamente entre la franja negra izquierda y la fotografía
    // -----------------------------------------------------------------------
    const { verticalWord, bottomPinkWord } = splitKineticTitle(mainText);
    const bigChars = Array.from(verticalWord || "KINETIC");
    const numBig = Math.max(1, bigChars.length);

    const colTopPad = Math.round(height * 0.022);
    const colBotPad = Math.round(height * 0.025);
    const usableColH = height - colTopPad - colBotPad;
    const slotH = usableColH / numBig;

    // Tamaño de cada letra gigante hueca adaptado a la cantidad de letras
    const outlineFontSize = Math.max(
      36,
      Math.min(Math.round(width * 0.255), Math.round(slotH * 1.12))
    );
    const outlineCenterX = sidebarW + Math.round(6 * u);

    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineJoin = "round";
    ctx.miterLimit = 2;

    bigChars.forEach((letter, idx) => {
      const slotCenterY = colTopPad + (idx + 0.5) * slotH;
      ctx.save();
      ctx.translate(outlineCenterX, slotCenterY);
      // Proporción geométrica ancha y monumental idéntica a la referencia
      ctx.scale(1.12, 0.96);
      ctx.font = `900 ${outlineFontSize}px "Arial Black", "Impact", "Segoe UI", sans-serif`;

      // Sombra oscura exterior sutil para que el trazo blanco resalte sobre zonas claras de la foto
      ctx.shadowColor = "rgba(0, 0, 0, 0.65)";
      ctx.shadowBlur = 8 * u;
      ctx.lineWidth = Math.max(1.8, 2.5 * u);
      ctx.strokeStyle = "#FFFFFF";
      ctx.strokeText(letter, 0, 0);
      ctx.restore();
    });
    ctx.restore();

    // -----------------------------------------------------------------------
    // 5. BLOQUE INFERIOR DERECHO: SUBTÍTULO BLANCO ("WITH") + TITULAR ROSA ("LIKEME")
    // -----------------------------------------------------------------------
    const lockupLeftX = Math.round(width * 0.342);
    const lockupRightMargin = Math.round(18 * u);
    const maxLockupW = Math.max(80, width - lockupLeftX - lockupRightMargin);
    const pinkBottomY = height - Math.round(18 * u);

    // 5a. Titular gigante inferior en Rosa Orquídea ("LIKEME")
    const pinkHeadline = (bottomPinkWord || mainText || "KINETIC").toUpperCase();
    ctx.save();
    const pinkFontSize = fitFontSize(
      ctx,
      pinkHeadline,
      maxLockupW,
      Math.round(116 * u),
      Math.round(34 * u),
      (s) => `900 ${s}px "Arial Black", "Segoe UI", "Helvetica Neue", sans-serif`
    );
    ctx.font = `900 ${pinkFontSize}px "Arial Black", "Segoe UI", "Helvetica Neue", sans-serif`;
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";

    const pinkGrad = ctx.createLinearGradient(
      lockupLeftX,
      pinkBottomY - pinkFontSize,
      lockupLeftX,
      pinkBottomY
    );
    pinkGrad.addColorStop(0, "#F38BCE");
    pinkGrad.addColorStop(0.55, "#EB7BC0");
    pinkGrad.addColorStop(1, "#DE64B0");

    ctx.fillStyle = pinkGrad;
    ctx.shadowColor = "rgba(0, 0, 0, 0.78)";
    ctx.shadowBlur = 10 * u;
    ctx.fillText(pinkHeadline, lockupLeftX, pinkBottomY);
    ctx.restore();

    // 5b. Subtítulo blanco superior ("WITH" / subText) alineado sobre el titular rosa
    const leadInY = pinkBottomY - Math.round(pinkFontSize * 0.92) - Math.round(6 * u);
    if (subText) {
      ctx.save();
      const subClean = subText.toUpperCase();
      const subSize = fitFontSize(
        ctx,
        subClean,
        maxLockupW,
        Math.round(30 * u),
        Math.round(12 * u),
        (s) => `800 ${s}px "Segoe UI", "Helvetica Neue", Arial, sans-serif`
      );
      ctx.font = `800 ${subSize}px "Segoe UI", "Helvetica Neue", Arial, sans-serif`;
      ctx.fillStyle = "#FFFFFF";
      ctx.textAlign = "left";
      ctx.textBaseline = "bottom";
      ctx.shadowColor = "rgba(0, 0, 0, 0.85)";
      ctx.shadowBlur = 7 * u;
      ctx.fillText(
        subClean,
        lockupLeftX + Math.round(10 * u),
        leadInY
      );
      ctx.restore();
    }

    // 5c. Si hay tercer subtítulo (thirdText), mostrarlo también sobre la línea "WITH"
    if (thirdText) {
      ctx.save();
      const thirdClean = thirdText.toUpperCase();
      const thirdY = subText
        ? leadInY - Math.round(30 * u)
        : leadInY;
      const thirdSize = fitFontSize(
        ctx,
        thirdClean,
        maxLockupW,
        Math.round(20 * u),
        Math.round(10 * u),
        (s) => `700 ${s}px "Segoe UI", "Helvetica Neue", Arial, sans-serif`
      );
      ctx.font = `700 ${thirdSize}px "Segoe UI", "Helvetica Neue", Arial, sans-serif`;
      ctx.fillStyle = "#F5B8DE";
      ctx.textAlign = "left";
      ctx.textBaseline = "bottom";
      ctx.shadowColor = "rgba(0, 0, 0, 0.85)";
      ctx.shadowBlur = 6 * u;
      ctx.fillText(
        thirdClean,
        lockupLeftX + Math.round(10 * u),
        thirdY
      );
      ctx.restore();
    }
  }

  // =========================================================================
  // DISEÑO 8: 🌊 VORTEX (FILTRO PLATA/TEAL + TITULAR VERTICAL CON RECORTE + SCRIPT)
  // =========================================================================
  else if (designId === "vortex") {
    const maxDim = Math.max(width, height);
    const isLiveOverlay = Boolean(overlayConfig.isLiveOverlay);

    // -----------------------------------------------------------------------
    // 1. FILTRO DE IMAGEN: ATMÓSFERA TEAL PETRÓLEO + CONTRASTE PLATA
    // -----------------------------------------------------------------------
    ctx.save();
    // 1a. Baño atmosférico Teal / Azul Petróleo sobre la escena (color / soft-light)
    ctx.globalCompositeOperation = isLiveOverlay ? "source-over" : "color";
    const tealAtmosphere = ctx.createLinearGradient(0, 0, width, height);
    tealAtmosphere.addColorStop(
      0,
      isLiveOverlay ? "rgba(8, 72, 92, 0.25)" : "rgba(6, 78, 99, 0.52)"
    );
    tealAtmosphere.addColorStop(
      0.5,
      isLiveOverlay ? "rgba(12, 115, 142, 0.16)" : "rgba(10, 110, 136, 0.34)"
    );
    tealAtmosphere.addColorStop(
      1,
      isLiveOverlay ? "rgba(4, 45, 58, 0.28)" : "rgba(4, 52, 68, 0.62)"
    );
    ctx.fillStyle = tealAtmosphere;
    ctx.fillRect(0, 0, width, height);

    // 1b. Resplandor Cyan-Teal en esquina superior derecha y centro (reflejo frío)
    ctx.globalCompositeOperation = isLiveOverlay ? "source-over" : "screen";
    const cyanRimGlow = ctx.createRadialGradient(
      width * 0.78,
      height * 0.24,
      maxDim * 0.04,
      width * 0.72,
      height * 0.32,
      maxDim * 0.68
    );
    cyanRimGlow.addColorStop(
      0,
      isLiveOverlay ? "rgba(21, 166, 196, 0.26)" : "rgba(18, 178, 212, 0.44)"
    );
    cyanRimGlow.addColorStop(
      0.55,
      isLiveOverlay ? "rgba(8, 95, 118, 0.14)" : "rgba(8, 102, 128, 0.24)"
    );
    cyanRimGlow.addColorStop(1, "rgba(2, 20, 28, 0)");
    ctx.fillStyle = cyanRimGlow;
    ctx.fillRect(0, 0, width, height);

    // 1c. Sombra profunda abisal en el costado izquierdo (para respaldar el titular vertical)
    ctx.globalCompositeOperation = "source-over";
    const leftShadowW = Math.round(width * 0.31);
    const leftDarkGrad = ctx.createLinearGradient(0, 0, leftShadowW, 0);
    leftDarkGrad.addColorStop(0, "rgba(1, 8, 12, 0.94)");
    leftDarkGrad.addColorStop(0.46, "rgba(2, 12, 18, 0.68)");
    leftDarkGrad.addColorStop(1, "rgba(2, 12, 18, 0)");
    ctx.fillStyle = leftDarkGrad;
    ctx.fillRect(0, 0, leftShadowW, height);

    // 1d. Degradado inferior azul petróleo oscuro para resaltar "Save the Date" y el pie serif
    const botTealH = Math.round(height * 0.34);
    const botTealGrad = ctx.createLinearGradient(
      0,
      height - botTealH,
      0,
      height
    );
    botTealGrad.addColorStop(0, "rgba(2, 16, 23, 0)");
    botTealGrad.addColorStop(0.52, "rgba(2, 18, 26, 0.62)");
    botTealGrad.addColorStop(1, "rgba(1, 11, 16, 0.92)");
    ctx.fillStyle = botTealGrad;
    ctx.fillRect(0, height - botTealH, width, botTealH);
    ctx.restore();

    // -----------------------------------------------------------------------
    // 2. TITULAR VERTICAL GIGANTE ROTADO (+90°) CON EFECTO SPLIT (TEAL SÓLIDO + OUTLINE BLANCO)
    //    Estilo exacto "F A S H I O N": relleno turquesa con recorte de línea blanca al centro
    // -----------------------------------------------------------------------
    const { verticalBannerWord, scriptPhrase } = splitVortexTitle(mainText);
    const bannerWord = (verticalBannerWord || "VORTEX").toUpperCase();

    const bannerCenterX = Math.round(width * 0.142);
    const bannerTopY = Math.round(height * 0.035);
    const bannerBotY = Math.round(height * 0.908);
    const bannerSpanH = Math.max(120, bannerBotY - bannerTopY);
    const bannerCenterY = bannerTopY + bannerSpanH / 2;

    // Ajustar tamaño para que la palabra rotada +90° cubra de arriba a abajo como "FASHION"
    const initialBannerFont = Math.round(width * 0.245);
    const minBannerFont = Math.round(width * 0.11);
    const bannerFontSize = fitFontSize(
      ctx,
      bannerWord,
      bannerSpanH / 1.08,
      initialBannerFont,
      minBannerFont,
      (s) => `900 ${s}px "Impact", "Arial Black", "Segoe UI", sans-serif`
    );

    // Ventana de recorte ("Knockout Zone") donde las letras centrales (S, H, I) pasan a trazo blanco hueco
    const knockoutX = Math.round(width * 0.122);
    const knockoutY = Math.round(height * 0.255);
    const knockoutW = Math.round(width * 0.24);
    const knockoutH = Math.round(height * 0.365);

    const drawRotatedBannerText = (mode) => {
      ctx.save();
      ctx.translate(bannerCenterX, bannerCenterY);
      ctx.rotate(Math.PI / 2);
      ctx.scale(1.06, 1.16);
      ctx.font = `900 ${bannerFontSize}px "Impact", "Arial Black", "Segoe UI", sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const tracking = Math.round(6 * u);
      const chars = Array.from(bannerWord);
      const charWidths = chars.map((ch) => ctx.measureText(ch).width);
      const totalW =
        charWidths.reduce((acc, w) => acc + w, 0) +
        tracking * Math.max(0, chars.length - 1);
      let cursorX = -totalW / 2;

      chars.forEach((ch, idx) => {
        const chCenter = cursorX + charWidths[idx] / 2;
        if (mode === "fill") {
          ctx.fillText(ch, chCenter, 0);
        } else {
          ctx.strokeText(ch, chCenter, 0);
        }
        cursorX += charWidths[idx] + tracking;
      });
      ctx.restore();
    };

    // 2a. Pasada 1: Relleno Turquesa / Cyan Petróleo (#17A9C8 -> #0E87A3) fuera de la ventana de recorte
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, width, height);
    ctx.rect(knockoutX, knockoutY, knockoutW, knockoutH);
    ctx.clip("evenodd");

    const cyanFillGrad = ctx.createLinearGradient(0, bannerTopY, 0, bannerBotY);
    cyanFillGrad.addColorStop(0, "#19B2D2");
    cyanFillGrad.addColorStop(0.5, "#149BB8");
    cyanFillGrad.addColorStop(1, "#0E85A1");
    ctx.fillStyle = cyanFillGrad;
    ctx.shadowColor = "rgba(0, 0, 0, 0.55)";
    ctx.shadowBlur = 10 * u;
    drawRotatedBannerText("fill");
    ctx.restore();

    // 2b. Pasada 2: Trazo Blanco Puro Hueco (#FFFFFF) dentro de la ventana de recorte central
    ctx.save();
    ctx.beginPath();
    ctx.rect(knockoutX, knockoutY, knockoutW, knockoutH);
    ctx.clip();

    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = Math.max(1.8, 2.5 * u);
    ctx.lineJoin = "round";
    ctx.shadowColor = "rgba(0, 0, 0, 0.65)";
    ctx.shadowBlur = 6 * u;
    drawRotatedBannerText("stroke");
    ctx.restore();

    // -----------------------------------------------------------------------
    // 3. CALIGRAFÍA FINA EN BLANCO ("Save the Date") EN LA ZONA INFERIOR
    // -----------------------------------------------------------------------
    if (scriptPhrase) {
      ctx.save();
      const scriptCenterX = Math.round(width * 0.545);
      const scriptCenterY = Math.round(height * 0.825);
      const maxScriptW = Math.round(width * 0.72);
      const scriptFontSize = fitFontSize(
        ctx,
        scriptPhrase,
        maxScriptW,
        Math.round(78 * u),
        Math.round(28 * u),
        (s) =>
          `italic 400 ${s}px "Segoe Script", "Brush Script MT", "Lucida Handwriting", "Georgia", cursive`
      );
      ctx.translate(scriptCenterX, scriptCenterY);
      ctx.rotate((-3.5 * Math.PI) / 180);
      ctx.font = `italic 400 ${scriptFontSize}px "Segoe Script", "Brush Script MT", "Lucida Handwriting", "Georgia", cursive`;
      ctx.fillStyle = "#FFFFFF";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowColor = "rgba(0, 0, 0, 0.82)";
      ctx.shadowBlur = 10 * u;
      ctx.fillText(scriptPhrase, 0, 0);
      ctx.restore();
    }

    // -----------------------------------------------------------------------
    // 4. PIE EDITORIAL EN SERIF BLANCO DE 2 LÍNEAS ("MEN AND WOMEN ARE / INVITED...")
    // -----------------------------------------------------------------------
    const [serifLine1, serifLine2] = splitVortexFooterLines(
      subText,
      thirdText,
      badgeText
    );
    const footerCenterX = Math.round(width * 0.5);
    const maxFooterW = Math.round(width * 0.84);
    const line1Y = height - Math.round(62 * u);
    const line2Y = height - Math.round(30 * u);

    ctx.save();
    ctx.fillStyle = "#F8FAFC";
    ctx.textBaseline = "bottom";
    ctx.shadowColor = "rgba(0, 0, 0, 0.88)";
    ctx.shadowBlur = 8 * u;

    if (serifLine1) {
      const s1 = fitFontSize(
        ctx,
        serifLine1,
        maxFooterW,
        Math.round(24 * u),
        Math.round(11 * u),
        (s) => `700 ${s}px "Georgia", "Times New Roman", serif`
      );
      ctx.font = `700 ${s1}px "Georgia", "Times New Roman", serif`;
      drawTrackedText(
        ctx,
        serifLine1,
        footerCenterX,
        line1Y,
        Math.round(1.5 * u)
      );
    }

    if (serifLine2) {
      const s2 = fitFontSize(
        ctx,
        serifLine2,
        maxFooterW,
        Math.round(24 * u),
        Math.round(11 * u),
        (s) => `700 ${s}px "Georgia", "Times New Roman", serif`
      );
      ctx.font = `700 ${s2}px "Georgia", "Times New Roman", serif`;
      drawTrackedText(
        ctx,
        serifLine2,
        footerCenterX,
        line2Y,
        Math.round(1.5 * u)
      );
    }
    ctx.restore();
  }

  // =========================================================================
  // DISEÑO 9: 🔶 KINETIC / COLOR VEIL (TRÍPTICO B&N + FRANJA TERRACOTA + SERIF)
  // =========================================================================
  else if (designId === "color-veil") {
    const isLiveOverlay = Boolean(overlayConfig.isLiveOverlay);

    // Coordenadas exactas de la franja central vertical (40% a 65.8% del ancho)
    const stripLeftX = Math.round(width * 0.4);
    const stripRightX = Math.round(width * 0.658);
    const stripW = Math.max(20, stripRightX - stripLeftX);

    // -----------------------------------------------------------------------
    // 1. FILTRO SELECTIVO TRÍPTICO: LATERALES B&N + FRANJA CENTRAL TERRACOTA
    // -----------------------------------------------------------------------
    ctx.save();
    if (!isLiveOverlay) {
      // 1a. Desaturar a Blanco y Negro puro el panel izquierdo (0 -> stripLeftX) y derecho (stripRightX -> width)
      ctx.globalCompositeOperation = "saturation";
      ctx.fillStyle = "hsl(0, 0%, 50%)";
      ctx.fillRect(0, 0, stripLeftX, height);
      ctx.fillRect(stripRightX, 0, width - stripRightX, height);

      // Contraste mate suave en los paneles B&N laterales
      ctx.globalCompositeOperation = "soft-light";
      ctx.fillStyle = "rgba(18, 18, 20, 0.36)";
      ctx.fillRect(0, 0, stripLeftX, height);
      ctx.fillRect(stripRightX, 0, width - stripRightX, height);
    } else {
      // En visor WebRTC en vivo (lienzo transparente sobre video), simular velo gris oscuro en laterales
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgba(22, 22, 24, 0.52)";
      ctx.fillRect(0, 0, stripLeftX, height);
      ctx.fillRect(stripRightX, 0, width - stripRightX, height);
    }

    // 1b. Velo cálido Terracota / Coral Quemado (#E2502B / #D94826) en la franja vertical central
    ctx.globalCompositeOperation = isLiveOverlay ? "source-over" : "color";
    const veilColorGrad = ctx.createLinearGradient(0, 0, 0, height);
    veilColorGrad.addColorStop(
      0,
      isLiveOverlay ? "rgba(218, 72, 36, 0.24)" : "rgba(214, 72, 36, 0.56)"
    );
    veilColorGrad.addColorStop(
      0.5,
      isLiveOverlay ? "rgba(232, 86, 44, 0.18)" : "rgba(228, 84, 42, 0.42)"
    );
    veilColorGrad.addColorStop(
      1,
      isLiveOverlay ? "rgba(185, 56, 26, 0.28)" : "rgba(196, 62, 30, 0.62)"
    );
    ctx.fillStyle = veilColorGrad;
    ctx.fillRect(stripLeftX, 0, stripW, height);

    // Resplandor cálido cobrizo adicional dentro de la franja central
    ctx.globalCompositeOperation = isLiveOverlay ? "source-over" : "soft-light";
    const warmCenterGlow = ctx.createRadialGradient(
      stripLeftX + stripW * 0.45,
      height * 0.46,
      stripW * 0.05,
      stripLeftX + stripW * 0.5,
      height * 0.48,
      height * 0.55
    );
    warmCenterGlow.addColorStop(
      0,
      isLiveOverlay ? "rgba(245, 110, 62, 0.22)" : "rgba(248, 115, 68, 0.48)"
    );
    warmCenterGlow.addColorStop(1, "rgba(120, 32, 14, 0)");
    ctx.fillStyle = warmCenterGlow;
    ctx.fillRect(stripLeftX, 0, stripW, height);

    // 1c. Viñeta oscura editorial en bordes exteriores y parte inferior para legibilidad perfecta
    ctx.globalCompositeOperation = "source-over";
    const botDarkH = Math.round(height * 0.36);
    const botDarkGrad = ctx.createLinearGradient(
      0,
      height - botDarkH,
      0,
      height
    );
    botDarkGrad.addColorStop(0, "rgba(12, 10, 10, 0)");
    botDarkGrad.addColorStop(0.55, "rgba(12, 10, 10, 0.48)");
    botDarkGrad.addColorStop(1, "rgba(10, 8, 8, 0.84)");
    ctx.fillStyle = botDarkGrad;
    ctx.fillRect(0, height - botDarkH, width, botDarkH);
    ctx.restore();

    // -----------------------------------------------------------------------
    // 2. LÍNEAS DIVISORIAS VERTICALES DE LA FRANJA CENTRAL + HUD TÉCNICO EDITORIAL
    // -----------------------------------------------------------------------
    ctx.save();
    // 2a. Dos líneas verticales finas que delimitan la franja terracota central
    const lineGrad = ctx.createLinearGradient(0, 0, 0, height);
    lineGrad.addColorStop(0, "rgba(235, 220, 210, 0.42)");
    lineGrad.addColorStop(0.5, "rgba(245, 215, 198, 0.72)");
    lineGrad.addColorStop(1, "rgba(226, 80, 43, 0.52)");
    ctx.strokeStyle = lineGrad;
    ctx.lineWidth = Math.max(1, 1.5 * u);

    ctx.beginPath();
    ctx.moveTo(stripLeftX, 0);
    ctx.lineTo(stripLeftX, height);
    ctx.moveTo(stripRightX, 0);
    ctx.lineTo(stripRightX, height);
    ctx.stroke();

    // 2b. HUD Técnico Superior Izquierdo ("2026 / BEAUTY EDITORIAL")
    const hudLeftX = Math.round(width * 0.054);
    const hudTopY = Math.round(height * 0.032);
    ctx.strokeStyle = "rgba(214, 210, 204, 0.42)";
    ctx.lineWidth = Math.max(0.8, 1 * u);

    // Línea horizontal superior izquierda con cruce
    ctx.beginPath();
    ctx.moveTo(Math.round(width * 0.025), hudTopY);
    ctx.lineTo(Math.round(width * 0.16), hudTopY);
    ctx.moveTo(Math.round(width * 0.03), Math.round(height * 0.075));
    ctx.lineTo(Math.round(width * 0.03), Math.round(height * 0.68));
    ctx.stroke();

    // Dos pequeños círculos técnicos en la línea lateral izquierda
    const techX = Math.round(width * 0.03);
    [Math.round(height * 0.212), Math.round(height * 0.23)].forEach((cy) => {
      ctx.beginPath();
      ctx.arc(techX, cy, Math.max(1.8, 2.8 * u), 0, Math.PI * 2);
      ctx.stroke();
    });

    // Año + Etiqueta superior izquierda
    const yearStr = (() => {
      const m = String(overlayConfig.eventDate || "").match(/(\d{4})/);
      return m ? m[1] : String(new Date().getFullYear());
    })();
    const microFont = Math.max(8, Math.round(12 * u));
    ctx.font = `600 ${microFont}px "Segoe UI", "Helvetica Neue", Arial, sans-serif`;
    ctx.fillStyle = "rgba(218, 214, 208, 0.78)";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(yearStr, hudLeftX, hudTopY + Math.round(12 * u));

    const badgeWords = String(badgeText || "BEAUTY EDITORIAL")
      .toUpperCase()
      .split(/\s+/)
      .filter(Boolean);
    const bw1 = badgeWords[0] || "BEAUTY";
    const bw2 = badgeWords.slice(1).join(" ") || "EDITORIAL";
    ctx.fillText(bw1, hudLeftX, hudTopY + Math.round(32 * u));
    ctx.fillText(bw2, hudLeftX, hudTopY + Math.round(47 * u));

    // 2c. HUD Superior Derecho ("01" + Punto Coral + Texto Vertical Rotado + Línea Derecha)
    const hudRightX = Math.round(width * 0.945);
    const numFont = Math.max(14, Math.round(28 * u));
    ctx.font = `400 ${numFont}px "Georgia", "Times New Roman", serif`;
    ctx.fillStyle = "#E6E1DA";
    ctx.textAlign = "right";
    ctx.textBaseline = "top";
    ctx.fillText("01", hudRightX, hudTopY + Math.round(2 * u));

    // Punto circular Naranja/Terracota debajo de "01"
    const dotX = hudRightX - Math.round(8 * u);
    const dotY = hudTopY + Math.round(42 * u);
    ctx.fillStyle = "#E2502B";
    ctx.beginPath();
    ctx.arc(dotX, dotY, Math.max(2.5, 4.5 * u), 0, Math.PI * 2);
    ctx.fill();

    // Texto vertical en el margen superior derecho
    const vertRightLabel = String(
      thirdText || "EXPERIMENTAL VISUAL IDENTITY"
    )
      .toUpperCase()
      .slice(0, 32);
    ctx.save();
    ctx.translate(dotX, dotY + Math.round(22 * u));
    ctx.rotate(Math.PI / 2);
    ctx.font = `600 ${Math.max(7, Math.round(10.5 * u))}px "Segoe UI", "Helvetica Neue", sans-serif`;
    ctx.fillStyle = "rgba(218, 214, 208, 0.75)";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    drawTrackedText(
      ctx,
      vertRightLabel,
      Math.round(vertRightLabel.length * 3.8 * u),
      0,
      Math.round(2.5 * u)
    );
    ctx.restore();

    // Línea técnica lateral derecha e indicador inferior derecho "No. 01 / 26"
    const rightTechX = Math.round(width * 0.97);
    ctx.strokeStyle = "rgba(214, 210, 204, 0.42)";
    ctx.beginPath();
    ctx.moveTo(rightTechX, Math.round(height * 0.02));
    ctx.lineTo(rightTechX, Math.round(height * 0.25));
    ctx.moveTo(rightTechX, Math.round(height * 0.78));
    ctx.lineTo(rightTechX, Math.round(height * 0.96));
    ctx.stroke();

    // Pequeño símbolo "+" sobre el número inferior derecho
    const plusX = Math.round(width * 0.94);
    const plusY = Math.round(height * 0.882);
    const plusR = Math.max(3, Math.round(5 * u));
    ctx.beginPath();
    ctx.moveTo(plusX - plusR, plusY);
    ctx.lineTo(plusX + plusR, plusY);
    ctx.moveTo(plusX, plusY - plusR);
    ctx.lineTo(plusX, plusY + plusR);
    ctx.stroke();

    // "No. 01 / 26" en esquina inferior derecha
    const noBaseY = height - Math.round(28 * u);
    const rightCounterX = Math.round(width * 0.94);
    ctx.font = `600 ${Math.max(8, Math.round(11 * u))}px "Segoe UI", sans-serif`;
    ctx.fillStyle = "rgba(214, 210, 204, 0.75)";
    ctx.textAlign = "right";
    ctx.textBaseline = "bottom";
    ctx.fillText(
      "No.",
      rightCounterX - Math.round(34 * u),
      noBaseY - Math.round(28 * u)
    );

    ctx.font = `400 ${Math.max(13, Math.round(24 * u))}px "Georgia", "Times New Roman", serif`;
    ctx.fillStyle = "#EAE3DC";
    ctx.fillText("01", rightCounterX - Math.round(34 * u), noBaseY);

    ctx.font = `400 ${Math.max(11, Math.round(18 * u))}px "Georgia", "Times New Roman", serif`;
    ctx.fillStyle = "#D94E28";
    ctx.fillText(`/${yearStr.slice(-2)}`, rightCounterX, noBaseY);
    ctx.restore();

    // -----------------------------------------------------------------------
    // 3. TITULAR PRINCIPAL SERIF DE 2 LÍNEAS: "COLOR" (MARFIL) + "VEIL" (TERRACOTA)
    // -----------------------------------------------------------------------
    const { ivoryLine, terracottaLine } = splitColorVeilTitle(mainText);
    const titleLeftX = Math.round(width * 0.055);
    const maxTitleW = Math.round(width * 0.78);

    const line1BaseY = Math.round(height * 0.795);
    const line2BaseY = Math.round(height * 0.882);

    ctx.save();
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";

    // Línea 1: Serif Editorial en Blanco Marfil (#EAE3DC)
    const font1Size = fitFontSize(
      ctx,
      ivoryLine,
      maxTitleW,
      Math.round(96 * u),
      Math.round(32 * u),
      (s) => `400 ${s}px "Georgia", "Times New Roman", "Playfair Display", serif`
    );
    ctx.font = `400 ${font1Size}px "Georgia", "Times New Roman", "Playfair Display", serif`;
    ctx.fillStyle = "#EAE3DC";
    ctx.shadowColor = "rgba(0, 0, 0, 0.55)";
    ctx.shadowBlur = 8 * u;
    ctx.fillText(ivoryLine, titleLeftX, line1BaseY);

    // Línea 2: Serif Editorial en Terracota / Coral Quemado (#E2502B)
    const font2Size = fitFontSize(
      ctx,
      terracottaLine,
      maxTitleW,
      Math.round(112 * u),
      Math.round(36 * u),
      (s) => `400 ${s}px "Georgia", "Times New Roman", "Playfair Display", serif`
    );
    ctx.font = `400 ${font2Size}px "Georgia", "Times New Roman", "Playfair Display", serif`;
    const terraGrad = ctx.createLinearGradient(
      titleLeftX,
      line2BaseY - font2Size,
      titleLeftX,
      line2BaseY
    );
    terraGrad.addColorStop(0, "#EB5A34");
    terraGrad.addColorStop(0.55, "#E04E28");
    terraGrad.addColorStop(1, "#C43E1C");
    ctx.fillStyle = terraGrad;
    ctx.fillText(terracottaLine, titleLeftX, line2BaseY);
    ctx.restore();

    // -----------------------------------------------------------------------
    // 4. BLOQUE INFERIOR IZQUIERDO (SUBTÍTULO 1 Y SUBTÍTULO 2) + BARRA DE 6 CUADROS
    // -----------------------------------------------------------------------
    const subLeftX = Math.round(width * 0.062);
    const maxSubW = Math.round(width * 0.76);
    const subStartTopY = Math.round(height * 0.902);
    const subLineStep = Math.round(19 * u);

    const editorialLines = [];
    if (subText) {
      if (subText.includes("•") && !thirdText) {
        subText
          .split("•")
          .map((s) => s.trim().toUpperCase())
          .filter(Boolean)
          .forEach((p) => editorialLines.push(p));
      } else {
        editorialLines.push(subText.toUpperCase());
      }
    } else {
      editorialLines.push("SELECTIVE FOCUS EDITORIAL");
    }

    if (thirdText) {
      editorialLines.push(thirdText.toUpperCase());
    } else if (editorialLines.length < 2) {
      editorialLines.push(`BEAUTY CAMPAIGN ${yearStr}`);
    }

    ctx.save();
    ctx.fillStyle = "rgba(212, 208, 202, 0.86)";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.shadowColor = "rgba(0, 0, 0, 0.75)";
    ctx.shadowBlur = 4 * u;

    editorialLines.slice(0, 3).forEach((lineStr, idx) => {
      const fSize = fitFontSize(
        ctx,
        lineStr,
        maxSubW,
        Math.round(13.5 * u),
        Math.round(8.5 * u),
        (s) => `600 ${s}px "Segoe UI", "Helvetica Neue", Arial, sans-serif`
      );
      ctx.font = `600 ${fSize}px "Segoe UI", "Helvetica Neue", Arial, sans-serif`;
      // Espaciado editorial amplio
      const chars = Array.from(lineStr);
      const track = Math.max(0.8, 1.8 * u);
      let cx = subLeftX;
      const cy = subStartTopY + idx * subLineStep;
      chars.forEach((ch) => {
        ctx.fillText(ch, cx, cy);
        cx += ctx.measureText(ch).width + track;
      });
    });

    // Barra inferior izquierda de 6 pequeños cuadros de paleta (Marfil -> Terracota)
    const swatchColors = [
      "#EAE3DC",
      "#DFD5CC",
      "#C9B8AC",
      "#E27B58",
      "#E2502B",
      "#9E331A",
    ];
    const sqSize = Math.max(3, Math.round(5.5 * u));
    const sqGap = Math.max(4, Math.round(9 * u));
    const sqY = height - Math.round(28 * u);

    // Pequeña línea horizontal sobre el primer cuadro
    ctx.strokeStyle = "rgba(234, 227, 220, 0.65)";
    ctx.lineWidth = Math.max(1, 1.2 * u);
    ctx.beginPath();
    ctx.moveTo(subLeftX, sqY - Math.round(7 * u));
    ctx.lineTo(subLeftX + Math.round(16 * u), sqY - Math.round(7 * u));
    ctx.stroke();

    swatchColors.forEach((hex, idx) => {
      ctx.fillStyle = hex;
      ctx.fillRect(subLeftX + idx * (sqSize + sqGap), sqY, sqSize, sqSize);
    });
    ctx.restore();
  }

  // =========================================================================
  // DISEÑO 10: 🍷 HAZE (MOSAICO VINO BURDEOS + FILTRO FILM VINTAGE + OUTLINE)
  // =========================================================================
  else if (designId === "haze") {
    const isLiveOverlay = Boolean(overlayConfig.isLiveOverlay);
    const burgundyHex = "#3A181D";

    // -----------------------------------------------------------------------
    // 1. FILTRO DE IMAGEN: VELO CÁLIDO VINTAGE FILM HAZE SOBRE LA FOTOGRAFÍA
    // -----------------------------------------------------------------------
    ctx.save();
    if (!isLiveOverlay) {
      // Tono cálido terroso / película analógica suave
      ctx.globalCompositeOperation = "soft-light";
      const filmGrad = ctx.createLinearGradient(0, 0, width, height);
      filmGrad.addColorStop(0, "rgba(168, 128, 96, 0.28)");
      filmGrad.addColorStop(0.5, "rgba(205, 142, 102, 0.22)");
      filmGrad.addColorStop(1, "rgba(92, 48, 42, 0.34)");
      ctx.fillStyle = filmGrad;
      ctx.fillRect(0, 0, width, height);
    }
    ctx.restore();

    // -----------------------------------------------------------------------
    // 2. GEOMETRÍA DE LA REJILLA MOSAICO ASIMÉTRICA (4 FILAS x 3 COLUMNAS)
    // -----------------------------------------------------------------------
    const gridLeft = Math.round(width * 0.095);
    const gridRight = Math.round(width * 0.945);
    const gridTop = Math.round(height * 0.055);
    const gridBottom = Math.round(height * 0.802);

    const totalGridW = Math.max(100, gridRight - gridLeft);
    const totalGridH = Math.max(100, gridBottom - gridTop);
    const gap = Math.max(4, Math.round(9 * u));

    // 3 Columnas (proporciones idénticas a la referencia: ~30.5%, ~26.5%, ~43%)
    const usableW = totalGridW - gap * 2;
    const colW0 = Math.round(usableW * 0.305);
    const colW1 = Math.round(usableW * 0.265);
    const colW2 = usableW - colW0 - colW1;

    const colX = [
      gridLeft,
      gridLeft + colW0 + gap,
      gridLeft + colW0 + gap + colW1 + gap,
    ];
    const colW = [colW0, colW1, colW2];

    // 4 Filas iguales separadas por calles color Vino Burdeos
    const usableH = totalGridH - gap * 3;
    const rowH = Math.floor(usableH / 4);
    const rowY = [
      gridTop,
      gridTop + rowH + gap,
      gridTop + (rowH + gap) * 2,
      gridTop + (rowH + gap) * 3,
    ];
    const rowHeights = [
      rowH,
      rowH,
      rowH,
      totalGridH - (rowH + gap) * 3,
    ];

    // Celdas donde la fotografía queda VISIBLE (las demás se cubren con Vino Burdeos)
    const visiblePhotoCells = [
      [0, 0], // Arriba-Izquierda (detrás de la "H")
      [1, 0],
      [1, 1],
      [1, 2], // Segunda fila completa (mirada)
      [2, 1],
      [2, 2], // Tercera fila centro y derecha
      [3, 0],
      [3, 1], // Cuarta fila izquierda y centro
    ];

    // Usamos even-odd clipping para pintar Vino Burdeos (#3A181D) en TODO el lienzo
    // EXCEPTO dentro de las 8 ventanas fotográficas visibles
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, width, height);
    visiblePhotoCells.forEach(([r, c]) => {
      ctx.rect(colX[c], rowY[r], colW[c], rowHeights[r]);
    });
    ctx.fillStyle = burgundyHex;
    ctx.fill("evenodd");
    ctx.restore();

    // Tinte gris-oliva suave sobre la celda (0, 0) para que la letra vino resalte como en el póster
    ctx.save();
    ctx.fillStyle = "rgba(42, 46, 44, 0.34)";
    ctx.fillRect(colX[0], rowY[0], colW[0], rowHeights[0]);

    // Borde fino claro alrededor de cada una de las 8 celdas de foto visibles
    ctx.strokeStyle = "rgba(218, 206, 200, 0.34)";
    ctx.lineWidth = Math.max(1, 1.3 * u);
    visiblePhotoCells.forEach(([r, c]) => {
      ctx.strokeRect(colX[c], rowY[r], colW[c], rowHeights[r]);
    });
    ctx.restore();

    // -----------------------------------------------------------------------
    // 3. TÍTULO PRINCIPAL EN FILA SUPERIOR ("H  E  R" / TÍTULO PRINCIPAL)
    // -----------------------------------------------------------------------
    const cleanTitle = String(mainText || "HAZE")
      .trim()
      .toUpperCase();
    const compactChars = Array.from(cleanTitle.replace(/\s+/g, ""));
    const firstLetter = compactChars[0] || "H";

    const cell0CenterX = colX[0] + colW[0] / 2;
    const cell0CenterY = rowY[0] + rowHeights[0] / 2;
    const bigLetterH = Math.round(rowHeights[0] * 0.88);

    // 3a. Primera letra ("H") rellena en color Vino Burdeos sólido dentro del recuadro (0, 0)
    ctx.save();
    ctx.translate(cell0CenterX, cell0CenterY);
    ctx.scale(1.22, 1);
    ctx.font = `900 ${bigLetterH}px "Arial Black", "Impact", "Segoe UI", sans-serif`;
    ctx.fillStyle = burgundyHex;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(firstLetter, 0, Math.round(4 * u));
    ctx.restore();

    // 3b. Letras huecas con trazo blanco (#FFFFFF) en las celdas (0, 1) y (0, 2)
    ctx.save();
    ctx.strokeStyle = "#F8F2F0";
    ctx.lineWidth = Math.max(1.8, 2.5 * u);
    ctx.lineJoin = "miter";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const rightSpanX = colX[1];
    const rightSpanW = colX[2] + colW[2] - colX[1];

    if (!cleanTitle.includes(" ") && compactChars.length >= 2 && compactChars.length <= 5) {
      // Si es una palabra corta de 2 a 5 letras (ej. "HER", "HAZE", "BODA", "GALA"),
      // repartir las letras restantes a lo largo de (0, 1) y (0, 2) en tamaño monumental
      const restChars = compactChars.slice(1);
      const slotW = rightSpanW / restChars.length;
      const outlineSize = Math.min(
        bigLetterH,
        Math.round((slotW / Math.max(1, restChars.length * 0.48)) * 0.92)
      );
      restChars.forEach((ch, idx) => {
        const cx = rightSpanX + (idx + 0.5) * slotW;
        ctx.save();
        ctx.translate(cx, cell0CenterY);
        ctx.scale(1.18, 1);
        ctx.font = `900 ${outlineSize}px "Arial Black", "Impact", "Segoe UI", sans-serif`;
        ctx.strokeText(ch, 0, Math.round(4 * u));
        ctx.restore();
      });
    } else {
      // Si el usuario escribió un título completo o con varias palabras (ej. "CUMPLE DE LUIS"),
      // mostrar el Título Principal completo en letras huecas blancas dentro del bloque superior derecho
      const words = cleanTitle.split(/\s+/).filter(Boolean);
      if (words.length <= 2 && cleanTitle.length <= 12) {
        const fSize = fitFontSize(
          ctx,
          cleanTitle,
          rightSpanW * 0.92,
          Math.round(rowHeights[0] * 0.72),
          Math.round(24 * u),
          (s) => `900 ${s}px "Arial Black", "Impact", "Segoe UI", sans-serif`
        );
        ctx.font = `900 ${fSize}px "Arial Black", "Impact", "Segoe UI", sans-serif`;
        ctx.strokeText(
          cleanTitle,
          rightSpanX + rightSpanW / 2,
          cell0CenterY + Math.round(3 * u)
        );
      } else {
        const mid = Math.ceil(words.length / 2);
        const topLine = words.slice(0, mid).join(" ");
        const botLine = words.slice(mid).join(" ");
        const maxLine =
          topLine.length >= botLine.length ? topLine : botLine;
        const fSize = fitFontSize(
          ctx,
          maxLine,
          rightSpanW * 0.92,
          Math.round(rowHeights[0] * 0.44),
          Math.round(18 * u),
          (s) => `900 ${s}px "Arial Black", "Impact", "Segoe UI", sans-serif`
        );
        ctx.font = `900 ${fSize}px "Arial Black", "Impact", "Segoe UI", sans-serif`;
        ctx.lineWidth = Math.max(1.5, 2.1 * u);
        ctx.strokeText(
          topLine,
          rightSpanX + rightSpanW / 2,
          cell0CenterY - Math.round(fSize * 0.56)
        );
        if (botLine) {
          ctx.strokeText(
            botLine,
            rightSpanX + rightSpanW / 2,
            cell0CenterY + Math.round(fSize * 0.58)
          );
        }
      }
    }
    ctx.restore();

    // -----------------------------------------------------------------------
    // 4. SUBTÍTULO 1 EN LA CELDA VINO MEDIA-IZQUIERDA (FILA 2, COLUMNA 0)
    // -----------------------------------------------------------------------
    const leftBlockText =
      subText ||
      badgeText ||
      "Recuerdo especial capturado en alta definición";
    const cell2LeftPad = colX[0] + Math.round(18 * u);
    const cell2MaxW = Math.max(40, colW[0] - Math.round(30 * u));
    const cell2FontSize = Math.max(10, Math.round(18.5 * u));
    const cell2LineStep = Math.round(cell2FontSize * 1.34);

    ctx.save();
    ctx.font = `400 ${cell2FontSize}px "Segoe UI", "Helvetica Neue", Arial, sans-serif`;
    ctx.fillStyle = "#F5ECEA";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";

    const wrappedLeftLines = wrapTextIntoLines(
      ctx,
      leftBlockText,
      cell2MaxW,
      6
    );
    const totalLeftTextH = wrappedLeftLines.length * cell2LineStep;
    const startLeftY =
      rowY[2] + Math.max(Math.round(10 * u), (rowHeights[2] - totalLeftTextH) / 2);

    wrappedLeftLines.forEach((line, idx) => {
      ctx.fillText(line, cell2LeftPad, startLeftY + idx * cell2LineStep);
    });
    ctx.restore();

    // -----------------------------------------------------------------------
    // 5. SUBTÍTULO 2 (Y COMPLEMENTO EDITORIAL) EN EL PIE INFERIOR CENTRADO
    // -----------------------------------------------------------------------
    const footerText =
      thirdText && subText
        ? `${subText}  •  ${thirdText}`
        : thirdText ||
          subText ||
          `${cleanTitle} • ${badgeText}`;

    const footerCenterX = Math.round(width * 0.5);
    const footerMaxW = Math.round(width * 0.82);
    const footerFontSize = Math.max(10, Math.round(18 * u));
    const footerLineStep = Math.round(footerFontSize * 1.38);

    ctx.save();
    ctx.font = `400 ${footerFontSize}px "Segoe UI", "Helvetica Neue", Arial, sans-serif`;
    ctx.fillStyle = "#F5ECEA";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    const footerLines = wrapTextIntoLines(ctx, footerText, footerMaxW, 2);
    const footerAreaTop = gridBottom + Math.round((height - gridBottom) * 0.36);

    footerLines.forEach((line, idx) => {
      ctx.fillText(
        line,
        footerCenterX,
        footerAreaTop + idx * footerLineStep
      );
    });
    ctx.restore();
  }

  // =========================================================================
  // DISEÑO 11: 🔮 PRISMA (GEL NEÓN CYAN/CARMESÍ + FRANJA BLANCA + COLUMNA PÚRPURA)
  // =========================================================================
  else if (designId === "prisma") {
    const maxDim = Math.max(width, height);
    const isLiveOverlay = Boolean(overlayConfig.isLiveOverlay);
    const sidebarW = Math.round(width * 0.278);

    // -----------------------------------------------------------------------
    // 1. FILTRO DE IMAGEN: ILUMINACIÓN GEL PRISMA (CYAN IZQUIERDA + CARMESÍ DERECHA)
    // -----------------------------------------------------------------------
    ctx.save();
    // 1a. Velo superior Malva / Lavanda de estudio (#78517A)
    ctx.globalCompositeOperation = isLiveOverlay ? "source-over" : "soft-light";
    const topMauveGrad = ctx.createLinearGradient(0, 0, 0, height * 0.45);
    topMauveGrad.addColorStop(
      0,
      isLiveOverlay ? "rgba(124, 82, 128, 0.24)" : "rgba(128, 86, 138, 0.52)"
    );
    topMauveGrad.addColorStop(1, "rgba(124, 82, 128, 0)");
    ctx.fillStyle = topMauveGrad;
    ctx.fillRect(sidebarW, 0, width - sidebarW, height);

    // 1b. Luz Gel Azul / Cyan Eléctrico en el centro-izquierda (rostro y hombro frontal)
    ctx.globalCompositeOperation = isLiveOverlay ? "source-over" : "color";
    const cyanPrismaGlow = ctx.createRadialGradient(
      width * 0.43,
      height * 0.5,
      maxDim * 0.03,
      width * 0.45,
      height * 0.54,
      maxDim * 0.44
    );
    cyanPrismaGlow.addColorStop(
      0,
      isLiveOverlay ? "rgba(0, 180, 255, 0.34)" : "rgba(0, 185, 255, 0.72)"
    );
    cyanPrismaGlow.addColorStop(
      0.55,
      isLiveOverlay ? "rgba(0, 140, 235, 0.18)" : "rgba(0, 135, 230, 0.38)"
    );
    cyanPrismaGlow.addColorStop(1, "rgba(0, 110, 200, 0)");
    ctx.fillStyle = cyanPrismaGlow;
    ctx.fillRect(sidebarW, 0, width - sidebarW, height);

    // Refuerzo luminoso cyan en modo screen
    ctx.globalCompositeOperation = isLiveOverlay ? "source-over" : "screen";
    const cyanScreen = ctx.createRadialGradient(
      width * 0.44,
      height * 0.46,
      maxDim * 0.02,
      width * 0.44,
      height * 0.5,
      maxDim * 0.36
    );
    cyanScreen.addColorStop(
      0,
      isLiveOverlay ? "rgba(0, 205, 255, 0.22)" : "rgba(0, 210, 255, 0.38)"
    );
    cyanScreen.addColorStop(1, "rgba(0, 160, 255, 0)");
    ctx.fillStyle = cyanScreen;
    ctx.fillRect(sidebarW, 0, width - sidebarW, height);

    // 1c. Luz Gel Carmesí / Magenta-Rojo Neón en el costado derecho (mejilla y espalda)
    ctx.globalCompositeOperation = isLiveOverlay ? "source-over" : "screen";
    const crimsonGlow = ctx.createRadialGradient(
      width * 0.78,
      height * 0.66,
      maxDim * 0.04,
      width * 0.74,
      height * 0.62,
      maxDim * 0.52
    );
    crimsonGlow.addColorStop(
      0,
      isLiveOverlay ? "rgba(255, 12, 85, 0.42)" : "rgba(255, 10, 82, 0.72)"
    );
    crimsonGlow.addColorStop(
      0.52,
      isLiveOverlay ? "rgba(230, 0, 76, 0.22)" : "rgba(225, 0, 74, 0.42)"
    );
    crimsonGlow.addColorStop(1, "rgba(180, 0, 60, 0)");
    ctx.fillStyle = crimsonGlow;
    ctx.fillRect(sidebarW, 0, width - sidebarW, height);

    // 1d. Degradado nocturno suave en la esquina inferior derecha para resaltar subtítulos
    ctx.globalCompositeOperation = "source-over";
    const botGradH = Math.round(height * 0.28);
    const botGrad = ctx.createLinearGradient(0, height - botGradH, 0, height);
    botGrad.addColorStop(0, "rgba(10, 6, 18, 0)");
    botGrad.addColorStop(0.6, "rgba(10, 6, 18, 0.46)");
    botGrad.addColorStop(1, "rgba(8, 4, 14, 0.82)");
    ctx.fillStyle = botGrad;
    ctx.fillRect(sidebarW, height - botGradH, width - sidebarW, botGradH);
    ctx.restore();

    // -----------------------------------------------------------------------
    // 2. FRANJA VERTICAL BLANCA SÓLIDA EN EL COSTADO IZQUIERDO (~27.8% ANCHO)
    // -----------------------------------------------------------------------
    ctx.save();
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, sidebarW, height);
    ctx.restore();

    // -----------------------------------------------------------------------
    // 3. COLUMNA VERTICAL GIGANTE ("S T Y L E" / TÍTULO PRINCIPAL)
    //    Relleno Púrpura Malva (#7C5280 -> #7A5C95) con borde blanco grueso
    //    y recorte transparente con línea blanca en la mitad derecha de la letra central
    // -----------------------------------------------------------------------
    const { verticalWord, extraHeadline } = splitPrismaTitle(mainText);
    const letters = Array.from(verticalWord || "PRISMA");
    const numLetters = Math.max(1, letters.length);
    const midLetterIdx = Math.floor(numLetters / 2);

    const topPad = Math.round(height * 0.022);
    const botPad = Math.round(height * 0.022);
    const usableH = height - topPad - botPad;
    const slotH = usableH / numLetters;

    const letterFontSize = Math.max(
      42,
      Math.min(Math.round(width * 0.25), Math.round(slotH * 1.05))
    );
    const colCenterX = sidebarW;

    // Degradado vertical Púrpura Malva -> Lavanda Amatista idéntico a "S T Y L E"
    const purpleGrad = ctx.createLinearGradient(0, topPad, 0, height - botPad);
    purpleGrad.addColorStop(0, "#7B4F7A");
    purpleGrad.addColorStop(0.5, "#7C5484");
    purpleGrad.addColorStop(1, "#7B5E98");

    const thickWhiteBorder = Math.max(6, Math.round(22 * u));
    const innerCutoutStroke = Math.max(2, Math.round(5.5 * u));

    letters.forEach((ch, idx) => {
      const cy = topPad + (idx + 0.5) * slotH;
      const isMiddleCutoutLetter = idx === midLetterIdx && numLetters >= 3;

      if (!isMiddleCutoutLetter) {
        // Letras normales (como S, T, L, E): Contorno exterior blanco sólido grueso + relleno Púrpura Malva
        ctx.save();
        ctx.translate(colCenterX, cy);
        ctx.scale(0.95, 1.08);
        ctx.font = `900 ${letterFontSize}px "Impact", "Arial Black", "Segoe UI", sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.lineJoin = "miter";
        ctx.miterLimit = 3;

        ctx.lineWidth = thickWhiteBorder;
        ctx.strokeStyle = "#FFFFFF";
        ctx.strokeText(ch, 0, 0);

        ctx.fillStyle = purpleGrad;
        ctx.fillText(ch, 0, 0);
        ctx.restore();
      } else {
        // Letra central (como la "Y" en STYLE):
        // - Mitad izquierda (dentro de la franja blanca x <= sidebarW): Relleno Púrpura Malva con borde blanco
        // - Mitad derecha (sobre la foto x > sidebarW): Hueca/transparente con trazo blanco nítido
        const slotTop = topPad + idx * slotH - Math.round(20 * u);
        const slotHeight = slotH + Math.round(40 * u);

        // Pasada A: Mitad izquierda (x <= sidebarW) rellena en Púrpura Malva
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, slotTop, sidebarW, slotHeight);
        ctx.clip();

        ctx.translate(colCenterX, cy);
        ctx.scale(0.95, 1.08);
        ctx.font = `900 ${letterFontSize}px "Impact", "Arial Black", "Segoe UI", sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.lineJoin = "miter";
        ctx.lineWidth = thickWhiteBorder;
        ctx.strokeStyle = "#FFFFFF";
        ctx.strokeText(ch, 0, 0);
        ctx.fillStyle = purpleGrad;
        ctx.fillText(ch, 0, 0);
        ctx.restore();

        // Pasada B: Mitad derecha (x > sidebarW) hueca con trazo blanco sobre la foto
        ctx.save();
        ctx.beginPath();
        ctx.rect(sidebarW, slotTop, width - sidebarW, slotHeight);
        ctx.clip();

        ctx.translate(colCenterX, cy);
        ctx.scale(0.95, 1.08);
        ctx.font = `900 ${letterFontSize}px "Impact", "Arial Black", "Segoe UI", sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.lineJoin = "miter";
        ctx.lineWidth = innerCutoutStroke;
        ctx.strokeStyle = "#FFFFFF";
        ctx.shadowColor = "rgba(0, 0, 0, 0.45)";
        ctx.shadowBlur = 6 * u;
        ctx.strokeText(ch, 0, 0);
        ctx.restore();
      }
    });

    // -----------------------------------------------------------------------
    // 4. SELLO VERTICAL EDITORIAL EN EL MARGEN IZQUIERDO DE LA FRANJA BLANCA
    // -----------------------------------------------------------------------
    const leftVertLabel = String(
      thirdText || subText || badgeText || "PRISMA EDITION"
    )
      .toUpperCase()
      .slice(0, 34);
    ctx.save();
    const stripLabelX = Math.round(width * 0.055);
    const stripLabelY = Math.round(height * 0.5);
    ctx.translate(stripLabelX, stripLabelY);
    ctx.rotate(-Math.PI / 2);
    ctx.font = `800 ${Math.max(9, Math.round(13 * u))}px "Segoe UI", "Helvetica Neue", Arial, sans-serif`;
    ctx.fillStyle = "rgba(124, 82, 128, 0.72)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    drawTrackedText(ctx, leftVertLabel, 0, 0, Math.round(3 * u));
    ctx.restore();

    // -----------------------------------------------------------------------
    // 5. BLOQUE INFERIOR DERECHO: COMPLEMENTO DE TÍTULO + SUBTÍTULO 1 + SUBTÍTULO 2
    // -----------------------------------------------------------------------
    const rightMarginX = width - Math.round(28 * u);
    const maxRightBlockW = Math.max(80, width - sidebarW - Math.round(115 * u));
    const blockBottomY = height - Math.round(26 * u);

    // Barra vertical Prisma (degradado Cyan #00C8FF -> Carmesí #FF1668) en esquina inferior derecha
    const barW = Math.max(3, Math.round(5.5 * u));
    const barH = Math.round(
      (extraHeadline ? 92 : thirdText ? 68 : 48) * u
    );
    const barX = rightMarginX - barW;
    const barTopY = blockBottomY - barH;

    ctx.save();
    const prismaBarGrad = ctx.createLinearGradient(0, barTopY, 0, blockBottomY);
    prismaBarGrad.addColorStop(0, "#00C8FF");
    prismaBarGrad.addColorStop(0.5, "#9B5DE5");
    prismaBarGrad.addColorStop(1, "#FF1668");
    ctx.fillStyle = prismaBarGrad;
    ctx.fillRect(barX, barTopY, barW, barH);

    const textRightX = barX - Math.round(14 * u);
    ctx.textAlign = "right";
    ctx.textBaseline = "bottom";
    ctx.shadowColor = "rgba(0, 0, 0, 0.85)";
    ctx.shadowBlur = 8 * u;

    let currentBottomY = blockBottomY;

    // Subtítulo 2 (Opcional)
    if (thirdText) {
      const t2 = thirdText.toUpperCase();
      const s2 = fitFontSize(
        ctx,
        t2,
        maxRightBlockW,
        Math.round(19 * u),
        Math.round(10 * u),
        (s) => `700 ${s}px "Segoe UI", "Helvetica Neue", Arial, sans-serif`
      );
      ctx.font = `700 ${s2}px "Segoe UI", "Helvetica Neue", Arial, sans-serif`;
      ctx.fillStyle = "#F7B2E1";
      ctx.fillText(t2, textRightX, currentBottomY);
      currentBottomY -= Math.round(26 * u);
    }

    // Subtítulo 1 / Ej.Fecha-Lugar
    if (subText) {
      const t1 = subText.toUpperCase();
      const s1 = fitFontSize(
        ctx,
        t1,
        maxRightBlockW,
        Math.round(21 * u),
        Math.round(11 * u),
        (s) => `800 ${s}px "Segoe UI", "Helvetica Neue", Arial, sans-serif`
      );
      ctx.font = `800 ${s1}px "Segoe UI", "Helvetica Neue", Arial, sans-serif`;
      ctx.fillStyle = "#E8F8FF";
      ctx.fillText(t1, textRightX, currentBottomY);
      currentBottomY -= Math.round(28 * u);
    }

    // Segunda parte del Título Principal (si tiene varias palabras, ej. "Cumple de Luis")
    if (extraHeadline) {
      const sh = fitFontSize(
        ctx,
        extraHeadline,
        maxRightBlockW,
        Math.round(34 * u),
        Math.round(14 * u),
        (s) => `900 ${s}px "Impact", "Arial Black", "Segoe UI", sans-serif`
      );
      ctx.font = `900 ${sh}px "Impact", "Arial Black", "Segoe UI", sans-serif`;
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText(extraHeadline, textRightX, currentBottomY);
    }
    ctx.restore();
  }

  // =========================================================================
  // DISEÑO 12: ☀️ SOLSTICE (MITAD B&N PLATA + BLOQUE ROJO/ÁMBAR + CONDENSADO)
  // =========================================================================
  else if (designId === "solstice") {
    const isLiveOverlay = Boolean(overlayConfig.isLiveOverlay);

    // Coordenadas exactas de la división vertical (43.6% del ancho) y del cuadro geométrico derecho
    const splitX = Math.round(width * 0.436);
    const boxRightX = Math.round(width * 0.964);
    const boxTopY = Math.round(height * 0.145);
    const boxBotY = Math.round(height * 0.545);
    const boxW = Math.max(40, boxRightX - splitX);
    const boxH = Math.max(40, boxBotY - boxTopY);

    // -----------------------------------------------------------------------
    // 1. FILTRO DE IMAGEN: MITAD IZQUIERDA B&N PLATA + BLOQUE CÁLIDO/CARMESÍ
    // -----------------------------------------------------------------------
    ctx.save();
    if (!isLiveOverlay) {
      // 1a. Desaturar la mitad izquierda (0 -> splitX) a Blanco y Negro Plata
      ctx.globalCompositeOperation = "saturation";
      ctx.fillStyle = "hsl(0, 0%, 50%)";
      ctx.fillRect(0, 0, splitX, height);

      // Contraste mate de estudio sobre la mitad B&N izquierda
      ctx.globalCompositeOperation = "soft-light";
      ctx.fillStyle = "rgba(16, 18, 22, 0.35)";
      ctx.fillRect(0, 0, splitX, height);
    } else {
      // En visor WebRTC en vivo, simular velo gris frío en la mitad izquierda
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgba(20, 22, 26, 0.46)";
      ctx.fillRect(0, 0, splitX, height);
    }

    // 1b. Cuadro Geométrico Solstice (x: splitX -> boxRightX, y: boxTopY -> boxBotY):
    //     Transición de resplandor Ámbar/Durazno dorado sobre el rostro hacia bloque Rojo Carmesí intenso a la derecha
    ctx.globalCompositeOperation = isLiveOverlay ? "source-over" : "soft-light";
    const warmAmberGrad = ctx.createLinearGradient(
      splitX,
      boxTopY,
      boxRightX,
      boxBotY
    );
    warmAmberGrad.addColorStop(
      0,
      isLiveOverlay ? "rgba(235, 125, 70, 0.24)" : "rgba(242, 132, 74, 0.62)"
    );
    warmAmberGrad.addColorStop(
      0.52,
      isLiveOverlay ? "rgba(220, 75, 45, 0.28)" : "rgba(225, 72, 42, 0.58)"
    );
    warmAmberGrad.addColorStop(
      1,
      isLiveOverlay ? "rgba(195, 18, 24, 0.46)" : "rgba(198, 16, 22, 0.85)"
    );
    ctx.fillStyle = warmAmberGrad;
    ctx.fillRect(splitX, boxTopY, boxW, boxH);

    // Bloque Rojo Carmesí (#BE1117) pronunciado en el tercio derecho del recuadro geométrico
    ctx.globalCompositeOperation = "source-over";
    const redBlockGrad = ctx.createLinearGradient(
      splitX,
      0,
      boxRightX,
      0
    );
    redBlockGrad.addColorStop(0, "rgba(215, 95, 48, 0.10)");
    redBlockGrad.addColorStop(0.52, "rgba(195, 28, 28, 0.22)");
    redBlockGrad.addColorStop(0.76, "rgba(186, 16, 21, 0.68)");
    redBlockGrad.addColorStop(1, "rgba(178, 12, 18, 0.86)");
    ctx.fillStyle = redBlockGrad;
    ctx.fillRect(splitX, boxTopY, boxW, boxH);

    // 1c. Viñeta oscura de estudio en el borde izquierdo y parte inferior para máximo contraste del texto
    const leftDarkGrad = ctx.createLinearGradient(0, 0, splitX * 0.65, 0);
    leftDarkGrad.addColorStop(0, "rgba(12, 12, 14, 0.72)");
    leftDarkGrad.addColorStop(1, "rgba(12, 12, 14, 0)");
    ctx.fillStyle = leftDarkGrad;
    ctx.fillRect(0, 0, splitX, height);

    const botDarkH = Math.round(height * 0.42);
    const botDarkGrad = ctx.createLinearGradient(
      0,
      height - botDarkH,
      0,
      height
    );
    botDarkGrad.addColorStop(0, "rgba(8, 8, 10, 0)");
    botDarkGrad.addColorStop(0.55, "rgba(8, 8, 10, 0.56)");
    botDarkGrad.addColorStop(1, "rgba(5, 5, 7, 0.88)");
    ctx.fillStyle = botDarkGrad;
    ctx.fillRect(0, height - botDarkH, width, botDarkH);
    ctx.restore();

    // -----------------------------------------------------------------------
    // 2. TIPOGRAFÍA APILADA ULTRA-CONDENSADA ("CREATE. / ENHANCE. / STAND OUT.")
    // -----------------------------------------------------------------------
    const { whiteLines, redLine } = splitSolsticeLines(mainText);
    const allTitleLines = [...whiteLines, redLine].filter(Boolean);
    const textLeftX = Math.round(width * 0.058);
    const maxTitleW = Math.round(width * 0.78);

    // Calcular tamaño común condensado para que todas las líneas del bloque tengan el mismo peso visual
    const longestLine = allTitleLines.reduce(
      (a, b) => (a.length >= b.length ? a : b),
      "STAND OUT."
    );
    const baseCondSize = fitFontSize(
      ctx,
      longestLine,
      maxTitleW,
      Math.round(68 * u),
      Math.round(28 * u),
      (s) => `900 ${s}px "Arial Narrow", "Impact", "Segoe UI", sans-serif`
    );
    const lineStepY = Math.round(baseCondSize * 1.12);

    // Posición vertical idéntica al póster (tercio inferior izquierdo: ~62% a ~76% de la altura)
    const stackStartY = Math.round(height * 0.625);

    ctx.save();
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.shadowColor = "rgba(0, 0, 0, 0.78)";
    ctx.shadowBlur = 10 * u;

    whiteLines.forEach((lineStr, idx) => {
      const ly = stackStartY + idx * lineStepY;
      ctx.save();
      ctx.translate(textLeftX, ly);
      ctx.scale(0.88, 1.12);
      ctx.font = `900 ${baseCondSize}px "Arial Narrow", "Impact", "Segoe UI", sans-serif`;
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText(lineStr, 0, 0);
      ctx.restore();
    });

    const redLineY = stackStartY + whiteLines.length * lineStepY;
    if (redLine) {
      ctx.save();
      ctx.translate(textLeftX, redLineY);
      ctx.scale(0.88, 1.12);
      ctx.font = `900 ${baseCondSize}px "Arial Narrow", "Impact", "Segoe UI", sans-serif`;
      ctx.fillStyle = "#DE1B22";
      ctx.fillText(redLine, 0, 0);
      ctx.restore();
    }

    // -----------------------------------------------------------------------
    // 3. SUBTÍTULO 1 Y SUBTÍTULO 2 (DEBAJO DEL TITULAR ROJO EN LA ESQUINA INFERIOR IZQ)
    // -----------------------------------------------------------------------
    const subAreaTopY = redLineY + lineStepY + Math.round(16 * u);

    // Línea horizontal corta de acento Rojo Carmesí
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#DE1B22";
    ctx.fillRect(
      textLeftX,
      subAreaTopY,
      Math.round(42 * u),
      Math.max(2, Math.round(3.5 * u))
    );

    ctx.shadowColor = "rgba(0, 0, 0, 0.85)";
    ctx.shadowBlur = 6 * u;
    let cursorSubY = subAreaTopY + Math.round(12 * u);

    if (subText) {
      const s1Str = subText.toUpperCase();
      const s1Size = fitFontSize(
        ctx,
        s1Str,
        maxTitleW,
        Math.round(21 * u),
        Math.round(11 * u),
        (s) => `800 ${s}px "Segoe UI", "Helvetica Neue", Arial, sans-serif`
      );
      ctx.font = `800 ${s1Size}px "Segoe UI", "Helvetica Neue", Arial, sans-serif`;
      ctx.fillStyle = "#F8FAFC";
      ctx.fillText(s1Str, textLeftX, cursorSubY);
      cursorSubY += Math.round(s1Size * 1.38);
    }

    if (thirdText) {
      const s2Str = thirdText.toUpperCase();
      const s2Size = fitFontSize(
        ctx,
        s2Str,
        maxTitleW,
        Math.round(18 * u),
        Math.round(10 * u),
        (s) => `700 ${s}px "Segoe UI", "Helvetica Neue", Arial, sans-serif`
      );
      ctx.font = `700 ${s2Size}px "Segoe UI", "Helvetica Neue", Arial, sans-serif`;
      ctx.fillStyle = "#FF6B6B";
      ctx.fillText(s2Str, textLeftX, cursorSubY);
    }
    ctx.restore();
  }

  // =========================================================================
  // DISEÑO 13: 🌑 SHADOWS (NOIR B&N + BLOQUE TURQUESA "09" + SCANLINE TEXT)
  // =========================================================================
  else if (designId === "shadows") {
    const maxDim = Math.max(width, height);
    const isLiveOverlay = Boolean(overlayConfig.isLiveOverlay);
    const cyanHex = "#05DFD9";

    // -----------------------------------------------------------------------
    // 1. FILTRO DE IMAGEN: NOIR B&N DRAMÁTICO + HUMO/NEBLINA EN DERECHA
    // -----------------------------------------------------------------------
    ctx.save();
    if (!isLiveOverlay) {
      // 1a. Desaturar a Blanco y Negro Noir
      ctx.globalCompositeOperation = "saturation";
      ctx.fillStyle = "hsl(0, 0%, 50%)";
      ctx.fillRect(0, 0, width, height);

      // 1b. Contraste profundo de sombras Noir
      ctx.globalCompositeOperation = "soft-light";
      ctx.fillStyle = "rgba(8, 10, 12, 0.52)";
      ctx.fillRect(0, 0, width, height);
    }

    // 1c. Neblina / humo plateado suave en la esquina superior derecha y borde derecho
    ctx.globalCompositeOperation = isLiveOverlay ? "source-over" : "screen";
    const smokeGlowTop = ctx.createRadialGradient(
      width * 0.86,
      height * 0.18,
      maxDim * 0.03,
      width * 0.78,
      height * 0.28,
      maxDim * 0.48
    );
    smokeGlowTop.addColorStop(
      0,
      isLiveOverlay ? "rgba(220, 226, 230, 0.22)" : "rgba(225, 230, 235, 0.34)"
    );
    smokeGlowTop.addColorStop(
      0.55,
      isLiveOverlay ? "rgba(160, 170, 175, 0.10)" : "rgba(170, 178, 184, 0.16)"
    );
    smokeGlowTop.addColorStop(1, "rgba(20, 22, 24, 0)");
    ctx.fillStyle = smokeGlowTop;
    ctx.fillRect(0, 0, width, height);

    // 1d. Viñeta negra intensa en el costado izquierdo y parte inferior
    ctx.globalCompositeOperation = "source-over";
    const leftNoirGrad = ctx.createLinearGradient(0, 0, width * 0.48, 0);
    leftNoirGrad.addColorStop(0, "rgba(4, 5, 6, 0.90)");
    leftNoirGrad.addColorStop(0.55, "rgba(6, 8, 10, 0.48)");
    leftNoirGrad.addColorStop(1, "rgba(6, 8, 10, 0)");
    ctx.fillStyle = leftNoirGrad;
    ctx.fillRect(0, 0, width * 0.48, height);

    const botNoirH = Math.round(height * 0.38);
    const botNoirGrad = ctx.createLinearGradient(
      0,
      height - botNoirH,
      0,
      height
    );
    botNoirGrad.addColorStop(0, "rgba(4, 5, 6, 0)");
    botNoirGrad.addColorStop(0.52, "rgba(4, 5, 6, 0.68)");
    botNoirGrad.addColorStop(1, "rgba(3, 4, 5, 0.95)");
    ctx.fillStyle = botNoirGrad;
    ctx.fillRect(0, height - botNoirH, width, botNoirH);
    ctx.restore();

    // -----------------------------------------------------------------------
    // 2. BLOQUE VERTICAL TURQUESA ELÉCTRICO (#05DFD9) + DÍGITOS GIGANTES "09"
    // -----------------------------------------------------------------------
    const { dayDigits, topThinLine, bottomSlicedLine } = splitShadowsTitle(
      mainText,
      overlayConfig.eventDate
    );

    const blockX = Math.round(width * 0.07);
    const blockY = Math.round(height * 0.318);
    const blockW = Math.round(width * 0.298);
    const blockH = Math.round(height * 0.558);

    ctx.save();
    const cyanBlockGrad = ctx.createLinearGradient(
      blockX,
      blockY,
      blockX,
      blockY + blockH
    );
    cyanBlockGrad.addColorStop(0, "#08E8E2");
    cyanBlockGrad.addColorStop(0.5, "#05DFD9");
    cyanBlockGrad.addColorStop(1, "#02C9C3");
    ctx.fillStyle = cyanBlockGrad;
    ctx.shadowColor = "rgba(0, 0, 0, 0.55)";
    ctx.shadowBlur = 14 * u;
    ctx.fillRect(blockX, blockY, blockW, blockH);
    ctx.restore();

    // Número gigante condensado ("09") dentro de la mitad inferior del bloque turquesa
    ctx.save();
    const numCenterX = blockX + blockW / 2;
    const numCenterY = blockY + Math.round(blockH * 0.68);
    const numFontSize = Math.round(blockW * 0.86);

    ctx.translate(numCenterX, numCenterY);
    ctx.scale(0.68, 1.52); // Proporción ultra-alta y estrecha idéntica al "09" de la referencia
    ctx.font = `900 ${numFontSize}px "Impact", "Arial Narrow", "Segoe UI", sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Relleno carbón semi-traslúcido para dejar entrever sutilmente la textura noir
    ctx.fillStyle = "rgba(8, 11, 13, 0.88)";
    drawTrackedText(ctx, dayDigits, 0, 0, Math.round(8 * u));
    ctx.restore();

    // -----------------------------------------------------------------------
    // 3. BARRA DE BÚSQUEDA ("Google now" / SUBTÍTULO 2 + LUPA) + HORA "16:59"
    // -----------------------------------------------------------------------
    const searchLineY = Math.round(height * 0.442);
    const searchStartX = Math.round(width * 0.175);
    const searchEndX = Math.round(width * 0.46);

    ctx.save();
    // Línea blanca horizontal que cruza del bloque turquesa hacia la zona oscura
    ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
    ctx.lineWidth = Math.max(1.2, Math.round(2 * u));
    ctx.beginPath();
    ctx.moveTo(searchStartX, searchLineY);
    ctx.lineTo(searchEndX, searchLineY);
    ctx.stroke();

    // Texto sobre la barra de búsqueda (bicolor Blanco + Carbón dentro del bloque turquesa)
    const rawSearchLabel = String(
      thirdText || badgeText || "Recuerdalo now"
    ).trim();
    const searchWords = rawSearchLabel.split(/\s+/).filter(Boolean);
    const searchPart1 = searchWords[0] || "Recuerdalo";
    const searchPart2 = searchWords.slice(1).join(" ") || "now";

    const searchFontSize = Math.max(10, Math.round(20 * u));
    const searchTextY = searchLineY - Math.round(8 * u);
    ctx.textBaseline = "bottom";
    ctx.textAlign = "left";

    ctx.font = `700 ${searchFontSize}px "Segoe UI", "Helvetica Neue", Arial, sans-serif`;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(searchPart1, searchStartX + Math.round(6 * u), searchTextY);
    const part1W = ctx.measureText(searchPart1).width;

    ctx.font = `500 ${searchFontSize}px "Segoe UI", "Helvetica Neue", Arial, sans-serif`;
    ctx.fillStyle = "#1D2829";
    ctx.fillText(
      searchPart2,
      searchStartX + Math.round(10 * u) + part1W,
      searchTextY
    );

    // Icono vectorial de lupa (círculo + mango) a la derecha sobre la línea
    const magX = searchEndX - Math.round(26 * u);
    const magY = searchLineY - Math.round(18 * u);
    const magR = Math.max(4, Math.round(7.5 * u));
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = Math.max(1.5, Math.round(2.4 * u));
    ctx.beginPath();
    ctx.arc(magX, magY, magR, 0, Math.PI * 2);
    ctx.moveTo(magX + magR * 0.72, magY + magR * 0.72);
    ctx.lineTo(magX + magR * 1.55, magY + magR * 1.55);
    ctx.stroke();

    // Hora ("16:59") en el costado medio-derecho
    const timeText = "16:59";
    ctx.font = `800 ${Math.max(12, Math.round(25 * u))}px "Segoe UI", "Arial Black", sans-serif`;
    ctx.fillStyle = "#F4F6F8";
    ctx.textAlign = "right";
    ctx.textBaseline = "bottom";
    ctx.shadowColor = "rgba(0, 0, 0, 0.75)";
    ctx.shadowBlur = 6 * u;
    ctx.fillText(timeText, Math.round(width * 0.895), searchLineY + Math.round(2 * u));
    ctx.restore();

    // -----------------------------------------------------------------------
    // 4. TITULAR PRINCIPAL DE 2 LÍNEAS:
    //    Línea 1 ("WEDNESDAY") condensada fina + Línea 2 ("OCTOBER") con efecto Scanline
    // -----------------------------------------------------------------------
    const titleLeftX = Math.round(width * 0.392);
    const maxRightTitleW = Math.round(width * 0.56);

    // 4a. Línea 1 ("WEDNESDAY") en tipografía alta condensada blanca
    const topLineY = Math.round(height * 0.662);
    const topFontBase = fitFontSize(
      ctx,
      topThinLine,
      maxRightTitleW / 0.72,
      Math.round(68 * u),
      Math.round(26 * u),
      (s) => `400 ${s}px "Arial Narrow", "Segoe UI", "Helvetica Neue", sans-serif`
    );

    ctx.save();
    ctx.translate(titleLeftX, topLineY);
    ctx.scale(0.72, 1.32);
    ctx.font = `400 ${topFontBase}px "Arial Narrow", "Segoe UI", "Helvetica Neue", sans-serif`;
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
    ctx.shadowBlur = 8 * u;

    // Espaciado sutil entre letras
    const topChars = Array.from(topThinLine);
    let topCurX = 0;
    const topTrack = Math.round(4 * u);
    topChars.forEach((ch) => {
      ctx.fillText(ch, topCurX, 0);
      topCurX += ctx.measureText(ch).width + topTrack;
    });
    ctx.restore();

    // 4b. Línea 2 ("OCTOBER") en tipografía pesada alta con cortes horizontales Scanline
    const botLineBaseY = Math.round(height * 0.812);
    const botFontBase = fitFontSize(
      ctx,
      bottomSlicedLine,
      maxRightTitleW / 0.76,
      Math.round(108 * u),
      Math.round(36 * u),
      (s) => `900 ${s}px "Impact", "Arial Narrow", "Segoe UI", sans-serif`
    );
    const visualCapHeight = Math.round(botFontBase * 1.24);
    const botLineTopY = botLineBaseY - visualCapHeight;

    ctx.save();
    // Construir máscara even-odd que recorta 7 franjas horizontales progresivas en la mitad inferior de "OCTOBER"
    ctx.beginPath();
    ctx.rect(0, 0, width, height);
    const numSlices = 7;
    const sliceZoneStart = botLineTopY + Math.round(visualCapHeight * 0.44);
    const sliceZoneH = botLineBaseY - sliceZoneStart + Math.round(6 * u);
    const sliceStep = sliceZoneH / numSlices;

    for (let s = 0; s < numSlices; s++) {
      const sy = sliceZoneStart + s * sliceStep;
      // Las ranuras se vuelven ligeramente más gruesas hacia la base, idéntico a la imagen
      const sh = Math.max(1.5, sliceStep * (0.28 + (s / numSlices) * 0.36));
      ctx.rect(titleLeftX - Math.round(10 * u), sy, width - titleLeftX, sh);
    }
    ctx.clip("evenodd");

    ctx.translate(titleLeftX, botLineBaseY);
    ctx.scale(0.76, 1.38);
    ctx.font = `900 ${botFontBase}px "Impact", "Arial Narrow", "Segoe UI", sans-serif`;
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.shadowColor = "rgba(0, 0, 0, 0.82)";
    ctx.shadowBlur = 10 * u;

    const botChars = Array.from(bottomSlicedLine);
    let botCurX = 0;
    const botTrack = Math.round(3.5 * u);
    botChars.forEach((ch) => {
      ctx.fillText(ch, botCurX, 0);
      botCurX += ctx.measureText(ch).width + botTrack;
    });
    ctx.restore();

    // -----------------------------------------------------------------------
    // 5. PIE INFERIOR ("Kecamatan Bogor..." -> SUBTÍTULO 1) + BOTÓN TURQUESA [ > ]
    // -----------------------------------------------------------------------
    const btnSize = Math.round(width * 0.102);
    const btnX = Math.round(width * 0.808);
    const btnY = height - Math.round(height * 0.098);

    // 5a. Botón cuadrado Turquesa Eléctrico con flecha ">" en la esquina inferior derecha
    ctx.save();
    ctx.fillStyle = cyanHex;
    ctx.shadowColor = "rgba(0, 0, 0, 0.65)";
    ctx.shadowBlur = 10 * u;
    ctx.fillRect(btnX, btnY, btnSize, btnSize);

    ctx.shadowBlur = 0;
    ctx.strokeStyle = "#121A1B";
    ctx.lineWidth = Math.max(2, Math.round(3.5 * u));
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    const chevCx = btnX + btnSize / 2;
    const chevCy = btnY + btnSize / 2;
    const chevR = Math.round(btnSize * 0.14);
    ctx.beginPath();
    ctx.moveTo(chevCx - chevR * 0.6, chevCy - chevR);
    ctx.lineTo(chevCx + chevR * 0.6, chevCy);
    ctx.lineTo(chevCx - chevR * 0.6, chevCy + chevR);
    ctx.stroke();
    ctx.restore();

    // 5b. Subtítulo 1 (y Subtítulo 2 si existe) en el pie inferior izquierdo
    const footerLeftX = Math.round(width * 0.142);
    const maxFooterTextW = Math.max(80, btnX - footerLeftX - Math.round(20 * u));
    const footerTextCenterY = btnY + btnSize / 2;

    const primaryFooterStr =
      subText ||
      overlayConfig.eventPlace ||
      badgeText ||
      "Recuerdo Oficial del Evento";

    ctx.save();
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(0, 0, 0, 0.9)";
    ctx.shadowBlur = 8 * u;

    const f1Size = fitFontSize(
      ctx,
      primaryFooterStr,
      maxFooterTextW,
      Math.round(23 * u),
      Math.round(11 * u),
      (s) => `800 ${s}px "Segoe UI", "Helvetica Neue", Arial, sans-serif`
    );
    ctx.font = `800 ${f1Size}px "Segoe UI", "Helvetica Neue", Arial, sans-serif`;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(
      primaryFooterStr,
      footerLeftX,
      thirdText ? footerTextCenterY - Math.round(12 * u) : footerTextCenterY
    );

    if (thirdText) {
      const f2Size = fitFontSize(
        ctx,
        thirdText,
        maxFooterTextW,
        Math.round(17 * u),
        Math.round(10 * u),
        (s) => `700 ${s}px "Segoe UI", "Helvetica Neue", Arial, sans-serif`
      );
      ctx.font = `700 ${f2Size}px "Segoe UI", "Helvetica Neue", Arial, sans-serif`;
      ctx.fillStyle = cyanHex;
      ctx.fillText(
        thirdText,
        footerLeftX,
        footerTextCenterY + Math.round(13 * u)
      );
    }
    ctx.restore();
  }

  // =========================================================================
  // DISEÑO 14: 📷 POLAR (MONOCROMO B&N + REFLEJOS CRISTAL + VISOR RECORD)
  // =========================================================================
  else if (designId === "polar") {
    const isLiveOverlay = Boolean(overlayConfig.isLiveOverlay);

    // -----------------------------------------------------------------------
    // 1. FILTRO DE IMAGEN: MONOCROMO B&N ALTO CONTRASTE + REFLEJOS DE CRISTAL
    // -----------------------------------------------------------------------
    ctx.save();
    if (!isLiveOverlay) {
      // 1a. Desaturación completa a Blanco y Negro
      ctx.globalCompositeOperation = "saturation";
      ctx.fillStyle = "hsl(0, 0%, 50%)";
      ctx.fillRect(0, 0, width, height);

      // 1b. Contraste de plata en modo soft-light
      ctx.globalCompositeOperation = "soft-light";
      ctx.fillStyle = "rgba(18, 20, 24, 0.32)";
      ctx.fillRect(0, 0, width, height);
    }

    // 1c. Reflejos verticales suaves de cristal / ventana (como en la imagen de referencia)
    ctx.globalCompositeOperation = isLiveOverlay ? "source-over" : "screen";
    const glassStreak1 = ctx.createLinearGradient(
      width * 0.34,
      0,
      width * 0.49,
      0
    );
    glassStreak1.addColorStop(0, "rgba(255, 255, 255, 0)");
    glassStreak1.addColorStop(
      0.5,
      isLiveOverlay ? "rgba(255, 255, 255, 0.12)" : "rgba(255, 255, 255, 0.18)"
    );
    glassStreak1.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = glassStreak1;
    ctx.fillRect(0, 0, width, height);

    const glassStreak2 = ctx.createLinearGradient(
      width * 0.81,
      0,
      width * 0.95,
      0
    );
    glassStreak2.addColorStop(0, "rgba(255, 255, 255, 0)");
    glassStreak2.addColorStop(
      0.5,
      isLiveOverlay ? "rgba(255, 255, 255, 0.14)" : "rgba(255, 255, 255, 0.22)"
    );
    glassStreak2.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = glassStreak2;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();

    // -----------------------------------------------------------------------
    // 2. MARCO EXTERIOR BLANCO SÓLIDO (PASSEPARTOUT POLAR)
    // -----------------------------------------------------------------------
    const borderX = Math.max(8, Math.round(width * 0.038));
    const borderY = Math.max(8, Math.round(height * 0.022));

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, width, height);
    ctx.rect(borderX, borderY, width - borderX * 2, height - borderY * 2);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill("evenodd");
    ctx.restore();

    // -----------------------------------------------------------------------
    // 3. VISOR DE CÁMARA BLANCO INTERIOR (4 ESQUINAS EN "L" + 4 BARRAS LATERALES)
    // -----------------------------------------------------------------------
    const vfLeft = Math.round(width * 0.158);
    const vfRight = Math.round(width * 0.842);
    const vfTop = Math.round(height * 0.104);
    const vfBot = Math.round(height * 0.898);

    const barThick = Math.max(4, Math.round(16.5 * u));
    const cornerArmW = Math.round(width * 0.095);
    const cornerArmH = Math.round(height * 0.064);

    ctx.save();
    ctx.fillStyle = "#FFFFFF";
    ctx.shadowColor = "rgba(0, 0, 0, 0.38)";
    ctx.shadowBlur = 8 * u;

    // 3a. 4 Esquinas en "L" gruesas
    // Arriba-Izquierda
    ctx.fillRect(vfLeft, vfTop, cornerArmW, barThick);
    ctx.fillRect(vfLeft, vfTop, barThick, cornerArmH);

    // Arriba-Derecha
    ctx.fillRect(vfRight - cornerArmW, vfTop, cornerArmW, barThick);
    ctx.fillRect(vfRight - barThick, vfTop, barThick, cornerArmH);

    // Abajo-Izquierda
    ctx.fillRect(vfLeft, vfBot - barThick, cornerArmW, barThick);
    ctx.fillRect(vfLeft, vfBot - cornerArmH, barThick, cornerArmH);

    // Abajo-Derecha
    ctx.fillRect(vfRight - cornerArmW, vfBot - barThick, cornerArmW, barThick);
    ctx.fillRect(vfRight - barThick, vfBot - cornerArmH, barThick, cornerArmH);

    // 3b. 4 Barras Verticales Intermedias (2 a la izquierda y 2 a la derecha)
    const upperBarTopY = Math.round(height * 0.205);
    const upperBarBotY = Math.round(height * 0.388);
    const upperBarH = Math.max(20, upperBarBotY - upperBarTopY);

    const lowerBarTopY = Math.round(height * 0.618);
    const lowerBarBotY = Math.round(height * 0.802);
    const lowerBarH = Math.max(20, lowerBarBotY - lowerBarTopY);

    ctx.fillRect(vfLeft, upperBarTopY, barThick, upperBarH);
    ctx.fillRect(vfLeft, lowerBarTopY, barThick, lowerBarH);
    ctx.fillRect(vfRight - barThick, upperBarTopY, barThick, upperBarH);
    ctx.fillRect(vfRight - barThick, lowerBarTopY, barThick, lowerBarH);
    ctx.restore();

    // -----------------------------------------------------------------------
    // 4. TEXTOS SERIF CON VIÑETAS ("• RECORD •") EN LOS 4 LADOS DEL VISOR
    //    Conectados en tiempo real al Título Principal, Subtítulo 1 y Subtítulo 2
    // -----------------------------------------------------------------------
    const topLabel = String(mainText || "RECORD").trim();
    const leftLabel = String(subText || mainText || "RECORD").trim();
    const rightLabel = String(
      thirdText || subText || mainText || "RECORD"
    ).trim();
    const botLabel = String(
      thirdText || subText || mainText || "RECORD"
    ).trim();

    const horizMaxW = Math.max(
      60,
      vfRight - vfLeft - cornerArmW * 2 - Math.round(70 * u)
    );
    const vertMaxW = Math.max(
      60,
      lowerBarTopY - upperBarBotY - Math.round(64 * u)
    );
    const initSerif = Math.round(32 * u);
    const minSerif = Math.round(13 * u);

    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.72)";
    ctx.shadowBlur = 8 * u;

    // 4a. Arriba Centro: • TÍTULO PRINCIPAL •
    ctx.save();
    ctx.translate(width / 2, vfTop + barThick / 2);
    drawPolarBulletText(ctx, topLabel, horizMaxW, initSerif, minSerif, u);
    ctx.restore();

    // 4b. Abajo Centro: • SUBTÍTULO 1 / SUBTÍTULO 2 •
    ctx.save();
    ctx.translate(width / 2, vfBot - barThick / 2);
    drawPolarBulletText(
      ctx,
      subText && thirdText ? thirdText : botLabel,
      horizMaxW,
      initSerif,
      minSerif,
      u
    );
    ctx.restore();

    // Si hay tanto Subtítulo 1 como Subtítulo 2, mostrar Subtítulo 1 también sobre la línea inferior para lectura horizontal inmediata
    if (subText && thirdText) {
      ctx.save();
      ctx.translate(width / 2, vfBot - barThick / 2 - Math.round(36 * u));
      drawPolarBulletText(
        ctx,
        subText,
        horizMaxW,
        Math.round(24 * u),
        minSerif,
        u
      );
      ctx.restore();
    }

    // 4c. Costado Izquierdo (Rotado -90°): • SUBTÍTULO 1 •
    const midVertY = (upperBarBotY + lowerBarTopY) / 2;
    ctx.save();
    ctx.translate(vfLeft + barThick / 2, midVertY);
    ctx.rotate(-Math.PI / 2);
    drawPolarBulletText(ctx, leftLabel, vertMaxW, initSerif, minSerif, u);
    ctx.restore();

    // 4d. Costado Derecho (Rotado -90°): • SUBTÍTULO 2 (o RECORD) •
    ctx.save();
    ctx.translate(vfRight - barThick / 2, midVertY);
    ctx.rotate(-Math.PI / 2);
    drawPolarBulletText(ctx, rightLabel, vertMaxW, initSerif, minSerif, u);
    ctx.restore();

    ctx.restore();
  }

  // =========================================================================
  // DISEÑO 15: ⚡ METRO (URBANO CARBÓN/MOSTAZA + CUADROS DOBLES + STRONG)
  // =========================================================================
  else if (designId === "metro") {
    const isLiveOverlay = Boolean(overlayConfig.isLiveOverlay);
    const mustardHex = "#DCB028";
    const ochreFooterHex = "#C69A24";
    const offWhiteHex = "#F4F5F7";

    // -----------------------------------------------------------------------
    // 1. FILTRO DE IMAGEN: VIÑETA URBANA CARBÓN MATE + ACENTO CÁLIDO MOSTAZA
    // -----------------------------------------------------------------------
    ctx.save();
    if (!isLiveOverlay) {
      // Realce cálido mostaza/ocre en el centro sobre el sujeto
      ctx.globalCompositeOperation = "soft-light";
      const centerWarmGlow = ctx.createRadialGradient(
        width * 0.52,
        height * 0.54,
        width * 0.05,
        width * 0.52,
        height * 0.54,
        height * 0.48
      );
      centerWarmGlow.addColorStop(0, "rgba(232, 182, 42, 0.32)");
      centerWarmGlow.addColorStop(1, "rgba(18, 20, 22, 0.25)");
      ctx.fillStyle = centerWarmGlow;
      ctx.fillRect(0, 0, width, height);
    }

    // Viñeta oscura color asfalto/carbón en la parte superior, bordes laterales y esquinas inferiores
    ctx.globalCompositeOperation = "source-over";
    const topDarkH = Math.round(height * 0.28);
    const topDarkGrad = ctx.createLinearGradient(0, 0, 0, topDarkH);
    topDarkGrad.addColorStop(0, "rgba(18, 20, 22, 0.86)");
    topDarkGrad.addColorStop(0.55, "rgba(18, 20, 22, 0.42)");
    topDarkGrad.addColorStop(1, "rgba(18, 20, 22, 0)");
    ctx.fillStyle = topDarkGrad;
    ctx.fillRect(0, 0, width, topDarkH);

    const leftDarkW = Math.round(width * 0.42);
    const leftDarkGrad = ctx.createLinearGradient(0, 0, leftDarkW, 0);
    leftDarkGrad.addColorStop(0, "rgba(18, 20, 22, 0.82)");
    leftDarkGrad.addColorStop(0.65, "rgba(18, 20, 22, 0.36)");
    leftDarkGrad.addColorStop(1, "rgba(18, 20, 22, 0)");
    ctx.fillStyle = leftDarkGrad;
    ctx.fillRect(0, 0, leftDarkW, height);

    const rightDarkW = Math.round(width * 0.32);
    const rightDarkGrad = ctx.createLinearGradient(
      width - rightDarkW,
      0,
      width,
      0
    );
    rightDarkGrad.addColorStop(0, "rgba(18, 20, 22, 0)");
    rightDarkGrad.addColorStop(1, "rgba(18, 20, 22, 0.78)");
    ctx.fillStyle = rightDarkGrad;
    ctx.fillRect(width - rightDarkW, 0, rightDarkW, height);

    const botDarkH = Math.round(height * 0.26);
    const botDarkGrad = ctx.createLinearGradient(
      0,
      height - botDarkH,
      0,
      height
    );
    botDarkGrad.addColorStop(0, "rgba(16, 18, 20, 0)");
    botDarkGrad.addColorStop(0.6, "rgba(16, 18, 20, 0.52)");
    botDarkGrad.addColorStop(1, "rgba(14, 16, 18, 0.88)");
    ctx.fillStyle = botDarkGrad;
    ctx.fillRect(0, height - botDarkH, width, botDarkH);
    ctx.restore();

    // -----------------------------------------------------------------------
    // 2. MARCO GEOMÉTRICO BLANCO ASIMÉTRICO + DOBLE CUADRO MOSTAZA/BLANCO
    // -----------------------------------------------------------------------
    const wireLeftX = Math.round(width * 0.202);
    const wireTopY = Math.round(height * 0.18);
    const wireLeftBotY = Math.round(height * 0.432);
    const wireRightX = Math.round(width * 0.85);
    const wireBotY = Math.round(height * 0.642);
    const wireBotLeftX = Math.round(width * 0.685);

    // Coordenadas de los dos cuadros entrelazados en la esquina superior derecha
    const yellowSqX = Math.round(width * 0.756);
    const yellowSqY = Math.round(height * 0.148);
    const yellowSqW = Math.round(width * 0.094);
    const yellowSqH = Math.round(height * 0.064);

    const whiteSqX = Math.round(width * 0.806);
    const whiteSqY = Math.round(height * 0.178);
    const whiteSqW = Math.round(width * 0.088);
    const whiteSqH = Math.round(height * 0.058);

    ctx.save();
    ctx.strokeStyle = offWhiteHex;
    ctx.lineWidth = Math.max(2, Math.round(3.6 * u));
    ctx.lineCap = "square";
    ctx.lineJoin = "miter";

    // 2a. Brazo izquierdo + superior del marco blanco (llega hasta el cuadro amarillo)
    ctx.beginPath();
    ctx.moveTo(wireLeftX, wireLeftBotY);
    ctx.lineTo(wireLeftX, wireTopY);
    ctx.lineTo(yellowSqX, wireTopY);
    ctx.stroke();

    // 2b. Brazo derecho + retorno inferior del marco blanco (sale debajo del cuadro blanco)
    ctx.beginPath();
    ctx.moveTo(wireRightX, whiteSqY + whiteSqH);
    ctx.lineTo(wireRightX, wireBotY);
    ctx.lineTo(wireBotLeftX, wireBotY);
    ctx.stroke();

    // 2c. Cuadro blanco hueco entrelazado (abajo-derecha del cuadro mostaza)
    ctx.strokeRect(whiteSqX, whiteSqY, whiteSqW, whiteSqH);

    // 2d. Cuadro sólido Amarillo Mostaza (#DCB028) encima de la intersección
    ctx.fillStyle = mustardHex;
    ctx.fillRect(yellowSqX, yellowSqY, yellowSqW, yellowSqH);
    ctx.restore();

    // -----------------------------------------------------------------------
    // 3. BLOQUE DE CITA IZQUIERDO (SUBTÍTULO 1) + 3 PUNTOS AMARILLO MOSTAZA
    // -----------------------------------------------------------------------
    const quoteLeftX = Math.round(width * 0.076);
    const quoteMaxW = Math.round(width * 0.34);
    const quoteFontSize = Math.max(10, Math.round(16.5 * u));
    const quoteStepY = Math.round(quoteFontSize * 1.35);

    const rawQuote = String(
      subText ||
        badgeText ||
        "Working hard for something we love is called passion."
    ).trim();
    const formattedQuote =
      rawQuote.startsWith('"') || rawQuote.startsWith("“")
        ? rawQuote
        : `"${rawQuote}"`;

    ctx.save();
    ctx.font = `400 ${quoteFontSize}px "Segoe UI", "Helvetica Neue", Arial, sans-serif`;
    ctx.fillStyle = "#EAECEF";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.shadowColor = "rgba(0, 0, 0, 0.85)";
    ctx.shadowBlur = 6 * u;

    const quoteLines = wrapTextIntoLines(ctx, formattedQuote, quoteMaxW, 5);
    const quoteStartY = Math.round(height * 0.482);

    quoteLines.forEach((lineStr, idx) => {
      ctx.fillText(lineStr, quoteLeftX, quoteStartY + idx * quoteStepY);
    });

    // 3 Puntos circulares Amarillo Mostaza (#DCB028) debajo de la cita
    ctx.shadowBlur = 0;
    ctx.fillStyle = mustardHex;
    const dotsY =
      quoteStartY +
      Math.max(3, quoteLines.length) * quoteStepY +
      Math.round(18 * u);
    const dotR = Math.max(3, Math.round(6.5 * u));
    const dotStartX = Math.round(width * 0.155);
    const dotStepX = Math.round(width * 0.048);

    [0, 1, 2].forEach((i) => {
      ctx.beginPath();
      ctx.arc(dotStartX + i * dotStepX, dotsY, dotR, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    // -----------------------------------------------------------------------
    // 4. TITULAR GIGANTE CONDENSADO ("S T R O N G" / TÍTULO PRINCIPAL)
    //    Laterales en blanco sólido + centro traslúcido con contorno blanco
    // -----------------------------------------------------------------------
    const cleanMain = String(mainText || "STRONG")
      .trim()
      .toUpperCase();
    const headlineCenterX = Math.round(width * 0.5);
    const headlineBaseY = Math.round(height * 0.806);
    const maxHeadlineW = Math.round(width * 0.84);

    const baseHeadFont = fitFontSize(
      ctx,
      cleanMain,
      maxHeadlineW * 0.78,
      Math.round(156 * u),
      Math.round(44 * u),
      (s) => `900 ${s}px "Impact", "Arial Narrow", "Segoe UI", sans-serif`
    );
    const trackingHead = Math.max(4, Math.round(18 * u));

    // Ventana central de recorte ("Subject Knockout Window": 35% a 66% del ancho)
    const centerWinX = Math.round(width * 0.352);
    const centerWinW = Math.round(width * 0.308);
    const centerWinY = Math.round(height * 0.62);
    const centerWinH = Math.round(height * 0.22);

    const drawMetroHeadline = (mode) => {
      ctx.save();
      ctx.translate(headlineCenterX, headlineBaseY);
      ctx.scale(0.92, 1.18);
      ctx.font = `900 ${baseHeadFont}px "Impact", "Arial Narrow", "Segoe UI", sans-serif`;
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";

      const chars = Array.from(cleanMain);
      const widths = chars.map((ch) => ctx.measureText(ch).width);
      const totalW =
        widths.reduce((a, b) => a + b, 0) +
        trackingHead * Math.max(0, chars.length - 1);
      let curX = -totalW / 2;

      chars.forEach((ch, idx) => {
        if (mode === "solid") {
          ctx.fillText(ch, curX, 0);
        } else {
          ctx.fillText(ch, curX, 0);
          ctx.strokeText(ch, curX, 0);
        }
        curX += widths[idx] + trackingHead;
      });
      ctx.restore();
    };

    // 4a. Pasada 1: Relleno Blanco Sólido (#F4F5F7) fuera de la ventana central (letras S, T y N, G)
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, width, height);
    ctx.rect(centerWinX, centerWinY, centerWinW, centerWinH);
    ctx.clip("evenodd");

    ctx.fillStyle = offWhiteHex;
    ctx.shadowColor = "rgba(0, 0, 0, 0.65)";
    ctx.shadowBlur = 10 * u;
    drawMetroHeadline("solid");
    ctx.restore();

    // 4b. Pasada 2: Relleno Traslúcido Ocre/ Carbón + Contorno Blanco Fino dentro de la ventana central (letras R, O)
    ctx.save();
    ctx.beginPath();
    ctx.rect(centerWinX, centerWinY, centerWinW, centerWinH);
    ctx.clip();

    ctx.fillStyle = "rgba(38, 30, 12, 0.34)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.82)";
    ctx.lineWidth = Math.max(1.5, 2.2 * u);
    ctx.lineJoin = "round";
    drawMetroHeadline("translucent");
    ctx.restore();

    // 4c. Línea blanca horizontal de ancho completo debajo del titular
    const underlineY = Math.round(height * 0.844);
    ctx.save();
    ctx.strokeStyle = offWhiteHex;
    ctx.lineWidth = Math.max(2, Math.round(3.4 * u));
    ctx.beginPath();
    ctx.moveTo(Math.round(width * 0.076), underlineY);
    ctx.lineTo(Math.round(width * 0.926), underlineY);
    ctx.stroke();
    ctx.restore();

    // -----------------------------------------------------------------------
    // 5. PIE DE PÁGINA EN ESQUINAS INFERIORES (SUBTÍTULO 1 Y SUBTÍTULO 2)
    // -----------------------------------------------------------------------
    const footerBotY = height - Math.round(24 * u);
    const leftFooterX = Math.round(width * 0.074);
    const rightFooterX = Math.round(width * 0.972);

    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.85)";
    ctx.shadowBlur = 6 * u;

    // 5a. Esquina Inferior Izquierda: "--Evento" (Mostaza) + "@Subtítulo/Lugar" (Blanco)
    const tagTop = `--${String(badgeText || "Recuerdalo").trim()}`;
    const tagBot = String(
      overlayConfig.eventPlace
        ? `@${overlayConfig.eventPlace.replace(/\s+/g, "").toLowerCase()}`
        : subText
        ? subText.slice(0, 28)
        : "@recuerdalo.com.mx"
    );

    ctx.textAlign = "left";
    ctx.textBaseline = "bottom";
    ctx.font = `700 ${Math.max(11, Math.round(21 * u))}px "Segoe UI", "Helvetica Neue", Arial, sans-serif`;
    ctx.fillStyle = ochreFooterHex;
    ctx.fillText(tagTop, leftFooterX, footerBotY - Math.round(24 * u));

    ctx.font = `400 ${Math.max(10, Math.round(18 * u))}px "Segoe UI", "Helvetica Neue", Arial, sans-serif`;
    ctx.fillStyle = offWhiteHex;
    ctx.fillText(tagBot, leftFooterX + Math.round(4 * u), footerBotY);

    // 5b. Esquina Inferior Derecha ("DESIGNED BY LEE" -> Subtítulo 2 en Amarillo Mostaza)
    const rightSignature = String(
      thirdText || subText || badgeText || "RECUERDO OFICIAL"
    )
      .trim()
      .toUpperCase();
    const maxSigW = Math.round(width * 0.52);
    const sigFontSize = fitFontSize(
      ctx,
      rightSignature,
      maxSigW,
      Math.round(23 * u),
      Math.round(11 * u),
      (s) => `800 ${s}px "Segoe UI", "Arial Narrow", sans-serif`
    );
    ctx.font = `800 ${sigFontSize}px "Segoe UI", "Arial Narrow", sans-serif`;
    ctx.fillStyle = ochreFooterHex;
    ctx.textAlign = "right";
    ctx.textBaseline = "bottom";
    ctx.fillText(rightSignature, rightFooterX, footerBotY - Math.round(4 * u));
    ctx.restore();
  }

  ctx.restore();
}

