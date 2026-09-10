import fitz
import json
import re

doc = fitz.open('c:/Proyectos/Interactivo/Interactivo/Divisiones_Brigadas/DDEE BRIG UU PPUU.pdf')

# Map of pages to known entities
PAGE_MAP = {
    # I DE
    5: {"type": "division", "id": "I-DE"},
    16: {"type": "brigada", "divId": "I-DE", "id": "1-brig-inf"},
    39: {"type": "brigada", "divId": "I-DE", "id": "7-brig-inf"},
    60: {"type": "brigada", "divId": "I-DE", "id": "32-brig-inf"},
    79: {"type": "brigada", "divId": "I-DE", "id": "9-brig-blind"},
    102: {"type": "brigada", "divId": "I-DE", "id": "1-brig-selva-pa"},
    131: {"type": "brigada", "divId": "I-DE", "id": "1-brig-cab"},
    154: {"type": "brigada", "divId": "I-DE", "id": "agrup-art-inclan"},
    167: {"type": "brigada", "divId": "I-DE", "id": "1-brig-serv"},

    # II DE
    184: {"type": "division", "id": "II-DE"},
    197: {"type": "brigada", "divId": "II-DE", "id": "1-brig-multiproposito"},
    222: {"type": "brigada", "divId": "II-DE", "id": "5-brig-selva-pa"},
    243: {"type": "brigada", "divId": "II-DE", "id": "1-brig-ffee"},
    258: {"type": "brigada", "divId": "II-DE", "id": "coar-ucayali"},
    269: {"type": "brigada", "divId": "II-DE", "id": "dest-aerotransportado"},

    # III DE
    278: {"type": "division", "id": "III-DE"},
    293: {"type": "brigada", "divId": "III-DE", "id": "3-brig-blind"},
    314: {"type": "brigada", "divId": "III-DE", "id": "6-brig-blind"},
    337: {"type": "brigada", "divId": "III-DE", "id": "5-brig-montana"},
    356: {"type": "brigada", "divId": "III-DE", "id": "4-brig-montana"},
    389: {"type": "brigada", "divId": "III-DE", "id": "3-brig-cab"},
    414: {"type": "brigada", "divId": "III-DE", "id": "2-brig-selva-pa"},
    437: {"type": "brigada", "divId": "III-DE", "id": "agrup-antitanque-3"},
    462: {"type": "brigada", "divId": "III-DE", "id": "agrup-cohetes-galvez"},
    475: {"type": "brigada", "divId": "III-DE", "id": "agrup-art-bolognesi"},
    490: {"type": "brigada", "divId": "III-DE", "id": "agrup-com-olaya"},
    503: {"type": "brigada", "divId": "III-DE", "id": "3-brig-serv"},

    # IV DE
    520: {"type": "division", "id": "IV-DE"},
    527: {"type": "brigada", "divId": "IV-DE", "id": "31-brig-inf"},
    550: {"type": "brigada", "divId": "IV-DE", "id": "33-brig-inf-selva"},
    569: {"type": "brigada", "divId": "IV-DE", "id": "2-brig-inf"},
    594: {"type": "brigada", "divId": "IV-DE", "id": "agrup-ing-ruiz-gallo"},
    607: {"type": "brigada", "divId": "IV-DE", "id": "dest-apoyo-admin"},

    # V DE
    612: {"type": "division", "id": "V-DE"},
    643: {"type": "brigada", "divId": "V-DE", "id": "4-brig-selva-pa"},
    662: {"type": "brigada", "divId": "V-DE", "id": "5-brig-serv"},
}

def clean_unit_name(text):
    text = text.replace('\n', ' ').strip()
    # Normalize multiple spaces
    text = re.sub(r'\s+', ' ', text)
    # Fix standard abbreviations / OCR typos
    text = text.replace('N', 'N°').replace('Nº', 'N°').replace('N° ', 'N° ')
    text = text.replace('1', '1ª').replace('2', '2ª').replace('3', '3ª').replace('4', '4ª').replace('5', '5ª').replace('6', '6ª').replace('7', '7ª').replace('8', '8ª').replace('9', '9ª').replace('31', '31ª').replace('32', '32ª').replace('33', '33ª').replace('35', '35ª')
    text = text.replace('1ra', '1ª').replace('2da', '2ª').replace('3ra', '3ª').replace('4ta', '4ª').replace('5ta', '5ª').replace('6ta', '6ª').replace('7ma', '7ª')
    text = text.replace('COMAÑIA', 'COMPAÑÍA').replace('COMPAÑIA', 'COMPAÑÍA').replace('BATALLON', 'BATALLÓN')
    text = text.replace('ESCUADRON', 'ESCUADRÓN').replace('INGENIERIA', 'INGENIERÍA').replace('ARTILLERIA', 'ARTILLERÍA')
    text = text.replace('INFANTERIA', 'INFANTERÍA').replace('POLICIA', 'POLICÍA').replace('EJERCITO', 'EJÉRCITO')
    text = text.replace('COMUNICACION', 'COMUNICACIÓN').replace('COMUNICACIONES', 'COMUNICACIONES')
    text = text.replace('PROTECCIÓN DELA', 'PROTECCIÓN DE LA').replace('COMB SLVA.', 'COMBATE SELVA')
    text = text.replace('ING ANFIBIA', 'INGENIERÍA ANFIBIA').replace('COMB BLIN', 'COMBATE BLINDADO')
    text = text.replace('COMB MT.', 'COMBATE MOTORIZADO')
    text = text.replace('ASDENTAMIENTO', 'ASENTAMIENTO')
    text = text.replace('SELVA DE PROT DE LA AMAZONÍA', 'SELVA DE PROTECCIÓN DE LA AMAZONÍA')
    text = text.replace('SELVA DE PROT. DE LA AMAZONÍA', 'SELVA DE PROTECCIÓN DE LA AMAZONÍA')
    text = text.replace('SELVA DE PROTECCIÓN A LA AMAZONÍA', 'SELVA DE PROTECCIÓN DE LA AMAZONÍA')
    text = text.replace('DE BLINDADA', 'BLINDADA')
    text = text.replace('ANTI TANQUE', 'ANTITANQUE')
    text = text.replace('AERO TRANSPORTADO', 'AEROTRANSPORTADO').replace('AERO TRASNPORTADO', 'AEROTRANSPORTADO')
    text = text.replace('BTN INF', 'BATALLÓN DE INFANTERÍA')
    text = text.replace('31 BRIGADA', '31ª BRIGADA').replace('33 BRIGADA', '33ª BRIGADA').replace('35 BRIGADA', '35ª BRIGADA').replace('2 BRIGADA', '2ª BRIGADA')
    return text.strip()

all_data = {}

for p, meta in PAGE_MAP.items():
    page = doc[p - 1]
    drawings = page.get_drawings()
    rects = []
    for d in drawings:
        if d['type'] in ('f', 'fs'):
            r = d['rect']
            if r.width > 40 and r.height > 15 and r.width < 900 and r.height < 400:
                if not any(abs(r.x0 - ex.x0) < 5 and abs(r.y0 - ex.y0) < 5 and abs(r.width - ex.width) < 5 for ex in rects):
                    rects.append(r)
    
    words = page.get_text('words')
    box_items = []
    for r in rects:
        box_words = [w[4] for w in words if fitz.Rect(w[:4]).intersects(r)]
        if box_words:
            raw_t = ' '.join(box_words)
            box_items.append({
                'x0': round(r.x0, 1),
                'y0': round(r.y0, 1),
                'x1': round(r.x1, 1),
                'y1': round(r.y1, 1),
                'text': clean_unit_name(raw_t)
            })
    
    if not box_items:
        blocks = page.get_text('blocks')
        for b in blocks:
            text = clean_unit_name(' '.join(b[4].split()))
            if text:
                box_items.append({
                    'x0': round(b[0], 1),
                    'y0': round(b[1], 1),
                    'x1': round(b[2], 1),
                    'y1': round(b[3], 1),
                    'text': text
                })
    
    # Sort boxes: Root is lowest Y0
    box_items.sort(key=lambda b: b['y0'])
    root = box_items[0] if box_items else {'text': 'UNKNOWN'}
    subs = box_items[1:]
    
    # Group into columns based on x0 (clustering x0 within 35px)
    columns_map = {}
    for b in subs:
        col_key = None
        for k in list(columns_map.keys()):
            if abs(b['x0'] - k) < 35:
                col_key = k
                break
        if col_key is None:
            col_key = b['x0']
            columns_map[col_key] = []
        columns_map[col_key].append(b)
    
    # Sort columns from left to right
    sorted_keys = sorted(columns_map.keys())
    columns = []
    flat_units = []
    for k in sorted_keys:
        col_boxes = sorted(columns_map[k], key=lambda b: b['y0'])
        col_texts = [b['text'] for b in col_boxes]
        columns.append(col_texts)
        flat_units.extend(col_texts)
    
    all_data[p] = {
        "page": p,
        "meta": meta,
        "root": root['text'],
        "columns": columns,
        "flat_units": flat_units
    }

with open('c:/Proyectos/Interactivo/mvp_ejercito/pantalla_4_divisiones/src/data/parsed_organigrams_complete.json', 'w', encoding='utf-8') as f:
    json.dump(all_data, f, indent=2, ensure_ascii=False)

print("Parsed successfully!")
