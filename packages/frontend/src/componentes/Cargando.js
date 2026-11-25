import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { colores } from "../tema";

// Rueda de carga con el texto "Cargando...". Si la espera se alarga (por ejemplo, el servidor gratuito
// está despertando), avisa para que nadie piense que se colgó.
export default function Cargando({ texto = "Cargando..." }) {
  const [larga, setLarga] = useState(false);

  useEffect(() => {
    const espera = setTimeout(() => setLarga(true), 6000);
    return () => clearTimeout(espera);
  }, []);

  return (
    <View style={styles.centro}>
      <ActivityIndicator size="large" color={colores.acento} />
      <Text style={styles.texto}>{texto}</Text>
      {larga && <Text style={styles.aviso}>Está tardando un poco más de lo normal. El servidor puede estar despertando, esperá un momento.</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  centro: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 32, minHeight: 240 },
  texto: { color: colores.textoSuave, fontWeight: "500" },
  aviso: { color: colores.textoPlaceholder, fontSize: 13, textAlign: "center", maxWidth: 320 },
});
