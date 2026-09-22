import { type Request, type Response } from 'express';
import prisma from '../prisma';

export const obtenerProductos = async (req: Request, res: Response) => {
  try {
    const productos = await prisma.producto.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

export const crearProducto = async (req: Request, res: Response) => {
  const { nombre, precio, categoria, codigoBarras, fotoBase64 } = req.body;

  try {
    const nuevoProducto = await prisma.producto.create({
      data: {
        nombre,
        precio: Number(precio),
        categoria,
        codigoBarras: codigoBarras || null,
        fotoBase64,
      },
    });

    res.status(201).json(nuevoProducto);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear producto' });
  }
};

export const actualizarProducto = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { nombre, precio, categoria, codigoBarras, fotoBase64 } = req.body;

  try {
    const productoActualizado = await prisma.producto.update({
      where: {
        id: Number(id),
      },
      data: {
        nombre,
        precio: precio !== undefined ? Number(precio) : undefined,
        categoria,
        codigoBarras,
        fotoBase64,
      },
    });

    res.json(productoActualizado);
  } catch (error) {
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
    res.status(404).json({ error: 'Producto no encontrado' });
  }
};
