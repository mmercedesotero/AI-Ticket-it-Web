import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LogoIcono } from "./Logo";
import { colores } from "../tema";
import { useEscritorio } from "../web";

// Pantalla dividida de la web de escritorio para ingresar y registrarse:
// a la izquierda la identidad de la marca y a la derecha el formulario. En el celular se ve solo el formulario.
export default function AccesoDividido({ lema, children }) {
  const escritorio = useEscritorio();
  if (!escritorio) return children;

  return (
    <View style={styles.pantalla}>
      <View style={styles.marca}>
        {/* Entradas decorativas, de fondo */}
        <Ionicons name="ticket-outline" size={150} color="rgba(239,128,108,0.22)" style={[styles.deco, { top: 50, right: 40, transform: [{ rotate: "-18deg" }] }]} />
        <Ionicons name="ticket-outline" size={90} color="rgba(255,255,255,0.07)" style={[styles.deco, { top: 120, left: 40, transform: [{ rotate: "14deg" }] }]} />
        <Ionicons name="ticket-outline" size={110} color="rgba(255,255,255,0.07)" style={[styles.deco, { bottom: 60, right: 70, transform: [{ rotate: "20deg" }] }]} />

        <View style={styles.centro}>
          <View style={styles.logo}>
            <LogoIcono ancho={84} />
            <Text style={styles.nombre}>
              Ticket-<Text style={styles.it}>It</Text>
            </Text>
          </View>
          <Text style={styles.lema}>{lema}</Text>
        </View>
      </View>

      <View style={styles.formulario}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, flexDirection: "row", backgroundColor: colores.blanco },
  marca: { flex: 1, backgroundColor: colores.indigo, overflow: "hidden", justifyContent: "center", alignItems: "center", padding: 48 },
  deco: { position: "absolute" },
  centro: { alignItems: "center", gap: 28 },
  logo: { flexDirection: "row", alignItems: "center", gap: 18 },
  nombre: { fontSize: 50, fontWeight: "800", color: colores.blanco },
  it: { color: colores.acento },
  lema: { fontSize: 28, fontWeight: "700", color: colores.blanco, textAlign: "center", maxWidth: 420, lineHeight: 38 },
  formulario: { flex: 1, backgroundColor: colores.blanco },
});
