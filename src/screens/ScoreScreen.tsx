import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ScoreScreen() {
    const route = useRoute();
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { score } = route.params as { score: string | number };

    const numericScore = typeof score === 'string' ? parseFloat(score) : score;

    const getSeverity = (s: number) => {
        // 0- normal, 1-mild, 2-moderate, 3-severe, 4-very severe
        const rounded = Math.round(s);
        if (rounded <= 0) return { label: 'Normal', color: '#4ade80' }; // Green
        if (rounded === 1) return { label: 'Mild', color: '#facc15' }; // Yellow
        if (rounded === 2) return { label: 'Moderate', color: '#fbbf24' }; // Amber
        if (rounded === 3) return { label: 'Severe', color: '#f87171' }; // Red
        return { label: 'Very Severe', color: '#dc2626' }; // Dark Red
    };

    const severity = getSeverity(numericScore);

    return (
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <View style={styles.card}>
                <Text style={styles.title}>Analysis Result</Text>

                <View style={[styles.scoreCircle, { borderColor: severity.color }]}>
                    <Text style={[styles.scoreValue, { color: severity.color }]}>
                        {numericScore.toFixed(2)}
                    </Text>
                </View>

                <View style={styles.resultContainer}>
                    <Text style={[styles.severityLabel, { color: severity.color }]}>
                        {severity.label}
                    </Text>
                    <Text style={styles.severitySubtext}>
                        UPDRS-based Severity Rating
                    </Text>
                </View>
            </View>

            <TouchableOpacity
                style={[styles.doneButton, { backgroundColor: severity.color }]}
                onPress={() => (navigation as any).navigate('NeuroSenseReport', { patient: (route.params as any).patient })}
            >
                <Text style={styles.doneText}>Done</Text>
            </TouchableOpacity>

            {route.params && (route.params as any).videoUri && (
                <TouchableOpacity
                    style={[styles.secondaryButton]}
                    onPress={() => (navigation as any).navigate('Replay', {
                        videoUri: (route.params as any).videoUri,
                        frames: (route.params as any).frames
                    })}
                >
                    <Text style={styles.secondaryText}>View CV Analysis</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#111827', // Dark background
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 40,
    },
    card: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        width: '100%',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 40,
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    scoreCircle: {
        width: 200,
        height: 200,
        borderRadius: 100,
        borderWidth: 8,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        marginBottom: 40,
    },
    scoreValue: {
        fontSize: 64,
        fontWeight: 'bold',
    },
    resultContainer: {
        alignItems: 'center',
    },
    severityLabel: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    severitySubtext: {
        color: '#9ca3af',
        fontSize: 16,
    },
    doneButton: {
        width: '100%',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 20,
    },
    doneText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    secondaryButton: {
        marginTop: 15,
        padding: 10,
    },
    secondaryText: {
        color: '#9ca3af',
        fontSize: 16,
        textDecorationLine: 'underline',
    },
});
