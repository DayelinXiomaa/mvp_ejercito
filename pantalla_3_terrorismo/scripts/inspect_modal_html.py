with open(r'c:\Proyectos\Interactivo\mvp_ejercito\pantalla_3_terrorismo\public\linea-tiempo.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Find event-detail-modal in HTML
m_idx = text.find('id="event-detail-modal"')
if m_idx != -1:
    print("--- HTML around event-detail-modal ---")
    start = max(0, m_idx - 100)
    end = min(len(text), m_idx + 2500)
    print(text[start:end])

# Find openEventDetailModal in JS
fn_idx = text.find('function openEventDetailModal')
if fn_idx != -1:
    print("\n--- JS openEventDetailModal ---")
    end_fn = min(len(text), fn_idx + 2500)
    print(text[fn_idx:end_fn])
