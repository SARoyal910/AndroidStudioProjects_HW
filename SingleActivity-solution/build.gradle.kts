// Top-level (root) build file where you can add configuration options common to all
// sub-projects/modules.
//
// We declare the plugins the project will use but set `apply false`, which means:
// "make these plugin versions available to the sub-projects, but don't apply them
// to the root project itself." Each module (e.g. :app) then applies the ones it needs.
plugins {
    // The Android Application plugin — turns a module into a buildable Android app.
    alias(libs.plugins.android.application) apply false
    // The Kotlin Compose compiler plugin — required to use Jetpack Compose with Kotlin.
    alias(libs.plugins.kotlin.compose) apply false
}
