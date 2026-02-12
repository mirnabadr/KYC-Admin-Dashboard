import { useState, useEffect } from 'react';
import { usersApi } from '../services/api';
import { Card, CardContent } from '../components/ui/card';
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
import { UserPlus, Edit, Mail, Calendar, MapPin, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { GlassCard } from '../components/GlassCard';
import { UserAvatar } from '../components/UserAvatar';
import { useAuth } from '../context/AuthContext';

const ITEMS_PER_PAGE = 5;

export function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [viewingUser, setViewingUser] = useState<any | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: ITEMS_PER_PAGE, total: 0, pages: 1 });

  useEffect(() => {
    if (currentUser?.role === 'Global Admin') {
      fetchUsers();
    }
  }, [currentPage, currentUser]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await usersApi.getAll({ page: currentPage, limit: ITEMS_PER_PAGE });
      setUsers(response.data || []);
      setPagination(response.pagination || { page: 1, limit: ITEMS_PER_PAGE, total: 0, pages: 1 });
    } catch (error: any) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
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
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
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

  const handleAddUser = async () => {
    try {
      await usersApi.create({
        email: formData.email,
        password: formData.password || 'TempPassword123!',
        name: formData.name || formData.email.split('@')[0],
        role: formData.role,
        region: formData.region,
      });
      toast.success('User added successfully');
      setIsAddDialogOpen(false);
      setFormData({ email: '', password: '', name: '', role: 'Sending Partner', region: 'US' });
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add user');
    }
  };

  const handleEditUser = async () => {
    if (!editingUser) return;
    
    try {
      await usersApi.update(editingUser.id, {
        role: formData.role,
        region: formData.region,
      });
      toast.success('User updated successfully');
      setEditingUser(null);
      setFormData({ email: '', password: '', name: '', role: 'Sending Partner', region: 'US' });
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user');
    }
  };

  const openEditDialog = (user: any) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      password: '',
      name: user.name || '',
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
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="User Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Temporary password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
          {loading ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              Loading users...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-slate-500 dark:text-slate-400">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow 
                        key={user.id}
                        className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        onClick={() => setViewingUser(user)}
                      >
                        <TableCell className="font-medium text-sm">{user.email}</TableCell>
                        <TableCell className="text-sm">{user.name || '—'}</TableCell>
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
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.pages > 1 && (
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
