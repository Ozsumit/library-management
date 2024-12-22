"use client";
import React, { useState } from "react";
import { saveAs } from "file-saver";
import { Plus, Edit3, Trash2 } from "lucide-react";

interface Book {
  id: number;
  title: string;
  author: string;
  class: string;
  genre: string;
  totalCopies: number;
  availableCopies: number;
}

const BulkBookAddition: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [newBooks, setNewBooks] = useState<Book[]>([
    {
      id: 0,
      title: "",
      author: "",
      class: "",
      genre: "",
      totalCopies: 0,
      availableCopies: 0,
    },
  ]);

  const handleInputChange = (
    index: number,
    field: keyof Book,
    value: string | number
  ) => {
    const updatedBooks = [...newBooks];
    updatedBooks[index] = { ...updatedBooks[index], [field]: value };
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
      lastBook.title !== "" ||
      lastBook.author !== "" ||
      lastBook.class !== "" ||
      lastBook.genre !== "" ||
      lastBook.totalCopies !== 0 ||
      lastBook.availableCopies !== 0
    ) {
      addRow();
    }
  };

  const addRow = () => {
    setNewBooks([
      ...newBooks,
      {
        id: 0,
        title: "",
        author: "",
        class: "",
        genre: "",
        totalCopies: 0,
        availableCopies: 0,
      },
    ]);
  };

  const addBooks = () => {
    const updatedBooks = newBooks.map((book, index) => ({
      ...book,
      id: books.length + index + 1,
    }));
    setBooks([...books, ...updatedBooks]);
    setNewBooks([
      {
        id: 0,
        title: "",
        author: "",
        class: "",
        genre: "",
        totalCopies: 0,
        availableCopies: 0,
      },
    ]);
  };

  const exportBooks = () => {
    const jsonString = JSON.stringify(books, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    saveAs(blob, "books.json");
  };

  return (
    <div className="bg-gray-900 p-6 rounded-lg text-white">
      <h2 className="text-3xl font-bold mb-6">Bulk Book Addition</h2>
      <table className="w-full border rounded-xl shadow-md bg-gray-800">
        <thead>
          <tr className="bg-gray-700">
            <th className="p-3 border text-white">Title</th>
            <th className="p-3 border text-white">Author</th>
            <th className="p-3 border text-white">Class</th>
            <th className="p-3 border text-white">Genre</th>
            <th className="p-3 border text-white">Total Copies</th>
            <th className="p-3 border text-white">Available Copies</th>
          </tr>
        </thead>
        <tbody>
          {newBooks.map((book, index) => (
            <tr key={index}>
              <td className="p-3 border">
                <input
                  type="text"
                  value={book.title}
                  onChange={(e) =>
                    handleInputChange(index, "title", e.target.value)
                  }
                  className="w-full border p-2 rounded-md bg-gray-700 text-white"
                />
              </td>
              <td className="p-3 border">
                <input
                  type="text"
                  value={book.author}
                  onChange={(e) =>
                    handleInputChange(index, "author", e.target.value)
                  }
                  className="w-full border p-2 rounded-md bg-gray-700 text-white"
                />
              </td>
              <td className="p-3 border">
                <input
                  type="text"
                  value={book.class}
                  onChange={(e) =>
                    handleInputChange(index, "class", e.target.value)
                  }
                  className="w-full border p-2 rounded-md bg-gray-700 text-white"
                />
              </td>
              <td className="p-3 border">
                <input
                  type="text"
                  value={book.genre}
                  onChange={(e) =>
                    handleInputChange(index, "genre", e.target.value)
                  }
                  className="w-full border p-2 rounded-md bg-gray-700 text-white"
                />
              </td>
              <td className="p-3 border">
                <input
                  type="number"
                  value={book.totalCopies}
                  onChange={(e) =>
                    handleInputChange(
                      index,
                      "totalCopies",
                      parseInt(e.target.value)
                    )
                  }
                  className="w-full border p-2 rounded-md bg-gray-700 text-white"
                />
              </td>
              <td className="p-3 border">
                <input
                  type="number"
                  value={book.availableCopies}
                  onChange={(e) =>
                    handleInputChange(
                      index,
                      "availableCopies",
                      parseInt(e.target.value)
                    )
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Tab" || e.key === "Enter") {
                      addRowIfNeeded();
                    }
                  }}
                  className="w-full border p-2 rounded-md bg-gray-700 text-white"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        onClick={addRow}
        className="bg-green-500 text-white px-4 py-2 rounded-md mt-4 hover:bg-green-600"
      >
        Add Row
      </button>
      <button
        onClick={addBooks}
        className="bg-blue-500 text-white px-4 py-2 rounded-md mt-4 ml-2 hover:bg-blue-600"
      >
        Add Books
      </button>
      <button
        onClick={exportBooks}
        className="bg-blue-500 text-white px-4 py-2 rounded-md mt-4 ml-2 hover:bg-blue-600"
      >
        Export Books
      </button>
    </div>
  );
};

export default BulkBookAddition;
