import { useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { get } from "../api";
import { descargarComprobante } from "../comprobante";
import TicketCard from "../componentes/TicketCard";
import { iconoDe } from "../componentes/TarjetaEvento";
import { imagenDe } from "../imagenes";
import { textoLugar } from "../lugar";
import { ESTADOS, esPasada, estiloEstado, textoDias, textoReserva } from "../compras";
import { colores } from "../tema";
import { formatearFechaLarga, formatearPrecio } from "../formato";

// "Mis compras" de la web de escritorio: las mismas entradas con forma de ticket de la app, en dos columnas,
// con los botones de acción (ver QR, descargar PDF, pagar...) en la parte de abajo.
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
        <View style={styles.grilla}>
          {visibles.map((c) => (
            <Entrada key={c.id} compra={c} navigation={navigation} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function Entrada({ compra, navigation }) {
  const estado = ESTADOS[compra.estado];
  const pendiente = compra.estado === "PENDIENTE_PAGO" && !esPasada(compra);
  const foto = imagenDe(compra.evento);
  const verEntrada = () => navigation.navigate("Entrada", { compraId: compra.id });

  return (
    <TicketCard
      arriba={
        <Pressable style={styles.arribaFila} onPress={verEntrada}>
          <View style={styles.info}>
            <View style={[styles.estado, estiloEstado(estado).etiqueta]}>
              <Text style={[styles.estadoTexto, estiloEstado(estado).texto]}>{estado.texto}</Text>
            </View>
            <Text style={styles.nombre} numberOfLines={2}>{compra.evento.nombre}</Text>
            <Linea icono="calendar-outline" texto={formatearFechaLarga(compra.evento.fecha)} />
            {compra.evento.lugar && <Linea icono="location-outline" texto={textoLugar(compra.evento.lugar)} />}
            <Linea icono="business-outline" texto={compra.evento.organizador?.nombre ?? "Sin organizador"} />
            {pendiente && <Text style={styles.dias}>{textoReserva(compra)}</Text>}
            {compra.diasParaEvento !== null && compra.diasParaEvento !== undefined && <Text style={styles.dias}>{textoDias(compra.diasParaEvento)}</Text>}
          </View>

          <View style={styles.foto}>
            {foto ? <Image source={foto} style={styles.fotoImg} resizeMode="cover" /> : <Ionicons name={iconoDe(compra.evento)} size={30} color={colores.acento} />}
          </View>
        </Pressable>
      }
      abajo={
        <View>
          <View style={styles.abajoFila}>
            <View style={styles.entrada}>
              <Ionicons name="ticket-outline" size={16} color={colores.indigo} />
              <Text style={styles.entradaTexto}>{compra.cantidad} × {compra.tipoEntrada.nombre}</Text>
            </View>
            <Text style={styles.total}>{formatearPrecio(compra.total)}</Text>
          </View>

          <View style={styles.botones}>
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
          </View>

          {compra.estado === "UTILIZADA" && (
            <Pressable style={styles.puntuar} onPress={() => navigation.navigate("Resena", { compraId: compra.id, evento: compra.evento.nombre })}>
              <Ionicons name="star" size={15} color="#B5503C" />
              <Text style={styles.puntuarTexto}>Puntuar evento</Text>
            </Pressable>
          )}
        </View>
      }
    />
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
  titulo: { fontSize: 28, fontWeight: "700", color: colores.indigo },
  subtitulo: { color: colores.textoSuave, marginTop: 2, marginBottom: 20 },

  pestanias: { flexDirection: "row", gap: 24, borderBottomWidth: 1, borderColor: colores.borde, marginBottom: 22 },
  pestania: { paddingVertical: 10, borderBottomWidth: 2, borderColor: "transparent", marginBottom: -1 },
  pestaniaActiva: { borderColor: colores.acento },
  pestaniaTexto: { color: colores.textoSuave, fontWeight: "500" },
  pestaniaTextoActivo: { color: colores.indigo, fontWeight: "600" },

  grilla: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(440px, 1fr))", columnGap: 22 },

  arribaFila: { flexDirection: "row", justifyContent: "space-between", gap: 10 },
  info: { flex: 1 },
  nombre: { fontSize: 17, fontWeight: "700", color: colores.indigo, marginBottom: 4 },
  linea: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 },
  lineaTexto: { color: colores.textoSuave, fontSize: 13, flexShrink: 1 },
  dias: { color: colores.acento, fontWeight: "600", fontSize: 13, marginTop: 6 },
  foto: { width: 92, height: 92, borderRadius: 10, overflow: "hidden", backgroundColor: colores.indigo, alignItems: "center", justifyContent: "center" },
  fotoImg: { width: "100%", height: "100%" },
  estado: { alignSelf: "flex-start", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3, marginBottom: 6 },
  estadoTexto: { fontSize: 11, fontWeight: "600" },

  abajoFila: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  entrada: { flexDirection: "row", alignItems: "center", gap: 8 },
  entradaTexto: { fontWeight: "500", color: colores.indigo },
  total: { fontWeight: "700", color: colores.indigo, fontSize: 16 },

  botones: { flexDirection: "row", gap: 10, marginTop: 12 },
  primario: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, height: 42,
    backgroundColor: colores.acento, borderRadius: 10,
  },
  primarioTexto: { color: colores.blanco, fontWeight: "600", fontSize: 14 },
  secundario: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, height: 42,
    borderRadius: 10, borderWidth: 1, borderColor: colores.borde, backgroundColor: colores.blanco,
  },
  secundarioTexto: { color: colores.indigo, fontWeight: "500", fontSize: 14 },
  puntuar: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, height: 42, borderRadius: 10, marginTop: 10,
    backgroundColor: "rgba(239,128,108,0.10)", borderWidth: 1, borderColor: "rgba(239,128,108,0.30)",
  },
  puntuarTexto: { color: "#B5503C", fontWeight: "600", fontSize: 13 },

  vacio: { textAlign: "center", color: colores.textoSuave, marginTop: 50 },
});
