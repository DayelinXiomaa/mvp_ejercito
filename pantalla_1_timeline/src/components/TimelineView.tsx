import React, { useRef, useState } from 'react';
import { useTimeline, eventBelongsToRange, YEAR_RANGES } from '../context/TimelineContext';
import { useI18n } from '../context/I18nContext';
import { Calendar, MapPin, User, ChevronLeft, ChevronRight, Compass, ArrowRight, Clock, Play } from 'lucide-react';

export const TimelineView: React.FC = () => {
  const { events, activeRange, searchQuery, setSelectedEvent, setActiveVideo } = useTimeline();
  const { language, t } = useI18n();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Mouse Drag Scroll State
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const activeRangeObj = YEAR_RANGES.find((r) => r.key === activeRange) || YEAR_RANGES[0];

  const filteredEvents = events.filter((ev) => {
    const matchesRange = eventBelongsToRange(ev, activeRangeObj);
    const matchesSearch =
      !searchQuery ||
      ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.hero.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRange && matchesSearch;
  });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (scrollRef.current?.offsetLeft || 0));
    setScrollLeft(scrollRef.current?.scrollLeft || 0);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollLeft += e.deltaY * 1.5;
  };

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -600 : 600;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-center py-4 overflow-hidden select-none">
      {/* Background Decorative Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:32px_32px] opacity-10 pointer-events-none" />

      {/* Banda del Rango Activo */}
      {activeRange !== 'TODOS' && (
        <div className="relative z-20 w-full max-w-4xl mx-auto px-6 mb-3">
          <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 backdrop-blur-md">
            <span className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg flex-shrink-0">
              <Clock className="w-5 h-5" />
            </span>
            <div className="flex-1">
              <div className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Periodo Histórico Seleccionado</div>
              <div className="text-lg font-black text-white leading-tight">{activeRangeObj.label}</div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-600 text-white shadow-lg flex-shrink-0">
              {filteredEvents.length} hitos
            </span>
          </div>
        </div>
      )}

      {/* Navigation Chevrons */}
      <button
        onClick={() => handleScroll('left')}
        className="fixed left-6 top-1/2 -translate-y-1/2 z-30 w-14 h-14 rounded-full bg-slate-900/90 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-2xl hover:bg-emerald-600 hover:text-white transition-all min-h-[48px] min-w-[48px] touch-active backdrop-blur-md"
        title="Desplazar a la izquierda"
      >
        <ChevronLeft className="w-8 h-8" />
      </button>

      <button
        onClick={() => handleScroll('right')}
        className="fixed right-6 top-1/2 -translate-y-1/2 z-30 w-14 h-14 rounded-full bg-slate-900/90 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-2xl hover:bg-emerald-600 hover:text-white transition-all min-h-[48px] min-w-[48px] touch-active backdrop-blur-md"
        title="Desplazar a la derecha"
      >
        <ChevronRight className="w-8 h-8" />
      </button>

      {/* Riel Horizontal Scrollable Timeline */}
      <div
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onWheel={handleWheel}
        className={`relative w-full overflow-x-auto py-8 cursor-grab active:cursor-grabbing no-scrollbar scroll-smooth ${
          isDragging ? 'scroll-auto' : ''
        }`}
      >
        <div className="relative flex items-center min-w-max px-24 gap-8">
          {/* Timeline Spine Line */}
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-green-800 via-emerald-400 to-green-800 z-0 opacity-60" />

          {filteredEvents.length === 0 ? (
            <div className="py-20 px-12 text-center text-slate-400 font-semibold text-lg bg-slate-900/80 rounded-3xl border border-emerald-500/30 mx-auto z-10">
              <Compass className="w-10 h-10 text-emerald-400 mx-auto mb-3 animate-spin" />
              No se encontraron acontecimientos históricos.
            </div>
          ) : (
            filteredEvents.map((event) => {
              const langData = event.language[language] || event.language['es'];
              const title = langData.title || event.title;
              const subtitle = langData.subtitle || event.subtitle;

              return (
                <div
                  key={event.id}
                  className="relative flex flex-col items-center flex-shrink-0 w-[360px] px-2 z-10 group"
                >
                  {/* Stem Line to Spine */}
                  <div className="w-0.5 h-6 bg-emerald-500/40 group-hover:bg-emerald-400 transition-colors" />

                  {/* Main Event Card */}
                  <div
                    onClick={() => {
                      if (event.video) {
                        setActiveVideo({
                          url: event.video,
                          title: title,
                          event: event,
                        });
                      } else {
                        setSelectedEvent(event);
                      }
                    }}
                    className="w-full bg-slate-900/90 backdrop-blur-md rounded-2xl border border-emerald-500/30 overflow-hidden shadow-2xl hover:border-emerald-400 hover:scale-[1.02] transition-all cursor-pointer flex flex-col justify-between touch-active"
                  >
                    {/* Thumbnail Image */}
                    <div className="relative h-44 w-full overflow-hidden bg-slate-950">
                      <img
                        src={event.image}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />

                      {/* Date Badge (Mes y Año) */}
                      <div className="absolute top-3 left-3 bg-green-900/90 text-emerald-200 font-extrabold text-xs px-3 py-1 rounded-full border border-emerald-500/40 shadow-lg flex items-center gap-1.5 z-10">
                        <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{event.displayDate || (event.month ? `${event.month} ${event.year}` : (event.year < 0 ? `${Math.abs(event.year)} a.C.` : event.year))}</span>
                      </div>

                      {/* Category Badge */}
                      <div className="absolute top-3 right-3 bg-slate-950/80 text-emerald-400 font-bold text-[10px] px-2.5 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-wider z-10">
                        {event.category}
                      </div>

                      {/* Video Play Overlay Indicator */}
                      {event.video && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                          <div className="w-12 h-12 rounded-full bg-emerald-500/90 text-slate-950 flex items-center justify-center shadow-[0_0_25px_rgba(16,185,129,0.8)] border-2 border-white/90 group-hover:scale-115 group-hover:bg-emerald-400 transition-all">
                            <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Content Info */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg font-black text-white group-hover:text-emerald-300 transition-colors leading-snug mb-1 line-clamp-2">
                          {title}
                        </h3>
                        <p className="text-xs text-emerald-400/90 font-medium mb-3 leading-snug">
                          {subtitle}
                        </p>
                      </div>

                      <div className="space-y-1.5 pt-3 border-t border-slate-800 text-[11px] text-slate-300">
                        {event.hero && (
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                            <span className="font-semibold text-slate-200 truncate">{event.hero}</span>
                          </div>
                        )}
                        {event.location && (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                            <span className="truncate">{event.location}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Footer Button */}
                    <div className="bg-slate-950/70 px-4 py-2 border-t border-emerald-500/20 flex items-center justify-between text-[11px] font-bold text-emerald-400 uppercase tracking-wider group-hover:bg-emerald-600 group-hover:text-slate-950 transition-colors">
                      <span>{(langData as { actionText?: string })?.actionText || event.actionText || t.view_event || 'Ver acontecimiento'}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  {/* Node Circle on Axis */}
                  <div className="w-6 h-6 rounded-full bg-slate-950 border-2 border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.7)] mt-2 flex items-center justify-center group-hover:scale-125 transition-transform">
                    <div className="w-2 h-2 rounded-full bg-green-600 group-hover:bg-emerald-400 transition-colors" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
