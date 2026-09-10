import json
import os

db_path = r'c:\Proyectos\Interactivo\mvp_ejercito\pantalla_4_divisiones\src\data\unit_database.json'
with open(db_path, 'r', encoding='utf-8') as f:
    unit_db = json.load(f)

# Targets with slide numbers:
# 1. Slide 245: BATALLÓN DE COMANDOS "COMANDANTE ESPINAR" N° 19 -> /assets/divisiones/slide_245_img_1.png
# 2. Slide 247: BATALLÓN DE COMANDOS "CRL NARCISO DE LA COLINA" N° 61 -> /assets/divisiones/slide_247_img_1.png
# 3. Slide 249: BATALLÓN DE SERVICIOS "SO1 HUGO LARICO PAMPA" N° 61 -> /assets/divisiones/slide_249_img_1.png
# 4. Slide 492: BATALLÓN DE COMUNICACIONES "TTE ENRIQUE CHOCANO" N° 113 -> /assets/divisiones/slide_492_img_1.png

keywords_map = [
    ('espinar', '19', '/assets/divisiones/slide_245_img_1.png'),
    ('colina', '61', '/assets/divisiones/slide_247_img_1.png'),
    ('larico', '61', '/assets/divisiones/slide_249_img_1.png'),
    ('chocano', '113', '/assets/divisiones/slide_492_img_1.png'),
]

updated = []
for k, v in unit_db.items():
    name = v.get('nombre', '')
    for word, num, esc in keywords_map:
        if word in k.lower() or word in name.lower():
            if num in k or num in name:
                v['escudo'] = esc
                updated.append(f"{k} -> {esc}")

with open(db_path, 'w', encoding='utf-8') as f:
    json.dump(unit_db, f, indent=2, ensure_ascii=False)

print(f"Updated {len(updated)} entries in unit_database.json:")
for u in updated:
    print("  ", u)
