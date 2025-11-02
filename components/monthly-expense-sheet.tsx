"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import axios from "axios";
import API_CONFIG from "@/lib/api-config";

type Expense = {
  _id: string;
  id?: number;
  description: string;
  amount: number;
  category: string;
  date: string;
  paymentMethod: string;
  isRepaid?: boolean;
  repaidAmount?: number;
};

export default function MonthlyExpenseSheet() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().getMonth().toString()
  );
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString()
  );

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Ensure we have a token before making the request
    const token = localStorage.getItem("expense_tracker_token");
    if (!token) {
      setLoading(false);
      return;
    }

    // Make sure the authorization header is set
    if (!axios.defaults.headers.common["Authorization"]) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }

    axios
      .get(`${API_CONFIG.BASE_URL}/api/expenses/get_expenses`)
      .then((response) => {
        const expensesData = response.data;
        setExpenses(expensesData);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to fetch expenses:", error);
        setError("Failed to load expenses. Please try refreshing the page.");
        setLoading(false);
      });
  }, []);

  const filteredExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(expense.date);
    return (
      expenseDate.getMonth().toString() === selectedMonth &&
      expenseDate.getFullYear().toString() === selectedYear
    );
  });

  const totalExpenses = filteredExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const years = Array.from({ length: 5 }, (_, i) =>
    (new Date().getFullYear() - 2 + i).toString()
  );

  // Loading screen while fetching data
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Loading Monthly Expenses...
          </h2>
          <p className="text-gray-500">Please wait while we fetch your data</p>
        </div>
      </div>
    );
  }

  // Error screen if there's an error
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-4">
      <div className="container mx-auto px-4">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Select Month and Year</CardTitle>
          </CardHeader>
          <CardContent className="flex space-x-4">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger>
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger>
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Payment Method Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Method Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center">
                <p className="text-sm text-gray-500">Self</p>
                <p className="text-xl font-bold">
                  ₹
                  {filteredExpenses
                    .filter((e) => (e.paymentMethod || "self") === "self")
                    .reduce((sum, e) => sum + e.amount, 0)
                    .toFixed(2)}
                </p>
                <p className="text-xs text-gray-400">
                  {
                    filteredExpenses.filter(
                      (e) => (e.paymentMethod || "self") === "self"
                    ).length
                  }{" "}
                  expenses
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Lent</p>
                <p className="text-xl font-bold">
                  ₹
                  {filteredExpenses
                    .filter((e) => e.paymentMethod === "lent")
                    .reduce((sum, e) => sum + e.amount, 0)
                    .toFixed(2)}
                </p>
                <p className="text-xs text-gray-400">
                  {
                    filteredExpenses.filter((e) => e.paymentMethod === "lent")
                      .length
                  }{" "}
                  expenses
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Credit Card</p>
                <p className="text-xl font-bold">
                  ₹
                  {filteredExpenses
                    .filter((e) => e.paymentMethod === "credit-card")
                    .reduce((sum, e) => sum + e.amount, 0)
                    .toFixed(2)}
                </p>
                <p className="text-xs text-gray-400">
                  {
                    filteredExpenses.filter(
                      (e) => e.paymentMethod === "credit-card"
                    ).length
                  }{" "}
                  expenses
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Expense Summary for {months[parseInt(selectedMonth)]}{" "}
              {selectedYear}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading expenses...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead className="text-right">Amount (INR)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-8 text-gray-500"
                      >
                        No expenses found for {months[parseInt(selectedMonth)]}{" "}
                        {selectedYear}
                      </TableCell>
                    </TableRow>
                  ) : (
                    <>
                      {filteredExpenses.map((expense) => (
                        <TableRow key={expense._id}>
                          <TableCell>{expense.date}</TableCell>
                          <TableCell>{expense.description}</TableCell>
                          <TableCell className="capitalize">
                            {expense.category}
                          </TableCell>
                          <TableCell className="capitalize">
                            {expense.paymentMethod?.replace("-", " ") || "self"}
                          </TableCell>
                          <TableCell className="text-right">
                            ₹{expense.amount.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={4} className="font-bold">
                          Total
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          ₹{totalExpenses.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    </>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Link href="/" passHref>
            <Button>Back to Expense Tracker</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
