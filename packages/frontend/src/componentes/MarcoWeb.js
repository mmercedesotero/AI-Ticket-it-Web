import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BarraSuperior from "./BarraSuperior";
import ContenidoWeb from "./ContenidoWeb";
import { colores } from "../tema";

// Marco de cada pantalla en la versión web de escritorio: barra de navegación arriba y, si la pantalla
// tiene título, una fila con "Volver" y las migas de pan (Inicio › Título). Reemplaza al encabezado del celular.
export default function MarcoWeb({ children, navigation, titulo, ancho }) {
  return (
    <View style={styles.marco}>
      <BarraSuperior />

      {titulo ? (
        <View style={[styles.migas, { maxWidth: ancho }]}>
          {navigation.canGoBack() && (
            <Pressable onPress={() => navigation.goBack()} style={styles.volver} hitSlop={6}>
              <Ionicons name="arrow-back" size={18} color={colores.indigo} />
              <Text style={styles.volverTexto}>Volver</Text>
            </Pressable>
          )}
          <Text style={styles.ruta}>
            <Text onPress={() => navigation.navigate("Inicio")} style={styles.rutaEnlace}>Inicio</Text>
            {"  ›  "}
            <Text style={styles.rutaActual}>{titulo}</Text>
          </Text>
        </View>
      ) : null}

      <View style={styles.cuerpo}>
        <ContenidoWeb ancho={ancho}>{children}</ContenidoWeb>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  marco: { flex: 1, backgroundColor: colores.fondo },
  cuerpo: { flex: 1 },
  migas: {
    flexDirection: "row", alignItems: "center", gap: 18, width: "100%", alignSelf: "center",
    paddingHorizontal: 24, paddingTop: 18, paddingBottom: 2,
  },
  volver: { flexDirection: "row", alignItems: "center", gap: 6 },
  volverTexto: { color: colores.indigo, fontWeight: "700", fontSize: 14 },
  ruta: { color: colores.textoSuave, fontSize: 13 },
  rutaEnlace: { color: colores.textoSuave },
  rutaActual: { color: colores.indigo, fontWeight: "700" },
});
