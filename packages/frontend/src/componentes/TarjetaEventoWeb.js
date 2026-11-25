import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BotonFavorito from "./BotonFavorito";
import { estadoCupo, iconoDe } from "./TarjetaEvento";
import { colores } from "../tema";
import { formatearFechaLarga, formatearPrecio, yaSeRealizo } from "../formato";
import { imagenDe } from "../imagenes";
import { textoLugar } from "../lugar";

// "Desde $12.000" (el precio más bajo de las entradas).
export const precioDesde = (evento) =>
  evento.tiposEntrada.length === 0 ? "Sin entradas" : `Desde ${formatearPrecio(Math.min(...evento.tiposEntrada.map((t) => t.precio)))}`;

// Tarjeta de evento de la versión web: foto arriba, datos y un botón grande de compra.
export default function TarjetaEventoWeb({ evento, favorito, onPress, onFavorito }) {
  const foto = imagenDe(evento);
  const finalizado = yaSeRealizo(evento.fecha);
  const cupo = finalizado ? null : estadoCupo(evento);
  const agotado = cupo === "agotado";

  return (
    <Pressable style={styles.tarjeta} onPress={onPress}>
      <View style={styles.imagen}>
        {foto ? <Image source={foto} style={styles.foto} resizeMode="cover" /> : <Ionicons name={iconoDe(evento)} size={52} color={colores.acento} />}

        {evento.categoria?.nombre ? (
          <View style={styles.categoria}>
            <Text style={styles.categoriaTexto}>{evento.categoria.nombre}</Text>
          </View>
        ) : null}

        {onFavorito && (
          <View style={styles.corazon}>
            <BotonFavorito activo={favorito} onPress={onFavorito} tamano={34} />
          </View>
        )}

        {(finalizado || cupo) && (
          <View style={[styles.estado, finalizado ? styles.estadoFin : agotado ? styles.estadoAgotado : styles.estadoPocas]}>
            <Text style={styles.estadoTexto}>{finalizado ? "Finalizado" : agotado ? "Agotado" : "¡Últimas entradas!"}</Text>
          </View>
        )}
      </View>

      <View style={styles.cuerpo}>
        <Text style={styles.nombre} numberOfLines={1}>{evento.nombre}</Text>

        <View style={styles.linea}>
          <Ionicons name="calendar-outline" size={15} color={colores.textoSuave} />
          <Text style={styles.lineaTexto}>{formatearFechaLarga(evento.fecha)}</Text>
        </View>
        {evento.lugar && (
          <View style={styles.linea}>
            <Ionicons name="location-outline" size={15} color={colores.textoSuave} />
            <Text style={styles.lineaTexto} numberOfLines={1}>{textoLugar(evento.lugar)}</Text>
          </View>
        )}

        <View style={styles.relleno} />
        <Text style={styles.precio}>{precioDesde(evento)}</Text>
        <View style={[styles.boton, (finalizado || agotado) && styles.botonGris]}>
          <Text style={styles.botonTexto}>{finalizado || agotado ? "Ver detalle" : "Comprar Entradas"}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    backgroundColor: colores.blanco, borderRadius: 14, overflow: "hidden",
    borderWidth: 1, borderColor: colores.borde, boxShadow: "0 1px 3px rgba(15,23,42,0.05)",
  },
  imagen: { width: "100%", aspectRatio: 16 / 10, backgroundColor: colores.indigo, alignItems: "center", justifyContent: "center" },
  foto: { width: "100%", height: "100%" },
  categoria: { position: "absolute", top: 10, left: 10, backgroundColor: colores.blanco, borderRadius: 10, paddingHorizontal: 9, paddingVertical: 3 },
  categoriaTexto: { fontSize: 11, fontWeight: "700", color: colores.acento },
  corazon: { position: "absolute", top: 8, right: 8 },
  estado: { position: "absolute", bottom: 10, left: 10, borderRadius: 10, paddingHorizontal: 9, paddingVertical: 4 },
  estadoFin: { backgroundColor: "rgba(15,23,42,0.85)" },
  estadoAgotado: { backgroundColor: "#DC2626" },
  estadoPocas: { backgroundColor: "#DC2626" },
  estadoTexto: { color: colores.blanco, fontSize: 11, fontWeight: "800" },

  cuerpo: { padding: 14, flexGrow: 1 },
  nombre: { fontSize: 17, fontWeight: "800", color: colores.indigo, marginBottom: 6 },
  linea: { flexDirection: "row", alignItems: "center", gap: 7, marginTop: 3 },
  lineaTexto: { color: colores.textoSuave, fontSize: 13, flexShrink: 1 },
  relleno: { flexGrow: 1, minHeight: 12 },
  precio: { fontSize: 15, fontWeight: "800", color: colores.indigo, marginBottom: 10 },
  boton: { backgroundColor: colores.acento, borderRadius: 9, paddingVertical: 10, alignItems: "center" },
  botonGris: { backgroundColor: colores.textoPlaceholder },
  botonTexto: { color: colores.blanco, fontWeight: "700", fontSize: 14 },
});
