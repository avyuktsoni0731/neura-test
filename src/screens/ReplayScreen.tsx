import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Dimensions } from 'react-native';
import Video, { OnProgressData, VideoRef } from 'react-native-video';
import Svg, { Circle, Line } from 'react-native-svg';
import { useRoute, useNavigation } from '@react-navigation/native';
import { FrameData } from '../native/videoprocessor';

const { width, height } = Dimensions.get('window');

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
                            {/* Draw Wrist */}
                            {currentFrame.landmarks.WRIST && (
                                <Circle
                                    cx={currentFrame.landmarks.WRIST.x}
                                    cy={currentFrame.landmarks.WRIST.y}
                                    r="0.02" // relative radius
                                    fill="red"
                                />
                            )}
                            {/* Draw Thumb Tip */}
                            {currentFrame.landmarks.THUMB_TIP && (
                                <Circle
                                    cx={currentFrame.landmarks.THUMB_TIP.x}
                                    cy={currentFrame.landmarks.THUMB_TIP.y}
                                    r="0.02"
                                    fill="blue"
                                />
                            )}
                            {/* Draw Index Tip */}
                            {currentFrame.landmarks.INDEX_FINGER_TIP && (
                                <Circle
                                    cx={currentFrame.landmarks.INDEX_FINGER_TIP.x}
                                    cy={currentFrame.landmarks.INDEX_FINGER_TIP.y}
                                    r="0.02"
                                    fill="green"
                                />
                            )}

                            {/* Draw connections */}
                            {currentFrame.landmarks.WRIST && currentFrame.landmarks.THUMB_TIP && (
                                <Line
                                    x1={currentFrame.landmarks.WRIST.x}
                                    y1={currentFrame.landmarks.WRIST.y}
                                    x2={currentFrame.landmarks.THUMB_TIP.x}
                                    y2={currentFrame.landmarks.THUMB_TIP.y}
                                    stroke="yellow"
                                    strokeWidth="0.005"
                                />
                            )}
                            {currentFrame.landmarks.WRIST && currentFrame.landmarks.INDEX_FINGER_TIP && (
                                <Line
                                    x1={currentFrame.landmarks.WRIST.x}
                                    y1={currentFrame.landmarks.WRIST.y}
                                    x2={currentFrame.landmarks.INDEX_FINGER_TIP.x}
                                    y2={currentFrame.landmarks.INDEX_FINGER_TIP.y}
                                    stroke="yellow"
                                    strokeWidth="0.005"
                                />
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

