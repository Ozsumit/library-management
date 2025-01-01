import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Mail,
  Phone,
  BookOpen,
  List,
  Calendar,
  ChevronLeft,
  ChevronRight,
  UserX,
} from "lucide-react";

interface LibraryUser {
  id: number;
  name: string;
  email: string;
  membershipDate: string;
  currentRentals: (string | number | null)[];
  class: string;
  phone: string;
}

interface LibraryCardSystemProps {
  users: LibraryUser[];
}

const LibraryCardSystem: React.FC<LibraryCardSystemProps> = ({ users }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<LibraryUser[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 6;

  useEffect(() => {
    const delay = setTimeout(() => {
      const lowerCaseQuery = searchQuery.toLowerCase();
      const newFilteredUsers = users.filter(
        (user) =>
          user.name.toLowerCase().includes(lowerCaseQuery) ||
          user.email.toLowerCase().includes(lowerCaseQuery) ||
          user.phone.includes(lowerCaseQuery) ||
          user.class.toLowerCase().includes(lowerCaseQuery) ||
          String(user.id) === searchQuery
      );
      setFilteredUsers(newFilteredUsers);
      setCurrentPage(1); // Reset to first page on new search
    }, 300);

    return () => clearTimeout(delay);
  }, [searchQuery, users]);

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  const handlePageChange = (direction: "next" | "prev") => {
    setCurrentPage((prev) =>
      direction === "next"
        ? Math.min(prev + 1, totalPages)
        : Math.max(prev - 1, 1)
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center ring-2 ring-indigo-500/40">
                <Users className="w-6 h-6 text-indigo-400" aria-label="Users" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Library Members
                </h1>
                <p className="text-gray-400 text-sm">
                  Manage and view library card holders
                </p>
              </div>
            </div>

            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" aria-label="Search" />
              </div>
              <input
                type="text"
                placeholder="Search members..."
                className="block w-full pl-10 pr-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-shadow duration-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedUsers.map((user) => (
            <div
              key={user.id}
              className="group relative bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700/50 hover:border-indigo-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-indigo-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-semibold text-white mb-1">
                      {user.name}
                    </h2>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      ID: {String(user.id).padStart(4, "0")}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-300">
                    <Mail
                      className="w-4 h-4 mr-2 text-gray-400"
                      aria-label="Email"
                    />
                    <label>Email: </label>&nbsp;
                    {user.email}
                  </div>
                  <div className="flex items-center text-gray-300">
                    <Phone
                      className="w-4 h-4 mr-2 text-gray-400"
                      aria-label="Phone"
                    />{" "}
                    <label>Phone No.: </label>&nbsp;
                    {user.phone}
                  </div>
                  <div className="flex items-center text-gray-300">
                    <BookOpen
                      className="w-4 h-4 mr-2 text-gray-400"
                      aria-label="Class"
                    />{" "}
                    <label>Class: </label>&nbsp;
                    {user.class}
                  </div>
                  <div className="flex items-center text-gray-300">
                    <List
                      className="w-5 h-5 mr-2 text-gray-400"
                      aria-label="Current Rentals"
                    />{" "}
                    <label>Current Rentals: </label>&nbsp;
                    {user.currentRentals?.length || 0}
                  </div>

                  <div className="flex items-center text-gray-300">
                    <Calendar
                      className="w-4 h-4 mr-2 text-gray-400"
                      aria-label="Membership Date"
                    />{" "}
                    <label>Membership date: </label>&nbsp;
                    {formatDate(user.membershipDate)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredUsers.length === 0 && (
          <div className="text-center py-12 px-4 rounded-xl border border-gray-700/50 bg-gray-800/50 backdrop-blur-sm">
            <UserX
              className="mx-auto h-12 w-12 text-gray-400"
              aria-label="No results found"
            />
            <h3 className="mt-4 text-lg font-medium text-gray-200">
              No results found
            </h3>
            <p className="mt-2 text-gray-400">
              We couldn't find any members matching your search.
            </p>
          </div>
        )}

        {/* Pagination */}
        {filteredUsers.length > 0 && (
          <div className="mt-8 flex justify-center">
            <nav
              className="flex items-center space-x-2"
              aria-label="Pagination"
            >
              <button
                onClick={() => handlePageChange("prev")}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300 hover:text-white hover:bg-gray-700"
                aria-label="Previous Page"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <span className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800/50 rounded-lg">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => handlePageChange("next")}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300 hover:text-white hover:bg-gray-700"
                aria-label="Next Page"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default LibraryCardSystem;
