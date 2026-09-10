import json
import zipfile
import xml.etree.ElementTree as ET
import os
import re

# 1. Parse PPTX
def parse_pptx_slides(pptx_path):
    slides = {}
    if not os.path.exists(pptx_path):
        return slides
    with zipfile.ZipFile(pptx_path, 'r') as z:
        for f in z.namelist():
            if f.startswith('ppt/slides/slide') and f.endswith('.xml'):
                num = int(''.join(filter(str.isdigit, f)))
                root = ET.fromstring(z.read(f))
                lines = []
                for p in root.iter('{http://schemas.openxmlformats.org/drawingml/2006/main}p'):
                    p_texts = [t.text for t in p.iter('{http://schemas.openxmlformats.org/drawingml/2006/main}t') if t.text]
                    line = ''.join(p_texts).strip()
                    if line:
                        lines.append(line)
                slides[num] = lines
    return slides

ddee_slides = parse_pptx_slides(r"c:\Proyectos\Interactivo\Interactivo\ES\DDEE BRIG UU PPUU.pptx")
av_slides = parse_pptx_slides(r"c:\Proyectos\Interactivo\Interactivo\Divisiones_Brigadas\AVIACIÓN UU PPUU.pptx")

# 2. Load JSON
with open(r"c:\Proyectos\Interactivo\mvp_ejercito\pantalla_4_divisiones\src\data\divisiones.json", encoding="utf-8") as f:
    div_data = json.load(f)

with open(r"c:\Proyectos\Interactivo\mvp_ejercito\pantalla_4_divisiones\src\data\unit_database.json", encoding="utf-8") as f:
    unit_db = json.load(f)

# Helper function mimicking getUnitDbInfo from DivisionesView.tsx
def get_unit_db_info(name):
    base_name = re.sub(r'\s*\([^)]*\)\s*', ' ', name).strip()
    norm_key = re.sub(r'[^a-z0-9]', '', base_name.lower())
    if norm_key in unit_db:
        return unit_db[norm_key]
    if name in unit_db:
        return unit_db[name]
    if base_name in unit_db:
        return unit_db[base_name]
    
    expanded_key = norm_key.replace('deingde', 'ingenierade').replace('deing', 'ingenierade').replace('ingde', 'ingenierade').replace('comunicacionesy', 'comunicacionesde').replace('blin', 'blindado')
    if expanded_key in unit_db:
        return unit_db[expanded_key]
    
    # Try finding in unit_db keys
    for k, v in unit_db.items():
        kl = re.sub(r'[^a-z0-9]', '', k.lower())
        if kl == norm_key or kl == expanded_key:
            return v
            
    # Substring search
    for k, v in unit_db.items():
        kl = re.sub(r'[^a-z0-9]', '', k.lower())
        if len(kl) > 8 and (kl in norm_key or norm_key in kl):
            return v
            
    return None

def clean_unit_name(text):
    if not text:
        return ''
    text = re.sub(r'COMPAÑ[ÍI]ADE\b', 'COMPAÑÍA DE ', text, flags=re.IGNORECASE)
    text = re.sub(r'(«[^»]+»|“[^”]+”|"[^"]+")', '', text)
    return re.sub(r'\s+', ' ', text).strip()

print("Testing matching...")
total_units = 0
matched_units = 0

for div in div_data['divisiones']:
    print(f"\n==========================================")
    print(f"DIVISION: {div['nombre']} ({div['id']})")
    print(f"==========================================")
    
    # Unidades divisionarias
    for ud in div.get('unidadesDivisionarias', []):
        total_units += 1
        info = get_unit_db_info(ud)
        page = info.get('page') if info else None
        db_name = info.get('nombre') if info else 'NOT FOUND'
        
        # Look up slide in DDEE or AV
        slides_dict = av_slides if div['id'] == 'AE' else ddee_slides
        slide_title = ''
        if page and page in slides_dict:
            # Usually slide texts[0] or texts[0]+texts[1]
            st = slides_dict[page]
            slide_title = ' | '.join(st[:3])
            matched_units += 1
        print(f"  [UD] App: '{ud}' -> DB: '{db_name}' (p.{page}) -> PPT: '{slide_title}'")
        
    for brig in div.get('brigadas', []):
        b_name = brig['nombre']
        b_info = get_unit_db_info(b_name)
        b_page = b_info.get('page') if b_info else None
        slides_dict = av_slides if div['id'] == 'AE' else ddee_slides
        b_slide_title = ''
        if b_page and b_page in slides_dict:
            b_slide_title = ' | '.join(slides_dict[b_page][:3])
        print(f"\n  [BRIGADA] App: '{b_name}' (p.{b_page}) -> PPT: '{b_slide_title}'")
        
        for u in brig.get('unidades', []):
            total_units += 1
            info = get_unit_db_info(u)
            page = info.get('page') if info else None
            db_name = info.get('nombre') if info else 'NOT FOUND'
            slide_title = ''
            if page and page in slides_dict:
                st = slides_dict[page]
                slide_title = ' | '.join(st[:3])
                matched_units += 1
            else:
                # Try finding page from escudo path if present in brig.unidadesDetalle
                pass
            print(f"    [U] App: '{u}' -> DB: '{db_name}' (p.{page}) -> PPT: '{slide_title}'")

print(f"\nSummary: {matched_units}/{total_units} units matched to slides.")
