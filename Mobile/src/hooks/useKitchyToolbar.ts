import { useState, useMemo } from 'react';
import { useAuth, Negocio } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import Toast from 'react-native-toast-message';
import { lightTheme, darkTheme } from '../theme';
import { switchNegocio } from '../services/api';

export const useKitchyToolbar = () => {
    const { logout, user, switchNegocioContext } = useAuth();
    const { isDark } = useTheme();
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    const [showNotif, setShowNotif] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [isSwitching, setIsSwitching] = useState(false);
    const [showSwitchModal, setShowSwitchModal] = useState(false);

    // Explicit theme colors based on context
    const colors = isDark ? darkTheme : lightTheme;

    // Helper to get active business data safely
    const negocioActual = useMemo(() => {
        if (!user) return null;
        return typeof user.negocioActivo === 'object'
            ? user.negocioActivo as Negocio
            : (user.negocioIds?.find(n => (typeof n === 'object' ? n._id : n) === user.negocioActivo) as Negocio);
    }, [user]);

    // Check if user has multiple businesses
    const hasMultipleNegocios = (user?.negocioIds && user.negocioIds.length > 1) ?? false;

    const handleLogout = () => {
        logout();
        Toast.show({
            type: 'info',
            text1: 'Sesión Cerrada',
            text2: 'Vuelve pronto',
            position: 'top'
        });
    };

    const handleSwitchNegocio = async (negocioId: string) => {
        if (!user || negocioId === user.negocioActivo) {
            setShowSwitchModal(false);
            return;
        }

        setIsSwitching(true);
        try {
            // we need to call the switch API
            // using api directly since we are in the toolbar
            const api = require('../services/api').default;
            const res = await api.put(`/negocios/switch/${negocioId}`);

            if (res.data.success && res.data.user) {
                await switchNegocioContext(res.data.user, res.data.token);
                setShowSwitchModal(false);
                setShowUserMenu(false);
                Toast.show({ type: 'success', text1: 'Éxito', text2: 'Has cambiado de negocio.' });
            }
        } catch (err: any) {
            Toast.show({ 
                type: 'error', 
                text1: 'Error', 
                text2: err.response?.data?.message || 'Error al cambiar de negocio' 
            });
        } finally {
            setIsSwitching(false);
        }
    };

    return {
        user,
        isDark,
        colors,
        navigation,
        showNotif,
        setShowNotif,
        showUserMenu,
        setShowUserMenu,
        isSwitching,
        showSwitchModal,
        setShowSwitchModal,
        negocioActual,
        hasMultipleNegocios,
        handleLogout,
        handleSwitchNegocio
    };
};
