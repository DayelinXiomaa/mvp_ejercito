/**
 * CMS Kiosko — Servidor de administración de contenido
 * Sin dependencias externas (solo módulos nativos de Node).
 *
 * Uso: node server/index.mjs
 * Variables: ADMIN_USER, ADMIN_PASS, CMS_PORT
 * Endpoints:
 *   POST   /api/auth/login                        { user, pass } -> { token }
 *   GET    /api/screens                            -> lista de pantallas
 *   GET    /api/content/:screen                    -> JSON del contenido
 *   PUT    /api/content/:screen                    body: JSON (guarda contenido)
 *   GET    /api/content/:screen/:recurso           -> JSON de recurso adicional
 *   PUT    /api/content/:screen/:recurso           body: JSON (guarda recurso)
 *   GET    /api/languages/:screen                  -> JSON de traducciones
 *   PUT    /api/languages/:screen                  body: JSON (guarda traducciones)
 *   GET    /api/media/:screen                      -> lista de imágenes subidas
 *   POST   /api/media/:screen                      { name, dataBase64 } -> { url }
 *   DELETE /api/media/:screen?name=<file>          elimina imagen
 *   GET    /assets/uploads/<file>                  sirve imagen subida
 */
import { createServer } from 'node:http';
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, unlinkSync, createReadStream, statSync } from 'node:fs';
import { join, extname, basename } from 'node:path';
import { createHash, randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DATA_DIR = join(ROOT, 'src', 'data');
const UPLOAD_DIR = join(ROOT, 'public', 'assets', 'uploads');

const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS_HASH = createHash('sha256').update(process.env.ADMIN_PASS || 'admin123').digest('hex');
const PORT = Number(process.env.CMS_PORT || 4500);

mkdirSync(UPLOAD_DIR, { recursive: true });

// -- Screens registry --
const SCREENS = [
  { id: 'terrorismo', nombre: 'Terrorismo y Pacificación', recursos: [{ id: 'principal', nombre: 'Contenido principal' }] },
  { id: 'armas', nombre: 'Armas y Servicios', recursos: [{ id: 'principal', nombre: 'Contenido principal' }] },
  { id: 'timeline', nombre: 'Línea del Tiempo', recursos: [{ id: 'principal', nombre: 'Contenido principal' }] },
  { id: 'divisiones', nombre: 'Divisiones del Ejército', recursos: [
    { id: 'principal', nombre: 'Contenido principal' },
    { id: 'unitdb', nombre: 'Base de Unidades (unit_database.json)' }
  ]},
];

// Map screen + recurso to JSON files
function getContentFile(screen, recurso = 'principal') {
  if (screen === 'terrorismo') {
    return join(DATA_DIR, 'terrorismo.json');
  }
  // Generic fallback: <screen>.json or <screen>_<recurso>.json
  if (recurso && recurso !== 'principal') {
    return join(DATA_DIR, `${screen}_${recurso}.json`);
  }
  return join(DATA_DIR, `${screen}.json`);
}

function getLanguagesFile(screen) {
  return join(DATA_DIR, 'languages.json');
}

const TOKENS = new Set();
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
};

function json(res, code, body) {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', ...CORS });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (c) => {
      data += c;
      if (data.length > 20 * 1024 * 1024) { reject(new Error('Body demasiado grande')); req.destroy(); }
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

function isAuthed(req) {
  const header = req.headers['authorization'] || '';
  const token = header.replace(/^Bearer\s+/i, '');
  return TOKENS.has(token);
}

function sha256(text) {
  return createHash('sha256').update(text).digest('hex');
}

// Simple route matcher: returns { screen, recurso } or null
function matchRoute(pathname, prefix) {
  if (!pathname.startsWith(prefix)) return null;
  const rest = pathname.slice(prefix.length).replace(/^\//, '');
  const parts = rest.split('/').filter(Boolean);
  if (parts.length === 0) return null;
  return {
    screen: parts[0],
    recurso: parts[1] || 'principal',
  };
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const p = url.pathname;
  const method = req.method;

  if (method === 'OPTIONS') {
    res.writeHead(204, CORS);
    return res.end();
  }

  // ---- Login ----
  if (method === 'POST' && p === '/api/auth/login') {
    try {
      const body = JSON.parse(await readBody(req) || '{}');
      if (body.user === ADMIN_USER && sha256(String(body.pass || '')) === ADMIN_PASS_HASH) {
        const token = randomBytes(24).toString('hex');
        TOKENS.add(token);
        return json(res, 200, { token, user: ADMIN_USER });
      }
      return json(res, 401, { error: 'Credenciales incorrectas' });
    } catch {
      return json(res, 400, { error: 'JSON inválido' });
    }
  }

  // ---- Screens ----
  if (method === 'GET' && p === '/api/screens') {
    return json(res, 200, SCREENS);
  }

  // ---- Content (multi-screen) ----
  // Matches: /api/content/terrorismo  or  /api/content/terrorismo/unitdb
  // Also supports legacy /api/content (defaults to terrorismo)
  if (p.startsWith('/api/content')) {
    const match = matchRoute(p, '/api/content');
    const screen = match?.screen || 'terrorismo';
    const recurso = match?.recurso || 'principal';
    const contentFile = getContentFile(screen, recurso);

    if (method === 'GET') {
      try {
        if (!existsSync(contentFile)) {
          return json(res, 404, { error: `Archivo de contenido no encontrado: ${screen}/${recurso}` });
        }
        return json(res, 200, JSON.parse(readFileSync(contentFile, 'utf-8')));
      } catch (e) {
        return json(res, 500, { error: 'No se pudo leer el contenido: ' + e.message });
      }
    }
    if (method === 'PUT') {
      if (!isAuthed(req)) return json(res, 401, { error: 'No autorizado' });
      try {
        const body = await readBody(req);
        JSON.parse(body); // validar
        writeFileSync(contentFile, body, 'utf-8');
        return json(res, 200, { ok: true });
      } catch (e) {
        return json(res, 400, { error: 'JSON inválido: ' + e.message });
      }
    }
  }

  // ---- Languages (multi-screen) ----
  // Matches: /api/languages/terrorismo
  // Also supports legacy /api/languages (defaults to terrorismo)
  if (p.startsWith('/api/languages')) {
    const match = matchRoute(p, '/api/languages');
    const screen = match?.screen || 'terrorismo';
    const langFile = getLanguagesFile(screen);

    if (method === 'GET') {
      try {
        if (!existsSync(langFile)) {
          return json(res, 404, { error: `Archivo de traducciones no encontrado para: ${screen}` });
        }
        return json(res, 200, JSON.parse(readFileSync(langFile, 'utf-8')));
      } catch (e) {
        return json(res, 500, { error: 'No se pudo leer traducciones: ' + e.message });
      }
    }
    if (method === 'PUT') {
      if (!isAuthed(req)) return json(res, 401, { error: 'No autorizado' });
      try {
        const body = await readBody(req);
        JSON.parse(body); // validar
        writeFileSync(langFile, body, 'utf-8');
        return json(res, 200, { ok: true });
      } catch (e) {
        return json(res, 400, { error: 'JSON inválido: ' + e.message });
      }
    }
  }

  // ---- Media (multi-screen) ----
  // Matches: /api/media/terrorismo
  // Also supports legacy /api/media
  if (p.startsWith('/api/media')) {
    const match = matchRoute(p, '/api/media');
    // Each screen can have its own upload dir, but we use a shared one for simplicity
    const uploadDir = UPLOAD_DIR;

    if (method === 'GET') {
      if (!isAuthed(req)) return json(res, 401, { error: 'No autorizado' });
      try {
        const files = readdirSync(uploadDir).filter((f) => !f.startsWith('.')).map((f) => {
          const st = statSync(join(uploadDir, f));
          return { name: f, url: `/assets/uploads/${f}`, size: st.size, ext: extname(f).replace('.', '') };
        });
        return json(res, 200, files);
      } catch (e) {
        return json(res, 200, []);
      }
    }
    if (method === 'POST') {
      if (!isAuthed(req)) return json(res, 401, { error: 'No autorizado' });
      try {
        const body = JSON.parse(await readBody(req) || '{}');
        const b64 = String(body.dataBase64 || '').replace(/^data:[^;]+;base64,/, '');
        if (!b64) return json(res, 400, { error: 'Falta dataBase64' });
        const buffer = Buffer.from(b64, 'base64');
        const ext = (extname(String(body.name || 'img.png')) || '.png').toLowerCase();
        const safe = `${Date.now()}_${randomBytes(4).toString('hex')}${ext}`;
        writeFileSync(join(uploadDir, safe), buffer);
        return json(res, 200, { ok: true, name: safe, url: `/assets/uploads/${safe}` });
      } catch (e) {
        return json(res, 400, { error: 'Subida inválida: ' + e.message });
      }
    }
    if (method === 'DELETE') {
      if (!isAuthed(req)) return json(res, 401, { error: 'No autorizado' });
      const name = url.searchParams.get('name');
      if (!name) return json(res, 400, { error: 'Falta name' });
      const file = join(uploadDir, basename(String(name)));
      try {
        unlinkSync(file);
        return json(res, 200, { ok: true });
      } catch {
        return json(res, 404, { error: 'No existe' });
      }
    }
  }

  // ---- Servir uploads estáticos ----
  if (p.startsWith('/assets/uploads/')) {
    const file = join(UPLOAD_DIR, basename(p));
    if (existsSync(file)) {
      const ext = extname(file).toLowerCase();
      const mimeTypes = {
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.svg': 'image/svg+xml',
      };
      const type = mimeTypes[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': type, ...CORS, 'Cache-Control': 'no-cache' });
      createReadStream(file).pipe(res);
      return;
    }
    return json(res, 404, { error: 'Archivo no encontrado' });
  }

  json(res, 404, { error: 'Ruta no encontrada' });
});

server.listen(PORT, () => {
  console.log(`[CMS] Servidor corriendo en http://localhost:${PORT}`);
  console.log(`[CMS] Datos: ${DATA_DIR}`);
  console.log(`[CMS] Uploads: ${UPLOAD_DIR}`);
  console.log(`[CMS] Usuario: ${ADMIN_USER}`);
  console.log(`[CMS] Pantallas: ${SCREENS.map(s => s.id).join(', ')}`);
});
