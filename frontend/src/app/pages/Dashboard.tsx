import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { fetchUSDtoUSDCRate, subscribeToRateUpdates, CybridRate } from '../data/cybridApi';
import { transactionsApi, auditLogsApi } from '../services/api';
import { mockChartData } from '../data/mockData';
import { ArrowUpRight, CheckCircle2, Clock, DollarSign, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { GlassCard } from '../components/GlassCard';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

// Component for region legend dot with dynamic color
function RegionLegendDot({ color }: { color: string }) {
  const dotRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (dotRef.current) {
      dotRef.current.style.setProperty('--region-color', color);
    }
  }, [color]);
  
  return (
    <div 
      ref={dotRef}
      className="w-3 h-3 rounded-full region-legend-dot"
      data-region-color={color}
    />
  );
}

export function Dashboard() {
  const { user } = useAuth();
  const { resolvedTheme } = useTheme();
  const [cybridRate, setCybridRate] = useState<CybridRate | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch initial rate from Beeceptor/API
    fetchUSDtoUSDCRate().then(setCybridRate);

    // Real-time live updates: poll rate every 15 seconds
    const unsubscribe = subscribeToRateUpdates(setCybridRate);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Fetch transactions and audit logs
    const fetchData = async () => {
      try {
        setLoading(true);
        const [txnResponse, logsResponse] = await Promise.all([
          transactionsApi.getAll({ limit: 100 }),
          auditLogsApi.getAll({ limit: 100 }),
        ]);
        setTransactions(txnResponse.data || []);
        setAuditLogs(logsResponse.data || []);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate statistics
  const totalTransactions = transactions.length;
  const pendingCount = transactions.filter(t => t.status === 'Pending').length;
  const approvedCount = transactions.filter(t => t.status === 'Approved').length;

  const recentTransactions = transactions.slice(0, 5);
  const recentAuditLogs = auditLogs.slice(0, 5);

  // Region distribution for pie chart
  const regionData = [
    { name: 'US', value: transactions.filter(t => t.region === 'US').length, color: '#3b82f6' },
    { name: 'EU', value: transactions.filter(t => t.region === 'EU').length, color: '#8b5cf6' },
    { name: 'APAC', value: transactions.filter(t => t.region === 'APAC').length, color: '#10b981' },
    { name: 'LATAM', value: transactions.filter(t => t.region === 'LATAM').length, color: '#f59e0b' },
  ];

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-slate-600 dark:text-slate-400">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Role indicator pill */}
      {user && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {user.role === 'Global Admin' ? 'Global View' : `Region: ${user.region}`}
          </Badge>
        </div>
      )}

      {/* KPI Cards with glassmorphic design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="group">
          <GlassCard hover className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-500 dark:to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/25 dark:shadow-blue-500/40">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Transactions</p>
              <p className="text-3xl font-semibold text-slate-900 dark:text-white mt-1">{totalTransactions}</p>
              <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 mt-2">
                <ArrowUpRight className="h-3 w-3" />
                <span>Live data</span>
              </div>
            </div>
          </GlassCard>
        </div>

        <div className="group">
          <GlassCard hover className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 dark:from-orange-500 dark:to-orange-700 flex items-center justify-center shadow-lg shadow-orange-500/25 dark:shadow-orange-500/40">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Pending</p>
              <p className="text-3xl font-semibold text-slate-900 dark:text-white mt-1">{pendingCount}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Awaiting review</p>
            </div>
          </GlassCard>
        </div>

        <div className="group">
          <GlassCard hover className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 dark:from-green-500 dark:to-green-700 flex items-center justify-center shadow-lg shadow-green-500/25 dark:shadow-green-500/40">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Approved</p>
              <p className="text-3xl font-semibold text-slate-900 dark:text-white mt-1">{approvedCount}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Successfully processed</p>
            </div>
          </GlassCard>
        </div>

        <div className="group">
          <GlassCard hover className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-500 dark:to-purple-700 flex items-center justify-center shadow-lg shadow-purple-500/25 dark:shadow-purple-500/40">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">USD → USDC Rate</p>
              <p className="text-3xl font-semibold text-slate-900 dark:text-white mt-1">
                {cybridRate ? cybridRate.rate.toFixed(4) : '1.0000'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" title="Live" />
                Live · {cybridRate?.timestamp ? new Date(cybridRate.timestamp).toLocaleTimeString() : '—'}
              </p>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Transaction Overview
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={mockChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-700" />
              <XAxis dataKey="date" stroke="currentColor" className="text-slate-600 dark:text-slate-400" fontSize={12} />
              <YAxis stroke="currentColor" className="text-slate-600 dark:text-slate-400" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: resolvedTheme === 'dark' ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  border: resolvedTheme === 'dark' ? '1px solid rgb(51, 65, 85)' : '1px solid #e2e8f0',
                  borderRadius: '8px',
                  color: resolvedTheme === 'dark' ? '#e2e8f0' : '#1e293b'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="transactions" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', r: 5, strokeWidth: 2, stroke: '#fff' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Current Rate & Regions
          </h3>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={regionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {regionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {regionData.map((region) => (
              <div key={region.name} className="flex items-center gap-2">
                <RegionLegendDot color={region.color} />
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  {region.name}: {region.value}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-white">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentTransactions.length === 0 ? (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                No transactions found
              </div>
            ) : (
              recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-900 dark:text-white">{transaction.id}</span>
                      <Badge variant="outline" className="text-xs">{transaction.region}</Badge>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {transaction.user} · {transaction.date}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm font-medium text-slate-900 dark:text-white">${transaction.amountUSD.toLocaleString()}</div>
                    </div>
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
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Audit Events */}
      <Card>
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-white">Recent Audit Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentAuditLogs.length === 0 ? (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                No audit logs found
              </div>
            ) : (
              recentAuditLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-900 dark:text-white">{log.action}</span>
                      <Badge 
                        variant={log.status === 'Success' ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        {log.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {log.user} · {log.details}
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {log.timestamp}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
