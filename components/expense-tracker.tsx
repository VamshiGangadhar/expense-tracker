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

type Expense = {
  id: number;
  description: string;
  amount: number;
  category: string;
  date: string;
};

export default function ExpenseTracker() {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    axios
      .get(
        "https://expense-tracker-backend-delta-seven.vercel.app/api/expenses/get_expenses"
      )
      .then((response) => {
        const expensesData = response.data;
        setExpenses(expensesData);
      })
      .catch((error) => console.error("Failed to fetch expenses:", error));
  }, []);

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().getMonth().toString()
  );
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString()
  );

  const addExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const newExpense: Expense = {
      id: Date.now(), // This will be ignored by the server if it's not used there
      description,
      amount: parseFloat(amount),
      category,
      date: new Date().toISOString().split("T")[0],
    };

    try {
      const response = await axios.post(
        "https://expense-tracker-backend-delta-seven.vercel.app/api/expenses/add_expense",
        newExpense
      );
      setExpenses([...expenses, response.data]); // Assuming the API returns the added expense
      setDescription("");
      setAmount("");
      setCategory("");
    } catch (error) {
      console.error("Failed to add expense:", error);
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

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Monthly Expense Tracker (INR)
        </h1>

        {selectedMonth !== "all" && (
          <div className="text-center mb-6">
            <p className="text-lg text-gray-600">
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
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Monthly Comparison</CardTitle>
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

        <div className="grid gap-8 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Add New Expense</CardTitle>
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
                <Button type="submit" className="w-full">
                  <Plus className="mr-2 h-4 w-4" /> Add Expense
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Expense Summary</CardTitle>
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
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Expense List</CardTitle>
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
                    key={expense.id}
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
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        ₹{expense.amount.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">{expense.date}</p>
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
