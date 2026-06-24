pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "AndroidStudioProjects"

// Add the modules you want to be able to run
include(":ComposeCatalog")
include(":ComposeCatalog-solution")
include(":NavFourScreen")
include(":NavFourScreen-solution")
include(":ComposeModernUI")
include(":ComposeLists")
include(":ComposeModifiers")
include(":ComposeModifiers-solution")
include(":ComposeMaster")
include(":ExampleProject")
include(":StorageShowcase")
include(":NavDataLayer-solution")
include(":NavViewModelState-solution")
include(":ComposeParts:app")
// Homework modules
include(":homework:Assigned:Hw5ProfileCard:app")
include(":homework:Assigned:Hw5SettingsList:app")
include(":homework:Assigned:Hw6TaskList")
// You can add more modules here as needed
