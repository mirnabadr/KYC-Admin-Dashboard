import { Region } from '../context/AuthContext';

export type TransactionStatus = 'Pending' | 'Approved' | 'Rejected';
export type AuditAction = 'Login' | 'Create Transaction' | 'Approve Transaction' | 'Reject Transaction' | 'Update Role' | 'Add User';
export type AuditStatus = 'Success' | 'Failure';

export interface Transaction {
  id: string;
  date: string;
  user: string;
  region: Region;
  amountUSD: number;
  amountUSDC: number;
  status: TransactionStatus;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: AuditAction;
  status: AuditStatus;
  details: string;
}

export interface UserData {
  id: string;
  email: string;
  role: string;
  region: Region;
  createdAt: string;
}

// Mock transaction data
export const mockTransactions: Transaction[] = [
  { id: 'TXN-001', date: '2026-02-10 14:23', user: 'john.doe@example.com', region: 'US', amountUSD: 5000, amountUSDC: 5000, status: 'Approved' },
  { id: 'TXN-002', date: '2026-02-10 13:45', user: 'maria.garcia@example.com', region: 'LATAM', amountUSD: 12500, amountUSDC: 12500, status: 'Pending' },
  { id: 'TXN-003', date: '2026-02-10 12:18', user: 'hans.mueller@example.com', region: 'EU', amountUSD: 7800, amountUSDC: 7800, status: 'Approved' },
  { id: 'TXN-004', date: '2026-02-10 11:02', user: 'yuki.tanaka@example.com', region: 'APAC', amountUSD: 3200, amountUSDC: 3200, status: 'Rejected' },
  { id: 'TXN-005', date: '2026-02-10 10:30', user: 'emma.wilson@example.com', region: 'US', amountUSD: 9500, amountUSDC: 9500, status: 'Pending' },
  { id: 'TXN-006', date: '2026-02-09 16:45', user: 'pierre.dubois@example.com', region: 'EU', amountUSD: 15000, amountUSDC: 15000, status: 'Approved' },
  { id: 'TXN-007', date: '2026-02-09 15:22', user: 'carlos.silva@example.com', region: 'LATAM', amountUSD: 4300, amountUSDC: 4300, status: 'Approved' },
  { id: 'TXN-008', date: '2026-02-09 14:10', user: 'lisa.anderson@example.com', region: 'US', amountUSD: 8900, amountUSDC: 8900, status: 'Pending' },
  { id: 'TXN-009', date: '2026-02-09 13:05', user: 'wei.zhang@example.com', region: 'APAC', amountUSD: 6700, amountUSDC: 6700, status: 'Approved' },
  { id: 'TXN-010', date: '2026-02-09 11:30', user: 'sofia.rossi@example.com', region: 'EU', amountUSD: 11200, amountUSDC: 11200, status: 'Rejected' },
  { id: 'TXN-011', date: '2026-02-08 16:20', user: 'james.brown@example.com', region: 'US', amountUSD: 5600, amountUSDC: 5600, status: 'Approved' },
  { id: 'TXN-012', date: '2026-02-08 15:15', user: 'ana.martinez@example.com', region: 'LATAM', amountUSD: 8200, amountUSDC: 8200, status: 'Approved' },
];

// Mock audit logs
export const mockAuditLogs: AuditLog[] = [
  { id: 'AUD-001', timestamp: '2026-02-10 14:25', user: 'admin@kyc.com', action: 'Approve Transaction', status: 'Success', details: 'Approved TXN-001' },
  { id: 'AUD-002', timestamp: '2026-02-10 14:20', user: 'admin@kyc.com', action: 'Login', status: 'Success', details: 'Logged in from 192.168.1.1' },
  { id: 'AUD-003', timestamp: '2026-02-10 13:50', user: 'eu-admin@kyc.com', action: 'Approve Transaction', status: 'Success', details: 'Approved TXN-003' },
  { id: 'AUD-004', timestamp: '2026-02-10 12:30', user: 'partner@kyc.com', action: 'Create Transaction', status: 'Success', details: 'Created TXN-002' },
  { id: 'AUD-005', timestamp: '2026-02-10 11:15', user: 'admin@kyc.com', action: 'Reject Transaction', status: 'Success', details: 'Rejected TXN-004' },
  { id: 'AUD-006', timestamp: '2026-02-10 10:45', user: 'eu-admin@kyc.com', action: 'Login', status: 'Success', details: 'Logged in from 10.0.0.5' },
  { id: 'AUD-007', timestamp: '2026-02-09 17:00', user: 'admin@kyc.com', action: 'Add User', status: 'Success', details: 'Added user partner@kyc.com' },
  { id: 'AUD-008', timestamp: '2026-02-09 16:50', user: 'admin@kyc.com', action: 'Approve Transaction', status: 'Success', details: 'Approved TXN-006' },
  { id: 'AUD-009', timestamp: '2026-02-09 15:30', user: 'partner@kyc.com', action: 'Create Transaction', status: 'Success', details: 'Created TXN-007' },
  { id: 'AUD-010', timestamp: '2026-02-09 14:20', user: 'eu-admin@kyc.com', action: 'Reject Transaction', status: 'Success', details: 'Rejected TXN-010' },
];

// Mock users data
export const mockUsers: UserData[] = [
  { id: 'USR-001', email: 'admin@kyc.com', role: 'Global Admin', region: 'All Regions', createdAt: '2025-01-15' },
  { id: 'USR-002', email: 'eu-admin@kyc.com', role: 'Regional Admin', region: 'EU', createdAt: '2025-02-20' },
  { id: 'USR-003', email: 'partner@kyc.com', role: 'Sending Partner', region: 'US', createdAt: '2025-03-10' },
  { id: 'USR-004', email: 'apac-admin@kyc.com', role: 'Regional Admin', region: 'APAC', createdAt: '2025-04-05' },
  { id: 'USR-005', email: 'latam-partner@kyc.com', role: 'Receiving Partner', region: 'LATAM', createdAt: '2025-05-12' },
];

// Mock chart data for dashboard
export const mockChartData = [
  { date: 'Feb 4', transactions: 12 },
  { date: 'Feb 5', transactions: 19 },
  { date: 'Feb 6', transactions: 15 },
  { date: 'Feb 7', transactions: 22 },
  { date: 'Feb 8', transactions: 18 },
  { date: 'Feb 9', transactions: 25 },
  { date: 'Feb 10', transactions: 20 },
];

// Mock Cybrid API rate
export const mockUSDtoUSDCRate = 1.0;
