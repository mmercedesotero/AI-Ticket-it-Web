import { useState } from "react";
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import QRCode from "react-native-qrcode-svg";
import { descargarComprobante } from "../comprobante";
import { iconoDe } from "../componentes/TarjetaEvento";
import { ESTADOS, estiloEstado, codigoDe, esPasada, textoDias, textoReserva } from "../compras";
import { colores } from "../tema";
import { formatearFechaHora, formatearFechaLarga, formatearPrecio } from "../formato";
import { imagenDe } from "../imagenes";
import { abrirEnMapas, direccionCompleta } from "../lugar";

// Detalle de una entrada en la web de escritorio: a la izquierda el evento y los datos de la compra,
// y a la derecha la entrada digital con su código QR y las acciones. Los datos los arma EntradaScreen.
export default function EntradaWeb({ compra, linea, siguiente, dias, cancelar, navigation }) {
  const [qrGrande, setQrGrande] = useState(false);
  const estado = ESTADOS[compra.estado];
  const pasada = esPasada(compra);
  const pendiente = compra.estado === "PENDIENTE_PAGO" && !pasada;
  const confirmada = compra.estado === "CONFIRMADA" && !pasada;
  const foto = imagenDe(compra.evento);
  const comprado = compra.historial?.[0]?.fechaHora;
  const pagar = () =>
    navigation.navigate("Pagar", { compraId: compra.id, total: compra.total, titulo: `${compra.cantidad} × ${compra.tipoEntrada.nombre} · ${compra.evento.nombre}` });

  return (
    <ScrollView style={styles.pantalla} contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
      <View style={styles.columnas}>
        {/* ---- Izquierda: el evento y la compra ---- */}
        <View style={styles.principal}>
          <View style={styles.tarjeta}>
            <View style={styles.portada}>
              {foto ? <Image source={foto} style={styles.foto} resizeMode="cover" /> : <Ionicons name={iconoDe(compra.evento)} size={56} color={colores.acento} />}
              <View style={styles.etiquetas}>
                {compra.evento.categoria?.nombre ? (
                  <View style={styles.etiqueta}>
                    <Text style={styles.etiquetaTexto}>{compra.evento.categoria.nombre}</Text>
                  </View>
                ) : null}
                <View style={[styles.etiqueta, { backgroundColor: estado.color }]}>
                  <Text style={styles.etiquetaTexto}>{estado.texto}</Text>
                </View>
              </View>
            </View>

            <View style={styles.cuerpo}>
              <Text style={styles.nombre}>{compra.evento.nombre}</Text>

              <Fila icono="calendar-outline" etiqueta="Fecha" valor={formatearFechaLarga(compra.evento.fecha)} />
              {compra.evento.lugar && (
                <Fila
                  icono="location-outline"
                  etiqueta="Lugar"
                  valor={direccionCompleta(compra.evento.lugar)}
                  accion={
                    <Pressable onPress={() => abrirEnMapas(compra.evento.lugar)} hitSlop={6}>
                      <Text style={styles.enlace}>Cómo llegar →</Text>
                    </Pressable>
                  }
                />
              )}
              <Fila
                icono="business-outline"
                etiqueta="Organiza"
                valor={compra.evento.organizador?.nombre ?? "Sin organizador"}
                accion={
                  <Pressable style={styles.chatear} onPress={() => navigation.navigate("Chat", { compraId: compra.id })}>
                    <Ionicons name="chatbubble-outline" size={14} color={colores.acento} />
                    <Text style={styles.chatearTexto}>Chatear</Text>
                  </Pressable>
                }
              />
            </View>
          </View>

          <View style={styles.tarjeta}>
            <View style={styles.cuerpo}>
              <Text style={styles.seccion}>Detalles de la compra</Text>
              <View style={styles.datos}>
                <Dato etiqueta="Entrada" valor={compra.tipoEntrada.nombre} />
                <Dato etiqueta="Cantidad" valor={`${compra.cantidad} ${compra.cantidad === 1 ? "entrada" : "entradas"}`} />
                <Dato etiqueta="Total" valor={formatearPrecio(compra.total)} />
                <Dato etiqueta="Compra N°" valor={`#${compra.id}`} />
                {compra.tipoEntrada.ubicacion ? <Dato etiqueta="Sector" valor={compra.tipoEntrada.ubicacion} /> : null}
                {comprado ? <Dato etiqueta="Comprada el" valor={formatearFechaHora(comprado)} /> : null}
              </View>
            </View>
          </View>

          <View style={styles.tarjeta}>
            <View style={styles.cuerpo}>
              <Text style={styles.seccion}>Historial</Text>
              {linea.map((p, i) => (
                <Paso key={i} {...p} ultimo={i === linea.length - 1 && !siguiente} />
              ))}
              {siguiente && <Paso titulo={siguiente} pendiente ultimo />}
              {linea.length === 0 && <Text style={styles.detalle}>Todavía no hay movimientos.</Text>}
            </View>
          </View>
        </View>

        {/* ---- Derecha: la entrada digital ---- */}
        <View style={styles.lateral}>
          <View style={styles.entrada}>
            <Text style={styles.entradaTitulo}>Entrada digital</Text>
            <View style={[styles.estado, estiloEstado(estado).etiqueta]}>
              <Text style={[styles.estadoTexto, estiloEstado(estado).texto]}>{estado.texto}</Text>
            </View>

            <View style={styles.separador}>
              <View style={[styles.muesca, { left: -13 }]} />
              <View style={styles.rayas} />
              <View style={[styles.muesca, { right: -13 }]} />
            </View>

            {confirmada ? (
              <View style={styles.qrBloque}>
                <Pressable style={styles.qr} onPress={() => setQrGrande(true)}>
                  <QRCode value={codigoDe(compra)} size={190} />
                </Pressable>
                <Text style={styles.detalle}>Hacé clic en el código para agrandarlo</Text>
                <Text style={styles.codigo}>{codigoDe(compra)}</Text>
                {dias !== null && dias >= 0 && (
                  <View style={styles.dias}>
                    <Ionicons name="time-outline" size={16} color={colores.exito} />
                    <Text style={styles.diasTexto}>{textoDias(dias)} para el evento</Text>
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.sinQr}>
                <Ionicons name={pendiente ? "lock-closed-outline" : "qr-code-outline"} size={44} color={colores.textoPlaceholder} />
                <Text style={styles.sinQrTexto}>{pendiente ? "Pagá la compra para activar tu código QR" : "Este código ya no está disponible"}</Text>
                {pendiente && (
                  <View style={styles.dias}>
                    <Ionicons name="hourglass-outline" size={16} color={colores.acento} />
                    <Text style={[styles.diasTexto, { color: colores.acento }]}>{textoReserva(compra)}</Text>
                  </View>
                )}
              </View>
            )}

            <View style={styles.acciones}>
              {pendiente && (
                <Pressable style={styles.primario} onPress={pagar}>
                  <Ionicons name="card-outline" size={17} color={colores.blanco} />
                  <Text style={styles.primarioTexto}>Pagar {formatearPrecio(compra.total)}</Text>
                </Pressable>
              )}
              {compra.estado === "UTILIZADA" && (
                <Pressable style={styles.puntuar} onPress={() => navigation.navigate("Resena", { compraId: compra.id, evento: compra.evento.nombre })}>
                  <Ionicons name="star" size={16} color="#B45309" />
                  <Text style={styles.puntuarTexto}>Puntuar evento</Text>
                </Pressable>
              )}
              {(compra.estado === "CONFIRMADA" || compra.estado === "UTILIZADA") && (
                <Pressable style={styles.secundario} onPress={() => descargarComprobante([compra])}>
                  <Ionicons name="download-outline" size={17} color={colores.indigo} />
                  <Text style={styles.secundarioTexto}>Descargar comprobante (PDF)</Text>
                </Pressable>
              )}
              {!pasada && (
                <Pressable style={styles.cancelar} onPress={cancelar}>
                  <Text style={styles.cancelarTexto}>Cancelar compra</Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>
      </View>

      <Modal visible={qrGrande} transparent animationType="fade" onRequestClose={() => setQrGrande(false)}>
        <Pressable style={styles.fondoModal} onPress={() => setQrGrande(false)}>
          <View style={styles.modalTarjeta}>
            <Text style={styles.modalTitulo}>{compra.evento.nombre}</Text>
            <Text style={styles.detalle}>{compra.cantidad} × {compra.tipoEntrada.nombre}</Text>
            <View style={{ marginVertical: 20 }}>
              <QRCode value={codigoDe(compra)} size={280} />
            </View>
            <Text style={styles.detalle}>Mostrá este código en el ingreso · clic para cerrar</Text>
          </View>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

function Fila({ icono, etiqueta, valor, accion }) {
  return (
    <View style={styles.fila}>
      <Ionicons name={icono} size={20} color={colores.indigo} />
      <View style={{ flex: 1 }}>
        <Text style={styles.filaEtiqueta}>{etiqueta}</Text>
        <Text style={styles.filaValor}>{valor}</Text>
      </View>
      {accion}
    </View>
  );
}

function Dato({ etiqueta, valor }) {
  return (
    <View style={styles.dato}>
      <Text style={styles.filaEtiqueta}>{etiqueta}</Text>
      <Text style={styles.datoValor}>{valor}</Text>
    </View>
  );
}

function Paso({ icono, titulo, detalle, actual, ultimo, pendiente, color = colores.acento }) {
  return (
    <View style={styles.paso}>
      <View style={styles.pasoColumna}>
        <View style={[styles.punto, pendiente ? styles.puntoPendiente : { backgroundColor: color }]}>
          {!pendiente && <Ionicons name={icono} size={13} color={colores.blanco} />}
        </View>
        {!ultimo && <View style={styles.pasoLinea} />}
      </View>
      <View style={{ flex: 1, paddingBottom: 16 }}>
        <Text style={[styles.pasoTitulo, pendiente && styles.pasoPendiente, actual && { fontWeight: "600" }]}>{titulo}</Text>
        {detalle ? <Text style={styles.detalle}>{detalle}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.fondo },
  contenido: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 56 },
  columnas: { flexDirection: "row", gap: 24, alignItems: "flex-start" },
  principal: { flex: 1, gap: 18 },
  lateral: { width: 380, position: "sticky", top: 16 },

  tarjeta: { backgroundColor: colores.blanco, borderRadius: 16, borderWidth: 1, borderColor: colores.borde, overflow: "hidden" },
  portada: { height: 230, backgroundColor: colores.indigo, alignItems: "center", justifyContent: "center" },
  foto: { width: "100%", height: "100%" },
  etiquetas: { position: "absolute", top: 14, left: 14, flexDirection: "row", gap: 8 },
  etiqueta: { backgroundColor: colores.indigo, borderRadius: 10, paddingHorizontal: 11, paddingVertical: 5 },
  etiquetaTexto: { color: colores.blanco, fontSize: 11, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.4 },

  cuerpo: { padding: 22 },
  nombre: { fontSize: 26, fontWeight: "700", color: colores.indigo, marginBottom: 8 },
  fila: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 10 },
  filaEtiqueta: { fontSize: 12, color: colores.textoSuave },
  filaValor: { fontSize: 15, color: colores.indigo, marginTop: 1 },
  enlace: { color: colores.acento, fontWeight: "600", fontSize: 13 },
  chatear: {
    flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1, borderColor: colores.acento,
    borderRadius: 9, paddingHorizontal: 13, paddingVertical: 8,
  },
  chatearTexto: { color: colores.acento, fontWeight: "600", fontSize: 13 },

  seccion: { fontSize: 17, fontWeight: "700", color: colores.indigo, marginBottom: 14 },
  datos: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", rowGap: 18, columnGap: 12 },
  dato: {},
  datoValor: { fontSize: 15, fontWeight: "600", color: colores.indigo, marginTop: 2 },
  detalle: { color: colores.textoSuave, fontSize: 13, marginTop: 2 },

  paso: { flexDirection: "row", gap: 14 },
  pasoColumna: { alignItems: "center", width: 26 },
  punto: { width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  puntoPendiente: { borderWidth: 2, borderColor: colores.borde, borderStyle: "dashed", backgroundColor: colores.blanco },
  pasoLinea: { flex: 1, width: 2, backgroundColor: colores.borde, marginVertical: 2, minHeight: 14 },
  pasoTitulo: { color: colores.indigo, fontWeight: "500" },
  pasoPendiente: { color: colores.textoPlaceholder },

  entrada: { backgroundColor: colores.blanco, borderRadius: 18, borderWidth: 1, borderColor: colores.borde, padding: 24, alignItems: "center", boxShadow: "0 8px 30px rgba(15,23,42,0.08)" },
  entradaTitulo: { fontSize: 20, fontWeight: "700", color: colores.indigo, marginBottom: 10 },
  estado: { borderRadius: 12, paddingHorizontal: 14, paddingVertical: 5 },
  estadoTexto: { fontSize: 12, fontWeight: "600" },
  separador: { alignSelf: "stretch", height: 26, justifyContent: "center", marginVertical: 14 },
  muesca: { position: "absolute", top: 0, width: 26, height: 26, borderRadius: 13, backgroundColor: colores.fondo, borderWidth: 1, borderColor: colores.borde },
  rayas: { borderTopWidth: 2, borderStyle: "dashed", borderColor: colores.borde, marginHorizontal: 18 },

  qrBloque: { alignItems: "center", gap: 6 },
  qr: { padding: 10, borderRadius: 12, borderWidth: 1, borderColor: colores.borde },
  codigo: { fontSize: 12, letterSpacing: 1, color: colores.textoSuave, fontWeight: "500" },
  sinQr: { alignItems: "center", gap: 8, paddingVertical: 16 },
  sinQrTexto: { color: colores.textoSuave, textAlign: "center" },
  dias: { flexDirection: "row", alignItems: "center", gap: 7, marginTop: 8 },
  diasTexto: { color: colores.exito, fontWeight: "600" },

  acciones: { alignSelf: "stretch", gap: 10, marginTop: 20 },
  primario: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 46, backgroundColor: colores.acento, borderRadius: 10 },
  primarioTexto: { color: colores.blanco, fontWeight: "700", fontSize: 15 },
  secundario: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 46,
    borderRadius: 10, borderWidth: 1, borderColor: colores.borde, backgroundColor: colores.blanco,
  },
  secundarioTexto: { color: colores.indigo, fontWeight: "600" },
  puntuar: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, height: 46,
    backgroundColor: "#FEF3C7", borderWidth: 1, borderColor: "#FCD34D", borderRadius: 10,
  },
  puntuarTexto: { color: "#B45309", fontWeight: "600" },
  cancelar: { alignItems: "center", paddingVertical: 8 },
  cancelarTexto: { color: colores.error, fontWeight: "500", fontSize: 13 },

  fondoModal: { flex: 1, backgroundColor: "rgba(15,23,42,0.75)", alignItems: "center", justifyContent: "center", padding: 24 },
  modalTarjeta: { backgroundColor: colores.blanco, borderRadius: 20, padding: 28, alignItems: "center", width: "100%", maxWidth: 420 },
  modalTitulo: { fontSize: 20, fontWeight: "700", color: colores.indigo, textAlign: "center" },
});
