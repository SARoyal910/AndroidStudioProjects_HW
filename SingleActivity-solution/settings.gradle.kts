// settings.gradle.kts
// This is the very first build script Gradle evaluates. It defines project-wide
// settings: where plugins/dependencies are downloaded from, the project name, and
// which modules (sub-projects) are part of this build.

pluginManagement {
    // Repositories Gradle searches when it needs to download the *plugins* used by
    // the build scripts (the Android Gradle Plugin, the Kotlin plugin, etc.).
    repositories {
        google {
            // Restrict the Google Maven repo to only the artifact groups it actually
            // hosts. This speeds up resolution and avoids accidentally pulling
            // unrelated artifacts from Google's repo.
            content {
                includeGroupByRegex("com\\.android.*")
                includeGroupByRegex("com\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()      // The main public repository for most Java/Kotlin libraries.
        gradlePluginPortal() // Repository specifically for Gradle plugins.
    }
}
plugins {
    // Foojay resolver lets Gradle automatically download a matching JDK toolchain
    // if the one required by the build isn't already installed on the machine.
    id("org.gradle.toolchains.foojay-resolver-convention") version "1.0.0"
}
dependencyResolutionManagement {
    // FAIL_ON_PROJECT_REPOS forbids individual modules from declaring their own
    // repositories — every dependency must come from the central list below. This
    // keeps dependency sources consistent and reproducible across the whole project.
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

// The display name of the root project (shown in the IDE and used in build output).
rootProject.name = "SingleActivity-solution"
// Include the ":app" module — this project has a single application module named "app".
include(":app")
