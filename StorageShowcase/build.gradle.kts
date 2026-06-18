plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.compose)
    // KSP runs Room's annotation processor and GENERATES the concrete *_Impl classes
    // (StorageDatabase_Impl / NoteDao_Impl) at build time. Without it the app fails at
    // runtime ("cannot find implementation for StorageDatabase").
    alias(libs.plugins.ksp)
    // kotlinx.serialization compiler plugin — lets @Serializable data classes (UserProfile)
    // be encoded to JSON, which the TYPED DataStore's Serializer uses.
    alias(libs.plugins.kotlin.serialization)
}

android {
    namespace = "com.example.storageshowcase"
    compileSdk = 37

    defaultConfig {
        applicationId = "com.example.storageshowcase"
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

    // --- LOCAL PERSISTENCE STACK (the whole point of this project) ---
    // Room: structured/relational storage (notes + categories, with a relation & migration).
    implementation(libs.androidx.room.runtime)
    implementation(libs.androidx.room.ktx)              // suspend + Flow DAO return types
    ksp(libs.androidx.room.compiler)                    // KSP generates the SQLite-backed impls
    // DataStore: simple key/value settings (Preferences) + a typed object store (datastore).
    implementation(libs.androidx.datastore.preferences)
    implementation(libs.androidx.datastore)
    // JSON for the typed DataStore's Serializer<UserProfile>.
    implementation(libs.kotlinx.serialization.json)
    // Compose + ViewModel/Flow glue: viewModel() and collectAsStateWithLifecycle().
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation(libs.androidx.lifecycle.runtime.compose)

    testImplementation(libs.junit)
    testImplementation(libs.kotlinx.coroutines.test)
    androidTestImplementation(platform(libs.androidx.compose.bom))
    androidTestImplementation(libs.androidx.compose.ui.test.junit4)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.room.testing)   // MigrationTestHelper
    debugImplementation(libs.androidx.compose.ui.test.manifest)
    debugImplementation(libs.androidx.compose.ui.tooling)
}
