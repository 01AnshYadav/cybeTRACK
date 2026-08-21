// Creates a valid minimal PDF with correct byte-level offsets
const fs = require('fs');

const parts = [];
const offsets = [];

function addObj(content) {
  offsets.push(parts.length);
  parts.push(content);
}

// Build each object as a buffer to track exact byte offsets
addObj('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
addObj('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');
addObj('3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n');

const streamContent = 'BT /F1 14 Tf 50 700 Td (Learn Linux basics) Tj 0 -20 Td (Then Networking fundamentals) Tj 0 -20 Td (Then Web Security) Tj ET';
addObj('4 0 obj\n<< /Length ' + streamContent.length + ' >>\nstream\n' + streamContent + '\nendstream\nendobj\n');
addObj('5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n');

// Concatenate header + all objects, compute offsets precisely
const header = '%PDF-1.4\n';
const bufs = [Buffer.from(header, 'latin1')];
let currentOffset = header.length;

const computedOffsets = [];
for (const part of parts) {
  if (part.startsWith('1 0 obj') || part.startsWith('2 0 obj') || part.startsWith('3 0 obj') || part.startsWith('4 0 obj') || part.startsWith('5 0 obj')) {
    computedOffsets.push(currentOffset);
  }
  const b = Buffer.from(part, 'latin1');
  bufs.push(b);
  currentOffset += b.length;
}

const bodyBuf = Buffer.concat(bufs);
const xrefOffset = bodyBuf.length;

let xref = 'xref\n0 6\n0000000000 65535 f \n';
for (const off of computedOffsets) {
  xref += String(off).padStart(10, '0') + ' 00000 n \n';
}
xref += 'trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n' + xrefOffset + '\n%%EOF\n';

const final = Buffer.concat([bodyBuf, Buffer.from(xref, 'latin1')]);
fs.writeFileSync('test-roadmap.pdf', final);
console.log('Wrote test-roadmap.pdf (' + final.length + ' bytes)');
console.log('Object offsets:', computedOffsets);
console.log('Xref at:', xrefOffset);
console.log('Stream content length:', streamContent.length);
