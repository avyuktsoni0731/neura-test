// VideoProcessorModule.kt
package com.neuratest

import android.content.Context
import android.graphics.Bitmap
import android.media.MediaMetadataRetriever
import android.net.Uri
import com.facebook.react.bridge.*
import kotlinx.coroutines.*
import java.io.File
import kotlin.math.*

/**
 * React Native module: VideoProcessor
 * Exposes: processVideo(uri) -> Promise<WritableMap of features>
 *
 * Offline: this does not require network. It uses MediaMetadataRetriever to extract frames,
 * processes them with a HandLandmarkerWrapper (MediaPipe), computes D_raw and W_raw, then
 * calls SignalKt.getFinalFeatures(...) to compute features.
 */
class VideoProcessorModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    override fun getName(): String = "VideoProcessor"

    // Public method exposed to JS
    @ReactMethod
    fun processVideo(videoUri: String, promise: Promise) {
        // Launch background coroutine so UI is not blocked
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val ctx = reactApplicationContext.applicationContext
                val localPath = uriToLocalPath(ctx, videoUri)
                val targetFps = 24 // Balanced: Smoother than 15, faster than 30
                val (dRaw, wRaw, numFrames, durationSeconds, landmarksData) = extractSignalsFromVideo(ctx, localPath, targetFps)

                // Call Kotlin Signal port to compute final features
                val features = Signal.getFinalFeaturesFromSignals(dRaw, wRaw, numFrames, durationSeconds)

                // Convert to WritableMap
                val wm = Arguments.createMap()
                for ((k, v) in features) {
                    wm.putDouble(k, v)
                }

                // Add landmarks data for replay
                // landmarksData is List<Map<String, Any>> where keys are "time", "landmarks"
                val framesArray = Arguments.createArray()
                for (frameData in landmarksData) {
                    val frameMap = Arguments.createMap()
                    frameMap.putDouble("time", frameData.time)
                    
                    val landmarksMap = Arguments.createMap()
                    frameData.landmarks.forEach { (name, point) -> 
                        val pointMap = Arguments.createMap()
                        pointMap.putDouble("x", point.x)
                        pointMap.putDouble("y", point.y)
                        landmarksMap.putMap(name, pointMap)
                    }
                    frameMap.putMap("landmarks", landmarksMap)
                    framesArray.pushMap(frameMap)
                }
                wm.putArray("frames", framesArray)

                // Removed deletion logic to prevent deleting the source video file in cacheDir
                // if (localPath.contains(reactApplicationContext.cacheDir.absolutePath)) {
                //     try { File(localPath).delete() } catch (_: Exception) {}
                // }

                promise.resolve(wm)
            } catch (e: Exception) {
                promise.reject("PROCESS_ERROR", e.message, e)
            }
        }
    }

    // Convert content:// URI to local file path (copy to cache) or return file path for file://
    private fun uriToLocalPath(context: Context, uriString: String): String {
        val uri = Uri.parse(uriString)
        return if (uri.scheme == "file") {
            uri.path ?: throw Exception("Empty file URI")
        } else {
            val input = context.contentResolver.openInputStream(uri) ?: throw Exception("Cannot open URI: $uriString")
            val tmp = File.createTempFile("video_proc_", ".mp4", context.cacheDir)
            input.use { inp -> tmp.outputStream().use { out -> inp.copyTo(out) } }
            tmp.absolutePath
        }
    }

    data class FrameData(val time: Double, val landmarks: Map<String, Point>)
    data class Point(val x: Double, val y: Double)
    // Simple container to return 5 values
    data class Quintuple<A,B,C,D,E>(val a:A, val b:B, val c:C, val d:D, val e:E)

    // Extract sampled frames and compute D_raw (angle series) and W_raw (wrist normalized coords)
    private fun extractSignalsFromVideo(context: Context, videoPath: String, targetFps: Int):
            Quintuple<List<Double>, List<Pair<Double,Double>>, Int, Double, List<FrameData>> {
        val retriever = MediaMetadataRetriever()
        retriever.setDataSource(videoPath)
        val durationMs = (retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_DURATION)?.toLong() ?: 0L)
        val durationSec = durationMs / 1000.0
        if (durationMs <= 0) {
            retriever.release()
            throw Exception("Unable to get video duration")
        }

        // Determine sampling: total frames to sample = durationSeconds * targetFps
        val totalSamples = max(1, (durationSec * targetFps).toInt())
        val stepMs = durationMs / totalSamples.toLong()

        val dList = mutableListOf<Double>()
        val wList = mutableListOf<Pair<Double,Double>>()
        val frameDataList = mutableListOf<FrameData>()

        // Initialize hand landmarker (MediaPipe wrapper)
        val landmarker = HandLandmarkerWrapper.getInstance(context) // implement singleton wrapper

        var tMs = 0L
        var sampled = 0
        while (tMs < durationMs) {
            val bmp: Bitmap? = retriever.getFrameAtTime(tMs * 1000, MediaMetadataRetriever.OPTION_CLOSEST)
            if (bmp != null) {
                val lm = landmarker.detectHands(bmp) // returns Map<String, FloatArray> or null
                
                // Store landmarks for this frame regardless if all required keys for calc are present
                // We'll re-check inside for calc
                val currentLandmarks = mutableMapOf<String, Point>()
                
                if (lm != null) {
                    lm.forEach { (k, v) ->
                        // v is FloatArray[x, y, z]
                        currentLandmarks[k] = Point(v[0].toDouble(), v[1].toDouble())
                    }
                }
                
                frameDataList.add(FrameData(tMs / 1000.0, currentLandmarks))
                
                // EMIT EVENT to JS for live visualization
                val eventParams = Arguments.createMap()
                eventParams.putDouble("time", tMs / 1000.0)
                val liveLandmarks = Arguments.createMap()
                currentLandmarks.forEach { (name, point) ->
                    val p = Arguments.createMap()
                    p.putDouble("x", point.x)
                    p.putDouble("y", point.y)
                    liveLandmarks.putMap(name, p)
                }
                eventParams.putMap("landmarks", liveLandmarks)
                
                reactApplicationContext
                    .getJSModule(com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                    .emit("onFrameAnalyzed", eventParams)

                if (lm != null && lm.containsKey("WRIST") && lm.containsKey("THUMB_TIP") && lm.containsKey("INDEX_FINGER_TIP")) {
                    val wrist = lm["WRIST"]!!     // [x,y,z] normalized coords (0..1) or pixel coords depending on impl
                    val thumb = lm["THUMB_TIP"]!!
                    val index = lm["INDEX_FINGER_TIP"]!!
                    // compute angle (degrees)
                    val angle = computeAngleDeg(wrist, thumb, index)
                    dList.add(angle)

                    // compute wrist normalized coordinates:
                    // Use THUMB_CMC if available for normalization (else use thumb tip)
                    val thumbCmc = lm["THUMB_CMC"] ?: thumb
                    val norm = euclideanDistance(wrist[0], wrist[1], thumbCmc[0], thumbCmc[1])
                    val wx = wrist[0].toDouble() / (norm.toDouble() + 1e-6)
                    val wy = wrist[1].toDouble() / (norm.toDouble() + 1e-6)
                    wList.add(Pair(wx, wy))
                } else {
                    // Not found: use sentinel -1 (matches Python)
                    dList.add(-1.0)
                    wList.add(Pair(-1.0, -1.0))
                }
                sampled++
            }
            tMs += stepMs
        }
        retriever.release()
        return Quintuple(dList.toList(), wList.toList(), sampled, durationSec, frameDataList.toList())
    }

    private fun computeAngleDeg(a: FloatArray, b: FloatArray, c: FloatArray): Double {
        // angle between (b - a) and (c - a)
        val v1x = b[0] - a[0]; val v1y = b[1] - a[1]
        val v2x = c[0] - a[0]; val v2y = c[1] - a[1]
        val dot = v1x * v2x + v1y * v2y
        val mag1 = sqrt(v1x * v1x + v1y * v1y)
        val mag2 = sqrt(v2x * v2x + v2y * v2y)
        val cos = (dot / ((mag1 * mag2) + 1e-12)).coerceIn(-1.0, 1.0)
        return Math.toDegrees(acos(cos.toDouble()))
    }

    private fun euclideanDistance(x1: Float, y1: Float, x2: Float, y2: Float): Float {
        val dx = x1 - x2; val dy = y1 - y2
        return sqrt(dx*dx + dy*dy)
    }
}
