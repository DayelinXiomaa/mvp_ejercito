import re

with open('public/linea-tiempo.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Extract existing events
cards = re.findall(r'<div class="event-column[^"]*" data-ev="(\d+)"[^>]*>[\s\S]*?<span class="year-tag">([\s\S]*?)</span>[\s\S]*?<span class="card-thumb-date"[^>]*>([\s\S]*?)</span>[\s\S]*?<h3 class="event-title"[^>]*>([\s\S]*?)</h3>', html)

print("Existing events count:", len(cards))
for ev_id, year, date, title in cards:
    print(f"#{ev_id} ({year.strip()}) {re.sub(r'<.*?>|\s+', ' ', date).strip()} : {re.sub(r'<.*?>|\s+', ' ', title).strip()}")
