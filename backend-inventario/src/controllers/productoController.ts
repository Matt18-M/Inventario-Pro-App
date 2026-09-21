import { type Request, type Response } from 'express';
import prisma from '../prisma';

export const obtenerProductos = async (req: Request, res: Response) => {
  try {
    const productos = await prisma.producto.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(productos);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

export const crearProducto = async (req: Request, res: Response) => {
  const { nombre, precio, categoria, fotoBase64, codigoBarras } = req.body;

  try {
    const nuevoProducto = await prisma.producto.create({
      data: {
        nombre,
        precio: Number(precio),
        categoria,
        fotoBase64,
        codigoBarras,
      },
    });

    res.status(201).json(nuevoProducto);
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ error: 'Error al crear producto' });
  }
};

export const actualizarProducto = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { nombre, precio, categoria, fotoBase64, codigoBarras } = req.body;

  try {
    const productoActualizado = await prisma.producto.update({
      where: {
        id: Number(id),
      },
      data: {
        nombre,
        precio: precio !== undefined ? Number(precio) : undefined,
        categoria,
        fotoBase64,
        codigoBarras,
      },
    });

    res.json(productoActualizado);
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
};

export const eliminarProducto = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.producto.delete({
      where: {
        id: Number(id),
      },
    });

    res.json({ Exito: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(404).json({ error: 'Producto no encontrado' });
  }
};
