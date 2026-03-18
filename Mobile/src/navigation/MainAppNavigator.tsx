import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DashboardScreen from '../screens/DashboardScreen';
import BellezaDashboardScreen from '../screens/BellezaDashboardScreen';
import AdminHubScreen from '../screens/AdminHubScreen';
import VentasScreen from '../screens/VentasScreen';
import BellezaReventaScreen from '../screens/BellezaReventaScreen';
import InventarioScreen from '../screens/InventarioScreen';
import { Ionicons } from '@expo/vector-icons';
import { lightTheme, darkTheme, typography } from '../theme';
import { useAuth, Negocio } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export type MainTabParamList = {
    Dashboard: undefined;
    Reventa: undefined;
    Ventas: undefined;
    Inventario: undefined;
    Panel: undefined; // Pestaña que agrupa todas las opciones de admin
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainAppNavigator() {
    const { isAdmin, user } = useAuth();
    const { isDark } = useTheme();

    const negocioActual = typeof user?.negocioActivo === 'object' 
        ? user.negocioActivo as Negocio 
        : (user?.negocioIds?.find(n => (typeof n === 'object' ? n._id : n) === user?.negocioActivo) as Negocio);
    
    const categoria = negocioActual?.categoria || 'COMIDA';

    // Explicit theme colors based on context
    const colors = isDark ? darkTheme : lightTheme;

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                animation: 'shift', // Transición de deslizamiento suave (React Navigation 7+)
                tabBarIcon: ({ focused, color }) => {
                    let iconName: keyof typeof Ionicons.glyphMap = 'home';
                    const isBelleza = categoria === 'BELLEZA';

                    if (route.name === 'Dashboard') {
                        iconName = isBelleza 
                            ? (focused ? 'sparkles' : 'sparkles-outline')
                            : (focused ? 'home' : 'home-outline');
                    } else if (route.name === 'Reventa') {
                        iconName = focused ? 'bag-handle' : 'bag-handle-outline';
                    } else if (route.name === 'Ventas') {
                        iconName = isBelleza 
                            ? (focused ? 'cut' : 'cut-outline')
                            : (focused ? 'cart' : 'cart-outline');
                    } else if (route.name === 'Inventario') {
                        iconName = isBelleza 
                            ? (focused ? 'brush' : 'brush-outline')
                            : (focused ? 'cube' : 'cube-outline');
                    } else if (route.name === 'Panel') {
                        iconName = focused ? 'grid' : 'grid-outline';
                    }

                    return <Ionicons name={iconName} size={20} color={color} />; 
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textMuted,
                tabBarStyle: {
                    backgroundColor: colors.card,
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                    height: Platform.OS === 'ios' ? 85 : 55, // Altura general más limpia
                    paddingBottom: Platform.OS === 'ios' ? 30 : 6,
                    paddingTop: 6,
                    // Si hay 6 items, ayuda a que los items estén muy pegados
                    paddingHorizontal: 5,
                },
                tabBarLabelStyle: {
                    fontSize: 10, // Texto super tiny para que no sobresalga con muchos items
                    fontWeight: typography.fontWeight.bold,
                    marginBottom: Platform.OS === 'ios' ? 0 : 4,
                }
            })}
        >
            <Tab.Screen
                name="Dashboard"
                component={categoria === 'BELLEZA' ? BellezaDashboardScreen : DashboardScreen}
                options={{ tabBarLabel: 'Inicio' }}
            />
            {categoria === 'BELLEZA' && (
                <Tab.Screen
                    name="Reventa"
                    component={BellezaReventaScreen}
                    options={{ tabBarLabel: 'Reventa' }}
                />
            )}
            <Tab.Screen
                name="Ventas"
                component={VentasScreen}
                options={{ tabBarLabel: categoria === 'BELLEZA' ? 'Cortes' : 'Ventas' }}
            />
            <Tab.Screen
                name="Inventario"
                component={InventarioScreen}
                options={{ tabBarLabel: 'Stock' }}
            />

            {/* Agrupación de todas las rutas "Pro/Admin" en una sola pestaña */}
            {isAdmin && (
                <Tab.Screen
                    name="Panel"
                    component={AdminHubScreen}
                    options={{ tabBarLabel: 'Admin' }}
                />
            )}
        </Tab.Navigator>
    );
}
