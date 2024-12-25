"use client";

import React, { useState } from "react";
import { toast } from "react-toastify";

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  membershipDate: string;
  currentRentals: number[];
  class: string;
}

const INITIAL_USER: User = {
  id: 0,
  name: "",
  email: "",
  phone: "",
  membershipDate: new Date().toISOString().split("T")[0],
  currentRentals: [],
  class: "",
};

const BulkAddUsers = ({ addUsers }: { addUsers: (users: User[]) => void }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [newUsers, setNewUsers] = useState<User[]>([{ ...INITIAL_USER }]);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleInputChange = (
    index: number,
    field: keyof User,
    value: string | number[] | string[]
  ) => {
    const updatedUsers = [...newUsers];
    updatedUsers[index] = { ...updatedUsers[index], [field]: value };
    setNewUsers(updatedUsers);

    if (field === "class" && value !== "" && index === newUsers.length - 1) {
      addRowIfNeeded();
    }
  };

  const addRowIfNeeded = () => {
    const lastUser = newUsers[newUsers.length - 1];
    if (lastUser.name || lastUser.email || lastUser.class) {
      addRow();
    }
  };

  const addRow = () => {
    setNewUsers([
      ...newUsers,
      {
        ...INITIAL_USER,
        id: newUsers.length + 1,
        membershipDate: new Date().toISOString().split("T")[0],
      },
    ]);
  };

  const saveUsers = () => {
    const validUsers = newUsers.filter((user) => user.name && user.email);

    if (validUsers.length === 0) {
      toast.error("Please add at least one valid user with name and email.");
      return;
    }

    const updatedUsers = validUsers.map((user, index) => ({
      ...user,
      id: users.length + index + 1,
    }));

    setUsers([...users, ...updatedUsers]);
    addUsers(updatedUsers);
    setNewUsers([{ ...INITIAL_USER }]);
    setShowSuccess(true);
    toast.success("Users added successfully!");
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const exportUsers = () => {
    const validUsers = newUsers.filter((user) => user.name && user.email);
    const usersToExport = [...users, ...validUsers];

    if (usersToExport.length > 0) {
      const jsonString = JSON.stringify(usersToExport, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "users.json";
      a.click();
      window.URL.revokeObjectURL(url);
    } else {
      toast.warning("No users to export.");
    }
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  return (
    <div className="bg-gray-900 p-6 rounded-lg w-full max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-white">Bulk User Addition</h2>

      {showSuccess && (
        <div className="mb-4 p-4 bg-green-500/15 text-green-500 border border-green-500/50 rounded-md">
          Users added successfully!
        </div>
      )}

      <div className="rounded-lg overflow-hidden  border-gray-700">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="p-3 text-left border-b border-gray-700">Name</th>
              <th className="p-3 text-left border-b border-gray-700">Email</th>
              <th className="p-3 text-left border-b border-gray-700">Phone</th>
              <th className="p-3 text-left border-b border-gray-700">
                Membership Date
              </th>
              <th className="p-3 text-left border-b border-gray-700">Class</th>
            </tr>
          </thead>
          <tbody className="bg-gray-800">
            {newUsers.map((user, index) => (
              <tr
                key={index}
                className="border-b border-gray-700 last:border-0"
              >
                <td className="p-2">
                  <input
                    type="text"
                    value={user.name}
                    onChange={(e) =>
                      handleInputChange(index, "name", e.target.value)
                    }
                    placeholder="User name"
                    className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="email"
                    value={user.email}
                    onChange={(e) => {
                      const email = e.target.value;
                      handleInputChange(index, "email", email);
                      if (email && !validateEmail(email)) {
                        toast.error("Please enter a valid email address");
                      }
                    }}
                    placeholder="Email address"
                    className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="tel"
                    value={user.phone || ""}
                    onChange={(e) =>
                      handleInputChange(index, "phone", e.target.value)
                    }
                    placeholder="Phone number"
                    className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="date"
                    value={user.membershipDate}
                    onChange={(e) =>
                      handleInputChange(index, "membershipDate", e.target.value)
                    }
                    className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="text"
                    value={user.class}
                    onChange={(e) =>
                      handleInputChange(index, "class", e.target.value)
                    }
                    placeholder="User class"
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
          onClick={saveUsers}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Save Users
        </button> */}
        <button
          onClick={exportUsers}
          disabled={users.length === 0 && newUsers.every((user) => !user.name)}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Export
        </button>
      </div>
    </div>
  );
};

export default BulkAddUsers;
