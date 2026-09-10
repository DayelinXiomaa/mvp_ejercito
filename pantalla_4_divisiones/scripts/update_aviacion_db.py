import json
import re

with open('pantalla_4_divisiones/src/data/unit_database.json', 'r', encoding='utf-8') as f:
    db = json.load(f)

def norm(s):
    return re.sub(r'[^a-z0-9]', '', s.lower())

entries = [
    {
        'names': ['Aviación del Ejército', 'AVIACIÓN DEL EJÉRCITO', 'Aviacion del Ejercito', 'AE', 'AE-DE', 'Gran División Aérea'],
        'escudo': '/assets/divisiones/aviacion_image1.jpeg',
        'sede': 'Base Aérea del Ejército, Callao',
        'alias': 'Gran División Aérea',
        'creacion': '1973',
        'resena': 'Sus antecedentes se remontan al Servicio de Aviación Militar, creado en 1919, primera organización aérea vinculada al Ejército del Perú. La actual unidad fue creada el 27 de marzo de 1973, mediante Decreto Supremo N.º 009-73/GU, como Grupo de Aviación Ligera del Ejército (GALE). Inició sus operaciones con ocho helicópteros Aérospatiale SA-318C Alouette II, incorporando posteriormente aeronaves de transporte y helicópteros Mi-8 y Mi-17. El 10 de junio de 1977, mediante Decreto Supremo N.º 009-77, cambió su denominación por Aviación del Ejército, siendo su primer jefe el general José Balta Vivanco. Participó activamente en el conflicto de Falso Paquisha de 1981 y el conflicto del Cenepa de 1995. Tiene como patrono al mayor EP Luis García Rojas. Su sede principal se encuentra en la Base Aérea del Ejército, Callao.',
        'language': {
            'es': {
                'nombre': 'Aviación del Ejército',
                'resena': 'Sus antecedentes se remontan al Servicio de Aviación Militar, creado en 1919, primera organización aérea vinculada al Ejército del Perú. La actual unidad fue creada el 27 de marzo de 1973, mediante Decreto Supremo N.º 009-73/GU, como Grupo de Aviación Ligera del Ejército (GALE). Inició sus operaciones con ocho helicópteros Aérospatiale SA-318C Alouette II, incorporando posteriormente aeronaves de transporte y helicópteros Mi-8 y Mi-17. El 10 de junio de 1977, mediante Decreto Supremo N.º 009-77, cambió su denominación por Aviación del Ejército, siendo su primer jefe el general José Balta Vivanco. Participó activamente en el conflicto de Falso Paquisha de 1981 y el conflicto del Cenepa de 1995. Tiene como patrono al mayor EP Luis García Rojas. Su sede principal se encuentra en la Base Aérea del Ejército, Callao.'
            },
            'en': {
                'nombre': 'Aviación del Ejército',
                'resena': 'Its origins date back to the Servicio de Aviación Militar, created in 1919 as the first aviation organization linked to the Peruvian Army. The current unit was established on March 27, 1973, by Supreme Decree No. 009-73/GU, as the Grupo de Aviación Ligera del Ejército (GALE). It began operations with eight Aérospatiale SA-318C Alouette II helicopters, later incorporating transport aircraft and Mi-8 and Mi-17 helicopters. On June 10, 1977, by Supreme Decree No. 009-77, its name was changed to Aviación del Ejército, with General José Balta Vivanco as its first commander. It actively participated in the Falso Paquisha Conflict of 1981 and the Cenepa Conflict of 1995. Its patron is Major EP Luis García Rojas. Its main headquarters is located at the Army Air Base, Callao.'
            },
            'qu': {
                'nombre': 'Aviación del Ejército',
                'resena': 'Ñawpaq kausayninmi 1919 watapi kamasqa Servicio de Aviación Militar nisqamanta qallarin, Ejército del Perú-pa ñawpaq aéreo organizacionnin hina. Kunan kaq unidadqa 27 de marzo de 1973 watapim kamarqan, Decreto Supremo N.º 009-73/GU nisqawan, Grupo de Aviación Ligera del Ejército (GALE) sutichasqa. Pusaq Aérospatiale SA-318C Alouette II helicópteros nisqakunawanmi operacionesninta qallarirqan; qhipamanqa transporte avionkunata hinallataq Mi-8, Mi-17 helicópterokunata chaskirqan. 10 de junio de 1977 watapim, Decreto Supremo N.º 009-77 nisqawan sutinta tikrarqan Aviación del Ejército nisqaman; ñawpaq kamachiqninmi karqan general José Balta Vivanco. 1981 watapi Falso Paquisha chʼaqwaypi, 1995 watapi Cenepa chʼaqwaypipas kʼuchillam yanapakurqan. Patrononmi kachkan mayor EP Luis García Rojas. Uma tiyananqa Callao llaqtapi Base Aérea del Ejército nisqapim kachkan.'
            }
        }
    },
    {
        'names': [
            'Batallón de Reconocimiento y Ataque «Crl Javier Da Cruz del Águila» N° 811',
            'Batallón de Reconocimiento y Ataque N° 811',
            'Batallón de Reconocimiento y Ataque N° 811 (Lima)',
            'BATALLÓN DE RECONOCIMIENTO Y ATAQUE N° 811',
            'Batallon de Reconocimiento y Ataque N 811',
            'Batallón de Reconocimiento y Ataque'
        ],
        'escudo': '/assets/divisiones/aviacion_image2.jpeg',
        'sede': 'Helipuerto de Chorrillos, Lima',
        'alias': 'Crl Javier Da Cruz del Águila',
        'creacion': '1991',
        'resena': 'El Batallón de Reconocimiento y Ataque N° 811, fue organizado dentro de la Aviación del Ejército para proporcionar exploración aérea, reconocimiento avanzado y apoyo de ataque a las fuerzas terrestres; Su consolidación se relaciona con la incorporación, desde 1991, de los helicópteros ligeros bimotores Agusta A109K, destinados a misiones de reconocimiento, enlace y ataque ligero. Posteriormente operó también helicópteros Aérospatiale Alouette II y Mil Mi-2, desarrollando capacidades de observación, dirección aérea y apoyo a las operaciones terrestres. Durante el conflicto del Cenepa de 1995, desplegó aeronaves y tripulaciones para efectuar reconocimiento, enlace, transporte de personal y apoyo a las fuerzas de la Cordillera del Cóndor. Tiene su sede en el helipuerto de Chorrillos, Lima.',
        'language': {
            'es': {
                'nombre': 'Batallón de Reconocimiento y Ataque «Crl Javier Da Cruz del Águila» N° 811',
                'resena': 'El Batallón de Reconocimiento y Ataque N° 811, fue organizado dentro de la Aviación del Ejército para proporcionar exploración aérea, reconocimiento avanzado y apoyo de ataque a las fuerzas terrestres; Su consolidación se relaciona con la incorporación, desde 1991, de los helicópteros ligeros bimotores Agusta A109K, destinados a misiones de reconocimiento, enlace y ataque ligero. Posteriormente operó también helicópteros Aérospatiale Alouette II y Mil Mi-2, desarrollando capacidades de observación, dirección aérea y apoyo a las operaciones terrestres. Durante el conflicto del Cenepa de 1995, desplegó aeronaves y tripulaciones para efectuar reconocimiento, enlace, transporte de personal y apoyo a las fuerzas de la Cordillera del Cóndor. Tiene su sede en el helipuerto de Chorrillos, Lima.'
            },
            'en': {
                'nombre': 'Batallón de Reconocimiento y Ataque «Crl Javier Da Cruz del Águila» N° 811',
                'resena': 'The Batallón de Reconocimiento y Ataque N° 811 was organized within the Aviación del Ejército to provide aerial reconnaissance, forward reconnaissance, and attack support to ground forces. Its consolidation is associated with the introduction, beginning in 1991, of Agusta A109K light twin-engine helicopters intended for reconnaissance, liaison, and light attack missions. It subsequently also operated Aérospatiale Alouette II and Mil Mi-2 helicopters, developing capabilities in aerial observation, forward air control, and support to ground operations. During the conflicto del Cenepa of 1995, it deployed aircraft and crews to perform reconnaissance, liaison, troop transport, and support to forces in the Cordillera del Cóndor. Its headquarters is located at the Chorrillos heliport, Lima.'
            },
            'qu': {
                'nombre': 'Batallón de Reconocimiento y Ataque «Crl Javier Da Cruz del Águila» N° 811',
                'resena': 'Batallón de Reconocimiento y Ataque N° 811 nisqaqa Aviación del Ejército ukhupi wakichisqa karqan, fuerzas terrestres nisqakunaman exploración aérea, reconocimiento avanzado hinallataq apoyo de ataque qunanpaq. Kallpachakuyninqa 1991 watamanta Agusta A109K iskay motorniyuq helicópteros ligeros chaskisqawanmi tupachkan; chaykunata reconocimiento, enlace hinallataq ataque ligero misiónkunapaq llamk\'achirqanku. Qhipamanqa Aérospatiale Alouette II hinallataq Mil Mi-2 helicópteros nisqakunatapas llamk\'achirqan; observación, dirección aérea hinallataq operaciones terrestres yanapay atiykunata wiñachispa. Conflicto del Cenepa de 1995 nisqapi aeronaves hinallataq tripulaciones-ta kacharqan, Cordillera del Cóndor-pi fuerzas nisqakunaman reconocimiento, enlace, personal astay hinallataq yanapay misiónkunata ruwanankupaq. Sedenqa helipuerto de Chorrillos, Lima llaqtapi kachkan.'
            }
        }
    },
    {
        'names': [
            'Batallón de Asalto y Transporte «Cap Julio Alberto Ponce Antúnez de Mayolo» N° 811',
            'Batallón de Asalto y Transporte N° 811',
            'BATALLÓN DE ASALTO Y TRANSPORTE N° 811',
            'Batallon de Asalto y Transporte N 811',
            'Batallón de Asalto y Transporte 811'
        ],
        'escudo': '/assets/divisiones/aviacion_image3.jpeg',
        'sede': 'Base Aérea del Ejército, Callao',
        'alias': 'Cap Julio Alberto Ponce Antúnez de Mayolo',
        'creacion': '1978',
        'resena': 'Fue creado el 1 de julio de 1978, teniendo como antecedente al Escuadrón de Transporte N.º 111, una de las primeras unidades orgánicas de la Aviación del Ejército y dotada de helicópteros Mi-8T. Mediante Decreto Supremo N.º 010-84-GU/DIPLANO del 17 de diciembre de 1984, fue reorganizado y, desde el 1 de enero de 1985, denominado Escuadrón de Asalto y Transporte N.º 811. En diciembre de 1998 incrementó su magnitud y adoptó la denominación de Batallón de Asalto y Transporte N.º 811. En el conflicto de Falso Paquisha de 1981 participó en la primera gran operación helitransportada de combate del Ejército, donde cayó heroicamente el capitán Julio Ponce Antúnez de Mayolo. Durante el conflicto del Cenepa de 1995 ejecutó misiones de ataque, transporte de tropas, abastecimiento y evacuación. Tiene su sede en la Base Aérea del Ejército, Callao.',
        'language': {
            'es': {
                'nombre': 'Batallón de Asalto y Transporte «Cap Julio Alberto Ponce Antúnez de Mayolo» N° 811',
                'resena': 'Fue creado el 1 de julio de 1978, teniendo como antecedente al Escuadrón de Transporte N.º 111, una de las primeras unidades orgánicas de la Aviación del Ejército y dotada de helicópteros Mi-8T. Mediante Decreto Supremo N.º 010-84-GU/DIPLANO del 17 de diciembre de 1984, fue reorganizado y, desde el 1 de enero de 1985, denominado Escuadrón de Asalto y Transporte N.º 811. En diciembre de 1998 incrementó su magnitud y adoptó la denominación de Batallón de Asalto y Transporte N.º 811. En el conflicto de Falso Paquisha de 1981 participó en la primera gran operación helitransportada de combate del Ejército, donde cayó heroicamente el capitán Julio Ponce Antúnez de Mayolo. Durante el conflicto del Cenepa de 1995 ejecutó misiones de ataque, transporte de tropas, abastecimiento y evacuación. Tiene su sede en la Base Aérea del Ejército, Callao.'
            },
            'en': {
                'nombre': 'Batallón de Asalto y Transporte «Cap Julio Alberto Ponce Antúnez de Mayolo» N° 811',
                'resena': 'It was created on July 1, 1978, tracing its lineage to the Escuadrón de Transporte N.º 111, one of the first organic units of the Aviación del Ejército, equipped with Mi-8T helicopters. By Supreme Decree N.º 010-84-GU/DIPLANO of December 17, 1984, it was reorganized and, effective January 1, 1985, designated Escuadrón de Asalto y Transporte N.º 811. In December 1998, it was expanded in size and adopted the designation Batallón de Asalto y Transporte N.º 811. During the conflicto de Falso Paquisha of 1981, it participated in the Army’s first major heliborne combat operation, during which Captain Julio Ponce Antúnez de Mayolo fell heroically. During the conflicto del Cenepa of 1995, it carried out attack, troop transport, resupply, and medical evacuation missions. Its headquarters is located at the Base Aérea del Ejército, Callao.'
            },
            'qu': {
                'nombre': 'Batallón de Asalto y Transporte «Cap Julio Alberto Ponce Antúnez de Mayolo» N° 811',
                'resena': '1 de julio de 1978 p\'unchawmi paqarichisqa karqan. Ñawpaqninmi Escuadrón de Transporte N.º 111 karqan, Aviación del Ejército-pa ñawpaq unidades orgánicas-ninmanta huknin, Mi-8T helicópteros-niyuq. 17 de diciembre de 1984 p\'unchaw Decreto Supremo N.º 010-84-GU/DIPLANO nisqawan musuqmanta wakichisqa karqan; 1 de enero de 1985 p\'unchawmanta Escuadrón de Asalto y Transporte N.º 811 sutita chaskirqan. Diciembre de 1998 killapi batallón sayayman wiñarquspa Batallón de Asalto y Transporte N.º 811 sutita chaskirqan. Conflicto de Falso Paquisha de 1981 nisqapi Ejército-pa ñawpaq hatun operación helitransportada de combate nisqapi yanaparqan; chaypim capitán Julio Ponce Antúnez de Mayolo qhari hina wañurqan. Conflicto del Cenepa de 1995 nisqapi ataque, tropa astay, abastecimiento hinallataq evacuación misiónkunata ruwarqan. Sedenqa Base Aérea del Ejército, Callao llaqtapi kachkan.'
            }
        }
    },
    {
        'names': [
            'Batallón de Asalto y Transporte «Tte Crl Néstor Gustavo Escudero Otero» N° 821',
            'Batallón de Asalto y Transporte N° 821',
            'Batallón de Asalto y Transportes N° 821',
            'BATALLÓN DE ASALTO Y TRANSPORTE N° 821',
            'Batallon de Asalto y Transporte N 821',
            'Batallón de Asalto y Transporte 821'
        ],
        'escudo': '/assets/divisiones/aviacion_image4.jpeg',
        'sede': 'Base Aérea del Ejército, Callao',
        'alias': 'Tte Crl Néstor Gustavo Escudero Otero',
        'creacion': '1978',
        'resena': 'El Batallón de Asalto y Transportes N° 821, fue creado el 1 de julio de 1978 como una de las unidades de transporte en helicópteros de la entonces recientemente organizada Aviación del Ejército. Inicialmente operó helicópteros Mi-8T y posteriormente recibió los Mi-17 y Mi-17-1B, incrementando sus capacidades de transporte táctico, asalto aéreo y apoyo de combate. A lo largo de su evolución pasó de escuadrón aéreo a unidad de magnitud batallón, adoptando definitivamente la denominación de Batallón de Asalto y Transporte N.º 821. Durante el conflicto del Cenepa de 1995, sus tripulaciones transportaron tropas, armamento, abastecimientos y evacuaron heridos en las difíciles condiciones de la cordillera del Cóndor. Tiene su sede en la Base Aérea del Ejército, Callao.',
        'language': {
            'es': {
                'nombre': 'Batallón de Asalto y Transporte «Tte Crl Néstor Gustavo Escudero Otero» N° 821',
                'resena': 'El Batallón de Asalto y Transportes N° 821, fue creado el 1 de julio de 1978 como una de las unidades de transporte en helicópteros de la entonces recientemente organizada Aviación del Ejército. Inicialmente operó helicópteros Mi-8T y posteriormente recibió los Mi-17 y Mi-17-1B, incrementando sus capacidades de transporte táctico, asalto aéreo y apoyo de combate. A lo largo de su evolución pasó de escuadrón aéreo a unidad de magnitud batallón, adoptando definitivamente la denominación de Batallón de Asalto y Transporte N.º 821. Durante el conflicto del Cenepa de 1995, sus tripulaciones transportaron tropas, armamento, abastecimientos y evacuaron heridos en las difíciles condiciones de la cordillera del Cóndor. Tiene su sede en la Base Aérea del Ejército, Callao.'
            },
            'en': {
                'nombre': 'Batallón de Asalto y Transporte «Tte Crl Néstor Gustavo Escudero Otero» N° 821',
                'resena': 'The Batallón de Asalto y Transportes N° 821 was created on July 1, 1978, as one of the helicopter transport units of the newly organized Aviación del Ejército. It initially operated Mi-8T helicopters and later received Mi-17 and Mi-17-1B aircraft, expanding its capabilities in tactical transport, air assault, and combat support. Throughout its development, it grew from an air squadron to a battalion-level unit, permanently adopting the designation Batallón de Asalto y Transporte N.º 821. During the conflicto del Cenepa of 1995, its crews transported troops, weapons, and supplies, and evacuated casualties under the challenging conditions of the Cordillera del Cóndor. Its headquarters is located at the Base Aérea del Ejército, Callao.'
            },
            'qu': {
                'nombre': 'Batallón de Asalto y Transporte «Tte Crl Néstor Gustavo Escudero Otero» N° 821',
                'resena': 'Batallón de Asalto y Transportes N° 821 nisqaqa 1 de julio de 1978 p\'unchawmi paqarichisqa karqan, chayraq wakichisqa Aviación del Ejército-pa helicópteros de transporte unidadninkunamanta huknin hina. Qallariypi Mi-8T helicópteros nisqakunawan llamk\'arqan; qhipamanqa Mi-17 hinallataq Mi-17-1B chaskispa transporte táctico, asalto aéreo hinallataq apoyo de combate atiykunata kallpacharqan. Wiñayninpi escuadrón aéreo sayaymanta batallón sayayman pasarqan, chaymanta Batallón de Asalto y Transporte N.º 821 sutita wiñaypaq chaskirqan. Conflicto del Cenepa de 1995 nisqapi tripulaciones-ninkuna tropakunata, armamentota, abastecimientokunata astarqanku, hinallataq Cordillera del Cóndor-pa sasa kausayninpi k\'irisqa runakunata hurqumurqanku. Sedenqa Base Aérea del Ejército, Callao llaqtapi kachkan.'
            }
        }
    },
    {
        'names': [
            'Batallón de Aviones «Cap Juan O\'Connor Guevara» N° 811',
            'Batallón de Aviones N° 811',
            'BATALLÓN DE AVIONES N° 811',
            'Batallon de Aviones N 811',
            'Batallón de Aviones'
        ],
        'escudo': '/assets/divisiones/aviacion_image5.jpeg',
        'sede': 'Base Aérea del Ejército, Callao',
        'alias': 'Cap Juan O\'Connor Guevara',
        'creacion': '1995',
        'resena': 'Sus antecedentes se remontan a 1981, cuando fue organizado el Escuadrón de Ala Fija para concentrar y operar los aviones pertenecientes a la Aviación del Ejército. El 5 de abril de 1995 incrementó su magnitud y fue constituido oficialmente como Batallón de Aviones N.º 811, unidad especializada en operaciones aéreas con aeronaves de ala fija. Su capacidad aumentó en diciembre de 1994 con la incorporación de los aviones de transporte táctico Antonov An-32B, empleados para trasladar tropas, carga y abastecimientos a grandes distancias. Posteriormente recibió aeronaves Beechcraft 1900D, Beechcraft 350, Cessna Citation 560XL y otros aviones de enlace, transporte ejecutivo y evacuación aeromédica. Tiene su sede en la Base Aérea del Ejército, Callao.',
        'language': {
            'es': {
                'nombre': 'Batallón de Aviones «Cap Juan O\'Connor Guevara» N° 811',
                'resena': 'Sus antecedentes se remontan a 1981, cuando fue organizado el Escuadrón de Ala Fija para concentrar y operar los aviones pertenecientes a la Aviación del Ejército. El 5 de abril de 1995 incrementó su magnitud y fue constituido oficialmente como Batallón de Aviones N.º 811, unidad especializada en operaciones aéreas con aeronaves de ala fija. Su capacidad aumentó en diciembre de 1994 con la incorporación de los aviones de transporte táctico Antonov An-32B, empleados para trasladar tropas, carga y abastecimientos a grandes distancias. Posteriormente recibió aeronaves Beechcraft 1900D, Beechcraft 350, Cessna Citation 560XL y otros aviones de enlace, transporte ejecutivo y evacuación aeromédica. Tiene su sede en la Base Aérea del Ejército, Callao.'
            },
            'en': {
                'nombre': 'Batallón de Aviones «Cap Juan O\'Connor Guevara» N° 811',
                'resena': 'Its origins date back to 1981, when the Escuadrón de Ala Fija was organized to centralize and operate aircraft assigned to the Aviación del Ejército. On April 5, 1995, it was expanded in size and officially established as the Batallón de Aviones N.º 811, a unit specialized in air operations using fixed-wing aircraft. Its operational capability expanded in December 1994 with the introduction of Antonov An-32B tactical transport aircraft, used to move troops, cargo, and supplies over long distances. It subsequently received Beechcraft 1900D, Beechcraft 350, Cessna Citation 560XL, and other aircraft for liaison, VIP transport, and aeromedical evacuation. Its headquarters is located at the Base Aérea del Ejército, Callao.'
            },
            'qu': {
                'nombre': 'Batallón de Aviones «Cap Juan O\'Connor Guevara» N° 811',
                'resena': 'Ñawpa kausayninmi 1981 wataman kutin, chay watapi Escuadrón de Ala Fija wakichisqa karqan Aviación del Ejército-pa avionninkunata huñuspa llamk\'achinanpaq. 5 de abril de 1995 p\'unchawmi batallón sayayman wiñarquspa Batallón de Aviones N.º 811 hina kamachiywan paqarichisqa karqan; kay unidadqa aeronaves de ala fija-wan operaciones aéreas ruwapi yachaqmi. Diciembre de 1994 killapi Antonov An-32B aviones de transporte táctico chaskispa atiykuna wiñarqan; chay avionkunawan tropakunata, cargata hinallataq abastecimientokunata karu llaqtakunaman astarqanku. Qhipamanqa Beechcraft 1900D, Beechcraft 350, Cessna Citation 560XL hinallataq huk aeronaves de enlace, transporte ejecutivo y evacuación aeromédica nisqakunata chaskirqan. Sedenqa Base Aérea del Ejército, Callao llaqtapi kachkan.'
            }
        }
    },
    {
        'names': [
            'Batallón de Servicios «Cap Augusto Gutiérrez Mendoza» N° 800',
            'Batallón de Servicios N° 800',
            'BATALLÓN DE SERVICIOS N° 800',
            'Batallon de Servicios N 800'
        ],
        'escudo': '/assets/divisiones/aviacion_image6.jpeg',
        'sede': 'Bellavista, Callao',
        'alias': 'Cap Augusto Gutiérrez Mendoza',
        'creacion': '1977',
        'resena': 'El Batallón de Servicios N° 800, fue organizado como unidad logística de la Aviación del Ejército para asegurar el sostenimiento de su comando, instalaciones y unidades de vuelo. Su evolución estuvo vinculada al crecimiento del antiguo Grupo de Aviación Ligera del Ejército y a su transformación, en 1977, en la actual Aviación del Ejército. Durante los conflictos de Falso Paquisha de 1981 y del Cenepa de 1995, contribuyó al sostenimiento logístico de las aeronaves, tripulaciones y destacamentos desplegados en la zona de operaciones. Actualmente proporciona apoyo administrativo, sanitario y logístico a la Aviación del Ejército y participa en acciones cívicas, campañas de salud y atención de emergencias. Tiene su sede en Bellavista, Callao.',
        'language': {
            'es': {
                'nombre': 'Batallón de Servicios «Cap Augusto Gutiérrez Mendoza» N° 800',
                'resena': 'El Batallón de Servicios N° 800, fue organizado como unidad logística de la Aviación del Ejército para asegurar el sostenimiento de su comando, instalaciones y unidades de vuelo. Su evolución estuvo vinculada al crecimiento del antiguo Grupo de Aviación Ligera del Ejército y a su transformación, en 1977, en la actual Aviación del Ejército. Durante los conflictos de Falso Paquisha de 1981 y del Cenepa de 1995, contribuyó al sostenimiento logístico de las aeronaves, tripulaciones y destacamentos desplegados en la zona de operaciones. Actualmente proporciona apoyo administrativo, sanitario y logístico a la Aviación del Ejército y participa en acciones cívicas, campañas de salud y atención de emergencias. Tiene su sede en Bellavista, Callao.'
            },
            'en': {
                'nombre': 'Batallón de Servicios «Cap Augusto Gutiérrez Mendoza» N° 800',
                'resena': 'The Batallón de Servicios N° 800 was organized as a logistical unit of the Aviación del Ejército to support its command element, facilities, and flight units. Its development was linked to the growth of the former Grupo de Aviación Ligera del Ejército and its transition, in 1977, into the present-day Aviación del Ejército. During the conflicto de Falso Paquisha of 1981 and the conflicto del Cenepa of 1995, it supported the logistical sustainment of aircraft, aircrews, and detachments deployed to the area of operations. It currently provides administrative, medical, and logistical support to the Aviación del Ejército and participates in civic actions, health campaigns, and disaster response. Its headquarters is located in Bellavista, Callao.'
            },
            'qu': {
                'nombre': 'Batallón de Servicios «Cap Augusto Gutiérrez Mendoza» N° 800',
                'resena': 'Batallón de Servicios N° 800 nisqaqa Aviación del Ejército-pa unidad logística-nin hina wakichisqa karqan, kamachikuyninta, instalaciones-ninkunata hinallataq unidades de vuelo nisqakunata yanapaspalla kananpaq. Wiñayninqa ñawpaq Grupo de Aviación Ligera del Ejército wiñasqanwan, 1977 watapi kunan Aviación del Ejército-man tikrasqanwanmi tupachkan. Conflicto de Falso Paquisha de 1981 hinallataq conflicto del Cenepa de 1995 nisqakunapi aeronaves, tripulaciones hinallataq zona de operaciones-man kachasqa destacamentos nisqakunata logística yanapaywan kallpacharqan. Kunanqa Aviación del Ejército-man apoyo administrativo, sanitario y logístico qun; acciones cívicas, campañas de salud hinallataq emergencias atención nisqakunapipas yanapan. Sedenqa Bellavista, Callao llaqtapi kachkan.'
            }
        }
    },
    {
        'names': [
            'Compañía Comando «Cap José Soto Merino» N° 800',
            'Compañía Comando N° 800',
            'COMPAÑÍA COMANDO N° 800',
            'Compania Comando N 800'
        ],
        'escudo': '/assets/divisiones/aviacion_image7.png',
        'sede': 'Base del Callao',
        'alias': 'Cap José Soto Merino',
        'creacion': '1977',
        'resena': 'Fue organizada para proporcionar apoyo directo al cuartel general de la Aviación del Ejército. Sus antecedentes están vinculados al crecimiento del Grupo de Aviación Ligera del Ejército, creado en 1973 y transformado en Aviación del Ejército en 1977. Durante los conflictos de Falso Paquisha de 1981 y del Cenepa de 1995, contribuyó al funcionamiento del puesto de comando y a la conducción de las unidades aéreas desplegadas. Su misión comprende facilitar el mando y control, la coordinación administrativa, el enlace interno, la instrucción del personal y la seguridad próxima del cuartel general. Tiene su sede en la Base del Callao.',
        'language': {
            'es': {
                'nombre': 'Compañía Comando «Cap José Soto Merino» N° 800',
                'resena': 'Fue organizada para proporcionar apoyo directo al cuartel general de la Aviación del Ejército. Sus antecedentes están vinculados al crecimiento del Grupo de Aviación Ligera del Ejército, creado en 1973 y transformado en Aviación del Ejército en 1977. Durante los conflictos de Falso Paquisha de 1981 y del Cenepa de 1995, contribuyó al funcionamiento del puesto de comando y a la conducción de las unidades aéreas desplegadas. Su misión comprende facilitar el mando y control, la coordinación administrativa, el enlace interno, la instrucción del personal y la seguridad próxima del cuartel general. Tiene su sede en la Base del Callao.'
            },
            'en': {
                'nombre': 'Compañía Comando «Cap José Soto Merino» N° 800',
                'resena': 'It was organized to provide direct support to the headquarters of the Aviación del Ejército. Its origins are linked to the growth of the Grupo de Aviación Ligera del Ejército, created in 1973 and transformed into the Aviación del Ejército in 1977. During the conflicto de Falso Paquisha of 1981 and the conflicto del Cenepa of 1995, it supported the operation of the command post and the command and control of deployed air units. Its mission includes facilitating command and control, administrative coordination, internal liaison, personnel training, and close security for the headquarters. Its headquarters is located at the Base del Callao.'
            },
            'qu': {
                'nombre': 'Compañía Comando «Cap José Soto Merino» N° 800',
                'resena': 'Aviación del Ejército-pa cuartel general-ninman chiqalla yanapay qunanpaqmi wakichisqa karqan. Ñawpa kausayninmi 1973 watapi paqarichisqa Grupo de Aviación Ligera del Ejército wiñasqanwan, 1977 watapi Aviación del Ejército-man tikrasqanwan tupachkan. Conflicto de Falso Paquisha de 1981 hinallataq conflicto del Cenepa de 1995 nisqakunapi puesto de comando llamk\'ananpaq, kachasqa unidades aéreas kamachisqa kananpaq yanaparqan. Misiónninmi mando y control, coordinación administrativa, enlace interno, personalpa instrucciónnin hinallataq cuartel general-pa qaylla seguridadnin facilitan. Sedenqa Base del Callao nisqapi kachkan.'
            }
        }
    },
    {
        'names': [
            'Compañía Policía Militar «Tco2 Victoriano Castillo Velarde» N° 800',
            'Compañía Policía Militar N° 800',
            'COMPAÑÍA POLICÍA MILITAR N° 800',
            'Compania Policia Militar N 800'
        ],
        'escudo': '/assets/divisiones/aviacion_image8.png',
        'sede': 'Base del Callao',
        'alias': 'Tco2 Victoriano Castillo Velarde',
        'creacion': '1975',
        'resena': 'La Compañía Policía Militar N° 800, fue organizada para proporcionar seguridad, protección y control militar a las instalaciones de la Aviación del Ejército. Sus antecedentes se encuentran vinculados con la ampliación orgánica de la Aviación del Ejército y el establecimiento permanente de su base en el Callao desde 1975. Asimismo, protege el puesto de comando, aeronaves, depósitos y áreas restringidas, además de apoyar la custodia y traslado de personal o material sensible. Actualmente es orgánica de la Aviación del Ejército y tiene su sede en la Base del Callao.',
        'language': {
            'es': {
                'nombre': 'Compañía Policía Militar «Tco2 Victoriano Castillo Velarde» N° 800',
                'resena': 'La Compañía Policía Militar N° 800, fue organizada para proporcionar seguridad, protección y control militar a las instalaciones de la Aviación del Ejército. Sus antecedentes se encuentran vinculados con la ampliación orgánica de la Aviación del Ejército y el establecimiento permanente de su base en el Callao desde 1975. Asimismo, protege el puesto de comando, aeronaves, depósitos y áreas restringidas, además de apoyar la custodia y traslado de personal o material sensible. Actualmente es orgánica de la Aviación del Ejército y tiene su sede en la Base del Callao.'
            },
            'en': {
                'nombre': 'Compañía Policía Militar «Tco2 Victoriano Castillo Velarde» N° 800',
                'resena': 'The Compañía Policía Militar N° 800 was organized to provide security, protection, and military control for the facilities of the Aviación del Ejército. Its origins are linked to the organizational expansion of the Aviación del Ejército and the permanent establishment of its base in Callao beginning in 1975. It also protects the command post, aircraft, depots, and restricted areas, while supporting the custody and movement of personnel or sensitive materiel. It is currently an organic unit of the Aviación del Ejército and is headquartered at the Base del Callao.'
            },
            'qu': {
                'nombre': 'Compañía Policía Militar «Tco2 Victoriano Castillo Velarde» N° 800',
                'resena': 'Compañía Policía Militar N° 800 nisqaqa Aviación del Ejército-pa instalaciones-ninkunaman seguridad, protección hinallataq control militar qunanpaqmi wakichisqa karqan. Ñawpa kausayninmi Aviación del Ejército orgánicamente mast\'arisqanwan, 1975 watamanta Callao llaqtapi base-nin wiñaypaq churakusqanwan tupachkan. Hinallataq puesto de comando-ta, aeronaves-ta, depósitos-ta hinallataq áreas restringidas nisqakunata waqaychan; personal utaq material sensible waqaychaypi chaymanta astaypipas yanapan. Kunanqa Aviación del Ejército-pa unidad orgánica-ninmi, sedenqa Base del Callao nisqapi kachkan.'
            }
        }
    },
    {
        'names': [
            'Compañía de Comunicaciones «SO1 Rubén de la Cruz Huarcaya» N° 800',
            'Compañía de Comunicaciones N° 800',
            'Compañía Comunicaciones N° 800',
            'COMPAÑÍA DE COMUNICACIONES N° 800',
            'Compania de Comunicaciones N 800'
        ],
        'escudo': '/assets/divisiones/aviacion_image9.png',
        'sede': 'Base del Callao',
        'alias': 'SO1 Rubén de la Cruz Huarcaya',
        'creacion': '1977',
        'resena': 'La Compañía de Comunicaciones N° 800, fue organizada para proporcionar comunicaciones y apoyo al mando de la Aviación del Ejército; las fuentes abiertas no precisan la resolución ni la fecha exacta de su creación. Su desarrollo acompañó la expansión de las unidades aéreas y la necesidad de mantener enlaces seguros entre el comando, las aeronaves, las bases y las fuerzas terrestres. Durante los conflictos de Falso Paquisha de 1981 y del Cenepa de 1995, las comunicaciones fueron esenciales para coordinar vuelos, evacuaciones, abastecimientos y apoyo de combate. Actualmente asegura los enlaces entre el puesto de comando y las unidades aéreas desplegadas, apoyando operaciones militares. Tiene su sede en la Base del Callao.',
        'language': {
            'es': {
                'nombre': 'Compañía de Comunicaciones «SO1 Rubén de la Cruz Huarcaya» N° 800',
                'resena': 'La Compañía de Comunicaciones N° 800, fue organizada para proporcionar comunicaciones y apoyo al mando de la Aviación del Ejército; las fuentes abiertas no precisan la resolución ni la fecha exacta de su creación. Su desarrollo acompañó la expansión de las unidades aéreas y la necesidad de mantener enlaces seguros entre el comando, las aeronaves, las bases y las fuerzas terrestres. Durante los conflictos de Falso Paquisha de 1981 y del Cenepa de 1995, las comunicaciones fueron esenciales para coordinar vuelos, evacuaciones, abastecimientos y apoyo de combate. Actualmente asegura los enlaces entre el puesto de comando y las unidades aéreas desplegadas, apoyando operaciones militares. Tiene su sede en la Base del Callao.'
            },
            'en': {
                'nombre': 'Compañía de Comunicaciones «SO1 Rubén de la Cruz Huarcaya» N° 800',
                'resena': 'The Compañía de Comunicaciones N° 800 was organized to provide communications and command support to the Aviación del Ejército; open sources do not specify the resolution or exact date of its creation. Its development accompanied the expansion of the air units and the need to maintain secure links among the command, aircraft, bases, and ground forces. During the conflicto de Falso Paquisha of 1981 and the conflicto del Cenepa of 1995, communications were essential for coordinating flights, evacuations, resupply, and combat support. It currently maintains communications links between the command post and deployed air units in support of military operations. Its headquarters is located at the Base del Callao.'
            },
            'qu': {
                'nombre': 'Compañía de Comunicaciones «SO1 Rubén de la Cruz Huarcaya» N° 800',
                'resena': 'Compañía de Comunicaciones N° 800 nisqaqa Aviación del Ejército-man comunicaciones hinallataq mando yanapay qunanpaqmi wakichisqa karqan; fuentes abiertas nisqakunaqa paqarichisqa resoluciónninta nitaq p\'unchawninta sut\'ita willankuchu. Wiñayninqa unidades aéreas mast\'arisqanwan, kamachikuq, aeronaves, bases hinallataq fuerzas terrestres ukhupi allin waqaychasqa enlaces kananwanmi tupachkan. Conflicto de Falso Paquisha de 1981 hinallataq conflicto del Cenepa de 1995 nisqakunapi comunicacionesqa vuelos, evacuaciones, abastecimientos hinallataq apoyo de combate kamachinapaq ancha allin karqan. Kunanqa puesto de comando hinallataq kachasqa unidades aéreas ukhupi enlaces nisqakunata allinchaykuspa operaciones militares-ta yanapan. Sedenqa Base del Callao nisqapi kachkan.'
            }
        }
    }
]

for item in entries:
    primary_name = item['names'][0]
    payload = {
        'nombre': primary_name,
        'escudo': item['escudo'],
        'sede': item['sede'],
        'alias': item.get('alias', ''),
        'creacion': item.get('creacion', ''),
        'resena': item['resena'],
        'language': item['language']
    }
    for n in item['names']:
        db[n] = payload
        db[norm(n)] = payload

with open('pantalla_4_divisiones/src/data/unit_database.json', 'w', encoding='utf-8') as f:
    json.dump(db, f, indent=2, ensure_ascii=False)

print('Updated unit_database.json successfully!')
