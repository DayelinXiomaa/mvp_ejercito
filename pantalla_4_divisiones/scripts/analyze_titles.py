import os
import json
import re
from pptx import Presentation

pptx_path = r'C:\Proyectos\Interactivo\Interactivo\ES\DDEE BRIG UU PPUU.pptx'
prs = Presentation(pptx_path)

with open(r'c:\Proyectos\Interactivo\mvp_ejercito\pantalla_4_divisiones\src\data\unit_database.json', 'r', encoding='utf-8') as f:
    unit_db = json.load(f)

# Also load divisiones.json to see all units listed in the organigrams
with open(r'c:\Proyectos\Interactivo\mvp_ejercito\pantalla_4_divisiones\src\data\divisiones.json', 'r', encoding='utf-8') as f:
    divs_data = json.load(f)

print(f"Total slides: {len(prs.slides)}")

def clean_str(s):
    if not s: return ""
    # replace smart quotes and weird chars
    s = s.replace('“', '"').replace('”', '"').replace('‘', "'").replace('’', "'").replace('', '"')
    s = re.sub(r'\s+', ' ', s).strip()
    return s

def norm_key(s):
    s = clean_str(s).lower()
    return re.sub(r'[^a-z0-9]', '', s)

# Let's extract all reseña slides from the PPTX
reseña_slides = []
for idx, slide in enumerate(prs.slides):
    slide_num = idx + 1
    shapes_text = []
    for shape in slide.shapes:
        if shape.has_text_frame:
            txt = clean_str(shape.text_frame.text)
            if txt:
                shapes_text.append(txt)
    
    # Check if this slide is a reseña slide
    # Typically 2 text frames: Title and Body (Body > 100 chars or contains 'creado', 'origen', 'sede', etc.)
    # Sometimes title is split across shapes
    if len(shapes_text) >= 2:
        # Find the body (longest text)
        body = max(shapes_text, key=len)
        if len(body) >= 80: # Reseña text
            titles = [t for t in shapes_text if t != body]
            title = " ".join(titles)
            reseña_slides.append({
                "slide_num": slide_num,
                "title": title,
                "body": body
            })

print(f"Total reseña slides identified in PPTX: {len(reseña_slides)}")
