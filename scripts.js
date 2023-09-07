import { BOOKS_PER_PAGE, books, authors, genres } from "./data.js";

//Tests if books exist
const matches = books;
let page = 1;
const range = [0, BOOKS_PER_PAGE];

if (!books && !Array.isArray(books)) {
  throw new Error("Source required");
}

if (!range && range.length === 2) {
  throw new Error("Range must be an array with two numbers");
}

//List
const dataListItems = document.querySelector("[data-list-items]");
const dataListMessage = document.querySelector("[data-list-message]");
const dataListButton = document.querySelector("[data-list-button]");
const dataListActive = document.querySelector("[data-list-active]");
const dataListBlur = document.querySelector("[data-list-blur]");
const dataListImage = document.querySelector("[data-list-image]");
const dataListTitle = document.querySelector("[data-list-title]");
const dataListSubtitle = document.querySelector("[data-list-subtitle]");
const dataListDescription = document.querySelector("[data-list-description]");
const dataListClose = document.querySelector("[data-list-close]");

//search
const dataSearchHeader = document.querySelector("[data-header-search]");
const dataSearchOverlay = document.querySelector("[data-search-overlay]");
const dataSearchForm = document.querySelector("[data-search-form]");
const dataSearchTitle = document.querySelector("[data-search-title]");
const dataSearchGenres = document.querySelector("[data-search-genres]");
const dataSearchAuthors = document.querySelector("[data-search-authors]");
const dataSearchCancel = document.querySelector("[data-search-cancel]");

//settings
const dataSettingsHeader = document.querySelector("[data-header-settings]");
const dataSettingsOverlay = document.querySelector("[data-settings-overlay]");
const dataSettingsForm = document.querySelector("[data-settings-form]");
const dataSettingsTheme = document.querySelector("[data-settings-theme]");
const dataSettingsCancel = document.querySelector("[data-settings-cancel]");

//Displays books
const fragment = document.createDocumentFragment();
const extracted = matches.slice(0, 36);

//Preview books & Index
function createPreview(preview, index, bookTotal) {
  const { author: authorId, id, image, title } = preview;

  const showPreview = document.createElement("button");
  showPreview.classList = "preview";
  showPreview.setAttribute("data-preview", id);
  showPreview.innerHTML = /*html */ `
<img class="preview__image" src="${image}" />
<div class="preview__info">
<h3 class="preview__title">${title}</h3>
<div class="preview__author">${authors[authorId]}</div>
<div class="preview__index">Book ${index + 1} of ${bookTotal}</div>
</div> `;
  return showPreview;
}

function loadBooks() {
  const startIndex = (page - 1) * BOOKS_PER_PAGE;
  const endIndex = startIndex + BOOKS_PER_PAGE;
  const bookFragment = document.createDocumentFragment();
  const bookExtracted = matches.slice(startIndex, endIndex);

  for (let i = 0; i < bookExtracted.length; i++) {
    const preview = createPreview(
      bookExtracted[i],
      startIndex + i,
      matches.length
    );

    bookFragment.appendChild(preview);
  }
  dataListItems.appendChild(bookFragment);
  const remainingBooks = matches.length - page * BOOKS_PER_PAGE;
  dataListButton.innerHTML = /* html */ `
<span> Show more </span>
<span class = "list__remaining"> (${
    remainingBooks > 0 ? remainingBooks : 0
  }) </span>
 `;
  dataListButton.disabled = remainingBooks <= 0;
}

loadBooks();

dataListButton.addEventListener("click", () => {
  page++;
  loadBooks();
});

//Opens book summary

dataListItems.addEventListener("click", (event) => {
  dataListActive.showModal();

  const pathArray = Array.from(event.path || event.composedPath());
  let active;

  for (const node of pathArray) {
    if (active) break;
    const id = node?.dataset.preview;

    if (id) {
      const matchingBook = matches.find((book) => book.id === id);
      if (matchingBook) {
        active = matchingBook;
        break;
      }
    }
  }

  if (!active) {
    return;
  }

  dataListImage.src = active.image;
  dataListBlur.src = active.image;
  dataListTitle.textContent = active.title;
  const date = new Date(active.published);
  const published = date.getFullYear();
  dataListSubtitle.textContent = `${authors[active.author]} (${published})`;
  dataListDescription.textContent = active.description;
});

dataListClose.addEventListener("click", () => {
  dataListActive.close();
});

//Search

dataSearchHeader.addEventListener("click", () => {
  dataSearchOverlay.showModal();
  dataSearchTitle.focus();
});

//Populate Genres on Search
const genresFragment = document.createDocumentFragment();
const genreElement = document.createElement("option");
genreElement.value = "any";
genreElement.innerText = "All Genres";
genresFragment.appendChild(genreElement);

for (const [id, genre] of Object.entries(genres)) {
  const genreElement = document.createElement("option");
  genreElement.value = id;
  genreElement.innerText = genre;
  genresFragment.appendChild(genreElement);
}

dataSearchGenres.appendChild(genresFragment);

//Populate Authors on Search
const authorsFragment = document.createDocumentFragment();
const authorsElement = document.createElement("option");
authorsElement.value = "any";
authorsElement.innerText = "All Authors";
authorsFragment.appendChild(authorsElement);

for (const [id, author] of Object.entries(authors)) {
  const authorsElement = document.createElement("option");
  authorsElement.value = id;
  authorsElement.innerText = author;
  authorsFragment.appendChild(authorsElement);
}

dataSearchAuthors.appendChild(authorsFragment);

//Search More
dataSearchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const getData = new FormData(event.target);
  const filters = Object.fromEntries(getData);
  const result = [];

  for (const book of books) {
    const titleMatch =
      filters.title !== "" &&
      book.title
        .toLocaleLowerCase()
        .includes(filters.title.toLocaleLowerCase());
    const genreMatch =
      filters.genre !== "any" && book.genres.includes(filters.genre);
    const authorMatch =
      filters.author !== "any" &&
      book.author
        .toLocaleLowerCase()
        .includes(filters.author.toLocaleLowerCase());
    if (titleMatch || authorMatch || genreMatch) {
      result.push(book);
    }
  }

  if (result.length === 0) {
    dataListItems.innerHTML = "";
    dataListButton.disabled = true;
    dataListMessage.classList.add("list__message_show");
  } else {
    dataListMessage.classList.remove("list__message_show");
    dataListItems.innerHTML = "";
    const searchStartIndex = (page - 1) * BOOKS_PER_PAGE;
    const searchEndIndex = searchStartIndex + BOOKS_PER_PAGE;
    const searchBookFragment = document.createDocumentFragment();
    const searchBookExtracted = result.slice(searchStartIndex, searchEndIndex);
    for (const preview of searchBookExtracted) {
      const showPreview = createPreview(preview);
      searchBookFragment.appendChild(showPreview);
    }
    dataListItems.appendChild(searchBookFragment);
  }
  const remainingBooks = result.length - page * BOOKS_PER_PAGE;
  dataListButton.disabled = remainingBooks <= 0;
  dataSearchOverlay.close();
  dataSearchForm.reset();

  dataSearchCancel.addEventListener("click", () => {
    dataSearchOverlay.close();
  });
});

//Night & Day Theme
dataSettingsHeader.addEventListener("click", () => {
  dataSettingsOverlay.showModal();
});

const day = {
  dark: "10, 10, 20",
  light: "255, 255, 255",
};
const night = {
  dark: "255, 255, 255",
  light: "10, 10, 20",
};

dataSettingsForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(dataSettingsForm);
  const result = Object.fromEntries(formData);

  document.documentElement.style.setProperty(
    "--color-dark",
    result.theme === "night" ? night.dark : day.dark
  );
  document.documentElement.style.setProperty(
    "--color-light",
    result.theme === "night" ? night.light : day.light
  );
  dataSettingsOverlay.close();
});

dataSettingsCancel.addEventListener("click", () => {
  dataSettingsOverlay.close();
});
