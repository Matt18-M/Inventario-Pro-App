import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { ProductoProvider } from './src/context/ProductoContext';
import { ProductosScreen } from './src/screens/ProductosScreen';
import { NuevoProductoScreen } from './src/screens/NuevoProductoScreen';

export type RootTabParamList = {
  Listado: undefined;
  Agregar: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function App() {
  return (
    <ProductoProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <Tab.Navigator
          initialRouteName="Listado"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#2563EB',
            },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            tabBarActiveTintColor: '#2563EB',
            tabBarInactiveTintColor: '#6B7280',
            tabBarStyle: {
              height: 60,
              paddingBottom: 8,
              paddingTop: 6,
            },
          }}
        >
          <Tab.Screen
            name="Listado"
            component={ProductosScreen}
            options={{
              title: 'Inventario',
              tabBarLabel: 'Inventario',
              tabBarIcon: ({ color, size }) => (
                <Text style={{ fontSize: size - 2, color }}>📦</Text>
              ),
            }}
          />
          <Tab.Screen
            name="Agregar"
            component={NuevoProductoScreen}
            options={{
              title: 'Nuevo Producto',
              tabBarLabel: 'Agregar',
              tabBarIcon: ({ color, size }) => (
                <Text style={{ fontSize: size - 2, color }}>➕</Text>
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </ProductoProvider>
  );
}
