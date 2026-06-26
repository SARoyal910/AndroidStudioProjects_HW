// =============================================================================
// build.gradle.kts (module)  —  how to BUILD the PokeDex app.
//
// This file wires the THREE topics of the homework into one buildable app:
//   • Compose + Material 3  (the UI toolkit; `buildFeatures { compose = true }`)
//   • Navigation 3          (needs the kotlin-serialization plugin for @Serializable keys)
//   • Room                  (needs the KSP plugin so the annotation processor runs)
//
// Read the `plugins { }` block top-to-bottom: each `alias(libs.plugins.x)` turns on
// one capability, and the matching dependencies below supply the actual libraries.
// =============================================================================
plugins {
    alias(libs.plugins.android.application)        // makes this an Android APP module
    alias(libs.plugins.kotlin.compose)             // Compose compiler plugin (required for @Composable)
    // KSP (Kotlin Symbol Processing) — REQUIRED so Room's annotation processor runs during
    // assembleDebug and GENERATES the concrete TaskDatabase_Impl / TaskDao_Impl classes.
    // Without this plugin applied, the ksp("androidx.room:room-compiler") dependency below
    // does nothing and the app fails at runtime ("cannot find implementation for TaskDatabase").
    alias(libs.plugins.ksp)
    // Kotlin serialization compiler plugin — REQUIRED for the @Serializable Nav3 keys
    // (TaskListKey / TaskEditKey). Nav3 serializes the back stack so it survives process death.
    alias(libs.plugins.kotlin.serialization)
}

android {
    namespace = "com.example.pokedex"          // the Kotlin/R-class namespace for this app
    compileSdk = 37                                 // compile against the Android 37 SDK

    defaultConfig {
        applicationId = "com.example.pokedex"   // the unique app id installed on the device
        minSdk = 24                                 // oldest Android version supported
        targetSdk = 37                              // the version this app is tested/targeted against
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    buildFeatures {
        compose = true                              // turn on Jetpack Compose for this module
    }
}

dependencies {
    // --- Jetpack Compose + Material 3 (the UI) ---
    implementation(platform(libs.androidx.compose.bom))  // BOM pins all Compose libs to one tested set
    implementation(libs.androidx.activity.compose)       // setContent { } bridge from Activity to Compose
    implementation(libs.androidx.compose.material3)       // Material 3 components (Button, Scaffold, Switch…)
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.ui.graphics)
    implementation(libs.androidx.compose.ui.tooling.preview)
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)

    // --- Navigation 3 (moving between the list screen and the add/edit screen) ---
    implementation(libs.androidx.navigation3.runtime)    // NavKey, entryProvider, rememberNavBackStack
    implementation(libs.androidx.navigation3.ui)          // NavDisplay (draws the top key's screen)
    implementation(libs.kotlinx.serialization.json)       // runtime that serializes the @Serializable keys

    // --- Room (the OFFLINE CACHE: list + viewed details survive going offline) ---
    implementation(libs.androidx.room.runtime)           // Room runtime engine
    implementation(libs.androidx.room.ktx)                // suspend DAO functions + Flow query results
    // The Room compiler is wired through KSP (NOT implementation). This is the line that
    // makes KSP generate the SQLite-backed implementation of @Dao / @Database at build time.
    ksp(libs.androidx.room.compiler)

    // --- Networking + JSON parsing (Retrofit + kotlinx.serialization) — the NEW layer ---
    implementation(libs.retrofit)                                  // type-safe HTTP client from the PokemonApi interface
    implementation(libs.retrofit.converter.kotlinx.serialization)  // lets Retrofit decode bodies with kotlinx.serialization
    implementation(libs.okhttp)                                    // HTTP engine + MediaType for the converter
    // NOTE: kotlinx-serialization-json is already declared above (for Nav3 keys); the DTOs reuse it.

    // --- Compose + ViewModel/Flow glue: viewModel() and collectAsStateWithLifecycle() ---
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation(libs.androidx.lifecycle.runtime.compose)

    testImplementation(libs.junit)
    testImplementation(libs.kotlinx.coroutines.test)     // runTest { } to drive suspend repository/ViewModel code
    androidTestImplementation(platform(libs.androidx.compose.bom))
    androidTestImplementation(libs.androidx.compose.ui.test.junit4)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(libs.androidx.junit)
    debugImplementation(libs.androidx.compose.ui.test.manifest)
    debugImplementation(libs.androidx.compose.ui.tooling)
}
