// src/native/videoProcessor.ts
import { NativeModules } from "react-native";
const { VideoProcessor } = NativeModules;

export interface FrameData {
  time: number;
  landmarks: {
    [key: string]: { x: number; y: number };
  };
}

export interface VideoFeatures extends Record<string, number | any> {
  frames?: FrameData[];
}

export const processVideoAndExtractFeatures = async (videoUri: string): Promise<VideoFeatures> => {
  return await NativeModules.VideoProcessor.processVideo(videoUri);
};
