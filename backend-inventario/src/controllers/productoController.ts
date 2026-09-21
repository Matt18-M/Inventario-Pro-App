import { type Request, type Response } from 'express';
import prisma from '../prisma';

// GET /productos (Para listar el inventario)
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

// POST /productos (Para crear un nuevo producto con su foto)
export const crearProducto = async (req: Request, res: Response) => {
  const { nombre, precio, categoria, fotoBase64 } = req.body;

  try {
    const nuevoProducto = await prisma.producto.create({
      data: {
        nombre,
        precio: Number(precio),
        categoria,
        fotoBase64,
      },
    });

    res.status(201).json(nuevoProducto);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear producto' });
  }
};

// PUT /productos/:id (Para editar el precio o la foto)
export const actualizarProducto = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { nombre, precio, categoria, fotoBase64 } = req.body;

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
      },
    });

    res.json(productoActualizado);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
};

// DELETE /productos/:id (Para borrar un producto defectuoso)
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
