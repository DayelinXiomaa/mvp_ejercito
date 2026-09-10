import json
import re
from pptx import Presentation

pptx_path = r'C:\Proyectos\Interactivo\Interactivo\ES\DDEE BRIG UU PPUU.pptx'
prs = Presentation(pptx_path)

with open(r'c:\Proyectos\Interactivo\mvp_ejercito\pantalla_4_divisiones\src\data\unit_database.json', 'r', encoding='utf-8') as f:
    unit_db = json.load(f)

def clean(s):
    if not s: return ""
    s = s.replace('“', '"').replace('”', '"').replace('‘', "'").replace('’', "'")
    return re.sub(r'\s+', ' ', s).strip()

def norm(s):
    return re.sub(r'[^a-z0-9]', '', clean(s).lower())

# Extract reseña slides from PPTX
pptx_slides = []
for idx, slide in enumerate(prs.slides):
    texts = [shape.text_frame.text.strip() for shape in slide.shapes if shape.has_text_frame and shape.text_frame.text.strip()]
    if len(texts) >= 2:
        body = max(texts, key=len)
        if len(body) >= 80:
            titles = [t for t in texts if t != body]
            title = clean(" ".join(titles))
            pptx_slides.append({
                "slide_num": idx + 1,
                "title": title,
                "body": clean(body)
            })

print(f"Total diapositivas de reseña en PPTX: {len(pptx_slides)}")

# Now for each slide, find the EXACT matching entry in unit_db by comparing reseña text
exact_matches = []
no_matches = []

for s in pptx_slides:
    s_norm = norm(s["body"][:80])
    best_k = None
    best_v = None
    best_sim = 0
    
    for k, v in unit_db.items():
        v_res = norm(v.get("resena", "")[:80])
        if not v_res: continue
        # measure prefix overlap
        overlap = 0
        for i in range(min(len(s_norm), len(v_res))):
            if s_norm[i] == v_res[i]: overlap += 1
            else: break
        if overlap > best_sim and overlap >= 30:
            best_sim = overlap
            best_k = k
            best_v = v
            
    if best_v:
        exact_matches.append({
            "slide_num": s["slide_num"],
            "pptx_title": s["title"],
            "db_key": best_k,
            "db_nombre": clean(best_v.get("nombre", "")),
            "db_alias": clean(best_v.get("alias", "")),
            "db_page": best_v.get("page")
        })
    else:
        no_matches.append(s)

print(f"Diapositivas vinculadas con éxito a unit_database: {len(exact_matches)}")
print(f"Diapositivas no vinculadas: {len(no_matches)}")

# Now compare titles between PPTX Slide and DB Nombre
difs = []
equals = []

for m in exact_matches:
    p_title = clean(m["pptx_title"])
    d_title = clean(m["db_nombre"])
    
    # check difference ignoring case and minor whitespace/accents
    if norm(p_title) != norm(d_title):
        difs.append(m)
    else:
        equals.append(m)

print(f"\n==========================================")
print(f"TOTAL CASOS CON DIFERENCIA EN EL TÍTULO: {len(difs)}")
print(f"TOTAL CASOS CON TÍTULO IDÉNTICO: {len(equals)}")
print(f"==========================================")

# Classify differences
with_quotes_pptx = [d for d in difs if ('"' in d['pptx_title'] or '“' in d['pptx_title'] or "'" in d['pptx_title'])]
missing_patronimico = [d for d in with_quotes_pptx if not ('"' in d['db_nombre'] or '“' in d['db_nombre'] or "'" in d['db_nombre'])]

print(f"\nDe las {len(difs)} diferencias:")
print(f" - Casos donde la diapositiva tiene nombre patronímico/honorífico (entre comillas) y en la base de datos/app NO APARECE: {len(missing_patronimico)}")
print(f" - Otros casos de diferencias (abreviaturas, cambios de tipo o palabras distintas): {len(difs) - len(missing_patronimico)}")

with open(r'c:\Proyectos\Interactivo\mvp_ejercito\pantalla_4_divisiones\scripts\exact_difs.json', 'w', encoding='utf-8') as f:
    json.dump(difs, f, indent=2, ensure_ascii=False)
