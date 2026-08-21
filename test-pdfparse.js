const fs = require('fs');
const { PDFParse } = require('pdf-parse');
console.log('starting parse...');
const buf = fs.readFileSync('test-roadmap.pdf');
const uint8 = new Uint8Array(buf);
const parser = new PDFParse(uint8);
parser.load().then(() => parser.getText()).then(text => {
  console.log('SUCCESS, text length:', text.length);
  console.log('Text preview:', text.substring(0, 300));
}).catch(err => console.log('PARSE ERROR:', err.message));
