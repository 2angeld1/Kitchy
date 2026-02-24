import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import MainAppNavigator from './src/navigation/MainAppNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { useAuth } from './src/context/AuthContext';
import { View, ActivityIndicator } from 'react-native';
import { lightTheme, darkTheme } from './src/theme';
import KitchyToast from './src/components/KitchyToast';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_700Bold,
  Inter_900Black
} from '@expo-google-fonts/inter';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Main: undefined;
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
          <Stack.Screen name="Main" component={MainAppNavigator} />
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
    <ThemeProvider>
      <AuthProvider>
        <NavigationContainer>
          <RootNavigator />
          <KitchyToast />
        </NavigationContainer>
      </AuthProvider>
    </ThemeProvider>
  );
}
