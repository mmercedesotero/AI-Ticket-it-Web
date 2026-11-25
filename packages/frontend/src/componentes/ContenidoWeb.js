import { StyleSheet, View } from "react-native";
import { colores } from "../tema";
import { esWeb, useEscritorio } from "../web";

// En la web centra la pantalla en una columna con ancho máximo, en vez de estirarla por toda la ventana.
// Con `tarjeta` la columna se dibuja como una tarjeta blanca flotando sobre el fondo (login, registro).
// En el celular no hace nada.
export default function ContenidoWeb({ children, ancho, tarjeta = false }) {
  const escritorio = useEscritorio();

  if (!esWeb) return children;

  return (
    <View style={styles.pagina}>
      <View
        style={[
          styles.columna,
          { maxWidth: ancho },
          tarjeta && escritorio && styles.tarjeta,
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pagina: { flex: 1, alignItems: "center", backgroundColor: colores.fondo },
  columna: { flex: 1, width: "100%" },
  tarjeta: {
    flexGrow: 0, flexBasis: "auto", height: "92%", maxHeight: 780, alignSelf: "center", marginVertical: "auto",
    backgroundColor: colores.blanco, borderRadius: 24, borderWidth: 1, borderColor: colores.borde,
    overflow: "hidden", boxShadow: "0 12px 40px rgba(15,23,42,0.10)",
  },
});
