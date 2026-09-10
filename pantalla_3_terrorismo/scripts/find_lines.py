with open(r'c:\Proyectos\Interactivo\mvp_ejercito\pantalla_3_terrorismo\public\linea-tiempo.html', 'r', encoding='utf-8', errors='ignore') as f:
    for i, line in enumerate(f):
        if 'event-modal-media' in line:
            print('Line:', i+1, line.strip()[:60])
        if 'id="event-detail-modal"' in line:
            print('Line HTML modal:', i+1, line.strip()[:60])
        if 'function renderEventDetailModal' in line:
            print('Line JS render:', i+1, line.strip()[:60])
