import { useRefrescar } from "../refrescar";
import { FlatList, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useEventos } from "../eventos";
import TarjetaEvento from "../componentes/TarjetaEvento";
import TarjetaEventoWeb from "../componentes/TarjetaEventoWeb";
import { colores } from "../tema";
import { useEscritorio } from "../web";

export default function FavoritosScreen({ navigation }) {
  // Los favoritos vienen del almacén global: tocar el corazón acá lo saca de la lista al instante.
  const { favoritos, alternarFavorito, recargar } = useEventos();
  const { refreshProps, indicador } = useRefrescar(recargar);
  const escritorio = useEscritorio();

  // Web de escritorio: grilla de tarjetas, igual que en Explorar.
  if (escritorio) {
    return (
      <ScrollView style={styles.fondo} contentContainerStyle={styles.contenidoWeb} showsVerticalScrollIndicator={false}>
        <Text style={styles.tituloWeb}>Mis favoritos</Text>
        <Text style={styles.subtituloWeb}>{favoritos.length === 0 ? "Todavía no guardaste ninguno" : `${favoritos.length} ${favoritos.length === 1 ? "evento guardado" : "eventos guardados"}`}</Text>

        {favoritos.length === 0 ? (
          <View style={styles.vacio}>
            <Ionicons name="heart-outline" size={48} color={colores.textoPlaceholder} />
            <Text style={styles.vacioTitulo}>Todavía no tenés favoritos</Text>
            <Text style={styles.vacioTexto}>Tocá el corazón de un evento para guardarlo acá.</Text>
          </View>
        ) : (
          <View style={styles.grilla}>
            {favoritos.map((e) => (
              <TarjetaEventoWeb key={e.id} evento={e} favorito onPress={() => navigation.navigate("Detalle", { id: e.id })} onFavorito={() => alternarFavorito(e)} />
            ))}
          </View>
        )}
      </ScrollView>
    );
  }

  return (
    <View style={styles.fondo}>
    {indicador}
    <FlatList
      style={styles.fondo}
      data={favoritos}
      {...refreshProps}
      keyExtractor={(evento) => String(evento.id)}
      contentContainerStyle={styles.lista}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <View style={styles.vacio}>
          <Ionicons name="heart-outline" size={48} color={colores.textoPlaceholder} />
          <Text style={styles.vacioTitulo}>Todavía no tenés favoritos</Text>
          <Text style={styles.vacioTexto}>Tocá el corazón de un evento para guardarlo acá.</Text>
        </View>
      }
      renderItem={({ item }) => (
        <TarjetaEvento
          evento={item}
          favorito
          onPress={() => navigation.navigate("Detalle", { id: item.id })}
          onFavorito={() => alternarFavorito(item)}
        />
      )}
    />
    </View>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: colores.fondo },
  lista: { padding: 16 },
  contenidoWeb: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 56 },
  tituloWeb: { fontSize: 28, fontWeight: "700", color: colores.indigo },
  subtituloWeb: { color: colores.textoSuave, marginTop: 2, marginBottom: 22 },
  grilla: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 22 },
  vacio: { alignItems: "center", marginTop: 80, gap: 8 },
  vacioTitulo: { fontSize: 18, fontWeight: "800", color: colores.indigo },
  vacioTexto: { color: colores.textoSuave, textAlign: "center" },
});
