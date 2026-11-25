import { createElement } from "react";
import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colores } from "../tema";

// Campos propios del navegador (lista desplegable y fecha). Solo se usan en la versión web.
const estiloDom = {
  flex: 1, height: 44, border: "none", background: "transparent", outline: "none",
  fontSize: 14, fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif", color: colores.indigo, cursor: "pointer", minWidth: 0,
};

function Contenedor({ icono, ancho, children }) {
  return (
    <View style={[styles.campo, ancho && { width: ancho }]}>
      {icono && <Ionicons name={icono} size={17} color={colores.textoSuave} />}
      {children}
    </View>
  );
}

// Lista desplegable. opciones: [{ valor, texto }]
export function Selector({ valor, onCambio, opciones, icono, ancho }) {
  return (
    <Contenedor icono={icono} ancho={ancho}>
      {createElement(
        "select",
        { value: valor ?? "", onChange: (e) => onCambio(e.target.value), style: estiloDom },
        opciones.map((o) => createElement("option", { key: o.valor, value: o.valor }, o.texto))
      )}
    </Contenedor>
  );
}

// Campo de fecha del navegador. El valor es "AAAA-MM-DD" (igual que las fechas de los eventos).
export function CampoFecha({ valor, onCambio, icono = "calendar-outline", ancho, minimo }) {
  return (
    <Contenedor icono={icono} ancho={ancho}>
      {createElement("input", {
        type: "date", value: valor ?? "", min: minimo, onChange: (e) => onCambio(e.target.value), style: estiloDom,
      })}
    </Contenedor>
  );
}

const styles = StyleSheet.create({
  campo: {
    flexDirection: "row", alignItems: "center", gap: 8, height: 46, paddingHorizontal: 12,
    backgroundColor: colores.blanco, borderRadius: 10, borderWidth: 1, borderColor: colores.borde,
  },
});
