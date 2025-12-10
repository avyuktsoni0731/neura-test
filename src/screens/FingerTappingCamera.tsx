// src/screens/FingerTappingCamera.tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Camera, useCameraDevices, VideoFile } from 'react-native-vision-camera';
// ❌ No FFmpegKit import
// import { FFmpegKit } from 'ffmpeg-kit-react-native';
import RNFS from 'react-native-fs';
import { predictSeverity } from '../ml/inference';

export default function FingerTappingCamera() {
  const cameraRef = useRef<Camera | null>(null);
  const devices = useCameraDevices();
  const device = devices.find(d => d.position === 'back');

  const [permission, setPermission] = useState<'pending' | 'granted' | 'denied'>('pending');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [severity, setSeverity] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Ask for camera + mic permission on mount
  useEffect(() => {
    (async () => {
      const cameraStatus = await Camera.requestCameraPermission();
      const micStatus = await Camera.requestMicrophonePermission();
      if (cameraStatus === 'granted' && micStatus === 'granted') {
        setPermission('granted');
      } else {
        setPermission('denied');
      }
    })();
  }, []);

  const handleRecordingFinished = useCallback(async (video: VideoFile) => {
    setIsRecording(false);
    setIsProcessing(true);
    setError(null);
    setSeverity(null);

    try {
      const inputPath = video.path; // MP4 path (platform default)
      console.log('Recorded video path:', inputPath);

      // If you want, you can copy/move it using RNFS later:
      // const destPath = `${RNFS.DocumentDirectoryPath}/fingertap_${Date.now()}.mp4`;
      // await RNFS.copyFile(inputPath, destPath);

      // TODO: extract real features from the MP4 file
      // For now, dummy features to show the full flow:
      const dummyFeatures = {
        // "tap_frequency_mean": 3.2,
        // "tap_amplitude_std": 0.5,
      } as any;

      const pred = await predictSeverity(dummyFeatures);
      setSeverity(pred);
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? 'Processing failed');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleRecordingError = useCallback((e: unknown) => {
    console.error(e);
    setIsRecording(false);
    setError('Recording error');
  }, []);

  const startRecording = useCallback(() => {
    if (!cameraRef.current || !device || isRecording) return;

    setError(null);
    setSeverity(null);
    setIsRecording(true);

    cameraRef.current.startRecording({
      onRecordingFinished: handleRecordingFinished,
      onRecordingError: handleRecordingError,
    });

    // Force-stop after ~10 seconds
    setTimeout(() => {
      if (cameraRef.current) {
        cameraRef.current.stopRecording().catch(() => {});
      }
    }, 10000);
  }, [device, isRecording, handleRecordingFinished, handleRecordingError]);

  if (permission === 'pending' || !device) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator />
        <Text className="text-white mt-2">Initializing camera...</Text>
      </View>
    );
  }

  if (permission === 'denied') {
    return (
      <View className="flex-1 items-center justify-center p-4 bg-black">
        <Text className="text-white text-center">
          Camera or microphone permission denied. Please enable them in settings.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <Camera
        ref={cameraRef}
        style={{ flex: 1 }}
        device={device}
        isActive={!isProcessing}
        video={true}
        audio={true}
      />

      {/* Bottom panel */}
      <View className="absolute bottom-0 left-0 right-0 p-4 bg-black/70">
        {isProcessing ? (
          <View className="items-center">
            <ActivityIndicator />
            <Text className="text-white mt-2">Processing video (prediction)...</Text>
          </View>
        ) : (
          <>
            <TouchableOpacity
              disabled={isRecording}
              onPress={startRecording}
              className={`items-center justify-center py-3 rounded-full ${
                isRecording ? 'bg-red-800' : 'bg-red-500'
              }`}
            >
              <Text className="text-white font-semibold">
                {isRecording ? 'Recording 10s...' : 'Start 10s Recording'}
              </Text>
            </TouchableOpacity>

            {severity !== null && (
              <Text className="text-white mt-3 text-center">
                Predicted severity: {severity.toFixed(3)}
              </Text>
            )}

            {error && (
              <Text className="text-red-400 mt-3 text-center">
                {error}
              </Text>
            )}
          </>
        )}
      </View>
    </View>
  );
}

// // src/screens/FingerTappingCamera.tsx
// import React, { useCallback, useEffect, useRef, useState } from 'react';
// import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
// import { Camera, useCameraDevices, VideoFile } from 'react-native-vision-camera';
// //import { FFmpegKit } from 'ffmpeg-kit-react-native';
// import RNFS from 'react-native-fs';
// import { predictSeverity } from '../ml/inference';

// export default function FingerTappingCamera() {
//   const cameraRef = useRef<Camera | null>(null);
//   const devices = useCameraDevices();
//   const device = devices.find(d => d.position === 'back');

//   const [permission, setPermission] = useState<'pending' | 'granted' | 'denied'>('pending');
//   const [isRecording, setIsRecording] = useState(false);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [severity, setSeverity] = useState<number | null>(null);
//   const [error, setError] = useState<string | null>(null);

//   // Ask for camera + mic permission on mount
//   useEffect(() => {
//     (async () => {
//       const cameraStatus = await Camera.requestCameraPermission();
//       const micStatus = await Camera.requestMicrophonePermission();
//       if (cameraStatus === 'granted' && micStatus === 'granted') {
//         setPermission('granted');
//       } else {
//         setPermission('denied');
//       }
//     })();
//   }, []);

//   const handleRecordingFinished = useCallback(async (video: VideoFile) => {
//     setIsRecording(false);
//     setIsProcessing(true);
//     setError(null);
//     setSeverity(null);

//     try {
//       const inputPath = video.path; // e.g. /storage/emulated/0/...
//       const outputPath = `${RNFS.DocumentDirectoryPath}/fingertap_${Date.now()}.webm`;

//       // Convert MP4/MOV -> WEBM using VP8+Vorbis
//       const cmd = `-y -i "${inputPath}" -c:v libvpx -b:v 1M -c:a libvorbis "${outputPath}"`;
//       await FFmpegKit.execute(cmd);

//       // TODO: extract real features from the WEBM file
//       // For now, dummy features to show flow:
//       const dummyFeatures = {
//         // use real feature names from features_name.json
//         // e.g. "tap_frequency_mean": 3.2,
//       } as any;

//       // CALL YOUR MODEL HERE (once you have real features)
//       const pred = await predictSeverity(dummyFeatures);
//       setSeverity(pred);
//     } catch (e: any) {
//       console.error(e);
//       setError(e?.message ?? 'Processing failed');
//     } finally {
//       setIsProcessing(false);
//     }
//   }, []);

//   const handleRecordingError = useCallback((e: unknown) => {
//     console.error(e);
//     setIsRecording(false);
//     setError('Recording error');
//   }, []);

//   const startRecording = useCallback(() => {
//     if (!cameraRef.current || !device || isRecording) return;

//     setError(null);
//     setSeverity(null);

//     setIsRecording(true);

//     cameraRef.current.startRecording({
//       onRecordingFinished: handleRecordingFinished,
//       onRecordingError: handleRecordingError,
//     });

//     // Force-stop after ~10 seconds
//     setTimeout(() => {
//       if (cameraRef.current) {
//         cameraRef.current.stopRecording().catch(() => {});
//       }
//     }, 10000);
//   }, [device, isRecording, handleRecordingFinished, handleRecordingError]);

//   if (permission === 'pending' || !device) {
//     return (
//       <View className="flex-1 items-center justify-center bg-black">
//         <ActivityIndicator />
//         <Text className="text-white mt-2">Initializing camera...</Text>
//       </View>
//     );
//   }

//   if (permission === 'denied') {
//     return (
//       <View className="flex-1 items-center justify-center p-4 bg-black">
//         <Text className="text-white text-center">
//           Camera or microphone permission denied. Please enable them in settings.
//         </Text>
//       </View>
//     );
//   }

//   return (
//     <View className="flex-1 bg-black">
//       <Camera
//         ref={cameraRef}
//         style={{ flex: 1 }}
//         device={device}
//         isActive={!isProcessing}
//         video={true}
//         audio={true}
//       />

//       {/* Bottom panel */}
//       <View className="absolute bottom-0 left-0 right-0 p-4 bg-black/70">
//         {isProcessing ? (
//           <View className="items-center">
//             <ActivityIndicator />
//             <Text className="text-white mt-2">Processing video (WEBM + prediction)...</Text>
//           </View>
//         ) : (
//           <>
//             <TouchableOpacity
//               disabled={isRecording}
//               onPress={startRecording}
//               className={`items-center justify-center py-3 rounded-full ${
//                 isRecording ? 'bg-red-800' : 'bg-red-500'
//               }`}
//             >
//               <Text className="text-white font-semibold">
//                 {isRecording ? 'Recording 10s...' : 'Start 10s Recording'}
//               </Text>
//             </TouchableOpacity>

//             {severity !== null && (
//               <Text className="text-white mt-3 text-center">
//                 Predicted severity: {severity.toFixed(3)}
//               </Text>
//             )}

//             {error && (
//               <Text className="text-red-400 mt-3 text-center">
//                 {error}
//               </Text>
//             )}
//           </>
//         )}
//       </View>
//     </View>
//   );
// }
