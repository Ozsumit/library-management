"use client";
import React from "react";

interface TableProps {
  data: any[]; // Replace `any` with specific type
  onEdit: (item: any) => void; // Replace `any` with specific type
  onDelete: (id: string) => void;
}

const Table: React.FC<TableProps> = ({ data, onEdit, onDelete }) => {
  return (
    <table className="w-full border">
      <thead>
        <tr className="bg-slate-800">
          <th className="p-2 border">Title</th>
          <th className="p-2 border">Author</th>
          <th className="p-2 border">Actions</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr key={item.id} className="  ">
            <td className="p-2 border">{item.title}</td>
            <td className="p-2 border">{item.author}</td>
            <td className="p-2 border text-center">
              <button
                onClick={() => onEdit(item)}
                className="text-blue-500 mr-2"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(item.id)}
                className="text-red-500"
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Table;
