import { useState, useEffect } from 'react';
import { transactionsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
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
import { CheckCircle2, XCircle, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';

export function Transactions() {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, pages: 1 });

  const isGlobalAdmin = user?.role === 'Global Admin';
  const canApproveReject = user?.role === 'Global Admin' || user?.role === 'Regional Admin';

  useEffect(() => {
    fetchTransactions();
  }, [statusFilter, regionFilter, currentPage]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const filters: any = {
        page: currentPage,
        limit: 50,
      };
      if (statusFilter !== 'all') filters.status = statusFilter;
      if (regionFilter !== 'all') filters.region = regionFilter;

      const response = await transactionsApi.getAll(filters);
      setTransactions(response.data || []);
      setPagination(response.pagination || { page: 1, limit: 50, total: 0, pages: 1 });
    } catch (error: any) {
      console.error('Failed to fetch transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter((transaction) => {
    if (searchQuery && 
        !transaction.id.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !transaction.user.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const handleApprove = async (transactionId: string) => {
    try {
      await transactionsApi.updateStatus(transactionId, 'Approved');
      toast.success(`Transaction ${transactionId} approved`);
      fetchTransactions();
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve transaction');
    }
  };

  const handleReject = async (transactionId: string) => {
    try {
      await transactionsApi.updateStatus(transactionId, 'Rejected');
      toast.error(`Transaction ${transactionId} rejected`);
      fetchTransactions();
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject transaction');
    }
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
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
              <Select value={statusFilter} onValueChange={(value) => {
                setStatusFilter(value);
                setCurrentPage(1);
              }}>
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
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Region</label>
              <Select 
                value={regionFilter} 
                onValueChange={(value) => {
                  setRegionFilter(value);
                  setCurrentPage(1);
                }}
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
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Search</label>
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
          {loading ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              Loading transactions...
            </div>
          ) : (
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
                      <TableCell colSpan={canApproveReject ? 8 : 7} className="text-center py-8 text-slate-500 dark:text-slate-400">
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
          )}
        </CardContent>
      </Card>

      {/* Pagination info */}
      <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
        <div>
          Showing {filteredTransactions.length} of {pagination.total} transactions
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="px-2">Page {currentPage} of {pagination.pages}</span>
          <Button 
            variant="outline" 
            size="sm" 
            disabled={currentPage >= pagination.pages}
            onClick={() => setCurrentPage(p => Math.min(pagination.pages, p + 1))}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
