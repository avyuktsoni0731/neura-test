import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Dimensions } from 'react-native';
import Video, { OnProgressData, VideoRef } from 'react-native-video';
import Svg, { Circle, Line, Text as SvgText } from 'react-native-svg';
import { useRoute, useNavigation } from '@react-navigation/native';
import { FrameData } from '../native/videoprocessor';

const { width, height } = Dimensions.get('window');

// MediaPipe Hand Landmark Connections (based on MediaPipe topology)
const HAND_CONNECTIONS = [
    // Thumb
    ['WRIST', 'THUMB_CMC'], ['THUMB_CMC', 'THUMB_MCP'], ['THUMB_MCP', 'THUMB_IP'], ['THUMB_IP', 'THUMB_TIP'],
    // Index finger
    ['WRIST', 'INDEX_FINGER_MCP'], ['INDEX_FINGER_MCP', 'INDEX_FINGER_PIP'], ['INDEX_FINGER_PIP', 'INDEX_FINGER_DIP'], ['INDEX_FINGER_DIP', 'INDEX_FINGER_TIP'],
    // Middle finger
    ['WRIST', 'MIDDLE_FINGER_MCP'], ['MIDDLE_FINGER_MCP', 'MIDDLE_FINGER_PIP'], ['MIDDLE_FINGER_PIP', 'MIDDLE_FINGER_DIP'], ['MIDDLE_FINGER_DIP', 'MIDDLE_FINGER_TIP'],
    // Ring finger
    ['WRIST', 'RING_FINGER_MCP'], ['RING_FINGER_MCP', 'RING_FINGER_PIP'], ['RING_FINGER_PIP', 'RING_FINGER_DIP'], ['RING_FINGER_DIP', 'RING_FINGER_TIP'],
    // Pinky
    ['WRIST', 'PINKY_MCP'], ['PINKY_MCP', 'PINKY_PIP'], ['PINKY_PIP', 'PINKY_DIP'], ['PINKY_DIP', 'PINKY_TIP'],
    // Palm connections
    ['INDEX_FINGER_MCP', 'MIDDLE_FINGER_MCP'], ['MIDDLE_FINGER_MCP', 'RING_FINGER_MCP'], ['RING_FINGER_MCP', 'PINKY_MCP'],
];

const renderHandConnections = (landmarks: { [key: string]: { x: number; y: number } }) => {
    return HAND_CONNECTIONS.map(([start, end], index) => {
        const startPoint = landmarks[start];
        const endPoint = landmarks[end];

        if (startPoint && endPoint) {
            return (
                <Line
                    key={`connection-${index}`}
                    x1={startPoint.x}
                    y1={startPoint.y}
                    x2={endPoint.x}
                    y2={endPoint.y}
                    stroke="#FF4444"
                    strokeWidth="0.004"
                />
            );
        }
        return null;
    });
};

export default function ReplayScreen() {
    const route = useRoute();
    const navigation = useNavigation();
    const { videoUri, frames, score } = route.params as { videoUri: string; frames: FrameData[], score: string | number };

    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const videoRef = useRef<VideoRef>(null);

    const [showScore, setShowScore] = useState(false);

    // Find the closest frame data for current time
    const currentFrame = frames?.find(f => Math.abs(f.time - currentTime) < 0.1); // 100ms tolerance

    console.log("ReplayScreen received URI:", videoUri);

    const onProgress = (data: OnProgressData) => {
        setCurrentTime(data.currentTime);
    };

    const onLoad = (data: { duration: number }) => {
        console.log("Video loaded. Duration:", data.duration);
        setDuration(data.duration);
    };

    const onError = (error: any) => {
        console.error("Video playback error:", error);
    };

    const onEnd = () => {
        console.log("Video ended");
        if (!showScore) {
            setShowScore(true);
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
                <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>

            <Video
                source={{ uri: videoUri }}
                style={styles.video}
                resizeMode="contain"
                onProgress={onProgress}
                onLoad={onLoad}
                onError={onError}
                onEnd={onEnd}
                repeat={true}
                controls={true}
            />

            {/* Overlay Layer */}
            <View style={styles.overlay} pointerEvents="none">
                <Svg height="100%" width="100%" viewBox={`0 0 1 1`}>
                    {currentFrame && currentFrame.landmarks && (
                        <>
                            {/* MediaPipe Hand Landmark Connections */}
                            {renderHandConnections(currentFrame.landmarks)}

                            {/* Draw all landmarks as circles */}
                            {Object.entries(currentFrame.landmarks).map(([name, point]) => (
                                <Circle
                                    key={name}
                                    cx={point.x}
                                    cy={point.y}
                                    r="0.008"
                                    fill="#00FF00"
                                    stroke="#FFFFFF"
                                    strokeWidth="0.002"
                                />
                            ))}

                            {/* Draw and label key landmarks */}
                            {currentFrame.landmarks.WRIST && (
                                <>
                                    <Circle
                                        cx={currentFrame.landmarks.WRIST.x}
                                        cy={currentFrame.landmarks.WRIST.y}
                                        r="0.015"
                                        fill="red"
                                        stroke="#FFFFFF"
                                        strokeWidth="0.003"
                                    />
                                    <SvgText
                                        x={currentFrame.landmarks.WRIST.x + 0.05}
                                        y={currentFrame.landmarks.WRIST.y}
                                        fill="white"
                                        fontSize="0.04"
                                        fontWeight="bold"
                                        textAnchor="start"
                                    >
                                        WRIST
                                    </SvgText>
                                </>
                            )}

                            {currentFrame.landmarks.THUMB_TIP && (
                                <>
                                    <Circle
                                        cx={currentFrame.landmarks.THUMB_TIP.x}
                                        cy={currentFrame.landmarks.THUMB_TIP.y}
                                        r="0.015"
                                        fill="#FF00FF"
                                        stroke="#FFFFFF"
                                        strokeWidth="0.003"
                                    />
                                    <SvgText
                                        x={currentFrame.landmarks.THUMB_TIP.x}
                                        y={currentFrame.landmarks.THUMB_TIP.y - 0.05}
                                        fill="white"
                                        fontSize="0.04"
                                        fontWeight="bold"
                                        textAnchor="middle"
                                    >
                                        THUMB_TIP
                                    </SvgText>
                                </>
                            )}

                            {currentFrame.landmarks.INDEX_FINGER_TIP && (
                                <>
                                    <Circle
                                        cx={currentFrame.landmarks.INDEX_FINGER_TIP.x}
                                        cy={currentFrame.landmarks.INDEX_FINGER_TIP.y}
                                        r="0.015"
                                        fill="#00FFFF"
                                        stroke="#FFFFFF"
                                        strokeWidth="0.003"
                                    />
                                    <SvgText
                                        x={currentFrame.landmarks.INDEX_FINGER_TIP.x}
                                        y={currentFrame.landmarks.INDEX_FINGER_TIP.y - 0.05}
                                        fill="white"
                                        fontSize="0.04"
                                        fontWeight="bold"
                                        textAnchor="middle"
                                    >
                                        INDEX_FINGER_TIP
                                    </SvgText>
                                </>
                            )}
                        </>
                    )}
                </Svg>
            </View>

            {/* Score and Controls Overlay */}
            {showScore && (
                <View style={styles.controlsOverlay} pointerEvents="box-none">
                    <View style={styles.scoreContainer}>
                        <Text style={styles.scoreTitle}>UPDRS Score</Text>
                        <Text style={styles.scoreValue}>{score}</Text>
                    </View>

                    <TouchableOpacity style={styles.doneButton} onPress={() => navigation.goBack()}>
                        <Text style={styles.doneText}>Done</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
        justifyContent: 'center',
        alignItems: 'center',
    },
    video: {
        width: '100%',
        height: '80%', // adjust as needed
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        // We need to ensure the overlay aligns with the video content
        // 'contain' mode centers the video. This simple overlay assumes video fills or is centered.
        // For 100% precision with 'contain', we'd need to know video aspect ratio.
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 10,
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 10,
        borderRadius: 5
    },
    closeText: {
        color: 'white',
        fontWeight: 'bold'
    },
    controlsOverlay: {
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    scoreContainer: {
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: 15,
        borderRadius: 15,
        alignItems: 'center',
        marginBottom: 20,
    },
    scoreTitle: {
        color: '#aaa',
        fontSize: 14,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    scoreValue: {
        color: '#4ade80',
        fontSize: 36,
        fontWeight: 'bold',
    },
    doneButton: {
        backgroundColor: '#3b82f6',
        paddingHorizontal: 40,
        paddingVertical: 12,
        borderRadius: 25,
    },
    doneText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    }
});

