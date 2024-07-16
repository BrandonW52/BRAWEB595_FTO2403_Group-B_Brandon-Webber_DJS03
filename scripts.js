// Imports data from data.js
import { books, authors, genres, BOOKS_PER_PAGE } from "./data.js";

let page = 1;
let matches = books;

// HTML Elements Object
const htmlElements = {
  head: document.querySelector("head"),
  header: document.querySelector("header"),

  dataSettingsOverlay: document.querySelector("[data-settings-overlay]"),
  dataSettingsForm: document.querySelector("[data-settings-form]"),
  dataSettingsTheme: document.querySelector("[data-settings-theme]"),
  dataSettingsCancel: document.querySelector("[data-settings-cancel]"),

  dataHeaderSearch: document.querySelector("[data-header-search]"),
  dataHeaderSettings: document.querySelector("[data-header-settings]"),

  dataSearchOverlay: document.querySelector("[data-search-overlay]"),
  dataSearchForm: document.querySelector("[data-search-form]"),
  dataSearchTitle: document.querySelector("[data-search-title]"),
  dataSearchGenres: document.querySelector("[data-search-genres]"),
  dataSearchAuthers: document.querySelector("[data-search-authors]"),
  dataSearchCancel: document.querySelector("[data-search-cancel]"),

  dataListItems: document.querySelector("[data-list-items]"),
  dataListBlur: document.querySelector("[data-list-blur]"),
  dataListImage: document.querySelector("[data-list-image]"),
  dataListTitle: document.querySelector("[data-list-title]"),
  dataListSubtitle: document.querySelector("[data-list-subtitle]"),
  dataListDescription: document.querySelector("[data-list-description]"),
  dataListMessage: document.querySelector("[data-list-message]"),
  dataListButton: document.querySelector("[data-list-button]"),
  dataListActive: document.querySelector("[data-list-active]"),
  dataListClose: document.querySelector("[data-list-close]"),
};

// Loads abstracted head meta data && Displays
document.addEventListener("DOMContentLoaded", () => {
  fetch("./meta.html")
    .then((response) => response.text())
    .then((data) => {
      htmlElements.head.innerHTML = data;
    })
    .catch((error) => console.error("Error fetching meta.html"));
});

// Loads abstracted svg data && Displays
// P.S. not working atm W.I.P.
// document.addEventListener("DOMContentLoaded", () => {
//   fetch("./svg.html")
//     .then((response) => response.text())
//     .then((data) => {
//       htmlElements.header.innerHTML = data;
//     })
//     .catch((error) => console.error("Error fetching meta.html"));
// });

const starting = document.createDocumentFragment();

for (const { author, id, image, title } of matches.slice(0, BOOKS_PER_PAGE)) {
  const element = document.createElement("button");
  element.classList = "preview";
  element.setAttribute("data-preview", id);

  element.innerHTML = `
        <img
            class="preview__image"
            src="${image}"
        />
        
        <div class="preview__info">
            <h3 class="preview__title">${title}</h3>
            <div class="preview__author">${authors[author]}</div>
        </div>
    `;

  starting.appendChild(element);
}

htmlElements.dataListItems.appendChild(starting);

const genreHtml = document.createDocumentFragment();
const firstGenreElement = document.createElement("option");
firstGenreElement.value = "any";
firstGenreElement.innerText = "All Genres";
genreHtml.appendChild(firstGenreElement);

for (const [id, name] of Object.entries(genres)) {
  const element = document.createElement("option");
  element.value = id;
  element.innerText = name;
  genreHtml.appendChild(element);
}

htmlElements.dataSearchGenres.appendChild(genreHtml);

const authorsHtml = document.createDocumentFragment();
const firstAuthorElement = document.createElement("option");
firstAuthorElement.value = "any";
firstAuthorElement.innerText = "All Authors";
authorsHtml.appendChild(firstAuthorElement);

for (const [id, name] of Object.entries(authors)) {
  const element = document.createElement("option");
  element.value = id;
  element.innerText = name;
  authorsHtml.appendChild(element);
}

htmlElements.dataSearchAuthers.appendChild(authorsHtml);

htmlElements.dataListButton.innerText = `Show more (${
  books.length - BOOKS_PER_PAGE
})`;
htmlElements.dataListButton.disabled =
  matches.length - page * BOOKS_PER_PAGE > 0;

htmlElements.dataListButton.innerHTML = `
    <span>Show more</span>
    <span class="list__remaining"> (${
      matches.length - page * BOOKS_PER_PAGE > 0
        ? matches.length - page * BOOKS_PER_PAGE
        : 0
    })</span>
`;

htmlElements.dataSearchCancel.addEventListener("click", () => {
  htmlElements.dataSearchOverlay.open = false;
});

htmlElements.dataSettingsCancel.addEventListener("click", () => {
  htmlElements.dataSettingsOverlay.open = false;
});

htmlElements.dataHeaderSearch.addEventListener("click", () => {
  htmlElements.dataSearchOverlay.open = true;
  htmlElements.dataSearchTitle.focus();
});

htmlElements.dataHeaderSettings.addEventListener("click", () => {
  htmlElements.dataSettingsOverlay.open = true;
});

htmlElements.dataListClose.addEventListener("click", () => {
  htmlElements.dataListActive.open = false;
});

// Checks user prefrance for color theme
if (
  window.matchMedia &&
  window.matchMedia("(prefers-color-scheme: dark)").matches
) {
  let theme = "night";
  toggleTheme(theme);
} else {
  let theme = "day";
  toggleTheme(theme);
}

// Handles color theme change
htmlElements.dataSettingsForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  const { theme } = Object.fromEntries(formData);
  toggleTheme(theme);

  htmlElements.dataSettingsOverlay.open = false;
});

// Switches between Light and Dark themes
function toggleTheme(theme) {
  if (theme === "night") {
    document.documentElement.style.setProperty("--color-dark", "255, 255, 255");
    document.documentElement.style.setProperty("--color-light", "10, 10, 20");
  } else {
    document.documentElement.style.setProperty("--color-dark", "10, 10, 20");
    document.documentElement.style.setProperty(
      "--color-light",
      "255, 255, 255"
    );
  }
}

htmlElements.dataSearchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  const filters = Object.fromEntries(formData);
  const result = [];

  for (const book of books) {
    let genreMatch = filters.genre === "any";

    for (const singleGenre of book.genres) {
      if (genreMatch) break;
      if (singleGenre === filters.genre) {
        genreMatch = true;
      }
    }

    if (
      (filters.title.trim() === "" ||
        book.title.toLowerCase().includes(filters.title.toLowerCase())) &&
      (filters.author === "any" || book.author === filters.author) &&
      genreMatch
    ) {
      result.push(book);
    }
  }

  page = 1;
  matches = result;

  if (result.length < 1) {
    htmlElements.dataListMessage.classList.add("list__message_show");
  } else {
    htmlElements.dataListMessage.classList.remove("list__message_show");
  }

  htmlElements.dataListItems.innerHTML = "";
  const newItems = document.createDocumentFragment();

  for (const { author, id, image, title } of result.slice(0, BOOKS_PER_PAGE)) {
    const element = document.createElement("button");
    element.classList = "preview";
    element.setAttribute("data-preview", id);

    element.innerHTML = `
            <img
                class="preview__image"
                src="${image}"
            />
            
            <div class="preview__info">
                <h3 class="preview__title">${title}</h3>
                <div class="preview__author">${authors[author]}</div>
            </div>
        `;

    newItems.appendChild(element);
  }

  htmlElements.dataListItems.appendChild(newItems);
  htmlElements.dataListButton.disabled =
    matches.length - page * BOOKS_PER_PAGE < 1;

  htmlElements.dataListButton.innerHTML = `
        <span>Show more</span>
        <span class="list__remaining"> (${
          matches.length - page * BOOKS_PER_PAGE > 0
            ? matches.length - page * BOOKS_PER_PAGE
            : 0
        })</span>
    `;

  window.scrollTo({ top: 0, behavior: "smooth" });
  htmlElements.dataSearchOverlay.open = false;
});

htmlElements.dataListButton.addEventListener("click", () => {
  const fragment = document.createDocumentFragment();

  for (const { author, id, image, title } of matches.slice(
    page * BOOKS_PER_PAGE,
    (page + 1) * BOOKS_PER_PAGE
  )) {
    const element = document.createElement("button");
    element.classList = "preview";
    element.setAttribute("data-preview", id);

    element.innerHTML = `
            <img
                class="preview__image"
                src="${image}"
            />
            
            <div class="preview__info">
                <h3 class="preview__title">${title}</h3>
                <div class="preview__author">${authors[author]}</div>
            </div>
        `;

    fragment.appendChild(element);
  }

  htmlElements.dataListItems.appendChild(fragment);
  page += 1;
});

htmlElements.dataListItems.addEventListener("click", (event) => {
  const pathArray = Array.from(event.path || event.composedPath());
  let active = null;

  for (const node of pathArray) {
    if (active) break;

    if (node?.dataset?.preview) {
      let result = null;

      for (const singleBook of books) {
        if (result) break;
        if (singleBook.id === node?.dataset?.preview) result = singleBook;
      }

      active = result;
    }
  }

  if (active) {
    htmlElements.dataListActive.open = true;
    htmlElements.dataListBlur.src = active.image;
    htmlElements.dataListImage.src = active.image;
    htmlElements.dataListTitle.innerText = active.title;
    htmlElements.dataListSubtitle.innerText = `${
      authors[active.author]
    } (${new Date(active.published).getFullYear()})`;
    htmlElements.dataListDescription.innerText = active.description;
  }
});
