import fs from 'fs';
const html = fs.readFileSync('public/linea-tiempo.html', 'utf8');
const regex = /data-i18n=["']([^"']+)["']/g;
let m;
const keys = new Set();
while ((m = regex.exec(html)) !== null) {
  keys.add(m[1]);
}
console.log('Keys with data-i18n in linea-tiempo.html:', Array.from(keys));
