import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { lightTheme, darkTheme, typography } from '../shared/theme';
import { useAuth, Negocio } from '../shared/context/AuthContext';
import { useTheme } from '../shared/context/ThemeContext';

// Market screens
import MarketDashboardScreen from '../market/screens/DashboardScreen';
import MarketVentasScreen from '../market/screens/VentasScreen';
import MarketInventarioScreen from '../market/screens/InventarioScreen';

// Services screens
import ServicesDashboardScreen from '../services/screens/DashboardScreen';
import ServicesVentasScreen from '../services/screens/VentasScreen';
import ServicesInventarioScreen from '../services/screens/InventarioScreen';
import CalendarioEspecialistasScreen from '../services/screens/CalendarioEspecialistasScreen';

// Shared screens
import AdminHubScreen from '../shared/screens/AdminHubScreen';
import ReservasScreen from '../shared/screens/ReservasScreen';

// Categorías que son "Market" (venta de productos/comida)
const MARKET_CATEGORIES = ['COMIDA', 'FRUTERIA'];
// Categorías que son "Services" (servicios con especialistas)
const SERVICES_CATEGORIES = ['BELLEZA', 'LAVAUTOS', 'JARDINERIA'];

export type MainTabParamList = {
    Dashboard: undefined;
    Ventas: undefined;
    Inventario: undefined;
    Calendario: undefined;
    Panel: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainAppNavigator() {
    const { isAdmin, user } = useAuth();
    const { isDark } = useTheme();

    const negocioActual = typeof user?.negocioActivo === 'object'
        ? user.negocioActivo as Negocio
        : (user?.negocioIds?.find(n => (typeof n === 'object' ? n._id : n) === user?.negocioActivo) as Negocio);

    const categoria = negocioActual?.categoria || 'COMIDA';
    const isMarket = MARKET_CATEGORIES.includes(categoria);
    const isLavadoIndividual = categoria === 'LAVAUTOS' && negocioActual?.esEstablecimiento === false;

    // Explicit theme colors based on context
    const colors = isDark ? darkTheme : lightTheme;

    // Seleccionar las pantallas correctas según el tipo de negocio
    const DashboardScreen = isMarket ? MarketDashboardScreen : ServicesDashboardScreen;
    const VentasScreen = isMarket ? MarketVentasScreen : (isLavadoIndividual ? ReservasScreen : ServicesVentasScreen);
    const InventarioScreen = isMarket ? MarketInventarioScreen : ServicesInventarioScreen;

    // Decidir si mostrar inventario (ahora siempre se muestra para que registren insumos)
    const showInventario = true;

    // Iconos según categoría
    const getTabIcon = (route: string, focused: boolean): keyof typeof Ionicons.glyphMap => {
        if (isMarket) {
            // Iconos estilo Market
            switch (route) {
                case 'Dashboard': return focused ? 'home' : 'home-outline';
                case 'Ventas': return focused ? 'cart' : 'cart-outline';
                case 'Inventario': return focused ? 'cube' : 'cube-outline';
                case 'Panel': return focused ? 'grid' : 'grid-outline';
                default: return 'home';
            }
        } else {
            // Iconos estilo Services
            switch (route) {
                case 'Dashboard': return focused ? 'sparkles' : 'sparkles-outline';
                case 'Ventas': 
                    if (categoria === 'LAVAUTOS') return focused ? 'car-sport' : 'car-sport-outline';
                    if (categoria === 'JARDINERIA') return focused ? 'leaf' : 'leaf-outline';
                    return focused ? 'cut' : 'cut-outline';
                case 'Inventario': return focused ? 'brush' : 'brush-outline';
                case 'Calendario': return focused ? 'calendar' : 'calendar-outline';
                case 'Panel': return focused ? 'grid' : 'grid-outline';
                default: return 'home';
            }
        }
    };

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                animation: 'shift',
                tabBarIcon: ({ focused, color }) => {
                    const iconName = getTabIcon(route.name, focused);
                    return <Ionicons name={iconName} size={20} color={color} />;
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textMuted,
                tabBarStyle: {
                    backgroundColor: colors.card,
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                    height: Platform.OS === 'ios' ? 85 : 55,
                    paddingBottom: Platform.OS === 'ios' ? 30 : 6,
                    paddingTop: 6,
                    paddingHorizontal: 5,
                },
                tabBarLabelStyle: {
                    fontSize: 10,
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
                options={{ tabBarLabel: isLavadoIndividual ? 'Lavados' : 'Ventas' }}
            />
            {showInventario && (
                <Tab.Screen
                    name="Inventario"
                    component={InventarioScreen}
                    options={{ tabBarLabel: 'Inventario' }}
                />
            )}

            {/* Calendario solo para Services (Belleza, Lavautos, Jardinería) */}
            {!isMarket && isAdmin && (
                <Tab.Screen
                    name="Calendario"
                    component={CalendarioEspecialistasScreen}
                    options={{ tabBarLabel: 'Turnos' }}
                />
            )}

            {/* Panel de Admin */}
            {isAdmin && (
                <Tab.Screen
                    name="Panel"
                    component={AdminHubScreen}
                    options={{ tabBarLabel: 'Otros' }}
                />
            )}
        </Tab.Navigator>
    );
}
