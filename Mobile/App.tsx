import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import MainAppNavigator from './src/navigation/MainAppNavigator';
import ProductosScreen from './src/screens/ProductosScreen';
import UsuariosScreen from './src/screens/UsuariosScreen';
import MenuAppScreen from './src/screens/MenuAppScreen';
import ConfiguracionMenuScreen from './src/screens/ConfiguracionMenuScreen';
import { AuthProvider } from './src/context/AuthContext';
import { useAuth } from './src/context/AuthContext';
import { View, ActivityIndicator, Platform } from 'react-native';
import { lightTheme, darkTheme } from './src/theme';
import KitchyToast from './src/components/KitchyToast';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
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
  Productos: undefined;
  Usuarios: undefined;
  MenuApp: undefined;
  ConfiguracionMenu: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function RootNavigator() {
  const { isAuthenticated, loading } = useAuth();
  const { isDark } = useTheme();
  const colors = isDark ? darkTheme : lightTheme;

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} translucent />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Main" component={MainAppNavigator} />
            <Stack.Screen name="Productos" component={ProductosScreen} />
            <Stack.Screen name="Usuarios" component={UsuariosScreen} />
            <Stack.Screen name="MenuApp" component={MenuAppScreen} />
            <Stack.Screen name="ConfiguracionMenu" component={ConfiguracionMenuScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
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
      <ThemeProvider>
        <AuthProvider>
          <NavigationContainer>
            <RootNavigator />
            <KitchyToast />
          </NavigationContainer>
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
