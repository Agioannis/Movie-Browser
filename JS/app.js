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
        movieCard.style.cursor = "pointer";
        movieCard.innerHTML = `
      <img 
        src="${Poster !== "N/A" ? Poster : 'https://via.placeholder.com/500x750?text=No+Image'}"
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

async function showMovieDetails(imdbID) {
    try {
        const url = `${BASE_URL}?apikey=${API_KEY}&i=${imdbID}&plot=full`;
        const res = await fetch(url);
        const movie = await res.json();

        // Ετοιμάζουμε τα ratings
        let ratings = '';
        if (movie.Ratings && movie.Ratings.length) {
            ratings = movie.Ratings.map(r => `<li>${r.Source}: <b>${r.Value}</b></li>`).join('');
            ratings = `<ul>${ratings}</ul>`;
        } else {
            ratings = "<div>No external ratings found.</div>";
        }

        // Εμφάνιση modal
        document.getElementById("movieModalLabel").innerText = movie.Title;
        document.getElementById("modalBody").innerHTML = `
      <div class="row">
        <div class="col-md-4 mb-3">
          <img src="${movie.Poster !== "N/A" ? movie.Poster : 'https://via.placeholder.com/500x750?text=No+Image'}" class="img-fluid rounded" />
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
        // Bootstrap 5 modal show
        const modal = new bootstrap.Modal(document.getElementById('movieModal'));
        modal.show();
    } catch (error) {
        alert("Failed to load movie details.");
    }
}

