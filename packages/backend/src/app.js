const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const EventoRoutes = require("./routes/eventoRoutes");
const UsuarioRoutes = require("./routes/UsuarioRoutes");
const OrganizadorRoutes = require("./routes/OrganizadorRoutes");
const CompraRoutes = require("./routes/CompraRoutes");
const errorHandler = require("./middlewares/errorHandler");
const CategoriaRoutes = require("./routes/CategoriaRoutes");
const ReseniaRoutes = require("./routes/ReseniaRoutes");
const AuthRoutes = require("./routes/AuthRoutes");
const FavoritoRoutes = require("./routes/FavoritoRoutes");
const TarjetaRoutes = require("./routes/TarjetaRoutes");
const NotificacionRoutes = require("./routes/NotificacionRoutes");
const FotoRoutes = require("./routes/FotoRoutes");

const app = express();
app.use(cors()); // permite que la versión web (otro origen) llame a la API
app.use(express.json({ limit: "3mb" })); // las fotos de perfil viajan en base64

const api = express.Router();
api.use("/auth", AuthRoutes);
api.use("/eventos", EventoRoutes);
api.use("/usuarios", UsuarioRoutes);
api.use("/organizadores", OrganizadorRoutes);
api.use("/compras", CompraRoutes);
api.use("/categorias", CategoriaRoutes);
api.use("/resenias", ReseniaRoutes);
api.use("/favoritos", FavoritoRoutes);
api.use("/tarjetas", TarjetaRoutes);
api.use("/notificaciones", NotificacionRoutes);
api.use("/fotos", FotoRoutes);

// La API responde en las dos direcciones: sin prefijo (la app del celular, Postman y los tests)
// y con /api (la versión web publicada, que comparte dirección con el servidor).
app.use("/api", api);
app.use("/", api);

// Si la web ya está generada (npm run build:web en el frontend), el mismo servidor la publica.
// Las direcciones que no son de la API devuelven la página principal para que funcione recargar y compartir links.
const web = path.join(__dirname, "..", "..", "frontend", "dist");
if (fs.existsSync(path.join(web, "index.html"))) {
  app.use(express.static(web));
  app.get("/{*ruta}", (req, res) => res.sendFile(path.join(web, "index.html")));
}

app.use(errorHandler);

module.exports = app;
