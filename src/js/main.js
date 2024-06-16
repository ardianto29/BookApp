document.addEventListener("DOMContentLoaded", () => {
  const bookForm = document.getElementById("formDataBuku");
  const searchForm = document.getElementById("formSearch");
  const searchInput = document.getElementById("pencarian");
  const allBooksContainer = document.getElementById("allBooks");
  const uncompletedBooksContainer = document.getElementById("unCompletedBooks");
  const completedBooksContainer = document.getElementById("completedBooks");
  const editModal = document.getElementById("editModal");
  const closeModal = document.querySelector(".close");
  const editForm = document.getElementById("formEditBuku");
  const resetBtn = searchForm.querySelector(".reset-btn");

  let books = JSON.parse(localStorage.getItem("books")) || [];
  let editingBookId = null;

  const saveBooks = () => {
    localStorage.setItem("books", JSON.stringify(books));
  };

  const showNotification = (message, type) => {
    const notification = document.createElement("div");
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = "block";
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.display = "none";
      document.body.removeChild(notification);
    }, 2000);
  };

  const createBookElement = (book) => {
    const bookElement = document.createElement("div");
    bookElement.classList.add("book-item");
    bookElement.innerHTML = `
      <h3>${book.title}</h3>
      <p>Penulis: ${book.author}</p>
      <p>Genre: ${book.genre}</p>
      <p>Tahun: ${book.year}</p>
      <p>Status: ${book.isComplete ? "Sudah dibaca" : "Belum dibaca"}</p>
      <div class="buttons">
        <button class="btn edit-btn" style="background-color:green">Edit</button>
        <button class="btn delete-btn" style="background-color:red">Hapus</button>
        <button class="btn toggle-read-btn">
          ${book.isComplete ? "Tandai belum dibaca" : "Tandai sudah dibaca"}
        </button>
      </div>
    `;

    bookElement.querySelector(".edit-btn").addEventListener("click", () => {
      editingBookId = book.id;
      document.getElementById("editJudul").value = book.title;
      document.getElementById("editPenulis").value = book.author;
      document.getElementById("editGenre").value = book.genre;
      document.getElementById("editTahun").value = book.year;
      document.getElementById("editIsRead").checked = book.isComplete;
      editModal.style.display = "block";
    });

    bookElement.querySelector(".delete-btn").addEventListener("click", () => {
      books = books.filter((b) => b.id !== book.id);
      saveBooks();
      renderBooks();
      showNotification("Buku berhasil dihapus!", "danger");
    });

    bookElement
      .querySelector(".toggle-read-btn")
      .addEventListener("click", () => {
        book.isComplete = !book.isComplete;
        saveBooks();
        renderBooks();
        const statusMessage = book.isComplete
          ? "Sudah dibaca!"
          : "Belum dibaca!";
        showNotification(`Buku berhasil ditandai ${statusMessage}`, "success");
      });

    return bookElement;
  };

  const renderBooks = (filteredBooks = books) => {
    const activeTab = document.querySelector(".tabs-category .btn.active");
    const activeTabId = activeTab.dataset.target;

    allBooksContainer.innerHTML = "";
    uncompletedBooksContainer.innerHTML = "";
    completedBooksContainer.innerHTML = "";

    const booksToRender = filteredBooks.filter((book) => {
      if (activeTabId === "#allBooks") {
        return true;
      } else if (activeTabId === "#unCompletedBooks") {
        return !book.isComplete;
      } else if (activeTabId === "#completedBooks") {
        return book.isComplete;
      }
    });

    booksToRender.forEach((book) => {
      const bookElement = createBookElement(book);
      allBooksContainer.appendChild(bookElement);
      if (book.isComplete) {
        completedBooksContainer.appendChild(bookElement.cloneNode(true));
      } else {
        uncompletedBooksContainer.appendChild(bookElement.cloneNode(true));
      }
    });
  };

  const addBook = (event) => {
    event.preventDefault();
    const newBook = {
      id: editingBookId || Date.now(),
      title: bookForm.judul.value,
      author: bookForm.penulis.value,
      genre: bookForm.genre.value,
      year: parseInt(bookForm.tahun.value),
      isComplete: bookForm.isRead.checked,
    };

    if (editingBookId !== null) {
      books = books.map((book) =>
        book.id === editingBookId ? { ...newBook, id: editingBookId } : book
      );
      showNotification("Buku berhasil diperbarui!", "success");
      editingBookId = null;
    } else {
      books.push(newBook);
      showNotification("Buku berhasil ditambahkan!", "primary");
    }

    saveBooks();
    renderBooks();
    bookForm.reset();
  };

  const editBook = (event) => {
    event.preventDefault();
    const editedBook = {
      id: editingBookId,
      title: editForm.editJudul.value,
      author: editForm.editPenulis.value,
      genre: editForm.editGenre.value,
      year: parseInt(editForm.editTahun.value),
      isComplete: editForm.editIsRead.checked,
    };

    books = books.map((book) =>
      book.id === editingBookId ? editedBook : book
    );
    saveBooks();
    renderBooks();
    showNotification("Buku berhasil diperbarui!", "success");
    editForm.reset();
    editModal.style.display = "none";
  };

  const searchBooks = () => {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredBooks = books.filter(
      (book) =>
        book.title.toLowerCase().includes(searchTerm) ||
        book.author.toLowerCase().includes(searchTerm) ||
        book.genre.toLowerCase().includes(searchTerm) ||
        book.year.toString().includes(searchTerm)
    );

    renderBooks(filteredBooks);
  };

  bookForm.addEventListener("submit", addBook);
  editForm.addEventListener("submit", editBook);
  searchForm.addEventListener("submit", (e) => e.preventDefault()); // Prevent form submission
  resetBtn.addEventListener("click", () => {
    searchInput.value = "";
    renderBooks();
  });

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
        document
          .querySelectorAll(".btn")
          .forEach((btn) => btn.classList.remove("active"));
        event.target.classList.add("active");
        renderBooks();
      }
    });

  // Event listener untuk pencarian real-time
  searchInput.addEventListener("input", searchBooks);

  // Initial render
  renderBooks();
});
