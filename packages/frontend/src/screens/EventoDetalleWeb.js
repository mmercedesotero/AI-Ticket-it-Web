import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BotonFavorito from "../componentes/BotonFavorito";
import Chip from "../componentes/Chip";
import PanelCompraWeb from "../componentes/PanelCompraWeb";
import { iconoDe } from "../componentes/TarjetaEvento";
import { colores } from "../tema";
import { formatearFechaLarga } from "../formato";
import { imagenDe } from "../imagenes";
import { abrirEnMapas, ciudadYPais } from "../lugar";

// Página del evento en la web de escritorio: a la izquierda toda la información y a la derecha
// un panel fijo para elegir las entradas y pagar. Los datos los carga EventoDetalleScreen.
export default function EventoDetalleWeb({ evento, organizador, esFavorito, alternarFavorito, chatear, navigation }) {
  const foto = imagenDe(evento);
  const sectores = [...new Set(evento.tiposEntrada.map((t) => t.ubicacion).filter(Boolean))];
  const hayPuntaje = organizador && organizador.puntajePromedio !== null;

  return (
    <ScrollView style={styles.pantalla} contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
      <Text style={styles.migas}>
        <Text onPress={() => navigation.navigate("Inicio", { screen: "Eventos" })} style={styles.migaEnlace}>Inicio</Text>
        {"  ›  "}
        {evento.categoria?.nombre ? <Text>{evento.categoria.nombre}{"  ›  "}</Text> : null}
        <Text style={styles.migaActual}>{evento.nombre}</Text>
      </Text>

      <View style={styles.columnas}>
        <View style={styles.principal}>
          <View style={styles.portada}>
            {foto ? <Image source={foto} style={styles.foto} resizeMode="cover" /> : <Ionicons name={iconoDe(evento)} size={72} color={colores.acento} />}
            <View style={styles.corazon}>
              <BotonFavorito activo={esFavorito} onPress={alternarFavorito} tamano={42} />
            </View>
          </View>

          <View style={styles.cuerpo}>
            <Text style={styles.titulo}>{evento.nombre}</Text>
            <View style={styles.puntajeFila}>
              <Ionicons name="star" size={16} color="#F59E0B" />
              <Text style={styles.puntajeTexto}>
                {hayPuntaje ? `${organizador.puntajePromedio} (${organizador.cantidad} ${organizador.cantidad === 1 ? "reseña" : "reseñas"})` : "Sin reseñas todavía"}
              </Text>
              {evento.categoria?.nombre ? (
                <View style={styles.etiqueta}>
                  <Text style={styles.etiquetaTexto}>{evento.categoria.nombre}</Text>
                </View>
              ) : null}
            </View>

            {evento.organizador && (
              <View style={styles.organizador}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarTexto}>{evento.organizador.nombre.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.organizadorEtiqueta}>Organizado por</Text>
                  <Text style={styles.organizadorNombre} numberOfLines={1}>{evento.organizador.nombre}</Text>
                </View>
                <Pressable style={styles.chatear} onPress={chatear}>
                  <Ionicons name="chatbubble-outline" size={15} color={colores.acento} />
                  <Text style={styles.chatearTexto}>Chatear</Text>
                </Pressable>
              </View>
            )}

            <View style={styles.info}>
              <FilaInfo icono="calendar-outline" titulo={formatearFechaLarga(evento.fecha)} />
              {evento.lugar && (
                <FilaInfo
                  icono="location-outline"
                  titulo={evento.lugar.nombre}
                  detalle={[evento.lugar.direccion, ciudadYPais(evento.lugar)].filter(Boolean).join(" · ")}
                  accion={<Chip etiqueta="Cómo llegar" icono="navigate-outline" onPress={() => abrirEnMapas(evento.lugar)} />}
                />
              )}
              {sectores.length > 0 && <FilaInfo icono="grid-outline" titulo="Sectores" detalle={sectores.join(" · ")} />}
              <FilaInfo icono="ticket-outline" titulo="Entradas digitales" detalle="Código QR en la app y en la web" />
            </View>

            <Text style={styles.seccion}>Sobre el evento</Text>
            <Text style={styles.descripcion}>{evento.descripcion || "El organizador no agregó una descripción."}</Text>

            {organizador && organizador.resenias.length > 0 && (
              <>
                <Text style={styles.seccion}>Reseñas del organizador</Text>
                <View style={styles.resenias}>
                  {organizador.resenias.map((r) => (
                    <View key={r.id} style={styles.resenia}>
                      <View style={styles.reseniaEncabezado}>
                        <Text style={styles.estrellas}>{"★".repeat(r.puntuacion)}{"☆".repeat(5 - r.puntuacion)}</Text>
                        <Text style={styles.reseniaEvento} numberOfLines={1}>{r.evento.nombre}</Text>
                      </View>
                      <Text style={styles.reseniaDetalle}>{r.detalle}</Text>
                      <Text style={styles.reseniaAutor}>{r.comprador}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}
          </View>
        </View>

        <View style={styles.lateral}>
          <PanelCompraWeb evento={evento} navigation={navigation} />
        </View>
      </View>
    </ScrollView>
  );
}

function FilaInfo({ icono, titulo, detalle, accion }) {
  return (
    <View style={styles.filaInfo}>
      <Ionicons name={icono} size={20} color={colores.indigo} />
      <View style={{ flex: 1 }}>
        <Text style={styles.filaInfoTitulo}>{titulo}</Text>
        {detalle ? <Text style={styles.filaInfoDetalle}>{detalle}</Text> : null}
      </View>
      {accion}
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.fondo },
  contenido: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 56 },
  migas: { color: colores.textoSuave, fontSize: 13, marginBottom: 16 },
  migaEnlace: { color: colores.textoSuave },
  migaActual: { color: colores.indigo, fontWeight: "700" },

  columnas: { flexDirection: "row", gap: 24, alignItems: "flex-start" },
  principal: { flex: 1, backgroundColor: colores.blanco, borderRadius: 16, borderWidth: 1, borderColor: colores.borde, overflow: "hidden" },
  lateral: { width: 370, position: "sticky", top: 16 },

  portada: { height: 330, backgroundColor: colores.indigo, alignItems: "center", justifyContent: "center" },
  foto: { width: "100%", height: "100%" },
  corazon: { position: "absolute", top: 14, right: 14 },

  cuerpo: { padding: 24 },
  titulo: { fontSize: 30, fontWeight: "800", color: colores.indigo },
  puntajeFila: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 },
  puntajeTexto: { color: colores.textoSuave },
  etiqueta: { backgroundColor: colores.acentoSuave, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3, marginLeft: 6 },
  etiquetaTexto: { color: colores.acento, fontWeight: "700", fontSize: 12 },

  organizador: {
    flexDirection: "row", alignItems: "center", gap: 12, marginTop: 20, padding: 14,
    borderRadius: 12, borderWidth: 1, borderColor: colores.borde,
  },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: colores.indigo, alignItems: "center", justifyContent: "center" },
  avatarTexto: { color: colores.blanco, fontWeight: "800", fontSize: 17 },
  organizadorEtiqueta: { fontSize: 12, color: colores.textoSuave },
  organizadorNombre: { fontWeight: "800", color: colores.indigo, fontSize: 15 },
  chatear: {
    flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1, borderColor: colores.acento,
    borderRadius: 9, paddingHorizontal: 14, paddingVertical: 9,
  },
  chatearTexto: { color: colores.acento, fontWeight: "700", fontSize: 13 },

  info: { marginTop: 18, gap: 14, padding: 16, borderRadius: 12, backgroundColor: colores.fondo },
  filaInfo: { flexDirection: "row", alignItems: "center", gap: 12 },
  filaInfoTitulo: { fontWeight: "700", color: colores.indigo },
  filaInfoDetalle: { fontSize: 13, color: colores.textoSuave, marginTop: 1 },

  seccion: { fontSize: 18, fontWeight: "800", color: colores.indigo, marginTop: 26, marginBottom: 8 },
  descripcion: { color: colores.indigo, lineHeight: 23 },

  resenias: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 },
  resenia: { backgroundColor: colores.fondo, borderRadius: 12, padding: 14 },
  reseniaEncabezado: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  estrellas: { color: "#F59E0B", fontSize: 15 },
  reseniaEvento: { color: colores.textoSuave, fontSize: 12, flexShrink: 1 },
  reseniaDetalle: { color: colores.indigo, marginTop: 6 },
  reseniaAutor: { color: colores.textoSuave, fontSize: 12, marginTop: 6 },
});
