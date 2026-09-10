import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const file = path.join(__dirname, '../src/data/divisiones.json');
const d = JSON.parse(fs.readFileSync(file, 'utf8'));

const updates = {
  'II-DE': 'La II División de Ejército fue creada el 15 de diciembre de 1961 en Lima, con la denominación de Segunda Región Militar.\n\nInicialmente compartió instalaciones con el antiguo Ministerio de Guerra. En 1975 participó en el restablecimiento del orden interno durante los acontecimientos conocidos como el “Limazo”. En 1987, su comando fue trasladado al Fuerte Militar General de División Rafael Hoyos Rubio, en el distrito del Rímac. En 2003 fue denominada Región Militar del Centro y posteriormente recuperó su actual denominación. Al 2026, tiene su sede en el Rímac, Lima, desde donde conduce y coordina unidades desplegadas principalmente en la región central del país.',
  
  'III-DE': 'La III División de Ejército tuvo sus inicios como Tercera Región Militar creada el 15 de diciembre de 1961 y activada en 1962. Desde sus inicios tuvo la responsabilidad de organizar y conducir las fuerzas terrestres encargadas de la defensa del sur del Perú. Entre 2002 y 2012 fue denominada Región Militar del Sur. Posteriormente, en el marco de la reorganización institucional, adoptó nuevamente el nombre de III División de Ejército. Al 2026, su sede se encuentra en el Fuerte Bolognesi, distrito de Cerro Colorado, Arequipa. Su ámbito de responsabilidad comprende principalmente Arequipa, Cusco, Madre de Dios, Apurímac, Moquegua, Tacna y Puno, sectores estratégicos del sur del territorio nacional.',
  
  'IV-DE': 'La IV División de Ejército fue creada el 13 de marzo de 2008 como Región Militar del Valle de los Ríos Apurímac y Ene. Su establecimiento respondió a la necesidad de fortalecer la presencia del Estado y enfrentar el terrorismo y el tráfico ilícito de drogas.\n\nPosteriormente, su ámbito se amplió al valle del río Mantaro, conformando la zona denominada VRAEM. En 2013 adoptó su actual denominación de IV División de Ejército. Al 2026, su sede se encuentra en el Fuerte Pichari, distrito de Pichari, provincia de La Convención, Cusco. Su responsabilidad comprende sectores de parte de  Cusco, Ayacucho, Junín, Huancavelica y Apurímac.',
  
  'V-DE': 'La V División de Ejército fue creada el 27 de junio de 1961 con la denominación de Quinta Región Militar.\n\nSus antecedentes históricos se relacionan con las unidades que participaron en la defensa de la Amazonía y en la Campaña Militar de 1941. En diciembre de 2002 fue reorganizada como Región Militar Oriental. Posteriormente, en 2013, adoptó su actual denominación de V División de Ejército. Su misión está vinculada con la defensa de las fronteras amazónicas y las operaciones en terreno selvático y fluvial. Al 2026, su sede se encuentra en Iquitos, Loreto, y su ámbito de responsabilidad comprende principalmente la Amazonía nororiental y las fronteras con Ecuador, Colombia y Brasil.'
};

d.divisiones.forEach(div => {
  if (updates[div.id]) {
    div.resena = updates[div.id];
    if (!div.language) div.language = {};
    if (!div.language.es) div.language.es = { nombre: div.nombre, resena: '' };
    div.language.es.resena = updates[div.id];
    console.log('Updated:', div.id);
  }
});

fs.writeFileSync(file, JSON.stringify(d, null, 2), 'utf8');
console.log('Successfully updated divisiones.json with exact Spanish reseñas');
