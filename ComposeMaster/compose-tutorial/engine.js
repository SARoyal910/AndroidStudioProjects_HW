/* Jetpack Compose Layout Lab — interactive engine.
   Renders the whole page from the global SECTIONS array, and drives each
   playground: live CSS-flexbox emulation of Compose layout + live generated
   Kotlin. SECTIONS is injected above this script by build.mjs. */
(function () {
  "use strict";

  // ----- role defaults (merged with per-control overrides from the recipe) -----
  const SELECT_OPTS = {
    verticalArrangement: ["Top", "Bottom", "Center", "SpaceBetween", "SpaceAround", "SpaceEvenly"],
    horizontalArrangement: ["Start", "End", "Center", "SpaceBetween", "SpaceAround", "SpaceEvenly"],
    verticalAlignment: ["Top", "CenterVertically", "Bottom"],
    horizontalAlignment: ["Start", "CenterHorizontally", "End"],
    boxContentAlignment: ["TopStart", "TopCenter", "TopEnd", "CenterStart", "Center", "CenterEnd", "BottomStart", "BottomCenter", "BottomEnd"],
    background: ["Coral", "Teal", "Indigo", "Amber", "Slate"],
    fontWeight: ["Normal", "Medium", "SemiBold", "Bold"],
    textAlign: ["Start", "Center", "End", "Justify"],
    buttonStyle: ["Filled", "Tonal", "Outlined", "Elevated", "Text"],
    cardStyle: ["Elevated", "Filled", "Outlined"],
    control: ["Switch", "Checkbox", "RadioButton", "Slider"],
    textFieldStyle: ["Filled", "Outlined"],
    insets: ["none", "systemBarsPadding", "Scaffold"],
    avatarShape: ["Circle", "Rounded"],
    lazyKind: ["AdaptiveGrid", "FixedGrid", "StaggeredGrid", "Pager"],
    imageSource: ["Resource", "Network", "Vector", "CustomPainter"],
    contentScale: ["Fit", "Crop", "FillBounds", "Inside"],
    transientSurface: ["Dialog", "Snackbar", "BottomSheet", "Menu", "Tooltip", "Badge"],
    navSurface: ["TopAppBar", "NavigationBar", "NavigationRail", "Drawer", "Tabs"],
    selectionInput: ["SearchBar", "AssistChip", "FilterChip", "InputChip", "SuggestionChip", "SegmentedButton", "DatePicker", "TimePicker"],
    statusContent: ["CircularProgress", "LinearProgress", "PullToRefresh", "ListItem", "Divider", "Carousel"],
    constraintMode: ["InlineRefs", "ConstraintSet", "Guideline", "Barrier", "Chain"],
    chainStyle: ["Spread", "SpreadInside", "Packed"],
    visibilityTracking: ["VisibilityChanged", "FirstVisibleOnce", "LayoutRectChanged", "LazyListImpression"],
    interopMode: ["ComposeView", "AndroidView", "AndroidFragment", "AbstractComposeView"],
    nav3Mode: ["Basic", "Saved", "Decorators", "Scenes"],
  };
  const SLIDER = {
    padding: [0, 48, 4, 16], paddingHorizontal: [0, 48, 4, 16], paddingVertical: [0, 48, 4, 12],
    paddingStart: [0, 48, 4, 0], paddingTop: [0, 48, 4, 0], paddingEnd: [0, 48, 4, 0], paddingBottom: [0, 48, 4, 0],
    width: [24, 240, 8, 120], height: [24, 200, 8, 80], size: [24, 200, 8, 96], childSize: [24, 96, 4, 48],
    gap: [0, 32, 2, 8], offsetX: [-48, 48, 4, 0], offsetY: [-48, 48, 4, 0],
    cornerRadius: [0, 48, 2, 12], borderWidth: [0, 8, 1, 0], aspectRatio: [0.5, 2.5, 0.1, 1],
    fillFraction: [0.1, 1, 0.05, 1], fontSize: [10, 40, 2, 18], maxLines: [1, 5, 1, 2],
    itemCount: [2, 12, 1, 6], childCount: [1, 8, 1, 3], columns: [1, 5, 1, 3], progressValue: [0, 100, 5, 65],
    cardElevation: [0, 12, 1, 2], nestDepth: [1, 4, 1, 2],
  };
  const TOGGLES = ["fillMaxWidth", "fillMaxHeight", "clip", "scroll", "orderSwap",
    "enabled", "withIcon", "checked", "singleLine", "showLabel", "topBar", "bottomBar", "fab", "showSubtitle", "showTrailing",
    "animateItems", "paging", "fullSpanHeader", "imageDescription", "imageClip", "imagePlaceholder", "imageTint",
    "surfaceVisible", "destructiveAction", "hasUndo", "richContent", "partialSheet",
    "showBadges", "wideWindow", "drawerOpen", "scrollBehavior", "secondaryTabs",
    "expandedSearch", "multiSelect", "modalPicker", "rangePicker", "inputMode", "removableChip",
    "determinateProgress", "refreshing", "customIndicator", "supportingText", "withDividers", "carouselUncontained",
    "showGuidelines", "composeAlternative", "trackFirstOnly", "useDebounce", "overlayViewport",
    "lifecycleStrategy", "viewReuse", "nestedScrollInterop", "serializableKeys", "entryDecorators", "sceneMetadata"];

  const JUSTIFY = { Top: "flex-start", Bottom: "flex-end", Start: "flex-start", End: "flex-end", Center: "center", SpaceBetween: "space-between", SpaceAround: "space-around", SpaceEvenly: "space-evenly" };
  const ALIGN = { Start: "flex-start", End: "flex-end", Top: "flex-start", Bottom: "flex-end", CenterHorizontally: "center", CenterVertically: "center", Center: "center" };
  const PLACE = { TopStart: "start start", TopCenter: "start center", TopEnd: "start end", CenterStart: "center start", Center: "center center", CenterEnd: "center end", BottomStart: "end start", BottomCenter: "end center", BottomEnd: "end end" };
  const COLORVAR = { Coral: "coral", Teal: "teal", Indigo: "indigo", Amber: "amber", Slate: "slate" };
  const COLORK = ["Color(0xFFEC6A5E)", "Color(0xFF1FA9A0)", "Color(0xFF5C6BC0)", "Color(0xFFF2B441)", "Color(0xFF5B6B7B)"];
  const WEIGHT = { Normal: 400, Medium: 500, SemiBold: 600, Bold: 700 };
  const TEXTALIGN = { Start: "left", Center: "center", End: "right", Justify: "justify" };
  const FONTW = { Normal: "FontWeight.Normal", Medium: "FontWeight.Medium", SemiBold: "FontWeight.SemiBold", Bold: "FontWeight.Bold" };
  const STORAGE_KEY = "composeMaster.mastered.v1";
  const DIAGNOSTIC_KEY = "composeMaster.diagnostic.v1";
  const NOTES_KEY = "composeMaster.notes.v1";
  const MATRIX_KEY = "composeMaster.matrix.v1";
  const MATRIX_SKILLS = [
    { id: "explain", label: "Explain", prompt: "Teach the concept in one sentence without reading the lesson." },
    { id: "predict", label: "Predict", prompt: "Name the bug this concept prevents before checking the gotchas." },
    { id: "build", label: "Build", prompt: "Write or adapt the canonical snippet from memory." },
    { id: "review", label: "Review", prompt: "Use the concept to make a concrete code-review comment." },
  ];

  const DOCS = {
    mentalModel: ["Thinking in Compose", "https://developer.android.com/develop/ui/compose/mental-model"],
    state: ["State and Jetpack Compose", "https://developer.android.com/develop/ui/compose/state"],
    stateHoisting: ["Where to hoist state", "https://developer.android.com/develop/ui/compose/state-hoisting"],
    composeArchitecture: ["Compose UI Architecture", "https://developer.android.com/develop/ui/compose/architecture"],
    viewModelOverview: ["ViewModel overview", "https://developer.android.com/topic/libraries/architecture/viewmodel"],
    sideEffects: ["Side-effects in Compose", "https://developer.android.com/develop/ui/compose/side-effects"],
    phases: ["Jetpack Compose phases", "https://developer.android.com/develop/ui/compose/phases"],
    performance: ["Compose performance best practices", "https://developer.android.com/develop/ui/compose/performance/bestpractices"],
    modifiers: ["Compose modifiers", "https://developer.android.com/develop/ui/compose/modifiers"],
    constraints: ["Constraints and modifier order", "https://developer.android.com/develop/ui/compose/layouts/constraints-modifiers"],
    layouts: ["Compose layout basics", "https://developer.android.com/develop/ui/compose/layouts/basics"],
    customLayouts: ["Custom layouts", "https://developer.android.com/develop/ui/compose/layouts/custom"],
    constraintLayout: ["ConstraintLayout in Compose", "https://developer.android.com/develop/ui/compose/layouts/constraintlayout"],
    visibilityModifiers: ["Visibility tracking in Compose", "https://developer.android.com/develop/ui/compose/layouts/visibility-modifiers"],
    composeUiLayoutApi: ["androidx.compose.ui.layout API reference", "https://developer.android.com/reference/kotlin/androidx/compose/ui/layout/package-summary"],
    relativeLayoutBoundsApi: ["RelativeLayoutBounds API reference", "https://developer.android.com/reference/kotlin/androidx/compose/ui/spatial/RelativeLayoutBounds"],
    foundationReleases: ["Compose Foundation release notes", "https://developer.android.com/jetpack/androidx/releases/compose-foundation"],
    intrinsicMeasurements: ["Intrinsic measurements in Compose layouts", "https://developer.android.com/develop/ui/compose/layouts/intrinsic-measurements"],
    alignmentLines: ["Alignment lines in Jetpack Compose", "https://developer.android.com/develop/ui/compose/layouts/alignment-lines"],
    lists: ["Lazy lists and grids", "https://developer.android.com/develop/ui/compose/lists"],
    pager: ["Pager in Compose", "https://developer.android.com/develop/ui/compose/layouts/pager"],
    flowLayouts: ["Flow layouts in Compose", "https://developer.android.com/develop/ui/compose/layouts/flow"],
    pagingCompose: ["Paging 3 Compose support", "https://developer.android.com/topic/libraries/architecture/paging/v3-compose"],
    composeMigrationStrategy: ["Migration strategy", "https://developer.android.com/develop/ui/compose/migrate/strategy"],
    interopApis: ["Interoperability APIs", "https://developer.android.com/develop/ui/compose/migrate/interoperability-apis"],
    composeInViews: ["Using Compose in Views", "https://developer.android.com/develop/ui/compose/migrate/interoperability-apis/compose-in-views"],
    viewsInCompose: ["Using Views in Compose", "https://developer.android.com/develop/ui/compose/migrate/interoperability-apis/views-in-compose"],
    migrationOther: ["Other migration considerations", "https://developer.android.com/develop/ui/compose/migrate/other-considerations"],
    recyclerMigration: ["Migrate RecyclerView to lazy lists", "https://developer.android.com/develop/ui/compose/migrate/migration-scenarios/recycler-view"],
    graphicsOverview: ["Graphics in Compose", "https://developer.android.com/develop/ui/compose/graphics/draw/overview"],
    graphicsModifiers: ["Graphics modifiers", "https://developer.android.com/develop/ui/compose/graphics/draw/modifiers"],
    graphicsBrush: ["Brush: gradients and shaders", "https://developer.android.com/develop/ui/compose/graphics/draw/brush"],
    graphicsShapes: ["Shapes in Compose", "https://developer.android.com/develop/ui/compose/graphics/draw/shapes"],
    imageCustomize: ["Customize an image", "https://developer.android.com/develop/ui/compose/graphics/images/customize"],
    resourcesCompose: ["Resources in Compose", "https://developer.android.com/develop/ui/compose/resources"],
    imagesOverview: ["Working with images", "https://developer.android.com/develop/ui/compose/graphics/images"],
    imageLoading: ["Loading images", "https://developer.android.com/develop/ui/compose/graphics/images/loading"],
    imageCompare: ["ImageBitmap versus ImageVector", "https://developer.android.com/develop/ui/compose/graphics/images/compare"],
    imageCustomPainter: ["Custom painter", "https://developer.android.com/develop/ui/compose/graphics/images/custompainter"],
    imageOptimization: ["Optimizing bitmap images", "https://developer.android.com/develop/ui/compose/graphics/images/optimization"],
    material3: ["Material Design 3 in Compose", "https://developer.android.com/develop/ui/compose/designsystems/material3"],
    customDesignSystem: ["Custom design systems in Compose", "https://developer.android.com/develop/ui/compose/designsystems/custom"],
    compositionLocal: ["Locally scoped data with CompositionLocal", "https://developer.android.com/develop/ui/compose/compositionlocal"],
    components: ["Material components", "https://developer.android.com/develop/ui/compose/components"],
    buttons: ["Buttons", "https://developer.android.com/develop/ui/compose/components/button"],
    cards: ["Cards", "https://developer.android.com/develop/ui/compose/components/card"],
    switchCtl: ["Switch", "https://developer.android.com/develop/ui/compose/components/switch"],
    checkbox: ["Checkbox", "https://developer.android.com/develop/ui/compose/components/checkbox"],
    radio: ["Radio button", "https://developer.android.com/develop/ui/compose/components/radio-button"],
    chips: ["Chips", "https://developer.android.com/develop/ui/compose/components/chip"],
    searchBar: ["Search bar", "https://developer.android.com/develop/ui/compose/components/search-bar"],
    segmentedButton: ["Segmented button", "https://developer.android.com/develop/ui/compose/components/segmented-button"],
    datePickers: ["Date pickers", "https://developer.android.com/develop/ui/compose/components/datepickers"],
    timePickers: ["Time pickers", "https://developer.android.com/develop/ui/compose/components/time-pickers"],
    timePickerDialogs: ["Dialogs for time pickers", "https://developer.android.com/develop/ui/compose/components/time-pickers-dialogs"],
    progressIndicators: ["Progress indicators", "https://developer.android.com/develop/ui/compose/components/progress"],
    pullToRefresh: ["Pull to refresh", "https://developer.android.com/develop/ui/compose/components/pull-to-refresh"],
    carousel: ["Carousel", "https://developer.android.com/develop/ui/compose/components/carousel"],
    dividers: ["Divider", "https://developer.android.com/develop/ui/compose/components/divider"],
    materialLists: ["Material lists", "https://m3.material.io/components/lists/overview"],
    dialogs: ["Dialog", "https://developer.android.com/develop/ui/compose/components/dialog"],
    snackbars: ["Snackbar", "https://developer.android.com/develop/ui/compose/components/snackbar"],
    bottomSheets: ["Bottom sheets", "https://developer.android.com/develop/ui/compose/components/bottom-sheets"],
    bottomSheetsPartial: ["Partial bottom sheet", "https://developer.android.com/develop/ui/compose/components/bottom-sheets-partial"],
    menus: ["Menus", "https://developer.android.com/develop/ui/compose/components/menu"],
    tooltips: ["Tooltip", "https://developer.android.com/develop/ui/compose/components/tooltip"],
    badges: ["Badges", "https://developer.android.com/develop/ui/compose/components/badges"],
    appBars: ["App bars", "https://developer.android.com/develop/ui/compose/components/app-bars"],
    appBarNavigate: ["Navigate from top app bar", "https://developer.android.com/develop/ui/compose/components/app-bars-navigate"],
    appBarDynamic: ["Create a dynamic top app bar", "https://developer.android.com/develop/ui/compose/components/app-bars-dynamic"],
    navigationBarComponent: ["Navigation bar", "https://developer.android.com/develop/ui/compose/components/navigation-bar"],
    navigationRail: ["Navigation rail", "https://developer.android.com/develop/ui/compose/components/navigation-rail"],
    navigationDrawer: ["Navigation drawer", "https://developer.android.com/develop/ui/compose/components/drawer"],
    tabsComponent: ["Tabs", "https://developer.android.com/develop/ui/compose/components/tabs"],
    textFields: ["Text fields", "https://developer.android.com/develop/ui/compose/text/user-input"],
    textFieldMigration: ["Migrate to state-based text fields", "https://developer.android.com/develop/ui/compose/text/migrate-state-based"],
    autofill: ["Autofill in Compose", "https://developer.android.com/develop/ui/compose/text/autofill"],
    pointerInput: ["Pointer input in Compose", "https://developer.android.com/develop/ui/compose/touch-input/pointer-input"],
    gesturesUnderstand: ["Understand gestures", "https://developer.android.com/develop/ui/compose/touch-input/pointer-input/understand-gestures"],
    tapPress: ["Tap and press", "https://developer.android.com/develop/ui/compose/touch-input/pointer-input/tap-and-press"],
    dragSwipeFling: ["Drag, swipe, and fling", "https://developer.android.com/develop/ui/compose/touch-input/pointer-input/drag-swipe-fling"],
    multiTouch: ["Multitouch: panning, zooming, rotating", "https://developer.android.com/develop/ui/compose/touch-input/pointer-input/multi-touch"],
    nestedScroll: ["Nested scrolling modifiers", "https://developer.android.com/develop/ui/compose/touch-input/scroll/nested-scroll-modifiers"],
    scroll2d: ["Two-dimensional scrolling", "https://developer.android.com/develop/ui/compose/touch-input/scroll/two-dimensional-scrolling"],
    interactions: ["Handling user interactions", "https://developer.android.com/develop/ui/compose/touch-input/user-interactions/handling-interactions"],
    focusOverview: ["Focus in Compose", "https://developer.android.com/develop/ui/compose/touch-input/focus"],
    focusTraversal: ["Change focus traversal order", "https://developer.android.com/develop/ui/compose/touch-input/focus/change-focus-traversal-order"],
    focusBehavior: ["Change focus behavior", "https://developer.android.com/develop/ui/compose/touch-input/focus/change-focus-behavior"],
    focusReact: ["React to focus", "https://developer.android.com/develop/ui/compose/touch-input/focus/react-to-focus"],
    keyboardActions: ["Handle keyboard actions", "https://developer.android.com/develop/ui/compose/touch-input/keyboard-input/commands"],
    keyboardShortcuts: ["Keyboard Shortcuts Helper", "https://developer.android.com/develop/ui/compose/touch-input/keyboard-input/keyboard-shortcuts-helper"],
    edgeToEdge: ["Set up edge-to-edge", "https://developer.android.com/develop/ui/compose/system/setup-e2e"],
    windowInsets: ["About window insets", "https://developer.android.com/develop/ui/compose/system/insets"],
    windowInsetsUi: ["Set up window insets", "https://developer.android.com/develop/ui/compose/system/insets-ui"],
    keyboardImeAnimations: ["Use keyboard IME animations", "https://developer.android.com/develop/ui/compose/system/keyboard-animations"],
    materialInsets: ["Use Material 3 insets", "https://developer.android.com/develop/ui/compose/system/material-insets"],
    insetsInterop: ["Use insets in Views and Compose", "https://developer.android.com/develop/ui/compose/system/insets-views-compose"],
    stateSaving: ["Save UI state in Compose", "https://developer.android.com/develop/ui/compose/state-saving"],
    lifecycle: ["Lifecycle of composables", "https://developer.android.com/develop/ui/compose/lifecycle"],
    stability: ["Stability in Compose", "https://developer.android.com/develop/ui/compose/performance/stability"],
    stabilityFix: ["Fix stability issues", "https://developer.android.com/develop/ui/compose/performance/stability/fix"],
    semantics: ["Semantics", "https://developer.android.com/develop/ui/compose/accessibility/semantics"],
    accessibility: ["Accessibility in Jetpack Compose", "https://developer.android.com/develop/ui/compose/accessibility"],
    accessibilityTesting: ["Accessibility testing", "https://developer.android.com/develop/ui/compose/accessibility/testing"],
    composeTesting: ["Test your Compose layout", "https://developer.android.com/develop/ui/compose/testing"],
    testingCheatsheet: ["Compose testing cheatsheet", "https://developer.android.com/develop/ui/compose/testing/testing-cheatsheet"],
    testingSemantics: ["Testing semantics", "https://developer.android.com/develop/ui/compose/testing/semantics"],
    testingApis: ["Testing APIs", "https://developer.android.com/develop/ui/compose/testing/apis"],
    testingSync: ["Synchronize Compose tests", "https://developer.android.com/develop/ui/compose/testing/synchronization"],
    testingPatterns: ["Compose testing common patterns", "https://developer.android.com/develop/ui/compose/testing/common-patterns"],
    testingDebug: ["Debug Compose tests", "https://developer.android.com/develop/ui/compose/testing/debug?hl=en"],
    testingV2: ["Migrate to Compose testing v2 APIs", "https://developer.android.com/develop/ui/compose/testing/migrate-v2"],
    animationIntro: ["Animations in Compose", "https://developer.android.com/develop/ui/compose/animation/introduction"],
    animationChoose: ["Choose an animation API", "https://developer.android.com/develop/ui/compose/animation/choose-api"],
    composeTooling: ["Tools for Compose", "https://developer.android.com/develop/ui/compose/tooling"],
    previews: ["Preview your UI", "https://developer.android.com/develop/ui/compose/tooling/previews"],
    animationPreview: ["Animation Preview", "https://developer.android.com/develop/ui/compose/tooling/animation-preview"],
    toolingDebug: ["Debug your Compose UI", "https://developer.android.com/develop/ui/compose/tooling/debug"],
    compositionTracing: ["Composition tracing", "https://developer.android.com/develop/ui/compose/tooling/tracing"],
    composeLint: ["Compose lint", "https://developer.android.com/develop/ui/compose/tooling/lint"],
    navigation: ["Navigation component overview", "https://developer.android.com/guide/navigation"],
    navigationTypeSafety: ["Type safety in Navigation Compose", "https://developer.android.com/guide/navigation/design/type-safety"],
    navigation3Overview: ["Navigation 3", "https://developer.android.com/guide/navigation/navigation-3"],
    navigation3GetStarted: ["Get started with Navigation 3", "https://developer.android.com/guide/navigation/navigation-3/get-started"],
    navigation3Basics: ["Navigation 3 basics", "https://developer.android.com/guide/navigation/navigation-3/basics"],
    navigation3SaveState: ["Save and manage Navigation 3 state", "https://developer.android.com/guide/navigation/navigation-3/save-state"],
    navigation3Metadata: ["Navigation 3 metadata", "https://developer.android.com/guide/navigation/navigation-3/metadata"],
    navigation3Scenes: ["Navigation 3 Scenes", "https://developer.android.com/guide/navigation/navigation-3/scenes"],
    navigation3Migration: ["Migrate from Navigation 2 to Navigation 3", "https://developer.android.com/guide/navigation/navigation-3/migration-guide"],
    navigation3Releases: ["Navigation3 release notes", "https://developer.android.com/jetpack/androidx/releases/navigation3"],
    adaptiveStart: ["Get started with adaptive apps", "https://developer.android.com/develop/ui/compose/layouts/adaptive/get-started-with-adaptive-apps"],
    adaptiveWindowSizeClasses: ["Use window size classes", "https://developer.android.com/develop/ui/compose/layouts/adaptive/use-window-size-classes"],
    adaptiveDisplay: ["Support different display sizes", "https://developer.android.com/develop/ui/compose/layouts/adaptive/support-different-display-sizes"],
    adaptiveListDetail: ["Build a list-detail layout", "https://developer.android.com/develop/ui/compose/layouts/adaptive/list-detail"],
  };
  const SECTION_REFS = {
    composables: ["mentalModel", "state", "stateHoisting", "sideEffects"],
    "state-hoisting-udf": ["state", "stateHoisting", "composeArchitecture", "viewModelOverview", "stateSaving"],
    modifiers: ["modifiers", "constraints"],
    "modifier-order": ["constraints", "modifiers"],
    units: ["layouts", "phases"],
    sizing: ["layouts", "constraints"],
    "aspect-ratio": ["modifiers", "constraints"],
    padding: ["modifiers", "constraints"],
    spacing: ["layouts", "modifiers"],
    offset: ["modifiers", "phases"],
    column: ["layouts", "modifiers"],
    row: ["layouts", "modifiers"],
    box: ["layouts", "modifiers"],
    "custom-layouts": ["customLayouts", "intrinsicMeasurements", "alignmentLines", "constraints", "phases"],
    "constraint-layout": ["constraintLayout", "layouts", "constraints", "customLayouts", "intrinsicMeasurements"],
    "visibility-tracking": ["visibilityModifiers", "composeUiLayoutApi", "relativeLayoutBoundsApi", "foundationReleases", "modifiers", "lists", "sideEffects"],
    arrangement: ["layouts", "modifiers"],
    alignment: ["layouts", "modifiers"],
    weight: ["layouts", "modifiers"],
    "background-shape": ["modifiers", "constraints"],
    "drawing-graphics": ["graphicsOverview", "graphicsModifiers", "graphicsBrush", "graphicsShapes", "imageCustomize", "performance"],
    "images-resources": ["resourcesCompose", "imagesOverview", "imageLoading", "imageCustomize", "imageCompare", "imageCustomPainter", "imageOptimization", "accessibility"],
    scroll: ["lists", "layouts"],
    "lazy-lists": ["lists", "performance"],
    "lazy-collections-scale": ["lists", "pager", "flowLayouts", "pagingCompose", "performance", "sideEffects"],
    "theming-design-system": ["material3", "customDesignSystem", "compositionLocal"],
    text: ["material3", "components"],
    buttons: ["buttons", "material3"],
    card: ["cards", "material3"],
    controls: ["switchCtl", "checkbox", "radio"],
    "selection-inputs": ["searchBar", "chips", "segmentedButton", "datePickers", "timePickers", "timePickerDialogs", "stateSaving", "accessibility"],
    "status-content": ["progressIndicators", "pullToRefresh", "carousel", "dividers", "materialLists", "lists", "stateHoisting", "accessibility"],
    textfields: ["textFields", "textFieldMigration", "autofill", "state"],
    "transient-surfaces": ["dialogs", "snackbars", "bottomSheets", "bottomSheetsPartial", "menus", "tooltips", "badges", "scaffold", "sideEffects"],
    "navigation-surfaces": ["appBars", "appBarNavigate", "appBarDynamic", "navigationBarComponent", "navigationRail", "navigationDrawer", "tabsComponent", "scaffold", "adaptiveStart", "adaptiveWindowSizeClasses"],
    "pointer-input-gestures": ["pointerInput", "gesturesUnderstand", "tapPress", "dragSwipeFling", "multiTouch", "nestedScroll", "scroll2d", "interactions"],
    "focus-keyboard-input": ["focusOverview", "focusTraversal", "focusBehavior", "focusReact", "keyboardActions", "keyboardShortcuts", "textFields"],
    nesting: ["mentalModel", "phases"],
    scaffold: ["material3", "components"],
    "edge-to-edge-insets": ["edgeToEdge", "windowInsets", "windowInsetsUi", "keyboardImeAnimations", "materialInsets", "insetsInterop"],
    "interop-migration": ["composeMigrationStrategy", "interopApis", "composeInViews", "viewsInCompose", "migrationOther", "recyclerMigration", "nestedScroll"],
    "navigation-compose": ["navigation", "navigationTypeSafety", "stateSaving"],
    "navigation3-state": ["navigation3Overview", "navigation3GetStarted", "navigation3Basics", "navigation3SaveState", "navigation3Metadata", "navigation3Scenes", "navigation3Migration", "navigation3Releases"],
    "adaptive-layouts": ["adaptiveStart", "adaptiveDisplay", "adaptiveListDetail"],
    "profile-row": ["layouts", "material3", "stateHoisting"],
    "state-saving": ["stateSaving", "state", "stateHoisting"],
    "effects-lifecycle": ["sideEffects", "lifecycle", "phases"],
    "stability-performance": ["stability", "stabilityFix", "performance", "phases"],
    "previews-tooling": ["previews", "composeTooling", "animationPreview", "toolingDebug", "compositionTracing", "composeLint"],
    "accessibility-testing": ["accessibility", "semantics", "accessibilityTesting"],
    "compose-ui-testing": ["composeTesting", "testingApis", "testingSemantics", "testingSync", "testingPatterns", "testingDebug", "testingV2", "testingCheatsheet"],
    "animation-motion": ["animationIntro", "animationChoose"],
  };
  const CATEGORY_REFS = {
    Foundations: ["mentalModel", "state", "stateHoisting", "modifiers"],
    Sizing: ["layouts", "constraints"],
    Spacing: ["modifiers", "constraints"],
    Containers: ["layouts", "modifiers", "customLayouts"],
    Distribution: ["layouts", "modifiers"],
    Decoration: ["modifiers", "graphicsOverview", "graphicsModifiers", "resourcesCompose", "imagesOverview", "imageLoading"],
    Scrolling: ["lists", "performance"],
    Theming: ["material3", "customDesignSystem", "compositionLocal"],
    Text: ["material3", "components"],
    Components: ["material3", "components", "pointerInput"],
    Composition: ["mentalModel", "phases"],
    "App structure": ["material3", "components", "navigation", "navigation3Overview", "adaptiveStart", "interopApis"],
    Recipes: ["layouts", "stateHoisting"],
    State: ["state", "stateHoisting", "composeArchitecture", "viewModelOverview", "stateSaving"],
    Runtime: ["sideEffects", "lifecycle", "phases"],
    Performance: ["stability", "performance", "phases"],
    Tooling: ["previews", "composeTooling", "toolingDebug", "composeLint"],
    Input: ["pointerInput", "interactions", "focusOverview", "keyboardActions"],
    "System UI": ["edgeToEdge", "windowInsets", "windowInsetsUi", "materialInsets"],
    Quality: ["accessibility", "semantics", "accessibilityTesting", "composeTesting", "testingApis", "testingSync"],
    Motion: ["animationIntro", "animationChoose"],
  };
  const COURSE_PATH = [
    ["Mental model", ["composables", "state-hoisting-udf", "modifiers", "modifier-order", "units"], "Learn the runtime contract before memorizing APIs."],
    ["Layout engine", ["sizing", "aspect-ratio", "padding", "spacing", "offset", "column", "row", "box", "custom-layouts", "constraint-layout", "visibility-tracking"], "Predict size, position, and space from constraints."],
    ["Distribution", ["arrangement", "alignment", "weight", "background-shape", "drawing-graphics", "images-resources", "scroll", "lazy-lists", "lazy-collections-scale"], "Control empty space, overflow, clipping, drawing, and lists."],
    ["Production UI", ["theming-design-system", "text", "buttons", "card", "controls", "selection-inputs", "status-content", "textfields", "transient-surfaces", "navigation-surfaces", "pointer-input-gestures", "focus-keyboard-input", "nesting", "scaffold", "edge-to-edge-insets", "interop-migration", "navigation-compose", "navigation3-state", "adaptive-layouts", "profile-row"], "Compose themed Material 3 components into app-ready screens."],
    ["Advanced practice", ["state-saving", "effects-lifecycle", "stability-performance", "previews-tooling", "accessibility-testing", "compose-ui-testing", "animation-motion"], "Ship screens that survive lifecycle changes, test well, perform, and move clearly."],
  ];
  const GLOSSARY = [
    ["Composition", "The tree-building phase where composable functions emit the UI description.", "composables"],
    ["Composable", "A @Composable function that emits UI for its inputs instead of returning a View.", "composables"],
    ["Recomposition", "Re-running only the invalidated composable scopes after observed state changes.", "composables"],
    ["Snapshot state", "Observable state read by Compose so changes can invalidate the right scopes.", "composables"],
    ["remember", "Stores an object across recompositions while the call remains in the composition.", "composables"],
    ["State hoisting", "Moving state to the caller and passing value down plus events up.", "state-hoisting-udf"],
    ["Unidirectional data flow", "A Compose architecture pattern where state flows down to UI and events flow back up to the owner.", "state-hoisting-udf"],
    ["State holder", "The composable, plain class, or ViewModel that owns UI state and exposes events to change it.", "state-hoisting-udf"],
    ["StateFlow", "A hot observable stream often exposed by a ViewModel and collected as Compose State at the route boundary.", "state-hoisting-udf"],
    ["collectAsStateWithLifecycle", "The Android lifecycle-aware way to convert Flow or StateFlow values into Compose State.", "state-hoisting-udf"],
    ["Modifier", "An ordered immutable chain that sizes, draws, clips, positions, and handles input.", "modifiers"],
    ["Constraint", "The min and max width/height a parent gives a child during measurement.", "sizing"],
    ["dp", "Density-independent pixels for layout and touch target sizes.", "units"],
    ["sp", "Scale-independent pixels for text; respects density and user font scale.", "units"],
    ["Alignment", "Cross-axis or Box placement of children inside available space.", "alignment"],
    ["Arrangement", "Main-axis distribution of children and empty space in Row or Column.", "arrangement"],
    ["Weight", "A RowScope or ColumnScope modifier that divides remaining main-axis space.", "weight"],
    ["Content slot", "A trailing composable lambda such as Button { Text(...) } or Card { ... }.", "nesting"],
    ["MeasurePolicy", "The custom Layout contract that measures children, chooses parent size, and places children.", "custom-layouts"],
    ["Measurable", "A child before measurement; it can be measured once with constraints to produce a Placeable.", "custom-layouts"],
    ["Placeable", "A measured child with width, height, alignment lines, and place/placeRelative functions.", "custom-layouts"],
    ["Intrinsic measurement", "A pre-measure query for the size a child needs under hypothetical constraints.", "custom-layouts"],
    ["AlignmentLine", "A layout-provided coordinate such as FirstBaseline that parents can read after measuring.", "custom-layouts"],
    ["ConstraintLayout", "A Compose layout from constraintlayout-compose that positions children relative to parent, siblings, guidelines, barriers, or chains.", "constraint-layout"],
    ["constrainAs", "The modifier that assigns a ConstraintLayout reference to a child and declares its links.", "constraint-layout"],
    ["ConstraintSet", "A decoupled set of constraints that can be swapped by configuration or animated while children use matching layoutId values.", "constraint-layout"],
    ["Guideline", "A virtual ConstraintLayout reference placed at a dp or percentage offset from a parent edge.", "constraint-layout"],
    ["Barrier", "A virtual ConstraintLayout line based on the most extreme edge of multiple referenced children.", "constraint-layout"],
    ["ChainStyle", "ConstraintLayout's distribution policy for a horizontal or vertical chain: Spread, SpreadInside, or Packed.", "constraint-layout"],
    ["onVisibilityChanged", "A layout modifier that reports when a node crosses a visible/not-visible threshold in the window or custom viewport.", "visibility-tracking"],
    ["minFractionVisible", "The fraction of a node that must be visible before onVisibilityChanged reports true; 1f requires full visibility.", "visibility-tracking"],
    ["minDurationMs", "The continuous visibility duration required before onVisibilityChanged reports true, useful for impressions and autoplay.", "visibility-tracking"],
    ["onLayoutRectChanged", "A lower-level layout callback that reports RelativeLayoutBounds after layout, with throttle and debounce controls.", "visibility-tracking"],
    ["RelativeLayoutBounds", "The root, window, and screen bounds for a layout node, plus helpers such as fractionVisibleInWindow and calculateOcclusions.", "visibility-tracking"],
    ["layoutBounds", "A modifier that writes a node's RelativeLayoutBounds into a LayoutBoundsHolder for custom viewport calculations.", "visibility-tracking"],
    ["DrawScope", "The scoped drawing context behind Canvas and draw modifiers; it exposes size, density, and draw functions.", "drawing-graphics"],
    ["Canvas", "A composable wrapper around drawBehind for custom drawing inside normal Compose layout.", "drawing-graphics"],
    ["drawWithContent", "A drawing modifier that lets you choose whether custom drawing happens before or after composable content.", "drawing-graphics"],
    ["drawWithCache", "A drawing modifier that caches expensive draw objects while size and read state remain unchanged.", "drawing-graphics"],
    ["graphicsLayer", "A draw layer for transforms, alpha, clipping, shadow, and compositing without changing measured size.", "drawing-graphics"],
    ["Brush", "A painting description for solid colors, gradients, and shaders used by backgrounds, text, and DrawScope calls.", "drawing-graphics"],
    ["stringResource", "Reads a localized string resource during composition so UI text follows locale and configuration changes.", "images-resources"],
    ["pluralStringResource", "Reads the correct pluralized resource for a count instead of hand-building English-only strings.", "images-resources"],
    ["painterResource", "Loads a vector or raster drawable resource as a Painter for Image, Icon, or paint modifiers.", "images-resources"],
    ["Image", "A leaf composable that draws a Painter, ImageBitmap, or ImageVector with contentScale and accessibility description.", "images-resources"],
    ["AsyncImage", "Coil's image composable for loading remote or data-backed images with caching, placeholders, and size-aware requests.", "images-resources"],
    ["ContentScale", "The policy that maps source image dimensions into the destination bounds, such as Fit, Crop, FillBounds, or Inside.", "images-resources"],
    ["ImageVector", "A scalable vector image representation, usually loaded from a vector drawable or built with vector APIs.", "images-resources"],
    ["ImageBitmap", "A bitmap image representation for raster pixels, useful when working directly with decoded image data.", "images-resources"],
    ["Painter", "The drawing abstraction behind Image and Icon; create it inside composition from stable inputs when possible.", "images-resources"],
    ["Lazy list", "A list container that composes and lays out only visible items.", "lazy-lists"],
    ["Lazy grid", "A lazy collection such as LazyVerticalGrid that virtualizes two-dimensional item layouts.", "lazy-collections-scale"],
    ["Staggered grid", "A lazy grid where items can have different heights or widths instead of sharing one fixed cell size.", "lazy-collections-scale"],
    ["contentType", "A lazy item hint that groups items with similar layouts so Compose can reuse compatible compositions.", "lazy-collections-scale"],
    ["LazyPagingItems", "The state-aware Paging Compose collection returned by collectAsLazyPagingItems for lazy layouts.", "lazy-collections-scale"],
    ["Pager", "A lazy page container built with HorizontalPager or VerticalPager and controlled by PagerState.", "lazy-collections-scale"],
    ["FlowRow", "A wrapping layout for small responsive groups such as chips where all children are composed eagerly.", "lazy-collections-scale"],
    ["Scaffold", "Material screen skeleton that coordinates bars, FABs, content, and insets.", "scaffold"],
    ["NavHost", "The Compose host that displays the current destination from a navigation graph.", "navigation-compose"],
    ["NavController", "The coordinator that navigates between destinations and manages the back stack.", "navigation-compose"],
    ["Route", "A unique destination identifier; with type-safe Navigation Compose it is a serializable object or class.", "navigation-compose"],
    ["Back stack", "The ordered destination history that powers back and up behavior.", "navigation-compose"],
    ["Navigation 3", "A Compose-first navigation library where the app owns snapshot-state back-stack keys and NavDisplay renders entries.", "navigation3-state"],
    ["NavKey", "A Navigation 3 key that identifies one destination entry and can be saved when it is serializable.", "navigation3-state"],
    ["NavDisplay", "The Navigation 3 UI composable that observes back-stack entries and displays the appropriate scene or destination content.", "navigation3-state"],
    ["NavEntry", "Navigation 3 content resolved from a key, optionally carrying metadata for animation, scenes, dialogs, or layout policy.", "navigation3-state"],
    ["entryProvider", "A Navigation 3 DSL that maps NavKey types to NavEntry content.", "navigation3-state"],
    ["Scene", "A Navigation 3 layout unit that can render one or more NavEntry instances, enabling adaptive and multi-pane navigation.", "navigation3-state"],
    ["Window size class", "A compact, medium, expanded, large, or extra-large classification of the app window used for layout decisions.", "adaptive-layouts"],
    ["Pane", "A content region in an adaptive layout; large windows can show multiple panes at once.", "adaptive-layouts"],
    ["List-detail", "An adaptive pattern that shows a list and selected detail together when space allows.", "adaptive-layouts"],
    ["Insets", "System UI, display cutout, and keyboard space that content must avoid or handle.", "scaffold"],
    ["Edge-to-edge", "Drawing app content behind transparent system bars while protecting critical content and gestures with insets.", "edge-to-edge-insets"],
    ["WindowInsets", "The Compose API describing status bars, navigation bars, caption bars, cutouts, IME, gestures, and safe content regions.", "edge-to-edge-insets"],
    ["safeDrawing", "A WindowInsets group for content that must not be visually obscured by system UI.", "edge-to-edge-insets"],
    ["imePadding", "A modifier that pads content by the software keyboard inset and participates in animated inset consumption.", "edge-to-edge-insets"],
    ["imeNestedScroll", "A modifier for scrolling containers that lets IME movement coordinate with nested scroll when the keyboard opens or closes.", "edge-to-edge-insets"],
    ["consumeWindowInsets", "A modifier that marks inset space as consumed so descendants or siblings do not apply the same inset twice.", "edge-to-edge-insets"],
    ["ComposeView", "A View host that lets existing View screens render composable content through setContent.", "interop-migration"],
    ["ViewCompositionStrategy", "The policy that decides when a ComposeView composition is disposed relative to its host View or lifecycle.", "interop-migration"],
    ["AndroidView", "A composable wrapper for embedding a traditional Android View inside Compose when no Compose equivalent exists.", "interop-migration"],
    ["AndroidViewBinding", "A Compose API for inflating a small legacy XML layout through generated View Binding inside Compose.", "interop-migration"],
    ["AndroidFragment", "A transitionary composable for hosting an existing Fragment inside Compose during incremental migration.", "interop-migration"],
    ["AbstractComposeView", "A custom View base class for exposing a reusable composable to View-based screens.", "interop-migration"],
    ["rememberNestedScrollInteropConnection", "A nested scroll bridge that lets Compose scroll containers cooperate with compatible parent Views.", "interop-migration"],
    ["MaterialTheme", "The Material 3 color, typography, and shape system exposed through composition.", "theming-design-system"],
    ["ColorScheme", "The Material 3 semantic color role set, including primary/onPrimary and surface/onSurface pairs.", "theming-design-system"],
    ["CompositionLocal", "A tree-scoped implicit value channel used for theme tokens and other broadly consumed local context.", "theming-design-system"],
    ["Design token", "A named semantic design value such as a color role, text style, shape, spacing, or elevation.", "theming-design-system"],
    ["Dynamic color", "Material You color schemes generated from user personalization on supported Android versions.", "theming-design-system"],
    ["Content padding", "Padding passed into scrolling content so items clear bars without clipping scroll.", "scaffold"],
    ["TextFieldState", "The state holder for state-based text fields; it owns text, selection, composition, and edit synchronization.", "textfields"],
    ["rememberTextFieldState", "A saveable helper that creates TextFieldState for composables and restores it through configuration and process recreation.", "textfields"],
    ["InputTransformation", "A text-field filter that edits proposed input before it is committed to TextFieldState.", "textfields"],
    ["OutputTransformation", "A display formatter that changes how text is rendered without changing the raw TextFieldState value.", "textfields"],
    ["SecureTextField", "A state-based Material text field optimized for password and secret entry with built-in obfuscation behavior.", "textfields"],
    ["Autofill ContentType", "A semantics hint such as Username, EmailAddress, Password, or NewPassword that lets credential providers fill the right field.", "textfields"],
    ["SearchBar", "A Material search surface that expands from a persistent query field into suggestions or results.", "selection-inputs"],
    ["SearchBarDefaults.InputField", "The input slot normally used inside SearchBar to wire query text, search action, expansion, leading icon, and trailing icon.", "selection-inputs"],
    ["AssistChip", "A chip for a contextual assistive action related to nearby content.", "selection-inputs"],
    ["FilterChip", "A selectable chip used to filter visible content, often in a group of mutually independent filters.", "selection-inputs"],
    ["InputChip", "A chip that represents user-provided input such as a person, tag, or token and can be removed.", "selection-inputs"],
    ["SuggestionChip", "A chip that offers a lightweight suggested action or query refinement.", "selection-inputs"],
    ["SingleChoiceSegmentedButtonRow", "A compact Material row for choosing one option from a small side-by-side set.", "selection-inputs"],
    ["DatePickerState", "The state holder for Material date pickers, including selectedDateMillis and displayed month.", "selection-inputs"],
    ["TimePickerState", "The state holder for Material TimePicker and TimeInput, including selected hour and minute.", "selection-inputs"],
    ["CircularProgressIndicator", "A Material progress indicator that can be indeterminate or show normalized progress in a circular stroke.", "status-content"],
    ["LinearProgressIndicator", "A Material progress bar that can be indeterminate or show normalized progress from 0f to 1f.", "status-content"],
    ["PullToRefreshBox", "An experimental Material container that wraps scrollable content and calls onRefresh when the user pulls from the top.", "status-content"],
    ["rememberPullToRefreshState", "The Material pull-to-refresh state holder needed when a custom indicator must coordinate with PullToRefreshBox.", "status-content"],
    ["ListItem", "A Material row template with headline, supporting, overline, leading, and trailing slots for scannable list content.", "status-content"],
    ["HorizontalDivider", "A Material divider that separates vertical content such as list rows in a Column.", "status-content"],
    ["VerticalDivider", "A Material divider that separates horizontal content in a Row and usually needs a bounded height.", "status-content"],
    ["HorizontalMultiBrowseCarousel", "A Material carousel that uses preferredItemWidth to show multiple related visual items when space allows.", "status-content"],
    ["HorizontalUncontainedCarousel", "A Material carousel that uses fixed itemWidth and lets equal-size items flow past the container edge.", "status-content"],
    ["CarouselState", "The Material carousel state created with rememberCarouselState { itemCount } to track item position and count.", "status-content"],
    ["AlertDialog", "A Material dialog with title, text, icon, confirm, dismiss, and onDismissRequest slots for interruptive decisions.", "transient-surfaces"],
    ["Dialog", "A low-level modal window that supplies no Material styling; you provide a Card or other container inside it.", "transient-surfaces"],
    ["SnackbarHostState", "The state holder whose suspending showSnackbar call queues transient messages for a SnackbarHost.", "transient-surfaces"],
    ["ModalBottomSheet", "A modal sheet composable for supplemental or task-focused content that slides from the bottom edge.", "transient-surfaces"],
    ["SheetState", "The state object used to show, hide, expand, and partially expand a modal bottom sheet.", "transient-surfaces"],
    ["DropdownMenu", "A temporary anchored surface controlled by expanded and onDismissRequest and filled with DropdownMenuItem actions.", "transient-surfaces"],
    ["TooltipBox", "The anchor container that shows PlainTooltip or RichTooltip on hover, focus, or long press.", "transient-surfaces"],
    ["BadgedBox", "A container that overlays a Badge on another composable such as an icon or navigation item.", "transient-surfaces"],
    ["TopAppBar", "A Material top app bar slot for title, navigation icon, actions, and optional scroll behavior inside Scaffold.", "navigation-surfaces"],
    ["TopAppBarScrollBehavior", "A Material behavior that pins, enters, or collapses a top app bar in response to nested scroll.", "navigation-surfaces"],
    ["NavigationBar", "A bottom Material destination switcher for three to five top-level destinations on compact windows.", "navigation-surfaces"],
    ["NavigationRail", "A vertical Material destination switcher for top-level destinations on medium and expanded windows.", "navigation-surfaces"],
    ["ModalNavigationDrawer", "A drawer container that slides over content and hosts a ModalDrawerSheet with NavigationDrawerItem rows.", "navigation-surfaces"],
    ["NavigationDrawerItem", "A selectable Material drawer row with icon, label, optional badge, and selected state.", "navigation-surfaces"],
    ["PrimaryTabRow", "A Material tab row for switching related content groups below an app bar.", "navigation-surfaces"],
    ["pointerInput", "A modifier for custom gesture handlers; its coroutine restarts when any pointerInput key changes.", "pointer-input-gestures"],
    ["InteractionSource", "A stream of high-level interactions such as press, drag, focus, hover, and release.", "pointer-input-gestures"],
    ["Touch slop", "The motion threshold that separates an intentional drag from small accidental pointer movement.", "pointer-input-gestures"],
    ["Nested scroll", "A protocol that lets scrollable parents and children share pre-scroll, node-consumed, and post-scroll deltas.", "pointer-input-gestures"],
    ["scrollable2D", "A low-level modifier for pointer-driven movement across both x and y axes.", "pointer-input-gestures"],
    ["FocusRequester", "An object used to move focus to a specific focus target from an event or effect after composition.", "focus-keyboard-input"],
    ["focusGroup", "A modifier that keeps traversal inside a logical group before focus leaves that group.", "focus-keyboard-input"],
    ["focusProperties", "A modifier for overriding focus traversal, enter, exit, or focusability rules on a node.", "focus-keyboard-input"],
    ["onFocusChanged", "A modifier callback for reacting when a node gains, loses, captures, or contains focus.", "focus-keyboard-input"],
    ["onKeyEvent", "A modifier callback for handling hardware key events on the focused node and returning true when consumed.", "focus-keyboard-input"],
    ["IME action", "The software keyboard action such as Next, Search, Done, or Send configured through KeyboardOptions and handled through KeyboardActions.", "focus-keyboard-input"],
    ["Keyboard Shortcuts Helper", "The Android system overlay that shows discoverable app shortcuts provided by an activity.", "focus-keyboard-input"],
    ["rememberSaveable", "Saves small UI element state through Android saved instance state.", "state-saving"],
    ["ViewModel", "A screen-level state holder for UI state and business logic across configuration changes.", "state-saving"],
    ["LaunchedEffect", "Runs a coroutine after composition and restarts it when its keys change.", "effects-lifecycle"],
    ["DisposableEffect", "Registers side effects that need cleanup when keys change or composition leaves.", "effects-lifecycle"],
    ["Skippability", "Compose's ability to avoid re-running a composable whose stable inputs did not change.", "stability-performance"],
    ["@Preview", "An Android Studio annotation that renders a composable in the design surface without launching the full app.", "previews-tooling"],
    ["Multipreview", "A preview annotation strategy that renders one composable across common sizes, font scales, themes, or custom scenarios.", "previews-tooling"],
    ["PreviewParameterProvider", "A provider that feeds sample data variants into one preview function so Android Studio renders multiple states.", "previews-tooling"],
    ["Layout Inspector", "An Android Studio tool for inspecting a running Compose hierarchy, semantics, recomposition counts, and skipped compositions.", "previews-tooling"],
    ["Compose UI Check", "A Compose Preview mode that audits accessibility and adaptive issues across display sizes and orientations.", "previews-tooling"],
    ["Semantics tree", "The accessibility and testing representation of what UI elements mean and can do.", "accessibility-testing"],
    ["ComposeTestRule", "The JUnit rule that hosts Compose content, finds semantic nodes, performs actions, and synchronizes assertions.", "compose-ui-testing"],
    ["SemanticsMatcher", "A matcher that finds Compose test nodes by semantic properties such as text, role, state, or test tag.", "compose-ui-testing"],
    ["MainTestClock", "The virtual clock Compose UI tests use to advance recomposition, animations, and gestures deterministically.", "compose-ui-testing"],
    ["Test tag", "A semantic property for stable test lookup when visible text or content descriptions are not the right selector.", "compose-ui-testing"],
    ["AnimatedVisibility", "A composable for animating content entering and leaving the hierarchy.", "animation-motion"],
  ];
  const DECISION_GUIDES = [
    {
      area: "Foundation",
      question: "A value changed, but the UI did not update or updated too often.",
      use: "Keep the value in observable state, read it from composition, and pass value down plus events up.",
      avoid: "Do not hide mutable fields inside composables and expect Compose to know when they change.",
      section: "composables",
    },
    {
      area: "State",
      question: "Several composables need the same value, a ViewModel exposes StateFlow, or a component must be previewable.",
      use: "Choose one state owner, expose immutable state plus events, and collect Flow as Compose State at the route boundary.",
      avoid: "Do not pass ViewModels through reusable UI or keep duplicate local and screen-level sources of truth.",
      section: "state-hoisting-udf",
    },
    {
      area: "Layout",
      question: "Padding, background, clipping, or clickable area looks different than expected.",
      use: "Read the modifier chain in order; every modifier wraps the result of the modifiers before it.",
      avoid: "Do not reorder modifiers just for style without checking what size, draw, and input area changed.",
      section: "modifier-order",
    },
    {
      area: "Layout",
      question: "A child should fill, wrap, or use a specific fraction of the available width.",
      use: "Start from constraints, then choose fillMaxWidth, size, requiredSize, wrapContent, or fillMaxWidth(fraction).",
      avoid: "Do not treat size modifiers as absolute when the parent still controls the child constraints.",
      section: "sizing",
    },
    {
      area: "Layout",
      question: "A Row or Column needs children spaced evenly across leftover room.",
      use: "Use Arrangement for main-axis empty space and Alignment for cross-axis placement.",
      avoid: "Do not stack Spacers everywhere when a single arrangement rule expresses the layout contract.",
      section: "arrangement",
    },
    {
      area: "Layout internals",
      question: "Built-in Row, Column, Box, Lazy, and Flow layouts cannot express a measurement or placement rule.",
      use: "Write a custom Layout or layout modifier with one measure per child, explicit parent size, placement, and intrinsics/alignment lines only when needed.",
      avoid: "Do not measure the same child repeatedly or create a custom layout for behavior a built-in container already handles.",
      section: "custom-layouts",
    },
    {
      area: "Layout internals",
      question: "A legacy constraint-based layout, sibling-relative positioning, guideline, barrier, chain, or swappable constraint set is the clearest model.",
      use: "Use ConstraintLayout with createRefs/constrainAs for local constraints or ConstraintSet plus layoutId when constraints must be decoupled, swapped, or animated.",
      avoid: "Do not reach for ConstraintLayout only to flatten hierarchy; Compose handles nested Row, Column, and Box efficiently.",
      section: "constraint-layout",
    },
    {
      area: "Runtime",
      question: "A feed item, card, or video should log impressions, load data, or pause/resume only when actually visible.",
      use: "Use onVisibilityChanged with deliberate minFractionVisible and minDurationMs thresholds; drop to onLayoutRectChanged only when raw bounds, occlusion, or throttled geometry is required.",
      avoid: "Do not run visibility work from composition, deprecated onFirstVisible, or unthrottled per-frame geometry callbacks.",
      section: "visibility-tracking",
    },
    {
      area: "Graphics",
      question: "The UI needs custom drawing, a gradient, a mask, a chart, a transform, or draw-order control.",
      use: "Choose the smallest draw tool: background/Brush, drawBehind, drawWithContent, drawWithCache, Canvas, or graphicsLayer based on the visual contract.",
      avoid: "Do not trigger recomposition for draw-only changes or use graphicsLayer expecting it to change layout size.",
      section: "drawing-graphics",
    },
    {
      area: "Resources",
      question: "UI needs localized text, plurals, dimensions, icons, vector assets, raster images, remote images, or image accessibility.",
      use: "Read localized/static assets with resource APIs, choose Image/Icon/AsyncImage by source, set meaningful content descriptions, bound image size, and use ContentScale deliberately.",
      avoid: "Do not hard-code user-facing text, hide meaningful images with null descriptions, pass unstable Painter objects through APIs, or let remote images load unconstrained full-size bitmaps.",
      section: "images-resources",
    },
    {
      area: "Scrolling",
      question: "A collection needs grids, adaptive columns, masonry-like cards, paging, item animation, scroll analytics, or page-by-page swiping.",
      use: "Choose LazyVerticalGrid, LazyVerticalStaggeredGrid, Paging Compose, snapshotFlow, or HorizontalPager based on collection shape, identity, and loading model.",
      avoid: "Do not fake large adaptive collections with eager FlowRow/Column loops, missing keys, missing load states, or pager state created outside rememberPagerState.",
      section: "lazy-collections-scale",
    },
    {
      area: "Theming",
      question: "The app needs brand colors, dark theme, typography, shapes, dynamic color, or product-specific design tokens.",
      use: "Put color, type, shape, and extra semantic tokens in MaterialTheme or a small theme wrapper backed by CompositionLocal.",
      avoid: "Do not hard-code component colors or use CompositionLocal to hide ordinary screen state and dependencies.",
      section: "theming-design-system",
    },
    {
      area: "Layout",
      question: "Some Row or Column children should divide the remaining space.",
      use: "Apply weight to the children that should consume remaining main-axis space.",
      avoid: "Do not mix weighted and fixed children without deciding which content is allowed to shrink.",
      section: "weight",
    },
    {
      area: "Components",
      question: "A screen needs top bars, bottom bars, a FAB, and content that avoids system bars.",
      use: "Use Scaffold and apply its innerPadding to the real screen content.",
      avoid: "Do not ignore insets; hidden content under bars is usually a layout bug, not a device quirk.",
      section: "scaffold",
    },
    {
      area: "Components",
      question: "A flow needs search, filters, tag-like input, a compact option set, or date/time selection.",
      use: "Use SearchBar for primary search, chips for contextual actions and filters, segmented buttons for two to five compact choices, and DatePicker or TimePicker state inside an explicit confirm/dismiss flow.",
      avoid: "Do not fake these controls with plain Rows and Boxes that lack selected state, dismiss behavior, keyboard actions, or accessible labels.",
      section: "selection-inputs",
    },
    {
      area: "Components",
      question: "A screen needs loading feedback, pull-to-refresh, scannable list rows, separators, or a visual browse strip.",
      use: "Use progress indicators for operation status, PullToRefreshBox for top-of-list refresh, ListItem plus dividers for scannable rows, and Material carousels for related visual collections.",
      avoid: "Do not show unbounded percent values, custom refresh gestures without state, ad hoc row templates, decorative dividers as data items, or carousels without stable item sizing.",
      section: "status-content",
    },
    {
      area: "Components",
      question: "A flow needs confirmation, undo, overflow actions, contextual help, status counts, or supplemental content without navigating away.",
      use: "Choose the least interruptive temporary surface: Badge, Tooltip, Menu, Snackbar, BottomSheet, or Dialog based on urgency, anchoring, and required user decision.",
      avoid: "Do not use dialogs for passive status, show snackbars from composition, leave menus open after item clicks, or keep hidden sheets in composition after hide completes.",
      section: "transient-surfaces",
    },
    {
      area: "Components",
      question: "A screen needs top-level destination switching, app actions, a drawer, a rail, or tabs.",
      use: "Pick the Material navigation surface by hierarchy and window size: app bar for screen actions, NavigationBar for compact top-level destinations, NavigationRail for larger windows, NavigationDrawer for broad IA, and TabRow for peer content inside one destination.",
      avoid: "Do not mix multiple competing top-level nav controls on the same compact screen or hide destination state inside each item.",
      section: "navigation-surfaces",
    },
    {
      area: "System UI",
      question: "A screen targets Android 15+, draws behind system bars, has forms near the keyboard, or mixes Material bars with custom edge-to-edge content.",
      use: "Enable edge-to-edge at the Activity, use Scaffold innerPadding or the right WindowInsets modifier, consume insets once, and test status bars, navigation bars, cutouts, caption bars, gestures, and IME animation.",
      avoid: "Do not add random padding constants, stack multiple inset handlers on the same edge, or rely on pre-Android-15 non-edge-to-edge defaults.",
      section: "edge-to-edge-insets",
    },
    {
      area: "Migration",
      question: "An existing View or Fragment screen must host Compose, Compose must host a legacy View, or a team is migrating one feature at a time.",
      use: "Use ComposeView with the right ViewCompositionStrategy, AndroidView only for missing View components, AndroidView onReset in lazy layouts, and explicit state ownership across the boundary.",
      avoid: "Do not recreate Views outside AndroidView factory, leave Fragment ComposeView disposal to chance, or hide legacy View state as the source of truth.",
      section: "interop-migration",
    },
    {
      area: "App structure",
      question: "A screen should open another screen, receive arguments, or support back/up behavior.",
      use: "Model destinations as a navigation graph, navigate through NavController events, and prefer type-safe routes for arguments.",
      avoid: "Do not store NavController in leaf components or pass fragile route strings through the UI tree.",
      section: "navigation-compose",
    },
    {
      area: "App structure",
      question: "A Compose-first app needs explicit navigation state, saveable back stacks, adaptive scenes, or a migration path away from NavController graphs.",
      use: "Use Navigation 3: model destinations as serializable NavKey values, own the back stack, resolve keys with entryProvider, and render with NavDisplay.",
      avoid: "Do not mix NavController mutation with Navigation 3 state or use unsaveable keys when the back stack must survive process death.",
      section: "navigation3-state",
    },
    {
      area: "Adaptive",
      question: "The same feature must work on phones, tablets, foldables, desktop windows, and split screen.",
      use: "Base the top-level layout on the current app window size class, then pass simple pane/configuration state down.",
      avoid: "Do not branch from physical screen size or let leaf components query global window state independently.",
      section: "adaptive-layouts",
    },
    {
      area: "Components",
      question: "The user edits text and the field must stay in sync with app state.",
      use: "Prefer state-based TextField APIs: TextFieldState for text/selection, InputTransformation for filters, OutputTransformation for formatting, and SecureTextField for secrets.",
      avoid: "Do not put filtering, formatting, passwords, or selection math into value/onValueChange loops unless you are intentionally maintaining legacy value-based code.",
      section: "textfields",
    },
    {
      area: "Input",
      question: "A surface needs tap, long-press, drag, transform, or custom pointer behavior.",
      use: "Start with semantic components and high-level gesture modifiers, then drop to pointerInput only for custom gestures.",
      avoid: "Do not replace clickable, selectable, draggable, scrollable, or transformable with raw pointer code unless you also rebuild semantics, keyboard, hover, focus, and consumption behavior.",
      section: "pointer-input-gestures",
    },
    {
      area: "Input",
      question: "A screen must support keyboard, D-pad, Tab traversal, IME actions, or discoverable shortcuts.",
      use: "Define focus order, grouped traversal, visible focus cues, IME actions, and shortcut discoverability before adding raw key handlers.",
      avoid: "Do not attach key handlers to unreachable nodes, request focus from the composable body, or ship hidden shortcuts without a focus and accessibility path.",
      section: "focus-keyboard-input",
    },
    {
      area: "State",
      question: "Small UI element state must survive rotation or process recreation.",
      use: "Use rememberSaveable for small Bundle-friendly UI element state; use a ViewModel and saved state APIs for screen state.",
      avoid: "Do not put large lists, domain models, or derived screen data directly into saved instance state.",
      section: "state-saving",
    },
    {
      area: "Runtime",
      question: "A composable needs to launch work, collect a callback, or clean up a listener.",
      use: "Choose the side-effect API whose lifecycle matches the job: LaunchedEffect, rememberCoroutineScope, rememberUpdatedState, DisposableEffect, or produceState.",
      avoid: "Do not start coroutines, register observers, or write external state directly from the composable body.",
      section: "effects-lifecycle",
    },
    {
      area: "Performance",
      question: "The screen janks, recomposes too much, or skips less often than expected.",
      use: "Check stability, defer state reads when useful, keep lazy item keys stable, and avoid unnecessary work during composition.",
      avoid: "Do not assume recomposition itself is the bug before measuring what is invalidating and what is expensive.",
      section: "stability-performance",
    },
    {
      area: "Tooling",
      question: "A UI needs fast review across states, themes, font scales, devices, animations, or recomposition behavior.",
      use: "Create stateless themed previews, use multipreview and PreviewParameterProvider for variation, then inspect runtime issues with UI Check, Layout Inspector, Animation Preview, tracing, and lint.",
      avoid: "Do not preview ViewModel or network-backed route composables directly, and do not treat a single happy-path preview as proof that the UI works.",
      section: "previews-tooling",
    },
    {
      area: "Scrolling",
      question: "The UI renders a long or unknown number of items.",
      use: "Use LazyColumn, LazyRow, lazy grids, or paged lazy content with stable item keys.",
      avoid: "Do not compose every item in a Column with verticalScroll when the data set can grow.",
      section: "lazy-lists",
    },
    {
      area: "Quality",
      question: "A screen must work with TalkBack and be easy to test.",
      use: "Expose meaning through semantics, content descriptions, roles, state descriptions, and focused tests.",
      avoid: "Do not rely on visual text alone when an icon, merged row, custom control, or progress state needs semantic meaning.",
      section: "accessibility-testing",
    },
    {
      area: "Testing",
      question: "A Compose screen needs reliable UI tests for behavior, state, animation, or asynchronous updates.",
      use: "Host the smallest useful surface with ComposeTestRule, find nodes through semantics, perform user actions, and let the rule synchronize or control mainClock explicitly.",
      avoid: "Do not assert implementation layout details, sleep for timing, or depend on fragile selector text when a semantic matcher or test tag expresses the contract.",
      section: "compose-ui-testing",
    },
    {
      area: "Motion",
      question: "Content should appear, disappear, move, resize, or animate between states.",
      use: "Pick the smallest animation API that matches the state change, such as animate*AsState, AnimatedVisibility, AnimatedContent, or updateTransition.",
      avoid: "Do not animate layout-critical changes without checking readability, accessibility, and interrupted states.",
      section: "animation-motion",
    },
  ];

  // ----- tiny DOM + util -----
  function h(tag, cls, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function escapeRegExp(s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
  function hasRole(pg, role) { return pg.controls.some(function (c) { return c.role === role; }); }
  function num(v, d) { const n = parseFloat(v); return isFinite(n) ? n : d; }
  function stripHtml(html) { return String(html || "").replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim(); }
  function sectionText(s) {
    return [
      s.title, s.category, s.summary, stripHtml(s.explanation_html), (s.key_points || []).join(" "),
      stripHtml(s.gotchas_html), s.canonical_code
    ].join(" ");
  }
  function wordCount(s) { const words = sectionText(s).trim().split(/\s+/).filter(Boolean); return words.length; }
  function readMinutes(s) { return Math.max(1, Math.round(wordCount(s) / 220)); }
  function copyText(text, button, resetLabel) {
    const original = resetLabel || button.textContent;
    function done(ok) {
      button.textContent = ok ? "Copied!" : "Copy unavailable";
      setTimeout(function () { button.textContent = original; }, 1400);
    }
    function fallback() {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.left = "-999px";
      area.style.top = "0";
      document.body.appendChild(area);
      area.focus();
      area.select();
      let ok = false;
      try { ok = document.execCommand && document.execCommand("copy"); } catch (e) { ok = false; }
      document.body.removeChild(area);
      done(ok);
    }
    if (!navigator.clipboard || !navigator.clipboard.writeText) {
      fallback();
      return;
    }
    try {
      navigator.clipboard.writeText(text).then(function () {
        done(true);
      }, function () {
        fallback();
      });
    } catch (e) {
      fallback();
    }
  }
  function uniqueRefs(keys) {
    const seen = {};
    return keys.filter(function (k) { if (!DOCS[k] || seen[k]) return false; seen[k] = true; return true; })
      .map(function (k) { return { title: DOCS[k][0], url: DOCS[k][1] }; });
  }
  function refKeysFor(s) {
    const seen = {};
    return (SECTION_REFS[s.id] || CATEGORY_REFS[s.category] || []).filter(function (k) {
      if (!DOCS[k] || seen[k]) return false;
      seen[k] = true;
      return true;
    });
  }
  function refsFor(s) { return uniqueRefs(refKeysFor(s).slice(0, 8)); }
  function readProgress() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const ids = JSON.parse(raw || "[]");
      return new Set(Array.isArray(ids) ? ids : []);
    } catch (e) {
      return new Set();
    }
  }
  function writeProgress(done) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(done))); } catch (e) { /* ignore private-mode failures */ }
  }
  function readJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }
  function writeJson(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* ignore private-mode failures */ }
  }

  // ----- Kotlin highlighter (single pass, no span corruption) -----
  function kt(code) {
    const re = /(\/\/[^\n]*)|("(?:[^"\\]|\\.)*")|(@\w+)|\b(val|var|fun|by|return|if|else|true|false|this|in|is|as|object|class|import|package)\b|(\b\d+(?:\.\d+)?f?)(\.dp|\.sp)?|\b([A-Z][A-Za-z0-9_]*)\b|\b([a-z][A-Za-z0-9_]*)(?=\s*\()/g;
    let out = "", last = 0, m;
    while ((m = re.exec(code))) {
      out += esc(code.slice(last, m.index));
      if (m[1]) out += '<span class="tok-com">' + esc(m[1]) + "</span>";
      else if (m[2]) out += '<span class="tok-str">' + esc(m[2]) + "</span>";
      else if (m[3]) out += '<span class="tok-ann">' + esc(m[3]) + "</span>";
      else if (m[4]) out += '<span class="tok-kw">' + esc(m[4]) + "</span>";
      else if (m[5] !== undefined) { out += '<span class="tok-num">' + esc(m[5]) + "</span>"; if (m[6]) out += '<span class="tok-prop">' + esc(m[6]) + "</span>"; }
      else if (m[7]) out += '<span class="tok-type">' + esc(m[7]) + "</span>";
      else if (m[8]) out += '<span class="tok-fn">' + esc(m[8]) + "</span>";
      last = re.lastIndex;
    }
    out += esc(code.slice(last));
    return out;
  }

  // ----- control state defaults -----
  function defaults(pg) {
    const v = {};
    pg.controls.forEach(function (c) {
      if (c.role === "weightPerChild") { const n = pg.childCount || 3; for (let i = 0; i < n; i++) v["weight" + i] = "1"; return; }
      if (TOGGLES.indexOf(c.role) >= 0) { v[c.role] = c.default != null ? String(c.default) : "false"; return; }
      if (SELECT_OPTS[c.role]) { v[c.role] = c.default != null ? String(c.default) : SELECT_OPTS[c.role][0]; return; }
      const s = SLIDER[c.role] || [0, 100, 1, 0];
      v[c.role] = c.default != null ? String(c.default) : String(s[3]);
    });
    if (hasRole(pg, "childCount") == false && hasRole(pg, "itemCount") == false) v.childCount = String(pg.childCount || 3);
    return v;
  }

  // ----- padding helpers -----
  function padCss(v, sides) {
    if (v.paddingStart != null || v.paddingTop != null || v.paddingEnd != null || v.paddingBottom != null) {
      return num(v.paddingTop, 0) + "px " + num(v.paddingEnd, 0) + "px " + num(v.paddingBottom, 0) + "px " + num(v.paddingStart, 0) + "px";
    }
    if (v.paddingHorizontal != null || v.paddingVertical != null) return num(v.paddingVertical, 0) + "px " + num(v.paddingHorizontal, 0) + "px";
    if (v.padding != null) return num(v.padding, 0) + "px";
    return null;
  }
  function padKotlin(v) {
    if (v.paddingStart != null || v.paddingTop != null || v.paddingEnd != null || v.paddingBottom != null)
      return "padding(start = " + num(v.paddingStart, 0) + ".dp, top = " + num(v.paddingTop, 0) + ".dp, end = " + num(v.paddingEnd, 0) + ".dp, bottom = " + num(v.paddingBottom, 0) + ".dp)";
    if (v.paddingHorizontal != null || v.paddingVertical != null)
      return "padding(horizontal = " + num(v.paddingHorizontal, 0) + ".dp, vertical = " + num(v.paddingVertical, 0) + ".dp)";
    if (v.padding != null) return "padding(" + num(v.padding, 0) + ".dp)";
    return null;
  }
  function spacedAlign(arr, isCol) {
    if (isCol) return arr === "Center" ? "CenterVertically" : arr; // Top / Bottom / CenterVertically
    return arr === "Center" ? "CenterHorizontally" : arr; // Start / End / CenterHorizontally
  }

  // ======================= PREVIEW =======================
  function applyPreview(pg, v, stage) {
    stage.className = "stage"; stage.removeAttribute("style"); stage.innerHTML = "";
    let c = pg.container;
    if (COMPONENT_PV[c]) { stage.classList.add("stage-comp"); COMPONENT_PV[c](pg, v, stage); return; }
    if (c === "Box" && !hasRole(pg, "boxContentAlignment")) c = "single"; // a Box styled by size/offset/corner roles is really a single box
    const n = Math.round(num(v.childCount, num(v.itemCount, pg.childCount || 3)));
    const pad = padCss(v);

    if (c === "Column" || c === "Row") {
      const isCol = c === "Column";
      stage.style.display = "flex"; stage.style.flexDirection = isCol ? "column" : "row";
      const arr = v[isCol ? "verticalArrangement" : "horizontalArrangement"];
      const cross = v[isCol ? "horizontalAlignment" : "verticalAlignment"];
      if (arr) stage.style.justifyContent = JUSTIFY[arr] || "flex-start";
      if (cross) stage.style.alignItems = ALIGN[cross] || "flex-start";
      const gap = num(v.gap, 0), isSpace = ["SpaceBetween", "SpaceAround", "SpaceEvenly"].indexOf(arr) >= 0;
      stage.style.gap = (gap && !isSpace) ? gap + "px" : "0px";
      if (pad) stage.style.padding = pad;
      if (v.height != null) { stage.style.flex = "none"; stage.style.height = num(v.height, 200) + "px"; }
      if (v.scroll === "true") stage.classList.add("scrollable");
      const weighted = hasRole(pg, "weightPerChild");
      for (let i = 0; i < n; i++) {
        const chip = h("div", "chip c" + (i % 5));
        if (weighted) {
          const w = num(v["weight" + i], 0);
          if (w > 0) { chip.style.flexGrow = w; chip.style.flexBasis = "0"; } else { chip.style.flexGrow = "0"; }
          chip.innerHTML = '<span class="inner">' + (w > 0 ? "weight " + w : "intrinsic") + "</span>";
          if (isCol) chip.style.height = "44px"; else chip.style.height = "64px";
          if (!isCol && w === 0) chip.style.width = "52px";
        } else {
          chip.textContent = (pg.childLabels && pg.childLabels[i]) || String.fromCharCode(65 + i);
          if (isCol) { chip.style.padding = "7px 16px"; chip.style.minHeight = "20px"; }
          else { chip.style.width = num(v.childSize, 46) + "px"; chip.style.height = num(v.childSize, 60) + "px"; }
        }
        stage.appendChild(chip);
      }
    } else if (c === "Box") {
      stage.style.display = "grid";
      stage.style.placeItems = PLACE[v.boxContentAlignment || "Center"] || "center center";
      if (pad) stage.style.padding = pad;
      if (v.size != null) { stage.style.flex = "none"; stage.style.width = num(v.size, 200) + "px"; stage.style.height = num(v.size, 200) + "px"; stage.style.margin = "auto"; }
      if (v.background) stage.style.background = "var(--" + (COLORVAR[v.background] || "indigo") + ")";
      const cs = v.childSize != null ? num(v.childSize, 48) : null;
      const sz = [[120, 76], [88, 56], [58, 38], [40, 28]];
      for (let i = 0; i < Math.min(n, 4); i++) {
        const chip = h("div", "chip c" + ((i + (v.background ? 1 : 0)) % 5));
        chip.style.gridArea = "1 / 1";
        chip.style.width = (cs != null ? cs : sz[i][0]) + "px";
        chip.style.height = (cs != null ? cs : sz[i][1]) + "px";
        chip.textContent = (pg.childLabels && pg.childLabels[i]) || String.fromCharCode(65 + i);
        stage.appendChild(chip);
      }
    } else if (c === "Text") {
      stage.style.display = "flex"; stage.style.alignItems = "center"; stage.style.padding = "16px";
      const t = h("div", "txtchip");
      t.textContent = "Jetpack Compose makes building native Android UI delightful, declarative, and fast.";
      if (v.fontSize) t.style.fontSize = num(v.fontSize, 18) + "px";
      if (v.fontWeight) t.style.fontWeight = WEIGHT[v.fontWeight] || 400;
      if (v.textAlign) { t.style.textAlign = TEXTALIGN[v.textAlign] || "left"; t.style.width = "100%"; }
      if (v.maxLines) { t.style.display = "-webkit-box"; t.style.webkitLineClamp = String(num(v.maxLines, 2)); t.style.webkitBoxOrient = "vertical"; t.style.overflow = "hidden"; }
      stage.appendChild(t);
    } else { // single
      stage.style.display = "grid"; stage.style.placeItems = "center"; stage.style.padding = "18px";
      const chip = h("div", "chip c0");
      let w = num(v.width, num(v.size, num(v.childSize, 130))), ht = num(v.height, num(v.size, num(v.childSize, 84)));
      chip.style.width = w + "px"; chip.style.height = ht + "px";
      if (v.fillMaxWidth === "true") chip.style.width = "100%";
      if (v.fillMaxHeight === "true") chip.style.height = "100%";
      if (v.fillFraction != null) chip.style.width = (num(v.fillFraction, 1) * 100) + "%";
      if (v.aspectRatio != null) { chip.style.height = "auto"; chip.style.aspectRatio = String(num(v.aspectRatio, 1)); }
      if (v.background) chip.style.background = "var(--" + (COLORVAR[v.background] || "coral") + ")";
      if (v.cornerRadius != null) chip.style.borderRadius = num(v.cornerRadius, 0) + "px";
      if (v.borderWidth != null && num(v.borderWidth, 0) > 0) chip.style.boxShadow = "inset 0 0 0 " + num(v.borderWidth, 0) + "px rgba(0,0,0,.6)";
      if (v.clip === "true") chip.style.overflow = "hidden";
      if (v.offsetX != null || v.offsetY != null) chip.style.transform = "translate(" + num(v.offsetX, 0) + "px," + num(v.offsetY, 0) + "px)";
      const inner = h("div", "inner", "content");
      if (v.fontSize != null) { inner.style.fontSize = num(v.fontSize, 16) + "px"; inner.textContent = num(v.fontSize, 16) + " sp"; }
      if (hasRole(pg, "orderSwap")) {
        if (v.orderSwap === "true") { // padding THEN background: outer transparent, inner colored
          chip.style.background = "transparent"; chip.style.boxShadow = "none"; chip.style.padding = pad || "16px";
          inner.style.cssText = "background:var(--indigo);color:#fff;width:100%;height:100%;display:grid;place-items:center;border-radius:6px";
        } else { // background THEN padding: colored fills, content inset
          chip.style.background = "var(--indigo)"; chip.style.padding = pad || "16px"; inner.textContent = "content";
        }
      } else if (pad) { chip.style.padding = pad; }
      if (hasRole(pg, "clip") && v.clip === "true" && v.cornerRadius) { const bleed = h("div", "", ""); }
      chip.appendChild(inner);
      stage.appendChild(chip);
    }
  }

  // ======================= KOTLIN CODE GEN =======================
  function genKotlin(pg, v) {
    const c = pg.container;
    if (COMPONENT_GEN[c]) return COMPONENT_GEN[c](pg, v);
    if (c === "Text") return genText(v);
    if (c === "single") return genSingle(pg, v);
    if (c === "Box") return hasRole(pg, "boxContentAlignment") ? genBox(pg, v) : genSingle(pg, v);
    return genColRow(pg, v);
  }
  function childColor(i) { return COLORK[i % COLORK.length]; }

  function genColRow(pg, v) {
    const isCol = pg.container === "Column";
    const n = Math.round(num(v.childCount, pg.childCount || 3));
    const mods = [];
    if (v.height != null) { mods.push("fillMaxWidth()"); mods.push("height(" + num(v.height, 200) + ".dp)"); }
    else mods.push("fillMaxSize()");
    const pad = padKotlin(v); if (pad) mods.push(pad);
    if (v.scroll === "true") mods.push("verticalScroll(rememberScrollState())");
    const arr = v[isCol ? "verticalArrangement" : "horizontalArrangement"];
    const cross = v[isCol ? "horizontalAlignment" : "verticalAlignment"];
    const gap = num(v.gap, 0);
    const params = ["modifier = Modifier\n        ." + mods.join("\n        .")];
    let arrLine = null;
    if (arr) {
      if (["SpaceBetween", "SpaceAround", "SpaceEvenly"].indexOf(arr) >= 0) arrLine = "Arrangement." + arr;
      else if (gap > 0) arrLine = "Arrangement.spacedBy(" + gap + ".dp, Alignment." + spacedAlign(arr, isCol) + ")";
      else arrLine = "Arrangement." + arr;
    } else if (gap > 0) arrLine = "Arrangement.spacedBy(" + gap + ".dp)";
    if (arrLine) params.push((isCol ? "verticalArrangement" : "horizontalArrangement") + " = " + arrLine);
    if (cross) params.push((isCol ? "horizontalAlignment" : "verticalAlignment") + " = Alignment." + cross);
    let kids = "";
    const weighted = hasRole(pg, "weightPerChild");
    for (let i = 0; i < n; i++) {
      if (weighted) {
        const w = num(v["weight" + i], 0);
        const cm = ["Modifier"]; if (w > 0) cm.push("weight(" + w + "f)"); cm.push(isCol ? "fillMaxWidth()" : "fillMaxHeight()"); cm.push("height(48.dp)"); cm.push("background(" + childColor(i) + ")");
        kids += "\n    Box(" + cm.join("\n        .") + "\n    )";
      } else {
        kids += "\n    Box(Modifier.size(" + num(v.childSize, 48) + ".dp).background(" + childColor(i) + "))";
      }
    }
    return (isCol ? "Column" : "Row") + "(\n    " + params.join(",\n    ") + "\n) {" + kids + "\n}";
  }

  function genBox(pg, v) {
    const n = Math.min(Math.round(num(v.childCount, pg.childCount || 3)), 4);
    const mods = ["size(" + (v.size != null ? num(v.size, 200) : 200) + ".dp)"];
    if (v.background) mods.push("background(" + COLORK[SELECT_OPTS.background.indexOf(v.background)] + ")");
    const pad = padKotlin(v); if (pad) mods.push(pad);
    const ca = v.boxContentAlignment || "Center";
    const cs = v.childSize != null ? num(v.childSize, 48) : null;
    let kids = ""; const sz = [120, 88, 58, 40];
    for (let i = 0; i < n; i++) kids += "\n    Box(Modifier.size(" + (cs != null ? cs : sz[i]) + ".dp).background(" + childColor(i) + "))";
    return "Box(\n    modifier = Modifier." + mods.join(".") + ",\n    contentAlignment = Alignment." + ca + "\n) {" + kids + "\n}";
  }

  function genSingle(pg, v) {
    const chain = ["Modifier"];
    if (v.size != null) chain.push("size(" + num(v.size, 96) + ".dp)");
    else if (v.childSize != null && v.width == null && v.height == null) chain.push("size(" + num(v.childSize, 96) + ".dp)");
    else { if (v.width != null) chain.push("width(" + num(v.width, 120) + ".dp)"); if (v.height != null) chain.push("height(" + num(v.height, 84) + ".dp)"); }
    if (v.fillMaxWidth === "true") chain.push("fillMaxWidth()");
    if (v.fillFraction != null) chain.push("fillMaxWidth(" + num(v.fillFraction, 1) + "f)");
    if (v.aspectRatio != null) chain.push("aspectRatio(" + num(v.aspectRatio, 1) + "f)");
    if (v.offsetX != null || v.offsetY != null) chain.push("offset(x = " + num(v.offsetX, 0) + ".dp, y = " + num(v.offsetY, 0) + ".dp)");
    const shape = v.cornerRadius != null ? "RoundedCornerShape(" + num(v.cornerRadius, 0) + ".dp)" : null;
    if (v.clip === "true" && shape) chain.push("clip(" + shape + ")");
    if (hasRole(pg, "orderSwap")) {
      // visualize order with padding + background
      if (v.orderSwap === "true") { const p = padKotlin(v) || "padding(16.dp)"; chain.push(p); chain.push("background(Color(0xFF5C6BC0))"); }
      else { chain.push("background(Color(0xFF5C6BC0))"); const p = padKotlin(v) || "padding(16.dp)"; chain.push(p); }
    } else {
      if (v.background != null) chain.push("background(" + COLORK[SELECT_OPTS.background.indexOf(v.background)] + (shape ? ", " + shape : "") + ")");
      if (v.borderWidth != null && num(v.borderWidth, 0) > 0) chain.push("border(" + num(v.borderWidth, 0) + ".dp, Color.DarkGray" + (shape ? ", " + shape : "") + ")");
      const p = padKotlin(v); if (p) chain.push(p);
    }
    const body = (v.fontSize != null) ? ' {\n    Text("Aa", fontSize = ' + num(v.fontSize, 16) + '.sp)\n}' : '';
    return "Box(\n    " + chain.join("\n        .") + "\n)" + body;
  }

  function genText(v) {
    const p = ['text = "Compose makes UI declarative."'];
    if (v.fontSize != null) p.push("fontSize = " + num(v.fontSize, 18) + ".sp");
    if (v.fontWeight) p.push("fontWeight = " + (FONTW[v.fontWeight] || "FontWeight.Normal"));
    if (v.textAlign) p.push("textAlign = TextAlign." + v.textAlign);
    if (v.maxLines != null) { p.push("maxLines = " + num(v.maxLines, 2)); p.push("overflow = TextOverflow.Ellipsis"); }
    return "Text(\n    " + p.join(",\n    ") + "\n)";
  }

  // ======================= COMPONENT CONTAINERS =======================
  function frame(stage, justify) { stage.style.display = "flex"; stage.style.alignItems = "center"; stage.style.justifyContent = justify || "center"; stage.style.padding = "20px"; }

  function pvButton(pg, v, stage) {
    frame(stage); const st = (v.buttonStyle || "Filled"); const b = h("div", "mbtn mbtn-" + st.toLowerCase());
    if (v.enabled === "false") b.classList.add("mbtn-dis");
    if (v.withIcon === "true") b.appendChild(h("span", "mbtn-ic", "★"));
    b.appendChild(h("span", null, "Button")); stage.appendChild(b);
  }
  function genButton(pg, v) {
    const fn = { Filled: "Button", Tonal: "FilledTonalButton", Outlined: "OutlinedButton", Elevated: "ElevatedButton", Text: "TextButton" }[v.buttonStyle || "Filled"];
    const en = v.enabled === "false" ? ",\n    enabled = false" : "";
    const content = v.withIcon === "true"
      ? '    Icon(Icons.Default.Star, contentDescription = null)\n    Spacer(Modifier.width(ButtonDefaults.IconSpacing))\n    Text("Button")'
      : '    Text("Button")';
    return fn + "(\n    onClick = { }" + en + "\n) {\n" + content + "\n}";
  }

  function pvCard(pg, v, stage) {
    frame(stage); const st = (v.cardStyle || "Elevated").toLowerCase(); const el = num(v.cardElevation, 2);
    const card = h("div", "mcard mcard-" + st); card.style.borderRadius = num(v.cornerRadius, 12) + "px";
    if (st === "elevated") card.style.boxShadow = "0 " + (1 + el) + "px " + (4 + el * 2) + "px rgba(0,0,0," + (0.08 + el * 0.012) + ")";
    const body = h("div", "mcard-body"); body.style.padding = num(v.padding, 16) + "px";
    body.appendChild(h("div", "mcard-title", "Card title"));
    body.appendChild(h("div", "mcard-sub", "Supporting text lives in the card's content slot."));
    card.appendChild(body); stage.appendChild(card);
  }
  function genCard(pg, v) {
    const st = v.cardStyle || "Elevated"; const fn = { Elevated: "ElevatedCard", Filled: "Card", Outlined: "OutlinedCard" }[st];
    const elev = st === "Elevated" ? "\n    elevation = CardDefaults.cardElevation(defaultElevation = " + num(v.cardElevation, 2) + ".dp)," : "";
    return fn + "(\n    shape = RoundedCornerShape(" + num(v.cornerRadius, 12) + ".dp)," + elev + "\n) {\n    Column(Modifier.padding(" + num(v.padding, 16) + ".dp)) {\n        Text(\"Card title\", style = MaterialTheme.typography.titleMedium)\n        Text(\"Supporting text.\", style = MaterialTheme.typography.bodyMedium)\n    }\n}";
  }

  function pvControls(pg, v, stage) {
    frame(stage); const ctl = v.control || "Switch"; const on = v.checked !== "false"; let el;
    if (ctl === "Switch") { el = h("div", "msw" + (on ? " on" : "")); el.appendChild(h("span", "msw-thumb")); }
    else if (ctl === "Checkbox") { el = h("div", "mcheck" + (on ? " on" : ""), on ? "✓" : ""); }
    else if (ctl === "RadioButton") { el = h("div", "mradio" + (on ? " on" : "")); el.appendChild(h("span", "mradio-dot")); }
    else { el = h("div", "mslider", '<span class="mslider-fill"></span><span class="mslider-thumb"></span>'); }
    if (v.enabled === "false") el.classList.add("ctl-dis");
    stage.appendChild(el);
  }
  function genControls(pg, v) {
    const ctl = v.control || "Switch"; const on = v.checked !== "false"; const en = v.enabled === "false" ? ",\n    enabled = false" : "";
    if (ctl === "Switch") return "Switch(\n    checked = " + on + ",\n    onCheckedChange = { }" + en + "\n)";
    if (ctl === "Checkbox") return "Checkbox(\n    checked = " + on + ",\n    onCheckedChange = { }" + en + "\n)";
    if (ctl === "RadioButton") return "RadioButton(\n    selected = " + on + ",\n    onClick = { }" + en + "\n)";
    return "Slider(\n    value = 0.4f,\n    onValueChange = { },\n    valueRange = 0f..1f" + en + "\n)";
  }

  function pvTextField(pg, v, stage) {
    frame(stage); const st = (v.textFieldStyle || "Filled").toLowerCase(); const tf = h("div", "mtf mtf-" + st);
    if (v.enabled === "false") tf.classList.add("mtf-dis");
    if (v.showLabel !== "false") tf.appendChild(h("div", "mtf-label", "Email"));
    tf.appendChild(h("div", "mtf-val", "you@example.com")); stage.appendChild(tf);
  }
  function genTextField(pg, v) {
    const fn = v.textFieldStyle === "Outlined" ? "OutlinedTextField" : "TextField";
    const lab = v.showLabel !== "false" ? '\n    label = { Text("Email") },' : "";
    const sl = v.singleLine === "true" ? "\n    singleLine = true," : "";
    const en = v.enabled === "false" ? "\n    enabled = false," : "";
    return fn + "(\n    value = text,\n    onValueChange = { text = it }," + lab + '\n    placeholder = { Text("you@example.com") },' + sl + en + "\n)";
  }

  function pvConstraintLayout(pg, v, stage) {
    const mode = v.constraintMode || "InlineRefs";
    stage.classList.add("constraint-stage");
    stage.style.display = "grid";
    stage.style.placeItems = "center";
    stage.style.padding = "16px";
    const board = h("div", "constraint-board" + (v.showGuidelines === "true" ? " show-lines" : ""));
    board.appendChild(h("div", "constraint-label", "<b>" + esc(mode) + "</b><span>" + (mode === "ConstraintSet" ? "layoutId + swappable constraints" : mode === "Guideline" ? "virtual percentage anchor" : mode === "Barrier" ? "extreme edge from siblings" : mode === "Chain" ? "axis distribution" : "createRefs + constrainAs") + "</span>"));
    if (mode === "ConstraintSet") {
      board.classList.add(v.wideWindow === "true" ? "wide" : "compact");
      board.appendChild(h("div", "constraint-node hero", "Hero"));
      board.appendChild(h("div", "constraint-node title", "Title"));
      board.appendChild(h("div", "constraint-node action", "CTA"));
      board.appendChild(h("div", "constraint-hint", v.wideWindow === "true" ? "expanded ConstraintSet" : "compact ConstraintSet"));
    } else if (mode === "Guideline") {
      board.appendChild(h("div", "constraint-guide v"));
      board.appendChild(h("div", "constraint-guide h"));
      board.appendChild(h("div", "constraint-node hero guide", "Image"));
      board.appendChild(h("div", "constraint-node title guide-title", "30% guideline"));
    } else if (mode === "Barrier") {
      board.appendChild(h("div", "constraint-node label a", "Long label"));
      board.appendChild(h("div", "constraint-node label b", "Short"));
      board.appendChild(h("div", "constraint-barrier"));
      board.appendChild(h("div", "constraint-node value a", "$42.00"));
      board.appendChild(h("div", "constraint-node value b", "Ready"));
      board.appendChild(h("div", "constraint-node action barrier", "Pay"));
    } else if (mode === "Chain") {
      board.classList.add("chain-" + (v.chainStyle || "Spread").toLowerCase());
      ["A", "B", "C"].forEach(function (label) { board.appendChild(h("div", "constraint-node chip", label)); });
      board.appendChild(h("div", "constraint-hint", "ChainStyle." + (v.chainStyle || "Spread")));
    } else {
      board.appendChild(h("div", "constraint-node avatar", "JP"));
      board.appendChild(h("div", "constraint-node title", "Profile"));
      board.appendChild(h("div", "constraint-node subtitle", "Online"));
      board.appendChild(h("div", "constraint-node action", "Follow"));
    }
    if (v.composeAlternative === "true") {
      const alt = h("div", "constraint-alt");
      alt.appendChild(h("b", null, "Compose-first alternative"));
      alt.appendChild(h("span", null, mode === "Chain" ? "Row + Arrangement" : mode === "Barrier" ? "IntrinsicSize + Row/Column" : mode === "Guideline" ? "Spacer / BoxWithConstraints" : "Row, Column, Box"));
      board.appendChild(alt);
    }
    stage.appendChild(board);
  }

  function genConstraintLayout(pg, v) {
    const mode = v.constraintMode || "InlineRefs";
    if (v.composeAlternative === "true" && mode === "Chain") {
      return "@Composable\nfun ChainAlternative(modifier: Modifier = Modifier) {\n  Row(\n    modifier = modifier.fillMaxWidth(),\n    horizontalArrangement = Arrangement." + (v.chainStyle || "Spread") + ",\n    verticalAlignment = Alignment.CenterVertically\n  ) {\n    listOf(\"A\", \"B\", \"C\").forEach { label ->\n      AssistChip(onClick = { }, label = { Text(label) })\n    }\n  }\n}";
    }
    if (mode === "ConstraintSet") {
      return "@Composable\nfun ResponsiveConstraintCard(\n  expanded: Boolean,\n  modifier: Modifier = Modifier\n) {\n  val constraints = if (expanded) expandedProfileConstraints() else compactProfileConstraints()\n\n  ConstraintLayout(\n    constraintSet = constraints,\n    modifier = modifier.fillMaxWidth()\n  ) {\n    ProfilePhoto(Modifier.layoutId(\"photo\"))\n    Text(\"Ada Lovelace\", Modifier.layoutId(\"title\"))\n    Button(onClick = { }, modifier = Modifier.layoutId(\"action\")) { Text(\"Follow\") }\n  }\n}\n\nprivate fun compactProfileConstraints() = ConstraintSet {\n  val photo = createRefFor(\"photo\")\n  val title = createRefFor(\"title\")\n  val action = createRefFor(\"action\")\n\n  constrain(photo) {\n    start.linkTo(parent.start, 16.dp)\n    top.linkTo(parent.top, 16.dp)\n  }\n  constrain(title) {\n    start.linkTo(photo.end, 12.dp)\n    top.linkTo(photo.top)\n    end.linkTo(action.start, 12.dp)\n    width = Dimension.fillToConstraints\n  }\n  constrain(action) {\n    end.linkTo(parent.end, 16.dp)\n    top.linkTo(parent.top, 16.dp)\n  }\n}\n\nprivate fun expandedProfileConstraints() = ConstraintSet {\n  val photo = createRefFor(\"photo\")\n  val title = createRefFor(\"title\")\n  val action = createRefFor(\"action\")\n  val guide = createGuidelineFromStart(0.32f)\n\n  constrain(photo) {\n    start.linkTo(parent.start, 24.dp)\n    top.linkTo(parent.top, 24.dp)\n  }\n  constrain(title) {\n    start.linkTo(guide, 24.dp)\n    top.linkTo(photo.top)\n  }\n  constrain(action) {\n    start.linkTo(guide, 24.dp)\n    top.linkTo(title.bottom, 16.dp)\n  }\n}";
    }
    if (mode === "Guideline") {
      return "@Composable\nfun GuidelineProfile(modifier: Modifier = Modifier) {\n  ConstraintLayout(modifier.fillMaxWidth()) {\n    val image = createRef()\n    val title = createRef()\n    val startGuide = createGuidelineFromStart(0.30f)\n\n    ProfilePhoto(\n      modifier = Modifier.constrainAs(image) {\n        start.linkTo(parent.start, 16.dp)\n        top.linkTo(parent.top, 16.dp)\n      }\n    )\n    Text(\n      \"Pinned to 30%\",\n      modifier = Modifier.constrainAs(title) {\n        start.linkTo(startGuide)\n        top.linkTo(image.top)\n      }\n    )\n  }\n}";
    }
    if (mode === "Barrier") {
      return "@Composable\nfun BarrierInvoiceRow(modifier: Modifier = Modifier) {\n  ConstraintLayout(modifier.fillMaxWidth()) {\n    val (longLabel, shortLabel, price, status, action) = createRefs()\n    val valueStart = createEndBarrier(longLabel, shortLabel, margin = 12.dp)\n\n    Text(\"Total before discount\", Modifier.constrainAs(longLabel) {\n      start.linkTo(parent.start)\n      top.linkTo(parent.top)\n    })\n    Text(\"Status\", Modifier.constrainAs(shortLabel) {\n      start.linkTo(parent.start)\n      top.linkTo(longLabel.bottom, 8.dp)\n    })\n    Text(\"$42.00\", Modifier.constrainAs(price) {\n      start.linkTo(valueStart)\n      top.linkTo(longLabel.top)\n    })\n    Text(\"Ready\", Modifier.constrainAs(status) {\n      start.linkTo(valueStart)\n      top.linkTo(shortLabel.top)\n    })\n    Button(onClick = { }, Modifier.constrainAs(action) {\n      top.linkTo(shortLabel.bottom, 16.dp)\n      end.linkTo(parent.end)\n    }) { Text(\"Pay\") }\n  }\n}";
    }
    if (mode === "Chain") {
      return "@Composable\nfun ConstraintChain(modifier: Modifier = Modifier) {\n  ConstraintLayout(modifier.fillMaxWidth()) {\n    val (first, second, third) = createRefs()\n    createHorizontalChain(first, second, third, chainStyle = ChainStyle." + (v.chainStyle || "Spread") + ")\n\n    AssistChip(onClick = { }, label = { Text(\"A\") }, modifier = Modifier.constrainAs(first) {\n      top.linkTo(parent.top)\n    })\n    AssistChip(onClick = { }, label = { Text(\"B\") }, modifier = Modifier.constrainAs(second) {\n      top.linkTo(parent.top)\n    })\n    AssistChip(onClick = { }, label = { Text(\"C\") }, modifier = Modifier.constrainAs(third) {\n      top.linkTo(parent.top)\n    })\n  }\n}";
    }
    return "@Composable\nfun InlineConstraintProfile(modifier: Modifier = Modifier) {\n  ConstraintLayout(modifier.fillMaxWidth()) {\n    val (avatar, title, subtitle, action) = createRefs()\n\n    ProfilePhoto(Modifier.constrainAs(avatar) {\n      start.linkTo(parent.start, 16.dp)\n      top.linkTo(parent.top, 16.dp)\n    })\n    Text(\"Ada Lovelace\", Modifier.constrainAs(title) {\n      start.linkTo(avatar.end, 12.dp)\n      top.linkTo(avatar.top)\n      end.linkTo(action.start, 12.dp)\n      width = Dimension.fillToConstraints\n    })\n    Text(\"Online\", Modifier.constrainAs(subtitle) {\n      start.linkTo(title.start)\n      top.linkTo(title.bottom, 4.dp)\n    })\n    Button(onClick = { }, Modifier.constrainAs(action) {\n      end.linkTo(parent.end, 16.dp)\n      top.linkTo(parent.top, 16.dp)\n    }) { Text(\"Follow\") }\n  }\n}";
  }

  function pvVisibilityTracking(pg, v, stage) {
    const mode = v.visibilityTracking || "VisibilityChanged";
    const visible = Math.max(0, Math.min(1, num(v.visibleFraction, 0.65)));
    const threshold = Math.max(0, Math.min(1, num(v.minFractionVisible, 0.5)));
    const duration = Math.max(0, Math.round(num(v.minDurationMs, 1000)));
    const passesFraction = visible >= threshold;
    const passesDuration = duration <= 1200;
    const fires = passesFraction && passesDuration;
    stage.classList.add("visibility-stage");
    stage.style.display = "grid";
    stage.style.placeItems = "center";
    stage.style.padding = "16px";
    const shell = h("div", "visibility-shell" + (fires ? " fires" : "") + (v.overlayViewport === "true" ? " overlayed" : ""));
    shell.style.setProperty("--visible", (visible * 100).toFixed(0) + "%");
    shell.style.setProperty("--threshold", (threshold * 100).toFixed(0) + "%");
    shell.appendChild(h("div", "visibility-top", "<b>" + esc(mode) + "</b><span>" + (fires ? "callback true" : "waiting") + "</span>"));
    const viewport = h("div", "visibility-viewport");
    viewport.appendChild(h("div", "visibility-bar topbar", "top bar"));
    const track = h("div", "visibility-track");
    track.appendChild(h("div", "visibility-seen"));
    track.appendChild(h("div", "visibility-threshold"));
    const card = h("div", "visibility-card");
    card.appendChild(h("b", null, mode === "LayoutRectChanged" ? "RelativeLayoutBounds" : "Article card"));
    card.appendChild(h("span", null, Math.round(visible * 100) + "% visible"));
    track.appendChild(card);
    viewport.appendChild(track);
    if (v.overlayViewport === "true") viewport.appendChild(h("div", "visibility-bar bottombar", "overlay excluded"));
    shell.appendChild(viewport);
    const facts = h("div", "visibility-facts");
    [
      ["fraction", Math.round(visible * 100) + "% / " + Math.round(threshold * 100) + "%"],
      ["duration", "1.2s / " + (duration / 1000).toFixed(1) + "s"],
      ["identity", v.trackFirstOnly === "true" ? "stable item id" : "repeat events"],
      ["geometry", mode === "LayoutRectChanged" ? (v.useDebounce === "true" ? "throttle + debounce" : "every movement") : "boolean threshold"],
    ].forEach(function (item) { facts.appendChild(h("span", null, "<b>" + esc(item[0]) + "</b>" + esc(item[1]))); });
    shell.appendChild(facts);
    stage.appendChild(shell);
  }

  function genVisibilityTracking(pg, v) {
    const mode = v.visibilityTracking || "VisibilityChanged";
    const minFraction = num(v.minFractionVisible, 0.5).toFixed(2).replace(/0+$/, "").replace(/\.$/, "") + "f";
    const minDuration = Math.round(num(v.minDurationMs, 1000));
    const throttle = v.useDebounce === "true" ? "250" : "0";
    const debounce = v.useDebounce === "true" ? "250" : "0";
    if (mode === "LayoutRectChanged") {
      return "@Composable\nfun GeometryAwareCard(\n  id: String,\n  onGeometrySample: (VisibleGeometry) -> Unit,\n  modifier: Modifier = Modifier\n) {\n  Card(\n    modifier = modifier\n      .fillMaxWidth()\n      .onLayoutRectChanged(\n        throttleMillis = " + throttle + ",\n        debounceMillis = " + debounce + "\n      ) { bounds ->\n        onGeometrySample(\n          VisibleGeometry(\n            id = id,\n            fractionVisible = bounds.fractionVisibleInWindow(),\n            boundsInWindow = bounds.boundsInWindow\n          )\n        )\n      }\n  ) {\n    Text(\"Tracked card\", Modifier.padding(16.dp))\n  }\n}\n\ndata class VisibleGeometry(\n  val id: String,\n  val fractionVisible: Float,\n  val boundsInWindow: IntRect\n)";
    }
    if (mode === "LazyListImpression") {
      const once = v.trackFirstOnly === "true" ? "\n  var seen by rememberSaveable(article.id) { mutableStateOf(false) }\n" : "";
      const guard = v.trackFirstOnly === "true" ? " && !seen" : "";
      const mark = v.trackFirstOnly === "true" ? "\n          seen = true" : "";
      return "@Composable\nfun ArticleFeed(\n  articles: List<ArticleUi>,\n  onImpression: (String) -> Unit,\n  modifier: Modifier = Modifier\n) {\n  LazyColumn(modifier) {\n    items(\n      items = articles,\n      key = { article -> article.id },\n      contentType = { \"article-card\" }\n    ) { article ->\n      ArticleImpressionRow(\n        article = article,\n        onImpression = onImpression,\n        modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)\n      )\n    }\n  }\n}\n\n@Composable\nprivate fun ArticleImpressionRow(\n  article: ArticleUi,\n  onImpression: (String) -> Unit,\n  modifier: Modifier = Modifier\n) {" + once + "\n  Card(\n    modifier = modifier\n      .fillMaxWidth()\n      .onVisibilityChanged(\n        minFractionVisible = " + minFraction + ",\n        minDurationMs = " + minDuration + "\n      ) { visible ->\n        if (visible" + guard + ") {" + mark + "\n          onImpression(article.id)\n        }\n      }\n  ) {\n    Column(Modifier.padding(16.dp)) {\n      Text(article.title, style = MaterialTheme.typography.titleMedium)\n      Text(article.summary, style = MaterialTheme.typography.bodyMedium)\n    }\n  }\n}";
    }
    if (mode === "FirstVisibleOnce") {
      return "@Composable\nfun FirstSeenCard(\n  id: String,\n  onFirstSeen: (String) -> Unit,\n  modifier: Modifier = Modifier\n) {\n  var seen by rememberSaveable(id) { mutableStateOf(false) }\n\n  Card(\n    modifier = modifier\n      .fillMaxWidth()\n      .onVisibilityChanged(\n        minFractionVisible = " + minFraction + ",\n        minDurationMs = " + minDuration + "\n      ) { visible ->\n        if (visible && !seen) {\n          seen = true\n          onFirstSeen(id)\n        }\n      }\n  ) {\n    Text(\"Tracked once\", Modifier.padding(16.dp))\n  }\n}";
    }
    const viewport = v.overlayViewport === "true"
      ? "\n  val viewportBounds = remember { LayoutBoundsHolder() }\n\n  Box(Modifier.layoutBounds(viewportBounds)) {\n    TrackedCard(\n      modifier = Modifier.onVisibilityChanged(\n        viewportBounds = viewportBounds,\n        minFractionVisible = " + minFraction + ",\n        minDurationMs = " + minDuration + "\n      ) { visible ->\n        onVisibilityChanged(visible)\n      }\n    )\n  }"
      : "\n  TrackedCard(\n    modifier = modifier.onVisibilityChanged(\n      minFractionVisible = " + minFraction + ",\n      minDurationMs = " + minDuration + "\n    ) { visible ->\n      onVisibilityChanged(visible)\n    }\n  )";
    return "@Composable\nfun VisibilityAwareSurface(\n  onVisibilityChanged: (Boolean) -> Unit,\n  modifier: Modifier = Modifier\n) {" + viewport + "\n}\n\n@Composable\nprivate fun TrackedCard(modifier: Modifier = Modifier) {\n  Card(modifier.fillMaxWidth()) {\n    Text(\"Tracked visibility\", Modifier.padding(16.dp))\n  }\n}";
  }

  function pvNesting(pg, v, stage) {
    stage.style.display = "grid"; stage.style.placeItems = "center"; stage.style.padding = "14px"; stage.style.overflow = "auto";
    const depth = Math.max(1, Math.min(4, Math.round(num(v.nestDepth, 2)))); const order = ["Card", "Column", "Row", "Box"];
    let cur = h("div", "nest-leaf", 'Text("Hello")');
    for (let i = depth - 1; i >= 0; i--) { const w = h("div", "nest n" + i); w.appendChild(h("div", "nest-tag", order[i])); const body = h("div", "nest-body"); body.appendChild(cur); w.appendChild(body); cur = w; }
    stage.appendChild(cur);
  }
  function genNesting(pg, v) {
    const depth = Math.max(1, Math.min(4, Math.round(num(v.nestDepth, 2)))); const order = ["Card", "Column", "Row", "Box"];
    function build(i) { const pad = "    ".repeat(i); if (i >= depth) return pad + 'Text("Hello")'; return pad + order[i] + " {\n" + build(i + 1) + "\n" + pad + "}"; }
    return build(0);
  }

  function pvScaffold(pg, v, stage) {
    stage.style.display = "flex"; stage.style.flexDirection = "column"; stage.style.padding = "0"; stage.style.overflow = "hidden"; stage.style.position = "relative";
    if (v.topBar === "true") stage.appendChild(h("div", "sc-top", "&#9776;&nbsp;&nbsp;Title"));
    const content = h("div", "sc-content" + (v.insets === "none" ? " sc-nopad" : ""));
    content.innerHTML = '<div class="sc-line w80"></div><div class="sc-line w95"></div><div class="sc-line w60"></div><div class="sc-line w90"></div>';
    stage.appendChild(content);
    if (v.fab === "true") stage.appendChild(h("div", "sc-fab", "+"));
    if (v.bottomBar === "true") stage.appendChild(h("div", "sc-bottom", "&#9679; &#9675; &#9675;"));
  }
  function genScaffold(pg, v) {
    const top = v.topBar === "true" ? '\n    topBar = { TopAppBar(title = { Text("Title") }) },' : "";
    const bot = v.bottomBar === "true" ? '\n    bottomBar = { NavigationBar { /* items */ } },' : "";
    const fab = v.fab === "true" ? '\n    floatingActionButton = { FloatingActionButton(onClick = { }) { Icon(Icons.Default.Add, null) } },' : "";
    const ins = v.insets || "Scaffold";
    const mod = ins === "Scaffold" ? "Modifier.padding(innerPadding)" : ins === "systemBarsPadding" ? "Modifier.systemBarsPadding()" : "Modifier // ⚠ no insets: content slides under the bars";
    return "Scaffold(" + top + bot + fab + "\n) { innerPadding ->\n    Column(" + mod + ") {\n        // your screen content\n    }\n}";
  }

  function pvLazyCollections(pg, v, stage) {
    const kind = v.lazyKind || "AdaptiveGrid";
    const n = Math.round(num(v.itemCount, 8));
    const gap = num(v.gap, 10);
    const pad = num(v.padding, 12);
    const min = num(v.childSize, 88);
    stage.style.padding = pad + "px";
    stage.style.gap = gap + "px";
    stage.style.overflow = "auto";
    if (kind === "Pager") {
      stage.classList.add("lazy-pager");
      stage.style.display = "flex";
      stage.style.alignItems = "stretch";
      stage.style.paddingInline = Math.max(12, pad) + "px";
      stage.style.overflow = "hidden";
      for (let i = 0; i < Math.min(n, 5); i++) {
        const page = h("div", "lazy-page c" + (i % 5), "Page " + (i + 1));
        page.style.flex = "0 0 " + Math.max(110, min + 34) + "px";
        page.style.marginRight = gap + "px";
        stage.appendChild(page);
      }
      return;
    }
    if (kind === "StaggeredGrid") {
      stage.classList.add("lazy-staggered");
      stage.style.columnCount = String(Math.max(1, Math.round(num(v.columns, 3))));
      stage.style.columnGap = gap + "px";
      for (let i = 0; i < n; i++) {
        const tile = h("div", "lazy-tile c" + (i % 5), (v.paging === "true" && i > n - 3) ? "loading" : "item " + (i + 1));
        tile.style.height = (min + (i % 3) * 26) + "px";
        tile.style.marginBottom = gap + "px";
        if (v.animateItems === "true") tile.classList.add("is-animated");
        stage.appendChild(tile);
      }
      return;
    }
    stage.classList.add("lazy-grid");
    stage.style.display = "grid";
    stage.style.gridTemplateColumns = kind === "FixedGrid"
      ? "repeat(" + Math.max(1, Math.round(num(v.columns, 3))) + ", minmax(0, 1fr))"
      : "repeat(auto-fit, minmax(min(100%, " + min + "px), 1fr))";
    if (v.fullSpanHeader === "true") {
      const header = h("div", "lazy-header", kind === "FixedGrid" ? "fixed columns" : "adaptive columns");
      header.style.gridColumn = "1 / -1";
      stage.appendChild(header);
    }
    for (let i = 0; i < n; i++) {
      const tile = h("div", "lazy-tile c" + (i % 5), (v.paging === "true" && i > n - 3) ? "placeholder" : "photo " + (i + 1));
      tile.style.minHeight = min + "px";
      if (v.animateItems === "true") tile.classList.add("is-animated");
      stage.appendChild(tile);
    }
  }
  function genLazyCollections(pg, v) {
    const kind = v.lazyKind || "AdaptiveGrid";
    const n = Math.round(num(v.itemCount, 8));
    const gap = num(v.gap, 10);
    const pad = num(v.padding, 12);
    const min = num(v.childSize, 88);
    const anim = v.animateItems === "true" ? "\n          .animateItem()" : "";
    const contentType = '\n      contentType = { "photo" }';
    const key = "key = { it.id }";
    if (kind === "Pager") {
      return "val pagerState = rememberPagerState(pageCount = { pages.size })\n\nHorizontalPager(\n    state = pagerState,\n    contentPadding = PaddingValues(horizontal = " + pad + ".dp),\n    pageSpacing = " + gap + ".dp,\n    beyondViewportPageCount = 1\n) { page ->\n    PageCard(\n        page = pages[page],\n        modifier = Modifier.fillMaxSize()\n    )\n}";
    }
    if (kind === "StaggeredGrid") {
      return "LazyVerticalStaggeredGrid(\n    columns = StaggeredGridCells.Adaptive(" + min + ".dp),\n    contentPadding = PaddingValues(" + pad + ".dp),\n    verticalItemSpacing = " + gap + ".dp,\n    horizontalArrangement = Arrangement.spacedBy(" + gap + ".dp)\n) {\n    items(\n      items = photos,\n      " + key + "," + contentType + "\n    ) { photo ->\n      PhotoTile(\n        photo = photo,\n        modifier = Modifier" + anim + "\n      )\n    }\n}";
    }
    const cols = kind === "FixedGrid" ? "GridCells.Fixed(" + Math.max(1, Math.round(num(v.columns, 3))) + ")" : "GridCells.Adaptive(minSize = " + min + ".dp)";
    const header = v.fullSpanHeader === "true" ? "\n    item(span = { GridItemSpan(maxLineSpan) }) {\n      Text(\"Featured\", style = MaterialTheme.typography.titleMedium)\n    }\n" : "";
    const source = v.paging === "true"
      ? "val photos = viewModel.photos.collectAsLazyPagingItems()\n\nLazyVerticalGrid(\n    columns = " + cols + ",\n    contentPadding = PaddingValues(" + pad + ".dp),\n    verticalArrangement = Arrangement.spacedBy(" + gap + ".dp),\n    horizontalArrangement = Arrangement.spacedBy(" + gap + ".dp)\n) {" + header + "\n    items(\n      count = photos.itemCount,\n      key = photos.itemKey { it.id },\n      contentType = photos.itemContentType { \"photo\" }\n    ) { index ->\n      val photo = photos[index]\n      if (photo != null) PhotoCard(photo, Modifier" + anim + ")\n      else PhotoPlaceholder()\n    }\n\n    if (photos.loadState.append is LoadState.Loading) {\n      item(span = { GridItemSpan(maxLineSpan) }) { LoadingRow() }\n    }\n    if (photos.loadState.append is LoadState.Error) {\n      item(span = { GridItemSpan(maxLineSpan) }) { RetryRow(onRetry = photos::retry) }\n    }\n}"
      : "LazyVerticalGrid(\n    columns = " + cols + ",\n    contentPadding = PaddingValues(" + pad + ".dp),\n    verticalArrangement = Arrangement.spacedBy(" + gap + ".dp),\n    horizontalArrangement = Arrangement.spacedBy(" + gap + ".dp)\n) {" + header + "\n    items(\n      items = photos,\n      " + key + "," + contentType + "\n    ) { photo ->\n      PhotoCard(\n        photo = photo,\n        modifier = Modifier" + anim + "\n      )\n    }\n}";
    return source.replace(/PhotoCard\(photo, Modifier\n\s+\.animateItem\(\)\)/g, "PhotoCard(photo, Modifier.animateItem())");
  }

  function pvImageResource(pg, v, stage) {
    const mode = v.imageSource || "Resource";
    const scale = v.contentScale || "Crop";
    stage.classList.add("image-stage");
    stage.style.display = "grid";
    stage.style.placeItems = "center";
    stage.style.padding = "16px";

    const shell = h("div", "image-shell");
    const frameCls = "image-frame image-scale-" + scale.toLowerCase() +
      (v.imageClip === "true" ? " is-clipped" : "") +
      (v.imageTint === "true" ? " is-tinted" : "");
    const frame = h("div", frameCls);
    const art = h("div", "image-art image-art-" + mode.toLowerCase());
    if (mode === "Network" && v.imagePlaceholder === "true") art.appendChild(h("span", "image-loading", "placeholder"));
    if (mode === "Vector") art.appendChild(h("b", null, "★"));
    if (mode === "CustomPainter") art.appendChild(h("div", "image-ring", "<i></i>"));
    frame.appendChild(art);
    frame.appendChild(h("div", "image-scale-label", "ContentScale." + scale));

    const meta = h("div", "image-meta");
    meta.appendChild(h("b", null, mode === "Network" ? "AsyncImage" : mode === "Vector" ? "Icon / ImageVector" : mode === "CustomPainter" ? "Painter.onDraw" : "painterResource"));
    meta.appendChild(h("span", null, v.imageDescription === "false" ? "contentDescription = null" : "localized contentDescription"));
    const badges = h("div", "image-badges");
    badges.appendChild(h("em", null, mode === "Network" ? "size-aware request" : mode === "CustomPainter" ? "remember painter" : "resource id"));
    badges.appendChild(h("em", null, v.imageClip === "true" ? "clip before draw" : "unclipped bounds"));
    badges.appendChild(h("em", null, v.imageTint === "true" ? "tint/filter" : "source colors"));
    meta.appendChild(badges);

    shell.appendChild(frame);
    shell.appendChild(meta);
    stage.appendChild(shell);
  }
  function genImageResource(pg, v) {
    const mode = v.imageSource || "Resource";
    const scale = v.contentScale || "Crop";
    const desc = v.imageDescription === "false"
      ? "null // decorative image only"
      : "stringResource(R.string.hero_photo_description)";
    const clip = v.imageClip === "true" ? "\n      .clip(RoundedCornerShape(20.dp))" : "";
    const tintFilter = v.imageTint === "true"
      ? ",\n    colorFilter = ColorFilter.tint(MaterialTheme.colorScheme.primary)"
      : "";
    if (mode === "Network") {
      const placeholder = v.imagePlaceholder === "true"
        ? ",\n    placeholder = painterResource(R.drawable.image_placeholder),\n    error = painterResource(R.drawable.image_error)"
        : "";
      return "import coil.compose.AsyncImage\n\n@Composable\nfun RemoteHeroImage(\n  imageUrl: String,\n  modifier: Modifier = Modifier\n) {\n  AsyncImage(\n    model = ImageRequest.Builder(LocalContext.current)\n      .data(imageUrl)\n      .crossfade(true)\n      .build(),\n    contentDescription = " + desc + ",\n    contentScale = ContentScale." + scale + placeholder + ",\n    modifier = modifier\n      .fillMaxWidth()\n      .aspectRatio(16f / 9f)" + clip + "\n  )\n}";
    }
    if (mode === "Vector") {
      const tint = v.imageTint === "true" ? ",\n    tint = MaterialTheme.colorScheme.primary" : ",\n    tint = Color.Unspecified";
      return "@Composable\nfun FeatureIcon(modifier: Modifier = Modifier) {\n  Icon(\n    painter = painterResource(R.drawable.ic_feature),\n    contentDescription = " + desc + tint + ",\n    modifier = modifier.size(48.dp)\n  )\n}\n\n@Composable\nfun FeatureMark(modifier: Modifier = Modifier) {\n  val vector = ImageVector.vectorResource(R.drawable.ic_feature)\n  Image(\n    imageVector = vector,\n    contentDescription = " + desc + ",\n    contentScale = ContentScale." + scale + ",\n    modifier = modifier.size(96.dp)\n  )\n}";
    }
    if (mode === "CustomPainter") {
      return "class StatusRingPainter(\n  private val color: Color\n) : Painter() {\n  override val intrinsicSize: Size = Size.Unspecified\n\n  override fun DrawScope.onDraw() {\n    val stroke = 8.dp.toPx()\n    drawCircle(\n      color = color.copy(alpha = 0.14f),\n      radius = size.minDimension / 2f\n    )\n    drawArc(\n      color = color,\n      startAngle = -90f,\n      sweepAngle = 270f,\n      useCenter = false,\n      style = Stroke(width = stroke, cap = StrokeCap.Round)\n    )\n  }\n}\n\n@Composable\nfun StatusRing(modifier: Modifier = Modifier) {\n  val color = MaterialTheme.colorScheme.primary\n  val painter = remember(color) { StatusRingPainter(color) }\n\n  Image(\n    painter = painter,\n    contentDescription = " + desc + ",\n    contentScale = ContentScale." + scale + ",\n    modifier = modifier.size(96.dp)\n  )\n}";
    }
    return "@Composable\nfun HeroImage(modifier: Modifier = Modifier) {\n  Image(\n    painter = painterResource(R.drawable.hero_photo),\n    contentDescription = " + desc + ",\n    contentScale = ContentScale." + scale + tintFilter + ",\n    modifier = modifier\n      .size(160.dp)" + clip + "\n  )\n}\n\n@Composable\nfun ProductTitle(count: Int) {\n  Text(stringResource(R.string.product_title))\n  Text(\n    pluralStringResource(\n      R.plurals.items_available,\n      count,\n      count\n    )\n  )\n}";
  }

  function pvSelectionInput(pg, v, stage) {
    const kind = v.selectionInput || "SearchBar";
    stage.classList.add("selectinput-stage");
    stage.style.display = "grid";
    stage.style.placeItems = "center";
    stage.style.padding = "16px";
    const shell = h("div", "selectinput-shell");
    shell.appendChild(h("div", "selectinput-top", "<b>Discover</b><span>filters</span>"));
    const body = h("div", "selectinput-body");
    if (kind === "SearchBar") {
      const box = h("div", "selectinput-search" + (v.expandedSearch === "true" ? " expanded" : ""));
      box.appendChild(h("span", null, "⌕"));
      box.appendChild(h("b", null, "trail recipes"));
      box.appendChild(h("i", null, v.expandedSearch === "true" ? "×" : "mic"));
      body.appendChild(box);
      if (v.expandedSearch === "true") {
        const results = h("div", "selectinput-results");
        ["Trail near me", "Easy weekend hikes", "Saved maps"].forEach(function (label) { results.appendChild(h("div", null, label)); });
        body.appendChild(results);
      }
    } else if (/Chip$/.test(kind)) {
      const row = h("div", "selectinput-chiprow");
      const labels = kind === "AssistChip" ? ["Set reminder", "Share"] : kind === "FilterChip" ? ["Open now", "Saved", "Nearby"] : kind === "InputChip" ? ["Ada", "Trail", "Dog friendly"] : ["Popular", "New", "For you"];
      labels.forEach(function (label, idx) {
        const cls = "selectinput-chip " + kind.toLowerCase() + (idx === 0 ? " selected" : "");
        const chip = h("div", cls);
        chip.appendChild(h("span", null, label));
        if (kind === "InputChip" && v.removableChip === "true") chip.appendChild(h("button", null, "×"));
        row.appendChild(chip);
      });
      body.appendChild(row);
    } else if (kind === "SegmentedButton") {
      const row = h("div", "selectinput-segmented" + (v.multiSelect === "true" ? " multi" : ""));
      ["Day", "Week", "Month"].forEach(function (label, idx) { row.appendChild(h("button", idx === 1 || (v.multiSelect === "true" && idx === 2) ? "selected" : null, label)); });
      body.appendChild(row);
    } else if (kind === "DatePicker") {
      const card = h("div", "selectinput-picker");
      card.appendChild(h("b", null, v.rangePicker === "true" ? "Select travel dates" : "Select date"));
      card.appendChild(h("div", "selectinput-calendar", "<span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><em>14</em><em>15</em><em>16</em><em>17</em><em>18</em>"));
      card.appendChild(h("p", null, v.modalPicker === "true" ? "DatePickerDialog confirms committed state." : "Docked picker stays in layout."));
      body.appendChild(card);
    } else {
      const card = h("div", "selectinput-picker time");
      card.appendChild(h("b", null, v.inputMode === "true" ? "TimeInput" : "TimePicker"));
      card.appendChild(h("div", "selectinput-clock", v.inputMode === "true" ? "<span>09</span><i>:</i><span>30</span>" : "<em></em><strong>09:30</strong>"));
      card.appendChild(h("p", null, "Confirm before mutating scheduled time."));
      body.appendChild(card);
    }
    shell.appendChild(body);
    const label = h("div", "selectinput-label");
    label.appendChild(h("b", null, kind));
    label.appendChild(h("span", null, kind === "SearchBar" ? "query + expanded state" : /Chip$/.test(kind) ? "compact contextual control" : kind === "SegmentedButton" ? "small option set" : "explicit picker state"));
    shell.appendChild(label);
    stage.appendChild(shell);
  }

  function genSelectionInput(pg, v) {
    const kind = v.selectionInput || "SearchBar";
    if (kind === "SearchBar") {
      return "@OptIn(ExperimentalMaterial3Api::class)\n@Composable\nfun DestinationSearch(\n  suggestions: List<String>,\n  onSearch: (String) -> Unit,\n  onSuggestionClick: (String) -> Unit,\n  modifier: Modifier = Modifier\n) {\n  var query by rememberSaveable { mutableStateOf(\"\") }\n  var expanded by rememberSaveable { mutableStateOf(" + (v.expandedSearch === "true" ? "true" : "false") + ") }\n\n  SearchBar(\n    modifier = modifier.fillMaxWidth(),\n    inputField = {\n      SearchBarDefaults.InputField(\n        query = query,\n        onQueryChange = { query = it },\n        onSearch = {\n          expanded = false\n          onSearch(query)\n        },\n        expanded = expanded,\n        onExpandedChange = { expanded = it },\n        placeholder = { Text(\"Search destinations\") },\n        leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },\n        trailingIcon = {\n          if (query.isNotEmpty()) {\n            IconButton(onClick = { query = \"\" }) {\n              Icon(Icons.Default.Close, contentDescription = \"Clear search\")\n            }\n          }\n        }\n      )\n    },\n    expanded = expanded,\n    onExpandedChange = { expanded = it }\n  ) {\n    LazyColumn {\n      items(suggestions, key = { it }) { suggestion ->\n        ListItem(\n          headlineContent = { Text(suggestion) },\n          modifier = Modifier.clickable {\n            query = suggestion\n            expanded = false\n            onSuggestionClick(suggestion)\n          }\n        )\n      }\n    }\n  }\n}";
    }
    if (/Chip$/.test(kind)) {
      if (kind === "AssistChip") {
        return "@Composable\nfun AssistActions(onShare: () -> Unit, onSchedule: () -> Unit) {\n  Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {\n    AssistChip(\n      onClick = onSchedule,\n      label = { Text(\"Remind me\") },\n      leadingIcon = { Icon(Icons.Default.Notifications, contentDescription = null) }\n    )\n    AssistChip(\n      onClick = onShare,\n      label = { Text(\"Share\") },\n      leadingIcon = { Icon(Icons.Default.Share, contentDescription = null) }\n    )\n  }\n}";
      }
      if (kind === "FilterChip") {
        return "@Composable\nfun FilterChips(\n  filters: List<String>,\n  selectedFilters: Set<String>,\n  onFilterToggle: (String) -> Unit\n) {\n  FlowRow(\n    horizontalArrangement = Arrangement.spacedBy(8.dp),\n    verticalArrangement = Arrangement.spacedBy(8.dp)\n  ) {\n    filters.forEach { filter ->\n      FilterChip(\n        selected = filter in selectedFilters,\n        onClick = { onFilterToggle(filter) },\n        label = { Text(filter) },\n        leadingIcon = if (filter in selectedFilters) {\n          { Icon(Icons.Default.Check, contentDescription = null) }\n        } else null\n      )\n    }\n  }\n}";
      }
      if (kind === "InputChip") {
        const trailing = v.removableChip === "true" ? ",\n        trailingIcon = { Icon(Icons.Default.Close, contentDescription = \"Remove tag\") }" : "";
        return "@Composable\nfun SelectedTags(\n  tags: List<String>,\n  onRemoveTag: (String) -> Unit\n) {\n  FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {\n    tags.forEach { tag ->\n      InputChip(\n        selected = true,\n        onClick = { onRemoveTag(tag) },\n        label = { Text(tag) }" + trailing + "\n      )\n    }\n  }\n}";
      }
      return "@Composable\nfun SearchSuggestions(\n  suggestions: List<String>,\n  onSuggestionClick: (String) -> Unit\n) {\n  FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {\n    suggestions.forEach { suggestion ->\n      SuggestionChip(\n        onClick = { onSuggestionClick(suggestion) },\n        label = { Text(suggestion) }\n      )\n    }\n  }\n}";
    }
    if (kind === "SegmentedButton") {
      if (v.multiSelect === "true") {
        return "@Composable\nfun MultiSelectSegmentedFilters(\n  options: List<String>,\n  selected: Set<String>,\n  onToggle: (String) -> Unit\n) {\n  MultiChoiceSegmentedButtonRow {\n    options.take(5).forEachIndexed { index, option ->\n      SegmentedButton(\n        checked = option in selected,\n        onCheckedChange = { onToggle(option) },\n        shape = SegmentedButtonDefaults.itemShape(index, options.take(5).size)\n      ) {\n        Text(option)\n      }\n    }\n  }\n}";
      }
      return "@Composable\nfun SortSegmentedButton(\n  selectedIndex: Int,\n  onSelectedIndexChange: (Int) -> Unit\n) {\n  val options = listOf(\"Day\", \"Week\", \"Month\")\n\n  SingleChoiceSegmentedButtonRow {\n    options.forEachIndexed { index, label ->\n      SegmentedButton(\n        selected = selectedIndex == index,\n        onClick = { onSelectedIndexChange(index) },\n        shape = SegmentedButtonDefaults.itemShape(index, options.size)\n      ) {\n        Text(label)\n      }\n    }\n  }\n}";
    }
    if (kind === "DatePicker") {
      if (v.rangePicker === "true") {
        return "@OptIn(ExperimentalMaterial3Api::class)\n@Composable\nfun TravelDateRangePicker(\n  onRangeConfirmed: (Long?, Long?) -> Unit,\n  onDismiss: () -> Unit\n) {\n  val rangeState = rememberDateRangePickerState()\n\n  DatePickerDialog(\n    onDismissRequest = onDismiss,\n    confirmButton = {\n      TextButton(onClick = {\n        onRangeConfirmed(rangeState.selectedStartDateMillis, rangeState.selectedEndDateMillis)\n      }) { Text(\"Apply\") }\n    },\n    dismissButton = { TextButton(onClick = onDismiss) { Text(\"Cancel\") } }\n  ) {\n    DateRangePicker(state = rangeState)\n  }\n}";
      }
      const container = v.modalPicker === "true" ? "DatePickerDialog" : "DockedDatePicker";
      if (container === "DatePickerDialog") {
        return "@OptIn(ExperimentalMaterial3Api::class)\n@Composable\nfun DatePickerField(\n  onDateConfirmed: (Long) -> Unit,\n  onDismiss: () -> Unit\n) {\n  val datePickerState = rememberDatePickerState()\n\n  DatePickerDialog(\n    onDismissRequest = onDismiss,\n    confirmButton = {\n      TextButton(onClick = {\n        datePickerState.selectedDateMillis?.let(onDateConfirmed)\n      }) { Text(\"OK\") }\n    },\n    dismissButton = { TextButton(onClick = onDismiss) { Text(\"Cancel\") } }\n  ) {\n    DatePicker(state = datePickerState)\n  }\n}";
      }
      return "@OptIn(ExperimentalMaterial3Api::class)\n@Composable\nfun DockedDatePickerField(onDateSelected: (Long?) -> Unit) {\n  val datePickerState = rememberDatePickerState()\n\n  Column {\n    OutlinedTextField(\n      value = datePickerState.selectedDateMillis?.let { millis -> formatDate(millis) }.orEmpty(),\n      onValueChange = {},\n      readOnly = true,\n      label = { Text(\"Date\") }\n    )\n    DatePicker(state = datePickerState)\n    Button(onClick = { onDateSelected(datePickerState.selectedDateMillis) }) {\n      Text(\"Apply date\")\n    }\n  }\n}";
    }
    const picker = v.inputMode === "true" ? "TimeInput" : "TimePicker";
    return "@OptIn(ExperimentalMaterial3Api::class)\n@Composable\nfun TimePickerDialogContent(\n  onTimeConfirmed: (hour: Int, minute: Int) -> Unit,\n  onDismiss: () -> Unit\n) {\n  val timePickerState = rememberTimePickerState(is24Hour = true)\n\n  AlertDialog(\n    onDismissRequest = onDismiss,\n    confirmButton = {\n      TextButton(onClick = {\n        onTimeConfirmed(timePickerState.hour, timePickerState.minute)\n      }) { Text(\"OK\") }\n    },\n    dismissButton = { TextButton(onClick = onDismiss) { Text(\"Cancel\") } },\n    text = {\n      " + picker + "(state = timePickerState)\n    }\n  )\n}";
  }

  function pvStatusContent(pg, v, stage) {
    const kind = v.statusContent || "CircularProgress";
    const progress = Math.round(num(v.progressValue, 65));
    const count = Math.round(num(v.itemCount, 5));
    stage.classList.add("status-stage");
    stage.style.display = "grid";
    stage.style.placeItems = "center";
    stage.style.padding = "16px";
    const shell = h("div", "status-shell");
    shell.appendChild(h("div", "status-top", "<b>Library</b><span>" + esc(kind) + "</span>"));
    const body = h("div", "status-body");

    function addListRow(label, sub, trailing) {
      const row = h("div", "status-listitem");
      row.appendChild(h("i", null, label.charAt(0)));
      const text = h("div", null);
      text.appendChild(h("b", null, label));
      if (v.supportingText === "true" && sub) text.appendChild(h("span", null, sub));
      row.appendChild(text);
      if (trailing) row.appendChild(h("em", null, trailing));
      body.appendChild(row);
      if (v.withDividers === "true") body.appendChild(h("div", "status-divider"));
    }

    if (kind === "CircularProgress") {
      const wrap = h("div", "status-progress-wrap");
      const ring = h("div", "status-ring" + (v.determinateProgress === "true" ? "" : " indeterminate"));
      if (v.determinateProgress === "true") ring.style.setProperty("--p", progress + "%");
      ring.appendChild(h("strong", null, v.determinateProgress === "true" ? progress + "%" : ""));
      wrap.appendChild(ring);
      wrap.appendChild(h("p", null, v.determinateProgress === "true" ? "Normalized progress value: " + (progress / 100).toFixed(2) + "f" : "Indeterminate while the duration is unknown."));
      body.appendChild(wrap);
    } else if (kind === "LinearProgress") {
      const wrap = h("div", "status-progress-wrap wide");
      const bar = h("div", "status-linear" + (v.determinateProgress === "true" ? "" : " indeterminate"));
      if (v.determinateProgress === "true") bar.appendChild(h("span", null, ""));
      if (v.determinateProgress === "true") bar.querySelector("span").style.width = progress + "%";
      wrap.appendChild(bar);
      wrap.appendChild(h("p", null, v.determinateProgress === "true" ? progress + "% complete, passed as " + (progress / 100).toFixed(2) + "f." : "Indeterminate bar shows active work without a percent."));
      body.appendChild(wrap);
    } else if (kind === "PullToRefresh") {
      const refresh = h("div", "status-refresh" + (v.refreshing === "true" ? " refreshing" : "") + (v.customIndicator === "true" ? " custom" : ""));
      refresh.appendChild(h("div", "status-refresh-indicator", v.refreshing === "true" ? "" : "Pull"));
      body.appendChild(refresh);
      ["Inbox synced", "Design review", "Release notes"].forEach(function (label, idx) {
        addListRow(label, idx === 0 ? "PullToRefreshBox wraps the LazyColumn." : "isRefreshing stays controlled by caller state.", idx === 0 ? "now" : "");
      });
    } else if (kind === "Divider") {
      const demo = h("div", "status-divider-demo");
      demo.appendChild(h("b", null, "HorizontalDivider"));
      demo.appendChild(h("div", "status-divider"));
      const row = h("div", "status-vdivider-row");
      row.appendChild(h("span", null, "Start"));
      row.appendChild(h("i", null, ""));
      row.appendChild(h("span", null, "End"));
      demo.appendChild(row);
      demo.appendChild(h("p", null, "Use horizontal in columns and vertical in height-bounded rows."));
      body.appendChild(demo);
    } else if (kind === "Carousel") {
      const rail = h("div", "status-carousel" + (v.carouselUncontained === "true" ? " uncontained" : ""));
      for (let i = 0; i < count; i += 1) {
        const item = h("div", "status-carousel-item c" + (i % 4));
        item.appendChild(h("span", null, "Item " + (i + 1)));
        rail.appendChild(item);
      }
      body.appendChild(rail);
      body.appendChild(h("p", "status-note", v.carouselUncontained === "true" ? "HorizontalUncontainedCarousel uses itemWidth." : "HorizontalMultiBrowseCarousel uses preferredItemWidth."));
    } else {
      ["Saved report", "Offline copy", "Shared folder"].forEach(function (label, idx) {
        addListRow(label, idx === 0 ? "ListItem headline + supporting slots." : "Rows stay scannable and accessible.", idx === 2 ? "New" : "");
      });
    }

    shell.appendChild(body);
    const label = h("div", "status-label");
    label.appendChild(h("b", null, kind));
    label.appendChild(h("span", null, kind === "Carousel" ? "state + item sizing" : kind === "PullToRefresh" ? "refresh state + scroll content" : kind === "ListItem" ? "slots + separators" : "operation status"));
    shell.appendChild(label);
    stage.appendChild(shell);
  }

  function genStatusContent(pg, v) {
    const kind = v.statusContent || "CircularProgress";
    const progress = (num(v.progressValue, 65) / 100).toFixed(2) + "f";
    if (kind === "CircularProgress") {
      if (v.determinateProgress === "true") {
        return "@Composable\nfun CircularUploadProgress(\n  progress: Float,\n  modifier: Modifier = Modifier\n) {\n  val normalized = progress.coerceIn(0f, 1f)\n\n  CircularProgressIndicator(\n    progress = { normalized },\n    modifier = modifier.semantics {\n      progressBarRangeInfo = ProgressBarRangeInfo(normalized, 0f..1f)\n    },\n    color = MaterialTheme.colorScheme.primary,\n    trackColor = MaterialTheme.colorScheme.surfaceVariant\n  )\n}\n\n@Composable\nfun UploadStatus() {\n  CircularUploadProgress(progress = " + progress + ")\n}";
      }
      return "@Composable\nfun BlockingWorkIndicator(modifier: Modifier = Modifier) {\n  CircularProgressIndicator(\n    modifier = modifier.size(48.dp),\n    color = MaterialTheme.colorScheme.secondary,\n    trackColor = MaterialTheme.colorScheme.surfaceVariant\n  )\n}";
    }
    if (kind === "LinearProgress") {
      if (v.determinateProgress === "true") {
        return "@Composable\nfun LinearDownloadProgress(\n  progress: Float,\n  modifier: Modifier = Modifier\n) {\n  val normalized = progress.coerceIn(0f, 1f)\n\n  LinearProgressIndicator(\n    progress = { normalized },\n    modifier = modifier.fillMaxWidth(),\n    color = MaterialTheme.colorScheme.primary,\n    trackColor = MaterialTheme.colorScheme.surfaceVariant\n  )\n}\n\n@Composable\nfun DownloadStatus() {\n  LinearDownloadProgress(progress = " + progress + ")\n}";
      }
      return "@Composable\nfun LoadingResultsBar(modifier: Modifier = Modifier) {\n  LinearProgressIndicator(\n    modifier = modifier.fillMaxWidth(),\n    color = MaterialTheme.colorScheme.primary,\n    trackColor = MaterialTheme.colorScheme.surfaceVariant\n  )\n}";
    }
    if (kind === "PullToRefresh") {
      const indicator = v.customIndicator === "true"
        ? ",\n    state = state,\n    indicator = {\n      Indicator(\n        modifier = Modifier.align(Alignment.TopCenter),\n        isRefreshing = isRefreshing,\n        containerColor = MaterialTheme.colorScheme.primaryContainer,\n        color = MaterialTheme.colorScheme.onPrimaryContainer,\n        state = state\n      )\n    }"
        : ",\n    state = state";
      const divider = v.withDividers === "true" ? "\n        HorizontalDivider(Modifier.padding(start = 72.dp))" : "";
      const support = v.supportingText === "true" ? ",\n          supportingContent = { Text(message.preview) }" : "";
      return "@OptIn(ExperimentalMaterial3Api::class)\n@Composable\nfun RefreshableMessageList(\n  messages: List<MessageUi>,\n  isRefreshing: Boolean,\n  onRefresh: () -> Unit,\n  modifier: Modifier = Modifier\n) {\n  val state = rememberPullToRefreshState()\n\n  PullToRefreshBox(\n    isRefreshing = isRefreshing,\n    onRefresh = onRefresh,\n    modifier = modifier.fillMaxSize()" + indicator + "\n  ) {\n    LazyColumn(Modifier.fillMaxSize()) {\n      items(\n        items = messages,\n        key = { message -> message.id },\n        contentType = { \"message\" }\n      ) { message ->\n        ListItem(\n          headlineContent = { Text(message.title) }" + support + ",\n          leadingContent = { Icon(Icons.Default.Mail, contentDescription = null) },\n          trailingContent = { Text(message.time) }\n        )" + divider + "\n      }\n    }\n  }\n}";
    }
    if (kind === "ListItem") {
      const divider = v.withDividers === "true" ? "\n        HorizontalDivider(Modifier.padding(start = 72.dp))" : "";
      const support = v.supportingText === "true" ? ",\n          supportingContent = { Text(item.subtitle) }" : "";
      return "@Composable\nfun FileList(\n  items: List<FileRowUi>,\n  onOpenFile: (String) -> Unit,\n  modifier: Modifier = Modifier\n) {\n  LazyColumn(modifier) {\n    items(\n      items = items,\n      key = { item -> item.id },\n      contentType = { \"file-row\" }\n    ) { item ->\n      ListItem(\n        headlineContent = { Text(item.title) }" + support + ",\n        leadingContent = { Icon(item.icon, contentDescription = null) },\n        trailingContent = { Text(item.updatedLabel) },\n        modifier = Modifier.clickable { onOpenFile(item.id) }\n      )" + divider + "\n    }\n  }\n}";
    }
    if (kind === "Divider") {
      return "@Composable\nfun DividerExamples(modifier: Modifier = Modifier) {\n  Column(modifier, verticalArrangement = Arrangement.spacedBy(12.dp)) {\n    Text(\"First item\")\n    HorizontalDivider(\n      thickness = 1.dp,\n      color = MaterialTheme.colorScheme.outlineVariant\n    )\n    Text(\"Second item\")\n\n    Row(\n      modifier = Modifier.height(IntrinsicSize.Min),\n      horizontalArrangement = Arrangement.spacedBy(12.dp)\n    ) {\n      Text(\"Left\")\n      VerticalDivider(color = MaterialTheme.colorScheme.outlineVariant)\n      Text(\"Right\")\n    }\n  }\n}";
    }
    const carousel = v.carouselUncontained === "true" ? "HorizontalUncontainedCarousel" : "HorizontalMultiBrowseCarousel";
    const sizing = v.carouselUncontained === "true" ? "itemWidth = 186.dp" : "preferredItemWidth = 186.dp";
    return "@OptIn(ExperimentalMaterial3Api::class)\n@Composable\nfun FeaturedCarousel(\n  items: List<FeaturedItem>,\n  modifier: Modifier = Modifier\n) {\n  " + carousel + "(\n    state = rememberCarouselState { items.count() },\n    modifier = modifier\n      .fillMaxWidth()\n      .wrapContentHeight()\n      .padding(vertical = 16.dp),\n    " + sizing + ",\n    itemSpacing = 8.dp,\n    contentPadding = PaddingValues(horizontal = 16.dp)\n  ) { index ->\n    val item = items[index]\n    Image(\n      painter = painterResource(item.imageResId),\n      contentDescription = item.contentDescription,\n      contentScale = ContentScale.Crop,\n      modifier = Modifier\n        .height(205.dp)\n        .maskClip(MaterialTheme.shapes.extraLarge)\n    )\n  }\n}";
  }

  function pvTransientSurface(pg, v, stage) {
    const kind = v.transientSurface || "Dialog";
    stage.classList.add("transient-stage");
    stage.style.display = "grid";
    stage.style.placeItems = "center";
    stage.style.padding = "16px";
    const phone = h("div", "transient-phone");
    phone.appendChild(h("div", "transient-appbar", "<b>Inbox</b><span>⋮</span>"));
    const body = h("div", "transient-body");
    body.innerHTML = '<div class="transient-line w90"></div><div class="transient-line w70"></div><div class="transient-row"><span></span><div><i></i><i></i></div></div><div class="transient-row"><span></span><div><i></i><i></i></div></div>';
    phone.appendChild(body);
    if (kind === "Badge") {
      const badge = h("div", "transient-badged", "✉");
      badge.appendChild(h("em", null, v.surfaceVisible === "true" ? "12" : ""));
      phone.appendChild(badge);
    } else if (kind === "Tooltip") {
      phone.appendChild(h("button", "transient-anchor", "?"));
      if (v.surfaceVisible === "true") {
        phone.appendChild(h("div", "transient-tooltip" + (v.richContent === "true" ? " rich" : ""), v.richContent === "true" ? "<b>Keyboard shortcut</b><span>Use Ctrl+K to jump back to search.</span>" : "Search"));
      }
    } else if (kind === "Menu") {
      phone.appendChild(h("button", "transient-anchor menu", "⋮"));
      if (v.surfaceVisible === "true") {
        const menu = h("div", "transient-menu");
        ["Profile", "Settings", v.destructiveAction === "true" ? "Delete" : "Help"].forEach(function (label, idx) {
          menu.appendChild(h("div", idx === 2 && v.destructiveAction === "true" ? "danger" : null, label));
        });
        phone.appendChild(menu);
      }
    } else if (kind === "Snackbar") {
      if (v.surfaceVisible === "true") phone.appendChild(h("div", "transient-snackbar", "<span>" + (v.destructiveAction === "true" ? "Message deleted" : "Saved") + "</span>" + (v.hasUndo === "true" ? "<button>Undo</button>" : "")));
    } else if (kind === "BottomSheet") {
      if (v.surfaceVisible === "true") {
        const sheet = h("div", "transient-sheet" + (v.partialSheet === "true" ? " partial" : ""));
        sheet.innerHTML = "<i></i><b>Sort and filter</b><span>Supplemental controls stay in context.</span><button>Apply</button>";
        phone.appendChild(sheet);
      }
    } else {
      if (v.surfaceVisible === "true") {
        const scrim = h("div", "transient-scrim");
        const dialog = h("div", "transient-dialog");
        dialog.innerHTML = "<b>" + (v.destructiveAction === "true" ? "Delete message?" : "Discard draft?") + "</b><span>" + (v.richContent === "true" ? "This action cannot be undone after sync completes." : "Confirm before leaving this task.") + "</span><div><button>Cancel</button><button>" + (v.destructiveAction === "true" ? "Delete" : "Confirm") + "</button></div>";
        phone.appendChild(scrim);
        phone.appendChild(dialog);
      }
    }
    const label = h("div", "transient-label");
    label.appendChild(h("b", null, kind));
    label.appendChild(h("span", null, v.surfaceVisible === "true" ? "visible temporary surface" : "hidden state"));
    phone.appendChild(label);
    stage.appendChild(phone);
  }
  function genTransientSurface(pg, v) {
    const kind = v.transientSurface || "Dialog";
    if (kind === "Snackbar") {
      const action = v.hasUndo === "true" ? ',\n          actionLabel = "Undo",\n          withDismissAction = true,\n          duration = SnackbarDuration.Short' : "";
      return "@Composable\nfun DeleteMessageAction(onUndo: () -> Unit) {\n  val snackbarHostState = remember { SnackbarHostState() }\n  val scope = rememberCoroutineScope()\n\n  Scaffold(\n    snackbarHost = { SnackbarHost(snackbarHostState) }\n  ) { innerPadding ->\n    Button(\n      onClick = {\n        scope.launch {\n          val result = snackbarHostState.showSnackbar(\n            message = \"Message deleted\"" + action + "\n          )\n          if (result == SnackbarResult.ActionPerformed) onUndo()\n        }\n      },\n      modifier = Modifier.padding(innerPadding)\n    ) {\n      Text(\"Delete\")\n    }\n  }\n}";
    }
    if (kind === "BottomSheet") {
      const partial = v.partialSheet === "true" ? "skipPartiallyExpanded = false" : "skipPartiallyExpanded = true";
      return "@OptIn(ExperimentalMaterial3Api::class)\n@Composable\nfun FilterSheet() {\n  var showSheet by rememberSaveable { mutableStateOf(false) }\n  val sheetState = rememberModalBottomSheetState(" + partial + ")\n  val scope = rememberCoroutineScope()\n\n  Button(onClick = { showSheet = true }) { Text(\"Filters\") }\n\n  if (showSheet) {\n    ModalBottomSheet(\n      sheetState = sheetState,\n      onDismissRequest = { showSheet = false }\n    ) {\n      Text(\"Sort and filter\", style = MaterialTheme.typography.titleLarge)\n      Button(onClick = {\n        scope.launch { sheetState.hide() }.invokeOnCompletion {\n          if (!sheetState.isVisible) showSheet = false\n        }\n      }) {\n        Text(\"Apply\")\n      }\n    }\n  }\n}";
    }
    if (kind === "Menu") {
      return "@Composable\nfun OverflowMenu() {\n  var expanded by remember { mutableStateOf(false) }\n\n  Box {\n    IconButton(onClick = { expanded = true }) {\n      Icon(Icons.Default.MoreVert, contentDescription = \"More options\")\n    }\n    DropdownMenu(\n      expanded = expanded,\n      onDismissRequest = { expanded = false }\n    ) {\n      DropdownMenuItem(\n        text = { Text(\"Settings\") },\n        onClick = {\n          expanded = false\n          // Open settings\n        },\n        leadingIcon = { Icon(Icons.Default.Settings, contentDescription = null) }\n      )\n      DropdownMenuItem(\n        text = { Text(\"Help\") },\n        onClick = { expanded = false }\n      )\n    }\n  }\n}";
    }
    if (kind === "Tooltip") {
      const rich = v.richContent === "true"
        ? "RichTooltip(\n        title = { Text(\"Keyboard shortcut\") }\n      ) { Text(\"Use Ctrl+K to jump back to search.\") }"
        : "PlainTooltip { Text(\"Search\") }";
      const provider = v.richContent === "true" ? "rememberRichTooltipPositionProvider" : "rememberPlainTooltipPositionProvider";
      return "@OptIn(ExperimentalMaterial3Api::class)\n@Composable\nfun SearchTooltip() {\n  TooltipBox(\n    positionProvider = TooltipDefaults." + provider + "(),\n    tooltip = { " + rich + " },\n    state = rememberTooltipState()\n  ) {\n    IconButton(onClick = { /* search */ }) {\n      Icon(Icons.Default.Search, contentDescription = \"Search\")\n    }\n  }\n}";
    }
    if (kind === "Badge") {
      return "@Composable\nfun MessagesIcon(unreadCount: Int) {\n  BadgedBox(\n    badge = {\n      if (unreadCount > 0) {\n        Badge { Text(unreadCount.coerceAtMost(99).toString()) }\n      }\n    }\n  ) {\n    Icon(\n      imageVector = Icons.Default.Mail,\n      contentDescription = \"Messages\"\n    )\n  }\n}";
    }
    const dialogName = v.richContent === "true" ? "Dialog" : "AlertDialog";
    if (dialogName === "Dialog") {
      return "@Composable\nfun EditNameDialog(\n  onDismiss: () -> Unit,\n  onSave: () -> Unit\n) {\n  Dialog(onDismissRequest = onDismiss) {\n    Card(\n      modifier = Modifier\n        .fillMaxWidth()\n        .padding(16.dp),\n      shape = RoundedCornerShape(28.dp)\n    ) {\n      Column(Modifier.padding(24.dp)) {\n        Text(\"Edit profile\", style = MaterialTheme.typography.titleLarge)\n        OutlinedTextField(value = \"Ada\", onValueChange = {})\n        Row(horizontalArrangement = Arrangement.End, modifier = Modifier.fillMaxWidth()) {\n          TextButton(onClick = onDismiss) { Text(\"Cancel\") }\n          TextButton(onClick = onSave) { Text(\"Save\") }\n        }\n      }\n    }\n  }\n}";
    }
    return "@Composable\nfun DeleteDialog(\n  onDismiss: () -> Unit,\n  onConfirm: () -> Unit\n) {\n  AlertDialog(\n    icon = { Icon(Icons.Default.Warning, contentDescription = null) },\n    title = { Text(\"Delete message?\") },\n    text = { Text(\"This removes the message from this device.\") },\n    onDismissRequest = onDismiss,\n    confirmButton = {\n      TextButton(onClick = onConfirm) { Text(\"Delete\") }\n    },\n    dismissButton = {\n      TextButton(onClick = onDismiss) { Text(\"Cancel\") }\n    }\n  )\n}";
  }

  function pvNavigationSurface(pg, v, stage) {
    const kind = v.navSurface || "TopAppBar";
    const wide = v.wideWindow === "true";
    stage.classList.add("navsurface-stage");
    stage.style.display = "grid";
    stage.style.placeItems = "center";
    stage.style.padding = "16px";
    const shell = h("div", "navsurface-shell" + (wide ? " wide" : ""));
    const screen = h("div", "navsurface-screen");
    const content = h("div", "navsurface-content");
    content.innerHTML = '<div class="navsurface-line w85"></div><div class="navsurface-line w62"></div><div class="navsurface-card"><b>Current destination</b><span>Selection is owned by the app shell.</span></div>';

    function topBar(label) {
      return h("div", "navsurface-top" + (v.scrollBehavior === "true" ? " collapsing" : ""), '<button>‹</button><b>' + label + '</b><span>⌕ ⋮</span>');
    }
    function destination(label, selected) {
      const item = h("div", "navsurface-item" + (selected ? " selected" : ""));
      item.appendChild(h("i", null, label.slice(0, 1)));
      item.appendChild(h("span", null, label));
      if (v.showBadges === "true" && label === "Inbox") item.appendChild(h("em", null, "7"));
      return item;
    }
    function rail() {
      const r = h("div", "navsurface-rail");
      ["Home", "Inbox", "Saved", "Settings"].forEach(function (label, idx) { r.appendChild(destination(label, idx === 1)); });
      return r;
    }
    function navBar() {
      const b = h("div", "navsurface-bar");
      ["Home", "Inbox", "Saved"].forEach(function (label, idx) { b.appendChild(destination(label, idx === 1)); });
      return b;
    }

    if (kind === "NavigationRail") {
      shell.appendChild(rail());
      screen.appendChild(topBar("Inbox"));
      screen.appendChild(content);
      shell.appendChild(screen);
    } else if (kind === "NavigationBar") {
      screen.appendChild(topBar("Inbox"));
      screen.appendChild(content);
      screen.appendChild(navBar());
      shell.appendChild(screen);
    } else if (kind === "Drawer") {
      screen.appendChild(topBar("Files"));
      screen.appendChild(content);
      if (v.drawerOpen === "true") {
        screen.appendChild(h("div", "navsurface-scrim"));
        const drawer = h("div", "navsurface-drawer");
        drawer.appendChild(h("b", null, "Workspace"));
        ["Home", "Inbox", "Archive", "Settings"].forEach(function (label, idx) { drawer.appendChild(destination(label, idx === 1)); });
        screen.appendChild(drawer);
      }
      shell.appendChild(screen);
    } else if (kind === "Tabs") {
      screen.appendChild(topBar("Trips"));
      const tabs = h("div", "navsurface-tabs" + (v.secondaryTabs === "true" ? " secondary" : ""));
      ["Overview", "Details", "Activity"].forEach(function (label, idx) { tabs.appendChild(h("button", idx === 1 ? "selected" : null, label)); });
      screen.appendChild(tabs);
      content.appendChild(h("div", "navsurface-tabhint", v.secondaryTabs === "true" ? "SecondaryTabRow inside content" : "PrimaryTabRow below app bar"));
      screen.appendChild(content);
      shell.appendChild(screen);
    } else {
      screen.appendChild(topBar(v.scrollBehavior === "true" ? "Collapsing app bar" : "Article"));
      screen.appendChild(content);
      shell.appendChild(screen);
    }
    const label = h("div", "navsurface-label");
    label.appendChild(h("b", null, kind));
    label.appendChild(h("span", null, wide ? "large-window shell" : "compact shell"));
    screen.appendChild(label);
    stage.appendChild(shell);
  }

  function genNavigationSurface(pg, v) {
    const kind = v.navSurface || "TopAppBar";
    if (kind === "NavigationBar") {
      const badge = v.showBadges === "true"
        ? "BadgedBox(badge = { Badge { Text(\"7\") } }) {\n              Icon(destination.icon, contentDescription = destination.label)\n            }"
        : "Icon(destination.icon, contentDescription = destination.label)";
      return "enum class AppDestination(\n  val route: String,\n  val label: String,\n  val icon: ImageVector\n) {\n  Home(\"home\", \"Home\", Icons.Default.Home),\n  Inbox(\"inbox\", \"Inbox\", Icons.Default.Inbox),\n  Saved(\"saved\", \"Saved\", Icons.Default.Bookmark)\n}\n\n@Composable\nfun CompactNavigationShell(\n  current: AppDestination,\n  onDestinationClick: (AppDestination) -> Unit,\n  content: @Composable (PaddingValues) -> Unit\n) {\n  Scaffold(\n    bottomBar = {\n      NavigationBar(windowInsets = NavigationBarDefaults.windowInsets) {\n        AppDestination.entries.forEach { destination ->\n          NavigationBarItem(\n            selected = current == destination,\n            onClick = { onDestinationClick(destination) },\n            icon = {\n              " + badge + "\n            },\n            label = { Text(destination.label) }\n          )\n        }\n      }\n    }\n  ) { innerPadding ->\n    content(innerPadding)\n  }\n}";
    }
    if (kind === "NavigationRail") {
      const fab = v.showBadges === "true" ? "\n    header = {\n      FloatingActionButton(onClick = { /* create */ }) {\n        Icon(Icons.Default.Add, contentDescription = \"Create\")\n      }\n    }," : "";
      return "@Composable\nfun WideNavigationShell(\n  current: AppDestination,\n  onDestinationClick: (AppDestination) -> Unit,\n  content: @Composable () -> Unit\n) {\n  Row(Modifier.fillMaxSize()) {\n    NavigationRail(" + fab + "\n    ) {\n      AppDestination.entries.forEach { destination ->\n        NavigationRailItem(\n          selected = current == destination,\n          onClick = { onDestinationClick(destination) },\n          icon = { Icon(destination.icon, contentDescription = destination.label) },\n          label = { Text(destination.label) }\n        )\n      }\n    }\n\n    Box(Modifier.weight(1f)) {\n      content()\n    }\n  }\n}";
    }
    if (kind === "Drawer") {
      return "@OptIn(ExperimentalMaterial3Api::class)\n@Composable\nfun DrawerNavigationShell(\n  current: AppDestination,\n  onDestinationClick: (AppDestination) -> Unit,\n  content: @Composable (PaddingValues) -> Unit\n) {\n  val drawerState = rememberDrawerState(initialValue = DrawerValue.Closed)\n  val scope = rememberCoroutineScope()\n\n  ModalNavigationDrawer(\n    drawerState = drawerState,\n    drawerContent = {\n      ModalDrawerSheet {\n        Text(\"Workspace\", Modifier.padding(16.dp))\n        HorizontalDivider()\n        AppDestination.entries.forEach { destination ->\n          NavigationDrawerItem(\n            selected = current == destination,\n            onClick = {\n              onDestinationClick(destination)\n              scope.launch { drawerState.close() }\n            },\n            icon = { Icon(destination.icon, contentDescription = null) },\n            label = { Text(destination.label) },\n            modifier = Modifier.padding(NavigationDrawerItemDefaults.ItemPadding)\n          )\n        }\n      }\n    }\n  ) {\n    Scaffold(\n      topBar = {\n        TopAppBar(\n          title = { Text(current.label) },\n          navigationIcon = {\n            IconButton(onClick = { scope.launch { drawerState.open() } }) {\n              Icon(Icons.Default.Menu, contentDescription = \"Open navigation drawer\")\n            }\n          }\n        )\n      }\n    ) { innerPadding ->\n      content(innerPadding)\n    }\n  }\n}";
    }
    if (kind === "Tabs") {
      const row = v.secondaryTabs === "true" ? "SecondaryTabRow" : "PrimaryTabRow";
      return "@OptIn(ExperimentalMaterial3Api::class)\n@Composable\nfun TripTabs(\n  selectedTab: Int,\n  onTabSelected: (Int) -> Unit,\n  modifier: Modifier = Modifier\n) {\n  val tabs = listOf(\"Overview\", \"Details\", \"Activity\")\n\n  Column(modifier) {\n    " + row + "(selectedTabIndex = selectedTab) {\n      tabs.forEachIndexed { index, label ->\n        Tab(\n          selected = selectedTab == index,\n          onClick = { onTabSelected(index) },\n          text = { Text(label) },\n          icon = if (" + (v.showBadges === "true" ? "true" : "false") + " && index == 2) {\n            { Badge { Text(\"3\") } }\n          } else null\n        )\n      }\n    }\n\n    when (selectedTab) {\n      0 -> OverviewPane()\n      1 -> DetailsPane()\n      2 -> ActivityPane()\n    }\n  }\n}";
    }
    const scroll = v.scrollBehavior === "true"
      ? "  val scrollBehavior = TopAppBarDefaults.exitUntilCollapsedScrollBehavior()\n\n  Scaffold(\n    modifier = modifier.nestedScroll(scrollBehavior.nestedScrollConnection),\n    topBar = {\n      LargeTopAppBar(\n        title = { Text(\"Inbox\") },\n        navigationIcon = {\n          IconButton(onClick = onNavigateBack) {\n            Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = \"Navigate back\")\n          }\n        },\n        actions = {\n          IconButton(onClick = onSearch) {\n            Icon(Icons.Default.Search, contentDescription = \"Search\")\n          }\n        },\n        scrollBehavior = scrollBehavior\n      )\n    }\n  ) { innerPadding ->\n    content(innerPadding)\n  }"
      : "  Scaffold(\n    modifier = modifier,\n    topBar = {\n      CenterAlignedTopAppBar(\n        title = { Text(\"Inbox\") },\n        navigationIcon = {\n          IconButton(onClick = onNavigateBack) {\n            Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = \"Navigate back\")\n          }\n        },\n        actions = {\n          IconButton(onClick = onSearch) {\n            Icon(Icons.Default.Search, contentDescription = \"Search\")\n          }\n        }\n      )\n    }\n  ) { innerPadding ->\n    content(innerPadding)\n  }";
    return "@OptIn(ExperimentalMaterial3Api::class)\n@Composable\nfun InboxTopAppBar(\n  onNavigateBack: () -> Unit,\n  onSearch: () -> Unit,\n  modifier: Modifier = Modifier,\n  content: @Composable (PaddingValues) -> Unit\n) {\n" + scroll + "\n}";
  }

  function pvInterop(pg, v, stage) {
    const mode = v.interopMode || "ComposeView";
    stage.classList.add("interop-stage");
    stage.style.display = "grid";
    stage.style.placeItems = "center";
    stage.style.padding = "16px";
    const shell = h("div", "interop-shell");
    const host = h("div", "interop-host", mode === "AndroidView" || mode === "AndroidFragment" ? "Compose host" : "View host");
    const island = h("div", "interop-island");
    if (mode === "ComposeView") {
      island.innerHTML = "<b>ComposeView</b><span>setContent { Screen() }</span>";
      if (v.lifecycleStrategy === "true") island.appendChild(h("em", null, "DisposeOnViewTreeLifecycleDestroyed"));
    } else if (mode === "AndroidView") {
      island.innerHTML = "<b>AndroidView</b><span>factory + update</span>";
      island.appendChild(h("em", null, v.viewReuse === "true" ? "onReset enables lazy reuse" : "no onReset"));
    } else if (mode === "AndroidFragment") {
      island.innerHTML = "<b>AndroidFragment</b><span>transitionary Fragment host</span>";
      island.appendChild(h("em", null, "removed with composition"));
    } else {
      island.innerHTML = "<b>AbstractComposeView</b><span>View wrapper around a composable</span>";
      if (v.lifecycleStrategy === "true") island.appendChild(h("em", null, "theme + mutable inputs"));
    }
    if (v.nestedScrollInterop === "true") host.appendChild(h("div", "interop-bridge", "nested scroll bridge"));
    host.appendChild(island);
    shell.appendChild(host);
    stage.appendChild(shell);
  }
  function genInterop(pg, v) {
    const mode = v.interopMode || "ComposeView";
    if (mode === "AndroidView") {
      const reset = v.viewReuse === "true" ? ",\n    onReset = { view -> view.clearTransientState() }" : "";
      const scroll = v.nestedScrollInterop === "true" ? "\n    modifier = Modifier\n      .fillMaxSize()\n      .nestedScroll(rememberNestedScrollInteropConnection())," : "\n    modifier = Modifier.fillMaxSize(),";
      return "@Composable\nfun LegacyMapPanel(selectedId: String?) {\n  AndroidView(" + scroll + "\n    factory = { context ->\n      LegacyMapView(context).apply {\n        setOnMarkerClickListener { marker ->\n          // View -> Compose: send events to state owner.\n          true\n        }\n      }\n    },\n    update = { view ->\n      // Compose -> View: write the latest state into the View.\n      view.selectedMarkerId = selectedId\n    }" + reset + "\n  )\n}";
    }
    if (mode === "AndroidFragment") {
      return "@Composable\nfun LegacyChartFragmentHost(id: String, modifier: Modifier = Modifier) {\n  AndroidFragment<LegacyChartFragment>(\n    modifier = modifier.fillMaxSize(),\n    arguments = bundleOf(\"chart_id\" to id),\n    onUpdate = { fragment ->\n      fragment.showChart(id)\n    }\n  )\n}";
    }
    if (mode === "AbstractComposeView") {
      return "class CallToActionView @JvmOverloads constructor(\n  context: Context,\n  attrs: AttributeSet? = null,\n  defStyle: Int = 0\n) : AbstractComposeView(context, attrs, defStyle) {\n  var text by mutableStateOf(\"\")\n  var onClick by mutableStateOf<() -> Unit>({})\n\n  @Composable\n  override fun Content() {\n    AppTheme {\n      CallToActionButton(text = text, onClick = onClick)\n    }\n  }\n}";
    }
    const strategy = v.lifecycleStrategy === "true"
      ? "\n      setViewCompositionStrategy(ViewCompositionStrategy.DisposeOnViewTreeLifecycleDestroyed)"
      : "";
    return "class NewFeatureFragment : Fragment() {\n  override fun onCreateView(\n    inflater: LayoutInflater,\n    container: ViewGroup?,\n    savedInstanceState: Bundle?\n  ): View {\n    return ComposeView(requireContext()).apply {" + strategy + "\n      setContent {\n        AppTheme {\n          NewFeatureScreen()\n        }\n      }\n    }\n  }\n}";
  }

  function pvNav3(pg, v, stage) {
    const mode = v.nav3Mode || "Basic";
    const count = mode === "Scenes" ? 3 : mode === "Basic" ? 2 : 4;
    stage.classList.add("nav3-stage");
    stage.style.display = "grid";
    stage.style.placeItems = "center";
    stage.style.padding = "16px";
    const shell = h("div", "nav3-shell");
    const stack = h("div", "nav3-stack");
    stack.appendChild(h("div", "nav3-label", "Owned back stack"));
    for (let i = 0; i < count; i++) {
      const key = h("div", "nav3-key k" + i);
      key.appendChild(h("b", null, i === 0 ? "Home" : i === 1 ? "Product(" + (v.serializableKeys === "true" ? '"42"' : "42") + ")" : i === 2 ? "Cart" : "Dialog"));
      key.appendChild(h("span", null, v.serializableKeys === "true" ? "@Serializable NavKey" : "runtime key"));
      stack.appendChild(key);
    }
    const display = h("div", "nav3-display");
    display.appendChild(h("div", "nav3-label", mode === "Scenes" ? "NavDisplay + SceneStrategy" : "NavDisplay"));
    const panes = h("div", "nav3-panes");
    const paneCount = mode === "Scenes" ? 2 : 1;
    for (let i = 0; i < paneCount; i++) panes.appendChild(h("div", "nav3-pane", i === 0 ? "List entry" : "Detail entry"));
    display.appendChild(panes);
    const badges = h("div", "nav3-badges");
    if (v.entryDecorators === "true" || mode === "Decorators") badges.appendChild(h("span", null, "entry decorators"));
    if (v.sceneMetadata === "true" || mode === "Scenes") badges.appendChild(h("span", null, "metadata"));
    if (mode === "Saved") badges.appendChild(h("span", null, "rememberNavBackStack"));
    if (badges.children.length) display.appendChild(badges);
    shell.appendChild(stack);
    shell.appendChild(display);
    stage.appendChild(shell);
  }

  function genNav3(pg, v) {
    const mode = v.nav3Mode || "Basic";
    const serializable = v.serializableKeys === "true";
    const decorators = v.entryDecorators === "true" || mode === "Decorators";
    const metadataOn = v.sceneMetadata === "true" || mode === "Scenes";
    const annotations = serializable ? "@Serializable\n" : "";
    const keyType = serializable ? " : NavKey" : "";
    const home = annotations + "data object Home" + keyType;
    const detail = annotations + "data class Product(val id: String)" + keyType;
    const stack = mode === "Saved" || serializable
      ? "val backStack = rememberNavBackStack(Home)"
      : "val backStack = remember { mutableStateListOf<Any>(Home) }";
    const decoratorBlock = decorators
      ? "\n    entryDecorators = listOf(\n      rememberSaveableStateHolderNavEntryDecorator(),\n      rememberViewModelStoreNavEntryDecorator()\n    ),"
      : "";
    const transitionMetadata = metadataOn && mode !== "Scenes"
      ? "\n      metadata = metadata {\n        put(NavDisplay.TransitionKey) { fadeIn() togetherWith fadeOut() }\n      }"
      : "";
    const homeEntry = mode === "Scenes"
      ? "entry<Home>(\n        metadata = ListDetailSceneStrategy.listPane()\n      )"
      : "entry<Home>";
    const productEntry = mode === "Scenes"
      ? "entry<Product>(\n        metadata = ListDetailSceneStrategy.detailPane()\n      )"
      : metadataOn ? "entry<Product>(" + transitionMetadata + "\n      )" : "entry<Product>";
    const scenePrep = mode === "Scenes"
      ? "\n  val listDetailStrategy = rememberListDetailSceneStrategy<NavKey>()\n"
      : "";
    const sceneBlock = mode === "Scenes"
      ? "\n    sceneStrategies = listOf(listDetailStrategy),"
      : "";
    return home + "\n" + detail + "\n\n@Composable\nfun ProductNavigation() {\n  " + stack + scenePrep + "\n  NavDisplay(\n    backStack = backStack,\n    onBack = { backStack.removeLastOrNull() }," + decoratorBlock + sceneBlock + "\n    entryProvider = entryProvider {\n      " + homeEntry + " {\n        ProductListRoute(\n          onOpenProduct = { id -> backStack.add(Product(id)) }\n        )\n      }\n\n      " + productEntry + " { key ->\n        ProductDetailRoute(\n          id = key.id,\n          onBack = { backStack.removeLastOrNull() }\n        )\n      }\n    }\n  )\n}";
  }

  function pvProfileRow(pg, v, stage) {
    stage.style.display = "flex"; stage.style.padding = "16px";
    stage.style.alignItems = v.verticalAlignment === "Top" ? "flex-start" : v.verticalAlignment === "Bottom" ? "flex-end" : "center";
    const row = h("div", "prow");
    const av = h("div", "prow-av" + (v.avatarShape === "Rounded" ? " rounded" : ""), "A");
    const col = h("div", "prow-col"); col.appendChild(h("div", "prow-name", "Ada Lovelace"));
    if (v.showSubtitle !== "false") col.appendChild(h("div", "prow-sub", "Online"));
    row.appendChild(av); row.appendChild(col);
    if (v.showTrailing !== "false") { const sw = h("div", "msw on prow-tr"); sw.appendChild(h("span", "msw-thumb")); row.appendChild(sw); }
    stage.appendChild(row);
  }
  function genProfileRow(pg, v) {
    const va = v.verticalAlignment || "CenterVertically"; const shape = v.avatarShape === "Rounded" ? "RoundedCornerShape(12.dp)" : "CircleShape";
    let s = "Row(\n    modifier = Modifier.fillMaxWidth().padding(16.dp),\n    verticalAlignment = Alignment." + va + "\n) {\n";
    s += "    Box(\n        Modifier.size(48.dp).clip(" + shape + ").background(MaterialTheme.colorScheme.primaryContainer),\n        contentAlignment = Alignment.Center\n    ) { Text(\"A\") }\n";
    s += "    Spacer(Modifier.width(12.dp))\n";
    s += "    Column(Modifier.weight(1f)) {\n        Text(\"Ada Lovelace\", style = MaterialTheme.typography.titleMedium)\n";
    if (v.showSubtitle !== "false") s += "        Text(\"Online\", style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)\n";
    s += "    }\n";
    if (v.showTrailing !== "false") s += "    Switch(checked = true, onCheckedChange = { })\n";
    return s + "}";
  }

  const COMPONENT_PV = { Button: pvButton, Card: pvCard, Controls: pvControls, TextField: pvTextField, ConstraintLayout: pvConstraintLayout, VisibilityTracking: pvVisibilityTracking, Nesting: pvNesting, Scaffold: pvScaffold, LazyCollections: pvLazyCollections, ImageResource: pvImageResource, SelectionInput: pvSelectionInput, StatusContent: pvStatusContent, TransientSurface: pvTransientSurface, NavigationSurface: pvNavigationSurface, Interop: pvInterop, Nav3: pvNav3, ProfileRow: pvProfileRow };
  const COMPONENT_GEN = { Button: genButton, Card: genCard, Controls: genControls, TextField: genTextField, ConstraintLayout: genConstraintLayout, VisibilityTracking: genVisibilityTracking, Nesting: genNesting, Scaffold: genScaffold, LazyCollections: genLazyCollections, ImageResource: genImageResource, SelectionInput: genSelectionInput, StatusContent: genStatusContent, TransientSurface: genTransientSurface, NavigationSurface: genNavigationSurface, Interop: genInterop, Nav3: genNav3, ProfileRow: genProfileRow };

  // ======================= PLAYGROUND UI =======================
  function buildControl(pg, c, v, onChange) {
    const wrap = h("div", "ctrl");
    if (c.role === "weightPerChild") {
      const n = Math.round(num(v.childCount, pg.childCount || 3));
      for (let i = 0; i < n; i++) {
        (function (i) {
          const lab = h("div", "clab", "<span>" + esc((c.label || "weight") + " — child " + String.fromCharCode(65 + i)) + '</span><span class="cval">' + num(v["weight" + i], 0) + "</span>");
          const inp = h("input"); inp.type = "range"; inp.min = 0; inp.max = 3; inp.step = 1; inp.value = num(v["weight" + i], 1);
          inp.addEventListener("input", function () { v["weight" + i] = inp.value; lab.querySelector(".cval").textContent = inp.value; onChange(); });
          wrap.appendChild(lab); wrap.appendChild(inp);
        })(i);
      }
      return wrap;
    }
    if (TOGGLES.indexOf(c.role) >= 0) {
      const sw = h("label", "switch"); const inp = h("input"); inp.type = "checkbox"; inp.checked = v[c.role] === "true";
      sw.appendChild(inp); sw.appendChild(h("span", "track")); sw.appendChild(h("span", null, esc(c.label || c.role)));
      inp.addEventListener("change", function () { v[c.role] = inp.checked ? "true" : "false"; onChange(); });
      wrap.appendChild(sw); return wrap;
    }
    if (SELECT_OPTS[c.role]) {
      const opts = (c.options && c.options.length ? c.options : SELECT_OPTS[c.role]);
      wrap.appendChild(h("div", "clab", "<span>" + esc(c.label || c.role) + "</span>"));
      const seg = h("div", "seg");
      opts.forEach(function (o) {
        const b = h("button", v[c.role] === o ? "on" : null, esc(o)); b.type = "button";
        b.addEventListener("click", function () { v[c.role] = o; seg.querySelectorAll("button").forEach(function (x) { x.classList.remove("on"); }); b.classList.add("on"); onChange(); });
        seg.appendChild(b);
      });
      wrap.appendChild(seg); return wrap;
    }
    // slider
    const s = SLIDER[c.role] || [0, 100, 1, 0];
    const mn = c.min != null ? c.min : s[0], mx = c.max != null ? c.max : s[1], st = c.step != null ? c.step : s[2];
    const unit = c.unit != null ? c.unit : (c.role === "fontSize") ? "sp" : (c.role === "aspectRatio" || c.role === "fillFraction" || c.role === "nestDepth" || c.role.indexOf("Count") >= 0) ? "" : "dp";
    const lab = h("div", "clab", "<span>" + esc(c.label || c.role) + '</span><span class="cval">' + esc(v[c.role]) + (unit ? " " + unit : "") + "</span>");
    const inp = h("input"); inp.type = "range"; inp.min = mn; inp.max = mx; inp.step = st; inp.value = v[c.role];
    inp.addEventListener("input", function () { v[c.role] = inp.value; lab.querySelector(".cval").textContent = inp.value + (unit ? " " + unit : ""); onChange(); });
    wrap.appendChild(lab); wrap.appendChild(inp); return wrap;
  }

  function buildPlayground(pg) {
    const v = defaults(pg);
    const root = h("div");
    root.appendChild(h("div", "pg-label", "Interactive playground"));
    if (pg.intro) root.appendChild(h("p", "pg-intro", esc(pg.intro)));
    const grid = h("div", "playground");
    const controls = h("div", "pg-controls");
    const right = h("div", "pg-right");
    const preview = h("div", "preview", '<div class="bar"><i></i><i></i><i></i></div>');
    const sw = h("div", "stagewrap"); const stage = h("div", "stage"); sw.appendChild(stage); preview.appendChild(sw);
    const code = h("div", "codepanel"); const ch = h("div", "ch", "<span>Generated Kotlin</span>"); const copy = h("button", null, "Copy"); ch.appendChild(copy);
    const pre = h("pre"); code.appendChild(ch); code.appendChild(pre);
    right.appendChild(preview); right.appendChild(code);

    function render() { applyPreview(pg, v, stage); pre.innerHTML = kt(genKotlin(pg, v)); }
    copy.addEventListener("click", function () { copyText(genKotlin(pg, v), copy, "Copy"); });

    pg.controls.forEach(function (c) { controls.appendChild(buildControl(pg, c, v, render)); });
    grid.appendChild(controls); grid.appendChild(right); root.appendChild(grid);
    render();
    return root;
  }

  // ======================= PAGE RENDER =======================
  function practiceCards() {
    return SECTIONS.flatMap(function (s) {
      const firstPoint = (s.key_points && s.key_points[0]) || s.summary;
      const gotcha = stripHtml(s.gotchas_html).split(". ").filter(Boolean)[0] || "Name the mistake this lesson is designed to prevent.";
      return [
        {
          id: s.id,
          kind: "Explain",
          prompt: "Explain " + s.title + " in one sentence without quoting the lesson.",
          answer: s.summary,
        },
        {
          id: s.id,
          kind: "Predict",
          prompt: "Predict the most likely bug when someone misunderstands " + s.title + ".",
          answer: gotcha,
        },
        {
          id: s.id,
          kind: "Recall",
          prompt: "Recall the rule that should guide code review for " + s.title + ".",
          answer: firstPoint,
        },
      ];
    });
  }

  function gotchaItems() {
    const tmp = document.createElement("div");
    return SECTIONS.flatMap(function (s) {
      tmp.innerHTML = s.gotchas_html || "";
      return Array.prototype.slice.call(tmp.querySelectorAll("li")).map(function (li, idx) {
        const titleNode = li.querySelector("strong");
        const rawTitle = titleNode ? titleNode.textContent : ("Mistake " + (idx + 1));
        const full = li.textContent.replace(/\s+/g, " ").trim();
        const title = rawTitle.replace(/[.:\s]+$/g, "");
        const fix = full.replace(rawTitle, "").replace(/^[.:\s]+/, "").trim() || full;
        return {
          id: s.id,
          section: s.title,
          category: s.category,
          title: title,
          fix: fix,
        };
      });
    });
  }

  function reviewItems(bugs) {
    const byId = {};
    bugs.forEach(function (bug) {
      if (!byId[bug.id]) byId[bug.id] = [];
      byId[bug.id].push(bug);
    });
    return SECTIONS.flatMap(function (s) {
      const refs = refsFor(s);
      const firstBug = (byId[s.id] || [])[0];
      const firstPoint = (s.key_points && s.key_points[0]) || s.summary;
      const secondPoint = (s.key_points && s.key_points[1]) || "Compare the implementation against the lesson's canonical example.";
      const doc = refs[0] || null;
      return [
        {
          id: s.id,
          section: s.title,
          category: s.category,
          type: "Architecture",
          check: firstPoint,
          why: s.summary,
          doc: doc,
        },
        {
          id: s.id,
          section: s.title,
          category: s.category,
          type: "Bug guard",
          check: firstBug ? firstBug.title : secondPoint,
          why: firstBug ? firstBug.fix : stripHtml(s.gotchas_html),
          doc: doc,
        },
        {
          id: s.id,
          section: s.title,
          category: s.category,
          type: "Code example",
          check: "Compare the implementation with the canonical " + s.title + " example.",
          why: secondPoint,
          doc: doc,
        },
      ];
    });
  }

  function sourceAtlasItems() {
    const items = {};
    Object.keys(DOCS).forEach(function (key) {
      items[key] = {
        key: key,
        title: DOCS[key][0],
        url: DOCS[key][1],
        sections: [],
        categories: {},
      };
    });
    SECTIONS.forEach(function (s) {
      refKeysFor(s).forEach(function (key) {
        const item = items[key];
        if (!item) return;
        item.sections.push({ id: s.id, title: s.title, category: s.category });
        item.categories[s.category] = true;
      });
    });
    return Object.keys(items).map(function (key) { return items[key]; })
      .filter(function (item) { return item.sections.length > 0; })
      .sort(function (a, b) {
        if (b.sections.length !== a.sections.length) return b.sections.length - a.sections.length;
        return a.title.localeCompare(b.title);
      });
  }

  function diagnosticItems(bugs) {
    const byId = {};
    bugs.forEach(function (bug) {
      if (!byId[bug.id]) byId[bug.id] = [];
      byId[bug.id].push(bug);
    });
    return SECTIONS.map(function (s) {
      const refs = refsFor(s);
      const gotcha = (byId[s.id] || [])[0];
      return {
        id: s.id,
        section: s.title,
        category: s.category,
        prompt: "Can you explain and apply " + s.title + " without looking it up?",
        expected: (s.key_points && s.key_points[0]) || s.summary,
        evidence: (s.key_points && s.key_points.slice(1, 3).join(" ")) || s.summary,
        trap: gotcha ? gotcha.title + ": " + gotcha.fix : stripHtml(s.gotchas_html).split(". ").slice(0, 2).join(". "),
        doc: refs[0] || null,
      };
    });
  }

  function buildPracticeDeck() {
    const cards = practiceCards();
    let index = 0;
    const root = h("div", "practice-card");
    root.appendChild(h("div", "practice-top",
      '<span class="pg-label">Practice deck</span><span class="practice-count">' + cards.length + " prompts</span>"));
    const kind = h("div", "practice-kind");
    const prompt = h("p", "practice-prompt");
    const answer = h("p", "practice-answer");
    const actions = h("div", "practice-actions");
    const reveal = h("button", null, "Reveal answer");
    const next = h("button", null, "New prompt");
    const jump = h("a", null, "Open lesson");
    const mastered = h("button", null, "Mark lesson mastered");
    [reveal, next, mastered].forEach(function (b) { b.type = "button"; });
    actions.appendChild(reveal); actions.appendChild(next); actions.appendChild(jump); actions.appendChild(mastered);
    root.appendChild(kind);
    root.appendChild(prompt);
    root.appendChild(answer);
    root.appendChild(actions);
    function render(i) {
      const card = cards[i];
      kind.textContent = card.kind + " · " + (SECTIONS.find(function (s) { return s.id === card.id; }) || {}).title;
      prompt.textContent = card.prompt;
      answer.textContent = card.answer;
      answer.hidden = true;
      reveal.textContent = "Reveal answer";
      jump.href = "#" + card.id;
      mastered.dataset.id = card.id;
    }
    reveal.addEventListener("click", function () {
      answer.hidden = !answer.hidden;
      reveal.textContent = answer.hidden ? "Reveal answer" : "Hide answer";
    });
    next.addEventListener("click", function () {
      index = Math.floor(Math.random() * cards.length);
      render(index);
    });
    mastered.addEventListener("click", function () {
      const btn = document.querySelector('.mastery-btn[data-id="' + mastered.dataset.id + '"]');
      if (btn && btn.getAttribute("aria-pressed") !== "true") btn.click();
    });
    render(index);
    return root;
  }

  function buildBugClinic(items) {
    let index = 0;
    const root = h("div", "bug-clinic");
    root.appendChild(h("div", "practice-top",
      '<span class="pg-label">Bug clinic</span><span class="practice-count">' + items.length + " fixes</span>"));
    const lesson = h("div", "practice-kind");
    const title = h("p", "practice-prompt");
    const fix = h("p", "practice-answer");
    const actions = h("div", "practice-actions");
    const next = h("button", null, "New bug");
    const open = h("a", null, "Open fix");
    next.type = "button";
    actions.appendChild(next);
    actions.appendChild(open);

    const details = h("details", "bug-index");
    details.appendChild(h("summary", null, "Browse all indexed mistakes"));
    const list = h("div", "bug-list");
    items.forEach(function (item) {
      const a = h("a", "bug-row");
      a.href = "#" + item.id;
      a.appendChild(h("b", null, esc(item.title)));
      a.appendChild(h("span", null, esc(item.section)));
      list.appendChild(a);
    });
    details.appendChild(list);

    root.appendChild(lesson);
    root.appendChild(title);
    root.appendChild(fix);
    root.appendChild(actions);
    root.appendChild(details);

    function render(i) {
      const item = items[i];
      lesson.textContent = item.category + " · " + item.section;
      title.textContent = item.title;
      fix.textContent = item.fix;
      open.href = "#" + item.id;
    }
    next.addEventListener("click", function () {
      index = Math.floor(Math.random() * items.length);
      render(index);
    });
    render(index);
    return root;
  }

  function buildGlossary() {
    const box = h("div", "glossary");
    box.appendChild(h("div", "glossary-head",
      '<div><span class="pg-label">Compose dictionary</span><h3>Terms that unlock the rest of the course</h3></div>'));
    const grid = h("div", "glossary-grid");
    GLOSSARY.forEach(function (item) {
      const card = h("a", "term-card");
      card.href = "#" + item[2];
      card.appendChild(h("b", null, esc(item[0])));
      card.appendChild(h("span", null, esc(item[1])));
      grid.appendChild(card);
    });
    box.appendChild(grid);
    return box;
  }

  function buildDecisionGuide() {
    const areas = ["All"].concat(Array.from(new Set(DECISION_GUIDES.map(function (item) { return item.area; }))));
    let active = "All";
    const root = h("div", "decision-guide");
    root.appendChild(h("div", "decision-head",
      '<div><span class="pg-label">Compose API chooser</span><h3>Start from the problem, then jump to the right lesson.</h3></div>' +
      '<p>Use this when you know the symptom but not the Compose concept or API name yet.</p>'));
    const tabs = h("div", "decision-tabs");
    const list = h("div", "decision-list");

    function render() {
      Array.prototype.slice.call(tabs.querySelectorAll("button")).forEach(function (btn) {
        btn.classList.toggle("on", btn.dataset.area === active);
      });
      list.innerHTML = "";
      DECISION_GUIDES.filter(function (item) { return active === "All" || item.area === active; }).forEach(function (item) {
        const sec = SECTIONS.find(function (s) { return s.id === item.section; });
        const refs = sec ? refsFor(sec).slice(0, 2) : [];
        const row = h("article", "decision-row");
        row.appendChild(h("div", "decision-area", esc(item.area)));
        row.appendChild(h("h4", null, esc(item.question)));
        row.appendChild(h("p", "decision-use", "<b>Use:</b> " + esc(item.use)));
        row.appendChild(h("p", "decision-avoid", "<b>Avoid:</b> " + esc(item.avoid)));
        const links = h("div", "decision-links");
        if (sec) {
          const lesson = h("a", null, "Open lesson");
          lesson.href = "#" + sec.id;
          links.appendChild(lesson);
        }
        refs.forEach(function (r) {
          const a = h("a", null, esc(r.title) + '<span aria-hidden="true">↗</span>');
          a.href = r.url;
          a.target = "_blank";
          a.rel = "noopener noreferrer";
          links.appendChild(a);
        });
        row.appendChild(links);
        list.appendChild(row);
      });
    }

    areas.forEach(function (area) {
      const btn = h("button", area === active ? "on" : null, esc(area));
      btn.type = "button";
      btn.dataset.area = area;
      btn.addEventListener("click", function () {
        active = area;
        render();
      });
      tabs.appendChild(btn);
    });

    root.appendChild(tabs);
    root.appendChild(list);
    render();
    return root;
  }

  function buildQuickReference() {
    const limit = 8;
    const categories = ["All"].concat(Array.from(new Set(SECTIONS.map(function (s) { return s.category; }))));
    let active = "All";
    let compact = true;
    let filtered = SECTIONS.slice();
    const root = h("div", "quick-reference is-compact");
    root.appendChild(h("div", "quick-head",
      '<div><span class="pg-label">Quick reference atlas</span><h3>Scan the rule, trap, and source in seconds.</h3></div>' +
      '<p>Use this as the compressed version of the course: one card per lesson, tuned for lookup during implementation and review.</p>'));
    const controls = h("div", "quick-controls");
    const select = h("select");
    categories.forEach(function (category) {
      const opt = h("option", null, esc(category));
      opt.value = category;
      select.appendChild(opt);
    });
    const actions = h("div", "quick-actions");
    const count = h("span", "quick-count");
    const copy = h("button", null, "Copy visible reference");
    const toggle = h("button", null, "Show all");
    copy.type = "button";
    toggle.type = "button";
    actions.appendChild(count);
    actions.appendChild(copy);
    actions.appendChild(toggle);
    controls.appendChild(select);
    controls.appendChild(actions);
    const list = h("div", "quick-list");

    function sentence(text) {
      const clean = stripHtml(text || "").replace(/\s+/g, " ").trim();
      if (!clean) return "";
      const parts = clean.split(/(?<=[.!?])\s+/);
      return (parts[0] || clean).trim();
    }

    function trap(s) {
      const tmp = document.createElement("div");
      tmp.innerHTML = s.gotchas_html || "";
      const strong = tmp.querySelector("li strong");
      const firstItem = tmp.querySelector("li");
      const gotcha = strong ? stripHtml(strong.textContent || "").replace(/[.:]+$/, "").trim() :
        sentence(firstItem ? firstItem.innerHTML : s.gotchas_html);
      return gotcha || "Use the lesson's common mistakes as the review guard.";
    }

    function coreRule(s) {
      return (s.key_points && s.key_points[0]) || s.summary;
    }

    function visibleItems() {
      return compact ? filtered.slice(0, limit) : filtered;
    }

    function referenceText() {
      return visibleItems().map(function (s) {
        const ref = refsFor(s)[0];
        return "## " + s.title + " (" + s.category + ")\n" +
          "Core rule: " + coreRule(s) + "\n" +
          "Watch for: " + trap(s) + "\n" +
          "Lesson: #" + s.id + (ref ? "\nSource: " + ref.title + " - " + ref.url : "");
      }).join("\n\n");
    }

    function cardText(s) {
      const ref = refsFor(s)[0];
      return s.title + "\nCore rule: " + coreRule(s) + "\nWatch for: " + trap(s) +
        "\nLesson: #" + s.id + (ref ? "\nSource: " + ref.title + " - " + ref.url : "");
    }

    function render() {
      filtered = SECTIONS.filter(function (s) { return active === "All" || s.category === active; });
      root.classList.toggle("is-compact", compact);
      select.value = active;
      count.textContent = filtered.length + " cards";
      toggle.hidden = filtered.length <= limit;
      toggle.textContent = compact ? "Show all" : "Show fewer";
      list.innerHTML = "";
      filtered.forEach(function (s, idx) {
        const refs = refsFor(s);
        const card = h("article", "quick-card" + (idx >= limit ? " is-extra" : ""));
        card.appendChild(h("div", "quick-meta", "<span>" + esc(s.category) + "</span><b>" + readMinutes(s) + " min</b>"));
        card.appendChild(h("h4", null, esc(s.title)));
        card.appendChild(h("p", "quick-rule", "<b>Core rule:</b> " + esc(coreRule(s))));
        card.appendChild(h("p", "quick-trap", "<b>Watch for:</b> " + esc(trap(s))));
        const links = h("div", "quick-links");
        const lesson = h("a", null, "Open lesson");
        lesson.href = "#" + s.id;
        links.appendChild(lesson);
        const copyCard = h("button", null, "Copy card");
        copyCard.type = "button";
        copyCard.addEventListener("click", function () { copyText(cardText(s), copyCard, "Copy card"); });
        links.appendChild(copyCard);
        refs.slice(0, 1).forEach(function (r) {
          const a = h("a", null, esc(r.title) + '<span aria-hidden="true">↗</span>');
          a.href = r.url;
          a.target = "_blank";
          a.rel = "noopener noreferrer";
          links.appendChild(a);
        });
        card.appendChild(links);
        list.appendChild(card);
      });
    }

    select.addEventListener("change", function () {
      active = select.value;
      compact = true;
      render();
    });
    toggle.addEventListener("click", function () {
      compact = !compact;
      render();
    });
    copy.addEventListener("click", function () {
      copyText(referenceText(), copy, "Copy visible reference");
    });

    root.appendChild(controls);
    root.appendChild(list);
    render();
    return root;
  }

  function buildConceptMap() {
    let active = SECTIONS[0];
    const root = h("div", "concept-map");
    root.appendChild(h("div", "concept-head",
      '<div><span class="pg-label">Concept map</span><h3>See what feeds into a lesson and what it unlocks.</h3></div>' +
      '<p>Use this to plan a study route, recover missing prerequisites, or jump between concepts that share official Android guidance.</p>'));
    const controls = h("div", "concept-controls");
    const select = h("select");
    SECTIONS.forEach(function (s) {
      const opt = h("option", null, s.title);
      opt.value = s.id;
      select.appendChild(opt);
    });
    const actions = h("div", "concept-actions");
    const copy = h("button", null, "Copy route");
    copy.type = "button";
    actions.appendChild(copy);
    controls.appendChild(select);
    controls.appendChild(actions);
    const shell = h("div", "concept-shell");
    const overview = h("div", "concept-overview");
    const lanes = h("div", "concept-lanes");
    const docs = h("div", "concept-docs");

    function sectionById(id) {
      return SECTIONS.find(function (s) { return s.id === id; });
    }

    function neighbors(offset, count) {
      const index = SECTIONS.indexOf(active);
      const start = offset < 0 ? Math.max(0, index - count) : index + 1;
      const end = offset < 0 ? index : Math.min(SECTIONS.length, index + count + 1);
      return SECTIONS.slice(start, end);
    }

    function related() {
      const activeRefs = refKeysFor(active);
      const adjacent = {};
      neighbors(-1, 2).concat(neighbors(1, 2)).forEach(function (s) { adjacent[s.id] = true; });
      return SECTIONS.filter(function (s) { return s.id !== active.id && !adjacent[s.id]; }).map(function (s) {
        const shared = refKeysFor(s).filter(function (key) { return activeRefs.indexOf(key) >= 0; });
        const score = (s.category === active.category ? 3 : 0) + shared.length * 2;
        return { section: s, score: score, shared: shared };
      }).filter(function (item) { return item.score > 0; })
        .sort(function (a, b) {
          if (b.score !== a.score) return b.score - a.score;
          return SECTIONS.indexOf(a.section) - SECTIONS.indexOf(b.section);
        }).slice(0, 5);
    }

    function routeText() {
      const before = neighbors(-1, 2);
      const after = neighbors(1, 2);
      const rel = related();
      const refs = refsFor(active);
      return "ComposeMaster route: " + active.title + "\n\n" +
        "Core rule: " + ((active.key_points && active.key_points[0]) || active.summary) + "\n\n" +
        "Before: " + (before.length ? before.map(function (s) { return s.title + " (#" + s.id + ")"; }).join(", ") : "Start here") + "\n" +
        "Next: " + (after.length ? after.map(function (s) { return s.title + " (#" + s.id + ")"; }).join(", ") : "End of course") + "\n" +
        "Related: " + (rel.length ? rel.map(function (item) { return item.section.title + " (#" + item.section.id + ")"; }).join(", ") : "No related lessons") + "\n" +
        "Official sources: " + (refs.length ? refs.map(function (r) { return r.title + " - " + r.url; }).join("; ") : "None");
    }

    function linkCard(s, note) {
      const a = h("a", "concept-link");
      a.href = "#" + s.id;
      a.appendChild(h("span", null, esc(s.category)));
      a.appendChild(h("b", null, esc(s.title)));
      if (note) a.appendChild(h("em", null, esc(note)));
      return a;
    }

    function renderLane(title, items, empty) {
      const lane = h("div", "concept-lane");
      lane.appendChild(h("h4", null, esc(title)));
      if (!items.length) {
        lane.appendChild(h("p", "concept-empty", esc(empty)));
      } else {
        items.forEach(function (item) {
          const s = item.section || item;
          const note = item.shared && item.shared.length ? "Shared docs: " + item.shared.length : null;
          lane.appendChild(linkCard(s, note));
        });
      }
      return lane;
    }

    function render() {
      select.value = active.id;
      overview.innerHTML = "";
      lanes.innerHTML = "";
      docs.innerHTML = "";
      const core = (active.key_points && active.key_points[0]) || active.summary;
      overview.appendChild(h("div", "concept-meta", "<span>" + esc(active.category) + "</span><b>" + readMinutes(active) + " min lesson</b>"));
      overview.appendChild(h("h4", null, esc(active.title)));
      overview.appendChild(h("p", null, esc(core)));
      const links = h("div", "concept-overview-links");
      const lesson = h("a", null, "Open lesson");
      lesson.href = "#" + active.id;
      links.appendChild(lesson);
      const quick = h("button", null, "Copy lesson route");
      quick.type = "button";
      quick.addEventListener("click", function () { copyText(routeText(), quick, "Copy lesson route"); });
      links.appendChild(quick);
      overview.appendChild(links);
      lanes.appendChild(renderLane("Learn before", neighbors(-1, 2), "This is the start of the course path."));
      lanes.appendChild(renderLane("Unlocks next", neighbors(1, 2), "This is the end of the course path."));
      lanes.appendChild(renderLane("Related concepts", related(), "No close matches yet."));
      docs.appendChild(h("h4", null, "Official sources behind this concept"));
      refsFor(active).forEach(function (r) {
        const a = h("a", null, esc(r.title) + '<span aria-hidden="true">↗</span>');
        a.href = r.url;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        docs.appendChild(a);
      });
    }

    select.addEventListener("change", function () {
      active = sectionById(select.value) || SECTIONS[0];
      render();
    });
    copy.addEventListener("click", function () {
      copyText(routeText(), copy, "Copy route");
    });

    shell.appendChild(overview);
    shell.appendChild(lanes);
    shell.appendChild(docs);
    root.appendChild(controls);
    root.appendChild(shell);
    render();
    return root;
  }

  function buildMasteryMatrix() {
    let state = readJson(MATRIX_KEY, {});
    if (!state || typeof state !== "object" || Array.isArray(state)) state = {};
    let active = "All";
    const categories = ["All"].concat(Array.from(new Set(SECTIONS.map(function (s) { return s.category; }))));
    const root = h("div", "mastery-matrix");
    root.appendChild(h("div", "matrix-head",
      '<div><span class="pg-label">Mastery matrix</span><h3>Track proof, not impressions.</h3></div>' +
      '<p>Check each lesson against the four skills that matter in real Compose work: explain it, predict failures, build it, and review it.</p>'));
    const controls = h("div", "matrix-controls");
    const select = h("select");
    categories.forEach(function (category) {
      const opt = h("option", null, esc(category));
      opt.value = category;
      select.appendChild(opt);
    });
    const actions = h("div", "matrix-actions");
    const count = h("span", "matrix-count");
    const copy = h("button", null, "Copy weak-area plan");
    const reset = h("button", null, "Reset matrix");
    copy.type = "button";
    reset.type = "button";
    actions.appendChild(count);
    actions.appendChild(copy);
    actions.appendChild(reset);
    controls.appendChild(select);
    controls.appendChild(actions);
    const list = h("div", "matrix-list");
    const weak = h("div", "matrix-weak");

    function rowState(id) {
      const row = state[id];
      if (!row || typeof row !== "object" || Array.isArray(row)) return {};
      return row;
    }

    function score(s) {
      const row = rowState(s.id);
      return MATRIX_SKILLS.filter(function (skill) { return !!row[skill.id]; }).length;
    }

    function missing(s) {
      const row = rowState(s.id);
      return MATRIX_SKILLS.filter(function (skill) { return !row[skill.id]; });
    }

    function cleanState() {
      const next = {};
      SECTIONS.forEach(function (s) {
        const row = rowState(s.id);
        const clean = {};
        MATRIX_SKILLS.forEach(function (skill) {
          if (row[skill.id]) clean[skill.id] = true;
        });
        if (Object.keys(clean).length) next[s.id] = clean;
      });
      state = next;
    }

    function persist() {
      cleanState();
      writeJson(MATRIX_KEY, state);
    }

    function weakRows() {
      return SECTIONS.map(function (s, index) {
        return { section: s, index: index, score: score(s), missing: missing(s) };
      }).filter(function (item) {
        return item.missing.length;
      }).sort(function (a, b) {
        if (a.score !== b.score) return a.score - b.score;
        return a.index - b.index;
      });
    }

    function planText() {
      const rows = weakRows();
      if (!rows.length) return "ComposeMaster mastery matrix: every proof point is checked.";
      return "ComposeMaster weak-area plan\n\n" + rows.slice(0, 12).map(function (item) {
        return "- " + item.section.title + " (" + item.section.category + "): " +
          item.missing.map(function (skill) { return skill.label; }).join(", ") +
          "\n  Lesson: #" + item.section.id;
      }).join("\n");
    }

    function renderWeak() {
      const rows = weakRows().slice(0, 6);
      weak.innerHTML = "";
      weak.appendChild(h("div", "matrix-weak-head",
        "<b>" + (rows.length ? "Review next" : "All proof points checked") + "</b>" +
        "<span>" + (rows.length ? "Highest-leverage gaps across the whole course." : "The matrix has no remaining weak areas.") + "</span>"));
      if (!rows.length) return;
      const grid = h("div", "matrix-weak-grid");
      rows.forEach(function (item) {
        const a = h("a", null,
          "<b>" + esc(item.section.title) + "</b><span>" +
          item.missing.map(function (skill) { return esc(skill.label); }).join(" · ") + "</span>");
        a.href = "#" + item.section.id;
        grid.appendChild(a);
      });
      weak.appendChild(grid);
    }

    function render() {
      persist();
      select.value = active;
      const total = SECTIONS.length * MATRIX_SKILLS.length;
      const done = SECTIONS.reduce(function (sum, s) { return sum + score(s); }, 0);
      const filtered = SECTIONS.filter(function (s) { return active === "All" || s.category === active; });
      count.textContent = done + "/" + total + " proof points";
      list.innerHTML = "";
      filtered.forEach(function (s) {
        const doneForSection = score(s);
        const row = h("article", "matrix-row" + (doneForSection === MATRIX_SKILLS.length ? " is-complete" : ""));
        const top = h("div", "matrix-row-top");
        const title = h("div", "matrix-title");
        title.appendChild(h("span", null, esc(s.category)));
        title.appendChild(h("h4", null, esc(s.title)));
        const meta = h("div", "matrix-row-meta");
        meta.appendChild(h("b", null, doneForSection + "/" + MATRIX_SKILLS.length));
        const lesson = h("a", null, "Open lesson");
        lesson.href = "#" + s.id;
        meta.appendChild(lesson);
        top.appendChild(title);
        top.appendChild(meta);
        row.appendChild(top);
        const track = h("div", "matrix-track", "<span></span>");
        track.querySelector("span").style.width = Math.round((doneForSection / MATRIX_SKILLS.length) * 100) + "%";
        row.appendChild(track);
        const skills = h("div", "matrix-skills");
        MATRIX_SKILLS.forEach(function (skill) {
          const on = !!rowState(s.id)[skill.id];
          const btn = h("button", on ? "on" : null, "<b>" + esc(skill.label) + "</b><span>" + esc(skill.prompt) + "</span>");
          btn.type = "button";
          btn.setAttribute("aria-pressed", on ? "true" : "false");
          btn.addEventListener("click", function () {
            if (!state[s.id] || typeof state[s.id] !== "object" || Array.isArray(state[s.id])) state[s.id] = {};
            if (state[s.id][skill.id]) delete state[s.id][skill.id]; else state[s.id][skill.id] = true;
            persist();
            render();
          });
          skills.appendChild(btn);
        });
        row.appendChild(skills);
        list.appendChild(row);
      });
      renderWeak();
    }

    select.addEventListener("change", function () {
      active = select.value;
      render();
    });
    copy.addEventListener("click", function () {
      copyText(planText(), copy, "Copy weak-area plan");
    });
    reset.addEventListener("click", function () {
      state = {};
      writeJson(MATRIX_KEY, state);
      render();
    });

    root.appendChild(controls);
    root.appendChild(list);
    root.appendChild(weak);
    render();
    return root;
  }

  function buildBlueprintPlanner(reviews) {
    const scenarios = [
      {
        id: "form",
        title: "Stateful form",
        summary: "Inputs, validation, submit state, restoration, and accessible errors.",
        route: ["composables", "state-hoisting-udf", "textfields", "focus-keyboard-input", "edge-to-edge-insets", "state-saving", "accessibility-testing", "compose-ui-testing"],
        steps: [
          "Choose one owner for each TextFieldState, validation result, and submit state.",
          "Prefer state-based text fields; use InputTransformation for input filters and OutputTransformation for display formatting.",
          "Define IME actions, Next/Search/Done behavior, validation focus, and clear visible focus cues.",
          "Protect focused fields and submit actions from system bars and IME overlap with edge-to-edge insets.",
          "Use SecureTextField for secrets and semantics contentType hints for Autofill.",
          "Save only small UI element state with rememberTextFieldState or rememberSaveable; keep business state and submit logic in the right owner.",
          "Expose labels, errors, supporting text, content types, and state descriptions before writing tests.",
          "Test typing, validation messages, submit enablement, and restoration through semantic finders and actions.",
        ],
      },
      {
        id: "feed",
        title: "Feed or catalog",
        summary: "Large or growing item collections with cards, stable identity, and performance constraints.",
        route: ["lazy-lists", "lazy-collections-scale", "card", "stability-performance", "accessibility-testing", "compose-ui-testing"],
        steps: [
          "Use LazyColumn, LazyVerticalGrid, LazyVerticalStaggeredGrid, or Pager instead of composing every item eagerly.",
          "Give items stable keys before adding reorder, insert, delete, or paging behavior.",
          "Use contentType for mixed item layouts and render Paging load states, placeholders, and retry affordances where data is incremental.",
          "Observe scroll side effects with snapshotFlow instead of reading high-churn scroll state directly in broad composition.",
          "Keep row models stable and immutable enough for skippability to work.",
          "Describe row semantics as one useful target when the whole row is actionable.",
          "Test scroll-to-item, empty, loading, and item-action states without coupling to Row or Column internals.",
        ],
      },
      {
        id: "migration",
        title: "Incremental View migration",
        summary: "Existing View or Fragment screens adopting Compose without breaking lifecycle, state, nested scroll, or reuse.",
        route: ["interop-migration", "state-hoisting-udf", "theming-design-system", "lazy-lists", "lazy-collections-scale", "edge-to-edge-insets", "navigation-compose", "navigation3-state", "compose-ui-testing"],
        steps: [
          "Pick the migration boundary: new Compose screen, ComposeView island in an existing View tree, AndroidView for one missing View component, or shared AbstractComposeView wrapper.",
          "Set the correct ViewCompositionStrategy for Fragment-hosted ComposeView content.",
          "Move state ownership out of legacy Views before rewriting presentation so Compose receives state plus events.",
          "Create Views inside AndroidView factory, push Compose state through update, and add onReset when the View appears in lazy or pager content.",
          "Bridge nested scroll only when a cooperating View parent needs deltas, and keep non-cooperating View parents explicit.",
          "Keep shared components themed from the Compose side and expose narrow mutable inputs only at View wrapper boundaries.",
          "Write regression tests before replacing feature slices and migrate RecyclerView ViewHolder types to composables with keys and contentType.",
        ],
      },
      {
        id: "navState",
        title: "Navigation state app",
        summary: "A Compose-first app where navigation is explicit state, saved with serializable keys, and rendered by NavDisplay.",
        route: ["navigation3-state", "navigation-compose", "state-saving", "state-hoisting-udf", "adaptive-layouts", "animation-motion", "compose-ui-testing"],
        steps: [
          "Choose whether this feature stays on Navigation Compose or moves to Navigation 3's owned back-stack model.",
          "Model destinations as small serializable NavKey objects or classes before wiring UI events.",
          "Own the back stack in one app or feature state holder and mutate it only from navigation events.",
          "Resolve keys to content with entryProvider and keep destination UI state down, events up.",
          "Render the stack with NavDisplay and wire onBack to remove the top key or delegate to a navigator object.",
          "Use rememberNavBackStack for saveable keys, and add entry decorators when destination ViewModels or saveable state should be scoped to entries.",
          "Use metadata and scene strategies only when scenes, dialogs, transitions, or adaptive multi-pane layouts need to read entry intent.",
        ],
      },
      {
        id: "screen",
        title: "Scaffolded app screen",
        summary: "Top bars, bottom bars, FABs, inner padding, system bars, and screen-level state.",
        route: ["scaffold", "navigation-surfaces", "edge-to-edge-insets", "theming-design-system", "state-hoisting-udf", "navigation-compose", "navigation3-state", "adaptive-layouts", "padding", "state-saving", "effects-lifecycle", "previews-tooling"],
        steps: [
          "Start with Scaffold slots and apply innerPadding to the real content container.",
          "Enable edge-to-edge, decide which Material components handle insets, and consume custom insets exactly once.",
          "Wrap the screen in the app theme and consume MaterialTheme roles for bars, surfaces, and content.",
          "Keep the screen state holder at the route boundary and pass plain state plus events into content.",
          "Keep navigation events at the route layer so leaf UI stays stateless and previewable.",
          "Decide whether this screen is one-pane, two-pane, or supporting-pane at the app shell level.",
          "Separate screen state from transient UI element state.",
          "Put navigation, snackbar, and one-shot work in the right effect or event path.",
          "Test that content clears bars, cutouts, and IME transitions.",
          "Preview the stateless screen content with sample states, themes, and window sizes instead of previewing the route directly.",
        ],
      },
      {
        id: "navShell",
        title: "Navigation shell",
        summary: "Top app bars, bottom navigation, rails, drawers, tabs, selected state, and adaptive destination switching.",
        route: ["navigation-surfaces", "scaffold", "navigation-compose", "navigation3-state", "adaptive-layouts", "state-saving", "edge-to-edge-insets", "accessibility-testing", "compose-ui-testing"],
        steps: [
          "Separate app structure from destination content: top-level destinations live at the shell, while each screen stays previewable.",
          "Use NavigationBar for compact windows with three to five top-level destinations and NavigationRail or a permanent/standard drawer when width grows.",
          "Use a top app bar for screen title, up/menu navigation, and high-value actions; wire navigationIcon to a real back, drawer, or root action.",
          "Use tabs only for peer content inside one destination, not as a replacement for the app-wide top-level nav model.",
          "Keep selected destination/tab state in one saveable owner and derive selected booleans for every item.",
          "Apply Scaffold innerPadding and Material component insets once so content clears bars, rails, drawers, and system gestures.",
          "Add content descriptions, badges, labels, and UI tests that assert selected state and navigation events.",
        ],
      },
      {
        id: "component",
        title: "Reusable component",
        summary: "A composable API that is stateless, previewable, themed, and easy to test.",
        route: ["composables", "state-hoisting-udf", "theming-design-system", "modifiers", "buttons", "custom-layouts", "constraint-layout", "visibility-tracking", "drawing-graphics", "images-resources", "selection-inputs", "status-content", "transient-surfaces", "navigation-surfaces", "nesting", "previews-tooling", "accessibility-testing", "compose-ui-testing"],
        steps: [
          "Make required data explicit parameters and expose a modifier parameter.",
          "Keep internal state out unless the component truly owns it; never require a ViewModel for a reusable leaf component.",
          "Read color, type, and shape from MaterialTheme or product tokens instead of hard-coding visual constants.",
          "Use built-in layouts first; if the component owns a unique measurement contract, isolate it in a custom Layout.",
          "Keep visual decoration in draw modifiers or Canvas when it is drawing-only state.",
          "Use slots for caller-provided content instead of hard-coding every child.",
          "Build a preview matrix for loading, empty, error, long text, font scale, light, dark, and large-screen variants.",
          "Assert behavior through text, roles, semantics, and test tags only where visible selectors are unavailable.",
        ],
      },
      {
        id: "searchFilter",
        title: "Search and filter workflow",
        summary: "Primary search, suggestions, filter chips, compact modes, date/time constraints, result state, and keyboard/search actions.",
        route: ["selection-inputs", "status-content", "textfields", "state-hoisting-udf", "lazy-lists", "effects-lifecycle", "focus-keyboard-input", "accessibility-testing", "compose-ui-testing"],
        steps: [
          "Choose SearchBar only when search is a primary task; otherwise use a text field or top app bar action that opens the search surface.",
          "Own query, expanded, selected filters, and picker dialog visibility in one route or screen state holder.",
          "Use SearchBarDefaults.InputField to wire query text, onSearch, expanded state, and leading/trailing icons consistently.",
          "Use suggestion chips for query refinements, filter chips for selected content filters, input chips for removable user-entered tokens, and assist chips for contextual actions.",
          "Use segmented buttons only for two to five compact peer choices; move larger or dynamic sets to chips or menus.",
          "Use DatePickerState and TimePickerState behind explicit confirm/dismiss actions before mutating the committed filter state.",
          "Render result loading, empty, error, and filtered states with stable lazy list keys and semantic tests for the selected filters.",
        ],
      },
      {
        id: "interactive",
        title: "Interactive surface",
        summary: "Clickable, pressable, draggable, transformable, or custom pointer-driven UI.",
        route: ["modifiers", "buttons", "controls", "pointer-input-gestures", "focus-keyboard-input", "accessibility-testing", "compose-ui-testing", "state-saving"],
        steps: [
          "Start from a Material component or high-level gesture modifier that already supplies semantics and indication.",
          "Hoist gesture-driven state such as pressed, selected, dragged offset, zoom, or expanded state.",
          "Use pointerInput only for a custom gesture the high-level APIs do not express.",
          "Separate top-level gesture detectors into separate pointerInput modifiers when more than one detector must run.",
          "Consume pointer changes deliberately so parent and sibling handlers do not fight.",
          "Verify keyboard, D-pad, Tab traversal, shortcut handling, and visible focus states before touch-only polish.",
          "Test touch, keyboard, mouse or stylus hover where relevant, accessibility activation, and interrupted gestures.",
        ],
      },
      {
        id: "settings",
        title: "Settings or preference screen",
        summary: "Controlled toggles, rows, persistence boundaries, and accessible state.",
        route: ["controls", "row", "state-saving", "accessibility-testing"],
        steps: [
          "Model every setting as controlled state from the caller or data layer.",
          "Use Row layout rules deliberately so labels, descriptions, and controls do not fight for width.",
          "Merge semantics for row-level actions and expose stateDescription.",
          "Persist preference data outside Compose; keep Compose focused on UI state and events.",
        ],
      },
      {
        id: "motion",
        title: "Animated state transition",
        summary: "Visibility, content swaps, size changes, and state-driven motion that remains readable.",
        route: ["animation-motion", "effects-lifecycle", "stability-performance", "accessibility-testing", "compose-ui-testing"],
        steps: [
          "Choose the smallest animation API that matches the state change.",
          "Keep animation targets derived from state instead of manually mutating frames.",
          "Avoid restarting work from the composable body; use effect APIs for lifecycle-bound jobs.",
          "Check reduced-motion expectations, interrupted states, testable semantics, and deterministic mainClock assertions.",
        ],
      },
    ];
    const addOns = [
      { id: "save", label: "Survives process death", route: ["state-saving"], step: "Define the smallest restorable state and keep non-Bundle data out of saved instance state." },
      { id: "stateOwner", label: "Screen state holder", route: ["state-hoisting-udf", "state-saving", "effects-lifecycle"], step: "Keep ViewModel or plain state holder ownership at the route boundary, expose immutable UI state, and pass callbacks into reusable content." },
      { id: "effects", label: "Collects effects or callbacks", route: ["effects-lifecycle"], step: "Pick the effect API by lifecycle: launch, remember latest value, produce state, or clean up a listener." },
      { id: "nav", label: "Navigates between screens", route: ["navigation-compose", "effects-lifecycle"], step: "Define typed destinations, keep NavController at the route layer, and pass navigation events down as lambdas." },
      { id: "nav3", label: "Navigation 3", route: ["navigation3-state", "state-saving", "adaptive-layouts"], step: "Own navigation as state with serializable NavKey values, an entryProvider, NavDisplay, onBack handling, and decorators or scene metadata only where needed." },
      { id: "adaptive", label: "Adapts to large screens", route: ["adaptive-layouts", "navigation-compose", "navigation3-state"], step: "Use currentWindowAdaptiveInfo, window size classes, pane scaffolds, or Navigation 3 scenes instead of fixed phone-only breakpoints." },
      { id: "edge", label: "Edge-to-edge", route: ["edge-to-edge-insets", "scaffold", "adaptive-layouts"], step: "Call enableEdgeToEdge, set adjustResize for IME insets, choose Scaffold or WindowInsets handling per edge, and test system bars, cutouts, caption bars, and keyboard animation." },
      { id: "gestures", label: "Custom gesture behavior", route: ["pointer-input-gestures", "accessibility-testing"], step: "Prefer high-level gesture modifiers; if pointerInput is required, add explicit semantics, key it correctly, and consume events intentionally." },
      { id: "keyboard", label: "Keyboard/D-pad", route: ["focus-keyboard-input", "accessibility-testing"], step: "Define Tab, arrow, and D-pad traversal, visible focus cues, IME actions, and discoverable shortcuts before adding raw key handlers." },
      { id: "customLayout", label: "Custom measurement", route: ["custom-layouts", "sizing", "alignment"], step: "Use `Layout` or `Modifier.layout` only for a unique measure/place contract; measure each child once and expose intrinsics or alignment lines when parents need them." },
      { id: "constraints", label: "Sibling constraints", route: ["constraint-layout", "custom-layouts", "row", "column", "box"], step: "Use ConstraintLayout only when sibling-relative constraints, guidelines, barriers, chains, or swappable ConstraintSets are clearer than Row/Column/Box composition." },
      { id: "visibility", label: "Viewport visibility", route: ["visibility-tracking", "lazy-lists", "effects-lifecycle", "stability-performance"], step: "Use onVisibilityChanged for thresholded visibility events, onLayoutRectChanged for throttled geometry, and stable item identity for once-only impressions." },
      { id: "graphics", label: "Custom drawing", route: ["drawing-graphics", "background-shape", "stability-performance"], step: "Use drawBehind, drawWithContent, drawWithCache, Canvas, Brush, or graphicsLayer based on draw order, caching needs, and whether transforms should affect only drawing." },
      { id: "assets", label: "Images/resources", route: ["images-resources", "accessibility-testing", "stability-performance"], step: "Localize text and image descriptions, choose painterResource, Image, Icon, AsyncImage, or a custom Painter by source, constrain image size, and keep Painter creation behind stable IDs or URLs." },
      { id: "searchFilter", label: "Search/filter UI", route: ["selection-inputs", "textfields", "focus-keyboard-input"], step: "Use SearchBar, chips, segmented buttons, or date/time pickers by task shape; hoist query, selected filters, expanded state, and confirm/dismiss events." },
      { id: "statusContent", label: "Loading/list content", route: ["status-content", "lazy-lists", "accessibility-testing"], step: "Use progress indicators, PullToRefreshBox, ListItem rows, dividers, or carousels by content state; keep refresh/loading state controlled and item identity stable." },
      { id: "transient", label: "Temporary surfaces", route: ["transient-surfaces", "effects-lifecycle", "accessibility-testing"], step: "Choose Badge, Tooltip, Menu, Snackbar, BottomSheet, or Dialog by urgency and anchoring; keep visibility state hoisted and dismiss surfaces from every completion path." },
      { id: "navSurfaces", label: "Navigation surfaces", route: ["navigation-surfaces", "scaffold", "adaptive-layouts"], step: "Choose TopAppBar, NavigationBar, NavigationRail, Drawer, or TabRow by hierarchy and window size; keep selection state in one shell owner." },
      { id: "theme", label: "Brand theme", route: ["theming-design-system", "accessibility-testing"], step: "Define semantic color, typography, shape, and product tokens at the theme root; use CompositionLocal only for broadly consumed tree-scoped values." },
      { id: "list", label: "Large list or paging", route: ["lazy-lists", "visibility-tracking", "stability-performance"], step: "Use lazy containers, stable item keys, visibility-aware analytics, and measured performance fixes instead of eager composition." },
      { id: "interop", label: "View interop", route: ["interop-migration", "state-hoisting-udf", "compose-ui-testing"], step: "Choose ComposeView, AndroidView, AndroidFragment, or AbstractComposeView intentionally, then test lifecycle disposal, state ownership, reset behavior, and nested scroll at the boundary." },
      { id: "motion", label: "Motion required", route: ["animation-motion"], step: "Select animate*AsState, AnimatedVisibility, AnimatedContent, or updateTransition based on the change shape." },
      { id: "a11y", label: "Accessibility critical", route: ["accessibility-testing"], step: "Add labels, roles, state descriptions, touch target checks, and semantic UI tests before polish." },
      { id: "tests", label: "UI tests required", route: ["compose-ui-testing", "accessibility-testing"], step: "Define the semantic contract first, then write ComposeTestRule tests that find nodes, perform actions, assert behavior, and avoid sleeps." },
      { id: "previews", label: "Preview matrix", route: ["previews-tooling", "theming-design-system", "adaptive-layouts"], step: "Create themed @Preview and multipreview coverage for representative sample states, device sizes, font scales, and light/dark or dynamic color modes." },
    ];
    let active = scenarios[0];
    const selected = {};
    const root = h("div", "blueprint-planner");
    root.appendChild(h("div", "blueprint-head",
      '<div><span class="pg-label">Screen blueprint generator</span><h3>Turn a UI problem into a Compose implementation plan.</h3></div>' +
      '<p>Pick the screen shape and constraints. ComposeMaster builds the lesson route, implementation steps, and review checks to use before coding.</p>'));
    const controls = h("div", "blueprint-controls");
    const select = h("select", "blueprint-select");
    scenarios.forEach(function (scenario) {
      const opt = h("option", null, scenario.title);
      opt.value = scenario.id;
      select.appendChild(opt);
    });
    const toggles = h("div", "blueprint-toggles");
    addOns.forEach(function (item) {
      const label = h("label", "blueprint-toggle");
      const input = h("input");
      input.type = "checkbox";
      input.value = item.id;
      label.appendChild(input);
      label.appendChild(h("span", null, esc(item.label)));
      toggles.appendChild(label);
    });
    controls.appendChild(select);
    controls.appendChild(toggles);
    const output = h("div", "blueprint-output");
    const routeBox = h("div", "blueprint-route");
    const stepsBox = h("div", "blueprint-steps");
    const checksBox = h("div", "blueprint-checks");
    const copy = h("button", null, "Copy blueprint");
    copy.type = "button";

    function unique(ids) {
      const seen = {};
      return ids.filter(function (id) { if (seen[id]) return false; seen[id] = true; return !!SECTIONS.find(function (s) { return s.id === id; }); });
    }

    function routeIds() {
      let ids = active.route.slice();
      addOns.forEach(function (item) {
        if (selected[item.id]) ids = ids.concat(item.route);
      });
      return unique(ids);
    }

    function steps() {
      let items = active.steps.slice();
      addOns.forEach(function (item) {
        if (selected[item.id] && items.indexOf(item.step) < 0) items.push(item.step);
      });
      return items;
    }

    function checks(ids) {
      const idSet = {};
      ids.forEach(function (id) { idSet[id] = true; });
      return reviews.filter(function (item) { return !!idSet[item.id]; }).slice(0, 6);
    }

    function blueprintText() {
      const ids = routeIds();
      const route = ids.map(function (id) {
        const s = SECTIONS.find(function (sec) { return sec.id === id; });
        return s ? s.title + " (#" + id + ")" : id;
      });
      const review = checks(ids);
      return "ComposeMaster blueprint: " + active.title + "\n" + active.summary + "\n\n" +
        "Study route:\n" + route.map(function (item) { return "- " + item; }).join("\n") + "\n\n" +
        "Implementation steps:\n" + steps().map(function (item) { return "- " + item; }).join("\n") + "\n\n" +
        "Review checks:\n" + (review.length ? review.map(function (item) { return "- [" + item.category + "] " + item.check; }).join("\n") : "- Run the production review board for this route.");
    }

    function render() {
      const ids = routeIds();
      routeBox.innerHTML = "";
      stepsBox.innerHTML = "";
      checksBox.innerHTML = "";
      routeBox.appendChild(h("div", "blueprint-summary", "<b>" + esc(active.title) + "</b><span>" + esc(active.summary) + "</span>"));
      const routeList = h("div", "blueprint-route-list");
      ids.forEach(function (id, index) {
        const s = SECTIONS.find(function (sec) { return sec.id === id; });
        const a = h("a", null, "<span>" + String(index + 1).padStart(2, "0") + "</span><b>" + esc(s.title) + "</b><em>" + esc(s.category) + "</em>");
        a.href = "#" + s.id;
        routeList.appendChild(a);
      });
      routeBox.appendChild(routeList);
      stepsBox.appendChild(h("h4", null, "Implementation steps"));
      const ol = h("ol");
      steps().forEach(function (step) { ol.appendChild(h("li", null, esc(step))); });
      stepsBox.appendChild(ol);
      checksBox.appendChild(h("h4", null, "Review checks"));
      const review = checks(ids);
      if (!review.length) {
        checksBox.appendChild(h("p", "blueprint-empty", "No route-specific checks yet. Use the production review board after the first draft."));
      } else {
        review.forEach(function (item) {
          const card = h("article", "blueprint-check");
          card.appendChild(h("span", null, esc(item.category)));
          card.appendChild(h("b", null, esc(item.check)));
          card.appendChild(h("p", null, esc(item.why)));
          checksBox.appendChild(card);
        });
      }
    }

    select.addEventListener("change", function () {
      active = scenarios.find(function (scenario) { return scenario.id === select.value; }) || scenarios[0];
      render();
    });
    toggles.addEventListener("change", function (event) {
      if (event.target && event.target.matches("input")) {
        selected[event.target.value] = event.target.checked;
        render();
      }
    });
    copy.addEventListener("click", function () {
      copyText(blueprintText(), copy, "Copy blueprint");
    });

    output.appendChild(routeBox);
    output.appendChild(stepsBox);
    output.appendChild(checksBox);
    output.appendChild(copy);
    root.appendChild(controls);
    root.appendChild(output);
    render();
    return root;
  }

  function buildCodeReviewLab() {
    const sample = '@Composable\n' +
      'fun ProfileFeed(users: List<User>) {\n' +
      '  val query by remember { mutableStateOf("") }\n' +
      '  val state by viewModel.uiState.collectAsState()\n' +
      '  LaunchedEffect(Unit) { snackbarHostState.showSnackbar("Loaded") }\n' +
      '  Scaffold { \n' +
      '    Column(Modifier.verticalScroll(rememberScrollState()).padding(16.dp).background(Color.White)) {\n' +
      '      TextField(value = query, onValueChange = {})\n' +
      '      users.forEach { user ->\n' +
      '        Row(Modifier.clickable { open(user.id) }) {\n' +
      '          Image(user.avatar, contentDescription = null)\n' +
      '          Text(user.name)\n' +
      '        }\n' +
      '      }\n' +
      '    }\n' +
      '  }\n' +
      '}';
    const rules = [
      {
        id: "modifier-param",
        severity: "Architecture",
        section: "modifiers",
        title: "Expose a Modifier parameter on composable APIs.",
        why: "Reusable composables should let callers place, size, clip, test, and decorate them from the outside.",
        fix: "Add `modifier: Modifier = Modifier` to public UI composables and pass it to the root layout.",
        detect: function (code) {
          const matches = [];
          code.replace(/@Composable\s+(?:private\s+)?fun\s+([A-Za-z_][\w]*)\s*\(([\s\S]*?)\)\s*\{/g, function (_, name, params) {
            if (!/modifier\s*:\s*Modifier\b/.test(params)) matches.push(name);
          });
          return matches.length ? "Missing on: " + matches.slice(0, 4).join(", ") + (matches.length > 4 ? "..." : "") : "";
        },
      },
      {
        id: "lifecycle-state",
        severity: "Runtime",
        section: "state-hoisting-udf",
        title: "Collect observable state with lifecycle awareness.",
        why: "Android UI should avoid collecting flows while the screen is stopped when lifecycle-aware collection is available.",
        fix: "Prefer `collectAsStateWithLifecycle()` for Flow-backed UI state in Android screens.",
        detect: function (code) { return /\.collectAsState\s*\(/.test(code) && !/collectAsStateWithLifecycle\s*\(/.test(code) ? "Found `collectAsState()` without lifecycle-aware collection." : ""; },
      },
      {
        id: "viewmodel-boundary",
        severity: "State",
        section: "state-hoisting-udf",
        title: "Keep ViewModel at the route boundary.",
        why: "Reusable UI becomes difficult to preview and test when it receives a screen-scoped state holder instead of plain state and events.",
        fix: "Collect state in the screen or route composable, then pass immutable UI state and callbacks into reusable content.",
        detect: function (code) { return /@Composable\s+(?:private\s+)?fun\s+(?![A-Za-z_][\w]*Route\b)[A-Za-z_][\w]*\s*\([^)]*\b[A-Za-z_][\w]*\s*:\s*[A-Za-z_][\w]*ViewModel\b/.test(code) ? "Found a composable parameter typed as a ViewModel outside an obvious route boundary." : ""; },
      },
      {
        id: "saveable-state",
        severity: "State",
        section: "state-saving",
        title: "Use saveable state for small user-entered UI element state.",
        why: "Text fields, selected tabs, and small filters are frustrating when they disappear after activity recreation.",
        fix: "Use `rememberSaveable` for small Bundle-compatible UI element state; keep business state in a ViewModel.",
        detect: function (code) { return /remember\s*\{\s*mutableStateOf/.test(code) && !/rememberSaveable/.test(code) ? "Found `remember { mutableStateOf(...) }` with no `rememberSaveable`." : ""; },
      },
      {
        id: "lazy-list",
        severity: "Performance",
        section: "lazy-lists",
        title: "Use lazy containers for growing collections.",
        why: "A scrolling Column with repeated rows composes too much work up front as the collection grows.",
        fix: "Replace eager `Column` + `forEach` with `LazyColumn` or `LazyVerticalGrid` and stable item keys.",
        detect: function (code) { return /Column\s*\([\s\S]{0,600}verticalScroll[\s\S]*?\.forEach\s*\{/.test(code) && !/Lazy(Column|Row|VerticalGrid|HorizontalGrid|VerticalStaggeredGrid|HorizontalStaggeredGrid)/.test(code) ? "Found `Column(...verticalScroll...)` rendering a collection eagerly." : ""; },
      },
      {
        id: "lazy-keys",
        severity: "Performance",
        section: "lazy-lists",
        title: "Give lazy items stable keys.",
        why: "Stable keys preserve item identity during insert, delete, reorder, animation, and paging changes.",
        fix: "Use `items(items, key = { it.id })` or another stable unique key.",
        detect: function (code) { return /Lazy(Column|Row|VerticalGrid|HorizontalGrid|VerticalStaggeredGrid|HorizontalStaggeredGrid)/.test(code) && /items\s*\(/.test(code) && !/key\s*=/.test(code) ? "Found lazy `items(...)` without a `key =` argument." : ""; },
      },
      {
        id: "lazy-content-type",
        severity: "Performance",
        section: "lazy-collections-scale",
        title: "Declare contentType for mixed lazy item layouts.",
        why: "Lazy layouts can reuse compatible item compositions more effectively when mixed rows, cards, ads, headers, and placeholders declare their layout type.",
        fix: "Pass `contentType = { ... }` or `itemContentType { ... }` alongside stable keys for heterogeneous lazy content.",
        detect: function (code) {
          const lazy = /Lazy(Column|Row|VerticalGrid|HorizontalGrid|VerticalStaggeredGrid|HorizontalStaggeredGrid)/.test(code);
          const mixed = /items\s*\([\s\S]{0,700}(when\s*\(|is\s+[A-Z][A-Za-z0-9_]+|Header|Footer|AdCard|Placeholder)/.test(code);
          return lazy && mixed && !/contentType\s*=|itemContentType\s*\{/.test(code) ? "Found a heterogeneous lazy layout without an obvious `contentType` hint." : "";
        },
      },
      {
        id: "paging-load-state",
        severity: "Data",
        section: "lazy-collections-scale",
        title: "Render Paging load states and retry paths.",
        why: "Paging Compose exposes append, prepend, refresh, error, and loading state; ignoring it leaves users with silent blank tails or no recovery.",
        fix: "Handle `lazyPagingItems.loadState`, display loading/error items, and wire `retry()` or refresh affordances.",
        detect: function (code) { return /collectAsLazyPagingItems\s*\(/.test(code) && !/(loadState|LoadState|retry\s*\(|refresh\s*\()/.test(code) ? "Found Paging Compose collection with no visible load-state or retry handling." : ""; },
      },
      {
        id: "pager-state",
        severity: "State",
        section: "lazy-collections-scale",
        title: "Own Pager state with rememberPagerState.",
        why: "HorizontalPager and VerticalPager need a remembered PagerState so current page, animation, indicators, and scroll commands survive recomposition.",
        fix: "Create `val pagerState = rememberPagerState(pageCount = { ... })` and pass `state = pagerState` into the pager.",
        detect: function (code) { return /(HorizontalPager|VerticalPager)\s*\(/.test(code) && !/rememberPagerState\s*\(|state\s*=\s*[A-Za-z_][\w]*pagerState/i.test(code) ? "Found Pager usage without obvious remembered PagerState." : ""; },
      },
      {
        id: "composeview-fragment-strategy",
        severity: "Lifecycle",
        section: "interop-migration",
        title: "Fragment ComposeView needs an explicit disposal strategy.",
        why: "A ComposeView hosted by a Fragment should dispose with the Fragment view lifecycle, not an accidental detach event.",
        fix: "Call `setViewCompositionStrategy(ViewCompositionStrategy.DisposeOnViewTreeLifecycleDestroyed)` before `setContent` in Fragment-hosted ComposeView code.",
        detect: function (code) {
          const hasFragmentCompose = /class\s+\w+\s*:\s*Fragment|onCreateView\s*\(/.test(code) && /ComposeView\s*\(|findViewById<ComposeView>|setContent\s*\{/.test(code);
          return hasFragmentCompose && !/setViewCompositionStrategy\s*\(\s*ViewCompositionStrategy\.DisposeOnViewTreeLifecycleDestroyed/.test(code) ? "Found Fragment-hosted ComposeView content without `DisposeOnViewTreeLifecycleDestroyed`." : "";
        },
      },
      {
        id: "androidview-lazy-reset",
        severity: "Interop",
        section: "interop-migration",
        title: "AndroidView in lazy containers needs reset handling.",
        why: "LazyColumn, LazyRow, grids, and Pager can reuse compositions; AndroidView needs `onReset` to safely reuse the underlying View instance.",
        fix: "Use the AndroidView overload with `onReset = { view -> ... }` and clear listeners/transient state before reuse.",
        detect: function (code) {
          return /Lazy(Column|Row|VerticalGrid|HorizontalGrid|VerticalStaggeredGrid|HorizontalStaggeredGrid)|HorizontalPager|VerticalPager/.test(code) && /AndroidView\s*\(/.test(code) && !/onReset\s*=/.test(code) ? "Found AndroidView inside a lazy/pager container without `onReset`." : "";
        },
      },
      {
        id: "androidview-remember-view",
        severity: "Interop",
        section: "interop-migration",
        title: "Create Views inside AndroidView factory.",
        why: "AndroidView owns View creation, update, reset, and release; remembering a View outside the factory fights the interop lifecycle.",
        fix: "Move View construction into `factory = { context -> ... }` and push Compose state into the View from `update`.",
        detect: function (code) {
          return /remember\s*\{[\s\S]{0,180}(View|MapView|WebView|PlayerView|AdView)\s*\(/.test(code) && /AndroidView\s*\(/.test(code) ? "Found a View remembered outside AndroidView instead of created in `factory`." : "";
        },
      },
      {
        id: "scaffold-padding",
        severity: "Layout",
        section: "scaffold",
        title: "Apply Scaffold inner padding to screen content.",
        why: "Ignoring inner padding lets content hide behind bars, FABs, cutouts, and IME transitions.",
        fix: "Name the padding parameter and pass it into the content container with `Modifier.padding(innerPadding)`.",
        detect: function (code) { return /Scaffold\s*\{/.test(code) && !/(innerPadding|paddingValues|contentPadding)/.test(code) ? "Found a `Scaffold` content lambda with no obvious inner padding usage." : ""; },
      },
      {
        id: "edge-to-edge-setup",
        severity: "System UI",
        section: "edge-to-edge-insets",
        title: "Edge-to-edge screens need Activity setup.",
        why: "Target SDK 35 enforces edge-to-edge, and earlier versions need explicit setup for transparent system bars and correct IME inset dispatch.",
        fix: "Call `enableEdgeToEdge()` in `Activity.onCreate()` and set `android:windowSoftInputMode=\"adjustResize\"` for screens that need IME insets.",
        detect: function (code) {
          const hasActivity = /class\s+\w+Activity|onCreate\s*\(|setContent\s*\{/.test(code);
          const hasComposeScreen = /setContent\s*\{|Scaffold\s*\(|WindowInsets|imePadding|safeDrawingPadding|systemBarsPadding/.test(code);
          const missingEdge = hasActivity && hasComposeScreen && !/(enableEdgeToEdge\s*\(|WindowCompat\.setDecorFitsSystemWindows\s*\(\s*window\s*,\s*false\s*\))/.test(code);
          const missingResize = hasComposeScreen && /(TextField|SecureTextField|OutlinedTextField|WindowInsets\.ime|imePadding|imeNestedScroll)/.test(code) && !/(windowSoftInputMode\s*=\s*["']adjustResize|adjustResize)/.test(code);
          if (missingEdge && missingResize) return "Found Compose Activity or screen code without edge-to-edge setup or adjustResize for IME insets.";
          if (missingEdge) return "Found Compose Activity or screen code without obvious edge-to-edge setup.";
          if (missingResize) return "Found text/IME inset code without obvious `adjustResize` setup.";
          return "";
        },
      },
      {
        id: "duplicate-insets",
        severity: "System UI",
        section: "edge-to-edge-insets",
        title: "Do not apply the same inset twice.",
        why: "Material components and inset padding modifiers consume inset space. Stacking Scaffold innerPadding with systemBarsPadding, safeDrawingPadding, navigationBarsPadding, or imePadding on the same content edge can create double spacing.",
        fix: "Decide which owner handles each edge: Scaffold innerPadding, a Material component's default insets, or an explicit WindowInsets modifier. Use `consumeWindowInsets` when passing padding deeper.",
        detect: function (code) {
          const hasScaffoldPadding = /(innerPadding|paddingValues|contentPadding)/.test(code);
          const hasInsetPadding = /\.(?:safeDrawingPadding|systemBarsPadding|navigationBarsPadding|statusBarsPadding|imePadding|windowInsetsPadding)\s*\(/.test(code);
          const hasConsumption = /consumeWindowInsets\s*\(/.test(code);
          return hasScaffoldPadding && hasInsetPadding && !hasConsumption ? "Found Scaffold/content padding combined with inset padding and no obvious consumption boundary." : "";
        },
      },
      {
        id: "lazy-ime-contentpadding",
        severity: "System UI",
        section: "edge-to-edge-insets",
        title: "Use an inset Spacer for lazy lists above system bars and IME.",
        why: "A LazyColumn with only contentPadding can leave the last text field hidden by IME transitions. Inset size modifiers participate in animated consumption.",
        fix: "Combine `Modifier.imePadding()` with a bottom item such as `Spacer(Modifier.windowInsetsBottomHeight(WindowInsets.systemBars))` instead of relying only on bottom contentPadding.",
        detect: function (code) {
          return /Lazy(Column|VerticalGrid)[\s\S]{0,700}contentPadding\s*=/.test(code) && /(TextField|OutlinedTextField|SecureTextField|imePadding)/.test(code) && !/windowInsetsBottomHeight\s*\(\s*WindowInsets\.(?:systemBars|navigationBars|safeDrawing)/.test(code) ? "Found lazy text-input content using contentPadding without an inset bottom Spacer." : "";
        },
      },
      {
        id: "navigation-strings",
        severity: "App structure",
        section: "navigation-compose",
        title: "Prefer type-safe routes over fragile navigation strings.",
        why: "String routes hide argument types and make destination changes easy to break during refactors.",
        fix: "Define serializable route objects or data classes, use `composable<Route>`, and call `navController.navigate(Route(args))`.",
        detect: function (code) { return /(composable|navigate)\s*\(\s*["'`][^"'`]+["'`]/.test(code) ? "Found a literal route string in `composable(...)` or `navigate(...)`." : ""; },
      },
      {
        id: "nav3-unsaveable-keys",
        severity: "App structure",
        section: "navigation3-state",
        title: "Make Navigation 3 back-stack keys saveable.",
        why: "Navigation 3 can save the owned back stack only when keys are serializable NavKey values.",
        fix: "Annotate destination keys with `@Serializable`, implement `NavKey`, and use `rememberNavBackStack` when the stack must survive process death.",
        detect: function (code) {
          const usesNav3 = /(NavDisplay|entryProvider|rememberNavBackStack|NavKey)/.test(code);
          const hasKeys = /(data\s+(?:object|class)\s+\w+|sealed\s+interface\s+\w+)/.test(code);
          return usesNav3 && hasKeys && (!/@Serializable/.test(code) || !/:\s*NavKey\b/.test(code)) ? "Found Navigation 3 destination keys without both `@Serializable` and `NavKey`." : "";
        },
      },
      {
        id: "nav3-back-handling",
        severity: "App structure",
        section: "navigation3-state",
        title: "Wire NavDisplay back handling to the owned stack.",
        why: "In Navigation 3, the app owns navigation state; back behavior should update that state instead of living in an implicit controller.",
        fix: "Pass `onBack = { backStack.removeLastOrNull() }` or delegate to a navigator that mutates the same back-stack state.",
        detect: function (code) { return /NavDisplay\s*\(/.test(code) && !/onBack\s*=/.test(code) ? "Found `NavDisplay` without an `onBack` handler." : ""; },
      },
      {
        id: "nav3-mixed-controller",
        severity: "Migration",
        section: "navigation3-state",
        title: "Do not mix Navigation 3 state with NavController mutation.",
        why: "Navigation 3 navigation happens by adding and removing keys from owned state; mixing NavController or NavHost keeps two competing navigation models alive.",
        fix: "Move destinations into `entryProvider`, replace `NavHost` with `NavDisplay`, and route events to the owned back stack or navigator object.",
        detect: function (code) { return /NavDisplay\s*\(|entryProvider\s*\{/.test(code) && /(rememberNavController|NavHost\s*\(|NavController|navController\.navigate)/.test(code) ? "Found Navigation 3 APIs mixed with Navigation 2 controller or NavHost APIs." : ""; },
      },
      {
        id: "adaptive-window",
        severity: "Adaptive",
        section: "adaptive-layouts",
        title: "Base adaptive layout on the app window, not physical screen assumptions.",
        why: "Split screen, desktop windows, ChromeOS, and foldables can give your app a window that is very different from the full display.",
        fix: "Use `currentWindowAdaptiveInfo().windowSizeClass` at the app shell, derive simple layout state, and pass that state down.",
        detect: function (code) { return /(LocalConfiguration\.current\.screenWidthDp|resources\.displayMetrics|DisplayMetrics)/.test(code) && !/currentWindowAdaptiveInfo\s*\(/.test(code) ? "Found screen/display-size logic without `currentWindowAdaptiveInfo()`." : ""; },
      },
      {
        id: "modifier-order",
        severity: "Layout",
        section: "modifier-order",
        title: "Review modifier order before polishing visuals.",
        why: "Modifier order changes measurement, drawing, hit targets, clipping, and semantics.",
        fix: "Check whether `background`, `clip`, `padding`, `clickable`, and size modifiers are in the intended order.",
        detect: function (code) { return /\.padding\s*\([^)]*\)\s*\.\s*(background|clickable|clip)\s*\(/.test(code) ? "Found `padding()` before drawing or interaction modifiers." : ""; },
      },
      {
        id: "theme-hardcoded-visuals",
        severity: "Theming",
        section: "theming-design-system",
        title: "Use theme roles or product tokens instead of hard-coded visuals.",
        why: "Hard-coded colors, text sizes, and shapes drift from brand, dark theme, dynamic color, and accessibility contrast.",
        fix: "Read `MaterialTheme.colorScheme`, `MaterialTheme.typography`, `MaterialTheme.shapes`, or a named product token from the app theme.",
        detect: function (code) { return /(Color\.(Black|White|Gray|Red|Blue|Green|Yellow)|Color\s*\(0x[0-9A-Fa-f]+|fontSize\s*=\s*\d+\.sp|RoundedCornerShape\s*\(\s*\d+\.dp\s*\))/.test(code) && !/(MaterialTheme|BrandTheme|Local[A-Za-z]*Theme)/.test(code) ? "Found hard-coded visual constants without obvious theme token usage." : ""; },
      },
      {
        id: "compositionlocal-screen-state",
        severity: "Theming",
        section: "theming-design-system",
        title: "Reserve CompositionLocal for tree-scoped context.",
        why: "`CompositionLocal` is appropriate for theme tokens and broad local context, not for hiding screen state, repositories, navigation, or ViewModels.",
        fix: "Pass ordinary state and dependencies explicitly, or keep them at the route/state-holder boundary; keep CompositionLocal for design-system and ambient context values.",
        detect: function (code) { return /(compositionLocalOf|staticCompositionLocalOf)\s*\{[\s\S]{0,300}(ViewModel|Repository|NavController|MutableState|StateFlow|Flow)/.test(code) ? "Found a CompositionLocal default that looks like screen state or a dependency." : ""; },
      },
      {
        id: "draw-content-missing",
        severity: "Graphics",
        section: "drawing-graphics",
        title: "Call drawContent inside drawWithContent unless you mean to replace content.",
        why: "`drawWithContent` gives you draw-order control, but omitting `drawContent()` suppresses the composable's normal content.",
        fix: "Call `drawContent()` before or after custom drawing, or switch to `drawBehind` when the drawing should always sit behind content.",
        detect: function (code) { return /\.drawWithContent\s*\{[\s\S]{0,700}\}/.test(code) && !/drawContent\s*\(/.test(code) ? "Found `drawWithContent` without an obvious `drawContent()` call." : ""; },
      },
      {
        id: "draw-cache-without-cache",
        severity: "Graphics",
        section: "drawing-graphics",
        title: "Use drawWithCache only when something expensive is cached.",
        why: "`drawWithCache` is for caching objects such as Brush, Path, Shader, or text measurement while size/read state is unchanged; otherwise it adds avoidable lambda overhead.",
        fix: "Use `drawBehind` for simple drawing, or keep `drawWithCache` only when creating cached draw objects outside the onDraw block.",
        detect: function (code) { return /\.drawWithCache\s*\{/.test(code) && !/(Brush\.|Path\s*\(|Shader|rememberTextMeasurer|TextMeasurer|ImageBitmap|onDrawBehind|onDrawWithContent)/.test(code) ? "Found `drawWithCache` without obvious cached draw objects." : ""; },
      },
      {
        id: "custom-layout-place",
        severity: "Layout internals",
        section: "custom-layouts",
        title: "Place every child measured by a custom layout.",
        why: "A measured child is still invisible until the placement block calls `place` or `placeRelative` on its Placeable.",
        fix: "Inside the `layout(width, height) { ... }` placement block, call `place` or `placeRelative` for every Placeable.",
        detect: function (code) { return /(Layout\s*\(|\.layout\s*\{)[\s\S]{0,1200}\.measure\s*\(/.test(code) && !/\.place(Relative)?\s*\(/.test(code) ? "Found custom measurement without an obvious child placement call." : ""; },
      },
      {
        id: "custom-layout-double-measure",
        severity: "Layout internals",
        section: "custom-layouts",
        title: "Do not measure the same child twice in one layout pass.",
        why: "Compose enforces single-pass measurement; measuring one Measurable repeatedly to try layouts can throw at runtime.",
        fix: "Choose constraints before measuring, use intrinsics for pre-measure questions, or switch to a subcomposition pattern when content genuinely depends on earlier measurement.",
        detect: function (code) {
          const matches = code.match(/\b([A-Za-z_][\w]*)\.measure\s*\(/g) || [];
          const counts = {};
          matches.forEach(function (item) {
            const name = item.split(".")[0];
            counts[name] = (counts[name] || 0) + 1;
          });
          const repeated = Object.keys(counts).filter(function (name) { return counts[name] > 1; });
          return repeated.length ? "Measured more than once: " + repeated.slice(0, 3).join(", ") : "";
        },
      },
      {
        id: "constraintlayout-unconstrained-child",
        severity: "Layout internals",
        section: "constraint-layout",
        title: "Every ConstraintLayout child needs constraints.",
        why: "ConstraintLayout positions children from references. A child without `constrainAs` or a matching `layoutId` is usually an unfinished constraint graph.",
        fix: "Use `createRefs()` plus `Modifier.constrainAs(ref) { ... }`, or pass a `ConstraintSet` and give each child a matching `Modifier.layoutId(\"...\")`.",
        detect: function (code) {
          return /ConstraintLayout\s*(?:\(|\{)/.test(code) && !/(constrainAs\s*\(|layoutId\s*\()/.test(code)
            ? "Found ConstraintLayout without obvious child `constrainAs` or `layoutId` constraints."
            : "";
        },
      },
      {
        id: "constraintset-layoutid",
        severity: "Layout internals",
        section: "constraint-layout",
        title: "Decoupled ConstraintSet requires matching layoutId values.",
        why: "ConstraintSet references are string IDs. If children do not use matching `layoutId` values, the set cannot bind constraints to the emitted composables.",
        fix: "Keep `createRefFor(\"name\")` values and `Modifier.layoutId(\"name\")` values in sync, preferably as shared constants for larger screens.",
        detect: function (code) {
          return /\bConstraintSet\b/.test(code) && /ConstraintLayout\s*\(\s*(?:constraintSet\s*=)?\s*\w+/.test(code) && !/layoutId\s*\(/.test(code)
            ? "Found a decoupled ConstraintSet without child `layoutId` modifiers."
            : "";
        },
      },
      {
        id: "constraintlayout-simple-overuse",
        severity: "Layout",
        section: "constraint-layout",
        title: "Prefer Row, Column, Box, or custom Layout for simple Compose layouts.",
        why: "Compose handles nested layout efficiently. ConstraintLayout is most useful for sibling-relative constraints, guidelines, barriers, chains, or swappable ConstraintSets, not for flattening hierarchy.",
        fix: "Use Row/Column/Box/Arrangement for ordinary stacking and distribution; keep ConstraintLayout when its constraint concepts make the layout clearer.",
        detect: function (code) {
          const simple = /ConstraintLayout\s*\{/.test(code) && !/(ConstraintSet|createGuideline|create(?:Top|Bottom|Start|End)Barrier|create(?:Horizontal|Vertical)Chain|ChainStyle|BoxWithConstraints)/.test(code);
          const count = (code.match(/constrainAs\s*\(/g) || []).length;
          return simple && count > 0 && count <= 2 ? "Found a small inline ConstraintLayout that may be simpler as Row, Column, or Box." : "";
        },
      },
      {
        id: "effect-key",
        severity: "Runtime",
        section: "effects-lifecycle",
        title: "Audit broad effect keys.",
        why: "`LaunchedEffect(Unit)` and `LaunchedEffect(true)` are valid only when the work truly belongs to the composable lifetime.",
        fix: "Key effects to the changing input, or use `rememberUpdatedState` when callbacks should update without restarting work.",
        detect: function (code) { return /LaunchedEffect\s*\(\s*(Unit|true)\s*\)/.test(code) ? "Found `LaunchedEffect(Unit/true)`." : ""; },
      },
      {
        id: "side-effect-body",
        severity: "Runtime",
        section: "effects-lifecycle",
        title: "Keep one-shot work out of the composable body.",
        why: "Navigation, toasts, snackbars, and logging can repeat unpredictably when composition restarts.",
        fix: "Move one-shot work behind events or the appropriate effect API.",
        detect: function (code) { return /(Toast\.makeText|showSnackbar\s*\(|navController\.navigate\s*\()/.test(code) && !/(LaunchedEffect|rememberCoroutineScope)/.test(code) ? "Found one-shot work without an obvious effect or event scope." : ""; },
      },
      {
        id: "image-a11y",
        severity: "Accessibility",
        section: "images-resources",
        title: "Do not hide meaningful images from accessibility services.",
        why: "`contentDescription = null` is only for decorative images.",
        fix: "Provide a meaningful content description, or confirm the image is purely decorative.",
        detect: function (code) { return /Image\s*\([\s\S]{0,500}contentDescription\s*=\s*null/.test(code) ? "Found `Image(... contentDescription = null ...)`." : ""; },
      },
      {
        id: "async-image-bounds",
        severity: "Performance",
        section: "images-resources",
        title: "Bound remote image requests before loading.",
        why: "Remote image loaders use layout constraints to choose decode size; unconstrained AsyncImage calls can fetch and decode full-size bitmaps.",
        fix: "Give AsyncImage a real modifier size, width, height, aspectRatio, sizeIn, or bounded fill inside a constrained parent.",
        detect: function (code) {
          return /AsyncImage\s*\(/.test(code) && !/\.(?:size|requiredSize|sizeIn|width|height|fillMaxWidth|fillMaxHeight|fillMaxSize|aspectRatio)\s*\(/.test(code)
            ? "Found `AsyncImage` without an obvious size, fill, or aspect-ratio constraint."
            : "";
        },
      },
      {
        id: "painter-parameter",
        severity: "Performance",
        section: "images-resources",
        title: "Prefer stable image inputs over Painter parameters.",
        why: "Painter is not a stable API boundary for reusable composables and can create avoidable recompositions when callers allocate it.",
        fix: "Pass a @DrawableRes id, ImageVector, ImageBitmap, URL/model, or domain image object, then create or remember the Painter inside the composable.",
        detect: function (code) {
          return /@Composable[\s\S]{0,260}fun\s+\w+\s*\([^)]*\b[A-Za-z_]\w*\s*:\s*Painter\b/.test(code)
            ? "Found a composable API that accepts a `Painter` parameter."
            : "";
        },
      },
      {
        id: "searchbar-expanded-state",
        severity: "State",
        section: "selection-inputs",
        title: "SearchBar needs query and expanded state owned together.",
        why: "SearchBar is a stateful surface: query text, expanded suggestions, search submission, and collapse behavior must be coordinated by one owner.",
        fix: "Own `query` and `expanded` with hoisted or saveable state, wire `SearchBarDefaults.InputField`, and set `expanded = false` after search or suggestion selection.",
        detect: function (code) {
          return /SearchBar\s*\(/.test(code) && (!/expanded\s*=/.test(code) || !/onExpandedChange\s*=/.test(code) || !/query\s*=/.test(code))
            ? "Found SearchBar without a complete query/expanded state contract."
            : "";
        },
      },
      {
        id: "filterchip-selected-state",
        severity: "State",
        section: "selection-inputs",
        title: "FilterChip selection should come from filter state.",
        why: "A FilterChip represents active filtering. Hard-coded selected values or empty clicks make the visual state drift from the result set.",
        fix: "Derive `selected` from selected filter state and update that state in `onClick`.",
        detect: function (code) {
          return /FilterChip\s*\(/.test(code) && (/selected\s*=\s*(true|false)/.test(code) || /onClick\s*=\s*\{\s*\}/.test(code))
            ? "Found a FilterChip with hard-coded selection or empty click behavior."
            : "";
        },
      },
      {
        id: "inputchip-remove-path",
        severity: "Components",
        section: "selection-inputs",
        title: "Removable InputChip needs a real remove action.",
        why: "Input chips often represent user-entered tokens. A close icon without a remove callback is misleading and inaccessible.",
        fix: "Wire the chip click or trailing icon to `onRemove(token)` and give the close icon a meaningful content description.",
        detect: function (code) {
          const hasInputChip = /InputChip\s*\(/.test(code);
          const hasClose = /(Icons\.Default\.Close|contentDescription\s*=\s*["']Remove|trailingIcon\s*=)/.test(code);
          return hasInputChip && hasClose && !/(onRemove|remove[A-Za-z0-9_]*\s*\(|\.remove\s*\(|filterNot)/.test(code)
            ? "Found a removable-looking InputChip without an obvious remove state update."
            : "";
        },
      },
      {
        id: "segmented-button-size",
        severity: "Components",
        section: "selection-inputs",
        title: "Use segmented buttons only for small option sets.",
        why: "Segmented buttons work for two to five compact choices. Larger, dynamic, or long-label sets need chips, tabs, menus, or a list.",
        fix: "Keep segmented buttons to a small fixed set, or move more complex selections to FilterChip/InputChip groups.",
        detect: function (code) {
          const count = (code.match(/SegmentedButton\s*\(/g) || []).length;
          const suspiciousList = /SegmentedButtonRow[\s\S]{0,600}(listOf\s*\([^)]*,[^)]*,[^)]*,[^)]*,[^)]*,|options\.forEach)/.test(code) && !/take\s*\(\s*5\s*\)/.test(code);
          return count > 5 || suspiciousList ? "Found a segmented button set that may exceed the recommended small fixed option count." : "";
        },
      },
      {
        id: "datepicker-confirm-state",
        severity: "State",
        section: "selection-inputs",
        title: "Date pickers need state plus explicit confirm/dismiss handling.",
        why: "DatePicker and DateRangePicker expose tentative selection state. Mutating committed filters before confirm makes cancel and back behavior unreliable.",
        fix: "Use `rememberDatePickerState` or `rememberDateRangePickerState`, wrap modal flows in `DatePickerDialog`, and commit selected millis only from confirm.",
        detect: function (code) {
          const hasDatePicker = /(DatePicker|DateRangePicker)\s*\(/.test(code);
          return hasDatePicker && (!/(rememberDatePickerState|rememberDateRangePickerState)/.test(code) || !/(confirmButton|onDateConfirmed|onRangeConfirmed|selectedDateMillis|selectedStartDateMillis)/.test(code))
            ? "Found a date picker without obvious picker state and confirm handling."
            : "";
        },
      },
      {
        id: "timepicker-state-dialog",
        severity: "State",
        section: "selection-inputs",
        title: "Time pickers need TimePickerState and a dialog-level decision.",
        why: "TimePicker and TimeInput are tentative editors. Users need confirm and dismiss paths before selected hour/minute become committed app state.",
        fix: "Create `rememberTimePickerState`, show `TimePicker` or `TimeInput` inside a dialog surface, and commit `state.hour` and `state.minute` from confirm.",
        detect: function (code) {
          const hasTimePicker = /(TimePicker|TimeInput)\s*\(/.test(code);
          return hasTimePicker && (!/rememberTimePickerState/.test(code) || !/(confirmButton|onTimeConfirmed|state\.hour|state\.minute)/.test(code))
            ? "Found a time picker without obvious `TimePickerState` and confirm handling."
            : "";
        },
      },
      {
        id: "progress-normalized",
        severity: "Components",
        section: "status-content",
        title: "Determinate progress must be normalized to 0f..1f.",
        why: "Material progress indicators expect a Float fraction, not a percent or byte count.",
        fix: "Convert percent, bytes, or step counts into a 0f..1f value and clamp it with `coerceIn(0f, 1f)` before passing `progress`.",
        detect: function (code) {
          const hasProgress = /(LinearProgressIndicator|CircularProgressIndicator)\s*\(/.test(code) && /progress\s*=/.test(code);
          const badLiteral = /progress\s*=\s*(?:\{\s*)?(?:[2-9]\d*|1\.[1-9]\d*)f?/.test(code);
          const percentName = /progress\s*=\s*(?:\{\s*)?(?:percent|percentage|progressPercent|uploadPercent|downloadPercent)\b/i.test(code);
          return hasProgress && (badLiteral || percentName) && !/coerceIn\s*\(\s*0f\s*,\s*1f\s*\)/.test(code)
            ? "Found determinate progress that looks like a percent or unbounded value."
            : "";
        },
      },
      {
        id: "pull-refresh-contract",
        severity: "State",
        section: "status-content",
        title: "PullToRefreshBox needs a controlled refresh contract.",
        why: "Pull-to-refresh only coordinates the gesture. The caller must own whether a refresh is active and what work runs on refresh.",
        fix: "Pass `isRefreshing`, `onRefresh`, and scrollable content. If you customize the indicator, create `rememberPullToRefreshState()` and pass the same state to the box and indicator.",
        detect: function (code) {
          if (!/PullToRefreshBox\s*\(/.test(code)) return "";
          if (!/isRefreshing\s*=/.test(code) || !/onRefresh\s*=/.test(code)) return "Found PullToRefreshBox without `isRefreshing` and `onRefresh`.";
          if (/indicator\s*=/.test(code) && (!/rememberPullToRefreshState\s*\(/.test(code) || !/state\s*=/.test(code))) return "Found a custom pull-to-refresh indicator without shared pull state.";
          if (!/(LazyColumn|LazyVerticalGrid|verticalScroll|scrollable)\s*(?:\(|\{)/.test(code)) return "Found PullToRefreshBox without obvious scrollable content.";
          return "";
        },
      },
      {
        id: "carousel-state-sizing",
        severity: "Components",
        section: "status-content",
        title: "Material carousels need state and explicit item sizing.",
        why: "Carousel layout depends on item count and sizing hints; missing state or itemWidth/preferredItemWidth makes behavior fragile across window sizes.",
        fix: "Create `rememberCarouselState { items.count() }` and pass `itemWidth` for uncontained or `preferredItemWidth` for multi-browse carousels.",
        detect: function (code) {
          const hasCarousel = /(HorizontalMultiBrowseCarousel|HorizontalUncontainedCarousel)\s*\(/.test(code);
          if (!hasCarousel) return "";
          if (!/rememberCarouselState\s*\{/.test(code)) return "Found a carousel without `rememberCarouselState { itemCount }`.";
          if (/HorizontalMultiBrowseCarousel\s*\(/.test(code) && !/preferredItemWidth\s*=/.test(code)) return "Found HorizontalMultiBrowseCarousel without `preferredItemWidth`.";
          if (/HorizontalUncontainedCarousel\s*\(/.test(code) && !/itemWidth\s*=/.test(code)) return "Found HorizontalUncontainedCarousel without `itemWidth`.";
          return "";
        },
      },
      {
        id: "lazy-divider-identity",
        severity: "Performance",
        section: "status-content",
        title: "Do not model list dividers as unkeyed lazy data items.",
        why: "Dividers are presentation between rows. Inserting them as separate lazy items can disturb item identity, animations, and contentType reuse.",
        fix: "Emit `HorizontalDivider` inside the keyed row item or give separators stable keys and contentType when they are real timeline content.",
        detect: function (code) {
          return /(LazyColumn|LazyVerticalGrid)\s*\{[\s\S]{0,1800}item\s*\{[\s\S]{0,120}HorizontalDivider\s*\(/.test(code)
            ? "Found a divider emitted as a separate unkeyed lazy item."
            : "";
        },
      },
      {
        id: "dialog-dismiss-state",
        severity: "Components",
        section: "transient-surfaces",
        title: "Dialogs need a real dismiss state path.",
        why: "A dialog is interruptive; outside tap, back, cancel, and confirm paths must all be able to remove it from composition.",
        fix: "Wire `onDismissRequest` and dismiss buttons to the same hoisted visibility state or route event.",
        detect: function (code) {
          return /(AlertDialog|Dialog)\s*\(/.test(code) && (!/onDismissRequest\s*=/.test(code) || /onDismissRequest\s*=\s*\{\s*\}/.test(code))
            ? "Found a dialog without a real `onDismissRequest` handler."
            : "";
        },
      },
      {
        id: "snackbar-host-state",
        severity: "Runtime",
        section: "transient-surfaces",
        title: "Show snackbars through a SnackbarHostState hosted by Scaffold.",
        why: "`showSnackbar` is suspending and queued through SnackbarHostState; without a host users may never see the message or action.",
        fix: "Create `remember { SnackbarHostState() }`, pass it to `SnackbarHost` in Scaffold, and call `showSnackbar` from an event coroutine or effect.",
        detect: function (code) {
          return /showSnackbar\s*\(/.test(code) && !/(SnackbarHostState|SnackbarHost\s*\(|snackbarHost\s*=)/.test(code)
            ? "Found `showSnackbar` without an obvious `SnackbarHostState` and `SnackbarHost`."
            : "";
        },
      },
      {
        id: "menu-item-dismiss",
        severity: "Components",
        section: "transient-surfaces",
        title: "Dropdown menu actions should close the menu.",
        why: "DropdownMenu is a temporary anchored surface; leaving it expanded after item selection traps focus and obscures content.",
        fix: "Set `expanded = false` in each `DropdownMenuItem` action before or alongside the real action.",
        detect: function (code) {
          return /DropdownMenu\s*\([\s\S]{0,1400}DropdownMenuItem\s*\(/.test(code) && /DropdownMenuItem\s*\([\s\S]{0,500}onClick\s*=\s*\{(?![\s\S]{0,180}expanded\s*=\s*false)/.test(code)
            ? "Found a DropdownMenuItem without an obvious `expanded = false` close path."
            : "";
        },
      },
      {
        id: "sheet-hide-remove",
        severity: "Components",
        section: "transient-surfaces",
        title: "Remove ModalBottomSheet from composition after hide completes.",
        why: "Hiding SheetState only animates state; the modal sheet composable should also leave composition when it is no longer visible.",
        fix: "Guard the sheet with a Boolean, call `sheetState.hide()`, and set that Boolean false in `invokeOnCompletion` when `!sheetState.isVisible`.",
        detect: function (code) {
          return /ModalBottomSheet\s*\(/.test(code) && /sheetState\.hide\s*\(/.test(code) && !/(isVisible|show[A-Za-z0-9_]*\s*=\s*false|showBottomSheet\s*=\s*false)/.test(code)
            ? "Found `sheetState.hide()` without an obvious state update that removes the sheet."
            : "";
        },
      },
      {
        id: "navigation-item-selected",
        severity: "Components",
        section: "navigation-surfaces",
        title: "Navigation items need selected state from one shell owner.",
        why: "NavigationBarItem, NavigationRailItem, and NavigationDrawerItem are destination controls. Each item should reflect the current top-level destination from the same app-shell state.",
        fix: "Keep current destination state in the shell or navigation state holder and pass `selected = current == destination` into every navigation item.",
        detect: function (code) {
          return /(NavigationBarItem|NavigationRailItem|NavigationDrawerItem)\s*\(/.test(code) && !/selected\s*=/.test(code)
            ? "Found Material navigation items without an obvious `selected =` state."
            : "";
        },
      },
      {
        id: "top-appbar-nav-action",
        severity: "Components",
        section: "navigation-surfaces",
        title: "Top app bar navigation icons must perform a real navigation action.",
        why: "The navigationIcon slot communicates back, up, menu, or root navigation. A decorative or empty IconButton leaves keyboard and accessibility users at a dead end.",
        fix: "Pass a real `onNavigateBack`, drawer open, or root navigation callback and use a localized content description.",
        detect: function (code) {
          const hasTopBarNav = /(TopAppBar|CenterAlignedTopAppBar|MediumTopAppBar|LargeTopAppBar)\s*\([\s\S]{0,1200}navigationIcon\s*=/.test(code);
          const emptyClick = /navigationIcon\s*=\s*\{[\s\S]{0,500}IconButton\s*\(\s*onClick\s*=\s*\{\s*(?:\/\*.*?\*\/)?\s*\}/.test(code);
          const missingDesc = /navigationIcon\s*=\s*\{[\s\S]{0,500}Icon\s*\([\s\S]{0,260}contentDescription\s*=\s*null/.test(code);
          if (hasTopBarNav && emptyClick) return "Found a top app bar navigationIcon with an empty click handler.";
          if (hasTopBarNav && missingDesc) return "Found a top app bar navigation icon with `contentDescription = null`.";
          return "";
        },
      },
      {
        id: "drawer-item-close",
        severity: "Components",
        section: "navigation-surfaces",
        title: "Close modal drawers after destination selection.",
        why: "A ModalNavigationDrawer covers content. If item clicks navigate without closing the drawer, users remain on an obscuring surface after the action.",
        fix: "Call the destination event and then close the drawer with `drawerState.close()` from a coroutine.",
        detect: function (code) {
          return /ModalNavigationDrawer\s*\(/.test(code) && /NavigationDrawerItem\s*\(/.test(code) && !/drawerState\.close\s*\(/.test(code)
            ? "Found drawer navigation items without an obvious `drawerState.close()` path."
            : "";
        },
      },
      {
        id: "tab-selection-saveable",
        severity: "State",
        section: "navigation-surfaces",
        title: "Save locally owned tab selection.",
        why: "Tabs often represent user-visible position inside a destination. If the destination owns selectedTab locally, recreation should not silently reset it.",
        fix: "Hoist selected tab state, or use `rememberSaveable` for small local tab index state.",
        detect: function (code) {
          const hasTabs = /(PrimaryTabRow|SecondaryTabRow|TabRow|ScrollableTabRow)\s*\(/.test(code);
          const localRemember = /remember\s*\{\s*mutable(?:Int)?StateOf\s*\(\s*0\s*\)/.test(code);
          return hasTabs && localRemember && !/rememberSaveable/.test(code)
            ? "Found tab selection stored with `remember` instead of hoisted or saveable state."
            : "";
        },
      },
      {
        id: "clickable-a11y",
        severity: "Accessibility",
        section: "accessibility-testing",
        title: "Give custom clickable surfaces a semantic contract.",
        why: "A bare clickable Row or Box can be unclear to screen readers and UI tests.",
        fix: "Add role, state description, label, merged semantics, or use a Material component with built-in semantics.",
        detect: function (code) { return /\.clickable\s*(?:\(|\{)/.test(code) && !/(semantics\s*\{|role\s*=|stateDescription|contentDescription)/.test(code) ? "Found clickable UI with no obvious semantic label, role, or state." : ""; },
      },
      {
        id: "raw-pointer-semantics",
        severity: "Input",
        section: "pointer-input-gestures",
        title: "Raw pointer input must rebuild semantics and keyboard behavior.",
        why: "`pointerInput` only handles pointer events; it does not automatically add accessibility, focus, hover, keyboard, or indication behavior like `clickable` does.",
        fix: "Use `clickable` or a Material component when possible; otherwise pair `pointerInput` with semantics, keyboard handling, and clear visual feedback.",
        detect: function (code) { return /\.(pointerInput)\s*\(/.test(code) && /(detectTapGestures|awaitPointerEvent|awaitEachGesture)/.test(code) && !/(semantics\s*\{|onClick\s*\{|onKeyEvent|role\s*=|contentDescription|clickable\s*\()/ .test(code) ? "Found raw pointer handling without an obvious semantic or keyboard contract." : ""; },
      },
      {
        id: "pointer-detector-blocking",
        severity: "Input",
        section: "pointer-input-gestures",
        title: "Do not stack blocking gesture detectors in one pointerInput block.",
        why: "Top-level detector functions such as `detectTapGestures` suspend while waiting for their gesture; code after the first detector may never run.",
        fix: "Use separate `.pointerInput(...) { ... }` modifiers for independent detectors, or write one coordinated `awaitEachGesture` loop.",
        detect: function (code) { return /\.pointerInput\s*\([^)]*\)\s*\{[\s\S]{0,700}detectTapGestures[\s\S]{0,700}detect(Drag|Transform|HorizontalDrag|VerticalDrag)Gestures/.test(code) ? "Found multiple top-level gesture detectors inside one `pointerInput` block." : ""; },
      },
      {
        id: "key-handler-focusable",
        severity: "Input",
        section: "focus-keyboard-input",
        title: "Key handlers need a focusable target.",
        why: "Hardware key handlers run through the focused node path; a custom Box or Row with only `onKeyEvent` is often unreachable by keyboard, D-pad, and accessibility users.",
        fix: "Attach the handler to a naturally focusable component, add `.focusable()` with visible focus feedback, or use parent `onPreviewKeyEvent` for screen-level shortcuts that descendants can reach.",
        detect: function (code) {
          const hasKeyHandler = /\.(?:onKeyEvent|onPreviewKeyEvent)\s*(?:\(|\{)/.test(code);
          const hasFocusPath = /\.(?:focusable|clickable|combinedClickable|selectable|toggleable)\s*(?:\(|\{)/.test(code) || /\b(?:TextField|BasicTextField|OutlinedTextField|Button|IconButton|FilterChip|Switch|Checkbox|RadioButton)\s*\(/.test(code);
          return hasKeyHandler && !hasFocusPath ? "Found a key handler without an obvious focusable node or focused text input." : "";
        },
      },
      {
        id: "focus-request-body",
        severity: "Input",
        section: "focus-keyboard-input",
        title: "Do not request focus directly from the composable body.",
        why: "Composition can run many times; calling `requestFocus()` directly while composing can repeat focus moves and fight measurement, restoration, and user intent.",
        fix: "Remember a FocusRequester and call `requestFocus()` from a callback, KeyboardActions block, key handler, or effect that runs after composition.",
        detect: function (code) {
          const lines = code.split(/\n/);
          for (let i = 0; i < lines.length; i += 1) {
            if (!/(?:\.|\b)requestFocus\s*\(/.test(lines[i])) continue;
            const context = lines.slice(Math.max(0, i - 6), i + 1).join("\n");
            const hasEventOrEffect = /(LaunchedEffect|SideEffect|DisposableEffect|KeyboardActions|onClick\s*=|onClick\s*\{|onPreviewKeyEvent|onKeyEvent|rememberCoroutineScope)/.test(context);
            if (!hasEventOrEffect) return "Found `requestFocus()` without an obvious callback or effect boundary.";
          }
          return "";
        },
      },
      {
        id: "compose-test-sleep",
        severity: "Testing",
        section: "compose-ui-testing",
        title: "Do not time Compose UI tests with real sleeps.",
        why: "Compose tests synchronize actions and assertions with the UI, and the main test clock can advance recomposition, animations, and gestures deterministically.",
        fix: "Use `waitForIdle()`, `waitUntil { ... }`, an idling resource, or `mainClock.advanceTimeBy(...)` instead of `Thread.sleep` or arbitrary delay.",
        detect: function (code) { return /(Thread\.sleep\s*\(|delay\s*\(\s*\d)/.test(code) && /(createComposeRule|ComposeTestRule|onNode|onAllNodes|composeTestRule|mainClock)/.test(code) ? "Found sleep or delay in a Compose UI test." : ""; },
      },
      {
        id: "compose-test-layout-selectors",
        severity: "Testing",
        section: "compose-ui-testing",
        title: "Assert semantic behavior instead of layout implementation.",
        why: "Compose tests should find meaningful nodes and verify user-observable behavior; Row, Column, Box, padding, and child indexes are refactor details.",
        fix: "Prefer `onNodeWithText`, `onNodeWithContentDescription`, role or state matchers, and targeted test tags only for otherwise invisible contracts.",
        detect: function (code) { return /(onRoot\s*\(\)\.onChildren|onChildren\s*\(\)\.on.*(?:At|First|Last)|assertLeftPositionInRoot|assertTopPositionInRoot|assertWidthIsEqualTo|assertHeightIsEqualTo)/.test(code) && /(createComposeRule|ComposeTestRule|onNode|composeTestRule)/.test(code) ? "Found a Compose test that appears to assert child position, index, or size rather than behavior." : ""; },
      },
      {
        id: "preview-viewmodel-route",
        severity: "Tooling",
        section: "previews-tooling",
        title: "Preview stateless content, not ViewModel-backed routes.",
        why: "Android Studio previews run in Layoutlib and cannot construct real ViewModels, Hilt graphs, repositories, network calls, or file-backed dependencies reliably.",
        fix: "Preview the content composable with sample UI state and no-op callbacks; keep `viewModel()` or `hiltViewModel()` in the route composable.",
        detect: function (code) { return /@Preview[\s\S]{0,700}(viewModel\s*\(|hiltViewModel\s*\(|\b[A-Za-z_][\w]*Route\s*\()/.test(code) ? "Found a @Preview that appears to invoke a route or obtain a ViewModel." : ""; },
      },
      {
        id: "preview-without-theme",
        severity: "Tooling",
        section: "previews-tooling",
        title: "Wrap previews in the app theme.",
        why: "Un-themed previews can hide broken typography, color roles, shapes, dynamic color behavior, and dark-theme contrast until much later.",
        fix: "Wrap preview content in `AppTheme`, `MaterialTheme`, or the product theme used by production content.",
        detect: function (code) { return /@Preview/.test(code) && !/(AppTheme|MaterialTheme|BrandTheme|DesignSystemTheme)\s*\{/.test(code) ? "Found @Preview usage without an obvious theme wrapper." : ""; },
      },
      {
        id: "textfield-contract",
        severity: "State",
        section: "textfields",
        title: "Prefer state-based text fields for modern Compose input.",
        why: "`TextFieldState` owns text, selection, composition, and edit synchronization. It avoids the async callback problems that value-based `TextField` code can introduce.",
        fix: "Use `state = rememberTextFieldState()`, `lineLimits`, labels, supporting text, and validation from the same field owner. If this is legacy value-based code, keep both `value` and `onValueChange` complete.",
        detect: function (code) {
          const has = /(?:OutlinedTextField|TextField)\s*\(/.test(code);
          if (!has || /state\s*=/.test(code)) return "";
          if (!/value\s*=/.test(code) || !/onValueChange\s*=/.test(code)) return "Found a text field without state-based `state` or a complete legacy `value`/`onValueChange` pair.";
          return "Found value-based TextField usage; prefer state-based `TextFieldState` for new Compose input.";
        },
      },
      {
        id: "textfield-filter-callback",
        severity: "Input",
        section: "textfields",
        title: "Move input filtering out of onValueChange.",
        why: "Filtering in a value callback can desynchronize the software keyboard, selection, and committed text. State-based fields apply filters immediately through `InputTransformation`.",
        fix: "Use `inputTransformation = InputTransformation.maxLength(...)` or a custom `InputTransformation` that edits the receiver `TextFieldBuffer`.",
        detect: function (code) {
          const filtersInCallback = /onValueChange\s*=\s*\{[\s\S]{0,350}(?:take\s*\(|drop\s*\(|filter\s*\(|trim(?:Start|End)?\s*\(|replace\s*\(|substring\s*\(|length\s*[<>=]|isDigit|Regex)/.test(code);
          return /(?:OutlinedTextField|TextField)\s*\(/.test(code) && filtersInCallback ? "Found text input filtering inside `onValueChange`." : "";
        },
      },
      {
        id: "textfield-visual-transformation",
        severity: "Input",
        section: "textfields",
        title: "Use OutputTransformation or SecureTextField instead of legacy visual transformations.",
        why: "State-based text fields split committed input from display formatting and calculate offset mapping for output transformations. Passwords should use `SecureTextField`.",
        fix: "Use `OutputTransformation` for display formatting, `InputTransformation` for accepted input, and `SecureTextField` for password or secret fields.",
        detect: function (code) {
          const hasTextField = /(?:OutlinedTextField|TextField)\s*\(/.test(code);
          const hasLegacyTransform = /(visualTransformation\s*=|VisualTransformation|PasswordVisualTransformation|OffsetMapping|TransformedText)/.test(code);
          return hasTextField && hasLegacyTransform ? "Found legacy visual transformation code in a text field." : "";
        },
      },
    ];
    const root = h("div", "code-lab");
    root.appendChild(h("div", "code-lab-head",
      '<div><span class="pg-label">Code review lab</span><h3>Paste Compose code and get a study-backed review.</h3></div>' +
      '<p>ComposeMaster turns common Kotlin patterns into review comments, fixes, and lesson routes before the code reaches production.</p>'));
    const shell = h("div", "code-lab-shell");
    const input = h("div", "code-lab-input");
    const area = h("textarea");
    area.spellcheck = false;
    area.value = sample;
    const actions = h("div", "code-lab-actions");
    const analyze = h("button", null, "Analyze code");
    const sampleBtn = h("button", null, "Load sample");
    const clear = h("button", null, "Clear");
    [analyze, sampleBtn, clear].forEach(function (btn) { btn.type = "button"; actions.appendChild(btn); });
    input.appendChild(area);
    input.appendChild(actions);
    const output = h("div", "code-lab-output");
    const metrics = h("div", "code-lab-metrics");
    const findings = h("div", "code-lab-findings");
    const route = h("div", "code-lab-route");
    const copy = h("button", null, "Copy review");
    copy.type = "button";
    output.appendChild(metrics);
    output.appendChild(findings);
    output.appendChild(route);
    output.appendChild(copy);
    shell.appendChild(input);
    shell.appendChild(output);
    root.appendChild(shell);
    let current = [];

    function sectionFor(id) {
      return SECTIONS.find(function (s) { return s.id === id; });
    }

    function analyzeCode() {
      const code = area.value || "";
      return rules.map(function (rule) {
        const evidence = rule.detect(code);
        if (!evidence) return null;
        const section = sectionFor(rule.section);
        return {
          id: rule.id,
          severity: rule.severity,
          title: rule.title,
          why: rule.why,
          fix: rule.fix,
          evidence: evidence,
          section: section,
        };
      }).filter(Boolean);
    }

    function reviewText() {
      if (!current.length) return "ComposeMaster code review: no high-confidence findings from the local rules.";
      return "ComposeMaster code review\n" + current.map(function (item, index) {
        return (index + 1) + ". [" + item.severity + "] " + item.title + "\n" +
          "   Evidence: " + item.evidence + "\n" +
          "   Fix: " + item.fix + "\n" +
          "   Study: " + (item.section ? item.section.title + " (#" + item.section.id + ")" : "ComposeMaster");
      }).join("\n");
    }

    function render() {
      current = analyzeCode();
      findings.innerHTML = "";
      route.innerHTML = "";
      const code = area.value || "";
      const loc = code.trim() ? code.split(/\n/).length : 0;
      metrics.innerHTML = "<span><b>" + current.length + "</b> findings</span><span><b>" + loc + "</b> lines scanned</span><span><b>" + rules.length + "</b> rules</span>";
      if (!current.length) {
        findings.appendChild(h("div", "code-lab-empty", "<b>No high-confidence findings.</b><span>Try the sample or review the production checklist for broader judgment calls.</span>"));
      } else {
        current.forEach(function (item) {
          const card = h("article", "code-finding");
          card.appendChild(h("div", "code-finding-top", "<span>" + esc(item.severity) + "</span><b>" + esc(item.title) + "</b>"));
          card.appendChild(h("p", null, esc(item.evidence)));
          card.appendChild(h("em", null, esc(item.fix)));
          if (item.section) {
            const a = h("a", null, "Study " + esc(item.section.title));
            a.href = "#" + item.section.id;
            card.appendChild(a);
          }
          findings.appendChild(card);
        });
        const seen = {};
        route.appendChild(h("h4", null, "Review route"));
        current.forEach(function (item) {
          if (!item.section || seen[item.section.id]) return;
          seen[item.section.id] = true;
          const a = h("a", null, "<span>" + esc(item.section.category) + "</span><b>" + esc(item.section.title) + "</b>");
          a.href = "#" + item.section.id;
          route.appendChild(a);
        });
      }
    }

    analyze.addEventListener("click", render);
    sampleBtn.addEventListener("click", function () { area.value = sample; render(); });
    clear.addEventListener("click", function () { area.value = ""; render(); area.focus(); });
    copy.addEventListener("click", function () { copyText(reviewText(), copy, "Copy review"); });
    area.addEventListener("input", function () { render(); });
    render();
    return root;
  }

  function buildReviewBoard(items) {
    const limit = 8;
    const categories = ["All"].concat(Array.from(new Set(items.map(function (item) { return item.category; }))));
    let active = "All";
    let compact = true;
    let filtered = items.slice();
    const root = h("div", "review-board is-compact");
    root.appendChild(h("div", "review-head",
      '<div><span class="pg-label">Production review board</span><h3>Use ComposeMaster as a pre-merge checklist.</h3></div>' +
      '<p>Filter by concept area, scan concrete checks, then jump to the lesson or official source when a review comment needs backing.</p>'));
    const controls = h("div", "review-controls");
    const tabs = h("div", "review-tabs");
    const actions = h("div", "review-actions");
    const count = h("span", "review-count");
    const copy = h("button", null, "Copy visible checklist");
    const toggle = h("button", null, "Show all");
    copy.type = "button";
    toggle.type = "button";
    actions.appendChild(count);
    actions.appendChild(copy);
    actions.appendChild(toggle);
    controls.appendChild(tabs);
    controls.appendChild(actions);
    const list = h("div", "review-list");

    function visibleItems() {
      return compact ? filtered.slice(0, limit) : filtered;
    }

    function checklistText() {
      return visibleItems().map(function (item) {
        return "- [ ] [" + item.category + " / " + item.type + "] " + item.section + ": " + item.check;
      }).join("\n");
    }

    function render() {
      filtered = items.filter(function (item) { return active === "All" || item.category === active; });
      root.classList.toggle("is-compact", compact);
      Array.prototype.slice.call(tabs.querySelectorAll("button")).forEach(function (btn) {
        btn.classList.toggle("on", btn.dataset.category === active);
      });
      count.textContent = filtered.length + " checks";
      toggle.hidden = filtered.length <= limit;
      toggle.textContent = compact ? "Show all" : "Show fewer";
      list.innerHTML = "";
      filtered.forEach(function (item, idx) {
        const card = h("article", "review-card" + (idx >= limit ? " is-extra" : ""));
        card.appendChild(h("div", "review-meta", "<span>" + esc(item.category) + "</span><b>" + esc(item.type) + "</b>"));
        card.appendChild(h("h4", null, esc(item.check)));
        card.appendChild(h("p", "review-why", esc(item.why)));
        const links = h("div", "review-links");
        const lesson = h("a", null, "Open lesson");
        lesson.href = "#" + item.id;
        links.appendChild(lesson);
        if (item.doc) {
          const doc = h("a", null, esc(item.doc.title) + '<span aria-hidden="true">↗</span>');
          doc.href = item.doc.url;
          doc.target = "_blank";
          doc.rel = "noopener noreferrer";
          links.appendChild(doc);
        }
        card.appendChild(links);
        list.appendChild(card);
      });
    }

    categories.forEach(function (category) {
      const btn = h("button", category === active ? "on" : null, esc(category));
      btn.type = "button";
      btn.dataset.category = category;
      btn.addEventListener("click", function () {
        active = category;
        compact = true;
        render();
      });
      tabs.appendChild(btn);
    });
    toggle.addEventListener("click", function () {
      compact = !compact;
      render();
    });
    copy.addEventListener("click", function () {
      copyText(checklistText(), copy, "Copy visible checklist");
    });

    root.appendChild(controls);
    root.appendChild(list);
    render();
    return root;
  }

  function buildRecipeLibrary() {
    const recipes = SECTIONS.filter(function (s) { return !!s.canonical_code; });
    const limit = 6;
    const categories = ["All"].concat(Array.from(new Set(recipes.map(function (s) { return s.category; }))));
    let active = "All";
    let compact = true;
    let filtered = recipes.slice();
    const root = h("div", "recipe-library is-compact");
    root.appendChild(h("div", "recipe-head",
      '<div><span class="pg-label">Canonical Kotlin recipe library</span><h3>Copy the reference implementation, then adapt it.</h3></div>' +
      '<p>Every lesson contributes one canonical snippet, tied back to the exact concept and official Android source.</p>'));
    const controls = h("div", "recipe-controls");
    const tabs = h("div", "recipe-tabs");
    const actions = h("div", "recipe-actions");
    const count = h("span", "recipe-count");
    const toggle = h("button", null, "Show all");
    toggle.type = "button";
    actions.appendChild(count);
    actions.appendChild(toggle);
    controls.appendChild(tabs);
    controls.appendChild(actions);
    const list = h("div", "recipe-list");

    function render() {
      filtered = recipes.filter(function (s) { return active === "All" || s.category === active; });
      root.classList.toggle("is-compact", compact);
      Array.prototype.slice.call(tabs.querySelectorAll("button")).forEach(function (btn) {
        btn.classList.toggle("on", btn.dataset.category === active);
      });
      count.textContent = filtered.length + " recipes";
      toggle.hidden = filtered.length <= limit;
      toggle.textContent = compact ? "Show all" : "Show fewer";
      list.innerHTML = "";
      filtered.forEach(function (s, idx) {
        const refs = refsFor(s);
        const card = h("article", "recipe-card" + (idx >= limit ? " is-extra" : ""));
        card.appendChild(h("div", "recipe-meta", "<span>" + esc(s.category) + "</span><b>" + readMinutes(s) + " min lesson</b>"));
        card.appendChild(h("h4", null, esc(s.title)));
        card.appendChild(h("p", "recipe-summary", esc(s.summary)));
        const links = h("div", "recipe-links");
        const lesson = h("a", null, "Open lesson");
        lesson.href = "#" + s.id;
        links.appendChild(lesson);
        const copy = h("button", null, "Copy snippet");
        copy.type = "button";
        copy.addEventListener("click", function () { copyText(s.canonical_code, copy, "Copy snippet"); });
        links.appendChild(copy);
        refs.slice(0, 1).forEach(function (r) {
          const a = h("a", null, esc(r.title) + '<span aria-hidden="true">↗</span>');
          a.href = r.url;
          a.target = "_blank";
          a.rel = "noopener noreferrer";
          links.appendChild(a);
        });
        card.appendChild(links);
        const details = h("details", "recipe-code");
        details.appendChild(h("summary", null, "View snippet"));
        const pre = h("pre"); pre.innerHTML = kt(s.canonical_code);
        details.appendChild(pre);
        card.appendChild(details);
        list.appendChild(card);
      });
    }

    categories.forEach(function (category) {
      const btn = h("button", category === active ? "on" : null, esc(category));
      btn.type = "button";
      btn.dataset.category = category;
      btn.addEventListener("click", function () {
        active = category;
        compact = true;
        render();
      });
      tabs.appendChild(btn);
    });
    toggle.addEventListener("click", function () {
      compact = !compact;
      render();
    });

    root.appendChild(controls);
    root.appendChild(list);
    render();
    return root;
  }

  function buildSourceAtlas(items) {
    const limit = 8;
    const categories = ["All"].concat(Array.from(new Set(SECTIONS.map(function (s) { return s.category; }))));
    let active = "All";
    let compact = true;
    let filtered = items.slice();
    const root = h("div", "source-atlas is-compact");
    root.appendChild(h("div", "source-head",
      '<div><span class="pg-label">Official source atlas</span><h3>Audit the Android docs behind the course.</h3></div>' +
      '<p>Every card shows the official source, how many lessons it supports, and the exact ComposeMaster sections that cite it.</p>'));
    const controls = h("div", "source-controls");
    const tabs = h("div", "source-tabs");
    const actions = h("div", "source-actions");
    const count = h("span", "source-count");
    const copy = h("button", null, "Copy source map");
    const toggle = h("button", null, "Show all");
    copy.type = "button";
    toggle.type = "button";
    actions.appendChild(count);
    actions.appendChild(copy);
    actions.appendChild(toggle);
    controls.appendChild(tabs);
    controls.appendChild(actions);
    const list = h("div", "source-list");

    function visibleItems() {
      return compact ? filtered.slice(0, limit) : filtered;
    }

    function mapText() {
      return visibleItems().map(function (item) {
        return item.title + " (" + item.url + ")\n  Lessons: " + item.sections.map(function (s) { return s.title; }).join(", ");
      }).join("\n\n");
    }

    function render() {
      filtered = items.filter(function (item) { return active === "All" || item.categories[active]; });
      root.classList.toggle("is-compact", compact);
      Array.prototype.slice.call(tabs.querySelectorAll("button")).forEach(function (btn) {
        btn.classList.toggle("on", btn.dataset.category === active);
      });
      count.textContent = filtered.length + " sources";
      toggle.hidden = filtered.length <= limit;
      toggle.textContent = compact ? "Show all" : "Show fewer";
      list.innerHTML = "";
      filtered.forEach(function (item, idx) {
        const card = h("article", "source-card" + (idx >= limit ? " is-extra" : ""));
        card.appendChild(h("div", "source-meta", "<span>Android Developers</span><b>" + item.sections.length + " lessons</b>"));
        card.appendChild(h("h4", null, esc(item.title)));
        const url = h("a", "source-url", esc(item.url));
        url.href = item.url;
        url.target = "_blank";
        url.rel = "noopener noreferrer";
        card.appendChild(url);
        const lessons = h("div", "source-lessons");
        item.sections.forEach(function (s) {
          const a = h("a", null, esc(s.title));
          a.href = "#" + s.id;
          lessons.appendChild(a);
        });
        card.appendChild(lessons);
        list.appendChild(card);
      });
    }

    categories.forEach(function (category) {
      const btn = h("button", category === active ? "on" : null, esc(category));
      btn.type = "button";
      btn.dataset.category = category;
      btn.addEventListener("click", function () {
        active = category;
        compact = true;
        render();
      });
      tabs.appendChild(btn);
    });
    toggle.addEventListener("click", function () {
      compact = !compact;
      render();
    });
    copy.addEventListener("click", function () {
      copyText(mapText(), copy, "Copy source map");
    });

    root.appendChild(controls);
    root.appendChild(list);
    render();
    return root;
  }

  function buildDiagnostic(items) {
    const saved = readJson(DIAGNOSTIC_KEY, {});
    let index = Math.min(Math.max(saved.index || 0, 0), Math.max(items.length - 1, 0));
    let answers = saved.answers && typeof saved.answers === "object" ? saved.answers : {};
    const root = h("div", "diagnostic");
    root.appendChild(h("div", "diagnostic-head",
      '<div><span class="pg-label">Mastery diagnostic</span><h3>Prove what you know, then get a study plan.</h3></div>' +
      '<p>Self-score one concept at a time. ComposeMaster turns misses into focused review links instead of vague progress.</p>'));
    const shell = h("div", "diagnostic-shell");
    const panel = h("div", "diagnostic-panel");
    const meta = h("div", "diagnostic-meta");
    const prompt = h("h4");
    const expected = h("p", "diagnostic-answer");
    const trap = h("p", "diagnostic-trap");
    const links = h("div", "diagnostic-links");
    const actions = h("div", "diagnostic-actions");
    const reveal = h("button", null, "Reveal rubric");
    const correct = h("button", null, "I know this");
    const miss = h("button", null, "Needs review");
    const prev = h("button", null, "Previous");
    const next = h("button", null, "Next");
    [reveal, correct, miss, prev, next].forEach(function (b) { b.type = "button"; });
    actions.appendChild(reveal);
    actions.appendChild(correct);
    actions.appendChild(miss);
    actions.appendChild(prev);
    actions.appendChild(next);
    panel.appendChild(meta);
    panel.appendChild(prompt);
    panel.appendChild(expected);
    panel.appendChild(trap);
    panel.appendChild(links);
    panel.appendChild(actions);

    const summary = h("div", "diagnostic-summary");
    const score = h("div", "diagnostic-score");
    const track = h("div", "diagnostic-track", "<span></span>");
    const breakdown = h("div", "diagnostic-breakdown");
    const weak = h("div", "diagnostic-weak");
    const summaryActions = h("div", "diagnostic-summary-actions");
    const copy = h("button", null, "Copy study plan");
    const reset = h("button", null, "Reset diagnostic");
    copy.type = "button";
    reset.type = "button";
    summaryActions.appendChild(copy);
    summaryActions.appendChild(reset);
    summary.appendChild(score);
    summary.appendChild(track);
    summary.appendChild(breakdown);
    summary.appendChild(weak);
    summary.appendChild(summaryActions);
    shell.appendChild(panel);
    shell.appendChild(summary);

    function save() {
      writeJson(DIAGNOSTIC_KEY, {
        index: index,
        answers: answers,
        updatedAt: new Date().toISOString(),
      });
    }

    function counts() {
      const known = items.filter(function (item) { return answers[item.id] === "known"; });
      const review = items.filter(function (item) { return answers[item.id] === "review"; });
      return { known: known, review: review, answered: known.length + review.length };
    }

    function studyPlanText() {
      const c = counts();
      const plan = c.review.length ? c.review : items.filter(function (item) { return !answers[item.id]; }).slice(0, 8);
      return plan.map(function (item) {
        const doc = item.doc ? " Source: " + item.doc.title + " - " + item.doc.url : "";
        return "- " + item.section + " (" + item.category + "): " + item.expected + doc;
      }).join("\n");
    }

    function renderSummary() {
      const c = counts();
      const pct = items.length ? Math.round((c.known.length / items.length) * 100) : 0;
      score.innerHTML = "<b>" + pct + "%</b><span>" + c.known.length + "/" + items.length + " known · " + c.review.length + " to review</span>";
      const fill = track.querySelector("span");
      if (fill) fill.style.width = pct + "%";
      const byCat = {};
      items.forEach(function (item) {
        if (!byCat[item.category]) byCat[item.category] = { total: 0, known: 0, review: 0 };
        byCat[item.category].total++;
        if (answers[item.id] === "known") byCat[item.category].known++;
        if (answers[item.id] === "review") byCat[item.category].review++;
      });
      breakdown.innerHTML = "";
      Object.keys(byCat).forEach(function (cat) {
        const data = byCat[cat];
        const chip = h("span", null, esc(cat) + " " + data.known + "/" + data.total);
        if (data.review > 0) chip.className = "needs-review";
        breakdown.appendChild(chip);
      });
      weak.innerHTML = "";
      const misses = c.review.length ? c.review : items.filter(function (item) { return !answers[item.id]; }).slice(0, 5);
      weak.appendChild(h("b", null, c.review.length ? "Review next" : "Unanswered next"));
      misses.slice(0, 6).forEach(function (item) {
        const a = h("a", null, esc(item.section));
        a.href = "#" + item.id;
        weak.appendChild(a);
      });
    }

    function renderQuestion() {
      const item = items[index];
      expected.hidden = true;
      trap.hidden = true;
      reveal.textContent = "Reveal rubric";
      meta.innerHTML = "<span>" + esc(item.category) + "</span><b>" + (index + 1) + "/" + items.length + "</b>";
      prompt.textContent = item.prompt;
      expected.innerHTML = "<b>Expected:</b> " + esc(item.expected + (item.evidence ? " " + item.evidence : ""));
      trap.innerHTML = "<b>Watch for:</b> " + esc(item.trap || "Use the lesson's common mistakes as your review guard.");
      links.innerHTML = "";
      const lesson = h("a", null, "Open lesson");
      lesson.href = "#" + item.id;
      links.appendChild(lesson);
      if (item.doc) {
        const doc = h("a", null, esc(item.doc.title) + '<span aria-hidden="true">↗</span>');
        doc.href = item.doc.url;
        doc.target = "_blank";
        doc.rel = "noopener noreferrer";
        links.appendChild(doc);
      }
      correct.classList.toggle("on", answers[item.id] === "known");
      miss.classList.toggle("on", answers[item.id] === "review");
      prev.disabled = index === 0;
      next.disabled = index === items.length - 1;
      renderSummary();
    }

    reveal.addEventListener("click", function () {
      const show = expected.hidden;
      expected.hidden = !show;
      trap.hidden = !show;
      reveal.textContent = show ? "Hide rubric" : "Reveal rubric";
    });
    correct.addEventListener("click", function () {
      answers[items[index].id] = "known";
      if (index < items.length - 1) index++;
      save();
      renderQuestion();
    });
    miss.addEventListener("click", function () {
      answers[items[index].id] = "review";
      if (index < items.length - 1) index++;
      save();
      renderQuestion();
    });
    prev.addEventListener("click", function () {
      if (index > 0) index--;
      save();
      renderQuestion();
    });
    next.addEventListener("click", function () {
      if (index < items.length - 1) index++;
      save();
      renderQuestion();
    });
    copy.addEventListener("click", function () { copyText(studyPlanText(), copy, "Copy study plan"); });
    reset.addEventListener("click", function () {
      answers = {};
      index = 0;
      save();
      renderQuestion();
    });

    root.appendChild(shell);
    renderQuestion();
    return root;
  }

  function buildNotebook() {
    let notes = readJson(NOTES_KEY, {});
    if (!notes || typeof notes !== "object" || Array.isArray(notes)) notes = {};
    let active = SECTIONS.find(function (s) { return notes[s.id]; }) || SECTIONS[0];
    const root = h("div", "notebook");
    root.appendChild(h("div", "notebook-head",
      '<div><span class="pg-label">Study notebook</span><h3>Turn lessons into your own Compose reference.</h3></div>' +
      '<p>Attach notes to sections, keep implementation decisions close to the source, and export your review log when you need it.</p>'));
    const shell = h("div", "notebook-shell");
    const editor = h("div", "notebook-editor");
    const controls = h("div", "notebook-controls");
    const select = h("select");
    SECTIONS.forEach(function (s) {
      const opt = h("option", null, s.title);
      opt.value = s.id;
      select.appendChild(opt);
    });
    const open = h("a", null, "Open lesson");
    const clear = h("button", null, "Clear note");
    clear.type = "button";
    controls.appendChild(select);
    controls.appendChild(open);
    controls.appendChild(clear);
    const area = h("textarea");
    area.rows = 8;
    area.placeholder = "Write the version you would explain in code review, the pitfall you hit, or the snippet you want to reuse.";
    const hint = h("p", "notebook-hint");
    editor.appendChild(controls);
    editor.appendChild(area);
    editor.appendChild(hint);

    const summary = h("div", "notebook-summary");
    const top = h("div", "notebook-summary-top");
    const count = h("span", "notebook-count");
    const copy = h("button", null, "Copy notebook");
    copy.type = "button";
    top.appendChild(count);
    top.appendChild(copy);
    const list = h("div", "notebook-list");
    summary.appendChild(top);
    summary.appendChild(list);
    shell.appendChild(editor);
    shell.appendChild(summary);

    function savedSections() {
      return SECTIONS.filter(function (s) { return notes[s.id] && notes[s.id].trim(); });
    }

    function notebookText() {
      const saved = savedSections();
      if (!saved.length) return "ComposeMaster notebook is empty.";
      return saved.map(function (s) {
        return "## " + s.title + " (" + s.category + ")\n" + notes[s.id].trim();
      }).join("\n\n");
    }

    function persist() {
      writeJson(NOTES_KEY, notes);
    }

    function renderList() {
      const saved = savedSections();
      count.textContent = saved.length + " saved note" + (saved.length === 1 ? "" : "s");
      list.innerHTML = "";
      if (!saved.length) {
        list.appendChild(h("p", "notebook-empty", "No notes yet. Pick a section and write the explanation you want future-you to remember."));
        return;
      }
      saved.forEach(function (s) {
        const card = h("article", "notebook-card");
        card.appendChild(h("b", null, esc(s.title)));
        card.appendChild(h("span", null, esc(s.category)));
        card.appendChild(h("p", null, esc(notes[s.id].trim().slice(0, 180)) + (notes[s.id].trim().length > 180 ? "..." : "")));
        const row = h("div", "notebook-card-actions");
        const edit = h("button", null, "Edit");
        edit.type = "button";
        edit.addEventListener("click", function () {
          active = s;
          renderEditor();
          area.focus();
        });
        const jump = h("a", null, "Open lesson");
        jump.href = "#" + s.id;
        row.appendChild(edit);
        row.appendChild(jump);
        card.appendChild(row);
        list.appendChild(card);
      });
    }

    function renderEditor() {
      select.value = active.id;
      open.href = "#" + active.id;
      area.value = notes[active.id] || "";
      hint.textContent = active.category + " · " + (notes[active.id] && notes[active.id].trim() ? "saved" : "no saved note");
      clear.disabled = !(notes[active.id] && notes[active.id].trim());
      renderList();
    }

    select.addEventListener("change", function () {
      active = SECTIONS.find(function (s) { return s.id === select.value; }) || SECTIONS[0];
      renderEditor();
    });
    area.addEventListener("input", function () {
      const value = area.value;
      if (value.trim()) notes[active.id] = value;
      else delete notes[active.id];
      persist();
      hint.textContent = active.category + " · " + (value.trim() ? "saved" : "no saved note");
      clear.disabled = !value.trim();
      renderList();
    });
    clear.addEventListener("click", function () {
      delete notes[active.id];
      persist();
      renderEditor();
      area.focus();
    });
    copy.addEventListener("click", function () {
      copyText(notebookText(), copy, "Copy notebook");
    });

    root.appendChild(shell);
    renderEditor();
    return root;
  }

  function renderDashboard() {
    const categories = Array.from(new Set(SECTIONS.map(function (s) { return s.category; })));
    const controlCount = SECTIONS.reduce(function (sum, s) { return sum + ((s.playground && s.playground.controls) ? s.playground.controls.length : 0); }, 0);
    const codeCount = SECTIONS.filter(function (s) { return !!s.canonical_code; }).length;
    const bugs = gotchaItems();
    const reviews = reviewItems(bugs);
    const sources = sourceAtlasItems();
    const diagnostics = diagnosticItems(bugs);
    const dash = h("section", "dashboard");

    const top = h("div", "dash-top");
    top.appendChild(h("div", "dash-copy",
      '<span class="kickline">Master the mental model, then the API</span>' +
      '<h2>Search, practice, and track every Compose concept from one page.</h2>' +
      '<p>Use the course like a reference when you are stuck, or like a deliberate practice system when you want the concepts to stick.</p>'));
    const progress = h("div", "progress-card",
      '<div class="progress-head"><span>Mastery progress</span><b id="progressText">0/' + SECTIONS.length + ' mastered</b></div>' +
      '<div class="progress-track"><span id="progressFill"></span></div>' +
      '<div class="progress-actions"><button id="resumeBtn" type="button">Resume</button><button id="resetProgress" type="button">Reset</button></div>');
    top.appendChild(progress);
    dash.appendChild(top);

    dash.appendChild(h("div", "searchbox",
      '<label for="courseSearch">Find anything in ComposeMaster</label>' +
      '<div class="search-row"><input id="courseSearch" type="search" placeholder="Search MaterialTheme, StateFlow, graphics..." autocomplete="off"><span id="searchCount">' + SECTIONS.length + ' sections</span></div>' +
      '<div id="searchResults" class="search-results" hidden></div>'));

    const stats = h("div", "stat-grid");
    [
      [SECTIONS.length, "deep sections"],
      [categories.length, "concept areas"],
      [controlCount, "live controls"],
      [codeCount, "canonical examples"],
      [bugs.length, "bug fixes indexed"],
      [DECISION_GUIDES.length, "decision routes"],
      [reviews.length, "review checks"],
      [sources.length, "official sources"],
      [diagnostics.length, "diagnostic prompts"]
    ].forEach(function (item) { stats.appendChild(h("div", "stat", "<b>" + item[0] + "</b><span>" + item[1] + "</span>")); });
    dash.appendChild(stats);

    const path = h("div", "course-path");
    path.appendChild(h("div", "pg-label", "Learning path"));
    COURSE_PATH.forEach(function (step, idx) {
      const card = h("div", "path-card");
      card.appendChild(h("span", "path-num", String(idx + 1).padStart(2, "0")));
      card.appendChild(h("h3", null, esc(step[0])));
      card.appendChild(h("p", null, esc(step[2])));
      const pills = h("div", "path-pills");
      step[1].forEach(function (id) {
        const sec = SECTIONS.find(function (s) { return s.id === id; });
        if (sec) {
          const a = h("a", null, esc(sec.title));
          a.href = "#" + sec.id;
          pills.appendChild(a);
        }
      });
      card.appendChild(pills);
      path.appendChild(card);
    });
    dash.appendChild(path);
    dash.appendChild(buildQuickReference());
    dash.appendChild(buildConceptMap());
    dash.appendChild(buildMasteryMatrix());
    dash.appendChild(buildDecisionGuide());
    dash.appendChild(buildBlueprintPlanner(reviews));
    dash.appendChild(buildCodeReviewLab());
    dash.appendChild(buildReviewBoard(reviews));
    dash.appendChild(buildRecipeLibrary());
    dash.appendChild(buildSourceAtlas(sources));
    dash.appendChild(buildDiagnostic(diagnostics));
    dash.appendChild(buildNotebook());
    const tools = h("div", "study-tools");
    tools.appendChild(buildPracticeDeck());
    tools.appendChild(buildBugClinic(bugs));
    tools.appendChild(buildGlossary());
    dash.appendChild(tools);
    dash.appendChild(h("p", "source-note", "Every section now includes an official Android Developers cross-check so the lesson stays tied to platform guidance."));
    return dash;
  }

  function buildDrills(s) {
    const drills = h("div", "drills");
    drills.appendChild(h("h4", null, "Mastery drills"));
    const gotcha = stripHtml(s.gotchas_html).split(". ").slice(0, 2).join(". ");
    const codeCue = s.canonical_code ? s.canonical_code.split("\n").slice(0, 6).join("\n") : "Use the generated Kotlin from the playground as the starting point.";
    [
      ["Explain", "Teach the core rule in one sentence without using the section title.", s.summary],
      ["Predict", "Name the failure mode a teammate would most likely hit here.", gotcha || "Use the common mistakes list as your check."],
      ["Build", "Write or modify a tiny composable that proves you understand it.", codeCue]
    ].forEach(function (item) {
      const d = h("details", "drill");
      d.appendChild(h("summary", null, "<b>" + esc(item[0]) + "</b><span>" + esc(item[1]) + "</span>"));
      if (item[0] === "Build") {
        const pre = h("pre"); pre.innerHTML = kt(item[2]); d.appendChild(pre);
      } else {
        d.appendChild(h("p", null, esc(item[2])));
      }
      drills.appendChild(d);
    });
    return drills;
  }

  function buildRefs(s) {
    const refs = refsFor(s);
    if (!refs.length) return null;
    const box = h("div", "refs");
    box.appendChild(h("h4", null, "Official cross-check"));
    const list = h("div", "ref-list");
    refs.forEach(function (r) {
      const a = h("a", null, esc(r.title) + '<span aria-hidden="true">↗</span>');
      a.href = r.url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      list.appendChild(a);
    });
    box.appendChild(list);
    return box;
  }

  function renderSection(s) {
    const sec = h("section", "section"); sec.id = s.id;
    const head = h("div", "section-head");
    head.appendChild(h("div", "emoji", esc(s.emoji || "▫️")));
    const ht = h("div", "section-title");
    ht.appendChild(h("h2", null, esc(s.title)));
    const meta = h("div", "section-meta");
    meta.appendChild(h("span", "cat-badge", esc(s.category)));
    meta.appendChild(h("span", "readtime", readMinutes(s) + " min read"));
    const master = h("button", "mastery-btn", "Mark mastered");
    master.type = "button";
    master.dataset.id = s.id;
    master.setAttribute("aria-pressed", "false");
    meta.appendChild(master);
    ht.appendChild(meta);
    head.appendChild(ht); sec.appendChild(head);
    sec.appendChild(h("p", "summary", esc(s.summary)));
    sec.appendChild(h("div", "explain", s.explanation_html || ""));
    if (s.key_points && s.key_points.length) {
      const kp = h("div", "keypoints", "<h4>Key points</h4>"); const ul = h("ul");
      s.key_points.forEach(function (p) { ul.appendChild(h("li", null, esc(p))); }); kp.appendChild(ul); sec.appendChild(kp);
    }
    if (s.playground) sec.appendChild(buildPlayground(s.playground));
    if (s.gotchas_html) sec.appendChild(h("div", "gotchas", "<h4>⚠️ Common mistakes</h4>" + s.gotchas_html));
    sec.appendChild(buildDrills(s));
    const refs = buildRefs(s);
    if (refs) sec.appendChild(refs);
    if (s.canonical_code) {
      const canon = h("div", "canon");
      const ch = h("div", "canon-head");
      ch.appendChild(h("div", "pg-label", "Canonical example"));
      const copy = h("button", "mini-copy", "Copy example");
      copy.type = "button";
      copy.addEventListener("click", function () {
        copyText(s.canonical_code, copy, "Copy example");
      });
      ch.appendChild(copy);
      canon.appendChild(ch);
      const pre = h("pre"); pre.innerHTML = kt(s.canonical_code); canon.appendChild(pre); sec.appendChild(canon);
    }
    return sec;
  }

  function setupSearch(nav, links) {
    const input = document.getElementById("courseSearch");
    const count = document.getElementById("searchCount");
    const results = document.getElementById("searchResults");
    if (!input || !count) return;
    function searchSegments(s) {
      const refs = refsFor(s);
      return [
        { label: "Title", weight: 8, text: s.title + " " + s.category },
        { label: "Summary", weight: 6, text: s.summary },
        { label: "Key points", weight: 5, text: (s.key_points || []).join(" ") },
        { label: "Explanation", weight: 4, text: stripHtml(s.explanation_html) },
        { label: "Common mistakes", weight: 5, text: stripHtml(s.gotchas_html) },
        { label: "Canonical code", weight: 4, text: s.canonical_code || "" },
        { label: "Official source", weight: 3, text: refs.map(function (r) { return r.title + " " + r.url; }).join(" ") },
      ].filter(function (part) { return part.text && part.text.trim(); });
    }
    function termList(q) {
      return q.toLowerCase().split(/\s+/).map(function (term) { return term.trim(); }).filter(Boolean);
    }
    function highlight(text, terms) {
      const clean = String(text || "");
      if (!terms.length) return esc(clean);
      const re = new RegExp("(" + terms.map(escapeRegExp).join("|") + ")", "ig");
      let out = "", last = 0, m;
      while ((m = re.exec(clean))) {
        out += esc(clean.slice(last, m.index)) + "<mark>" + esc(m[0]) + "</mark>";
        last = re.lastIndex;
      }
      return out + esc(clean.slice(last));
    }
    function snippet(text, terms) {
      const clean = String(text || "").replace(/\s+/g, " ").trim();
      if (!clean) return "";
      const lower = clean.toLowerCase();
      let idx = -1;
      terms.some(function (term) {
        idx = lower.indexOf(term);
        return idx >= 0;
      });
      if (idx < 0) idx = 0;
      const start = Math.max(0, idx - 80);
      const end = Math.min(clean.length, idx + 180);
      return (start > 0 ? "... " : "") + clean.slice(start, end) + (end < clean.length ? " ..." : "");
    }
    function rank(item, terms) {
      let score = 0;
      const labels = [];
      let best = null;
      item.segments.forEach(function (part) {
        const lower = part.text.toLowerCase();
        let hits = 0;
        terms.forEach(function (term) {
          let pos = lower.indexOf(term);
          while (pos >= 0) {
            hits++;
            pos = lower.indexOf(term, pos + term.length);
          }
        });
        if (hits) {
          const weighted = hits * part.weight;
          score += weighted;
          labels.push(part.label);
          if (!best || weighted > best.weighted) best = { segment: part, weighted: weighted };
        }
      });
      if (!score) return null;
      return {
        item: item,
        labels: labels,
        score: score,
        snippet: snippet(best.segment.text, terms),
        segment: best.segment.label,
      };
    }
    function resultText(hits) {
      return hits.map(function (hit, idx) {
        const s = hit.item.section;
        return (idx + 1) + ". " + s.title + " (" + s.category + ")\n" +
          "   Matches: " + hit.labels.slice(0, 4).join(", ") + "\n" +
          "   Lesson: #" + s.id;
      }).join("\n");
    }
    function renderResults(q) {
      if (!results) return;
      const terms = termList(q);
      results.innerHTML = "";
      results.hidden = !terms.length;
      if (!terms.length) return;
      const hits = indexed.map(function (item) { return rank(item, terms); })
        .filter(Boolean)
        .sort(function (a, b) {
          if (b.score !== a.score) return b.score - a.score;
          return a.item.section.title.localeCompare(b.item.section.title);
        })
        .slice(0, 8);
      const head = h("div", "search-results-head");
      head.appendChild(h("div", null, "<b>" + hits.length + " ranked result" + (hits.length === 1 ? "" : "s") + "</b><span>Matches include lesson text, gotchas, Kotlin snippets, and official sources.</span>"));
      const copy = h("button", null, "Copy result map");
      copy.type = "button";
      copy.disabled = !hits.length;
      copy.addEventListener("click", function () {
        copyText(hits.length ? resultText(hits) : "No ComposeMaster search results for: " + q, copy, "Copy result map");
      });
      head.appendChild(copy);
      results.appendChild(head);
      if (!hits.length) {
        results.appendChild(h("p", "search-empty", "No ranked matches yet. Try a Compose API name, symptom, mistake, or code term."));
        return;
      }
      const grid = h("div", "search-result-list");
      hits.forEach(function (hit) {
        const s = hit.item.section;
        const card = h("a", "search-result");
        card.href = "#" + s.id;
        card.appendChild(h("div", "search-result-meta", "<span>" + esc(s.category) + "</span><b>" + esc(hit.segment) + "</b>"));
        card.appendChild(h("h4", null, esc(s.title)));
        card.appendChild(h("p", null, highlight(hit.snippet, terms)));
        card.appendChild(h("em", null, esc(hit.labels.slice(0, 4).join(" · "))));
        grid.appendChild(card);
      });
      results.appendChild(grid);
    }
    const indexed = SECTIONS.map(function (s) {
      return {
        section: s,
        segments: searchSegments(s),
        text: sectionText(s).toLowerCase(),
        el: document.getElementById(s.id),
        link: links.find(function (l) { return l.dataset.id === s.id; })
      };
    });
    function apply() {
      const q = input.value.trim().toLowerCase();
      const terms = termList(q);
      const ranked = terms.length ? indexed.map(function (item) { return rank(item, terms); }).filter(Boolean) : [];
      const hitIds = {};
      ranked.forEach(function (hit) { hitIds[hit.item.section.id] = true; });
      let visible = 0;
      indexed.forEach(function (item) {
        const hit = !terms.length || !!hitIds[item.section.id];
        if (item.el) item.el.hidden = !hit;
        if (item.link) item.link.hidden = !hit;
        if (hit) visible++;
      });
      count.textContent = terms.length ? (visible + " matching section" + (visible === 1 ? "" : "s")) : (SECTIONS.length + " sections");
      document.documentElement.classList.toggle("is-searching", !!terms.length);
      renderResults(q);
    }
    input.addEventListener("input", apply);
  }

  function setupProgress(links) {
    let done = readProgress();
    const fill = document.getElementById("progressFill");
    const text = document.getElementById("progressText");
    const resume = document.getElementById("resumeBtn");
    const reset = document.getElementById("resetProgress");
    const buttons = Array.prototype.slice.call(document.querySelectorAll(".mastery-btn"));
    function update() {
      const pct = Math.round((done.size / SECTIONS.length) * 100);
      if (fill) fill.style.width = pct + "%";
      if (text) text.textContent = done.size + "/" + SECTIONS.length + " mastered";
      buttons.forEach(function (btn) {
        const on = done.has(btn.dataset.id);
        btn.classList.toggle("done", on);
        btn.textContent = on ? "Mastered" : "Mark mastered";
        btn.setAttribute("aria-pressed", on ? "true" : "false");
      });
      links.forEach(function (l) { l.classList.toggle("done", done.has(l.dataset.id)); });
    }
    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (done.has(btn.dataset.id)) done.delete(btn.dataset.id); else done.add(btn.dataset.id);
        writeProgress(done);
        update();
      });
    });
    if (resume) {
      resume.addEventListener("click", function () {
        const next = SECTIONS.find(function (s) { return !done.has(s.id); }) || SECTIONS[0];
        const el = document.getElementById(next.id);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
    if (reset) {
      reset.addEventListener("click", function () {
        done = new Set();
        writeProgress(done);
        update();
      });
    }
    update();
  }

  function init() {
    const app = document.getElementById("app");
    const nav = document.getElementById("nav");
    const main = document.getElementById("sections");
    // nav grouped by category (preserve first-seen order)
    const cats = []; const byCat = {};
    SECTIONS.forEach(function (s) { if (!byCat[s.category]) { byCat[s.category] = []; cats.push(s.category); } byCat[s.category].push(s); });
    cats.forEach(function (cat) {
      nav.appendChild(h("div", "nav-group", esc(cat)));
      const box = h("div", "nav");
      byCat[cat].forEach(function (s) {
        const a = h("a", null, '<span class="ne">' + esc(s.emoji || "▫️") + "</span><span>" + esc(s.title) + "</span>"); a.href = "#" + s.id; a.dataset.id = s.id;
        box.appendChild(a);
      });
      nav.appendChild(box);
    });
    if (app) app.classList.add("ready");
    main.appendChild(renderDashboard());
    SECTIONS.forEach(function (s) { main.appendChild(renderSection(s)); });

    // scroll spy
    const links = Array.prototype.slice.call(nav.querySelectorAll("a"));
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          links.forEach(function (l) { l.classList.toggle("active", l.dataset.id === en.target.id); });
        }
      });
    }, { rootMargin: "-10% 0px -75% 0px", threshold: 0 });
    SECTIONS.forEach(function (s) { const el = document.getElementById(s.id); if (el) io.observe(el); });
    setupSearch(nav, links);
    setupProgress(links);

    // theme toggle
    const tb = document.getElementById("theme");
    tb.addEventListener("click", function () {
      const dark = document.documentElement.getAttribute("data-theme") === "dark";
      document.documentElement.setAttribute("data-theme", dark ? "light" : "dark");
      tb.textContent = dark ? "🌙" : "☀️";
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
