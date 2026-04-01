import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { TouchableOpacity as GHTouchableOpacity } from 'react-native-gesture-handler';
import { User } from '../../../hooks/useUsuarios';

interface Props {
    user: User;
    index: number;
    isMe: boolean;
    colors: any;
    styles: any;
    onEditRole: (user: User) => void;
    onDelete: (id: string) => void;
    getRoleInfo: (rol: string) => { label: string, color: string, icon: string };
}

export const UserItemCard: React.FC<Props> = ({
    user, index, isMe, colors, styles, onEditRole, onDelete, getRoleInfo
}) => {
    const roleInfo = getRoleInfo(user.rol);
    const isProtected = user.rol === 'admin';

    const renderRightActions = () => (
        <View style={{ flexDirection: 'row', alignItems: 'center', height: '100%' }}>
            <TouchableOpacity
                style={{ backgroundColor: colors.surface, width: 60, height: '100%', justifyContent: 'center', alignItems: 'center', borderRadius: 16, marginRight: 4, borderWidth: 1, borderColor: colors.border }}
                onPress={() => onEditRole(user)}
            >
                <Ionicons name="key" size={22} color={colors.textPrimary} />
            </TouchableOpacity>
            {!isProtected && (
                <TouchableOpacity
                    style={{ backgroundColor: 'rgba(225, 29, 72, 0.1)', width: 60, height: '100%', justifyContent: 'center', alignItems: 'center', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(225, 29, 72, 0.2)' }}
                    onPress={() => onDelete(user._id)}
                >
                    <Ionicons name="trash" size={22} color="#e11d48" />
                </TouchableOpacity>
            )}
        </View>
    );

    return (
        <Animated.View entering={FadeInDown.delay(index * 50)} style={{ marginBottom: 8 }}>
            <Swipeable renderRightActions={isMe ? () => <View /> : renderRightActions}>
                <GHTouchableOpacity
                    style={[styles.userCard, { backgroundColor: isMe ? `${colors.primary}10` : colors.card, borderColor: isMe ? colors.primary : colors.border }]}
                    activeOpacity={0.8}
                    onPress={() => !isMe && onEditRole(user)}
                >
                    <View style={[styles.avatarBox, { backgroundColor: `${roleInfo.color}15` }]}>
                        <Ionicons name={roleInfo.icon as any} size={24} color={roleInfo.color} />
                    </View>

                    <View style={styles.infoContainer}>
                        <Text style={[styles.nameText, { color: colors.textPrimary }]} numberOfLines={1}>
                            {user.nombre} {isMe && <Text style={{ color: colors.primary, fontSize: 12 }}> (Tú)</Text>}
                        </Text>

                        <View style={[styles.roleTag, { backgroundColor: `${roleInfo.color}15` }]}>
                            <Ionicons name="ribbon" size={12} color={roleInfo.color} />
                            <Text style={[styles.roleText, { color: roleInfo.color }]}>{roleInfo.label}</Text>
                        </View>

                        <Text style={[styles.emailText, { color: colors.textSecondary }]}>{user.email}</Text>
                    </View>

                    {!isMe && <Ionicons name="chevron-back" size={18} color={colors.textMuted} style={{ opacity: 0.8 }} />}
                </GHTouchableOpacity>
            </Swipeable>
        </Animated.View>
    );
};
