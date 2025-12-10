// src/ml/inference.ts
import * as ort from 'onnxruntime-react-native';
import featureNamesJson from '../../assets/ml/features_name.json';
import scalerParamsJson from '../../assets/ml/scalar_params.json';

// Types
type ScalerParams = {
  mean: number[];
  scale: number[];
};

export type RawFeatures = Record<string, number>;

const FEATURE_NAMES: string[] = featureNamesJson as string[];
const SCALER: ScalerParams = scalerParamsJson as ScalerParams;

// Lazy session
let sessionPromise: Promise<ort.InferenceSession> | null = null;

// IMPORTANT: this path is relative to the bundle
const MODEL_PATH = 'model.onnx';

export function getSession(): Promise<ort.InferenceSession> {
  if (!sessionPromise) {
    sessionPromise = ort.InferenceSession.create(MODEL_PATH);
  }
  return sessionPromise;
}

function prepareInput(raw: RawFeatures): Float32Array {
  const n = FEATURE_NAMES.length;
  const arr = new Float32Array(n);

  for (let i = 0; i < n; i++) {
    const name = FEATURE_NAMES[i];
    const rawVal = raw[name] ?? 0;
    const mean = SCALER.mean[i] ?? 0;
    const scale = SCALER.scale[i] ?? 1;

    arr[i] = (rawVal - mean) / scale;
  }

  return arr;
}

/**
 * Run model. Adjust input/output names to match your ONNX graph.
 */
export async function predictSeverity(raw: RawFeatures): Promise<number> {
  const session = await getSession();
  const inputData = prepareInput(raw);

  const tensor = new ort.Tensor('float32', inputData, [1, inputData.length]);

  const feeds: Record<string, ort.Tensor> = {
    input: tensor, // <-- change if your input is named differently
  };

  const results = await session.run(feeds);
  const output = results.output; // <-- change if your output name is different

  if (!output || !output.data || output.data.length === 0) {
    throw new Error('Empty model output');
  }

  return Number((output.data as any)[0]);
}
