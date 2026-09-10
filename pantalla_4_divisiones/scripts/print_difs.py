import json

with open(r'c:\Proyectos\Interactivo\mvp_ejercito\pantalla_4_divisiones\scripts\exact_difs.json', 'r', encoding='utf-8') as f:
    difs = json.load(f)

# Sort by slide number
difs.sort(key=lambda x: x["slide_num"])

print(f"Total diferencias en exact_difs.json: {len(difs)}")
print("\nListado completo de diferencias:")
for i, d in enumerate(difs):
    p_t = d["pptx_title"]
    db_t = d["db_nombre"]
    slide = d["slide_num"]
    print(f"{i+1:3d}. [Slide {slide:3d}]")
    print(f"     PPTX: {p_t}")
    print(f"     App : {db_t}")
