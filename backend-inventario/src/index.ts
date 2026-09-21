import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import productoRoutes from './routes/productoRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de Middlewares
app.use(cors());

// Aceptar payloads de imágenes pesadas en JSON (hasta 10mb) según especificación del PDF
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Rutas principales
app.use('/productos', productoRoutes);

// Ruta de prueba/salud
app.get('/', (req, res) => {
  res.json({ mensaje: 'Servidor Backend InventarioPro activo y listo 🚀' });
});

app.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📦 Rutas CRUD disponibles en http://localhost:${PORT}/productos`);
  console.log(`==================================================\n`);
});
