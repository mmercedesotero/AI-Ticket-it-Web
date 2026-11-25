import { Platform, useWindowDimensions } from "react-native";

// Ayudas para la versión web. En el celular todo esto queda sin efecto.
export const esWeb = Platform.OS === "web";

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
