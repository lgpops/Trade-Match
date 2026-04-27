const fs = require("fs");
const path = require("path");

const width = 1024;
const height = 1024;
const red = [215, 38, 56, 255];
const navy = [26, 20, 16, 255];
const white = [255, 255, 255, 255];
const shadow = [102, 16, 26, 255];

const pixels = Buffer.alloc(width * height * 4, 0);

function setPixel(x, y, color) {
  if (x < 0 || y < 0 || x >= width || y >= height) return;
  const idx = (y * width + x) * 4;
  pixels[idx] = color[0];
  pixels[idx + 1] = color[1];
  pixels[idx + 2] = color[2];
  pixels[idx + 3] = color[3];
}

function fillRect(x, y, w, h, color) {
  for (let yy = y; yy < y + h; yy += 1) {
    for (let xx = x; xx < x + w; xx += 1) {
      setPixel(xx, yy, color);
    }
  }
}

function fillCircle(cx, cy, r, color) {
  const r2 = r * r;
  for (let y = cy - r; y <= cy + r; y += 1) {
    for (let x = cx - r; x <= cx + r; x += 1) {
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy <= r2) setPixel(x, y, color);
    }
  }
}

function pointInPolygon(x, y, points) {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i, i += 1) {
    const xi = points[i][0];
    const yi = points[i][1];
    const xj = points[j][0];
    const yj = points[j][1];
    const intersects =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

function fillPolygon(points, color) {
  const minX = Math.floor(Math.min(...points.map((p) => p[0])));
  const maxX = Math.ceil(Math.max(...points.map((p) => p[0])));
  const minY = Math.floor(Math.min(...points.map((p) => p[1])));
  const maxY = Math.ceil(Math.max(...points.map((p) => p[1])));
  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      if (pointInPolygon(x + 0.5, y + 0.5, points)) setPixel(x, y, color);
    }
  }
}

function drawRoundedRect(x, y, w, h, r, color) {
  fillRect(x + r, y, w - 2 * r, h, color);
  fillRect(x, y + r, w, h - 2 * r, color);
  fillCircle(x + r, y + r, r, color);
  fillCircle(x + w - r - 1, y + r, r, color);
  fillCircle(x + r, y + h - r - 1, r, color);
  fillCircle(x + w - r - 1, y + h - r - 1, r, color);
}

function crc32(buffer) {
  let crc = -1;
  for (const byte of buffer) {
    crc ^= byte;
    for (let k = 0; k < 8; k += 1) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
  }
  return (crc ^ -1) >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

function writePng(outputPath) {
  const scanlines = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y += 1) {
    const rowStart = y * (width * 4 + 1);
    scanlines[rowStart] = 0;
    pixels.copy(scanlines, rowStart + 1, y * width * 4, (y + 1) * width * 4);
  }

  const zlib = require("zlib");
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;

  fs.writeFileSync(
    outputPath,
    Buffer.concat([
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
      chunk("IHDR", ihdr),
      chunk("IDAT", zlib.deflateSync(scanlines, { level: 9 })),
      chunk("IEND", Buffer.alloc(0)),
    ]),
  );
}

fillRect(0, 0, width, height, navy);
fillCircle(512, 392, 260, red);
fillCircle(360, 328, 214, red);
fillCircle(664, 328, 214, red);
fillPolygon(
  [
    [162, 442],
    [862, 442],
    [512, 838],
  ],
  red,
);

fillPolygon(
  [
    [274, 304],
    [468, 474],
    [512, 446],
    [556, 474],
    [750, 304],
    [684, 568],
    [512, 716],
    [340, 568],
  ],
  shadow,
);
fillPolygon(
  [
    [300, 274],
    [486, 462],
    [512, 440],
    [538, 462],
    [724, 274],
    [652, 536],
    [512, 660],
    [372, 536],
  ],
  white,
);
fillPolygon(
  [
    [300, 274],
    [486, 462],
    [438, 522],
    [274, 356],
  ],
  white,
);
fillPolygon(
  [
    [724, 274],
    [538, 462],
    [586, 522],
    [750, 356],
  ],
  white,
);

drawRoundedRect(244, 594, 536, 110, 38, red);
fillRect(284, 614, 456, 24, white);

const output = path.resolve(__dirname, "../assets/images/icon.png");
writePng(output);
console.log(`Wrote ${output}`);
