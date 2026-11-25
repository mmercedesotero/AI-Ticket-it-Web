import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Avatar from "../componentes/Avatar";
import { FormularioPerfil } from "./EditarPerfilScreen";
import { colores } from "../tema";

// Mi perfil de la web de escritorio: menú de la cuenta a la izquierda y el formulario de datos a la derecha.
export default function PerfilWeb({ usuario, nombreCompleto, esOrganizador, numeros, navigation, salir }) {
  const mostrar = (n) => (n === null ? "–" : String(n));

  const menu = [
    { icono: "person-outline", texto: "Información personal", activo: true },
    !esOrganizador && { icono: "card-outline", texto: "Métodos de pago", destino: "Tarjetas" },
    !esOrganizador && { icono: "ticket-outline", texto: "Historial de compras", destino: ["Inicio", { screen: "Mis compras" }] },
    { icono: "notifications-outline", texto: "Notificaciones", destino: ["Inicio", { screen: "Notificaciones" }] },
    { icono: "chatbubble-ellipses-outline", texto: "Mensajes", destino: "Mensajes" },
    !esOrganizador && { icono: "heart-outline", texto: "Mis favoritos", destino: "Favoritos" },
    { icono: "help-circle-outline", texto: "Ayuda y soporte", destino: "Ayuda" },
    { icono: "document-text-outline", texto: "Términos y condiciones", destino: "Terminos" },
  ].filter(Boolean);

  const ir = (destino) => (Array.isArray(destino) ? navigation.navigate(...destino) : navigation.navigate(destino));

  return (
    <ScrollView style={styles.pantalla} contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
      <View style={styles.columnas}>
        <View style={styles.menu}>
          <View style={styles.cabecera}>
            <Avatar foto={usuario.foto} nombre={usuario.nombre} tamano={64} organizacion={esOrganizador} />
            <Text style={styles.nombre} numberOfLines={2}>{nombreCompleto}</Text>
            <View style={styles.rol}>
              <Ionicons name="checkmark-circle" size={13} color={colores.exito} />
              <Text style={styles.rolTexto}>{esOrganizador ? "Organizador" : "Comprador"} verificado</Text>
            </View>
          </View>

          <Text style={styles.etiqueta}>MI CUENTA</Text>
          {menu.map((m) => (
            <Pressable key={m.texto} style={[styles.item, m.activo && styles.itemActivo]} onPress={() => m.destino && ir(m.destino)}>
              <Ionicons name={m.icono} size={18} color={m.activo ? colores.acento : colores.indigo} />
              <Text style={[styles.itemTexto, m.activo && styles.itemTextoActivo]}>{m.texto}</Text>
            </Pressable>
          ))}
          <View style={styles.separador} />
          <Pressable style={styles.item} onPress={salir}>
            <Ionicons name="log-out-outline" size={18} color={colores.acento} />
            <Text style={[styles.itemTexto, { color: colores.acento }]}>Cerrar sesión</Text>
          </Pressable>
        </View>

        <View style={styles.panel}>
          <Text style={styles.titulo}>Información Personal</Text>

          <View style={styles.numeros}>
            <View style={styles.numero}>
              <Text style={styles.numeroValor}>{mostrar(numeros[0])}</Text>
              <Text style={styles.numeroEtiqueta}>{esOrganizador ? "Eventos" : "Entradas"}</Text>
            </View>
            <View style={styles.numero}>
              <Text style={styles.numeroValor}>{mostrar(numeros[1])}</Text>
              <Text style={styles.numeroEtiqueta}>{esOrganizador ? "Reseñas recibidas" : "Reseñas"}</Text>
            </View>
          </View>

          <FormularioPerfil navigation={navigation} incrustado />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.fondo },
  contenido: { paddingHorizontal: 24, paddingTop: 28, paddingBottom: 56 },
  columnas: { flexDirection: "row", gap: 24, alignItems: "flex-start" },

  menu: { width: 280, backgroundColor: colores.blanco, borderRadius: 16, borderWidth: 1, borderColor: colores.borde, padding: 14 },
  cabecera: { alignItems: "center", gap: 6, paddingVertical: 10, marginBottom: 6 },
  nombre: { fontSize: 17, fontWeight: "800", color: colores.indigo, textAlign: "center" },
  rol: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: colores.fondo, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3 },
  rolTexto: { fontSize: 12, color: colores.indigo },
  etiqueta: { fontSize: 11, fontWeight: "700", letterSpacing: 0.8, color: colores.textoPlaceholder, marginTop: 8, marginBottom: 6, marginLeft: 10 },
  item: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 10, paddingVertical: 11, borderRadius: 9 },
  itemActivo: { backgroundColor: colores.acentoSuave },
  itemTexto: { color: colores.indigo, fontWeight: "600", fontSize: 14 },
  itemTextoActivo: { color: colores.acento, fontWeight: "800" },
  separador: { height: 1, backgroundColor: colores.borde, marginVertical: 8 },

  panel: { flex: 1, backgroundColor: colores.blanco, borderRadius: 16, borderWidth: 1, borderColor: colores.borde, padding: 28 },
  titulo: { fontSize: 24, fontWeight: "800", color: colores.indigo },
  numeros: { flexDirection: "row", gap: 12, marginTop: 16 },
  numero: { flex: 1, backgroundColor: colores.fondo, borderRadius: 12, paddingVertical: 12, alignItems: "center" },
  numeroValor: { fontSize: 24, fontWeight: "800", color: colores.indigo },
  numeroEtiqueta: { color: colores.textoSuave, fontSize: 13 },
});
