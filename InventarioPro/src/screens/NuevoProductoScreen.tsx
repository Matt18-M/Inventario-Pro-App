import React, { useState, useContext } from 'react';
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
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ProductoContext } from '../context/ProductoContext';

interface NuevoProductoScreenProps {
  navigation: any;
}

export const NuevoProductoScreen: React.FC<NuevoProductoScreenProps> = ({ navigation }) => {
  const { agregarProducto } = useContext(ProductoContext);

  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [categoria, setCategoria] = useState('');
  const [fotoBase64, setFotoBase64] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  // Cámara: Un botón grande que invoque a ImagePicker.launchCameraAsync
  const tomarFotografia = async () => {
    try {
      const permisoResult = await ImagePicker.requestCameraPermissionsAsync();

      if (!permisoResult.granted) {
        Alert.alert('Permiso denegado', 'Se requiere acceso a la cámara para tomar fotos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets[0]?.base64) {
        setFotoBase64(result.assets[0].base64);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo tomar la fotografía.');
    }
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

    const exito = await agregarProducto({
      nombre: nombre.trim(),
      precio: precioNum,
      categoria: categoria.trim() || 'General',
      fotoBase64,
    });

    setGuardando(false);

    if (exito) {
      setNombre('');
      setPrecio('');
      setCategoria('');
      setFotoBase64(null);

      Alert.alert('¡Éxito!', 'Producto registrado exitosamente.', [
        {
          text: 'Ver Inventario',
          onPress: () => navigation.navigate('Listado'),
        },
      ]);
    } else {
      Alert.alert('Error', 'No se pudo registrar el producto en el servidor.');
    }
  };

  // Botón verde de "Guardar Producto" que solo funcione si el nombre y el precio no están vacíos
  const botonHabilitado = nombre.trim().length > 0 && precio.trim().length > 0 && !guardando;

  return (
    <ScrollView style={styles.contenedor} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.tituloHeader}>➕ Agregar Producto</Text>

      {/* Formulario con TextInput para nombre, precio y categoría */}
      <View style={styles.formGrupo}>
        <Text style={styles.label}>Nombre del Producto *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Teclado Mecánico RGB"
          value={nombre}
          onChangeText={setNombre}
        />
      </View>

      <View style={styles.formGrupo}>
        <Text style={styles.label}>Precio ($) *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: 49.99"
          keyboardType="decimal-pad"
          value={precio}
          onChangeText={setPrecio}
        />
      </View>

      <View style={styles.formGrupo}>
        <Text style={styles.label}>Categoría</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Electrónica, Accesorios..."
          value={categoria}
          onChangeText={setCategoria}
        />
      </View>

      {/* Cámara: Un botón grande que invoque a ImagePicker.launchCameraAsync */}
      <TouchableOpacity style={styles.botonCamaraGrande} onPress={tomarFotografia} activeOpacity={0.8}>
        <Text style={styles.iconoCamara}>📸</Text>
        <Text style={styles.textoBotonCamara}>Tomar Fotografía con la Cámara</Text>
      </TouchableOpacity>

      {/* Preview: Cuando se tome la foto, debe aparecer un pequeño cuadro debajo mostrando la imagen recién capturada */}
      {fotoBase64 ? (
        <View style={styles.previewContenedor}>
          <Text style={styles.previewLabel}>Previsualización de la foto:</Text>
          <Image
            source={{ uri: `data:image/jpeg;base64,${fotoBase64}` }}
            style={styles.previewImagen}
          />
          <TouchableOpacity style={styles.botonBorrarFoto} onPress={() => setFotoBase64(null)}>
            <Text style={styles.textoBorrarFoto}>❌ Eliminar Foto</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Guardado: Un botón verde de "Guardar Producto" */}
      <TouchableOpacity
        style={[
          styles.botonGuardarVerde,
          !botonHabilitado && styles.botonGuardarDeshabilitado,
        ]}
        onPress={handleGuardarProducto}
        disabled={!botonHabilitado}
        activeOpacity={0.8}
      >
        {guardando ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.textoBotonGuardar}>💾 Guardar Producto</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  tituloHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 20,
    textAlign: 'center',
  },
  formGrupo: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#111827',
  },
  botonCamaraGrande: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    marginVertical: 14,
    elevation: 4,
  },
  iconoCamara: {
    fontSize: 22,
    marginRight: 8,
  },
  textoBotonCamara: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  previewContenedor: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  previewLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 8,
  },
  previewImagen: {
    width: 140,
    height: 140,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
  },
  botonBorrarFoto: {
    marginTop: 8,
  },
  textoBorrarFoto: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
  },
  botonGuardarVerde: {
    backgroundColor: '#10B981',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    elevation: 4,
  },
  botonGuardarDeshabilitado: {
    backgroundColor: '#9CA3AF',
    elevation: 0,
  },
  textoBotonGuardar: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
  },
});
