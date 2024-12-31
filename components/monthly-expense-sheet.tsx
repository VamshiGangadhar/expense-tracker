'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import Link from 'next/link'

type Expense = {
  id: number
  description: string
  amount: number
  category: string
  date: string
}

export default function MonthlyExpenseSheet() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth().toString())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())

  useEffect(() => {
    // In a real application, you would fetch the expenses from an API or local storage here
    // For this example, we'll use some dummy data
    const dummyExpenses: Expense[] = [
      { id: 1, description: "Groceries", amount: 5000, category: "food", date: "2023-05-01" },
      { id: 2, description: "Electricity Bill", amount: 2000, category: "utilities", date: "2023-05-05" },
      { id: 3, description: "Movie Night", amount: 1000, category: "entertainment", date: "2023-05-15" },
      { id: 4, description: "Bus Pass", amount: 1500, category: "transport", date: "2023-05-01" },
      { id: 5, description: "New Shoes", amount: 3000, category: "other", date: "2023-05-20" },
    ]
    setExpenses(dummyExpenses)
  }, [])

  const filteredExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date)
    return expenseDate.getMonth().toString() === selectedMonth &&
           expenseDate.getFullYear().toString() === selectedYear
  })

  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - 2 + i).toString())

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">Monthly Expense Sheet</h1>

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
                  <SelectItem key={index} value={index.toString()}>{month}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger>
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expense Summary for {months[parseInt(selectedMonth)]} {selectedYear}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount (INR)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>{expense.date}</TableCell>
                    <TableCell>{expense.description}</TableCell>
                    <TableCell>{expense.category}</TableCell>
                    <TableCell className="text-right">₹{expense.amount.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={3} className="font-bold">Total</TableCell>
                  <TableCell className="text-right font-bold">₹{totalExpenses.toFixed(2)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Link href="/" passHref>
            <Button>Back to Expense Tracker</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

