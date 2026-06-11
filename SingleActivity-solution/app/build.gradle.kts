// app/build.gradle.kts
// Build script for the ":app" module — this is where the Android app itself is configured.

plugins {
    // Apply the Android Application plugin (this module produces an installable APK/AAB).
    alias(libs.plugins.android.application)
    // Apply the Kotlin Compose plugin so we can write UI with Jetpack Compose.
    alias(libs.plugins.kotlin.compose)
}

android {
    // The namespace is the base package used for the generated R class and BuildConfig.
    namespace = "com.example.singleactivity"
    // The Android API level the app is *compiled* against (gives access to that API's symbols).
    compileSdk = 37

    defaultConfig {
        // The unique application ID that identifies this app on a device and in the Play Store.
        applicationId = "com.example.singleactivity"
        // Lowest Android version the app can be installed on (API 24 = Android 7.0).
        minSdk = 24
        // The API level the app is tested/optimized for at runtime.
        targetSdk = 37
        // Internal version number, increased with each release (must go up for store updates).
        versionCode = 1
        // Human-readable version shown to users.
        versionName = "1.0"

        // The test runner used for instrumented (on-device) tests.
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            // Code shrinking/optimization (R8) configuration for release builds.
            // Disabled here to keep the sample build simple and fast.
            optimization {
                enable = false
            }
        }
    }
    compileOptions {
        // Use Java 11 language features / bytecode level for the Java parts of the build.
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }
    buildFeatures {
        // Enable Jetpack Compose tooling for this module.
        compose = true
    }
}

dependencies {
    // --- Jetpack Compose ---
    // The Compose BOM (Bill of Materials) pins one consistent set of versions for all
    // Compose libraries, so the individual Compose dependencies below omit versions.
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.activity.compose)        // Bridges Activities and Compose (setContent {}).
    implementation(libs.androidx.compose.material3)        // Material Design 3 components (Text, Scaffold, etc.).
    implementation(libs.androidx.compose.ui)              // Core Compose UI runtime.
    implementation(libs.androidx.compose.ui.graphics)     // Graphics primitives for Compose.
    implementation(libs.androidx.compose.ui.tooling.preview) // Support for @Preview in the IDE.

    // --- AndroidX core ---
    implementation(libs.androidx.core.ktx)                 // Kotlin-friendly extensions over the Android framework.
    implementation(libs.androidx.lifecycle.runtime.ktx)    // Lifecycle-aware coroutine/utility helpers.

    // --- Testing ---
    testImplementation(libs.junit)                                          // Local JUnit tests (run on the JVM).
    androidTestImplementation(platform(libs.androidx.compose.bom))          // BOM also applies to instrumented tests.
    androidTestImplementation(libs.androidx.compose.ui.test.junit4)         // Compose UI testing APIs.
    androidTestImplementation(libs.androidx.espresso.core)                  // Espresso for UI interaction tests.
    androidTestImplementation(libs.androidx.junit)                          // AndroidX JUnit extensions.

    // --- Debug-only tooling ---
    debugImplementation(libs.androidx.compose.ui.test.manifest)            // Test manifest, only needed in debug builds.
    debugImplementation(libs.androidx.compose.ui.tooling)                  // Interactive Compose preview/inspector.
}
