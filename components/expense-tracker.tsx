"use client";

import { useState, useEffect } from "react";
import { Plus, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

export default function ExpenseTracker() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExpenses = () => {
      console.log("Fetching expenses...");
      console.log(
        "Authorization header:",
        axios.defaults.headers.common["Authorization"]
      );
      setLoading(true);
      setError(null);

      // Ensure we have a token before making the request
      const token = localStorage.getItem("expense_tracker_token");
      if (!token) {
        console.log("No token found, not fetching expenses");
        setLoading(false);
        return;
      }

      // Make sure the authorization header is set
      if (!axios.defaults.headers.common["Authorization"]) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        console.log("Set missing authorization header");
      }

      axios
        .get(`${API_CONFIG.BASE_URL}/api/expenses/get_expenses`)
        .then((response) => {
          console.log("Successfully fetched expenses:", response.data.length);
          const expensesData = response.data;
          setExpenses(expensesData);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Failed to fetch expenses:", error);
          setLoading(false);
          if (error.response?.status === 401) {
            console.log("Unauthorized - clearing localStorage and reloading");
            localStorage.removeItem("expense_tracker_token");
            localStorage.removeItem("expense_tracker_user");
            window.location.reload();
          } else {
            setError(
              "Failed to load expenses. Please try refreshing the page."
            );
          }
        });
    };

    // Add a small delay to ensure authentication setup is complete
    setTimeout(fetchExpenses, 100);
  }, []);

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("self");
  const [filter, setFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().getMonth().toString()
  );
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString()
  );

  // Function to scroll to add expense form
  const scrollToAddExpense = () => {
    const addExpenseElement = document.getElementById("add-expense-form");
    if (addExpenseElement) {
      addExpenseElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
    }
  };

  const markAsRepaid = async (expenseId: string) => {
    console.log("Attempting to mark expense as repaid:", expenseId);
    setActionLoading(expenseId);
    try {
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}/api/repayments/repay/${expenseId}`,
        {
          repaidAmount: null, // Will use full amount
          repaymentDate: new Date().toISOString(),
        }
      );

      console.log("Backend response:", response.data);

      // Update the expense in the local state
      setExpenses(
        expenses.map((exp) =>
          exp._id === expenseId
            ? { ...exp, isRepaid: true, repaidAmount: exp.amount }
            : exp
        )
      );

      console.log("Successfully marked as repaid:", response.data);
      alert("Expense marked as repaid successfully!");
    } catch (error) {
      console.error("Failed to mark as repaid:", error);
      if (axios.isAxiosError(error)) {
        console.error("Response data:", error.response?.data);
        console.error("Response status:", error.response?.status);
        alert(
          `Failed to mark expense as repaid: ${
            error.response?.data?.error || error.message
          }`
        );
      } else {
        alert(
          `Failed to mark expense as repaid: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    } finally {
      setActionLoading(null);
    }
  };

  const markAsNotRepaid = async (expenseId: string) => {
    setActionLoading(expenseId);
    try {
      await axios.delete(
        `${API_CONFIG.BASE_URL}/api/repayments/repay/${expenseId}`
      );

      // Update the expense in the local state
      setExpenses(
        expenses.map((exp) =>
          exp._id === expenseId
            ? { ...exp, isRepaid: false, repaidAmount: 0 }
            : exp
        )
      );

      console.log("Marked as not repaid");
    } catch (error) {
      console.error("Failed to mark as not repaid:", error);
      alert("Failed to update repayment status. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const addExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading("add_expense");
    const newExpense = {
      description,
      amount: parseFloat(amount),
      category,
      paymentMethod,
      date: new Date().toISOString().split("T")[0],
    };

    try {
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}/api/expenses/add_expense`,
        newExpense
      );
      setExpenses([...expenses, response.data]); // Assuming the API returns the added expense
      setDescription("");
      setAmount("");
      setCategory("");
      setPaymentMethod("self");
    } catch (error) {
      console.error("Failed to add expense:", error);
      alert("Failed to add expense. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredExpenses = expenses.filter((expense) => {
    // Filter by category
    const categoryMatch = filter === "all" || expense.category === filter;

    // Filter by month and year
    if (selectedMonth === "all") {
      // If "all months" selected, only filter by year
      const expenseYear = new Date(expense.date).getFullYear().toString();
      return categoryMatch && expenseYear === selectedYear;
    } else {
      // Filter by both month and year
      const expenseDate = new Date(expense.date);
      const monthMatch = expenseDate.getMonth().toString() === selectedMonth;
      const yearMatch = expenseDate.getFullYear().toString() === selectedYear;
      return categoryMatch && monthMatch && yearMatch;
    }
  });

  // Loading screen while fetching data
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Loading Expenses...
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
        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 bg-white p-2 rounded-lg shadow-sm">
            <Link href="/">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                📊 Expenses
              </Button>
            </Link>
            <Link href="/emi">
              <Button
                variant="outline"
                className="border-blue-200 hover:bg-blue-50"
              >
                💳 EMI Tracker
              </Button>
            </Link>
            <Link href="/monthly-sheet">
              <Button
                variant="outline"
                className="border-blue-200 hover:bg-blue-50"
              >
                📅 Monthly Sheet
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Add Expense Button */}
        <div className="mb-4">
          <Button
            onClick={scrollToAddExpense}
            className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors duration-200"
          >
            <Plus className="mr-2 h-5 w-5" />
            Add New Expense
          </Button>
        </div>

        {selectedMonth !== "all" && (
          <div className="text-center mb-4">
            <p className="text-base text-gray-600">
              Viewing expenses for{" "}
              {
                [
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
                ][parseInt(selectedMonth)]
              }{" "}
              {selectedYear}
            </p>
          </div>
        )}

        {/* Monthly Comparison Card */}
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Monthly Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center">
                <p className="text-sm text-gray-500">Current Month</p>
                <p className="text-2xl font-bold">
                  ₹
                  {(() => {
                    const currentMonthExpenses = expenses.filter((e) => {
                      const expenseDate = new Date(e.date);
                      const now = new Date();
                      return (
                        expenseDate.getMonth() === now.getMonth() &&
                        expenseDate.getFullYear() === now.getFullYear()
                      );
                    });
                    return currentMonthExpenses
                      .reduce((sum, e) => sum + e.amount, 0)
                      .toFixed(2);
                  })()}
                </p>
                <p className="text-xs text-gray-400">
                  {
                    expenses.filter((e) => {
                      const expenseDate = new Date(e.date);
                      const now = new Date();
                      return (
                        expenseDate.getMonth() === now.getMonth() &&
                        expenseDate.getFullYear() === now.getFullYear()
                      );
                    }).length
                  }{" "}
                  expenses
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Previous Month</p>
                <p className="text-2xl font-bold">
                  ₹
                  {(() => {
                    const prevMonthExpenses = expenses.filter((e) => {
                      const expenseDate = new Date(e.date);
                      const now = new Date();
                      const prevMonth = new Date(
                        now.getFullYear(),
                        now.getMonth() - 1,
                        1
                      );
                      return (
                        expenseDate.getMonth() === prevMonth.getMonth() &&
                        expenseDate.getFullYear() === prevMonth.getFullYear()
                      );
                    });
                    return prevMonthExpenses
                      .reduce((sum, e) => sum + e.amount, 0)
                      .toFixed(2);
                  })()}
                </p>
                <p className="text-xs text-gray-400">
                  {
                    expenses.filter((e) => {
                      const expenseDate = new Date(e.date);
                      const now = new Date();
                      const prevMonth = new Date(
                        now.getFullYear(),
                        now.getMonth() - 1,
                        1
                      );
                      return (
                        expenseDate.getMonth() === prevMonth.getMonth() &&
                        expenseDate.getFullYear() === prevMonth.getFullYear()
                      );
                    }).length
                  }{" "}
                  expenses
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">This Year Total</p>
                <p className="text-2xl font-bold">
                  ₹
                  {(() => {
                    const yearExpenses = expenses.filter((e) => {
                      const expenseDate = new Date(e.date);
                      const now = new Date();
                      return expenseDate.getFullYear() === now.getFullYear();
                    });
                    return yearExpenses
                      .reduce((sum, e) => sum + e.amount, 0)
                      .toFixed(2);
                  })()}
                </p>
                <p className="text-xs text-gray-400">
                  {
                    expenses.filter((e) => {
                      const expenseDate = new Date(e.date);
                      const now = new Date();
                      return expenseDate.getFullYear() === now.getFullYear();
                    }).length
                  }{" "}
                  expenses
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Repayment Tracking Card */}
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Repayment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-semibold mb-2">Lent Money</h4>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Outstanding:</span>
                    <span className="text-red-600">
                      ₹
                      {expenses
                        .filter(
                          (e) => e.paymentMethod === "lent" && !e.isRepaid
                        )
                        .reduce((sum, e) => sum + e.amount, 0)
                        .toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Repaid:</span>
                    <span className="text-green-600">
                      ₹
                      {expenses
                        .filter((e) => e.paymentMethod === "lent" && e.isRepaid)
                        .reduce((sum, e) => sum + e.amount, 0)
                        .toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 pt-1 border-t">
                    <span>Total Lent:</span>
                    <span>
                      ₹
                      {expenses
                        .filter((e) => e.paymentMethod === "lent")
                        .reduce((sum, e) => sum + e.amount, 0)
                        .toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Credit Card Bills</h4>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Pending:</span>
                    <span className="text-red-600">
                      ₹
                      {expenses
                        .filter(
                          (e) =>
                            e.paymentMethod === "credit-card" && !e.isRepaid
                        )
                        .reduce((sum, e) => sum + e.amount, 0)
                        .toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Paid:</span>
                    <span className="text-green-600">
                      ₹
                      {expenses
                        .filter(
                          (e) => e.paymentMethod === "credit-card" && e.isRepaid
                        )
                        .reduce((sum, e) => sum + e.amount, 0)
                        .toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 pt-1 border-t">
                    <span>Total Credit:</span>
                    <span>
                      ₹
                      {expenses
                        .filter((e) => e.paymentMethod === "credit-card")
                        .reduce((sum, e) => sum + e.amount, 0)
                        .toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card id="add-expense-form">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Add New Expense</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={addExpense} className="space-y-4">
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="amount">Amount (INR)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select onValueChange={setCategory} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="food">Food</SelectItem>
                      <SelectItem value="transport">Transport</SelectItem>
                      <SelectItem value="utilities">Utilities</SelectItem>
                      <SelectItem value="entertainment">
                        Entertainment
                      </SelectItem>
                      <SelectItem value="livingessentials">
                        Living Essentials
                      </SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Payment Method</Label>
                  <div className="flex space-x-4 mt-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="self"
                        name="paymentMethod"
                        value="self"
                        checked={paymentMethod === "self"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                      />
                      <Label htmlFor="self" className="cursor-pointer">
                        Self
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="lent"
                        name="paymentMethod"
                        value="lent"
                        checked={paymentMethod === "lent"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                      />
                      <Label htmlFor="lent" className="cursor-pointer">
                        Lent
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="credit-card"
                        name="paymentMethod"
                        value="credit-card"
                        checked={paymentMethod === "credit-card"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                      />
                      <Label htmlFor="credit-card" className="cursor-pointer">
                        Credit Card
                      </Label>
                    </div>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={actionLoading === "add_expense"}
                >
                  {actionLoading === "add_expense" ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Adding Expense...
                    </div>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" /> Add Expense
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Expense Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-4">
                Total: ₹
                {filteredExpenses
                  .reduce((sum, expense) => sum + expense.amount, 0)
                  .toFixed(2)}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>Food</span>
                  <span>
                    ₹
                    {filteredExpenses
                      .filter((e) => e.category === "food")
                      .reduce((sum, e) => sum + e.amount, 0)
                      .toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Transport</span>
                  <span>
                    ₹
                    {filteredExpenses
                      .filter((e) => e.category === "transport")
                      .reduce((sum, e) => sum + e.amount, 0)
                      .toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Utilities</span>
                  <span>
                    ₹
                    {filteredExpenses
                      .filter((e) => e.category === "utilities")
                      .reduce((sum, e) => sum + e.amount, 0)
                      .toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Entertainment</span>
                  <span>
                    ₹
                    {filteredExpenses
                      .filter((e) => e.category === "entertainment")
                      .reduce((sum, e) => sum + e.amount, 0)
                      .toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Living Essentials</span>
                  <span>
                    ₹
                    {filteredExpenses
                      .filter((e) => e.category === "livingessentials")
                      .reduce((sum, e) => sum + e.amount, 0)
                      .toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Other</span>
                  <span>
                    ₹
                    {filteredExpenses
                      .filter((e) => e.category === "other")
                      .reduce((sum, e) => sum + e.amount, 0)
                      .toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Payment Method Breakdown */}
              <hr className="my-4" />
              <h4 className="font-semibold mb-3 text-gray-700">
                By Payment Method
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>Self</span>
                  <span>
                    ₹
                    {filteredExpenses
                      .filter((e) => (e.paymentMethod || "self") === "self")
                      .reduce((sum, e) => sum + e.amount, 0)
                      .toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Lent</span>
                  <span>
                    ₹
                    {filteredExpenses
                      .filter((e) => e.paymentMethod === "lent")
                      .reduce((sum, e) => sum + e.amount, 0)
                      .toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Credit Card</span>
                  <span>
                    ₹
                    {filteredExpenses
                      .filter((e) => e.paymentMethod === "credit-card")
                      .reduce((sum, e) => sum + e.amount, 0)
                      .toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Expense List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 mb-6 md:grid-cols-3">
              <div>
                <Label htmlFor="filter">Filter by Category</Label>
                <Select onValueChange={setFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="food">Food</SelectItem>
                    <SelectItem value="transport">Transport</SelectItem>
                    <SelectItem value="utilities">Utilities</SelectItem>
                    <SelectItem value="entertainment">Entertainment</SelectItem>
                    <SelectItem value="livingessentials">
                      Living Essentials
                    </SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="month-filter">Filter by Month</Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Months" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Months</SelectItem>
                    <SelectItem value="0">January</SelectItem>
                    <SelectItem value="1">February</SelectItem>
                    <SelectItem value="2">March</SelectItem>
                    <SelectItem value="3">April</SelectItem>
                    <SelectItem value="4">May</SelectItem>
                    <SelectItem value="5">June</SelectItem>
                    <SelectItem value="6">July</SelectItem>
                    <SelectItem value="7">August</SelectItem>
                    <SelectItem value="8">September</SelectItem>
                    <SelectItem value="9">October</SelectItem>
                    <SelectItem value="10">November</SelectItem>
                    <SelectItem value="11">December</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="year-filter">Filter by Year</Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 5 }, (_, i) => {
                      const year = (
                        new Date().getFullYear() -
                        2 +
                        i
                      ).toString();
                      return (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-4">
              {filteredExpenses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No expenses found for the selected filters.</p>
                  <p className="text-sm mt-2">
                    Try adjusting your month, year, or category filters.
                  </p>
                </div>
              ) : (
                filteredExpenses.map((expense) => (
                  <div
                    key={expense._id}
                    className="flex items-center justify-between p-4 bg-white rounded-lg shadow"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-blue-100 rounded-full">
                        {expense.category === "food" && (
                          <IndianRupee className="h-6 w-6 text-blue-500" />
                        )}
                        {expense.category === "transport" && (
                          <IndianRupee className="h-6 w-6 text-green-500" />
                        )}
                        {expense.category === "utilities" && (
                          <IndianRupee className="h-6 w-6 text-yellow-500" />
                        )}
                        {expense.category === "entertainment" && (
                          <IndianRupee className="h-6 w-6 text-purple-500" />
                        )}
                        {expense.category === "livingessentials" && (
                          <IndianRupee className="h-6 w-6 text-orange-500" />
                        )}
                        {expense.category === "other" && (
                          <IndianRupee className="h-6 w-6 text-gray-500" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold">{expense.description}</h3>
                        <p className="text-sm text-gray-500">
                          {expense.category}
                        </p>
                        <p className="text-xs text-blue-600 capitalize">
                          {expense.paymentMethod?.replace("-", " ") || "self"}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <div className="text-right">
                        <p className="font-semibold">
                          ₹{expense.amount.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">{expense.date}</p>
                        {(expense.paymentMethod === "lent" ||
                          expense.paymentMethod === "credit-card") && (
                          <p
                            className={`text-xs font-medium ${
                              expense.isRepaid
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {expense.isRepaid ? "Repaid" : "Not Repaid"}
                          </p>
                        )}
                      </div>
                      {(expense.paymentMethod === "lent" ||
                        expense.paymentMethod === "credit-card") && (
                        <div className="flex space-x-1">
                          {!expense.isRepaid ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => markAsRepaid(expense._id)}
                              disabled={actionLoading === expense._id}
                              className="text-xs px-2 py-1 h-6 bg-green-50 hover:bg-green-100 text-green-700 border-green-300 disabled:opacity-50"
                            >
                              {actionLoading === expense._id ? (
                                <div className="flex items-center">
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-600 mr-1"></div>
                                  Loading...
                                </div>
                              ) : (
                                "Mark Repaid"
                              )}
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => markAsNotRepaid(expense._id)}
                              disabled={actionLoading === expense._id}
                              className="text-xs px-2 py-1 h-6 bg-red-50 hover:bg-red-100 text-red-700 border-red-300 disabled:opacity-50"
                            >
                              {actionLoading === expense._id ? (
                                <div className="flex items-center">
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600 mr-1"></div>
                                  Loading...
                                </div>
                              ) : (
                                "Undo"
                              )}
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Link href="/monthly-sheet" passHref>
            <Button>View Monthly Expense Sheet</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
