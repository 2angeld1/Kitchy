import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Platform, AppState, AppStateStatus } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { lightTheme, darkTheme } from '../theme';
import { getSystemVersion } from '../services/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { SlideInDown, SlideInUp } from 'react-native-reanimated';

export const CURRENT_CLIENT_VERSION = '1.0.0';

export const VersionChecker = () => {
    const [updateAvailable, setUpdateAvailable] = useState(false);
    const { isDark } = useTheme();
    const colors = isDark ? darkTheme : lightTheme;
    const insets = useSafeAreaInsets();
    const appState = useRef(AppState.currentState);

    useEffect(() => {
        if (Platform.OS !== 'web') return;

        const checkVersion = async () => {
            try {
                const res = await getSystemVersion();
                const backendVersion = res.data?.version;
                if (backendVersion && backendVersion !== CURRENT_CLIENT_VERSION) {
                    setUpdateAvailable(true);
                }
            } catch (error) {
                // ignorar errores silenciosos
            }
        };

        // Checar al instante
        checkVersion();
        
        // Checar al regresar o "despertar" la app
        const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
            if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
                checkVersion();
            }
            appState.current = nextAppState;
        });

        return () => {
            subscription.remove();
        };
    }, []);

    if (!updateAvailable) return null;

    const handleReload = () => {
        try {
            const win: any = window;
            if (win && win.caches) {
                win.caches.keys().then(function(names: string[]) {
                    for (let name of names) win.caches.delete(name);
                }).then(() => {
                    win.location.reload(); 
                });
            } else if (win) {
                win.location.reload();
            }
        } catch (err) {
            console.log('Error recargando', err);
        }
    };

    return (
        <Animated.View 
            entering={SlideInDown}
            style={{ 
                position: 'absolute', 
                bottom: Platform.OS === 'ios' ? Math.max(insets.bottom, 20) : 20, 
                left: 20, 
                right: 20, 
                zIndex: 99999,
                alignItems: 'center'
            }}
            pointerEvents="box-none"
        >
            <View style={{ 
                backgroundColor: colors.primary, 
                padding: 16, 
                borderRadius: 20, 
                width: '100%', 
                maxWidth: 450, 
                flexDirection: 'row', 
                alignItems: 'center', 
                gap: 14,
                shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 15
            }}>
                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}>
                    <Ionicons name="sparkles" size={24} color={colors.primary} />
                </View>

                <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: '900', color: '#fff', marginBottom: 2 }}>Nueva versión de Kitchy</Text>
                    <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>Actualiza para la mejor experiencia.</Text>
                </View>

                <TouchableOpacity
                    onPress={handleReload}
                    style={{ backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 }}
                >
                    <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '800' }}>Recargar</Text>
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
};
