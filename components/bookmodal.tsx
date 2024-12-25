"use client";

import React, { useState } from "react";
import { toast } from "react-toastify";

interface Book {
  id: number;
  title: string;
  author: string;
  class: string;
  source: string;
  totalCopies: number;
  availableCopies: number;
}

const INITIAL_BOOK: Book = {
  id: 0,
  title: "",
  author: "",
  class: "",
  source: "",
  totalCopies: 0,
  availableCopies: 0,
};

const BulkBookAddition = ({
  addBooks,
}: {
  addBooks: (books: Book[]) => void;
}) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [newBooks, setNewBooks] = useState<Book[]>([{ ...INITIAL_BOOK }]);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleInputChange = (
    index: number,
    field: keyof Book,
    value: string | number
  ) => {
    const updatedBooks = [...newBooks];
    updatedBooks[index] = {
      ...updatedBooks[index],
      [field]:
        field === "totalCopies" || field === "availableCopies"
          ? Number(value)
          : value,
    };
    setNewBooks(updatedBooks);

    if (
      field === "availableCopies" &&
      value !== "" &&
      index === newBooks.length - 1
    ) {
      addRowIfNeeded();
    }
  };

  const addRowIfNeeded = () => {
    const lastBook = newBooks[newBooks.length - 1];
    if (
      lastBook.title ||
      lastBook.author ||
      lastBook.class ||
      lastBook.source
    ) {
      addRow();
    }
  };

  const addRow = () => {
    setNewBooks([...newBooks, { ...INITIAL_BOOK, id: newBooks.length + 1 }]);
  };

  const saveBooks = () => {
    const validBooks = newBooks.filter((book) => book.title && book.author);

    if (validBooks.length === 0) {
      toast.error("Please add at least one valid book with title and author.");
      return;
    }

    const updatedBooks = validBooks.map((book, index) => ({
      ...book,
      id: books.length + index + 1,
    }));

    setBooks([...books, ...updatedBooks]);
    addBooks(updatedBooks);
    setNewBooks([{ ...INITIAL_BOOK }]);
    setShowSuccess(true);
    toast.success("Books added successfully!");
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const exportBooks = () => {
    const validBooks = newBooks.filter((book) => book.title && book.author);
    const booksToExport = [...books, ...validBooks];

    if (booksToExport.length > 0) {
      const jsonString = JSON.stringify(booksToExport, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "books.json";
      a.click();
      window.URL.revokeObjectURL(url);
    } else {
      toast.warning("No books to export.");
    }
  };

  return (
    <div className="bg-gray-900 p-6 rounded-lg w-full max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-white">Bulk Book Addition</h2>

      {showSuccess && (
        <div className="mb-4 p-4 bg-green-500/15 text-green-500 border border-green-500/50 rounded-md">
          Books added successfully!
        </div>
      )}

      <div className="rounded-lg overflow-hidden ">
        <table className="w-full border-0 border-none ">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="p-3 text-left border-b border-gray-700">Title</th>
              <th className="p-3 text-left border-b border-gray-700">Author</th>
              <th className="p-3 text-left border-b border-gray-700">Class</th>
              <th className="p-3 text-left border-b border-gray-700">Genre</th>
              <th className="p-3 text-left border-b border-gray-700">
                Total Copies
              </th>
              <th className="p-3 text-left border-b border-gray-700">
                Available
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-800">
            {newBooks.map((book, index) => (
              <tr key={index} className="border-b rounded-md last:border-0">
                <td className="p-2">
                  <input
                    type="text"
                    value={book.title}
                    onChange={(e) =>
                      handleInputChange(index, "title", e.target.value)
                    }
                    placeholder="Book title"
                    className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="text"
                    value={book.author}
                    onChange={(e) =>
                      handleInputChange(index, "author", e.target.value)
                    }
                    placeholder="Author name"
                    className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="text"
                    value={book.class}
                    onChange={(e) =>
                      handleInputChange(index, "class", e.target.value)
                    }
                    placeholder="Class"
                    className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  />
                </td>
                <td className="p-2">
                  <select
                    className="w-32 p-2 rounded bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                    value={book.source}
                    onChange={(e) =>
                      handleInputChange(index, "source", e.target.value)
                    } // Added onChange handler
                    required
                  >
                    <option value="" disabled>
                      Source
                    </option>
                    <option value="Donated">Donated</option>
                    <option value="Bought">Bought</option>
                  </select>
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    value={book.totalCopies || ""}
                    onChange={(e) =>
                      handleInputChange(index, "totalCopies", e.target.value)
                    }
                    placeholder="0"
                    min="0"
                    className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    value={book.availableCopies || ""}
                    onChange={(e) =>
                      handleInputChange(
                        index,
                        "availableCopies",
                        e.target.value
                      )
                    }
                    placeholder="0"
                    min="0"
                    onKeyDown={(e) => {
                      if (e.key === "Tab" || e.key === "Enter") {
                        addRowIfNeeded();
                      }
                    }}
                    className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={addRow}
          className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
        >
          Add Row
        </button>
        {/* <button
          onClick={saveBooks}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Save Books
        </button> */}
        <button
          onClick={exportBooks}
          disabled={books.length === 0 && newBooks.every((book) => !book.title)}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Export
        </button>
      </div>
    </div>
  );
};

export default BulkBookAddition;
