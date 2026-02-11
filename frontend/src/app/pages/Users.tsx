import React from 'react';
import { useState } from 'react';
import { mockUsers, UserData } from '../data/mockData';
import { UserRole, Region } from '../context/AuthContext'; 
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
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
import { UserPlus, Edit, User as UserIcon, Mail, Calendar, MapPin, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { GlassCard } from '../components/GlassCard';
import { UserAvatar } from '../components/UserAvatar';
import { useAuth } from '../context/AuthContext';

const ITEMS_PER_PAGE = 5;

export function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState(mockUsers);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [viewingUser, setViewingUser] = useState<UserData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(users.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedUsers = users.slice(startIndex, endIndex);

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const [formData, setFormData] = useState({
    email: '',
    role: 'Sending Partner' as string,
    region: 'US' as string,
  });

  // Only Global Admins should access this page
  if (currentUser?.role !== 'Global Admin') {
    return (
      <div className="p-6">
        <GlassCard className="p-12 text-center">
          <p className="text-slate-600 dark:text-slate-400">You do not have permission to access this page.</p>
        </GlassCard>
      </div>
    );
  }

  const handleAddUser = () => {
    const newUser: UserData = {
      id: `USR-${String(users.length + 1).padStart(3, '0')}`,
      email: formData.email,
      role: formData.role,
      region: formData.region as Region,
      createdAt: new Date().toISOString().split('T')[0],
    };
    
    setUsers([...users, newUser]);
    setIsAddDialogOpen(false);
    setFormData({ email: '', role: 'Sending Partner', region: 'US' });
    toast.success('User added successfully');
  };

  const handleEditUser = () => {
    if (!editingUser) return;
    
    setUsers(users.map(u => 
      u.id === editingUser.id 
        ? { ...u, role: formData.role, region: formData.region as Region }
        : u
    ));
    
    setEditingUser(null);
    setFormData({ email: '', role: 'Sending Partner', region: 'US' });
    toast.success('User updated successfully');
  };

  const openEditDialog = (user: UserData) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      role: user.role,
      region: user.region,
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Users</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Manage user accounts and permissions</p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new user account with role and region assignment
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Global Admin">Global Admin</SelectItem>
                    <SelectItem value="Regional Admin">Regional Admin</SelectItem>
                    <SelectItem value="Sending Partner">Sending Partner</SelectItem>
                    <SelectItem value="Receiving Partner">Receiving Partner</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="region">Region</Label>
                <Select value={formData.region} onValueChange={(value) => setFormData({ ...formData, region: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Regions">All Regions</SelectItem>
                    <SelectItem value="US">US</SelectItem>
                    <SelectItem value="EU">EU</SelectItem>
                    <SelectItem value="APAC">APAC</SelectItem>
                    <SelectItem value="LATAM">LATAM</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded">
                Note: A temporary password will be sent to the user's email
              </div>

              <Button onClick={handleAddUser} className="w-full">
                Create User
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow 
                    key={user.id}
                    className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    onClick={() => setViewingUser(user)}
                  >
                    <TableCell className="font-medium text-sm">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{user.region}</TableCell>
                    <TableCell className="text-sm text-slate-600 dark:text-slate-400">{user.createdAt}</TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => openEditDialog(user)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Dialog open={editingUser?.id === user.id} onOpenChange={(open) => !open && setEditingUser(null)}>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit User</DialogTitle>
                            <DialogDescription>
                              Update user role and region assignment
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label>Email</Label>
                              <Input value={formData.email} disabled />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="edit-role">Role</Label>
                              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Global Admin">Global Admin</SelectItem>
                                  <SelectItem value="Regional Admin">Regional Admin</SelectItem>
                                  <SelectItem value="Sending Partner">Sending Partner</SelectItem>
                                  <SelectItem value="Receiving Partner">Receiving Partner</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="edit-region">Region</Label>
                              <Select value={formData.region} onValueChange={(value) => setFormData({ ...formData, region: value })}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="All Regions">All Regions</SelectItem>
                                  <SelectItem value="US">US</SelectItem>
                                  <SelectItem value="EU">EU</SelectItem>
                                  <SelectItem value="APAC">APAC</SelectItem>
                                  <SelectItem value="LATAM">LATAM</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <Button onClick={handleEditUser} className="w-full">
                              Update User
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-end">
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
                  Page {currentPage} of {totalPages}
                </span>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNext();
                  }}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* User Details Dialog */}
      <Dialog open={!!viewingUser} onOpenChange={(open) => !open && setViewingUser(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <UserAvatar name={viewingUser?.email || ''} size="md" />
              <span>User Overview</span>
            </DialogTitle>
            <DialogDescription>
              Detailed information about the user account
            </DialogDescription>
          </DialogHeader>
          {viewingUser && (
            <div className="space-y-6 py-4">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-slate-500 dark:text-slate-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Email</p>
                    <p className="text-base text-slate-900 dark:text-white">{viewingUser.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-slate-500 dark:text-slate-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Role</p>
                    <Badge variant="outline" className="mt-1">
                      {viewingUser.role}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-slate-500 dark:text-slate-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Region</p>
                    <p className="text-base text-slate-900 dark:text-white">{viewingUser.region}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-slate-500 dark:text-slate-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Created At</p>
                    <p className="text-base text-slate-900 dark:text-white">{viewingUser.createdAt}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Currently Signed In</p>
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <UserAvatar name={currentUser?.name || ''} size="sm" />
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{currentUser?.name || 'Not signed in'}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{currentUser?.email || ''}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}