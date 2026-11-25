import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Chip from "../componentes/Chip";
import { POCAS_ENTRADAS } from "../componentes/TarjetaEvento";
import { colores } from "../tema";
import { formatearFechaLarga, formatearPrecio } from "../formato";
import { imagenDe } from "../imagenes";

const CORAL_OSCURO = "#B5503C";
const porcentaje = (vendidas, capacidad) => (capacidad > 0 ? Math.round((vendidas / capacidad) * 100) : 0);

// Panel del organizador en la web de escritorio: indicadores arriba y una tabla con todos sus eventos.
export default function OrganizadorWeb({
  nombre, error, proximos, vendidas, capacidad, ingresos, activos, resenias,
  estado, setEstado, finalizados, eventos, visibles, navigation,
}) {
  return (
    <ScrollView style={styles.pantalla} contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
      <View style={styles.encabezado}>
        <View>
          <Text style={styles.titulo}>Panel del organizador</Text>
          <Text style={styles.subtitulo}>{nombre}</Text>
        </View>
        <Pressable style={styles.crear} onPress={() => navigation.navigate("CrearEvento")}>
          <Ionicons name="add" size={20} color={colores.blanco} />
          <Text style={styles.crearTexto}>Crear evento</Text>
        </Pressable>
      </View>

      {error && <Text style={styles.error}>Error: {error}</Text>}

      {proximos.map((d) => (
        <Pressable key={d.evento.id} style={styles.aviso} onPress={() => navigation.navigate("ComprasEvento", { id: d.evento.id })}>
          <Ionicons name="alarm" size={22} color={colores.acento} />
          <View style={{ flex: 1 }}>
            <Text style={styles.avisoTitulo}>{d.dias === 0 ? "¡Hoy es tu evento!" : "Mañana es tu evento"}</Text>
            <Text style={styles.avisoTexto}>{d.evento.nombre} · {d.vendidas} de {d.capacidad} entradas vendidas</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={CORAL_OSCURO} />
        </Pressable>
      ))}

      <View style={styles.indicadores}>
        <Indicador icono="cash-outline" etiqueta="Ingresos totales">
          <Text style={styles.valor}>{formatearPrecio(ingresos)}</Text>
        </Indicador>
        <Indicador icono="ticket-outline" etiqueta="Entradas vendidas">
          <Text style={styles.valor}>{vendidas} <Text style={styles.valorChico}>/ {capacidad}</Text></Text>
          <View style={styles.barraFondo}>
            <View style={[styles.barraRelleno, { width: `${Math.min(porcentaje(vendidas, capacidad), 100)}%` }]} />
          </View>
        </Indicador>
        <Indicador icono="calendar-outline" etiqueta="Eventos en venta">
          <Text style={styles.valor}>{activos.length}</Text>
        </Indicador>
        <Indicador icono="star-outline" etiqueta="Calificación">
          {resenias && resenias.puntajePromedio !== null ? (
            <Text style={styles.valor}>
              {resenias.puntajePromedio} <Ionicons name="star" size={18} color="#F59E0B" /> <Text style={styles.valorChico}>({resenias.cantidad})</Text>
            </Text>
          ) : (
            <Text style={styles.valorChico}>Sin reseñas todavía</Text>
          )}
        </Indicador>
      </View>

      <View style={styles.tabla}>
        <View style={styles.tablaTitulo}>
          <Text style={styles.tablaTituloTexto}>Mis eventos</Text>
          <View style={styles.filtros}>
            <Chip etiqueta={`Próximos (${activos.length})`} activo={estado === "proximos"} onPress={() => setEstado("proximos")} />
            <Chip etiqueta={`Finalizados (${finalizados.length})`} activo={estado === "finalizados"} onPress={() => setEstado("finalizados")} />
            <Chip etiqueta={`Todos (${eventos.length})`} activo={estado === "todos"} onPress={() => setEstado("todos")} />
          </View>
        </View>

        <View style={[styles.fila, styles.filaCabecera]}>
          <Text style={[styles.celdaCabecera, styles.colEvento]}>Evento</Text>
          <Text style={[styles.celdaCabecera, styles.colFecha]}>Fecha</Text>
          <Text style={[styles.celdaCabecera, styles.colCapacidad]}>Capacidad</Text>
          <Text style={[styles.celdaCabecera, styles.colVentas]}>Ventas</Text>
          <Text style={[styles.celdaCabecera, styles.colEstado]}>Estado</Text>
          <Text style={[styles.celdaCabecera, styles.colAcciones]} />
        </View>

        {visibles.map((d) => (
          <Fila key={d.evento.id} datos={d} navigation={navigation} />
        ))}

        {visibles.length === 0 && (
          <Text style={styles.vacio}>{eventos.length === 0 ? "Todavía no creaste eventos." : "No hay eventos en esta lista."}</Text>
        )}
      </View>
    </ScrollView>
  );
}

function Indicador({ icono, etiqueta, children }) {
  return (
    <View style={styles.indicador}>
      <View style={styles.indicadorCabecera}>
        <Ionicons name={icono} size={16} color={colores.acento} />
        <Text style={styles.indicadorEtiqueta}>{etiqueta}</Text>
      </View>
      {children}
    </View>
  );
}

function Fila({ datos, navigation }) {
  const { evento, vendidas, capacidad, restantes, finalizado } = datos;
  const foto = imagenDe(evento);
  const agotado = !finalizado && capacidad > 0 && restantes === 0;
  const agotandose = !finalizado && restantes > 0 && restantes <= POCAS_ENTRADAS;
  const texto = finalizado ? "Finalizado" : agotado ? "Agotado" : agotandose ? "Agotándose" : "En venta";
  const estiloEstado = finalizado ? styles.estadoGris : agotado ? styles.estadoOscuro : agotandose ? styles.estadoCoral : styles.estadoVerde;

  return (
    <View style={styles.fila}>
      <Pressable style={[styles.colEvento, styles.eventoCelda]} onPress={() => navigation.navigate("ComprasEvento", { id: evento.id })}>
        <View style={styles.miniatura}>
          {foto ? <Image source={foto} style={styles.foto} resizeMode="cover" /> : <Ionicons name="calendar" size={20} color={colores.acento} />}
        </View>
        <Text style={styles.nombre} numberOfLines={1}>{evento.nombre}</Text>
      </Pressable>
      <Text style={[styles.celda, styles.colFecha]}>{formatearFechaLarga(evento.fecha)}</Text>
      <Text style={[styles.celda, styles.colCapacidad]}>{capacidad}</Text>
      <Text style={[styles.celda, styles.colVentas]}>{vendidas}</Text>
      <View style={styles.colEstado}>
        <Text style={[styles.estado, estiloEstado]}>{texto}</Text>
      </View>
      <View style={[styles.colAcciones, styles.acciones]}>
        {!finalizado && <Chip etiqueta="Editar" icono="create-outline" onPress={() => navigation.navigate("CrearEvento", { eventoId: evento.id })} />}
        <Chip etiqueta="Gestionar" icono="options-outline" onPress={() => navigation.navigate("ComprasEvento", { id: evento.id })} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.fondo },
  contenido: { paddingHorizontal: 24, paddingTop: 28, paddingBottom: 56 },
  encabezado: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  titulo: { fontSize: 28, fontWeight: "800", color: colores.indigo },
  subtitulo: { color: colores.textoSuave, marginTop: 2 },
  crear: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: colores.acento, borderRadius: 10, paddingHorizontal: 18, height: 44 },
  crearTexto: { color: colores.blanco, fontWeight: "800", fontSize: 15 },
  error: { color: colores.error, marginBottom: 12 },

  aviso: {
    flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colores.acentoSuave, borderWidth: 1,
    borderColor: "rgba(239,128,108,0.45)", borderRadius: 12, padding: 14, marginBottom: 12,
  },
  avisoTitulo: { fontWeight: "800", color: colores.indigo },
  avisoTexto: { color: CORAL_OSCURO, marginTop: 2, fontSize: 13 },

  indicadores: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 24 },
  indicador: { backgroundColor: colores.blanco, borderRadius: 14, borderWidth: 1, borderColor: colores.borde, padding: 18 },
  indicadorCabecera: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  indicadorEtiqueta: { color: colores.textoSuave, fontSize: 13 },
  valor: { fontSize: 26, fontWeight: "800", color: colores.indigo },
  valorChico: { fontSize: 14, fontWeight: "500", color: colores.textoSuave },
  barraFondo: { height: 6, borderRadius: 3, backgroundColor: "#E2E8F0", overflow: "hidden", marginTop: 10 },
  barraRelleno: { height: "100%", borderRadius: 3, backgroundColor: colores.acento },

  tabla: { backgroundColor: colores.blanco, borderRadius: 14, borderWidth: 1, borderColor: colores.borde, overflow: "hidden" },
  tablaTitulo: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 18 },
  tablaTituloTexto: { fontSize: 18, fontWeight: "800", color: colores.indigo },
  filtros: { flexDirection: "row", gap: 8 },
  fila: { flexDirection: "row", alignItems: "center", paddingHorizontal: 18, paddingVertical: 12, borderTopWidth: 1, borderColor: colores.borde },
  filaCabecera: { backgroundColor: colores.fondo, paddingVertical: 9 },
  celdaCabecera: { fontSize: 12, fontWeight: "700", color: colores.textoSuave },
  celda: { color: colores.indigo, fontSize: 14 },

  colEvento: { flex: 2.4 },
  colFecha: { flex: 1.4 },
  colCapacidad: { flex: 0.9 },
  colVentas: { flex: 0.8 },
  colEstado: { flex: 1.1 },
  colAcciones: { flex: 1.9 },
  eventoCelda: { flexDirection: "row", alignItems: "center", gap: 12 },
  miniatura: { width: 52, height: 40, borderRadius: 8, overflow: "hidden", backgroundColor: colores.indigo, alignItems: "center", justifyContent: "center" },
  foto: { width: "100%", height: "100%" },
  nombre: { flex: 1, fontWeight: "700", color: colores.indigo, fontSize: 14 },
  estado: { alignSelf: "flex-start", fontSize: 11, fontWeight: "700", paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8, overflow: "hidden" },
  estadoVerde: { color: colores.exito, backgroundColor: "#DCFCE7" },
  estadoCoral: { color: colores.blanco, backgroundColor: colores.acento },
  estadoOscuro: { color: colores.blanco, backgroundColor: colores.indigo },
  estadoGris: { color: colores.textoSuave, backgroundColor: "#F1F5F9" },
  acciones: { flexDirection: "row", gap: 6, justifyContent: "flex-end" },
  vacio: { textAlign: "center", color: colores.textoSuave, padding: 30 },
});
