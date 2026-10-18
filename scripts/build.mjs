// Builds the profile README cards in assets/ from the drivas.dev design
// (neo-brutalist palette, Anton / Space Grotesk / JetBrains Mono).
// Run with: node scripts/build.mjs

import { mkdir, writeFile } from 'node:fs/promises';
import { loadFont } from './fonts.mjs';

const OUT = new URL('../assets/', import.meta.url);

const C = { lime: '#c1fd42', pink: '#f982fb', violet: '#564cf8', coal: '#1d1d1d', white: '#ffffff' };
const W = 1200;
const PAD = 56;
const INNER = W - PAD * 2;

const content = {
  first: 'David',
  last: 'Rivas',
  roles: ['Tech Lead', 'Backend Developer', 'API Design & Integrations'],
  tagline: "Let's connect.",
  location: 'Remote',
  badge: "Let's connect. ✦ drivas.dev ✦",
  about: {
    eyebrow: 'About',
    headline: 'I build the backend that keeps products running.',
    body: [
      "I'm a tech lead and backend developer focused on API design and integrations: connecting systems, data and teams so products ship reliably.",
      'I lead projects end to end, from the data model and the APIs to deployment and the maintenance that comes after launch.',
    ],
  },
  industries: {
    heading: ["Industries I've", 'worked in'],
    items: ['Automotive', 'Aviation & Hospitality', 'Healthcare', 'Marketing agencies', 'Logistics', 'E-commerce'],
  },
  stack: [
    ['Languages', ['TypeScript', 'JavaScript', 'Python', 'PHP', 'SQL']],
    ['Backend', ['Node.js', 'NestJS', 'REST APIs', 'GraphQL', 'Swagger / OpenAPI', 'Prisma', 'Better Auth']],
    ['Frontend', ['Next.js', 'Astro', 'Tailwind CSS', 'WordPress']],
    ['Data', ['PostgreSQL', 'MySQL', 'Redis', 'Supabase', 'Neon']],
    ['Cloud & DevOps', ['AWS', 'Vercel', 'Docker', 'Linux', 'Nginx', 'GitHub Actions', 'GitLab CI/CD']],
    ['Tools', ['Git', 'GitHub', 'GitLab', 'Jira', 'Postman', 'Figma', 'Resend']],
    ['Observability', ['Sentry', 'Grafana', 'Prometheus', 'OpenTelemetry', 'ELK / OpenSearch']],
    ['Security', ['OAuth 2.0 / JWT', 'OWASP', 'Keycloak', 'Cloudflare', 'Snyk', 'Dependabot', 'SonarQube']],
  ],
  skills: [
    ['Technical leadership', 'Guiding architecture decisions and the team that builds them.'],
    ['Mentoring', 'Helping other developers grow through reviews, pairing and feedback.'],
    ['Teamwork', 'Working closely with developers, design and product.'],
    ['Ownership', 'Taking work end to end, from the first commit to production.'],
    ['Client communication', 'Translating technical trade-offs into business terms.'],
    ['Problem solving', 'Diagnosing and fixing issues, even under pressure.'],
    ['Planning & estimation', 'Scoping work, budgets and timelines.'],
    ['Adaptability', 'Picking up new industries, stacks and teams quickly.'],
  ],
  email: 'david.l.rivas@gmail.com',
  social: ['LinkedIn', 'Website', 'Email'],
};

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const r = (n) => Math.round(n * 10) / 10;

const MOTION = `
.rise{animation:rise .8s cubic-bezier(.2,.8,.2,1) both}
@keyframes rise{from{opacity:0;transform:translateY(24px)}}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}`;

function svg({ width = W, height, title, fonts, css = '', body }) {
  const faces = fonts.map((f) => f.fontFace).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${r(height)}" viewBox="0 0 ${width} ${r(height)}" role="img" aria-label="${esc(title)}">
<title>${esc(title)}</title>
<style>${faces}${MOTION}${css}</style>
${body}
</svg>
`;
}

// Greedy word wrap using real glyph widths.
function wrap(font, text, size, maxWidth, tracking = 0) {
  const lines = [];
  let line = '';
  for (const word of text.split(' ')) {
    const next = line ? `${line} ${word}` : word;
    if (line && font.measure(next, size, tracking) > maxWidth) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

function text(font, str, { x, y, size, fill, tracking = 0, weight, opacity, anchor, extra = '' }) {
  const attrs = [
    `x="${r(x)}"`,
    `y="${r(y)}"`,
    `font-family="${font.family}"`,
    `font-size="${size}"`,
    `fill="${fill}"`,
    weight && `font-weight="${weight}"`,
    tracking && `letter-spacing="${r(tracking * size)}"`,
    opacity && `fill-opacity="${opacity}"`,
    anchor && `text-anchor="${anchor}"`,
    extra,
  ].filter(Boolean);
  return `<text ${attrs.join(' ')}>${esc(str)}</text>`;
}

// Anton heading with the site's hard coal text-shadow (0.04em offset).
function shadowed(font, str, opts) {
  const d = opts.size * 0.04;
  return text(font, str, { ...opts, x: opts.x + d, y: opts.y + d, fill: C.coal }) + text(font, str, opts);
}

const card = (height, fill) => `<rect width="${W}" height="${r(height)}" rx="28" fill="${fill}"/>`;

async function hero() {
  const display = await loadFont('display', content.first + content.last);
  const sans = await loadFont('sans', content.roles.join('') + ' · ' + content.tagline + '↗');
  const mono = await loadFont('mono', content.badge);
  const H = 600;
  const size = 200;
  const firstY = PAD + size * 0.74;
  const lastY = firstY + size * 0.85 + 12;

  // Role chips, alternating lime/pink like the site's hero.
  const roleSize = 30;
  const roleY = lastY + 100;
  let x = PAD;
  const chips = content.roles
    .map((role, i) => {
      const w = sans.measure(role, roleSize) + 12;
      const out = [
        `<rect x="${r(x)}" y="${r(roleY - roleSize * 0.82)}" width="${r(w)}" height="${r(roleSize * 1.1)}" fill="${i % 2 ? C.pink : C.lime}"/>`,
        text(sans, role, { x: x + 6, y: roleY, size: roleSize, fill: C.violet, weight: 500 }),
      ];
      x += w;
      if (i < content.roles.length - 1) {
        out.push(text(sans, ' · ', { x, y: roleY, size: roleSize, fill: C.white, weight: 500, extra: 'xml:space="preserve"' }));
        x += sans.measure(' · ', roleSize);
      }
      return out.join('');
    })
    .join('');

  // Spinning "Let's connect" badge, top right.
  const cx = W - PAD - 120;
  const cy = PAD + 120;
  const badge = `<g class="spin">
  <circle cx="${cx}" cy="${cy}" r="120" fill="${C.coal}"/>
  <path id="badge-circle" fill="none" d="M${cx},${cy} m-94,0 a94,94 0 1,1 188,0 a94,94 0 1,1 -188,0"/>
  <text font-family="${mono.family}" font-size="19" fill="${C.lime}" font-weight="500"><textPath href="#badge-circle" textLength="${r(2 * Math.PI * 94 - 24)}" lengthAdjust="spacing">${esc(content.badge.toUpperCase())}</textPath></text>
</g>
${text(sans, '↗', { x: cx, y: cy + 20, size: 64, fill: C.pink, anchor: 'middle' })}`;

  return svg({
    height: H,
    title: `${content.first} ${content.last} — ${content.roles.join(' · ')}`,
    fonts: [display, sans, mono],
    css: `.spin{animation:spin 14s linear infinite;transform-origin:${cx}px ${cy}px}@keyframes spin{to{transform:rotate(360deg)}}
.d1{animation-delay:.1s}.d2{animation-delay:.25s}.d3{animation-delay:.4s}`,
    body: `<defs>
  <pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.6" fill="${C.coal}" fill-opacity=".22"/></pattern>
  <clipPath id="clip"><rect width="${W}" height="${H}" rx="28"/></clipPath>
</defs>
<g clip-path="url(#clip)">
${card(H, C.violet)}
<rect width="${W}" height="${H}" fill="url(#dots)"/>
<g class="rise d1">${shadowed(display, content.first.toUpperCase(), { x: PAD, y: firstY, size, fill: C.white })}</g>
<g class="rise d2">${shadowed(display, content.last.toUpperCase(), { x: PAD + size, y: lastY, size, fill: C.lime })}</g>
<g class="rise d3">${chips}
${text(sans, content.tagline, { x: PAD, y: roleY + 52, size: roleSize, fill: C.white, weight: 500, opacity: 0.8 })}</g>
${badge}
</g>`,
  });
}

async function ticker() {
  const items = [...content.roles, content.location].map((s) => s.toUpperCase());
  const mono = await loadFont('mono', items.join(''));
  const H = 76;
  const size = 19;
  const tracking = 0.1;
  const star = 20;
  const colors = [C.lime, C.pink, C.violet];

  // One run of items wider than the card; it's drawn twice and slid by its own width.
  let x = 0;
  const run = [];
  let i = 0;
  while (x < W + 200) {
    const label = items[i % items.length];
    x += 16;
    run.push(text(mono, '✦', { x, y: H / 2 + 7, size, fill: colors[i % 3] }));
    x += star + 16;
    run.push(text(mono, label, { x, y: H / 2 + 7, size, fill: C.white, tracking, weight: 500 }));
    x += mono.measure(label, size, tracking) + 16;
    i++;
  }
  const runWidth = x;
  const duration = r(runWidth / 50);

  return svg({
    height: H,
    title: items.join(', '),
    fonts: [mono],
    css: `.marquee{animation:marquee ${duration}s linear infinite}@keyframes marquee{to{transform:translateX(-${r(runWidth)}px)}}`,
    body: `<defs><clipPath id="clip"><rect width="${W}" height="${H}" rx="${H / 2}"/></clipPath></defs>
<g clip-path="url(#clip)">
<rect width="${W}" height="${H}" fill="${C.coal}"/>
<g class="marquee"><g>${run.join('')}</g><g transform="translate(${r(runWidth)} 0)">${run.join('')}</g></g>
</g>`,
  });
}

async function about() {
  const { eyebrow, headline, body } = content.about;
  const display = await loadFont('display', headline);
  const sans = await loadFont('sans', body.join(' '));
  const mono = await loadFont('mono', eyebrow);
  const hSize = 66;
  const bSize = 25;
  const bLine = 36;
  const leftW = 560;
  const rightX = PAD + leftW + 64;
  const rightW = W - PAD - rightX;

  const hLines = wrap(display, headline.toUpperCase(), hSize, leftW);
  const bParagraphs = body.map((p) => wrap(sans, p, bSize, rightW));
  const leftH = 40 + hLines.length * hSize * 0.92;
  const rightH = bParagraphs.reduce((h, p) => h + p.length * bLine, 0) + (bParagraphs.length - 1) * 16;
  const contentH = Math.max(leftH, rightH);
  const H = PAD * 2 + contentH;
  const bottom = PAD + contentH;

  // Both columns sit on the same bottom line, like the site's items-end grid.
  let y = bottom - leftH + 14;
  const left = [text(mono, eyebrow.toUpperCase(), { x: PAD, y, size: 17, fill: C.coal, tracking: 0.1, weight: 500 })];
  y += 26 + hSize * 0.74;
  for (const line of hLines) {
    left.push(text(display, line, { x: PAD, y, size: hSize, fill: C.coal }));
    y += hSize * 0.92;
  }

  y = bottom - rightH + bSize * 0.8;
  const right = [];
  for (const lines of bParagraphs) {
    for (const line of lines) {
      right.push(text(sans, line, { x: rightX, y, size: bSize, fill: C.coal, weight: 500 }));
      y += bLine;
    }
    y += 16;
  }

  return svg({
    height: H,
    title: `About: ${headline} ${body.join(' ')}`,
    fonts: [display, sans, mono],
    body: `${card(H, C.lime)}<g class="rise">${left.join('')}${right.join('')}</g>`,
  });
}

// Section heading split in two colours, e.g. "Tech" + lime "stack".
function splitHeading(font, [a, b], { y, size, colorA, colorB, shadow }) {
  const draw = shadow ? shadowed : text;
  const gap = font.measure(' ', size);
  const aW = font.measure(a.toUpperCase(), size);
  const oneLine = aW + gap + font.measure(b.toUpperCase(), size) <= INNER;
  const bX = oneLine ? PAD + aW + gap : PAD;
  const bY = oneLine ? y : y + size * 0.92;
  return {
    svg: draw(font, a.toUpperCase(), { x: PAD, y, size, fill: colorA }) + draw(font, b.toUpperCase(), { x: bX, y: bY, size, fill: colorB }),
    bottom: bY,
  };
}

async function industries() {
  const { heading, items } = content.industries;
  const display = await loadFont('display', heading.join(' ') + items.join(' '));
  const mono = await loadFont('mono', '0123456789');
  const hSize = 76;
  const cols = 3;
  const gap = 20;
  const cardW = (INNER - gap * (cols - 1) - 6) / cols;
  const cardH = 200;
  const nameSize = 40;
  const colors = [
    [C.lime, C.coal],
    [C.pink, C.coal],
    [C.violet, C.white],
  ];

  const head = splitHeading(display, heading, { y: PAD + hSize * 0.74, size: hSize, colorA: C.white, colorB: C.lime });
  const top = head.bottom + 48;
  const cards = items.map((item, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = PAD + col * (cardW + gap);
    const y = top + row * (cardH + gap);
    // Shifted by row so the second row doesn't repeat the first one's colours.
    const [bg, fg] = colors[(i + row) % colors.length];
    const lines = wrap(display, item.toUpperCase(), nameSize, cardW - 56);
    const names = lines.map((line, l) =>
      text(display, line, { x: x + 28, y: y + cardH - 28 - (lines.length - 1 - l) * nameSize, size: nameSize, fill: fg }),
    );
    return `<rect x="${r(x + 6)}" y="${r(y + 6)}" width="${r(cardW)}" height="${cardH}" rx="24" fill="${C.white}"/>
<rect x="${r(x + 1)}" y="${r(y + 1)}" width="${r(cardW - 2)}" height="${cardH - 2}" rx="23" fill="${bg}" stroke="${C.white}" stroke-width="2"/>
${text(mono, `0${i + 1}`, { x: x + 28, y: y + 48, size: 18, fill: fg, tracking: 0.1, weight: 500 })}
${names.join('')}`;
  });
  const H = top + Math.ceil(items.length / cols) * (cardH + gap) - gap + 6 + PAD;

  return svg({
    height: H,
    title: `${heading.join(' ')}: ${items.join(', ')}`,
    fonts: [display, mono],
    body: `${card(H, C.coal)}${head.svg}<g class="rise">${cards.join('')}</g>`,
  });
}

async function stack() {
  const heading = ['Tech', 'stack'];
  const all = content.stack.flatMap(([group, items]) => [group, ...items]).join(' ');
  const display = await loadFont('display', heading.join(' '));
  const mono = await loadFont('mono', all);
  const hSize = 88;
  const labelW = 250;
  const pillsX = PAD + labelW;
  const pillsW = W - PAD - pillsX - 3;
  const size = 18;
  const pillH = 42;
  const pillGap = 14;

  const head = splitHeading(display, heading, { y: PAD + hSize * 0.74, size: hSize, colorA: C.white, colorB: C.lime, shadow: true });
  let y = head.bottom + 48;
  const rows = [`<rect x="${PAD}" y="${r(y)}" width="${INNER}" height="2" fill="${C.white}" fill-opacity=".25"/>`];

  for (const [group, items] of content.stack) {
    // Lay the pills out first to know how tall the row is.
    const pills = [];
    let px = 0;
    let line = 0;
    for (const item of items) {
      const w = mono.measure(item, size) + 32;
      if (px && px + w > pillsW) {
        px = 0;
        line++;
      }
      pills.push({ item, x: pillsX + px, line, w });
      px += w + pillGap;
    }
    const pillsH = (line + 1) * pillH + line * pillGap;
    const rowH = pillsH + 48;
    const top = y + 24;
    rows.push(text(mono, group.toUpperCase(), { x: PAD, y: top + pillsH / 2 + 6, size: 16, fill: C.lime, tracking: 0.1, weight: 500 }));
    for (const p of pills) {
      const py = top + p.line * (pillH + pillGap);
      rows.push(`<rect x="${r(p.x + 3)}" y="${r(py + 3)}" width="${r(p.w)}" height="${pillH}" rx="${pillH / 2}" fill="${C.coal}"/>
<rect x="${r(p.x + 1)}" y="${r(py + 1)}" width="${r(p.w - 2)}" height="${pillH - 2}" rx="${pillH / 2 - 1}" fill="${C.white}" stroke="${C.coal}" stroke-width="2"/>
${text(mono, p.item, { x: p.x + 16, y: py + pillH / 2 + 6, size, fill: C.coal, weight: 500 })}`);
    }
    y += rowH;
    rows.push(`<rect x="${PAD}" y="${r(y)}" width="${INNER}" height="2" fill="${C.white}" fill-opacity=".25"/>`);
  }
  const H = y + PAD;

  return svg({
    height: H,
    title: `Tech stack: ${content.stack.map(([g, items]) => `${g}: ${items.join(', ')}`).join('. ')}`,
    fonts: [display, mono],
    body: `${card(H, C.violet)}${head.svg}<g class="rise">${rows.join('\n')}</g>`,
  });
}

async function skills() {
  const heading = ['How I', 'work'];
  const display = await loadFont('display', heading.join(' ') + content.skills.map(([n]) => n).join(' '));
  const sans = await loadFont('sans', content.skills.map(([, d]) => d).join(' '));
  const mono = await loadFont('mono', 'SOFT KILS0123456789');
  const hSize = 88;
  const colGap = 40;
  const colW = (INNER - colGap) / 2;
  const numW = 60;
  const nameSize = 38;
  const descSize = 23;
  const descLine = 32;

  let y = PAD + 14;
  const out = [text(mono, 'SOFT SKILLS', { x: PAD, y, size: 17, fill: C.coal, tracking: 0.1, weight: 500 })];
  const headY = y + 26 + hSize * 0.74;
  const gap = display.measure(' ', hSize);
  const aW = display.measure(heading[0].toUpperCase(), hSize);
  out.push(text(display, heading[0].toUpperCase(), { x: PAD, y: headY, size: hSize, fill: C.coal }));
  out.push(shadowed(display, heading[1].toUpperCase(), { x: PAD + aW + gap, y: headY, size: hSize, fill: C.white }));
  y = headY + 48;

  // Each column has its own dividers, matching the site's md:gap-x-10 grid.
  const dividers = (ly) =>
    [0, 1].map((j) => `<rect x="${r(PAD + j * (colW + colGap))}" y="${r(ly)}" width="${r(colW)}" height="2" fill="${C.coal}"/>`).join('');
  out.push(dividers(y));
  // Two columns filled row by row, like the site's ordered grid.
  for (let i = 0; i < content.skills.length; i += 2) {
    const pair = content.skills.slice(i, i + 2).map(([name, desc]) => ({
      name: wrap(display, name.toUpperCase(), nameSize, colW - numW),
      desc: wrap(sans, desc, descSize, colW - numW),
    }));
    const rowH = Math.max(...pair.map((p) => p.name.length * nameSize + 10 + p.desc.length * descLine)) + 40;
    pair.forEach((p, j) => {
      const x = PAD + j * (colW + colGap);
      let ty = y + 24 + nameSize * 0.74;
      out.push(text(mono, String(i + j + 1).padStart(2, '0'), { x, y: ty, size: 18, fill: C.coal, tracking: 0.1, weight: 500 }));
      for (const l of p.name) {
        out.push(text(display, l, { x: x + numW, y: ty, size: nameSize, fill: C.coal }));
        ty += nameSize;
      }
      ty += 10 - nameSize + descLine;
      for (const l of p.desc) {
        out.push(text(sans, l, { x: x + numW, y: ty, size: descSize, fill: C.coal, weight: 500, opacity: 0.8 }));
        ty += descLine;
      }
    });
    y += rowH;
    out.push(dividers(y));
  }
  const H = y + PAD;

  return svg({
    height: H,
    title: `Soft skills — How I work: ${content.skills.map(([n, d]) => `${n}: ${d}`).join(' ')}`,
    fonts: [display, sans, mono],
    body: `${card(H, C.pink)}<g class="rise">${out.join('\n')}</g>`,
  });
}

async function contact() {
  const display = await loadFont('display', content.tagline);
  const sans = await loadFont('sans', content.email);
  const mono = await loadFont('mono', 'CONTACT');
  let size = 160;
  while (display.measure(content.tagline.toUpperCase(), size) > INNER) size -= 4;

  let y = PAD + 14;
  const out = [text(mono, 'CONTACT', { x: PAD, y, size: 17, fill: C.lime, tracking: 0.1, weight: 500 })];
  y += 26 + size * 0.74;
  out.push(text(display, content.tagline.toUpperCase(), { x: PAD, y, size, fill: C.white }));
  y += 76;
  const emailSize = 30;
  const emailW = sans.measure(content.email, emailSize);
  out.push(text(sans, content.email, { x: PAD, y, size: emailSize, fill: C.white, weight: 500 }));
  out.push(`<rect x="${PAD}" y="${r(y + 10)}" width="${r(emailW)}" height="4" fill="${C.pink}"/>`);
  const H = y + 14 + PAD;

  return svg({
    height: H,
    title: `Contact — ${content.tagline} ${content.email}`,
    fonts: [display, sans, mono],
    body: `${card(H, C.coal)}<g class="rise">${out.join('')}</g>`,
  });
}

// Social buttons: one SVG per link so each can be wrapped in its own <a>.
// The border/shadow colour follows GitHub's theme (coal on light, white on dark).
async function socialButtons() {
  const labels = content.social.map((s) => s.toUpperCase());
  const mono = await loadFont('mono', labels.join('') + '↗');
  const size = 14;
  const fills = [
    [C.lime, C.coal],
    [C.pink, C.coal],
    [C.violet, C.white],
  ];
  const files = {};
  labels.forEach((label, i) => {
    const w = mono.measure(label, size, 0.1) + 8 + mono.measure('↗', size) + 48;
    const h = 46;
    const [bg, fg] = fills[i % fills.length];
    for (const [theme, edge] of [
      ['light', C.coal],
      ['dark', C.white],
    ]) {
      files[`social-${content.social[i].toLowerCase()}-${theme}.svg`] = svg({
        width: Math.ceil(w + 6),
        height: h + 6,
        title: content.social[i],
        fonts: [mono],
        body: `<rect x="4" y="4" width="${r(w)}" height="${h}" rx="${h / 2}" fill="${edge}"/>
<rect x="1" y="1" width="${r(w - 2)}" height="${h - 2}" rx="${h / 2 - 1}" fill="${bg}" stroke="${edge}" stroke-width="2"/>
${text(mono, `${label} ↗`, { x: 24, y: h / 2 + 5, size, fill: fg, tracking: 0.1, weight: 500, extra: 'xml:space="preserve"' })}`,
      });
    }
  });
  return files;
}

await mkdir(OUT, { recursive: true });
const files = {
  'hero.svg': await hero(),
  'ticker.svg': await ticker(),
  'about.svg': await about(),
  'industries.svg': await industries(),
  'stack.svg': await stack(),
  'skills.svg': await skills(),
  'contact.svg': await contact(),
  ...(await socialButtons()),
};
for (const [name, data] of Object.entries(files)) {
  await writeFile(new URL(name, OUT), data);
  console.log(`assets/${name}  ${(data.length / 1024).toFixed(1)} KB`);
}
