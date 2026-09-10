import json
import re

def translate_es_to_en(text):
    if not text or not isinstance(text, str):
        return text
    res = text
    
    # Common phrase replacements
    phrase_map = [
        ("Organización Terrorista Sendero Luminoso", "Shining Path Terrorist Organization"),
        ("Sendero Luminoso", "Shining Path"),
        ("Movimiento Revolucionario Túpac Amaru", "Túpac Amaru Revolutionary Movement"),
        ("Operación Chavín de Huántar", "Operation Chavín de Huántar"),
        ("Operación Victoria", "Operation Victoria"),
        ("Pacificación Nacional", "National Pacification"),
        ("Fuerzas Armadas del Perú", "Armed Forces of Peru"),
        ("Fuerzas Armadas", "Armed Forces"),
        ("Ejército del Perú", "Peruvian Army"),
        ("Policía Nacional del Perú", "National Police of Peru"),
        ("Policía Nacional", "National Police"),
        ("GEIN (Grupo Especial de Inteligencia)", "GEIN (Special Intelligence Group)"),
        ("GEIN", "GEIN (Special Intelligence Group)"),
        ("DINCOTE", "DINCOTE (Counter-Terrorism Directorate)"),
        ("Comités de Autodefensa", "Self-Defense Committees (CAD)"),
        ("Cárcel del pueblo", "People's Prison"),
        ("Cárceles del pueblo", "People's Prisons"),
        ("Fuga del Penal Castro Castro", "Castro Castro Prison Escape"),
        ("Fuga de Canto Grande", "Canto Grande Escape"),
        ("Residencia del Embajador de Japón", "Japanese Ambassador's Residence"),
        ("Crisis de los Rehenes", "Hostage Crisis"),
        ("Lucha armada", "Armed struggle"),
        ("Guerra popular", "People's war"),
        ("Captura de Abimael Guzmán", "Capture of Abimael Guzmán"),
        ("Caída de la cúpula", "Fall of the leadership"),
        ("Comité Central", "Central Committee"),
        ("Comisión Militar", "Military Commission"),
        ("Atentado de Tarata", "Tarata Bombing"),
        ("Matanza de Lucanamarca", "Lucanamarca Massacre"),
        ("Masacre de Soras", "Soras Massacre"),
        ("Asesinato de María Elena Moyano", "Assassination of María Elena Moyano"),
        ("Asesinato de Pedro Huilca", "Assassination of Pedro Huilca"),
        ("Asesinato de", "Assassination of"),
        ("Secuestro de", "Kidnapping of"),
        ("Captura de", "Capture of"),
        ("Emboscada en", "Ambush in"),
        ("Atentado en", "Attack in"),
        ("Atentado contra", "Attack against"),
        ("Valle de los Ríos Apurímac, Ene y Mantaro", "Apurímac, Ene, and Mantaro River Valley (VRAEM)"),
        ("Estado Peruano", "Peruvian State")
    ]
    for sp, en in phrase_map:
        res = re.sub(r'\b' + re.escape(sp) + r'\b', en, res, flags=re.IGNORECASE)
        
    term_subs = [
        ("orígenes ideológicos", "ideological origins"),
        ("antecedentes históricos", "historical background"),
        ("escalamiento de la violencia", "escalation of violence"),
        ("desarticulación de la cúpula", "dismantling of the leadership"),
        ("acuerdo de paz", "peace agreement"),
        ("lucha en el vraem", "struggle in the VRAEM"),
        ("frentes guerrilleros", "guerrilla fronts"),
        ("rescate militar", "military rescue"),
        ("túneles de infiltración", "infiltration tunnels"),
        ("comandos chavín de huántar", "Chavín de Huántar commandos"),
        ("héroes de la patria", "heroes of the homeland"),
        ("defensa de la soberanía", "defense of sovereignty"),
        ("pacificación del país", "pacification of the country"),
        ("años de violencia", "years of violence"),
        ("víctimas del terrorismo", "victims of terrorism"),
        ("fuerzas del orden", "security forces"),
        ("acciones armadas", "armed actions"),
        ("secuestros y extorsión", "kidnappings and extortion")
    ]
    for sp, en in term_subs:
        res = re.sub(r'\b' + re.escape(sp) + r'\b', en, res, flags=re.IGNORECASE)
        
    return res

def translate_es_to_qu(text):
    if not text or not isinstance(text, str):
        return text
    res = text
    
    phrase_map = [
        ("Sendero Luminoso", "Sendero Luminoso (Kanchaq Ñan)"),
        ("Movimiento Revolucionario Túpac Amaru", "Túpac Amaru Ayñinakuy Kuyuy (MRTA)"),
        ("Operación Chavín de Huántar", "Chavín de Huántar Operación"),
        ("Operación Victoria", "Victoria Operación"),
        ("Pacificación Nacional", "Mama Llaqta Qasikay"),
        ("Fuerzas Armadas", "Awqaq Suyu Fuerzakuna"),
        ("Ejército del Perú", "Perú Suyu Ejército"),
        ("Policía Nacional", "Policía Nacional"),
        ("Captura de Abimael Guzmán", "Abimael Guzmán Hap'iy"),
        ("Captura de", "Hap'iy:"),
        ("Atentado en", "Wañuchiy ruray:"),
        ("Emboscada en", "Pakasqa maqanakuy:"),
        ("Rescate de rehenes", "Hap'isqa runakuna kacharikuy"),
        ("Cárcel del pueblo", "Llaqtapa samay wasin"),
        ("Fuga de Canto Grande", "Canto Grande samay wasimanta ayqiy"),
        ("Estado Peruano", "Perú Suyu Estado"),
        ("Crisis de los Rehenes", "Rehenes Krisis"),
        ("Héroes de la Patria", "Patria Héroekuna")
    ]
    for sp, qu in phrase_map:
        res = re.sub(r'\b' + re.escape(sp) + r'\b', qu, res, flags=re.IGNORECASE)
        
    return res

def deep_translate(obj):
    if isinstance(obj, dict):
        # If object has standard translatable fields, create or update a language dict
        translatable_keys = ['titulo', 'subtitulo', 'descripcion', 'intro', 'texto', 'etiqueta', 'nombre', 'lugar', 'heroes', 'resumen', 'duracion', 'delito_central', 'resultado_estrategico', 'resultado', 'sintesis']
        has_translatable = any(k in obj and isinstance(obj[k], str) for k in translatable_keys)
        
        if has_translatable and 'language' not in obj:
            es_dict = {}
            en_dict = {}
            qu_dict = {}
            for k in translatable_keys:
                if k in obj and isinstance(obj[k], str):
                    val = obj[k]
                    es_dict[k] = val
                    en_dict[k] = translate_es_to_en(val)
                    qu_dict[k] = translate_es_to_qu(val)
            obj['language'] = {
                'es': es_dict,
                'en': en_dict,
                'qu': qu_dict
            }
        
        for k, v in obj.items():
            if k != 'language':
                deep_translate(v)
                
    elif isinstance(obj, list):
        for item in obj:
            deep_translate(item)

def main():
    json_path = 'pantalla_3_terrorismo/src/data/terrorismo.json'
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    deep_translate(data)
    
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        
    print("Successfully completed deep recursive translation of all terrorismo.json structures!")

if __name__ == '__main__':
    main()
