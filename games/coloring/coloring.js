/* Coloring Time — simple toddler-friendly drawing canvas
   - 10 selectable coloring templates (animals + vehicles)
   - Color palette
   - Pen vs Brush
   - Eraser
   - Clear
   - Music toggle icon (matches other pages)
*/

const $ = (sel) => document.querySelector(sel);

/* ---- Template drawing functions ---- */

function drawSunnyDay(ctx, w, h) {
  // Sun
  ctx.beginPath();
  ctx.arc(w * 0.82, h * 0.22, Math.min(w,h) * 0.09, 0, Math.PI * 2);
  ctx.stroke();
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const r1 = Math.min(w,h) * 0.12;
    const r2 = Math.min(w,h) * 0.15;
    const cx = w * 0.82;
    const cy = h * 0.22;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
    ctx.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2);
    ctx.stroke();
  }

  // Clouds
  function cloud(x, y, s) {
    ctx.beginPath();
    ctx.arc(x, y, 26*s, 0, Math.PI*2);
    ctx.arc(x+28*s, y-12*s, 32*s, 0, Math.PI*2);
    ctx.arc(x+62*s, y, 26*s, 0, Math.PI*2);
    ctx.arc(x+36*s, y+14*s, 30*s, 0, Math.PI*2);
    ctx.closePath();
    ctx.stroke();
  }
  cloud(w*0.10, h*0.18, 1.0);
  cloud(w*0.18, h*0.38, 1.15);
  cloud(w*0.08, h*0.62, 1.25);

  // Smiley face
  const r = Math.min(w,h) * 0.22;
  const cx = w*0.52;
  const cy = h*0.60;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI*2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx - r*0.35, cy - r*0.2, r*0.08, 0, Math.PI*2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx + r*0.35, cy - r*0.2, r*0.08, 0, Math.PI*2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy + r*0.05, r*0.55, 0, Math.PI);
  ctx.stroke();
}

function drawCat(ctx, w, h) {
  const cx = w * 0.5;
  const cy = h * 0.38;
  const r = Math.min(w, h) * 0.18;

  // Head
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  // Left ear
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.75, cy - r * 0.65);
  ctx.lineTo(cx - r * 0.4, cy - r * 1.35);
  ctx.lineTo(cx - r * 0.05, cy - r * 0.65);
  ctx.stroke();

  // Right ear
  ctx.beginPath();
  ctx.moveTo(cx + r * 0.05, cy - r * 0.65);
  ctx.lineTo(cx + r * 0.4, cy - r * 1.35);
  ctx.lineTo(cx + r * 0.75, cy - r * 0.65);
  ctx.stroke();

  // Eyes
  ctx.beginPath();
  ctx.arc(cx - r * 0.35, cy - r * 0.1, r * 0.09, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx + r * 0.35, cy - r * 0.1, r * 0.09, 0, Math.PI * 2);
  ctx.stroke();

  // Nose
  ctx.beginPath();
  ctx.moveTo(cx, cy + r * 0.1);
  ctx.lineTo(cx - r * 0.1, cy + r * 0.22);
  ctx.lineTo(cx + r * 0.1, cy + r * 0.22);
  ctx.closePath();
  ctx.stroke();

  // Whiskers
  for (const side of [-1, 1]) {
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(cx + side * r * 0.2, cy + r * 0.2);
      ctx.lineTo(cx + side * r * 0.75, cy + r * (0.12 + i * 0.14));
      ctx.stroke();
    }
  }

  // Body
  ctx.beginPath();
  ctx.ellipse(cx, cy + r * 1.9, r * 0.75, r * 1.05, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Tail
  ctx.beginPath();
  ctx.moveTo(cx + r * 0.7, cy + r * 2.6);
  ctx.quadraticCurveTo(cx + r * 1.6, cy + r * 2.2, cx + r * 1.3, cy + r * 1.4);
  ctx.stroke();
}

function drawFish(ctx, w, h) {
  const cx = w * 0.45;
  const cy = h * 0.5;
  const rx = Math.min(w, h) * 0.28;
  const ry = Math.min(w, h) * 0.18;

  // Body oval
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Tail
  ctx.beginPath();
  ctx.moveTo(cx + rx * 0.85, cy - ry * 0.4);
  ctx.lineTo(cx + rx * 1.45, cy - ry * 0.9);
  ctx.lineTo(cx + rx * 1.45, cy + ry * 0.9);
  ctx.lineTo(cx + rx * 0.85, cy + ry * 0.4);
  ctx.stroke();

  // Eye
  ctx.beginPath();
  ctx.arc(cx - rx * 0.5, cy - ry * 0.15, ry * 0.12, 0, Math.PI * 2);
  ctx.stroke();

  // Mouth
  ctx.beginPath();
  ctx.arc(cx - rx * 0.85, cy + ry * 0.1, ry * 0.2, -0.5, 0.5);
  ctx.stroke();

  // Top fin
  ctx.beginPath();
  ctx.moveTo(cx - rx * 0.1, cy - ry * 0.95);
  ctx.quadraticCurveTo(cx + rx * 0.1, cy - ry * 1.6, cx + rx * 0.4, cy - ry * 0.95);
  ctx.stroke();

  // Bottom fin
  ctx.beginPath();
  ctx.moveTo(cx - rx * 0.05, cy + ry * 0.95);
  ctx.quadraticCurveTo(cx + rx * 0.05, cy + ry * 1.4, cx + rx * 0.25, cy + ry * 0.95);
  ctx.stroke();

  // Bubbles
  ctx.beginPath();
  ctx.arc(cx - rx * 1.15, cy - ry * 0.4, ry * 0.1, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx - rx * 1.3, cy - ry * 0.7, ry * 0.07, 0, Math.PI * 2);
  ctx.stroke();
}

function drawBird(ctx, w, h) {
  const cx = w * 0.5;
  const cy = h * 0.45;
  const r = Math.min(w, h) * 0.16;

  // Body
  ctx.beginPath();
  ctx.ellipse(cx, cy + r * 0.6, r * 1.1, r * 0.9, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Head
  ctx.beginPath();
  ctx.arc(cx - r * 0.5, cy - r * 0.6, r * 0.65, 0, Math.PI * 2);
  ctx.stroke();

  // Eye
  ctx.beginPath();
  ctx.arc(cx - r * 0.7, cy - r * 0.7, r * 0.1, 0, Math.PI * 2);
  ctx.stroke();

  // Beak
  ctx.beginPath();
  ctx.moveTo(cx - r * 1.15, cy - r * 0.55);
  ctx.lineTo(cx - r * 1.6, cy - r * 0.4);
  ctx.lineTo(cx - r * 1.15, cy - r * 0.25);
  ctx.stroke();

  // Wing
  ctx.beginPath();
  ctx.ellipse(cx + r * 0.3, cy + r * 0.3, r * 0.75, r * 0.45, -0.3, 0, Math.PI * 2);
  ctx.stroke();

  // Legs
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.3, cy + r * 1.45);
  ctx.lineTo(cx - r * 0.3, cy + r * 2.1);
  ctx.lineTo(cx - r * 0.6, cy + r * 2.1);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.3, cy + r * 2.1);
  ctx.lineTo(cx, cy + r * 2.1);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx + r * 0.3, cy + r * 1.45);
  ctx.lineTo(cx + r * 0.3, cy + r * 2.1);
  ctx.lineTo(cx, cy + r * 2.1);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + r * 0.3, cy + r * 2.1);
  ctx.lineTo(cx + r * 0.6, cy + r * 2.1);
  ctx.stroke();
}

function drawTurtle(ctx, w, h) {
  const cx = w * 0.5;
  const cy = h * 0.45;
  const rx = Math.min(w, h) * 0.26;
  const ry = Math.min(w, h) * 0.18;

  // Shell (big oval)
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Shell pattern lines
  ctx.beginPath();
  ctx.moveTo(cx, cy - ry);
  ctx.lineTo(cx, cy + ry);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - rx, cy);
  ctx.lineTo(cx + rx, cy);
  ctx.stroke();

  // Head
  ctx.beginPath();
  ctx.arc(cx + rx + ry * 0.45, cy - ry * 0.1, ry * 0.4, 0, Math.PI * 2);
  ctx.stroke();

  // Eye
  ctx.beginPath();
  ctx.arc(cx + rx + ry * 0.55, cy - ry * 0.2, ry * 0.08, 0, Math.PI * 2);
  ctx.stroke();

  // Smile
  ctx.beginPath();
  ctx.arc(cx + rx + ry * 0.5, cy + ry * 0.0, ry * 0.15, 0.1, Math.PI - 0.1);
  ctx.stroke();

  // Four legs
  ctx.beginPath();
  ctx.ellipse(cx - rx * 0.55, cy + ry * 1.0, ry * 0.2, ry * 0.35, 0.2, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(cx + rx * 0.35, cy + ry * 1.0, ry * 0.2, ry * 0.35, -0.2, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(cx - rx * 0.55, cy - ry * 0.85, ry * 0.18, ry * 0.28, -0.2, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(cx + rx * 0.35, cy - ry * 0.85, ry * 0.18, ry * 0.28, 0.2, 0, Math.PI * 2);
  ctx.stroke();

  // Tail
  ctx.beginPath();
  ctx.moveTo(cx - rx * 0.95, cy + ry * 0.1);
  ctx.lineTo(cx - rx * 1.25, cy + ry * 0.25);
  ctx.stroke();
}

function drawButterfly(ctx, w, h) {
  const cx = w * 0.5;
  const cy = h * 0.5;
  const r = Math.min(w, h) * 0.12;

  // Body (tall oval)
  ctx.beginPath();
  ctx.ellipse(cx, cy, r * 0.3, r * 1.4, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Top-left wing
  ctx.beginPath();
  ctx.ellipse(cx - r * 1.3, cy - r * 0.7, r * 1.1, r * 0.85, -0.3, 0, Math.PI * 2);
  ctx.stroke();

  // Top-right wing
  ctx.beginPath();
  ctx.ellipse(cx + r * 1.3, cy - r * 0.7, r * 1.1, r * 0.85, 0.3, 0, Math.PI * 2);
  ctx.stroke();

  // Bottom-left wing
  ctx.beginPath();
  ctx.ellipse(cx - r * 1.0, cy + r * 0.7, r * 0.8, r * 0.65, 0.3, 0, Math.PI * 2);
  ctx.stroke();

  // Bottom-right wing
  ctx.beginPath();
  ctx.ellipse(cx + r * 1.0, cy + r * 0.7, r * 0.8, r * 0.65, -0.3, 0, Math.PI * 2);
  ctx.stroke();

  // Wing spots
  ctx.beginPath();
  ctx.arc(cx - r * 1.3, cy - r * 0.7, r * 0.3, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx + r * 1.3, cy - r * 0.7, r * 0.3, 0, Math.PI * 2);
  ctx.stroke();

  // Antennae
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.1, cy - r * 1.35);
  ctx.quadraticCurveTo(cx - r * 0.8, cy - r * 2.3, cx - r * 1.0, cy - r * 2.0);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + r * 0.1, cy - r * 1.35);
  ctx.quadraticCurveTo(cx + r * 0.8, cy - r * 2.3, cx + r * 1.0, cy - r * 2.0);
  ctx.stroke();

  // Antenna tips
  ctx.beginPath();
  ctx.arc(cx - r * 1.0, cy - r * 2.0, r * 0.12, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx + r * 1.0, cy - r * 2.0, r * 0.12, 0, Math.PI * 2);
  ctx.stroke();
}

function drawCar(ctx, w, h) {
  const cx = w * 0.5;
  const cy = h * 0.5;
  const bw = Math.min(w, h) * 0.42;
  const bh = Math.min(w, h) * 0.14;

  // Body
  ctx.beginPath();
  ctx.roundRect(cx - bw, cy, bw * 2, bh, bh * 0.3);
  ctx.stroke();

  // Roof
  ctx.beginPath();
  ctx.moveTo(cx - bw * 0.5, cy);
  ctx.lineTo(cx - bw * 0.3, cy - bh * 1.2);
  ctx.lineTo(cx + bw * 0.4, cy - bh * 1.2);
  ctx.lineTo(cx + bw * 0.6, cy);
  ctx.stroke();

  // Windows
  ctx.beginPath();
  ctx.roundRect(cx - bw * 0.42, cy - bh * 1.05, bw * 0.38, bh * 0.85, bh * 0.15);
  ctx.stroke();
  ctx.beginPath();
  ctx.roundRect(cx + bw * 0.05, cy - bh * 1.05, bw * 0.42, bh * 0.85, bh * 0.15);
  ctx.stroke();

  // Left wheel
  ctx.beginPath();
  ctx.arc(cx - bw * 0.55, cy + bh, bh * 0.45, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx - bw * 0.55, cy + bh, bh * 0.2, 0, Math.PI * 2);
  ctx.stroke();

  // Right wheel
  ctx.beginPath();
  ctx.arc(cx + bw * 0.55, cy + bh, bh * 0.45, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx + bw * 0.55, cy + bh, bh * 0.2, 0, Math.PI * 2);
  ctx.stroke();

  // Headlight
  ctx.beginPath();
  ctx.arc(cx + bw * 0.9, cy + bh * 0.4, bh * 0.15, 0, Math.PI * 2);
  ctx.stroke();
}

function drawTruck(ctx, w, h) {
  const cx = w * 0.5;
  const cy = h * 0.5;
  const u = Math.min(w, h) * 0.06;

  // Cab
  ctx.beginPath();
  ctx.roundRect(cx + u * 2.5, cy - u * 2.5, u * 3.5, u * 4, u * 0.5);
  ctx.stroke();

  // Cab window
  ctx.beginPath();
  ctx.roundRect(cx + u * 3, cy - u * 2, u * 2.5, u * 1.8, u * 0.3);
  ctx.stroke();

  // Trailer
  ctx.beginPath();
  ctx.roundRect(cx - u * 5.5, cy - u * 2.5, u * 8, u * 3.5, u * 0.4);
  ctx.stroke();

  // Trailer lines (panels)
  ctx.beginPath();
  ctx.moveTo(cx - u * 2.2, cy - u * 2.5);
  ctx.lineTo(cx - u * 2.2, cy + u * 1.0);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + u * 0.8, cy - u * 2.5);
  ctx.lineTo(cx + u * 0.8, cy + u * 1.0);
  ctx.stroke();

  // Wheels (3)
  ctx.beginPath();
  ctx.arc(cx - u * 3.5, cy + u * 2.2, u * 0.9, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx - u * 0.5, cy + u * 2.2, u * 0.9, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx + u * 4.2, cy + u * 2.2, u * 0.9, 0, Math.PI * 2);
  ctx.stroke();

  // Smokestack
  ctx.beginPath();
  ctx.roundRect(cx + u * 2.6, cy - u * 4.0, u * 0.8, u * 1.5, u * 0.2);
  ctx.stroke();

  // Smoke puffs
  ctx.beginPath();
  ctx.arc(cx + u * 3.0, cy - u * 4.6, u * 0.4, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx + u * 3.5, cy - u * 5.2, u * 0.35, 0, Math.PI * 2);
  ctx.stroke();
}

function drawBoat(ctx, w, h) {
  const cx = w * 0.5;
  const cy = h * 0.52;
  const u = Math.min(w, h) * 0.07;

  // Hull
  ctx.beginPath();
  ctx.moveTo(cx - u * 4, cy);
  ctx.lineTo(cx - u * 3, cy + u * 2);
  ctx.lineTo(cx + u * 3, cy + u * 2);
  ctx.lineTo(cx + u * 4, cy);
  ctx.closePath();
  ctx.stroke();

  // Mast
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx, cy - u * 4);
  ctx.stroke();

  // Sail (triangle)
  ctx.beginPath();
  ctx.moveTo(cx, cy - u * 3.8);
  ctx.lineTo(cx + u * 2.8, cy - u * 0.5);
  ctx.lineTo(cx, cy - u * 0.5);
  ctx.closePath();
  ctx.stroke();

  // Small sail left
  ctx.beginPath();
  ctx.moveTo(cx, cy - u * 3.2);
  ctx.lineTo(cx - u * 1.8, cy - u * 0.5);
  ctx.lineTo(cx, cy - u * 0.5);
  ctx.closePath();
  ctx.stroke();

  // Flag
  ctx.beginPath();
  ctx.moveTo(cx, cy - u * 4);
  ctx.lineTo(cx + u * 1.0, cy - u * 4.4);
  ctx.lineTo(cx, cy - u * 4.8);
  ctx.stroke();

  // Water waves
  for (let i = -4; i < 4; i++) {
    ctx.beginPath();
    ctx.arc(cx + i * u * 1.2 + u * 0.6, cy + u * 2.5, u * 0.6, Math.PI, 0);
    ctx.stroke();
  }
}

function drawRocket(ctx, w, h) {
  const cx = w * 0.5;
  const cy = h * 0.5;
  const u = Math.min(w, h) * 0.06;

  // Body
  ctx.beginPath();
  ctx.roundRect(cx - u * 1.3, cy - u * 2.5, u * 2.6, u * 5.5, u * 0.6);
  ctx.stroke();

  // Nose cone
  ctx.beginPath();
  ctx.moveTo(cx - u * 1.3, cy - u * 2.5);
  ctx.quadraticCurveTo(cx, cy - u * 5.5, cx + u * 1.3, cy - u * 2.5);
  ctx.stroke();

  // Window
  ctx.beginPath();
  ctx.arc(cx, cy - u * 1.0, u * 0.7, 0, Math.PI * 2);
  ctx.stroke();

  // Left fin
  ctx.beginPath();
  ctx.moveTo(cx - u * 1.3, cy + u * 2.0);
  ctx.lineTo(cx - u * 2.8, cy + u * 3.5);
  ctx.lineTo(cx - u * 1.3, cy + u * 3.0);
  ctx.stroke();

  // Right fin
  ctx.beginPath();
  ctx.moveTo(cx + u * 1.3, cy + u * 2.0);
  ctx.lineTo(cx + u * 2.8, cy + u * 3.5);
  ctx.lineTo(cx + u * 1.3, cy + u * 3.0);
  ctx.stroke();

  // Flame
  ctx.beginPath();
  ctx.moveTo(cx - u * 0.8, cy + u * 3.0);
  ctx.quadraticCurveTo(cx - u * 0.4, cy + u * 4.5, cx, cy + u * 5.2);
  ctx.quadraticCurveTo(cx + u * 0.4, cy + u * 4.5, cx + u * 0.8, cy + u * 3.0);
  ctx.stroke();

  // Inner flame
  ctx.beginPath();
  ctx.moveTo(cx - u * 0.4, cy + u * 3.0);
  ctx.quadraticCurveTo(cx - u * 0.2, cy + u * 4.0, cx, cy + u * 4.5);
  ctx.quadraticCurveTo(cx + u * 0.2, cy + u * 4.0, cx + u * 0.4, cy + u * 3.0);
  ctx.stroke();

  // Stars
  ctx.beginPath();
  ctx.arc(cx - u * 3.5, cy - u * 2.5, u * 0.15, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx + u * 3.0, cy - u * 1.0, u * 0.12, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx + u * 3.5, cy + u * 1.5, u * 0.18, 0, Math.PI * 2);
  ctx.stroke();
}

function drawTrain(ctx, w, h) {
  const cx = w * 0.5;
  const cy = h * 0.48;
  const u = Math.min(w, h) * 0.055;

  // Engine body
  ctx.beginPath();
  ctx.roundRect(cx - u * 2, cy - u * 2, u * 4.5, u * 3.5, u * 0.4);
  ctx.stroke();

  // Cab (taller section on right)
  ctx.beginPath();
  ctx.roundRect(cx + u * 2.5, cy - u * 3, u * 2.5, u * 4.5, u * 0.3);
  ctx.stroke();

  // Cab window
  ctx.beginPath();
  ctx.roundRect(cx + u * 3.0, cy - u * 2.5, u * 1.5, u * 1.5, u * 0.2);
  ctx.stroke();

  // Smokestack
  ctx.beginPath();
  ctx.roundRect(cx - u * 0.8, cy - u * 3.5, u * 1.2, u * 1.5, u * 0.2);
  ctx.stroke();

  // Smokestack top (wider)
  ctx.beginPath();
  ctx.roundRect(cx - u * 1.1, cy - u * 4.0, u * 1.8, u * 0.7, u * 0.2);
  ctx.stroke();

  // Smoke puffs
  ctx.beginPath();
  ctx.arc(cx - u * 0.2, cy - u * 4.8, u * 0.5, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx + u * 0.5, cy - u * 5.5, u * 0.4, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx + u * 1.2, cy - u * 6.0, u * 0.35, 0, Math.PI * 2);
  ctx.stroke();

  // Front light
  ctx.beginPath();
  ctx.arc(cx - u * 1.8, cy - u * 0.3, u * 0.35, 0, Math.PI * 2);
  ctx.stroke();

  // Wheels
  ctx.beginPath();
  ctx.arc(cx - u * 0.8, cy + u * 2.2, u * 0.75, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx + u * 1.2, cy + u * 2.2, u * 0.75, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx + u * 3.8, cy + u * 2.2, u * 0.75, 0, Math.PI * 2);
  ctx.stroke();

  // Cow catcher
  ctx.beginPath();
  ctx.moveTo(cx - u * 2.0, cy + u * 1.5);
  ctx.lineTo(cx - u * 3.0, cy + u * 2.5);
  ctx.lineTo(cx - u * 2.0, cy + u * 2.5);
  ctx.stroke();

  // Track line
  ctx.beginPath();
  ctx.moveTo(cx - u * 4, cy + u * 3.0);
  ctx.lineTo(cx + u * 6, cy + u * 3.0);
  ctx.stroke();
}

/* ---- Template registry ---- */

const TEMPLATES = [
  { id: 'sunny',     label: 'Sunny Day',  draw: drawSunnyDay },
  { id: 'cat',       label: 'Cat',        draw: drawCat },
  { id: 'fish',      label: 'Fish',       draw: drawFish },
  { id: 'bird',      label: 'Bird',       draw: drawBird },
  { id: 'turtle',    label: 'Turtle',     draw: drawTurtle },
  { id: 'butterfly', label: 'Butterfly',  draw: drawButterfly },
  { id: 'car',       label: 'Car',        draw: drawCar },
  { id: 'truck',     label: 'Truck',      draw: drawTruck },
  { id: 'boat',      label: 'Boat',       draw: drawBoat },
  { id: 'rocket',    label: 'Rocket',     draw: drawRocket },
];

/* ---- State ---- */

const state = {
  color: '#ef4444',
  tool: 'brush',
  size: 22,
  drawing: false,
  last: null,
  musicEnabled: true,
  currentTemplate: 0,
};

/* ---- Music ---- */

function icon(on) {
  if (on) {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M3 10v4c0 .55.45 1 1 1h3l5 4V5L7 9H4c-.55 0-1 .45-1 1z" fill="currentColor" opacity="0.95"/>
        <path d="M16.5 8.5a1 1 0 0 1 1.4 0 6 6 0 0 1 0 7 1 1 0 1 1-1.4-1.4 4 4 0 0 0 0-4.2 1 1 0 0 1 0-1.4z" fill="currentColor" opacity="0.9"/>
      </svg>`;
  }
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M3 10v4c0 .55.45 1 1 1h3l5 4V5L7 9H4c-.55 0-1 .45-1 1z" fill="currentColor" opacity="0.95"/>
      <path d="M16 9l5 6" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M21 9l-5 6" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>
    </svg>`;
}

function setupMusic() {
  const audio = $('#bgMusic');
  const toggle = $('#musicToggle');

  const saved = localStorage.getItem('ggh_music') || 'on';
  state.musicEnabled = saved === 'on';

  function render() {
    toggle.innerHTML = icon(state.musicEnabled);
    toggle.setAttribute('aria-label', state.musicEnabled ? 'Music on' : 'Music off');
    toggle.setAttribute('title', state.musicEnabled ? 'Music on' : 'Music off');
  }

  async function start() {
    try {
      audio.volume = 0.16;
      audio.loop = true;
      await audio.play();
      state.musicEnabled = true;
      localStorage.setItem('ggh_music', 'on');
      render();
    } catch {
      state.musicEnabled = false;
      localStorage.setItem('ggh_music', 'off');
      render();
      alert('Tap Music to start (iPad autoplay rules).');
    }
  }

  function stop() {
    audio.pause();
    audio.currentTime = 0;
    state.musicEnabled = false;
    localStorage.setItem('ggh_music', 'off');
    render();
  }

  window.addEventListener('pointerdown', () => {
    if (state.musicEnabled) start();
  }, { once: true });

  toggle.addEventListener('click', () => {
    if (state.musicEnabled) stop();
    else start();
  });

  render();
}

/* ---- Palette ---- */

function setupPalette() {
  const btns = Array.from(document.querySelectorAll('.colorBtn'));

  function select(btn) {
    btns.forEach((b) => b.classList.remove('selected'));
    btn.classList.add('selected');
    state.color = btn.getAttribute('data-color') || '#ef4444';
  }

  btns.forEach((btn) => btn.addEventListener('click', () => {
    state.tool = state.tool === 'eraser' ? 'brush' : state.tool;
    syncToolButtons();
    select(btn);
  }));

  if (btns[0]) select(btns[0]);
}

/* ---- Tools ---- */

function syncToolButtons() {
  const pen = $('#penBtn');
  const brush = $('#brushBtn');
  const eraser = $('#eraserBtn');

  const activeStyle = 'outline: 6px solid rgba(14,165,233,0.35);';
  pen.style = '';
  brush.style = '';
  eraser.style = '';

  if (state.tool === 'pen') pen.style = activeStyle;
  if (state.tool === 'brush') brush.style = activeStyle;
  if (state.tool === 'eraser') eraser.style = activeStyle;
}

function setupTools() {
  $('#penBtn').addEventListener('click', () => {
    state.tool = 'pen';
    syncToolButtons();
  });
  $('#brushBtn').addEventListener('click', () => {
    state.tool = 'brush';
    syncToolButtons();
  });
  $('#eraserBtn').addEventListener('click', () => {
    state.tool = 'eraser';
    syncToolButtons();
  });

  const size = $('#size');
  size.addEventListener('input', () => {
    state.size = Number(size.value) || 22;
  });

  $('#clearBtn').addEventListener('click', () => {
    clearCanvas();
  });

  syncToolButtons();
}

/* ---- Canvas ---- */

function resizeCanvas() {
  const canvas = $('#c');
  const wrap = canvas.parentElement;
  const rect = wrap.getBoundingClientRect();

  const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
  const w = Math.max(320, Math.floor(rect.width));
  const h = Math.max(320, Math.floor(rect.height));

  const old = document.createElement('canvas');
  old.width = canvas.width;
  old.height = canvas.height;
  old.getContext('2d').drawImage(canvas, 0, 0);

  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';

  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);

  if (old.width && old.height) {
    ctx.drawImage(old, 0, 0, old.width / dpr, old.height / dpr, 0, 0, w, h);
  }

  drawTemplate();
}

function clearCanvas() {
  const canvas = $('#c');
  const ctx = canvas.getContext('2d');
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);
  drawTemplate();
}

function drawTemplate() {
  const canvas = $('#c');
  const ctx = canvas.getContext('2d');
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;

  ctx.save();
  ctx.lineWidth = 8;
  ctx.strokeStyle = 'rgba(15,23,42,0.55)';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const tpl = TEMPLATES[state.currentTemplate];
  if (tpl && tpl.draw) {
    tpl.draw(ctx, w, h);
  }

  ctx.restore();
}

function getPoint(e) {
  const canvas = $('#c');
  const rect = canvas.getBoundingClientRect();
  const pt = (e.touches && e.touches[0]) ? e.touches[0] : e;
  return {
    x: pt.clientX - rect.left,
    y: pt.clientY - rect.top,
  };
}

function drawLine(from, to) {
  const canvas = $('#c');
  const ctx = canvas.getContext('2d');
  const size = state.size;

  if (state.tool === 'eraser') {
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = size * 1.1;
  } else if (state.tool === 'pen') {
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = state.color;
    ctx.lineWidth = size * 0.75;
  } else {
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = state.color;
    ctx.lineWidth = size;
  }

  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();

  if (state.tool === 'brush') {
    ctx.fillStyle = state.color;
    ctx.globalAlpha = 0.18;
    ctx.beginPath();
    ctx.arc(to.x, to.y, size * 0.55, 0, Math.PI*2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

function setupCanvas() {
  const canvas = $('#c');

  function down(e) {
    e.preventDefault();
    state.drawing = true;
    state.last = getPoint(e);
  }

  function move(e) {
    if (!state.drawing) return;
    e.preventDefault();
    const pt = getPoint(e);
    if (state.last) drawLine(state.last, pt);
    state.last = pt;
  }

  function up(e) {
    if (!state.drawing) return;
    e.preventDefault();
    state.drawing = false;
    state.last = null;
  }

  canvas.addEventListener('pointerdown', down);
  canvas.addEventListener('pointermove', move);
  canvas.addEventListener('pointerup', up);
  canvas.addEventListener('pointercancel', up);
  canvas.addEventListener('pointerleave', up);

  window.addEventListener('resize', () => resizeCanvas());
  window.addEventListener('orientationchange', () => resizeCanvas());

  resizeCanvas();
}

/* ---- Template Picker ---- */

function renderThumbnail(canvas, tpl) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);

  ctx.save();
  ctx.lineWidth = 4;
  ctx.strokeStyle = 'rgba(15,23,42,0.55)';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  tpl.draw(ctx, w, h);
  ctx.restore();
}

function selectTemplate(index) {
  state.currentTemplate = index;

  document.querySelectorAll('.thumbBtn').forEach((btn, i) => {
    btn.classList.toggle('selected', i === index);
  });

  clearCanvas();
}

function setupTemplatePicker() {
  const grid = document.getElementById('thumbGrid');

  TEMPLATES.forEach((tpl, index) => {
    const btn = document.createElement('button');
    btn.className = 'thumbBtn' + (index === 0 ? ' selected' : '');
    btn.setAttribute('aria-label', tpl.label);
    btn.setAttribute('data-index', index);

    const miniCanvas = document.createElement('canvas');
    miniCanvas.width = 240;
    miniCanvas.height = 160;
    miniCanvas.setAttribute('aria-hidden', 'true');
    btn.appendChild(miniCanvas);

    const labelEl = document.createElement('span');
    labelEl.className = 'thumbLabel';
    labelEl.textContent = tpl.label;
    btn.appendChild(labelEl);

    btn.addEventListener('click', () => selectTemplate(index));
    grid.appendChild(btn);

    renderThumbnail(miniCanvas, tpl);
  });
}

/* ---- Init ---- */

function init() {
  setupMusic();
  setupPalette();
  setupTools();
  setupTemplatePicker();
  setupCanvas();
}

init();
