plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.compose)
    // KSP runs Room's annotation processor and GENERATES the concrete *_Impl classes
    // (CloudSyncDatabase_Impl / NoteDao_Impl) at build time.
    alias(libs.plugins.ksp)
    // kotlinx.serialization compiler plugin — lets @Serializable NoteDto encode to JSON for the cloud.
    alias(libs.plugins.kotlin.serialization)
}

android {
    namespace = "com.example.cloudsync"
    compileSdk = 37

    defaultConfig {
        applicationId = "com.example.cloudsync"
        minSdk = 24
        targetSdk = 37
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
        compose = true
    }
}

dependencies {
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.activity.compose)
    implementation(libs.androidx.compose.material3)
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.ui.graphics)
    implementation(libs.androidx.compose.ui.tooling.preview)
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)

    // --- OFFLINE-FIRST STACK (the whole point of this project) ---
    // Room: the LOCAL single source of truth. The UI only ever reads this.
    implementation(libs.androidx.room.runtime)
    implementation(libs.androidx.room.ktx)              // suspend + Flow DAO return types
    ksp(libs.androidx.room.compiler)                    // KSP generates the SQLite-backed impls
    // Cloud transport: Retrofit + OkHttp + JSON for the Real sync backend.
    implementation(libs.retrofit)
    implementation(libs.retrofit.converter.kotlinx.serialization)
    implementation(libs.okhttp)
    implementation(libs.kotlinx.serialization.json)
    // WorkManager: deferrable, retryable background sync (network-constrained, survives death).
    implementation(libs.androidx.work.runtime.ktx)
    // Compose + ViewModel/Flow glue: viewModel() and collectAsStateWithLifecycle().
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation(libs.androidx.lifecycle.runtime.compose)

    testImplementation(libs.junit)
    testImplementation(libs.kotlinx.coroutines.test)
    androidTestImplementation(platform(libs.androidx.compose.bom))
    androidTestImplementation(libs.androidx.compose.ui.test.junit4)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.room.testing)
    debugImplementation(libs.androidx.compose.ui.test.manifest)
    debugImplementation(libs.androidx.compose.ui.tooling)
}
