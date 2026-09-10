import re
import json

with open(r'c:\Proyectos\Interactivo\divisiones_extracted.txt', 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

pages = re.split(r'=== PAGE (\d+) ===', content)
# pages will be ['', '1', content_1, '2', content_2, ...]

page_data = {}
for i in range(1, len(pages), 2):
    page_num = int(pages[i])
    text = pages[i+1].strip()
    page_data[page_num] = text

print(f"Total pages parsed: {len(page_data)}")

# Let's inspect pages that look like reseña slides (having long text separated by |)
resenas = []
for p_num, text in page_data.items():
    lines = [line.strip() for line in text.split('\n') if line.strip() and not line.strip().startswith('->')]
    if not lines:
        continue
    first_line = lines[0]
    parts = [p.strip() for p in first_line.split('|')]
    # If the slide has paragraphs/history text:
    if len(parts) >= 2 and len(first_line) > 100:
        title = parts[0]
        resena_text = " ".join(parts[1:])
        resenas.append((p_num, title, resena_text))

print(f"Total reseña slides found: {len(resenas)}")
for p, t, r in resenas[:15]:
    print(f"Page {p:3d}: TITLE -> {t}")
