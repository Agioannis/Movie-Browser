// =============================
// Configuration
// =============================

const API_KEY = "854bf386";
const BASE_URL = "https://www.omdbapi.com/";

// =============================
// Selectors
// =============================
const movieContainer = document.getElementById("movie-container");
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");

// =============================
// Fetch Functions
// =============================

async function getMovies(query = "batman") {
    try {
        const url = `${BASE_URL}?apikey=${API_KEY}&s=${encodeURIComponent(query)}`;
        const res = await fetch(url);
        const data = await res.json();

        // OMDb returns { Response: 'False', Error: 'Movie not found!' } when nothing is found
        if (data.Response === "True") {
            displayMovies(data.Search);
        } else {
            movieContainer.innerHTML = `<p class="text-center text-warning">${data.Error || "No movies found!"}</p>`;
        }
    } catch (error) {
        movieContainer.innerHTML = `<p class="text-center text-danger">Failed to load movies. Please try again later.</p>`;
        console.error("Error fetching from OMDb:", error);
    }
}

// =============================
// Display Movies
// =============================

function displayMovies(movies) {
    movieContainer.innerHTML = "";

    movies.forEach((movie) => {
        const { Title, Poster, Year, imdbID, Type } = movie;

        const movieCard = document.createElement("div");
        movieCard.classList.add("movie-card");

        movieCard.innerHTML = `
      <img 
        src="${Poster !== "N/A" ? Poster : 'https://via.placeholder.com/500x750?text=No+Image'}"
        alt="${Title}" class="movie-poster"
      />
      <div class="movie-info">
        <h5 class="movie-title">${Title}</h5>
        <div class="movie-meta">
          <span>${Year}</span>
          <span>${Type.toUpperCase()}</span>
        </div>
      </div>
    `;

        movieContainer.appendChild(movieCard);
    });
}

// =============================
// Event Listeners
// =============================

// Αρχική εμφάνιση (βάζουμε πρότυπο αναζήτησης)
getMovies();

// Αναζήτηση
searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (query) {
        getMovies(query);
    } else {
        getMovies();
    }
});
