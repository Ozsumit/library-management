"use client";
import React from "react";

interface BookModalProps {
  isOpen: boolean;
  currentBook: any; // Replace `any` with Book type
  setCurrentBook: React.Dispatch<React.SetStateAction<any>>; // Replace `any` with Book type
  onSave: (book: any) => void; // Replace `any` with Book type
  onClose: () => void;
}

const BookModal: React.FC<BookModalProps> = ({
  isOpen,
  currentBook,
  setCurrentBook,
  onSave,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">
          {currentBook ? "Edit Book" : "Add New Book"}
        </h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave(currentBook);
          }}
        >
          <input
            type="text"
            placeholder="Title"
            value={currentBook?.title || ""}
            onChange={(e) =>
              setCurrentBook({ ...currentBook, title: e.target.value })
            }
            className="w-full border p-2 mb-2"
            required
          />
          {/* Other input fields */}
          <div className="flex justify-between">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Save
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookModal;
