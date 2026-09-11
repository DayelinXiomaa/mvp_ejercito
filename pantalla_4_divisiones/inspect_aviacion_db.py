import json, sys
sys.stdout.reconfigure(encoding='utf-8')

with open('src/data/unit_database.json', 'r', encoding='utf-8') as f:
    db = json.load(f)

for k, v in db.items():
    if any(s in k.lower() or s in str(v.get('nombre', '')).lower() for s in ['800', '811', '821', 'aviacion', 'aviación']):
        print(f"=== KEY: {repr(k)} ===")
        print(f"  nombre: {v.get('nombre')}")
        print(f"  alias: {v.get('alias')}")
        print(f"  escudo: {v.get('escudo')}")
        print(f"  page: {v.get('page')}")
        print(f"  sede: {v.get('sede')}")
        print(f"  creacion: {v.get('creacion')}")
        print(f"  resena preview: {v.get('resena', '')[:120]}...")
        print()
