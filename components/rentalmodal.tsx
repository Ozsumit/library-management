"use client";
import React from "react";

interface RentalModalProps {
  isOpen: boolean;
  rentalData: any; // Replace `any` with Rental type
  setRentalData: React.Dispatch<React.SetStateAction<any>>; // Replace `any` with Rental type
  onSave: (rental: any) => void; // Replace `any` with Rental type
  onClose: () => void;
  users: any[]; // Replace `any` with User type
  books: any[]; // Replace `any` with Book type
}

const RentalModal: React.FC<RentalModalProps> = ({
  isOpen,
  rentalData,
  setRentalData,
  onSave,
  onClose,
  users,
  books,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">
          {rentalData ? "Edit Rental" : "Add New Rental"}
        </h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave(rentalData);
          }}
        >
          <select
            value={rentalData?.userId || ""}
            onChange={(e) =>
              setRentalData({ ...rentalData, userId: e.target.value })
            }
            className="w-full border p-2 mb-2"
            required
          >
            <option value="">Select User</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
          <select
            value={rentalData?.bookId || ""}
            onChange={(e) =>
              setRentalData({ ...rentalData, bookId: e.target.value })
            }
            className="w-full border p-2 mb-2"
            required
          >
            <option value="">Select Book</option>
            {books.map((book) => (
              <option key={book.id} value={book.id}>
                {book.title}
              </option>
            ))}
          </select>
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

export default RentalModal;
