import React, { useState, useContext, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { ProductoContext } from '../context/ProductoContext';
import { Producto } from '../types/producto';

interface NuevoProductoScreenProps {
  navigation: any;
  route?: any;
}

export const NuevoProductoScreen: React.FC<NuevoProductoScreenProps> = ({ navigation, route }) => {
  const { agregarProducto, actualizarProducto } = useContext(ProductoContext);

  // Si viene un producto por parámetro, entramos en modo edición
  const productoEditar: Producto | undefined = route?.params?.producto;
  const esEdicion = !!productoEditar;

  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [categoria, setCategoria] = useState('');
  const [codigoBarras, setCodigoBarras] = useState('');
  const [fotoBase64, setFotoBase64] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  // Estado para el modal de escáner de código de barras
  const [escaneando, setEscaneando] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  const procesandoCodigo = useRef(false);

  // Precargar los campos si estamos editando un producto existente
  useEffect(() => {
    if (productoEditar) {
      setNombre(productoEditar.nombre ?? '');
      setPrecio(
        productoEditar.precio !== undefined && productoEditar.precio !== null
          ? String(productoEditar.precio)
          : ''
      );
      setCategoria(productoEditar.categoria ?? '');
      setCodigoBarras(productoEditar.codigoBarras ?? '');
      setFotoBase64(productoEditar.fotoBase64 ?? null);

      navigation.setOptions?.({ title: 'Editar Producto' });
    } else {
      navigation.setOptions?.({ title: 'Nuevo Producto' });
    }
  }, [productoEditar]);

  // Como el Tab.Navigator no desmonta esta pantalla al cambiar de pestaña,
  // si el usuario toca la pestaña "Agregar" directamente (no desde "editar"),
  // limpiamos los params para volver a modo "crear" en vez de quedar
  // pegados en modo edición con los datos del último producto editado.
  useEffect(() => {
    const unsubscribe = navigation.addListener?.('tabPress', () => {
      if (route?.params?.producto) {
        navigation.setParams({ producto: undefined });
        limpiarFormulario();
      }
    });
    return unsubscribe;
  }, [navigation, route?.params?.producto]);

  const tomarFotografia = async () => {
    try {
      const permisoResult = await ImagePicker.requestCameraPermissionsAsync();

      if (!permisoResult.granted) {
        Alert.alert(
          'Permiso Denegado',
          'Se requiere acceso a la cámara para tomar la foto del producto.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 0.5,
        base64: true,
      });

      

      if (!result.canceled && result.assets && result.assets.length > 0 && result.assets[0].base64) {
        setFotoBase64(result.assets[0].base64);
        Alert.alert("Foto tomada con exito")  
      }
    } catch (error: any) {
      console.error('Error al abrir la cámara:', error);
      Alert.alert('Error de Cámara', error?.message || 'No se pudo abrir la cámara.');
    }
  };

  const abrirEscanerCodigo = async () => {
    if (!permission?.granted) {
      const resultado = await requestPermission();

      if (!resultado.granted) {
        Alert.alert(
          'Permiso Denegado',
          'Se necesita permiso para usar la cámara y escanear el código.'
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

    setCodigoBarras(data);
    setEscaneando(false);

    Alert.alert(
      'Código detectado',
      `Código: ${data}`,
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
  };

  const limpiarFormulario = () => {
    setNombre('');
    setPrecio('');
    setCategoria('');
    setCodigoBarras('');
    setFotoBase64(null);
  };

  const handleGuardarProducto = async () => {
    if (!nombre.trim() || !precio.trim()) {
      Alert.alert('Campos requeridos', 'Por favor ingresa el nombre y el precio del producto.');
      return;
    }

    const precioNum = parseFloat(precio);
    if (isNaN(precioNum) || precioNum <= 0) {
      Alert.alert('Precio inválido', 'Ingresa un precio numérico válido.');
      return;
    }

    setGuardando(true);

    const payload = {
      nombre: nombre.trim(),
      precio: precioNum,
      categoria: categoria.trim() || 'General',
      codigoBarras: codigoBarras.trim() || null,
      fotoBase64,
    };

    const exito = esEdicion
      ? await actualizarProducto(productoEditar!.id, payload)
      : await agregarProducto(payload);

    setGuardando(false);

    if (exito) {
      if (esEdicion) {
        Alert.alert('¡Actualizado!', 'El producto se actualizó correctamente.', [
          {
            text: 'Ver Inventario',
            onPress: () => navigation.navigate('Listado'),
          },
        ]);
      } else {
        limpiarFormulario();
        Alert.alert('¡Éxito!', 'Producto registrado exitosamente.', [
          {
            text: 'Ver Inventario',
            onPress: () => navigation.navigate('Listado'),
          },
        ]);
      }
    } else {
      Alert.alert(
        'Error',
        esEdicion
          ? 'No se pudo actualizar el producto en el servidor.'
          : 'No se pudo registrar el producto en el servidor.'
      );
    }
  };

  const botonHabilitado = nombre.trim().length > 0 && precio.trim().length > 0 && !guardando;

  return (
    <ScrollView style={styles.contenedor} contentContainerStyle={styles.scrollContent}>
      <View style={styles.cardForm}>
        {/* Campo Nombre */}
        <View style={styles.formGrupo}>
          <Text style={styles.label}>Nombre del Producto *</Text>
          <View style={styles.inputContenedor}>
            <Ionicons name="cube-outline" size={20} color="#64748B" style={styles.inputIcono} />
            <TextInput
              style={styles.input}
              placeholder="Ej: Teclado Mecánico RGB"
              placeholderTextColor="#94A3B8"
              value={nombre}
              onChangeText={setNombre}
            />
          </View>
        </View>

        {/* Campo Precio */}
        <View style={styles.formGrupo}>
          <Text style={styles.label}>Precio ($) *</Text>
          <View style={styles.inputContenedor}>
            <Ionicons name="cash-outline" size={20} color="#64748B" style={styles.inputIcono} />
            <TextInput
              style={styles.input}
              placeholder="Ej: 49.99"
              placeholderTextColor="#94A3B8"
              keyboardType="decimal-pad"
              value={precio}
              onChangeText={setPrecio}
            />
          </View>
        </View>

        {/* Campo Categoría */}
        <View style={styles.formGrupo}>
          <Text style={styles.label}>Categoría</Text>
          <View style={styles.inputContenedor}>
            <Ionicons name="pricetag-outline" size={20} color="#64748B" style={styles.inputIcono} />
            <TextInput
              style={styles.input}
              placeholder="Ej: Electrónica, Accesorios..."
              placeholderTextColor="#94A3B8"
              value={categoria}
              onChangeText={setCategoria}
            />
          </View>
        </View>

        {/* Campo Código de Barras (Reto Opcional) */}
        <View style={styles.formGrupo}>
          <Text style={styles.label}>Código de Barras / QR (Opcional)</Text>
          <View style={styles.inputContenedor}>
            <Ionicons name="barcode-outline" size={20} color="#64748B" style={styles.inputIcono} />
            <TextInput
              style={styles.input}
              placeholder="Ej: 789123456789"
              placeholderTextColor="#94A3B8"
              value={codigoBarras}
              onChangeText={setCodigoBarras}
            />
            <TouchableOpacity style={styles.botonEscanearInline} onPress={abrirEscanerCodigo}>
              <Ionicons name="qr-code-outline" size={20} color="#7C3AED" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Botón Escanear Código de Barras */}
        <TouchableOpacity style={styles.botonEscanearGran} onPress={abrirEscanerCodigo} activeOpacity={0.8}>
          <Ionicons name="barcode-outline" size={22} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.textoBotonEscanear}>Escanear Código con la Cámara</Text>
        </TouchableOpacity>

        {/* Botón Grande para Tomar Fotografía */}
        <TouchableOpacity style={styles.botonCamaraGrande} onPress={tomarFotografia} activeOpacity={0.8}>
          <Ionicons name="camera-outline" size={24} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.textoBotonCamara}>Tomar Fotografía con la Cámara</Text>
        </TouchableOpacity>

        {/* Previsualización de Foto */}
        {fotoBase64 ? (
          <View style={styles.previewContenedor}>
            <Text style={styles.previewLabel}>
              {esEdicion ? 'Foto del producto:' : 'Foto recien capturada:'}
            </Text>
            <Image
              source={{ uri: `data:image/jpeg;base64,${fotoBase64}` }}
              style={styles.previewImagen}
            />
            <TouchableOpacity style={styles.botonBorrarFoto} onPress={() => setFotoBase64(null)}>
              <Ionicons name="trash-outline" size={16} color="#EF4444" style={{ marginRight: 4 }} />
              <Text style={styles.textoBorrarFoto}>Eliminar Foto</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Botón Guardar / Actualizar Producto */}
        <TouchableOpacity
          style={[
            styles.botonGuardarVerde,
            !botonHabilitado && styles.botonGuardarDeshabilitado,
          ]}
          onPress={handleGuardarProducto}
          disabled={!botonHabilitado}
          activeOpacity={0.85}
        >
          {guardando ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons
                name={esEdicion ? 'sync-outline' : 'save-outline'}
                size={22}
                color="#FFFFFF"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.textoBotonGuardar}>
                {esEdicion ? 'Actualizar Producto' : 'Guardar Producto'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Modal para Escáner de Código de Barras */}
      <Modal
          visible={escaneando}
          animationType="slide"
          onRequestClose={() => setEscaneando(false)}
        >
          <View style={styles.scannerModal}>
            <CameraView
              style={StyleSheet.absoluteFill}
              facing="back"
              onBarcodeScanned={handleBarcodeScanned}
              barcodeScannerSettings={{
                barcodeTypes: [
                  'qr',
                  'ean13',
                  'ean8',
                  'code128',
                  'code39',
                  'upc_a',
                  'upc_e',
                ],
              }}
            />

            <View style={styles.overlayScanner}>
              <Text style={styles.tituloScanner}>
                Escanear código
              </Text>

              <View style={styles.reticleFrame} />

              <Text style={styles.instruccionScanner}>
                Coloca el código dentro del recuadro
              </Text>

              <TouchableOpacity
                style={styles.botonCerrarScanner}
                onPress={() => setEscaneando(false)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="close-circle-outline"
                  size={24}
                  color="#FFFFFF"
                  style={{ marginRight: 6 }}
                />

                <Text style={styles.textoCerrarScanner}>
                  Cancelar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  cardForm: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  formGrupo: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  inputContenedor: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  inputIcono: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 11,
    fontSize: 15,
    color: '#0F172A',
  },
  botonEscanearInline: {
    padding: 6,
  },
  botonEscanearGran: {
    backgroundColor: '#7C3AED',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
  },
  textoBotonEscanear: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  botonCamaraGrande: {
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 16,
    elevation: 3,
  },
  textoBotonCamara: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  previewContenedor: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },
  previewImagen: {
    width: 150,
    height: 150,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
  },
  botonBorrarFoto: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  textoBorrarFoto: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
  },
  botonGuardarVerde: {
    backgroundColor: '#059669',
    flexDirection: 'row',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    elevation: 3,
  },
  botonGuardarDeshabilitado: {
    backgroundColor: '#94A3B8',
    elevation: 0,
  },
  textoBotonGuardar: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  scannerModal: {
    flex: 1,
    backgroundColor: '#000000',
  },
  overlayScanner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  reticleFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#38BDF8',
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  instruccionScanner: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 24,
    textAlign: 'center',
  },
  botonCerrarScanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    marginTop: 30,
  },
  textoCerrarScanner: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  tituloScanner: {
    position: 'absolute',
    top: 60,
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
});
