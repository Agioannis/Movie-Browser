const API_KEY = "854bf386";
const BASE_URL = "https://www.omdbapi.com/";

const movieContainer = document.getElementById("movie-container");
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const categorySelect = document.getElementById("category-select");
const autocompleteList = document.getElementById("autocomplete-list");

let debounceTimer;

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

function showAutocomplete(movies) {
    autocompleteList.innerHTML = movies
        .map(
            (movie) => `
      <li class="list-group-item list-group-item-action" data-imdbid="${movie.imdbID}">
        ${movie.Title} (${movie.Year})
      </li>
    `
        )
        .join("");

    autocompleteList.querySelectorAll("li").forEach((item) => {
        item.addEventListener("click", () => {
            searchInput.value = item.textContent;
            autocompleteList.innerHTML = "";
            getMovies(item.textContent);
        });
    });
}

document.addEventListener("click", (e) => {
    if (!autocompleteList.contains(e.target) && e.target !== searchInput) {
        autocompleteList.innerHTML = "";
    }
});

async function getMovies(query = "batman") {
    try {
        const url = `${BASE_URL}?apikey=${API_KEY}&s=${encodeURIComponent(query)}`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.Response === "True") {
            displayMovies(data.Search);
        } else {
            movieContainer.innerHTML = `<p class="text-center text-warning">${data.Error || "No movies found!"
                }</p>`;
        }
    } catch (error) {
        movieContainer.innerHTML =
            '<p class="text-center text-danger">Failed to load movies. Please try again later.</p>';
        console.error("Error fetching from OMDb:", error);
    }
}

function displayMovies(movies) {
    movieContainer.innerHTML = "";

    movies.forEach((movie) => {
        const { Title, Poster, Year, imdbID, Type } = movie;

        const movieCard = document.createElement("div");
        movieCard.classList.add("movie-card");
        movieCard.style.cursor = "pointer";
        movieCard.innerHTML = `
      <img 
        src="${Poster !== "N/A"
                ? Poster
                : "https://via.placeholder.com/500x750?text=No+Image"
            }"
        alt="${Title}" class="movie-poster"
      />
      <div class="movie-info">
        <h5 class="movie-title">${Title}</h5>
        <div class="movie-meta">
          <span>${Year}</span> <span>${Type.toUpperCase()}</span>
        </div>
      </div>
    `;
        movieCard.addEventListener("click", () => showMovieDetails(imdbID));
        movieContainer.appendChild(movieCard);
    });
}

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
          <img src="${movie.Poster !== "N/A"
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

// Ανάκτηση αρχικών ταινιών (προεπιλεγμένα "batman")
getMovies();
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

    if (searchTerm) {
        getMovies(searchTerm);
    } else {
        getMovies();
    }
});
