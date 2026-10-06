/**
 * High-detail procedural sample images created via HTML5 Canvas.
 * Provides immediate out-of-the-box test images with fine details
 * (perfect for demonstrating progressive zoom-out from a micro focal point).
 */

export interface SampleImagePreset {
  id: string;
  name: string;
  description: string;
  focalPoint: { x: number; y: number }; // normalized 0..1
  initialZoom: number; // e.g. 5.5x
  generator: () => string; // returns data URL
}

const sampleCache: Record<string, string> = {};

/**
 * Everland Four Seasons Garden (에버랜드 포시즌스 가든)
 * Captures:
 * - Clear blue sky and distant hills
 * - European Adventure promenade architecture with domes
 * - Giant Fairytale Tower Tree (with clock house and spire at top center)
 * - Grand central fountain with water jets and strolling visitors
 * - Iconic 3D white block letters "EVERLAND"
 * - Lush foreground autumn flowerbeds: fluffy Kochia (댑싸리), marigolds, and celosia
 */
export function getEverlandGardenCanvas(): string {
  if (sampleCache['everland']) return sampleCache['everland'];

  const width = 1920;
  const height = 1080;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // 1. Bright crisp autumn sky
  const skyGrad = ctx.createLinearGradient(0, 0, 0, 480);
  skyGrad.addColorStop(0, '#38bdf8'); // sky blue
  skyGrad.addColorStop(0.5, '#7dd3fc');
  skyGrad.addColorStop(0.85, '#bae6fd');
  skyGrad.addColorStop(1, '#e0f2fe');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, width, height);

  // Wispy light clouds
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  const clouds = [
    { x: 300, y: 70, w: 220, h: 40 },
    { x: 750, y: 90, w: 320, h: 50 },
    { x: 1350, y: 60, w: 280, h: 45 },
    { x: 1680, y: 110, w: 200, h: 35 },
  ];
  clouds.forEach((c) => {
    ctx.beginPath();
    ctx.ellipse(c.x, c.y, c.w / 2, c.h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(c.x + 40, c.y - 10, c.w / 3, c.h / 1.8, 0, 0, Math.PI * 2);
    ctx.fill();
  });

  // 2. Distant rolling green mountain ridges
  ctx.fillStyle = '#658063';
  ctx.beginPath();
  ctx.moveTo(0, 360);
  ctx.bezierCurveTo(400, 310, 800, 350, 1200, 290);
  ctx.bezierCurveTo(1500, 250, 1750, 290, width, 270);
  ctx.lineTo(width, 480);
  ctx.lineTo(0, 480);
  ctx.fill();

  ctx.fillStyle = '#4d694c';
  ctx.beginPath();
  ctx.moveTo(0, 380);
  ctx.bezierCurveTo(350, 340, 700, 370, 1100, 320);
  ctx.bezierCurveTo(1450, 280, 1700, 320, width, 300);
  ctx.lineTo(width, 480);
  ctx.lineTo(0, 480);
  ctx.fill();

  // Dense tree line behind European promenade
  ctx.fillStyle = '#2d502a';
  for (let x = 0; x < width; x += 18) {
    const th = 40 + Math.sin(x * 0.05) * 15;
    ctx.beginPath();
    ctx.arc(x, 370 - th / 2, 16, 0, Math.PI * 2);
    ctx.fill();
  }

  // 3. European Adventure promenade buildings (Left and Right)
  // Left architecture
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(80, 340, 450, 60);
  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(80, 370, 450, 35);
  // Arched colonnade
  ctx.fillStyle = '#334155';
  for (let bx = 110; bx < 500; bx += 40) {
    ctx.beginPath();
    ctx.arc(bx + 12, 385, 10, Math.PI, 0);
    ctx.rect(bx + 2, 385, 20, 20);
    ctx.fill();
  }
  // Glass dome on left
  ctx.fillStyle = '#93c5fd';
  ctx.beginPath();
  ctx.arc(380, 340, 35, Math.PI, 0);
  ctx.fill();
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Right promenade architecture with red & terracotta domed pavilions
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(1150, 335, 700, 65);
  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(1150, 365, 700, 40);
  for (let bx = 1180; bx < 1800; bx += 38) {
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.arc(bx + 12, 385, 9, Math.PI, 0);
    ctx.rect(bx + 3, 385, 18, 20);
    ctx.fill();
  }
  // Terracotta domes
  const domes = [
    { x: 1220, y: 335, r: 28, color: '#e11d48' },
    { x: 1550, y: 335, r: 30, color: '#be123c' },
    { x: 1720, y: 335, r: 26, color: '#e11d48' },
  ];
  domes.forEach((d) => {
    ctx.fillStyle = d.color;
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.r, Math.PI, 0);
    ctx.fill();
    // Spire on dome
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(d.x - 2, d.y - d.r - 12, 4, 12);
  });

  // Promenade terrace balustrades & railings
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(80, 340);
  ctx.lineTo(530, 340);
  ctx.moveTo(1150, 335);
  ctx.lineTo(1850, 335);
  ctx.stroke();

  // Terraced flower gardens on upper slope
  ctx.fillStyle = '#ca8a04';
  ctx.fillRect(200, 405, 340, 20);
  ctx.fillStyle = '#ea580c';
  ctx.fillRect(210, 425, 320, 20);
  ctx.fillStyle = '#ca8a04';
  ctx.fillRect(1140, 405, 420, 20);
  ctx.fillStyle = '#ea580c';
  ctx.fillRect(1130, 425, 440, 20);

  // 4. MAIN FOCAL ATTRACTION: The Tower Tree (로맨틱 타워 트리)
  // Center is around x: 960, top spire at y: 155, base at y: 410
  const treeX = 960;
  const treeBaseY = 410;
  const treeTopY = 200;
  const treeHalfW = 95;

  // Tree cone shadow & body
  const treeGrad = ctx.createLinearGradient(treeX - treeHalfW, 0, treeX + treeHalfW, 0);
  treeGrad.addColorStop(0, '#064e3b');
  treeGrad.addColorStop(0.35, '#065f46');
  treeGrad.addColorStop(0.7, '#047857');
  treeGrad.addColorStop(1, '#022c22');
  ctx.fillStyle = treeGrad;
  ctx.beginPath();
  ctx.moveTo(treeX, treeTopY);
  ctx.lineTo(treeX + treeHalfW, treeBaseY);
  ctx.lineTo(treeX - treeHalfW, treeBaseY);
  ctx.closePath();
  ctx.fill();

  // Dense pine texture layers on the tree
  ctx.fillStyle = '#065f46';
  for (let ty = treeTopY + 20; ty < treeBaseY; ty += 14) {
    const prog = (ty - treeTopY) / (treeBaseY - treeTopY);
    const tw = prog * treeHalfW * 0.95;
    for (let tx = treeX - tw; tx < treeX + tw; tx += 12) {
      ctx.beginPath();
      ctx.arc(tx, ty, 6, 0, Math.PI);
      ctx.fill();
    }
  }

  // Sparkling tree decorations (flowers, butterflies, golden lights)
  const colors = ['#fde047', '#f43f5e', '#38bdf8', '#ffffff', '#fb923c', '#a855f7'];
  for (let i = 0; i < 90; i++) {
    const prog = 0.15 + (i / 90) * 0.8;
    const ty = treeTopY + prog * (treeBaseY - treeTopY);
    const tw = prog * treeHalfW * 0.85;
    const tx = treeX + (Math.sin(i * 13.7) * tw);
    ctx.fillStyle = colors[i % colors.length];
    ctx.beginPath();
    ctx.arc(tx, ty, 3 + (i % 3), 0, Math.PI * 2);
    ctx.fill();
  }

  // Central Fairytale Clock House on the tree (at x: 960, y: 295)
  ctx.fillStyle = '#d97706'; // warm amber wooden house
  ctx.fillRect(treeX - 28, 280, 56, 42);
  // House roof gables
  ctx.fillStyle = '#991b1b';
  ctx.beginPath();
  ctx.moveTo(treeX - 34, 280);
  ctx.lineTo(treeX, 255);
  ctx.lineTo(treeX + 34, 280);
  ctx.closePath();
  ctx.fill();
  // Clock face
  ctx.fillStyle = '#fef3c7';
  ctx.beginPath();
  ctx.arc(treeX, 298, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 2;
  ctx.stroke();
  // Clock hands
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(treeX, 298);
  ctx.lineTo(treeX, 291);
  ctx.moveTo(treeX, 298);
  ctx.lineTo(treeX + 6, 298);
  ctx.stroke();

  // Spire at the peak of the tree (x: 960, y: 155 to 200)
  ctx.fillStyle = '#ca8a04';
  ctx.fillRect(treeX - 12, 195, 24, 8);
  // Slender spire roof
  const spireGrad = ctx.createLinearGradient(treeX - 10, 0, treeX + 10, 0);
  spireGrad.addColorStop(0, '#ea580c');
  spireGrad.addColorStop(0.5, '#f97316');
  spireGrad.addColorStop(1, '#c2410c');
  ctx.fillStyle = spireGrad;
  ctx.beginPath();
  ctx.moveTo(treeX - 12, 195);
  ctx.lineTo(treeX, 155);
  ctx.lineTo(treeX + 12, 195);
  ctx.closePath();
  ctx.fill();
  // Weather vane / golden ball on top
  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.arc(treeX, 153, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ca8a04';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(treeX, 153);
  ctx.lineTo(treeX, 142);
  ctx.lineTo(treeX + 8, 145);
  ctx.stroke();

  // Tree stage pavilion at base
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(treeX - 55, treeBaseY - 2, 110, 22);
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(treeX - 45, treeBaseY + 4, 90, 14);

  // 5. Grand Plaza & Central Fountain
  // Sunlit plaza ground
  const plazaGrad = ctx.createLinearGradient(0, 420, 0, 580);
  plazaGrad.addColorStop(0, '#fed7aa');
  plazaGrad.addColorStop(0.5, '#fef3c7');
  plazaGrad.addColorStop(1, '#f8fafc');
  ctx.fillStyle = plazaGrad;
  ctx.fillRect(0, 420, width, 180);

  // Grand circular fountain basin
  const fX = 960;
  const fY = 505;
  const fW = 420;
  const fH = 50;

  // Basin rim (outer)
  ctx.fillStyle = '#cbd5e1';
  ctx.beginPath();
  ctx.ellipse(fX, fY, fW / 2 + 10, fH / 2 + 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Water pool (sparkling turquoise)
  const poolGrad = ctx.createRadialGradient(fX, fY, 10, fX, fY, fW / 2);
  poolGrad.addColorStop(0, '#38bdf8');
  poolGrad.addColorStop(0.7, '#0284c7');
  poolGrad.addColorStop(1, '#0369a1');
  ctx.fillStyle = poolGrad;
  ctx.beginPath();
  ctx.ellipse(fX, fY, fW / 2, fH / 2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Fountain center sculpture & water jets
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(fX - 16, fY - 24, 32, 28);
  ctx.beginPath();
  ctx.arc(fX, fY - 30, 14, 0, Math.PI * 2);
  ctx.fill();

  // High spraying water jets
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  // Center main geyser
  ctx.moveTo(fX, fY - 35);
  ctx.lineTo(fX, fY - 95);
  // Arched side jets
  ctx.moveTo(fX - 80, fY - 8);
  ctx.quadraticCurveTo(fX - 40, fY - 60, fX - 10, fY - 25);
  ctx.moveTo(fX + 80, fY - 8);
  ctx.quadraticCurveTo(fX + 40, fY - 60, fX + 10, fY - 25);
  ctx.stroke();

  // Fine spray mist
  ctx.fillStyle = 'rgba(224, 242, 254, 0.7)';
  ctx.beginPath();
  ctx.ellipse(fX, fY - 70, 45, 30, 0, 0, Math.PI * 2);
  ctx.fill();

  // People / Visitors strolling around fountain plaza
  const people = [
    { x: 340, y: 505, color: '#3b82f6' },
    { x: 370, y: 510, color: '#ef4444' },
    { x: 740, y: 512, color: '#10b981' },
    { x: 765, y: 520, color: '#f59e0b' },
    { x: 910, y: 525, color: '#6366f1' },
    { x: 935, y: 535, color: '#ec4899' },
    { x: 980, y: 535, color: '#1e293b' },
    { x: 1010, y: 540, color: '#8b5cf6' },
    { x: 1350, y: 515, color: '#0ea5e9' },
    { x: 1380, y: 512, color: '#e11d48' },
    { x: 1650, y: 495, color: '#14b8a6' },
    { x: 1680, y: 502, color: '#f97316' },
  ];
  people.forEach((p) => {
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - 3, p.y - 18, 6, 18); // body
    ctx.fillStyle = '#fde68a';
    ctx.beginPath();
    ctx.arc(p.x, p.y - 21, 3.5, 0, Math.PI * 2); // head
    ctx.fill();
  });

  // 6. ICONIC 3D WHITE "E V E R L A N D" LETTERS
  // Placed across the middle-lower zone at y: 620
  const letterY = 645;
  const letters = ['E', 'V', 'E', 'R', 'L', 'A', 'N', 'D'];
  const startX = 220;
  const totalW = 1480;
  const stepX = totalW / (letters.length - 1);

  ctx.font = '900 102px system-ui, -apple-system, sans-serif';
  ctx.textBaseline = 'alphabetic';

  letters.forEach((char, i) => {
    const lx = startX + i * stepX;

    // 3D Extrusion / Drop shadow behind letters
    ctx.fillStyle = '#64748b';
    for (let depth = 16; depth > 0; depth--) {
      ctx.fillText(char, lx + depth, letterY + depth * 0.8);
    }

    // Front pristine white face
    ctx.fillStyle = '#ffffff';
    ctx.fillText(char, lx, letterY);

    // Subtle crisp border
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.strokeText(char, lx, letterY);
  });

  // 7. LUSH FOREGROUND AUTUMN FLOWERBEDS: Kochia (댑싸리), Marigolds, Celosia
  // Row 1: Back row of Kochia bushes behind/around the letters (y: 650 - 750)
  const kochiaColors = [
    '#9f1239', // deep crimson
    '#be123c', // rose red
    '#e11d48', // bright red
    '#ea580c', // autumn orange
    '#ca8a04', // golden yellow
    '#65a30d', // lime green
    '#4d7c0f', // lush green
  ];

  // Helper for drawing a fluffy Kochia (댑싸리) bush
  const drawKochia = (cx: number, cy: number, r: number, baseColor: string) => {
    const grad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.1, cx, cy, r);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.2, baseColor);
    grad.addColorStop(0.85, baseColor);
    grad.addColorStop(1, '#1e293b');
    ctx.fillStyle = grad;

    // Fluffy cloud of circles
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // Soft tuft outlines
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
      const tx = cx + Math.cos(a) * (r * 0.85);
      const ty = cy + Math.sin(a) * (r * 0.85);
      ctx.beginPath();
      ctx.arc(tx, ty, r * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  // Row 1 Kochia bushes (mid size)
  for (let x = 60; x <= width + 60; x += 110) {
    const cIdx = Math.floor(Math.abs(Math.sin(x * 0.02)) * kochiaColors.length);
    const ky = 710 + Math.sin(x * 0.04) * 25;
    drawKochia(x, ky, 58, kochiaColors[cIdx]);
  }

  // Row 2 Kochia bushes (larger, vibrant foreground)
  for (let x = 10; x <= width + 80; x += 140) {
    const cIdx = Math.floor(Math.abs(Math.cos(x * 0.015)) * kochiaColors.length);
    const ky = 830 + Math.cos(x * 0.03) * 30;
    drawKochia(x, ky, 80, kochiaColors[cIdx]);
  }

  // Row 3 Front dense Kochia bushes
  for (let x = -30; x <= width + 100; x += 170) {
    const cIdx = (Math.floor(x / 170) + 3) % kochiaColors.length;
    const ky = 930 + Math.sin(x * 0.02) * 25;
    drawKochia(x, ky, 105, kochiaColors[cIdx]);
  }

  // Rich yellow & orange Marigolds & purple Celosia tapestry at the bottom edge (y: 920 - 1080)
  for (let i = 0; i < 450; i++) {
    const fx = Math.sin(i * 37) * 980 + 960;
    const fy = 900 + Math.abs(Math.cos(i * 19)) * 180;
    const isMarigold = i % 2 === 0;

    if (isMarigold) {
      // Golden marigold
      ctx.fillStyle = i % 4 === 0 ? '#fbbf24' : '#f59e0b';
      ctx.beginPath();
      ctx.arc(fx, fy, 7 + (i % 5), 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Purple / Wine celosia plume
      ctx.fillStyle = i % 3 === 0 ? '#9333ea' : '#e11d48';
      ctx.beginPath();
      ctx.ellipse(fx, fy, 4, 14, 0.15, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Watermark text in bottom right matching the photo: @withEVERLAND
  ctx.font = '700 22px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 6;
  ctx.fillText('@withEVERLAND', width - 230, height - 38);
  ctx.shadowBlur = 0;

  const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
  sampleCache['everland'] = dataUrl;
  return dataUrl;
}

export function getSampleArtCanvas(): string {
  if (sampleCache['art']) return sampleCache['art'];

  const width = 1920;
  const height = 1080;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#090d16');
  bgGrad.addColorStop(0.5, '#131e32');
  bgGrad.addColorStop(1, '#0b1220');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = 'rgba(99, 102, 241, 0.15)';
  ctx.lineWidth = 1;
  for (let x = 0; x < width; x += 60) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += 60) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  const mountainGrad = ctx.createLinearGradient(0, 400, 0, height);
  mountainGrad.addColorStop(0, '#1e1b4b');
  mountainGrad.addColorStop(1, '#0f172a');
  ctx.fillStyle = mountainGrad;
  ctx.beginPath();
  ctx.moveTo(0, 750);
  ctx.bezierCurveTo(400, 550, 700, 850, 1100, 600);
  ctx.bezierCurveTo(1400, 450, 1700, 700, width, 650);
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.fill();

  for (let i = 0; i < 40; i++) {
    const bx = 100 + i * 44;
    const bh = 150 + Math.sin(i * 1.3) * 180 + Math.cos(i * 2.1) * 80;
    const bw = 32 + (i % 3) * 8;
    const by = height - bh - 100;

    const bGrad = ctx.createLinearGradient(bx, by, bx, by + bh);
    bGrad.addColorStop(0, '#312e81');
    bGrad.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = bGrad;
    ctx.fillRect(bx, by, bw, bh);

    ctx.fillStyle = i % 2 === 0 ? 'rgba(254, 240, 138, 0.7)' : 'rgba(147, 197, 253, 0.7)';
    for (let wy = by + 12; wy < by + bh - 20; wy += 16) {
      for (let wx = bx + 6; wx < bx + bw - 6; wx += 10) {
        if ((wx + wy) % 5 === 0) {
          ctx.fillRect(wx, wy, 4, 6);
        }
      }
    }
  }

  const moonX = 1450;
  const moonY = 320;
  const moonR = 180;
  const moonGrad = ctx.createRadialGradient(moonX, moonY, 10, moonX, moonY, moonR);
  moonGrad.addColorStop(0, '#fef08a');
  moonGrad.addColorStop(0.4, '#f59e0b');
  moonGrad.addColorStop(0.8, '#d97706');
  moonGrad.addColorStop(1, 'rgba(217, 119, 6, 0)');
  ctx.fillStyle = moonGrad;
  ctx.beginPath();
  ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
  ctx.fill();

  const fx = 450;
  const fy = 580;

  ctx.fillStyle = '#4338ca';
  ctx.fillRect(fx - 24, fy - 10, 48, 50);

  const coreGrad = ctx.createRadialGradient(fx, fy - 35, 2, fx, fy - 35, 25);
  coreGrad.addColorStop(0, '#ffffff');
  coreGrad.addColorStop(0.3, '#38bdf8');
  coreGrad.addColorStop(0.7, '#6366f1');
  coreGrad.addColorStop(1, 'rgba(99, 102, 241, 0)');
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(fx, fy - 35, 25, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(fx + 8, fy - 30, 4, 14);
  ctx.beginPath();
  ctx.arc(fx + 10, fy - 33, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(fx + 10, fy - 26);
  ctx.lineTo(fx + 24, fy - 40);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(56, 189, 248, 0.8)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(fx + 24, fy - 40);
  ctx.lineTo(moonX, moonY);
  ctx.stroke();
  ctx.setLineDash([]);

  const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
  sampleCache['art'] = dataUrl;
  return dataUrl;
}

export function getSampleNatureCanvas(): string {
  if (sampleCache['nature']) return sampleCache['nature'];

  const width = 1920;
  const height = 1080;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const bg = ctx.createLinearGradient(0, 0, 0, height);
  bg.addColorStop(0, '#064e3b');
  bg.addColorStop(0.5, '#065f46');
  bg.addColorStop(1, '#022c22');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  for (let i = 0; i < 45; i++) {
    const bx = Math.sin(i * 19) * 900 + 960;
    const by = Math.cos(i * 31) * 500 + 540;
    const br = 40 + (i % 7) * 25;
    const bGrad = ctx.createRadialGradient(bx, by, 5, bx, by, br);
    bGrad.addColorStop(0, 'rgba(167, 243, 208, 0.25)');
    bGrad.addColorStop(1, 'rgba(167, 243, 208, 0)');
    ctx.fillStyle = bGrad;
    ctx.beginPath();
    ctx.arc(bx, by, br, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 26;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(100, 850);
  ctx.quadraticCurveTo(600, 700, 1100, 480);
  ctx.quadraticCurveTo(1500, 350, 1850, 400);
  ctx.stroke();

  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.moveTo(950, 520);
  ctx.quadraticCurveTo(1150, 620, 1400, 660);
  ctx.stroke();

  const flowerPositions = [
    { x: 500, y: 720 },
    { x: 750, y: 610 },
    { x: 1050, y: 490 },
    { x: 1350, y: 390 },
    { x: 1600, y: 370 },
  ];

  flowerPositions.forEach((pos, idx) => {
    ctx.save();
    ctx.translate(pos.x, pos.y);
    const petals = 6;
    for (let p = 0; p < petals; p++) {
      ctx.rotate((Math.PI * 2) / petals);
      ctx.fillStyle = idx % 2 === 0 ? '#fbcfe8' : '#f472b6';
      ctx.beginPath();
      ctx.ellipse(0, 32, 14, 28, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  const lx = 1045;
  const ly = 465;

  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.ellipse(lx, ly, 18, 14, -0.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(lx - 16, ly - 3, 7, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(lx - 12, ly - 2);
  ctx.lineTo(lx + 18, ly + 2);
  ctx.stroke();

  ctx.fillStyle = '#0f172a';
  const spots = [
    { x: lx - 5, y: ly - 6 },
    { x: lx + 7, y: ly - 5 },
    { x: lx - 3, y: ly + 6 },
    { x: lx + 8, y: ly + 5 },
  ];
  spots.forEach((s) => {
    ctx.beginPath();
    ctx.arc(s.x, s.y, 3, 0, Math.PI * 2);
    ctx.fill();
  });

  const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
  sampleCache['nature'] = dataUrl;
  return dataUrl;
}

export const SAMPLE_PRESETS: SampleImagePreset[] = [
  {
    id: 'everland',
    name: '에버랜드 포시즌스 가든 (타워 트리)',
    description: '동화 속 대형 타워 트리 시계탑에서 시작해 포시즌스 가든 댑싸리 꽃밭과 에버랜드 전경으로 줌아웃',
    focalPoint: { x: 0.50, y: 0.28 }, // Fairytale Tower Tree clock & spire
    initialZoom: 5.5,
    generator: getEverlandGardenCanvas,
  },
  {
    id: 'nature',
    name: '봄꽃과 무당벌레의 비밀',
    description: '꽃잎 위 작은 무당벌레의 디테일에서 전체 봄 정원으로 줌아웃',
    focalPoint: { x: 1045 / 1920, y: 465 / 1080 },
    initialZoom: 6.0,
    generator: getSampleNatureCanvas,
  },
  {
    id: 'starlight',
    name: '천문대와 비밀의 신호',
    description: '광활한 미래 도시와 산맥 위 작은 천문대 망원경에서 줌아웃',
    focalPoint: { x: 450 / 1920, y: 580 / 1080 },
    initialZoom: 5.5,
    generator: getSampleArtCanvas,
  },
];
