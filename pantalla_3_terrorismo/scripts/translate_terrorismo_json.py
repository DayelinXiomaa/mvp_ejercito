import json
import re
import os

# Translation dictionary and rules for historical/military terminology
SPANISH_TO_ENGLISH_TERMS = {
    "Sendero Luminoso": "Shining Path",
    "Organización Terrorista Sendero Luminoso": "Shining Path Terrorist Organization",
    "Movimiento Revolucionario Túpac Amaru": "Túpac Amaru Revolutionary Movement",
    "Fuerzas Armadas": "Armed Forces",
    "Ejército del Perú": "Peruvian Army",
    "Policía Nacional del Perú": "National Police of Peru",
    "Operación Chavín de Huántar": "Operation Chavín de Huántar",
    "Operación Victoria": "Operation Victoria",
    "GEIN": "GEIN (Special Intelligence Group)",
    "DINCOTE": "DINCOTE (Counter-Terrorism Directorate)",
    "Pacificación Nacional": "National Pacification",
    "Comités de Autodefensa": "Self-Defense Committees (CAD)",
    "Bases Contrasubversivas": "Counter-Subversive Bases",
    "Residencia del Embajador de Japón": "Japanese Ambassador's Residence",
    "Cárcel del pueblo": "People's Prison",
    "Fuga del Penal Castro Castro": "Castro Castro Prison Escape",
    "Fuga de Canto Grande": "Canto Grande Escape",
    "Emboscada": "Ambush",
    "Atentado": "Attack",
    "Coche bomba": "Car bomb",
    "Captura": "Capture",
    "Rescate": "Rescue",
    "Derrota militar": "Military defeat",
    "Lucha armada": "Armed struggle",
    "Guerra popular": "People's war",
    "Cúpula terrorista": "Terrorist leadership",
    "Comité Central": "Central Committee",
    "Comisión Militar": "Military Commission"
}

def translate_es_to_en(text):
    if not text:
        return ""
    res = text
    
    # Common historical phrase translations
    patterns = [
        (r"Inicio de las acciones armadas", "Beginning of armed actions"),
        (r"Quema de ánforas en Chuschi", "Burning of ballot boxes in Chuschi"),
        (r"Asalto a la cárcel de Ayacucho", "Assault on Ayacucho prison"),
        (r"Matanza de Lucanamarca", "Lucanamarca Massacre"),
        (r"Masacre de Soras", "Soras Massacre"),
        (r"Atentado de Tarata", "Tarata Bombing in Miraflores"),
        (r"Captura de Abimael Guzmán", "Capture of Abimael Guzmán"),
        (r"Caída de la cúpula senderista", "Fall of the Shining Path leadership"),
        (r"Operación Victoria", "Operation Victoria"),
        (r"Toma de la residencia del embajador de Japón", "Takeover of the Japanese Ambassador's Residence"),
        (r"Operación Militar Chavín de Huántar", "Chavín de Huántar Military Rescue Operation"),
        (r"Rescate de los rehenes", "Hostage Rescue"),
        (r"Asesinato de María Elena Moyano", "Assassination of María Elena Moyano"),
        (r"Asesinato de Pedro Huilca", "Assassination of Pedro Huilca"),
        (r"Emboscada en San José de Secce", "Ambush in San José de Secce"),
        (r"Emboscada en Santo Domingo de Acobamba", "Ambush in Santo Domingo de Acobamba"),
        (r"Operación Patriota", "Operation Patriot"),
        (r"Neutralización de mandos terroristas", "Neutralization of terrorist commanders"),
        (r"Caída del camarada", "Fall of Comrade"),
        (r"Captura de", "Capture of"),
        (r"Atentado contra", "Attack against"),
        (r"Emboscada a", "Ambush against"),
        (r"Asesinato de", "Assassination of"),
        (r"Secuestro de", "Kidnapping of"),
        (r"Fuerzas del Orden", "Security Forces"),
        (r"Fuerzas Armadas del Perú", "Armed Forces of Peru"),
        (r"Estado Peruano", "Peruvian State")
    ]
    for p, r in patterns:
        res = re.sub(p, r, res, flags=re.IGNORECASE)
    
    # Translate structural descriptions
    # Replace key verbs/connectors for smooth English
    replacements = [
        ("fue creado en", "was created in"),
        ("fue capturado en", "was captured in"),
        ("perpetrado por", "perpetrated by"),
        ("ejecutado por", "executed by"),
        ("comandado por", "commanded by"),
        ("durante el gobierno de", "during the administration of"),
        ("en el departamento de", "in the department of"),
        ("en la provincia de", "in the province of"),
        ("en la ciudad de", "in the city of"),
        ("a través de", "through"),
        ("con el objetivo de", "with the objective of"),
        ("dejando como saldo", "resulting in"),
        ("en el marco de la", "within the framework of"),
        ("en la zona del VRAEM", "in the VRAEM region"),
        ("en el Valle de los Ríos Apurímac, Ene y Mantaro", "in the Apurímac, Ene, and Mantaro River Valley (VRAEM)"),
        ("miembros de la organización", "members of the organization"),
        ("héroes de la pacificación", "heroes of national pacification"),
        ("defensa de la democracia", "defense of democracy"),
        ("soberanía nacional", "national sovereignty")
    ]
    for sp, en in replacements:
        res = re.sub(r'\b' + re.escape(sp) + r'\b', en, res, flags=re.IGNORECASE)
    
    return res

def translate_es_to_qu(text):
    if not text:
        return ""
    res = text
    
    # Quechua military & historical translation patterns
    patterns = [
        (r"Sendero Luminoso", "Sendero Luminoso (Kanchaq Ñan)"),
        (r"Movimiento Revolucionario Túpac Amaru", "Túpac Amaru Ayñinakuy Kuyuy (MRTA)"),
        (r"Operación Chavín de Huántar", "Chavín de Huántar Operación"),
        (r"Operación Victoria", "Victoria Operación"),
        (r"Pacificación Nacional", "Mama Llaqta Qasikay"),
        (r"Fuerzas Armadas", "Awqaq Suyu Fuerzakuna"),
        (r"Ejército del Perú", "Perú Suyu Ejército"),
        (r"Policía Nacional", "Policía Nacional"),
        (r"Captura de Abimael Guzmán", "Abimael Guzmán Hap'iy"),
        (r"Captura de", "Hap'iy:"),
        (r"Atentado en", "Wañuchiy ruray:"),
        (r"Atentado contra", "Wañuchiy ruray contra:"),
        (r"Emboscada en", "Pakasqa maqanakuy:"),
        (r"Masacre de", "Runakuna wañuchiy:"),
        (r"Matanza de", "Runakuna wañuchiy:"),
        (r"Rescate de rehenes", "Hap'isqa runakuna kacharikuy"),
        (r"Cárcel del pueblo", "Llaqtapa samay wasin"),
        (r"Fuga de Canto Grande", "Canto Grande samay wasimanta ayqiy"),
        (r"Estado Peruano", "Perú Suyu Estado"),
        (r"en el departamento de", "departamentopi"),
        (r"en la provincia de", "provinciapi"),
        (r"en la ciudad de", "llaqtapi"),
        (r"en el VRAEM", "VRAEM suyupi")
    ]
    for p, r in patterns:
        res = re.sub(p, r, res, flags=re.IGNORECASE)
        
    return res

def process_event(ev):
    titulo_es = ev.get("titulo", "")
    subtitulo_es = ev.get("subtitulo", "")
    desc_es = ev.get("descripcion", "")
    lugar_es = ev.get("lugar", "Perú")
    heroes_es = ev.get("heroes", "Fuerzas del Orden")
    
    titulo_en = translate_es_to_en(titulo_es)
    subtitulo_en = translate_es_to_en(subtitulo_es)
    desc_en = translate_es_to_en(desc_es)
    lugar_en = translate_es_to_en(lugar_es)
    heroes_en = translate_es_to_en(heroes_es)
    
    titulo_qu = translate_es_to_qu(titulo_es)
    subtitulo_qu = translate_es_to_qu(subtitulo_es)
    desc_qu = translate_es_to_qu(desc_es)
    lugar_qu = translate_es_to_qu(lugar_es)
    heroes_qu = translate_es_to_qu(heroes_es)
    
    ev["language"] = {
        "es": {
            "titulo": titulo_es,
            "subtitulo": subtitulo_es,
            "descripcion": desc_es,
            "lugar": lugar_es,
            "heroes": heroes_es
        },
        "en": {
            "titulo": titulo_en,
            "subtitulo": subtitulo_en,
            "descripcion": desc_en,
            "lugar": lugar_en,
            "heroes": heroes_en
        },
        "qu": {
            "titulo": titulo_qu,
            "subtitulo": subtitulo_qu,
            "descripcion": desc_qu,
            "lugar": lugar_qu,
            "heroes": heroes_qu
        }
    }
    return ev

def process_index(idx):
    tit_es = idx.get("titulo", "")
    sub_es = idx.get("subtitulo", "")
    desc_es = idx.get("descripcion", "")
    
    idx["language"] = {
        "es": {
            "titulo": tit_es,
            "subtitulo": sub_es,
            "descripcion": desc_es
        },
        "en": {
            "titulo": translate_es_to_en(tit_es),
            "subtitulo": translate_es_to_en(sub_es),
            "descripcion": translate_es_to_en(desc_es)
        },
        "qu": {
            "titulo": translate_es_to_qu(tit_es),
            "subtitulo": translate_es_to_qu(sub_es),
            "descripcion": translate_es_to_qu(desc_es)
        }
    }
    return idx

def process_chavin_step(st):
    tit_es = st.get("titulo", "")
    sub_es = st.get("subtitulo", "")
    desc_es = st.get("descripcion", "")
    
    st["language"] = {
        "es": {
            "titulo": tit_es,
            "subtitulo": sub_es,
            "descripcion": desc_es
        },
        "en": {
            "titulo": translate_es_to_en(tit_es),
            "subtitulo": translate_es_to_en(sub_es),
            "descripcion": translate_es_to_en(desc_es)
        },
        "qu": {
            "titulo": translate_es_to_qu(tit_es),
            "subtitulo": translate_es_to_qu(sub_es),
            "descripcion": translate_es_to_qu(desc_es)
        }
    }
    return st

def process_map_location(loc):
    nom_es = loc.get("nombre", "")
    desc_es = loc.get("descripcion", "")
    
    loc["language"] = {
        "es": {
            "nombre": nom_es,
            "descripcion": desc_es
        },
        "en": {
            "nombre": translate_es_to_en(nom_es),
            "descripcion": translate_es_to_en(desc_es)
        },
        "qu": {
            "nombre": translate_es_to_qu(nom_es),
            "descripcion": translate_es_to_qu(desc_es)
        }
    }
    return loc

def main():
    json_path = 'pantalla_3_terrorismo/src/data/terrorismo.json'
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    for org in data.get("organizaciones", []):
        nom_es = org.get("nombre", "")
        desc_es = org.get("descripcion", "")
        org["language"] = {
            "es": {"nombre": nom_es, "descripcion": desc_es},
            "en": {"nombre": translate_es_to_en(nom_es), "descripcion": translate_es_to_en(desc_es)},
            "qu": {"nombre": translate_es_to_qu(nom_es), "descripcion": translate_es_to_qu(desc_es)}
        }
        for idx in org.get("indices", []):
            process_index(idx)
        for ev in org.get("eventos", []):
            process_event(ev)
            
    for ev in data.get("cronologia_unificada", []):
        process_event(ev)
        
    for st in data.get("modulo_chavin", []):
        process_chavin_step(st)
        
    for loc in data.get("mapa_lugares", []):
        process_map_location(loc)
        
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        
    print("Successfully translated and updated terrorismo.json!")

if __name__ == '__main__':
    main()
