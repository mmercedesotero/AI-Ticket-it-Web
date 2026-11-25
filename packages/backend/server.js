const app = require("./src/app");
const cargarSeeds = require("./src/seeds");
const { mensajeDeArranque } = require("./src/utils/red");

// Los servicios de publicación (Railway, etc.) indican el puerto en la variable PORT.
const PUERTO = Number(process.env.PORT) || 3000;

cargarSeeds();

app.listen(PUERTO, () => {
  console.log(mensajeDeArranque(PUERTO));
});
