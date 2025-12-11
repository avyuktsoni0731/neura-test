import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  PermissionsAndroid,
  DeviceEventEmitter,
  EmitterSubscription,
} from 'react-native';
import Video from 'react-native-video';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { processVideoAndExtractFeatures } from '../native/videoprocessor';
import { predictFromFeatureArray, loadModelFromAssets } from '../native/onnxClient';
import { useTranslation } from 'react-i18next';
import Svg, { Circle, Line, Text as SvgText } from 'react-native-svg';

export default function FingerTappingScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const safeAreaInsets = useSafeAreaInsets();
  const device = useCameraDevice('front');

  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const [tempPath, setTempPath] = useState<string | null>(null);
  const [score, setScore] = useState<number | string | null>(null);
  const [replayData, setReplayData] = useState<{ uri: string, frames: any[] } | null>(null);
  const [analyzedFrame, setAnalyzedFrame] = useState<any>(null); // Live frame data

  const camera = useRef<Camera>(null);
  const videoRef = useRef<any>(null); // For live seeking
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const isFocused = useIsFocused();

  useEffect(() => {
    // Ensure model is loaded
    loadModelFromAssets()
      .then(() => console.log("Model loaded"))
      .catch(err => {
        console.error("Failed to load model:", err);
        Alert.alert("Model Error", "Failed to load ONNX model: " + (err.message || err));
      });

    const requestCameraPermission = async () => {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: "Camera Permission",
            message: "App needs access to your camera to record video.",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          setHasPermission(true);
        } else {
          Alert.alert("Permission Denied", "Camera permission is required.");
        }
      } catch (err) {
        console.warn("Permission Error:", err);
      }
    };

    requestCameraPermission();
  }, []);

  const startRecording = async () => {
    if (!camera.current) return;

    try {
      setIsRecording(true);
      setScore(null);
      setMessage(t('fingerTapping.recording', 'Recording... Keep finger tapping!'));
      setTimeLeft(10);

      camera.current.startRecording({
        onRecordingFinished: async (video) => {
          console.log("Recording finished:", video.path);
          setTempPath(video.path);
          await processVideo(video.path);
        },
        onRecordingError: (error) => {
          console.error("Recording error:", error);
          Alert.alert("Error", "Recording failed: " + error.message);
          setIsRecording(false);
        },
      });

      // Start Countdown
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            stopRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (e: any) {
      Alert.alert("Error", "Failed to start recording: " + e.message);
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (camera.current) {
      await camera.current.stopRecording();
    }
    setIsRecording(false);
  };

  const processVideo = async (path: string) => {
    setProcessing(true);
    setMessage(t('fingerTapping.processing', 'Processing video... please wait.'));
    setAnalyzedFrame(null);

    // Listen for live analysis events
    const subscription: EmitterSubscription = DeviceEventEmitter.addListener('onFrameAnalyzed', (event) => {
      // event: { time: 0.1, landmarks: { WRIST: {x,y}, ... } }
      setAnalyzedFrame(event);
      // Sync video to analysis time with low tolerance for accuracy
      if (videoRef.current) {
        videoRef.current.seek(event.time, 10); // 10ms tolerance
      }
    });

    try {
      const uri = `file://${path}`;
      console.log("Processing video URI:", uri);

      const featuresMap = await processVideoAndExtractFeatures(uri);
      console.log("Extracted features keys:", Object.keys(featuresMap));
      const frames = (featuresMap as any).frames || [];

      // Expected keys (53 items)
      const expectedKeys = [
        "wrist_mvmnt_x_median", "wrist_mvmnt_x_min", "wrist_mvmnt_y_median", "wrist_mvmnt_y_min", "wrist_mvmnt_y_max",
        "wrist_mvmnt_dist_min", "aperiodicity_denoised", "aperiodicity_trimmed", "periodEntropy_denoised",
        "periodVarianceNorm_denoised", "periodVarianceNorm_trimmed", "numInterruptions_denoised", "numFreeze_denoised",
        "numFreeze_trimmed", "maxFreezeDuration_denoised", "maxFreezeDuration_trimmed", "period_median_denoised",
        "period_quartile_range_denoised", "period_min_denoised", "period_quartile_range_trimmed", "frequency_quartile_range_denoised",
        "frequency_min_denoised", "frequency_stdev_denoised", "frequency_lr_fitness_r2_denoised", "frequency_lr_slope_denoised",
        "frequency_lr_fitness_r2_trimmed", "frequency_lr_slope_trimmed", "frequency_fit_min_degree_denoised", "frequency_fit_min_degree_trimmed",
        "amplitude_median_denoised", "amplitude_quartile_range_denoised", "amplitude_max_denoised", "amplitude_stdev_denoised",
        "amplitude_entropy_denoised", "amplitude_stdev_trimmed", "amplitude_decrement_fitness_r2_denoised", "amplitude_decrement_slope_denoised",
        "amplitude_decrement_end_to_mean_denoised", "amplitude_decrement_fit_min_degree_denoised", "amplitude_decrement_last_to_first_half_denoised",
        "amplitude_decrement_fitness_r2_trimmed", "amplitude_decrement_slope_trimmed", "amplitude_decrement_end_to_mean_trimmed", "amplitude_decrement_fit_min_degree_trimmed",
        "num_peaks_trimmed", "speed_median_denoised", "speed_quartile_range_denoised", "speed_min_denoised", "speed_max_denoised",
        "speed_median_trimmed", "speed_min_trimmed", "acceleration_min_denoised", "acceleration_min_trimmed"
      ];

      const featureArray = expectedKeys.map(key => featuresMap[key] || 0.0);

      const result = await predictFromFeatureArray(featureArray);
      console.log("Prediction result:", result);

      if (result) {
        // Auto-navigate to ScoreScreen for "instant" feedback
        (navigation as any).navigate('Score', {
          score: result.score.toFixed(2),
          videoUri: `file://${path}`,
          frames: frames
        });
      } else {
        throw new Error("Received empty result from model");
      }
      subscription.remove(); // Stop listening

    } catch (err: any) {
      subscription.remove();
      console.error("Processing error:", err);
      const errMsg = err?.message || JSON.stringify(err);
      setMessage("Error: " + errMsg);
      Alert.alert("Processing Error", errMsg);
    } finally {
      setProcessing(false);
      setAnalyzedFrame(null);
    }
  };

  if (!device) return <View style={styles.container}><Text>No Camera Device</Text></View>;
  if (!hasPermission) return <View style={styles.container}><Text>Requesting Permission...</Text></View>;

  return (
    <View style={[styles.container, { paddingTop: safeAreaInsets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Finger Tapping Test</Text>
      </View>

      <View style={styles.cameraContainer}>
        {!score && !processing && isFocused && (
          <Camera
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={true}
            video={true}
            audio={false}
            ref={camera}
          />
        )}

        {isRecording && (
          <View style={styles.overlay}>
            <Text style={styles.timerText}>{timeLeft}</Text>
          </View>
        )}

        {processing && (
          <View style={styles.overlayCenter}>
            <ActivityIndicator size="large" color="#4ade80" />
            <Text style={styles.statusText}>Analyzing Frame: {analyzedFrame?.time?.toFixed(2) || 0}s</Text>
          </View>
        )}

        {score !== null && (
          <View style={styles.overlayCenter}>
            <Text style={styles.scoreTitle}>UPDRS Score</Text>
            <Text style={styles.scoreText}>{score}</Text>
            {replayData && (
              <TouchableOpacity
                onPress={() => navigation.navigate('Replay', { videoUri: replayData.uri, frames: replayData.frames } as any)}
                style={[styles.retryButton, { marginBottom: 10, backgroundColor: '#8b5cf6' }]}
              >
                <Text style={styles.retryText}>View Replay Analysis</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity onPress={() => { setScore(null); setReplayData(null); }} style={styles.retryButton}>
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.controls}>
        {!isRecording && !processing && score === null && (
          <TouchableOpacity onPress={startRecording} style={styles.recordButton}>
            <View style={styles.outerCircle}>
              <View style={styles.innerCircle} />
            </View>
          </TouchableOpacity>
        )}
        <Text style={styles.instructionText}>
          {isRecording ? "Keep tapping..." : "Press record and tap your fingers for 10s"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    zIndex: 10,
  },
  backButton: {
    padding: 8,
  },
  backText: {
    color: 'white',
    fontSize: 16,
  },
  title: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  cameraContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#111',
    position: 'relative',
  },
  overlay: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(255,0,0,0.7)',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayCenter: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statusText: {
    color: 'white',
    marginTop: 20,
    fontSize: 16,
  },
  scoreTitle: {
    color: '#aaa',
    fontSize: 20,
    marginBottom: 10,
  },
  scoreText: {
    color: '#4ade80',
    fontSize: 80,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  controls: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordButton: {
    marginBottom: 10,
  },
  outerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'red',
  },
  instructionText: {
    color: '#aaa',
    marginTop: 10,
  },
});
