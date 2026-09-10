import json
import re

with open('c:/Proyectos/Interactivo/mvp_ejercito/pantalla_4_divisiones/src/data/divisiones.json', encoding='utf-8') as f:
    data = json.load(f)

def clean_text(s):
    if not isinstance(s, str):
        return s
    
    # Clean up any bad bytes or question marks
    s = s.replace('\ufffd', 'Ñ')
    s = s.replace('COMPAÑA', 'COMPAÑÍA').replace('COMPAA', 'COMPAÑÍA')
    s = s.replace('POLICÑ A', 'POLICÍA').replace('POLICÑA', 'POLICÍA').replace('POLICA', 'POLICÍA')
    s = s.replace('COMUNICACIÑ NES', 'COMUNICACIONES').replace('COMUNICACINES', 'COMUNICACIONES')
    s = s.replace('BATALLÑ N', 'BATALLÓN').replace('BATALLN', 'BATALLÓN')
    s = s.replace('INFANTERÑ A', 'INFANTERÍA').replace('INFANTERA', 'INFANTERÍA')
    s = s.replace('ARTILLERÑ A', 'ARTILLERÍA').replace('ARTILLERA', 'ARTILLERÍA')
    s = s.replace('CAMPAÑA', 'CAMPAÑA').replace('CAMPAA', 'CAMPAÑA')
    s = s.replace('ANTIAÑ REO', 'ANTIAÉREO').replace('ANTIAREO', 'ANTIAÉREO')
    s = s.replace('ANTIAÑ REA', 'ANTIAÉREA').replace('ANTIAREA', 'ANTIAÉREA')
    s = s.replace('DIVISIÑ N', 'DIVISIÓN').replace('DIVISIN', 'DIVISIÓN')
    s = s.replace('ESCUADRÑ N', 'ESCUADRÓN').replace('ESCUADRN', 'ESCUADRÓN')
    s = s.replace('INGENIERÑ A', 'INGENIERÍA').replace('INGENIERA', 'INGENIERÍA')
    s = s.replace('AMAZONÑ A', 'AMAZONÍA').replace('AMAZONA', 'AMAZONÍA')
    s = s.replace('MONTAÑA', 'MONTAÑA').replace('MONTAA', 'MONTAÑA')
    s = s.replace('EJÑ RCITO', 'EJÉRCITO').replace('EJRCITO', 'EJÉRCITO')
    s = s.replace('LOGÑ STICO', 'LOGÍSTICO').replace('LOGSTICO', 'LOGÍSTICO')
    s = s.replace('TÑ CNICO', 'TÉCNICO').replace('TCNICO', 'TÉCNICO')
    s = s.replace('ELECTRÑ NICA', 'ELECTRÓNICA').replace('ELECTRNICA', 'ELECTRÓNICA')
    s = s.replace('MULTIPROPÑ SITO', 'MULTIPROPÓSITO').replace('MULTIPROPSITO', 'MULTIPROPÓSITO')
    s = s.replace('PROTECCIÑ N', 'PROTECCIÓN').replace('PROTECCIN', 'PROTECCIÓN')
    s = s.replace('CONSTRUCCIÑ N', 'CONSTRUCCIÓN').replace('CONSTRUCCIN', 'CONSTRUCCIÓN')
    s = s.replace('INSTRUCCIÑ N', 'INSTRUCCIÓN').replace('INSTRUCCIN', 'INSTRUCCIÓN')
    s = s.replace('OBSERVACIÑ N', 'OBSERVACIÓN').replace('OBSERVACIN', 'OBSERVACIÓN')
    s = s.replace('Ñ ', 'N° ').replace('Ñ', 'N° ')
    
    # Fix numbers
    s = re.sub(r'N°\s*(\d+)', r'N° \1', s)
    s = re.sub(r'(\d+)\s*BRIGADA', r'\1ª BRIGADA', s)
    s = re.sub(r'(\d+)\s*Brigada', r'\1ª Brigada', s)
    s = re.sub(r'(\d+)\s*Divisi[oó]n', r'\1ª División', s)
    s = re.sub(r'\s+', ' ', s).strip()
    return s

def traverse(obj):
    if isinstance(obj, dict):
        return {k: traverse(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [traverse(item) for item in obj]
    elif isinstance(obj, str):
        return clean_text(obj)
    return obj

data = traverse(data)

# Let's verify specific brigades and names
with open('c:/Proyectos/Interactivo/mvp_ejercito/pantalla_4_divisiones/src/data/divisiones.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Saved pristine divisiones.json!")
