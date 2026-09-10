import fs from 'fs';

const filePath = 'src/data/terrorismo.json';
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// 1. Sendero Luminoso Topic Titles
const slTitles = [
  {
    id: 'sl-p2',
    es: 'ORÍGENES IDEOLÓGICOS Y EVOLUCIÓN ORGÁNICA',
    en: 'IDEOLOGICAL ORIGINS AND ORGANIZATIONAL EVOLUTION',
    qu: 'YUYAYPA QALLARIYNIN HINASPA KURKU WIÑAYNIN'
  },
  {
    id: 'sl-p3',
    es: 'PRIMERAS ACCIONES E INICIO DE LA LUCHA ARMADA',
    en: 'FIRST ACTIONS AND BEGINNING OF THE ARMED STRUGGLE',
    qu: 'ÑAWPAQ RUWAYKUNA HINASPA MAQANAKUYPA QALLARIYNIN'
  },
  {
    id: 'sl-p4',
    es: 'CAPTURAS DE MANDOS Y CAÍDA DE ABIMAEL GUZMÁN',
    en: 'CAPTURE OF COMMANDERS AND FALL OF ABIMAEL GUZMÁN',
    qu: 'UMALLIQKUNA HAP\'ISQA HINASPA ABIMAEL GUZMÁN URMASQAN'
  },
  {
    id: 'sl-p5',
    es: 'ACUERDO DE PAZ Y FRACTURA DE LA ORGANIZACIÓN',
    en: 'PEACE ACCORD AND FRACTURE OF THE ORGANIZATION',
    qu: 'HAWKAYAY RIMANAKUY HINASPA ORGANIZACIONPA RAKIKUYNIN'
  },
  {
    id: 'sl-p6',
    es: 'ACCIONAR DEL COMITÉ REGIONAL HUALLAGA- FACCIÓN “ARTEMIO”',
    en: 'ACTIONS OF THE HUALLAGA REGIONAL COMMITTEE - “ARTEMIO” FACTION',
    qu: 'COMITÉ REGIONAL HUALLAGAPA RUWAYNIN - “ARTEMIO” T\'AQA'
  },
  {
    id: 'sl-p7',
    es: 'ACCIONAR EN EL VRAEM- FACCIÓN “PROSEGUIR” Y OPERACIONES MILITARES',
    en: 'ACTIONS IN THE VRAEM - “PROSEGUIR” FACTION AND MILITARY OPERATIONS',
    qu: 'VRAEM SUYUPI RUWAYNINKUNA - “PROSEGUIR” T\'AQA HINASPA MILITAR OPERACIONESKUNA'
  },
  {
    id: 'sl-p8',
    es: 'EL BRAZO POLÍTICO Y DISOLUCIÓN- MOVADEF (2000 -2024 )',
    en: 'THE POLITICAL ARM AND DISSOLUTION - MOVADEF (2000 - 2024)',
    qu: 'POLÍTICA KALLPA HINASPA CHINKACHISQA - MOVADEF (2000 - 2024)'
  }
];

slTitles.forEach((st) => {
  const top = data.sendero_luminoso.topics.find((t) => t.id === st.id);
  if (top) {
    top.title = {
      es: st.es,
      en: st.en,
      qu: st.qu
    };
  }
});

// 2. MRTA Topic Titles
const mrtaTitles = [
  {
    id: 'mrta-p10',
    es: 'ORÍGENES, IDEOLOGÍA Y ESTRUCTURA',
    en: 'ORIGINS, IDEOLOGY AND STRUCTURE',
    qu: 'QALLARIY, YUYAY HINASPA RUWAYNINKUNA'
  },
  {
    id: 'mrta-p11',
    es: 'INICIO DEL ACCIONAR ARMADO Y SECUESTROS',
    en: 'BEGINNING OF ARMED ACTIONS AND KIDNAPPINGS',
    qu: 'ARMASWAN MAQANAKUY QALLARIY HINASPA RUNAKUNA HAP\'IY'
  },
  {
    id: 'mrta-p12',
    es: 'PRIMERAS ACCIONES E INVASIONES URBANAS',
    en: 'FIRST ACTIONS AND URBAN INCURSIONS',
    qu: 'ÑAWPAQ RUWAYKUNA HINASPA LLAQTAKUNAPI MAQANAKUY'
  },
  {
    id: 'mrta-p13',
    es: 'FUGA DE CANTO GRANDE Y RECAPTURA DE MANDOS',
    en: 'CANTO GRANDE ESCAPE AND RECAPTURE OF LEADERS',
    qu: 'CANTO GRANDEMANTA AYQIKUY HINASPA UMALLIQKUNA YAPAMANTA HAP\'ISQA'
  },
  {
    id: 'mrta-p14',
    es: 'CRISIS DE LOS REHENES EN LA EMBAJADA DEL JAPÓN',
    en: 'JAPANESE EMBASSY HOSTAGE CRISIS',
    qu: 'JAPÓN EMBAJADAPI REHENES LLAKI PACHA'
  },
  {
    id: 'mrta-p15',
    es: 'OPERACIÓN CHAVÍN DE HUÁNTAR',
    en: 'OPERATION CHAVÍN DE HUÁNTAR',
    qu: 'CHAVÍN DE HUÁNTAR OPERACIÓN'
  }
];

mrtaTitles.forEach((mt) => {
  const top = data.mrta.topics.find((t) => t.id === mt.id);
  if (top) {
    top.title = {
      es: mt.es,
      en: mt.en,
      qu: mt.qu
    };
  }
});

// 3. Operaciones Titles (all 43 operations)
const opTranslations = {
  'op-p18': {
    en: 'OPERATION “TEMPESTAD” - 1987',
    qu: '“TEMPESTAD” OPERACIÓN - 1987'
  },
  'op-p19': {
    en: 'RECOVERY OF VILCASHUAMÁN - 1988',
    qu: 'VILCASHUAMÁN KUTICHIY - 1988'
  },
  'op-p20': {
    en: 'OPERATION “CENTURIÓN” - 1990',
    qu: '“CENTURIÓN” OPERACIÓN - 1990'
  },
  'op-p21': {
    en: 'TERRITORIAL RECOVERY OF THE MANTARO FRONT - 1990',
    qu: 'FRENTE MANTARO SUYUTA KUTICHIY - 1990'
  },
  'op-p22': {
    en: 'BATTLE OF PAZOS - 1990',
    qu: 'PAZOS MAQANAKUY - 1990'
  },
  'op-p23': {
    en: 'OPERATION “CENTURIÓN ALFA” - 1990',
    qu: '“CENTURIÓN ALFA” OPERACIÓN - 1990'
  },
  'op-p24': {
    en: 'RESCUE OF ASHÁNINKA POPULATION IN PUERTO OCOPA - 1992',
    qu: 'PUERTO OCOPAPI ASHÁNINKA RUNAKUNATA QISPICHIY - 1992'
  },
  'op-p25': {
    en: 'OPERATION “MUDANZA I” - 1992',
    qu: '“MUDANZA I” OPERACIÓN - 1992'
  },
  'op-p26': {
    en: 'OPERATION “VICTORIA” - 1992',
    qu: '“VICTORIA” OPERACIÓN - 1992'
  },
  'op-p28': {
    en: 'BATTLE OF LOS MOLINOS - 1989',
    qu: 'LOS MOLINOS MAQANAKUY - 1989'
  },
  'op-p29': {
    en: 'OPERATIONS PLAN “VICUS” – 1990-1992',
    qu: '“VICUS” OPERACIONES PLAN – 1990-1992'
  },
  'op-p30': {
    en: 'RESCUE OPERATION OF SÍSTERO GARCÍA AND NEUTRALIZATION OF MRTA COLUMN - 1992',
    qu: 'SÍSTERO GARCÍA QISPICHIY HINASPA MRTA T\'AQA SAYACHIY OPERACIÓN - 1992'
  },
  'op-p31': {
    en: 'OPERATION AGAINST SOUTH-EAST GUERRILLA FRONT “PEDRO VILCAPAZA” - 1992',
    qu: 'SUR ORIENTAL “PEDRO VILCAPAZA” T\'AQAPA CONTRANPI OPERACIÓN - 1992'
  },
  'op-p32': {
    en: 'BATTLE OF SACHIRIO-PALOMAR - 1992',
    qu: 'SACHIRIO-PALOMAR MAQANAKUY - 1992'
  },
  'op-p33': {
    en: 'OPERATION “CAFÉ” - RECAPTURE OF VÍCTOR POLAY CAMPOS - 1992',
    qu: '“CAFÉ” OPERACIÓN - VÍCTOR POLAY CAMPOS YAPAMANTA HAP\'ISQA - 1992'
  },
  'op-p35': {
    en: 'OPERATION “TARAPACÁ” VENENILLO, HUÁNUCO - 1993',
    qu: '“TARAPACÁ” OPERACIÓN VENENILLO, HUÁNUCO - 1993'
  },
  'op-p36': {
    en: 'OPERATION “ARIES” - 1994',
    qu: '“ARIES” OPERACIÓN - 1994'
  },
  'op-p37': {
    en: 'JOINT OPERATION BCS N° 313 - PNP - 1997',
    qu: 'KUSKA OPERACIÓN BCS N° 313 - PNP - 1997'
  },
  'op-p38': {
    en: 'OPERATION “MORADO 56” SITULLY, HUALLAGA - 1998',
    qu: '“MORADO 56” OPERACIÓN SITULLY, HUALLAGA - 1998'
  },
  'op-p39': {
    en: 'OPERATION “CERCO” - CAPTURE OF FELICIANO - 1999',
    qu: '“CERCO” OPERACIÓN - FELICIANO HAP\'ISQA - 1999'
  },
  'op-p40': {
    en: 'BATTLE OF ALTO HUAMUCO - MADRE MÍA - 2000',
    qu: 'ALTO HUAMUCO MAQANAKUY - MADRE MÍA - 2000'
  },
  'op-p41': {
    en: 'OPERATION “CREPÚSCULO” - CAPTURE OF ARTEMIO - 2012',
    qu: '“CREPÚSCULO” OPERACIÓN - ARTEMIO HAP\'ISQA - 2012'
  },
  'op-libertad-2012': {
    en: 'OPERATION “LIBERTAD” - 2012',
    qu: '“LIBERTAD” OPERACIÓN - 2012'
  },
  'op-p43': {
    en: 'OPERATION IN PAMPA HERMOSA - 1992',
    qu: 'PAMPA HERMOSAPI OPERACIÓN - 1992'
  },
  'op-p44': {
    en: 'OPERATION “RIOJA” - 1993',
    qu: '“RIOJA” OPERACIÓN - 1993'
  },
  'op-p45': {
    en: 'CAPTURE OF LUCERO CUMPA - 1993',
    qu: 'LUCERO CUMPA HAP\'ISQA - 1993'
  },
  'op-p46': {
    en: 'BATTLE OF PAMPA AZÁNGARO - 1996',
    qu: 'PAMPA AZÁNGARO MAQANAKUY - 1996'
  },
  'op-p47': {
    en: 'OPERATION “CHAVÍN DE HUÁNTAR” - 1997',
    qu: '“CHAVÍN DE HUÁNTAR” OPERACIÓN - 1997'
  },
  'op-p49': {
    en: 'OPERATION “CAMALEÓN” - 2013',
    qu: '“CAMALEÓN” OPERACIÓN - 2013'
  },
  'op-p50': {
    en: 'OPERATION “CUNSHIRENI 2014” - 2014',
    qu: '“CUNSHIRENI 2014” OPERACIÓN - 2014'
  },
  'op-p51': {
    en: 'OPERATION “RENÁN” AND “YURI” - 2015',
    qu: '“RENÁN” HINASPA “YURI” OPERACIÓN - 2015'
  },
  'op-p52': {
    en: 'OPERATION “TORNADO 2016” - 2016',
    qu: '“TORNADO 2016” OPERACIÓN - 2016'
  },
  'op-p53': {
    en: 'OPERATION “TENAZ” - 2017',
    qu: '“TENAZ” OPERACIÓN - 2017'
  },
  'op-p54': {
    en: 'OPERATION AGAINST “BASILIO” - 2018',
    qu: '“BASILIO”PA CONTRANPI OPERACIÓN - 2018'
  },
  'op-p55': {
    en: 'OPERATION AGAINST “MIGUEL BOMBA” - 2019',
    qu: '“MIGUEL BOMBA”PA CONTRANPI OPERACIÓN - 2019'
  },
  'op-p56': {
    en: 'OPERATION “OJO DEL ÁGUILA” - 2020',
    qu: '“OJO DEL ÁGUILA” OPERACIÓN - 2020'
  },
  'op-p57': {
    en: 'OPERATION “PATRIOTA” - 2022',
    qu: '“PATRIOTA” OPERACIÓN - 2022'
  },
  'op-p58': {
    en: 'MAYAPO INTEGRATED OPERATION - 2023',
    qu: 'MAYAPOPI KUSKA OPERACIÓN - 2023'
  },
  'op-leonidas-2024': {
    en: 'OPERATION “LEÓNIDAS” - 2024',
    qu: '“LEÓNIDAS” OPERACIÓN - 2024'
  },
  'op-rayo-2025': {
    en: 'OPERATION “RAYO” - 2025',
    qu: '“RAYO” OPERACIÓN - 2025'
  },
  'op-zulu-2025': {
    en: 'OPERATION “ZULU” - 2025',
    qu: '“ZULU” OPERACIÓN - 2025'
  },
  'op-pampa-aurora-2026': {
    en: 'OPERATION “PAMPA AURORA” - 2026',
    qu: '“PAMPA AURORA” OPERACIÓN - 2026'
  },
  'op-quinones-2026': {
    en: 'OPERATION “QUIÑONES” - 2026',
    qu: '“QUIÑONES” OPERACIÓN - 2026'
  }
};

data.operaciones.items.forEach((op) => {
  const trans = opTranslations[op.id];
  if (trans) {
    op.title.en = trans.en;
    op.title.qu = trans.qu;
  }
});

// Write formatted JSON
fs.writeFileSync(filePath, JSON.stringify(data, null, 4), 'utf8');
console.log('Successfully updated translations in ' + filePath);
