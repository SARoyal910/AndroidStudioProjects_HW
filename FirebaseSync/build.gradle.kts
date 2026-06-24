plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.compose)
    // KSP runs Room's annotation processor and GENERATES the concrete *_Impl classes
    // (FirebaseSyncDatabase_Impl / NoteDao_Impl) at build time.
    alias(libs.plugins.ksp)
    // NOTE: unlike CloudSync there is NO kotlinx.serialization plugin here — Firestore maps
    // Kotlin objects to/from documents with its OWN reflection, so NoteDto is a plain data class.
}

android {
    namespace = "com.example.firebasesync"
    compileSdk = 37

    defaultConfig {
        applicationId = "com.example.firebasesync"
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
    // Cloud transport: Google Cloud Firestore is the REAL cloud database.
    implementation(platform(libs.firebase.bom))         // one aligned set of Firebase versions
    implementation(libs.firebase.firestore)             // the Firestore client (Kotlin extensions bundled in)
    implementation(libs.kotlinx.coroutines.play.services) // lets us `await()` a Firestore Task in a suspend fun
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
