import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DashboardScreen from '../screens/DashboardScreen';
import AdminHubScreen from '../screens/AdminHubScreen';
import VentasScreen from '../screens/VentasScreen';
import InventarioScreen from '../screens/InventarioScreen';
import { Ionicons } from '@expo/vector-icons';
import { lightTheme, darkTheme, typography } from '../theme';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export type MainTabParamList = {
    Dashboard: undefined;
    Ventas: undefined;
    Inventario: undefined;
    Panel: undefined; // Pestaña que agrupa todas las opciones de admin
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainAppNavigator() {
    const { isAdmin } = useAuth();
    const { isDark } = useTheme();

    // Explicit theme colors based on context
    const colors = isDark ? darkTheme : lightTheme;

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                animation: 'shift', // Transición de deslizamiento suave (React Navigation 7+)
                tabBarIcon: ({ focused, color }) => {
                    let iconName: keyof typeof Ionicons.glyphMap = 'home';

                    if (route.name === 'Dashboard') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Ventas') {
                        iconName = focused ? 'cart' : 'cart-outline';
                    } else if (route.name === 'Inventario') {
                        iconName = focused ? 'cube' : 'cube-outline';
                    } else if (route.name === 'Panel') {
                        iconName = focused ? 'grid' : 'grid-outline';
                    }

                    return <Ionicons name={iconName} size={20} color={color} />; // Size fijo de 20 para evitar gigantes en Web
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
                component={DashboardScreen}
                options={{ tabBarLabel: 'Inicio' }}
            />
            <Tab.Screen
                name="Ventas"
                component={VentasScreen}
                options={{ tabBarLabel: 'Ventas' }}
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
