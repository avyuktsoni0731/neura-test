// src/ml/featureHelpers.ts
import featureNames from '../../android/app/src/main/assets/features_name.json';
import scaler from '../../android/app/src/main/assets/scaler_params.json';

/** If native returns map: {featName: number} convert to ordered array */
export function buildFeatureVector(mapOrOrdered: any): number[] {
  if (Array.isArray(mapOrOrdered)) return mapOrOrdered; // already ordered
  const map = mapOrOrdered as Record<string, number>;
  return featureNames.map((n: string) => (map[n] !== undefined ? map[n] : 0.0));
}

export function applyScaler(vec: number[]): number[] {
  if (!scaler || !scaler.mean) return vec;
  const mean: number[] = scaler.mean;
  const scale: number[] = scaler.scale;
  return vec.map((v, i) => (scale[i] === 0 ? 0.0 : (v - mean[i]) / scale[i]));
}
