import json

with open(r'c:\Proyectos\Interactivo\mvp_ejercito\pantalla_4_divisiones\src\data\divisiones.json', 'r', encoding='utf-8') as f:
    d = json.load(f)

for div in d['divisiones']:
    div_nom = div.get('nombre')
    for b in div.get('brigadas', []):
        b_nom = b.get('nombre')
        for u in b.get('unidades', []):
            u_str = u if isinstance(u, str) else u.get('nombre', '')
            if '5' in u_str or 'ZARUMILLA' in u_str.upper():
                print(f"Div: {div_nom} | Brig: {b_nom} | Unidad: {u_str}")
