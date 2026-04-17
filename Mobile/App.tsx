import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import MainAppNavigator from './src/navigation/MainAppNavigator';
import ProductosScreen from './src/screens/ProductosScreen';
import UsuariosScreen from './src/screens/UsuariosScreen';
import MenuAppScreen from './src/screens/MenuAppScreen';
import ConfiguracionMenuScreen from './src/screens/ConfiguracionMenuScreen';
import GastosScreen from './src/screens/GastosScreen';
import FinanzasScreen from './src/screens/FinanzasScreen';
import ComisionesScreen from './src/screens/ComisionesScreen';
import EspecialistasScreen from './src/screens/EspecialistasScreen';
import ServiciosScreen from './src/screens/ServiciosScreen';
import SoporteScreen from './src/screens/SoporteScreen';
import CaitlynStrategyScreen from './src/screens/CaitlynStrategyScreen';
import PresupuestarioScreen from './src/screens/PresupuestarioScreen';
import BellezaResumenScreen from './src/screens/BellezaResumenScreen';
import { AuthProvider } from './src/context/AuthContext';
import { useAuth } from './src/context/AuthContext';
import { View, ActivityIndicator, Platform } from 'react-native';
import { lightTheme, darkTheme } from './src/theme';
import KitchyToast from './src/components/KitchyToast';
import { VersionChecker } from './src/components/VersionChecker';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { DimensionsProvider } from './src/context/DimensionsContext';
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
  Login: undefined;
  Register: undefined;
  Main: undefined;
  Productos: { editProductId?: string; suggestedPrice?: string } | undefined;
  Usuarios: undefined;
  MenuApp: undefined;
  ConfiguracionMenu: undefined;
  Gastos: undefined;
  Finanzas: undefined;
  Comisiones: undefined;
  Especialistas: undefined;
  Servicios: undefined;
  Soporte: undefined;
  CaitlynStrategy: { alerta: any };
  Presupuestario: undefined;
  BellezaResumen: undefined;
};

import { CaitlynOnboardingWizard } from './src/components/CaitlynOnboardingWizard';

const Stack = createNativeStackNavigator<RootStackParamList>();

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
      <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={colors.background} translucent />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Main" component={MainAppNavigator} />
            <Stack.Screen name="Productos" component={ProductosScreen} />
            <Stack.Screen name="Usuarios" component={UsuariosScreen} />
            <Stack.Screen name="MenuApp" component={MenuAppScreen} />
            <Stack.Screen name="ConfiguracionMenu" component={ConfiguracionMenuScreen} />
            <Stack.Screen name="Gastos" component={GastosScreen} />
            <Stack.Screen name="Finanzas" component={FinanzasScreen} />
            <Stack.Screen name="Comisiones" component={ComisionesScreen} />
            <Stack.Screen name="Especialistas" component={EspecialistasScreen} />
            <Stack.Screen name="Servicios" component={ServiciosScreen} />
            <Stack.Screen name="Soporte" component={SoporteScreen} />
            <Stack.Screen name="CaitlynStrategy" component={CaitlynStrategyScreen} />
            <Stack.Screen name="Presupuestario" component={PresupuestarioScreen} />
            <Stack.Screen name="BellezaResumen" component={BellezaResumenScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
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
              <NavigationContainer>
                <RootNavigator />
                <KitchyToast />
                <VersionChecker />
              </NavigationContainer>
            </SafeAreaProvider>
          </AuthProvider>
        </ThemeProvider>
      </DimensionsProvider>
    </GestureHandlerRootView>
  );
}
