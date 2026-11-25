import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useNavigationState } from "@react-navigation/native";
import { useSesion } from "../sesion";
import { useNotificaciones } from "../notificaciones";
import Avatar from "./Avatar";
import Logo from "./Logo";
import { colores } from "../tema";

// Enlaces de la barra según quién entró. `tab` abre una pestaña de Inicio; `pantalla`, una pantalla suelta.
// `activa` lista las pantallas que dejan resaltado el enlace (por ejemplo, el detalle de un evento cuenta como Explorar).
const ENLACES = {
  COMPRADOR: [
    { texto: "Explorar Eventos", tab: "Eventos", activa: ["Eventos", "Detalle", "Entradas", "Pagar", "Favoritos"] },
    { texto: "Mis Compras", tab: "Mis compras", activa: ["Mis compras", "Entrada", "Resena"] },
    { texto: "Calendario", tab: "Calendario", activa: ["Calendario"] },
    { texto: "Mensajes", pantalla: "Mensajes", activa: ["Mensajes", "Chat"], mensajes: true },
  ],
  ORGANIZADOR: [
    { texto: "Mis Eventos", tab: "Mis eventos", activa: ["Mis eventos", "ComprasEvento", "CrearEvento"] },
    { texto: "Calendario", tab: "Calendario", activa: ["Calendario"] },
    { texto: "Mensajes", pantalla: "Mensajes", activa: ["Mensajes", "Chat"], mensajes: true },
  ],
};

// Barra de navegación de la versión web (reemplaza a las pestañas de abajo del celular).
export default function BarraSuperior() {
  const navigation = useNavigation();
  const { sesion } = useSesion();
  const { noLeidas, mensajesSinLeer } = useNotificaciones();
  const [texto, setTexto] = useState("");

  // Pantalla en la que estamos: la de arriba de la pila o, si es Inicio, la pestaña elegida.
  const actual = useNavigationState((estado) => {
    // Cuando se entra por una dirección (por ejemplo /mis-compras) el estado puede venir sin "index".
    const ruta = estado.routes[estado.index ?? estado.routes.length - 1];
    if (ruta.name !== "Inicio") return ruta.name;
    const interno = ruta.state;
    return interno ? interno.routes[interno.index ?? interno.routes.length - 1].name : null;
  });

  const esComprador = sesion.rol === "COMPRADOR";
  const enlaces = ENLACES[sesion.rol];
  // Si todavía no hay pestaña elegida, la primera es la que se muestra.
  const nombreActual = actual ?? (esComprador ? "Eventos" : "Mis eventos");

  const ir = (enlace) => (enlace.tab ? navigation.navigate("Inicio", { screen: enlace.tab }) : navigation.navigate(enlace.pantalla));

  const buscar = () => {
    if (!texto.trim()) return;
    navigation.navigate("Inicio", { screen: "Eventos", params: { texto: texto.trim() } });
    setTexto("");
  };

  return (
    <View style={styles.barra}>
      <View style={styles.interior}>
        <Pressable onPress={() => navigation.navigate("Inicio", { screen: enlaces[0].tab })} style={styles.logo}>
          <Logo tamano={22} />
        </Pressable>

        <View style={styles.enlaces}>
          {enlaces.map((e) => {
            const activo = e.activa.includes(nombreActual);
            return (
              <Pressable key={e.texto} onPress={() => ir(e)} style={[styles.enlace, activo && styles.enlaceActivo]}>
                <Text style={[styles.enlaceTexto, activo && styles.enlaceTextoActivo]}>{e.texto}</Text>
                {e.mensajes && mensajesSinLeer > 0 && (
                  <View style={styles.insignia}>
                    <Text style={styles.insigniaTexto}>{mensajesSinLeer > 9 ? "9+" : mensajesSinLeer}</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        <View style={styles.derecha}>
          {esComprador && (
            <View style={styles.buscador}>
              <Ionicons name="search-outline" size={16} color={colores.textoSuave} />
              <TextInput
                style={styles.buscadorInput}
                placeholder="Buscar eventos"
                placeholderTextColor={colores.textoPlaceholder}
                value={texto}
                onChangeText={setTexto}
                onSubmitEditing={buscar}
                returnKeyType="search"
              />
            </View>
          )}

          <Pressable onPress={() => navigation.navigate("Inicio", { screen: "Notificaciones" })} style={styles.icono} hitSlop={6}>
            <Ionicons name={nombreActual === "Notificaciones" ? "notifications" : "notifications-outline"} size={22} color={colores.indigo} />
            {noLeidas > 0 && <View style={styles.punto} />}
          </Pressable>

          <Pressable onPress={() => navigation.navigate("Inicio", { screen: "Perfil" })} hitSlop={6}>
            <Avatar foto={sesion.usuario.foto} nombre={sesion.usuario.nombre} tamano={36} organizacion={!esComprador} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  barra: { backgroundColor: colores.blanco, borderBottomWidth: 1, borderBottomColor: colores.borde, zIndex: 10 },
  interior: {
    flexDirection: "row", alignItems: "center", width: "100%", maxWidth: 1280, alignSelf: "center",
    height: 64, paddingHorizontal: 24, gap: 28,
  },
  logo: { marginRight: 4 },
  enlaces: { flexDirection: "row", alignItems: "center", gap: 4, flex: 1 },
  enlace: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  enlaceActivo: { backgroundColor: colores.acentoSuave },
  enlaceTexto: { color: colores.textoSuave, fontWeight: "600", fontSize: 15 },
  enlaceTextoActivo: { color: colores.acento, fontWeight: "800" },
  insignia: {
    minWidth: 18, height: 18, borderRadius: 9, backgroundColor: colores.acento,
    alignItems: "center", justifyContent: "center", paddingHorizontal: 4,
  },
  insigniaTexto: { color: colores.blanco, fontSize: 10, fontWeight: "800" },
  derecha: { flexDirection: "row", alignItems: "center", gap: 16 },
  buscador: {
    flexDirection: "row", alignItems: "center", gap: 8, width: 230, height: 38,
    backgroundColor: colores.fondo, borderRadius: 10, paddingHorizontal: 12,
  },
  buscadorInput: { flex: 1, fontSize: 14, color: colores.indigo, outlineStyle: "none" },
  icono: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  punto: {
    position: "absolute", top: 6, right: 8, width: 9, height: 9, borderRadius: 5,
    backgroundColor: colores.acento, borderWidth: 2, borderColor: colores.blanco,
  },
});
