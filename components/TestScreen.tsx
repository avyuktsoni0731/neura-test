import React, { useRef, useState } from "react";
import { View, Text, Button, Alert, ActivityIndicator } from "react-native";
import { Camera, useCameraDevice } from "react-native-vision-camera";

import { processVideoAndExtractFeatures } from "../src/native/videoprocessor";
import { loadModelFromAssets, predictFromFeatureArray } from "../src/native/onnxClient";
import { buildFeatureVector, applyScaler } from "../src/ml/featureHelpers";

export default function TestScreen() {
  const device = useCameraDevice('front');
  const camera = useRef<Camera>(null);

  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<any>(null);

  if (!device) return <Text>Loading camera…</Text>;

  async function startTest() {
    try {
      setBusy(true);
      await loadModelFromAssets("model.onnx");

      const video = await camera.current?.startRecording({
        flash: "off",
        onRecordingFinished: async (data) => {
          const features = await processVideoAndExtractFeatures(data.path);
          const vec = buildFeatureVector(features);
          const scaled = applyScaler(vec);
          const pred = await predictFromFeatureArray(scaled);

          setResult(pred);
          Alert.alert("Severity", `Score: ${pred?.score.toFixed(2)} (rounded ${pred?.rounded})`);
          setBusy(false);
        },
        onRecordingError: (err) => console.error(err),
      });

      // stop after 10s
      setTimeout(() => camera.current?.stopRecording(), 10_000);

    } catch (e) {
      console.warn(e);
      Alert.alert("Error", String(e));
      setBusy(false);
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <Camera
        ref={camera}
        style={{ flex: 1 }}
        device={device}
        isActive={!busy}
        video={true}
        audio={true}
      />

      <View style={{ position: "absolute", bottom: 30, width: "100%", alignItems: "center" }}>
        {busy ? (
          <ActivityIndicator size="large" />
        ) : (
          <Button title="Start Test" onPress={startTest} />
        )}

        {result && (
          <Text style={{ color: "white", marginTop: 10 }}>
            Score {result.score.toFixed(2)}, Rounded {result.rounded}
          </Text>
        )}
      </View>
    </View>
  );
}
