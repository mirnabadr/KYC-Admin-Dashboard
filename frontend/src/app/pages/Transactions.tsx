import React from 'react';
import { useState } from 'react';
import { mockTransactions, TransactionStatus } from '../data/mockData';
import { useAuth, Region } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { CheckCircle2, XCircle, Search, Filter, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { GlassCard } from '../components/GlassCard';
import { UserAvatar } from '../components/UserAvatar';

export function Transactions() {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [transactions, setTransactions] = useState(mockTransactions);

  const isGlobalAdmin = user?.role === 'Global Admin';
  const canApproveReject = user?.role === 'Global Admin' || user?.role === 'Regional Admin';

  const filteredTransactions = transactions.filter((transaction) => {
    if (statusFilter !== 'all' && transaction.status !== statusFilter) return false;
    if (regionFilter !== 'all' && transaction.region !== regionFilter) return false;
    if (searchQuery && 
        !transaction.id.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !transaction.user.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Regional admins only see their region
    if (user?.role === 'Regional Admin' && transaction.region !== user.region) {
      return false;
    }
    
    return true;
  });

  const handleApprove = (transactionId: string) => {
    setTransactions(prev => prev.map(t => 
      t.id === transactionId ? { ...t, status: 'Approved' as TransactionStatus } : t
    ));
    toast.success(`Transaction ${transactionId} approved`);
  };

  const handleReject = (transactionId: string) => {
    setTransactions(prev => prev.map(t => 
      t.id === transactionId ? { ...t, status: 'Rejected' as TransactionStatus } : t
    ));
    toast.error(`Transaction ${transactionId} rejected`);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header with scope badge */}
      <div className="flex items-center justify-between">
        <div>
          <Badge variant="secondary" className="text-xs mb-2">
            {isGlobalAdmin ? 'Global View' : `Region: ${user?.region}`}
          </Badge>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Transactions</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Manage and review KYC transactions</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Region</label>
              <Select 
                value={regionFilter} 
                onValueChange={setRegionFilter}
                disabled={!isGlobalAdmin}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All regions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  <SelectItem value="US">US</SelectItem>
                  <SelectItem value="EU">EU</SelectItem>
                  <SelectItem value="APAC">APAC</SelectItem>
                  <SelectItem value="LATAM">LATAM</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by user or transaction ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead className="text-right">Amount (USD)</TableHead>
                  <TableHead className="text-right">Converted (USDC)</TableHead>
                  <TableHead>Status</TableHead>
                  {canApproveReject && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={canApproveReject ? 8 : 7} className="text-center py-8 text-slate-500">
                      No transactions found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="text-sm">{transaction.date}</TableCell>
                      <TableCell className="font-medium text-sm">{transaction.id}</TableCell>
                      <TableCell className="text-sm">{transaction.user}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {transaction.region}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        ${transaction.amountUSD.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {transaction.amountUSDC.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            transaction.status === 'Approved' ? 'default' : 
                            transaction.status === 'Pending' ? 'secondary' : 
                            'destructive'
                          }
                          className="text-xs"
                        >
                          {transaction.status}
                        </Badge>
                      </TableCell>
                      {canApproveReject && (
                        <TableCell className="text-right">
                          {transaction.status === 'Pending' ? (
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-xs"
                                onClick={() => handleApprove(transaction.id)}
                              >
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-xs text-red-600 hover:text-red-700"
                                onClick={() => handleReject(transaction.id)}
                              >
                                <XCircle className="h-3 w-3 mr-1" />
                                Reject
                              </Button>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination info */}
      <div className="flex items-center justify-between text-sm text-slate-600">
        <div>
          Showing {filteredTransactions.length} of {transactions.length} transactions
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>Previous</Button>
          <Button variant="outline" size="sm" disabled>Next</Button>
        </div>
      </div>
    </div>
  );
}