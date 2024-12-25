import React from "react";

interface DashboardProps {
  users: number;
  books: number;
  donatedBooks: number;
  boughtBooks: number;
  totalCopies: number;
  availableCopies: number;
  // rentedBooks: number; // Add rentedBooks prop
}

interface StatCardProps {
  title: string;
  value: number;
  color: string;
  description: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  color,
  description,
}) => (
  <div
    className={`bg-gray-800 rounded-lg p-4 shadow-md border-l-4 ${color} hover:bg-gray-700 transition-colors`}
  >
    <h3 className="text-gray-300 text-sm font-semibold">{title}</h3>
    <p className="text-2xl font-bold mt-2 text-white">
      {value.toLocaleString()}
    </p>
    <p className="text-xs text-gray-400 mt-1">{description}</p>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({
  users,
  books,
  donatedBooks,
  boughtBooks,
  totalCopies,
  availableCopies,
}) => {
  var rentedbooks = totalCopies - availableCopies;
  const stats = [
    {
      title: "Total Users",
      value: users,
      color: "border-blue-400",
      description: "Active library members",
    },
    {
      title: "Total Books",
      value: books,
      color: "border-green-400",
      description: "Unique book titles",
    },
    {
      title: "Donated Books",
      value: donatedBooks,
      color: "border-purple-400",
      description: `${((donatedBooks / books) * 100).toFixed(
        1
      )}% of collection`,
    },
    {
      title: "Purchased Books",
      value: boughtBooks,
      color: "border-yellow-400",
      description: `${((boughtBooks / books) * 100).toFixed(1)}% of collection`,
    },
    {
      title: "Total Copies",
      value: totalCopies,
      color: "border-red-400",
      description: `${(totalCopies / books).toFixed(1)} copies per title`,
    },
    {
      title: "Available Copies",
      value: availableCopies,
      color: "border-emerald-400",
      description: `${((availableCopies / totalCopies) * 100).toFixed(
        1
      )}% in stock`,
    },
    {
      title: "Books Rented",
      value: rentedbooks,
      color: "border-emerald-400",
      description: `${((rentedbooks / totalCopies) * 100).toFixed(1)}% rented`,
    },
  ];

  return (
    <div className="p-6 bg-gray-900">
      <h2 className="text-2xl font-bold text-white mb-6">Library Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
