import prisma from './prisma';

async function seedTestData() {
  console.log('🌱 Poblando base de datos con datos de prueba...');

  const productosIniciales = [
    {
      nombre: 'Teclado Mecánico RGB',
      precio: 45.99,
      categoria: 'Electrónica',
      fotoBase64: null,
      codigoBarras: '7891234567890',
    },
    {
      nombre: 'Mouse Inalámbrico Pro',
      precio: 25.50,
      categoria: 'Accesorios',
      fotoBase64: null,
      codigoBarras: '1234567890123',
    },
  ];

  for (const p of productosIniciales) {
    const creado = await prisma.producto.create({ data: p });
    console.log(`✅ Producto creado: ID ${creado.id} - ${creado.nombre}`);
  }

  const contador = await prisma.producto.count();
  console.log(`🎉 Total de productos en la base de datos: ${contador}`);
}

seedTestData()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
