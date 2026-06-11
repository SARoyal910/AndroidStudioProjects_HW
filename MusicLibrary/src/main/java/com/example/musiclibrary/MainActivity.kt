// =============================================================================
// MainActivity.kt  —  PRACTICE SOLUTION: Music Library
//
// One small app that solves all three practice problems cumulatively, the same
// way NavThreeScreen → NavFourScreen → NavViewModelState build on each other:
//
//   • PROBLEM 1 (like NavThreeScreen): a 3-deep drill-down where each key carries
//       an id   — Artists → Albums → AlbumDetail.
//   • PROBLEM 2 (like NavFourScreen):  a 4th screen reached by a BUTTON (not a
//       list tap), plus a multi-level "Start over" pop — Tracks.
//   • PROBLEM 3 (like NavViewModelState): shared "liked albums" state in a
//       ViewModel (survives rotation/navigation), shown as ❤️ across screens.
//
// Search this file for "PROBLEM 1/2/3" to see exactly which lines belong to each.
// =============================================================================
package com.example.musiclibrary

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation3.runtime.NavKey
import androidx.navigation3.runtime.entryProvider
import androidx.navigation3.runtime.rememberNavBackStack
import androidx.navigation3.ui.NavDisplay
import com.example.musiclibrary.ui.theme.MusicLibraryTheme
import kotlinx.serialization.Serializable

// ===========================================================================
// DATA  —  a tiny in-memory "music" data source (hardcoded for the exercise).
// ===========================================================================

data class Artist(val id: Int, val name: String)
data class Album(val id: Int, val artistId: Int, val title: String, val year: Int)
data class Track(val id: Int, val albumId: Int, val title: String)

private val artists = listOf(
    Artist(1, "Nova"),
    Artist(2, "Echo Theory"),
)
private val albums = listOf(
    Album(10, 1, "First Light", 2021),
    Album(11, 1, "Afterglow", 2023),
    Album(20, 2, "Signals", 2020),
    Album(21, 2, "Reverb", 2022),
)
private val tracks = listOf(
    Track(100, 10, "Dawn"), Track(101, 10, "Ascend"), Track(102, 10, "Horizon"),
    Track(110, 11, "Glow"), Track(111, 11, "Embers"),
    Track(200, 20, "Ping"), Track(201, 20, "Carrier"),
    Track(210, 21, "Echoes"), Track(211, 21, "Tail"),
)

// Tiny lookups so a screen can resolve an id back to its object.
private fun artistById(id: Int): Artist = artists.first { it.id == id }
private fun albumById(id: Int): Album = albums.first { it.id == id }
private fun albumsByArtist(artistId: Int): List<Album> = albums.filter { it.artistId == artistId }
private fun tracksInAlbum(albumId: Int): List<Track> = tracks.filter { it.albumId == albumId }

// ===========================================================================
// NAVIGATION KEYS  —  one @Serializable NavKey per screen.
// PROBLEM 1 adds three; PROBLEM 2 adds the fourth (TracksKey).
// A `data object` carries no data; a `data class` carries an id argument.
// ===========================================================================

@Serializable
data object ArtistsKey : NavKey                               // screen 1 — no arguments

@Serializable
data class AlbumsKey(val artistId: Int) : NavKey              // screen 2 — which artist was tapped

@Serializable
data class AlbumDetailKey(val albumId: Int) : NavKey          // screen 3 — which album was tapped

@Serializable
data class TracksKey(val albumId: Int) : NavKey              // screen 4 (PROBLEM 2) — reached by a Button

// ===========================================================================
// ACTIVITY
// ===========================================================================

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            MusicLibraryTheme {
                Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
                    AppNavigation(modifier = Modifier.padding(innerPadding))
                }
            }
        }
    }
}

// ===========================================================================
// NAV HOST  —  the back stack + NavDisplay + the entryProvider map.
// ===========================================================================

@Composable
fun AppNavigation(modifier: Modifier = Modifier) {
    // The back stack, seeded with the first screen's key (state DOWN starts here).
    val backStack = rememberNavBackStack(ArtistsKey)

    // PROBLEM 3 — ONE LikedAlbumsViewModel, scoped to the Activity, shared by every
    // screen. Obtaining it here (not inside a screen) is what makes all screens see
    // the SAME liked set, and what makes it survive rotation/navigation.
    val likedVm: LikedAlbumsViewModel = viewModel()

    NavDisplay(
        backStack = backStack,
        modifier = modifier,
        onBack = { backStack.removeLastOrNull() },           // system Back = pop one key
        entryProvider = entryProvider {
            // ---- PROBLEM 1: the 3-deep drill-down ----------------------------
            entry<ArtistsKey> {
                ArtistsScreen(
                    artists = artists,
                    // Tapping an artist pushes AlbumsKey(artistId) → navigates forward.
                    onOpen = { artistId -> backStack.add(AlbumsKey(artistId)) },
                )
            }
            entry<AlbumsKey> { key ->
                // STATEFUL route bridges the shared ViewModel (PROBLEM 3) to the
                // stateless AlbumsScreen. The nav callbacks are built HERE (where the
                // back stack is in scope) and passed down, so the Route itself never
                // touches the back stack.
                AlbumsRoute(
                    artistId = key.artistId,
                    likedVm = likedVm,
                    onOpen = { albumId -> backStack.add(AlbumDetailKey(albumId)) },  // PROBLEM 1: drill deeper
                    onBack = { backStack.removeLastOrNull() },
                )
            }
            entry<AlbumDetailKey> { key ->
                AlbumDetailRoute(
                    albumId = key.albumId,
                    likedVm = likedVm,
                    onSeeTracks = { backStack.add(TracksKey(key.albumId)) },         // PROBLEM 2
                    onBack = { backStack.removeLastOrNull() },
                )
            }

            // ---- PROBLEM 2: a 4th screen reached by a Button + Start over -----
            entry<TracksKey> { key ->
                TracksScreen(
                    album = albumById(key.albumId),
                    tracks = tracksInAlbum(key.albumId),
                    onBack = { backStack.removeLastOrNull() },        // pop one level
                    // Multi-level pop: remove everything except the root (Artists).
                    onStartOver = { while (backStack.size > 1) backStack.removeLastOrNull() },
                )
            }
        },
    )
}

// ===========================================================================
// SCREEN 1 — Artists (stateless)
// ===========================================================================

@Composable
fun ArtistsScreen(
    artists: List<Artist>,
    onOpen: (Int) -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(modifier.fillMaxSize()) {
        Text("Artists", style = MaterialTheme.typography.titleLarge, modifier = Modifier.padding(16.dp))
        LazyColumn(modifier = Modifier.fillMaxSize()) {
            items(artists) { artist ->
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { onOpen(artist.id) }     // the tap → forward navigation
                        .padding(16.dp),
                ) {
                    Text(artist.name, style = MaterialTheme.typography.titleMedium)
                }
                HorizontalDivider()
            }
        }
    }
}

// ===========================================================================
// SCREEN 2 — Albums.  Route (stateful) observes liked; Screen (stateless) draws.
// ===========================================================================

@Composable
fun AlbumsRoute(
    artistId: Int,
    likedVm: LikedAlbumsViewModel,
    onOpen: (Int) -> Unit,
    onBack: () -> Unit,
) {
    // PROBLEM 3 — STATE DOWN: observe the shared liked set lifecycle-awarely.
    val liked by likedVm.liked.collectAsStateWithLifecycle()
    AlbumsScreen(
        artist = artistById(artistId),
        albums = albumsByArtist(artistId),
        likedIds = liked,
        onOpen = onOpen,
        onBack = onBack,
    )
}

@Composable
fun AlbumsScreen(
    artist: Artist,
    albums: List<Album>,
    likedIds: Set<Int>,
    onOpen: (Int) -> Unit,
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(modifier.fillMaxSize()) {
        Text("${artist.name} — albums", style = MaterialTheme.typography.titleLarge, modifier = Modifier.padding(16.dp))
        LazyColumn(modifier = Modifier.fillMaxWidth().weight(1f)) {
            items(albums) { album ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { onOpen(album.id) }
                        .padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text("${album.title} (${album.year})", style = MaterialTheme.typography.titleMedium)
                    }
                    // PROBLEM 3 — the ❤️ shows wherever this album's id is in the liked set.
                    if (album.id in likedIds) {
                        Text("❤️", style = MaterialTheme.typography.titleMedium)
                    }
                }
                HorizontalDivider()
            }
        }
        Button(onClick = onBack, modifier = Modifier.padding(16.dp)) { Text("Back") }
    }
}

// ===========================================================================
// SCREEN 3 — Album detail.  Route (stateful) + Screen (stateless).
// ===========================================================================

@Composable
fun AlbumDetailRoute(
    albumId: Int,
    likedVm: LikedAlbumsViewModel,
    onSeeTracks: () -> Unit,
    onBack: () -> Unit,
) {
    val liked by likedVm.liked.collectAsStateWithLifecycle()   // PROBLEM 3: state down
    val album = albumById(albumId)
    AlbumDetailScreen(
        album = album,
        isLiked = album.id in liked,
        onToggleLike = { likedVm.toggleLike(album.id) },         // PROBLEM 3: event UP
        onSeeTracks = onSeeTracks,                               // PROBLEM 2: button-driven forward nav
        onBack = onBack,
    )
}

@Composable
fun AlbumDetailScreen(
    album: Album,
    isLiked: Boolean,
    onToggleLike: () -> Unit,
    onSeeTracks: () -> Unit,
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier.fillMaxSize().padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Text(album.title, style = MaterialTheme.typography.headlineSmall)
        Text("Released ${album.year}", style = MaterialTheme.typography.bodyMedium)

        // PROBLEM 3 — like/unlike; the label reflects the observed isLiked state.
        Button(onClick = onToggleLike) {
            Text(if (isLiked) "❤️ Unlike" else "🤍 Like")
        }

        // PROBLEM 2 — navigate FORWARD to the 4th screen via a Button (not a list tap).
        Button(onClick = onSeeTracks) { Text("See tracks") }

        Button(onClick = onBack) { Text("Back") }
    }
}

// ===========================================================================
// SCREEN 4 — Tracks (PROBLEM 2).  Reached by the "See tracks" button.
// ===========================================================================

@Composable
fun TracksScreen(
    album: Album,
    tracks: List<Track>,
    onBack: () -> Unit,
    onStartOver: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(modifier.fillMaxSize()) {
        Text("${album.title} — tracks", style = MaterialTheme.typography.titleLarge, modifier = Modifier.padding(16.dp))
        LazyColumn(modifier = Modifier.fillMaxWidth().weight(1f)) {
            items(tracks) { track ->
                Text(track.title, modifier = Modifier.fillMaxWidth().padding(16.dp))
                HorizontalDivider()
            }
        }
        Row(
            modifier = Modifier.fillMaxWidth().padding(16.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            Button(onClick = onBack) { Text("Back") }                 // pop ONE level
            // PROBLEM 2 — the multi-level pop: jumps straight back to Artists.
            Button(onClick = onStartOver) { Text("Start over") }
        }
    }
}

// ===========================================================================
// PREVIEWS  —  drive the STATELESS screens with hand-made data (no ViewModel).
// ===========================================================================

@Preview(name = "Artists", showBackground = true, widthDp = 320, heightDp = 480)
@Composable
fun ArtistsScreenPreview() {
    MusicLibraryTheme { ArtistsScreen(artists = artists, onOpen = {}) }
}

@Preview(name = "Albums (one liked)", showBackground = true, widthDp = 320, heightDp = 480)
@Composable
fun AlbumsScreenPreview() {
    MusicLibraryTheme {
        AlbumsScreen(
            artist = artistById(1),
            albums = albumsByArtist(1),
            likedIds = setOf(11),            // hand-made liked set so the ❤️ shows, no ViewModel
            onOpen = {},
            onBack = {},
        )
    }
}

@Preview(name = "Album detail (liked)", showBackground = true, widthDp = 320, heightDp = 480)
@Composable
fun AlbumDetailScreenPreview() {
    MusicLibraryTheme {
        AlbumDetailScreen(
            album = albumById(11),
            isLiked = true,
            onToggleLike = {},
            onSeeTracks = {},
            onBack = {},
        )
    }
}

@Preview(name = "Tracks", showBackground = true, widthDp = 320, heightDp = 480)
@Composable
fun TracksScreenPreview() {
    MusicLibraryTheme {
        TracksScreen(album = albumById(10), tracks = tracksInAlbum(10), onBack = {}, onStartOver = {})
    }
}
