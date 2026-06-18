#!/usr/bin/env node
// Assemble the self-contained ComposeMaster course from styles.css + engine.js + sections.json.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const css = readFileSync(join(here, "styles.css"), "utf8");
const engine = readFileSync(join(here, "engine.js"), "utf8");
const sections = JSON.parse(readFileSync(join(here, "sections.json"), "utf8"));
const out = join(here, "..", "compose-tutorial.html");

const html = `<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ComposeMaster — interactive Jetpack Compose encyclopedia</title>
<meta name="description" content="ComposeMaster is a deep interactive Jetpack Compose course and reference with live playgrounds, generated Kotlin, MaterialTheme, design-system tokens, custom layouts, ConstraintLayout, ConstraintSet, guidelines, barriers, chains, visibility tracking, onVisibilityChanged, onLayoutRectChanged, RelativeLayoutBounds, viewport-aware impressions, intrinsic measurements, Canvas graphics, draw modifiers, resources, stringResource, pluralStringResource, painterResource, Image, AsyncImage, ContentScale, SearchBar, AssistChip, FilterChip, InputChip, SuggestionChip, SegmentedButton, DatePicker, TimePicker, CircularProgressIndicator, LinearProgressIndicator, PullToRefreshBox, ListItem, HorizontalDivider, VerticalDivider, HorizontalMultiBrowseCarousel, HorizontalUncontainedCarousel, AlertDialog, Dialog, SnackbarHostState, ModalBottomSheet, DropdownMenu, TooltipBox, BadgedBox, TopAppBar, NavigationBar, NavigationRail, ModalNavigationDrawer, PrimaryTabRow, state hoisting, StateFlow, ViewModel boundaries, state-based TextFieldState input, InputTransformation, OutputTransformation, SecureTextField, Autofill, gestures, pointer input, focus traversal, keyboard and D-pad input, IME actions, shortcuts, lazy lists, lazy grids, staggered grids, Paging Compose, FlowRow, Pager, edge-to-edge, WindowInsets, system bars, display cutouts, keyboard insets, ComposeView, AndroidView, AndroidFragment, AbstractComposeView, ViewCompositionStrategy, View interop, migration strategy, Navigation Compose, Navigation 3, NavKey, NavDisplay, entryProvider, adaptive scenes, adaptive layouts, state saving, effects, performance, Macrobenchmark, Baseline Profiles, StartupTimingMetric, FrameTimingMetric, CompilationMode, JankStats, Compose compiler reports, Android Studio previews, tooling, lint, accessibility, Compose UI testing, animation, mastery drills, progress tracking, and official Android cross-checks.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
<style>${css}</style>
</head>
<body>
<button id="theme" class="theme-btn" aria-label="Toggle theme">🌙</button>
<div id="app" class="app">
  <aside class="sidebar">
    <div class="brand"><div class="logo">CM</div><div><b>ComposeMaster</b><span>Interactive Compose encyclopedia</span></div></div>
    <div id="nav"></div>
  </aside>
  <main class="main">
    <header class="hero">
      <span class="kick">Jetpack Compose · Material 3 · Interactive</span>
      <h1><em>ComposeMaster</em></h1>
      <p>The complete Compose layout and UI reference: mental models, state hoisting, StateFlow, MaterialTheme, design-system tokens, modifier order, sizing, spacing, Box/Row/Column, custom layouts, ConstraintLayout, ConstraintSet, guidelines, barriers, chains, visibility tracking, onVisibilityChanged, onLayoutRectChanged, RelativeLayoutBounds, viewport-aware impressions, intrinsic measurements, Canvas graphics, draw modifiers, resources, stringResource, pluralStringResource, painterResource, Image, AsyncImage, ContentScale, SearchBar, AssistChip, FilterChip, InputChip, SuggestionChip, SegmentedButton, DatePicker, TimePicker, CircularProgressIndicator, LinearProgressIndicator, PullToRefreshBox, ListItem, HorizontalDivider, VerticalDivider, HorizontalMultiBrowseCarousel, HorizontalUncontainedCarousel, AlertDialog, Dialog, SnackbarHostState, ModalBottomSheet, DropdownMenu, TooltipBox, BadgedBox, TopAppBar, NavigationBar, NavigationRail, ModalNavigationDrawer, PrimaryTabRow, lazy lists, lazy grids, staggered grids, Paging Compose, FlowRow, Pager, Material 3, state-based TextFieldState input, transformations, SecureTextField, Autofill, pointer input and gestures, focus traversal, keyboard and D-pad input, IME actions, shortcuts, edge-to-edge, WindowInsets, system bars, display cutouts, keyboard insets, ComposeView, AndroidView, AndroidFragment, AbstractComposeView, ViewCompositionStrategy, View interop, incremental migration, Navigation Compose, Navigation 3, NavKey, NavDisplay, entryProvider, adaptive scenes, adaptive layouts, state saving, effects, performance measurement, Macrobenchmark, Baseline Profiles, StartupTimingMetric, FrameTimingMetric, CompilationMode, JankStats, Compose compiler reports, Android Studio previews, tooling, lint, accessibility, Compose UI testing, animation, recipes, live previews, and generated Kotlin.</p>
      <p class="meta"><b>${sections.length} sections</b> · built for Android developers who want to predict Compose behavior, explain it clearly, and ship it correctly.</p>
    </header>
    <div id="sections"></div>
  </main>
</div>
<script>
const SECTIONS = ${JSON.stringify(sections)};
${engine}
</script>
</body>
</html>
`;

writeFileSync(out, html);
console.log("wrote", out, "(" + html.length + " bytes,", sections.length, "sections)");
