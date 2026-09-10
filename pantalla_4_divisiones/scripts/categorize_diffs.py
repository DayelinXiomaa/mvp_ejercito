import json
from collections import defaultdict

with open(r'c:\Proyectos\Interactivo\mvp_ejercito\pantalla_4_divisiones\scripts\diferencias_detalle.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

by_div = defaultdict(list)
categories = {
    "patronimico_faltante": [],
    "tipografia_abreviatura": [],
    "no_encontrada": []
}

for item in data:
    if not item["different"]:
        continue
    div = item["div"]
    by_div[div].append(item)
    
    pptx_t = item["pptx_slide_title"]
    app_t = item["app_modal_title"]
    
    if pptx_t == "NO ENCONTRADA EN PPTX":
        categories["no_encontrada"].append(item)
    elif ('"' in pptx_t or '“' in pptx_t or '«' in pptx_t or "'" in pptx_t) and not ('"' in app_t or '“' in app_t or '«' in app_t or "'" in app_t):
        categories["patronimico_faltante"].append(item)
    else:
        categories["tipografia_abreviatura"].append(item)

print("=== DIFERENCIAS POR DIVISIÓN ===")
for div, items in by_div.items():
    print(f"\n[{div}] Total con diferencia: {len(items)}")
    for it in items[:6]:
        print(f"  - {it['organigrama_name']}")
        print(f"      Diapositiva (Slide {it['pptx_slide_num']}): {it['pptx_slide_title']}")
        print(f"      App / Modal : {it['app_modal_title']}")

print("\n=== CATEGORÍAS DE DIFERENCIAS ===")
print(f"1. Nombre patronímico/honorífico presente en diapositiva pero omitido en App: {len(categories['patronimico_faltante'])}")
print(f"2. Diferencias de formato, denominación o redacción: {len(categories['tipografia_abreviatura'])}")
print(f"3. No encontradas / No enlazadas: {len(categories['no_encontrada'])}")
