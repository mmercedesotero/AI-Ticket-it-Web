import { Platform } from "react-native";

// ⚠ SOLO PARA EL CELULAR: cambiá TU-IP-AQUI por la IP de tu computadora en la red wifi.
//
// Cuando levantás el backend (npm start en packages/backend), la terminal te muestra la línea exacta para pegar acá.
// También se puede ver con "ipconfig" (Windows) o "ifconfig" (Mac / Linux). Ejemplo:
//
//     const API_CELULAR = "http://192.168.1.35:3000";
//
// El celular y la computadora tienen que estar en la misma wifi. Más detalles en el README.
const API_CELULAR = "http://TU-IP-AQUI:3000";

// En la web no hace falta configurar nada:
//   - Publicada (Railway, etc.): el backend sirve la web y la API desde la misma dirección, bajo /api.
//   - En desarrollo (npm run web, puerto 8081): la API está en el puerto 3000 de la misma computadora.
// Si hace falta otra dirección, se puede fijar con la variable EXPO_PUBLIC_API_URL.
function direccionWeb() {
  const { protocol, hostname, port, origin } = window.location;
  return port === "8081" ? `${protocol}//${hostname}:3000` : `${origin}/api`;
}

export const API = process.env.EXPO_PUBLIC_API_URL ?? (Platform.OS === "web" ? direccionWeb() : API_CELULAR);

// Si todavía no se puso la IP, en vez de un error de red confuso se avisa qué hay que hacer.
const avisarSiFalta = () => {
  if (API.includes("TU-IP-AQUI"))
    throw new Error("Falta configurar la IP del backend. Abrí packages/frontend/src/api.js y cambiá TU-IP-AQUI por la IP de tu computadora (el backend la muestra al arrancar).");
};

// El token de la sesión actual. Se guarda acá para mandarlo en cada pedido.
let token = null;
// Se llama cuando el servidor dice que la sesión ya no sirve (venció o el servidor se reinició).
let alExpirar = null;

export const setToken = (nuevo) => {
  token = nuevo;
};

export const setAlExpirar = (funcion) => {
  alExpirar = funcion;
};

const cabeceras = () => ({
  "Content-Type": "application/json",
  ...(token && { Authorization: `Bearer ${token}` }),
});

async function resolver(respuesta) {
  const datos = await respuesta.json();
  if (!respuesta.ok) {
    if (respuesta.status === 401 && token) alExpirar?.();
    throw new Error(datos.error || "Error de red");
  }
  return datos;
}

export async function get(ruta) {
  avisarSiFalta();
  return resolver(await fetch(`${API}${ruta}`, { headers: cabeceras() }));
}

export async function enviar(metodo, ruta, cuerpo) {
  avisarSiFalta();
  return resolver(
    await fetch(`${API}${ruta}`, {
      method: metodo,
      headers: cabeceras(),
      body: JSON.stringify(cuerpo),
    })
  );
}
