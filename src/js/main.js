document.addEventListener("DOMContentLoaded", () => {
  const bookForm = document.getElementById("formDataBuku");
  const searchForm = document.getElementById("formSearch");
  const allBooksContainer = document.getElementById("allBooks");
  const uncompletedBooksContainer = document.getElementById("unCompletedBooks");
  const completedBooksContainer = document.getElementById("completedBooks");
  const editModal = document.getElementById("editModal");
  const closeModal = document.querySelector(".close");
  const editForm = document.getElementById("formEditBuku");

  let books = JSON.parse(localStorage.getItem("books")) || [];
  let editingBookId = null;

  // Function to save books to localStorage
  const saveBooks = () => {
    localStorage.setItem("books", JSON.stringify(books));
  };

  // Function to create a book element
  const createBookElement = (book) => {
    const bookElement = document.createElement("div");
    bookElement.classList.add("book-item");
    bookElement.innerHTML = `
      <h3>${book.judul}</h3>
      <p>Penulis: ${book.penulis}</p>
      <p>Genre: ${book.genre}</p>
      <p>Tahun: ${book.tahun}</p>
      <p>Status: ${book.isRead ? "Sudah dibaca" : "Belum dibaca"}</p>
      <div class="buttons">
        <button class="btn edit-btn">Edit</button>
        <button class="btn delete-btn">Hapus</button>
        <button class="btn toggle-read-btn">
          ${book.isRead ? "Tandai belum dibaca" : "Tandai sudah dibaca"}
        </button>
      </div>
    `;

    // Add event listener for "Edit" button
    bookElement.querySelector(".edit-btn").addEventListener("click", () => {
      editingBookId = book.id;
      document.getElementById("editJudul").value = book.judul;
      document.getElementById("editPenulis").value = book.penulis;
      document.getElementById("editGenre").value = book.genre;
      document.getElementById("editTahun").value = book.tahun;
      document.getElementById("editIsRead").checked = book.isRead;
      editModal.style.display = "block";
    });

    // Add event listener for "Delete" button
    bookElement.querySelector(".delete-btn").addEventListener("click", () => {
      books = books.filter((b) => b.id !== book.id);
      saveBooks();
      renderBooks();
    });

    // Add event listener for "Toggle Read" button
    bookElement
      .querySelector(".toggle-read-btn")
      .addEventListener("click", () => {
        book.isRead = !book.isRead;
        saveBooks();
        renderBooks();
      });

    return bookElement;
  };

  // Function to render books based on the active tab
  const renderBooks = () => {
    const activeTab = document.querySelector(".tabs-category .btn.active");
    const activeTabId = activeTab.dataset.target;

    // Clear all book containers
    allBooksContainer.innerHTML = "";
    uncompletedBooksContainer.innerHTML = "";
    completedBooksContainer.innerHTML = "";

    // Filter books based on the active tab
    const filteredBooks = books.filter((book) => {
      if (activeTabId === "#allBooks") {
        return true; // Show all books
      } else if (activeTabId === "#unCompletedBooks") {
        return !book.isRead; // Show only unread books
      } else if (activeTabId === "#completedBooks") {
        return book.isRead; // Show only read books
      }
    });

    // Render filtered books to their respective containers
    filteredBooks.forEach((book) => {
      const bookElement = createBookElement(book);
      allBooksContainer.appendChild(bookElement);
      if (book.isRead) {
        completedBooksContainer.appendChild(bookElement.cloneNode(true));
      } else {
        uncompletedBooksContainer.appendChild(bookElement.cloneNode(true));
      }
    });
  };

  // Function to add or edit a book
  const addOrEditBook = (event) => {
    event.preventDefault();
    const newBook = {
      id: editingBookId || Date.now(),
      judul: bookForm.judul.value,
      penulis: bookForm.penulis.value,
      genre: bookForm.genre.value,
      tahun: bookForm.tahun.value,
      isRead: bookForm.isRead.checked,
    };

    if (editingBookId !== null) {
      // Edit existing book
      books = books.map((book) =>
        book.id === editingBookId ? { ...newBook, id: editingBookId } : book
      );
      editingBookId = null;
    } else {
      // Add new book
      books.push(newBook);
    }

    saveBooks();
    renderBooks();
    bookForm.reset();
  };

  // Function to save edited book
  const saveEditedBook = (event) => {
    event.preventDefault();
    const editedBook = {
      id: editingBookId,
      judul: editForm.editJudul.value,
      penulis: editForm.editPenulis.value,
      genre: editForm.editGenre.value,
      tahun: editForm.editTahun.value,
      isRead: editForm.editIsRead.checked,
    };
    books = books.map((book) =>
      book.id === editingBookId ? editedBook : book
    );
    saveBooks();
    renderBooks();
    editingBookId = null;
    editModal.style.display = "none";
  };

  // Function to search books
  const searchBooks = (event) => {
    event.preventDefault();
    const searchTerm = searchForm.pencarian.value.toLowerCase();
    const filteredBooks = books.filter((book) =>
      book.judul.toLowerCase().includes(searchTerm)
    );

    allBooksContainer.innerHTML = "";
    uncompletedBooksContainer.innerHTML = "";
    completedBooksContainer.innerHTML = "";

    filteredBooks.forEach((book) => {
      const bookElement = createBookElement(book);
      allBooksContainer.appendChild(bookElement);
      if (book.isRead) {
        completedBooksContainer.appendChild(bookElement.cloneNode(true));
      } else {
        uncompletedBooksContainer.appendChild(bookElement.cloneNode(true));
      }
    });
  };

  // Event listeners
  bookForm.addEventListener("submit", addOrEditBook);
  searchForm.addEventListener("submit", searchBooks);
  editForm.addEventListener("submit", saveEditedBook);
  closeModal.addEventListener("click", () => {
    editModal.style.display = "none";
  });

  window.addEventListener("click", (event) => {
    if (event.target === editModal) {
      editModal.style.display = "none";
    }
  });

  document
    .querySelector(".tabs-category")
    .addEventListener("click", (event) => {
      if (event.target.classList.contains("btn")) {
        // Remove 'active' class from all buttons
        document
          .querySelectorAll(".btn")
          .forEach((btn) => btn.classList.remove("active"));

        // Add 'active' class to the clicked button
        event.target.classList.add("active");

        // Render books based on the active tab
        renderBooks();
      }
    });

  // Initial render
  renderBooks();
});
