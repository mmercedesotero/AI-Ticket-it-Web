import { useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { alerta } from "../dialogo";
import { enviar, get } from "../api";
import { descargarComprobante } from "../comprobante";
import { pagarCompras } from "../pago";
import { codigoDe, HORAS_RESERVA } from "../compras";
import { formatearPrecio, yaSeRealizo } from "../formato";
import ConfirmarCompraModal from "./ConfirmarCompraModal";
import PagoModal from "./PagoModal";
import SelectorTarjeta from "./SelectorTarjeta";
import { colores } from "../tema";

// Panel lateral de la página del evento (web): elegir entradas, tarjeta y pagar sin cambiar de pantalla.
// Tiene la misma lógica que la pantalla "Seleccionar entradas" del celular.
export default function PanelCompraWeb({ evento, navigation }) {
  const [cantidades, setCantidades] = useState({});
  const [tarjetaId, setTarjetaId] = useState(null);
  const [confirmando, setConfirmando] = useState(false);
  const [reservando, setReservando] = useState(false);
  const [estadoPago, setEstadoPago] = useState(null);
  const [mensajePago, setMensajePago] = useState("");
  const [resumen, setResumen] = useState(null);

  // Para poder reintentar sin duplicar compras: qué compras ya se crearon y cuáles ya se pagaron.
  const creadas = useRef(new Map());
  const pagadas = useRef(new Set());

  const finalizado = yaSeRealizo(evento.fecha);

  const elegidas = evento.tiposEntrada
    .filter((t) => (cantidades[t.id] ?? 0) > 0)
    .map((t) => ({ tipo: t, cantidad: cantidades[t.id] }));
  const total = elegidas.reduce((suma, e) => suma + e.tipo.precio * e.cantidad, 0);
  const sinElegir = total === 0 || finalizado;

  const cambiar = (tipo, diferencia) =>
    setCantidades((actuales) => ({
      ...actuales,
      [tipo.id]: Math.min(tipo.cupoDisponible, Math.max(0, (actuales[tipo.id] ?? 0) + diferencia)),
    }));

  // Crea una compra por cada tipo elegido (el backend compra un tipo por vez). Quedan "pendientes de pago".
  const crearCompras = async () => {
    for (const e of elegidas) {
      const clave = `${e.tipo.id}x${e.cantidad}`;
      if (creadas.current.has(clave)) continue;
      const compra = await enviar("POST", "/compras", { eventoId: evento.id, entradaId: e.tipo.id, cantidad: e.cantidad });
      creadas.current.set(clave, compra.id);
    }
  };

  const reservar = async () => {
    if (reservando) return;
    setReservando(true);
    try {
      await crearCompras();
      alerta(
        "¡Entradas reservadas!",
        `Te las guardamos por ${HORAS_RESERVA} horas. Pagalas desde Mis compras antes de que venza la reserva: si no, se cancelan solas y vuelven a estar disponibles.`,
        [{ text: "Ver mis compras", onPress: () => navigation.navigate("Inicio", { screen: "Mis compras" }) }]
      );
    } catch (e) {
      alerta("No se pudo reservar", e.message);
    } finally {
      setReservando(false);
    }
  };

  const ejecutarPago = async () => {
    setEstadoPago("procesando");
    try {
      await crearCompras();
      const porPagar = elegidas
        .map((e) => creadas.current.get(`${e.tipo.id}x${e.cantidad}`))
        .filter((idCompra) => !pagadas.current.has(idCompra));
      await pagarCompras(porPagar, tarjetaId, (idCompra) => pagadas.current.add(idCompra));

      const primera = [...creadas.current.values()][0];
      setResumen({
        evento,
        orden: primera,
        codigo: codigoDe({ id: primera, evento }),
        lineas: elegidas.map((e) => `${e.cantidad}x ${e.tipo.nombre}`).join(" · "),
        total: formatearPrecio(total),
      });
      setMensajePago("Tus entradas ya están confirmadas.");
      setEstadoPago("exito");
    } catch (e) {
      const reservadas = creadas.current.size > 0;
      setMensajePago(
        reservadas ? `${e.message}\nTus entradas quedaron reservadas: podés reintentar o pagarlas después desde Mis compras.` : e.message
      );
      setEstadoPago("error");
    }
  };

  const confirmarPago = () => {
    if (tarjetaId === null) {
      alerta("Elegí una tarjeta", "Agregá o elegí una tarjeta para poder pagar.");
      return;
    }
    setConfirmando(true);
  };

  return (
    <View style={styles.panel}>
      <Text style={styles.titulo}>Seleccionar Entradas</Text>

      {evento.tiposEntrada.length === 0 && <Text style={styles.detalle}>Este evento todavía no tiene entradas a la venta.</Text>}

      {evento.tiposEntrada.map((tipo) => {
        const cantidad = cantidades[tipo.id] ?? 0;
        const agotada = tipo.cupoDisponible === 0;
        const sinMas = agotada || cantidad >= tipo.cupoDisponible || finalizado;

        return (
          <View key={tipo.id} style={[styles.tipo, cantidad > 0 && styles.tipoElegido]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.tipoNombre}>{tipo.nombre}</Text>
              <Text style={styles.tipoPrecio}>{formatearPrecio(tipo.precio)}</Text>
              <Text style={styles.detalle}>{agotada ? "Agotada" : `${tipo.ubicacion ? `${tipo.ubicacion} · ` : ""}quedan ${tipo.cupoDisponible}`}</Text>
            </View>
            <View style={styles.selector}>
              <Pressable style={[styles.paso, cantidad === 0 && styles.pasoInactivo]} disabled={cantidad === 0} onPress={() => cambiar(tipo, -1)}>
                <Ionicons name="remove" size={18} color={cantidad === 0 ? colores.textoPlaceholder : colores.blanco} />
              </Pressable>
              <Text style={styles.cantidad}>{cantidad}</Text>
              <Pressable style={[styles.paso, sinMas && styles.pasoInactivo]} disabled={sinMas} onPress={() => cambiar(tipo, 1)}>
                <Ionicons name="add" size={18} color={sinMas ? colores.textoPlaceholder : colores.blanco} />
              </Pressable>
            </View>
          </View>
        );
      })}

      {!finalizado && (
        <>
          <Text style={styles.seccion}>Método de pago</Text>
          <SelectorTarjeta seleccionada={tarjetaId} onSeleccionar={setTarjetaId} onAgregar={() => navigation.navigate("AgregarTarjeta")} />
        </>
      )}

      <View style={styles.resumen}>
        {elegidas.map((e) => (
          <View key={e.tipo.id} style={styles.fila}>
            <Text style={styles.filaTexto}>{e.cantidad} × {e.tipo.nombre}</Text>
            <Text style={styles.filaTexto}>{formatearPrecio(e.tipo.precio * e.cantidad)}</Text>
          </View>
        ))}
        <View style={[styles.fila, elegidas.length > 0 && styles.filaTotal]}>
          <Text style={styles.total}>Total</Text>
          <Text style={styles.total}>{formatearPrecio(total)}</Text>
        </View>
      </View>

      <Pressable style={[styles.pagar, sinElegir && styles.pagarInactivo]} disabled={sinElegir} onPress={confirmarPago}>
        <Text style={styles.pagarTexto}>{finalizado ? "Evento finalizado" : "Confirmar y pagar"}</Text>
      </Pressable>
      {!sinElegir && (
        <Pressable style={styles.reservar} onPress={reservar} disabled={reservando}>
          <Text style={styles.reservarTexto}>{reservando ? "Reservando..." : "Reservar sin pagar"}</Text>
        </Pressable>
      )}

      <ConfirmarCompraModal
        visible={confirmando}
        evento={evento}
        elegidas={elegidas}
        tarjetaId={tarjetaId}
        total={total}
        onCancelar={() => setConfirmando(false)}
        onConfirmar={() => {
          setConfirmando(false);
          ejecutarPago();
        }}
      />

      <PagoModal
        estado={estadoPago}
        monto={formatearPrecio(total)}
        mensaje={mensajePago}
        resumen={resumen}
        textoContinuar="Ir a Mis Compras"
        onComprobante={() => descargarComprobante(Promise.all([...creadas.current.values()].map((idCompra) => get(`/compras/${idCompra}`))))}
        onContinuar={() => {
          setEstadoPago(null);
          navigation.navigate("Inicio", { screen: "Mis compras" });
        }}
        onReintentar={ejecutarPago}
        onCerrar={() => setEstadoPago(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { backgroundColor: colores.blanco, borderRadius: 16, borderWidth: 1, borderColor: colores.borde, padding: 18, boxShadow: "0 2px 10px rgba(15,23,42,0.06)" },
  titulo: { fontSize: 18, fontWeight: "800", color: colores.indigo, marginBottom: 12 },
  seccion: { fontSize: 14, fontWeight: "800", color: colores.indigo, marginTop: 16, marginBottom: 8 },
  detalle: { color: colores.textoSuave, fontSize: 12, marginTop: 1 },

  tipo: {
    flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 12, padding: 12, marginBottom: 8,
    borderWidth: 1, borderColor: colores.borde,
  },
  tipoElegido: { borderColor: colores.acento, backgroundColor: colores.acentoSuave },
  tipoNombre: { fontWeight: "700", color: colores.indigo, fontSize: 15 },
  tipoPrecio: { fontWeight: "800", color: colores.indigo, marginTop: 1, fontSize: 13 },
  selector: { flexDirection: "row", alignItems: "center", gap: 10 },
  paso: { width: 30, height: 30, borderRadius: 15, backgroundColor: colores.acento, alignItems: "center", justifyContent: "center" },
  pasoInactivo: { backgroundColor: colores.borde },
  cantidad: { fontSize: 16, fontWeight: "800", color: colores.indigo, minWidth: 18, textAlign: "center" },

  resumen: { marginTop: 16, gap: 6 },
  fila: { flexDirection: "row", justifyContent: "space-between" },
  filaTexto: { color: colores.textoSuave, fontSize: 14 },
  filaTotal: { paddingTop: 8, borderTopWidth: 1, borderColor: colores.borde },
  total: { fontWeight: "800", color: colores.indigo, fontSize: 16 },

  pagar: { marginTop: 16, backgroundColor: colores.acento, borderRadius: 10, paddingVertical: 14, alignItems: "center" },
  pagarInactivo: { backgroundColor: colores.textoPlaceholder },
  pagarTexto: { color: colores.blanco, fontWeight: "800", fontSize: 15 },
  reservar: { alignItems: "center", paddingTop: 12 },
  reservarTexto: { color: "#B5503C", fontWeight: "700", fontSize: 13 },
});
