import json
import os

base_dir = r'c:\Proyectos\Interactivo\mvp_ejercito\pantalla_4_divisiones'

# 1. Check unit_database.json
db_path = os.path.join(base_dir, 'src', 'data', 'unit_database.json')
with open(db_path, 'r', encoding='utf-8') as f:
    unit_db = json.load(f)

units_with_escudo_ejercito = []
for k, v in unit_db.items():
    escudo = v.get('escudo', '')
    if 'escudo_ejercito' in escudo:
        units_with_escudo_ejercito.append({
            'key': k,
            'nombre': v.get('nombre', ''),
            'tipo': v.get('tipo', ''),
            'sede': v.get('sede', ''),
            'escudo': escudo
        })

print(f"Total occurrences in unit_database.json: {len(units_with_escudo_ejercito)}")

unique_units = {}
for u in units_with_escudo_ejercito:
    unique_units[u['nombre']] = u

print(f"Unique units with escudo_ejercito in unit_database.json: {len(unique_units)}")
for nombre, u in sorted(unique_units.items()):
    print(f" - {nombre} | Tipo: {u['tipo']} | Key: {u['key']}")

# 2. Check divisiones.json
div_path = os.path.join(base_dir, 'src', 'data', 'divisiones.json')
with open(div_path, 'r', encoding='utf-8') as f:
    divs = json.load(f)

div_matches = []
for d in divs.get('divisiones', []):
    if 'escudo_ejercito' in d.get('escudo', ''):
        div_matches.append(f"Division {d.get('id')}: {d.get('nombre')}")
    for b in d.get('brigadas', []):
        if 'escudo_ejercito' in b.get('escudo', ''):
            div_matches.append(f"Brigada {b.get('id')}: {b.get('nombre')}")

print(f"\nOccurrences in divisiones.json: {len(div_matches)}")
for m in div_matches:
    print(f" - {m}")
