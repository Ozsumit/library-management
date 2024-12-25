// app/page.tsx (if using the App Router in Next.js 13+)
"use client";
import LibraryManagementSystem from "@/components/librarymanagement";
import BulkBookAddition from "@/components/bookmodal";
import React from "react";
import BulkAddUsers from "@/components/usermodal";

const HomePage: React.FC = () => {
  return (
    <main className=" bg-[#111827] h-screen">
      {/* <LibraryManagementSystem />
      <bul */}
      <BulkBookAddition
        addBooks={(books) => {
          /* implement addBooks function here */
        }}
      />
      <BulkAddUsers
        addUsers={(users) => {
          /* implement addUsers function here */
        }}
      />
    </main>
  );
};

export default HomePage;
