import React from 'react';
import { View, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import Toast, { ToastConfig, ToastProps } from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../theme';

const { width } = Dimensions.get('window');

const CustomToast = ({
    text1,
    text2,
    icon,
    color
}: {
    text1?: string;
    text2?: string;
    icon: any;
    color: string
}) => (
    <View style={[styles.toastContainer, { borderLeftColor: color }]}>
        <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
            <Ionicons name={icon} size={20} color={color} />
        </View>
        <View style={styles.textContainer}>
            {text1 && <Text style={styles.title}>{text1}</Text>}
            {text2 && <Text style={styles.subtitle}>{text2}</Text>}
        </View>
    </View>
);

const toastConfig: ToastConfig = {
    success: ({ text1, text2 }: any) => (
        <CustomToast
            text1={text1}
            text2={text2}
            icon="checkmark-circle"
            color={colors.primary}
        />
    ),
    error: ({ text1, text2 }: any) => (
        <CustomToast
            text1={text1}
            text2={text2}
            icon="alert-circle"
            color={colors.error}
        />
    ),
    info: ({ text1, text2 }: any) => (
        <CustomToast
            text1={text1}
            text2={text2}
            icon="information-circle"
            color="#3b82f6"
        />
    )
};

const styles = StyleSheet.create({
    toastContainer: {
        width: Platform.OS === 'web' ? 350 : width - 40,
        backgroundColor: colors.white,
        borderRadius: 18,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderLeftWidth: 6,
        // Sombra suave estilo Apple
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 15,
        elevation: 8,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        fontSize: 14,
        fontWeight: '800',
        color: colors.textPrimary,
        marginBottom: 2,
    },
    subtitle: {
        fontSize: 12,
        color: colors.textSecondary,
        fontWeight: '500',
    }
});

const KitchyToast = () => {
    return (
        <Toast
            config={toastConfig}
            topOffset={Platform.OS === 'ios' ? 60 : 40}
            visibilityTime={3000}
        />
    );
};

export default KitchyToast;
