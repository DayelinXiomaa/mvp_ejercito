import json, sys
sys.stdout.reconfigure(encoding='utf-8')

with open('src/data/unit_database.json', 'r', encoding='utf-8') as f:
    db = json.load(f)

for k, v in db.items():
    if 'compaacomandon21' in k.lower() or 'slide_214' in str(v) or 'slide_215' in str(v) or 'comando n° 21' in k.lower() or 'comando nº 21' in k.lower():
        print(f"=== KEY: {repr(k)} ===")
        print(f"  nombre: {v.get('nombre')}")
        print(f"  alias: {v.get('alias')}")
        print(f"  escudo: {v.get('escudo')}")
        print(f"  page: {v.get('page')}")
        print(f"  sede: {v.get('sede')}")
        print(f"  creacion: {v.get('creacion')}")
        print(f"  resena: {v.get('resena')}")
        if 'language' in v:
            for lang, lval in v['language'].items():
                print(f"    [{lang}] nombre: {lval.get('nombre')}")
                print(f"    [{lang}] resena: {lval.get('resena')}")
        print()
