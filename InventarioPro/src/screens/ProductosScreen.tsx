import React, { useContext, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  RefreshControl,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { ProductoContext } from '../context/ProductoContext';
import { Producto } from '../types/producto';

interface ProductosScreenProps {
  navigation: any;
}

export const ProductosScreen: React.FC<ProductosScreenProps> = ({ navigation }) => {
  const { productos, cargando, error, obtenerProductos, eliminarProducto } = useContext(ProductoContext);

  const [busqueda, setBusqueda] = useState('');
  const [escaneando, setEscaneando] = useState(false);
  const procesandoCodigo = useRef(false);

  const [permission, requestPermission] = useCameraPermissions();

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

  const handleEditar = (producto: Producto) => {
    navigation.navigate('Agregar', { producto });
  };

  const abrirEscanerCodigo = async () => {
  if (!permission?.granted) {
    const { granted } = await requestPermission();

    if (!granted) {
      Alert.alert(
        'Permiso Denegado',
        'Se requiere acceso a la cámara para escanear el código de barras.'
      );
      return;
    }
  }

  procesandoCodigo.current = false;
  setEscaneando(true);
};


  const handleBarcodeScanned = ({ data }: { data: string }) => {
  if (procesandoCodigo.current) {
    return;
  }

  procesandoCodigo.current = true;

  setEscaneando(false);
  setBusqueda(data);

  const productoEncontrado = productos.find(
    (p) =>
      p.codigoBarras === data ||
      p.nombre.toLowerCase().includes(data.toLowerCase())
  );

  if (productoEncontrado) {
    Alert.alert(
      '🔍 Producto Encontrado',
      `Nombre: ${productoEncontrado.nombre}\nPrecio: $${productoEncontrado.precio.toFixed(2)}\nCategoría: ${productoEncontrado.categoria}`,
      [
        {
          text: 'Aceptar',
          onPress: () => {
            procesandoCodigo.current = false;
          },
        },
      ],
      {
        onDismiss: () => {
          procesandoCodigo.current = false;
        },
      }
    );
  } else {
    Alert.alert(
      'Código Escaneado',
      `Filtro aplicado para: "${data}". No se encontró coincidencia exacta en el inventario.`,
      [
        {
          text: 'Aceptar',
          onPress: () => {
            procesandoCodigo.current = false;
          },
        },
      ],
      {
        onDismiss: () => {
          procesandoCodigo.current = false;
        },
      }
    );
  }
};

  // Filtrado en vivo de productos
  const productosFiltrados = productos.filter((p) => {
    const query = busqueda.toLowerCase().trim();
    if (!query) return true;
    return (
      p.nombre.toLowerCase().includes(query) ||
      p.categoria.toLowerCase().includes(query) ||
      (p.codigoBarras && p.codigoBarras.toLowerCase().includes(query))
    );
  });


  const renderProductoItem = ({ item }: { item: Producto }) => {
    return (
      <View style={styles.card}>
        <View style={styles.cardAccentBar} />

        {item.fotoBase64 ? (
          <Image
            source={{ uri: `data:image/jpeg;base64,${item.fotoBase64}` }}
            style={styles.imagenProducto}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.cuadroSinImagen}>
            <Ionicons name="cube-outline" size={24} color="#94A3B8" />
            <Text style={styles.textoSinImagen}>Sin Foto</Text>
          </View>
        )}

        <View style={styles.infoContenedor}>
          <Text style={styles.nombreProducto} numberOfLines={1}>
            {item.nombre}
          </Text>
          <Text style={styles.precioProducto}>${item.precio.toFixed(2)}</Text>

          <View style={styles.badgesFila}>
            <View style={styles.categoriaBadge}>
              <Ionicons name="pricetag" size={11} color="#2563EB" style={{ marginRight: 4 }} />
              <Text style={styles.categoriaTexto}>{item.categoria}</Text>
            </View>

            {item.codigoBarras ? (
              <View style={styles.barcodeBadge}>
                <Ionicons name="barcode-outline" size={11} color="#059669" style={{ marginRight: 4 }} />
                <Text style={styles.barcodeTexto}>{item.codigoBarras}</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.accionesFila}>
          <TouchableOpacity
            style={styles.botonEditar}
            onPress={() => handleEditar(item)}
            activeOpacity={0.7}
          >
            <Ionicons name="create-outline" size={18} color="#2563EB" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botonEliminar}
            onPress={() => handleEliminar(item.id, item.nombre)}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.contenedor}>
      {/* Banner de error de servidor si existe */}
      {error ? (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={20} color="#DC2626" style={{ marginRight: 8 }} />
          <Text style={styles.errorTexto}>{error}</Text>
        </View>
      ) : null}

      <Text>
        Total de Productos: {productos.length}
      </Text>
      
      <FlatList
        data={productosFiltrados}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProductoItem}
        contentContainerStyle={styles.listaContainer}
        refreshControl={
          <RefreshControl refreshing={cargando} onRefresh={obtenerProductos} colors={['#2563EB']} />
        }
        ListHeaderComponent={
          /* Buscador y Botón de Escáner de Código de Barras */
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Ionicons name="search-outline" size={20} color="#64748B" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar nombre, categoría o código..."
                placeholderTextColor="#94A3B8"
                value={busqueda}
                onChangeText={setBusqueda}
              />
              {busqueda ? (
                <TouchableOpacity onPress={() => setBusqueda('')} style={{ padding: 4 }}>
                  <Ionicons name="close-circle" size={18} color="#94A3B8" />
                </TouchableOpacity>
              ) : null}
            </View>

            <TouchableOpacity
              style={styles.botonEscanearHeader}
              onPress={abrirEscanerCodigo}
              activeOpacity={0.8}
            >
              <Ionicons name="barcode-outline" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        }
        ListEmptyComponent={
          !cargando ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyStateCircle}>
                <Ionicons name="search" size={40} color="#94A3B8" />
              </View>
              <Text style={styles.emptyStateTitle}>
                {busqueda ? 'No hay coincidencias' : 'No hay productos en inventario'}
              </Text>
              <Text style={styles.emptyStateSub}>
                {busqueda
                  ? `No se encontraron resultados para "${busqueda}".`
                  : 'Ve a la pestaña "Agregar" para registrar tu primer producto.'}
              </Text>

              {busqueda ? (
                <TouchableOpacity style={styles.botonResetBusqueda} onPress={() => setBusqueda('')}>
                  <Text style={styles.textoResetBusqueda}>Limpiar filtro</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : null
        }
      />

      {/* Botón Flotante para Escanear Código (FAB) */}
      <TouchableOpacity
        style={styles.fabEscanear}
        onPress={abrirEscanerCodigo}
        activeOpacity={0.85}
      >
        <Ionicons name="qr-code-outline" size={22} color="#FFFFFF" style={{ marginRight: 6 }} />
        <Text style={styles.fabTexto}>Escanear</Text>
      </TouchableOpacity>

      {/* Modal de Cámara para Escanear Código de Barras / QR */}
      <Modal visible={escaneando} animationType="slide" onRequestClose={() => setEscaneando(false)}>
        <View style={styles.scannerModal}>
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="back"
            onBarcodeScanned={handleBarcodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ['qr', 'ean13', 'code128', 'upc_a', 'code39'],
            }}
          />
          <View style={styles.overlayScanner}>
            <View style={styles.headerScannerModal}>
              <Text style={styles.tituloModalScanner}>Escanear Código de Barras / QR</Text>
            </View>
            <View style={styles.reticleFrame} />
            <Text style={styles.instruccionScanner}>
              Coloca el código dentro del recuadro para buscar en el inventario
            </Text>
            <TouchableOpacity style={styles.botonCerrarScanner} onPress={() => setEscaneando(false)}>
              <Ionicons name="close-circle-outline" size={24} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.textoCerrarScanner}>Cancelar Escaneo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  listaContainer: {
    padding: 16,
    paddingBottom: 90,
  },
  dashboardCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  dashboardTitulo: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  statsFila: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  statValor: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  dividerStat: {
    width: 1,
    height: 32,
    backgroundColor: '#E2E8F0',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
  },
  botonEscanearHeader: {
    width: 48,
    height: 48,
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardAccentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: '#2563EB',
  },
  imagenProducto: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    marginLeft: 6,
  },
  cuadroSinImagen: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  textoSinImagen: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  infoContenedor: {
    flex: 1,
    marginLeft: 12,
  },
  nombreProducto: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  precioProducto: {
    fontSize: 15,
    fontWeight: '800',
    color: '#059669',
    marginTop: 2,
  },
  badgesFila: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  categoriaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  categoriaTexto: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2563EB',
  },
  barcodeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  barcodeTexto: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
  },
  accionesFila: {
    flexDirection: 'column',
    gap: 8,
    marginLeft: 6,
  },
  botonEditar: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  botonEliminar: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
  },
  errorTexto: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyStateCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#334155',
  },
  emptyStateSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 32,
    lineHeight: 18,
  },
  botonResetBusqueda: {
    marginTop: 16,
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  textoResetBusqueda: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  fabEscanear: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#7C3AED',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 30,
    elevation: 6,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabTexto: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  scannerModal: {
    flex: 1,
    backgroundColor: '#000000',
  },
  overlayScanner: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  headerScannerModal: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
  },
  tituloModalScanner: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  reticleFrame: {
    width: 260,
    height: 260,
    borderWidth: 2,
    borderColor: '#38BDF8',
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  instruccionScanner: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  botonCerrarScanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.95)',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 30,
  },
  textoCerrarScanner: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
