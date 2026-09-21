import React, { useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import { ProductoContext } from '../context/ProductoContext';
import { Producto } from '../types/producto';

export const ProductosScreen: React.FC = () => {
  const { productos, cargando, error, obtenerProductos, eliminarProducto } = useContext(ProductoContext);

  const handleEliminar = (id: number, nombre: string) => {
    Alert.alert(
      'Eliminar Producto',
      `¿Estás seguro de que deseas borrar "${nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const exito = await eliminarProducto(id);
            if (!exito) {
              Alert.alert('Error', 'No se pudo eliminar el producto del servidor.');
            }
          },
        },
      ]
    );
  };

  const renderProductoItem = ({ item }: { item: Producto }) => {
    return (
      <View style={styles.card}>
        {/* Condicional visual: Si tiene fotoBase64 dibuja <Image>, si es null muestra un cuadrado gris "Sin Imagen" */}
        {item.fotoBase64 ? (
          <Image
            source={{ uri: `data:image/jpeg;base64,${item.fotoBase64}` }}
            style={styles.imagenProducto}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.cuadroSinImagen}>
            <Text style={styles.textoSinImagen}>Sin Imagen</Text>
          </View>
        )}

        <View style={styles.infoContenedor}>
          <Text style={styles.nombreProducto}>{item.nombre}</Text>
          <Text style={styles.precioProducto}>${item.precio.toFixed(2)}</Text>
          <Text style={styles.categoriaBadge}>{item.categoria}</Text>
        </View>

        {/* Botón con emoji 🗑️ para eliminar */}
        <TouchableOpacity
          style={styles.botonEliminar}
          onPress={() => handleEliminar(item.id, item.nombre)}
          activeOpacity={0.7}
        >
          <Text style={styles.iconoEliminar}>🗑️</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.contenedor}>
      <Text style={styles.tituloHeader}>📦 Inventario Pro</Text>

      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorTexto}>{error}</Text>
        </View>
      ) : null}

      <FlatList
        data={productos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProductoItem}
        contentContainerStyle={styles.listaContainer}
        refreshControl={
          <RefreshControl refreshing={cargando} onRefresh={obtenerProductos} colors={['#2563EB']} />
        }
        ListEmptyComponent={
          !cargando ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>📋</Text>
              <Text style={styles.emptyStateTitle}>No hay productos registrados</Text>
              <Text style={styles.emptyStateSub}>
                Ve a la pestaña "Agregar" para registrar tu primer producto.
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingTop: 10,
  },
  tituloHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginVertical: 12,
  },
  listaContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imagenProducto: {
    width: 75,
    height: 75,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
  },
  cuadroSinImagen: {
    width: 75,
    height: 75,
    borderRadius: 8,
    backgroundColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoSinImagen: {
    color: '#4B5563',
    fontSize: 11,
    fontWeight: '600',
  },
  infoContenedor: {
    flex: 1,
    marginLeft: 12,
  },
  nombreProducto: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  precioProducto: {
    fontSize: 15,
    fontWeight: '600',
    color: '#059669',
    marginTop: 2,
  },
  categoriaBadge: {
    fontSize: 12,
    color: '#4F46E5',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
    overflow: 'hidden',
  },
  botonEliminar: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconoEliminar: {
    fontSize: 18,
  },
  errorBanner: {
    backgroundColor: '#FEE2E2',
    padding: 10,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  errorTexto: {
    color: '#DC2626',
    textAlign: 'center',
    fontSize: 13,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
  },
  emptyStateSub: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 30,
  },
});
