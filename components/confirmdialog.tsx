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

const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

const LibraryCardSystem: React.FC<LibraryCardSystemProps> = ({ users }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<LibraryUser[]>(users);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(6);
  const [sortKey, setSortKey] = useState<keyof LibraryUser>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isSearching, setIsSearching] = useState(false);
  const [typingIndicator, setTypingIndicator] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const fuse = useMemo(
    () =>
      new Fuse(users, {
        keys: ["name", "email", "phone", "class", "id"],
        threshold: 0.3,
        includeScore: true,
        minMatchCharLength: 2,
      }),
    [users]
  );

  useEffect(() => {
    if (searchQuery !== debouncedSearchQuery) {
      setTypingIndicator(true);
    }
  }, [searchQuery, debouncedSearchQuery]);

  useEffect(() => {
    setIsSearching(true);
    setTypingIndicator(false);

    let results: LibraryUser[];
    if (debouncedSearchQuery.trim()) {
      results = fuse.search(debouncedSearchQuery).map(({ item }) => item);
    } else {
      results = users;
    }

    const sorted = [...results].sort((a, b) => {
      const aVal = String(a[sortKey]).toLowerCase();
      const bVal = String(b[sortKey]).toLowerCase();
      return sortOrder === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    });

    setFilteredUsers(sorted);
    setCurrentPage(1);
    setIsSearching(false);
  }, [debouncedSearchQuery, sortKey, sortOrder, fuse, users]);

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const SearchInput = () => (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
        <Search
          className={`h-5 w-5 ${
            typingIndicator ? "text-yellow-400" : "text-gray-400"
          }`}
        />
      </div>
      <input
        type="text"
        placeholder="Search members by name, email, or phone..."
        className="w-full pl-10 pr-24 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-gray-100 placeholder-gray-400 focus:outline-none focus:border-indigo-500 transition-all"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 gap-2">
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
        <span className="text-xs text-gray-400">
          {typingIndicator ? "Typing..." : isSearching ? "Searching..." : ""}
        </span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center ring-2 ring-indigo-500/40">
              <Users className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Library Members</h1>
              <p className="text-gray-400 text-sm">
                {typingIndicator
                  ? "Waiting for typing..."
                  : isSearching
                  ? "Searching..."
                  : `Showing ${filteredUsers.length} results`}
              </p>
            </div>
          </div>

          <SearchInput />

          {/* Controls Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex gap-2 items-center">
              <label className="text-sm text-gray-300 whitespace-nowrap">
                Sort by:
              </label>
              <select
                className="w-full bg-gray-800/50 border border-gray-700 text-gray-300 text-sm rounded-lg p-2"
                onChange={(e) =>
                  setSortKey(e.target.value as keyof LibraryUser)
                }
                value={sortKey}
              >
                <option value="name">Name</option>
                <option value="membershipDate">Membership Date</option>
                <option value="class">Class</option>
              </select>
            </div>

            <div className="flex gap-2 items-center">
              <label className="text-sm text-gray-300 whitespace-nowrap">
                Order:
              </label>
              <button
                onClick={() =>
                  setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
                }
                className="w-full bg-gray-800/50 border border-gray-700 text-gray-300 text-sm rounded-lg px-4 py-2 hover:bg-gray-700/50 transition-colors text-left"
              >
                {sortOrder === "asc" ? "Ascending ↑" : "Descending ↓"}
              </button>
            </div>

            <div className="flex gap-2 items-center">
              <label className="text-sm text-gray-300 whitespace-nowrap">
                Items per page:
              </label>
              <select
                className="w-full bg-gray-800/50 border border-gray-700 text-gray-300 text-sm rounded-lg p-2"
                value={usersPerPage}
                onChange={(e) => setUsersPerPage(Number(e.target.value))}
              >
                <option value={6}>6</option>
                <option value={12}>12</option>
                <option value={24}>24</option>
              </select>
            </div>
          </div>
        </div>

        {/* User Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedUsers.map((user) => (
            <div
              key={user.id}
              className="relative bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700/50 hover:border-indigo-500/50 transition-all duration-300"
            >
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold text-white truncate">
                      {user.name}
                    </h2>
                    <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      ID: {String(user.id).padStart(4, "0")}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-300 truncate">
                    <Mail className="flex-shrink-0 w-4 h-4 mr-2 text-gray-400" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{user.phone}</span>
                  </div>
                  <div className="flex items-center text-gray-300 truncate">
                    <BookOpen className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="truncate">{user.class}</span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <List className="w-4 h-4 mr-2 text-gray-400" />
                    <span>Rentals: {user.currentRentals?.length || 0}</span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{formatDate(user.membershipDate)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {!paginatedUsers.length && !isSearching && (
          <div className="text-center py-12 px-4 rounded-xl border border-gray-700/50 bg-gray-800/50">
            <UserX className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-200 mb-2">
              No members found
            </h3>
            <p className="text-gray-400 text-sm">
              Try adjusting your search or filters
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center">
            <nav className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 min-w-[40px] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-gray-300 hover:bg-gray-700"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => handlePageChange(i + 1)}
                    className={`px-3 py-1 rounded-lg transition-colors ${
                      currentPage === i + 1
                        ? "bg-indigo-500 text-white"
                        : "text-gray-300 hover:bg-gray-700"
                    }`}
                    aria-label={`Page ${i + 1}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 min-w-[40px] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-gray-300 hover:bg-gray-700"
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
