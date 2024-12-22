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
  Lock,
  Unlock,
  Bell,
  Settings,
  Image as ImageIcon,
  Palette,
  Type,
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
  class: string;
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
  customReturnDate?: string;
  returnTime?: string; // Add return time
}

interface SearchState {
  type: "id" | "name";
  query: string;
  sortBy:
    | "id"
    | "title"
    | "author"
    | "class"
    | "genre"
    | "totalCopies"
    | "availableCopies"
    | "name"
    | "email"
    | "membershipDate"
    | "rentalDate"
    | "dueDate"
    | "returnDate"
    | "customReturnDate";
}

interface ExportData {
  books: Book[];
  users: User[];
  rentals: Rental[];
}

const LibraryManagementSystem: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    | "books"
    | "users"
    | "rentals"
    | "rentalHistory"
    | "unreturned"
    | "backup"
    | "returned"
    | "admin"
  >("books");

  // Initialize state with localStorage
  const [books, setBooks] = useState<Book[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);

  // Search states
  const [bookSearch, setBookSearch] = useState<SearchState>({
    type: "id",
    query: "",
    sortBy: "id",
  });
  const [userSearch, setUserSearch] = useState<SearchState>({
    type: "id",
    query: "",
    sortBy: "id",
  });
  const [rentalUserSearch, setRentalUserSearch] = useState<SearchState>({
    type: "id",
    query: "",
    sortBy: "id",
  });
  const [rentalSearch, setRentalSearch] = useState<SearchState>({
    type: "id",
    query: "",
    sortBy: "id",
  });
  const [rentalHistorySearch, setRentalHistorySearch] = useState<SearchState>({
    type: "id",
    query: "",
    sortBy: "id",
  });
  const [unreturnedBooksSearch, setUnreturnedBooksSearch] =
    useState<SearchState>({
      type: "id",
      query: "",
      sortBy: "id",
    });
  const [bookRentalSearch, setBookRentalSearch] = useState<SearchState>({
    type: "id",
    query: "",
    sortBy: "id",
  });
  const [availableBookSearch, setAvailableBookSearch] = useState<SearchState>({
    type: "id",
    query: "",
    sortBy: "id",
  });
  const [returnedBooksSearch, setReturnedBooksSearch] = useState<SearchState>({
    type: "id",
    query: "",
    sortBy: "id",
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
  const [isReturnBookModalOpen, setIsReturnBookModalOpen] = useState(false);
  const [isDeleteUserModalOpen, setIsDeleteUserModalOpen] = useState(false);
  const [currentBook, setCurrentBook] = useState<Book | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRental, setSelectedRental] = useState<Rental | null>(null);
  const [verificationUserId, setVerificationUserId] = useState("");
  const [rentVerificationUserId, setRentVerificationUserId] = useState("");
  const [customReturnDate, setCustomReturnDate] = useState(""); // State for custom return date

  // Admin Panel State
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // UI Customization States
  const [themeColor, setThemeColor] = useState("#1f2937");
  const [fontSize, setFontSize] = useState("16px");
  const [buttonRadius, setButtonRadius] = useState("12px");
  const [fontFamily, setFontFamily] = useState("Arial, sans-serif");
  const [primaryButtonColor, setPrimaryButtonColor] = useState("#3b82f6");
  const [secondaryButtonColor, setSecondaryButtonColor] = useState("#10b981");
  const [backgroundImage, setBackgroundImage] = useState("");

  // Notifications State
  const [notifications, setNotifications] = useState<string[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const localStorageBooks = localStorage.getItem("library-books");
      const localStorageUsers = localStorage.getItem("library-users");
      const localStorageRentals = localStorage.getItem("library-rentals");

      setBooks(localStorageBooks ? JSON.parse(localStorageBooks) : []);
      setUsers(localStorageUsers ? JSON.parse(localStorageUsers) : []);
      setRentals(localStorageRentals ? JSON.parse(localStorageRentals) : []);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("library-books", JSON.stringify(books));
      saveToDB("books", books);
    }
  }, [books]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("library-users", JSON.stringify(users));
      saveToDB("users", users);
    }
  }, [users]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("library-rentals", JSON.stringify(rentals));
      saveToDB("rentals", rentals);
    }
  }, [rentals]);

  // Export functionality
  const handleExport = (dataType: "books" | "users" | "rentals" | "all") => {
    let data: any;
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
      case "all":
      default:
        data = { books, users, rentals } as ExportData;
        filename = `backup-${new Date()
          .toLocaleString()
          .replace(/[/: ]/g, "-")}.json`;
        break;
    }

    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    saveAs(blob, filename);
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
    keys: ["title", "author", "class", "genre"],
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

  const searchReturnedBooks = (rentals: Rental[]): Rental[] => {
    if (!returnedBooksSearch.query) return rentals;
    const result = fuseRentals.search(returnedBooksSearch.query);
    return result.map((item) => item.item);
  };

  // Book Management Functions
  const addBook = (book: Book) => {
    const newBook = { ...book, id: generateNumericId(books) };
    setBooks([...books, newBook]);
    setIsBookModalOpen(false);
    createBackup();
  };

  const updateBook = (updatedBook: Book) => {
    setBooks(
      books.map((book) => (book.id === updatedBook.id ? updatedBook : book))
    );
    setIsBookModalOpen(false);
    createBackup();
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
      createBackup();
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
    createBackup();
  };

  const updateUser = (updatedUser: User) => {
    setUsers(
      users.map((user) => (user.id === updatedUser.id ? updatedUser : user))
    );
    setIsUserModalOpen(false);
    createBackup();
  };

  const deleteUser = (userId: number) => {
    setSelectedUser(users.find((user) => user.id === userId) || null);
    setIsDeleteUserModalOpen(true);
  };

  const confirmDeleteUser = () => {
    if (selectedUser) {
      setUsers(users.filter((user) => user.id !== selectedUser.id));
      setIsDeleteUserModalOpen(false);
      setSelectedUser(null);
      createBackup();
    }
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
    createBackup();
  };

  const updateRental = (updatedRental: Rental) => {
    setRentals(
      rentals.map((rental) =>
        rental.id === updatedRental.id ? updatedRental : rental
      )
    );
    createBackup();
  };

  const deleteRental = (rentalId: number) => {
    const rental = rentals.find((r) => r.id === rentalId);
    if (rental) {
      // Update the book's available copies
      setBooks(
        books.map((book) =>
          book.id === rental.bookId
            ? { ...book, availableCopies: book.availableCopies + 1 }
            : book
        )
      );

      // Update the user's current rentals
      setUsers(
        users.map((user) =>
          user.id === rental.userId
            ? {
                ...user,
                currentRentals: user.currentRentals.filter(
                  (bookId) => bookId !== rental.bookId
                ),
              }
            : user
        )
      );

      setRentals(rentals.filter((rental) => rental.id !== rentalId));
      createBackup();
    }
  };

  const verifyAndDeleteRental = () => {
    if (
      selectedRental &&
      selectedRental.userId === parseInt(verificationUserId) &&
      verificationUserId.trim() !== ""
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
      selectedUser.id === parseInt(rentVerificationUserId) &&
      rentVerificationUserId.trim() !== ""
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

  // Return Book Function
  const returnBook = (rentalId: number) => {
    const rental = rentals.find((r) => r.id === rentalId);
    if (rental) {
      // Update the book's available copies
      setBooks(
        books.map((book) =>
          book.id === rental.bookId
            ? { ...book, availableCopies: book.availableCopies + 1 }
            : book
        )
      );

      // Update the user's current rentals
      setUsers(
        users.map((user) =>
          user.id === rental.userId
            ? {
                ...user,
                currentRentals: user.currentRentals.filter(
                  (bookId) => bookId !== rental.bookId
                ),
              }
            : user
        )
      );

      // Update the rental's return date
      setRentals(
        rentals.map((r) =>
          r.id === rentalId
            ? {
                ...r,
                returnDate: new Date().toISOString(),
                returnTime: new Date().toTimeString(),
              }
            : r
        )
      );

      // Add notification
      setNotifications((prevNotifications) => [
        ...prevNotifications,
        `Book "${
          books.find((book) => book.id === rental.bookId)?.title
        }" returned by user "${
          users.find((user) => user.id === rental.userId)?.name
        }".`,
      ]);

      createBackup();
    }
  };

  // Undo Return Book Function
  const undoReturnBook = (rentalId: number) => {
    const rental = rentals.find((r) => r.id === rentalId);
    if (rental) {
      // Update the book's available copies
      setBooks(
        books.map((book) =>
          book.id === rental.bookId
            ? { ...book, availableCopies: book.availableCopies - 1 }
            : book
        )
      );

      // Update the user's current rentals
      setUsers(
        users.map((user) =>
          user.id === rental.userId
            ? {
                ...user,
                currentRentals: [...user.currentRentals, rental.bookId],
              }
            : user
        )
      );

      // Update the rental's return date
      setRentals(
        rentals.map((r) =>
          r.id === rentalId
            ? { ...r, returnDate: undefined, returnTime: undefined }
            : r
        )
      );

      createBackup();
    }
  };

  // Confirm Return Book Function
  const confirmReturnBook = (rentalId: number) => {
    const rental = rentals.find((r) => r.id === rentalId);
    if (rental) {
      // Update the book's available copies
      setBooks(
        books.map((book) =>
          book.id === rental.bookId
            ? { ...book, availableCopies: book.availableCopies + 1 }
            : book
        )
      );

      // Update the user's current rentals
      setUsers(
        users.map((user) =>
          user.id === rental.userId
            ? {
                ...user,
                currentRentals: user.currentRentals.filter(
                  (bookId) => bookId !== rental.bookId
                ),
              }
            : user
        )
      );

      // Update the rental's return date
      setRentals(
        rentals.map((r) =>
          r.id === rentalId
            ? {
                ...r,
                returnDate: new Date().toISOString(),
                returnTime: new Date().toTimeString(),
              }
            : r
        )
      );

      createBackup();
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
    try {
      const currentDate = new Date();
      const day = String(currentDate.getDate()).padStart(2, "0");
      const time = currentDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      const filename = `backup-${day}-${time}.json`;

      const data = { books, users, rentals };
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      saveAs(blob, filename);

      console.log("Backup created at:", new Date().toLocaleString());
    } catch (error) {
      console.error("Backup creation failed:", error);
    }
  };

  // Remove returned books from rental history after 2 days
  useEffect(() => {
    const interval = setInterval(() => {
      const currentTime = new Date().getTime();
      const twoDaysInMillis = 2 * 24 * 60 * 60 * 1000;

      setRentals((prevRentals) =>
        prevRentals.filter(
          (rental) =>
            !rental.returnDate ||
            currentTime - new Date(rental.returnDate).getTime() <
              twoDaysInMillis
        )
      );
    }, 24 * 60 * 60 * 1000); // Check every 24 hours

    return () => clearInterval(interval);
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
      <select
        value={bookSearch.sortBy}
        onChange={(e) =>
          setBookSearch({
            ...bookSearch,
            sortBy: e.target.value as
              | "id"
              | "title"
              | "author"
              | "class"
              | "genre"
              | "totalCopies"
              | "availableCopies",
          })
        }
        className="border p-2 rounded-md w-full md:w-auto hover:border-blue-500 focus:border-blue-500 bg-gray-800 text-white"
      >
        <option value="id">Sort by ID</option>
        <option value="title">Sort by Title</option>
        <option value="author">Sort by Author</option>
        <option value="class">Sort by Class</option>
        <option value="genre">Sort by Genre</option>
        <option value="totalCopies">Sort by Total Copies</option>
        <option value="availableCopies">Sort by Available Copies</option>
      </select>
      <button
        onClick={() => setBookSearch({ type: "id", query: "", sortBy: "id" })}
        className="bg-gray-700 text-white p-2 rounded-md w-full md:w-auto hover:bg-gray-600"
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
      <select
        value={userSearch.sortBy}
        onChange={(e) =>
          setUserSearch({
            ...userSearch,
            sortBy: e.target.value as
              | "id"
              | "name"
              | "email"
              | "class"
              | "membershipDate",
          })
        }
        className="border p-2 rounded-md w-full md:w-auto hover:border-blue-500 focus:border-blue-500 bg-gray-800 text-white"
      >
        <option value="id">Sort by ID</option>
        <option value="name">Sort by Name</option>
        <option value="email">Sort by Email</option>
        <option value="class">Sort by Class</option>
        <option value="membershipDate">Sort by Membership Date</option>
      </select>
      <button
        onClick={() => setUserSearch({ type: "id", query: "", sortBy: "id" })}
        className="bg-gray-700 text-white p-2 rounded-md w-full md:w-auto hover:bg-gray-600"
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
        className="border p-2 rounded-md w-11/12 md:w-auto hover:border-blue-500 focus:border-blue-500 bg-gray-800 text-white"
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
        className="border p-2 rounded-md flex-grow w-11/12 md:w-auto hover:border-blue-500 focus:border-blue-500 bg-gray-800 text-white"
      />
      <select
        value={rentalUserSearch.sortBy}
        onChange={(e) =>
          setRentalUserSearch({
            ...rentalUserSearch,
            sortBy: e.target.value as
              | "id"
              | "name"
              | "email"
              | "class"
              | "membershipDate",
          })
        }
        className="border p-2 rounded-md w-full md:w-auto hover:border-blue-500 focus:border-blue-500 bg-gray-800 text-white"
      >
        <option value="id">Sort by ID</option>
        <option value="name">Sort by Name</option>
        <option value="email">Sort by Email</option>
        <option value="class">Sort by Class</option>
        <option value="membershipDate">Sort by Membership Date</option>
      </select>
      {/* <button
        onClick={() =>
          setRentalUserSearch({ type: "id", query: "", sortBy: "id" })
        }
        className="bg-gray-700 text-white p-2 rounded-md w-full md:w-auto hover:bg-gray-600"
      >
        Clear
      </button> */}
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
              placeholder="Class"
              className="w-full border p-3 mb-3 rounded-md hover:border-blue-500 focus:border-blue-500 bg-gray-700 text-white"
              value={currentBook?.class || ""}
              onChange={(e) =>
                setCurrentBook({
                  ...currentBook!,
                  class: e.target.value,
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

  // Render Delete User Modal
  const renderDeleteUserModal = () => {
    if (!isDeleteUserModalOpen) return null;

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
            Please enter the user ID to verify the deletion.
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
              onClick={confirmDeleteUser}
              disabled={!verificationUserId.trim()}
            >
              Delete
            </button>
            <button
              type="button"
              className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600"
              onClick={() => setIsDeleteUserModalOpen(false)}
            >
              Cancel
            </button>
          </div>
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
              onClick={() =>
                setRentalSearch((prevState) => ({
                  ...prevState,
                  type: "id",
                  query: "",
                  sortBy: prevState.sortBy, // Maintain the existing sortBy value
                }))
              }
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
            className="w-full border p-3 mb-3 rounded-md hover:border-blue-500 focus:border-blue-500 bg-gray-700 text-white placeholder-white transition-all duration-200"
            value={customReturnDate}
            onChange={(e) => setCustomReturnDate(e.target.value)}
            required
          />

          <div className="flex justify-between">
            <button
              type="button"
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              onClick={verifyAndRentBook}
              disabled={!rentVerificationUserId.trim()}
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
              disabled={!verificationUserId.trim()}
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

  // Render Return Book Modal
  const renderReturnBookModal = () => {
    if (!isReturnBookModalOpen || !selectedRental) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
      >
        <div className="bg-gray-800 p-6 rounded-xl w-full max-w-md shadow-lg text-white">
          <h2 className="text-2xl font-bold mb-4">Return Book</h2>
          <p className="mb-4">Please verify the return of the book.</p>
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
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              onClick={() => confirmReturnBook(selectedRental.id)}
              disabled={!verificationUserId.trim()}
            >
              Confirm Return
            </button>
            <button
              type="button"
              className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600"
              onClick={() => setIsReturnBookModalOpen(false)}
            >
              Close
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
              disabled={!verificationUserId.trim()}
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

  // Render Admin Panel
  const renderAdminPanel = () => (
    <div className="bg-gray-900 p-6 rounded-lg grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="col-span-1 md:col-span-2 lg:col-span-3">
        <h2 className="text-3xl font-bold mb-6 text-white">Admin Panel</h2>
        {!isAdminAuthenticated ? (
          <div>
            <input
              type="password"
              placeholder="Enter Admin Password"
              className="w-full border p-3 mb-3 rounded-md hover:border-blue-500 focus:border-blue-500 bg-gray-700 text-white"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 mb-4"
              onClick={() => {
                if (adminPassword === "admin123") {
                  setIsAdminAuthenticated(true);
                } else {
                  alert("Incorrect password. Please try again.");
                }
              }}
            >
              Login
            </button>
          </div>
        ) : (
          <div>
            <button
              type="button"
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 mb-4"
              onClick={() => setIsAdminAuthenticated(false)}
            >
              Logout
            </button>
            <h3 className="text-2xl font-semibold mb-4 text-white">
              Manage Users
            </h3>
            <div className="mb-4">
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
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 mb-2"
              >
                <Plus className="mr-2" /> Add User
              </button>
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
            <h3 className="text-2xl font-semibold mb-4 text-white">
              Manage Books
            </h3>
            <div className="mb-4">
              <button
                onClick={() => {
                  setCurrentBook({
                    id: 0,
                    title: "",
                    author: "",
                    class: "",
                    genre: "",
                    totalCopies: 0,
                    availableCopies: 0,
                  });
                  setIsBookModalOpen(true);
                }}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 mb-2"
              >
                <Plus className="mr-2" /> Add Book
              </button>
              <table className="w-full border rounded-xl shadow-md bg-gray-800">
                <thead>
                  <tr className="bg-gray-700">
                    <th className="p-3 border text-white">ID</th>
                    <th className="p-3 border text-white">Title</th>
                    <th className="p-3 border text-white">Author</th>
                    <th className="p-3 border text-white">Class</th>
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
                      <td className="p-3 border text-white">{book.class}</td>
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
            <h3 className="text-2xl font-semibold mb-4 text-white">
              Manage Rentals
            </h3>
            <div className="mb-4">
              <table className="w-full border rounded-xl shadow-md bg-gray-800">
                <thead>
                  <tr className="bg-gray-700">
                    <th className="p-3 border text-white">ID</th>
                    <th className="p-3 border text-white">Book ID</th>
                    <th className="p-3 border text-white">User ID</th>
                    <th className="p-3 border text-white">Rental Date</th>
                    <th className="p-3 border text-white">Due Date</th>
                    <th className="p-3 border text-white">Return Date</th>
                    <th className="p-3 border text-white">
                      Custom Return Date
                    </th>
                    <th className="p-3 border text-white">Return Time</th>
                    <th className="p-3 border text-white">Status</th>
                    <th className="p-3 border text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rentals.map((rental) => (
                    <tr key={rental.id} className="hover:bg-gray-600">
                      <td className="p-3 border text-white">{rental.id}</td>
                      <td className="p-3 border text-white">{rental.bookId}</td>
                      <td className="p-3 border text-white">{rental.userId}</td>
                      <td className="p-3 border text-white">
                        {new Date(rental.rentalDate).toLocaleDateString()}
                      </td>
                      <td className="p-3 border text-white">
                        {new Date(rental.dueDate).toLocaleDateString()}
                      </td>
                      <td className="p-3 border text-white">
                        {rental.returnDate
                          ? new Date(rental.returnDate).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="p-3 border text-white">
                        {rental.customReturnDate
                          ? new Date(
                              rental.customReturnDate
                            ).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="p-3 border text-white">
                        {rental.returnTime ? rental.returnTime : "N/A"}
                      </td>
                      <td className="p-3 border text-white">
                        {rental.returnDate ? (
                          new Date(rental.returnDate) <=
                          new Date(rental.dueDate) ? (
                            <span className="text-green-400">On Time</span>
                          ) : (
                            <span className="text-red-400">Late</span>
                          )
                        ) : (
                          "Not Returned"
                        )}
                      </td>
                      <td className="p-3 border text-center">
                        <button
                          onClick={() => {
                            setSelectedRental(rental);
                            setIsDeleteRentalModalOpen(true);
                          }}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash className="mr-1" /> Delete
                        </button>
                        {!rental.returnDate && (
                          <button
                            onClick={() => {
                              setSelectedRental(rental);
                              setIsReturnBookModalOpen(true);
                            }}
                            className="text-blue-500 hover:text-blue-600 ml-2"
                          >
                            Return
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <h3 className="text-2xl font-semibold mb-4 text-white">
              Customize UI
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-white">
                Theme Color
              </label>
              <input
                type="color"
                className="w-full p-2 mb-3 rounded-md"
                value={themeColor}
                onChange={(e) => {
                  setThemeColor(e.target.value);
                  document.documentElement.style.setProperty(
                    "--bg-color",
                    e.target.value
                  );
                }}
              />
              <label className="block text-sm font-medium text-white">
                Font Size
              </label>
              <input
                type="range"
                min="12"
                max="24"
                className="w-full p-2 mb-3 rounded-md"
                value={fontSize}
                onChange={(e) => {
                  setFontSize(e.target.value);
                  document.documentElement.style.setProperty(
                    "--font-size",
                    `${e.target.value}px`
                  );
                }}
              />
              <label className="block text-sm font-medium text-white">
                Button Radius
              </label>
              <input
                type="range"
                min="0"
                max="50"
                className="w-full p-2 mb-3 rounded-md"
                value={buttonRadius}
                onChange={(e) => {
                  setButtonRadius(e.target.value);
                  document.documentElement.style.setProperty(
                    "--border-radius",
                    `${e.target.value}px`
                  );
                }}
              />
              <label className="block text-sm font-medium text-white">
                Font Family
              </label>
              <input
                type="text"
                className="w-full p-2 mb-3 rounded-md bg-gray-700 text-white"
                value={fontFamily}
                onChange={(e) => {
                  setFontFamily(e.target.value);
                  document.documentElement.style.setProperty(
                    "--font-family",
                    e.target.value
                  );
                }}
              />
              <label className="block text-sm font-medium text-white">
                Primary Button Color
              </label>
              <input
                type="color"
                className="w-full p-2 mb-3 rounded-md"
                value={primaryButtonColor}
                onChange={(e) => {
                  setPrimaryButtonColor(e.target.value);
                  document.documentElement.style.setProperty(
                    "--primary-button-color",
                    e.target.value
                  );
                }}
              />
              <label className="block text-sm font-medium text-white">
                Secondary Button Color
              </label>
              <input
                type="color"
                className="w-full p-2 mb-3 rounded-md"
                value={secondaryButtonColor}
                onChange={(e) => {
                  setSecondaryButtonColor(e.target.value);
                  document.documentElement.style.setProperty(
                    "--secondary-button-color",
                    e.target.value
                  );
                }}
              />
              <label className="block text-sm font-medium text-white">
                Background Image
              </label>
              <input
                type="file"
                accept="image/*"
                className="w-full p-2 mb-3 rounded-md bg-gray-700 text-white"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      setBackgroundImage(event.target?.result as string);
                      document.documentElement.style.setProperty(
                        "--bg-image",
                        `url(${event.target?.result})`
                      );
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Render Rentals Tab
  const renderRentalsTab = () => (
    <div className="bg-gray-900 p-6 rounded-lg">
      <h2 className="text-3xl font-bold mb-6 text-white">Book Rentals</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Available Books Section */}
        <div>
          <h3 className="text-2xl font-semibold mb-4 text-white">
            Available Books
          </h3>
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            {renderAvailableBookSearch()}
            <div className="max-h-[calc(100vh-400px)] overflow-y-auto p-4">
              {searchAvailableBooks(books)
                .filter((book) => book.availableCopies > 0)
                .map((book) => (
                  <div
                    key={book.id}
                    className="bg-gray-700 mb-3 last:mb-0 p-4 rounded-lg hover:bg-gray-650 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-lg text-white">
                          {book.title}
                        </p>
                        <p className="text-gray-300">
                          {book.author} •{" "}
                          <span className="text-green-400">
                            {book.availableCopies} available
                          </span>
                        </p>
                      </div>
                      <button
                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors"
                        onClick={() => {
                          setSelectedBook(book);
                          setIsRentalModalOpen(true);
                        }}
                      >
                        Rent
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Users Section */}
        <div>
          <h3 className="text-2xl font-semibold mb-4 text-white">Users</h3>
          {renderRentalUserSearch()}
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="max-h-[calc(100vh-400px)] grid grid-col-2 overflow-y-auto p-4">
              {searchRentalUsers(users).map((user) => (
                <div
                  key={user.id}
                  className="bg-gray-700 mb-3 last:mb-0 p-4 rounded-lg hover:bg-gray-650 transition-colors"
                >
                  <p className="font-medium text-lg text-white">{user.name}</p>
                  <p className="text-gray-300">{user.email}</p>
                  <div className="mt-3 flex justify-between items-center">
                    <span className="text-gray-300">
                      Current Rentals: {user.currentRentals.length}
                    </span>
                    <button
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
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
    </div>
  );

  // Render Available Book Search
  const renderAvailableBookSearch = () => (
    <div className="p-4 border-b border-gray-700">
      <div className="flex flex-col  md:flex-row gap-3">
        <select
          value={availableBookSearch.type}
          onChange={(e) =>
            setAvailableBookSearch({
              ...availableBookSearch,
              type: e.target.value as "id" | "name",
            })
          }
          className="bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 w-11/12 md:w-auto focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
        >
          <option value="id">Search by ID</option>
          <option value="name">Search by Title</option>
        </select>
        <input
          type="text"
          placeholder={`Enter ${
            availableBookSearch.type === "id" ? "book ID" : "book title"
          }`}
          value={availableBookSearch.query}
          onChange={(e) =>
            setAvailableBookSearch({
              ...availableBookSearch,
              query: e.target.value,
            })
          }
          className="bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 flex-1 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
        />
        {/* <select
          value={availableBookSearch.sortBy}
          onChange={(e) =>
            setAvailableBookSearch({
              ...availableBookSearch,
              sortBy: e.target.value as
                | "id"
                | "title"
                | "author"
                | "class"
                | "genre"
                | "totalCopies"
                | "availableCopies",
            })
          }
          className="bg-gray-700 text-white border  rounded-lg px-4 py-2 w-32 md:w-32 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
        >
          <option value="id">Sort by ID</option>
          <option value="title">Sort by Title</option>
          <option value="author">Sort by Author</option>
          <option value="class">Sort by Class</option>
          <option value="genre">Sort by Genre</option>
          <option value="totalCopies">Sort by Total Copies</option>
          <option value="availableCopies">Sort by Available Copies</option>
        </select> */}
        <button
          onClick={() =>
            setAvailableBookSearch({ type: "id", query: "", sortBy: "id" })
          }
          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition-colors w-full md:w-auto"
        >
          Clear
        </button>
      </div>
    </div>
  );

  // Render Rental History Tab
  const renderRentalHistoryTab = () => (
    <div className="bg-gray-900 p-6 rounded-lg">
      <h2 className="text-3xl font-bold mb-6 text-white">Rental History</h2>
      <button
        onClick={() => handleExport("rentals")}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 mb-4 transition-colors"
        title="Export Rental History"
      >
        <Download size={18} className="mr-1" /> Export Rental History
      </button>

      <div className="flex flex-col md:flex-row items-center mb-6 space-y-2 md:space-y-0 md:space-x-4">
        <select
          value={rentalHistorySearch.type}
          onChange={(e) =>
            setRentalHistorySearch({
              ...rentalHistorySearch,
              type: e.target.value as "id" | "name",
            })
          }
          className="bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2 w-full md:w-auto focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        >
          <option value="id">Search by ID</option>
          <option value="name">Search by Name</option>
        </select>
        <input
          type="text"
          placeholder={`Enter ${
            rentalHistorySearch.type === "id" ? "rental ID" : "user name"
          }`}
          value={rentalHistorySearch.query}
          onChange={(e) =>
            setRentalHistorySearch({
              ...rentalHistorySearch,
              query: e.target.value,
            })
          }
          className="bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2 w-full md:w-auto focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
        <select
          value={rentalHistorySearch.sortBy}
          onChange={(e) =>
            setRentalHistorySearch({
              ...rentalHistorySearch,
              sortBy: e.target.value as
                | "id"
                | "rentalDate"
                | "dueDate"
                | "returnDate"
                | "customReturnDate",
            })
          }
          className="bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2 w-full md:w-auto focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        >
          <option value="id">Sort by ID</option>
          <option value="rentalDate">Sort by Rental Date</option>
          <option value="dueDate">Sort by Due Date</option>
          <option value="returnDate">Sort by Return Date</option>
          <option value="customReturnDate">Sort by Custom Return Date</option>
        </select>
        <button
          onClick={() =>
            setRentalHistorySearch({ type: "id", query: "", sortBy: "id" })
          }
          className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg w-full md:w-auto transition-colors"
        >
          Clear
        </button>
      </div>

      <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
        {groupRentalsByUser(searchRentalHistory(rentals)).map((group) => (
          <div key={group.userId} className="mb-6">
            <h3 className="text-2xl font-semibold mb-4 text-white">
              {users.find((user) => user.id === group.userId)?.name ||
                "Unknown User"}
            </h3>
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-700">
                    <th className="p-4 text-left text-white font-medium">
                      Book
                    </th>
                    <th className="p-4 text-left text-white font-medium">
                      Rental Date
                    </th>
                    <th className="p-4 text-left text-white font-medium">
                      Due Date
                    </th>
                    <th className="p-4 text-left text-white font-medium">
                      Custom Return Date
                    </th>
                    <th className="p-4 text-left text-white font-medium">
                      Return Date
                    </th>
                    <th className="p-4 text-left text-white font-medium">
                      Return Time
                    </th>
                    <th className="p-4 text-left text-white font-medium">
                      Status
                    </th>
                    <th className="p-4 text-left text-white font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {group.rentals.map((rental) => (
                    <tr
                      key={rental.id}
                      className="border-t border-gray-700 hover:bg-gray-750"
                    >
                      <td className="p-4 text-white">
                        {books.find((book) => book.id === rental.bookId)
                          ?.title || "Unknown Book"}
                      </td>
                      <td className="p-4 text-gray-300">
                        {new Date(rental.rentalDate).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-gray-300">
                        {new Date(rental.dueDate).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-gray-300">
                        {rental.customReturnDate
                          ? new Date(
                              rental.customReturnDate
                            ).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="p-4 text-gray-300">
                        {rental.returnDate
                          ? new Date(rental.returnDate).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="p-4 text-gray-300">
                        {rental.returnTime || "N/A"}
                      </td>
                      <td className="p-4 text-gray-300">
                        {rental.returnDate ? (
                          new Date(rental.returnDate) <=
                          new Date(rental.dueDate) ? (
                            <span className="text-green-400">On Time</span>
                          ) : (
                            <span className="text-red-400">Late</span>
                          )
                        ) : (
                          "Not Returned"
                        )}
                      </td>
                      <td className="p-4">
                        <button
                          className="text-blue-400 hover:text-blue-300 transition-colors ml-2"
                          onClick={() => {
                            setSelectedRental(rental);
                            setIsDeleteRentalModalOpen(true);
                          }}
                        >
                          Delete
                        </button>
                        {!rental.returnDate && (
                          <button
                            className="text-blue-400 hover:text-blue-300 transition-colors ml-2"
                            onClick={() => {
                              setSelectedRental(rental);
                              setIsReturnBookModalOpen(true);
                            }}
                          >
                            Return
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
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
        <select
          value={unreturnedBooksSearch.sortBy}
          onChange={(e) =>
            setUnreturnedBooksSearch({
              ...unreturnedBooksSearch,
              sortBy: e.target.value as
                | "id"
                | "rentalDate"
                | "dueDate"
                | "customReturnDate",
            })
          }
          className="border p-2 rounded-md w-full md:w-auto hover:border-blue-500 focus:border-blue-500 bg-gray-800 text-white"
        >
          <option value="id">Sort by ID</option>
          <option value="rentalDate">Sort by Rental Date</option>
          <option value="dueDate">Sort by Due Date</option>
          <option value="customReturnDate">Sort by Custom Return Date</option>
        </select>
        <button
          onClick={() =>
            setUnreturnedBooksSearch({ type: "id", query: "", sortBy: "id" })
          }
          className="bg-gray-700 p-2 rounded-md w-full md:w-auto hover:bg-gray-600 text-white"
        >
          Clear
        </button>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {groupRentalsByUser(
          searchUnreturnedBooks(rentals).filter(
            (rental) =>
              !rental.returnDate && new Date(rental.dueDate) < new Date()
          )
        ).map((group) => (
          <div key={group.userId} className="mb-4">
            <h3 className="text-2xl font-semibold mb-2 text-white">
              {users.find((user) => user.id === group.userId)?.name}
            </h3>
            <table className="w-full bg-gray-800 border rounded-xl shadow-md">
              <thead>
                <tr className="bg-gray-700">
                  <th className="p-3 border text-white">Book</th>
                  <th className="p-3 border text-white">Rental Date</th>
                  <th className="p-3 border text-white">Due Date</th>
                  <th className="p-3 border text-white">Custom Return Date</th>
                  <th className="p-3 border text-white">Status</th>
                </tr>
              </thead>
              <tbody>
                {group.rentals.map((rental) => (
                  <tr key={rental.id} className="bg-gray-600">
                    <td className="p-3 border text-white">
                      {books.find((book) => book.id === rental.bookId)?.title}
                    </td>
                    <td className="p-3 border text-gray-300">
                      {new Date(rental.rentalDate).toLocaleDateString()}
                    </td>
                    <td className="p-3 border text-gray-300">
                      {new Date(rental.dueDate).toLocaleDateString()}
                    </td>
                    <td className="p-3 border text-gray-300">
                      {rental.customReturnDate
                        ? new Date(rental.customReturnDate).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="p-3 border text-gray-300">Not Returned</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );

  // Render Returned Books Tab
  const renderReturnedBooksTab = () => (
    <div className="bg-gray-900 p-6 rounded-lg">
      <h2 className="text-3xl font-bold mb-6 text-white">Returned Books</h2>
      <button
        onClick={() => handleExport("rentals")}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 mb-4 transition-colors"
        title="Export Returned Books"
      >
        <Download size={18} className="mr-1" /> Export Returned Books
      </button>

      <div className="flex flex-col md:flex-row items-center mb-6 space-y-2 md:space-y-0 md:space-x-4">
        <select
          value={returnedBooksSearch.type}
          onChange={(e) =>
            setReturnedBooksSearch({
              ...returnedBooksSearch,
              type: e.target.value as "id" | "name",
            })
          }
          className="bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2 w-full md:w-auto focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        >
          <option value="id">Search by ID</option>
          <option value="name">Search by Name</option>
        </select>

        <input
          type="text"
          placeholder={`Enter ${
            returnedBooksSearch.type === "id" ? "rental ID" : "user name"
          }`}
          value={returnedBooksSearch.query}
          onChange={(e) =>
            setReturnedBooksSearch({
              ...returnedBooksSearch,
              query: e.target.value,
            })
          }
          className="bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2 w-full md:w-auto focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />

        <select
          value={returnedBooksSearch.sortBy}
          onChange={(e) =>
            setReturnedBooksSearch({
              ...returnedBooksSearch,
              sortBy: e.target.value as
                | "id"
                | "rentalDate"
                | "dueDate"
                | "returnDate"
                | "customReturnDate",
            })
          }
          className="bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2 w-full md:w-auto focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        >
          <option value="id">Sort by ID</option>
          <option value="rentalDate">Sort by Rental Date</option>
          <option value="dueDate">Sort by Due Date</option>
          <option value="returnDate">Sort by Return Date</option>
          <option value="customReturnDate">Sort by Custom Return Date</option>
        </select>

        <button
          onClick={() =>
            setReturnedBooksSearch({ type: "id", query: "", sortBy: "id" })
          }
          className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg w-full md:w-auto transition-colors"
        >
          Clear
        </button>
      </div>

      <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
        {groupRentalsByUser(
          searchReturnedBooks(rentals).filter((rental) => rental.returnDate)
        ).map((group) => (
          <div key={group.userId} className="mb-6">
            <h3 className="text-2xl font-semibold mb-4 text-white">
              {users.find((user) => user.id === group.userId)?.name ||
                "Unknown User"}
            </h3>
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-700">
                    <th className="p-4 text-left text-white font-medium">
                      Book
                    </th>
                    <th className="p-4 text-left text-white font-medium">
                      Rental Date
                    </th>
                    <th className="p-4 text-left text-white font-medium">
                      Due Date
                    </th>
                    <th className="p-4 text-left text-white font-medium">
                      Custom Return Date
                    </th>
                    <th className="p-4 text-left text-white font-medium">
                      Return Date
                    </th>
                    <th className="p-4 text-left text-white font-medium">
                      Return Time
                    </th>
                    <th className="p-4 text-left text-white font-medium">
                      Status
                    </th>
                    <th className="p-4 text-left text-white font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {group.rentals.map((rental) => (
                    <tr
                      key={rental.id}
                      className="border-t border-gray-700 hover:bg-gray-750"
                    >
                      <td className="p-4 text-white">
                        {books.find((book) => book.id === rental.bookId)
                          ?.title || "Unknown Book"}
                      </td>
                      <td className="p-4 text-gray-300">
                        {new Date(rental.rentalDate).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-gray-300">
                        {new Date(rental.dueDate).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-gray-300">
                        {rental.customReturnDate
                          ? new Date(
                              rental.customReturnDate
                            ).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="p-4 text-gray-300">
                        {rental.returnDate &&
                          new Date(rental.returnDate).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-gray-300">
                        {rental.returnTime || "N/A"}
                      </td>
                      <td className="p-4 text-gray-300">
                        {rental.returnDate &&
                          (new Date(rental.returnDate) <=
                          new Date(rental.dueDate) ? (
                            <span className="text-green-400">On Time</span>
                          ) : (
                            <span className="text-red-400">Late</span>
                          ))}
                      </td>
                      <td className="p-4">
                        <button
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                          onClick={() => undoReturnBook(rental.id)}
                        >
                          Undo Return
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
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
        {localStorage.getItem("lastBackupTime")
          ? new Date(
              parseInt(localStorage.getItem("lastBackupTime")!, 10)
            ).toLocaleString()
          : "N/A"}
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

  // Group rentals by user
  const groupRentalsByUser = (rentals: Rental[]) => {
    const groupedRentals: { userId: number; rentals: Rental[] }[] = [];
    const userIds = new Set(rentals.map((rental) => rental.userId));

    userIds.forEach((userId) => {
      const userRentals = rentals.filter((rental) => rental.userId === userId);
      groupedRentals.push({ userId, rentals: userRentals });
    });

    return groupedRentals;
  };

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
          onClick={() => setActiveTab("returned")}
          className={`flex items-center space-x-2 p-3 rounded-xl ${
            activeTab === "returned"
              ? "bg-blue-500 text-white"
              : "bg-gray-700 text-gray-300"
          }`}
        >
          <ShoppingCart />
          <span>Returned Books</span>
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
        <button
          onClick={() => setActiveTab("admin")}
          className={`flex items-center space-x-2 p-3 rounded-xl ${
            activeTab === "admin"
              ? "bg-blue-500 text-white"
              : "bg-gray-700 text-gray-300"
          }`}
        >
          <Lock />
          <span>Admin</span>
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
                  class: "",
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
                <th className="p-3 border text-white">Class</th>
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
                  <td className="p-3 border text-white">{book.class}</td>
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
              className="bg-green-500 text-white px-4 py-4 flex flex-row justify-center items-center rounded-xl hover:bg-green-600"
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

      {activeTab === "returned" && renderReturnedBooksTab()}

      {activeTab === "backup" && renderBackupTab()}

      {activeTab === "admin" && renderAdminPanel()}

      {renderBookModal()}
      {renderUserModal()}
      {renderRentalModal()}
      {renderRentVerificationModal()}
      {renderDeleteRentalModal()}
      {renderViewRentalsModal()}
      {renderDeleteBookModal()}
      {renderReturnBookModal()}
      {renderDeleteUserModal()}

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-xl flex items-center space-x-2">
          <Bell className="text-white" />
          <div>
            {notifications.map((notification, index) => (
              <p key={index} className="text-sm">
                {notification}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Export All Button */}
      <button
        onClick={() => handleExport("all")}
        className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-4 flex flex-row justify-center items-center rounded-xl hover:bg-blue-600"
        title="Export All"
      >
        <Download size={16} className="mr-1" /> Export All
      </button>
    </div>
  );
};

export default LibraryManagementSystem;
