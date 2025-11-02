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

type Expense = {
  id: number;
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

  useEffect(() => {
    setLoading(true);
    axios
      .get(
        "https://expense-tracker-backend-delta-seven.vercel.app/api/expenses/get_expenses"
      )
      .then((response) => {
        const expensesData = response.data;
        setExpenses(expensesData);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to fetch expenses:", error);
        setLoading(false);
      });
  }, []);

  const [selectedMonth, setSelectedMonth] = useState(
    new Date().getMonth().toString()
  );
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString()
  );
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Monthly Expense Sheet
        </h1>

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
                        <TableRow key={expense.id}>
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
