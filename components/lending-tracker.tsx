"use client";

import { useState, useEffect } from "react";
import { Plus, UserCheck, Clock, CheckCircle, AlertCircle } from "lucide-react";
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

type LendingRecord = {
  _id: string;
  borrowerName: string;
  amount: number;
  purpose: string;
  lendDate: string;
  expectedReturnDate?: string;
  status: "pending" | "partially_returned" | "fully_returned";
  returnedAmount: number;
  notes?: string;
  createdAt: string;
};

type LendingSummary = {
  totalLent: number;
  totalReturned: number;
  pendingAmount: number;
  statusCounts: {
    pending: number;
    partially_returned: number;
    fully_returned: number;
  };
  totalRecords: number;
};

export default function LendingTracker() {
  const [lendings, setLendings] = useState<LendingRecord[]>([]);
  const [summary, setSummary] = useState<LendingSummary>({
    totalLent: 0,
    totalReturned: 0,
    pendingAmount: 0,
    statusCounts: { pending: 0, partially_returned: 0, fully_returned: 0 },
    totalRecords: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Form states for adding new lending
  const [borrowerName, setBorrowerName] = useState("");
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("");
  const [lendDate, setLendDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [expectedReturnDate, setExpectedReturnDate] = useState("");
  const [notes, setNotes] = useState("");

  // Form states for updating repayment
  const [selectedLending, setSelectedLending] = useState<string | null>(null);
  const [returnedAmount, setReturnedAmount] = useState("");
  const [repaymentNotes, setRepaymentNotes] = useState("");

  // Filter state
  const [filterStatus, setFilterStatus] = useState("all");

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
      const [lendingsRes, summaryRes] = await Promise.all([
        axios.get(`${API_CONFIG.BASE_URL}/api/lending/list`),
        axios.get(`${API_CONFIG.BASE_URL}/api/lending/summary`),
      ]);

      setLendings(lendingsRes.data);
      setSummary(summaryRes.data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch lending data:", error);
      setLoading(false);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        localStorage.removeItem("expense_tracker_token");
        localStorage.removeItem("expense_tracker_user");
        window.location.reload();
      } else {
        setError(
          "Failed to load lending data. Please try refreshing the page."
        );
      }
    }
  };

  const addLending = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading("add_lending");

    const newLending = {
      borrowerName,
      amount: parseFloat(amount),
      purpose: purpose || "Personal loan",
      lendDate,
      expectedReturnDate: expectedReturnDate || undefined,
      notes: notes || undefined,
    };

    try {
      await axios.post(`${API_CONFIG.BASE_URL}/api/lending/add`, newLending);

      // Refresh data
      await fetchData();

      // Reset form
      setBorrowerName("");
      setAmount("");
      setPurpose("");
      setLendDate(new Date().toISOString().split("T")[0]);
      setExpectedReturnDate("");
      setNotes("");

      alert("Lending record added successfully!");
    } catch (error) {
      console.error("Failed to add lending record:", error);
      alert("Failed to add lending record. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const updateRepayment = async (lendingId: string) => {
    if (!returnedAmount) {
      alert("Please enter the returned amount");
      return;
    }

    setActionLoading(lendingId);

    try {
      await axios.put(`${API_CONFIG.BASE_URL}/api/lending/${lendingId}`, {
        returnedAmount: parseFloat(returnedAmount),
        notes: repaymentNotes || undefined,
      });

      // Refresh data
      await fetchData();

      // Reset repayment form
      setSelectedLending(null);
      setReturnedAmount("");
      setRepaymentNotes("");

      alert("Repayment updated successfully!");
    } catch (error) {
      console.error("Failed to update repayment:", error);
      alert("Failed to update repayment. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const deleteLending = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lending record?")) {
      return;
    }

    setActionLoading(id);
    try {
      await axios.delete(`${API_CONFIG.BASE_URL}/api/lending/${id}`);
      await fetchData();
      alert("Lending record deleted successfully!");
    } catch (error) {
      console.error("Failed to delete lending record:", error);
      alert("Failed to delete lending record. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredLendings = lendings.filter((lending) => {
    if (filterStatus === "all") return true;
    return lending.status === filterStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "partially_returned":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "fully_returned":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "partially_returned":
        return <AlertCircle className="h-4 w-4" />;
      case "fully_returned":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Loading Lending Records...
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
              <Button
                variant="outline"
                className="border-blue-200 hover:bg-blue-50"
              >
                💰 Savings
              </Button>
            </Link>
            <Link href="/lending">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
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
          🤝 Lending Tracker
        </h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <UserCheck className="mr-2 h-4 w-4" />
                Total Lent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                ₹{summary.totalLent.toLocaleString("en-IN")}
              </div>
              <p className="text-xs mt-1 opacity-90">
                {summary.totalRecords} records
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <CheckCircle className="mr-2 h-4 w-4" />
                Total Returned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                ₹{summary.totalReturned.toLocaleString("en-IN")}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <AlertCircle className="mr-2 h-4 w-4" />
                Pending Amount
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                ₹{summary.pendingAmount.toLocaleString("en-IN")}
              </div>
              <p className="text-xs mt-1 opacity-90">
                {summary.statusCounts.pending +
                  summary.statusCounts.partially_returned}{" "}
                pending
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Add Lending Form */}
        <Card className="mb-8" id="add-lending-form">
          <CardHeader>
            <CardTitle>Add New Lending Record</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={addLending} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="borrowerName">Borrower Name</Label>
                  <Input
                    id="borrowerName"
                    type="text"
                    placeholder="Who borrowed the money?"
                    value={borrowerName}
                    onChange={(e) => setBorrowerName(e.target.value)}
                    required
                  />
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
                  <Label htmlFor="purpose">Purpose</Label>
                  <Input
                    id="purpose"
                    type="text"
                    placeholder="Reason for lending"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="lendDate">Lend Date</Label>
                  <Input
                    id="lendDate"
                    type="date"
                    value={lendDate}
                    onChange={(e) => setLendDate(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="expectedReturnDate">
                    Expected Return Date (Optional)
                  </Label>
                  <Input
                    id="expectedReturnDate"
                    type="date"
                    value={expectedReturnDate}
                    onChange={(e) => setExpectedReturnDate(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Input
                    id="notes"
                    type="text"
                    placeholder="Additional notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={actionLoading === "add_lending"}
              >
                {actionLoading === "add_lending" ? (
                  "Adding..."
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Lending Record
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Filter */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Filter Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full md:w-1/2">
              <Label htmlFor="filterStatus">Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="partially_returned">
                    Partially Returned
                  </SelectItem>
                  <SelectItem value="fully_returned">Fully Returned</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Lending Records List */}
        <Card>
          <CardHeader>
            <CardTitle>Lending Records ({filteredLendings.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredLendings.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <UserCheck className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No lending records found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredLendings.map((lending) => (
                  <Card
                    key={lending._id}
                    className={`border-l-4 ${getStatusColor(lending.status)}`}
                  >
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold mb-2">
                            {lending.borrowerName}
                          </h3>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p>
                              <strong>Purpose:</strong> {lending.purpose}
                            </p>
                            <p>
                              <strong>Lend Date:</strong>{" "}
                              {new Date(lending.lendDate).toLocaleDateString()}
                            </p>
                            {lending.expectedReturnDate && (
                              <p>
                                <strong>Expected Return:</strong>{" "}
                                {new Date(
                                  lending.expectedReturnDate
                                ).toLocaleDateString()}
                              </p>
                            )}
                            {lending.notes && (
                              <p>
                                <strong>Notes:</strong> {lending.notes}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2 justify-end mb-2">
                            {getStatusIcon(lending.status)}
                            <span className="text-sm font-medium capitalize">
                              {lending.status.replace("_", " ")}
                            </span>
                          </div>
                          <p className="text-2xl font-bold text-purple-600 mb-1">
                            ₹{lending.amount.toLocaleString("en-IN")}
                          </p>
                          {lending.returnedAmount > 0 && (
                            <p className="text-sm text-green-600">
                              Returned: ₹
                              {lending.returnedAmount.toLocaleString("en-IN")}
                            </p>
                          )}
                          {lending.amount > lending.returnedAmount && (
                            <p className="text-sm text-orange-600 font-semibold">
                              Pending: ₹
                              {(
                                lending.amount - lending.returnedAmount
                              ).toLocaleString("en-IN")}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Repayment Form */}
                      {lending.status !== "fully_returned" && (
                        <div className="mt-4 pt-4 border-t">
                          {selectedLending === lending._id ? (
                            <div className="space-y-3">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <Label htmlFor={`returned-${lending._id}`}>
                                    Returned Amount (₹)
                                  </Label>
                                  <Input
                                    id={`returned-${lending._id}`}
                                    type="number"
                                    step="0.01"
                                    placeholder="Enter returned amount"
                                    value={returnedAmount}
                                    onChange={(e) =>
                                      setReturnedAmount(e.target.value)
                                    }
                                  />
                                </div>
                                <div>
                                  <Label htmlFor={`notes-${lending._id}`}>
                                    Notes
                                  </Label>
                                  <Input
                                    id={`notes-${lending._id}`}
                                    type="text"
                                    placeholder="Additional notes"
                                    value={repaymentNotes}
                                    onChange={(e) =>
                                      setRepaymentNotes(e.target.value)
                                    }
                                  />
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => updateRepayment(lending._id)}
                                  disabled={actionLoading === lending._id}
                                  className="flex-1"
                                >
                                  {actionLoading === lending._id
                                    ? "Updating..."
                                    : "Update Repayment"}
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedLending(null);
                                    setReturnedAmount("");
                                    setRepaymentNotes("");
                                  }}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <Button
                                onClick={() => {
                                  setSelectedLending(lending._id);
                                  setReturnedAmount(
                                    lending.returnedAmount.toString()
                                  );
                                  setRepaymentNotes(lending.notes || "");
                                }}
                                variant="outline"
                                className="flex-1"
                              >
                                Update Repayment
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => deleteLending(lending._id)}
                                disabled={actionLoading === lending._id}
                              >
                                {actionLoading === lending._id
                                  ? "Deleting..."
                                  : "Delete"}
                              </Button>
                            </div>
                          )}
                        </div>
                      )}

                      {lending.status === "fully_returned" && (
                        <div className="mt-4 pt-4 border-t">
                          <Button
                            variant="destructive"
                            onClick={() => deleteLending(lending._id)}
                            disabled={actionLoading === lending._id}
                            className="w-full"
                          >
                            {actionLoading === lending._id
                              ? "Deleting..."
                              : "Delete Record"}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
