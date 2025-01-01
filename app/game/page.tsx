// app/page.tsx (if using the App Router in Next.js 13+)
"use client";
import LibraryManagementSystem from "@/components/librarymanagement";
import BulkBookAddition from "@/components/bookmodal";
import React from "react";
import BulkAddUsers from "@/components/usermodal";
import AsteroidGame from "@/components/game";

const HomePage: React.FC = () => {
  return (
    <main className=" bg-[#111827] h-screen">
      <AsteroidGame />
    </main>
  );
};

export default HomePage;
