"use client";
import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Users,
  ShoppingCart,
  Download,
  Upload,
  Clock,
  Search,
  Trash,
  Edit,
  Plus,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { openDB } from "idb";
import { saveAs } from "file-saver";
import { motion } from "framer-motion";
import Fuse from "fuse.js";

// Types
interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  genre: string;
  totalCopies: number;
  availableCopies: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  membershipDate: string;
  currentRentals: number[];
  class: string;
}

interface Rental {
  id: number;
  bookId: number;
  userId: number;
  rentalDate: string;
  dueDate: string;
  returnDate?: string;
  customReturnDate?: string; // Add custom return date
}

interface SearchState {
  type: "id" | "name";
  query: string;
}

const LibraryManagementSystem: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "books" | "users" | "rentals" | "rentalHistory" | "unreturned" | "backup"
  >("books");

  // Initialize state with localStorage
  const [books, setBooks] = useState<Book[]>(() => {
    const localStorageBooks = localStorage.getItem("library-books");
    return localStorageBooks ? JSON.parse(localStorageBooks) : [];
  });

  const [users, setUsers] = useState<User[]>(() => {
    const localStorageUsers = localStorage.getItem("library-users");
    return localStorageUsers ? JSON.parse(localStorageUsers) : [];
  });

  const [rentals, setRentals] = useState<Rental[]>(() => {
    const localStorageRentals = localStorage.getItem("library-rentals");
    return localStorageRentals ? JSON.parse(localStorageRentals) : [];
  });

  const [lastBackupTime, setLastBackupTime] = useState<number | null>(() => {
    const storedTime = localStorage.getItem("lastBackupTime");
    return storedTime ? parseInt(storedTime, 10) : null;
  });

  const [backupInterval, setBackupInterval] = useState<NodeJS.Timeout | null>(
    null
  );

  // Search states
  const [bookSearch, setBookSearch] = useState<SearchState>({
    type: "id",
    query: "",
  });
  const [userSearch, setUserSearch] = useState<SearchState>({
    type: "id",
    query: "",
  });
  const [rentalUserSearch, setRentalUserSearch] = useState<SearchState>({
    type: "id",
    query: "",
  });
  const [rentalSearch, setRentalSearch] = useState<SearchState>({
    type: "id",
    query: "",
  });
  const [rentalHistorySearch, setRentalHistorySearch] = useState<SearchState>({
    type: "id",
    query: "",
  });
  const [unreturnedBooksSearch, setUnreturnedBooksSearch] =
    useState<SearchState>({
      type: "id",
      query: "",
    });
  const [bookRentalSearch, setBookRentalSearch] = useState<SearchState>({
    type: "id",
    query: "",
  });
  const [availableBookSearch, setAvailableBookSearch] = useState<SearchState>({
    type: "id",
    query: "",
  });

  // Modal states
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isRentalModalOpen, setIsRentalModalOpen] = useState(false);
  const [isDeleteRentalModalOpen, setIsDeleteRentalModalOpen] = useState(false);
  const [isViewRentalsModalOpen, setIsViewRentalsModalOpen] = useState(false);
  const [isRentVerificationModalOpen, setIsRentVerificationModalOpen] =
    useState(false);
  const [isDeleteBookModalOpen, setIsDeleteBookModalOpen] = useState(false);
  const [currentBook, setCurrentBook] = useState<Book | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRental, setSelectedRental] = useState<Rental | null>(null);
  const [verificationUserId, setVerificationUserId] = useState("");
  const [rentVerificationUserId, setRentVerificationUserId] = useState("");
  const [customReturnDate, setCustomReturnDate] = useState(""); // State for custom return date

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("library-books", JSON.stringify(books));
    saveToDB("books", books);
  }, [books]);

  useEffect(() => {
    localStorage.setItem("library-users", JSON.stringify(users));
    saveToDB("users", users);
  }, [users]);

  useEffect(() => {
    localStorage.setItem("library-rentals", JSON.stringify(rentals));
    saveToDB("rentals", rentals);
  }, [rentals]);

  useEffect(() => {
    const currentTime = new Date().getTime();
    const oneDayInMillis = 24 * 60 * 60 * 1000;

    if (lastBackupTime && currentTime - lastBackupTime < oneDayInMillis) {
      return;
    }

    createBackup();
  }, [lastBackupTime]);

  // Export functionality
  const handleExport = (dataType: "books" | "users" | "rentals" | "all") => {
    if (dataType === "all") {
      createBackup();
    } else {
      let data: any[];
      let filename: string;

      switch (dataType) {
        case "books":
          data = books;
          filename = "library-books.json";
          break;
        case "users":
          data = users;
          filename = "library-users.json";
          break;
        case "rentals":
          data = rentals;
          filename = "library-rentals.json";
          break;
      }

      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      saveAs(blob, filename);
      setLastBackupTime(new Date().getTime());
      localStorage.setItem("lastBackupTime", new Date().getTime().toString());
    }
  };

  // Import functionality
  const handleImport = (
    dataType: "books" | "users" | "rentals" | "all",
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);

        switch (dataType) {
          case "books":
            setBooks((prevBooks) => mergeData(prevBooks, importedData));
            break;
          case "users":
            setUsers((prevUsers) => mergeData(prevUsers, importedData));
            break;
          case "rentals":
            setRentals((prevRentals) => mergeData(prevRentals, importedData));
            break;
          case "all":
            setBooks((prevBooks) => mergeData(prevBooks, importedData.books));
            setUsers((prevUsers) => mergeData(prevUsers, importedData.users));
            setRentals((prevRentals) =>
              mergeData(prevRentals, importedData.rentals)
            );
            break;
        }
        alert("Import successful!");
      } catch (error) {
        alert("Error importing file. Please ensure it is a valid JSON file.");
      }
    };
    reader.readAsText(file);
  };

  // Merge data function
  const mergeData = <T extends { id: number }>(
    existingData: T[],
    newData: T[]
  ) => {
    const mergedData: T[] = [];
    const existingIds = new Set(existingData.map((item) => item.id));

    newData.forEach((item) => {
      if (!existingIds.has(item.id)) {
        mergedData.push(item);
      }
    });

    return [...existingData, ...mergedData];
  };

  // Search Helpers
  const fuseOptions = {
    includeScore: true,
    keys: ["title", "author", "isbn", "genre"],
  };

  const fuseBooks = new Fuse(books, fuseOptions);
  const fuseUsers = new Fuse(users, {
    includeScore: true,
    keys: ["name", "email", "class"],
  });
  const fuseRentals = new Fuse(rentals, {
    includeScore: true,
    keys: [
      "bookId",
      "userId",
      "rentalDate",
      "dueDate",
      "returnDate",
      "customReturnDate",
    ],
  });

  const searchBooks = (books: Book[]): Book[] => {
    if (!bookSearch.query) return books;
    const result = fuseBooks.search(bookSearch.query);
    return result.map((item) => item.item);
  };

  const searchUsers = (users: User[]): User[] => {
    if (!userSearch.query) return users;
    const result = fuseUsers.search(userSearch.query);
    return result.map((item) => item.item);
  };

  const searchRentalUsers = (users: User[]): User[] => {
    if (!rentalUserSearch.query) return users;
    const result = fuseUsers.search(rentalUserSearch.query);
    return result.map((item) => item.item);
  };

  const searchRental = (users: User[]): User[] => {
    if (!rentalSearch.query) return users;
    const result = fuseUsers.search(rentalSearch.query);
    return result.map((item) => item.item);
  };

  const searchRentalHistory = (rentals: Rental[]): Rental[] => {
    if (!rentalHistorySearch.query) return rentals;
    const result = fuseRentals.search(rentalHistorySearch.query);
    return result.map((item) => item.item);
  };

  const searchUnreturnedBooks = (rentals: Rental[]): Rental[] => {
    if (!unreturnedBooksSearch.query) return rentals;
    const result = fuseRentals.search(unreturnedBooksSearch.query);
    return result.map((item) => item.item);
  };

  const searchBookRentals = (rentals: Rental[]): Rental[] => {
    if (!bookRentalSearch.query) return rentals;
    const result = fuseRentals.search(bookRentalSearch.query);
    return result.map((item) => item.item);
  };

  const searchAvailableBooks = (books: Book[]): Book[] => {
    if (!availableBookSearch.query) return books;
    const result = fuseBooks.search(availableBookSearch.query);
    return result.map((item) => item.item);
  };

  // Book Management Functions
  const addBook = (book: Book) => {
    const newBook = { ...book, id: generateNumericId(books) };
    setBooks([...books, newBook]);
    setIsBookModalOpen(false);
  };

  const updateBook = (updatedBook: Book) => {
    setBooks(
      books.map((book) => (book.id === updatedBook.id ? updatedBook : book))
    );
    setIsBookModalOpen(false);
  };

  const deleteBook = (bookId: number) => {
    setSelectedBook(books.find((book) => book.id === bookId) || null);
    setIsDeleteBookModalOpen(true);
  };

  const confirmDeleteBook = () => {
    if (selectedBook) {
      setBooks(books.filter((book) => book.id !== selectedBook.id));
      setIsDeleteBookModalOpen(false);
      setSelectedBook(null);
    }
  };

  // User Management Functions
  const addUser = (user: User) => {
    const newUser = {
      ...user,
      id: generateNumericId(users),
      membershipDate: new Date().toISOString(),
    };
    setUsers([...users, newUser]);
    setIsUserModalOpen(false);
  };

  const updateUser = (updatedUser: User) => {
    setUsers(
      users.map((user) => (user.id === updatedUser.id ? updatedUser : user))
    );
    setIsUserModalOpen(false);
  };

  const deleteUser = (userId: number) => {
    setUsers(users.filter((user) => user.id !== userId));
  };

  // Rental Management Functions
  const addRental = (
    bookId: number,
    userId: number,
    customReturnDate: string
  ) => {
    const rentalDate = new Date().toISOString();
    const dueDate = new Date(
      Date.now() + 14 * 24 * 60 * 60 * 1000
    ).toISOString(); // 14 days from now
    const newRental = {
      id: generateNumericId(rentals),
      bookId,
      userId,
      rentalDate,
      dueDate,
      customReturnDate,
    };
    setRentals([...rentals, newRental]);

    // Update the book's available copies
    setBooks(
      books.map((book) =>
        book.id === bookId
          ? { ...book, availableCopies: book.availableCopies - 1 }
          : book
      )
    );

    // Update the user's current rentals
    setUsers(
      users.map((user) =>
        user.id === userId
          ? { ...user, currentRentals: [...user.currentRentals, bookId] }
          : user
      )
    );

    setIsRentalModalOpen(false);
  };

  const updateRental = (updatedRental: Rental) => {
    setRentals(
      rentals.map((rental) =>
        rental.id === updatedRental.id ? updatedRental : rental
      )
    );
  };

  const deleteRental = (rentalId: number) => {
    setRentals(rentals.filter((rental) => rental.id !== rentalId));
  };

  const verifyAndDeleteRental = () => {
    if (
      selectedRental &&
      selectedRental.userId === parseInt(verificationUserId)
    ) {
      deleteRental(selectedRental.id);
      setIsDeleteRentalModalOpen(false);
      setSelectedRental(null);
      setVerificationUserId("");
    } else {
      alert("Verification failed. Please enter the correct user ID.");
    }
  };

  const verifyAndRentBook = () => {
    if (
      selectedBook &&
      selectedUser &&
      selectedUser.id === parseInt(rentVerificationUserId)
    ) {
      addRental(selectedBook.id, selectedUser.id, customReturnDate);
      setIsRentVerificationModalOpen(false);
      setSelectedBook(null);
      setSelectedUser(null);
      setRentVerificationUserId("");
      setCustomReturnDate(""); // Reset custom return date
    } else {
      alert("Verification failed. Please enter the correct user ID.");
    }
  };

  // Generate Numeric ID
  const generateNumericId = (items: any[]): number => {
    if (items.length === 0) return 1;
    const maxId = Math.max(...items.map((item) => item.id));
    return maxId + 1;
  };

  // Save to IndexedDB
  const saveToDB = async (storeName: string, data: any[]) => {
    const db = await openDB("libraryDB", 1, {
      upgrade(db) {
        db.createObjectStore(storeName, { keyPath: "id" });
      },
    });
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    store.clear();
    data.forEach((item) => store.add(item));
    await tx.oncomplete;
  };

  // Create Backup Function
  const createBackup = () => {
    const currentDate = new Date();
    const day = currentDate.getDate();
    const time = currentDate.toLocaleTimeString();
    const filename = `backup day (${day})-${time}.json`;

    const data = { books, users, rentals };
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    saveAs(blob, filename);
    setLastBackupTime(currentDate.getTime());
    localStorage.setItem("lastBackupTime", currentDate.getTime().toString());
  };

  // Set up the backup interval
  useEffect(() => {
    const interval = setInterval(() => {
      createBackup();
    }, 24 * 60 * 60 * 1000); // 24 hours in milliseconds
    setBackupInterval(interval);

    return () => {
      if (backupInterval) {
        clearInterval(backupInterval);
      }
    };
  }, []);

  // Render Book Search
  const renderBookSearch = () => (
    <div className="flex flex-col md:flex-row items-center mb-4 space-y-2 md:space-y-0 md:space-x-2">
      <select
        value={bookSearch.type}
        onChange={(e) =>
          setBookSearch({
            ...bookSearch,
            type: e.target.value as "id" | "name",
          })
        }
        className="border p-2 rounded-md w-full md:w-auto hover:border-blue-500 focus:border-blue-500 bg-gray-800 text-white"
      >
        <option value="id">Search by ID</option>
        <option value="name">Search by Title</option>
      </select>
      <input
        type="text"
        placeholder={`Enter book ${bookSearch.type}`}
        value={bookSearch.query}
        onChange={(e) =>
          setBookSearch({ ...bookSearch, query: e.target.value })
        }
        className="border p-2 rounded-md flex-grow w-full md:w-auto hover:border-blue-500 focus:border-blue-500 bg-gray-800 text-white"
      />
      <button
        onClick={() => setBookSearch({ type: "id", query: "" })}
        className="bg-gray-700 p-2 rounded-md w-full md:w-auto hover:bg-gray-600 text-white"
      >
        Clear
      </button>
      {/* Export and Import Buttons */}
      <button
        onClick={() => handleExport("books")}
        className="bg-blue-500 text-white p-2 rounded-md flex items-center w-full md:w-auto hover:bg-blue-600"
        title="Export Books"
      >
        <Download size={16} className="mr-1" /> Export
      </button>
      <label className="bg-green-500 text-white p-2 rounded-md flex items-center cursor-pointer w-full md:w-auto hover:bg-green-600">
        <Upload size={16} className="mr-1" /> Import
        <input
          type="file"
          accept=".json"
          className="hidden"
          onChange={(e) => handleImport("books", e)}
        />
      </label>
    </div>
  );

  // Render User Search (similar to Book Search)
  const renderUserSearch = () => (
    <div className="flex flex-col md:flex-row items-center mb-4 space-y-2 md:space-y-0 md:space-x-2">
      <select
        value={userSearch.type}
        onChange={(e) =>
          setUserSearch({
            ...userSearch,
            type: e.target.value as "id" | "name",
          })
        }
        className="border p-2 rounded-md w-full md:w-auto hover:border-blue-500 focus:border-blue-500 bg-gray-800 text-white"
      >
        <option value="id">Search by ID</option>
        <option value="name">Search by Name</option>
      </select>
      <input
        type="text"
        placeholder={`Enter user ${userSearch.type}`}
        value={userSearch.query}
        onChange={(e) =>
          setUserSearch({ ...userSearch, query: e.target.value })
        }
        className="border p-2 rounded-md flex-grow w-full md:w-auto hover:border-blue-500 focus:border-blue-500 bg-gray-800 text-white"
      />
      <button
        onClick={() => setUserSearch({ type: "id", query: "" })}
        className="bg-gray-700 p-2 rounded-md w-full md:w-auto hover:bg-gray-600 text-white"
      >
        Clear
      </button>
      {/* Export and Import Buttons */}
      <button
        onClick={() => handleExport("users")}
        className="bg-blue-500 text-white p-2 rounded-md flex items-center w-full md:w-auto hover:bg-blue-600"
        title="Export Users"
      >
        <Download size={16} className="mr-1" /> Export
      </button>
      <label className="bg-green-500 text-white p-2 rounded-md flex items-center cursor-pointer w-full md:w-auto hover:bg-green-600">
        <Upload size={16} className="mr-1" /> Import
        <input
          type="file"
          accept=".json"
          className="hidden"
          onChange={(e) => handleImport("users", e)}
        />
      </label>
    </div>
  );

  // Render Rental User Search
  const renderRentalUserSearch = () => (
    <div className="flex flex-col md:flex-row items-center mb-4 space-y-2 md:space-y-0 md:space-x-2">
      <select
        value={rentalUserSearch.type}
        onChange={(e) =>
          setRentalUserSearch({
            ...rentalUserSearch,
            type: e.target.value as "id" | "name",
          })
        }
        className="border p-2 rounded-md w-full md:w-auto hover:border-blue-500 focus:border-blue-500 bg-gray-800 text-white"
      >
        <option value="id">Search by ID</option>
        <option value="name">Search by Name</option>
      </select>
      <input
        type="text"
        placeholder={`Enter user ${rentalUserSearch.type}`}
        value={rentalUserSearch.query}
        onChange={(e) =>
          setRentalUserSearch({ ...rentalUserSearch, query: e.target.value })
        }
        className="border p-2 rounded-md flex-grow w-full md:w-auto hover:border-blue-500 focus:border-blue-500 bg-gray-800 text-white"
      />
      <button
        onClick={() => setRentalUserSearch({ type: "id", query: "" })}
        className="bg-gray-700 p-2 rounded-md w-full md:w-auto hover:bg-gray-600 text-white"
      >
        Clear
      </button>
    </div>
  );

  // Render Book Modal
  const renderBookModal = () => {
    if (!isBookModalOpen) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
      >
        <div className="bg-gray-800 p-6 rounded-xl w-full max-w-md shadow-lg text-white">
          <h2 className="text-2xl font-bold mb-4">
            {currentBook ? "Edit Book" : "Add New Book"}
          </h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (currentBook && currentBook.id) {
                updateBook(currentBook);
              } else {
                addBook(currentBook!);
              }
            }}
          >
            <input
              type="text"
              placeholder="Title"
              className="w-full border p-3 mb-3 rounded-md hover:border-blue-500 focus:border-blue-500 bg-gray-700 text-white"
              value={currentBook?.title || ""}
              onChange={(e) =>
                setCurrentBook({
                  ...currentBook!,
                  title: e.target.value,
                })
              }
              required
            />
            <input
              type="text"
              placeholder="Author"
              className="w-full border p-3 mb-3 rounded-md hover:border-blue-500 focus:border-blue-500 bg-gray-700 text-white"
              value={currentBook?.author || ""}
              onChange={(e) =>
                setCurrentBook({
                  ...currentBook!,
                  author: e.target.value,
                })
              }
              required
            />
            <input
              type="text"
              placeholder="ISBN"
              className="w-full border p-3 mb-3 rounded-md hover:border-blue-500 focus:border-blue-500 bg-gray-700 text-white"
              value={currentBook?.isbn || ""}
              onChange={(e) =>
                setCurrentBook({
                  ...currentBook!,
                  isbn: e.target.value,
                })
              }
              required
            />
            <input
              type="text"
              placeholder="Genre"
              className="w-full border p-3 mb-3 rounded-md hover:border-blue-500 focus:border-blue-500 bg-gray-700 text-white"
              value={currentBook?.genre || ""}
              onChange={(e) =>
                setCurrentBook({
                  ...currentBook!,
                  genre: e.target.value,
                })
              }
              required
            />
            <input
              type="number"
              placeholder="Total Copies"
              className="w-full border p-3 mb-3 rounded-md hover:border-blue-500 focus:border-blue-500 bg-gray-700 text-white"
              value={currentBook?.totalCopies || 0}
              onChange={(e) =>
                setCurrentBook({
                  ...currentBook!,
                  totalCopies: parseInt(e.target.value),
                })
              }
              required
            />
            <input
              type="number"
              placeholder="Available Copies"
              className="w-full border p-3 mb-3 rounded-md hover:border-blue-500 focus:border-blue-500 bg-gray-700 text-white"
              value={currentBook?.availableCopies || 0}
              onChange={(e) =>
                setCurrentBook({
                  ...currentBook!,
                  availableCopies: parseInt(e.target.value),
                })
              }
              required
            />
            <div className="flex justify-between">
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                Save
              </button>
              <button
                type="button"
                className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                onClick={() => setIsBookModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    );
  };

  // Render User Modal
  const renderUserModal = () => {
    if (!isUserModalOpen) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
      >
        <div className="bg-gray-800 p-6 rounded-xl w-full max-w-md shadow-lg text-white">
          <h2 className="text-2xl font-bold mb-4">
            {currentUser ? "Edit User" : "Add New User"}
          </h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (currentUser && currentUser.id) {
                updateUser(currentUser);
              } else {
                addUser(currentUser!);
              }
            }}
          >
            <input
              type="text"
              placeholder="Name"
              className="w-full border p-3 mb-3 rounded-md hover:border-blue-500 focus:border-blue-500 bg-gray-700 text-white"
              value={currentUser?.name || ""}
              onChange={(e) =>
                setCurrentUser({
                  ...currentUser!,
                  name: e.target.value,
                })
              }
              required
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full border p-3 mb-3 rounded-md hover:border-blue-500 focus:border-blue-500 bg-gray-700 text-white"
              value={currentUser?.email || ""}
              onChange={(e) =>
                setCurrentUser({
                  ...currentUser!,
                  email: e.target.value,
                })
              }
              required
            />
            <input
              type="tel"
              placeholder="Phone (optional)"
              className="w-full border p-3 mb-3 rounded-md hover:border-blue-500 focus:border-blue-500 bg-gray-700 text-white"
              value={currentUser?.phone || ""}
              onChange={(e) =>
                setCurrentUser({
                  ...currentUser!,
                  phone: e.target.value,
                })
              }
            />
            <input
              type="text"
              placeholder="Class"
              className="w-full border p-3 mb-3 rounded-md hover:border-blue-500 focus:border-blue-500 bg-gray-700 text-white"
              value={currentUser?.class || ""}
              onChange={(e) =>
                setCurrentUser({
                  ...currentUser!,
                  class: e.target.value,
                })
              }
              required
            />
            <div className="flex justify-between">
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                Save
              </button>
              <button
                type="button"
                className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                onClick={() => setIsUserModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    );
  };

  // Render Rental Modal
  const renderRentalModal = () => {
    if (!isRentalModalOpen) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
      >
        <div className="bg-gray-800 p-6 rounded-xl w-full max-w-md shadow-lg text-white">
          <h2 className="text-2xl font-bold mb-4">Rent Book</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-white">
              Search User
            </label>
            <select
              value={rentalSearch.type}
              onChange={(e) =>
                setRentalSearch({
                  ...rentalSearch,
                  type: e.target.value as "id" | "name",
                })
              }
              className="border p-3 rounded-md w-full mb-2 hover:border-blue-500 focus:border-blue-500 bg-gray-700 text-white"
            >
              <option value="id">Search by ID</option>
              <option value="name">Search by Name</option>
            </select>
            <input
              type="text"
              placeholder={`Enter user ${rentalSearch.type}`}
              value={rentalSearch.query}
              onChange={(e) =>
                setRentalSearch({ ...rentalSearch, query: e.target.value })
              }
              className="border p-3 rounded-md w-full hover:border-blue-500 focus:border-blue-500 bg-gray-700 text-white"
            />
            <button
              onClick={() => setRentalSearch({ type: "id", query: "" })}
              className="bg-gray-700 p-3 rounded-md mt-2 w-full hover:bg-gray-600 text-white"
            >
              Clear
            </button>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {searchRental(users).map((user) => (
              <div
                key={user.id}
                className="p-3 border-b hover:bg-gray-700 flex justify-between items-center"
                onClick={() => {
                  setSelectedUser(user);
                  setIsRentVerificationModalOpen(true);
                }}
              >
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-gray-400">{user.email}</p>
                </div>
                <button className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600">
                  Select
                </button>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4">
            <button
              type="button"
              className="bg-gray-700 text-white px-4 py-2 rounded-md w-full hover:bg-gray-600"
              onClick={() => setIsRentalModalOpen(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  // Render Rent Verification Modal
  const renderRentVerificationModal = () => {
    if (!isRentVerificationModalOpen || !selectedUser) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
      >
        <div className="bg-gray-800 p-6 rounded-xl w-full max-w-md shadow-lg text-white">
          <h2 className="text-2xl font-bold mb-4">Verify Rental</h2>
          <p className="mb-4">Please enter the user ID to verify the rental.</p>
          <input
            type="text"
            placeholder="Enter User ID"
            className="w-full border p-3 mb-3 rounded-md hover:border-blue-500 focus:border-blue-500 bg-gray-700 text-white"
            value={rentVerificationUserId}
            onChange={(e) => setRentVerificationUserId(e.target.value)}
            required
          />
          <input
            type="date"
            placeholder="Custom Return Date"
            className="w-full border p-3 mb-3 rounded-md hover:border-blue-500 focus:border-blue-500 bg-gray-700 text-white"
            value={customReturnDate}
            onChange={(e) => setCustomReturnDate(e.target.value)}
            required
          />
          <div className="flex justify-between">
            <button
              type="button"
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              onClick={verifyAndRentBook}
            >
              Rent
            </button>
            <button
              type="button"
              className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600"
              onClick={() => setIsRentVerificationModalOpen(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  // Render Delete Rental Modal
  const renderDeleteRentalModal = () => {
    if (!isDeleteRentalModalOpen) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
      >
        <div className="bg-gray-800 p-6 rounded-xl w-full max-w-md shadow-lg text-white">
          <h2 className="text-2xl font-bold mb-4">Verify Deletion</h2>
          <p className="mb-4">
            Please enter the user ID of the rental user to verify the deletion.
          </p>
          <input
            type="text"
            placeholder="Enter User ID"
            className="w-full border p-3 mb-3 rounded-md hover:border-blue-500 focus:border-blue-500 bg-gray-700 text-white"
            value={verificationUserId}
            onChange={(e) => setVerificationUserId(e.target.value)}
            required
          />
          <div className="flex justify-between">
            <button
              type="button"
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
              onClick={verifyAndDeleteRental}
            >
              Delete
            </button>
            <button
              type="button"
              className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600"
              onClick={() => setIsDeleteRentalModalOpen(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  // Render View Rentals Modal
  const renderViewRentalsModal = () => {
    if (!isViewRentalsModalOpen || !selectedUser) return null;

    const userRentals = rentals.filter(
      (rental) => rental.userId === selectedUser.id
    );

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
      >
        <div className="bg-gray-800 p-6 rounded-xl w-full max-w-md shadow-lg text-white">
          <h2 className="text-2xl font-bold mb-4">
            Rentals for {selectedUser.name}
          </h2>
          <div className="max-h-96 overflow-y-auto">
            {userRentals.map((rental) => (
              <div key={rental.id} className="p-3 border-b hover:bg-gray-700">
                <p className="font-medium">
                  Book: {books.find((book) => book.id === rental.bookId)?.title}
                </p>
                <p className="text-sm text-gray-400">
                  Rental Date:{" "}
                  {new Date(rental.rentalDate).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-400">
                  Due Date: {new Date(rental.dueDate).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-400">
                  Custom Return Date:{" "}
                  {rental.customReturnDate
                    ? new Date(rental.customReturnDate).toLocaleDateString()
                    : "N/A"}
                </p>
                <p className="text-sm text-gray-400">
                  Status: {rental.returnDate ? "Returned" : "Not Returned"}
                </p>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4">
            <button
              type="button"
              className="bg-gray-700 text-white px-4 py-2 rounded-md w-full hover:bg-gray-600"
              onClick={() => setIsViewRentalsModalOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  // Render Delete Book Modal
  const renderDeleteBookModal = () => {
    if (!isDeleteBookModalOpen || !selectedBook) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
      >
        <div className="bg-gray-800 p-6 rounded-xl w-full max-w-md shadow-lg text-white">
          <h2 className="text-2xl font-bold mb-4">Verify Deletion</h2>
          <p className="mb-4">
            Please enter the book ID to verify the deletion.
          </p>
          <input
            type="text"
            placeholder="Enter Book ID"
            className="w-full border p-3 mb-3 rounded-md hover:border-blue-500 focus:border-blue-500 bg-gray-700 text-white"
            value={verificationUserId}
            onChange={(e) => setVerificationUserId(e.target.value)}
            required
          />
          <div className="flex justify-between">
            <button
              type="button"
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
              onClick={confirmDeleteBook}
            >
              Delete
            </button>
            <button
              type="button"
              className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600"
              onClick={() => setIsDeleteBookModalOpen(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  // Render Rentals Tab
  const renderRentalsTab = () => (
    <div>
      <h2 className="text-3xl font-bold mb-6 text-white">Book Rentals</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-2xl font-semibold mb-4 text-white">
            Available Books
          </h3>
          <div className="border rounded-xl max-h-96 overflow-y-auto shadow-md p-4 bg-gray-700">
            {renderAvailableBookSearch()}
            {searchAvailableBooks(books)
              .filter((book) => book.availableCopies > 0)
              .map((book) => (
                <div
                  key={book.id}
                  className="p-3 border-b hover:bg-gray-600 flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium text-lg text-white">
                      {book.title}
                    </p>
                    <p className="text-sm text-gray-400">
                      {book.author} | Available: {book.availableCopies}
                    </p>
                  </div>
                  <button
                    className="bg-green-500 text-white px-3 py-1 rounded-md text-sm hover:bg-green-600"
                    onClick={() => {
                      setSelectedBook(book);
                      setIsRentalModalOpen(true);
                    }}
                  >
                    Rent
                  </button>
                </div>
              ))}
          </div>
        </div>

        <div>
          <h3 className="text-2xl font-semibold mb-4 text-white">Users</h3>
          {renderRentalUserSearch()}
          <div className="border rounded-xl max-h-96 overflow-y-auto shadow-md p-4 bg-gray-700">
            {searchRentalUsers(users).map((user) => (
              <div key={user.id} className="p-3 border-b hover:bg-gray-600">
                <p className="font-medium text-lg text-white">{user.name}</p>
                <p className="text-sm text-gray-400">{user.email}</p>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-sm text-gray-400">
                    Current Rentals: {user.currentRentals.length}
                  </span>
                  <button
                    className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600"
                    onClick={() => {
                      setSelectedUser(user);
                      setIsViewRentalsModalOpen(true);
                    }}
                  >
                    View Rentals
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Render Available Book Search
  const renderAvailableBookSearch = () => (
    <div className="flex flex-col md:flex-row items-center mb-4 space-y-2 md:space-y-0 md:space-x-2">
      <select
        value={availableBookSearch.type}
        onChange={(e) =>
          setAvailableBookSearch({
            ...availableBookSearch,
            type: e.target.value as "id" | "name",
          })
        }
        className="border p-2 rounded-md w-full md:w-auto hover:border-blue-500 focus:border-blue-500 bg-gray-800 text-white"
      >
        <option value="id">Search by ID</option>
        <option value="name">Search by Title</option>
      </select>
      <input
        type="text"
        placeholder={`Enter book ${availableBookSearch.type}`}
        value={availableBookSearch.query}
        onChange={(e) =>
          setAvailableBookSearch({
            ...availableBookSearch,
            query: e.target.value,
          })
        }
        className="border p-2 rounded-md flex-grow w-full md:w-auto hover:border-blue-500 focus:border-blue-500 bg-gray-800 text-white"
      />
      <button
        onClick={() => setAvailableBookSearch({ type: "id", query: "" })}
        className="bg-gray-700 p-2 rounded-md w-full md:w-auto hover:bg-gray-600 text-white"
      >
        Clear
      </button>
    </div>
  );

  // Render Rental History Tab
  const renderRentalHistoryTab = () => (
    <div>
      <h2 className="text-3xl font-bold mb-6 text-white">Rental History</h2>
      <button
        onClick={() => handleExport("rentals")}
        className="bg-blue-500 text-white p-2 rounded-md flex items-center mb-4 hover:bg-blue-600"
        title="Export Rental History"
      >
        <Download size={16} className="mr-1" /> Export Rental History
      </button>
      <div className="flex flex-col md:flex-row items-center mb-4 space-y-2 md:space-y-0 md:space-x-2">
        <select
          value={rentalHistorySearch.type}
          onChange={(e) =>
            setRentalHistorySearch({
              ...rentalHistorySearch,
              type: e.target.value as "id" | "name",
            })
          }
          className="border p-2 rounded-md w-full md:w-auto hover:border-blue-500 focus:border-blue-500 bg-gray-800 text-white"
        >
          <option value="id">Search by ID</option>
          <option value="name">Search by Name</option>
        </select>
        <input
          type="text"
          placeholder={`Enter rental ${rentalHistorySearch.type}`}
          value={rentalHistorySearch.query}
          onChange={(e) =>
            setRentalHistorySearch({
              ...rentalHistorySearch,
              query: e.target.value,
            })
          }
          className="border p-2 rounded-md flex-grow w-full md:w-auto hover:border-blue-500 focus:border-blue-500 bg-gray-800 text-white"
        />
        <button
          onClick={() => setRentalHistorySearch({ type: "id", query: "" })}
          className="bg-gray-700 p-2 rounded-md w-full md:w-auto hover:bg-gray-600 text-white"
        >
          Clear
        </button>
      </div>
      <table className="w-full bg-gray-800 border rounded-xl shadow-md">
        <thead>
          <tr className="bg-gray-700">
            <th className="p-3 border text-white">Book</th>
            <th className="p-3 border text-white">User</th>
            <th className="p-3 border text-white">Rental Date</th>
            <th className="p-3 border text-white">Due Date</th>
            <th className="p-3 border text-white">Custom Return Date</th>
            <th className="p-3 border text-white">Status</th>
            <th className="p-3 border text-white">Actions</th>
          </tr>
        </thead>
        <tbody>
          {searchRentalHistory(rentals).map((rental) => (
            <tr key={rental.id} className="bg-gray-600">
              <td className="p-3 border text-white">
                {books.find((book) => book.id === rental.bookId)?.title}
              </td>
              <td className="p-3 border text-white">
                {users.find((user) => user.id === rental.userId)?.name}
              </td>
              <td className="p-3 border text-white">
                {new Date(rental.rentalDate).toLocaleDateString()}
              </td>
              <td className="p-3 border text-white">
                {new Date(rental.dueDate).toLocaleDateString()}
              </td>
              <td className="p-3 border text-white">
                {rental.customReturnDate
                  ? new Date(rental.customReturnDate).toLocaleDateString()
                  : "N/A"}
              </td>
              <td className="p-3 border text-white">
                {rental.returnDate ? "Returned" : "Not Returned"}
              </td>
              <td className="p-3 border text-white">
                <button
                  className="text-red-500 hover:text-red-600"
                  onClick={() => {
                    setSelectedRental(rental);
                    setIsDeleteRentalModalOpen(true);
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Render Unreturned Books Tab
  const renderUnreturnedBooksTab = () => (
    <div>
      <h2 className="text-3xl font-bold mb-6 text-white">Unreturned Books</h2>
      <button
        onClick={() => handleExport("rentals")}
        className="bg-blue-500 text-white p-2 rounded-md flex items-center mb-4 hover:bg-blue-600"
        title="Export Unreturned Books"
      >
        <Download size={16} className="mr-1" /> Export Unreturned Books
      </button>
      <div className="flex flex-col md:flex-row items-center mb-4 space-y-2 md:space-y-0 md:space-x-2">
        <select
          value={unreturnedBooksSearch.type}
          onChange={(e) =>
            setUnreturnedBooksSearch({
              ...unreturnedBooksSearch,
              type: e.target.value as "id" | "name",
            })
          }
          className="border p-2 rounded-md w-full md:w-auto hover:border-blue-500 focus:border-blue-500 bg-gray-800 text-white"
        >
          <option value="id">Search by ID</option>
          <option value="name">Search by Name</option>
        </select>
        <input
          type="text"
          placeholder={`Enter unreturned book ${unreturnedBooksSearch.type}`}
          value={unreturnedBooksSearch.query}
          onChange={(e) =>
            setUnreturnedBooksSearch({
              ...unreturnedBooksSearch,
              query: e.target.value,
            })
          }
          className="border p-2 rounded-md flex-grow w-full md:w-auto hover:border-blue-500 focus:border-blue-500 bg-gray-800 text-white"
        />
        <button
          onClick={() => setUnreturnedBooksSearch({ type: "id", query: "" })}
          className="bg-gray-700 p-2 rounded-md w-full md:w-auto hover:bg-gray-600 text-white"
        >
          Clear
        </button>
      </div>
      <table className="w-full bg-gray-800 border rounded-xl shadow-md">
        <thead>
          <tr className="bg-gray-700">
            <th className="p-3 border text-white">Book</th>
            <th className="p-3 border text-white">User</th>
            <th className="p-3 border text-white">Rental Date</th>
            <th className="p-3 border text-white">Due Date</th>
            <th className="p-3 border text-white">Custom Return Date</th>
            <th className="p-3 border text-white">Status</th>
          </tr>
        </thead>
        <tbody>
          {searchUnreturnedBooks(rentals)
            .filter(
              (rental) =>
                !rental.returnDate && new Date(rental.dueDate) < new Date()
            )
            .map((rental) => (
              <tr key={rental.id} className="bg-gray-600">
                <td className="p-3 border text-white">
                  {books.find((book) => book.id === rental.bookId)?.title}
                </td>
                <td className="p-3 border text-white">
                  {users.find((user) => user.id === rental.userId)?.name}
                </td>
                <td className="p-3 border text-white">
                  {new Date(rental.rentalDate).toLocaleDateString()}
                </td>
                <td className="p-3 border text-white">
                  {new Date(rental.dueDate).toLocaleDateString()}
                </td>
                <td className="p-3 border text-white">
                  {rental.customReturnDate
                    ? new Date(rental.customReturnDate).toLocaleDateString()
                    : "N/A"}
                </td>
                <td className="p-3 border text-white">Not Returned</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );

  // Render Backup Tab
  const renderBackupTab = () => (
    <div>
      <h2 className="text-3xl font-bold mb-6 text-white">Backup</h2>
      <button
        onClick={() => handleExport("all")}
        className="bg-blue-500 text-white p-3 rounded-xl hover:bg-blue-600"
        title="Create Backup"
      >
        <Download size={16} className="mr-1" /> Create Backup
      </button>
      <p className="mt-4 text-white">
        Last Backup Time:{" "}
        {lastBackupTime ? new Date(lastBackupTime).toLocaleString() : "N/A"}
      </p>
      <div className="mt-4">
        <h3 className="text-2xl font-semibold mb-4 text-white">
          Import Backup
        </h3>
        <label className="bg-green-500 text-white p-2 rounded-md flex items-center cursor-pointer w-full md:w-auto hover:bg-green-600">
          <Upload size={16} className="mr-1" /> Import Backup
          <input
            type="file"
            accept=".json"
            className="hidden"
            onChange={(e) => handleImport("all", e)}
          />
        </label>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-6 bg-gray-900 text-white">
      <div className="flex mb-6 space-x-6">
        <button
          onClick={() => setActiveTab("books")}
          className={`flex items-center space-x-2 p-3 rounded-xl ${
            activeTab === "books"
              ? "bg-blue-500 text-white"
              : "bg-gray-700 text-gray-300"
          }`}
        >
          <BookOpen />
          <span>Books</span>
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center space-x-2 p-3 rounded-xl ${
            activeTab === "users"
              ? "bg-blue-500 text-white"
              : "bg-gray-700 text-gray-300"
          }`}
        >
          <Users />
          <span>Users</span>
        </button>
        <button
          onClick={() => setActiveTab("rentals")}
          className={`flex items-center space-x-2 p-3 rounded-xl ${
            activeTab === "rentals"
              ? "bg-blue-500 text-white"
              : "bg-gray-700 text-gray-300"
          }`}
        >
          <ShoppingCart />
          <span>Rentals</span>
        </button>
        <button
          onClick={() => setActiveTab("rentalHistory")}
          className={`flex items-center space-x-2 p-3 rounded-xl ${
            activeTab === "rentalHistory"
              ? "bg-blue-500 text-white"
              : "bg-gray-700 text-gray-300"
          }`}
        >
          <ShoppingCart />
          <span>Rental History</span>
        </button>
        <button
          onClick={() => setActiveTab("unreturned")}
          className={`flex items-center space-x-2 p-3 rounded-xl ${
            activeTab === "unreturned"
              ? "bg-blue-500 text-white"
              : "bg-gray-700 text-gray-300"
          }`}
        >
          <ShoppingCart />
          <span>Unreturned Books</span>
        </button>
        <button
          onClick={() => setActiveTab("backup")}
          className={`flex items-center space-x-2 p-3 rounded-xl ${
            activeTab === "backup"
              ? "bg-blue-500 text-white"
              : "bg-gray-700 text-gray-300"
          }`}
        >
          <Clock />
          <span>Backup</span>
        </button>
      </div>

      {activeTab === "books" && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-white">Books</h2>
            <button
              onClick={() => {
                setCurrentBook({
                  id: 0,
                  title: "",
                  author: "",
                  isbn: "",
                  genre: "",
                  totalCopies: 0,
                  availableCopies: 0,
                });
                setIsBookModalOpen(true);
              }}
              className="bg-green-500 text-white px-4 py-4 flex flex-row justify-center items-center rounded-xl hover:bg-green-600"
            >
              <Plus className="mr-2" /> Add Book
            </button>
          </div>

          {renderBookSearch()}

          <table className="w-full border rounded-xl shadow-md bg-gray-800">
            <thead>
              <tr className="bg-gray-700">
                <th className="p-3 border text-white">ID</th>
                <th className="p-3 border text-white">Title</th>
                <th className="p-3 border text-white">Author</th>
                <th className="p-3 border text-white">ISBN</th>
                <th className="p-3 border text-white">Genre</th>
                <th className="p-3 border text-white">Total Copies</th>
                <th className="p-3 border text-white">Available</th>
                <th className="p-3 border text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {searchBooks(books).map((book) => (
                <tr key={book.id} className="hover:bg-gray-600">
                  <td className="p-3 border text-white">{book.id}</td>
                  <td className="p-3 border text-white">{book.title}</td>
                  <td className="p-3 border text-white">{book.author}</td>
                  <td className="p-3 border text-white">{book.isbn}</td>
                  <td className="p-3 border text-white">{book.genre}</td>
                  <td className="p-3 border text-center text-white">
                    {book.totalCopies}
                  </td>
                  <td className="p-3 border text-center text-white">
                    {book.availableCopies}
                  </td>
                  <td className="p-3 border text-center">
                    <button
                      onClick={() => {
                        setCurrentBook(book);
                        setIsBookModalOpen(true);
                      }}
                      className="text-blue-500 mr-2 hover:text-blue-600"
                    >
                      <Edit className="mr-1" /> Edit
                    </button>
                    <button
                      onClick={() => deleteBook(book.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash className="mr-1" /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "users" && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-white">Users</h2>
            <button
              onClick={() => {
                setCurrentUser({
                  id: 0,
                  name: "",
                  email: "",
                  membershipDate: new Date().toISOString(),
                  currentRentals: [],
                  class: "",
                });
                setIsUserModalOpen(true);
              }}
              className="bg-green-500 text-white px-4 py-4 flex flex-row justify-center items-center  rounded-xl hover:bg-green-600"
            >
              <Plus className="mr-2" /> Add User
            </button>
          </div>

          {renderUserSearch()}

          <table className="w-full border rounded-xl shadow-md bg-gray-800">
            <thead>
              <tr className="bg-gray-700">
                <th className="p-3 border text-white">ID</th>
                <th className="p-3 border text-white">Name</th>
                <th className="p-3 border text-white">Email</th>
                <th className="p-3 border text-white">Class</th>
                <th className="p-3 border text-white">Membership Date</th>
                <th className="p-3 border text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {searchUsers(users).map((user) => (
                <tr key={user.id} className="hover:bg-gray-600">
                  <td className="p-3 border text-white">{user.id}</td>
                  <td className="p-3 border text-white">{user.name}</td>
                  <td className="p-3 border text-white">{user.email}</td>
                  <td className="p-3 border text-white">{user.class}</td>
                  <td className="p-3 border text-white">
                    {new Date(user.membershipDate).toLocaleDateString()}
                  </td>
                  <td className="p-3 border text-center">
                    <button
                      onClick={() => {
                        setCurrentUser(user);
                        setIsUserModalOpen(true);
                      }}
                      className="text-blue-500 mr-2 hover:text-blue-600"
                    >
                      <Edit className="mr-1" /> Edit
                    </button>
                    <button
                      onClick={() => deleteUser(user.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash className="mr-1" /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "rentals" && renderRentalsTab()}

      {activeTab === "rentalHistory" && renderRentalHistoryTab()}

      {activeTab === "unreturned" && renderUnreturnedBooksTab()}

      {activeTab === "backup" && renderBackupTab()}

      {renderBookModal()}
      {renderUserModal()}
      {renderRentalModal()}
      {renderRentVerificationModal()}
      {renderDeleteRentalModal()}
      {renderViewRentalsModal()}
      {renderDeleteBookModal()}

      {/* Export All Button */}
      <button
        onClick={() => handleExport("all")}
        className="fixed bottom-4 right-4 bg-blue-500 text-white  px-4 py-4 flex flex-row justify-center items-center  rounded-xl hover:bg-blue-600"
        title="Export All"
      >
        <Download size={16} className="mr-1" /> Export All
      </button>
    </div>
  );
};

export default LibraryManagementSystem;
