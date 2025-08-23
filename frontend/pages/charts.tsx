import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BasePageProps } from '../types/user';

const Charts: React.FC<BasePageProps> = ({ isLoggedIn, userData }) => {
    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Charts</Text>
                <Text style={styles.headerSubtitle}>Track your fitness progress</Text>
            </View>

            {/* Content */}
            <View style={styles.content}>
                <View style={styles.progressContainer}>
                    <MaterialIcons name="analytics" size={64} color="#E0E0E0" />
                    <Text style={styles.progressText}>In Progress</Text>
                    <Text style={styles.description}>
                        We're working hard to bring you detailed workout analytics and progress tracking charts.
                    </Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#000000',
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#666666',
        marginTop: 4,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    progressContainer: {
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        borderRadius: 16,
        padding: 40,
        borderWidth: 2,
        borderColor: '#E0E0E0',
        borderStyle: 'dashed',
    },
    progressText: {
        fontSize: 24,
        fontWeight: '600',
        color: '#666666',
        marginTop: 16,
        marginBottom: 12,
    },
    description: {
        fontSize: 16,
        color: '#666666',
        textAlign: 'center',
        lineHeight: 24,
        maxWidth: 280,
    },
});

export default Charts;