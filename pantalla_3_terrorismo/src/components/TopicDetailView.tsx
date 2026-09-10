import React, { useState, useEffect } from 'react';
import { useTerrorismo, type PhotoItem } from '../context/TerrorismoContext';
import { useI18n } from '../context/I18nContext';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  FileText,
  Layers,
  Image as ImageIcon,
  Info,
} from 'lucide-react';

export const TopicDetailView: React.FC = () => {
  const {
    data,
    currentSection,
    setCurrentSection,
    selectedTopicIndex,
    navigateTopic,
    setFullscreenImage,
  } = useTerrorismo();
  const { t, language } = useI18n();

  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  const isSendero = currentSection === 'SENDERO_LUMINOSO';
  const sectionData = isSendero ? data.sendero_luminoso : data.mrta;
  const topics = sectionData?.topics || [];
  const activeTopic = topics[selectedTopicIndex] || topics[0];

  // Reset active photo when topic or section changes
  useEffect(() => {
    setActivePhotoIndex(0);
  }, [selectedTopicIndex, currentSection]);

  if (!activeTopic) {
    return (
      <div className="p-8 text-center text-white">
        <p>No se encontraron datos para este tema.</p>
        <button
          onClick={() => setCurrentSection('HUB')}
          className="mt-4 px-6 py-2 bg-emerald-600 rounded-full font-bold"
        >
          Volver al Menú
        </button>
      </div>
    );
  }

  const activeTitle = activeTopic.title?.[language] || activeTopic.title?.es || '';
  const activeContent = activeTopic.content?.[language] || activeTopic.content?.es || '';

  // Get only real photos (no slide_image in the gallery)
  const photos: PhotoItem[] = (activeTopic.photos && activeTopic.photos.length > 0)
    ? activeTopic.photos
    : (activeTopic.embedded_images || []).map((img, i) => ({
      url: img,
      alt: `Fotografía ${i + 1} de ${activeTitle}`,
      description: {
        es: `Fotografía histórica ${i + 1}`,
        en: `Historical photograph ${i + 1}`,
        qu: `Fotografía ${i + 1}`,
      },
    }));

  const currentPhoto = photos[activePhotoIndex] || photos[0];
  const photoDescription = currentPhoto?.description?.[language] || currentPhoto?.description?.es || currentPhoto?.alt || '';

  return (
    <div className="w-full h-full flex flex-col justify-between p-2 md:p-4 overflow-hidden select-none animate-fade-in">


      {/* Contenedor Principal: 2 Columnas (Visor de Fotos Interactivo con Descripción + Texto Justificado) */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden">
        {/* Columna Izquierda (5 cols): Visor Interactivo de Fotografías con Pie de Foto */}
        <div className="lg:col-span-5 bg-slate-950/80 rounded-3xl border border-emerald-500/20 p-4 flex flex-col justify-between overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5" />
              {t.photo_badge || 'Fotografía Histórica'}
            </span>
            {photos.length > 0 && (
              <span className="text-[9px] text-slate-400 font-bold bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
                {activePhotoIndex + 1} {t.of_photos || 'de'} {photos.length}
              </span>
            )}
          </div>

          {/* Imagen Principal en Grande con Zoom y Navegación */}
          {currentPhoto ? (
            <div
              onClick={() =>
                setFullscreenImage({
                  url: currentPhoto.url,
                  alt: currentPhoto.alt,
                  description: photoDescription,
                })
              }
              className="relative flex-1 min-h-0 bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden group cursor-pointer flex items-center justify-center p-2 shadow-inner hover:border-emerald-400 transition-colors"
            >
              <img
                key={currentPhoto.url}
                src={currentPhoto.url}
                alt={currentPhoto.alt || activeTitle}
                className="w-full h-full object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300 animate-fade-in"
              />

              {/* Botones de cambio de foto dentro de la imagen si hay más de una */}
              {photos.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivePhotoIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
                    }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-950/80 text-white hover:bg-emerald-600 border border-slate-700 flex items-center justify-center opacity-80 hover:opacity-100 transition-all touch-active"
                    title={t.prev_photo_title || 'Foto anterior'}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivePhotoIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-950/80 text-white hover:bg-emerald-600 border border-slate-700 flex items-center justify-center opacity-80 hover:opacity-100 transition-all touch-active"
                    title={t.next_photo_title || 'Siguiente foto'}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}

              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-bold text-xs backdrop-blur-xs pointer-events-none">
                <ZoomIn className="w-5 h-5 text-emerald-300" />
                <span>{t.tap_to_zoom || 'Toque para pantalla completa'}</span>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-slate-900/50 rounded-2xl text-slate-500 text-xs">
              {t.no_photos || 'Sin fotografías disponibles'}
            </div>
          )}

          {/* Pie de Foto / Descripción de la Imagen Activa */}
          {currentPhoto && (
            <div className="mt-2.5 px-3 py-2 rounded-xl bg-slate-900/95 border border-slate-800 text-xs flex items-start gap-2 text-slate-200">
              <Info className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <p className="leading-snug font-medium text-[11px] md:text-xs">
                {photoDescription}
              </p>
            </div>
          )}

          {/* Selector de Miniaturas de Fotografías (Solo fotos, sin diapositiva) */}
          {photos.length > 1 && (
            <div className="mt-2.5 pt-2.5 border-t border-slate-900 flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1 mr-1 flex-shrink-0">
                <Layers className="w-3 h-3 text-emerald-400" /> {t.gallery_label || 'Galería:'}
              </span>
              {photos.map((item, i) => (
                <button
                  key={i}
                  onClick={() => setActivePhotoIndex(i)}
                  className={`relative rounded-xl border p-1 flex-shrink-0 overflow-hidden cursor-pointer group shadow-sm transition-all min-h-[48px] min-w-[56px] flex flex-col items-center justify-center ${activePhotoIndex === i
                    ? 'border-emerald-400 bg-emerald-950/60 ring-2 ring-emerald-500/50 scale-105'
                    : 'border-slate-800 bg-slate-900/90 hover:border-slate-600 opacity-70 hover:opacity-100'
                    }`}
                  title={item.alt}
                >
                  <img
                    src={item.url}
                    alt={item.alt}
                    className="w-10 h-7 object-contain rounded"
                  />
                  <span className="text-[8px] font-bold text-slate-300 mt-0.5 block truncate max-w-[50px]">
                    {t.photo_prefix || 'Foto'} {i + 1}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Columna Derecha (7 cols): Lectura Detallada Trilingüe con Párrafos Separados */}
        <div className="lg:col-span-7 bg-slate-950/90 rounded-3xl border border-emerald-500/20 p-6 md:p-8 flex flex-col justify-between overflow-y-auto kiosk-scroll shadow-2xl">
          <div className="space-y-4">
            <div className="border-b border-emerald-500/20 pb-3 flex items-center justify-between">
              <h4 className="text-[16px] md:text-[20px] font-black text-emerald-300 flex items-center gap-2 leading-tight">
                <FileText className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                {activeTitle}
              </h4>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                {language === 'es' ? 'Español' : language === 'en' ? 'English' : 'Quechua'}
              </span>
            </div>

            {/* Párrafos Justificados sin sangría */}
            <div className="space-y-4 text-slate-100 text-sm md:text-[0.8rem] font-medium leading-relaxed text-justify">
              {activeContent.split('\n\n').filter(Boolean).map((paragraph, pIdx) => (
                <p key={pIdx}>
                  {paragraph.trim()}
                </p>
              ))}
            </div>
          </div>

          {/* Navegación Anterior / Siguiente inferior */}
          <div className="mt-6 pt-4 border-t border-slate-900 flex items-center justify-between gap-4 flex-shrink-0">
            <button
              onClick={() => navigateTopic('prev')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 font-extrabold text-xs transition-all border border-slate-800 min-h-[44px] touch-active"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{t.btn_prev || 'Anterior'}</span>
            </button>

            <span className="text-xs text-slate-400 font-bold">
              {selectedTopicIndex + 1} / {topics.length}
            </span>

            <button
              onClick={() => navigateTopic('next')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-700 to-green-600 text-white font-extrabold text-xs transition-all hover:brightness-110 shadow-lg min-h-[44px] touch-active"
            >
              <span>{t.btn_next || 'Siguiente'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
