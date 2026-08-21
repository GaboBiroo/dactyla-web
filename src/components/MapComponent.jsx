import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { comercios } from '../data/comercios';
import 'leaflet/dist/leaflet.css';

// Custom Neon Gold Marker
const goldPulseIcon = L.divIcon({
  className: 'custom-gold-marker',
  html: `
    <div class="relative flex items-center justify-center w-10 h-10 cursor-pointer">
      <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-80"></span>
      <span class="relative inline-flex rounded-full h-5 w-5 bg-[#D4AF37] shadow-[0_0_25px_#D4AF37]"></span>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

function MapController({ activeId }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    if (activeId) {
      const comercio = comercios.find((c) => c.id === activeId);
      if (comercio) {
        map.flyTo([comercio.lat, comercio.lng], 16, { animate: true, duration: 1.5 });
      }
    } else {
      map.flyTo([-23.6268, -45.4128], 13, { animate: true, duration: 1.5 });
    }
  }, [activeId, map]);

  return null;
}

export default function MapComponent({ activeId, setActiveId }) {
  const defaultPosition = [-23.6268, -45.4128];

  return (
    <div className="w-full h-[450px] md:h-[500px] rounded-2xl overflow-hidden border border-[#28593B]/40 shadow-[0_0_40px_rgba(0,0,0,0.8)] relative z-10 pointer-events-none md:pointer-events-auto transform-gpu will-change-transform">
      <MapContainer
        center={defaultPosition}
        zoom={13}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        <MapController activeId={activeId} />

        {comercios.length > 0 ? (
          comercios.map((comercio) => (
            <Marker
              key={comercio.id}
              position={[comercio.lat, comercio.lng]}
              icon={goldPulseIcon}
              eventHandlers={{
                click: () => setActiveId(comercio.id),
              }}
            >
              <Popup className="custom-leaflet-popup">
                <div className="p-2 bg-[#0A140E] text-[#E8F0EA] rounded-lg font-sans">
                  <h4 className="font-bold text-[#D4AF37] text-sm">{comercio.nome}</h4>
                  <p className="text-xs text-[#E8F0EA]/80 font-mono mt-1">[{comercio.nicho}]</p>
                  <span className="text-[10px] text-[#28593B] font-bold block mt-1">{comercio.status}</span>
                </div>
              </Popup>
            </Marker>
          ))
        ) : (
          <Marker position={defaultPosition} icon={goldPulseIcon}>
            <Popup className="custom-leaflet-popup">
              <div className="p-3 bg-[#0A140E] text-[#E8F0EA] rounded-xl font-sans max-w-xs">
                <span className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-widest block mb-1">
                  MARCO ZERO // CARAGUATATUBA
                </span>
                <h4 className="font-bold text-[#E8F0EA] text-sm mb-1">
                  Sua Empresa Aqui
                </h4>
                <p className="text-xs text-[#E8F0EA]/70 font-light leading-relaxed mb-3">
                  Seja o primeiro comércio a integrar a rede de alta performance no litoral.
                </p>
                <a
                  href="#pacotes"
                  className="inline-block w-full text-center py-1.5 px-3 bg-[#D4AF37] text-[#0A140E] rounded-md font-mono text-xs font-bold uppercase tracking-wider"
                >
                  Garantir Ponto
                </a>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
