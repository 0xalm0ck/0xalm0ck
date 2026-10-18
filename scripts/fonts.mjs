// Downloads Google Fonts subset to the exact characters a card uses, embeds
// them as data URIs (SVGs rendered through <img> can't load external fonts)
// and reads their advance widths so text can be measured and laid out.

const FAMILIES = {
  display: { css: 'Anton', name: 'Anton', weight: 400 },
  sans: { css: 'Space+Grotesk:wght@500', name: 'Space Grotesk', weight: 500 },
  mono: { css: 'JetBrains+Mono:wght@500', name: 'JetBrains Mono', weight: 500 },
};

export async function loadFont(key, text) {
  const family = FAMILIES[key];
  // Uppercase variants too, since cards often uppercase their copy.
  const chars = [...new Set(text + text.toUpperCase())].filter((c) => c.trim()).join('');
  const css = await (
    await fetch(`https://fonts.googleapis.com/css2?family=${family.css}&text=${encodeURIComponent(chars)}`)
  ).text();
  const url = css.match(/url\((.+?)\)/)?.[1];
  if (!url) throw new Error(`No font URL for ${family.name}`);
  const data = Buffer.from(await (await fetch(url)).arrayBuffer());
  const metrics = parseMetrics(data);

  return {
    family: `'${family.name}'`,
    fontFace: `@font-face{font-family:'${family.name}';font-weight:${family.weight};src:url(data:font/ttf;base64,${data.toString('base64')}) format('truetype');}`,
    // Width in px of `str` at `size`, plus `tracking` (em) after each character.
    measure(str, size, tracking = 0) {
      let units = 0;
      for (const ch of str) units += metrics.advance(ch.codePointAt(0));
      return (units / metrics.unitsPerEm) * size + [...str].length * tracking * size;
    },
  };
}

function parseMetrics(buf) {
  const tables = {};
  const numTables = buf.readUInt16BE(4);
  for (let i = 0; i < numTables; i++) {
    const rec = 12 + i * 16;
    tables[buf.toString('latin1', rec, rec + 4)] = buf.readUInt32BE(rec + 8);
  }
  const unitsPerEm = buf.readUInt16BE(tables.head + 18);
  const numHMetrics = buf.readUInt16BE(tables.hhea + 34);
  const glyphAdvance = (gid) => buf.readUInt16BE(tables.hmtx + Math.min(gid, numHMetrics - 1) * 4);
  const glyphFor = cmapLookup(buf, tables.cmap);
  // Characters missing from the subset (e.g. ✦) fall back to a system font; assume a square.
  const advance = (code) => {
    const gid = glyphFor(code);
    return gid ? glyphAdvance(gid) : unitsPerEm;
  };
  return { unitsPerEm, advance };
}

function cmapLookup(buf, cmap) {
  const count = buf.readUInt16BE(cmap + 2);
  for (let i = 0; i < count; i++) {
    const offset = cmap + buf.readUInt32BE(cmap + 4 + i * 8 + 4);
    const format = buf.readUInt16BE(offset);
    if (format === 12) {
      const groups = buf.readUInt32BE(offset + 12);
      return (code) => {
        for (let g = 0; g < groups; g++) {
          const p = offset + 16 + g * 12;
          const start = buf.readUInt32BE(p);
          if (code >= start && code <= buf.readUInt32BE(p + 4)) return buf.readUInt32BE(p + 8) + code - start;
        }
        return 0;
      };
    }
    if (format === 4) {
      const segX2 = buf.readUInt16BE(offset + 6);
      const ends = offset + 14;
      const starts = ends + segX2 + 2;
      const deltas = starts + segX2;
      const ranges = deltas + segX2;
      return (code) => {
        for (let s = 0; s < segX2; s += 2) {
          if (code > buf.readUInt16BE(ends + s)) continue;
          const start = buf.readUInt16BE(starts + s);
          if (code < start) return 0;
          const delta = buf.readInt16BE(deltas + s);
          const rangeOffset = buf.readUInt16BE(ranges + s);
          if (!rangeOffset) return (code + delta) & 0xffff;
          const gid = buf.readUInt16BE(ranges + s + rangeOffset + (code - start) * 2);
          return gid ? (gid + delta) & 0xffff : 0;
        }
        return 0;
      };
    }
  }
  return () => 0;
}
