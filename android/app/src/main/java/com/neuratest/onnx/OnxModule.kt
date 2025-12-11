package com.neuratest.onnx

import com.facebook.react.bridge.*
import ai.onnxruntime.*

class OnnxModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private var session: OrtSession? = null
    private var env: OrtEnvironment = OrtEnvironment.getEnvironment()

    override fun getName(): String = "OnnxModule"

    @ReactMethod
    fun loadModel(modelName: String, promise: Promise) {
        try {
            val assetManager = reactApplicationContext.assets
            val modelBytes = assetManager.open(modelName).readBytes()

            session = env.createSession(modelBytes)
            promise.resolve("Model loaded successfully")
        } catch (e: Exception) {
            promise.reject("MODEL_LOAD_ERROR", e)
        }
    }

    @ReactMethod
    fun predictFromFeatureArray(array: ReadableArray, promise: Promise) {
        try {
            if (session == null) {
                promise.reject("NO_MODEL", "Model is not loaded")
                return
            }

            val features = FloatArray(array.size()) { i ->
                array.getDouble(i).toFloat()
            }

            val inputData = Array(1) { features }
            val inputTensor = OnnxTensor.createTensor(env, inputData)

            val output = session!!.run(mapOf(session!!.inputNames.first() to inputTensor))
            val result = (output[0].value as Array<FloatArray>)[0][0]

            val map = Arguments.createMap()
            map.putDouble("score", result.toDouble())
            map.putInt("rounded", Math.round(result))

            promise.resolve(map)

        } catch (e: Exception) {
            promise.reject("PREDICT_ERROR", e)
        }
    }
}
