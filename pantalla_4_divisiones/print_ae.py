import json, sys
sys.stdout.reconfigure(encoding='utf-8')

with open('src/data/divisiones.json', 'r', encoding='utf-8') as f:
    divs = json.load(f)

for div in divs.get('divisiones', []):
    if div.get('id') == 'AE':
        print(json.dumps(div, ensure_ascii=False, indent=2))
