plugins {
    // The Android application plugin — builds an installable .apk / app module.
    alias(libs.plugins.android.application)
    // The Kotlin Compose compiler plugin — turns @Composable functions into UI.
    alias(libs.plugins.kotlin.compose)
    // NOTE: this Compose-FUNDAMENTALS project has NO navigation and NO serialized
    // keys, so the kotlin.serialization plugin from the base sample was removed.
}

android {
    namespace = "com.example.testingbasics"
    compileSdk = 37

    defaultConfig {
        applicationId = "com.example.testingbasics"
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
    // NOTE: Navigation 3 and kotlinx.serialization deps from the base sample were
    // removed — this project teaches Compose fundamentals on a SINGLE screen and
    // does not navigate or persist anything.
    testImplementation(libs.junit)
    androidTestImplementation(platform(libs.androidx.compose.bom))
    androidTestImplementation(libs.androidx.compose.ui.test.junit4)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(libs.androidx.junit)
    debugImplementation(libs.androidx.compose.ui.test.manifest)
    debugImplementation(libs.androidx.compose.ui.tooling)
}
