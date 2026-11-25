import { Platform } from "react-native";

// Dirección del backend. Se puede fijar con la variable EXPO_PUBLIC_API_URL (por ejemplo en el archivo
// packages/frontend/.env), tanto para el celular como para la web:
//
//     EXPO_PUBLIC_API_URL=http://192.168.1.35:3000        (backend en esta computadora, visto desde el celular)
//     EXPO_PUBLIC_API_URL=https://mi-backend.onrender.com   (backend publicado)
//
// Si no se define:
//   - Celular: hay que definirla (el celular no puede usar localhost, tiene que ser la IP de la computadora).
//   - Web publicada: usa la misma dirección de la página, bajo /api.
//   - Web en desarrollo (npm run web, puerto 8081): usa el puerto 3000 de la misma computadora.
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
    throw new Error("Falta configurar la dirección del backend. Creá el archivo packages/frontend/.env con EXPO_PUBLIC_API_URL=http://IP-DE-TU-COMPUTADORA:3000 (el backend muestra la línea exacta al arrancar) y volvé a abrir la app.");
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
