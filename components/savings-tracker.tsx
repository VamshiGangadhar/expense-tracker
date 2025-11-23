"use client";

import { useState, useEffect } from "react";
import { Plus, Minus, TrendingUp, TrendingDown, Wallet } from "lucide-react";
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

type SavingsTransaction = {
  _id: string;
  amount: number;
  type: "deposit" | "withdrawal";
  description: string;
  category: string;
  date: string;
  createdAt: string;
};

type SavingsSummary = {
  totalDeposits: number;
  totalWithdrawals: number;
  balance: number;
  transactionCount: number;
};

type MonthlySavings = {
  month: string;
  deposits: number;
  withdrawals: number;
  net: number;
};

export default function SavingsTracker() {
  const [transactions, setTransactions] = useState<SavingsTransaction[]>([]);
  const [summary, setSummary] = useState<SavingsSummary>({
    totalDeposits: 0,
    totalWithdrawals: 0,
    balance: 0,
    transactionCount: 0,
  });
  const [monthlySavings, setMonthlySavings] = useState<MonthlySavings[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Form states
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"deposit" | "withdrawal">("deposit");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  // Filter states
  const [filterType, setFilterType] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("all");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    const token = localStorage.getItem("expense_tracker_token");
    if (!token) {
      setLoading(false);
      return;
    }

    if (!axios.defaults.headers.common["Authorization"]) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }

    try {
      const [transactionsRes, summaryRes, monthlyRes] = await Promise.all([
        axios.get(`${API_CONFIG.BASE_URL}/api/savings/transactions`),
        axios.get(`${API_CONFIG.BASE_URL}/api/savings/summary`),
        axios.get(`${API_CONFIG.BASE_URL}/api/savings/monthly`),
      ]);

      setTransactions(transactionsRes.data);
      setSummary(summaryRes.data);
      setMonthlySavings(monthlyRes.data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch savings data:", error);
      setLoading(false);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        localStorage.removeItem("expense_tracker_token");
        localStorage.removeItem("expense_tracker_user");
        window.location.reload();
      } else {
        setError(
          "Failed to load savings data. Please try refreshing the page."
        );
      }
    }
  };

  const addTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading("add_transaction");

    const newTransaction = {
      amount: parseFloat(amount),
      type,
      description,
      category: category || "General",
      date,
    };

    try {
      await axios.post(
        `${API_CONFIG.BASE_URL}/api/savings/add`,
        newTransaction
      );

      // Refresh all data after adding
      await fetchData();

      // Reset form
      setAmount("");
      setDescription("");
      setCategory("");
      setDate(new Date().toISOString().split("T")[0]);

      alert(
        `${type === "deposit" ? "Deposit" : "Withdrawal"} added successfully!`
      );
    } catch (error) {
      console.error("Failed to add transaction:", error);
      alert("Failed to add transaction. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!confirm("Are you sure you want to delete this transaction?")) {
      return;
    }

    setActionLoading(id);
    try {
      await axios.delete(`${API_CONFIG.BASE_URL}/api/savings/${id}`);
      await fetchData();
      alert("Transaction deleted successfully!");
    } catch (error) {
      console.error("Failed to delete transaction:", error);
      alert("Failed to delete transaction. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const typeMatch = filterType === "all" || transaction.type === filterType;

    if (selectedMonth === "all") {
      return typeMatch;
    } else {
      const transactionMonth = new Date(transaction.date)
        .toISOString()
        .slice(0, 7);
      return typeMatch && transactionMonth === selectedMonth;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Loading Savings...
          </h2>
          <p className="text-gray-500">Please wait while we fetch your data</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">{error}</h2>
          <Button onClick={fetchData}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 bg-white p-2 rounded-lg shadow-sm">
            <Link href="/">
              <Button
                variant="outline"
                className="border-blue-200 hover:bg-blue-50"
              >
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
            <Link href="/savings">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                💰 Savings
              </Button>
            </Link>
            <Link href="/lending">
              <Button
                variant="outline"
                className="border-blue-200 hover:bg-blue-50"
              >
                🤝 Lending
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

        <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">
          💰 Savings Tracker
        </h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <TrendingUp className="mr-2 h-4 w-4" />
                Total Deposits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                ₹{summary.totalDeposits.toLocaleString("en-IN")}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <TrendingDown className="mr-2 h-4 w-4" />
                Total Withdrawals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                ₹{summary.totalWithdrawals.toLocaleString("en-IN")}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Wallet className="mr-2 h-4 w-4" />
                Current Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                ₹{summary.balance.toLocaleString("en-IN")}
              </div>
              <p className="text-xs mt-1 opacity-90">
                {summary.transactionCount} transactions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Savings Breakdown */}
        {monthlySavings.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Monthly Savings Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4">Month</th>
                      <th className="text-right py-2 px-4">Deposits</th>
                      <th className="text-right py-2 px-4">Withdrawals</th>
                      <th className="text-right py-2 px-4">Net Savings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlySavings.map((month) => (
                      <tr
                        key={month.month}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="py-2 px-4">{month.month}</td>
                        <td className="text-right py-2 px-4 text-green-600">
                          +₹{month.deposits.toLocaleString("en-IN")}
                        </td>
                        <td className="text-right py-2 px-4 text-red-600">
                          -₹{month.withdrawals.toLocaleString("en-IN")}
                        </td>
                        <td
                          className={`text-right py-2 px-4 font-semibold ${
                            month.net >= 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {month.net >= 0 ? "+" : ""}₹
                          {month.net.toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Add Transaction Form */}
        <Card className="mb-8" id="add-transaction-form">
          <CardHeader>
            <CardTitle>Add New Transaction</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={addTransaction} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Transaction Type</Label>
                  <Select
                    value={type}
                    onValueChange={(value: "deposit" | "withdrawal") =>
                      setType(value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="deposit">
                        <span className="flex items-center">
                          <Plus className="mr-2 h-4 w-4 text-green-500" />
                          Deposit
                        </span>
                      </SelectItem>
                      <SelectItem value="withdrawal">
                        <span className="flex items-center">
                          <Minus className="mr-2 h-4 w-4 text-red-500" />
                          Withdrawal
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="amount">Amount (₹)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    type="text"
                    placeholder="What is this for?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    type="text"
                    placeholder="e.g., Emergency Fund, Investment"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={actionLoading === "add_transaction"}
              >
                {actionLoading === "add_transaction" ? (
                  "Adding..."
                ) : (
                  <>
                    {type === "deposit" ? (
                      <Plus className="mr-2 h-4 w-4" />
                    ) : (
                      <Minus className="mr-2 h-4 w-4" />
                    )}
                    Add {type === "deposit" ? "Deposit" : "Withdrawal"}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Filter Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="filterType">Type</Label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="deposit">Deposits</SelectItem>
                    <SelectItem value="withdrawal">Withdrawals</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="selectedMonth">Month</Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Months</SelectItem>
                    {monthlySavings.map((month) => (
                      <SelectItem key={month.month} value={month.month}>
                        {month.month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions List */}
        <Card>
          <CardHeader>
            <CardTitle>
              Transaction History ({filteredTransactions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Wallet className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No transactions found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTransactions.map((transaction) => (
                  <div
                    key={transaction._id}
                    className={`p-4 rounded-lg border-l-4 ${
                      transaction.type === "deposit"
                        ? "border-green-500 bg-green-50"
                        : "border-red-500 bg-red-50"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {transaction.type === "deposit" ? (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-500" />
                          )}
                          <h3 className="font-semibold">
                            {transaction.description}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-600">
                          {transaction.category} •{" "}
                          {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-xl font-bold ${
                            transaction.type === "deposit"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {transaction.type === "deposit" ? "+" : "-"}₹
                          {transaction.amount.toLocaleString("en-IN")}
                        </p>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteTransaction(transaction._id)}
                          disabled={actionLoading === transaction._id}
                          className="mt-2"
                        >
                          {actionLoading === transaction._id
                            ? "Deleting..."
                            : "Delete"}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
