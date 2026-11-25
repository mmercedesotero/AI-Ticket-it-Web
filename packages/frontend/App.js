import { useRef, useState } from "react";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { setAlExpirar, setToken } from "./src/api";
import { borrar, guardar, leer } from "./src/almacen";
import { SesionContext, useSesion } from "./src/sesion";
import { EventosProvider } from "./src/eventos";
import { NotificacionesProvider, useNotificaciones } from "./src/notificaciones";
import NotificacionesScreen from "./src/screens/NotificacionesScreen";
import CalendarioScreen from "./src/screens/CalendarioScreen";
import EditarPerfilScreen from "./src/screens/EditarPerfilScreen";
import DialogoRaiz from "./src/componentes/DialogoRaiz";
import ContenidoWeb from "./src/componentes/ContenidoWeb";
import MarcoWeb from "./src/componentes/MarcoWeb";
import { esWeb, useEscritorio } from "./src/web";
import { colores } from "./src/tema";
import LoginScreen from "./src/screens/LoginScreen";
import RegistroScreen from "./src/screens/RegistroScreen";
import RecuperarScreen from "./src/screens/RecuperarScreen";
import TerminosScreen from "./src/screens/TerminosScreen";
import AyudaScreen from "./src/screens/AyudaScreen";
import MensajesScreen from "./src/screens/MensajesScreen";
import PerfilScreen from "./src/screens/PerfilScreen";
import EventosScreen from "./src/screens/EventosScreen";
import EventoDetalleScreen from "./src/screens/EventoDetalleScreen";
import MisComprasScreen from "./src/screens/MisComprasScreen";
import ChatScreen from "./src/screens/ChatScreen";
import ResenaScreen from "./src/screens/ResenaScreen";
import OrganizadorScreen from "./src/screens/OrganizadorScreen";
import ComprasEventoScreen from "./src/screens/ComprasEventoScreen";
import CrearEventoScreen from "./src/screens/CrearEventoScreen";
import FavoritosScreen from "./src/screens/FavoritosScreen";
import SeleccionarEntradasScreen from "./src/screens/SeleccionarEntradasScreen";
import TarjetasScreen from "./src/screens/TarjetasScreen";
import EntradaScreen from "./src/screens/EntradaScreen";
import AgregarTarjetaScreen from "./src/screens/AgregarTarjetaScreen";
import PagarScreen from "./src/screens/PagarScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Ícono de cada pestaña (lleno si está activa, de contorno si no).
const ICONOS_TAB = {
  Eventos: ["compass", "compass-outline"],
  "Mis compras": ["ticket", "ticket-outline"],
  "Mis eventos": ["albums", "albums-outline"],
  Calendario: ["calendar-number", "calendar-number-outline"],
  Notificaciones: ["notifications", "notifications-outline"],
  Perfil: ["person", "person-outline"],
};

const opcionesTab = ({ route }, insets) => ({
  headerShown: false,
  tabBarActiveTintColor: colores.acento,
  tabBarInactiveTintColor: colores.textoSuave,
  tabBarStyle: { backgroundColor: colores.blanco, borderTopWidth: 1, borderTopColor: colores.borde, height: 54 + insets.bottom, paddingTop: 8, paddingBottom: insets.bottom + 4 },
  tabBarShowLabel: false,
  tabBarIcon: ({ focused, color, size }) => (
    <Ionicons name={ICONOS_TAB[route.name][focused ? 0 : 1]} size={26} color={color} />
  ),
});

// ---- Versión web de escritorio: ancho máximo de cada pantalla (sin valor = ocupa todo el ancho) ----
const ANCHO_PESTANA = { Eventos: undefined, "Mis eventos": 1180, "Mis compras": 1120, Calendario: 1180, Notificaciones: 900, Perfil: 1120 };
const ANCHO_PANTALLA = {
  Detalle: 1180, Entradas: 1000, Pagar: 760, Chat: 1180, Mensajes: 1180, ComprasEvento: 1000, CrearEvento: 1180,
  Terminos: 1000, Ayuda: undefined, Favoritos: 1120, Tarjetas: 760, AgregarTarjeta: 760, EditarPerfil: 900, Entrada: 960, Resena: 760,
};

// En el celular las pantallas se muestran tal cual. En la web de escritorio se centran en una columna.
function CapaPestana({ route, children }) {
  const escritorio = useEscritorio();
  return escritorio ? <ContenidoWeb ancho={ANCHO_PESTANA[route.name]}>{children}</ContenidoWeb> : children;
}

// En la web de escritorio cada pantalla lleva la barra de navegación arriba y (si tiene título) las migas de pan.
function CapaPagina({ route, navigation, options, children }) {
  const escritorio = useEscritorio();
  if (!escritorio) return children;
  if (route.name === "Inicio") return <MarcoWeb navigation={navigation}>{children}</MarcoWeb>;
  return (
    <MarcoWeb navigation={navigation} titulo={route.name === "Ayuda" ? undefined : options.title} ancho={ANCHO_PANTALLA[route.name]}>
      {children}
    </MarcoWeb>
  );
}

// Las pantallas de acceso (login y registro) se arman solas; el resto va en una tarjeta centrada.
function CapaAcceso({ route, children }) {
  const escritorio = useEscritorio();
  if (!escritorio || route.name === "Login" || route.name === "Registro") return children;
  return route.name === "Terminos" ? (
    <ContenidoWeb ancho={1000}>{children}</ContenidoWeb>
  ) : (
    <ContenidoWeb ancho={460} tarjeta>{children}</ContenidoWeb>
  );
}

// Cada rol ve una app distinta: el comprador explora y compra, el organizador gestiona sus eventos.
function Inicio() {
  const insets = useSafeAreaInsets();
  const escritorio = useEscritorio();
  const { sesion } = useSesion();
  const { noLeidas } = useNotificaciones();

  // Un puntito verde en la campana avisa que hay notificaciones sin leer (sin mostrar la cantidad).
  const opcionesNotificaciones = {
    tabBarBadge: noLeidas > 0 ? " " : undefined,
    tabBarBadgeStyle: { backgroundColor: colores.acento, minWidth: 10, maxHeight: 10, borderRadius: 5, top: 2 },
  };

  // En la web de escritorio las pestañas de abajo no se muestran: la navegación va en la barra de arriba.
  const propiedades = {
    screenOptions: (p) => opcionesTab(p, insets),
    screenLayout: (p) => <CapaPestana {...p} />,
    tabBar: escritorio ? () => null : undefined,
  };

  if (sesion.rol === "ORGANIZADOR") {
    return (
      <Tab.Navigator {...propiedades}>
        <Tab.Screen name="Mis eventos" component={OrganizadorScreen} />
        <Tab.Screen name="Calendario" component={CalendarioScreen} />
        <Tab.Screen name="Notificaciones" component={NotificacionesScreen} options={opcionesNotificaciones} />
        <Tab.Screen name="Perfil" component={PerfilScreen} />
      </Tab.Navigator>
    );
  }

  return (
    <Tab.Navigator {...propiedades}>
      <Tab.Screen name="Eventos" component={EventosScreen} />
      <Tab.Screen name="Mis compras" component={MisComprasScreen} />
      <Tab.Screen name="Calendario" component={CalendarioScreen} />
      <Tab.Screen name="Notificaciones" component={NotificacionesScreen} options={opcionesNotificaciones} />
      <Tab.Screen name="Perfil" component={PerfilScreen} />
    </Tab.Navigator>
  );
}

// Encabezado común de las pantallas que no son pestañas.
const opcionesStack = {
  headerTintColor: colores.indigo,
  headerTitleStyle: { fontWeight: "800", color: colores.indigo },
  headerShadowVisible: false,
  headerStyle: { backgroundColor: colores.blanco },
};

// Direcciones de la versión web (por ejemplo /evento/12). Se evitan los nombres de la API
// (/eventos, /compras...) para que el servidor no confunda una página con una consulta de datos.
const enlaces = {
  config: {
    screens: {
      Login: "ingresar",
      Registro: "registro",
      Recuperar: "recuperar",
      Terminos: "terminos",
      Inicio: {
        path: "",
        screens: {
          Eventos: "explorar",
          "Mis compras": "mis-compras",
          "Mis eventos": "mis-eventos",
          Calendario: "calendario",
          Notificaciones: "avisos",
          Perfil: "perfil",
        },
      },
      Detalle: { path: "evento/:id", parse: { id: Number } },
      Mensajes: "mensajes",
      Favoritos: "favoritos",
      Tarjetas: "tarjetas",
      EditarPerfil: "perfil/editar",
      CrearEvento: "crear-evento",
      Ayuda: "ayuda",
    },
  },
};

export default function App() {
  const escritorio = useEscritorio();
  const token = useRef(null);

  // En la web la sesión queda guardada en el navegador: recargar la página no obliga a ingresar de nuevo.
  const [sesion, setSesion] = useState(() => {
    const guardada = leer("sesion");
    if (!guardada) return null;
    token.current = guardada.token;
    setToken(guardada.token);
    return { rol: guardada.rol, usuario: guardada.usuario };
  });

  const cerrarSesion = () => {
    token.current = null;
    setToken(null);
    borrar("sesion");
    setSesion(null);
  };
  // Si el servidor dice que la sesión ya no sirve (venció o se reinició), se vuelve al ingreso.
  setAlExpirar(cerrarSesion);

  const iniciarSesion = ({ token: nuevo, rol, usuario }) => {
    token.current = nuevo;
    setToken(nuevo);
    guardar("sesion", { token: nuevo, rol, usuario });
    setSesion({ rol, usuario });
  };

  // Después de editar el perfil, la sesión guarda los datos nuevos (nombre, foto, etc.).
  const actualizarUsuario = (usuario) =>
    setSesion((actual) => {
      guardar("sesion", { token: token.current, rol: actual.rol, usuario });
      return { ...actual, usuario };
    });

  return (
    <SafeAreaProvider>
    <SesionContext.Provider value={{ sesion, iniciarSesion, actualizarUsuario, cerrarSesion }}>
      <NavigationContainer documentTitle={{ formatter: () => "Ticket It" }} linking={esWeb ? enlaces : undefined}>
        {sesion === null ? (
          <Stack.Navigator screenOptions={{ headerShown: false }} screenLayout={(p) => <CapaAcceso {...p} />}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Registro" component={RegistroScreen} />
            <Stack.Screen name="Recuperar" component={RecuperarScreen} />
            <Stack.Screen name="Terminos" component={TerminosScreen} options={{ ...opcionesStack, headerShown: !escritorio, title: "Términos y Condiciones" }} />
          </Stack.Navigator>
        ) : (
          <EventosProvider esComprador={sesion.rol === "COMPRADOR"}>
          <NotificacionesProvider>
          <Stack.Navigator
            screenOptions={{ ...opcionesStack, ...(escritorio && { headerShown: false }) }}
            screenLayout={(p) => <CapaPagina {...p} />}
          >
            <Stack.Screen name="Inicio" component={Inicio} options={{ headerShown: false }} />
            <Stack.Screen name="Detalle" component={EventoDetalleScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Entradas" component={SeleccionarEntradasScreen} options={{ title: "Seleccionar Entradas" }} />
            <Stack.Screen name="Chat" component={ChatScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Resena" component={ResenaScreen} options={{ title: "Reseña" }} />
            <Stack.Screen name="ComprasEvento" component={ComprasEventoScreen} options={{ title: "Compras del evento" }} />
            <Stack.Screen name="CrearEvento" component={CrearEventoScreen} options={{ title: "Crear Evento" }} />
            <Stack.Screen name="Favoritos" component={FavoritosScreen} options={{ title: "Mis favoritos" }} />
            <Stack.Screen name="Entrada" component={EntradaScreen} options={{ title: "Mi entrada" }} />
            <Stack.Screen name="Terminos" component={TerminosScreen} options={{ title: "Términos y Condiciones" }} />
            <Stack.Screen name="Mensajes" component={MensajesScreen} options={{ title: "Mensajes" }} />
            <Stack.Screen name="Ayuda" component={AyudaScreen} options={{ title: "Ayuda y Soporte" }} />
            <Stack.Screen name="EditarPerfil" component={EditarPerfilScreen} options={{ title: "Editar perfil" }} />
            <Stack.Screen name="Tarjetas" component={TarjetasScreen} options={{ title: "Métodos de pago" }} />
            <Stack.Screen name="AgregarTarjeta" component={AgregarTarjetaScreen} options={{ title: "Agregar tarjeta" }} />
            <Stack.Screen name="Pagar" component={PagarScreen} options={{ title: "Pagar" }} />
          </Stack.Navigator>
          </NotificacionesProvider>
          </EventosProvider>
        )}
      </NavigationContainer>
      <DialogoRaiz />
    </SesionContext.Provider>
    </SafeAreaProvider>
  );
}
