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
    snapshotStateMode: ["MutableState", "SnapshotList", "MutationPolicy", "DerivedState", "SnapshotFlow", "StateHolder"],
    predictiveBackMode: ["SystemBack", "NavHost", "SharedElementNav3", "ManualProgress", "MaterialSurface"],
    richInputMode: ["DragSource", "DropTarget", "Clipboard", "RichContent", "Stylus", "DesktopInput"],
    advancedMotionMode: ["SingleValue", "Transition", "AnimatedContent", "Visibility", "AnimatableGesture", "TestClock"],
    adaptiveCanonicalMode: ["NavigationSuite", "ListDetail", "SupportingPane", "Feed", "AntiPattern", "TestMatrix"],
    advancedTextMode: ["AnnotatedString", "Links", "Selection", "Paragraph", "CanvasMeasure", "FontsEmoji"],
    activityResultMode: ["GetContent", "PhotoPicker", "OpenDocument", "Permission", "Notifications", "AntiPattern"],
    stateHolderMode: ["RouteBoundary", "HiltViewModel", "SavedState", "Factory", "LifecycleCollect", "AntiPattern"],
    compositionIdentityMode: ["CallSite", "KeyedLoop", "LazyIdentity", "MovableContent", "SaveableHolder", "Retain"],
    advancedLayoutMode: ["BoxWithConstraints", "MeasurePolicy", "Subcompose", "Lookahead", "AntiPattern"],
    compositionLocalPattern: ["TrackedTheme", "StaticTokens", "NestedOverride", "ExplicitParameter", "BadViewModelLocal"],
    customModifierStrategy: ["ChainedFactory", "ComposableFactory", "ModifierNode", "LocalAwareNode", "DelegatingNode"],
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
    stabilityScenario: ["ImmutableModel", "MutableModel", "StableAnnotation", "StrongSkipping", "PhaseRead"],
    perfMeasurement: ["Macrobenchmark", "BaselineProfile", "JankStats", "CompilerReports"],
    effectMode: ["LaunchedEffect", "EventScope", "DisposableEffect", "ProduceState", "SnapshotFlow", "DerivedStateOf", "SideEffect"],
    semanticsContract: ["MergedRow", "CustomActions", "LiveRegion", "TraversalGroup", "ErrorProgress"],
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
    availableWidth: [240, 960, 40, 560],
    cardElevation: [0, 12, 1, 2], nestDepth: [1, 4, 1, 2], startupMs: [100, 900, 25, 325], frameMs: [8, 40, 1, 22],
  };
  const TOGGLES = ["fillMaxWidth", "fillMaxHeight", "clip", "scroll", "orderSwap",
    "enabled", "withIcon", "checked", "singleLine", "showLabel", "topBar", "bottomBar", "fab", "showSubtitle", "showTrailing",
    "animateItems", "paging", "fullSpanHeader", "imageDescription", "imageClip", "imagePlaceholder", "imageTint",
    "surfaceVisible", "destructiveAction", "hasUndo", "richContent", "partialSheet",
    "showBadges", "wideWindow", "drawerOpen", "scrollBehavior", "secondaryTabs",
    "rememberSaveableState", "mutatePlainCollection", "structuralEquality", "derivedThreshold", "flowOperators", "stateHolderSaver",
    "rootBackIntercept", "popTransitions", "sharedBoundsContainer", "overlayClip", "cancelAwareBack", "materialBackState",
    "globalDrag", "rememberDropTarget", "externalDropPermission", "sensitiveClipboard", "richContentReceiver", "stylusCancel", "hoverFeedback", "rightClickMenu",
    "springSpec", "contentTargetParam", "visibilityTransitionOwned", "gestureSnapStop", "animationLabels", "testClockControl",
    "navSuiteScaffold", "saveableDestination", "paneParcelableKey", "supportingPaneNavigator", "avoidStretching", "adaptivePreviewMatrix",
    "linkAnnotation", "selectionContainer", "paragraphLineBreaks", "cacheTextMeasure", "fontFallbacks", "emojiCompat",
    "unconditionalLauncher", "launchFromEvent", "photoPickerContract", "persistUriPermission", "permissionRationale", "permissionGracefulDeny", "notificationApiGate",
    "lifecycleCollection", "hiltInjection", "savedStateHandle", "whileSubscribedFlow", "contentStateless", "repositoryInjected", "creationExtrasFactory",
    "stableIdentityKeys", "contentTypeHints", "rememberMovableContent", "saveableStateHolder", "retainAcrossConfig", "stateKeyedById",
    "componentLocalConstraints", "avoidItemSubcompose", "singleMeasurePass", "lookaheadApproach", "boundedBreakpoints", "intrinsicFallback",
    "expandedSearch", "multiSelect", "modalPicker", "rangePicker", "inputMode", "removableChip",
    "determinateProgress", "refreshing", "customIndicator", "supportingText", "withDividers", "carouselUncontained",
    "showGuidelines", "composeAlternative", "trackFirstOnly", "useDebounce", "overlayViewport",
    "baselineProfile", "physicalDevice", "includeStartupProfile", "jankState", "compilerReports",
    "strongSkippingEnabled", "immutableCollections", "stableAnnotation", "drawPhaseRead", "lazyStableKeys", "lambdaMemoization",
    "constantEffectKey", "wrapLatestCallback", "cleanupEffect", "distinctFlow",
    "mergeSemantics", "clearSemantics", "customA11yActions", "liveRegion", "traversalGroup", "accessibilityChecks",
    "nestedProvider", "staticLocal", "localBadDependency", "localPreviewDefault",
    "preserveChain", "dataClassElement", "readLocalInNode", "manualInvalidation",
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
    stateHolders: ["State holders and UI state", "https://developer.android.com/topic/architecture/ui-layer/stateholders"],
    lifecycleCompose: ["Lifecycle in Jetpack Compose", "https://developer.android.com/topic/libraries/architecture/lifecycle"],
    lifecycleCoroutines: ["Lifecycle-aware coroutines", "https://developer.android.com/topic/libraries/architecture/coroutines"],
    viewModelScoping: ["ViewModel scoping APIs", "https://developer.android.com/topic/libraries/architecture/viewmodel/viewmodel-apis"],
    viewModelFactories: ["Create ViewModels with dependencies", "https://developer.android.com/topic/libraries/architecture/viewmodel/viewmodel-factories"],
    savedStateViewModel: ["Saved State module for ViewModel", "https://developer.android.com/topic/libraries/architecture/viewmodel/viewmodel-savedstate"],
    hiltJetpack: ["Use Hilt with other Jetpack libraries", "https://developer.android.com/training/dependency-injection/hilt-jetpack"],
    hiltReleases: ["Hilt release notes", "https://developer.android.com/jetpack/androidx/releases/hilt"],
    snapshotMutationPolicy: ["SnapshotMutationPolicy API reference", "https://developer.android.com/reference/kotlin/androidx/compose/runtime/SnapshotMutationPolicy"],
    snapshotStateList: ["SnapshotStateList API reference", "https://developer.android.com/reference/kotlin/androidx/compose/runtime/snapshots/SnapshotStateList"],
    sideEffects: ["Side-effects in Compose", "https://developer.android.com/develop/ui/compose/side-effects"],
    phases: ["Jetpack Compose phases", "https://developer.android.com/develop/ui/compose/phases"],
    performance: ["Compose performance best practices", "https://developer.android.com/develop/ui/compose/performance/bestpractices"],
    modifiers: ["Compose modifiers", "https://developer.android.com/develop/ui/compose/modifiers"],
    customModifiers: ["Create custom modifiers", "https://developer.android.com/develop/ui/compose/custom-modifiers"],
    modifiersList: ["List of Compose modifiers", "https://developer.android.com/develop/ui/compose/modifiers-list"],
    composeApiGuidelines: ["Style guidelines for Jetpack Compose APIs", "https://developer.android.com/develop/ui/compose/api-guidelines"],
    constraints: ["Constraints and modifier order", "https://developer.android.com/develop/ui/compose/layouts/constraints-modifiers"],
    layouts: ["Compose layout basics", "https://developer.android.com/develop/ui/compose/layouts/basics"],
    customLayouts: ["Custom layouts", "https://developer.android.com/develop/ui/compose/layouts/custom"],
    advancedLayoutsQuickGuide: ["Advanced layouts in Compose", "https://developer.android.com/develop/ui/compose/quick-guides/content/video/advanced-layouts-compose"],
    lookaheadScopeApi: ["LookaheadScope API reference", "https://developer.android.com/reference/kotlin/androidx/compose/ui/layout/LookaheadScope"],
    approachLayoutNodeApi: ["ApproachLayoutModifierNode API reference", "https://developer.android.com/reference/kotlin/androidx/compose/ui/layout/ApproachLayoutModifierNode"],
    composePerformanceCodelab: ["Practical performance problem solving in Compose", "https://developer.android.com/codelabs/jetpack-compose-performance"],
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
    textOverview: ["Text in Compose", "https://developer.android.com/develop/ui/compose/text"],
    textStyle: ["Style text", "https://developer.android.com/develop/ui/compose/text/style-text"],
    textParagraph: ["Style paragraphs", "https://developer.android.com/develop/ui/compose/text/style-paragraph"],
    textLayout: ["Configure text layout", "https://developer.android.com/develop/ui/compose/text/configure-layout"],
    textInteractions: ["Text user interactions", "https://developer.android.com/develop/ui/compose/text/user-interactions"],
    textFonts: ["Work with fonts", "https://developer.android.com/develop/ui/compose/text/fonts"],
    textEmoji: ["Display emoji", "https://developer.android.com/develop/ui/compose/text/emoji"],
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
    dragAndDrop: ["Drag and drop", "https://developer.android.com/develop/ui/compose/touch-input/user-interactions/drag-and-drop"],
    copyPaste: ["Copy and paste", "https://developer.android.com/develop/ui/compose/touch-input/copy-and-paste"],
    stylusInput: ["About stylus input", "https://developer.android.com/develop/ui/compose/touch-input/stylus-input"],
    advancedStylus: ["Advanced stylus features", "https://developer.android.com/develop/ui/compose/touch-input/stylus-input/advanced-stylus-features"],
    largeScreenInput: ["Input compatibility on large screens", "https://developer.android.com/develop/ui/compose/touch-input/input-compatibility-on-large-screens"],
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
    stateLifespans: ["State lifespans in Compose", "https://developer.android.com/develop/ui/compose/state-lifespans"],
    lifecycle: ["Lifecycle of composables", "https://developer.android.com/develop/ui/compose/lifecycle"],
    keyApi: ["key API reference", "https://developer.android.com/reference/kotlin/androidx/compose/runtime/key.composable"],
    movableContentApi: ["movableContentOf API reference", "https://developer.android.com/reference/kotlin/androidx/compose/runtime/package-summary#movableContentOf(kotlin.Function0)"],
    saveableStateHolderApi: ["SaveableStateHolder API reference", "https://developer.android.com/reference/kotlin/androidx/compose/runtime/saveable/SaveableStateHolder"],
    retainPackageApi: ["androidx.compose.runtime.retain API reference", "https://developer.android.com/reference/kotlin/androidx/compose/runtime/retain/package-summary"],
    composeRuntimeReleases: ["Compose Runtime release notes", "https://developer.android.com/jetpack/androidx/releases/compose-runtime"],
    stability: ["Stability in Compose", "https://developer.android.com/develop/ui/compose/performance/stability"],
    stabilityFix: ["Fix stability issues", "https://developer.android.com/develop/ui/compose/performance/stability/fix"],
    strongSkipping: ["Strong skipping mode", "https://developer.android.com/develop/ui/compose/performance/stability/strongskipping"],
    stabilityDiagnose: ["Diagnose stability issues", "https://developer.android.com/develop/ui/compose/performance/stability/diagnose"],
    composeBaselineProfiles: ["Use a baseline profile in Compose", "https://developer.android.com/develop/ui/compose/performance/baseline-profiles"],
    macrobenchmark: ["Write a Macrobenchmark", "https://developer.android.com/topic/performance/benchmarking/macrobenchmark-overview"],
    baselineProfileCreate: ["Create Baseline Profiles", "https://developer.android.com/topic/performance/baselineprofiles/create-baselineprofile"],
    baselineProfileMeasure: ["Benchmark Baseline Profiles", "https://developer.android.com/topic/performance/baselineprofiles/measure-baselineprofile"],
    jankStats: ["JankStats Library", "https://developer.android.com/topic/performance/jankstats"],
    semantics: ["Semantics", "https://developer.android.com/develop/ui/compose/accessibility/semantics"],
    accessibilityTraversal: ["Modify accessibility traversal order", "https://developer.android.com/develop/ui/compose/accessibility/traversal"],
    accessibilityMergingClearing: ["Merging and clearing semantics", "https://developer.android.com/develop/ui/compose/accessibility/merging-clearing"],
    accessibilityInspectDebug: ["Inspect and debug accessibility", "https://developer.android.com/develop/ui/compose/accessibility/inspect-debug"],
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
    animationQuickGuide: ["Quick guide to animations", "https://developer.android.com/develop/ui/compose/animation/quick-guide"],
    animationComposablesModifiers: ["Animation modifiers and composables", "https://developer.android.com/develop/ui/compose/animation/composables-modifiers"],
    animationValueBased: ["Value-based animations", "https://developer.android.com/develop/ui/compose/animation/value-based"],
    animationCustomize: ["Customize animations", "https://developer.android.com/develop/ui/compose/animation/customize"],
    animationTesting: ["Test animations", "https://developer.android.com/develop/ui/compose/animation/testing"],
    animationTooling: ["Animation tooling support", "https://developer.android.com/develop/ui/compose/animation/tooling"],
    composeAnimationReleases: ["Compose Animation release notes", "https://developer.android.com/jetpack/androidx/releases/compose-animation"],
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
    predictiveBack: ["About predictive back", "https://developer.android.com/develop/ui/compose/system/predictive-back"],
    predictiveBackSetup: ["Set up predictive back", "https://developer.android.com/develop/ui/compose/system/predictive-back-setup"],
    predictiveBackProgress: ["Access predictive back progress manually", "https://developer.android.com/develop/ui/compose/system/predictive-back-progress"],
    sharedElements: ["Shared element transitions in Compose", "https://developer.android.com/develop/ui/compose/animation/shared-elements"],
    sharedElementsNavigation: ["Navigation with shared elements", "https://developer.android.com/develop/ui/compose/animation/shared-elements/navigation"],
    sharedElementsCustomize: ["Customize shared element transitions", "https://developer.android.com/develop/ui/compose/animation/shared-elements/customize"],
    adaptiveStart: ["Get started with adaptive apps", "https://developer.android.com/develop/ui/compose/layouts/adaptive/get-started-with-adaptive-apps"],
    adaptiveDosDonts: ["Adaptive do's and don'ts", "https://developer.android.com/develop/ui/compose/layouts/adaptive/adaptive-dos-and-donts"],
    adaptiveWindowSizeClasses: ["Use window size classes", "https://developer.android.com/develop/ui/compose/layouts/adaptive/use-window-size-classes"],
    adaptiveDisplay: ["Support different display sizes", "https://developer.android.com/develop/ui/compose/layouts/adaptive/support-different-display-sizes"],
    adaptiveQueryInfo: ["Query information for adaptive layouts", "https://developer.android.com/develop/ui/compose/layouts/adaptive/query-window-size-classes"],
    adaptiveCanonicalLayouts: ["Canonical layouts", "https://developer.android.com/develop/ui/compose/layouts/adaptive/canonical-layouts"],
    adaptiveListDetail: ["Build a list-detail layout", "https://developer.android.com/develop/ui/compose/layouts/adaptive/list-detail"],
    adaptiveSupportingPane: ["Build a supporting pane layout", "https://developer.android.com/develop/ui/compose/layouts/adaptive/build-a-supporting-pane-layout"],
    adaptiveNavigation: ["Build adaptive navigation", "https://developer.android.com/develop/ui/compose/layouts/adaptive/build-adaptive-navigation"],
    composeLibraries: ["Compose and other libraries", "https://developer.android.com/develop/ui/compose/libraries"],
    activityResults: ["Get a result from an activity", "https://developer.android.com/training/basics/intents/result"],
    rememberLauncherApi: ["rememberLauncherForActivityResult API", "https://developer.android.com/reference/kotlin/androidx/activity/compose/rememberLauncherForActivityResult.composable"],
    photoPicker: ["Photo picker", "https://developer.android.com/training/data-storage/shared/photo-picker"],
    runtimePermissions: ["Request runtime permissions", "https://developer.android.com/training/permissions/requesting"],
    notificationPermission: ["Notification runtime permission in Compose", "https://developer.android.com/develop/ui/compose/notifications/notification-permission"],
  };
  const SECTION_REFS = {
    composables: ["mentalModel", "state", "stateHoisting", "sideEffects"],
    "snapshot-state-runtime": ["state", "stateHoisting", "sideEffects", "snapshotMutationPolicy", "snapshotStateList"],
    "composition-identity-retention": ["lifecycle", "keyApi", "lists", "stateSaving", "stateLifespans", "movableContentApi", "saveableStateHolderApi", "retainPackageApi", "navigation3SaveState", "composeRuntimeReleases"],
    "state-hoisting-udf": ["state", "stateHoisting", "composeArchitecture", "viewModelOverview", "stateSaving"],
    "viewmodel-lifecycle-di": ["stateHolders", "viewModelOverview", "viewModelScoping", "lifecycleCompose", "lifecycleCoroutines", "savedStateViewModel", "viewModelFactories", "hiltJetpack", "hiltReleases"],
    "compositionlocal-scope": ["compositionLocal", "state", "stateHoisting", "composeArchitecture", "customDesignSystem"],
    modifiers: ["modifiers", "constraints"],
    "modifier-order": ["constraints", "modifiers"],
    "custom-modifiers": ["customModifiers", "modifiers", "modifiersList", "composeApiGuidelines", "performance"],
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
    "advanced-layout-adaptation": ["layouts", "constraints", "customLayouts", "advancedLayoutsQuickGuide", "intrinsicMeasurements", "phases", "composeUiLayoutApi", "lookaheadScopeApi", "approachLayoutNodeApi", "composeAnimationReleases", "composePerformanceCodelab"],
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
    text: ["textOverview", "textStyle", "textParagraph", "textLayout", "material3", "components"],
    "advanced-text-typography": ["textStyle", "textParagraph", "textLayout", "textInteractions", "textFonts", "textEmoji", "graphicsOverview", "accessibility"],
    buttons: ["buttons", "material3"],
    card: ["cards", "material3"],
    controls: ["switchCtl", "checkbox", "radio"],
    "selection-inputs": ["searchBar", "chips", "segmentedButton", "datePickers", "timePickers", "timePickerDialogs", "stateSaving", "accessibility"],
    "status-content": ["progressIndicators", "pullToRefresh", "carousel", "dividers", "materialLists", "lists", "stateHoisting", "accessibility"],
    textfields: ["textFields", "textFieldMigration", "autofill", "state"],
    "transient-surfaces": ["dialogs", "snackbars", "bottomSheets", "bottomSheetsPartial", "menus", "tooltips", "badges", "scaffold", "sideEffects"],
    "navigation-surfaces": ["appBars", "appBarNavigate", "appBarDynamic", "navigationBarComponent", "navigationRail", "navigationDrawer", "tabsComponent", "scaffold", "adaptiveStart", "adaptiveWindowSizeClasses"],
    "pointer-input-gestures": ["pointerInput", "gesturesUnderstand", "tapPress", "dragSwipeFling", "multiTouch", "nestedScroll", "scroll2d", "interactions"],
    "advanced-input-rich-content": ["dragAndDrop", "copyPaste", "stylusInput", "advancedStylus", "largeScreenInput", "pointerInput", "gesturesUnderstand", "interactions"],
    "focus-keyboard-input": ["focusOverview", "focusTraversal", "focusBehavior", "focusReact", "keyboardActions", "keyboardShortcuts", "textFields"],
    nesting: ["mentalModel", "phases"],
    scaffold: ["material3", "components"],
    "edge-to-edge-insets": ["edgeToEdge", "windowInsets", "windowInsetsUi", "keyboardImeAnimations", "materialInsets", "insetsInterop"],
    "activity-results-permissions": ["composeLibraries", "activityResults", "rememberLauncherApi", "photoPicker", "runtimePermissions", "notificationPermission", "stateHoisting"],
    "interop-migration": ["composeMigrationStrategy", "interopApis", "composeInViews", "viewsInCompose", "migrationOther", "recyclerMigration", "nestedScroll"],
    "navigation-compose": ["navigation", "navigationTypeSafety", "stateSaving"],
    "navigation3-state": ["navigation3Overview", "navigation3GetStarted", "navigation3Basics", "navigation3SaveState", "navigation3Metadata", "navigation3Scenes", "navigation3Migration", "navigation3Releases"],
    "predictive-back-shared-transitions": ["predictiveBack", "predictiveBackSetup", "predictiveBackProgress", "sharedElements", "sharedElementsNavigation", "sharedElementsCustomize", "navigation", "navigation3Overview"],
    "adaptive-layouts": ["adaptiveStart", "adaptiveDisplay", "adaptiveListDetail"],
    "adaptive-canonical-navigation": ["adaptiveDosDonts", "adaptiveWindowSizeClasses", "adaptiveDisplay", "adaptiveQueryInfo", "adaptiveCanonicalLayouts", "adaptiveListDetail", "adaptiveSupportingPane", "adaptiveNavigation", "previews"],
    "profile-row": ["layouts", "material3", "stateHoisting"],
    "state-saving": ["stateSaving", "state", "stateHoisting"],
    "effects-lifecycle": ["sideEffects", "lifecycle", "phases"],
    "stability-performance": ["stability", "stabilityFix", "strongSkipping", "performance", "phases"],
    "performance-measurement": ["macrobenchmark", "baselineProfileCreate", "baselineProfileMeasure", "composeBaselineProfiles", "jankStats", "stabilityDiagnose", "compositionTracing", "performance"],
    "previews-tooling": ["previews", "composeTooling", "animationPreview", "toolingDebug", "compositionTracing", "composeLint"],
    "accessibility-testing": ["accessibility", "semantics", "accessibilityTesting"],
    "advanced-semantics": ["semantics", "accessibilityTraversal", "accessibilityMergingClearing", "accessibilityInspectDebug", "accessibilityTesting", "composeTesting"],
    "compose-ui-testing": ["composeTesting", "testingApis", "testingSemantics", "testingSync", "testingPatterns", "testingDebug", "testingV2", "testingCheatsheet"],
    "animation-motion": ["animationIntro", "animationChoose", "animationQuickGuide", "animationComposablesModifiers"],
    "advanced-animation-motion": ["animationChoose", "animationValueBased", "animationComposablesModifiers", "animationCustomize", "animationTesting", "animationTooling", "composeTesting", "performance"],
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
    Text: ["textOverview", "textStyle", "textParagraph", "textLayout", "textInteractions", "textFonts", "textEmoji", "graphicsOverview"],
    Components: ["material3", "components", "pointerInput"],
    Composition: ["mentalModel", "lifecycle", "keyApi", "stateLifespans", "phases"],
    "App structure": ["material3", "components", "navigation", "navigation3Overview", "adaptiveStart", "interopApis"],
    Recipes: ["layouts", "stateHoisting"],
    State: ["state", "stateHoisting", "composeArchitecture", "viewModelOverview", "stateHolders", "lifecycleCompose", "stateSaving"],
    Runtime: ["sideEffects", "lifecycle", "phases"],
    Performance: ["stability", "performance", "phases"],
    Tooling: ["previews", "composeTooling", "toolingDebug", "composeLint"],
    Input: ["pointerInput", "interactions", "focusOverview", "keyboardActions"],
    "System UI": ["edgeToEdge", "windowInsets", "windowInsetsUi", "materialInsets", "composeLibraries", "activityResults", "runtimePermissions"],
    Quality: ["accessibility", "semantics", "accessibilityTesting", "composeTesting", "testingApis", "testingSync"],
    Motion: ["animationIntro", "animationChoose"],
  };
  const COURSE_PATH = [
    ["Mental model", ["composables", "snapshot-state-runtime", "composition-identity-retention", "state-hoisting-udf", "viewmodel-lifecycle-di", "compositionlocal-scope", "modifiers", "modifier-order", "custom-modifiers", "units"], "Learn the runtime contract before memorizing APIs."],
    ["Layout engine", ["sizing", "aspect-ratio", "padding", "spacing", "offset", "column", "row", "box", "custom-layouts", "advanced-layout-adaptation", "constraint-layout", "visibility-tracking"], "Predict size, position, and space from constraints."],
    ["Distribution", ["arrangement", "alignment", "weight", "background-shape", "drawing-graphics", "images-resources", "scroll", "lazy-lists", "lazy-collections-scale"], "Control empty space, overflow, clipping, drawing, and lists."],
    ["Production UI", ["theming-design-system", "text", "advanced-text-typography", "buttons", "card", "controls", "selection-inputs", "status-content", "textfields", "transient-surfaces", "navigation-surfaces", "pointer-input-gestures", "advanced-input-rich-content", "focus-keyboard-input", "nesting", "scaffold", "edge-to-edge-insets", "activity-results-permissions", "interop-migration", "navigation-compose", "navigation3-state", "predictive-back-shared-transitions", "adaptive-layouts", "adaptive-canonical-navigation", "profile-row"], "Compose themed Material 3 components into app-ready screens."],
    ["Advanced practice", ["state-saving", "effects-lifecycle", "stability-performance", "performance-measurement", "previews-tooling", "accessibility-testing", "advanced-semantics", "compose-ui-testing", "animation-motion", "advanced-animation-motion"], "Ship screens that survive lifecycle changes, test well, perform, and move clearly."],
  ];
  const GLOSSARY = [
    ["Composition", "The tree-building phase where composable functions emit the UI description.", "composables"],
    ["Composable", "A @Composable function that emits UI for its inputs instead of returning a View.", "composables"],
    ["Recomposition", "Re-running only the invalidated composable scopes after observed state changes.", "composables"],
    ["Snapshot state", "Observable state read by Compose so changes can invalidate the right scopes.", "snapshot-state-runtime"],
    ["remember", "Stores an object across recompositions while the call remains in the composition.", "snapshot-state-runtime"],
    ["MutableState", "A Compose-observable state holder whose value writes invalidate composable scopes that read it.", "snapshot-state-runtime"],
    ["mutableStateOf", "Creates MutableState and optionally accepts a SnapshotMutationPolicy to decide whether assignments are changes.", "snapshot-state-runtime"],
    ["SnapshotStateList", "An observable MutableList implementation produced by mutableStateListOf.", "snapshot-state-runtime"],
    ["mutableStateListOf", "Creates a snapshot-aware list whose adds, removes, and item changes can invalidate readers.", "snapshot-state-runtime"],
    ["SnapshotMutationPolicy", "The policy used by mutableStateOf to decide whether values are equivalent and how snapshot conflicts merge.", "snapshot-state-runtime"],
    ["structuralEqualityPolicy", "A stock SnapshotMutationPolicy that treats equal values as equivalent.", "snapshot-state-runtime"],
    ["referentialEqualityPolicy", "A stock SnapshotMutationPolicy that treats only the same instance as equivalent.", "snapshot-state-runtime"],
    ["neverEqualPolicy", "A stock SnapshotMutationPolicy that treats every assignment as a change.", "snapshot-state-runtime"],
    ["Call-site identity", "The source location plus local execution context Compose uses to match a composable instance across recompositions.", "composition-identity-retention"],
    ["key", "A composable grouping API that supplies extra identity values when the same call site emits reordered or repeated content.", "composition-identity-retention"],
    ["Stable item key", "A saveable, unique item identifier that lets lazy layouts move remembered state with the logical item instead of its position.", "composition-identity-retention"],
    ["movableContentOf", "A runtime API for moving a remembered composable subtree to a different place in the composition while preserving its internal state.", "composition-identity-retention"],
    ["rememberSaveableStateHolder", "Creates a SaveableStateHolder so dynamic destinations, tabs, or pages can keep saveable child state by key while temporarily removed.", "composition-identity-retention"],
    ["SaveableStateProvider", "A SaveableStateHolder scope that saves and restores rememberSaveable values for content identified by a caller-provided key.", "composition-identity-retention"],
    ["retain", "A Compose runtime-retain API that keeps non-serializable values across configuration changes but not process death.", "composition-identity-retention"],
    ["State hoisting", "Moving state to the caller and passing value down plus events up.", "state-hoisting-udf"],
    ["Unidirectional data flow", "A Compose architecture pattern where state flows down to UI and events flow back up to the owner.", "state-hoisting-udf"],
    ["State holder", "The composable, plain class, or ViewModel that owns UI state and exposes events to change it.", "state-hoisting-udf"],
    ["StateFlow", "A hot observable stream often exposed by a ViewModel and collected as Compose State at the route boundary.", "state-hoisting-udf"],
    ["collectAsStateWithLifecycle", "The Android lifecycle-aware way to convert Flow or StateFlow values into Compose State.", "state-hoisting-udf"],
    ["Route composable", "The screen-boundary composable that obtains app state holders, collects UI state, and passes plain values and events to content.", "viewmodel-lifecycle-di"],
    ["viewModel()", "The lifecycle-viewmodel-compose helper that retrieves a ViewModel scoped to the nearest ViewModelStoreOwner.", "viewmodel-lifecycle-di"],
    ["hiltViewModel()", "The Hilt Compose helper that retrieves a @HiltViewModel scoped to a navigation destination or supplied owner.", "viewmodel-lifecycle-di"],
    ["@HiltViewModel", "A Hilt annotation that lets Hilt generate the ViewModel factory and inject constructor dependencies.", "viewmodel-lifecycle-di"],
    ["SavedStateHandle", "A ViewModel key-value saved state handle for small restoration keys and UI element state across system process death.", "viewmodel-lifecycle-di"],
    ["CreationExtras", "A ViewModel factory input bundle that exposes owners, default args, application, and saved-state creation helpers.", "viewmodel-lifecycle-di"],
    ["stateIn", "A Flow operator that turns a cold upstream into a StateFlow in a scope with an initial value and sharing policy.", "viewmodel-lifecycle-di"],
    ["SharingStarted.WhileSubscribed", "A StateFlow sharing policy that keeps upstream work active while collectors exist and can delay stopping briefly.", "viewmodel-lifecycle-di"],
    ["ViewModelStoreOwner", "The owner that defines the lifetime and identity scope of a ViewModel instance.", "viewmodel-lifecycle-di"],
    ["CompositionLocalProvider", "The composable that binds a CompositionLocal value for a specific subtree.", "compositionlocal-scope"],
    ["compositionLocalOf", "A tracked CompositionLocal factory: changing the provided value invalidates only scopes that read current.", "compositionlocal-scope"],
    ["staticCompositionLocalOf", "An untracked CompositionLocal factory for values that rarely or never change; provider changes recompose the provider content.", "compositionlocal-scope"],
    ["LocalFoo.current", "The read of the nearest provided CompositionLocal value in the current composition scope.", "compositionlocal-scope"],
    ["Modifier", "An ordered immutable chain that sizes, draws, clips, positions, and handles input.", "modifiers"],
    ["Modifier factory", "An extension function on Modifier that exposes an idiomatic chainable API and appends a modifier element.", "custom-modifiers"],
    ["Modifier.Node", "The lower-level, reusable modifier implementation API used by Compose for high-performance custom behavior.", "custom-modifiers"],
    ["ModifierNodeElement", "A stateless element that creates and updates stateful Modifier.Node instances and must implement equality correctly.", "custom-modifiers"],
    ["DrawModifierNode", "A Modifier.Node type that draws inside the layout space.", "custom-modifiers"],
    ["LayoutModifierNode", "A Modifier.Node type that measures and places wrapped content.", "custom-modifiers"],
    ["CompositionLocalConsumerModifierNode", "A Modifier.Node type that reads CompositionLocal values at the modifier usage site.", "custom-modifiers"],
    ["DelegatingNode", "A Modifier.Node that delegates to other nodes so related behavior can share state.", "custom-modifiers"],
    ["composed", "An older custom modifier API that is no longer recommended for new custom modifier behavior because of performance costs.", "custom-modifiers"],
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
    ["BoxWithConstraints", "A layout that exposes incoming min/max constraints to composition so a component can choose content for its actual available space.", "advanced-layout-adaptation"],
    ["SubcomposeLayout", "A lower-level layout that composes slots during measurement when later content genuinely depends on earlier measured results.", "advanced-layout-adaptation"],
    ["LookaheadScope", "A layout scope that computes destination measurements and placements ahead of time so layout changes can be approached smoothly.", "advanced-layout-adaptation"],
    ["ApproachLayoutModifierNode", "A Modifier.Node layout API for interpolating measurement or placement toward a destination calculated by lookahead.", "advanced-layout-adaptation"],
    ["local constraints", "The actual constraints a component receives from its parent, pane, sheet, grid cell, or window, distinct from global window size.", "advanced-layout-adaptation"],
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
    ["Predictive back", "Android's gesture back model that lets users preview where a back swipe will take them.", "predictive-back-shared-transitions"],
    ["PredictiveBackHandler", "A Compose activity API for intercepting predictive back and collecting BackEventCompat gesture progress.", "predictive-back-shared-transitions"],
    ["BackEventCompat", "The predictive-back progress event containing progress plus touch coordinates for a gesture frame.", "predictive-back-shared-transitions"],
    ["popEnterTransition", "A NavHost transition used specifically when the back stack is popped, including predictive back gestures.", "predictive-back-shared-transitions"],
    ["popExitTransition", "A NavHost transition used for the exiting destination during a pop or predictive back gesture.", "predictive-back-shared-transitions"],
    ["SharedTransitionLayout", "The top-level layout that provides SharedTransitionScope for Compose shared element and shared bounds transitions.", "predictive-back-shared-transitions"],
    ["SharedTransitionScope", "The scope required by sharedElement and sharedBounds modifiers so matching content can animate through an overlay.", "predictive-back-shared-transitions"],
    ["sharedElement", "A modifier for matching the same visual content, such as a hero image, between two composable states.", "predictive-back-shared-transitions"],
    ["sharedBounds", "A modifier for matching container bounds when the entering and exiting content can look different.", "predictive-back-shared-transitions"],
    ["rememberSharedContentState", "The shared-transition state keyed to the logical element that should match across destinations or content states.", "predictive-back-shared-transitions"],
    ["LocalNavAnimatedContentScope", "A Navigation 3 CompositionLocal that exposes the AnimatedContentScope used by NavDisplay for shared transitions.", "predictive-back-shared-transitions"],
    ["Window size class", "A compact, medium, expanded, large, or extra-large classification of the app window used for layout decisions.", "adaptive-layouts"],
    ["Pane", "A content region in an adaptive layout; large windows can show multiple panes at once.", "adaptive-layouts"],
    ["List-detail", "An adaptive pattern that shows a list and selected detail together when space allows.", "adaptive-layouts"],
    ["NavigationSuiteScaffold", "A Material 3 adaptive scaffold that switches top-level navigation between bar, rail, and drawer-style presentations from adaptive info.", "adaptive-canonical-navigation"],
    ["NavigationSuiteType", "The selected navigation presentation type used by NavigationSuiteScaffold, either calculated from adaptive info or overridden for a product rule.", "adaptive-canonical-navigation"],
    ["NavigationSuiteScaffoldDefaults", "Defaults for deriving NavigationSuiteType and colors for adaptive navigation suite surfaces.", "adaptive-canonical-navigation"],
    ["ListDetailPaneScaffold", "A Material 3 adaptive canonical layout for a list pane, detail pane, and optional extra pane.", "adaptive-canonical-navigation"],
    ["SupportingPaneScaffold", "A Material 3 adaptive canonical layout that keeps primary content central while exposing related tools or context in a supporting pane.", "adaptive-canonical-navigation"],
    ["NavigableSupportingPaneScaffold", "A supporting-pane scaffold variant with built-in pane navigation and predictive-back-aware behavior.", "adaptive-canonical-navigation"],
    ["ThreePaneScaffoldNavigator", "Navigator state for moving among list/detail/supporting/extra panes while preserving pane destination state.", "adaptive-canonical-navigation"],
    ["WindowAdaptiveInfo", "The Material 3 adaptive info object that combines window size class and posture-related information for layout decisions.", "adaptive-canonical-navigation"],
    ["HingeInfo", "Foldable hinge information supplied by adaptive APIs for posture-aware layout decisions.", "adaptive-canonical-navigation"],
    ["Posture", "Device posture information such as tabletop or book-like modes that can affect navigation and pane layout.", "adaptive-canonical-navigation"],
    ["Insets", "System UI, display cutout, and keyboard space that content must avoid or handle.", "scaffold"],
    ["Edge-to-edge", "Drawing app content behind transparent system bars while protecting critical content and gestures with insets.", "edge-to-edge-insets"],
    ["WindowInsets", "The Compose API describing status bars, navigation bars, caption bars, cutouts, IME, gestures, and safe content regions.", "edge-to-edge-insets"],
    ["safeDrawing", "A WindowInsets group for content that must not be visually obscured by system UI.", "edge-to-edge-insets"],
    ["imePadding", "A modifier that pads content by the software keyboard inset and participates in animated inset consumption.", "edge-to-edge-insets"],
    ["imeNestedScroll", "A modifier for scrolling containers that lets IME movement coordinate with nested scroll when the keyboard opens or closes.", "edge-to-edge-insets"],
    ["consumeWindowInsets", "A modifier that marks inset space as consumed so descendants or siblings do not apply the same inset twice.", "edge-to-edge-insets"],
    ["rememberLauncherForActivityResult", "The Activity Compose API that remembers an ActivityResultLauncher and registers its callback for a composable call site.", "activity-results-permissions"],
    ["ManagedActivityResultLauncher", "The launcher returned by rememberLauncherForActivityResult; use launch from events and let Compose manage registration.", "activity-results-permissions"],
    ["ActivityResultContract", "A typed contract that defines the launch input and result output for a platform or custom activity result flow.", "activity-results-permissions"],
    ["ActivityResultContracts.GetContent", "A content-picking contract that returns one Uri for a requested MIME type.", "activity-results-permissions"],
    ["ActivityResultContracts.OpenDocument", "A document-picking contract for long-lived document access, often paired with persistable URI permissions.", "activity-results-permissions"],
    ["PickVisualMedia", "The Activity Result contract for Android's privacy-preserving photo picker.", "activity-results-permissions"],
    ["PickVisualMediaRequest", "The request object that selects image, video, or MIME-type filtering for the photo picker contract.", "activity-results-permissions"],
    ["RequestPermission", "The Activity Result contract for requesting one runtime permission and receiving a Boolean grant result.", "activity-results-permissions"],
    ["RequestMultiplePermissions", "The Activity Result contract for requesting several runtime permissions and receiving a map of grant results.", "activity-results-permissions"],
    ["shouldShowRequestPermissionRationale", "The platform signal used to decide whether a permission request needs an explanatory UI before launching the system prompt.", "activity-results-permissions"],
    ["takePersistableUriPermission", "A ContentResolver call that persists read or write access to a document Uri returned by OpenDocument.", "activity-results-permissions"],
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
    ["AnnotatedString", "A text value that can carry span styles, paragraph styles, annotations, and links inside one Text composable.", "advanced-text-typography"],
    ["SpanStyle", "Inline styling for a range of characters, such as color, font weight, font style, or decoration.", "advanced-text-typography"],
    ["ParagraphStyle", "Paragraph-level styling for alignment, indentation, line breaks, and related block text behavior.", "advanced-text-typography"],
    ["LinkAnnotation", "The modern annotation type for clickable parts of text, including URL links and custom click behavior.", "advanced-text-typography"],
    ["TextLinkStyles", "The style bundle used by LinkAnnotation to describe link appearance across normal, hovered, focused, or pressed states.", "advanced-text-typography"],
    ["SelectionContainer", "A foundation wrapper that makes descendant text selectable and copyable.", "advanced-text-typography"],
    ["DisableSelection", "A wrapper used inside SelectionContainer to opt a specific text subtree out of selection.", "advanced-text-typography"],
    ["LineBreak", "A paragraph text-layout setting that controls line-breaking strategy for readable multi-line text.", "advanced-text-typography"],
    ["Hyphens", "A paragraph text-layout setting that enables automatic hyphenation where platform support is available.", "advanced-text-typography"],
    ["LineHeightStyle", "Controls how line-height space is aligned and trimmed above or below text lines.", "advanced-text-typography"],
    ["TextMeasurer", "A Compose text measurement service used when drawing or positioning text manually outside Text.", "advanced-text-typography"],
    ["rememberTextMeasurer", "A composable helper that remembers TextMeasurer for draw and Canvas text measurement work.", "advanced-text-typography"],
    ["drawText", "A DrawScope API for rendering text layouts manually after measuring them with TextMeasurer.", "advanced-text-typography"],
    ["GoogleFont.Provider", "A downloadable-font provider definition used by Compose font APIs to load Google Fonts with certificates.", "advanced-text-typography"],
    ["FontVariation", "A font API for selecting variable font axes such as weight or width on supported Android versions.", "advanced-text-typography"],
    ["Emoji support", "Compose text support for modern emoji through platform and emoji compatibility behavior down to older API levels.", "advanced-text-typography"],
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
    ["dragAndDropSource", "A modifier that starts Compose drag operations and supplies DragAndDropTransferData.", "advanced-input-rich-content"],
    ["dragAndDropTarget", "A modifier that filters incoming drag events and routes accepted drops to a remembered DragAndDropTarget.", "advanced-input-rich-content"],
    ["DragAndDropTransferData", "The data package for a Compose drag source, including ClipData and optional drag flags.", "advanced-input-rich-content"],
    ["DragAndDropTarget", "The callback object for drag lifecycle events such as onStarted, onEntered, onExited, onDrop, and onEnded.", "advanced-input-rich-content"],
    ["ClipData", "Android clipboard and drag payload data, usually carrying text, HTML, intents, or content URIs.", "advanced-input-rich-content"],
    ["ClipEntry", "Compose's clipboard entry wrapper around platform ClipData.", "advanced-input-rich-content"],
    ["contentReceiver", "A modifier that lets a composable receive rich pasted, dragged, or IME-inserted content.", "advanced-input-rich-content"],
    ["TransferableContent", "The rich content object delivered to a content receiver, including media type helpers and remaining content.", "advanced-input-rich-content"],
    ["MediaType", "A Compose content-transfer classifier such as MediaType.Image used to decide which rich payloads to consume.", "advanced-input-rich-content"],
    ["pointerInteropFilter", "A low-level modifier that exposes Android MotionEvent data to Compose input code.", "advanced-input-rich-content"],
    ["MotionEvent", "The platform pointer event object that exposes stylus axes, tool type, hover distance, and cancellation flags.", "advanced-input-rich-content"],
    ["ACTION_CANCEL", "A MotionEvent action meaning the current gesture or stroke should be canceled rather than committed.", "advanced-input-rich-content"],
    ["FLAG_CANCELED", "A MotionEvent flag that can mark an up event as canceled, often used for palm rejection and unwanted input.", "advanced-input-rich-content"],
    ["AXIS_PRESSURE", "A MotionEvent axis for stylus pressure, commonly used to vary ink stroke width or opacity.", "advanced-input-rich-content"],
    ["hoverable", "A high-level Compose modifier for hover interactions backed by an InteractionSource.", "advanced-input-rich-content"],
    ["PointerEventType", "The Compose pointer event type used by awaitPointerEvent loops to distinguish press, release, move, enter, exit, scroll, and related events.", "advanced-input-rich-content"],
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
    ["rememberCoroutineScope", "Returns a CoroutineScope tied to the call site's composition lifecycle for event-triggered coroutines.", "effects-lifecycle"],
    ["SideEffect", "Publishes Compose state to non-Compose code after every successful composition.", "effects-lifecycle"],
    ["rememberUpdatedState", "Keeps the latest value visible to a long-running effect without restarting that effect.", "effects-lifecycle"],
    ["produceState", "Converts external or suspending sources into Compose State using a producer coroutine and keys.", "effects-lifecycle"],
    ["snapshotFlow", "Converts Compose state reads into a cold Flow that emits distinct values while collected.", "effects-lifecycle"],
    ["derivedStateOf", "Creates derived Compose State that updates only when the derived result changes, useful for high-frequency inputs crossing thresholds.", "effects-lifecycle"],
    ["Skippability", "Compose's ability to avoid re-running a composable whose stable inputs did not change.", "stability-performance"],
    ["Strong skipping", "Compose compiler mode, enabled by default in Kotlin 2.0.20, that makes restartable composables skippable even with unstable parameters.", "stability-performance"],
    ["Restartable", "A composable that can serve as a recomposition entry point when observed state changes.", "stability-performance"],
    ["@Immutable", "A contract annotation telling the Compose compiler a type's public values cannot change after construction.", "stability-performance"],
    ["@Stable", "A contract annotation telling the Compose compiler that mutations notify Compose and equality is safe to use for skipping.", "stability-performance"],
    ["Immutable collections", "Kotlinx persistent collection types that the Compose compiler can treat as immutable, unlike List, Set, and Map interfaces.", "stability-performance"],
    ["Macrobenchmark", "A Jetpack test library for measuring app startup, scrolling, animations, trace sections, and frame timing on a device.", "performance-measurement"],
    ["Baseline Profile", "A generated ART profile that precompiles critical startup and runtime paths for faster first-run performance.", "performance-measurement"],
    ["CompilationMode", "The Macrobenchmark setting that controls how much app code is compiled before measurement, including None, Partial, Full, and Ignore.", "performance-measurement"],
    ["StartupTimingMetric", "A Macrobenchmark metric for startup time, including time to initial display and time to full display workflows.", "performance-measurement"],
    ["FrameTimingMetric", "A Macrobenchmark metric for frame timing during runtime interactions such as scrolling and animations.", "performance-measurement"],
    ["JankStats", "A runtime metrics library that reports janky frames with app UI state context for each active Window.", "performance-measurement"],
    ["Compose compiler reports", "Release-build reports that show inferred stability, restartability, and skippability for composables and classes.", "performance-measurement"],
    ["@Preview", "An Android Studio annotation that renders a composable in the design surface without launching the full app.", "previews-tooling"],
    ["Multipreview", "A preview annotation strategy that renders one composable across common sizes, font scales, themes, or custom scenarios.", "previews-tooling"],
    ["PreviewParameterProvider", "A provider that feeds sample data variants into one preview function so Android Studio renders multiple states.", "previews-tooling"],
    ["Layout Inspector", "An Android Studio tool for inspecting a running Compose hierarchy, semantics, recomposition counts, and skipped compositions.", "previews-tooling"],
    ["Compose UI Check", "A Compose Preview mode that audits accessibility and adaptive issues across display sizes and orientations.", "previews-tooling"],
    ["Semantics tree", "The accessibility and testing representation of what UI elements mean and can do.", "accessibility-testing"],
    ["customActions", "Semantics actions that move secondary row actions, such as dismiss or bookmark, into the accessibility action menu.", "advanced-semantics"],
    ["CustomAccessibilityAction", "A labeled semantics action that returns true when the accessibility-triggered action is handled.", "advanced-semantics"],
    ["liveRegion", "A semantics property for announcing important changing content without requiring focus to move to it.", "advanced-semantics"],
    ["paneTitle", "A semantics property that identifies newly appeared panes or window-like surfaces such as bottom sheets.", "advanced-semantics"],
    ["traversalIndex", "A semantics ordering hint used with traversal groups when default TalkBack order does not match the intended reading path.", "advanced-semantics"],
    ["clearAndSetSemantics", "A modifier that removes descendant semantics and replaces them with a deliberate semantic contract.", "advanced-semantics"],
    ["progressBarRangeInfo", "A semantics property that communicates current progress, range, and step count to assistive technologies.", "advanced-semantics"],
    ["ComposeTestRule", "The JUnit rule that hosts Compose content, finds semantic nodes, performs actions, and synchronizes assertions.", "compose-ui-testing"],
    ["SemanticsMatcher", "A matcher that finds Compose test nodes by semantic properties such as text, role, state, or test tag.", "compose-ui-testing"],
    ["MainTestClock", "The virtual clock Compose UI tests use to advance recomposition, animations, and gestures deterministically.", "compose-ui-testing"],
    ["Test tag", "A semantic property for stable test lookup when visible text or content descriptions are not the right selector.", "compose-ui-testing"],
    ["AnimatedVisibility", "A composable for animating content entering and leaving the hierarchy.", "animation-motion"],
    ["AnimatedContent", "A composable that animates between target content states and keys content from its target-state lambda parameter.", "advanced-animation-motion"],
    ["ContentTransform", "The enter-plus-exit transition object used by AnimatedContent, usually built with togetherWith.", "advanced-animation-motion"],
    ["SizeTransform", "An AnimatedContent transform that controls how container size changes between initial and target content.", "advanced-animation-motion"],
    ["animateContentSize", "A modifier that animates layout size changes and should appear before the size modifiers whose changes it animates.", "advanced-animation-motion"],
    ["updateTransition", "A state-driven API that creates a Transition for coordinating multiple animated values from one target state.", "advanced-animation-motion"],
    ["Transition", "A coordinated animation state machine whose child animations update every frame as target state changes.", "advanced-animation-motion"],
    ["MutableTransitionState", "A transition state holder that can start an enter animation immediately when content enters composition.", "advanced-animation-motion"],
    ["AnimationSpec", "The timing or physics model for an animation, such as spring, tween, keyframes, repeatable, or snap.", "advanced-animation-motion"],
    ["spring", "A physics-based AnimationSpec that preserves velocity continuity when animation targets are interrupted.", "advanced-animation-motion"],
    ["tween", "A duration-based AnimationSpec with easing, useful for deliberate fixed-time motion.", "advanced-animation-motion"],
    ["keyframes", "An AnimationSpec for staged values at explicit times within a duration.", "advanced-animation-motion"],
    ["rememberInfiniteTransition", "A composable API for continuously repeating animations that remain active while in composition.", "advanced-animation-motion"],
    ["InfiniteTransition", "The transition object behind rememberInfiniteTransition for indefinitely repeating child animations.", "advanced-animation-motion"],
    ["Animatable", "A coroutine-controlled animation value for gesture, fling, decay, and imperative animation jobs.", "advanced-animation-motion"],
    ["snapTo", "An Animatable suspending call that immediately moves the value, useful while input directly controls the animation state.", "advanced-animation-motion"],
    ["animateDecay", "An Animatable suspending call that continues motion from a velocity using a decay spec, often for fling-like release.", "advanced-animation-motion"],
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
      question: "A local value, list, or derived threshold must trigger recomposition reliably.",
      use: "Use MutableState for scalar values, SnapshotStateList/Map for observable in-place collections, derivedStateOf for fewer output changes, and snapshotFlow when Compose state must enter Flow.",
      avoid: "Do not put a plain MutableList inside MutableState and mutate it in place; replace the value or use a snapshot-aware collection.",
      section: "snapshot-state-runtime",
    },
    {
      area: "Composition",
      question: "Internal state, effects, or saveable child state must stay attached while content reorders, moves, switches tabs, or survives configuration changes.",
      use: "Preserve logical identity with key, lazy item keys, contentType, remembered movableContentOf, SaveableStateHolder, or retain based on the lifespan you need.",
      avoid: "Do not key repeated content by index, allocate random keys, recreate movable content every recomposition, or expect remember to survive removal from composition.",
      section: "composition-identity-retention",
    },
    {
      area: "State",
      question: "Several composables need the same value, a ViewModel exposes StateFlow, or a component must be previewable.",
      use: "Choose one state owner, expose immutable state plus events, and collect Flow as Compose State at the route boundary.",
      avoid: "Do not pass ViewModels through reusable UI or keep duplicate local and screen-level sources of truth.",
      section: "state-hoisting-udf",
    },
    {
      area: "Architecture",
      question: "A screen needs a ViewModel, Hilt injection, lifecycle-aware Flow collection, SavedStateHandle, or a custom ViewModel factory.",
      use: "Keep ViewModel or hiltViewModel calls in the route/destination boundary, collect with collectAsStateWithLifecycle, expose immutable UI state, and save only minimal restoration keys.",
      avoid: "Do not construct repositories or ViewModels in reusable composables, manually collect Flow for UI data, or save loaded screen data in SavedStateHandle.",
      section: "viewmodel-lifecycle-di",
    },
    {
      area: "Architecture",
      question: "Many descendants need the same tree-scoped context such as theme tokens, locale-like configuration, or a design-system policy.",
      use: "Use CompositionLocal with a safe default and a narrow provider scope; choose compositionLocalOf for changing values and staticCompositionLocalOf for values that rarely change.",
      avoid: "Do not use CompositionLocal to hide ViewModels, repositories, navigation controllers, or ordinary screen UI state.",
      section: "compositionlocal-scope",
    },
    {
      area: "Layout",
      question: "Padding, background, clipping, or clickable area looks different than expected.",
      use: "Read the modifier chain in order; every modifier wraps the result of the modifiers before it.",
      avoid: "Do not reorder modifiers just for style without checking what size, draw, and input area changed.",
      section: "modifier-order",
    },
    {
      area: "API design",
      question: "A behavior is repeated across components or needs custom draw, layout, pointer, semantics, or CompositionLocal-aware modifier behavior.",
      use: "Start by chaining existing modifiers; use a composable modifier factory only when higher-level Compose APIs are needed; use Modifier.Node for reusable custom behavior.",
      avoid: "Do not break the chain, rely on composed for new behavior, or implement ModifierNodeElement without correct equality and update.",
      section: "custom-modifiers",
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
      question: "A reusable component must adapt to its own available width, compose dependent slots after measurement, or animate a large layout reflow.",
      use: "Use BoxWithConstraints for component-local breakpoints, custom Layout for one-pass measurement, SubcomposeLayout only when slot composition depends on measured results, and LookaheadScope for approach-style layout motion.",
      avoid: "Do not query global window size from leaf UI, place BoxWithConstraints/SubcomposeLayout in every lazy item without proof, or measure children repeatedly to discover sizes.",
      section: "advanced-layout-adaptation",
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
      area: "Text",
      question: "A surface needs inline styles, partial links, copyable text, readable paragraphs, manually drawn labels, downloadable fonts, or modern emoji.",
      use: "Use AnnotatedString for rich spans, LinkAnnotation for links, SelectionContainer for copyable text, LineBreak/Hyphens for paragraphs, TextMeasurer with drawWithCache for custom drawing, and font fallback plus emoji checks for resilient typography.",
      avoid: "Do not split one sentence into multiple Text nodes, make the whole Text clickable for one link, remeasure text every draw, ship a single-font family without fallback, or strip unsupported emoji.",
      section: "advanced-text-typography",
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
      area: "System UI",
      question: "A composable needs to pick content, open the photo picker, request a runtime permission, or receive a result from another app.",
      use: "Register rememberLauncherForActivityResult unconditionally, launch from a user or business event, prefer Photo Picker for media, persist OpenDocument access when needed, and model denied permissions as UI state.",
      avoid: "Do not call startActivityForResult, conditionally register launchers, launch from composition, request broad media permissions for selected photos, or crash/loop when a permission is denied.",
      section: "activity-results-permissions",
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
      area: "Motion",
      question: "Back navigation should preview the destination, coordinate with NavHost or NavDisplay, or visually connect shared content.",
      use: "Use supported back APIs, Navigation Compose pop transitions, SharedTransitionLayout with sharedElement/sharedBounds, and PredictiveBackHandler only for custom progress-driven surfaces.",
      avoid: "Do not intercept root back, omit pop transitions for custom navigation motion, or use sharedElement without the shared transition and animated visibility scopes.",
      section: "predictive-back-shared-transitions",
    },
    {
      area: "Adaptive",
      question: "The same feature must work on phones, tablets, foldables, desktop windows, and split screen.",
      use: "Base the top-level layout on the current app window size class, then pass simple pane/configuration state down.",
      avoid: "Do not branch from physical screen size or let leaf components query global window state independently.",
      section: "adaptive-layouts",
    },
    {
      area: "Adaptive",
      question: "A production app needs top-level adaptive navigation, list-detail, supporting panes, or large-window quality checks.",
      use: "Use NavigationSuiteScaffold for primary destinations, Material 3 canonical pane scaffolds for content, save pane destination state, and test compact through expanded windows plus posture changes.",
      avoid: "Do not hand-roll bar versus rail switching everywhere, stretch single-column content across expanded windows, lock orientation, or use deprecated Display metrics.",
      section: "adaptive-canonical-navigation",
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
      question: "A feature needs drag-and-drop, clipboard, rich paste, stylus data, hover, or right-click support.",
      use: "Use dragAndDropSource/dragAndDropTarget with ClipData and remembered targets, ClipboardManager plus ClipEntry for copy/paste, contentReceiver for rich payloads, MotionEvent only for stylus axes, and explicit hover/right-click affordances on large screens.",
      avoid: "Do not ignore drag permissions, copy sensitive values without marking the clip, commit canceled stylus strokes, or make context menus available only through touch long-press.",
      section: "advanced-input-rich-content",
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
      use: "Measure first, inspect compiler stability reports, account for strong skipping, keep models immutable, and defer state reads when the later phase can own the work.",
      avoid: "Do not add @Stable or @Immutable to silence reports unless the type really satisfies the stability contract.",
      section: "stability-performance",
    },
    {
      area: "Performance",
      question: "A Compose app needs proof that startup, scrolling, animation, or a critical user journey is actually fast.",
      use: "Measure release-like builds on a physical device with Macrobenchmark, compare Baseline Profile compilation modes, add JankStats state for runtime context, and use compiler reports only after evidence points to stability.",
      avoid: "Do not benchmark debug builds, rely on emulator timings, ship profiles that only cover app launch, or chase skippability without a measured performance problem.",
      section: "performance-measurement",
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
      area: "Quality",
      question: "A custom component has secondary actions, dynamic announcements, non-linear reading order, progress, errors, or replaced visual content.",
      use: "Write an explicit semantics contract with customActions, liveRegion, paneTitle, traversal groups, error/progress semantics, and merge or clear behavior only where it improves the user model.",
      avoid: "Do not clear semantics from interactive UI without replacing role, state, label, action, and test coverage.",
      section: "advanced-semantics",
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
    {
      area: "Motion",
      question: "Motion needs coordinated values, content transforms, gesture interruption, deterministic tests, or Animation Preview inspection.",
      use: "Use updateTransition for related values, AnimatedContent with its target-state parameter for content swaps, Animatable for coroutine-controlled gesture motion, labels for tooling, and ComposeTestRule.mainClock for tests.",
      avoid: "Do not read stale outer state inside AnimatedContent, start Animatable jobs from the composable body, hide exit work from AnimatedVisibility, or test animation timing with sleeps.",
      section: "advanced-animation-motion",
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
      stripHtml(s.gotchas_html), (s.gotchas_code && s.gotchas_code.code) || "", s.canonical_code
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
  function refsFor(s) { return uniqueRefs(refKeysFor(s).slice(0, 12)); }
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

  function pvAdvancedLayoutAdaptation(pg, v, stage) {
    const mode = v.advancedLayoutMode || "BoxWithConstraints";
    const width = Math.max(240, Math.min(960, Math.round(num(v.availableWidth, 560))));
    const compact = width < 420;
    const expanded = width >= 680;
    stage.classList.add("layadapt-stage");
    stage.style.display = "grid";
    stage.style.placeItems = "center";
    stage.style.padding = "16px";
    const shell = h("div", "layadapt-shell layadapt-" + mode.toLowerCase());
    const status = {
      BoxWithConstraints: v.componentLocalConstraints === "true" ? "local constraints" : "global size leak",
      MeasurePolicy: v.singleMeasurePass === "true" ? "single-pass measure" : "double measure",
      Subcompose: v.avoidItemSubcompose === "true" ? "bounded subcompose" : "per-item overhead",
      Lookahead: v.lookaheadApproach === "true" ? "approach motion" : "snap reflow",
      AntiPattern: "review traps",
    }[mode] || "layout";
    shell.appendChild(h("div", "layadapt-top", "<b>" + esc(mode) + "</b><span>" + esc(status) + "</span>"));
    const body = h("div", "layadapt-body");
    if (mode === "AntiPattern") {
      const traps = ["WindowSize in leaf", "BoxWithConstraints per item", "measure child twice", "snap reflow"];
      const grid = h("div", "layadapt-traps");
      traps.forEach(function (trap) { grid.appendChild(h("span", null, esc(trap))); });
      body.appendChild(grid);
    } else if (mode === "BoxWithConstraints") {
      const card = h("div", v.componentLocalConstraints === "true" ? "layadapt-card good" : "layadapt-card warn");
      card.appendChild(h("b", null, v.componentLocalConstraints === "true" ? "Component reads maxWidth" : "Leaf queries window"));
      card.appendChild(h("span", null, (compact ? "compact" : expanded ? "expanded" : "medium") + " at " + width + "dp"));
      const meter = h("div", "layadapt-meter");
      const fill = h("i");
      fill.style.width = Math.max(22, Math.min(100, Math.round((width - 200) / 8))) + "%";
      meter.appendChild(fill);
      card.appendChild(meter);
      body.appendChild(card);
    } else if (mode === "MeasurePolicy") {
      const flow = h("div", "layadapt-flow");
      [["constraints", v.boundedBreakpoints === "true" ? "bounded" : "raw"], ["measure", v.singleMeasurePass === "true" ? "once" : "twice"], ["place", v.intrinsicFallback === "true" ? "baseline aware" : "simple"]].forEach(function (item) {
        flow.appendChild(h("section", item[1] === "twice" ? "warn" : "good", "<i>" + esc(item[0]) + "</i><b>" + esc(item[1]) + "</b>"));
      });
      body.appendChild(flow);
    } else if (mode === "Subcompose") {
      const slots = h("div", "layadapt-slots");
      [["Header", "measure first"], ["Body", "depends on header"], ["Footer", "optional slot"]].forEach(function (slot, idx) {
        slots.appendChild(h("section", v.avoidItemSubcompose === "true" || idx === 0 ? "good" : "warn", "<b>" + esc(slot[0]) + "</b><span>" + esc(slot[1]) + "</span>"));
      });
      body.appendChild(slots);
    } else {
      const before = h("div", "layadapt-look before", "<b>compact</b><span>old placement</span>");
      const after = h("div", v.lookaheadApproach === "true" ? "layadapt-look after good" : "layadapt-look after warn", "<b>expanded</b><span>" + (v.lookaheadApproach === "true" ? "approach target" : "snap target") + "</span>");
      body.appendChild(before);
      body.appendChild(after);
    }
    shell.appendChild(body);
    const chips = h("div", "layadapt-chips");
    [
      width + "dp",
      v.componentLocalConstraints === "true" ? "component-local" : "window query",
      v.avoidItemSubcompose === "true" ? "bounded subcompose" : "per-item subcompose",
      v.singleMeasurePass === "true" ? "single measure" : "double measure",
      v.lookaheadApproach === "true" ? "lookahead" : "snap",
    ].forEach(function (chip) { chips.appendChild(h("span", null, esc(chip))); });
    shell.appendChild(chips);
    stage.appendChild(shell);
  }

  function genAdvancedLayoutAdaptation(pg, v) {
    const mode = v.advancedLayoutMode || "BoxWithConstraints";
    const width = Math.round(num(v.availableWidth, 560));
    if (mode === "BoxWithConstraints") {
      if (v.componentLocalConstraints !== "true") {
        return "import androidx.compose.material3.adaptive.currentWindowAdaptiveInfo\nimport androidx.compose.runtime.Composable\n\n@Composable\nfun MetricCard(metric: MetricUi) {\n  // BUG: a reusable card may live in a pane, grid cell, sheet, or split window.\n  val windowSize = currentWindowAdaptiveInfo().windowSizeClass\n  val wide = windowSize.isWidthAtLeastBreakpoint(840)\n\n  MetricCardContent(metric = metric, wide = wide)\n}\n\n// Prefer BoxWithConstraints or a parent-provided layout mode based on actual space.";
      }
      const breakpoints = v.boundedBreakpoints === "true"
        ? "    val columns = when {\n      maxWidth >= 720.dp -> 4\n      maxWidth >= 480.dp -> 2\n      else -> 1\n    }"
        : "    val columns = if (maxWidth > 0.dp) 4 else 1 // BUG: unbounded or meaningless breakpoint.";
      return "import androidx.compose.foundation.layout.BoxWithConstraints\nimport androidx.compose.foundation.layout.fillMaxWidth\nimport androidx.compose.runtime.Composable\nimport androidx.compose.ui.Modifier\nimport androidx.compose.ui.unit.dp\n\n@Composable\nfun MetricStrip(\n  metrics: List<MetricUi>,\n  modifier: Modifier = Modifier\n) {\n  BoxWithConstraints(modifier.fillMaxWidth()) {\n" + breakpoints + "\n\n    MetricGrid(\n      metrics = metrics,\n      columns = columns,\n      maxCardWidth = maxWidth / columns\n    )\n  }\n}\n\n// Preview this component at " + width + "dp, plus compact, medium, and expanded parent widths.";
    }
    if (mode === "MeasurePolicy") {
      if (v.singleMeasurePass !== "true") {
        return "import androidx.compose.runtime.Composable\nimport androidx.compose.ui.layout.Layout\n\n@Composable\nfun DoubleMeasureTrap(content: @Composable () -> Unit) {\n  Layout(content = content) { measurables, constraints ->\n    val first = measurables.first().measure(constraints)\n    val second = measurables.first().measure(constraints.copy(minWidth = 0))\n    // BUG: measuring the same Measurable twice in one pass can throw.\n    layout(maxOf(first.width, second.width), first.height + second.height) {\n      first.place(0, 0)\n      second.place(0, first.height)\n    }\n  }\n}";
      }
      const intrinsic = v.intrinsicFallback === "true" ? "\n// Add minIntrinsicWidth/minIntrinsicHeight overrides if a parent needs pre-measure answers." : "";
      return "import androidx.compose.runtime.Composable\nimport androidx.compose.ui.Modifier\nimport androidx.compose.ui.layout.Layout\n\n@Composable\nfun WrappingBadgeRow(\n  modifier: Modifier = Modifier,\n  content: @Composable () -> Unit\n) {\n  Layout(content = content, modifier = modifier) { measurables, constraints ->\n    val loose = constraints.copy(minWidth = 0, minHeight = 0)\n    val placeables = measurables.map { measurable -> measurable.measure(loose) }\n    val maxWidth = constraints.maxWidth\n    var x = 0\n    var y = 0\n    var lineHeight = 0\n    val positions = placeables.map { placeable ->\n      if (x > 0 && x + placeable.width > maxWidth) {\n        x = 0\n        y += lineHeight\n        lineHeight = 0\n      }\n      val position = x to y\n      x += placeable.width\n      lineHeight = maxOf(lineHeight, placeable.height)\n      position\n    }\n    val height = (y + lineHeight).coerceIn(constraints.minHeight, constraints.maxHeight)\n\n    layout(width = maxWidth, height = height) {\n      placeables.forEachIndexed { index, placeable ->\n        val (px, py) = positions[index]\n        placeable.placeRelative(px, py)\n      }\n    }\n  }\n}" + intrinsic;
    }
    if (mode === "Subcompose") {
      if (v.avoidItemSubcompose !== "true") {
        return "import androidx.compose.foundation.layout.BoxWithConstraints\nimport androidx.compose.foundation.lazy.LazyColumn\nimport androidx.compose.foundation.lazy.items\nimport androidx.compose.runtime.Composable\nimport androidx.compose.ui.unit.dp\n\n@Composable\nfun FeedWithPerItemSubcompose(cards: List<CardUi>) {\n  LazyColumn {\n    items(cards, key = { it.id }) { card ->\n      // BUG: BoxWithConstraints is subcomposition; avoid putting it in every item unless measured proof says it is needed.\n      BoxWithConstraints {\n        FeedCard(card, wide = maxWidth > 420.dp)\n      }\n    }\n  }\n}";
      }
      return "import androidx.compose.runtime.Composable\nimport androidx.compose.ui.Modifier\nimport androidx.compose.ui.layout.SubcomposeLayout\n\nprivate enum class ProfileSlot { Header, Body }\n\n@Composable\nfun CollapsingProfileLayout(\n  header: @Composable () -> Unit,\n  body: @Composable (availableHeight: Int) -> Unit,\n  modifier: Modifier = Modifier\n) {\n  SubcomposeLayout(modifier) { constraints ->\n    val headerPlaceables = subcompose(ProfileSlot.Header, header)\n      .map { measurable -> measurable.measure(constraints.copy(minHeight = 0)) }\n    val headerHeight = headerPlaceables.maxOfOrNull { it.height } ?: 0\n    val bodyConstraints = constraints.copy(\n      minHeight = 0,\n      maxHeight = (constraints.maxHeight - headerHeight).coerceAtLeast(0)\n    )\n    val bodyPlaceables = subcompose(ProfileSlot.Body) { body(bodyConstraints.maxHeight) }\n      .map { measurable -> measurable.measure(bodyConstraints) }\n\n    layout(constraints.maxWidth, headerHeight + bodyPlaceables.sumOf { it.height }) {\n      var y = 0\n      headerPlaceables.forEach { it.placeRelative(0, y) }\n      y += headerHeight\n      bodyPlaceables.forEach { placeable ->\n        placeable.placeRelative(0, y)\n        y += placeable.height\n      }\n    }\n  }\n}\n\n// Use subcomposition when later slots truly depend on earlier measured results.";
    }
    if (mode === "Lookahead") {
      if (v.lookaheadApproach !== "true") {
        return "import androidx.compose.foundation.layout.Column\nimport androidx.compose.foundation.layout.Row\nimport androidx.compose.runtime.Composable\n\n@Composable\nfun ReflowingActions(expanded: Boolean, actions: List<ActionUi>) {\n  // BUG: large layout changes snap between placements with no destination-aware approach.\n  if (expanded) {\n    Row { actions.forEach { ActionChip(it) } }\n  } else {\n    Column { actions.forEach { ActionChip(it) } }\n  }\n}";
      }
      return "import androidx.compose.animation.animateBounds\nimport androidx.compose.foundation.layout.Column\nimport androidx.compose.foundation.layout.Row\nimport androidx.compose.runtime.Composable\nimport androidx.compose.ui.Modifier\nimport androidx.compose.ui.layout.LookaheadScope\n\n@Composable\nfun ReflowingActions(\n  expanded: Boolean,\n  actions: List<ActionUi>,\n  modifier: Modifier = Modifier\n) {\n  LookaheadScope {\n    val animated = Modifier.animateBounds(lookaheadScope = this)\n\n    if (expanded) {\n      Row(modifier) {\n        actions.forEach { action -> ActionChip(action, modifier = animated) }\n      }\n    } else {\n      Column(modifier) {\n        actions.forEach { action -> ActionChip(action, modifier = animated) }\n      }\n    }\n  }\n}\n\n// Lookahead calculates the destination layout; animateBounds approaches size and position changes.";
    }
    return "import androidx.compose.foundation.layout.BoxWithConstraints\nimport androidx.compose.foundation.lazy.LazyColumn\nimport androidx.compose.foundation.lazy.items\nimport androidx.compose.material3.adaptive.currentWindowAdaptiveInfo\nimport androidx.compose.runtime.Composable\n\n@Composable\nfun LayoutAntiPatterns(cards: List<CardUi>) {\n  val window = currentWindowAdaptiveInfo().windowSizeClass\n\n  LazyColumn {\n    items(cards) { card ->\n      BoxWithConstraints {\n        // BUG: global window policy plus per-item subcomposition plus no stable key.\n        FeedCard(card, wide = window.isWidthAtLeastBreakpoint(840) || maxWidth > 420.dp)\n      }\n    }\n  }\n}\n\n@Composable\nfun MeasuringTrap(content: @Composable () -> Unit) {\n  Layout(content = content) { measurables, constraints ->\n    val a = measurables.first().measure(constraints)\n    val b = measurables.first().measure(constraints.copy(minWidth = 0)) // BUG\n    layout(a.width, a.height + b.height) { a.place(0, 0); b.place(0, a.height) }\n  }\n}";
  }

  function pvCompositionIdentity(pg, v, stage) {
    const mode = v.compositionIdentityMode || "CallSite";
    const stable = v.stableIdentityKeys === "true";
    const holder = v.saveableStateHolder === "true";
    const movable = v.rememberMovableContent === "true";
    const retained = v.retainAcrossConfig === "true";
    const good = mode === "MovableContent" ? movable : mode === "SaveableHolder" ? holder : mode === "Retain" ? retained : mode === "CallSite" ? v.stateKeyedById === "true" : stable;
    stage.classList.add("identity-stage");
    stage.style.display = "grid";
    stage.style.placeItems = "center";
    stage.style.padding = "16px";
    const shell = h("div", "identity-shell" + (good ? " is-good" : " is-warn"));
    const status = good ? "logical identity" : "positional state";
    shell.appendChild(h("div", "identity-top", "<b>" + esc(mode) + "</b><span>" + esc(status) + "</span>"));
    const body = h("div", "identity-body");

    if (mode === "CallSite") {
      const flow = h("div", "identity-flow");
      [["call site", "ProfileCard()"], ["slot", v.stateKeyedById === "true" ? "key(user.id)" : "execution order"], ["state", v.stateKeyedById === "true" ? "moves with Ada" : "stays at position"]].forEach(function (item, idx) {
        flow.appendChild(h("section", idx === 2 && v.stateKeyedById !== "true" ? "warn" : "good", "<span>" + esc(item[0]) + "</span><b>" + esc(item[1]) + "</b>"));
      });
      body.appendChild(flow);
    } else if (mode === "KeyedLoop" || mode === "LazyIdentity") {
      const list = h("div", "identity-list");
      const rows = v.orderSwap === "true" ? [["c3", "Chen"], ["a1", "Ada"], ["b2", "Bo"]] : [["a1", "Ada"], ["b2", "Bo"], ["c3", "Chen"]];
      rows.forEach(function (row, idx) {
        const label = stable ? row[0] : String(idx);
        list.appendChild(h("div", stable ? "identity-row good" : "identity-row warn", "<i>" + esc(label) + "</i><b>" + esc(row[1]) + "</b><span>" + esc(stable ? "remember follows id" : "remember follows index") + "</span>"));
      });
      if (mode === "LazyIdentity") {
        const chips = h("div", "identity-mini");
        chips.appendChild(h("span", stable ? "good" : "warn", stable ? "key = id" : "key = index"));
        chips.appendChild(h("span", v.contentTypeHints === "true" ? "good" : "warn", v.contentTypeHints === "true" ? "contentType" : "mixed reuse"));
        list.appendChild(chips);
      }
      body.appendChild(list);
    } else if (mode === "MovableContent") {
      const move = h("div", "identity-move");
      const panel = h("div", movable ? "identity-panel good" : "identity-panel warn", "<b>SearchField</b><span>" + esc(movable ? "same subtree moves" : "new subtree each branch") + "</span>");
      move.appendChild(h("section", "slot", "<span>compact</span>"));
      move.appendChild(panel);
      move.appendChild(h("section", "slot", "<span>expanded</span>"));
      body.appendChild(move);
    } else if (mode === "SaveableHolder") {
      const tabs = h("div", "identity-tabs");
      [["inbox", "Inbox", "draft=reply"], ["sent", "Sent", "scroll=42"], ["drafts", "Drafts", holder ? "restored" : "forgotten"]].forEach(function (tab) {
        tabs.appendChild(h("section", holder ? "good" : "warn", "<b>" + esc(tab[1]) + "</b><span>" + esc(tab[0]) + "</span><em>" + esc(tab[2]) + "</em>"));
      });
      body.appendChild(tabs);
    } else {
      const lanes = h("div", "identity-retain");
      [["remember", "recomposition only", "warn"], ["retain", retained ? "config change" : "not installed", retained ? "good" : "warn"], ["rememberSaveable", "process saveable", "good"], ["ViewModel", "screen logic", "good"]].forEach(function (lane) {
        lanes.appendChild(h("section", lane[2], "<span>" + esc(lane[0]) + "</span><b>" + esc(lane[1]) + "</b>"));
      });
      body.appendChild(lanes);
    }

    shell.appendChild(body);
    const chips = h("div", "identity-chips");
    [
      stable ? "stable keys" : "positional keys",
      v.contentTypeHints === "true" ? "contentType hints" : "no contentType",
      movable ? "remember movable" : "inline movable",
      holder ? "SaveableStateHolder" : "no holder",
      retained ? "retain" : "remember only",
    ].forEach(function (chip) { chips.appendChild(h("span", null, esc(chip))); });
    shell.appendChild(chips);
    stage.appendChild(shell);
  }

  function genCompositionIdentity(pg, v) {
    const mode = v.compositionIdentityMode || "CallSite";
    const stable = v.stableIdentityKeys === "true";
    if (mode === "CallSite") {
      if (v.stateKeyedById !== "true") {
        return "import androidx.compose.runtime.Composable\nimport androidx.compose.runtime.getValue\nimport androidx.compose.runtime.mutableStateOf\nimport androidx.compose.runtime.remember\nimport androidx.compose.runtime.setValue\n\n@Composable\nfun ProfilePane(selected: UserUi) {\n  // BUG: when different users reuse the same call site, remembered state belongs to the slot.\n  var expanded by remember { mutableStateOf(false) }\n  ProfileCard(user = selected, expanded = expanded, onExpandedChange = { expanded = it })\n}\n\n// If the remembered state is supposed to belong to each user, key it by selected.id or hoist it.";
      }
      return "import androidx.compose.runtime.Composable\nimport androidx.compose.runtime.key\n\n@Composable\nfun ProfilePane(selected: UserUi) {\n  key(selected.id) {\n    StatefulProfileCard(user = selected)\n  }\n}\n\n@Composable\nfun UserSwitcher(users: List<UserUi>) {\n  users.forEach { user ->\n    key(user.id) {\n      StatefulUserChip(user = user)\n    }\n  }\n}\n\n// key values only need to be unique among invocations at this call site.";
    }
    if (mode === "KeyedLoop") {
      if (!stable) {
        return "import androidx.compose.runtime.Composable\nimport androidx.compose.runtime.mutableStateOf\nimport androidx.compose.runtime.remember\n\n@Composable\nfun ReorderablePeople(people: List<PersonUi>) {\n  people.forEachIndexed { index, person ->\n    // BUG: state and effects are associated with the loop position, not the person.\n    val selected = remember { mutableStateOf(false) }\n    PersonRow(person = person, selected = selected.value, onSelected = { selected.value = it })\n  }\n}\n\n// Inserting at the top can move remembered state to the wrong row.";
      }
      return "import androidx.compose.runtime.Composable\nimport androidx.compose.runtime.key\nimport androidx.compose.runtime.mutableStateOf\nimport androidx.compose.runtime.remember\n\n@Composable\nfun ReorderablePeople(people: List<PersonUi>) {\n  people.forEach { person ->\n    key(person.id) {\n      val selected = remember { mutableStateOf(false) }\n      PersonRow(person = person, selected = selected.value, onSelected = { selected.value = it })\n    }\n  }\n}\n\n// Reorder, insert, and remove operations preserve the row's logical identity.";
    }
    if (mode === "LazyIdentity") {
      if (!stable) {
        return "import androidx.compose.foundation.lazy.LazyColumn\nimport androidx.compose.foundation.lazy.itemsIndexed\nimport androidx.compose.runtime.Composable\n\n@Composable\nfun MessageList(messages: List<MessageUi>) {\n  LazyColumn {\n    itemsIndexed(messages, key = { index, _ -> index }) { _, message ->\n      MessageRow(message)\n    }\n  }\n}\n\n// BUG: index keys are positional; remembered state, animations, and effects can move to the wrong message.";
      }
      const contentType = v.contentTypeHints === "true" ? ",\n      contentType = { message -> if (message.isAd) \"ad\" else \"message\" }" : "";
      return "import androidx.compose.foundation.lazy.LazyColumn\nimport androidx.compose.foundation.lazy.items\nimport androidx.compose.runtime.Composable\n\n@Composable\nfun MessageList(messages: List<MessageUi>) {\n  LazyColumn {\n    items(\n      items = messages,\n      key = { message -> message.id }" + contentType + "\n    ) { message ->\n      MessageRow(message)\n    }\n  }\n}\n\n// Use Bundle-compatible stable keys when item state must survive Activity recreation.";
    }
    if (mode === "MovableContent") {
      if (v.rememberMovableContent !== "true") {
        return "import androidx.compose.foundation.layout.Column\nimport androidx.compose.foundation.layout.Row\nimport androidx.compose.runtime.Composable\nimport androidx.compose.runtime.movableContentOf\n\n@Composable\nfun ResponsiveProfile(expanded: Boolean, user: UserUi) {\n  // BUG: this creates a new movable content instance during each recomposition.\n  val actions = movableContentOf<UserUi> { current -> ProfileActions(current) }\n\n  if (expanded) Row { ProfileSummary(user); actions(user) }\n  else Column { ProfileSummary(user); actions(user) }\n}\n\n// Wrap movableContentOf in remember so the movable subtree has stable identity.";
      }
      return "import androidx.compose.foundation.layout.Column\nimport androidx.compose.foundation.layout.Row\nimport androidx.compose.runtime.Composable\nimport androidx.compose.runtime.movableContentOf\nimport androidx.compose.runtime.remember\n\n@Composable\nfun ResponsiveProfile(expanded: Boolean, user: UserUi) {\n  val actions = remember {\n    movableContentOf<UserUi> { current ->\n      ProfileActions(current)\n    }\n  }\n\n  if (expanded) {\n    Row { ProfileSummary(user); actions(user) }\n  } else {\n    Column { ProfileSummary(user); actions(user) }\n  }\n}\n\n// The same remembered content instance moves without losing internal remembered state.";
    }
    if (mode === "SaveableHolder") {
      if (v.saveableStateHolder !== "true") {
        return "import androidx.compose.runtime.Composable\nimport androidx.compose.runtime.saveable.rememberSaveable\n\n@Composable\nfun TabContent(selectedTab: TabUi) {\n  // BUG: when a tab leaves composition, its local rememberSaveable state can be removed.\n  var query by rememberSaveable { mutableStateOf(\"\") }\n  SearchableTab(tab = selectedTab, query = query, onQueryChange = { query = it })\n}\n\n// Dynamic tabs, pages, and small custom back stacks usually need SaveableStateHolder.";
      }
      return "import androidx.compose.runtime.Composable\nimport androidx.compose.runtime.saveable.rememberSaveableStateHolder\n\n@Composable\nfun TabHost(selectedTab: TabUi) {\n  val holder = rememberSaveableStateHolder()\n\n  holder.SaveableStateProvider(selectedTab.id) {\n    TabContent(selectedTab)\n  }\n}\n\n@Composable\nfun TabContent(tab: TabUi) {\n  SearchableTab(tab)\n}\n\n// Each tab id owns its small rememberSaveable child state while the tab is temporarily absent.";
    }
    if (v.retainAcrossConfig !== "true") {
      return "import androidx.compose.runtime.Composable\nimport androidx.compose.runtime.DisposableEffect\nimport androidx.compose.runtime.remember\n\n@Composable\nfun CameraPreviewSurface() {\n  // BUG: remember does not survive configuration changes.\n  val controller = remember { CameraController() }\n\n  DisposableEffect(controller) {\n    controller.start()\n    onDispose { controller.stop() }\n  }\n}\n\n// Use a ViewModel for screen logic, rememberSaveable for small Bundle state, or retain for composition-scoped non-serializable objects.";
    }
    return "import androidx.compose.runtime.Composable\nimport androidx.compose.runtime.DisposableEffect\nimport androidx.compose.runtime.retain.retain\n\n@Composable\nfun CameraPreviewSurface() {\n  val controller = retain { CameraController() }\n\n  DisposableEffect(controller) {\n    controller.start()\n    onDispose { controller.stop() }\n  }\n}\n\n// retain survives configuration changes, does not survive process death, and should not hold Activity, View, Fragment, Lifecycle, or Context objects.";
  }

  function pvCompositionLocal(pg, v, stage) {
    const mode = v.compositionLocalPattern || "TrackedTheme";
    stage.classList.add("local-stage");
    stage.style.display = "grid";
    stage.style.placeItems = "center";
    stage.style.padding = "16px";
    const bad = mode === "BadViewModelLocal" || v.localBadDependency === "true";
    const shell = h("div", "local-shell" + (bad ? " is-bad" : ""));
    const tracked = mode === "StaticTokens" || v.staticLocal === "true" ? "static read" : "tracked read";
    shell.appendChild(h("div", "local-top", "<b>" + esc(mode) + "</b><span>" + tracked + "</span>"));
    const tree = h("div", "local-tree");
    tree.appendChild(h("div", "local-node provider", "<span>Provider</span><b>" + esc(bad ? "LocalProfileViewModel" : mode === "StaticTokens" ? "LocalMotionTokens" : "LocalElevations") + "</b>"));
    const branches = h("div", "local-branches");
    branches.appendChild(h("div", "local-node reader", "<span>Reader</span><b>Card</b><em>" + esc(bad ? "implicit VM" : "current") + "</em>"));
    branches.appendChild(h("div", "local-node reader", "<span>Reader</span><b>Sheet</b><em>" + esc(v.nestedProvider === "true" || mode === "NestedOverride" ? "override" : "inherited") + "</em>"));
    tree.appendChild(branches);
    if (v.nestedProvider === "true" || mode === "NestedOverride") {
      tree.appendChild(h("div", "local-node nested", "<span>Nested provider</span><b>compact tokens</b>"));
    }
    shell.appendChild(tree);
    const chips = h("div", "local-chips");
    [
      v.localPreviewDefault === "true" ? "preview-safe default" : "required provider",
      mode === "ExplicitParameter" ? "explicit state" : "implicit context",
      mode === "StaticTokens" || v.staticLocal === "true" ? "rarely changes" : "can change",
      bad ? "hidden dependency" : "tree-scoped",
    ].forEach(function (label) { chips.appendChild(h("span", null, esc(label))); });
    shell.appendChild(chips);
    stage.appendChild(shell);
  }

  function genCompositionLocal(pg, v) {
    const mode = v.compositionLocalPattern || "TrackedTheme";
    if (mode === "StaticTokens") {
      return "import androidx.compose.runtime.Composable\nimport androidx.compose.runtime.Immutable\nimport androidx.compose.runtime.CompositionLocalProvider\nimport androidx.compose.runtime.staticCompositionLocalOf\n\n@Immutable\ndata class MotionTokens(\n  val fast: Int = 120,\n  val normal: Int = 220\n)\n\n// Use staticCompositionLocalOf only when provider changes are rare.\nval LocalMotionTokens = staticCompositionLocalOf { MotionTokens() }\n\n@Composable\nfun ProductTheme(content: @Composable () -> Unit) {\n  CompositionLocalProvider(\n    LocalMotionTokens provides MotionTokens(fast = 100, normal = 200)\n  ) {\n    content()\n  }\n}\n\n@Composable\nfun MotionAwareCard() {\n  val motion = LocalMotionTokens.current\n  FadeIn(durationMillis = motion.normal)\n}";
    }
    if (mode === "NestedOverride") {
      return "import androidx.compose.runtime.Composable\nimport androidx.compose.runtime.CompositionLocalProvider\nimport androidx.compose.runtime.compositionLocalOf\n\nval LocalContentDensity = compositionLocalOf { ContentDensity.Comfortable }\n\nenum class ContentDensity { Comfortable, Compact }\n\n@Composable\nfun SettingsScreen() {\n  CompositionLocalProvider(LocalContentDensity provides ContentDensity.Comfortable) {\n    SettingsSection(title = \"General\")\n\n    CompositionLocalProvider(LocalContentDensity provides ContentDensity.Compact) {\n      SettingsSection(title = \"Advanced\")\n    }\n  }\n}\n\n@Composable\nfun SettingsSection(title: String) {\n  when (LocalContentDensity.current) {\n    ContentDensity.Comfortable -> ComfortableSection(title)\n    ContentDensity.Compact -> CompactSection(title)\n  }\n}";
    }
    if (mode === "ExplicitParameter") {
      return "import androidx.compose.runtime.Composable\nimport androidx.compose.runtime.getValue\nimport androidx.lifecycle.compose.collectAsStateWithLifecycle\n\n@Composable\nfun ProfileRoute(\n  viewModel: ProfileViewModel,\n  onBack: () -> Unit\n) {\n  val uiState by viewModel.uiState.collectAsStateWithLifecycle()\n\n  ProfileScreen(\n    uiState = uiState,\n    onFollowClick = viewModel::follow,\n    onBack = onBack\n  )\n}\n\n@Composable\nfun ProfileScreen(\n  uiState: ProfileUiState,\n  onFollowClick: () -> Unit,\n  onBack: () -> Unit\n) {\n  ProfileHeader(uiState.user, onBack)\n  FollowButton(following = uiState.following, onClick = onFollowClick)\n}\n\n// Ordinary screen state and dependencies stay explicit.\n// CompositionLocal is not a shortcut around state hoisting.";
    }
    if (mode === "BadViewModelLocal") {
      return "import androidx.compose.runtime.Composable\nimport androidx.compose.runtime.compositionLocalOf\nimport androidx.compose.runtime.getValue\nimport androidx.lifecycle.compose.collectAsStateWithLifecycle\n\n// BUG: screen dependencies are now implicit and hard to preview/test.\nval LocalProfileViewModel = compositionLocalOf<ProfileViewModel> {\n  error(\"No ProfileViewModel provided\")\n}\n\n@Composable\nfun ProfileScreen() {\n  val viewModel = LocalProfileViewModel.current\n  val state by viewModel.uiState.collectAsStateWithLifecycle()\n\n  ProfileHeader(state.user)\n  FollowButton(onClick = viewModel::follow)\n}\n\n// Prefer a route that owns the ViewModel and passes uiState + events down.";
    }
    return "import androidx.compose.foundation.isSystemInDarkTheme\nimport androidx.compose.runtime.Composable\nimport androidx.compose.runtime.CompositionLocalProvider\nimport androidx.compose.runtime.Immutable\nimport androidx.compose.runtime.compositionLocalOf\nimport androidx.compose.ui.unit.Dp\nimport androidx.compose.ui.unit.dp\n\n@Immutable\ndata class Elevations(\n  val card: Dp = 0.dp,\n  val dialog: Dp = 6.dp\n)\n\n// compositionLocalOf tracks current reads and invalidates only readers.\nval LocalElevations = compositionLocalOf { Elevations() }\n\n@Composable\nfun AppTheme(content: @Composable () -> Unit) {\n  val elevations = if (isSystemInDarkTheme()) {\n    Elevations(card = 1.dp, dialog = 8.dp)\n  } else {\n    Elevations(card = 0.dp, dialog = 6.dp)\n  }\n\n  CompositionLocalProvider(LocalElevations provides elevations) {\n    content()\n  }\n}\n\n@Composable\nfun ProductCard() {\n  val elevation = LocalElevations.current.card\n  ElevatedCard(elevation = elevation) { ProductSummary() }\n}";
  }

  function pvSnapshotState(pg, v, stage) {
    const mode = v.snapshotStateMode || "MutableState";
    const badCollection = v.mutatePlainCollection === "true";
    const derived = mode === "DerivedState";
    const flow = mode === "SnapshotFlow";
    stage.classList.add("snap-stage");
    stage.style.display = "grid";
    stage.style.placeItems = "center";
    stage.style.padding = "16px";
    const shell = h("div", "snap-shell" + (badCollection ? " warn" : ""));
    shell.appendChild(h("div", "snap-top", "<b>" + esc(mode) + "</b><span>" + (v.rememberSaveableState === "true" ? "saveable" : "composition") + "</span>"));
    const cycle = h("div", "snap-cycle");
    [
      ["read", flow ? "snapshotFlow" : derived ? "derivedStateOf" : "State<T>"],
      ["track", "scope"],
      ["write", badCollection ? "plain mutate" : "observable write"],
      ["result", badCollection ? "missed update" : "invalidate"],
    ].forEach(function (item, idx) {
      const cell = h("div", "snap-cell" + (idx === 2 && badCollection ? " warn" : "") + (idx === 3 && !badCollection ? " active" : ""));
      cell.appendChild(h("span", null, esc(item[0])));
      cell.appendChild(h("b", null, esc(item[1])));
      cycle.appendChild(cell);
    });
    shell.appendChild(cycle);
    const lanes = h("div", "snap-lanes");
    [
      ["container", mode === "SnapshotList" ? (badCollection ? "MutableList in State" : "SnapshotStateList") : mode],
      ["policy", mode === "MutationPolicy" ? (v.structuralEquality === "true" ? "structural" : "never equal") : "default"],
      ["emissions", flow ? (v.flowOperators === "true" ? "gated Flow" : "raw ticks") : derived ? (v.derivedThreshold === "true" ? "threshold only" : "same as input") : "state reads"],
    ].forEach(function (item) {
      const row = h("div", "snap-lane");
      row.appendChild(h("span", null, esc(item[0])));
      row.appendChild(h("b", null, esc(item[1])));
      lanes.appendChild(row);
    });
    shell.appendChild(lanes);
    const note = badCollection
      ? "Plain mutable collections hide in-place writes from Compose."
      : mode === "MutationPolicy"
        ? "Policy decides whether assignment is a real change."
        : flow
          ? "Collect Compose state as Flow from a scoped coroutine."
          : derived
            ? "Use only when output changes less often than input."
            : "Observable writes recompose only scopes that read state.";
    shell.appendChild(h("div", "snap-note", esc(note)));
    const chips = h("div", "snap-chips");
    [
      v.rememberSaveableState === "true" ? "rememberSaveable" : "remember",
      v.stateHolderSaver === "true" ? "Saver" : "no saver",
      v.derivedThreshold === "true" ? "threshold" : "plain expression",
      v.flowOperators === "true" ? "Flow operators" : "raw values",
    ].forEach(function (label) { chips.appendChild(h("span", null, esc(label))); });
    shell.appendChild(chips);
    stage.appendChild(shell);
  }

  function genSnapshotState(pg, v) {
    const mode = v.snapshotStateMode || "MutableState";
    const saveable = v.rememberSaveableState === "true";
    const badCollection = v.mutatePlainCollection === "true";
    if (mode === "SnapshotList") {
      if (badCollection) {
        return "import androidx.compose.runtime.Composable\nimport androidx.compose.runtime.mutableStateOf\nimport androidx.compose.runtime.remember\n\n@Composable\nfun BrokenTodoList() {\n  val todos = remember { mutableStateOf(mutableListOf<Todo>()) }\n\n  // BUG: mutating the same MutableList instance is not an observable state write.\n  Button(onClick = { todos.value.add(Todo(\"new\")) }) {\n    Text(\"Add\")\n  }\n\n  TodoColumn(todos.value)\n}";
      }
      return "import androidx.compose.runtime.Composable\nimport androidx.compose.runtime.mutableStateListOf\nimport androidx.compose.runtime.remember\n\n@Composable\nfun TodoListState() {\n  val todos = remember { mutableStateListOf<Todo>() }\n\n  Button(onClick = { todos.add(Todo(\"new\")) }) {\n    Text(\"Add\")\n  }\n\n  TodoColumn(\n    todos = todos,\n    onRemove = { todo -> todos.remove(todo) }\n  )\n}\n\n// SnapshotStateList is observable; add/remove/set operations notify readers.";
    }
    if (mode === "MutationPolicy") {
      const policy = v.structuralEquality === "true" ? "structuralEqualityPolicy()" : "neverEqualPolicy()";
      const importPolicy = v.structuralEquality === "true" ? "structuralEqualityPolicy" : "neverEqualPolicy";
      return "import androidx.compose.runtime.Composable\nimport androidx.compose.runtime.getValue\nimport androidx.compose.runtime.mutableStateOf\nimport androidx.compose.runtime.remember\nimport androidx.compose.runtime.setValue\nimport androidx.compose.runtime." + importPolicy + "\n\n@Composable\nfun DraftEditor() {\n  var draft by remember {\n    mutableStateOf(\n      value = Draft(title = \"\"),\n      policy = " + policy + "\n    )\n  }\n\n  TitleField(\n    value = draft.title,\n    onValueChange = { title -> draft = draft.copy(title = title) }\n  )\n}\n\n// The mutation policy decides whether an assignment counts as a change.";
    }
    if (mode === "DerivedState") {
      return "import androidx.compose.foundation.lazy.rememberLazyListState\nimport androidx.compose.runtime.Composable\nimport androidx.compose.runtime.derivedStateOf\nimport androidx.compose.runtime.getValue\nimport androidx.compose.runtime.remember\n\n@Composable\nfun JumpButtonState() {\n  val listState = rememberLazyListState()\n  val showJump by remember {\n    derivedStateOf { " + (v.derivedThreshold === "true" ? "listState.firstVisibleItemIndex > 0" : "listState.firstVisibleItemIndex + listState.firstVisibleItemScrollOffset") + " }\n  }\n\n  Feed(listState)\n  JumpToTopButton(visible = showJump)\n}\n\n// Use derivedStateOf when many input changes collapse into fewer output changes.";
    }
    if (mode === "SnapshotFlow") {
      return "import androidx.compose.foundation.lazy.LazyListState\nimport androidx.compose.runtime.Composable\nimport androidx.compose.runtime.LaunchedEffect\nimport androidx.compose.runtime.snapshotFlow\nimport kotlinx.coroutines.flow.distinctUntilChanged\nimport kotlinx.coroutines.flow.filter\nimport kotlinx.coroutines.flow.map\n\n@Composable\nfun ScrollAnalytics(\n  listState: LazyListState,\n  analytics: Analytics\n) {\n  LaunchedEffect(listState) {\n    snapshotFlow { listState.firstVisibleItemIndex }" + (v.flowOperators === "true" ? "\n      .map { index -> index > 0 }\n      .distinctUntilChanged()\n      .filter { it }" : "") + "\n      .collect { analytics.scrolledPastFirstItem() }\n  }\n}";
    }
    if (mode === "StateHolder") {
      return "import androidx.compose.runtime.Composable\nimport androidx.compose.runtime.Stable\nimport androidx.compose.runtime.getValue\nimport androidx.compose.runtime.mutableStateOf\nimport androidx.compose.runtime.remember\nimport androidx.compose.runtime.saveable.Saver\nimport androidx.compose.runtime.saveable.rememberSaveable\nimport androidx.compose.runtime.setValue\n\n@Stable\nclass SearchUiState(initialQuery: String = \"\") {\n  var query by mutableStateOf(initialQuery)\n    private set\n\n  fun updateQuery(value: String) {\n    query = value\n  }\n\n  companion object {\n    val Saver: Saver<SearchUiState, String> = Saver(\n      save = { it.query },\n      restore = { SearchUiState(it) }\n    )\n  }\n}\n\n@Composable\nfun rememberSearchUiState(): SearchUiState = " + (v.stateHolderSaver === "true" ? "rememberSaveable(saver = SearchUiState.Saver) {\n  SearchUiState()\n}" : "remember { SearchUiState() }") + "\n\n@Composable\nfun SearchRoute() {\n  val state = rememberSearchUiState()\n  SearchField(value = state.query, onValueChange = state::updateQuery)\n}";
    }
    return "import androidx.compose.runtime.Composable\nimport androidx.compose.runtime.getValue\nimport androidx.compose.runtime.mutableStateOf\nimport androidx.compose.runtime." + (saveable ? "saveable.rememberSaveable" : "remember") + "\nimport androidx.compose.runtime.setValue\n\n@Composable\nfun Counter() {\n  var count by " + (saveable ? "rememberSaveable" : "remember") + " { mutableStateOf(0) }\n\n  Button(onClick = { count++ }) {\n    Text(\"Count: $count\")\n  }\n}\n\n// Writing count schedules recomposition for scopes that read count.";
  }

  function pvCustomModifier(pg, v, stage) {
    const mode = v.customModifierStrategy || "ChainedFactory";
    stage.classList.add("modauth-stage");
    stage.style.display = "grid";
    stage.style.placeItems = "center";
    stage.style.padding = "16px";
    const shell = h("div", "modauth-shell");
    shell.appendChild(h("div", "modauth-top", "<b>" + esc(mode) + "</b><span>" + (v.preserveChain === "true" ? "chain preserved" : "chain broken") + "</span>"));
    const pipe = h("div", "modauth-pipe");
    [
      ["Caller", v.preserveChain === "true" ? "this" : "Modifier"],
      ["Factory", mode === "ComposableFactory" ? "@Composable" : "fun Modifier.*"],
      ["Element", mode === "ChainedFactory" ? "built-ins" : (v.dataClassElement === "true" ? "data class" : "class")],
      ["Node", mode === "ModifierNode" ? "Draw/Layout" : mode === "LocalAwareNode" ? "currentValueOf" : mode === "DelegatingNode" ? "delegates" : "existing modifiers"],
    ].forEach(function (item) {
      const cell = h("div", "modauth-cell");
      cell.appendChild(h("span", null, esc(item[0])));
      cell.appendChild(h("b", null, esc(item[1])));
      pipe.appendChild(cell);
    });
    shell.appendChild(pipe);
    const demo = h("div", "modauth-demo");
    demo.style.setProperty("--r", Math.round(num(v.cornerRadius, 14)) + "px");
    demo.style.setProperty("--bw", Math.max(1, Math.round(num(v.borderWidth, 3))) + "px");
    demo.appendChild(h("div", "modauth-card", "<b>Modifier.Node</b><span>" + esc(mode === "LocalAwareNode" ? "reads local at use site" : mode === "DelegatingNode" ? "shared interaction state" : mode === "ComposableFactory" ? "uses animate*AsState" : "updates existing node") + "</span>"));
    shell.appendChild(demo);
    const flags = h("div", "modauth-flags");
    [
      v.dataClassElement === "true" ? "stable equality" : "manual equality needed",
      v.readLocalInNode === "true" ? "CompositionLocal in node" : "factory value",
      v.manualInvalidation === "true" ? "manual invalidation" : "auto invalidation",
    ].forEach(function (label) { flags.appendChild(h("span", null, esc(label))); });
    shell.appendChild(flags);
    stage.appendChild(shell);
  }

  function genCustomModifier(pg, v) {
    const mode = v.customModifierStrategy || "ChainedFactory";
    const preserve = v.preserveChain !== "false";
    const radius = Math.round(num(v.cornerRadius, 14));
    const stroke = Math.max(1, Math.round(num(v.borderWidth, 3)));
    const chainReceiver = preserve ? "this" : "Modifier /* BUG: drops incoming chain */";
    const nodePrefix = chainReceiver + " then ";
    if (mode === "ChainedFactory") {
      return "fun Modifier.fancyCard(\n  color: Color,\n  radius: Dp = " + radius + ".dp,\n  strokeWidth: Dp = " + stroke + ".dp\n): Modifier =\n  " + chainReceiver + "\n    .clip(RoundedCornerShape(radius))\n    .background(color)\n    .border(strokeWidth, Color.Black.copy(alpha = 0.12f), RoundedCornerShape(radius))\n    .padding(16.dp)";
    }
    if (mode === "ComposableFactory") {
      return "@Composable\nfun Modifier.fadeWhenDisabled(enabled: Boolean): Modifier {\n  val alpha by animateFloatAsState(\n    targetValue = if (enabled) 1f else 0.45f,\n    label = \"disabled alpha\"\n  )\n\n  return " + nodePrefix + "Modifier.graphicsLayer {\n    this.alpha = alpha\n  }\n}";
    }
    if (mode === "LocalAwareNode") {
      return "fun Modifier.localAwareBorder(width: Dp = " + stroke + ".dp): Modifier =\n  " + nodePrefix + "LocalAwareBorderElement(width)\n\nprivate data class LocalAwareBorderElement(\n  val width: Dp\n) : ModifierNodeElement<LocalAwareBorderNode>() {\n  override fun create() = LocalAwareBorderNode(width)\n  override fun update(node: LocalAwareBorderNode) {\n    node.width = width\n  }\n}\n\nprivate class LocalAwareBorderNode(\n  var width: Dp\n) : DrawModifierNode, CompositionLocalConsumerModifierNode, Modifier.Node() {\n  override fun ContentDrawScope.draw() {\n    drawContent()\n    val color = if (" + (v.readLocalInNode === "true" ? "true" : "false") + ") {\n      currentValueOf(LocalContentColor)\n    } else {\n      Color.Black\n    }\n    drawRoundRect(\n      color = color,\n      style = Stroke(width.toPx())\n    )\n  }\n}";
    }
    if (mode === "DelegatingNode") {
      return "fun Modifier.focusablePressable(\n  interactionSource: MutableInteractionSource,\n  onClick: () -> Unit\n): Modifier = " + nodePrefix + "PressableElement(interactionSource, onClick)\n\nprivate data class PressableElement(\n  val interactionSource: MutableInteractionSource,\n  val onClick: () -> Unit\n) : ModifierNodeElement<PressableNode>() {\n  override fun create() = PressableNode(interactionSource, onClick)\n  override fun update(node: PressableNode) {\n    node.interactionSource = interactionSource\n    node.onClick = onClick\n  }\n}\n\nprivate class PressableNode(\n  var interactionSource: MutableInteractionSource,\n  var onClick: () -> Unit\n) : DelegatingNode() {\n  private val focusable = delegate(FocusableNode(interactionSource))\n  private val pointer = delegate(PressPointerNode(interactionSource) { onClick() })\n}";
    }
    const elementDecl = v.dataClassElement === "true"
      ? "private data class CircleElement(val color: Color) : ModifierNodeElement<CircleNode>()"
      : "private class CircleElement(val color: Color) : ModifierNodeElement<CircleNode>()";
    const invalidation = v.manualInvalidation === "true"
      ? "\n  override val shouldAutoInvalidate: Boolean = false"
      : "";
    const updateBody = v.manualInvalidation === "true"
      ? "    if (node.color != color) {\n      node.color = color\n      node.invalidateDraw()\n    }"
      : "    node.color = color";
    return "fun Modifier.circle(color: Color): Modifier = " + nodePrefix + "CircleElement(color)\n\n" + elementDecl + " {\n  override fun create() = CircleNode(color)\n\n  override fun update(node: CircleNode) {\n" + updateBody + "\n  }" + (v.dataClassElement === "true" ? "" : "\n\n  // If this is not a data class, implement equals() and hashCode() correctly.") + "\n}\n\nprivate class CircleNode(\n  var color: Color\n) : DrawModifierNode, Modifier.Node() {" + invalidation + "\n  override fun ContentDrawScope.draw() {\n    drawContent()\n    drawCircle(color)\n  }\n}";
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

  function pvStabilityLab(pg, v, stage) {
    const scenario = v.stabilityScenario || "ImmutableModel";
    const strong = v.strongSkippingEnabled !== "false";
    const immutable = scenario === "ImmutableModel" || v.immutableCollections === "true";
    const mutable = scenario === "MutableModel";
    const annotation = scenario === "StableAnnotation" || v.stableAnnotation === "true";
    const phase = scenario === "PhaseRead";
    const drawPhase = phase && v.drawPhaseRead !== "false";
    const skippable = strong || immutable || annotation;
    stage.classList.add("stab-stage");
    stage.style.display = "grid";
    stage.style.placeItems = "center";
    stage.style.padding = "16px";
    const shell = h("div", "stab-shell");
    shell.appendChild(h("div", "stab-top", "<b>" + esc(scenario) + "</b><span>" + (strong ? "strong skipping" : "classic skipping") + "</span>"));
    const report = h("div", "stab-report");
    [
      ["type", mutable ? "unstable" : immutable ? "immutable" : annotation ? "@Stable contract" : "runtime stability"],
      ["function", skippable ? "restartable skippable" : "restartable only"],
      ["compare", !skippable ? "no skip" : (mutable && strong ? "instance ===" : "equals()")],
      ["phase", drawPhase ? "draw only" : phase ? "composition read" : "composition"],
    ].forEach(function (item) {
      const row = h("div", "stab-row" + (item[1].indexOf("unstable") >= 0 || item[1] === "composition read" || item[1] === "no skip" ? " warn" : ""));
      row.appendChild(h("span", null, esc(item[0])));
      row.appendChild(h("b", null, esc(item[1])));
      report.appendChild(row);
    });
    shell.appendChild(report);
    const phases = h("div", "stab-phases");
    [
      ["compose", phase && !drawPhase],
      ["layout", false],
      ["draw", drawPhase],
    ].forEach(function (item) {
      phases.appendChild(h("span", item[1] ? "active" : null, esc(item[0])));
    });
    shell.appendChild(phases);
    const note = mutable && !strong
      ? "unstable params force recomposition with classic skipping"
      : mutable && strong
        ? "restartable composables can still skip by instance equality"
        : annotation
          ? "annotation is a contract, not a fix by itself"
          : drawPhase
            ? "high-frequency value is read in draw phase"
            : "stable value can be skipped when equal";
    shell.appendChild(h("div", "stab-note", esc(note)));
    const chips = h("div", "stab-chips");
    [
      v.immutableCollections === "true" ? "persistent collections" : "standard collection risk",
      v.lazyStableKeys === "true" ? "stable lazy keys" : "index identity risk",
      v.lambdaMemoization !== "false" ? "lambda memoization" : "manual lambda churn",
      v.stableAnnotation === "true" ? "contract checked" : "no annotation",
    ].forEach(function (label) { chips.appendChild(h("span", null, esc(label))); });
    shell.appendChild(chips);
    stage.appendChild(shell);
  }

  function genStabilityLab(pg, v) {
    const scenario = v.stabilityScenario || "ImmutableModel";
    const strong = v.strongSkippingEnabled !== "false";
    const immutableCollections = v.immutableCollections !== "false";
    const stableAnnotation = v.stableAnnotation === "true";
    const lazyKeys = v.lazyStableKeys !== "false";
    const lambdaMemo = v.lambdaMemoization !== "false";
    const drawPhase = v.drawPhaseRead !== "false";
    if (scenario === "MutableModel") {
      return "import androidx.compose.runtime.Composable\n\n// BUG: Compose cannot observe ordinary mutable properties.\ndata class ArticleUi(\n  val id: String,\n  var title: String,\n  val tags: MutableSet<String>\n)\n\n@Composable\nfun ArticleRow(article: ArticleUi) {\n  // Compiler report likely says this parameter is unstable.\n  // Mutating article.title or article.tags in place can leave the UI stale.\n  Text(article.title)\n}\n\n// Prefer a new immutable value when article content changes.";
    }
    if (scenario === "StableAnnotation") {
      return stableAnnotation
        ? "import androidx.compose.runtime.Composable\nimport androidx.compose.runtime.Stable\nimport androidx.compose.runtime.getValue\nimport androidx.compose.runtime.mutableStateOf\nimport androidx.compose.runtime.setValue\n\n@Stable\nclass PlaybackState(\n  initialTitle: String,\n  initialPlaying: Boolean\n) {\n  var title by mutableStateOf(initialTitle)\n    private set\n  var isPlaying by mutableStateOf(initialPlaying)\n    private set\n\n  fun play() { isPlaying = true }\n  fun rename(title: String) { this.title = title }\n}\n\n@Composable\nfun PlayerHeader(state: PlaybackState) {\n  // @Stable is safe here because public changes notify Compose State.\n  Text(if (state.isPlaying) \"Playing ${state.title}\" else state.title)\n}"
        : "import androidx.compose.runtime.Composable\nimport androidx.compose.runtime.Stable\n\n@Stable // BUG: this promise is false.\ndata class ArticleUi(\n  var title: String,\n  val tags: MutableSet<String>\n)\n\n@Composable\nfun ArticleRow(article: ArticleUi) {\n  // Incorrect @Stable can make recomposition skip when UI should update.\n  Text(article.title)\n}";
    }
    if (scenario === "StrongSkipping") {
      return "// Strong skipping is enabled by default with Kotlin 2.0.20+.\n// For older Compose compiler modules:\ncomposeCompiler {\n  enableStrongSkippingMode = " + strong + "\n}\n\n@Composable\nfun FeedRoute(\n  filter: FeedFilter,\n  analytics: Analytics,\n  articles: List<ArticleUi>\n) {\n  ArticleList(\n    articles = articles,\n    onOpen = " + (lambdaMemo ? "{ id ->\n      analytics.openArticle(filter, id)\n    }" : "@DontMemoize { id ->\n      analytics.openArticle(filter, id)\n    }") + "\n  )\n}\n\n// With strong skipping, restartable composables become skippable.\n// Stable params compare with equals(); unstable params compare with instance equality.";
    }
    if (scenario === "PhaseRead") {
      return drawPhase
        ? "import androidx.compose.foundation.Canvas\nimport androidx.compose.runtime.Composable\nimport androidx.compose.ui.Modifier\nimport androidx.compose.ui.draw.drawWithContent\n\n@Composable\nfun ScrollGlow(\n  scrollFraction: () -> Float,\n  modifier: Modifier = Modifier\n) {\n  Canvas(\n    modifier.drawWithContent {\n      drawContent()\n      drawRect(\n        color = Color.Cyan.copy(alpha = scrollFraction()),\n        size = size\n      )\n    }\n  )\n}\n\n// The high-frequency value is read while drawing, so composition and layout can stay skipped."
        : "import androidx.compose.foundation.background\nimport androidx.compose.runtime.Composable\nimport androidx.compose.ui.Modifier\n\n@Composable\nfun ScrollGlow(scrollFraction: Float, modifier: Modifier = Modifier) {\n  // This read happens in composition, so every fraction change can recompose.\n  Box(\n    modifier\n      .fillMaxWidth()\n      .height(4.dp)\n      .background(Color.Cyan.copy(alpha = scrollFraction))\n  )\n}";
    }
    return "import androidx.compose.runtime.Composable\nimport androidx.compose.runtime.Immutable\n" + (immutableCollections ? "import kotlinx.collections.immutable.ImmutableList\nimport kotlinx.collections.immutable.ImmutableSet\nimport kotlinx.collections.immutable.persistentSetOf\n" : "") + "\n@Immutable\ndata class ArticleUi(\n  val id: String,\n  val title: String,\n  val bookmarked: Boolean,\n  val tags: " + (immutableCollections ? "ImmutableSet<String> = persistentSetOf()" : "Set<String> = emptySet() // standard collections are inferred unstable") + "\n)\n\n@Composable\nfun ArticleList(articles: " + (immutableCollections ? "ImmutableList<ArticleUi>" : "List<ArticleUi> // standard List is inferred unstable") + ") {\n  LazyColumn {\n    items(\n      items = articles" + (lazyKeys ? ",\n      key = { article -> article.id },\n      contentType = { \"article-row\" }" : "") + "\n    ) { article ->\n      ArticleRow(article = article)\n    }\n  }\n}\n\n@Composable\nfun ArticleRow(article: ArticleUi, modifier: Modifier = Modifier) {\n  Text(article.title, modifier)\n}";
  }

  function pvPerformanceMeasurement(pg, v, stage) {
    const mode = v.perfMeasurement || "Macrobenchmark";
    const startup = Math.round(num(v.startupMs, 325));
    const frame = Math.round(num(v.frameMs, 22));
    const startupGoal = 300;
    const frameGoal = 16;
    const startupPct = Math.max(8, Math.min(100, Math.round((startup / 900) * 100)));
    const framePct = Math.max(8, Math.min(100, Math.round((frame / 40) * 100)));
    const noProfile = Math.min(900, Math.round(startup * 1.28));
    const profile = v.baselineProfile === "true" ? startup : Math.min(900, Math.round(startup * 1.12));
    stage.classList.add("perf-stage");
    stage.style.display = "grid";
    stage.style.placeItems = "center";
    stage.style.padding = "16px";
    const shell = h("div", "perf-shell");
    shell.appendChild(h("div", "perf-top", "<b>" + esc(mode) + "</b><span>" + (v.physicalDevice === "true" ? "device run" : "emulator suspect") + "</span>"));
    const body = h("div", "perf-body");
    const gauge = h("div", "perf-gauges");
    [
      ["Startup", startup + " ms", startupPct, startup <= startupGoal ? "good" : "warn"],
      ["Frame", frame + " ms", framePct, frame <= frameGoal ? "good" : "warn"],
    ].forEach(function (item) {
      const card = h("div", "perf-gauge " + item[3]);
      card.appendChild(h("span", null, esc(item[0])));
      card.appendChild(h("b", null, esc(item[1])));
      const bar = h("i");
      bar.style.width = item[2] + "%";
      card.appendChild(bar);
      gauge.appendChild(card);
    });
    body.appendChild(gauge);
    const lanes = h("div", "perf-lanes");
    [
      ["None", noProfile],
      [v.baselineProfile === "true" ? "Baseline Profile" : "Partial warmup", profile],
    ].forEach(function (item) {
      const lane = h("div", "perf-lane");
      lane.appendChild(h("span", null, esc(item[0])));
      const track = h("div", "perf-lane-track");
      const fill = h("i");
      fill.style.width = Math.max(10, Math.min(100, Math.round((item[1] / 900) * 100))) + "%";
      track.appendChild(fill);
      lane.appendChild(track);
      lane.appendChild(h("b", null, item[1] + " ms"));
      lanes.appendChild(lane);
    });
    body.appendChild(lanes);
    const badges = h("div", "perf-badges");
    [
      v.baselineProfile === "true" ? "Baseline Profile" : "No profile",
      v.includeStartupProfile === "true" ? "startup profile" : "runtime CUJ",
      v.jankState === "true" ? "JankStats state" : "frames only",
      v.compilerReports === "true" ? "compiler reports" : "trace first",
    ].forEach(function (label) { badges.appendChild(h("span", null, esc(label))); });
    body.appendChild(badges);
    const note = mode === "Macrobenchmark"
      ? "StartupTimingMetric, FrameTimingMetric, CompilationMode"
      : mode === "BaselineProfile"
        ? "startup plus scroll, navigate, animation journeys"
        : mode === "JankStats"
          ? "copy frame data and attach UI state from effects"
          : "release reports for stability, restartability, skippability";
    body.appendChild(h("div", "perf-note", esc(note)));
    shell.appendChild(body);
    stage.appendChild(shell);
  }

  function genPerformanceMeasurement(pg, v) {
    const mode = v.perfMeasurement || "Macrobenchmark";
    const useProfile = v.baselineProfile !== "false";
    const includeStartup = v.includeStartupProfile !== "false";
    const physical = v.physicalDevice !== "false";
    const withJankState = v.jankState !== "false";
    const compilerReports = v.compilerReports === "true";
    const deviceNote = physical ? "" : "\n// Warning: emulator timings are useful for smoke checks, not benchmark evidence.\n";
    const compilation = useProfile
      ? "CompilationMode.Partial(\n      baselineProfileMode = BaselineProfileMode.Require\n    )"
      : "CompilationMode.None()";
    if (mode === "BaselineProfile") {
      return "import androidx.benchmark.macro.junit4.BaselineProfileRule\nimport androidx.test.ext.junit.runners.AndroidJUnit4\nimport androidx.test.uiautomator.By\nimport androidx.test.uiautomator.Direction\nimport androidx.test.uiautomator.Until\nimport org.junit.Rule\nimport org.junit.Test\nimport org.junit.runner.RunWith\n\nprivate const val TargetPackage = \"com.example.app\"\n\n@RunWith(AndroidJUnit4::class)\nclass ComposeBaselineProfileGenerator {\n  @get:Rule\n  val baselineProfileRule = BaselineProfileRule()\n\n  @Test\n  fun generateBaselineProfile() = baselineProfileRule.collect(\n    packageName = TargetPackage,\n    includeInStartupProfile = " + includeStartup + "\n  ) {\n    pressHome()\n    startActivityAndWait()\n    device.wait(Until.hasObject(By.res(TargetPackage, \"feed\")), 5_000)\n\n    // Cover real critical user journeys, not only app launch.\n    device.findObject(By.res(TargetPackage, \"feed\")).fling(Direction.DOWN)\n    device.findObject(By.text(\"Details\")).click()\n    device.waitForIdle()\n  }\n}";
    }
    if (mode === "JankStats") {
      return "import android.view.Window\nimport androidx.compose.foundation.lazy.LazyListState\nimport androidx.compose.runtime.Composable\nimport androidx.compose.runtime.LaunchedEffect\nimport androidx.compose.runtime.remember\nimport androidx.compose.runtime.snapshotFlow\nimport androidx.compose.ui.platform.LocalView\nimport androidx.metrics.performance.FrameData\nimport androidx.metrics.performance.JankStats\nimport androidx.metrics.performance.PerformanceMetricsState\n\nfun Window.installJankStats(\n  onFrame: (FrameData) -> Unit\n): JankStats = JankStats.createAndTrack(this) { frameData ->\n  // Keep this callback tiny; copy what you need and aggregate off the frame path.\n  if (frameData.isJank) onFrame(frameData)\n}\n\n@Composable\nfun rememberMetricsStateHolder(): PerformanceMetricsState.Holder {\n  val view = LocalView.current\n  return remember(view) { PerformanceMetricsState.getHolderForHierarchy(view) }\n}\n\n@Composable\nfun ReportFeedJankState(listState: LazyListState) {\n  val holder = rememberMetricsStateHolder()\n  LaunchedEffect(holder, listState) {\n    snapshotFlow { listState.isScrollInProgress }\n      .collect { scrolling ->\n        " + (withJankState ? "if (scrolling) holder.state?.putState(\"Feed\", \"Scrolling\")\n        else holder.state?.removeState(\"Feed\")" : "// Attach only state that helps explain janky frames.\n        holder.state?.removeState(\"Feed\")") + "\n      }\n  }\n}";
    }
    if (mode === "CompilerReports") {
      return "// build.gradle.kts\n// Turn this on only after a measured performance problem points to stability.\nplugins {\n  id(\"org.jetbrains.kotlin.plugin.compose\")\n}\n\ncomposeCompiler {\n  reportsDestination = layout.buildDirectory.dir(\"compose_compiler/reports\")\n  metricsDestination = layout.buildDirectory.dir(\"compose_compiler/metrics\")\n}\n\n// Run a release-like build, then inspect classes.txt and composables.txt:\n// ./gradlew :app:assembleRelease\n// Look for unstable parameters that explain the measured recomposition or skipping issue.\n" + (compilerReports ? "\n// Pair the report with Layout Inspector, traces, and Macrobenchmark output." : "\n// Leave reports disabled in normal builds unless you are diagnosing an issue.");
    }
    return deviceNote + "import androidx.benchmark.macro.BaselineProfileMode\nimport androidx.benchmark.macro.CompilationMode\nimport androidx.benchmark.macro.FrameTimingMetric\nimport androidx.benchmark.macro.StartupMode\nimport androidx.benchmark.macro.StartupTimingMetric\nimport androidx.benchmark.macro.junit4.MacrobenchmarkRule\nimport androidx.test.ext.junit.runners.AndroidJUnit4\nimport androidx.test.uiautomator.By\nimport androidx.test.uiautomator.Direction\nimport androidx.test.uiautomator.Until\nimport org.junit.Rule\nimport org.junit.Test\nimport org.junit.runner.RunWith\n\nprivate const val TargetPackage = \"com.example.app\"\n\n@RunWith(AndroidJUnit4::class)\nclass ComposeJourneyBenchmark {\n  @get:Rule\n  val benchmarkRule = MacrobenchmarkRule()\n\n  @Test\n  fun coldStartup() = benchmarkRule.measureRepeated(\n    packageName = TargetPackage,\n    metrics = listOf(StartupTimingMetric()),\n    compilationMode = " + compilation + ",\n    startupMode = StartupMode.COLD,\n    iterations = 10,\n    setupBlock = { pressHome() }\n  ) {\n    startActivityAndWait()\n    device.wait(Until.hasObject(By.res(TargetPackage, \"feed\")), 5_000)\n  }\n\n  @Test\n  fun feedScrollFrames() = benchmarkRule.measureRepeated(\n    packageName = TargetPackage,\n    metrics = listOf(FrameTimingMetric()),\n    compilationMode = " + compilation + ",\n    iterations = 10,\n    setupBlock = {\n      pressHome()\n      startActivityAndWait()\n      device.wait(Until.hasObject(By.res(TargetPackage, \"feed\")), 5_000)\n    }\n  ) {\n    device.findObject(By.res(TargetPackage, \"feed\")).fling(Direction.DOWN)\n    device.waitForIdle()\n  }\n}";
  }

  function pvEffectsLifecycle(pg, v, stage) {
    const mode = v.effectMode || "LaunchedEffect";
    stage.classList.add("effect-stage");
    stage.style.display = "grid";
    stage.style.placeItems = "center";
    stage.style.padding = "16px";
    const shell = h("div", "effect-shell");
    shell.appendChild(h("div", "effect-top", "<b>" + esc(mode) + "</b><span>" + (v.constantEffectKey === "true" ? "constant key" : "input key") + "</span>"));
    const flow = h("div", "effect-flow");
    [
      ["compose", "commit"],
      ["key", v.constantEffectKey === "true" ? "Unit" : "input"],
      ["work", mode],
      ["end", mode === "DisposableEffect" ? (v.cleanupEffect === "true" ? "dispose" : "leak risk") : "cancel"],
    ].forEach(function (item, idx) {
      const cell = h("div", "effect-cell" + (idx === 2 ? " active" : ""));
      cell.appendChild(h("span", null, esc(item[0])));
      cell.appendChild(h("b", null, esc(item[1])));
      flow.appendChild(cell);
    });
    shell.appendChild(flow);
    const body = h("div", "effect-body");
    const track = h("div", "effect-track");
    const restartWidth = v.constantEffectKey === "true" ? "28%" : "72%";
    track.appendChild(h("i"));
    track.querySelector("i").style.width = restartWidth;
    body.appendChild(track);
    const note = mode === "SnapshotFlow"
      ? (v.distinctFlow === "true" ? "Flow operators gate analytics" : "raw scroll emissions")
      : mode === "ProduceState"
        ? "external source becomes State"
        : mode === "EventScope"
          ? "user event launches coroutine"
          : mode === "DerivedStateOf"
            ? "threshold avoids recomposition"
            : mode === "SideEffect"
              ? "publish after commit"
              : mode === "DisposableEffect"
                ? "register + cleanup"
                : "coroutine tied to keys";
    body.appendChild(h("div", "effect-note", esc(note)));
    shell.appendChild(body);
    const chips = h("div", "effect-chips");
    [
      v.wrapLatestCallback === "true" ? "latest callback" : "captured callback",
      v.cleanupEffect === "true" ? "cleanup" : "no cleanup",
      v.distinctFlow === "true" ? "distinct flow" : "raw values",
      mode === "DerivedStateOf" ? "threshold" : "side effect",
    ].forEach(function (label) { chips.appendChild(h("span", null, esc(label))); });
    shell.appendChild(chips);
    stage.appendChild(shell);
  }

  function genEffectsLifecycle(pg, v) {
    const mode = v.effectMode || "LaunchedEffect";
    const key = v.constantEffectKey === "true" ? "Unit" : "articleId";
    const latest = v.wrapLatestCallback !== "false";
    if (mode === "EventScope") {
      return "import androidx.compose.material3.Button\nimport androidx.compose.material3.SnackbarHost\nimport androidx.compose.material3.SnackbarHostState\nimport androidx.compose.material3.SnackbarResult\nimport androidx.compose.material3.Text\nimport androidx.compose.runtime.Composable\nimport androidx.compose.runtime.remember\nimport androidx.compose.runtime.rememberCoroutineScope\nimport kotlinx.coroutines.launch\n\n@Composable\nfun DeleteAction(onUndo: () -> Unit) {\n  val snackbarHostState = remember { SnackbarHostState() }\n  val scope = rememberCoroutineScope()\n\n  SnackbarHost(snackbarHostState)\n  Button(onClick = {\n    scope.launch {\n      val result = snackbarHostState.showSnackbar(\"Message deleted\", \"Undo\")\n      if (result == SnackbarResult.ActionPerformed) onUndo()\n    }\n  }) {\n    Text(\"Delete\")\n  }\n}";
    }
    if (mode === "DisposableEffect") {
      return "import androidx.compose.runtime.Composable\nimport androidx.compose.runtime.DisposableEffect\nimport androidx.compose.runtime.getValue\nimport androidx.compose.runtime.rememberUpdatedState\nimport androidx.lifecycle.Lifecycle\nimport androidx.lifecycle.LifecycleEventObserver\nimport androidx.lifecycle.LifecycleOwner\n\n@Composable\nfun LifecycleAnalytics(\n  lifecycleOwner: LifecycleOwner,\n  onStart: () -> Unit,\n  onStop: () -> Unit\n) {\n  val latestOnStart by rememberUpdatedState(onStart)\n  val latestOnStop by rememberUpdatedState(onStop)\n\n  DisposableEffect(lifecycleOwner) {\n    val observer = LifecycleEventObserver { _, event ->\n      if (event == Lifecycle.Event.ON_START) latestOnStart()\n      if (event == Lifecycle.Event.ON_STOP) latestOnStop()\n    }\n    lifecycleOwner.lifecycle.addObserver(observer)\n\n    onDispose {\n      " + (v.cleanupEffect !== "false" ? "lifecycleOwner.lifecycle.removeObserver(observer)" : "// BUG: observer was not removed") + "\n    }\n  }\n}";
    }
    if (mode === "ProduceState") {
      return "import androidx.compose.runtime.Composable\nimport androidx.compose.runtime.State\nimport androidx.compose.runtime.produceState\n\nsealed interface ArticleLoadResult {\n  data object Loading : ArticleLoadResult\n  data class Success(val article: Article) : ArticleLoadResult\n  data class Error(val throwable: Throwable) : ArticleLoadResult\n}\n\n@Composable\nfun rememberArticleResult(\n  articleId: String,\n  repository: ArticleRepository\n): State<ArticleLoadResult> {\n  return produceState<ArticleLoadResult>(\n    initialValue = ArticleLoadResult.Loading,\n    articleId,\n    repository\n  ) {\n    value = try {\n      ArticleLoadResult.Success(repository.loadArticle(articleId))\n    } catch (t: Throwable) {\n      ArticleLoadResult.Error(t)\n    }\n  }\n}";
    }
    if (mode === "SnapshotFlow") {
      return "import androidx.compose.foundation.lazy.LazyListState\nimport androidx.compose.runtime.Composable\nimport androidx.compose.runtime.LaunchedEffect\nimport androidx.compose.runtime.snapshotFlow\nimport kotlinx.coroutines.flow.distinctUntilChanged\nimport kotlinx.coroutines.flow.filter\nimport kotlinx.coroutines.flow.map\n\n@Composable\nfun ReportScrollPastFirstItem(\n  listState: LazyListState,\n  analytics: Analytics\n) {\n  LaunchedEffect(listState) {\n    snapshotFlow { listState.firstVisibleItemIndex }\n      .map { index -> index > 0 }" + (v.distinctFlow !== "false" ? "\n      .distinctUntilChanged()" : "") + "\n      .filter { it }\n      .collect { analytics.scrolledPastFirstItem() }\n  }\n}";
    }
    if (mode === "DerivedStateOf") {
      return "import androidx.compose.animation.AnimatedVisibility\nimport androidx.compose.foundation.lazy.rememberLazyListState\nimport androidx.compose.material3.FloatingActionButton\nimport androidx.compose.material3.Text\nimport androidx.compose.runtime.Composable\nimport androidx.compose.runtime.derivedStateOf\nimport androidx.compose.runtime.getValue\nimport androidx.compose.runtime.remember\n\n@Composable\nfun ScrollToTopAffordance() {\n  val listState = rememberLazyListState()\n  val showButton by remember {\n    derivedStateOf { listState.firstVisibleItemIndex > 0 }\n  }\n\n  FeedList(listState)\n  AnimatedVisibility(showButton) {\n    FloatingActionButton(onClick = { /* scroll */ }) { Text(\"Top\") }\n  }\n}";
    }
    if (mode === "SideEffect") {
      return "import androidx.compose.runtime.Composable\nimport androidx.compose.runtime.SideEffect\nimport androidx.compose.runtime.remember\n\n@Composable\nfun rememberScreenAnalytics(user: User): Analytics {\n  val analytics = remember { Analytics() }\n\n  SideEffect {\n    analytics.setUserProperty(\"userType\", user.type)\n  }\n\n  return analytics\n}";
    }
    return "import androidx.compose.runtime.Composable\nimport androidx.compose.runtime.LaunchedEffect\nimport androidx.compose.runtime.getValue\nimport androidx.compose.runtime.rememberUpdatedState\n\n@Composable\nfun ArticleEffect(\n  articleId: String,\n  onTimeout: () -> Unit\n) {\n  " + (latest ? "val latestOnTimeout by rememberUpdatedState(onTimeout)\n\n  " : "") + "LaunchedEffect(" + key + ") {\n    analytics.logScreen(\"article\", articleId)\n    repository.refreshArticle(articleId)\n    delay(30_000)\n    " + (latest ? "latestOnTimeout()" : "onTimeout() // may be stale if callback changes without restart") + "\n  }\n}";
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

  function pvPredictiveBack(pg, v, stage) {
    const mode = v.predictiveBackMode || "SystemBack";
    const rootBad = v.rootBackIntercept === "true";
    const shared = mode === "SharedElementNav3";
    const manual = mode === "ManualProgress";
    const material = mode === "MaterialSurface";
    stage.classList.add("pb-stage");
    stage.style.display = "grid";
    stage.style.placeItems = "center";
    stage.style.padding = "16px";
    const shell = h("div", "pb-shell" + (rootBad ? " warn" : ""));
    shell.appendChild(h("div", "pb-top", "<b>" + esc(mode) + "</b><span>" + (rootBad ? "root intercept" : "supported back path") + "</span>"));
    const phones = h("div", "pb-phones");
    const from = h("div", "pb-phone from");
    from.appendChild(h("div", "pb-bar", "<i></i><b>Detail</b>"));
    from.appendChild(h("div", "pb-hero" + (shared ? " shared" : ""), shared ? "shared image" : "current screen"));
    from.appendChild(h("div", "pb-lines", "<span></span><span></span><span></span>"));
    const to = h("div", "pb-phone to");
    to.appendChild(h("div", "pb-bar", "<i></i><b>" + (material ? "Drawer" : "List") + "</b>"));
    to.appendChild(h("div", "pb-list", "<span></span><span></span><span></span>"));
    if (manual || material) to.appendChild(h("div", "pb-progress", "<b></b><span>BackEventCompat progress</span>"));
    phones.appendChild(from);
    phones.appendChild(h("div", "pb-gesture", "back"));
    phones.appendChild(to);
    shell.appendChild(phones);
    const flow = h("div", "pb-flow");
    [
      ["system", rootBad ? "intercepted" : "preview"],
      ["owner", mode === "NavHost" ? "NavHost" : shared ? "NavDisplay" : material ? "Material state" : manual ? "custom surface" : "Activity"],
      ["motion", shared ? (v.sharedBoundsContainer === "true" ? "sharedBounds" : "sharedElement") : mode === "NavHost" ? (v.popTransitions === "true" ? "pop transitions" : "default crossfade") : manual ? "progress flow" : material ? "component animation" : "system animation"],
      ["finish", rootBad ? "no preview" : "destination visible"],
    ].forEach(function (item, idx) {
      const cell = h("div", "pb-cell" + (idx === 0 && rootBad ? " warn" : "") + (idx === 3 && !rootBad ? " active" : ""));
      cell.appendChild(h("span", null, esc(item[0])));
      cell.appendChild(h("b", null, esc(item[1])));
      flow.appendChild(cell);
    });
    shell.appendChild(flow);
    const chips = h("div", "pb-chips");
    [
      v.popTransitions === "true" ? "popEnter/popExit" : "default pop",
      v.sharedBoundsContainer === "true" ? "sharedBounds" : "sharedElement",
      v.overlayClip === "true" ? "overlay clipped" : "overlay default",
      v.cancelAwareBack === "true" ? "CancellationException handled" : "completion only",
      v.materialBackState === "true" ? "state passed" : "state missing",
    ].forEach(function (label) { chips.appendChild(h("span", null, esc(label))); });
    shell.appendChild(chips);
    const note = rootBad
      ? "Root BackHandler can disable system predictive animations."
      : shared
        ? "SharedTransitionLayout supplies the scope; NavDisplay supplies the animated content scope."
        : manual
          ? "Collect gesture progress and restore state when cancellation is thrown."
          : material
            ? "Material surfaces animate when their state is wired through supported APIs."
            : "Supported back APIs let Android preview the destination.";
    shell.appendChild(h("div", "pb-note", esc(note)));
    stage.appendChild(shell);
  }

  function genPredictiveBack(pg, v) {
    const mode = v.predictiveBackMode || "SystemBack";
    if (mode === "NavHost") {
      const transitions = v.popTransitions === "true"
        ? ",\n    popExitTransition = {\n      scaleOut(\n        targetScale = 0.92f,\n        transformOrigin = TransformOrigin(0.5f, 0.5f)\n      )\n    },\n    popEnterTransition = { EnterTransition.None }"
        : "";
      return "import androidx.compose.animation.EnterTransition\nimport androidx.compose.animation.scaleOut\nimport androidx.compose.runtime.Composable\nimport androidx.compose.ui.graphics.TransformOrigin\nimport androidx.navigation.compose.NavHost\nimport androidx.navigation.compose.composable\nimport androidx.navigation.compose.rememberNavController\n\n@Composable\nfun AppNavHost() {\n  val navController = rememberNavController()\n\n  NavHost(\n    navController = navController,\n    startDestination = HomeRoute" + transitions + "\n  ) {\n    composable<HomeRoute> {\n      HomeRoute(onOpen = { id -> navController.navigate(DetailRoute(id)) })\n    }\n    composable<DetailRoute> {\n      DetailRoute(onBack = { navController.popBackStack() })\n    }\n  }\n}\n\n// Navigation Compose 2.8+ participates in predictive back; pop transitions tune back motion.";
    }
    if (mode === "SharedElementNav3") {
      const modifier = v.sharedBoundsContainer === "true"
        ? ".sharedBounds(\n          sharedContentState = rememberSharedContentState(key = \"snack-card-$id\"),\n          animatedVisibilityScope = animatedVisibilityScope,\n          resizeMode = SharedTransitionScope.ResizeMode.scaleToBounds()\n        )" + (v.overlayClip === "true" ? "\n        .clip(RoundedCornerShape(24.dp))" : "")
        : ".sharedElement(\n          sharedContentState = rememberSharedContentState(key = \"snack-image-$id\"),\n          animatedVisibilityScope = animatedVisibilityScope\n        )" + (v.overlayClip === "true" ? "\n        .clip(RoundedCornerShape(24.dp))" : "");
      return "import androidx.compose.animation.AnimatedVisibilityScope\nimport androidx.compose.animation.ExperimentalSharedTransitionApi\nimport androidx.compose.animation.SharedTransitionLayout\nimport androidx.compose.animation.SharedTransitionScope\nimport androidx.compose.animation.rememberSharedContentState\nimport androidx.compose.animation.sharedBounds\nimport androidx.compose.animation.sharedElement\nimport androidx.compose.foundation.shape.RoundedCornerShape\nimport androidx.compose.runtime.Composable\nimport androidx.compose.ui.Modifier\nimport androidx.compose.ui.draw.clip\nimport androidx.compose.ui.unit.dp\nimport androidx.navigation3.runtime.rememberNavBackStack\nimport androidx.navigation3.ui.LocalNavAnimatedContentScope\nimport androidx.navigation3.ui.NavDisplay\nimport androidx.navigation3.ui.entry\nimport androidx.navigation3.ui.entryProvider\nimport coil.compose.AsyncImage\n\n@OptIn(ExperimentalSharedTransitionApi::class)\n@Composable\nfun SnackNavigation() {\n  SharedTransitionLayout {\n    val backStack = rememberNavBackStack(HomeRoute)\n\n    NavDisplay(\n      backStack = backStack,\n      onBack = { backStack.removeLastOrNull() },\n      entryProvider = entryProvider {\n        entry<HomeRoute> {\n          SnackGrid(\n            sharedTransitionScope = this@SharedTransitionLayout,\n            animatedVisibilityScope = LocalNavAnimatedContentScope.current,\n            onOpenSnack = { id -> backStack.add(SnackDetailRoute(id)) }\n          )\n        }\n        entry<SnackDetailRoute> { route ->\n          SnackDetail(\n            id = route.id,\n            sharedTransitionScope = this@SharedTransitionLayout,\n            animatedVisibilityScope = LocalNavAnimatedContentScope.current,\n            onBack = { backStack.removeLastOrNull() }\n          )\n        }\n      }\n    )\n  }\n}\n\n@OptIn(ExperimentalSharedTransitionApi::class)\n@Composable\nfun SnackHero(\n  id: String,\n  sharedTransitionScope: SharedTransitionScope,\n  animatedVisibilityScope: AnimatedVisibilityScope\n) = with(sharedTransitionScope) {\n  AsyncImage(\n    model = id,\n    contentDescription = null,\n    modifier = Modifier\n      " + modifier + "\n  )\n}";
    }
    if (mode === "ManualProgress") {
      const catchBlock = v.cancelAwareBack === "true"
        ? "  } catch (e: CancellationException) {\n    scale = 1f\n    throw e\n  }"
        : "  }";
      const cancellationImport = v.cancelAwareBack === "true" ? "\nimport kotlinx.coroutines.CancellationException" : "";
      return "import androidx.activity.BackEventCompat\nimport androidx.activity.compose.PredictiveBackHandler\nimport androidx.compose.runtime.Composable\nimport androidx.compose.runtime.getValue\nimport androidx.compose.runtime.mutableFloatStateOf\nimport androidx.compose.runtime.remember\nimport androidx.compose.runtime.setValue\nimport androidx.compose.ui.Modifier\nimport androidx.compose.ui.graphics.graphicsLayer" + cancellationImport + "\nimport kotlinx.coroutines.flow.Flow\n\n@Composable\nfun BackProgressCard(\n  enabled: Boolean,\n  onBackComplete: () -> Unit\n) {\n  var scale by remember { mutableFloatStateOf(1f) }\n\n  PredictiveBackHandler(enabled) { progress: Flow<BackEventCompat> ->\n    try {\n      progress.collect { event ->\n        scale = 1f - (0.08f * event.progress)\n      }\n      onBackComplete()\n" + catchBlock + "\n  }\n\n  DetailCard(modifier = Modifier.graphicsLayer {\n    scaleX = scale\n    scaleY = scale\n  })\n}";
    }
    if (mode === "MaterialSurface") {
      return "import androidx.compose.material3.DrawerValue\nimport androidx.compose.material3.ModalDrawerSheet\nimport androidx.compose.material3.ModalNavigationDrawer\nimport androidx.compose.material3.rememberDrawerState\nimport androidx.compose.runtime.Composable\nimport androidx.compose.runtime.rememberCoroutineScope\nimport kotlinx.coroutines.launch\n\n@Composable\nfun PredictiveDrawerShell(content: @Composable () -> Unit) {\n  val drawerState = rememberDrawerState(DrawerValue.Closed)\n  val scope = rememberCoroutineScope()\n\n  ModalNavigationDrawer(\n    drawerState = drawerState,\n    drawerContent = {\n      ModalDrawerSheet(" + (v.materialBackState === "true" ? "\n        drawerState = drawerState" : "") + "\n      ) {\n        DrawerContent(onClose = { scope.launch { drawerState.close() } })\n      }\n    },\n    content = content\n  )\n}\n\n// Material SearchBar, ModalBottomSheet, and drawers support predictive back when their state is wired.";
    }
    if (v.rootBackIntercept === "true") {
      return "import androidx.activity.compose.BackHandler\nimport androidx.compose.runtime.Composable\n\n@Composable\nfun RootShell() {\n  // BUG: root-level interception can block Android's back-to-home preview.\n  BackHandler(enabled = true) {\n    exitProcess(0)\n  }\n\n  AppNavHost()\n}";
    }
    return "import androidx.compose.runtime.Composable\n\n@Composable\nfun RootShell() {\n  // Let the Activity, Navigation Compose, and Material surfaces receive back.\n  // Android 15+ shows default predictive back system animations automatically\n  // when the app uses supported back APIs instead of intercepting root back.\n  AppNavHost()\n}";
  }

  function pvAdvancedInput(pg, v, stage) {
    const mode = v.richInputMode || "DragSource";
    const lower = mode.toLowerCase();
    stage.classList.add("ainput-stage");
    stage.style.display = "grid";
    stage.style.placeItems = "center";
    stage.style.padding = "16px";
    const shell = h("div", "ainput-shell ainput-" + lower);
    const topLabel = {
      DragSource: v.globalDrag === "true" ? "global ClipData" : "local drag",
      DropTarget: v.externalDropPermission === "true" ? "permission gated" : "local only",
      Clipboard: v.sensitiveClipboard === "true" ? "sensitive flag" : "plain text",
      RichContent: v.richContentReceiver === "true" ? "contentReceiver" : "paste text only",
      Stylus: v.stylusCancel === "true" ? "cancel aware" : "commit only",
      DesktopInput: v.rightClickMenu === "true" ? "right-click" : "long-press",
    }[mode] || "input";
    shell.appendChild(h("div", "ainput-top", "<b>" + esc(mode) + "</b><span>" + esc(topLabel) + "</span>"));
    const body = h("div", "ainput-body");
    if (mode === "DragSource") {
      body.appendChild(h("div", "ainput-card source", "<i>url</i><b>Article preview</b><span>dragAndDropSource</span>"));
      body.appendChild(h("div", "ainput-arrow", "ClipData"));
      body.appendChild(h("div", "ainput-card ghost", "<i></i><b>Drag shadow</b><span>" + (v.globalDrag === "true" ? "View.DRAG_FLAG_GLOBAL" : "same app") + "</span>"));
    } else if (mode === "DropTarget") {
      body.appendChild(h("div", "ainput-drop" + (v.externalDropPermission === "true" ? " active" : ""), "<b>Drop zone</b><span>dragAndDropTarget</span>"));
      body.appendChild(h("div", "ainput-lifecycle", "<span>onStarted</span><span>onEntered</span><span>onDrop</span><span>onEnded</span>"));
    } else if (mode === "Clipboard") {
      body.appendChild(h("div", "ainput-clip", "<b>ClipboardManager</b><span>ClipEntry</span><em>" + (v.sensitiveClipboard === "true" ? "EXTRA_IS_SENSITIVE" : "one ClipData entry") + "</em>"));
      body.appendChild(h("div", "ainput-field", "<span>Paste into TextFieldState.edit</span><i></i>"));
    } else if (mode === "RichContent") {
      body.appendChild(h("div", "ainput-rich", "<b>contentReceiver</b><span>TransferableContent</span><em>MediaType.Image</em>"));
      body.appendChild(h("div", "ainput-media", "<i></i><i></i><i></i>"));
    } else if (mode === "Stylus") {
      body.appendChild(h("div", "ainput-canvas", "<svg viewBox=\"0 0 220 110\" aria-hidden=\"true\"><path d=\"M18 82 C58 18 92 118 130 54 S188 34 204 74\"/></svg><span>AXIS_PRESSURE + AXIS_TILT</span></div>"));
      body.appendChild(h("div", "ainput-stylus-flags", "<span>ACTION_MOVE</span><span>" + (v.stylusCancel === "true" ? "ACTION_CANCEL" : "no cancel") + "</span><span>" + (v.stylusCancel === "true" ? "FLAG_CANCELED" : "commit up") + "</span>"));
    } else {
      body.appendChild(h("div", "ainput-desktop", "<b>PointerEventType</b><span>" + (v.hoverFeedback === "true" ? "hoverable feedback" : "no hover cue") + "</span><em>" + (v.rightClickMenu === "true" ? "context click opens menu" : "touch long-press only") + "</em>"));
      body.appendChild(h("div", "ainput-menu", "<span>Open</span><span>Rename</span><span>Archive</span>"));
    }
    shell.appendChild(body);
    const chips = h("div", "ainput-chips");
    [
      v.globalDrag === "true" ? "global drag" : "local drag",
      v.rememberDropTarget === "true" ? "remembered target" : "inline target",
      v.externalDropPermission === "true" ? "drop permission" : "no permission",
      v.sensitiveClipboard === "true" ? "sensitive clip" : "plain clip",
      v.stylusCancel === "true" ? "cancel aware" : "commit only",
      v.hoverFeedback === "true" ? "hover feedback" : "touch only",
    ].forEach(function (label) { chips.appendChild(h("span", null, esc(label))); });
    shell.appendChild(chips);
    const note = {
      DragSource: "Drag sources package payloads as ClipData; use global flags only when dragging outside the app is intended.",
      DropTarget: "Drop targets should filter MIME types, remember callback objects, and request platform permissions for external payloads.",
      Clipboard: "Clipboard has one current ClipEntry. Mark copied passwords, tokens, and secrets as sensitive.",
      RichContent: "Rich content flows through contentReceiver so pasted or IME-inserted images can be consumed intentionally.",
      Stylus: "Stylus apps need MotionEvent axes and must undo or discard canceled strokes.",
      DesktopInput: "Large-screen users expect hover polish, right-click context actions, and drag/drop between app windows.",
    }[mode];
    shell.appendChild(h("div", "ainput-note", esc(note)));
    stage.appendChild(shell);
  }

  function genAdvancedInput(pg, v) {
    const mode = v.richInputMode || "DragSource";
    if (mode === "DragSource") {
      const flag = v.globalDrag === "true" ? ",\n      flags = View.DRAG_FLAG_GLOBAL" : "";
      const importFlag = v.globalDrag === "true" ? "\nimport android.view.View" : "";
      return "import android.content.ClipData" + importFlag + "\nimport androidx.compose.foundation.draganddrop.dragAndDropSource\nimport androidx.compose.foundation.layout.Row\nimport androidx.compose.foundation.layout.padding\nimport androidx.compose.material3.ListItem\nimport androidx.compose.material3.Text\nimport androidx.compose.runtime.Composable\nimport androidx.compose.ui.Modifier\nimport androidx.compose.ui.draganddrop.DragAndDropTransferData\nimport androidx.compose.ui.unit.dp\n\n@Composable\nfun ArticleDragSource(\n  article: ArticleUi,\n  modifier: Modifier = Modifier\n) {\n  ListItem(\n    headlineContent = { Text(article.title) },\n    supportingContent = { Text(article.url) },\n    modifier = modifier\n      .dragAndDropSource {\n        DragAndDropTransferData(\n          clipData = ClipData.newPlainText(\"article-url\", article.url)" + flag + "\n        )\n      }\n      .padding(8.dp)\n  )\n}\n\n// Global drag lets another app or window receive the ClipData; keep local drags local.";
    }
    if (mode === "DropTarget") {
      const targetStart = v.rememberDropTarget !== "false"
        ? "  val target = remember {\n    object : DragAndDropTarget {"
        : "  // BUG: do not allocate a new target object on every recomposition.\n  val target = object : DragAndDropTarget {";
      const targetEnd = v.rememberDropTarget !== "false" ? "\n    }\n  }" : "\n  }";
      const permissionStart = v.externalDropPermission === "true"
        ? "      val permission = activity.requestDragAndDropPermissions(\n        event.toAndroidDragEvent()\n      )\n      return try {\n        onDropped(readPlainText(event))\n        true\n      } finally {\n        permission?.release()\n      }"
        : "      onDropped(readPlainText(event))\n      return true";
      return "import android.app.Activity\nimport android.content.ClipDescription\nimport androidx.compose.foundation.draganddrop.dragAndDropTarget\nimport androidx.compose.foundation.layout.Box\nimport androidx.compose.foundation.layout.fillMaxSize\nimport androidx.compose.material3.Text\nimport androidx.compose.runtime.Composable\nimport androidx.compose.runtime.remember\nimport androidx.compose.ui.Modifier\nimport androidx.compose.ui.draganddrop.DragAndDropEvent\nimport androidx.compose.ui.draganddrop.DragAndDropTarget\nimport androidx.compose.ui.draganddrop.mimeTypes\nimport androidx.compose.ui.draganddrop.toAndroidDragEvent\n\n@Composable\nfun ArticleDropTarget(\n  activity: Activity,\n  onDropped: (String) -> Unit,\n  modifier: Modifier = Modifier\n) {\n" + targetStart + "\n      override fun onDrop(event: DragAndDropEvent): Boolean {\n" + permissionStart + "\n      }\n    " + targetEnd + "\n\n  Box(\n    modifier\n      .fillMaxSize()\n      .dragAndDropTarget(\n        shouldStartDragAndDrop = { event ->\n          event.mimeTypes().contains(ClipDescription.MIMETYPE_TEXT_PLAIN)\n        },\n        target = target\n      )\n  ) {\n    Text(\"Drop an article URL\")\n  }\n}";
    }
    if (mode === "Clipboard") {
      const sensitiveBlock = v.sensitiveClipboard === "true"
        ? "\n    clip.description.extras = PersistableBundle().apply {\n      putBoolean(ClipDescription.EXTRA_IS_SENSITIVE, true)\n    }"
        : "";
      const imports = v.sensitiveClipboard === "true" ? "\nimport android.content.ClipDescription\nimport android.os.PersistableBundle" : "";
      return "import android.content.ClipData" + imports + "\nimport androidx.compose.foundation.text.input.TextFieldState\nimport androidx.compose.material3.Button\nimport androidx.compose.material3.Text\nimport androidx.compose.runtime.Composable\nimport androidx.compose.ui.platform.ClipEntry\nimport androidx.compose.ui.platform.LocalClipboard\nimport androidx.compose.ui.platform.LocalClipboardManager\nimport androidx.compose.ui.text.AnnotatedString\n\n@Composable\nfun ClipboardActions(\n  displayName: String,\n  secret: String,\n  fieldState: TextFieldState\n) {\n  val legacyClipboard = LocalClipboardManager.current\n  val clipboard = LocalClipboard.current\n\n  Button(onClick = {\n    legacyClipboard.setText(AnnotatedString(displayName))\n\n    val clip = ClipData.newPlainText(\"account-secret\", secret)" + sensitiveBlock + "\n    clipboard.setClip(ClipEntry(clip))\n\n    clipboard.getClipEntry()?.clipData?.getItemAt(0)?.text?.let { pasted ->\n      fieldState.edit { append(pasted) }\n    }\n  }) {\n    Text(\"Copy account details\")\n  }\n}\n\n// Android 13+ shows system clipboard feedback, so avoid duplicating toasts.";
    }
    if (mode === "RichContent") {
      const receiver = v.richContentReceiver !== "false"
        ? "\n  val receiver = remember {\n    ReceiveContentListener { transferableContent: TransferableContent ->\n      if (transferableContent.hasMediaType(MediaType.Image)) {\n        onImagesDropped(transferableContent)\n        null\n      } else {\n        transferableContent\n      }\n    }\n  }"
        : "";
      const modifier = v.richContentReceiver !== "false"
        ? "\n      .contentReceiver(receiver)"
        : "";
      return "import androidx.compose.foundation.content.MediaType\nimport androidx.compose.foundation.content.ReceiveContentListener\nimport androidx.compose.foundation.content.TransferableContent\nimport androidx.compose.foundation.content.contentReceiver\nimport androidx.compose.foundation.content.hasMediaType\nimport androidx.compose.foundation.layout.Column\nimport androidx.compose.foundation.text.input.TextFieldState\nimport androidx.compose.material3.OutlinedTextField\nimport androidx.compose.material3.Text\nimport androidx.compose.runtime.Composable\nimport androidx.compose.runtime.remember\nimport androidx.compose.ui.Modifier\n\n@Composable\nfun RichMessageField(\n  state: TextFieldState,\n  onImagesDropped: (TransferableContent) -> Unit,\n  modifier: Modifier = Modifier\n) {" + receiver + "\n\n  Column(modifier) {\n    OutlinedTextField(\n      state = state,\n      label = { Text(\"Message\") },\n      modifier = Modifier" + modifier + "\n    )\n    Text(\"Accepts typed text, pasted images, dragged content, and IME media.\")\n  }\n}";
    }
    if (mode === "Stylus") {
      const cancelBlock = v.stylusCancel === "true"
        ? "\n      MotionEvent.ACTION_CANCEL -> {\n        strokeStore.cancel(pointerId)\n        true\n      }\n      MotionEvent.ACTION_UP -> {\n        if ((event.flags and MotionEvent.FLAG_CANCELED) != 0) {\n          strokeStore.cancel(pointerId)\n        } else {\n          strokeStore.commit(pointerId)\n        }\n        true\n      }"
        : "\n      MotionEvent.ACTION_UP -> {\n        strokeStore.commit(pointerId)\n        true\n      }";
      return "import android.view.MotionEvent\nimport androidx.compose.foundation.Canvas\nimport androidx.compose.foundation.layout.fillMaxSize\nimport androidx.compose.runtime.Composable\nimport androidx.compose.ui.Modifier\nimport androidx.compose.ui.input.pointer.pointerInteropFilter\n\n@Composable\nfun StylusInkCanvas(\n  strokeStore: StrokeStore,\n  modifier: Modifier = Modifier\n) {\n  Canvas(\n    modifier\n      .fillMaxSize()\n      .pointerInteropFilter { event: MotionEvent ->\n        val pointerId = event.getPointerId(event.actionIndex)\n        val toolType = event.getToolType(event.actionIndex)\n        if (toolType != MotionEvent.TOOL_TYPE_STYLUS &&\n          toolType != MotionEvent.TOOL_TYPE_ERASER\n        ) {\n          return@pointerInteropFilter false\n        }\n\n        when (event.actionMasked) {\n          MotionEvent.ACTION_DOWN,\n          MotionEvent.ACTION_MOVE -> {\n            strokeStore.update(\n              pointerId = pointerId,\n              x = event.getAxisValue(MotionEvent.AXIS_X),\n              y = event.getAxisValue(MotionEvent.AXIS_Y),\n              pressure = event.getAxisValue(MotionEvent.AXIS_PRESSURE),\n              tilt = event.getAxisValue(MotionEvent.AXIS_TILT),\n              orientation = event.getAxisValue(MotionEvent.AXIS_ORIENTATION)\n            )\n            true\n          }" + cancelBlock + "\n          else -> false\n        }\n      }\n  ) {\n    strokeStore.drawInto(this)\n  }\n}";
    }
    const hover = v.hoverFeedback === "true"
      ? "\n      .hoverable(interactionSource)"
      : "";
    const rightClick = v.rightClickMenu === "true"
      ? "\n      .pointerInput(Unit) {\n        awaitPointerEventScope {\n          while (true) {\n            val event = awaitPointerEvent()\n            if (event.type == PointerEventType.Press && event.buttons.isSecondaryPressed) {\n              onOpenContextMenu()\n            }\n          }\n        }\n      }"
      : "";
    return "import androidx.compose.foundation.ExperimentalFoundationApi\nimport androidx.compose.foundation.combinedClickable\nimport androidx.compose.foundation.hoverable\nimport androidx.compose.foundation.interaction.MutableInteractionSource\nimport androidx.compose.foundation.layout.Row\nimport androidx.compose.foundation.layout.fillMaxWidth\nimport androidx.compose.foundation.layout.padding\nimport androidx.compose.material3.Text\nimport androidx.compose.runtime.Composable\nimport androidx.compose.runtime.remember\nimport androidx.compose.ui.Modifier\nimport androidx.compose.ui.input.pointer.PointerEventType\nimport androidx.compose.ui.input.pointer.isSecondaryPressed\nimport androidx.compose.ui.input.pointer.pointerInput\nimport androidx.compose.ui.unit.dp\n\n@OptIn(ExperimentalFoundationApi::class)\n@Composable\nfun DesktopReadyRow(\n  item: FileItem,\n  onOpen: () -> Unit,\n  onOpenContextMenu: () -> Unit,\n  modifier: Modifier = Modifier\n) {\n  val interactionSource = remember { MutableInteractionSource() }\n\n  Row(\n    modifier\n      .fillMaxWidth()\n      .combinedClickable(\n        interactionSource = interactionSource,\n        indication = null,\n        onClick = onOpen,\n        onLongClickLabel = \"Open context menu\",\n        onLongClick = onOpenContextMenu\n      )" + hover + rightClick + "\n      .padding(16.dp)\n  ) {\n    Text(item.name)\n  }\n}\n\n// Context menus should be reachable by touch long-press and by mouse or touchpad right-click.";
  }

  function pvActivityResults(pg, v, stage) {
    const mode = v.activityResultMode || "GetContent";
    const lower = mode.toLowerCase();
    stage.classList.add("actres-stage");
    stage.style.display = "grid";
    stage.style.placeItems = "center";
    stage.style.padding = "16px";
    const headline = {
      GetContent: v.unconditionalLauncher === "true" && v.launchFromEvent === "true" ? "event launch" : "registration trap",
      PhotoPicker: v.photoPickerContract === "true" ? "privacy picker" : "broad media permission",
      OpenDocument: v.persistUriPermission === "true" ? "persisted URI" : "session URI",
      Permission: v.permissionRationale === "true" && v.permissionGracefulDeny === "true" ? "rationale + denial state" : "permission trap",
      Notifications: v.notificationApiGate === "true" ? "API gated" : "ungated request",
      AntiPattern: "review traps",
    }[mode] || "system result";
    const shell = h("div", "actres-shell actres-" + lower);
    shell.appendChild(h("div", "actres-top", "<b>" + esc(mode) + "</b><span>" + esc(headline) + "</span>"));
    const body = h("div", "actres-body");
    if (mode === "GetContent") {
      body.appendChild(h("section", v.unconditionalLauncher === "true" ? "good" : "warn", "<b>Register</b><span>rememberLauncherForActivityResult</span>"));
      body.appendChild(h("section", v.launchFromEvent === "true" ? "good" : "warn", "<b>Launch</b><span>" + (v.launchFromEvent === "true" ? "Button onClick" : "composition effect") + "</span>"));
      body.appendChild(h("section", "good", "<b>Result</b><span>Uri? as state</span>"));
    } else if (mode === "PhotoPicker") {
      body.appendChild(h("div", v.photoPickerContract === "true" ? "actres-picker good" : "actres-picker warn", "<i></i><b>" + (v.photoPickerContract === "true" ? "PickVisualMedia" : "READ_MEDIA_IMAGES") + "</b><span>user-selected media</span>"));
    } else if (mode === "OpenDocument") {
      body.appendChild(h("div", v.persistUriPermission === "true" ? "actres-document good" : "actres-document warn", "<b>OpenDocument</b><span>" + (v.persistUriPermission === "true" ? "takePersistableUriPermission" : "store Uri only") + "</span><i></i>"));
    } else if (mode === "Permission") {
      body.appendChild(h("div", v.permissionRationale === "true" ? "actres-permission good" : "actres-permission warn", "<b>Rationale</b><span>" + (v.permissionRationale === "true" ? "explain before prompt" : "prompt without context") + "</span>"));
      body.appendChild(h("div", v.permissionGracefulDeny === "true" ? "actres-permission good" : "actres-permission warn", "<b>Denied</b><span>" + (v.permissionGracefulDeny === "true" ? "render fallback UI" : "crash or loop") + "</span>"));
    } else if (mode === "Notifications") {
      body.appendChild(h("div", v.notificationApiGate === "true" ? "actres-notify good" : "actres-notify warn", "<b>POST_NOTIFICATIONS</b><span>" + (v.notificationApiGate === "true" ? "Android 13+ only" : "all APIs") + "</span>"));
    } else {
      const traps = ["conditional register", "launch in effect", "manual unregister", "broad media permission"];
      const grid = h("div", "actres-traps");
      traps.forEach(function (trap) { grid.appendChild(h("span", null, esc(trap))); });
      body.appendChild(grid);
    }
    shell.appendChild(body);
    const chips = h("div", "actres-chips");
    [
      v.unconditionalLauncher === "true" ? "unconditional registration" : "conditional registration",
      v.launchFromEvent === "true" ? "event launch" : "composition launch",
      v.photoPickerContract === "true" ? "photo picker" : "media permission",
      v.persistUriPermission === "true" ? "persist Uri" : "session Uri",
      v.permissionGracefulDeny === "true" ? "denial UI" : "permission crash",
    ].forEach(function (chip) { chips.appendChild(h("span", null, esc(chip))); });
    shell.appendChild(chips);
    stage.appendChild(shell);
  }

  function genActivityResults(pg, v) {
    const mode = v.activityResultMode || "GetContent";
    if (mode === "GetContent") {
      if (v.unconditionalLauncher !== "true") {
        return "import androidx.activity.compose.rememberLauncherForActivityResult\nimport androidx.activity.result.contract.ActivityResultContracts\nimport androidx.compose.runtime.Composable\n\n@Composable\nfun ConditionalPicker(enabled: Boolean) {\n  if (enabled) {\n    // BUG: Activity Result launchers must be registered unconditionally at a stable call site.\n    val launcher = rememberLauncherForActivityResult(ActivityResultContracts.GetContent()) { uri ->\n      println(uri)\n    }\n  }\n}";
      }
      if (v.launchFromEvent !== "true") {
        return "import androidx.activity.compose.rememberLauncherForActivityResult\nimport androidx.activity.result.contract.ActivityResultContracts\nimport androidx.compose.runtime.Composable\nimport androidx.compose.runtime.LaunchedEffect\n\n@Composable\nfun AutoLaunchingPicker() {\n  val launcher = rememberLauncherForActivityResult(ActivityResultContracts.GetContent()) { uri ->\n    println(uri)\n  }\n\n  // BUG: this relaunches from composition instead of a user or business event.\n  LaunchedEffect(Unit) {\n    launcher.launch(\"image/*\")\n  }\n}";
      }
      return "import android.net.Uri\nimport androidx.activity.compose.rememberLauncherForActivityResult\nimport androidx.activity.result.contract.ActivityResultContracts\nimport androidx.compose.material3.Button\nimport androidx.compose.material3.Text\nimport androidx.compose.runtime.Composable\nimport androidx.compose.ui.Modifier\n\n@Composable\nfun ImagePickerButton(\n  onImagePicked: (Uri) -> Unit,\n  modifier: Modifier = Modifier\n) {\n  val launcher = rememberLauncherForActivityResult(\n    contract = ActivityResultContracts.GetContent(),\n    onResult = { uri -> uri?.let(onImagePicked) }\n  )\n\n  Button(\n    modifier = modifier,\n    onClick = { launcher.launch(\"image/*\") }\n  ) {\n    Text(\"Choose image\")\n  }\n}\n\n// Register at composition time; launch from click, callback, or another explicit event.";
    }
    if (mode === "PhotoPicker") {
      if (v.photoPickerContract !== "true") {
        return "import android.Manifest\nimport androidx.activity.compose.rememberLauncherForActivityResult\nimport androidx.activity.result.contract.ActivityResultContracts\nimport androidx.compose.material3.Button\nimport androidx.compose.material3.Text\nimport androidx.compose.runtime.Composable\n\n@Composable\nfun GalleryPermissionPicker() {\n  val permission = rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->\n    println(granted)\n  }\n\n  Button(onClick = { permission.launch(Manifest.permission.READ_MEDIA_IMAGES) }) {\n    Text(\"Pick photo\")\n  }\n}\n\n// BUG: for user-selected images or videos, prefer the Photo Picker instead of broad media permission.";
      }
      return "import android.net.Uri\nimport androidx.activity.compose.rememberLauncherForActivityResult\nimport androidx.activity.result.PickVisualMediaRequest\nimport androidx.activity.result.contract.ActivityResultContracts\nimport androidx.activity.result.contract.ActivityResultContracts.PickVisualMedia\nimport androidx.compose.material3.Button\nimport androidx.compose.material3.Text\nimport androidx.compose.runtime.Composable\n\n@Composable\nfun AvatarPhotoPicker(onPhotoPicked: (Uri) -> Unit) {\n  val picker = rememberLauncherForActivityResult(\n    contract = ActivityResultContracts.PickVisualMedia(),\n    onResult = { uri -> uri?.let(onPhotoPicked) }\n  )\n\n  Button(\n    onClick = {\n      picker.launch(PickVisualMediaRequest(PickVisualMedia.ImageOnly))\n    }\n  ) {\n    Text(\"Choose avatar\")\n  }\n}\n\n// The system Photo Picker lets users choose media without granting broad library access.";
    }
    if (mode === "OpenDocument") {
      if (v.persistUriPermission !== "true") {
        return "import android.net.Uri\nimport androidx.activity.compose.rememberLauncherForActivityResult\nimport androidx.activity.result.contract.ActivityResultContracts\nimport androidx.compose.runtime.Composable\n\n@Composable\nfun ImportDocument(onDocumentReady: (Uri) -> Unit) {\n  val openDocument = rememberLauncherForActivityResult(ActivityResultContracts.OpenDocument()) { uri ->\n    uri?.let(onDocumentReady)\n    // BUG: storing this Uri for later without takePersistableUriPermission can lose access.\n  }\n}";
      }
      return "import android.content.Intent\nimport android.net.Uri\nimport androidx.activity.compose.rememberLauncherForActivityResult\nimport androidx.activity.result.contract.ActivityResultContracts\nimport androidx.compose.material3.Button\nimport androidx.compose.material3.Text\nimport androidx.compose.runtime.Composable\nimport androidx.compose.ui.platform.LocalContext\n\n@Composable\nfun ImportDocumentButton(onDocumentReady: (Uri) -> Unit) {\n  val context = LocalContext.current\n  val openDocument = rememberLauncherForActivityResult(\n    contract = ActivityResultContracts.OpenDocument(),\n    onResult = { uri ->\n      if (uri != null) {\n        context.contentResolver.takePersistableUriPermission(\n          uri,\n          Intent.FLAG_GRANT_READ_URI_PERMISSION\n        )\n        onDocumentReady(uri)\n      }\n    }\n  )\n\n  Button(onClick = { openDocument.launch(arrayOf(\"application/pdf\")) }) {\n    Text(\"Import PDF\")\n  }\n}";
    }
    if (mode === "Permission") {
      if (v.permissionGracefulDeny !== "true") {
        return "import androidx.activity.compose.rememberLauncherForActivityResult\nimport androidx.activity.result.contract.ActivityResultContracts\nimport androidx.compose.runtime.Composable\n\n@Composable\nfun CameraPermissionTrap() {\n  val request = rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->\n    if (!granted) error(\"Camera is required\") // BUG: denial is a normal user choice.\n  }\n}";
      }
      const rationale = v.permissionRationale === "true"
        ? "\n  val shouldExplain = ActivityCompat.shouldShowRequestPermissionRationale(\n    activity,\n    Manifest.permission.CAMERA\n  )"
        : "\n  val shouldExplain = false // BUG: no rationale path for users who need context.";
      return "import android.Manifest\nimport android.content.pm.PackageManager\nimport androidx.activity.ComponentActivity\nimport androidx.activity.compose.rememberLauncherForActivityResult\nimport androidx.activity.result.contract.ActivityResultContracts\nimport androidx.compose.material3.Button\nimport androidx.compose.material3.Text\nimport androidx.compose.runtime.Composable\nimport androidx.compose.runtime.getValue\nimport androidx.compose.runtime.mutableStateOf\nimport androidx.compose.runtime.remember\nimport androidx.compose.runtime.setValue\nimport androidx.compose.ui.platform.LocalContext\nimport androidx.core.app.ActivityCompat\nimport androidx.core.content.ContextCompat\n\n@Composable\nfun CameraPermissionButton(activity: ComponentActivity) {\n  val context = LocalContext.current\n  var denied by remember { mutableStateOf(false) }\n" + rationale + "\n  val request = rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->\n    denied = !granted\n  }\n\n  val hasCamera = ContextCompat.checkSelfPermission(\n    context,\n    Manifest.permission.CAMERA\n  ) == PackageManager.PERMISSION_GRANTED\n\n  Button(onClick = {\n    if (!hasCamera) request.launch(Manifest.permission.CAMERA)\n  }) {\n    Text(if (hasCamera) \"Camera enabled\" else \"Enable camera\")\n  }\n\n  if (shouldExplain) Text(\"Camera access lets you scan receipts.\")\n  if (denied) Text(\"You can continue without scanning or enable it in Settings.\")\n}";
    }
    if (mode === "Notifications") {
      if (v.notificationApiGate !== "true") {
        return "import android.Manifest\nimport androidx.activity.compose.rememberLauncherForActivityResult\nimport androidx.activity.result.contract.ActivityResultContracts\nimport androidx.compose.material3.Button\nimport androidx.compose.material3.Text\nimport androidx.compose.runtime.Composable\n\n@Composable\nfun UngatedNotifications() {\n  val request = rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { }\n\n  Button(onClick = { request.launch(Manifest.permission.POST_NOTIFICATIONS) }) {\n    Text(\"Enable notifications\")\n  }\n}\n\n// BUG: POST_NOTIFICATIONS exists for Android 13+, so gate the request by SDK level.";
      }
      return "import android.Manifest\nimport android.os.Build\nimport androidx.activity.compose.rememberLauncherForActivityResult\nimport androidx.activity.result.contract.ActivityResultContracts\nimport androidx.compose.material3.Button\nimport androidx.compose.material3.Text\nimport androidx.compose.runtime.Composable\nimport androidx.compose.ui.platform.LocalContext\nimport androidx.core.app.NotificationManagerCompat\n\n@Composable\nfun NotificationOptInButton() {\n  val context = LocalContext.current\n  val request = rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->\n    println(\"notifications granted = $granted\")\n  }\n  val enabled = NotificationManagerCompat.from(context).areNotificationsEnabled()\n\n  Button(onClick = {\n    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU && !enabled) {\n      request.launch(Manifest.permission.POST_NOTIFICATIONS)\n    }\n  }) {\n    Text(if (enabled) \"Notifications on\" else \"Enable notifications\")\n  }\n}";
    }
    return "import android.Manifest\nimport androidx.activity.compose.rememberLauncherForActivityResult\nimport androidx.activity.result.contract.ActivityResultContracts\nimport androidx.compose.runtime.Composable\nimport androidx.compose.runtime.LaunchedEffect\n\n@Composable\nfun ActivityResultAntiPattern(enabled: Boolean) {\n  if (enabled) {\n    val launcher = rememberLauncherForActivityResult(ActivityResultContracts.GetContent()) { }\n    launcher.unregister() // BUG: Compose manages this launcher.\n    LaunchedEffect(Unit) { launcher.launch(\"image/*\") } // BUG: launch from an event instead.\n  }\n\n  val mediaPermission = rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { }\n  mediaPermission.launch(Manifest.permission.READ_MEDIA_IMAGES) // BUG: prefer Photo Picker for user-selected media.\n}";
  }

  function pvStateHolderArchitecture(pg, v, stage) {
    const mode = v.stateHolderMode || "RouteBoundary";
    const lower = mode.toLowerCase();
    stage.classList.add("statearch-stage");
    stage.style.display = "grid";
    stage.style.placeItems = "center";
    stage.style.padding = "16px";
    const shell = h("div", "statearch-shell statearch-" + lower);
    const status = {
      RouteBoundary: v.contentStateless === "true" ? "state down" : "screen owns ViewModel",
      HiltViewModel: v.hiltInjection === "true" && v.repositoryInjected === "true" ? "injected holder" : "manual dependency",
      SavedState: v.savedStateHandle === "true" ? "minimal restore key" : "saved blob",
      Factory: v.creationExtrasFactory === "true" ? "CreationExtras" : "remembered ViewModel",
      LifecycleCollect: v.lifecycleCollection === "true" ? "lifecycle-aware Flow" : "manual collection",
      AntiPattern: "review traps",
    }[mode] || "state holder";
    shell.appendChild(h("div", "statearch-top", "<b>" + esc(mode) + "</b><span>" + esc(status) + "</span>"));
    const body = h("div", "statearch-body");
    if (mode === "AntiPattern") {
      const traps = ["hiltViewModel in leaf", "Repository() in UI", "collectAsState", "SavedState blob"];
      const grid = h("div", "statearch-traps");
      traps.forEach(function (trap) { grid.appendChild(h("span", null, esc(trap))); });
      body.appendChild(grid);
    } else {
      const lanes = [
        ["route", mode === "HiltViewModel" ? "Destination" : "Route", mode === "LifecycleCollect" ? (v.lifecycleCollection === "true" ? "collectAsStateWithLifecycle" : "repeatOnLifecycle") : (v.contentStateless === "true" ? "state + events" : "passes ViewModel")],
        ["holder", mode === "Factory" ? "Factory" : mode === "SavedState" ? "SavedStateHandle" : (v.hiltInjection === "true" ? "@HiltViewModel" : "ViewModel"), mode === "Factory" ? (v.creationExtrasFactory === "true" ? "CreationExtras" : "remember") : mode === "SavedState" ? (v.savedStateHandle === "true" ? "query key" : "whole state") : (v.whileSubscribedFlow === "true" ? "stateIn WhileSubscribed" : "raw Flow")],
        ["data", "Data layer", v.repositoryInjected === "true" ? "injected repository" : "constructed in UI"],
      ];
      const flow = h("div", "statearch-flow");
      lanes.forEach(function (lane, idx) {
        const good = (idx === 0 && (v.contentStateless === "true" || mode !== "RouteBoundary")) ||
          (idx === 1 && (v.savedStateHandle === "true" || mode !== "SavedState") && (v.creationExtrasFactory === "true" || mode !== "Factory")) ||
          (idx === 2 && v.repositoryInjected === "true");
        flow.appendChild(h("section", good ? "good" : "warn", "<i>" + esc(lane[0]) + "</i><b>" + esc(lane[1]) + "</b><span>" + esc(lane[2]) + "</span>"));
      });
      body.appendChild(flow);
    }
    shell.appendChild(body);
    const chips = h("div", "statearch-chips");
    [
      v.lifecycleCollection === "true" ? "lifecycle collect" : "manual collect",
      v.hiltInjection === "true" ? "Hilt factory" : "manual factory",
      v.savedStateHandle === "true" ? "minimal saved key" : "saved blob",
      v.whileSubscribedFlow === "true" ? "WhileSubscribed" : "eager upstream",
      v.contentStateless === "true" ? "stateless content" : "ViewModel child",
    ].forEach(function (chip) { chips.appendChild(h("span", null, esc(chip))); });
    shell.appendChild(chips);
    stage.appendChild(shell);
  }

  function genStateHolderArchitecture(pg, v) {
    const mode = v.stateHolderMode || "RouteBoundary";
    if (mode === "RouteBoundary") {
      if (v.contentStateless !== "true") {
        return "import androidx.compose.runtime.Composable\nimport androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel\n\n@Composable\nfun SearchScreen(\n  viewModel: SearchViewModel = hiltViewModel()\n) {\n  // BUG: reusable screen content now owns a screen-scoped dependency.\n  SearchResults(\n    query = viewModel.query,\n    onQueryChange = viewModel::onQueryChange\n  )\n}\n\n// Prefer SearchRoute owning the ViewModel and SearchScreen receiving state + events.";
      }
      const collector = v.lifecycleCollection === "true" ? "collectAsStateWithLifecycle" : "collectAsState";
      const importCollector = v.lifecycleCollection === "true" ? "androidx.lifecycle.compose.collectAsStateWithLifecycle" : "androidx.compose.runtime.collectAsState";
      const vmProvider = v.hiltInjection === "true" ? "hiltViewModel()" : "viewModel()";
      const vmImport = v.hiltInjection === "true" ? "androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel" : "androidx.lifecycle.viewmodel.compose.viewModel";
      return "import androidx.compose.runtime.Composable\nimport androidx.compose.runtime.getValue\nimport " + importCollector + "\nimport " + vmImport + "\n\n@Composable\nfun SearchRoute(\n  viewModel: SearchViewModel = " + vmProvider + ",\n  onResultClick: (String) -> Unit\n) {\n  val uiState by viewModel.uiState." + collector + "()\n\n  SearchScreen(\n    uiState = uiState,\n    onQueryChange = viewModel::onQueryChange,\n    onResultClick = onResultClick\n  )\n}\n\n@Composable\nfun SearchScreen(\n  uiState: SearchUiState,\n  onQueryChange: (String) -> Unit,\n  onResultClick: (String) -> Unit\n) {\n  SearchContent(\n    query = uiState.query,\n    results = uiState.results,\n    onQueryChange = onQueryChange,\n    onResultClick = onResultClick\n  )\n}";
    }
    if (mode === "HiltViewModel") {
      if (v.hiltInjection !== "true" || v.repositoryInjected !== "true") {
        return "import androidx.compose.runtime.Composable\nimport androidx.compose.runtime.remember\n\n@Composable\nfun SearchRoute() {\n  // BUG: UI constructs app dependencies and a state holder manually.\n  val repository = remember { SearchRepository(Retrofit.Builder().build()) }\n  val viewModel = remember { SearchViewModel(repository) }\n\n  SearchScreen(viewModel = viewModel)\n}";
      }
      return "import androidx.compose.runtime.Composable\nimport androidx.compose.runtime.getValue\nimport androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel\nimport androidx.lifecycle.SavedStateHandle\nimport androidx.lifecycle.ViewModel\nimport androidx.lifecycle.compose.collectAsStateWithLifecycle\nimport dagger.hilt.android.lifecycle.HiltViewModel\nimport javax.inject.Inject\n\n@HiltViewModel\nclass SearchViewModel @Inject constructor(\n  savedStateHandle: SavedStateHandle,\n  private val repository: SearchRepository\n) : ViewModel() {\n  val uiState = repository.searchResults(\n    query = savedStateHandle.getStateFlow(\"query\", \"\")\n  )\n\n  fun onQueryChange(query: String) {\n    savedStateHandle[\"query\"] = query\n  }\n}\n\n@Composable\nfun SearchRoute(viewModel: SearchViewModel = hiltViewModel()) {\n  val uiState by viewModel.uiState.collectAsStateWithLifecycle()\n  SearchScreen(uiState = uiState, onQueryChange = viewModel::onQueryChange)\n}";
    }
    if (mode === "SavedState") {
      if (v.savedStateHandle !== "true") {
        return "import androidx.lifecycle.SavedStateHandle\nimport androidx.lifecycle.ViewModel\n\nclass SearchViewModel(\n  private val savedStateHandle: SavedStateHandle\n) : ViewModel() {\n  fun cacheWholeScreen(uiState: SearchUiState) {\n    // BUG: saved state is not a database or screen cache.\n    savedStateHandle[\"results\"] = uiState.results\n    savedStateHandle[\"profile\"] = uiState.selectedProfile\n  }\n}";
      }
      const sharing = v.whileSubscribedFlow === "true" ? "SharingStarted.WhileSubscribed(5_000)" : "SharingStarted.Eagerly // usually wastes work for UI state";
      return "import androidx.lifecycle.SavedStateHandle\nimport androidx.lifecycle.ViewModel\nimport androidx.lifecycle.viewModelScope\nimport kotlinx.coroutines.flow.SharingStarted\nimport kotlinx.coroutines.flow.flatMapLatest\nimport kotlinx.coroutines.flow.map\nimport kotlinx.coroutines.flow.stateIn\n\nclass SearchViewModel(\n  private val savedStateHandle: SavedStateHandle,\n  private val repository: SearchRepository\n) : ViewModel() {\n  private val query = savedStateHandle.getStateFlow(\"query\", \"\")\n\n  val uiState = query\n    .flatMapLatest { q -> repository.search(q) }\n    .map { results -> SearchUiState(query = query.value, results = results) }\n    .stateIn(\n      scope = viewModelScope,\n      started = " + sharing + ",\n      initialValue = SearchUiState()\n    )\n\n  fun onQueryChange(value: String) {\n    savedStateHandle[\"query\"] = value\n  }\n}\n\n// Save minimal keys. Rebuild loaded data from repository after recreation.";
    }
    if (mode === "Factory") {
      if (v.creationExtrasFactory !== "true") {
        return "import androidx.compose.runtime.Composable\nimport androidx.compose.runtime.remember\n\n@Composable\nfun ReportRoute(repository: ReportRepository) {\n  // BUG: remember is not a ViewModelStore and will not handle owners or saved state.\n  val viewModel = remember { ReportViewModel(repository) }\n  ReportScreen(viewModel)\n}";
      }
      return "import android.app.Application\nimport androidx.lifecycle.SavedStateHandle\nimport androidx.lifecycle.ViewModel\nimport androidx.lifecycle.ViewModelProvider\nimport androidx.lifecycle.viewmodel.CreationExtras\nimport androidx.lifecycle.viewmodel.MutableCreationExtras\nimport androidx.lifecycle.viewmodel.createSavedStateHandle\nimport androidx.lifecycle.viewmodel.initializer\nimport androidx.lifecycle.viewmodel.viewModelFactory\nimport androidx.lifecycle.viewmodel.compose.viewModel\n\nclass ReportViewModel(\n  private val repository: ReportRepository,\n  private val savedStateHandle: SavedStateHandle\n) : ViewModel() {\n  val reportId: String = savedStateHandle[\"reportId\"] ?: error(\"Missing reportId\")\n\n  companion object {\n    val Factory: ViewModelProvider.Factory = viewModelFactory {\n      initializer {\n        val app = this[ViewModelProvider.AndroidViewModelFactory.APPLICATION_KEY] as Application\n        ReportViewModel(\n          repository = app.container.reportRepository,\n          savedStateHandle = createSavedStateHandle()\n        )\n      }\n    }\n  }\n}\n\n@Composable\nfun ReportRoute(reportId: String) {\n  val extras = MutableCreationExtras().apply {\n    set(ViewModelProvider.NewInstanceFactory.VIEW_MODEL_KEY, \"report-$reportId\")\n  }\n  val viewModel: ReportViewModel = viewModel(factory = ReportViewModel.Factory, extras = extras)\n  ReportScreen(viewModel)\n}";
    }
    if (mode === "LifecycleCollect") {
      if (v.lifecycleCollection !== "true") {
        return "import androidx.compose.runtime.Composable\nimport androidx.compose.runtime.LaunchedEffect\nimport androidx.lifecycle.repeatOnLifecycle\n\n@Composable\nfun SearchRoute(viewModel: SearchViewModel) {\n  var state by remember { mutableStateOf(SearchUiState()) }\n\n  // BUG: do not hand-roll lifecycle collection for UI state in Compose.\n  LaunchedEffect(viewModel) {\n    lifecycle.repeatOnLifecycle(Lifecycle.State.STARTED) {\n      viewModel.uiState.collect { state = it }\n    }\n  }\n\n  SearchScreen(state)\n}";
      }
      return "import androidx.compose.runtime.Composable\nimport androidx.compose.runtime.getValue\nimport androidx.lifecycle.compose.collectAsStateWithLifecycle\n\n@Composable\nfun SearchRoute(viewModel: SearchViewModel) {\n  val uiState by viewModel.uiState.collectAsStateWithLifecycle()\n\n  SearchScreen(\n    uiState = uiState,\n    onQueryChange = viewModel::onQueryChange\n  )\n}\n\n// collectAsStateWithLifecycle pauses Flow collection while the UI is stopped.";
    }
    return "import androidx.compose.runtime.Composable\nimport androidx.compose.runtime.CompositionLocalProvider\nimport androidx.compose.runtime.compositionLocalOf\nimport androidx.compose.runtime.collectAsState\nimport androidx.compose.runtime.remember\nimport androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel\n\nval LocalSearchRepository = compositionLocalOf<SearchRepository> {\n  error(\"No repository\")\n}\n\n@Composable\nfun SearchCard() {\n  val repository = LocalSearchRepository.current\n  val viewModel: SearchViewModel = hiltViewModel() // BUG: leaf content owns screen scope.\n  val state by viewModel.uiState.collectAsState() // BUG: Android UI should use lifecycle collection.\n\n  SearchResultList(state.results)\n}\n\n@Composable\nfun SearchRoute() {\n  val repository = remember { SearchRepository() } // BUG: construct dependencies outside UI.\n  CompositionLocalProvider(LocalSearchRepository provides repository) {\n    SearchCard()\n  }\n}";
  }

  function pvSemanticsContract(pg, v, stage) {
    const mode = v.semanticsContract || "MergedRow";
    const progress = Math.max(0, Math.min(100, Math.round(num(v.progressValue, 65))));
    stage.classList.add("sem-stage");
    stage.style.display = "grid";
    stage.style.placeItems = "center";
    stage.style.padding = "16px";
    const shell = h("div", "sem-shell");
    shell.appendChild(h("div", "sem-top", "<b>" + esc(mode) + "</b><span>" + (v.accessibilityChecks === "true" ? "checks on" : "inspect tree") + "</span>"));
    const body = h("div", "sem-body sem-" + mode.toLowerCase());
    if (mode === "CustomActions") {
      body.appendChild(h("div", "sem-row merged", "<i>AR</i><b>Article row</b><span>Swipe actions moved into accessibility menu</span>"));
      const actions = h("div", "sem-actions");
      ["Open", "Bookmark", "Dismiss"].forEach(function (label) { actions.appendChild(h("span", null, esc(label))); });
      body.appendChild(actions);
    } else if (mode === "LiveRegion") {
      body.appendChild(h("div", "sem-pane", "<b>Filters updated</b><span>" + (v.liveRegion === "true" ? "liveRegion = Polite" : "status text only") + "</span>"));
      body.appendChild(h("div", "sem-sheet", "<b>Sort options</b><span>" + (v.traversalGroup === "true" ? "paneTitle announced" : "new pane needs title") + "</span>"));
    } else if (mode === "TraversalGroup") {
      const grid = h("div", "sem-grid");
      [["1", "Account"], ["2", "Security"], ["3", "Billing"], ["4", "Team"]].forEach(function (item) {
        grid.appendChild(h("span", null, "<b>" + item[0] + "</b>" + esc(item[1])));
      });
      body.appendChild(grid);
      body.appendChild(h("div", "sem-note", v.traversalGroup === "true" ? "isTraversalGroup + traversalIndex" : "default bounds order"));
    } else if (mode === "ErrorProgress") {
      body.appendChild(h("label", "sem-field", "<span>Email</span><b>Fields cannot be empty</b>"));
      const bar = h("div", "sem-progress");
      bar.appendChild(h("i"));
      bar.querySelector("i").style.width = progress + "%";
      body.appendChild(bar);
      body.appendChild(h("div", "sem-note", "progressBarRangeInfo: " + progress + "%"));
    } else {
      body.appendChild(h("div", "sem-row" + (v.mergeSemantics === "true" ? " merged" : ""), "<i>AL</i><b>Ada Lovelace</b><span>Online · 4 unread</span><em>Open profile</em>"));
      body.appendChild(h("div", "sem-note", v.clearSemantics === "true" ? "clearAndSetSemantics replaces children" : v.mergeSemantics === "true" ? "mergeDescendants exposes one row" : "children remain separate stops"));
    }
    const chips = h("div", "sem-chips");
    [
      v.mergeSemantics === "true" ? "merge" : "separate",
      v.clearSemantics === "true" ? "clear + replace" : "preserve children",
      v.customA11yActions === "true" ? "custom actions" : "primary action",
      v.liveRegion === "true" ? "live region" : "quiet update",
    ].forEach(function (label) { chips.appendChild(h("span", null, esc(label))); });
    body.appendChild(chips);
    shell.appendChild(body);
    stage.appendChild(shell);
  }

  function genSemanticsContract(pg, v) {
    const mode = v.semanticsContract || "MergedRow";
    const progress = (Math.max(0, Math.min(100, Math.round(num(v.progressValue, 65)))) / 100).toFixed(2).replace(/0+$/, "").replace(/\.$/, "") + "f";
    if (mode === "CustomActions") {
      return "@Composable\nfun ArticleRowWithActions(\n  article: ArticleUi,\n  onOpen: () -> Unit,\n  onBookmark: () -> Unit,\n  onDismiss: () -> Unit,\n  modifier: Modifier = Modifier\n) {\n  Row(\n    modifier = modifier\n      .fillMaxWidth()\n      .clickable(onClickLabel = \"Open article\", onClick = onOpen)\n      .semantics {\n        customActions = listOf(\n          CustomAccessibilityAction(label = \"Bookmark\") {\n            onBookmark(); true\n          },\n          CustomAccessibilityAction(label = \"Dismiss\") {\n            onDismiss(); true\n          }\n        )\n      }\n      .padding(16.dp),\n    verticalAlignment = Alignment.CenterVertically\n  ) {\n    Text(article.title, Modifier.weight(1f))\n    Icon(Icons.Default.MoreVert, contentDescription = null)\n  }\n}";
    }
    if (mode === "LiveRegion") {
      return "@Composable\nfun FilterResultsAnnouncement(\n  resultCount: Int,\n  showSheet: Boolean,\n  modifier: Modifier = Modifier\n) {\n  Column(modifier) {\n    Text(\n      text = \"$resultCount results\",\n      modifier = Modifier.semantics {\n        liveRegion = LiveRegionMode.Polite\n      }\n    )\n\n    if (showSheet) {\n      ModalBottomSheet(\n        onDismissRequest = { /* update owner state */ },\n        modifier = Modifier.semantics {\n          paneTitle = \"Filter options\"\n        }\n      ) {\n        Text(\"Sort and filter\")\n      }\n    }\n  }\n}";
    }
    if (mode === "TraversalGroup") {
      return "@Composable\nfun DashboardTraversal(modifier: Modifier = Modifier) {\n  Row(\n    modifier = modifier\n      .fillMaxWidth()\n      .semantics { isTraversalGroup = true },\n    horizontalArrangement = Arrangement.spacedBy(12.dp)\n  ) {\n    SummaryCard(\n      title = \"Account\",\n      modifier = Modifier.semantics { traversalIndex = 0f }\n    )\n    SummaryCard(\n      title = \"Security\",\n      modifier = Modifier.semantics { traversalIndex = 1f }\n    )\n    SummaryCard(\n      title = \"Billing\",\n      modifier = Modifier.semantics { traversalIndex = 2f }\n    )\n  }\n}";
    }
    if (mode === "ErrorProgress") {
      return "@Composable\nfun UploadField(\n  progress: Float = " + progress + ",\n  hasError: Boolean,\n  modifier: Modifier = Modifier\n) {\n  Column(modifier) {\n    OutlinedTextField(\n      value = \"\",\n      onValueChange = { },\n      label = { Text(\"Email\") },\n      isError = hasError,\n      modifier = Modifier.semantics {\n        if (hasError) error(\"Please add both email and password\")\n      }\n    )\n\n    LinearProgressIndicator(\n      progress = { progress },\n      modifier = Modifier\n        .fillMaxWidth()\n        .semantics {\n          progressBarRangeInfo = ProgressBarRangeInfo(\n            current = progress,\n            range = 0f..1f,\n            steps = 0\n          )\n        }\n    )\n  }\n}";
    }
    const merge = v.mergeSemantics !== "false" ? "\n      .semantics(mergeDescendants = true) { }" : "";
    const clear = v.clearSemantics === "true"
      ? "\n      .clearAndSetSemantics {\n        role = Role.Button\n        contentDescription = \"Open Ada Lovelace profile, online, 4 unread messages\"\n        onClick(label = \"Open profile\") { onOpen(); true }\n      }"
      : "";
    return "@Composable\nfun ProfileSummaryRow(\n  onOpen: () -> Unit,\n  modifier: Modifier = Modifier\n) {\n  Row(\n    modifier = modifier\n      .fillMaxWidth()\n      .clickable(onClickLabel = \"Open profile\", onClick = onOpen)" + merge + clear + "\n      .padding(16.dp),\n    verticalAlignment = Alignment.CenterVertically\n  ) {\n    Icon(Icons.Default.AccountCircle, contentDescription = null)\n    Column(Modifier.weight(1f).padding(start = 12.dp)) {\n      Text(\"Ada Lovelace\")\n      Text(\"Online, 4 unread messages\")\n    }\n    Icon(Icons.Default.ChevronRight, contentDescription = null)\n  }\n}";
  }

  function pvAdvancedAnimation(pg, v, stage) {
    const mode = v.advancedMotionMode || "SingleValue";
    stage.classList.add("motion2-stage");
    stage.style.display = "grid";
    stage.style.placeItems = "center";
    stage.style.padding = "16px";
    const shell = h("div", "motion2-shell motion2-" + mode.toLowerCase());
    const topLabel = {
      SingleValue: v.springSpec === "true" ? "spring spec" : "tween spec",
      Transition: "coordinated state",
      AnimatedContent: v.contentTargetParam === "true" ? "target keyed" : "stale state",
      Visibility: v.visibilityTransitionOwned === "true" ? "owned exit" : "detached exit",
      AnimatableGesture: v.gestureSnapStop === "true" ? "snap + stop" : "animate only",
      TestClock: v.testClockControl === "true" ? "mainClock" : "sleep timing",
    }[mode] || "motion";
    shell.appendChild(h("div", "motion2-top", "<b>" + esc(mode) + "</b><span>" + esc(topLabel) + "</span>"));
    const body = h("div", "motion2-body");
    if (mode === "SingleValue") {
      const card = h("div", "motion2-card one");
      card.appendChild(h("b", null, "animate*AsState"));
      card.appendChild(h("span", null, v.springSpec === "true" ? "continuous interruption" : "fixed duration"));
      const meter = h("div", "motion2-meter");
      meter.appendChild(h("i"));
      card.appendChild(meter);
      body.appendChild(card);
    } else if (mode === "Transition") {
      const flow = h("div", "motion2-flow");
      [["state", "Collapsed"], ["Transition", "target"], ["color", "animateColor"], ["size", "animateDp"]].forEach(function (item, idx) {
        const cell = h("div", "motion2-cell" + (idx === 1 ? " active" : ""));
        cell.appendChild(h("span", null, esc(item[0])));
        cell.appendChild(h("b", null, esc(item[1])));
        flow.appendChild(cell);
      });
      body.appendChild(flow);
    } else if (mode === "AnimatedContent") {
      body.appendChild(h("div", "motion2-swap " + (v.contentTargetParam === "true" ? "good" : "warn"), "<b>" + (v.contentTargetParam === "true" ? "targetCount" : "outer count") + "</b><span>AnimatedContent key</span>"));
      body.appendChild(h("div", "motion2-transform", "<span>slide</span><span>fade</span><span>SizeTransform</span>"));
    } else if (mode === "Visibility") {
      body.appendChild(h("div", "motion2-visibility " + (v.visibilityTransitionOwned === "true" ? "good" : "warn"), "<b>AnimatedVisibility</b><span>" + (v.visibilityTransitionOwned === "true" ? "transition.animateColor waits" : "animate*AsState may be removed early") + "</span>"));
      body.appendChild(h("div", "motion2-exit", "<i></i><i></i><i></i>"));
    } else if (mode === "AnimatableGesture") {
      body.appendChild(h("div", "motion2-gesture", "<b>Animatable</b><span>" + (v.gestureSnapStop === "true" ? "stop -> snapTo -> animateTo" : "target animation only") + "</span><em></em>"));
      body.appendChild(h("div", "motion2-path", "<span></span><span></span><span></span>"));
    } else {
      body.appendChild(h("div", "motion2-test", "<b>ComposeTestRule</b><span>" + (v.testClockControl === "true" ? "autoAdvance = false" : "Thread.sleep timing") + "</span>"));
      body.appendChild(h("div", "motion2-clock", "<span>0ms</span><i></i><span>250ms</span>"));
    }
    shell.appendChild(body);
    const chips = h("div", "motion2-chips");
    [
      v.springSpec === "true" ? "spring" : "tween",
      v.contentTargetParam === "true" ? "target lambda" : "outer state",
      v.visibilityTransitionOwned === "true" ? "transition-owned" : "detached exit",
      v.gestureSnapStop === "true" ? "snap/stop" : "animate only",
      v.animationLabels === "true" ? "labels" : "anonymous",
      v.testClockControl === "true" ? "mainClock" : "sleep",
    ].forEach(function (label) { chips.appendChild(h("span", null, esc(label))); });
    shell.appendChild(chips);
    const note = {
      SingleValue: "Use single-value helpers when one property follows one target state.",
      Transition: "Use updateTransition when several values must share the same state machine.",
      AnimatedContent: "Always render the lambda target value so AnimatedContent can key outgoing and incoming content.",
      Visibility: "Put custom exit values on AnimatedVisibilityScope.transition so removal waits for them.",
      AnimatableGesture: "Animatable is coroutine-owned; stop or snap during direct input and animate release deliberately.",
      TestClock: "Animation tests should control ComposeTestRule.mainClock instead of sleeping.",
    }[mode];
    shell.appendChild(h("div", "motion2-note", esc(note)));
    stage.appendChild(shell);
  }

  function genAdvancedAnimation(pg, v) {
    const mode = v.advancedMotionMode || "SingleValue";
    const label = v.animationLabels !== "false";
    const labelArg = function (name) { return label ? ',\n    label = "' + name + '"' : ""; };
    if (mode === "SingleValue") {
      const spec = v.springSpec === "true"
        ? "spring(\n      dampingRatio = Spring.DampingRatioNoBouncy,\n      stiffness = Spring.StiffnessMediumLow\n    )"
        : "tween(durationMillis = 240, easing = FastOutSlowInEasing)";
      return "import androidx.compose.animation.core.FastOutSlowInEasing\nimport androidx.compose.animation.core.Spring\nimport androidx.compose.animation.core.animateDpAsState\nimport androidx.compose.animation.core.animateFloatAsState\nimport androidx.compose.animation.core.spring\nimport androidx.compose.animation.core.tween\nimport androidx.compose.foundation.layout.Box\nimport androidx.compose.foundation.layout.size\nimport androidx.compose.runtime.Composable\nimport androidx.compose.runtime.getValue\nimport androidx.compose.ui.Modifier\nimport androidx.compose.ui.draw.alpha\nimport androidx.compose.ui.unit.dp\n\n@Composable\nfun FavoritePulse(\n  selected: Boolean,\n  modifier: Modifier = Modifier\n) {\n  val size by animateDpAsState(\n    targetValue = if (selected) 64.dp else 48.dp,\n    animationSpec = " + spec + labelArg("favorite size") + "\n  )\n  val alpha by animateFloatAsState(\n    targetValue = if (selected) 1f else 0.72f,\n    animationSpec = " + spec + labelArg("favorite alpha") + "\n  )\n\n  Box(modifier.size(size).alpha(alpha))\n}\n\n// Prefer spring when interrupted targets should preserve velocity continuity.";
    }
    if (mode === "Transition") {
      return "import androidx.compose.animation.animateColor\nimport androidx.compose.animation.core.Spring\nimport androidx.compose.animation.core.animateDp\nimport androidx.compose.animation.core.spring\nimport androidx.compose.animation.core.updateTransition\nimport androidx.compose.foundation.layout.Box\nimport androidx.compose.foundation.layout.size\nimport androidx.compose.material3.MaterialTheme\nimport androidx.compose.runtime.Composable\nimport androidx.compose.runtime.getValue\nimport androidx.compose.ui.Modifier\nimport androidx.compose.ui.graphics.Color\nimport androidx.compose.ui.unit.dp\n\nenum class CardMotionState { Collapsed, Expanded }\n\n@Composable\nfun CoordinatedCardMotion(\n  state: CardMotionState,\n  modifier: Modifier = Modifier\n) {\n  val transition = updateTransition(state" + (label ? ', label = "card motion"' : "") + ")\n  val container by transition.animateColor(" + (label ? 'label = "container color", ' : "") + "transitionSpec = {\n    spring(stiffness = Spring.StiffnessMediumLow)\n  }) { target ->\n    if (target == CardMotionState.Expanded) Color(0xFFCCFBF1) else Color(0xFFE2E8F0)\n  }\n  val size by transition.animateDp(" + (label ? 'label = "card size", ' : "") + "transitionSpec = {\n    spring(stiffness = Spring.StiffnessLow)\n  }) { target ->\n    if (target == CardMotionState.Expanded) 180.dp else 96.dp\n  }\n\n  MotionCard(container = container, modifier = modifier.size(size))\n}\n\n// Transition.currentState == Transition.targetState is the signal that all child animations reached the target.";
    }
    if (mode === "AnimatedContent") {
      if (v.contentTargetParam === "true") {
        return "import androidx.compose.animation.AnimatedContent\nimport androidx.compose.animation.SizeTransform\nimport androidx.compose.animation.core.tween\nimport androidx.compose.animation.fadeIn\nimport androidx.compose.animation.fadeOut\nimport androidx.compose.animation.slideInVertically\nimport androidx.compose.animation.slideOutVertically\nimport androidx.compose.animation.togetherWith\nimport androidx.compose.animation.using\nimport androidx.compose.material3.Text\nimport androidx.compose.runtime.Composable\n\n@Composable\nfun CountBadge(count: Int) {\n  AnimatedContent(\n    targetState = count,\n    transitionSpec = {\n      if (targetState > initialState) {\n        slideInVertically { it } + fadeIn() togetherWith\n          slideOutVertically { -it } + fadeOut()\n      } else {\n        slideInVertically { -it } + fadeIn() togetherWith\n          slideOutVertically { it } + fadeOut()\n      }.using(SizeTransform(clip = false))\n    }" + (label ? ',\n    label = "count badge"' : "") + "\n  ) { targetCount ->\n    Text(\"$targetCount\")\n  }\n}\n\n// Use the lambda parameter. AnimatedContent keys incoming and outgoing content from this target value.";
      }
      return "import androidx.compose.animation.AnimatedContent\nimport androidx.compose.material3.Text\nimport androidx.compose.runtime.Composable\n\n@Composable\nfun CountBadge(count: Int) {\n  AnimatedContent(targetState = count) {\n    // BUG: this reads the outer state instead of the AnimatedContent target value.\n    Text(\"$count\")\n  }\n}";
    }
    if (mode === "Visibility") {
      if (v.visibilityTransitionOwned === "true") {
        return "import androidx.compose.animation.AnimatedVisibility\nimport androidx.compose.animation.EnterExitState\nimport androidx.compose.animation.animateColor\nimport androidx.compose.animation.fadeIn\nimport androidx.compose.animation.fadeOut\nimport androidx.compose.foundation.background\nimport androidx.compose.foundation.layout.Box\nimport androidx.compose.foundation.layout.size\nimport androidx.compose.runtime.Composable\nimport androidx.compose.runtime.getValue\nimport androidx.compose.ui.Modifier\nimport androidx.compose.ui.graphics.Color\nimport androidx.compose.ui.unit.dp\n\n@Composable\nfun DismissibleStatus(visible: Boolean) {\n  AnimatedVisibility(\n    visible = visible,\n    enter = fadeIn(),\n    exit = fadeOut()" + (label ? ',\n    label = "status visibility"' : "") + "\n  ) {\n    val background by transition.animateColor(" + (label ? 'label = "status background"' : "") + ") { state ->\n      if (state == EnterExitState.Visible) Color(0xFF0F766E) else Color(0xFFCBD5E1)\n    }\n\n    Box(Modifier.size(96.dp).background(background))\n  }\n}\n\n// AnimatedVisibility waits for animations added to its Transition before removing content.";
      }
      return "import androidx.compose.animation.AnimatedVisibility\nimport androidx.compose.animation.fadeOut\nimport androidx.compose.animation.core.animateFloatAsState\nimport androidx.compose.foundation.layout.Box\nimport androidx.compose.runtime.Composable\nimport androidx.compose.runtime.getValue\nimport androidx.compose.ui.Modifier\nimport androidx.compose.ui.draw.alpha\n\n@Composable\nfun DismissibleStatus(visible: Boolean) {\n  AnimatedVisibility(visible = visible, exit = fadeOut()) {\n    val customExitAlpha by animateFloatAsState(\n      targetValue = if (visible) 1f else 0f\n    )\n    // BUG: AnimatedVisibility cannot wait for this independent animation.\n    Box(Modifier.alpha(customExitAlpha))\n  }\n}";
    }
    if (mode === "AnimatableGesture") {
      if (v.gestureSnapStop === "true") {
        return "import androidx.compose.animation.core.Animatable\nimport androidx.compose.animation.core.Spring\nimport androidx.compose.animation.core.spring\nimport androidx.compose.foundation.gestures.detectDragGestures\nimport androidx.compose.foundation.layout.Box\nimport androidx.compose.foundation.layout.offset\nimport androidx.compose.runtime.Composable\nimport androidx.compose.runtime.remember\nimport androidx.compose.ui.Modifier\nimport androidx.compose.ui.input.pointer.pointerInput\nimport androidx.compose.ui.unit.IntOffset\nimport kotlinx.coroutines.coroutineScope\nimport kotlinx.coroutines.launch\nimport kotlin.math.roundToInt\n\n@Composable\nfun DraggableChip(modifier: Modifier = Modifier) {\n  val x = remember { Animatable(0f) }\n\n  Box(\n    modifier\n      .offset { IntOffset(x.value.roundToInt(), 0) }\n      .pointerInput(Unit) {\n        coroutineScope {\n          detectDragGestures(\n            onDragStart = { launch { x.stop() } },\n            onDrag = { change, dragAmount ->\n              change.consume()\n              launch { x.snapTo(x.value + dragAmount.x) }\n            },\n            onDragEnd = {\n              launch {\n                x.animateTo(\n                  targetValue = 0f,\n                  animationSpec = spring(stiffness = Spring.StiffnessLow)\n                )\n              }\n            }\n          )\n        }\n      }\n  ) { ChipContent() }\n}\n\n// Animatable is coroutine-controlled; direct input usually stops current jobs and snaps to the pointer.";
      }
      return "import androidx.compose.animation.core.Animatable\nimport androidx.compose.foundation.gestures.detectDragGestures\nimport androidx.compose.runtime.Composable\nimport androidx.compose.runtime.remember\nimport androidx.compose.ui.Modifier\nimport androidx.compose.ui.input.pointer.pointerInput\n\n@Composable\nfun DraggableChip(modifier: Modifier = Modifier) {\n  val x = remember { Animatable(0f) }\n\n  ChipContent(\n    modifier.pointerInput(Unit) {\n      detectDragGestures { _, dragAmount ->\n        // BUG: no stop/snap path for direct manipulation; every drag starts another target animation.\n        x.animateTo(x.value + dragAmount.x)\n      }\n    }\n  )\n}";
    }
    if (v.testClockControl === "true") {
      return "import androidx.compose.animation.core.animateColorAsState\nimport androidx.compose.animation.core.tween\nimport androidx.compose.foundation.background\nimport androidx.compose.foundation.layout.Box\nimport androidx.compose.foundation.layout.size\nimport androidx.compose.runtime.getValue\nimport androidx.compose.runtime.mutableStateOf\nimport androidx.compose.ui.Modifier\nimport androidx.compose.ui.graphics.Color\nimport androidx.compose.ui.unit.dp\nimport androidx.compose.ui.test.captureToImage\nimport androidx.compose.ui.test.junit4.createComposeRule\nimport org.junit.Rule\nimport org.junit.Test\n\n@get:Rule\nval rule = createComposeRule()\n\n@Test\nfun colorAnimation_canBeAssertedMidFlight() {\n  rule.mainClock.autoAdvance = false\n  var enabled by mutableStateOf(false)\n\n  rule.setContent {\n    val color by animateColorAsState(\n      targetValue = if (enabled) Color.Red else Color.Green,\n      animationSpec = tween(durationMillis = 250)" + (label ? ',\n      label = "box color"' : "") + "\n    )\n    Box(Modifier.size(64.dp).background(color))\n  }\n\n  enabled = true\n  rule.mainClock.advanceTimeBy(50L)\n  rule.onRoot().captureToImage()\n}\n\n// advanceTimeBy rounds to frame boundaries; assert behavior or golden images deliberately.";
    }
    return "import androidx.compose.animation.core.animateColorAsState\nimport androidx.compose.animation.core.tween\nimport androidx.compose.ui.test.junit4.createComposeRule\nimport org.junit.Rule\nimport org.junit.Test\n\n@get:Rule\nval rule = createComposeRule()\n\n@Test\nfun colorAnimation_isEventuallyRed() {\n  rule.setContent { AnimatedColorBox() }\n\n  // BUG: sleeping is not deterministic and can make animation tests flaky.\n  Thread.sleep(250)\n\n  rule.onRoot().captureToImage()\n}";
  }

  function pvAdvancedText(pg, v, stage) {
    const mode = v.advancedTextMode || "AnnotatedString";
    stage.classList.add("advtext-stage");
    stage.style.display = "grid";
    stage.style.placeItems = "center";
    stage.style.padding = "16px";
    const shell = h("div", "advtext-shell advtext-" + mode.toLowerCase());
    const label = {
      AnnotatedString: "spans + paragraph",
      Links: v.linkAnnotation === "true" ? "LinkAnnotation" : "whole text click",
      Selection: v.selectionContainer === "true" ? "copyable text" : "static text",
      Paragraph: v.paragraphLineBreaks === "true" ? "line breaks + hyphens" : "default wrapping",
      CanvasMeasure: v.cacheTextMeasure === "true" ? "cached measurement" : "remeasure on draw",
      FontsEmoji: v.fontFallbacks === "true" && v.emojiCompat === "true" ? "fallback + emoji" : "fragile font stack",
    }[mode] || mode;
    shell.appendChild(h("div", "advtext-top", "<b>" + esc(mode) + "</b><span>" + esc(label) + "</span>"));
    const body = h("div", "advtext-body");
    if (mode === "AnnotatedString") {
      body.appendChild(h("div", "advtext-rich", '<p><strong>Compose</strong> text can mix <em>span</em>, paragraph, and annotation ranges inside one Text node.</p><small>AnnotatedString + SpanStyle + ParagraphStyle</small>'));
    } else if (mode === "Links") {
      body.appendChild(h("div", "advtext-link " + (v.linkAnnotation === "true" ? "good" : "warn"), "<b>Read the Android text docs</b><span>" + (v.linkAnnotation === "true" ? "only this phrase is a link" : "entire sentence is clickable") + "</span>"));
    } else if (mode === "Selection") {
      body.appendChild(h("div", "advtext-select " + (v.selectionContainer === "true" ? "good" : "warn"), "<b>Confirmation code 493812</b><span>" + (v.selectionContainer === "true" ? "SelectionContainer, except buttons" : "cannot copy critical text") + "</span>"));
    } else if (mode === "Paragraph") {
      body.appendChild(h("div", "advtext-para " + (v.paragraphLineBreaks === "true" ? "good" : "warn"), "<b>Readable paragraph</b><p>Long copy needs line breaking, hyphenation, and line-height rules that survive narrow cards and large font scales.</p></div>"));
    } else if (mode === "CanvasMeasure") {
      body.appendChild(h("div", "advtext-canvas " + (v.cacheTextMeasure === "true" ? "good" : "warn"), "<i></i><b>Score 98</b><span>" + (v.cacheTextMeasure === "true" ? "drawWithCache stores measure" : "remeasures every draw") + "</span>"));
    } else {
      body.appendChild(h("div", "advtext-fonts " + (v.fontFallbacks === "true" && v.emojiCompat === "true" ? "good" : "warn"), "<b>Brand Sans</b><span>Fallback Latin, CJK, symbols, emoji support</span><em>font fallback chain</em>"));
    }
    shell.appendChild(body);
    const chips = h("div", "advtext-chips");
    [
      "AnnotatedString",
      v.linkAnnotation === "true" ? "LinkAnnotation" : "clickable Text",
      v.selectionContainer === "true" ? "SelectionContainer" : "no selection",
      v.paragraphLineBreaks === "true" ? "LineBreak/Hyphens" : "default wrap",
      v.cacheTextMeasure === "true" ? "drawWithCache" : "per-frame measure",
      v.fontFallbacks === "true" ? "font fallback" : "single font",
      v.emojiCompat === "true" ? "emoji tested" : "emoji stripped",
    ].forEach(function (chip) { chips.appendChild(h("span", null, esc(chip))); });
    shell.appendChild(chips);
    stage.appendChild(shell);
  }

  function genAdvancedText(pg, v) {
    const mode = v.advancedTextMode || "AnnotatedString";
    if (mode === "AnnotatedString") {
      return "import androidx.compose.material3.MaterialTheme\nimport androidx.compose.material3.Text\nimport androidx.compose.runtime.Composable\nimport androidx.compose.ui.graphics.Color\nimport androidx.compose.ui.text.SpanStyle\nimport androidx.compose.ui.text.ParagraphStyle\nimport androidx.compose.ui.text.buildAnnotatedString\nimport androidx.compose.ui.text.font.FontWeight\nimport androidx.compose.ui.text.style.TextAlign\nimport androidx.compose.ui.text.withStyle\n\n@Composable\nfun RichAnnouncement() {\n  Text(\n    text = buildAnnotatedString {\n      withStyle(ParagraphStyle(textAlign = TextAlign.Start)) {\n        append(\"Compose text can \")\n        withStyle(SpanStyle(fontWeight = FontWeight.Bold)) { append(\"emphasize\") }\n        append(\", \")\n        withStyle(SpanStyle(color = Color(0xFF0F766E))) { append(\"color\") }\n        append(\", and structure copy in one Text node.\")\n      }\n    },\n    style = MaterialTheme.typography.bodyLarge\n  )\n}\n\n// Use AnnotatedString when one sentence needs inline styles, annotations, or paragraph ranges.";
    }
    if (mode === "Links") {
      if (v.linkAnnotation === "true") {
        return "import androidx.compose.material3.MaterialTheme\nimport androidx.compose.material3.Text\nimport androidx.compose.runtime.Composable\nimport androidx.compose.ui.graphics.Color\nimport androidx.compose.ui.platform.LocalUriHandler\nimport androidx.compose.ui.text.SpanStyle\nimport androidx.compose.ui.text.buildAnnotatedString\nimport androidx.compose.ui.text.LinkAnnotation\nimport androidx.compose.ui.text.TextLinkStyles\nimport androidx.compose.ui.text.style.TextDecoration\nimport androidx.compose.ui.text.withLink\n\n@Composable\nfun HelpText() {\n  val uriHandler = LocalUriHandler.current\n\n  Text(\n    text = buildAnnotatedString {\n      append(\"Read the \")\n      withLink(\n        LinkAnnotation.Url(\n          url = \"https://developer.android.com/develop/ui/compose/text\",\n          styles = TextLinkStyles(\n            style = SpanStyle(\n              color = MaterialTheme.colorScheme.primary,\n              textDecoration = TextDecoration.Underline\n            )\n          ),\n          linkInteractionListener = { uriHandler.openUri(it.url) }\n        )\n      ) {\n        append(\"Compose text guide\")\n      }\n      append(\" before shipping rich copy.\")\n    }\n  )\n}";
      }
      return "import androidx.compose.foundation.clickable\nimport androidx.compose.material3.Text\nimport androidx.compose.runtime.Composable\nimport androidx.compose.ui.Modifier\n\n@Composable\nfun HelpText(onOpenDocs: () -> Unit) {\n  Text(\n    text = \"Read the Compose text guide before shipping rich copy.\",\n    modifier = Modifier.clickable { onOpenDocs() }\n  )\n  // BUG: the whole sentence is clickable even though only one phrase is a link.\n  // Prefer AnnotatedString with LinkAnnotation and TextLinkStyles for partial links.\n}";
    }
    if (mode === "Selection") {
      if (v.selectionContainer === "true") {
        return "import androidx.compose.foundation.layout.Column\nimport androidx.compose.foundation.text.selection.DisableSelection\nimport androidx.compose.foundation.text.selection.SelectionContainer\nimport androidx.compose.material3.Button\nimport androidx.compose.material3.Text\nimport androidx.compose.runtime.Composable\n\n@Composable\nfun ConfirmationDetails(onDone: () -> Unit) {\n  SelectionContainer {\n    Column {\n      Text(\"Confirmation code: 493812\")\n      Text(\"Support can ask for this exact code.\")\n      DisableSelection {\n        Button(onClick = onDone) { Text(\"Done\") }\n      }\n    }\n  }\n}\n\n// Wrap copyable text in SelectionContainer and opt controls out with DisableSelection.";
      }
      return "import androidx.compose.material3.Text\nimport androidx.compose.runtime.Composable\n\n@Composable\nfun ConfirmationDetails() {\n  Text(\"Confirmation code: 493812\")\n  Text(\"Support can ask for this exact code.\")\n  // BUG: critical text is not selectable or copyable.\n  // Wrap copyable areas in SelectionContainer when users need exact text.\n}";
    }
    if (mode === "Paragraph") {
      if (v.paragraphLineBreaks === "true") {
        return "import androidx.compose.material3.MaterialTheme\nimport androidx.compose.material3.Text\nimport androidx.compose.runtime.Composable\nimport androidx.compose.ui.text.ParagraphStyle\nimport androidx.compose.ui.text.PlatformTextStyle\nimport androidx.compose.ui.text.TextStyle\nimport androidx.compose.ui.text.style.Hyphens\nimport androidx.compose.ui.text.style.LineBreak\nimport androidx.compose.ui.text.style.LineHeightStyle\nimport androidx.compose.ui.text.buildAnnotatedString\nimport androidx.compose.ui.text.withStyle\nimport androidx.compose.ui.unit.sp\n\n@Composable\nfun ArticleParagraph(copy: String) {\n  Text(\n    text = buildAnnotatedString {\n      withStyle(\n        ParagraphStyle(\n          lineBreak = LineBreak.Paragraph,\n          hyphens = Hyphens.Auto,\n          lineHeight = 24.sp,\n          lineHeightStyle = LineHeightStyle(\n            alignment = LineHeightStyle.Alignment.Proportional,\n            trim = LineHeightStyle.Trim.None\n          )\n        )\n      ) {\n        append(copy)\n      }\n    },\n    style = MaterialTheme.typography.bodyLarge\n  )\n}";
      }
      return "import androidx.compose.foundation.layout.width\nimport androidx.compose.material3.Text\nimport androidx.compose.runtime.Composable\nimport androidx.compose.ui.Modifier\nimport androidx.compose.ui.text.TextStyle\nimport androidx.compose.ui.unit.dp\nimport androidx.compose.ui.unit.sp\n\n@Composable\nfun NarrowParagraph(copy: String) {\n  Text(\n    text = copy,\n    style = TextStyle(lineHeight = 18.sp),\n    modifier = Modifier.width(180.dp)\n  )\n  // BUG: narrow multi-line body copy keeps default LineBreak and Hyphens behavior.\n  // Configure LineBreak.Paragraph and Hyphens.Auto for important paragraphs.\n}";
    }
    if (mode === "CanvasMeasure") {
      if (v.cacheTextMeasure === "true") {
        return "import androidx.compose.foundation.Canvas\nimport androidx.compose.foundation.layout.size\nimport androidx.compose.runtime.Composable\nimport androidx.compose.ui.Modifier\nimport androidx.compose.ui.draw.drawWithCache\nimport androidx.compose.ui.geometry.CornerRadius\nimport androidx.compose.ui.geometry.Offset\nimport androidx.compose.ui.graphics.Color\nimport androidx.compose.ui.text.AnnotatedString\nimport androidx.compose.ui.text.TextStyle\nimport androidx.compose.ui.text.drawText\nimport androidx.compose.ui.text.rememberTextMeasurer\nimport androidx.compose.ui.text.style.TextOverflow\nimport androidx.compose.ui.unit.Constraints\nimport androidx.compose.ui.unit.dp\nimport androidx.compose.ui.unit.sp\n\n@Composable\nfun ScoreBadge(score: Int, modifier: Modifier = Modifier) {\n  val textMeasurer = rememberTextMeasurer()\n\n  Canvas(\n    modifier.size(width = 160.dp, height = 72.dp).drawWithCache {\n      val measuredText = textMeasurer.measure(\n        text = AnnotatedString(\"Score $score\"),\n        style = TextStyle(fontSize = 18.sp, color = Color.White),\n        overflow = TextOverflow.Ellipsis,\n        maxLines = 1,\n        constraints = Constraints(maxWidth = size.width.toInt() - 24)\n      )\n\n      onDrawBehind {\n        drawRoundRect(Color(0xFF0F766E), cornerRadius = CornerRadius(18f, 18f))\n        drawText(measuredText, topLeft = Offset(12f, 22f))\n      }\n    }\n  ) { }\n}\n\n// Text measurement can be expensive. Cache it with drawWithCache when size and inputs are stable.";
      }
      return "import androidx.compose.foundation.Canvas\nimport androidx.compose.runtime.Composable\nimport androidx.compose.ui.Modifier\nimport androidx.compose.ui.text.AnnotatedString\nimport androidx.compose.ui.text.TextStyle\nimport androidx.compose.ui.text.drawText\nimport androidx.compose.ui.text.rememberTextMeasurer\nimport androidx.compose.ui.unit.sp\n\n@Composable\nfun ScoreBadge(score: Int, modifier: Modifier = Modifier) {\n  val textMeasurer = rememberTextMeasurer()\n\n  Canvas(modifier) {\n    val measured = textMeasurer.measure(\n      text = AnnotatedString(\"Score $score\"),\n      style = TextStyle(fontSize = 18.sp)\n    )\n    drawText(measured)\n  }\n  // BUG: this measures text during every draw pass; use drawWithCache.\n}";
    }
    if (v.fontFallbacks === "true" && v.emojiCompat === "true") {
      return "import android.os.Build\nimport androidx.compose.material3.MaterialTheme\nimport androidx.compose.material3.Text\nimport androidx.compose.runtime.Composable\nimport androidx.compose.ui.platform.LocalContext\nimport androidx.compose.ui.text.font.FontFamily\nimport androidx.compose.ui.text.font.FontVariation\nimport androidx.compose.ui.text.googlefonts.Font\nimport androidx.compose.ui.text.googlefonts.GoogleFont\nimport androidx.compose.ui.text.googlefonts.isAvailableOnDevice\n\nprivate val provider = GoogleFont.Provider(\n  providerAuthority = \"com.google.android.gms.fonts\",\n  providerPackage = \"com.google.android.gms\",\n  certificates = R.array.com_google_android_gms_fonts_certs\n)\nprivate val inter = GoogleFont(\"Inter\")\nprivate val brandFont = FontFamily(\n  Font(googleFont = inter, fontProvider = provider),\n  androidx.compose.ui.text.font.Font(R.font.noto_sans_fallback)\n)\n\n@Composable\nfun BrandText(userName: String) {\n  val context = LocalContext.current\n  val style = MaterialTheme.typography.bodyLarge.copy(fontFamily = brandFont)\n  Text(\n    text = \"Welcome $userName. Modern emoji should remain visible on legacy devices.\",\n    style = if (provider.isAvailableOnDevice(context) && Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {\n      style.copy(fontVariationSettings = FontVariation.Settings(FontVariation.weight(550)))\n    } else {\n      style\n    }\n  )\n}\n\n// Use downloadable fonts with certificates, fallback fonts, provider checks, guarded variable fonts, and emoji regression tests.";
    }
    return "import androidx.compose.material3.Text\nimport androidx.compose.runtime.Composable\nimport androidx.compose.ui.text.font.Font\nimport androidx.compose.ui.text.font.FontFamily\n\nprivate val brandFont = FontFamily(Font(R.font.brand_regular))\n\n@Composable\nfun BrandText(userName: String) {\n  val cleaned = userName.filter { it.code < 128 }\n  Text(\"Welcome $cleaned\", fontFamily = brandFont)\n  // BUG: one local font has no fallback, provider check, variable-font guard, or emoji plan.\n  // Do not strip modern emoji; test emoji rendering on older API levels.\n}";
  }

  function pvAdaptiveCanonical(pg, v, stage) {
    const mode = v.adaptiveCanonicalMode || "NavigationSuite";
    stage.classList.add("adapt2-stage");
    stage.style.display = "grid";
    stage.style.placeItems = "center";
    stage.style.padding = "16px";
    const shell = h("div", "adapt2-shell adapt2-" + mode.toLowerCase());
    const label = {
      NavigationSuite: v.navSuiteScaffold === "true" ? "suite owns nav" : "manual nav switch",
      ListDetail: v.paneParcelableKey === "true" ? "saveable panes" : "unsaveable key",
      SupportingPane: v.supportingPaneNavigator === "true" ? "navigator panes" : "boolean pane",
      Feed: v.avoidStretching === "true" ? "constrained feed" : "stretched content",
      AntiPattern: "review traps",
      TestMatrix: v.adaptivePreviewMatrix === "true" ? "preview matrix" : "single preview",
    }[mode] || mode;
    shell.appendChild(h("div", "adapt2-top", "<b>" + esc(mode) + "</b><span>" + esc(label) + "</span>"));
    const body = h("div", "adapt2-body");
    if (mode === "NavigationSuite") {
      const layout = h("div", "adapt2-nav " + (v.navSuiteScaffold === "true" ? "good" : "warn"));
      layout.appendChild(h("div", "adapt2-rail", "<i></i><i></i><i></i>"));
      layout.appendChild(h("div", "adapt2-screen", "<b>Home</b><span>" + (v.saveableDestination === "true" ? "rememberSaveable destination" : "volatile selected state") + "</span>"));
      layout.appendChild(h("div", "adapt2-bar", "<i></i><i></i><i></i>"));
      body.appendChild(layout);
    } else if (mode === "ListDetail") {
      body.appendChild(h("div", "adapt2-panes listdetail " + (v.paneParcelableKey === "true" ? "good" : "warn"), "<section><b>List</b><span>messages</span></section><section><b>Detail</b><span>" + (v.paneParcelableKey === "true" ? "Parcelable key" : "plain object key") + "</span></section><section><b>Extra</b><span>context</span></section>"));
    } else if (mode === "SupportingPane") {
      body.appendChild(h("div", "adapt2-panes supporting " + (v.supportingPaneNavigator === "true" ? "good" : "warn"), "<section><b>Main</b><span>editor</span></section><section><b>Supporting</b><span>" + (v.supportingPaneNavigator === "true" ? "navigator + AnimatedPane" : "boolean + Row") + "</span></section>"));
    } else if (mode === "Feed") {
      body.appendChild(h("div", "adapt2-feed " + (v.avoidStretching === "true" ? "good" : "warn"), "<article><b>Story</b><span>widthIn</span></article><article><b>Story</b><span>grid cell</span></article><article><b>Story</b><span>" + (v.avoidStretching === "true" ? "readable line" : "fillMaxWidth text") + "</span></article>"));
    } else if (mode === "AntiPattern") {
      const traps = ["Display metrics", "screenOrientation", "maxAspectRatio", "leaf window query"];
      const grid = h("div", "adapt2-traps");
      traps.forEach(function (trap) { grid.appendChild(h("span", null, esc(trap))); });
      body.appendChild(grid);
    } else {
      body.appendChild(h("div", "adapt2-matrix " + (v.adaptivePreviewMatrix === "true" ? "good" : "warn"), "<span>compact</span><span>medium</span><span>expanded</span><span>font scale</span><span>dark</span><span>posture</span>"));
    }
    const chips = h("div", "adapt2-chips");
    [
      v.navSuiteScaffold === "true" ? "NavigationSuiteScaffold" : "manual switch",
      v.paneParcelableKey === "true" ? "saveable pane key" : "unsaveable pane",
      v.supportingPaneNavigator === "true" ? "ThreePane navigator" : "local boolean",
      v.avoidStretching === "true" ? "no stretching" : "stretched expanded",
      v.adaptivePreviewMatrix === "true" ? "preview matrix" : "single preview",
    ].forEach(function (chip) { chips.appendChild(h("span", null, esc(chip))); });
    shell.appendChild(body);
    shell.appendChild(chips);
    stage.appendChild(shell);
  }

  function genAdaptiveCanonical(pg, v) {
    const mode = v.adaptiveCanonicalMode || "NavigationSuite";
    if (mode === "NavigationSuite") {
      if (v.navSuiteScaffold !== "true") {
        return "import androidx.compose.material3.NavigationBar\nimport androidx.compose.material3.NavigationRail\nimport androidx.compose.material3.adaptive.currentWindowAdaptiveInfo\nimport androidx.compose.runtime.Composable\nimport androidx.window.core.layout.WindowSizeClass\n\n@Composable\nfun ManualAdaptiveNav(selected: Destination) {\n  val windowSizeClass = currentWindowAdaptiveInfo().windowSizeClass\n\n  // BUG: this duplicates NavigationSuiteScaffold behavior and grows hard to keep consistent.\n  if (windowSizeClass.isWidthAtLeastBreakpoint(WindowSizeClass.WIDTH_DP_MEDIUM_LOWER_BOUND)) {\n    NavigationRail { Destinations.forEach { NavRailItem(it, selected) } }\n  } else {\n    NavigationBar { Destinations.forEach { NavBarItem(it, selected) } }\n  }\n}";
      }
      const destinationState = v.saveableDestination === "true"
        ? "var currentDestination by rememberSaveable { mutableStateOf(AppDestination.Home) }"
        : "var currentDestination by remember { mutableStateOf(AppDestination.Home) } // BUG: selection is lost on recreation";
      return "import androidx.compose.material3.Icon\nimport androidx.compose.material3.Text\nimport androidx.compose.material3.adaptive.currentWindowAdaptiveInfo\nimport androidx.compose.material3.adaptive.navigationsuite.NavigationSuiteScaffold\nimport androidx.compose.material3.adaptive.navigationsuite.NavigationSuiteScaffoldDefaults\nimport androidx.compose.material3.adaptive.navigationsuite.NavigationSuiteType\nimport androidx.compose.runtime.Composable\nimport androidx.compose.runtime.getValue\nimport androidx.compose.runtime.mutableStateOf\nimport androidx.compose.runtime.saveable.rememberSaveable\nimport androidx.compose.runtime.setValue\nimport androidx.window.core.layout.WindowSizeClass\n\nenum class AppDestination { Home, Search, Saved }\n\n@Composable\nfun AdaptiveDestinationShell() {\n  " + destinationState + "\n  val adaptiveInfo = currentWindowAdaptiveInfo()\n  val layoutType = with(adaptiveInfo) {\n    if (windowSizeClass.isWidthAtLeastBreakpoint(WindowSizeClass.WIDTH_DP_EXPANDED_LOWER_BOUND)) {\n      NavigationSuiteType.NavigationDrawer\n    } else {\n      NavigationSuiteScaffoldDefaults.calculateFromAdaptiveInfo(adaptiveInfo)\n    }\n  }\n\n  NavigationSuiteScaffold(\n    layoutType = layoutType,\n    navigationSuiteItems = {\n      AppDestination.entries.forEach { destination ->\n        item(\n          selected = destination == currentDestination,\n          onClick = { currentDestination = destination },\n          icon = { Icon(iconFor(destination), contentDescription = destination.name) },\n          label = { Text(destination.name) }\n        )\n      }\n    }\n  ) {\n    DestinationContent(currentDestination)\n  }\n}\n\n// NavigationSuiteScaffold owns the bar/rail/drawer presentation while the app owns selected destination state.";
    }
    if (mode === "ListDetail") {
      const key = v.paneParcelableKey === "true"
        ? "@Parcelize\ndata class MessageKey(val id: String) : Parcelable"
        : "data class MessageKey(val id: String) // BUG: pane destination key is not Parcelable or saveable";
      return "import android.os.Parcelable\nimport androidx.compose.material3.adaptive.layout.AnimatedPane\nimport androidx.compose.material3.adaptive.layout.ListDetailPaneScaffoldRole\nimport androidx.compose.material3.adaptive.navigation.NavigableListDetailPaneScaffold\nimport androidx.compose.material3.adaptive.navigation.rememberListDetailPaneScaffoldNavigator\nimport androidx.compose.runtime.Composable\nimport androidx.compose.runtime.rememberCoroutineScope\nimport kotlinx.coroutines.launch\nimport kotlinx.parcelize.Parcelize\n\n" + key + "\n\n@Composable\nfun MessagesListDetail(messages: List<MessageSummary>) {\n  val navigator = rememberListDetailPaneScaffoldNavigator<MessageKey>()\n  val scope = rememberCoroutineScope()\n\n  NavigableListDetailPaneScaffold(\n    navigator = navigator,\n    listPane = {\n      AnimatedPane {\n        MessageList(\n          messages = messages,\n          selectedId = navigator.currentDestination?.contentKey?.id,\n          onOpen = { message ->\n            scope.launch {\n              navigator.navigateTo(\n                pane = ListDetailPaneScaffoldRole.Detail,\n                contentKey = MessageKey(message.id)\n              )\n            }\n          }\n        )\n      }\n    },\n    detailPane = {\n      AnimatedPane { MessageDetail(navigator.currentDestination?.contentKey?.id) }\n    }\n  )\n}";
    }
    if (mode === "SupportingPane") {
      if (v.supportingPaneNavigator !== "true") {
        return "import androidx.compose.foundation.layout.Row\nimport androidx.compose.runtime.Composable\nimport androidx.compose.runtime.mutableStateOf\nimport androidx.compose.runtime.remember\n\n@Composable\nfun EditorWithManualTools(document: DocumentUi) {\n  val showTools = remember { mutableStateOf(false) }\n\n  // BUG: a local Boolean and Row do not adapt between one-pane and multi-pane navigation.\n  Row {\n    DocumentEditor(document)\n    if (showTools.value) ToolPalette(document.id)\n  }\n}";
      }
      return "import androidx.compose.material3.adaptive.layout.AnimatedPane\nimport androidx.compose.material3.adaptive.layout.PaneAdaptedValue\nimport androidx.compose.material3.adaptive.layout.SupportingPaneScaffoldRole\nimport androidx.compose.material3.adaptive.navigation.BackNavigationBehavior\nimport androidx.compose.material3.adaptive.navigation.NavigableSupportingPaneScaffold\nimport androidx.compose.material3.adaptive.navigation.rememberSupportingPaneScaffoldNavigator\nimport androidx.compose.runtime.Composable\nimport androidx.compose.runtime.rememberCoroutineScope\nimport kotlinx.coroutines.launch\n\n@Composable\nfun EditorWithSupportingPane(document: DocumentUi) {\n  val navigator = rememberSupportingPaneScaffoldNavigator()\n  val scope = rememberCoroutineScope()\n\n  NavigableSupportingPaneScaffold(\n    navigator = navigator,\n    mainPane = {\n      AnimatedPane {\n        DocumentEditor(\n          document = document,\n          showToolsButton = navigator.scaffoldValue[SupportingPaneScaffoldRole.Supporting] == PaneAdaptedValue.Hidden,\n          onShowTools = { scope.launch { navigator.navigateTo(SupportingPaneScaffoldRole.Supporting) } }\n        )\n      }\n    },\n    supportingPane = {\n      AnimatedPane {\n        ToolPalette(\n          documentId = document.id,\n          onClose = {\n            scope.launch { navigator.navigateBack(BackNavigationBehavior.PopUntilScaffoldValueChange) }\n          }\n        )\n      }\n    }\n  )\n}\n\n// Supporting pane content is related to the main pane; the navigator adapts visibility and back behavior.";
    }
    if (mode === "Feed") {
      if (v.avoidStretching !== "true") {
        return "import androidx.compose.foundation.layout.Column\nimport androidx.compose.foundation.layout.fillMaxWidth\nimport androidx.compose.material3.Button\nimport androidx.compose.material3.Text\nimport androidx.compose.runtime.Composable\nimport androidx.compose.ui.Modifier\n\n@Composable\nfun ExpandedFeedAntiPattern(stories: List<Story>) {\n  Column(Modifier.fillMaxWidth()) {\n    stories.forEach { story ->\n      // BUG: expanded windows should not just stretch phone-width content.\n      Text(story.title, Modifier.fillMaxWidth())\n      Button(modifier = Modifier.fillMaxWidth(), onClick = { }) { Text(\"Open\") }\n    }\n  }\n}";
      }
      return "import androidx.compose.foundation.layout.BoxWithConstraints\nimport androidx.compose.foundation.layout.widthIn\nimport androidx.compose.foundation.lazy.grid.GridCells\nimport androidx.compose.foundation.lazy.grid.LazyVerticalGrid\nimport androidx.compose.foundation.lazy.grid.items\nimport androidx.compose.runtime.Composable\nimport androidx.compose.ui.Modifier\nimport androidx.compose.ui.unit.dp\n\n@Composable\nfun AdaptiveFeed(stories: List<Story>, modifier: Modifier = Modifier) {\n  BoxWithConstraints(modifier) {\n    val columns = when {\n      maxWidth >= 1200.dp -> 3\n      maxWidth >= 720.dp -> 2\n      else -> 1\n    }\n\n    LazyVerticalGrid(columns = GridCells.Fixed(columns)) {\n      items(stories, key = { it.id }) { story ->\n        StoryCard(\n          story = story,\n          modifier = Modifier.widthIn(max = 560.dp)\n        )\n      }\n    }\n  }\n}\n\n// Use the space a component actually receives; keep line lengths and buttons readable on expanded windows.";
    }
    if (mode === "AntiPattern") {
      return "import android.view.WindowManager\nimport androidx.compose.material3.adaptive.currentWindowAdaptiveInfo\nimport androidx.compose.runtime.Composable\n\n// BUG: manifest restrictions fight adaptive windows.\n// <activity android:screenOrientation=\"portrait\" android:resizeableActivity=\"false\" android:maxAspectRatio=\"1.8\" />\n\nfun readScreenWidth(windowManager: WindowManager): Int {\n  val metrics = android.util.DisplayMetrics()\n  @Suppress(\"DEPRECATION\")\n  windowManager.defaultDisplay.getRealMetrics(metrics)\n  return metrics.widthPixels\n}\n\n@Composable\nfun ProductCard(product: ProductUi) {\n  // BUG: leaf cards should not query global window info; pass configuration or use actual constraints.\n  val windowSizeClass = currentWindowAdaptiveInfo().windowSizeClass\n  ProductCardBody(product, wide = windowSizeClass.isWidthAtLeastBreakpoint(840))\n}";
    }
    if (v.adaptivePreviewMatrix === "true") {
      return "import androidx.compose.ui.tooling.preview.Preview\nimport androidx.compose.ui.tooling.preview.PreviewFontScales\nimport androidx.compose.ui.tooling.preview.PreviewScreenSizes\n\n@PreviewScreenSizes\n@PreviewFontScales\n@Preview(name = \"Dark\", uiMode = android.content.res.Configuration.UI_MODE_NIGHT_YES)\n@Composable\nfun AdaptiveDestinationShellPreview() {\n  AppTheme {\n    AdaptiveDestinationShell()\n  }\n}\n\n// Pair previews with runtime resize, fold posture, keyboard, mouse, and large-font checks.";
    }
    return "import androidx.compose.ui.tooling.preview.Preview\n\n@Preview\n@Composable\nfun PhoneOnlyPreview() {\n  // BUG: one happy-path phone preview misses compact/medium/expanded and font-scale behavior.\n  AdaptiveDestinationShell()\n}";
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

  const COMPONENT_PV = { Button: pvButton, Card: pvCard, Controls: pvControls, TextField: pvTextField, ConstraintLayout: pvConstraintLayout, AdvancedLayoutAdaptation: pvAdvancedLayoutAdaptation, CompositionIdentity: pvCompositionIdentity, CompositionLocal: pvCompositionLocal, SnapshotState: pvSnapshotState, StateHolderArchitecture: pvStateHolderArchitecture, PredictiveBack: pvPredictiveBack, AdvancedInput: pvAdvancedInput, ActivityResults: pvActivityResults, AdvancedAnimation: pvAdvancedAnimation, AdaptiveCanonical: pvAdaptiveCanonical, AdvancedText: pvAdvancedText, CustomModifier: pvCustomModifier, VisibilityTracking: pvVisibilityTracking, StabilityLab: pvStabilityLab, PerformanceMeasurement: pvPerformanceMeasurement, EffectsLifecycle: pvEffectsLifecycle, SemanticsContract: pvSemanticsContract, Nesting: pvNesting, Scaffold: pvScaffold, LazyCollections: pvLazyCollections, ImageResource: pvImageResource, SelectionInput: pvSelectionInput, StatusContent: pvStatusContent, TransientSurface: pvTransientSurface, NavigationSurface: pvNavigationSurface, Interop: pvInterop, Nav3: pvNav3, ProfileRow: pvProfileRow };
  const COMPONENT_GEN = { Button: genButton, Card: genCard, Controls: genControls, TextField: genTextField, ConstraintLayout: genConstraintLayout, AdvancedLayoutAdaptation: genAdvancedLayoutAdaptation, CompositionIdentity: genCompositionIdentity, CompositionLocal: genCompositionLocal, SnapshotState: genSnapshotState, StateHolderArchitecture: genStateHolderArchitecture, PredictiveBack: genPredictiveBack, AdvancedInput: genAdvancedInput, ActivityResults: genActivityResults, AdvancedAnimation: genAdvancedAnimation, AdaptiveCanonical: genAdaptiveCanonical, AdvancedText: genAdvancedText, CustomModifier: genCustomModifier, VisibilityTracking: genVisibilityTracking, StabilityLab: genStabilityLab, PerformanceMeasurement: genPerformanceMeasurement, EffectsLifecycle: genEffectsLifecycle, SemanticsContract: genSemanticsContract, Nesting: genNesting, Scaffold: genScaffold, LazyCollections: genLazyCollections, ImageResource: genImageResource, SelectionInput: genSelectionInput, StatusContent: genStatusContent, TransientSurface: genTransientSurface, NavigationSurface: genNavigationSurface, Interop: genInterop, Nav3: genNav3, ProfileRow: genProfileRow };

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
        route: ["navigation3-state", "navigation-compose", "state-saving", "state-hoisting-udf", "adaptive-layouts", "adaptive-canonical-navigation", "animation-motion", "compose-ui-testing"],
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
        route: ["scaffold", "navigation-surfaces", "edge-to-edge-insets", "theming-design-system", "state-hoisting-udf", "navigation-compose", "navigation3-state", "adaptive-layouts", "adaptive-canonical-navigation", "padding", "state-saving", "effects-lifecycle", "previews-tooling"],
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
        route: ["navigation-surfaces", "scaffold", "navigation-compose", "navigation3-state", "adaptive-layouts", "adaptive-canonical-navigation", "state-saving", "edge-to-edge-insets", "accessibility-testing", "compose-ui-testing"],
        steps: [
          "Separate app structure from destination content: top-level destinations live at the shell, while each screen stays previewable.",
          "Use NavigationSuiteScaffold for top-level destinations so bar, rail, and drawer presentations adapt from window size and posture.",
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
        route: ["modifiers", "buttons", "controls", "pointer-input-gestures", "advanced-input-rich-content", "focus-keyboard-input", "accessibility-testing", "compose-ui-testing", "state-saving"],
        steps: [
          "Start from a Material component or high-level gesture modifier that already supplies semantics and indication.",
          "Hoist gesture-driven state such as pressed, selected, dragged offset, zoom, or expanded state.",
          "Use pointerInput only for a custom gesture the high-level APIs do not express.",
          "Separate top-level gesture detectors into separate pointerInput modifiers when more than one detector must run.",
          "Consume pointer changes deliberately so parent and sibling handlers do not fight.",
          "Add drag/drop, clipboard, rich content, stylus, hover, and right-click support when the surface appears in multi-window, ChromeOS, tablet, or desktop-class workflows.",
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
        route: ["animation-motion", "advanced-animation-motion", "effects-lifecycle", "stability-performance", "accessibility-testing", "compose-ui-testing"],
        steps: [
          "Choose the smallest animation API that matches the state change.",
          "Use updateTransition for coordinated values and AnimatedContent for keyed content swaps.",
          "Use Animatable from coroutine/event paths when gestures, interruption, or fling-like release owns the value.",
          "Keep animation targets derived from state instead of manually mutating frames.",
          "Avoid restarting work from the composable body; use effect APIs for lifecycle-bound jobs.",
          "Add labels so Animation Preview can inspect timelines and values.",
          "Check reduced-motion expectations, interrupted states, testable semantics, and deterministic mainClock assertions.",
        ],
      },
    ];
    const addOns = [
      { id: "save", label: "Survives process death", route: ["state-saving"], step: "Define the smallest restorable state and keep non-Bundle data out of saved instance state." },
      { id: "stateOwner", label: "Screen state holder", route: ["state-hoisting-udf", "state-saving", "effects-lifecycle"], step: "Keep ViewModel or plain state holder ownership at the route boundary, expose immutable UI state, and pass callbacks into reusable content." },
      { id: "identity", label: "Stateful dynamic content", route: ["composition-identity-retention", "lazy-lists", "state-saving"], step: "Give repeated, moved, tabbed, or temporarily removed content a stable logical identity with key, lazy item keys, SaveableStateHolder, movableContentOf, or retain as appropriate." },
      { id: "effects", label: "Collects effects or callbacks", route: ["effects-lifecycle"], step: "Pick the effect API by lifecycle: launch, remember latest value, produce state, or clean up a listener." },
      { id: "nav", label: "Navigates between screens", route: ["navigation-compose", "effects-lifecycle"], step: "Define typed destinations, keep NavController at the route layer, and pass navigation events down as lambdas." },
      { id: "nav3", label: "Navigation 3", route: ["navigation3-state", "state-saving", "adaptive-layouts", "adaptive-canonical-navigation"], step: "Own navigation as state with serializable NavKey values, an entryProvider, NavDisplay, onBack handling, and decorators or scene metadata only where needed." },
      { id: "adaptive", label: "Adapts to large screens", route: ["adaptive-layouts", "adaptive-canonical-navigation", "advanced-layout-adaptation", "navigation-compose", "navigation3-state"], step: "Use currentWindowAdaptiveInfo, NavigationSuiteScaffold, canonical pane scaffolds, Navigation 3 scenes, or component-local constraints instead of fixed phone-only breakpoints." },
      { id: "edge", label: "Edge-to-edge", route: ["edge-to-edge-insets", "scaffold", "adaptive-layouts", "adaptive-canonical-navigation"], step: "Call enableEdgeToEdge, set adjustResize for IME insets, choose Scaffold or WindowInsets handling per edge, and test system bars, cutouts, caption bars, and keyboard animation." },
      { id: "gestures", label: "Custom gesture behavior", route: ["pointer-input-gestures", "accessibility-testing"], step: "Prefer high-level gesture modifiers; if pointerInput is required, add explicit semantics, key it correctly, and consume events intentionally." },
      { id: "richInput", label: "Rich input paths", route: ["advanced-input-rich-content", "pointer-input-gestures", "focus-keyboard-input"], step: "Support drag/drop, clipboard, rich paste, stylus cancellation, hover, and right-click through the platform APIs that match each payload and device." },
      { id: "keyboard", label: "Keyboard/D-pad", route: ["focus-keyboard-input", "accessibility-testing"], step: "Define Tab, arrow, and D-pad traversal, visible focus cues, IME actions, and discoverable shortcuts before adding raw key handlers." },
      { id: "customLayout", label: "Custom measurement", route: ["custom-layouts", "advanced-layout-adaptation", "sizing", "alignment"], step: "Use `Layout` or `Modifier.layout` only for a unique measure/place contract; measure each child once and expose intrinsics or alignment lines when parents need them." },
      { id: "constraints", label: "Sibling constraints", route: ["constraint-layout", "custom-layouts", "row", "column", "box"], step: "Use ConstraintLayout only when sibling-relative constraints, guidelines, barriers, chains, or swappable ConstraintSets are clearer than Row/Column/Box composition." },
      { id: "visibility", label: "Viewport visibility", route: ["visibility-tracking", "lazy-lists", "effects-lifecycle", "stability-performance"], step: "Use onVisibilityChanged for thresholded visibility events, onLayoutRectChanged for throttled geometry, and stable item identity for once-only impressions." },
      { id: "graphics", label: "Custom drawing", route: ["drawing-graphics", "background-shape", "stability-performance"], step: "Use drawBehind, drawWithContent, drawWithCache, Canvas, Brush, or graphicsLayer based on draw order, caching needs, and whether transforms should affect only drawing." },
      { id: "assets", label: "Images/resources", route: ["images-resources", "accessibility-testing", "stability-performance"], step: "Localize text and image descriptions, choose painterResource, Image, Icon, AsyncImage, or a custom Painter by source, constrain image size, and keep Painter creation behind stable IDs or URLs." },
      { id: "searchFilter", label: "Search/filter UI", route: ["selection-inputs", "textfields", "focus-keyboard-input"], step: "Use SearchBar, chips, segmented buttons, or date/time pickers by task shape; hoist query, selected filters, expanded state, and confirm/dismiss events." },
      { id: "statusContent", label: "Loading/list content", route: ["status-content", "lazy-lists", "accessibility-testing"], step: "Use progress indicators, PullToRefreshBox, ListItem rows, dividers, or carousels by content state; keep refresh/loading state controlled and item identity stable." },
      { id: "transient", label: "Temporary surfaces", route: ["transient-surfaces", "effects-lifecycle", "accessibility-testing"], step: "Choose Badge, Tooltip, Menu, Snackbar, BottomSheet, or Dialog by urgency and anchoring; keep visibility state hoisted and dismiss surfaces from every completion path." },
      { id: "navSurfaces", label: "Navigation surfaces", route: ["navigation-surfaces", "scaffold", "adaptive-layouts", "adaptive-canonical-navigation"], step: "Choose NavigationSuiteScaffold for app-level destinations, TopAppBar for title/up/actions, and tabs only for peers inside one destination; keep selection state in one shell owner." },
      { id: "theme", label: "Brand theme", route: ["theming-design-system", "accessibility-testing"], step: "Define semantic color, typography, shape, and product tokens at the theme root; use CompositionLocal only for broadly consumed tree-scoped values." },
      { id: "list", label: "Large list or paging", route: ["lazy-lists", "visibility-tracking", "stability-performance"], step: "Use lazy containers, stable item keys, visibility-aware analytics, and measured performance fixes instead of eager composition." },
      { id: "interop", label: "View interop", route: ["interop-migration", "state-hoisting-udf", "compose-ui-testing"], step: "Choose ComposeView, AndroidView, AndroidFragment, or AbstractComposeView intentionally, then test lifecycle disposal, state ownership, reset behavior, and nested scroll at the boundary." },
      { id: "motion", label: "Motion required", route: ["animation-motion", "advanced-animation-motion"], step: "Select animate*AsState, AnimatedVisibility, AnimatedContent, updateTransition, or Animatable based on state shape, interruption needs, and testability." },
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
        id: "viewmodel-lookup-route-boundary",
        severity: "Architecture",
        section: "viewmodel-lifecycle-di",
        title: "Keep ViewModel lookup at route boundaries.",
        why: "Calling `viewModel()` or `hiltViewModel()` from reusable content couples plain UI to a screen owner, DI graph, navigation destination, and Android lifecycle.",
        fix: "Call the lookup helper in a route, destination, graph, or entry composable, then pass UI state and events to reusable content.",
        detect: function (code) {
          const badNames = [];
          code.replace(/@Composable\s+(?:private\s+)?fun\s+([A-Za-z_][\w]*)\s*\([^)]*\)\s*\{([\s\S]*?)(?=\n@Composable|\n(?:private\s+)?fun\s+[A-Za-z_]|\nclass\s+|\nobject\s+|$)/g, function (_, name, body) {
            const routeLike = /(Route|Destination|NavHost|Graph|Entry)$/.test(name);
            const contentLike = /(Screen|Content|Card|Row|Item|List|Dialog|Sheet|Field)$/.test(name);
            if (!routeLike && contentLike && /\b(hiltViewModel|viewModel)\s*(?:<[^>]+>)?\s*\(/.test(body)) badNames.push(name);
          });
          return badNames.length ? "Found ViewModel lookup inside reusable UI: " + badNames.slice(0, 4).join(", ") + "." : "";
        },
      },
      {
        id: "viewmodel-stateflow-statein",
        severity: "State",
        section: "viewmodel-lifecycle-di",
        title: "Expose ViewModel UI streams as StateFlow with stateIn.",
        why: "A screen UI state stream should have a stable initial value, a single sharing policy, and predictable behavior across collectors.",
        fix: "Convert cold or combined ViewModel flows with `stateIn(viewModelScope, SharingStarted.WhileSubscribed(...), initialValue)`.",
        detect: function (code) {
          const hasViewModelUiFlow = /class\s+\w+ViewModel[\s\S]{0,1800}val\s+uiState\s*[:=][\s\S]{0,1000}(combine\s*\(|map\s*\{|flatMapLatest\s*\{|repository\.)/.test(code);
          return hasViewModelUiFlow && !/stateIn\s*\(/.test(code)
            ? "Found ViewModel `uiState` flow without `stateIn(...)`."
            : "";
        },
      },
      {
        id: "sharing-started-while-subscribed",
        severity: "Performance",
        section: "viewmodel-lifecycle-di",
        title: "Use WhileSubscribed for UI StateFlow pipelines.",
        why: "UI state pipelines often do expensive upstream work; `WhileSubscribed` keeps that work active while the UI observes it and can delay stopping briefly across rotations.",
        fix: "Use `SharingStarted.WhileSubscribed(...)` as the `stateIn` sharing policy for UI-facing ViewModel StateFlow pipelines.",
        detect: function (code) {
          return /stateIn\s*\(/.test(code) && !/SharingStarted\.WhileSubscribed\s*\(/.test(code)
            ? "Found `stateIn(...)` without `SharingStarted.WhileSubscribed(...)`."
            : "";
        },
      },
      {
        id: "savedstatehandle-small-keys",
        severity: "State",
        section: "viewmodel-lifecycle-di",
        title: "Save only minimal keys in SavedStateHandle.",
        why: "SavedStateHandle is backed by saved instance state. Large loaded data, lists, bitmaps, responses, and full screen state should be rebuilt from repositories.",
        fix: "Save a query, selected id, page key, or small filter enum, then reload larger data from the data layer.",
        detect: function (code) {
          return /\bsavedStateHandle\s*(?:\[\s*["'](?:results?|items?|list|bitmap|response|profile|uiState|screenState|state)["']\s*\]\s*=|\.set\s*\(\s*["'](?:results?|items?|list|bitmap|response|profile|uiState|screenState|state)["'])/.test(code)
            ? "Found loaded screen data being written to `SavedStateHandle`."
            : "";
        },
      },
      {
        id: "manual-viewmodel-construction",
        severity: "Architecture",
        section: "viewmodel-lifecycle-di",
        title: "Do not construct ViewModels with remember.",
        why: "`remember { MyViewModel(...) }` bypasses ViewModelStoreOwner scoping, saved state, factories, dependency injection, and lifecycle retention.",
        fix: "Use `viewModel()`, `hiltViewModel()`, or `viewModel(factory = ..., extras = ...)` from a route or destination boundary.",
        detect: function (code) {
          return /remember\s*\{[\s\S]{0,160}\w+ViewModel\s*\(/.test(code)
            ? "Found ViewModel construction inside `remember { ... }`."
            : "";
        },
      },
      {
        id: "repository-construction-in-composable",
        severity: "Architecture",
        section: "viewmodel-lifecycle-di",
        title: "Do not construct data-layer dependencies in composables.",
        why: "Repositories, Retrofit services, Room databases, and DataStore instances have app-level lifetimes and test seams that should not be hidden in UI code.",
        fix: "Inject data dependencies into a ViewModel or provide them from an app-level owner, then pass plain UI state to composables.",
        detect: function (code) {
          const blocks = code.split(/(?=@Composable\b)/).filter(function (part) { return /^@Composable\b/.test(part); });
          const badBlock = blocks.some(function (part) {
            const body = part.slice(0, 1200);
            return /\b\w+Repository\s*\(/.test(body) || /\bRetrofit\.Builder\s*\(/.test(body) || /\bRoom\.databaseBuilder\s*\(/.test(body) || /\bDataStoreFactory\.create\s*\(/.test(body);
          });
          return badBlock ? "Found data-layer dependency construction in a composable." : "";
        },
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
        id: "snapshot-plain-mutable-collection",
        severity: "State",
        section: "snapshot-state-runtime",
        title: "Do not hide mutable collections inside MutableState.",
        why: "Compose observes assignments to MutableState.value, not arbitrary in-place mutations inside a plain MutableList, MutableSet, or MutableMap.",
        fix: "Use `mutableStateListOf`/`mutableStateMapOf`, or assign a new immutable collection value whenever content changes.",
        detect: function (code) {
          return /mutableStateOf\s*\(\s*mutable(List|Set|Map)Of\s*\(/.test(code) || /\.value\.(add|remove|clear|put)\s*\(/.test(code) && /mutableStateOf\s*\(/.test(code)
            ? "Found `mutableStateOf` wrapping or mutating a plain mutable collection."
            : "";
        },
      },
      {
        id: "snapshot-state-not-remembered",
        severity: "State",
        section: "snapshot-state-runtime",
        title: "Remember local MutableState objects.",
        why: "A MutableState created directly in the composable body is recreated on every recomposition, so it cannot reliably preserve UI state.",
        fix: "Wrap local state with `remember { mutableStateOf(...) }` or `rememberSaveable { mutableStateOf(...) }`.",
        detect: function (code) {
          const sections = code.split(/(?=@Composable\b)/).filter(function (part) { return /^@Composable\b/.test(part); });
          const hasLocalState = sections.some(function (part) {
            const body = part.slice(0, 900).replace(/remember(?:Saveable)?\s*\{[\s\S]{0,180}mutableStateOf\s*\([^}]*\}/g, "");
            return /(?:val|var)\s+\w+(?:\s*:\s*MutableState<[^>]+>)?\s*=\s*mutableStateOf\s*\(/.test(body) || /\bby\s+mutableStateOf\s*\(/.test(body);
          });
          return hasLocalState
            ? "Found `mutableStateOf` in composable code without `remember` or `rememberSaveable`."
            : "";
        },
      },
      {
        id: "state-holder-mutable-state-leak",
        severity: "Architecture",
        section: "snapshot-state-runtime",
        title: "Keep MutableState private inside state holders.",
        why: "Exposing MutableState lets callers mutate state without going through the holder's intent methods, weakening the single source of truth.",
        fix: "Expose plain read-only values and public intent methods; keep `mutableStateOf` fields private.",
        detect: function (code) {
          return /(class|object)\s+\w+[\s\S]{0,700}(val|var)\s+\w+\s*:\s*MutableState<|MutableState<[^>]+>\s*=\s*mutableStateOf/.test(code) && !/private\s+(val|var)\s+\w+\s*:\s*MutableState</.test(code)
            ? "Found a state holder exposing `MutableState` directly."
            : "";
        },
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
        id: "identity-stateful-loop-needs-key",
        severity: "State",
        section: "composition-identity-retention",
        title: "Key stateful repeated content by logical identity.",
        why: "Repeated calls from the same call site use execution order unless you add `key`, so remembered state and effects can move to the wrong item after insert, remove, or reorder.",
        fix: "Wrap stateful repeated content in `key(item.id) { ... }`, or use lazy `items(..., key = { it.id })` for lazy containers.",
        detect: function (code) {
          const statefulLoop = /(?:forEach(?:Indexed)?\s*\{|for\s*\([^)]*\)\s*\{)[\s\S]{0,1000}\bremember(?:Saveable)?\s*\{/.test(code);
          return statefulLoop && !/\bkey\s*\(/.test(code) && !/\bitems\s*\([\s\S]{0,500}key\s*=/.test(code)
            ? "Found repeated content with local remembered state but no explicit key."
            : "";
        },
      },
      {
        id: "identity-unstable-key",
        severity: "State",
        section: "composition-identity-retention",
        title: "Do not use positional, random, or changing values as Compose keys.",
        why: "A key must identify the logical item. Index, random UUID, time, or mutable hash values make state restoration and effect continuity unreliable.",
        fix: "Use a stable unique id from the model, or a compound key such as `parent.id to child.id` when uniqueness depends on two identities.",
        detect: function (code) {
          return /(key\s*\(\s*(?:index|i)\b|key\s*=\s*\{\s*(?:index|i|_,\s*index)\b|UUID\.randomUUID\s*\(|Random\.\w+\s*\(|System\.currentTimeMillis\s*\(|\.hashCode\s*\(\s*\)\s*\})/.test(code)
            ? "Found an index, random, time, or hash-derived Compose key."
            : "";
        },
      },
      {
        id: "identity-movable-content-remembered",
        severity: "Runtime",
        section: "composition-identity-retention",
        title: "Remember movableContentOf instances.",
        why: "The movable content object carries the identity of the movable subtree; recreating it during recomposition defeats state preservation.",
        fix: "Create movable content with `val content = remember { movableContentOf { ... } }` and invoke that remembered value from each placement.",
        detect: function (code) {
          return /\bmovableContentOf(?:<[^>]+>)?\s*\{/.test(code) && !/remember\s*\{[\s\S]{0,180}\bmovableContentOf/.test(code)
            ? "Found `movableContentOf` without an enclosing `remember { ... }`."
            : "";
        },
      },
      {
        id: "identity-saveable-state-holder",
        severity: "State",
        section: "composition-identity-retention",
        title: "Use SaveableStateHolder for dynamic tabs, pages, or custom back stacks.",
        why: "rememberSaveable only saves while its owner participates in the saveable registry; temporarily removed tab/page/destination content needs a holder keyed by logical content id.",
        fix: "Create `rememberSaveableStateHolder()` and wrap switched content in `holder.SaveableStateProvider(tab.id) { ... }`.",
        detect: function (code) {
          const dynamicSwitch = /(selected(Tab|Page|Screen|Destination)|current(Tab|Page|Screen|Destination)|when\s*\(\s*\w+(Tab|Page|Screen|Destination)|HorizontalPager|Crossfade|AnimatedContent)/.test(code);
          return dynamicSwitch && /rememberSaveable\s*\{/.test(code) && !/(rememberSaveableStateHolder|SaveableStateProvider)/.test(code)
            ? "Found dynamic switched content using `rememberSaveable` without `SaveableStateHolder`."
            : "";
        },
      },
      {
        id: "identity-retain-android-owner",
        severity: "Lifecycle",
        section: "composition-identity-retention",
        title: "Do not retain Android owners or short-lived platform objects.",
        why: "Retained values can outlive the current Activity, View, Fragment, Context, or Lifecycle instance and leak them across configuration changes.",
        fix: "Retain only composition-scoped objects you would also be willing to keep in a ViewModel; use application context when a retained object needs context.",
        detect: function (code) {
          return /\bretain\s*\{[\s\S]{0,400}\b(Activity|Fragment|View|Lifecycle|LocalContext\.current|context as|requireContext\s*\(|requireActivity\s*\()/.test(code)
            ? "Found `retain` capturing an Android owner or short-lived platform object."
            : "";
        },
      },
      {
        id: "stability-mutable-model",
        severity: "Performance",
        section: "stability-performance",
        title: "Do not pass ordinary mutable UI models.",
        why: "Compose cannot observe normal `var` properties or mutable collections inside parameter objects, so stability inference and UI freshness both suffer.",
        fix: "Expose immutable UI models, create new values for changes, or use Compose state inside a type that truly owns mutation.",
        detect: function (code) {
          const mutableModel = /(data\s+class|class)\s+\w+[\s\S]{0,500}\b(var\s+\w+|Mutable(List|Set|Map)<)/.test(code);
          const composableUsesModel = /@Composable[\s\S]{0,500}\b[A-Za-z_]\w*\s*:\s*[A-Z][A-Za-z0-9_]*\b/.test(code);
          return mutableModel && composableUsesModel ? "Found a UI model with `var` or mutable collections passed near composable code." : "";
        },
      },
      {
        id: "stability-standard-collections",
        severity: "Performance",
        section: "stability-performance",
        title: "Check standard collection stability evidence.",
        why: "The Compose compiler treats `List`, `Set`, and `Map` interfaces as unstable because the underlying implementation may be mutable.",
        fix: "Use Kotlinx immutable collections, wrap external models in stable UI models, or rely on strong skipping only after measurement shows the tradeoff is acceptable.",
        detect: function (code) {
          return /@Composable[\s\S]{0,500}\b(List|Set|Map)<[A-Za-z0-9_<>,\s?]+>/.test(code) && !/(ImmutableList|ImmutableSet|ImmutableMap|PersistentList|PersistentSet|PersistentMap|persistentListOf|persistentSetOf|persistentMapOf)/.test(code)
            ? "Found a composable parameter using standard `List`, `Set`, or `Map` without immutable collection evidence."
            : "";
        },
      },
      {
        id: "stability-annotation-contract",
        severity: "Correctness",
        section: "stability-performance",
        title: "Stability annotations are contracts.",
        why: "`@Stable` and `@Immutable` override compiler inference. A false promise can make Compose skip when the UI should update.",
        fix: "Remove the annotation, make every property immutable, or route mutation through Compose-observable state before promising stability.",
        detect: function (code) {
          const annotated = /@(Stable|Immutable)\s+(?:data\s+)?class\s+\w+[\s\S]{0,600}/.test(code);
          const unsafe = /@(Stable|Immutable)\s+(?:data\s+)?class\s+\w+[\s\S]{0,600}\b(var\s+\w+|Mutable(List|Set|Map)<)/.test(code);
          return annotated && unsafe && !/mutableStateOf|SnapshotState(List|Map)|State<|by\s+mutable/.test(code)
            ? "Found `@Stable` or `@Immutable` on a type with ordinary mutable state."
            : "";
        },
      },
      {
        id: "stability-strong-skipping-disabled",
        severity: "Performance",
        section: "stability-performance",
        title: "Do not disable strong skipping casually.",
        why: "Strong skipping is the current default in Kotlin 2.0.20+ and lets restartable composables with unstable parameters still be skipped by identity.",
        fix: "Leave strong skipping enabled unless a measured correctness or performance issue requires a documented opt-out.",
        detect: function (code) {
          return /enableStrongSkippingMode\s*=\s*false/.test(code)
            ? "Found `enableStrongSkippingMode = false` without an obvious documented reason."
            : "";
        },
      },
      {
        id: "phase-high-frequency-composition-read",
        severity: "Performance",
        section: "stability-performance",
        title: "Move high-frequency visual reads to the latest phase.",
        why: "A state read in composition can recompose UI that only needed layout or drawing work.",
        fix: "Use lambda layout modifiers or draw modifiers such as `drawBehind`/`drawWithContent` when the changing value only affects layout or pixels.",
        detect: function (code) {
          const highFrequency = /(firstVisibleItemScrollOffset|scrollState\.value|listState\.firstVisibleItemIndex|animate\w*AsState|Animatable)/.test(code);
          const visualInComposition = /\.(background|alpha|graphicsLayer|offset|padding)\s*\([^)]*(scroll|offset|fraction|alpha|animated|value)/.test(code);
          return highFrequency && visualInComposition && !/(drawBehind|drawWithContent|Modifier\.offset\s*\{|graphicsLayer\s*\{)/.test(code)
            ? "Found high-frequency visual state read through eager modifier parameters."
            : "";
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
        id: "activity-result-unconditional-registration",
        severity: "System UI",
        section: "activity-results-permissions",
        title: "Register Activity Result launchers unconditionally.",
        why: "Activity Result launchers must be registered in the same order at a stable composable call site so Compose can keep the callback and launcher lifecycle correct.",
        fix: "Move `rememberLauncherForActivityResult` out of conditionals, loops, and branches; gate `launch(...)` or the visible button instead.",
        detect: function (code) {
          return /(if|when|forEach|for\s*\()\s*[\s\S]{0,260}rememberLauncherForActivityResult\s*\(/.test(code) ? "Found Activity Result launcher registration inside a conditional or loop." : "";
        },
      },
      {
        id: "activity-result-launch-event",
        severity: "Side effect",
        section: "activity-results-permissions",
        title: "Launch Activity Result flows from events, not composition.",
        why: "Launching a system UI flow from LaunchedEffect, SideEffect, or DisposableEffect can relaunch unexpectedly after recomposition, restoration, or navigation.",
        fix: "Call `launcher.launch(...)` from a click, explicit user event, or a ViewModel-driven one-shot event handled by the UI.",
        detect: function (code) {
          return /(LaunchedEffect|SideEffect|DisposableEffect)\s*\([\s\S]{0,400}\w+\.launch\s*\(/.test(code) ? "Found Activity Result launch from a composition effect." : "";
        },
      },
      {
        id: "activity-result-managed-unregister",
        severity: "Lifecycle",
        section: "activity-results-permissions",
        title: "Do not unregister managed Activity Result launchers.",
        why: "`rememberLauncherForActivityResult` returns a managed launcher; manual unregistering can break the composable call site's lifecycle.",
        fix: "Remove calls to `unregister()` on managed launchers and let Compose dispose the launcher with the composition.",
        detect: function (code) {
          return /rememberLauncherForActivityResult\s*\(/.test(code) && /\.unregister\s*\(/.test(code) ? "Found manual `unregister()` on a managed Activity Result launcher." : "";
        },
      },
      {
        id: "photo-picker-over-media-permission",
        severity: "Privacy",
        section: "activity-results-permissions",
        title: "Use Photo Picker for user-selected media.",
        why: "The system Photo Picker lets users select photos and videos without giving the app broad media library access.",
        fix: "Use `ActivityResultContracts.PickVisualMedia` and `PickVisualMediaRequest` for user-selected images or videos.",
        detect: function (code) {
          const asksBroadMedia = /(READ_MEDIA_IMAGES|READ_MEDIA_VIDEO|READ_EXTERNAL_STORAGE)/.test(code);
          return asksBroadMedia && /(photo|image|video|gallery|media)/i.test(code) && !/(PickVisualMedia|PhotoPicker)/.test(code) ? "Found broad media permission request for a user-selected media flow." : "";
        },
      },
      {
        id: "open-document-persist-uri",
        severity: "Data",
        section: "activity-results-permissions",
        title: "Persist OpenDocument URI access when storing it.",
        why: "A Uri returned by OpenDocument is not enough for durable access after process death or reboot unless the app persists the granted URI permission.",
        fix: "Call `contentResolver.takePersistableUriPermission(uri, Intent.FLAG_GRANT_READ_URI_PERMISSION)` before saving the Uri for later.",
        detect: function (code) {
          const storesDocument = /(store|save|database|rememberSaveable|later|onDocumentReady|saveForLater)/i.test(code);
          return /ActivityResultContracts\.OpenDocument|OpenDocument\s*\(/.test(code) && storesDocument && !/takePersistableUriPermission\s*\(/.test(code) ? "Found OpenDocument result stored for later without persistable URI permission." : "";
        },
      },
      {
        id: "permission-rationale-denial-state",
        severity: "UX",
        section: "activity-results-permissions",
        title: "Runtime permission UI needs rationale and denial states.",
        why: "Permission denial is a normal path. Users need context before a request and a usable UI after denial.",
        fix: "Check current grant state, show rationale when appropriate, request with `RequestPermission`, and render a denied/fallback state.",
        detect: function (code) {
          const requestsPermission = /(RequestPermission|RequestMultiplePermissions|ActivityResultContracts\.RequestPermission)/.test(code);
          return requestsPermission && !/(shouldShowRequestPermissionRationale|rationale|denied|PERMISSION_GRANTED|ContextCompat\.checkSelfPermission)/i.test(code) ? "Found runtime permission request with no obvious rationale, grant check, or denial UI." : "";
        },
      },
      {
        id: "notification-permission-sdk-gate",
        severity: "Compatibility",
        section: "activity-results-permissions",
        title: "Gate notification permission by Android 13+.",
        why: "`POST_NOTIFICATIONS` is a runtime permission on Android 13 and higher; older versions need notification-enabled checks, not the same permission request path.",
        fix: "Wrap `Manifest.permission.POST_NOTIFICATIONS` requests with `Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU` and handle existing notification settings.",
        detect: function (code) {
          return /POST_NOTIFICATIONS/.test(code) && !/(Build\.VERSION\.SDK_INT|VERSION_CODES\.TIRAMISU|TIRAMISU)/.test(code) ? "Found POST_NOTIFICATIONS request without an Android 13+ SDK gate." : "";
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
        id: "predictive-back-root-intercept",
        severity: "System UI",
        section: "predictive-back-shared-transitions",
        title: "Do not intercept root back when the system can own it.",
        why: "Root-level interception can prevent Android's predictive back-to-home and cross-activity previews from running.",
        fix: "Remove root `BackHandler` interception unless there is real in-app state to consume; let Navigation, Activity, or Material surfaces handle supported back paths.",
        detect: function (code) {
          const rootScope = /(class\s+\w+Activity|setContent\s*\{|RootShell|AppShell|MainActivity)/.test(code);
          const intercepts = /BackHandler\s*\(\s*(?:enabled\s*=\s*)?true[\s\S]{0,220}(finish\s*\(|moveTaskToBack\s*\(|exitProcess\s*\(|System\.exit)/.test(code);
          return rootScope && intercepts ? "Found root-level BackHandler that exits or finishes the app directly." : "";
        },
      },
      {
        id: "navhost-custom-motion-needs-pop-transitions",
        severity: "Motion",
        section: "predictive-back-shared-transitions",
        title: "Custom NavHost motion needs explicit pop transitions.",
        why: "Back gestures pop the stack. If forward transitions are customized but pop transitions are omitted, predictive back can feel unrelated to the forward motion.",
        fix: "Add `popEnterTransition` and `popExitTransition` alongside `enterTransition` and `exitTransition`, or intentionally use the default Navigation Compose back animation.",
        detect: function (code) {
          const customNavHost = /NavHost\s*\([\s\S]{0,900}(enterTransition|exitTransition)\s*=/.test(code);
          return customNavHost && !/(popEnterTransition|popExitTransition)\s*=/.test(code) ? "Found custom NavHost enter/exit transitions without matching pop transitions." : "";
        },
      },
      {
        id: "shared-transition-scope-missing",
        severity: "Motion",
        section: "predictive-back-shared-transitions",
        title: "Shared element modifiers need shared and animated visibility scopes.",
        why: "`sharedElement` and `sharedBounds` only work when both matching elements are inside a `SharedTransitionScope` and receive the transition's animated visibility scope.",
        fix: "Wrap the owner in `SharedTransitionLayout`, pass `SharedTransitionScope`, pass `AnimatedVisibilityScope` or `LocalNavAnimatedContentScope.current`, and use stable shared content keys.",
        detect: function (code) {
          const usesShared = /\.(sharedElement|sharedBounds)\s*\(/.test(code);
          const hasSharedScope = /(SharedTransitionLayout|SharedTransitionScope|sharedTransitionScope)/.test(code);
          const hasAnimatedScope = /(AnimatedVisibilityScope|LocalNavAnimatedContentScope|animatedVisibilityScope)/.test(code);
          return usesShared && (!hasSharedScope || !hasAnimatedScope) ? "Found shared element/bounds modifiers without both shared-transition and animated-visibility scope wiring." : "";
        },
      },
      {
        id: "predictive-back-progress-cancellation",
        severity: "Runtime",
        section: "predictive-back-shared-transitions",
        title: "Manual PredictiveBackHandler code must restore on cancellation.",
        why: "Predictive back progress is a Flow that can be cancelled when the gesture is aborted; custom UI state should be restored and the cancellation rethrown.",
        fix: "Wrap progress collection in `try/catch (e: CancellationException)`, restore visual state in the catch block, and rethrow.",
        detect: function (code) {
          return /PredictiveBackHandler\s*\(/.test(code) && !/CancellationException/.test(code) ? "Found manual `PredictiveBackHandler` progress handling without cancellation recovery." : "";
        },
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
        id: "adaptive-navigation-suite",
        severity: "Adaptive",
        section: "adaptive-canonical-navigation",
        title: "Use NavigationSuiteScaffold for top-level adaptive navigation.",
        why: "NavigationSuiteScaffold centralizes bar, rail, and drawer presentation from adaptive info instead of duplicating breakpoints across app shells.",
        fix: "Move top-level destinations into `NavigationSuiteScaffold.navigationSuiteItems`, keep selected destination saveable, and override `layoutType` only for a product-specific rule.",
        detect: function (code) {
          const manualSwitch = /(NavigationBar|NavigationRail|ModalNavigationDrawer|PermanentNavigationDrawer)[\s\S]{0,900}(NavigationBar|NavigationRail|ModalNavigationDrawer|PermanentNavigationDrawer)/.test(code);
          return manualSwitch && /(WindowSizeClass|currentWindowAdaptiveInfo|screenWidthDp)/.test(code) && !/NavigationSuiteScaffold/.test(code)
            ? "Found manual adaptive switching between navigation surfaces without `NavigationSuiteScaffold`."
            : "";
        },
      },
      {
        id: "adaptive-pane-key-saveable",
        severity: "State",
        section: "adaptive-canonical-navigation",
        title: "Pane destination keys must be saveable.",
        why: "Material 3 adaptive pane navigators preserve selected pane content across configuration changes when the content key can be saved.",
        fix: "Use a small `Parcelable` or otherwise saveable key with `rememberListDetailPaneScaffoldNavigator` or the supporting-pane navigator.",
        detect: function (code) {
          const paneNav = /(NavigableListDetailPaneScaffold|rememberListDetailPaneScaffoldNavigator|NavigableSupportingPaneScaffold|rememberSupportingPaneScaffoldNavigator)/.test(code);
          return paneNav && !/(@Parcelize|Parcelable|Serializable)/.test(code) ? "Found adaptive pane navigation without an obviously saveable pane key." : "";
        },
      },
      {
        id: "adaptive-supporting-pane-manual",
        severity: "Adaptive",
        section: "adaptive-canonical-navigation",
        title: "Use supporting-pane navigators instead of local Boolean panes.",
        why: "A local Boolean and Row cannot reproduce one-pane versus multi-pane visibility, default pane animation, or predictive back behavior.",
        fix: "Use `NavigableSupportingPaneScaffold` or `SupportingPaneScaffold` with `rememberSupportingPaneScaffoldNavigator`, `AnimatedPane`, and back behavior.",
        detect: function (code) {
          const manualTools = /Row\s*\{[\s\S]{0,700}if\s*\([^)]*(showTools|showPane|showSupporting|expanded)[^)]*\)[\s\S]{0,400}(Tool|Supporting|Details|Comments|Pane)/.test(code);
          return manualTools && !/(SupportingPaneScaffold|NavigableSupportingPaneScaffold|rememberSupportingPaneScaffoldNavigator)/.test(code)
            ? "Found manually toggled supporting pane content without an adaptive supporting-pane scaffold."
            : "";
        },
      },
      {
        id: "adaptive-deprecated-display-metrics",
        severity: "Compatibility",
        section: "adaptive-canonical-navigation",
        title: "Do not use deprecated Display metrics for adaptive sizing.",
        why: "Deprecated Display APIs can measure the physical screen or omit system decor instead of reporting the app window.",
        fix: "Use `currentWindowAdaptiveInfo` in Compose or WindowManager current window metrics outside Compose.",
        detect: function (code) {
          return /(defaultDisplay|getRealMetrics|getMetrics|getRealSize|getSize\s*\(|resources\.displayMetrics|DisplayMetrics)/.test(code)
            ? "Found deprecated or physical display metrics used for layout sizing."
            : "";
        },
      },
      {
        id: "adaptive-orientation-aspect-lock",
        severity: "Compatibility",
        section: "adaptive-canonical-navigation",
        title: "Do not lock orientation, resizability, or aspect ratio for adaptive apps.",
        why: "Large screens, foldables, split screen, and desktop windows require apps to handle resizing rather than forcing a phone-only envelope.",
        fix: "Remove `screenOrientation`, `resizeableActivity=\"false\"`, `minAspectRatio`, and `maxAspectRatio`; make layouts adapt to the app window.",
        detect: function (code) {
          return /(android:screenOrientation\s*=|android:resizeableActivity\s*=\s*["']false["']|android:(?:min|max)AspectRatio\s*=)/.test(code)
            ? "Found manifest configuration that restricts orientation, resizability, or aspect ratio."
            : "";
        },
      },
      {
        id: "adaptive-stretched-expanded-content",
        severity: "Layout",
        section: "adaptive-canonical-navigation",
        title: "Do not stretch phone content across expanded windows.",
        why: "Large windows should add panes, columns, or readable constraints instead of stretching single-column text and buttons.",
        fix: "Use canonical pane scaffolds, adaptive grids, `widthIn`, or component-local constraints to keep line lengths and actions readable.",
        detect: function (code) {
          const adaptiveContext = /(WindowSizeClass|currentWindowAdaptiveInfo|WIDTH_DP_EXPANDED|expanded|Expanded)/.test(code);
          const stretched = /(Text|Button|Column|LazyColumn)\s*\([\s\S]{0,220}Modifier\.fillMaxWidth\s*\(\s*\)/.test(code);
          const hasConstraint = /(widthIn|heightIn|LazyVerticalGrid|GridCells|BoxWithConstraints)/.test(code);
          return adaptiveContext && stretched && !hasConstraint ? "Found expanded-window code that appears to stretch single-column content with `fillMaxWidth()`." : "";
        },
      },
      {
        id: "adaptive-leaf-window-query",
        severity: "Architecture",
        section: "adaptive-canonical-navigation",
        title: "Keep global window queries out of reusable leaf components.",
        why: "Leaf cards and rows may be placed inside panes, rails, sheets, or grids where available space differs from the app window.",
        fix: "Query adaptive info at the app or content level, pass derived configuration down, or use the component's actual constraints with `BoxWithConstraints` or custom layout.",
        detect: function (code) {
          return /@Composable\s+fun\s+\w*(?:Card|Row|Item|Chip|Cell)\s*\([^)]*\)\s*\{[\s\S]{0,700}currentWindowAdaptiveInfo\s*\(/.test(code)
            ? "Found a reusable leaf composable querying global adaptive window info."
            : "";
        },
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
        id: "custom-modifier-chain",
        severity: "API design",
        section: "custom-modifiers",
        title: "Custom modifier factories must preserve the incoming chain.",
        why: "A `Modifier` extension that returns a fresh `Modifier` drops everything the caller placed before it.",
        fix: "Return `this then Element(...)`, `this.then(...)`, or call existing factories on `this` instead of starting from `Modifier`.",
        detect: function (code) {
          return /fun\s+Modifier\.\w+\s*\([^)]*\)\s*(?::\s*Modifier\s*)?=\s*Modifier\./.test(code)
            ? "Found a `Modifier` extension factory that starts from `Modifier.` instead of `this`."
            : "";
        },
      },
      {
        id: "custom-modifier-composed",
        severity: "Performance",
        section: "custom-modifiers",
        title: "Avoid composed for new custom modifier behavior.",
        why: "`composed {}` is no longer recommended for new custom modifiers; `Modifier.Node` is the lower-level API designed for better performance.",
        fix: "Use chained existing modifiers, a composable modifier factory for high-level Compose APIs, or `Modifier.Node` for reusable custom behavior.",
        detect: function (code) { return /\bcomposed\s*\{|\.\s*composed\s*\(/.test(code) ? "Found `composed` in custom modifier code." : ""; },
      },
      {
        id: "modifier-node-element-equality",
        severity: "Performance",
        section: "custom-modifiers",
        title: "ModifierNodeElement needs stable equality.",
        why: "Compose uses element equality to decide whether an existing node can be updated and reused. Instance equality can cause unnecessary updates or stale behavior.",
        fix: "Prefer a `data class` or `data object` element, or implement `equals` and `hashCode` manually.",
        detect: function (code) {
          const hasElement = /ModifierNodeElement\s*</.test(code);
          const hasStableEquality = /(data\s+(?:class|object)\s+\w+[\s\S]{0,160}ModifierNodeElement|override\s+fun\s+equals\s*\(|override\s+fun\s+hashCode\s*\()/.test(code);
          return hasElement && !hasStableEquality ? "Found `ModifierNodeElement` without data-class/data-object or explicit equality." : "";
        },
      },
      {
        id: "modifier-node-update",
        severity: "Runtime",
        section: "custom-modifiers",
        title: "Update existing Modifier.Node instances instead of recreating behavior.",
        why: "Node reuse is the performance point of `Modifier.Node`; update should mutate the existing node's fields to match new parameters.",
        fix: "Implement `override fun update(node: YourNode) { node.property = property }` for every parameter that affects behavior.",
        detect: function (code) {
          const hasNodeElement = /ModifierNodeElement\s*</.test(code);
          if (!hasNodeElement) return "";
          if (!/override\s+fun\s+update\s*\(\s*node\s*:/.test(code)) return "Found `ModifierNodeElement` without an `update(node)` implementation.";
          const updateBlock = (code.match(/override\s+fun\s+update\s*\(\s*node\s*:[\s\S]{0,500}?\}/) || [""])[0];
          return !/node\.\w+\s*=/.test(updateBlock) && !/invalidate(?:Draw|Measurement|Semantics)?\s*\(/.test(updateBlock)
            ? "Found `update(node)` without obvious node field updates or invalidation."
            : "";
        },
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
        severity: "Architecture",
        section: "compositionlocal-scope",
        title: "Reserve CompositionLocal for tree-scoped context.",
        why: "`CompositionLocal` is appropriate for theme tokens and broad local context, not for hiding screen state, repositories, navigation, or ViewModels.",
        fix: "Pass ordinary state and dependencies explicitly, or keep them at the route/state-holder boundary; keep CompositionLocal for design-system and ambient context values.",
        detect: function (code) {
          const badGeneric = /(compositionLocalOf|staticCompositionLocalOf)\s*<[^>]*(ViewModel|Repository|NavController|MutableState|StateFlow|Flow)[^>]*>\s*\{/.test(code);
          const badDefault = /(compositionLocalOf|staticCompositionLocalOf)\s*\{[\s\S]{0,300}(ViewModel|Repository|NavController|MutableState|StateFlow|Flow)/.test(code);
          return badGeneric || badDefault ? "Found a CompositionLocal default that looks like screen state or a dependency." : "";
        },
      },
      {
        id: "compositionlocal-hidden-dependency",
        severity: "Architecture",
        section: "compositionlocal-scope",
        title: "Do not hide screen dependencies behind Local* globals.",
        why: "Implicit dependencies make reusable composables harder to reason about, preview, and test.",
        fix: "Keep ViewModel, repository, and navigation ownership at the route boundary; pass only the state and event callbacks the child needs.",
        detect: function (code) {
          return /Local[A-Za-z0-9_]*(ViewModel|Repository|NavController)\b/.test(code) || /CompositionLocalProvider\s*\([\s\S]{0,250}provides\s+[A-Za-z_][\w]*(ViewModel|Repository|NavController)\b/.test(code)
            ? "Found a Local* dependency for ViewModel, repository, or navigation."
            : "";
        },
      },
      {
        id: "compositionlocal-ui-state",
        severity: "State",
        section: "compositionlocal-scope",
        title: "Keep screen UI state explicit instead of ambient.",
        why: "UI state should have one visible owner so state flows down and events flow up.",
        fix: "Pass `uiState` and event lambdas as parameters; reserve CompositionLocal for broad tree-scoped context.",
        detect: function (code) {
          return /Local[A-Za-z0-9_]*(UiState|ScreenState|MutableState|StateFlow|Flow)\b/.test(code) || /CompositionLocalProvider\s*\([\s\S]{0,250}provides\s+[A-Za-z_][\w]*(UiState|ScreenState|State|Flow)\b/.test(code)
            ? "Found screen state or observable state routed through a CompositionLocal."
            : "";
        },
      },
      {
        id: "compositionlocal-required-default",
        severity: "Previewability",
        section: "compositionlocal-scope",
        title: "Give CompositionLocal a safe default when possible.",
        why: "Required locals make tests and previews fail unless every caller remembers the provider.",
        fix: "Provide a reasonable default for tree-scoped values, or keep a required local so high in the app shell that missing it is difficult.",
        detect: function (code) {
          return /(compositionLocalOf|staticCompositionLocalOf)\s*<[^>]+>\s*\{\s*(?:error|throw)\s*\(/.test(code)
            ? "Found a CompositionLocal default that throws."
            : "";
        },
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
        id: "component-local-constraints",
        severity: "Architecture",
        section: "advanced-layout-adaptation",
        title: "Use component-local constraints for reusable layout decisions.",
        why: "A leaf component can be placed inside a pane, sheet, grid cell, or split window whose available width differs from the global app window.",
        fix: "Read global adaptive info at the route or shell, pass a simple mode down, or use `BoxWithConstraints`/custom layout for the component's actual constraints.",
        detect: function (code) {
          const reusable = /@Composable\s+fun\s+\w*(?:Card|Row|Item|Cell|Chip|Tile|Header|Content|Panel)\s*\([^)]*\)\s*\{[\s\S]{0,900}(currentWindowAdaptiveInfo|LocalConfiguration\.current|screenWidthDp|displayMetrics)/.test(code);
          return reusable ? "Found a reusable component making a global window/display-size decision." : "";
        },
      },
      {
        id: "boxwithconstraints-meaningful-breakpoints",
        severity: "Layout",
        section: "advanced-layout-adaptation",
        title: "Use meaningful bounded breakpoints in BoxWithConstraints.",
        why: "A BoxWithConstraints branch should describe a real local layout threshold and handle bounded versus unbounded constraints deliberately.",
        fix: "Use named compact/medium/expanded thresholds such as `maxWidth >= 480.dp`; avoid always-true checks like `maxWidth > 0.dp`.",
        detect: function (code) {
          const hasBox = /\bBoxWithConstraints\s*(?:\(|\{)/.test(code);
          return hasBox && /(maxWidth\s*>\s*0\.dp|maxHeight\s*>\s*0\.dp|if\s*\(\s*maxWidth\s*[<>]=?\s*\d+\.dp\s*\)\s*\w+\s*else\s*\w+)/.test(code) && !/(when\s*\{|>=\s*(360|400|480|600|720|840|1200)\.dp)/.test(code)
            ? "Found BoxWithConstraints branching without clear named or bounded breakpoints."
            : "";
        },
      },
      {
        id: "lazy-item-subcompose-overhead",
        severity: "Performance",
        section: "advanced-layout-adaptation",
        title: "Avoid unnecessary subcomposition in every lazy item.",
        why: "BoxWithConstraints, SubcomposeLayout, and nested lazy containers can split composition work per item and hurt scroll performance when the item does not truly need measured-dependent composition.",
        fix: "Move the constraint decision to the parent, pass a layout mode into items, or use Row/Column/Flow/custom Layout inside the item unless profiling proves subcomposition is needed.",
        detect: function (code) {
          const lazyBlock = /(LazyColumn|LazyRow|LazyVerticalGrid|LazyHorizontalGrid|LazyVerticalStaggeredGrid|LazyHorizontalStaggeredGrid)\s*(?:\([^)]*\))?\s*\{[\s\S]{0,2200}\bitems?\s*\([^)]*\)\s*\{[\s\S]{0,1400}\b(BoxWithConstraints|SubcomposeLayout|LazyRow)\s*(?:\(|\{)/m.test(code);
          return lazyBlock ? "Found per-item subcomposition inside a lazy container." : "";
        },
      },
      {
        id: "lookahead-approach-completion",
        severity: "Motion",
        section: "advanced-layout-adaptation",
        title: "Custom lookahead approach nodes need completion signals.",
        why: "ApproachLayoutModifierNode relies on measurement and placement progress signals to know whether to keep approaching or snap to the lookahead result.",
        fix: "Implement both `isMeasurementApproachInProgress` and `isPlacementApproachInProgress`, or use higher-level lookahead APIs such as `Modifier.animateBounds` when they fit.",
        detect: function (code) {
          const hasNode = /\bApproachLayoutModifierNode\b/.test(code);
          return hasNode && (!/isMeasurementApproachInProgress\s*\(/.test(code) || !/isPlacementApproachInProgress\s*\(/.test(code))
            ? "Found ApproachLayoutModifierNode without both approach progress functions."
            : "";
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
        id: "visibility-onfirstvisible-deprecated",
        severity: "Runtime",
        section: "visibility-tracking",
        title: "Avoid deprecated onFirstVisible for first-seen logic.",
        why: "`onFirstVisible()` is deprecated because its name is misleading in lazy lists and can fire again after an item scrolls away and back.",
        fix: "Use `onVisibilityChanged()` with explicit thresholds and track your own `seen` flag keyed by stable item identity.",
        detect: function (code) { return /\.onFirstVisible\s*(?:\(|\{)/.test(code) ? "Found deprecated `Modifier.onFirstVisible()`." : ""; },
      },
      {
        id: "visibility-impression-threshold",
        severity: "Quality",
        section: "visibility-tracking",
        title: "Visibility analytics need explicit threshold and duration.",
        why: "A visible callback without a fraction and duration can count one-pixel flashes or fast scroll-throughs as meaningful impressions.",
        fix: "Set `minFractionVisible` and `minDurationMs` according to the product's impression or autoplay contract.",
        detect: function (code) {
          const hasVisibility = /\.onVisibilityChanged\s*(?:\(|\{)/.test(code);
          const looksLikeTracking = /(impression|analytics|track|seen|autoplay|video|playback)/i.test(code);
          return hasVisibility && looksLikeTracking && (!/minFractionVisible\s*=/.test(code) || !/minDurationMs\s*=/.test(code))
            ? "Found visibility tracking without both `minFractionVisible` and `minDurationMs`."
            : "";
        },
      },
      {
        id: "visibility-layoutrect-throttle",
        severity: "Performance",
        section: "visibility-tracking",
        title: "Throttle or debounce geometry callbacks.",
        why: "`onLayoutRectChanged` can fire at scroll-frame frequency; heavy callbacks can hurt scroll performance.",
        fix: "Set `throttleMillis`, `debounceMillis`, or both, and send compact events instead of doing expensive work inline.",
        detect: function (code) {
          return /\.onLayoutRectChanged\s*(?:\(|\{)/.test(code) && !/(throttleMillis\s*=|debounceMillis\s*=)/.test(code)
            ? "Found `onLayoutRectChanged` without throttle/debounce parameters."
            : "";
        },
      },
      {
        id: "visibility-lazy-identity",
        severity: "State",
        section: "visibility-tracking",
        title: "Visibility state in lazy lists needs stable item identity.",
        why: "Once-only seen flags and impression callbacks must belong to the item, not to an incidental composition slot.",
        fix: "Use lazy `items(..., key = { item.id })` and key remembered seen state with the same stable id.",
        detect: function (code) {
          const lazyVisibility = /(LazyColumn|LazyVerticalGrid|LazyVerticalStaggeredGrid)\s*\{[\s\S]{0,2200}\.onVisibilityChanged\s*(?:\(|\{)/.test(code);
          return lazyVisibility && !/items\s*\([\s\S]{0,500}key\s*=/.test(code)
            ? "Found visibility tracking inside a lazy container without an obvious stable item key."
            : "";
        },
      },
      {
        id: "macrobenchmark-release-target",
        severity: "Performance",
        section: "performance-measurement",
        title: "Macrobenchmark needs a release-like target.",
        why: "Debuggable apps, debug Compose settings, and emulator timing do not represent production startup, frame timing, or compilation behavior.",
        fix: "Run Macrobenchmark against a non-debuggable/profileable release-like build on a physical device.",
        detect: function (code) {
          const hasBenchmark = /(MacrobenchmarkRule|measureRepeated\s*\()/.test(code);
          const debugTarget = /(debuggable\s*(?:=|\s)\s*true|isDebuggable\s*=\s*true|debugImplementation\s*\()/.test(code);
          const emulatorOnly = /(emulator|avd|managedDevice)/i.test(code) && !/(physical|device farm|firebase test lab)/i.test(code);
          if (hasBenchmark && debugTarget) return "Found Macrobenchmark code near a debuggable/debug target configuration.";
          if (hasBenchmark && emulatorOnly) return "Found Macrobenchmark code that appears to rely on emulator-only timing.";
          return "";
        },
      },
      {
        id: "macrobenchmark-metrics-iterations",
        severity: "Performance",
        section: "performance-measurement",
        title: "Macrobenchmarks should name metrics, compilation, and iterations explicitly.",
        why: "A benchmark without clear metrics, compilation mode, and iteration count is hard to compare before and after a performance change.",
        fix: "Pass metrics such as `StartupTimingMetric`, `FrameTimingMetric`, or `TraceSectionMetric`, set `CompilationMode`, and choose an explicit `iterations` count.",
        detect: function (code) {
          if (!/measureRepeated\s*\(/.test(code)) return "";
          const missing = [];
          if (!/(StartupTimingMetric|FrameTimingMetric|TraceSectionMetric)\s*\(/.test(code)) missing.push("metric");
          if (!/CompilationMode\./.test(code)) missing.push("CompilationMode");
          if (!/iterations\s*=/.test(code)) missing.push("iterations");
          return missing.length ? "Found `measureRepeated` without explicit " + missing.join(", ") + "." : "";
        },
      },
      {
        id: "baseline-profile-cuj-coverage",
        severity: "Performance",
        section: "performance-measurement",
        title: "Baseline Profiles should cover critical user journeys.",
        why: "A profile that only launches the app can miss Compose work in scrolling, navigation, animation, and important screen interactions.",
        fix: "Collect startup plus representative CUJs such as opening a destination, scrolling a lazy list, navigating tabs, typing, or running an animation.",
        detect: function (code) {
          const hasProfile = /(BaselineProfileRule|collect\s*\(\s*packageName\s*=)/.test(code);
          const hasRuntimeAction = /(fling|scroll|swipe|drag|click|navigate|pressKey|setText|performClick|performScroll|onNode|onElement|findObject\s*\([^)]*\)\s*\.)/.test(code);
          return hasProfile && !hasRuntimeAction ? "Found Baseline Profile collection without obvious non-launch user-journey actions." : "";
        },
      },
      {
        id: "jankstats-state-effect",
        severity: "Runtime",
        section: "performance-measurement",
        title: "Update JankStats UI state from an effect.",
        why: "Writing PerformanceMetricsState directly from the composable body can repeat on every recomposition and attach stale frame context.",
        fix: "Remember the holder from `LocalView.current`, then update `putState` and `removeState` from `LaunchedEffect`, `DisposableEffect`, `SideEffect`, or a `snapshotFlow` collector.",
        detect: function (code) {
          const writesState = /(PerformanceMetricsState|getHolderForHierarchy|\.putState\s*\(|\.removeState\s*\()/.test(code);
          const composableContext = /@Composable[\s\S]{0,1400}(PerformanceMetricsState|getHolderForHierarchy|\.putState\s*\(|\.removeState\s*\()/.test(code);
          const hasEffect = /(LaunchedEffect|DisposableEffect|SideEffect|snapshotFlow)\s*(?:\(|\{)/.test(code);
          return writesState && composableContext && !hasEffect ? "Found JankStats PerformanceMetricsState usage in composable code without an obvious effect boundary." : "";
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
        id: "disposable-empty-on-dispose",
        severity: "Runtime",
        section: "effects-lifecycle",
        title: "DisposableEffect cleanup must do real cleanup.",
        why: "An empty `onDispose` usually means the effect has the wrong lifecycle API or leaks registered work.",
        fix: "Remove the registered observer/listener/subscription in `onDispose`, or switch to another effect API if there is no cleanup.",
        detect: function (code) { return /DisposableEffect\s*\([^)]*\)\s*\{[\s\S]{0,900}onDispose\s*\{\s*(?:\/\/[^\n]*)?\s*\}/.test(code) ? "Found `DisposableEffect` with an empty `onDispose` block." : ""; },
      },
      {
        id: "snapshotflow-effect-scope",
        severity: "Runtime",
        section: "effects-lifecycle",
        title: "Collect snapshotFlow from an effect.",
        why: "`snapshotFlow` is a cold Flow and should be collected from a coroutine whose lifecycle is explicit.",
        fix: "Collect `snapshotFlow { ... }` inside `LaunchedEffect(keys)` and use Flow operators to gate emissions.",
        detect: function (code) {
          const hits = [];
          code.replace(/snapshotFlow\s*\{/g, function (_, offset) {
            const prefix = code.slice(Math.max(0, offset - 180), offset);
            if (!/LaunchedEffect\s*\([^)]*\)\s*\{[\s\S]{0,180}$/.test(prefix)) hits.push(offset);
          });
          return hits.length ? "Found `snapshotFlow` without a nearby enclosing `LaunchedEffect` collector." : "";
        },
      },
      {
        id: "produce-state-keys",
        severity: "Runtime",
        section: "effects-lifecycle",
        title: "Key produceState to the external source identity.",
        why: "`produceState` restarts from its keys; missing keys can keep a producer loading stale data.",
        fix: "Pass inputs such as id, url, repository, or subscription owner after `initialValue`.",
        detect: function (code) {
          return /produceState\s*<[^>]+>\s*\(\s*initialValue\s*=\s*[^,\n)]+\s*\)\s*\{/.test(code) || /produceState\s*\(\s*initialValue\s*=\s*[^,\n)]+\s*\)\s*\{/.test(code)
            ? "Found `produceState` with only an initial value and no restart keys."
            : "";
        },
      },
      {
        id: "derivedstate-cheap-expression",
        severity: "Performance",
        section: "effects-lifecycle",
        title: "Do not wrap cheap always-changing values in derivedStateOf.",
        why: "`derivedStateOf` is useful when inputs change more often than the derived result; otherwise it adds overhead.",
        fix: "Use a plain expression for cheap values like string concatenation or direct arithmetic that changes with every input.",
        detect: function (code) {
          const block = (code.match(/derivedStateOf\s*\{[\s\S]{0,220}?\}/) || [""])[0];
          return block && /(\$[A-Za-z_][\w]*|\+\s*[A-Za-z_][\w]*|[A-Za-z_][\w]*\s*\+\s*[A-Za-z_][\w]*)/.test(block) && !/(>|<|>=|<=|==|!=|distinct|firstVisibleItem|offset|scroll)/.test(block)
            ? "Found `derivedStateOf` around a cheap expression that likely changes as often as its inputs."
            : "";
        },
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
        id: "a11y-empty-label",
        severity: "Accessibility",
        section: "advanced-semantics",
        title: "Do not expose empty accessibility labels.",
        why: "An empty contentDescription or custom action label creates a focusable target with no useful announcement.",
        fix: "Use a meaningful localized label, or use `contentDescription = null` only for decorative images and icons.",
        detect: function (code) {
          return /(contentDescription\s*=\s*["']\s*["']|label\s*=\s*["']\s*["'])/.test(code)
            ? "Found an empty accessibility label."
            : "";
        },
      },
      {
        id: "semantics-clear-replacement",
        severity: "Accessibility",
        section: "advanced-semantics",
        title: "clearAndSetSemantics must replace the full contract.",
        why: "`clearAndSetSemantics` removes descendant meaning. On interactive UI, that is safe only when the replacement supplies label, role/state, and action.",
        fix: "Inside `clearAndSetSemantics`, provide contentDescription or text, role/stateDescription as needed, and onClick/custom actions for interactive behavior.",
        detect: function (code) {
          const hasClear = /clearAndSetSemantics\s*\{[\s\S]{0,500}?\}/.test(code);
          if (!hasClear) return "";
          const block = (code.match(/clearAndSetSemantics\s*\{[\s\S]{0,500}?\}/) || [""])[0];
          const hasLabel = /(contentDescription\s*=|text\s*=|stateDescription\s*=)/.test(block);
          const hasAction = /(onClick\s*\(|customActions\s*=|role\s*=)/.test(block);
          return (!hasLabel || !hasAction) ? "Found `clearAndSetSemantics` without an obvious replacement label and action/role." : "";
        },
      },
      {
        id: "semantics-custom-action-labels",
        severity: "Accessibility",
        section: "advanced-semantics",
        title: "Custom accessibility actions need labels and handled results.",
        why: "Assistive technologies present customActions by label, and the action lambda should return true only after handling the request.",
        fix: "Use `CustomAccessibilityAction(label = \"...\") { doAction(); true }` for every action.",
        detect: function (code) {
          if (!/customActions\s*=|CustomAccessibilityAction\s*\(/.test(code)) return "";
          const missingLabel = /CustomAccessibilityAction\s*\(\s*(?:action\s*=|\{)/.test(code) || /CustomAccessibilityAction\s*\([^)]*label\s*=\s*["']\s*["']/.test(code);
          const missingTrue = /CustomAccessibilityAction\s*\([\s\S]{0,300}\}\s*\)/.test(code) && !/CustomAccessibilityAction\s*\([\s\S]{0,300}\btrue\b[\s\S]{0,80}\)/.test(code);
          if (missingLabel && missingTrue) return "Found custom accessibility actions without useful labels and handled `true` results.";
          if (missingLabel) return "Found a custom accessibility action without a useful label.";
          if (missingTrue) return "Found a custom accessibility action without an obvious handled `true` result.";
          return "";
        },
      },
      {
        id: "semantics-live-region-assertive",
        severity: "Accessibility",
        section: "advanced-semantics",
        title: "Use assertive live regions sparingly.",
        why: "Assertive live regions interrupt current speech. Most status updates should be polite or user-triggered announcements.",
        fix: "Prefer `LiveRegionMode.Polite` for non-urgent updates, and reserve `Assertive` for critical time-sensitive alerts.",
        detect: function (code) { return /liveRegion\s*=\s*LiveRegionMode\.Assertive/.test(code) ? "Found `LiveRegionMode.Assertive`." : ""; },
      },
      {
        id: "semantics-traversal-group",
        severity: "Accessibility",
        section: "advanced-semantics",
        title: "Traversal indexes need a traversal group.",
        why: "`traversalIndex` only makes sense when TalkBack can sort within a deliberate traversal boundary.",
        fix: "Set `isTraversalGroup = true` on the parent group, then set `traversalIndex` on the focusable children that need custom ordering.",
        detect: function (code) {
          return /traversalIndex\s*=/.test(code) && !/isTraversalGroup\s*=\s*true/.test(code)
            ? "Found `traversalIndex` without `isTraversalGroup = true`."
            : "";
        },
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
        id: "drag-drop-target-not-remembered",
        severity: "Input",
        section: "advanced-input-rich-content",
        title: "Remember DragAndDropTarget callback objects.",
        why: "A drag target callback object carries drag lifecycle state; allocating it inline during recomposition can restart behavior and make accepted drops inconsistent.",
        fix: "Create the `DragAndDropTarget` inside `remember { object : DragAndDropTarget { ... } }`, then pass the remembered instance to `dragAndDropTarget`.",
        detect: function (code) {
          const usesTarget = /dragAndDropTarget\s*\(/.test(code) || /DragAndDropTarget/.test(code);
          const inlineObject = /target\s*=\s*object\s*:\s*DragAndDropTarget/.test(code) || /val\s+\w+\s*=\s*object\s*:\s*DragAndDropTarget/.test(code);
          const remembered = /remember\s*\{[\s\S]{0,350}object\s*:\s*DragAndDropTarget/.test(code);
          return usesTarget && inlineObject && !remembered ? "Found a `DragAndDropTarget` object that is not obviously remembered." : "";
        },
      },
      {
        id: "external-drag-permission",
        severity: "Input",
        section: "advanced-input-rich-content",
        title: "Request permissions before reading external drag payloads.",
        why: "Drops from other apps or windows can carry URIs that require temporary platform permission before the target reads them.",
        fix: "When accepting external drops, call `requestDragAndDropPermissions(event.toAndroidDragEvent())`, process the ClipData, then release the permission.",
        detect: function (code) {
          const target = /dragAndDropTarget\s*\(|DragAndDropTarget/.test(code);
          const externalSignal = /(toAndroidDragEvent|ClipData\.newUri|content:\/\/|DRAG_FLAG_GLOBAL|MIMETYPE_(?:TEXT|IMAGE|VIDEO|AUDIO)|uri\b|Uri\b)/.test(code);
          return target && externalSignal && !/requestDragAndDropPermissions\s*\(/.test(code) ? "Found drag/drop code that appears to handle external payloads without `requestDragAndDropPermissions`." : "";
        },
      },
      {
        id: "clipboard-sensitive-flag",
        severity: "Privacy",
        section: "advanced-input-rich-content",
        title: "Mark copied secrets as sensitive clipboard content.",
        why: "Passwords, tokens, and credentials should not be exposed in clipboard previews or unnecessary system surfaces.",
        fix: "Set `ClipDescription.EXTRA_IS_SENSITIVE` on the clip description when copying secrets, tokens, passwords, or credentials.",
        detect: function (code) {
          const copies = /(setClip\s*\(|setText\s*\(|ClipData\.newPlainText\s*\()/.test(code);
          const sensitive = /(password|secret|token|credential|apiKey|privateKey|authorization)/i.test(code);
          return copies && sensitive && !/EXTRA_IS_SENSITIVE/.test(code) ? "Found clipboard copy of likely sensitive content without `ClipDescription.EXTRA_IS_SENSITIVE`." : "";
        },
      },
      {
        id: "stylus-cancel-handling",
        severity: "Input",
        section: "advanced-input-rich-content",
        title: "Stylus MotionEvent code must handle cancellation.",
        why: "Palm rejection and interrupted strokes can produce ACTION_CANCEL or FLAG_CANCELED; committing those strokes leaves unwanted ink behind.",
        fix: "Handle `MotionEvent.ACTION_CANCEL` and check `MotionEvent.FLAG_CANCELED` on up events so canceled strokes are discarded or undone.",
        detect: function (code) {
          const stylus = /(pointerInteropFilter|MotionEvent|TOOL_TYPE_STYLUS|AXIS_PRESSURE|AXIS_TILT|AXIS_ORIENTATION|AXIS_DISTANCE)/.test(code);
          const axes = /(AXIS_PRESSURE|AXIS_TILT|AXIS_ORIENTATION|AXIS_DISTANCE)/.test(code);
          return stylus && axes && !/(ACTION_CANCEL|FLAG_CANCELED)/.test(code) ? "Found stylus MotionEvent axis handling without cancellation handling." : "";
        },
      },
      {
        id: "desktop-context-menu-right-click",
        severity: "Input",
        section: "advanced-input-rich-content",
        title: "Context menus need a mouse or touchpad path.",
        why: "Large-screen, ChromeOS, and desktop-window users expect context actions to work with right-click, not only touch long-press.",
        fix: "Pair long-press context menus with `PointerEventType` secondary-button handling or a platform context-click listener, and add hover feedback when appropriate.",
        detect: function (code) {
          const contextMenu = /(onLongClickLabel|onLongClick|context menu|ContextMenu|showMenu|openMenu)/i.test(code);
          const rightClick = /(isSecondaryPressed|PointerEventType\.Press|setOnContextClickListener|onContextClick|right-click|secondary button)/i.test(code);
          return contextMenu && !rightClick ? "Found context-menu behavior with no obvious right-click or secondary-button path." : "";
        },
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
        id: "animated-content-target-param",
        severity: "Motion",
        section: "advanced-animation-motion",
        title: "AnimatedContent must render its target-state parameter.",
        why: "AnimatedContent keys outgoing and incoming content from the lambda target value. Reading the outer state can make content identity and direction logic wrong during transitions.",
        fix: "Name the lambda parameter, such as `{ targetCount -> ... }`, and render that target value inside the content block.",
        detect: function (code) {
          const animated = /AnimatedContent\s*\([\s\S]{0,500}targetState\s*=/.test(code);
          if (!animated) return "";
          const open = code.match(/AnimatedContent\s*\([\s\S]{0,500}\)\s*\{([\s\S]{0,180})/);
          return open && !/->/.test(open[1]) ? "Found `AnimatedContent` content without an explicit target-state lambda parameter." : "";
        },
      },
      {
        id: "animate-content-size-order",
        severity: "Motion",
        section: "advanced-animation-motion",
        title: "Place animateContentSize before size-changing modifiers.",
        why: "`animateContentSize` reports animated size changes to layout only when it wraps the size modifiers whose changes it should animate.",
        fix: "Move `.animateContentSize()` before `.size`, `.height`, `.width`, `.requiredSize`, or `.defaultMinSize` in the modifier chain.",
        detect: function (code) {
          return /\.(?:size|height|width|requiredSize|requiredHeight|requiredWidth|defaultMinSize)\s*\([^)]*\)[\s\S]{0,220}\.animateContentSize\s*\(/.test(code)
            ? "Found a size modifier before `animateContentSize()` in the same chain."
            : "";
        },
      },
      {
        id: "animated-visibility-detached-exit",
        severity: "Motion",
        section: "advanced-animation-motion",
        title: "Attach custom exit work to AnimatedVisibility's Transition.",
        why: "AnimatedVisibility waits for animations on its own Transition before removing content. Independent animate*AsState exit work can be cut off when the content leaves.",
        fix: "Use `AnimatedVisibilityScope.transition.animate*` for custom enter/exit values that must complete before removal.",
        detect: function (code) {
          const block = /AnimatedVisibility\s*\([\s\S]{0,900}\{[\s\S]{0,900}animate\w*AsState/.test(code);
          return block && !/transition\.animate/.test(code) ? "Found `animate*AsState` inside `AnimatedVisibility` without using `transition.animate*`." : "";
        },
      },
      {
        id: "animation-labels",
        severity: "Tooling",
        section: "advanced-animation-motion",
        title: "Label animations for Animation Preview and traces.",
        why: "Anonymous animations are harder to inspect in Android Studio Animation Preview when multiple values or transitions run together.",
        fix: "Pass meaningful `label = ...` values to animate*AsState, updateTransition, AnimatedContent, AnimatedVisibility, and rememberInfiniteTransition.",
        detect: function (code) {
          const usesInspectable = /(animate\w+AsState\s*\(|updateTransition\s*\(|AnimatedContent\s*\(|AnimatedVisibility\s*\(|rememberInfiniteTransition\s*\()/.test(code);
          return usesInspectable && !/label\s*=/.test(code) ? "Found inspectable animation APIs without labels." : "";
        },
      },
      {
        id: "animatable-needs-coroutine-owner",
        severity: "Runtime",
        section: "advanced-animation-motion",
        title: "Animatable jobs need an event or effect coroutine owner.",
        why: "Animatable APIs are suspending and interruption-aware. Starting them from composition or without a clear coroutine owner can restart work or fail to compile.",
        fix: "Call `animateTo`, `animateDecay`, `snapTo`, or `stop` from `LaunchedEffect`, `pointerInput`, `rememberCoroutineScope().launch`, or another explicit event coroutine.",
        detect: function (code) {
          const usesAnimatable = /Animatable\s*\(/.test(code) && /\.(?:animateTo|animateDecay|snapTo|stop)\s*\(/.test(code);
          const owner = /(LaunchedEffect|pointerInput|rememberCoroutineScope|launch\s*\{|coroutineScope\s*\{|produceState)/.test(code);
          return usesAnimatable && !owner ? "Found `Animatable` suspending calls without an obvious coroutine owner." : "";
        },
      },
      {
        id: "animation-test-main-clock",
        severity: "Testing",
        section: "advanced-animation-motion",
        title: "Control Compose animation time in tests.",
        why: "ComposeTestRule exposes mainClock so animation tests can advance virtual time deterministically and inspect intermediate frames.",
        fix: "Set `mainClock.autoAdvance = false` for frame-level checks, trigger the state change, then use `advanceTimeBy` or `advanceTimeByFrame` before asserting.",
        detect: function (code) {
          const test = /(createComposeRule|ComposeTestRule|@Test|onNode|onRoot)/.test(code);
          const animation = /(animate\w+AsState|AnimatedContent|AnimatedVisibility|updateTransition|Animatable|rememberInfiniteTransition)/.test(code);
          return test && animation && !/mainClock/.test(code) ? "Found a Compose animation test without explicit `mainClock` control." : "";
        },
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
        id: "annotated-string-inline-styles",
        severity: "Text",
        section: "advanced-text-typography",
        title: "Use AnnotatedString for inline text styling.",
        why: "Splitting one sentence across several Text nodes breaks selection, wrapping, accessibility reading order, and link/span ownership.",
        fix: "Build one `AnnotatedString` with `SpanStyle` and `ParagraphStyle`, then render it in one `Text`.",
        detect: function (code) {
          const splitSentence = /Row\s*\{[\s\S]{0,700}Text\s*\([^)]*(?:color\s*=|fontWeight\s*=|fontStyle\s*=|textDecoration\s*=|style\s*=)[\s\S]{0,350}Text\s*\(/.test(code);
          return splitSentence && !/(buildAnnotatedString|SpanStyle|ParagraphStyle)/.test(code)
            ? "Found a Row that appears to split one styled sentence across multiple Text composables."
            : "";
        },
      },
      {
        id: "link-annotation-partial-links",
        severity: "Text",
        section: "advanced-text-typography",
        title: "Use LinkAnnotation for partial text links.",
        why: "Making a whole Text clickable for one inline link gives users the wrong hit target and loses link-specific styling and interaction semantics.",
        fix: "Use `buildAnnotatedString` with `withLink(LinkAnnotation.Url(..., styles = TextLinkStyles(...)))` for clickable text ranges.",
        detect: function (code) {
          const clickableText = /Text\s*\([\s\S]{0,450}(?:Modifier\.)?clickable\s*(?:\(|\{)/.test(code) || /ClickableText\s*\(/.test(code);
          const linkish = /(https?:\/\/|uriHandler|openUri|docs?|terms|privacy|link)/i.test(code);
          return clickableText && linkish && !/(LinkAnnotation|withLink|TextLinkStyles)/.test(code)
            ? "Found clickable text that looks like a link without `LinkAnnotation`."
            : "";
        },
      },
      {
        id: "selection-container-copyable-text",
        severity: "Text",
        section: "advanced-text-typography",
        title: "Wrap copyable text in SelectionContainer.",
        why: "Confirmation codes, legal copy, error details, and support identifiers often need exact user selection and copy behavior.",
        fix: "Wrap the copyable text region in `SelectionContainer`; use `DisableSelection` around controls inside that region.",
        detect: function (code) {
          const copyable = /Text\s*\([\s\S]{0,220}(copy|select|confirmation|code|token|receipt|legal|terms|error id|support id)/i.test(code);
          return copyable && !/SelectionContainer\s*\{/.test(code)
            ? "Found text that appears copyable by task, but no `SelectionContainer`."
            : "";
        },
      },
      {
        id: "paragraph-linebreak-hyphens",
        severity: "Text",
        section: "advanced-text-typography",
        title: "Configure line breaks and hyphenation for important paragraphs.",
        why: "Narrow cards, translated strings, and large font scales can produce poor paragraph wrapping without explicit line-break and hyphenation strategy.",
        fix: "Use `ParagraphStyle` or `TextStyle` with `lineBreak = LineBreak.Paragraph` and `hyphens = Hyphens.Auto` for body copy that must read well.",
        detect: function (code) {
          const paragraph = /Text\s*\([\s\S]{0,600}(longParagraph|paragraph|body copy|lineHeight\s*=|TextStyle\s*\(|Modifier\.width\s*\()/i.test(code);
          return paragraph && !/(LineBreak|Hyphens)/.test(code)
            ? "Found paragraph-like text without explicit `LineBreak` or `Hyphens` behavior."
            : "";
        },
      },
      {
        id: "text-measure-cache",
        severity: "Performance",
        section: "advanced-text-typography",
        title: "Cache manual text measurement in draw code.",
        why: "Measuring text during every Canvas or draw pass can add avoidable per-frame work and jank.",
        fix: "Create a `TextMeasurer` with `rememberTextMeasurer`, measure inside `drawWithCache`, then call `drawText` from the cached draw block.",
        detect: function (code) {
          const drawing = /(Canvas\s*\(|drawBehind\s*\{|drawWithContent\s*\{)/.test(code);
          return drawing && /textMeasurer\.measure\s*\(/.test(code) && !/drawWithCache\s*\{/.test(code)
            ? "Found `textMeasurer.measure(...)` in draw code without `drawWithCache`."
            : "";
        },
      },
      {
        id: "font-fallback-chain",
        severity: "Text",
        section: "advanced-text-typography",
        title: "Ship fonts with fallback and provider checks.",
        why: "A single brand font can miss scripts, symbols, weights, provider availability, or downloadable-font certificates and leave users with broken typography.",
        fix: "Define a `FontFamily` with local fallbacks, verify downloadable provider availability with `isAvailableOnDevice`, and guard variable-font axes by API level.",
        detect: function (code) {
          const fontStack = /(GoogleFont|FontFamily\s*\(|fontProvider|R\.font)/.test(code);
          const fallback = /(isAvailableOnDevice|fallback|noto|emoji|FontVariation|Build\.VERSION|certificates|R\.array|androidx\.compose\.ui\.text\.font\.Font\s*\()/i.test(code);
          return fontStack && !fallback
            ? "Found custom font usage without an obvious fallback, provider availability check, certificate, or variable-font guard."
            : "";
        },
      },
      {
        id: "emoji-legacy-device-test",
        severity: "Text",
        section: "advanced-text-typography",
        title: "Do not strip modern emoji or symbols.",
        why: "Filtering text down to ASCII breaks names, languages, symbols, and emoji; Compose text should preserve content and be tested on legacy devices where fallback matters.",
        fix: "Keep user text intact, rely on Compose and platform emoji support, and add regression coverage for recent emoji on API 30 or lower.",
        detect: function (code) {
          return /(filter\s*\{\s*it\.code\s*<\s*128|replace\s*\(\s*Regex\s*\(\s*["']\[\^\\p\{ASCII\}\]|strip emoji|remove emoji|ASCII-only)/i.test(code)
            ? "Found code that appears to strip non-ASCII text or emoji."
            : "";
        },
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
    if (s.gotchas_html) {
      const gbox = h("div", "gotchas", "<h4>⚠️ Common mistakes</h4>" + s.gotchas_html);
      if (s.gotchas_code) {
        const gc = h("div", "gotchas-code");
        const gch = h("div", "canon-head");
        gch.appendChild(h("div", "pg-label", esc(s.gotchas_code.caption || "See it in code")));
        const gcopy = h("button", "mini-copy", "Copy example");
        gcopy.type = "button";
        gcopy.addEventListener("click", function () { copyText(s.gotchas_code.code, gcopy, "Copy example"); });
        gch.appendChild(gcopy);
        gc.appendChild(gch);
        const gpre = h("pre"); gpre.innerHTML = kt(s.gotchas_code.code); gc.appendChild(gpre);
        gbox.appendChild(gc);
      }
      sec.appendChild(gbox);
    }
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
        { label: "Common mistakes", weight: 5, text: stripHtml(s.gotchas_html) + " " + ((s.gotchas_code && (s.gotchas_code.caption + " " + s.gotchas_code.code)) || "") },
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
