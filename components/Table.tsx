import React, { useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

interface JsonDataItem {
  [key: string]: string | number | boolean | null;
}

const JsonToPdfAndExcel: React.FC = () => {
  const [jsonData, setJsonData] = useState<JsonDataItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setProgress(0);

    const reader = new FileReader();

    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        const percentLoaded = Math.round((e.loaded / e.total) * 100);
        setProgress(percentLoaded);
      }
    };

    reader.onload = (e) => {
      try {
        const result = e.target?.result;
        if (typeof result === "string") {
          const data = JSON.parse(result);
          if (!Array.isArray(data) || data.length === 0) {
            throw new Error(
              "Invalid JSON structure. Please upload an array of objects."
            );
          }
          setJsonData(data);
          setProgress(100);
        }
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to parse JSON file"
        );
      } finally {
        setIsLoading(false);
      }
    };

    reader.onerror = () => {
      setError("Error reading file");
      setIsLoading(false);
    };

    reader.readAsText(file);
  };

  const handleDownloadPDF = (): void => {
    if (jsonData.length === 0) return;

    // Create new PDF document with better default settings
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    // Add document title and metadata
    doc.setProperties({
      title: "Data Export",
      subject: "JSON Data Export",
      creator: "Data Format Converter",
      author: "System Export",
    });

    // Add header with title and date
    doc.setFontSize(24);
    doc.setTextColor(51, 51, 51);
    doc.text("Data Export", 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(119, 119, 119);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 27);

    // Add total records count
    doc.text(`Total Records: ${jsonData.length}`, 14, 33);

    const headers = Object.keys(jsonData[0]);
    const rows = jsonData.map((item) =>
      headers.map((header) => String(item[header] ?? ""))
    );

    // Enhanced table styling
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 40,
      theme: "grid",
      styles: {
        font: "helvetica",
        fontSize: 9,
        cellPadding: 3,
        lineColor: [219, 219, 219],
        lineWidth: 0.5,
      },
      headStyles: {
        fillColor: [51, 51, 51],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: "bold",
        halign: "left",
        cellPadding: 4,
      },
      bodyStyles: {
        textColor: [51, 51, 51],
        halign: "left",
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      // Add margin between columns
      columnStyles: headers.reduce(
        (styles: { [key: number]: { cellPadding: number } }, _, index) => {
          styles[index] = { cellPadding: 4 };
          return styles;
        },
        {}
      ),
      // Add table foot with summary
      foot: [
        [
          {
            content: `* This document contains ${
              jsonData.length
            } records exported on ${new Date().toLocaleString()}`,
            styles: {
              textColor: [119, 119, 119],
              fontSize: 8,
              fontStyle: "italic",
            },
            colSpan: headers.length,
          },
        ],
      ],
      // Add page number at the bottom
      didDrawPage: (data) => {
        doc.setFontSize(8);
        doc.setTextColor(119, 119, 119);
        doc.text(
          `Page ${data.pageNumber} of ${data.pageCount}`,
          doc.internal.pageSize.width - 20,
          doc.internal.pageSize.height - 10,
          { align: "right" }
        );
      },
      margin: { top: 40, right: 14, bottom: 20, left: 14 },
    });

    doc.save("data-export.pdf");
  };

  const handleDownloadExcel = (): void => {
    if (jsonData.length === 0) return;

    const worksheet = XLSX.utils.json_to_sheet(jsonData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Export");
    XLSX.writeFile(workbook, "data-export.xlsx");
  };

  return (
    <div className="max-w-4xl py-6 bg-gray-900 min-h-screen">
      <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">
            Data Format Converter
          </h2>
          <p className="mt-1 text-sm text-gray-400">
            Convert your JSON data into PDF tables or Excel spreadsheets
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* File Upload */}
          <label className="block">
            <div className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-900 border-gray-600 hover:border-gray-500">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg
                  className="w-8 h-8 mb-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className="mb-2 text-sm text-gray-400">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-xs text-gray-400">JSON files only</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept=".json"
                onChange={handleFileUpload}
                disabled={isLoading}
              />
            </div>
          </label>

          {/* Progress Bar */}
          {isLoading && (
            <div className="w-full space-y-2">
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-center text-gray-400">
                Loading: {progress}%
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 text-sm text-red-200 bg-red-900 rounded-lg">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleDownloadPDF}
              disabled={jsonData.length === 0 || isLoading}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Export PDF
            </button>
            <button
              onClick={handleDownloadExcel}
              disabled={jsonData.length === 0 || isLoading}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Export Excel
            </button>
          </div>

          {/* Data Preview */}
          {jsonData.length > 0 && (
            <div className="border border-gray-700 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-800">
                    <tr>
                      {Object.keys(jsonData[0]).map((key) => (
                        <th
                          key={key}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                        >
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-gray-900 divide-y divide-gray-700">
                    {jsonData.slice(0, 5).map((row, index) => (
                      <tr key={index}>
                        {Object.values(row).map((value, i) => (
                          <td
                            key={i}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-300"
                          >
                            {String(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {jsonData.length > 5 && (
                <div className="px-6 py-3 bg-gray-800 text-center text-sm text-gray-400">
                  Showing 5 of {jsonData.length} rows
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JsonToPdfAndExcel;
