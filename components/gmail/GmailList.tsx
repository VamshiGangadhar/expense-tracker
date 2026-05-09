"use client";

import React, { useState, useEffect } from "react";
import { fetchEmails } from "@/lib/gmail";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Mail, RefreshCw } from "lucide-react";

interface Email {
  id: string;
  subject: string;
  from: string;
  date: string;
  snippet: string;
}

export default function GmailList() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isFetching = React.useRef(false);

  const loadEmails = async () => {
    if (isFetching.current) return;
    
    const token = typeof window !== "undefined" ? localStorage.getItem("expense_tracker_token") : null;
    if (!token) return;

    isFetching.current = true;
    setLoading(true);
    setError(null);
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      
      // Calculate first day of the month
      const start = new Date(year, month, 1);
      const startDateStr = `${start.getFullYear()}/${String(start.getMonth() + 1).padStart(2, "0")}/${String(start.getDate()).padStart(2, "0")}`;
      
      // Calculate last day of the month
      const end = new Date(year, month + 1, 0);
      const endDateStr = `${end.getFullYear()}/${String(end.getMonth() + 1).padStart(2, "0")}/${String(end.getDate()).padStart(2, "0")}`;

      const data = await fetchEmails(startDateStr, endDateStr);
      setEmails(data.emails || []);
    } catch (err: unknown) {
      // If we are unmounting or another fetch started, ignore this error
      if (!isFetching.current) return;
      
      let errorMessage = "Failed to fetch emails. Make sure your Gmail is connected in Settings.";
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  };

  useEffect(() => {
    // Add a small delay to ensure auth headers are settled
    const timer = setTimeout(() => {
      loadEmails();
    }, 500);
    
    return () => {
      clearTimeout(timer);
      isFetching.current = false;
    };
  }, []);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Recent Expense Emails
          </CardTitle>
          <p className="text-xs text-gray-500">
            Filtering for: {new Date(new Date().getFullYear(), new Date().getMonth(), 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={loadEmails} 
          disabled={loading}
          className="flex items-center gap-2"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="p-4 text-center text-red-500 bg-red-50 rounded-md border border-red-200">
            {error}
          </div>
        ) : loading && emails.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-10 text-gray-500">
            <Loader2 className="h-10 w-10 animate-spin mb-4" />
            <p>Scanning your inbox for expenses...</p>
          </div>
        ) : emails.length === 0 ? (
          <div className="text-center p-10 text-gray-500">
            No expense-related emails found.
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead className="hidden md:table-cell">Snippet</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {emails.map((email) => (
                  <TableRow key={email.id}>
                    <TableCell className="whitespace-nowrap font-medium text-xs">
                      {new Date(email.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate text-xs">
                      {email.from}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate font-medium text-xs">
                      {email.subject}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs text-gray-500 truncate max-w-[300px]">
                      {email.snippet}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
