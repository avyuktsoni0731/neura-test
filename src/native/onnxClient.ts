// src/native/onnxClient.ts
import { NativeModules } from "react-native";

const { OnnxModule } = NativeModules;

async function safeCall(fn: () => Promise<any>, fallback: any = null) {
  try {
    return await fn();
  } catch (err) {
    console.warn("onnxClient error:", err);
    return fallback;
  }
}

export async function loadModelFromAssets(filename = "model.onnx") {
  // return safeCall(() => OnnxModule.loadModel(filename));
  return await OnnxModule.loadModel(filename);
}

/**
 * features should be an array of numbers (already scaled/ordered)
 * Returns: { score: number, rounded: number } on success or null on fail
 */
// export async function predictFromFeatureArray(features: number[]) {
//   return safeCall(() => OnnxModule.predictFromFeatureArray(features), null);
// }

export async function predictFromFeatureArray(features: number[]) {
  // Directly call native module to let errors propagate to the UI
  return await OnnxModule.predictFromFeatureArray(features);
}
