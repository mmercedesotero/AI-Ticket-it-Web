import { createElement } from "react";
import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colores } from "../tema";

// Campos propios del navegador (lista desplegable y fecha). Solo se usan en la versión web.
// "appearance: none" saca el dibujo que le pone el navegador (el recuadro oscuro), y la flechita la ponemos nosotros.
const estiloDom = {
  flex: 1, height: 44, border: "none", background: "transparent", outline: "none", boxShadow: "none",
  WebkitAppearance: "none", MozAppearance: "none", appearance: "none", colorScheme: "light",
  fontSize: 14, fontFamily: "inherit", color: colores.indigo, cursor: "pointer", minWidth: 0, padding: 0,
};

function Contenedor({ icono, ancho, flecha, children }) {
  return (
    <View style={[styles.campo, ancho && { width: ancho }]}>
      {icono && <Ionicons name={icono} size={17} color={colores.textoSuave} />}
      {children}
      {flecha && <Ionicons name="chevron-down" size={16} color={colores.textoSuave} style={styles.flecha} />}
    </View>
  );
}

// Lista desplegable. opciones: [{ valor, texto }]
export function Selector({ valor, onCambio, opciones, icono, ancho }) {
  return (
    <Contenedor icono={icono} ancho={ancho} flecha>
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
  flecha: { pointerEvents: "none" },
});
