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
      .get("https://expense-tracker-backend-delta-seven.vercel.app/api/expenses/get_expenses")
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

  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  const filteredExpenses =
    filter === "all"
      ? expenses
      : expenses.filter((expense) => expense.category === filter);

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Monthly Expense Tracker (INR)
        </h1>

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
                Total: ₹{totalExpenses.toFixed(2)}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>Food</span>
                  <span>
                    ₹
                    {expenses
                      .filter((e) => e.category === "food")
                      .reduce((sum, e) => sum + e.amount, 0)
                      .toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Transport</span>
                  <span>
                    ₹
                    {expenses
                      .filter((e) => e.category === "transport")
                      .reduce((sum, e) => sum + e.amount, 0)
                      .toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Utilities</span>
                  <span>
                    ₹
                    {expenses
                      .filter((e) => e.category === "utilities")
                      .reduce((sum, e) => sum + e.amount, 0)
                      .toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Entertainment</span>
                  <span>
                    ₹
                    {expenses
                      .filter((e) => e.category === "entertainment")
                      .reduce((sum, e) => sum + e.amount, 0)
                      .toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Other</span>
                  <span>
                    ₹
                    {expenses
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
            <div className="mb-4">
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
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-4">
              {filteredExpenses.map((expense) => (
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
              ))}
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
