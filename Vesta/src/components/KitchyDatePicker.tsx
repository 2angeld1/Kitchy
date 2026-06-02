import React from 'react';
import { View, Text, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { KitchyInput } from './KitchyInput';
import { useTheme } from '../context/ThemeContext';
import { lightTheme, darkTheme, spacing, borderRadius, typography } from '../theme';

interface KitchyDatePickerProps {
    label: string;
    value: string; // Esperamos formato YYYY-MM-DD
    onChange: (date: string) => void;
    error?: string;
    placeholder?: string;
}

/**
 * KitchyDatePicker - Un selector de fecha "plataforma-agnóstico"
 * En Web/PWA: Usa un input nativo tipo 'date' para invocar el calendario del navegador.
 * En Native: Usa @react-native-community/datetimepicker con un trigger de TouchableOpacity.
 */
export const KitchyDatePicker: React.FC<KitchyDatePickerProps> = ({ 
    label, 
    value, 
    onChange, 
    error,
    placeholder = 'Selecciona una fecha'
}) => {
    const { isDark } = useTheme();
    const colors = isDark ? darkTheme : lightTheme;
    const [showPicker, setShowPicker] = React.useState(false);

    // Para la Web (PWA) usamos el input nativo del navegador que es más confiable
    if (Platform.OS === 'web') {
        return (
            <KitchyInput
                label={label}
                value={value}
                onChangeText={onChange}
                error={error}
                placeholder={placeholder}
                // @ts-ignore - 'type' es una propiedad específica de react-native-web
                type="date"
            />
        );
    }

    // Para Nativo (iOS/Android) mantenemos el comportamiento actual optimizado
    const onDateChange = (event: any, selectedDate?: Date) => {
        setShowPicker(false);
        if (selectedDate) {
            const formatted = selectedDate.toISOString().split('T')[0];
            onChange(formatted);
        }
    };

    const dateValue = value ? new Date(value + 'T12:00:00') : new Date();

    return (
        <View style={styles.container}>
            {label && <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>}
            
            <TouchableOpacity 
                onPress={() => setShowPicker(true)} 
                activeOpacity={0.7}
                style={[
                    styles.inputContainer,
                    {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                    },
                    error ? { borderColor: colors.error, borderWidth: 2 } : null
                ]}
            >
                <Text style={{ 
                    fontSize: typography.fontSize.base, 
                    fontWeight: typography.fontWeight.bold,
                    color: value ? colors.textPrimary : colors.textMuted
                }}>
                    {value || placeholder}
                </Text>
            </TouchableOpacity>

            {showPicker && (
                <DateTimePicker
                    value={dateValue}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onDateChange}
                    minimumDate={new Date()}
                />
            )}

            {error ? <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text> : null}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.md,
    },
    label: {
        fontFamily: typography.fontFamily.bold,
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.black,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: spacing.sm,
        marginLeft: spacing.xs,
    },
    inputContainer: {
        height: 56,
        width: '100%',
        borderWidth: 1,
        borderRadius: borderRadius.lg,
        paddingHorizontal: 20,
        justifyContent: 'center'
    },
    errorText: {
        fontFamily: typography.fontFamily.regular,
        fontSize: typography.fontSize.sm,
        marginTop: spacing.xs,
        marginLeft: spacing.xs,
    }
});
