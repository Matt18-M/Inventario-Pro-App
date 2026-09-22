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

  const obtenerProductos = async () => {
    setCargando(true);
    setError(null);
    try {
      const response = await api.get<Producto[]>('/productos');
      setProductos(response.data);
    } catch (err: any) {
      console.error('Error al obtener productos:', err.message, err.response?.data);
      if (err.message === 'Network Error' || err.code === 'ECONNABORTED') {
        setError('Error de red: No se pudo conectar al servidor. Revisa que el backend esté activo y que la IP en api.ts sea correcta.');
      } else {
        setError('Error al obtener los productos del servidor.');
      }
    } finally {
      setCargando(false);
    }
  };

  const agregarProducto = async (nuevoProducto: NuevoProducto): Promise<boolean> => {
    setCargando(true);
    setError(null);
    try {
      const payload: NuevoProducto = {
        nombre: nuevoProducto.nombre,
        precio: nuevoProducto.precio,
        categoria: nuevoProducto.categoria,
        codigoBarras: nuevoProducto.codigoBarras || null,
        fotoBase64: nuevoProducto.fotoBase64 || null,
      };

      const response = await api.post<Producto>('/productos', payload);
      setProductos((prev) => [response.data, ...prev]);
      return true;
    } catch (err: any) {
      console.error('Error al agregar producto:', err.message, err.response?.data);
      if (err.message === 'Network Error' || err.code === 'ECONNABORTED') {
        setError('Error de red: No se pudo conectar al servidor backend.');
      } else {
        setError('Error al agregar el producto al servidor.');
      }
      return false;
    } finally {
      setCargando(false);
    }
  };

  const eliminarProducto = async (id: number): Promise<boolean> => {
    setCargando(true);
    setError(null);
    try {
      await api.delete(`/productos/${id}`);
      setProductos((prev) => prev.filter((item) => item.id !== id));
      return true;
    } catch (err: any) {
      console.error('Error al eliminar producto:', err.message, err.response?.data);
      setError('Error al eliminar el producto.');
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
