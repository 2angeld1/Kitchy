import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  useFonts,
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_700Bold,
  Inter_900Black
} from '@expo-google-fonts/inter';

// Shared screens
import LoginScreen from './src/shared/screens/LoginScreen';
import RegisterScreen from './src/shared/screens/RegisterScreen';
import ForgotPasswordScreen from './src/shared/screens/ForgotPasswordScreen';
import UsuariosScreen from './src/shared/screens/UsuariosScreen';
import GastosScreen from './src/shared/screens/GastosScreen';
import FinanzasScreen from './src/shared/screens/FinanzasScreen';
import SoporteScreen from './src/shared/screens/SoporteScreen';
import CaitlynStrategyScreen from './src/shared/screens/CaitlynStrategyScreen';
import EncuestasScreen from './src/shared/screens/EncuestasScreen';
import FeedbacksScreen from './src/shared/screens/FeedbacksScreen';
import ReservasScreen from './src/shared/screens/ReservasScreen';

// Market screens
import ProductosScreen from './src/market/screens/ProductosScreen';
import MenuAppScreen from './src/market/screens/MenuAppScreen';
import ConfiguracionMenuScreen from './src/market/screens/ConfiguracionMenuScreen';
import PresupuestarioScreen from './src/market/screens/PresupuestarioScreen';

// Services screens
import EspecialistasScreen from './src/services/screens/EspecialistasScreen';
import ComisionesScreen from './src/services/screens/ComisionesScreen';
import ServiciosScreen from './src/services/screens/ServiciosScreen';
import BellezaResumenScreen from './src/services/screens/BellezaResumenScreen';
import CalendarioEspecialistasScreen from './src/services/screens/CalendarioEspecialistasScreen';

// Navigation
import MainAppNavigator from './src/navigation/MainAppNavigator';

// Shared context & components
import { AuthProvider, useAuth } from './src/shared/context/AuthContext';
import { ThemeProvider, useTheme } from './src/shared/context/ThemeContext';
import { DimensionsProvider } from './src/shared/context/DimensionsContext';
import { lightTheme, darkTheme } from './src/shared/theme';
import VestaToast from './src/shared/components/VestaToast';
import { VersionChecker } from './src/shared/components/VersionChecker';
import { CaitlynOnboardingWizard } from './src/shared/components/CaitlynOnboardingWizard';

// Suprimir advertencias inofensivas en Web provocadas por react-native-chart-kit / react-native-svg
if (Platform.OS === 'web') {
  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    if (typeof args[0] === 'string' && (
      args[0].includes('Unknown event handler property') ||
      args[0].includes('Invalid DOM property')
    )) {
      return; // Lo ignoramos
    }
    originalConsoleError(...args);
  };
}

export type RootStackParamList = {
  // Auth
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  // Main
  Main: undefined;
  // Shared
  Usuarios: undefined;
  Gastos: undefined;
  Finanzas: undefined;
  Soporte: undefined;
  CaitlynStrategy: { alerta: any };
  Encuestas: undefined;
  Feedbacks: undefined;
  Reservas: undefined;
  // Market
  Productos: { editProductId?: string; suggestedPrice?: string } | undefined;
  MenuApp: undefined;
  ConfiguracionMenu: undefined;
  Presupuestario: undefined;
  // Services
  Especialistas: undefined;
  Comisiones: undefined;
  Servicios: undefined;
  BellezaResumen: undefined;
  CalendarioEspecialistas: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const ExpoStatusBar = StatusBar as any;

function RootNavigator() {
  const { isAuthenticated, loading } = useAuth();
  const { isDark } = useTheme();
  const colors = isDark ? darkTheme : lightTheme;

  React.useEffect(() => {
    if (Platform.OS === 'web') {
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) {
        meta.setAttribute('content', colors.background);
      } else {
        const newMeta = document.createElement('meta');
        newMeta.name = 'theme-color';
        newMeta.content = colors.background;
        document.getElementsByTagName('head')[0].appendChild(newMeta);
      }
    }
  }, [isDark, colors.background]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <ExpoStatusBar style={isDark ? 'light' : 'dark'} backgroundColor={colors.background} translucent />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            {/* Main Tabs */}
            <Stack.Screen name="Main" component={MainAppNavigator} />

            {/* Shared screens */}
            <Stack.Screen name="Usuarios" component={UsuariosScreen} />
            <Stack.Screen name="Gastos" component={GastosScreen} />
            <Stack.Screen name="Finanzas" component={FinanzasScreen} />
            <Stack.Screen name="Soporte" component={SoporteScreen} />
            <Stack.Screen name="CaitlynStrategy" component={CaitlynStrategyScreen} />
            <Stack.Screen name="Encuestas" component={EncuestasScreen} />
            <Stack.Screen name="Feedbacks" component={FeedbacksScreen} />
            <Stack.Screen name="Reservas" component={ReservasScreen} />

            {/* Market screens */}
            <Stack.Screen name="Productos" component={ProductosScreen} />
            <Stack.Screen name="MenuApp" component={MenuAppScreen} />
            <Stack.Screen name="ConfiguracionMenu" component={ConfiguracionMenuScreen} />
            <Stack.Screen name="Presupuestario" component={PresupuestarioScreen} />

            {/* Services screens */}
            <Stack.Screen name="Especialistas" component={EspecialistasScreen} />
            <Stack.Screen name="Comisiones" component={ComisionesScreen} />
            <Stack.Screen name="Servicios" component={ServiciosScreen} />
            <Stack.Screen name="BellezaResumen" component={BellezaResumenScreen} />
            <Stack.Screen name="CalendarioEspecialistas" component={CalendarioEspecialistasScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </>
        )}
      </Stack.Navigator>
      {isAuthenticated && <CaitlynOnboardingWizard />}
    </>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
    Inter_900Black,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: lightTheme.background }}>
        <ActivityIndicator size="large" color={lightTheme.primary} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <DimensionsProvider>
        <ThemeProvider>
          <AuthProvider>
            <SafeAreaProvider>
              <NavigationContainer
                documentTitle={{
                  formatter: () => 'Vesta'
                }}
              >
                <RootNavigator />
                <VestaToast />
                <VersionChecker />
              </NavigationContainer>
            </SafeAreaProvider>
          </AuthProvider>
        </ThemeProvider>
      </DimensionsProvider>
    </GestureHandlerRootView>
  );
}
