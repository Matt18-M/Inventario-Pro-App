import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import productoRoutes from './routes/productoRoutes';
import prisma from './prisma';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use('/productos', productoRoutes);

app.get('/', (req, res) => {
  res.json({ mensaje: 'Servidor Backend InventarioPro activo y listo' });
});

app.listen(PORT, async () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  
  try {
    await prisma.$connect();
    console.log('✅ Conexión exitosa a la base de datos PostgreSQL');
  } catch (error: any) {
    console.error('❌ Error de conexión a la base de datos PostgreSQL:');
    console.error(error.message);
  }
});
