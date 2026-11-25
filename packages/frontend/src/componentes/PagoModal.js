import { useEffect, useRef } from "react";
import { ActivityIndicator, Animated, Easing, Image, Modal, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import QRCode from "react-native-qrcode-svg";
import { colores, radios } from "../tema";
import { esWeb } from "../web";
import { formatearFechaLarga } from "../formato";
import { imagenDe } from "../imagenes";
import { textoLugar } from "../lugar";

const VERDE = "#148C5E";

// Pantalla completa del pago: "procesando" -> "exito" (se expande un círculo verde con el tilde) o "error".
// estado: null (oculto) | "procesando" | "exito" | "error"
export default function PagoModal({ estado, monto, mensaje, resumen, onContinuar, textoContinuar, onComprobante, onReintentar, onCerrar }) {
  const { width, height } = useWindowDimensions();
  const circulo = useRef(new Animated.Value(0)).current;
  const tilde = useRef(new Animated.Value(0)).current;

  // El círculo tiene que tapar toda la pantalla cuando termina de crecer.
  const diametro = Math.hypot(width, height) * 1.1;

  useEffect(() => {
    if (estado === "exito") {
      circulo.setValue(0);
      tilde.setValue(0);
      Animated.sequence([
        Animated.timing(circulo, { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.spring(tilde, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }),
      ]).start();
    }
  }, [estado, circulo, tilde]);

  return (
    <Modal visible={estado !== null} animationType="fade" statusBarTranslucent onRequestClose={() => {}}>
      <View style={styles.pantalla}>
        {estado === "procesando" && (
          <View style={styles.centro}>
            <ActivityIndicator size="large" color={colores.acento} />
            <Text style={styles.titulo}>Procesando tu pago...</Text>
            <Text style={styles.subtitulo}>No cierres la aplicación</Text>
          </View>
        )}

        {/* Web: en vez del círculo verde, una tarjeta de "Compra exitosa" con el resumen y el QR. */}
        {estado === "exito" && esWeb && (
          <View style={styles.webFondo}>
            <View style={styles.webTarjeta}>
              <View style={styles.webTilde}>
                <Ionicons name="checkmark" size={34} color={colores.blanco} />
              </View>
              <Text style={styles.webTitulo}>¡Compra Exitosa!</Text>
              <Text style={styles.webSubtitulo}>
                {resumen?.orden ? `Tu orden #${resumen.orden} se completó con éxito. ` : ""}Pagaste {monto}.
              </Text>

              {resumen && (
                <View style={styles.webResumen}>
                  <View style={styles.webFoto}>
                    {imagenDe(resumen.evento) ? (
                      <Image source={imagenDe(resumen.evento)} style={styles.webFotoImg} resizeMode="cover" />
                    ) : (
                      <Ionicons name="ticket" size={26} color={colores.acento} />
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.webEvento} numberOfLines={2}>{resumen.evento.nombre}</Text>
                    <Text style={styles.webDetalle}>{formatearFechaLarga(resumen.evento.fecha)}</Text>
                    {resumen.evento.lugar && <Text style={styles.webDetalle} numberOfLines={1}>{textoLugar(resumen.evento.lugar)}</Text>}
                    <Text style={styles.webLineas}>{resumen.lineas}</Text>
                  </View>
                  <QRCode value={resumen.codigo} size={110} />
                </View>
              )}
              <Text style={styles.webNota}>Presentá este código QR en el ingreso al predio.</Text>

              <View style={styles.webBotones}>
                {onComprobante && (
                  <Pressable style={[styles.webBoton, styles.webBotonPrimario]} onPress={onComprobante}>
                    <Ionicons name="download-outline" size={17} color={colores.blanco} />
                    <Text style={styles.webBotonPrimarioTexto}>Descargar PDF</Text>
                  </Pressable>
                )}
                <Pressable style={styles.webBoton} onPress={onContinuar}>
                  <Text style={styles.webBotonTexto}>{textoContinuar}</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}

        {estado === "exito" && !esWeb && (
          <>
            <Animated.View
              style={[
                styles.circuloVerde,
                {
                  width: diametro,
                  height: diametro,
                  borderRadius: diametro / 2,
                  left: (width - diametro) / 2,
                  top: (height - diametro) / 2,
                  transform: [{ scale: circulo }],
                },
              ]}
            />
            <View style={styles.centro}>
              <Animated.View style={{ opacity: tilde, transform: [{ scale: tilde }] }}>
                <View style={styles.tilde}>
                  <Ionicons name="checkmark" size={72} color={VERDE} />
                </View>
              </Animated.View>
              <Animated.View style={{ opacity: tilde, alignItems: "center" }}>
                <Text style={styles.tituloBlanco}>¡Pagaste {monto}!</Text>
                <Text style={styles.subtituloBlanco}>{mensaje}</Text>
                <Pressable style={styles.botonBlanco} onPress={onContinuar}>
                  <Text style={styles.botonBlancoTexto}>{textoContinuar}</Text>
                </Pressable>
                {onComprobante && (
                  <Pressable style={styles.botonContorno} onPress={onComprobante}>
                    <Ionicons name="document-text-outline" size={18} color={colores.blanco} />
                    <Text style={styles.botonContornoTexto}>Descargar comprobante</Text>
                  </Pressable>
                )}
              </Animated.View>
            </View>
          </>
        )}

        {estado === "error" && (
          <View style={styles.centro}>
            <Ionicons name="close-circle" size={88} color={colores.error} />
            <Text style={styles.titulo}>No se pudo completar el pago</Text>
            <Text style={styles.subtitulo}>{mensaje}</Text>
            {onReintentar && (
              <Pressable style={styles.botonCoral} onPress={onReintentar}>
                <Text style={styles.botonCoralTexto}>Reintentar</Text>
              </Pressable>
            )}
            <Pressable style={styles.botonSecundario} onPress={onCerrar}>
              <Text style={styles.botonSecundarioTexto}>Cerrar</Text>
            </Pressable>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.blanco, overflow: "hidden" },
  centro: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32, gap: 12 },
  circuloVerde: { position: "absolute", backgroundColor: VERDE },

  titulo: { fontSize: 22, fontWeight: "800", color: colores.indigo, textAlign: "center", marginTop: 8 },
  subtitulo: { color: colores.textoSuave, textAlign: "center" },

  tilde: {
    width: 130, height: 130, borderRadius: 65, backgroundColor: colores.blanco,
    alignItems: "center", justifyContent: "center", marginBottom: 12,
  },
  tituloBlanco: { fontSize: 28, fontWeight: "800", color: colores.blanco, textAlign: "center" },
  subtituloBlanco: { color: "rgba(255,255,255,0.9)", textAlign: "center", marginTop: 6 },
  botonBlanco: {
    marginTop: 32, backgroundColor: colores.blanco, borderRadius: radios.boton,
    paddingHorizontal: 32, paddingVertical: 14,
  },
  botonBlancoTexto: { color: VERDE, fontWeight: "800", fontSize: 16 },
  botonContorno: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 12,
    borderWidth: 1.5, borderColor: "rgba(255,255,255,0.9)", borderRadius: radios.boton,
    paddingHorizontal: 24, paddingVertical: 12,
  },
  botonContornoTexto: { color: colores.blanco, fontWeight: "700", fontSize: 15 },

  webFondo: { flex: 1, backgroundColor: colores.fondo, alignItems: "center", justifyContent: "center", padding: 24 },
  webTarjeta: {
    width: "100%", maxWidth: 620, backgroundColor: colores.blanco, borderRadius: 20, padding: 32, alignItems: "center",
    borderWidth: 1, borderColor: colores.borde, boxShadow: "0 12px 40px rgba(15,23,42,0.10)",
  },
  webTilde: { width: 64, height: 64, borderRadius: 32, backgroundColor: VERDE, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  webTitulo: { fontSize: 28, fontWeight: "800", color: colores.indigo },
  webSubtitulo: { color: colores.textoSuave, textAlign: "center", marginTop: 6 },
  webResumen: {
    alignSelf: "stretch", flexDirection: "row", alignItems: "center", gap: 14, marginTop: 24, padding: 14,
    borderRadius: 14, borderWidth: 1, borderColor: colores.borde, backgroundColor: colores.fondo,
  },
  webFoto: { width: 76, height: 76, borderRadius: 10, overflow: "hidden", backgroundColor: colores.indigo, alignItems: "center", justifyContent: "center" },
  webFotoImg: { width: "100%", height: "100%" },
  webEvento: { fontSize: 16, fontWeight: "800", color: colores.indigo },
  webDetalle: { color: colores.textoSuave, fontSize: 13, marginTop: 2 },
  webLineas: { color: colores.indigo, fontWeight: "700", fontSize: 13, marginTop: 6 },
  webNota: { color: colores.textoSuave, fontSize: 13, marginTop: 14 },
  webBotones: { flexDirection: "row", gap: 12, marginTop: 24, alignSelf: "stretch" },
  webBoton: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 46,
    borderRadius: 10, borderWidth: 1, borderColor: colores.borde, backgroundColor: colores.blanco,
  },
  webBotonTexto: { color: colores.indigo, fontWeight: "700" },
  webBotonPrimario: { backgroundColor: colores.acento, borderColor: colores.acento },
  webBotonPrimarioTexto: { color: colores.blanco, fontWeight: "800" },

  botonCoral: { marginTop: 20, backgroundColor: colores.acento, borderRadius: radios.boton, paddingHorizontal: 36, paddingVertical: 14 },
  botonCoralTexto: { color: colores.blanco, fontWeight: "700", fontSize: 16 },
  botonSecundario: { paddingVertical: 12 },
  botonSecundarioTexto: { color: colores.textoSuave, fontWeight: "600" },
});
