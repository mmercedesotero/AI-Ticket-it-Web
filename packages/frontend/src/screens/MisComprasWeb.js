import { useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { get } from "../api";
import { descargarComprobante } from "../comprobante";
import { iconoDe } from "../componentes/TarjetaEvento";
import { imagenDe } from "../imagenes";
import { textoLugar } from "../lugar";
import { ESTADOS, esPasada, estiloEstado, textoDias, textoReserva } from "../compras";
import { colores } from "../tema";
import { formatearFechaLarga, formatearPrecio } from "../formato";

// "Mis compras" de la web de escritorio: una fila por compra, con los botones de acción a la derecha.
export default function MisComprasWeb({ compras, navigation }) {
  const [pestania, setPestania] = useState("proximos");
  const proximos = compras.filter((c) => !esPasada(c));
  const historial = compras.filter(esPasada);
  const visibles = pestania === "proximos" ? proximos : historial;

  return (
    <ScrollView style={styles.pantalla} contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
      <Text style={styles.titulo}>Mis Compras</Text>
      <Text style={styles.subtitulo}>Gestioná tus entradas y reservas</Text>

      <View style={styles.pestanias}>
        <Pestania texto={`Próximos Eventos (${proximos.length})`} activa={pestania === "proximos"} onPress={() => setPestania("proximos")} />
        <Pestania texto={`Historial (${historial.length})`} activa={pestania === "historial"} onPress={() => setPestania("historial")} />
      </View>

      {visibles.length === 0 ? (
        <Text style={styles.vacio}>{pestania === "proximos" ? "No tenés entradas activas" : "Todavía no hay compras pasadas"}</Text>
      ) : (
        visibles.map((c) => <Fila key={c.id} compra={c} navigation={navigation} />)
      )}
    </ScrollView>
  );
}

function Fila({ compra, navigation }) {
  const estado = ESTADOS[compra.estado];
  const pendiente = compra.estado === "PENDIENTE_PAGO" && !esPasada(compra);
  const foto = imagenDe(compra.evento);
  const verEntrada = () => navigation.navigate("Entrada", { compraId: compra.id });

  return (
    <View style={styles.fila}>
      <Pressable style={styles.foto} onPress={verEntrada}>
        {foto ? <Image source={foto} style={styles.fotoImg} resizeMode="cover" /> : <Ionicons name={iconoDe(compra.evento)} size={30} color={colores.acento} />}
      </Pressable>

      <Pressable style={styles.info} onPress={verEntrada}>
        <Text style={styles.nombre} numberOfLines={1}>{compra.evento.nombre}</Text>
        <Linea icono="calendar-outline" texto={formatearFechaLarga(compra.evento.fecha)} />
        {compra.evento.lugar && <Linea icono="location-outline" texto={textoLugar(compra.evento.lugar)} />}
        <Linea icono="ticket-outline" texto={`${compra.cantidad} × ${compra.tipoEntrada.nombre} · ${formatearPrecio(compra.total)}`} />
        <View style={styles.estadoFila}>
          <View style={[styles.estado, estiloEstado(estado).etiqueta]}>
            <Text style={[styles.estadoTexto, estiloEstado(estado).texto]}>{estado.texto}</Text>
          </View>
          {pendiente && <Text style={styles.dias}>{textoReserva(compra)}</Text>}
          {compra.diasParaEvento !== null && compra.diasParaEvento !== undefined && <Text style={styles.dias}>{textoDias(compra.diasParaEvento)}</Text>}
        </View>
      </Pressable>

      <View style={styles.acciones}>
        {pendiente ? (
          <Pressable
            style={styles.primario}
            onPress={() => navigation.navigate("Pagar", { compraId: compra.id, total: compra.total, titulo: `${compra.cantidad} × ${compra.tipoEntrada.nombre} · ${compra.evento.nombre}` })}
          >
            <Ionicons name="card-outline" size={16} color={colores.blanco} />
            <Text style={styles.primarioTexto}>Pagar {formatearPrecio(compra.total)}</Text>
          </Pressable>
        ) : (
          <Pressable style={styles.primario} onPress={verEntrada}>
            <Ionicons name="qr-code-outline" size={16} color={colores.blanco} />
            <Text style={styles.primarioTexto}>Ver QR</Text>
          </Pressable>
        )}

        <Pressable style={styles.secundario} onPress={async () => descargarComprobante([await get(`/compras/${compra.id}`)])}>
          <Ionicons name="download-outline" size={16} color={colores.indigo} />
          <Text style={styles.secundarioTexto}>Descargar PDF</Text>
        </Pressable>

        {compra.estado === "UTILIZADA" && (
          <Pressable style={styles.puntuar} onPress={() => navigation.navigate("Resena", { compraId: compra.id, evento: compra.evento.nombre })}>
            <Ionicons name="star" size={15} color="#B5503C" />
            <Text style={styles.puntuarTexto}>Puntuar evento</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

function Pestania({ texto, activa, onPress }) {
  return (
    <Pressable style={[styles.pestania, activa && styles.pestaniaActiva]} onPress={onPress}>
      <Text style={[styles.pestaniaTexto, activa && styles.pestaniaTextoActivo]}>{texto}</Text>
    </Pressable>
  );
}

function Linea({ icono, texto }) {
  return (
    <View style={styles.linea}>
      <Ionicons name={icono} size={14} color={colores.textoSuave} />
      <Text style={styles.lineaTexto} numberOfLines={1}>{texto}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.fondo },
  contenido: { paddingHorizontal: 24, paddingTop: 28, paddingBottom: 56 },
  titulo: { fontSize: 28, fontWeight: "800", color: colores.indigo },
  subtitulo: { color: colores.textoSuave, marginTop: 2, marginBottom: 20 },

  pestanias: { flexDirection: "row", gap: 24, borderBottomWidth: 1, borderColor: colores.borde, marginBottom: 20 },
  pestania: { paddingVertical: 10, borderBottomWidth: 2, borderColor: "transparent", marginBottom: -1 },
  pestaniaActiva: { borderColor: colores.acento },
  pestaniaTexto: { color: colores.textoSuave, fontWeight: "600" },
  pestaniaTextoActivo: { color: colores.indigo, fontWeight: "800" },

  fila: {
    flexDirection: "row", alignItems: "center", gap: 18, backgroundColor: colores.blanco, borderRadius: 14,
    borderWidth: 1, borderColor: colores.borde, padding: 14, marginBottom: 14,
  },
  foto: { width: 130, height: 96, borderRadius: 10, overflow: "hidden", backgroundColor: colores.indigo, alignItems: "center", justifyContent: "center" },
  fotoImg: { width: "100%", height: "100%" },
  info: { flex: 1 },
  nombre: { fontSize: 18, fontWeight: "800", color: colores.indigo, marginBottom: 4 },
  linea: { flexDirection: "row", alignItems: "center", gap: 7, marginTop: 3 },
  lineaTexto: { color: colores.textoSuave, fontSize: 13, flexShrink: 1 },
  estadoFila: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 8 },
  estado: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 },
  estadoTexto: { fontSize: 11, fontWeight: "700" },
  dias: { color: colores.acento, fontWeight: "700", fontSize: 13 },

  acciones: { width: 190, gap: 8 },
  primario: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, height: 40,
    backgroundColor: colores.acento, borderRadius: 9,
  },
  primarioTexto: { color: colores.blanco, fontWeight: "800", fontSize: 14 },
  secundario: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, height: 40,
    borderRadius: 9, borderWidth: 1, borderColor: colores.borde, backgroundColor: colores.blanco,
  },
  secundarioTexto: { color: colores.indigo, fontWeight: "700", fontSize: 14 },
  puntuar: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, height: 40, borderRadius: 9,
    backgroundColor: "rgba(239,128,108,0.10)", borderWidth: 1, borderColor: "rgba(239,128,108,0.30)",
  },
  puntuarTexto: { color: "#B5503C", fontWeight: "700", fontSize: 13 },

  vacio: { textAlign: "center", color: colores.textoSuave, marginTop: 50 },
});
