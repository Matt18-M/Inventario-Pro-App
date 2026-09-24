import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { ProductoProvider } from './src/context/ProductoContext';
import { ProductosScreen } from './src/screens/ProductosScreen';
import { NuevoProductoScreen } from './src/screens/NuevoProductoScreen';
import { Producto } from './src/types/producto';

export type RootTabParamList = {
  Listado: undefined;
  // Sin params = modo "crear"; con { producto } = modo "editar"
  Agregar: { producto?: Producto } | undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function App() {
  return (
    <ProductoProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <Tab.Navigator
          initialRouteName="Listado"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#0F172A',
              elevation: 4,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 4,
            },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: {
              fontWeight: '700',
              fontSize: 18,
            },
            tabBarActiveTintColor: '#2563EB',
            tabBarInactiveTintColor: '#64748B',
            tabBarStyle: {
              height: 64,
              paddingBottom: 10,
              paddingTop: 8,
              backgroundColor: '#FFFFFF',
              borderTopColor: '#E2E8F0',
              borderTopWidth: 1,
            },
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '600',
            },
          }}
        >
          <Tab.Screen
            name="Listado"
            component={ProductosScreen}
            options={{
              title: 'Inventario Pro',
              tabBarLabel: 'Inventario',
              tabBarIcon: ({ color, size, focused }) => (
                <Ionicons
                  name={focused ? 'cube' : 'cube-outline'}
                  size={size}
                  color={color}
                />
              ),
            }}
          />
          <Tab.Screen
            name="Agregar"
            component={NuevoProductoScreen}
            options={{
              title: 'Nuevo Producto',
              tabBarLabel: 'Agregar',
              tabBarIcon: ({ color, size, focused }) => (
                <Ionicons
                  name={focused ? 'add-circle' : 'add-circle-outline'}
                  size={size + 2}
                  color={color}
                />
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </ProductoProvider>
  );
}
