import React, { createContext, useState, useEffect, ReactNode } from 'react';
import api from '../api/api';
import { Producto, NuevoProducto } from '../types/producto';

interface ProductoContextType {
  productos: Producto[];
  cargando: boolean;
  error: string | null;
  obtenerProductos: () => Promise<void>;
  agregarProducto: (nuevoProducto: NuevoProducto) => Promise<boolean>;
  eliminarProducto: (id: number) => Promise<boolean>;
}

export const ProductoContext = createContext<ProductoContextType>({
  productos: [],
  cargando: false,
  error: null,
  obtenerProductos: async () => {},
  agregarProducto: async () => false,
  eliminarProducto: async () => false,
});

export const ProductoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // GET /productos (Para listar el inventario)
  const obtenerProductos = async () => {
    setCargando(true);
    setError(null);
    try {
      const response = await api.get<Producto[]>('/productos');
      setProductos(response.data);
    } catch (err: any) {
      setError('Error al obtener los productos');
    } finally {
      setCargando(false);
    }
  };

  // POST /productos (Omitiendo id y createdAt tal como se especifica en la guía)
  const agregarProducto = async (nuevoProducto: NuevoProducto): Promise<boolean> => {
    setCargando(true);
    setError(null);
    try {
      const payload: NuevoProducto = {
        nombre: nuevoProducto.nombre,
        precio: nuevoProducto.precio,
        categoria: nuevoProducto.categoria,
        fotoBase64: nuevoProducto.fotoBase64 || null,
      };

      const response = await api.post<Producto>('/productos', payload);
      setProductos((prev) => [response.data, ...prev]);
      return true;
    } catch (err: any) {
      setError('Error al agregar el producto');
      return false;
    } finally {
      setCargando(false);
    }
  };

  // DELETE /productos/:id (Para borrar un producto)
  const eliminarProducto = async (id: number): Promise<boolean> => {
    setCargando(true);
    setError(null);
    try {
      await api.delete(`/productos/${id}`);
      setProductos((prev) => prev.filter((item) => item.id !== id));
      return true;
    } catch (err: any) {
      setError('Error al eliminar el producto');
      return false;
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerProductos();
  }, []);

  return (
    <ProductoContext.Provider
      value={{
        productos,
        cargando,
        error,
        obtenerProductos,
        agregarProducto,
        eliminarProducto,
      }}
    >
      {children}
    </ProductoContext.Provider>
  );
};
