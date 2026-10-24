import { useEffect, useState } from "react";
import instanceAxios from "../api/axios.js";

const resolvedUrlCache = new Map();

export function extractQueryFromGoogleMapsUrl(rawUrl) {
  const u = String(rawUrl || "").trim();
  if (!u) return "";

  const pinCoord = u.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (pinCoord) {
    return `${pinCoord[1]},${pinCoord[2]}`;
  }

  const searchPath = u.match(/\/maps\/search\/([^/?#]+)/i);
  if (searchPath && searchPath[1]) {
    return decodeURIComponent(searchPath[1].replace(/\+/g, " ")).trim();
  }

  const placePath = u.match(/\/maps\/place\/([^/?#]+)/i);
  if (placePath && placePath[1]) {
    return decodeURIComponent(placePath[1].replace(/\+/g, " ")).trim();
  }

  const qParam = u.match(/[?&](?:q|query|ll|daddr)=([^&#]+)/i);
  if (qParam && qParam[1]) {
    return decodeURIComponent(qParam[1].replace(/\+/g, " ")).trim();
  }

  const atCoord = u.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (atCoord) {
    return `${atCoord[1]},${atCoord[2]}`;
  }

  return "";
}

/**
 * Construye las URLs de Google Maps priorizando SIEMPRE el campo "direccion"
 * (Dirección Exacta, Coordenadas o Enlace de Google Maps) por encima de "lugar"
 * (Nombre del Salón, Jardín o Recinto). Solo usa "lugar" si "direccion" está vacío.
 */
export function getGoogleMapsUrls(lugar, direccion, resolvedUrlQuery = "") {
  const rawDir = String(direccion || "").trim();
  const rawLugar = String(lugar || "").trim();
  const isDirectUrl = /^https?:\/\//i.test(rawDir);

  if (isDirectUrl && /\/maps\/embed/i.test(rawDir)) {
    return {
      embedUrl: rawDir,
      externalUrl: rawDir,
      hasLocation: true,
    };
  }

  let queryForEmbed = "";

  if (rawDir) {
    if (isDirectUrl) {
      queryForEmbed =
        String(resolvedUrlQuery || "").trim() ||
        extractQueryFromGoogleMapsUrl(rawDir) ||
        rawLugar ||
        "Ciudad de México";
    } else {
      // Si el usuario escribió una dirección o coordenadas en el campo dirección,
      // el mapa toma únicamente ese valor (no el nombre del salón).
      queryForEmbed = rawDir;
    }
  } else if (rawLugar) {
    queryForEmbed = rawLugar;
  } else {
    queryForEmbed = "Ciudad de México";
  }

  const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
    queryForEmbed
  )}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  const externalUrl = isDirectUrl
    ? rawDir
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        rawDir || rawLugar || "Ciudad de México"
      )}`;

  return {
    embedUrl,
    externalUrl,
    hasLocation: Boolean(rawDir || rawLugar),
  };
}

export function useGoogleMapsLocation(lugar, direccion) {
  const rawDir = String(direccion || "").trim();
  const isDirectUrl = /^https?:\/\//i.test(rawDir);
  const [resolvedQuery, setResolvedQuery] = useState(() =>
    isDirectUrl ? resolvedUrlCache.get(rawDir) || "" : ""
  );

  useEffect(() => {
    if (!isDirectUrl) {
      setResolvedQuery("");
      return;
    }

    const immediate = extractQueryFromGoogleMapsUrl(rawDir);
    if (immediate && !/maps\.app\.goo\.gl|goo\.gl\/maps/i.test(rawDir)) {
      resolvedUrlCache.set(rawDir, immediate);
      setResolvedQuery(immediate);
      return;
    }

    if (resolvedUrlCache.has(rawDir)) {
      setResolvedQuery(resolvedUrlCache.get(rawDir) || "");
      return;
    }

    let active = true;
    const timer = setTimeout(async () => {
      try {
        const { data } = await instanceAxios.get("/resolve-map", {
          params: { url: rawDir },
        });
        if (!active) return;
        const q = String(data?.query || "").trim();
        if (q) {
          resolvedUrlCache.set(rawDir, q);
          setResolvedQuery(q);
        }
      } catch {
        // Fallback silencioso si no se puede resolver
      }
    }, 180);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [rawDir, isDirectUrl]);

  return getGoogleMapsUrls(lugar, direccion, resolvedQuery);
}

