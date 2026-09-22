export interface Producto {
  id: number;
  nombre: string;
  precio: number;
  categoria: string;
  codigoBarras?: string | null;
  fotoBase64?: string | null;
  createdAt: string;
}

export interface NuevoProducto {
  nombre: string;
  precio: number;
  categoria: string;
  codigoBarras?: string | null;
  fotoBase64?: string | null;
}
