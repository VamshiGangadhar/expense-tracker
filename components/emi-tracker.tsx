"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Check, X, Clock, AlertCircle } from "lucide-react";
import axios from "axios";
import Link from "next/link";

const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://expense-tracker-backend-delta-seven.vercel.app"
    : "http://localhost:3004";

interface EMIInstallment {
  installmentNumber: number;
  dueDate: string;
  amount: number;
  isPaid: boolean;
  paidDate?: string;
  paidAmount: number;
}

interface EMI {
  _id: string;
  loanName: string;
  totalAmount: number;
  monthlyAmount: number;
  totalMonths: number;
  startDate: string;
  endDate: string;
  interestRate: number;
  lenderName: string;
  description: string;
  isActive: boolean;
  installments: EMIInstallment[];
  createdAt: string;
}

interface EMISummary {
  totalActiveLoans: number;
  totalOutstanding: number;
  totalPaidAmount: number;
  totalMonthlyEMI: number;
  overdueCount: number;
  upcomingThisMonth: number;
}

export function EMITracker() {
  const [emis, setEMIs] = useState<EMI[]>([]);
  const [summary, setSummary] = useState<EMISummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedEMI, setSelectedEMI] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    loanName: "",
    totalAmount: "",
    monthlyAmount: "",
    totalMonths: "",
    startDate: "",
    interestRate: "",
    lenderName: "",
    description: "",
  });

  useEffect(() => {
    fetchEMIs();
    fetchSummary();
  }, []);

  const fetchEMIs = async () => {
    try {
      const token = localStorage.getItem("expense_tracker_token");
      const response = await axios.get(`${API_BASE_URL}/api/emis`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEMIs(response.data.data);
    } catch (error) {
      console.error("Error fetching EMIs:", error);
    }
  };

  const fetchSummary = async () => {
    try {
      const token = localStorage.getItem("expense_tracker_token");
      const response = await axios.get(`${API_BASE_URL}/api/emis/summary`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSummary(response.data.data);
    } catch (error) {
      console.error("Error fetching summary:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEMI = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("expense_tracker_token");
      await axios.post(
        `${API_BASE_URL}/api/emis`,
        {
          ...formData,
          totalAmount: parseFloat(formData.totalAmount),
          monthlyAmount: parseFloat(formData.monthlyAmount),
          totalMonths: parseInt(formData.totalMonths),
          interestRate: parseFloat(formData.interestRate) || 0,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setFormData({
        loanName: "",
        totalAmount: "",
        monthlyAmount: "",
        totalMonths: "",
        startDate: "",
        interestRate: "",
        lenderName: "",
        description: "",
      });
      setShowAddForm(false);
      await fetchEMIs();
      await fetchSummary();
    } catch (error) {
      console.error("Error adding EMI:", error);
    } finally {
      setLoading(false);
    }
  };

  const markInstallmentPaid = async (
    emiId: string,
    installmentNumber: number,
    amount: number
  ) => {
    try {
      const token = localStorage.getItem("expense_tracker_token");
      await axios.put(
        `${API_BASE_URL}/api/emis/${emiId}/installment/${installmentNumber}/pay`,
        {
          paidAmount: amount,
          paidDate: new Date().toISOString(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      await fetchEMIs();
      await fetchSummary();
    } catch (error) {
      console.error("Error marking installment as paid:", error);
    }
  };

  const markInstallmentUnpaid = async (
    emiId: string,
    installmentNumber: number
  ) => {
    try {
      const token = localStorage.getItem("expense_tracker_token");
      await axios.put(
        `${API_BASE_URL}/api/emis/${emiId}/installment/${installmentNumber}/unpay`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      await fetchEMIs();
      await fetchSummary();
    } catch (error) {
      console.error("Error marking installment as unpaid:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const scrollToAddEMI = () => {
    setShowAddForm(true);
    setTimeout(() => {
      const element = document.getElementById("add-emi-form");
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  const isOverdue = (dueDate: string, isPaid: boolean) => {
    return !isPaid && new Date(dueDate) < new Date();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
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
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
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

      {/* Header with Add EMI Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900">EMI Tracker</h1>
        <Button
          onClick={scrollToAddEMI}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New EMI
        </Button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="h-8 w-8 flex items-center justify-center bg-green-100 rounded-full">
                  <span className="text-green-600 font-bold text-lg">₹</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Monthly EMI
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(summary.totalMonthlyEMI)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Outstanding Amount
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(summary.totalOutstanding)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <AlertCircle className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Overdue Payments
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    {summary.overdueCount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* EMI List */}
      <div className="space-y-4">
        {emis.map((emi) => (
          <Card key={emi._id}>
            <CardHeader
              className="cursor-pointer"
              onClick={() =>
                setSelectedEMI(selectedEMI === emi._id ? null : emi._id)
              }
            >
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{emi.loanName}</CardTitle>
                  <p className="text-sm text-gray-600">
                    {emi.lenderName && `${emi.lenderName} • `}
                    {formatCurrency(emi.monthlyAmount)}/month •{" "}
                    {emi.totalMonths} months
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {formatCurrency(emi.totalAmount)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {emi.interestRate > 0 && `${emi.interestRate}% interest`}
                  </p>
                </div>
              </div>
            </CardHeader>

            {selectedEMI === emi._id && (
              <CardContent className="pt-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Installment</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {emi.installments.map((installment) => (
                        <TableRow key={installment.installmentNumber}>
                          <TableCell>
                            #{installment.installmentNumber}
                          </TableCell>
                          <TableCell>
                            <span
                              className={
                                isOverdue(
                                  installment.dueDate,
                                  installment.isPaid
                                )
                                  ? "text-red-600 font-medium"
                                  : ""
                              }
                            >
                              {formatDate(installment.dueDate)}
                            </span>
                          </TableCell>
                          <TableCell>
                            {formatCurrency(installment.amount)}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                installment.isPaid
                                  ? "bg-green-100 text-green-800"
                                  : isOverdue(
                                      installment.dueDate,
                                      installment.isPaid
                                    )
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {installment.isPaid
                                ? "Paid"
                                : isOverdue(
                                    installment.dueDate,
                                    installment.isPaid
                                  )
                                ? "Overdue"
                                : "Pending"}
                            </span>
                          </TableCell>
                          <TableCell>
                            {installment.isPaid ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  markInstallmentUnpaid(
                                    emi._id,
                                    installment.installmentNumber
                                  )
                                }
                              >
                                <X className="h-3 w-3 mr-1" />
                                Unpaid
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() =>
                                  markInstallmentPaid(
                                    emi._id,
                                    installment.installmentNumber,
                                    installment.amount
                                  )
                                }
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Check className="h-3 w-3 mr-1" />
                                Mark Paid
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Add EMI Form */}
      {showAddForm && (
        <Card id="add-emi-form">
          <CardHeader>
            <CardTitle>Add New EMI</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddEMI} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="loanName">Loan Name *</Label>
                  <Input
                    id="loanName"
                    value={formData.loanName}
                    onChange={(e) =>
                      setFormData({ ...formData, loanName: e.target.value })
                    }
                    placeholder="e.g., Home Loan, Car Loan"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="lenderName">Lender Name</Label>
                  <Input
                    id="lenderName"
                    value={formData.lenderName}
                    onChange={(e) =>
                      setFormData({ ...formData, lenderName: e.target.value })
                    }
                    placeholder="e.g., Bank of America"
                  />
                </div>

                <div>
                  <Label htmlFor="totalAmount">Total Loan Amount *</Label>
                  <Input
                    id="totalAmount"
                    type="number"
                    step="0.01"
                    value={formData.totalAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, totalAmount: e.target.value })
                    }
                    placeholder="50000"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="monthlyAmount">Monthly EMI Amount *</Label>
                  <Input
                    id="monthlyAmount"
                    type="number"
                    step="0.01"
                    value={formData.monthlyAmount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        monthlyAmount: e.target.value,
                      })
                    }
                    placeholder="2500"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="totalMonths">Total Months *</Label>
                  <Input
                    id="totalMonths"
                    type="number"
                    value={formData.totalMonths}
                    onChange={(e) =>
                      setFormData({ ...formData, totalMonths: e.target.value })
                    }
                    placeholder="24"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="interestRate">Interest Rate (%)</Label>
                  <Input
                    id="interestRate"
                    type="number"
                    step="0.01"
                    value={formData.interestRate}
                    onChange={(e) =>
                      setFormData({ ...formData, interestRate: e.target.value })
                    }
                    placeholder="12.5"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Additional notes about this loan"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? "Adding..." : "Add EMI"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
