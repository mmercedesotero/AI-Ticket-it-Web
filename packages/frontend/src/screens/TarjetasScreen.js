import { useRefrescar } from "../refrescar";
import { alerta } from "../dialogo";
import { useCallback, useState } from "react";
import {
  FlatList, Pressable, ScrollView, StyleSheet, Text, View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { enviar, get } from "../api";
import { colores, radios } from "../tema";
import { useEscritorio } from "../web";

export default function TarjetasScreen({ navigation }) {
  const [tarjetas, setTarjetas] = useState([]);
  const [error, setError] = useState(null);
  const escritorio = useEscritorio();

  const cargar = useCallback(
    () => get("/tarjetas").then(setTarjetas).catch((e) => setError(e.message)),
    []
  );

  const { refreshProps, indicador } = useRefrescar(cargar);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  const eliminar = (tarjeta) => {
    alerta("Eliminar tarjeta", `¿Eliminar la ${tarjeta.marca} terminada en ${tarjeta.ultimos4}?`, [
      { text: "No", style: "cancel" },
      {
        text: "Sí, eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await enviar("DELETE", `/tarjetas/${tarjeta.id}`);
            cargar();
          } catch (e) {
            alerta("No se pudo eliminar", e.message);
          }
        },
      },
    ]);
  };

  if (error) return <Text style={styles.centro}>Error: {error}</Text>;

  // Web de escritorio: tarjetas de tamaño real (como una tarjeta de plástico), una al lado de la otra.
  if (escritorio) {
    return (
      <ScrollView style={styles.fondo} contentContainerStyle={styles.contenidoWeb} showsVerticalScrollIndicator={false}>
        <Text style={styles.tituloWeb}>Métodos de pago</Text>
        <Text style={styles.subtituloWeb}>Tus tarjetas guardadas para pagar más rápido</Text>

        <View style={styles.tarjetasWeb}>
          {tarjetas.map((t) => (
            <View key={t.id} style={styles.tarjetaWeb}>
              <View style={styles.fila}>
                <Text style={styles.marca}>{t.marca.toUpperCase()}</Text>
                <Pressable onPress={() => eliminar(t)} hitSlop={10}>
                  <Ionicons name="trash-outline" size={18} color="rgba(255,255,255,0.8)" />
                </Pressable>
              </View>
              <Text style={styles.numeroWeb}>•••• •••• •••• {t.ultimos4}</Text>
              <View style={styles.fila}>
                <Text style={styles.texto} numberOfLines={1}>{t.titular.toUpperCase()}</Text>
                <Text style={styles.texto}>{t.vencimiento}</Text>
              </View>
            </View>
          ))}

          <Pressable style={styles.agregarWeb} onPress={() => navigation.navigate("AgregarTarjeta")}>
            <Ionicons name="add-circle-outline" size={28} color={colores.acento} />
            <Text style={styles.agregarWebTexto}>Agregar tarjeta</Text>
          </Pressable>
        </View>

        {tarjetas.length === 0 && <Text style={styles.vacioTexto}>Todavía no guardaste tarjetas. Agregá una para pagar tus entradas más rápido.</Text>}
      </ScrollView>
    );
  }

  return (
    <View style={styles.fondo}>
    {indicador}
    <FlatList
      style={styles.fondo}
      data={tarjetas}
      {...refreshProps}
      keyExtractor={(t) => String(t.id)}
      contentContainerStyle={styles.lista}
      ListEmptyComponent={
        <View style={styles.vacio}>
          <Ionicons name="card-outline" size={48} color={colores.textoPlaceholder} />
          <Text style={styles.vacioTitulo}>Todavía no guardaste tarjetas</Text>
          <Text style={styles.vacioTexto}>Agregá una para pagar tus entradas más rápido.</Text>
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.tarjeta}>
          <View style={styles.fila}>
            <Text style={styles.marca}>{item.marca.toUpperCase()}</Text>
            <Pressable onPress={() => eliminar(item)} hitSlop={10}>
              <Ionicons name="trash-outline" size={20} color="rgba(255,255,255,0.8)" />
            </Pressable>
          </View>
          <Text style={styles.numero}>•••• •••• •••• {item.ultimos4}</Text>
          <View style={styles.fila}>
            <Text style={styles.texto}>{item.titular.toUpperCase()}</Text>
            <Text style={styles.texto}>{item.vencimiento}</Text>
          </View>
        </View>
      )}
      ListFooterComponent={
        <Pressable style={styles.agregar} onPress={() => navigation.navigate("AgregarTarjeta")}>
          <Ionicons name="add" size={20} color={colores.blanco} />
          <Text style={styles.agregarTexto}>Agregar tarjeta</Text>
        </Pressable>
      }
    />
    </View>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: colores.fondo },
  lista: { padding: 16 },
  centro: { marginTop: 100, textAlign: "center" },

  tarjeta: { backgroundColor: colores.indigo, borderRadius: radios.tarjeta, padding: 20, gap: 22, marginBottom: 14 },
  fila: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  marca: { color: colores.blanco, fontWeight: "800", letterSpacing: 1 },
  numero: { color: colores.blanco, fontSize: 20, fontWeight: "700", letterSpacing: 2 },
  texto: { color: "rgba(255,255,255,0.85)", fontSize: 13, fontWeight: "600" },

  contenidoWeb: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 56 },
  tituloWeb: { fontSize: 28, fontWeight: "700", color: colores.indigo },
  subtituloWeb: { color: colores.textoSuave, marginTop: 2, marginBottom: 22 },
  tarjetasWeb: { flexDirection: "row", flexWrap: "wrap", gap: 18 },
  tarjetaWeb: { width: 300, height: 176, backgroundColor: colores.indigo, borderRadius: 16, padding: 18, justifyContent: "space-between" },
  numeroWeb: { color: colores.blanco, fontSize: 17, fontWeight: "600", letterSpacing: 2 },
  agregarWeb: {
    width: 300, height: 176, borderRadius: 16, borderWidth: 1.5, borderStyle: "dashed", borderColor: colores.acento,
    backgroundColor: colores.acentoSuave, alignItems: "center", justifyContent: "center", gap: 6,
  },
  agregarWebTexto: { color: colores.acento, fontWeight: "700" },
  vacio: { alignItems: "center", marginVertical: 50, gap: 8 },
  vacioTitulo: { fontSize: 18, fontWeight: "800", color: colores.indigo },
  vacioTexto: { color: colores.textoSuave, textAlign: "center" },

  agregar: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    backgroundColor: colores.acento, borderRadius: radios.boton, paddingVertical: 14, marginTop: 6,
  },
  agregarTexto: { color: colores.blanco, fontWeight: "700", fontSize: 16 },
});
