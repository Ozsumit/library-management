"use client";
import React, { useState, useEffect } from "react";
import Dashboard from "./search";
import JsonToPdfConverter from "./Table";
import BackupManager from "@/components/ui/CRUD";
import LibraryCardSystem from "./confirmdialog";
import {
  BookOpen,
  Users,
  ShoppingCart,
  Download,
  Upload,
  Clock,
  AlertCircle,
  History,
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
  Loader2,
} from "lucide-react";
import { openDB } from "idb";
import { saveAs } from "file-saver";
import { motion } from "framer-motion";
import Fuse from "fuse.js";
import { toast, ToastContainer } from "react-toastify";
import Footer from "./footer";
import axios from "axios";
import Link from "next/link";
import ExcelToJson from "./xcltojson";

// Types
interface Book {
  id: number;
  title: string;
  sources: string;
  class: string;
  genre: string;
  totalCopies: number;
  availableCopies: number;
  donated: boolean;
  bought: boolean;
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
  returnTime?: string;
  rentalType: "short" | "long";
}

interface SearchState {
  type: "id" | "name";
  query: string;
  sortBy:
    | "id"
    | "title"
    | "sources"
    | "class"
    | "genre"
    | "totalCopies"
    | "availableCopies"
    | "name"
    | "email"
    | "class"
    | "membershipDate"
    | "rentalDate"
    | "dueDate"
    | "returnDate"
    | "customReturnDate";
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
    | "Profiles"
    | "tools"
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
  const [customReturnDate, setCustomReturnDate] = useState("");
  const [rentalType, setRentalType] = useState<"short" | "long">("short");

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

  // ID Card Template State
  const [idCardTemplate, setIdCardTemplate] = useState(`
    ID Card
    --------
    Name: {name}
    ID: {id}
    Class: {class}
    Email: {email}
    Phone: {phone}
    Membership Date: {membershipDate}
  `);

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
    let data: any[] | { books: Book[]; users: User[]; rentals: Rental[] };
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
        data = { books, users, rentals };
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
        toast.success("Import successful!");
      } catch (error) {
        toast.error(
          "Error importing file. Please ensure it is a valid JSON file."
        );
      }
    };
    reader.readAsText(file);
  };

  // Merge data function
  // Replace the existing mergeData function with this updated version
  const mergeData = <T extends { id: number }>(
    existingData: T[],
    newData: T[]
  ) => {
    const dataMap = new Map<number, T>();
    // First add all existing items to the map
    existingData.forEach((item) => dataMap.set(item.id, item));
    // Then overwrite with new data, preserving backup entries
    newData.forEach((item) => dataMap.set(item.id, item));
    return Array.from(dataMap.values());
  };

  // Enhanced Search Helpers
  const fuseOptions = {
    includeScore: true,
    keys: ["title", "sources", "class", "genre"],
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
    result.sort((a, b) => (a.score ?? 0) - (b.score ?? 0));
    return result.map((item) => item.item);
  };

  const searchUsers = (users: User[]): User[] => {
    if (!userSearch.query) return users;
    const result = fuseUsers.search(userSearch.query);
    result.sort((a, b) => (a.score ?? 0) - (b.score ?? 0));
    return result.map((item) => item.item);
  };

  const searchRentalUsers = (users: User[]): User[] => {
    if (!rentalUserSearch.query) return users;
    const result = fuseUsers.search(rentalUserSearch.query);
    result.sort((a, b) => (a.score ?? 0) - (b.score ?? 0));
    return result.map((item) => item.item);
  };

  const searchRental = (users: User[]): User[] => {
    if (!rentalSearch.query) return users;
    const result = fuseUsers.search(rentalSearch.query);
    result.sort((a, b) => (a.score ?? 0) - (b.score ?? 0));
    return result.map((item) => item.item);
  };

  const searchRentalHistory = (rentals: Rental[]): Rental[] => {
    if (!rentalHistorySearch.query) return rentals;
    const result = fuseRentals.search(rentalHistorySearch.query);
    result.sort((a, b) => (a.score ?? 0) - (b.score ?? 0));
    return result.map((item) => item.item);
  };

  const searchUnreturnedBooks = (rentals: Rental[]): Rental[] => {
    if (!unreturnedBooksSearch.query) return rentals;
    const result = fuseRentals.search(unreturnedBooksSearch.query);
    result.sort((a, b) => (a.score ?? 0) - (b.score ?? 0));
    return result.map((item) => item.item);
  };

  const searchBookRentals = (rentals: Rental[]): Rental[] => {
    if (!bookRentalSearch.query) return rentals;
    const result = fuseRentals.search(bookRentalSearch.query);
    result.sort((a, b) => (a.score ?? 0) - (b.score ?? 0));
    return result.map((item) => item.item);
  };

  const searchAvailableBooks = (books: Book[]): Book[] => {
    if (!availableBookSearch.query) return books;
    const result = fuseBooks.search(availableBookSearch.query);
    result.sort((a, b) => (a.score ?? 0) - (b.score ?? 0));
    return result.map((item) => item.item);
  };

  const searchReturnedBooks = (rentals: Rental[]): Rental[] => {
    if (!returnedBooksSearch.query) return rentals;
    const result = fuseRentals.search(returnedBooksSearch.query);
    result.sort((a, b) => (a.score ?? 0) - (b.score ?? 0));
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
      const bookExists = books.some((book) => book.id === selectedBook.id);

      if (bookExists && selectedBook.id === parseInt(verificationUserId)) {
        setBooks(books.filter((book) => book.id !== selectedBook.id));
        setIsDeleteBookModalOpen(false);
        setSelectedBook(null);
        createBackup();
        console.log(`Book with ID: ${selectedBook.id} deleted.`);
      } else {
        toast.error("Selected book does not exist or the ID is incorrect.");
        console.log(
          "Delete operation aborted: Book not found or incorrect ID."
        );
      }
    } else {
      toast.error("No book selected for deletion.");
      console.log("Delete operation aborted: No book selected.");
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
    if (selectedUser && selectedUser.id === parseInt(verificationUserId)) {
      setUsers(users.filter((user) => user.id !== selectedUser.id));
      setIsDeleteUserModalOpen(false);
      setSelectedUser(null);
      createBackup();
    } else {
      toast.error("Verification failed. Please enter the correct user ID.");
    }
  };

  // Rental Management Functions
  const addRental = (
    bookId: number,
    userId: number,
    customReturnDate: string,
    rentalType: "short" | "long"
  ) => {
    const rentalDate = new Date().toISOString();
    const dueDate =
      rentalType === "short"
        ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
        : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
    const newRental = {
      id: generateNumericId(rentals),
      bookId,
      userId,
      rentalDate,
      dueDate,
      customReturnDate,
      rentalType,
    };
    setRentals([...rentals, newRental]);

    setBooks(
      books.map((book) =>
        book.id === bookId
          ? { ...book, availableCopies: book.availableCopies - 1 }
          : book
      )
    );

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
      setBooks(
        books.map((book) =>
          book.id === rental.bookId
            ? { ...book, availableCopies: book.availableCopies + 1 }
            : book
        )
      );

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
      toast.error("Verification failed. Please enter the correct user ID.");
    }
  };

  const verifyAndRentBook = () => {
    if (
      selectedBook &&
      selectedUser &&
      selectedUser.id === parseInt(rentVerificationUserId) &&
      rentVerificationUserId.trim() !== ""
    ) {
      addRental(selectedBook.id, selectedUser.id, customReturnDate, rentalType);
      setIsRentVerificationModalOpen(false);
      setSelectedBook(null);
      setSelectedUser(null);
      setRentVerificationUserId("");
      setCustomReturnDate("");
      setRentalType("short");
    } else {
      toast.error("Verification failed. Please enter the correct user ID.");
    }
  };

  // Return Book Function
  const returnBook = (rentalId: number) => {
    const rental = rentals.find((r) => r.id === rentalId);
    if (rental) {
      setBooks(
        books.map((book) =>
          book.id === rental.bookId
            ? { ...book, availableCopies: book.availableCopies + 1 }
            : book
        )
      );

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

      toast.success(
        `Book "${
          books.find((book) => book.id === rental.bookId)?.title
        }" returned by user "${
          users.find((user) => user.id === rental.userId)?.name
        }".`
      );

      createBackup();
    }
  };

  // Undo Return Book Function
  const undoReturnBook = (rentalId: number) => {
    const rental = rentals.find((r) => r.id === rentalId);
    if (rental) {
      setBooks(
        books.map((book) =>
          book.id === rental.bookId
            ? { ...book, availableCopies: book.availableCopies - 1 }
            : book
        )
      );

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
      setBooks(
        books.map((book) =>
          book.id === rental.bookId
            ? { ...book, availableCopies: book.availableCopies + 1 }
            : book
        )
      );

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
  const generateNumericId = (items: any[]) => {
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
    await tx.done;
  };

  // Create Backup Function
  const createBackup = async () => {
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

      const response = await axios.post("/api/save-backup", { data });

      if (response.status === 200) {
        console.log(
          "Backup created successfully at:",
          new Date().toLocaleString()
        );
        console.log("Backup ID:", response.data.backupId);
      }
    } catch (error) {
      console.error(
        "Backup creation failed:",
        (error as any).response?.data?.message || (error as Error).message
      );
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
    }, 24 * 60 * 60 * 1000);

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
              | "sources"
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
        <option value="sources">Sort by Sources</option>
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

  // Render User Search
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
      <button
        onClick={() =>
          setRentalUserSearch({ type: "id", query: "", sortBy: "id" })
        }
        className="bg-gray-700 text-white p-2 rounded-md w-full md:w-auto hover:bg-gray-600"
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
            <select
              className="w-full border p-3 mb-3 rounded-md hover:border-blue-500 focus:border-blue-500 bg-gray-700 text-white"
              value={currentBook?.sources || ""}
              onChange={(e) =>
                setCurrentBook({
                  ...currentBook!,
                  sources: e.target.value,
                })
              }
              required
            >
              <option value="" disabled>
                Select Source
              </option>
              <option value="Donated">Donated</option>
              <option value="Bought">Bought</option>
            </select>

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
                  sortBy: prevState.sortBy,
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
          <select
            value={rentalType}
            onChange={(e) => setRentalType(e.target.value as "short" | "long")}
            className="w-full border p-3 mb-3 rounded-md hover:border-blue-500 focus:border-blue-500 bg-gray-700 text-white"
          >
            <option value="short">Short Term (14 days)</option>
            <option value="long">Long Term (1 year)</option>
          </select>
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
    <LibraryCardSystem
      users={users.map((user) => ({ ...user, phone: user.phone || "" }))}
    />
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
                          {book.sources} •{" "}
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
      <div className="flex flex-col md:flex-row gap-3">
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
  const renderRentalHistoryTab = () => {
    // Helper function to determine the color class based on due date proximity
    const getDueDateColor = (dueDate: Date) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normalize today's date to midnight
      const due = new Date(dueDate);
      due.setHours(0, 0, 0, 0); // Normalize due date to midnight
      const diffTime = due.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24)); // Calculate days difference

      if (diffDays <= 1) {
        // Red for past due, today, or tomorrow
        return "text-red-500";
      } else if (diffDays <= 3) {
        // Orange for 2-3 days remaining
        return "text-orange-500";
      } else if (diffDays <= 7) {
        // Yellow for 4-7 days remaining
        return "text-yellow-500";
      } else {
        // Green for 8+ days remaining
        return "text-green-500";
      }
    };

    return (
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
                        <td
                          className={`p-4 ${getDueDateColor(
                            new Date(rental.dueDate)
                          )}`}
                        >
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
  };

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
              !rental.returnDate &&
              new Date(rental.customReturnDate || rental.dueDate) < new Date()
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
            <h3 className="text-2xl font-semibold mb-2 text-white">
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
    <div className="w-full min-h-full flex flex-col bg-gray-900">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        <div className="bg-gray-800  dark:bg-gray-800 rounded-2xl shadow-lg p-6  border-gray-700 flex flex-col">
          <div className="flex items-center mb-4">
            <Download
              size={24}
              className="mr-3 text-blue-500 dark:text-blue-400"
            />
            <h2 className="text-xl font-semibold text-white">Create Backup</h2>
          </div>
          <button
            onClick={() => handleExport("all")}
            className="
              w-full py-3 px-4 
             bg-blue-600 
              text-white 
              rounded-xl 
              :hover:bg-blue-700
              transition-colors
              flex items-center justify-center
            "
          >
            <Download size={20} className="mr-2" />
            Create Full Backup
          </button>
          <p className="mt-4 text-sm text-gray-400 text-center">
            Last Backup:{" "}
            {localStorage.getItem("lastBackupTime")
              ? new Date(
                  parseInt(localStorage.getItem("lastBackupTime")!, 10)
                ).toLocaleString()
              : "No recent backup"}
          </p>
        </div>

        <div className="bg-gray-800  dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-gray-700 flex flex-col">
          <div className="flex items-center mb-4">
            <Upload
              size={24}
              className="mr-3 text-green-500 dark:text-green-400"
            />
            <h2 className="text-xl font-semibold text-white">Import Backup</h2>
          </div>
          <label
            className="
              w-full py-3 px-4
              bg-green-500 dark:bg-green-600 
              text-white 
              rounded-xl 
              hover:bg-green-600 dark:hover:bg-green-700
              transition-colors
              flex items-center justify-center
              cursor-pointer
            "
          >
            <Upload size={20} className="mr-2" />
            Import Backup File
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={(e) => handleImport("all", e)}
            />
          </label>
          <p className="mt-4 text-sm text-gray-400 text-center">
            Restore from a previous backup
          </p>
        </div>
      </div>
      <BackupManager />
    </div>
  );

  // Render Tools Tab
  const renderToolsTab = () => (
    <div className="bg-gray-900 p-6  rounded-lg">
      <Dashboard
        users={users.length}
        books={books.length}
        donatedBooks={books.filter((book) => book.donated).length}
        boughtBooks={books.filter((book) => book.bought).length}
        totalCopies={books.reduce((total, book) => total + book.totalCopies, 0)}
        availableCopies={books.reduce(
          (total, book) => total + book.availableCopies,
          0
        )}
      />
      <h2 className="text-3xl  font-bold mb-6 text-white">Tools</h2>
      <div className="grid grid-cols-1 mr-8 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* ID Card Generator */}
        {/* <div className="bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-2xl font-semibold mb-4 text-white">
            ID Card Generator
          </h3>
          <div className="mb-4">
            <label className="block text-sm font-medium text-white">
              Select User
            </label>
            <select
              value={selectedUser?.id || ""}
              onChange={(e) =>
                setSelectedUser(
                  users.find((user) => user.id === parseInt(e.target.value)) ||
                    null
                )
              }
              className="w-full border p-3 rounded-md hover:border-blue-500 focus:border-blue-500 bg-gray-700 text-white"
            >
              <option value="" disabled>
                Select a user
              </option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-white">
              ID Card Template
            </label>
            <textarea
              value={idCardTemplate}
              onChange={(e) => setIdCardTemplate(e.target.value)}
              className="w-full border p-3 rounded-md hover:border-blue-500 focus:border-blue-500 bg-gray-700 text-white"
              rows={10}
            />
          </div>
          <button
            onClick={generateIdCard}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Generate ID Card
          </button>
        </div> */}

        {/* Reset Database */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-2xl font-semibold mb-4 text-white">
            Reset Database
          </h3>
          <p className="mb-4 text-white">
            This action will reset the database to its initial state. All data
            will be lost.
          </p>
          <button
            onClick={resetDatabase}
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
          >
            Reset Database
          </button>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-2xl font-semibold mb-4 text-white">
            Reset Users
          </h3>
          <p className="mb-4 text-white">
            This action will reset the users to its initial state. All data will
            be lost.
          </p>
          <button
            onClick={resetusers}
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
          >
            Reset Users
          </button>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-2xl font-semibold mb-4 text-white">
            Reset Books
          </h3>
          <p className="mb-4 text-white">
            This action will reset the books to its initial state. All data will
            be lost.
          </p>
          <button
            onClick={resetbooks}
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
          >
            Reset Books
          </button>
        </div>

        {/* Bulk Book Addition */}
        <div className="bg-gray-800 max-h-[20rem] p-6 rounded-lg shadow-md">
          <h3 className="text-2xl font-semibold mb-4 text-white">
            Bulk Book Addition
          </h3>
          <p className="mb-4 text-white">Add books in bulk with easy layout</p>
          <Link href="/books">
            <button className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-red-600">
              Add Books
            </button>
          </Link>
        </div>
        <ExcelToJson />
        <JsonToPdfConverter />
      </div>{" "}
      <div className="p-4"></div>
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
                    toast.error("Incorrect password. Please try again.");
                  }
                }}
              >
                Login
              </button>
              {/* <Link href="/books">Bulk add</Link> */}
              <Footer />
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
                      sources: "",
                      class: "",
                      genre: "",
                      totalCopies: 0,
                      availableCopies: 0,
                      donated: false,
                      bought: false,
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
                      <th className="p-3 border text-white">Sources</th>
                      <th className="p-3 border text-white">Class</th>
                      <th className="p-3 border text-white">Genre</th>
                      <th className="p-3 border text-white">Total Copies</th>
                      <th className="p-3 border text-white">Available</th>
                      <th className="p-3 border text-white">Donated</th>
                      <th className="p-3 border text-white">Bought</th>
                      <th className="p-3 border text-white">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchBooks(books).map((book) => (
                      <tr key={book.id} className="hover:bg-gray-600">
                        <td className="p-3 border text-white">{book.id}</td>
                        <td className="p-3 border text-white">{book.title}</td>
                        <td className="p-3 border text-white">
                          {book.sources}
                        </td>
                        <td className="p-3 border text-white">{book.class}</td>
                        <td className="p-3 border text-white">{book.genre}</td>
                        <td className="p-3 border text-center text-white">
                          {book.totalCopies}
                        </td>
                        <td className="p-3 border text-center text-white">
                          {book.availableCopies}
                        </td>
                        <td className="p-3 border text-center text-white">
                          {book.donated ? "Yes" : "No"}
                        </td>
                        <td className="p-3 border text-center text-white">
                          {book.bought ? "Yes" : "No"}
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
                        <td className="p-3 border text-white">
                          {rental.bookId}
                        </td>
                        <td className="p-3 border text-white">
                          {rental.userId}
                        </td>
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
                          {rental.returnTime || "N/A"}
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

  // Generate ID Card
  const generateIdCard = () => {
    if (!selectedUser) {
      toast.error("Please select a user to generate an ID card.");
      return;
    }

    const idCardContent = idCardTemplate
      .replace("{name}", selectedUser.name)
      .replace("{id}", selectedUser.id.toString())
      .replace("{class}", selectedUser.class)
      .replace("{email}", selectedUser.email)
      .replace("{phone}", selectedUser.phone || "N/A")
      .replace(
        "{membershipDate}",
        new Date(selectedUser.membershipDate).toLocaleDateString()
      );

    const blob = new Blob([idCardContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ID_Card_${selectedUser.name}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Reset Database
  const resetDatabase = () => {
    const adminPassword = "admin123"; // Define the required password

    const userInput = window.prompt(
      "Enter the admin password to reset the database:"
    );

    if (userInput === adminPassword) {
      if (
        window.confirm(
          "Are you sure you want to reset the database? All data will be lost."
        )
      ) {
        localStorage.clear();
        setBooks([]);
        setUsers([]);
        setRentals([]);
        toast.success("Database has been reset.");
      }
    } else {
      toast.error("Incorrect password. Database reset canceled.");
    }
  };

  const resetusers = () => {
    const adminPassword = "admin123"; // Define the required password

    const userInput = window.prompt(
      "Enter the admin password to delete all users:"
    );

    if (userInput === adminPassword) {
      if (
        window.confirm(
          "Are you sure you want to delete all users? All data will be lost."
        )
      ) {
        localStorage.clear();
        //
        setUsers([]);

        toast.success("All users have been reset.");
      }
    } else {
      toast.error("Incorrect password. Database reset canceled.");
    }
  };

  const resetbooks = () => {
    const adminPassword = "admin123"; // Define the required password

    const userInput = window.prompt(
      "Enter the admin password to delete all books:"
    );

    if (userInput === adminPassword) {
      if (
        window.confirm(
          "Are you sure you want to delete all books? All data will be lost."
        )
      ) {
        localStorage.clear();
        //
        setBooks([]);

        toast.success("All books have been reset.");
      }
    } else {
      toast.error("Incorrect password. Database reset canceled.");
    }
  };

  // Render Reset Database Modal
  const [isResetDatabaseModalOpen, setIsResetDatabaseModalOpen] =
    useState(false);
  const renderResetDatabaseModal = () => {
    if (!isResetDatabaseModalOpen) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
      >
        <div className="bg-gray-800 p-6 rounded-xl w-full max-w-md shadow-lg text-white">
          <h2 className="text-2xl font-bold mb-4">Reset Database</h2>
          <p className="mb-4">
            This action will reset the database to its initial state. All data
            will be lost.
          </p>
          <input
            type="password"
            placeholder="Enter Admin Password"
            className="w-full border p-3 mb-3 rounded-md hover:border-blue-500 focus:border-blue-500 bg-gray-700 text-white"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            required
          />
          <div className="flex justify-between">
            <button
              type="button"
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
              onClick={resetDatabase}
              disabled={!adminPassword.trim()}
            >
              Reset Database
            </button>
            <button
              type="button"
              className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600"
              onClick={() => setIsResetDatabaseModalOpen(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-gray-900 border-r border-gray-700 fixed h-full overflow-y-auto">
        <div className="p-4">
          <h2 className="text-xl font-bold text-white mb-6">Library System</h2>
          <nav className="space-y-2">
            {[
              { id: "books", label: "Books", icon: BookOpen },
              { id: "users", label: "Users", icon: Users },
              { id: "rentals", label: "Rentals", icon: ShoppingCart },
              { id: "rentalHistory", label: "History", icon: History },
              { id: "unreturned", label: "Unreturned", icon: AlertCircle },
              { id: "returned", label: "Returned", icon: CheckCircle },
              { id: "backup", label: "Backup", icon: Clock },
              { id: "Profiles", label: "Profiles", icon: Lock },
              { id: "tools", label: "Tools", icon: Settings },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  activeTab === item.id
                    ? "bg-indigo-600 text-white"
                    : "text-gray-300 hover:bg-gray-800"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64 p-8">
        {/* Export All Button */}
        <div className="flex justify-end mb-6">
          <button
            onClick={() => handleExport("all")}
            className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Download className="w-5 h-5 mr-2" />
            Export All
          </button>
        </div>

        {/* Content Sections */}
        {activeTab === "books" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Books</h2>
              <button
                onClick={() => {
                  setCurrentBook({
                    id: 0,
                    title: "",
                    sources: "",
                    class: "",
                    genre: "",
                    totalCopies: 0,
                    availableCopies: 0,
                    donated: false,
                    bought: false,
                  });
                  setIsBookModalOpen(true);
                }}
                className="inline-flex items-center px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Book
              </button>
            </div>

            {renderBookSearch()}

            <div className="overflow-hidden rounded-lg  border-gray-700 bg-gray-800/50 backdrop-blur-sm">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">
                      Sources
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">
                      Class
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">
                      Genre
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">
                      Total Copies
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">
                      Available
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {searchBooks(books).map((book) => (
                    <tr
                      key={book.id}
                      className="hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {book.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {book.title}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {book.sources}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {book.class}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {book.genre}
                      </td>
                      <td className="px-6 py-4 text-sm text-center text-gray-300">
                        {book.totalCopies}
                      </td>
                      <td className="px-6 py-4 text-sm text-center text-gray-300">
                        {book.availableCopies}
                      </td>
                      <td className="px-6 py-4 text-sm space-y-2 md:space-y-0 md:space-x-2 flex flex-col md:flex-row">
                        <button
                          onClick={() => {
                            setCurrentBook(book);
                            setIsBookModalOpen(true);
                          }}
                          className="inline-flex items-center px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors w-full md:w-auto"
                        >
                          <Edit className="w-4 h-4 mr-1" /> Edit
                        </button>
                        <button
                          onClick={() => deleteBook(book.id)}
                          className="inline-flex items-center px-3 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors w-full md:w-auto"
                        >
                          <Trash className="w-4 h-4 mr-1" /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Users</h2>
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
                className="inline-flex items-center px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" /> Add User
              </button>
            </div>

            {renderUserSearch()}

            <div className="overflow-hidden rounded-lg  border-gray-700 bg-gray-800/50 backdrop-blur-sm">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">
                      Class
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">
                      Membership Date
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {searchUsers(users).map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {user.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {user.class}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {new Date(user.membershipDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm space-x-2">
                        <button
                          onClick={() => {
                            setCurrentUser(user);
                            setIsUserModalOpen(true);
                          }}
                          className="inline-flex items-center px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                        >
                          <Edit className="w-4 h-4 mr-1" /> Edit
                        </button>
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="inline-flex items-center px-3 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        >
                          <Trash className="w-4 h-4 mr-1" /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "rentals" && renderRentalsTab()}
        {activeTab === "rentalHistory" && renderRentalHistoryTab()}
        {activeTab === "unreturned" && renderUnreturnedBooksTab()}
        {activeTab === "returned" && renderReturnedBooksTab()}
        {activeTab === "backup" && renderBackupTab()}
        {activeTab === "Profiles" && renderAdminPanel()}
        {activeTab === "tools" && renderToolsTab()}

        {renderBookModal()}
        {renderUserModal()}
        {renderRentalModal()}
        {renderRentVerificationModal()}
        {renderDeleteRentalModal()}
        {renderViewRentalsModal()}
        {renderDeleteBookModal()}
        {renderReturnBookModal()}
        {renderDeleteUserModal()}

        <ToastContainer position="bottom-right" autoClose={4000} />
      </div>
    </div>
  );
};

export default LibraryManagementSystem;
