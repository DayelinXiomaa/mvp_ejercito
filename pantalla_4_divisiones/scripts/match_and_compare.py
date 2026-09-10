import os
import json
import re
from pptx import Presentation

pptx_path = r'C:\Proyectos\Interactivo\Interactivo\ES\DDEE BRIG UU PPUU.pptx'
prs = Presentation(pptx_path)

with open(r'c:\Proyectos\Interactivo\mvp_ejercito\pantalla_4_divisiones\src\data\unit_database.json', 'r', encoding='utf-8') as f:
    unit_db = json.load(f)

with open(r'c:\Proyectos\Interactivo\mvp_ejercito\pantalla_4_divisiones\src\data\divisiones.json', 'r', encoding='utf-8') as f:
    divs_data = json.load(f)

def clean_str(s):
    if not s: return ""
    s = s.replace('“', '"').replace('”', '"').replace('‘', "'").replace('’', "'")
    s = re.sub(r'\s+', ' ', s).strip()
    return s

def norm(s):
    s = clean_str(s).lower()
    return re.sub(r'[^a-z0-9]', '', s)

# Extract PPTX reseña slides
pptx_reseñas = []
for idx, slide in enumerate(prs.slides):
    slide_num = idx + 1
    shapes_text = []
    for shape in slide.shapes:
        if shape.has_text_frame:
            txt = clean_str(shape.text_frame.text)
            if txt:
                shapes_text.append(txt)
    
    if len(shapes_text) >= 2:
        body = max(shapes_text, key=len)
        if len(body) >= 80:
            titles = [t for t in shapes_text if t != body]
            title = " ".join(titles)
            pptx_reseñas.append({
                "slide_num": slide_num,
                "title": clean_str(title),
                "body": clean_str(body)
            })

print(f"PPTX reseña slides: {len(pptx_reseñas)}")

# Now for each PPTX reseña slide, find matching unit in unit_db
# Let's match by reseña text overlap (first 50 chars of body)
matches = []
unmatched_pptx = []

for r in pptx_reseñas:
    r_body_start = norm(r["body"][:60])
    found_key = None
    found_entry = None
    
    # Check unit_db
    for k, v in unit_db.items():
        v_resena = norm(v.get("resena", "")[:60])
        if v_resena and (r_body_start.startswith(v_resena[:40]) or v_resena.startswith(r_body_start[:40])):
            found_key = k
            found_entry = v
            break
            
    if found_entry:
        app_title = clean_str(found_entry.get("nombre", ""))
        pptx_title = clean_str(r["title"])
        matches.append({
            "slide_num": r["slide_num"],
            "pptx_title": pptx_title,
            "app_title": app_title,
            "db_key": found_key,
            "different": norm(pptx_title) != norm(app_title)
        })
    else:
        unmatched_pptx.append(r)

print(f"Matched slides: {len(matches)}")
print(f"Unmatched slides: {len(unmatched_pptx)}")

diff_cases = [m for m in matches if m["different"]]
same_cases = [m for m in matches if not m["different"]]

print(f"\n--- RESUMEN ---")
print(f"Casos con DIFERENCIA: {len(diff_cases)}")
print(f"Casos IDÉNTICOS: {len(same_cases)}")

print("\nPrimeros 20 casos con diferencia:")
for d in diff_cases[:20]:
    print(f"Slide {d['slide_num']:3d}:")
    print(f"   PPTX Diapositiva: {d['pptx_title']}")
    print(f"   App / BD actual : {d['app_title']}")
