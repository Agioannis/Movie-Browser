const API_KEY = "854bf386";
const BASE_URL = "https://www.omdbapi.com/";

const movieContainer = document.getElementById("movie-container");
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const categorySelect = document.getElementById("category-select");
const autocompleteList = document.getElementById("autocomplete-list");

let debounceTimer;

// Autocomplete event with debounce
searchInput.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    const query = searchInput.value.trim();
    if (query.length < 2) {
        autocompleteList.innerHTML = "";
        return;
    }
    debounceTimer = setTimeout(() => {
        fetchAutocomplete(query);
    }, 300);
});

// Autocomplete fetching function
async function fetchAutocomplete(query) {
    try {
        const url = `${BASE_URL}?apikey=${API_KEY}&s=${encodeURIComponent(query)}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.Response === "True") {
            showAutocomplete(data.Search);
        } else {
            autocompleteList.innerHTML = "";
        }
    } catch (error) {
        autocompleteList.innerHTML = "";
    }
}

// Show autocomplete suggestions with poster and dark style
function showAutocomplete(movies) {
    autocompleteList.innerHTML = movies
        .map(
            (movie) => `
      <li class="autocomplete-item" data-imdbid="${movie.imdbID}">
        <img src="${movie.Poster && movie.Poster !== "N/A"
                    ? movie.Poster
                    : "https://via.placeholder.com/40x60?text=No+Image"
                }" alt="${movie.Title}" style="width: 40px; height: 60px; object-fit: cover; border-radius: 3px; margin-right: 10px; display: inline-block; vertical-align: middle;">
        <span style="vertical-align: middle;">${movie.Title}</span>
      </li>
    `
        )
        .join("");

    // On suggestion click, show only this movie in the main grid!
    autocompleteList.querySelectorAll("li").forEach((item) => {
        item.addEventListener("click", () => {
            const imdbID = item.getAttribute("data-imdbid");
            autocompleteList.innerHTML = "";
            showSingleMovie(imdbID);
        });
    });
}

// Fetch and show a single movie in the results grid
async function showSingleMovie(imdbID) {
    try {
        const url = `${BASE_URL}?apikey=${API_KEY}&i=${imdbID}`;
        const res = await fetch(url);
        const movie = await res.json();
        if (movie.Response === "True" || movie.Title) {
            displayMovies([movie]);
        } else {
            movieContainer.innerHTML = '<p class="text-center text-warning">Movie not found.</p>';
        }
    } catch (error) {
        movieContainer.innerHTML = '<p class="text-center text-danger">Failed to load movie.</p>';
    }
}

// Close autocomplete when clicking outside
document.addEventListener("click", (e) => {
    if (!autocompleteList.contains(e.target) && e.target !== searchInput) {
        autocompleteList.innerHTML = "";
    }
});

// Fetch movies by query
async function getMovies(query = "batman") {
    try {
        const url = `${BASE_URL}?apikey=${API_KEY}&s=${encodeURIComponent(query)}`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.Response === "True") {
            displayMovies(data.Search);
        } else {
            movieContainer.innerHTML = `<p class="text-center text-warning">${data.Error || "No movies found!"}</p>`;
        }
    } catch (error) {
        movieContainer.innerHTML = '<p class="text-center text-danger">Failed to load movies. Please try again later.</p>';
        console.error("Error fetching from OMDb:", error);
    }
}

// Display array of movies in the grid
function displayMovies(movies) {
    movieContainer.innerHTML = "";

    movies.forEach((movie) => {
        const { Title, Poster, Year, imdbID, Type } = movie;

        const movieCard = document.createElement("div");
        movieCard.classList.add("movie-card");
        movieCard.style.cursor = "pointer";
        movieCard.innerHTML = `
      <img 
        src="${Poster && Poster !== "N/A" ? Poster : "https://via.placeholder.com/500x750?text=No+Image"}"
        alt="${Title}" class="movie-poster"
      />
      <div class="movie-info">
        <h5 class="movie-title">${Title}</h5>
        <div class="movie-meta">
          <span>${Year}</span> <span>${Type ? Type.toUpperCase() : ""}</span>
        </div>
      </div>
    `;
        movieCard.addEventListener("click", () => showMovieDetails(imdbID));
        movieContainer.appendChild(movieCard);
    });
}

// Show details modal for a movie
async function showMovieDetails(imdbID) {
    try {
        const url = `${BASE_URL}?apikey=${API_KEY}&i=${imdbID}&plot=full`;
        const res = await fetch(url);
        const movie = await res.json();

        let ratings = "";
        if (movie.Ratings && movie.Ratings.length) {
            ratings = movie.Ratings
                .map((r) => `<li>${r.Source}: <b>${r.Value}</b></li>`)
                .join("");
            ratings = `<ul>${ratings}</ul>`;
        } else {
            ratings = "<div>No external ratings found.</div>";
        }

        document.getElementById("movieModalLabel").innerText = movie.Title;
        document.getElementById("modalBody").innerHTML = `
      <div class="row">
        <div class="col-md-4 mb-3">
          <img src="${movie.Poster && movie.Poster !== "N/A"
                ? movie.Poster
                : "https://via.placeholder.com/500x750?text=No+Image"
            }" class="img-fluid rounded" />
        </div>
        <div class="col-md-8">
          <p><strong>Year:</strong> ${movie.Year}</p>
          <p><strong>Genre:</strong> ${movie.Genre}</p>
          <p><strong>Plot:</strong> ${movie.Plot}</p>
          <h6>Ratings:</h6>
          ${ratings}
        </div>
      </div>
    `;
        const modal = new bootstrap.Modal(document.getElementById("movieModal"));
        modal.show();
    } catch (error) {
        alert("Failed to load movie details.");
    }
}

// αρχικό φορτίο
getMovies();

// Form submit handler
searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    const category = categorySelect.value.trim();

    let searchTerm = "";
    if (query && category) {
        searchTerm = `${category} ${query}`;
    } else if (category) {
        searchTerm = category;
    } else if (query) {
        searchTerm = query;
    }

    getMovies(searchTerm);
});

// Category change auto-update handler
categorySelect.addEventListener("change", () => {
    const query = searchInput.value.trim();
    const category = categorySelect.value.trim();

    let searchTerm = "";
    if (query && category) {
        searchTerm = `${category} ${query}`;
    } else if (category) {
        searchTerm = category;
    } else if (query) {
        searchTerm = query;
    }

    getMovies(searchTerm);
});
