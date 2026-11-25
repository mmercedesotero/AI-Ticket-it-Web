import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Avatar from "../componentes/Avatar";
import Chip from "../componentes/Chip";
import { Conversacion } from "./ChatScreen";
import { colores } from "../tema";
import { horaOFecha } from "../formato";

const CORAL_OSCURO = "#B5503C";

// Mensajes de la web de escritorio: la lista de conversaciones a la izquierda y el chat abierto a la derecha.
export default function MensajesWeb({ chats, rol, navigation, inicial }) {
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [elegido, setElegido] = useState(inicial ?? null);

  const texto = busqueda.trim().toLowerCase();
  const visibles = (chats ?? []).filter(
    (c) =>
      (filtro === "todos" || c.noLeidos > 0) &&
      (texto === "" || c.contraparte.nombre.toLowerCase().includes(texto) || c.evento.nombre.toLowerCase().includes(texto))
  );

  // Si no hay ninguno elegido, se abre el primero de la lista.
  useEffect(() => {
    if (elegido === null && chats && chats.length > 0) setElegido(chats[0].compraId);
  }, [chats, elegido]);

  return (
    <View style={styles.pantalla}>
      <View style={styles.tarjeta}>
        <View style={styles.lateral}>
          <Text style={styles.titulo}>Mensajes</Text>

          <View style={styles.buscador}>
            <Ionicons name="search-outline" size={16} color={colores.textoSuave} />
            <TextInput
              style={styles.buscadorInput}
              placeholder="Buscar chats, organizadores..."
              placeholderTextColor={colores.textoPlaceholder}
              value={busqueda}
              onChangeText={setBusqueda}
            />
          </View>
          <View style={styles.filtros}>
            <Chip etiqueta="Todos" activo={filtro === "todos"} onPress={() => setFiltro("todos")} />
            <Chip etiqueta="No leídos" activo={filtro === "noleidos"} onPress={() => setFiltro("noleidos")} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {visibles.length === 0 && <Text style={styles.vacio}>{chats && chats.length === 0 ? "Todavía no tenés mensajes." : "No hay chats para mostrar."}</Text>}
            {visibles.map((c) => {
              const activo = c.compraId === elegido;
              const mio = c.ultimoMensaje.autorRol === rol;
              const nuevo = c.noLeidos > 0;
              return (
                <Pressable key={c.compraId} style={[styles.chat, activo && styles.chatActivo]} onPress={() => setElegido(c.compraId)}>
                  <Avatar foto={c.contraparte.foto} nombre={c.contraparte.nombre} tamano={44} organizacion={c.contraparte.esOrganizacion} />
                  <View style={{ flex: 1 }}>
                    <View style={styles.fila}>
                      <Text style={[styles.nombre, nuevo && styles.fuerte]} numberOfLines={1}>{c.contraparte.nombre} · {c.evento.nombre}</Text>
                      <Text style={styles.hora}>{horaOFecha(c.ultimoMensaje.fechaHora)}</Text>
                    </View>
                    <View style={styles.fila}>
                      <Text style={[styles.mensaje, nuevo && styles.fuerte]} numberOfLines={1}>{mio ? "Vos: " : ""}{c.ultimoMensaje.texto}</Text>
                      {nuevo && (
                        <View style={styles.insignia}>
                          <Text style={styles.insigniaTexto}>{c.noLeidos}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.conversacion}>
          {elegido !== null ? (
            <Conversacion key={elegido} compraId={elegido} navigation={navigation} incrustado />
          ) : (
            <View style={styles.sinChat}>
              <Ionicons name="chatbubbles-outline" size={52} color={colores.textoPlaceholder} />
              <Text style={styles.sinChatTitulo}>Todavía no tenés mensajes</Text>
              <Text style={styles.sinChatTexto}>
                {rol === "COMPRADOR"
                  ? "Cuando compres una entrada, podés escribirle al organizador desde la página del evento."
                  : "Cuando un comprador te escriba por uno de tus eventos, vas a ver la conversación acá."}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.fondo, padding: 24 },
  tarjeta: {
    flex: 1, flexDirection: "row", backgroundColor: colores.blanco, borderRadius: 16, borderWidth: 1,
    borderColor: colores.borde, overflow: "hidden",
  },
  lateral: { width: 360, borderRightWidth: 1, borderColor: colores.borde, padding: 16 },
  titulo: { fontSize: 22, fontWeight: "800", color: colores.indigo, marginBottom: 12 },
  buscador: {
    flexDirection: "row", alignItems: "center", gap: 8, height: 40, paddingHorizontal: 12,
    backgroundColor: colores.fondo, borderRadius: 10,
  },
  buscadorInput: { flex: 1, fontSize: 14, color: colores.indigo, outlineStyle: "none" },
  filtros: { flexDirection: "row", gap: 8, marginVertical: 12 },

  chat: { flexDirection: "row", alignItems: "center", gap: 12, padding: 10, borderRadius: 12, marginBottom: 4 },
  chatActivo: { backgroundColor: colores.acentoSuave },
  fila: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  nombre: { flex: 1, color: colores.indigo, fontWeight: "600", fontSize: 14 },
  fuerte: { fontWeight: "800", color: colores.indigo },
  hora: { color: colores.textoPlaceholder, fontSize: 12 },
  mensaje: { flex: 1, color: colores.textoSuave, fontSize: 13, marginTop: 2 },
  insignia: {
    minWidth: 20, height: 20, borderRadius: 10, backgroundColor: colores.acento, alignItems: "center",
    justifyContent: "center", paddingHorizontal: 5,
  },
  insigniaTexto: { color: colores.blanco, fontSize: 11, fontWeight: "800" },
  vacio: { color: colores.textoSuave, textAlign: "center", marginTop: 24 },

  conversacion: { flex: 1 },
  sinChat: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8, padding: 40 },
  sinChatTitulo: { fontSize: 18, fontWeight: "800", color: colores.indigo },
  sinChatTexto: { color: colores.textoSuave, textAlign: "center", maxWidth: 380, lineHeight: 20 },
});
