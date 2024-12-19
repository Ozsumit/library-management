"use client";
import React from "react";
import { Download, Upload } from "lucide-react";

interface SearchProps {
  searchState: { type: "id" | "name"; query: string };
  setSearchState: React.Dispatch<
    React.SetStateAction<{ type: "id" | "name"; query: string }>
  >;
  handleExport: () => void;
  handleImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
}

const Search: React.FC<SearchProps> = ({
  searchState,
  setSearchState,
  handleExport,
  handleImport,
  placeholder,
}) => {
  return (
    <div className="flex items-center mb-4 space-x-2">
      <select
        value={searchState.type}
        onChange={(e) =>
          setSearchState({
            ...searchState,
            type: e.target.value as "id" | "name",
          })
        }
        className="border p-2 rounded"
      >
        <option value="id">Search by ID</option>
        <option value="name">Search by Name</option>
      </select>
      <input
        type="text"
        placeholder={placeholder}
        value={searchState.query}
        onChange={(e) =>
          setSearchState({ ...searchState, query: e.target.value })
        }
        className="border p-2 rounded flex-grow"
      />
      <button
        onClick={() => setSearchState({ type: "id", query: "" })}
        className="bg-gray-200 p-2 rounded"
      >
        Clear
      </button>
      <button
        onClick={handleExport}
        className="bg-blue-500 text-white p-2 rounded flex items-center"
      >
        <Download size={16} className="mr-1" /> Export
      </button>
      <label className="bg-green-500 text-white p-2 rounded flex items-center cursor-pointer">
        <Upload size={16} className="mr-1" /> Import
        <input
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleImport}
        />
      </label>
    </div>
  );
};

export default Search;
