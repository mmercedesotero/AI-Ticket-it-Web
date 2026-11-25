import { useRef, useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Chip from "../componentes/Chip";
import { CampoFecha, Selector } from "../componentes/CamposWeb";
import BotonFavorito from "../componentes/BotonFavorito";
import TarjetaEventoWeb from "../componentes/TarjetaEventoWeb";
import { estadoCupo, iconoDe } from "../componentes/TarjetaEvento";
import { formatearFechaLarga } from "../formato";
import { imagenDe } from "../imagenes";
import { colores } from "../tema";

const ANCHO_FAVORITO = 400;

const ORDENES = [
  { clave: "fecha", etiqueta: "Fecha", icono: "calendar-outline" },
  { clave: "precio", etiqueta: "Precio", icono: "cash-outline" },
  { clave: "puntaje", etiqueta: "Puntaje", icono: "star-outline" },
];

// Pantalla "Descubrir eventos" de la web de escritorio: buscador con filtros arriba y grilla de eventos.
// Todo el estado (búsqueda, ciudad, categoría...) vive en EventosScreen; acá solo se dibuja.
export default function EventosWeb({
  texto, setTexto, buscarYa, categorias, categoriaId, setCategoriaId, ciudades, ciudad, setCiudad,
  orden, setOrden, eventos, buscando, favoritosVigentes, esFavorito, alternarFavorito, abrir, verFavoritos, cargado,
}) {
  const [fecha, setFecha] = useState("");
  const carrusel = useRef(null);
  const posicion = useRef(0);
  const mover = (paso) => {
    posicion.current = Math.max(0, posicion.current + paso * (ANCHO_FAVORITO + 16));
    carrusel.current?.scrollTo({ x: posicion.current, animated: true });
  };

  // El filtro de fecha muestra los eventos de ese día en adelante.
  const visibles = fecha ? eventos.filter((e) => e.fecha >= fecha) : eventos;
  const hayFiltros = buscando || fecha !== "";

  return (
    <ScrollView style={styles.pantalla} contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <View style={styles.centrado}>
          <Text style={styles.titulo}>Descubre los mejores eventos en tu ciudad</Text>

          <View style={styles.filtros}>
            <View style={[styles.campo, styles.buscador]}>
              <Ionicons name="search-outline" size={17} color={colores.textoSuave} />
              <TextInput
                style={styles.buscadorInput}
                placeholder="Buscar evento..."
                placeholderTextColor={colores.textoPlaceholder}
                value={texto}
                onChangeText={setTexto}
                onSubmitEditing={buscarYa}
              />
            </View>
            <Selector
              icono="location-outline"
              ancho={190}
              valor={ciudad ?? ""}
              onCambio={(v) => setCiudad(v === "" ? null : v)}
              opciones={[{ valor: "", texto: "Ciudad" }, ...ciudades.map((c) => ({ valor: c, texto: c }))]}
            />
            <CampoFecha valor={fecha} onCambio={setFecha} ancho={170} />
            <Selector
              icono="pricetag-outline"
              ancho={190}
              valor={categoriaId ?? ""}
              onCambio={(v) => setCategoriaId(v === "" ? null : Number(v))}
              opciones={[{ valor: "", texto: "Categoría" }, ...categorias.map((c) => ({ valor: c.id, texto: c.nombre }))]}
            />
            <Pressable style={styles.botonBuscar} onPress={buscarYa}>
              <Ionicons name="search" size={16} color={colores.blanco} />
              <Text style={styles.botonBuscarTexto}>Buscar</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.centrado}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips} style={styles.chipsFila}>
          <Chip etiqueta="Todas" activo={categoriaId === null} onPress={() => setCategoriaId(null)} />
          {categorias.map((c) => (
            <Chip key={c.id} etiqueta={c.nombre} activo={categoriaId === c.id} onPress={() => setCategoriaId(c.id)} />
          ))}
        </ScrollView>
      </View>

      {/* Mis favoritos: una franja blanca propia, para que se note que es distinto de los próximos eventos. */}
      {!hayFiltros && (
        <View style={styles.banda}>
          <View style={styles.centrado}>
            <View style={styles.bandaTitulo}>
              <View style={styles.tituloConIcono}>
                <Ionicons name="heart" size={20} color={colores.acento} />
                <Text style={styles.seccionTitulo}>Mis favoritos</Text>
              </View>
              <View style={styles.controles}>
                {favoritosVigentes.length > 3 && (
                  <>
                    <Pressable style={styles.flecha} onPress={() => mover(-1)}>
                      <Ionicons name="chevron-back" size={18} color={colores.indigo} />
                    </Pressable>
                    <Pressable style={styles.flecha} onPress={() => mover(1)}>
                      <Ionicons name="chevron-forward" size={18} color={colores.indigo} />
                    </Pressable>
                  </>
                )}
                {favoritosVigentes.length > 0 && (
                  <Pressable onPress={verFavoritos} hitSlop={8}>
                    <Text style={styles.verTodos}>Ver todos  →</Text>
                  </Pressable>
                )}
              </View>
            </View>

            {favoritosVigentes.length === 0 ? (
              <Text style={styles.sinFavoritos}>Tocá el ♡ de un evento para guardarlo acá.</Text>
            ) : (
              <ScrollView ref={carrusel} horizontal showsHorizontalScrollIndicator={false} onScroll={(e) => { posicion.current = e.nativeEvent.contentOffset.x; }} scrollEventThrottle={50}>
                {favoritosVigentes.map((e) => (
                  <TarjetaFavorita key={e.id} evento={e} onPress={() => abrir(e)} onFavorito={() => alternarFavorito(e)} />
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      )}

      <View style={styles.centrado}>
        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>{hayFiltros ? "Resultados" : "Próximos eventos"}</Text>
          <View style={styles.ordenes}>
            <Text style={styles.ordenarPor}>Ordenar por</Text>
            {ORDENES.map((o) => (
              <Chip key={o.clave} etiqueta={o.etiqueta} icono={o.icono} activo={orden === o.clave} onPress={() => setOrden(o.clave)} />
            ))}
          </View>
        </View>

        {visibles.length === 0 ? (
          cargado ? <Text style={styles.vacio}>No hay eventos que coincidan con la búsqueda.</Text> : <ActivityIndicator style={{ marginTop: 40 }} size="large" color={colores.acento} />
        ) : (
          <View style={styles.grilla}>
            {visibles.map((e) => (
              <TarjetaEventoWeb key={e.id} evento={e} favorito={esFavorito(e.id)} onPress={() => abrir(e)} onFavorito={() => alternarFavorito(e)} />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

// Tarjeta del carrusel de favoritos: foto grande con el nombre y la fecha encima.
function TarjetaFavorita({ evento, onPress, onFavorito }) {
  const foto = imagenDe(evento);
  const agotandose = estadoCupo(evento) === "agotandose";

  return (
    <Pressable style={styles.favorito} onPress={onPress}>
      {foto ? <Image source={foto} style={styles.favoritoFoto} resizeMode="cover" /> : <Ionicons name={iconoDe(evento)} size={48} color={colores.acento} />}
      <View style={styles.favoritoCorazon}>
        <BotonFavorito activo onPress={onFavorito} tamano={34} />
      </View>
      {agotandose && (
        <View style={styles.favoritoInsignia}>
          <Ionicons name="flame" size={12} color={colores.blanco} />
          <Text style={styles.favoritoInsigniaTexto}>Agotándose</Text>
        </View>
      )}
      <View style={styles.favoritoTextos}>
        <Text style={styles.favoritoNombre} numberOfLines={1}>{evento.nombre}</Text>
        <Text style={styles.favoritoFecha} numberOfLines={1}>{formatearFechaLarga(evento.fecha)}{evento.lugar ? ` · ${evento.lugar.ciudad}` : ""}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.fondo },
  contenido: { paddingBottom: 56 },
  centrado: { width: "100%", maxWidth: 1200, alignSelf: "center", paddingHorizontal: 24 },

  hero: { backgroundColor: colores.indigo, paddingTop: 56, paddingBottom: 56 },
  titulo: { color: colores.blanco, fontSize: 34, fontWeight: "800", textAlign: "center", marginBottom: 28 },
  filtros: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 10 },
  campo: {
    flexDirection: "row", alignItems: "center", gap: 8, height: 46, paddingHorizontal: 12,
    backgroundColor: colores.blanco, borderRadius: 10, borderWidth: 1, borderColor: colores.borde,
  },
  buscador: { width: 300 },
  buscadorInput: { flex: 1, fontSize: 14, color: colores.indigo, outlineStyle: "none" },
  botonBuscar: {
    flexDirection: "row", alignItems: "center", gap: 7, height: 46, paddingHorizontal: 24,
    backgroundColor: colores.acento, borderRadius: 10,
  },
  botonBuscarTexto: { color: colores.blanco, fontWeight: "800", fontSize: 15 },

  chipsFila: { marginTop: 24 },
  chips: { gap: 8 },

  seccion: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginTop: 32, marginBottom: 16 },
  seccionTitulo: { fontSize: 22, fontWeight: "800", color: colores.indigo },
  verTodos: { color: colores.acento, fontWeight: "700" },
  ordenes: { flexDirection: "row", alignItems: "center", gap: 8 },
  ordenarPor: { color: colores.textoSuave, fontSize: 13, marginRight: 2 },

  grilla: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 22 },
  banda: { backgroundColor: colores.blanco, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colores.borde, paddingVertical: 24, marginTop: 24 },
  bandaTitulo: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  tituloConIcono: { flexDirection: "row", alignItems: "center", gap: 8 },
  controles: { flexDirection: "row", alignItems: "center", gap: 10 },
  flecha: { width: 32, height: 32, borderRadius: 16, backgroundColor: colores.fondo, alignItems: "center", justifyContent: "center" },
  sinFavoritos: { color: colores.textoSuave, paddingVertical: 18 },
  favorito: {
    width: ANCHO_FAVORITO, aspectRatio: 16 / 9, borderRadius: 14, overflow: "hidden", marginRight: 16,
    backgroundColor: colores.indigo, alignItems: "center", justifyContent: "center",
  },
  favoritoFoto: { width: "100%", height: "100%" },
  favoritoCorazon: { position: "absolute", top: 10, right: 10 },
  favoritoInsignia: {
    position: "absolute", left: 10, top: 10, flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "#DC2626", borderRadius: 10, paddingHorizontal: 9, paddingVertical: 4,
  },
  favoritoInsigniaTexto: { color: colores.blanco, fontWeight: "600", fontSize: 11 },
  favoritoTextos: { position: "absolute", left: 0, right: 0, bottom: 0, padding: 12, backgroundColor: "rgba(15,23,42,0.6)" },
  favoritoNombre: { color: colores.blanco, fontSize: 16, fontWeight: "600" },
  favoritoFecha: { color: "rgba(255,255,255,0.85)", fontSize: 13, marginTop: 1 },

  vacio: { textAlign: "center", color: colores.textoSuave, marginTop: 40 },
});
