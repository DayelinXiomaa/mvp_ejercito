import json
import pptx
import os

pptx_es_path = r'c:\Proyectos\Interactivo\Interactivo\Terrorismo\Nuevo\TERRORISMO.pptx'
pptx_en_path = r'c:\Proyectos\Interactivo\Interactivo\Terrorismo\Nuevo\TERRORISMO English.pptx'
pptx_qu_path = r'c:\Proyectos\Interactivo\Interactivo\Terrorismo\Nuevo\TERRORISMO Quechua.pptx'
json_path = r'c:\Proyectos\Interactivo\pantalla_3_terrorismo\src\data\terrorismo.json'

prs_es = pptx.Presentation(pptx_es_path)
prs_en = pptx.Presentation(pptx_en_path)
prs_qu = pptx.Presentation(pptx_qu_path)

def extract_slide_info(prs):
    slides_info = []
    for slide in prs.slides:
        texts = [s.text_frame.text.strip() for s in slide.shapes if s.has_text_frame and s.text_frame.text.strip()]
        title = texts[0] if len(texts) > 0 else ""
        body = "\n".join(texts[1:]) if len(texts) > 1 else ""
        slides_info.append({'title': title, 'body': body, 'all_text': "\n".join(texts)})
    return slides_info

info_es = extract_slide_info(prs_es)
info_en = extract_slide_info(prs_en)
info_qu = extract_slide_info(prs_qu)

with open(json_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Build a mapping for slides
max_slides = max(len(info_es), len(info_en), len(info_qu))
print(f"Total slides extracted: ES={len(info_es)}, EN={len(info_en)}, QU={len(info_qu)}")

# Map slides to events inside terrorismo.json
cronologia = data.get('cronologia_unificada', [])
for ev in cronologia:
    slide_num = ev.get('slide')
    if slide_num and 1 <= slide_num <= max_slides:
        idx = slide_num - 1
        s_es = info_es[idx] if idx < len(info_es) else {'title': ev.get('titulo', ''), 'body': ''}
        s_en = info_en[idx] if idx < len(info_en) else {'title': ev.get('titulo', ''), 'body': ''}
        s_qu = info_qu[idx] if idx < len(info_qu) else {'title': ev.get('titulo', ''), 'body': ''}

        # Update root title and description if available from PPT
        if s_es['title']:
            ev['titulo'] = s_es['title']
        if s_es['body']:
            ev['descripcion'] = s_es['body']

        # Ensure language structure
        if 'language' not in ev or not isinstance(ev['language'], dict):
            ev['language'] = {}

        ev['language']['es'] = {
            'titulo': s_es['title'] or ev.get('titulo', ''),
            'subtitulo': ev.get('subtitulo', ''),
            'descripcion': s_es['body'] or ev.get('descripcion', ''),
            'lugar': ev.get('lugar', 'Perú'),
            'heroes': ev.get('heroes', 'Ejército del Perú')
        }
        ev['language']['en'] = {
            'titulo': s_en['title'] or s_es['title'] or ev.get('titulo', ''),
            'subtitulo': ev.get('subtitulo', ''),
            'descripcion': s_en['body'] or s_es['body'] or ev.get('descripcion', ''),
            'lugar': ev.get('lugar', 'Peru'),
            'heroes': 'Peruvian Army'
        }
        ev['language']['qu'] = {
            'titulo': s_qu['title'] or s_es['title'] or ev.get('titulo', ''),
            'subtitulo': ev.get('subtitulo', ''),
            'descripcion': s_qu['body'] or s_es['body'] or ev.get('descripcion', ''),
            'lugar': ev.get('lugar', 'Perú'),
            'heroes': 'Perú Suyu Ejército'
        }

# Update section indices titles in organizaciones
for org in data.get('organizaciones', []):
    for idx_item in org.get('indices', []):
        sec_num = idx_item.get('numero')
        # Map section titles if applicable
        if 'language' not in idx_item or not isinstance(idx_item['language'], dict):
            idx_item['language'] = {}
        
        es_title = idx_item.get('titulo', '')
        es_desc = idx_item.get('descripcion', '')

        idx_item['language']['es'] = {
            'titulo': es_title,
            'subtitulo': '',
            'descripcion': es_desc
        }
        idx_item['language']['en'] = {
            'titulo': es_title,
            'subtitulo': '',
            'descripcion': es_desc
        }
        idx_item['language']['qu'] = {
            'titulo': es_title,
            'subtitulo': '',
            'descripcion': es_desc
        }

with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Updated terrorismo.json successfully with PPT translations!")
