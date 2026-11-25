import { Platform, useWindowDimensions } from "react-native";

// Ayudas para la versión web. En el celular todo esto queda sin efecto.
export const esWeb = Platform.OS === "web";

// ---- Ajustes del navegador (solo web) ----
// Ícono de la pestaña: el logo de Ticket-It (el mismo dibujo del logo de la app, como imagen SVG).
const ICONO_PESTANIA = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="-4 -22 108 104"><path d="M8 0 H92 a8 8 0 0 1 8 8 V22 a8 8 0 0 0 0 16 V52 a8 8 0 0 1 -8 8 H8 a8 8 0 0 1 -8 -8 V38 a8 8 0 0 0 0 -16 V8 a8 8 0 0 1 8 -8 Z" fill="#EF806C"/><text x="32" y="39" fill="#FFFFFF" font-size="26" font-weight="bold" font-family="Arial, Helvetica, sans-serif" text-anchor="middle">AI</text><line x1="62" y1="8" x2="62" y2="52" stroke="#FFFFFF" stroke-width="3" stroke-dasharray="4 5"/><polyline points="72,31 78,37 88,25" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

// Tipografía: Inter hasta seminegrita (600). Como no se carga ninguna más gruesa, los textos "en negrita"
// se ven en seminegrita y los títulos quedan más finos y prolijos. Los íconos (fuente "ionicons") no se tocan.
const ESTILO_GLOBAL = `
  #root *:not([style*="font-family: ionicons" i]):not([style*="font-family: Ionicons"]) {
    font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  }
  body { -webkit-font-smoothing: antialiased; }
  /* iPhone: si un campo de texto tiene letra menor a 16 px, Safari agranda la pantalla al tocarlo y la deja desacomodada. */
  @media (max-width: 899px) {
    #root input, #root textarea, #root select { font-size: 16px !important; }
  }
`;

if (esWeb && typeof document !== "undefined") {
  const enlace = (rel, href, extra = {}) => {
    const el = document.createElement("link");
    el.rel = rel;
    el.href = href;
    Object.assign(el, extra);
    document.head.appendChild(el);
    return el;
  };

  document.querySelectorAll('link[rel~="icon"]').forEach((el) => el.remove());
  enlace("icon", `data:image/svg+xml,${encodeURIComponent(ICONO_PESTANIA)}`, { type: "image/svg+xml" });

  enlace("preconnect", "https://fonts.googleapis.com");
  enlace("preconnect", "https://fonts.gstatic.com", { crossOrigin: "anonymous" });
  enlace("stylesheet", "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap");

  const estilo = document.createElement("style");
  estilo.textContent = ESTILO_GLOBAL;
  document.head.appendChild(estilo);
}

// Desde este ancho la web deja de verse como un celular: barra lateral y listas en columnas.
export const ANCHO_ESCRITORIO = 900;
export const ANCHO_BARRA = 230;

// Anchos máximos del contenido, según el tipo de pantalla.
export const ANCHO_LISTA = 1100; // pantallas con muchas tarjetas
export const ANCHO_PAGINA = 760; // detalle, formularios, perfil, etc.
export const ANCHO_ACCESO = 460; // login y registro

export function useEscritorio() {
  const { width } = useWindowDimensions();
  return esWeb && width >= ANCHO_ESCRITORIO;
}

// Ancho que realmente tiene el contenido (la ventana menos la barra lateral, con un tope).
export function useAnchoContenido(maximo = ANCHO_LISTA) {
  const { width } = useWindowDimensions();
  const escritorio = esWeb && width >= ANCHO_ESCRITORIO;
  return Math.min(width - (escritorio ? ANCHO_BARRA : 0), maximo);
}

// Estilos que solo se aplican en la web (por ejemplo, las hojas de abajo pasan a ser ventanas centradas).
export const soloWeb = (estilos) => (esWeb ? estilos : {});

// Abre un documento HTML en una pestaña nueva y lanza la impresión (desde ahí se puede guardar como PDF).
// Hay que llamarla directo desde el toque del usuario, si no el navegador bloquea la ventana. Devuelve false si la bloqueó.
export function imprimirHtml(html) {
  const ventana = window.open("", "_blank");
  if (!ventana) return false;
  ventana.document.write(html);
  ventana.document.close();
  ventana.focus();
  setTimeout(() => ventana.print(), 400);
  return true;
}

// En el celular los avisos suben desde abajo; en la web son una ventana centrada.
export const VENTANA = {
  fondo: { justifyContent: "center", alignItems: "center", padding: 16 },
  hoja: { width: "100%", maxWidth: 460, borderRadius: 24, paddingBottom: 22 },
};
