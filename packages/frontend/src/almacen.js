import { esWeb } from "./web";

// Guarda datos en el navegador (localStorage) para que sobrevivan a recargar la página.
// En el celular no hace nada: ahí la sesión se pide de nuevo al abrir la app.
export const guardar = (clave, valor) => {
  if (!esWeb) return;
  try {
    window.localStorage.setItem(clave, JSON.stringify(valor));
  } catch {
    // Si el navegador no deja guardar (modo privado, sin espacio), la app sigue funcionando igual.
  }
};

export const leer = (clave) => {
  if (!esWeb) return null;
  try {
    const texto = window.localStorage.getItem(clave);
    return texto === null ? null : JSON.parse(texto);
  } catch {
    return null;
  }
};

export const borrar = (clave) => {
  if (!esWeb) return;
  try {
    window.localStorage.removeItem(clave);
  } catch {
    // Nada que hacer.
  }
};
