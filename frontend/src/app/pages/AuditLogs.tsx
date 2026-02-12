import { useState, useEffect } from 'react';
import { auditLogsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '../components/ui/pagination';
import { Search, Filter, Activity } from 'lucide-react';

const ITEMS_PER_PAGE = 5;

export function AuditLogs() {
  const { user } = useAuth();
  const isGlobalAdmin = user?.role === 'Global Admin';
  const [userFilter, setUserFilter] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: ITEMS_PER_PAGE, total: 0, pages: 1 });

  useEffect(() => {
    fetchLogs();
    if (autoRefresh) {
      const interval = setInterval(fetchLogs, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [currentPage, actionFilter, statusFilter, regionFilter, userFilter, autoRefresh]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const filters: any = {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
      };
      if (actionFilter !== 'all') filters.action = actionFilter;
      if (statusFilter !== 'all') filters.status = statusFilter;
      if (regionFilter !== 'all') filters.region = regionFilter;
      if (userFilter) filters.userEmail = userFilter;

      const response = await auditLogsApi.getAll(filters);
      setLogs(response.data || []);
      setPagination(response.pagination || { page: 1, limit: ITEMS_PER_PAGE, total: 0, pages: 1 });
    } catch (error: any) {
      console.error('Failed to fetch audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < pagination.pages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [userFilter, actionFilter, statusFilter, regionFilter]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Audit Logs</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Track system activity and user actions</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="flex items-center gap-2"
          >
            <Activity className={`h-4 w-4 ${autoRefresh ? 'text-green-600 dark:text-green-400' : 'text-slate-400 dark:text-slate-500'}`} />
            <span className={autoRefresh ? 'text-green-600 dark:text-green-400' : 'text-slate-600 dark:text-slate-400'}>
              {autoRefresh ? 'Live' : 'Paused'}
            </span>
          </Button>
        </div>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">User</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                <Input
                  placeholder="Search by user email..."
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Action</label>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="Login">Login</SelectItem>
                  <SelectItem value="Create Transaction">Create Transaction</SelectItem>
                  <SelectItem value="Approve Transaction">Approve Transaction</SelectItem>
                  <SelectItem value="Reject Transaction">Reject Transaction</SelectItem>
                  <SelectItem value="Update Role">Update Role</SelectItem>
                  <SelectItem value="Add User">Add User</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Success">Success</SelectItem>
                  <SelectItem value="Failure">Failure</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Region</label>
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
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              Loading audit logs...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-slate-500 dark:text-slate-400">
                        No audit logs found
                      </TableCell>
                    </TableRow>
                  ) : (
                    logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-sm font-mono text-slate-900 dark:text-slate-100">{log.timestamp}</TableCell>
                        <TableCell className="text-sm text-slate-900 dark:text-slate-100">{log.user}</TableCell>
                        <TableCell className="text-sm font-medium text-slate-900 dark:text-slate-100">{log.action}</TableCell>
                        <TableCell className="text-sm text-slate-600 dark:text-slate-400">
                          {log.region ? (
                            <Badge variant="outline" className="text-xs">{log.region}</Badge>
                          ) : '—'}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={log.status === 'Success' ? 'default' : 'destructive'}
                            className="text-xs"
                          >
                            {log.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600 dark:text-slate-400">{log.details}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results info and Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-600 dark:text-slate-400">
          Showing {logs.length > 0 ? ((currentPage - 1) * ITEMS_PER_PAGE + 1) : 0}-{Math.min(currentPage * ITEMS_PER_PAGE, pagination.total)} of {pagination.total} audit logs
        </div>
        {pagination.pages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePrevious();
                  }}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              <PaginationItem>
                <span className="text-sm text-slate-600 dark:text-slate-400 px-4">
                  Page {currentPage} of {pagination.pages}
                </span>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNext();
                  }}
                  className={currentPage === pagination.pages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
}
