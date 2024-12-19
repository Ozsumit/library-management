"use client";
import React from "react";

interface UserModalProps {
  isOpen: boolean;
  currentUser: any; // Replace `any` with User type
  setCurrentUser: React.Dispatch<React.SetStateAction<any>>; // Replace `any` with User type
  onSave: (user: any) => void; // Replace `any` with User type
  onClose: () => void;
}

const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  currentUser,
  setCurrentUser,
  onSave,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">
          {currentUser ? "Edit User" : "Add New User"}
        </h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave(currentUser);
          }}
        >
          <input
            type="text"
            placeholder="Name"
            value={currentUser?.name || ""}
            onChange={(e) =>
              setCurrentUser({ ...currentUser, name: e.target.value })
            }
            className="w-full border p-2 mb-2"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={currentUser?.email || ""}
            onChange={(e) =>
              setCurrentUser({ ...currentUser, email: e.target.value })
            }
            className="w-full border p-2 mb-2"
            required
          />
          {/* Add other fields as required */}
          <div className="flex justify-between">
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
              Save
            </button>
            <button type="button" onClick={onClose} className="bg-gray-300 px-4 py-2 rounded">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;
