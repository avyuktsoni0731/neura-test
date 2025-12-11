package com.neuratest

import android.content.Context
import android.graphics.Bitmap
import com.google.mediapipe.tasks.vision.handlandmarker.HandLandmarker
import com.google.mediapipe.tasks.vision.handlandmarker.HandLandmarkerResult
import com.google.mediapipe.tasks.core.BaseOptions
import com.google.mediapipe.tasks.vision.core.RunningMode
import com.google.mediapipe.framework.image.BitmapImageBuilder

class HandLandmarkerWrapper private constructor(context: Context) {

    private val landmarker: HandLandmarker

    companion object {
        @Volatile private var INSTANCE: HandLandmarkerWrapper? = null

        fun getInstance(context: Context): HandLandmarkerWrapper {
            return INSTANCE ?: synchronized(this) {
                INSTANCE ?: HandLandmarkerWrapper(context.applicationContext).also { INSTANCE = it }
            }
        }
    }

    init {
        val baseOptions = BaseOptions.builder()
            .setModelAssetPath("hand_landmarker.task")
            .build()

        val options = HandLandmarker.HandLandmarkerOptions.builder()
            .setBaseOptions(baseOptions)
            .setRunningMode(RunningMode.IMAGE)
            .setNumHands(1)
            .build()

        landmarker = HandLandmarker.createFromOptions(context, options)
    }

    /** Returns map { "WRIST": floatArrayOf(x,y,z), ... } or null */
    fun detectHands(bitmap: Bitmap): Map<String, FloatArray>? {
        val mpImage = BitmapImageBuilder(bitmap).build()
        val result: HandLandmarkerResult = landmarker.detect(mpImage)

        if (result.landmarks().isEmpty()) return null

        val hand = result.landmarks()[0] // first hand
        val map = mutableMapOf<String, FloatArray>()

        fun add(idx: Int, name: String) {
            val pt = hand[idx]
            map[name] = floatArrayOf(pt.x(), pt.y(), pt.z())
        }

        // Landmark index mapping from MediaPipe Hands spec
        add(0, "WRIST")
        add(1, "THUMB_CMC")
        add(4, "THUMB_TIP")
        add(8, "INDEX_FINGER_TIP")

        return map
    }
}
