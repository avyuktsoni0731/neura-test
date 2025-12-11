// Signal.kt
package com.neuratest

import kotlin.math.*
import java.util.*

// Helper data / functions
object MathUtils {
    fun median(arr: DoubleArray): Double {
        val a = arr.sortedArray()
        val n = a.size
        return if (n == 0) 0.0 else if (n % 2 == 1) a[n/2] else (a[n/2 - 1] + a[n/2]) / 2.0
    }
    fun quartileRange(arr: DoubleArray): Double {
        if (arr.isEmpty()) return 0.0
        val a = arr.sortedArray()
        val q1 = a[a.size / 4]
        val q3 = a[(3 * a.size) / 4]
        return q3 - q1
    }
    fun mean(arr: DoubleArray): Double = if (arr.isEmpty()) 0.0 else arr.average()
    fun stdev(arr: DoubleArray): Double {
        if (arr.size <= 1) return 0.0
        val m = mean(arr)
        return sqrt(arr.map { (it - m) * (it - m) }.sum() / (arr.size - 1))
    }
    fun min(arr: DoubleArray): Double = if (arr.isEmpty()) 0.0 else arr.minOrNull() ?: 0.0
    fun max(arr: DoubleArray): Double = if (arr.isEmpty()) 0.0 else arr.maxOrNull() ?: 0.0
    fun getStats(arr: DoubleArray): Map<String, Double> {
        return mapOf(
            "median" to median(arr),
            "quartile_range" to quartileRange(arr),
            "mean" to mean(arr),
            "min" to min(arr),
            "max" to max(arr),
            "stdev" to stdev(arr)
        )
    }
}

// Signal processing implementation
object Signal {
    /**
     * Convert raw sequences into final named features.
     * D_raw: list of angles (with -1 for NOT_FOUND)
     * W_raw: list of normalized wrist tuples (x,y) with -1 sentinel
     * numFrames: number of sampled frames
     * duration: seconds
     */
    fun getFinalFeaturesFromSignals(D_raw: List<Double>, W_raw: List<Pair<Double,Double>>, numFrames: Int, duration: Double): Map<String, Double> {
        // Build a simplified Signal pipeline approximating the Python behavior.
        // Steps:
        // 1) Convert NOT_FOUND (-1) to NaNs for processing, but keep counts
        val NOT_FOUND = -1.0
        val D = D_raw.toDoubleArray()
        val W = W_raw.map { it }.toTypedArray()

        // 2) Denoise D with median filter (window)
        val denoised = denoise(D)

        // 3) Peak detection on denoised (simple local maxima)
        val peaks = findPeaks(denoised)

        // 4) Compute periods between peaks (in frames) -> convert to seconds using duration/numFrames
        val periodList = mutableListOf<Double>()
        for (i in 1 until peaks.size) {
            val p = peaks[i] - peaks[i-1]
            if (p > 0) periodList.add(p * (duration / max(1, numFrames)).toDouble())
        }

        // amplitude at peaks
        val ampList = peaks.map { idx -> if (idx >= 0 && idx < denoised.size) denoised[idx] else 0.0 }

        // compute wrist movements (per-frame velocity)
        val wristVelX = mutableListOf<Double>()
        val wristVelY = mutableListOf<Double>()
        val wristVelD = mutableListOf<Double>()
        val PER_FRAME_DURATION = if (numFrames > 0) (duration / numFrames) else 0.01

        for (i in 1 until W.size) {
            val (x0, y0) = W[i-1]
            val (x1, y1) = W[i]
            if (x0 == NOT_FOUND || x1 == NOT_FOUND) {
                wristVelX.add(0.0); wristVelY.add(0.0); wristVelD.add(0.0)
            } else {
                wristVelX.add(abs((x1 - x0) / PER_FRAME_DURATION))
                wristVelY.add(abs((y1 - y0) / PER_FRAME_DURATION))
                wristVelD.add(abs(euclid(x1, y1, x0, y0) / PER_FRAME_DURATION))
            }
        }

        // Calculate stats for wrist movements
        val wxStats = MathUtils.getStats(wristVelX.toDoubleArray())
        val wyStats = MathUtils.getStats(wristVelY.toDoubleArray())
        val wdStats = MathUtils.getStats(wristVelD.toDoubleArray())

        // Prepare features map, but populate only the 53 features in the training expected order
        val features = mutableMapOf<String, Double>()

        // Fill wrist_mvmnt_x_* etc
        features["wrist_mvmnt_x_median"] = wxStats["median"] ?: 0.0
        features["wrist_mvmnt_x_min"] = wxStats["min"] ?: 0.0
        features["wrist_mvmnt_y_median"] = wyStats["median"] ?: 0.0
        features["wrist_mvmnt_y_min"] = wyStats["min"] ?: 0.0
        features["wrist_mvmnt_y_max"] = wyStats["max"] ?: 0.0
        features["wrist_mvmnt_dist_min"] = wdStats["min"] ?: 0.0

        // Rhythm / aperiodicity
        features["aperiodicity_denoised"] = aperiodicity(denoised, peaks)
        features["aperiodicity_trimmed"] = features["aperiodicity_denoised"] ?: 0.0

        // period entropy & normed variance
        features["periodEntropy_denoised"] = period_entropy(periodList.toDoubleArray())
        features["periodVarianceNorm_denoised"] = if (periodList.isNotEmpty()) variance(periodList) / (periodList.maxOrNull() ?: 1.0) else 0.0
        features["periodVarianceNorm_trimmed"] = features["periodVarianceNorm_denoised"] ?: 0.0

        // interruptions / freezes (simple metrics)
        val interruptions = countInterruptions(D_raw)
        features["numInterruptions_denoised"] = interruptions.first.toDouble()
        features["numInterruptions_trimmed"] = interruptions.first.toDouble()
        features["numFreeze_denoised"] = interruptions.second.toDouble()
        features["numFreeze_trimmed"] = interruptions.second.toDouble()

        features["maxFreezeDuration_denoised"] = maxFreeze(D_raw)
        features["maxFreezeDuration_trimmed"] = features["maxFreezeDuration_denoised"] ?: 0.0

        // Period stats (some derived)
        val periodStats = MathUtils.getStats(periodList.toDoubleArray())
        features["period_median_denoised"] = periodStats["median"] ?: 0.0
        features["period_quartile_range_denoised"] = periodStats["quartile_range"] ?: 0.0
        features["period_min_denoised"] = periodStats["min"] ?: 0.0
        features["period_quartile_range_trimmed"] = features["period_quartile_range_denoised"] ?: 0.0

        // Frequency stats (1/period)
        val freqs = periodList.map { if (it > 0) 1.0 / it else 0.0 }.toDoubleArray()
        val freqStats = MathUtils.getStats(freqs)
        features["frequency_quartile_range_denoised"] = freqStats["quartile_range"] ?: 0.0
        features["frequency_min_denoised"] = freqStats["min"] ?: 0.0
        features["frequency_stdev_denoised"] = freqStats["stdev"] ?: 0.0

        // frequency LR slope / fitness approximations
        features["frequency_lr_fitness_r2_denoised"] = 0.0
        features["frequency_lr_slope_denoised"] = 0.0
        features["frequency_lr_fitness_r2_trimmed"] = 0.0
        features["frequency_lr_slope_trimmed"] = 0.0
        features["frequency_fit_min_degree_denoised"] = 0.0
        features["frequency_fit_min_degree_trimmed"] = 0.0

        // amplitude stats (peaks)
        val amps = ampList.toDoubleArray()
        val ampStats = MathUtils.getStats(amps)
        features["amplitude_median_denoised"] = ampStats["median"] ?: 0.0
        features["amplitude_quartile_range_denoised"] = ampStats["quartile_range"] ?: 0.0
        features["amplitude_max_denoised"] = ampStats["max"] ?: 0.0
        features["amplitude_stdev_denoised"] = ampStats["stdev"] ?: 0.0
        features["amplitude_entropy_denoised"] = angularAmplitudeEntropy(amps)

        // trimmed amplitude stats fallback to denoised
        features["amplitude_stdev_trimmed"] = features["amplitude_stdev_denoised"] ?: 0.0

        // amplitude decrement features (approx proxies)
        features["amplitude_decrement_fitness_r2_denoised"] = 0.0
        features["amplitude_decrement_slope_denoised"] = amplitudeDecrementSlope(amps)
        features["amplitude_decrement_end_to_mean_denoised"] = (amps.lastOrNull() ?: 0.0) / (amps.average().takeIf { it != 0.0 } ?: 1.0)
        features["amplitude_decrement_fit_min_degree_denoised"] = 0.0
        features["amplitude_decrement_last_to_first_half_denoised"] = if (amps.isNotEmpty()) amps.last() / (amps.first() + 1e-9) else 0.0

        // trimmed versions copy denoised
        features["amplitude_decrement_fitness_r2_trimmed"] = features["amplitude_decrement_fitness_r2_denoised"] ?: 0.0
        features["amplitude_decrement_slope_trimmed"] = features["amplitude_decrement_slope_denoised"] ?: 0.0
        features["amplitude_decrement_end_to_mean_trimmed"] = features["amplitude_decrement_end_to_mean_denoised"] ?: 0.0
        features["amplitude_decrement_fit_min_degree_trimmed"] = features["amplitude_decrement_fit_min_degree_denoised"] ?: 0.0

        // peaks counts
        features["num_peaks_trimmed"] = peaks.size.toDouble()
        features["num_peaks_denoised"] = peaks.size.toDouble()

        // normalized interruptions / freeze per peak
        val nPeaks = peaks.size.takeIf { it>0 } ?: 1
        features["num_interruptions_norm_denoised"] = (interruptions.first.toDouble() / nPeaks)
        features["num_freeze_norm_denoised"] = (interruptions.second.toDouble() / nPeaks)
        features["num_interruptions_norm_trimmed"] = features["num_interruptions_norm_denoised"] ?: 0.0
        features["num_freeze_norm_trimmed"] = features["num_freeze_norm_denoised"] ?: 0.0

        // speed stats (abs) - using wristVel arrays
        val speedStatsDenoised = MathUtils.getStats(wristVelD.toDoubleArray())
        features["speed_median_denoised"] = speedStatsDenoised["median"] ?: 0.0
        features["speed_quartile_range_denoised"] = speedStatsDenoised["quartile_range"] ?: 0.0
        features["speed_min_denoised"] = speedStatsDenoised["min"] ?: 0.0
        features["speed_max_denoised"] = speedStatsDenoised["max"] ?: 0.0
        features["speed_median_trimmed"] = features["speed_median_denoised"] ?: 0.0
        features["speed_min_trimmed"] = features["speed_min_denoised"] ?: 0.0

        // acceleration min proxies
        features["acceleration_min_denoised"] = 0.0
        features["acceleration_min_trimmed"] = 0.0

        // Ensure all expected 53 keys exist (if any missing, set 0.0)
        val expectedKeys = listOf(
            "wrist_mvmnt_x_median","wrist_mvmnt_x_min","wrist_mvmnt_y_median","wrist_mvmnt_y_min","wrist_mvmnt_y_max",
            "wrist_mvmnt_dist_min","aperiodicity_denoised","aperiodicity_trimmed","periodEntropy_denoised",
            "periodVarianceNorm_denoised","periodVarianceNorm_trimmed","numInterruptions_denoised","numFreeze_denoised",
            "numFreeze_trimmed","maxFreezeDuration_denoised","maxFreezeDuration_trimmed","period_median_denoised",
            "period_quartile_range_denoised","period_min_denoised","period_quartile_range_trimmed","frequency_quartile_range_denoised",
            "frequency_min_denoised","frequency_stdev_denoised","frequency_lr_fitness_r2_denoised","frequency_lr_slope_denoised",
            "frequency_lr_fitness_r2_trimmed","frequency_lr_slope_trimmed","frequency_fit_min_degree_denoised","frequency_fit_min_degree_trimmed",
            "amplitude_median_denoised","amplitude_quartile_range_denoised","amplitude_max_denoised","amplitude_stdev_denoised",
            "amplitude_entropy_denoised","amplitude_stdev_trimmed","amplitude_decrement_fitness_r2_denoised","amplitude_decrement_slope_denoised",
            "amplitude_decrement_end_to_mean_denoised","amplitude_decrement_fit_min_degree_denoised","amplitude_decrement_last_to_first_half_denoised",
            "amplitude_decrement_fitness_r2_trimmed","amplitude_decrement_slope_trimmed","amplitude_decrement_end_to_mean_trimmed","amplitude_decrement_fit_min_degree_trimmed",
            "num_peaks_trimmed","speed_median_denoised","speed_quartile_range_denoised","speed_min_denoised","speed_max_denoised",
            "speed_median_trimmed","speed_min_trimmed","acceleration_min_denoised","acceleration_min_trimmed"
        )

        for (k in expectedKeys) if (!features.containsKey(k)) features[k] = 0.0

        return features.toMap()
    }

    // ---- Helper methods ----

    private fun denoise(arr: DoubleArray): DoubleArray {
        val n = arr.size
        val out = DoubleArray(n)
        val win = 3
        for (i in arr.indices) {
            var sum = 0.0
            var cnt = 0
            for (j in max(0, i - win)..min(n-1, i+win)) {
                val v = arr[j]
                if (v != -1.0) { sum += v; cnt++ }
            }
            out[i] = if (cnt == 0) -1.0 else sum / cnt
        }
        return out
    }

    private fun findPeaks(arr: DoubleArray): List<Int> {
        val peaks = mutableListOf<Int>()
        for (i in 1 until arr.size - 1) {
            val prev = arr[i-1]; val curr = arr[i]; val next = arr[i+1]
            if (curr > prev && curr > next && curr > 0 && curr != -1.0) peaks.add(i)
        }
        return peaks
    }

    private fun period_entropy(periods: DoubleArray): Double {
        if (periods.isEmpty()) return 0.0
        val arr = periods.toList().groupingBy { it }.eachCount().values.map { it.toDouble() }.toDoubleArray()
        val s = arr.sum()
        var ent = 0.0
        for (v in arr) {
            val p = v / s
            ent -= if (p > 0) p * ln(p) else 0.0
        }
        return ent
    }

    private fun aperiodicity(denoised: DoubleArray, peaks: List<Int>): Double {
        if (peaks.size <= 1) return 0.0
        val diffs = DoubleArray(peaks.size - 1) { i -> abs(denoised[peaks[i+1]] - denoised[peaks[i]]) }
        return (if (diffs.isEmpty()) 0.0 else diffs.average())
    }

    private fun variance(list: List<Double>): Double {
        if (list.isEmpty()) return 0.0
        val m = list.average()
        return list.map { (it - m)*(it - m) }.sum() / list.size
    }

    private fun countInterruptions(Draw: List<Double>): Pair<Int, Int> {
        // simple heuristic: interruption when value == -1 for >= threshold frames
        var interrupts = 0
        var freezes = 0
        var curMissing = 0
        for (v in Draw) {
            if (v == -1.0) curMissing++ else {
                if (curMissing > 0) {
                    if (curMissing >= 5) freezes++ else interrupts++
                }
                curMissing = 0
            }
        }
        if (curMissing > 0) { if (curMissing >= 5) freezes++ else interrupts++ }
        return Pair(interrupts, freezes)
    }

    private fun maxFreeze(Draw: List<Double>): Double {
        var maxf = 0
        var cur = 0
        for (v in Draw) {
            if (v == -1.0) cur++ else { if (cur > maxf) maxf = cur; cur = 0 }
        }
        if (cur > maxf) maxf = cur
        return maxf.toDouble()
    }

    private fun angularAmplitudeEntropy(amps: DoubleArray): Double {
        if (amps.isEmpty()) return 0.0
        // simple entropy on normalized amplitude distribution
        val total = amps.map { abs(it) }.sum()
        if (total == 0.0) return 0.0
        val probs = amps.map { abs(it) / total }
        var ent = 0.0
        for (p in probs) if (p > 0) ent -= p * ln(p)
        return ent
    }

    private fun amplitudeDecrementSlope(amps: DoubleArray): Double {
        if (amps.size < 2) return 0.0
        // simple linear regression slope (y ~ a + b x)
        val n = amps.size
        val xs = (0 until n).map { it.toDouble() }
        val meanX = xs.average()
        val meanY = amps.average()
        val num = (0 until n).map { (xs[it] - meanX) * (amps[it] - meanY) }.sum()
        val den = (0 until n).map { (xs[it] - meanX)*(xs[it] - meanX) }.sum().takeIf { it!=0.0 } ?: 1.0
        return num / den
    }

    private fun euclid(x1: Double, y1: Double, x2: Double, y2: Double): Double {
        val dx = x1 - x2
        val dy = y1 - y2
        return sqrt(dx*dx + dy*dy)
    }
}
