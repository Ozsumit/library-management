import React, { useState, useEffect, useMemo } from "react";
import Fuse from "fuse.js";
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

// Custom debounce hook
const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    // Increased delay for better typing experience
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

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
  const [filteredUsers, setFilteredUsers] = useState<LibraryUser[]>(users);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(6);
  const [sortKey, setSortKey] = useState<keyof LibraryUser>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isSearching, setIsSearching] = useState(false);
  const [typingIndicator, setTypingIndicator] = useState(false);

  // Debounce the search query
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Configure Fuse.js options
  const fuseOptions = {
    keys: ["name", "email", "phone", "class", "id"],
    threshold: 0.3,
    distance: 100,
    minMatchCharLength: 2,
    shouldSort: true,
    includeScore: true,
  };

  // Create memoized Fuse instance
  const fuse = useMemo(() => new Fuse(users, fuseOptions), [users]);

  // Handle immediate typing feedback
  useEffect(() => {
    if (searchQuery !== debouncedSearchQuery) {
      setTypingIndicator(true);
    }
  }, [searchQuery, debouncedSearchQuery]);

  // Handle search and filtering with debounced value
  useEffect(() => {
    setIsSearching(true);
    setTypingIndicator(false);

    let results: LibraryUser[];

    if (debouncedSearchQuery.trim() === "") {
      results = users;
    } else {
      // Perform fuzzy search
      const fuseResults = fuse.search(debouncedSearchQuery);
      results = fuseResults.map((result) => result.item);
    }

    // Sort results
    const sortedResults = [...results].sort((a, b) => {
      const aValue = String(a[sortKey]).toLowerCase();
      const bValue = String(b[sortKey]).toLowerCase();

      if (aValue < bValue) {
        return sortOrder === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortOrder === "asc" ? 1 : -1;
      }
      return 0;
    });

    setFilteredUsers(sortedResults);
    setCurrentPage(1);
    setIsSearching(false);
  }, [debouncedSearchQuery, users, sortKey, sortOrder, fuse]);

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

  const SearchInput = () => (
    <div className="relative w-full md:w-96">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search
          className={`h-5 w-5 text-gray-400 transition-all duration-200 ${
            typingIndicator || isSearching ? "animate-pulse" : ""
          }`}
          aria-label="Search"
        />
      </div>
      <input
        type="text"
        placeholder="Search by name, email, phone, or ID..."
        className={`block w-full pl-10 pr-10 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl 
          text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 
          transition-all duration-200 ${
            typingIndicator
              ? "focus:ring-yellow-500/50 border-yellow-500/50"
              : isSearching
              ? "focus:ring-blue-500/50 border-blue-500/50"
              : "focus:ring-indigo-500/50 border-transparent"
          }`}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        aria-label="Search members"
      />
      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="text-gray-400 hover:text-white transition-colors duration-200"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
        {(typingIndicator || isSearching) && (
          <span className="ml-2 text-xs text-gray-400">
            {typingIndicator ? "Typing..." : "Searching..."}
          </span>
        )}
      </div>
    </div>
  );

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
                  {typingIndicator
                    ? "Waiting for you to finish typing..."
                    : isSearching
                    ? "Searching..."
                    : `Showing ${filteredUsers.length} members`}
                </p>
              </div>
            </div>

            <SearchInput />

            <div className="flex space-x-4">
              <select
                className="bg-gray-800/50 border border-gray-700 text-gray-300 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 p-2"
                onChange={(e) =>
                  setSortKey(e.target.value as keyof LibraryUser)
                }
                value={sortKey}
                aria-label="Sort by field"
              >
                <option value="name">Sort by Name</option>
                <option value="membershipDate">Sort by Membership Date</option>
                <option value="class">Sort by Class</option>
              </select>

              <button
                onClick={() =>
                  setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
                }
                className="bg-gray-800/50 border border-gray-700 text-gray-300 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 px-4 py-2 hover:bg-gray-700/50 transition-colors duration-200"
                aria-label={`Sort ${
                  sortOrder === "asc" ? "descending" : "ascending"
                }`}
              >
                {sortOrder === "asc" ? "Ascending" : "Descending"}
              </button>

              <select
                className="bg-gray-800/50 border border-gray-700 text-gray-300 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 p-2"
                value={usersPerPage}
                onChange={(e) => setUsersPerPage(Number(e.target.value))}
                aria-label="Items per page"
              >
                <option value={6}>6 per page</option>
                <option value={12}>12 per page</option>
                <option value={24}>24 per page</option>
              </select>
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
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <Phone
                      className="w-4 h-4 mr-2 text-gray-400"
                      aria-label="Phone"
                    />
                    <span>{user.phone}</span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <BookOpen
                      className="w-4 h-4 mr-2 text-gray-400"
                      aria-label="Class"
                    />
                    <span>{user.class}</span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <List
                      className="w-4 h-4 mr-2 text-gray-400"
                      aria-label="Current Rentals"
                    />
                    <span>
                      Current Rentals: {user.currentRentals?.length || 0}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <Calendar
                      className="w-4 h-4 mr-2 text-gray-400"
                      aria-label="Membership Date"
                    />
                    <span>{formatDate(user.membershipDate)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredUsers.length === 0 && !isSearching && (
          <div className="text-center py-12 px-4 rounded-xl border border-gray-700/50 bg-gray-800/50 backdrop-blur-sm">
            <UserX
              className="mx-auto h-12 w-12 text-gray-400"
              aria-label="No results found"
            />
            <h3 className="mt-4 text-lg font-medium text-gray-200">
              No results found
            </h3>
            <p className="mt-2 text-gray-400">
              Try adjusting your search terms or filters
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
                aria-label="Previous page"
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
                aria-label="Next page"
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
