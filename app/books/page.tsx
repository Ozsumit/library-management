// app/page.tsx (if using the App Router in Next.js 13+)

import LibraryManagementSystem from "@/components/librarymanagement";
import BulkBookAddition from "@/components/bookmodal"
import React from "react";

const HomePage: React.FC = () => {
  return (
    <main className=" bg-[#111827] h-screen">
      {/* <LibraryManagementSystem />
      <bul */}
      <BulkBookAddition/>
    </main>
  );
};

export default HomePage;
