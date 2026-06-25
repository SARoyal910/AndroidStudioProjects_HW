plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.compose)
    // Kotlin serialization compiler plugin — generates serializers for the @Serializable DTOs.
    alias(libs.plugins.kotlin.serialization)
}

android {
    namespace = "com.example.networkparsing"
    compileSdk = 37

    defaultConfig {
        applicationId = "com.example.networkparsing"
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

    // --- NETWORKING + JSON PARSING (this project's concept) ------------------
    // kotlinx.serialization: maps JSON <-> @Serializable NoteDto.
    implementation(libs.kotlinx.serialization.json)
    // Retrofit: builds a type-safe HTTP client from the NoteApi interface.
    implementation(libs.retrofit)
    // Lets Retrofit decode response bodies with kotlinx.serialization.
    implementation(libs.retrofit.converter.kotlinx.serialization)
    // OkHttp: the HTTP engine + MediaType used when wiring the converter factory.
    implementation(libs.okhttp)

    // --- ViewModel + StateFlow -> Compose ------------------------------------
    // viewModel() inside a @Composable.
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    // collectAsStateWithLifecycle() to observe StateFlow<NotesUiState>.
    implementation(libs.androidx.lifecycle.runtime.compose)

    testImplementation(libs.junit)
    // Lets the unit test run suspend repository code via runTest { }.
    testImplementation(libs.kotlinx.coroutines.test)
    androidTestImplementation(platform(libs.androidx.compose.bom))
    androidTestImplementation(libs.androidx.compose.ui.test.junit4)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(libs.androidx.junit)
    debugImplementation(libs.androidx.compose.ui.test.manifest)
    debugImplementation(libs.androidx.compose.ui.tooling)
}
