import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Plus, Trash2, Users, Edit2, Save, X, Calendar } from 'lucide-react';

export interface User {
  id: string;
  name: string;
  email?: string;
  department?: string;
  joinDate: Date;
}

interface UserManagementProps {
  users: User[];
  onAddUser: (user: Omit<User, 'id' | 'joinDate'>) => void;
  onEditUser: (userId: string, user: Omit<User, 'id' | 'joinDate'>) => void;
  onRemoveUser: (userId: string) => void;
}

export function UserManagement({ users, onAddUser, onEditUser, onRemoveUser }: UserManagementProps) {
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    department: ''
  });
  const [editUser, setEditUser] = useState({
    name: '',
    email: '',
    department: ''
  });

  const handleAddUser = () => {
    if (newUser.name.trim()) {
      onAddUser({
        name: newUser.name.trim(),
        email: newUser.email.trim() || undefined,
        department: newUser.department.trim() || undefined
      });
      setNewUser({ name: '', email: '', department: '' });
      setIsAddingUser(false);
    }
  };

  const handleCancelAdd = () => {
    setNewUser({ name: '', email: '', department: '' });
    setIsAddingUser(false);
  };

  const handleStartEdit = (user: User) => {
    setEditingUserId(user.id);
    setEditUser({
      name: user.name,
      email: user.email || '',
      department: user.department || ''
    });
  };

  const handleSaveEdit = () => {
    if (editingUserId && editUser.name.trim()) {
      onEditUser(editingUserId, {
        name: editUser.name.trim(),
        email: editUser.email.trim() || undefined,
        department: editUser.department.trim() || undefined
      });
      setEditingUserId(null);
      setEditUser({ name: '', email: '', department: '' });
    }
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setEditUser({ name: '', email: '', department: '' });
  };

  const handleDeleteUser = (userId: string) => {
    onRemoveUser(userId);
    setDeleteUserId(null);
  };

  const getDepartmentColor = (department?: string) => {
    if (!department) return 'secondary';
    
    const colors = {
      'Engineering': 'default',
      'Marketing': 'destructive',
      'Sales': 'outline',
      'HR': 'secondary'
    };
    
    return colors[department as keyof typeof colors] || 'secondary';
  };

  const userToDelete = users.find(u => u.id === deleteUserId);

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            <h2 className="text-xl font-medium">Employee Management</h2>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {users.length} Employees
            </Badge>
            <Button 
              onClick={() => setIsAddingUser(true)} 
              disabled={isAddingUser || editingUserId !== null}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Employee
            </Button>
          </div>
        </div>

        {isAddingUser && (
          <Card className="p-4 bg-muted/50 border-dashed">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                <h3 className="font-medium">Add New Employee</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="add-name">Name *</Label>
                  <Input
                    id="add-name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    placeholder="Enter full name"
                    className="bg-background"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="add-email">Email</Label>
                  <Input
                    id="add-email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="Enter email address"
                    className="bg-background"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="add-department">Department</Label>
                  <Input
                    id="add-department"
                    value={newUser.department}
                    onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                    placeholder="Enter department"
                    className="bg-background"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddUser} disabled={!newUser.name.trim()}>
                  <Save className="w-4 h-4 mr-2" />
                  Add Employee
                </Button>
                <Button variant="outline" onClick={handleCancelAdd}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        <ScrollArea className="h-96">
          {users.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No employees added yet</p>
              <p className="text-sm">Add employees to start tracking attendance</p>
            </div>
          ) : (
            <div className="space-y-2">
              {users.map((user) => (
                <div key={user.id}>
                  {editingUserId === user.id ? (
                    // Edit Mode
                    <Card className="p-4 border-primary/20 bg-primary/5">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Edit2 className="w-4 h-4 text-primary" />
                          <h4 className="font-medium text-primary">Editing Employee</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <Label htmlFor={`edit-name-${user.id}`}>Name *</Label>
                            <Input
                              id={`edit-name-${user.id}`}
                              value={editUser.name}
                              onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                              placeholder="Enter full name"
                              className="bg-background"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor={`edit-email-${user.id}`}>Email</Label>
                            <Input
                              id={`edit-email-${user.id}`}
                              type="email"
                              value={editUser.email}
                              onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                              placeholder="Enter email address"
                              className="bg-background"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor={`edit-department-${user.id}`}>Department</Label>
                            <Input
                              id={`edit-department-${user.id}`}
                              value={editUser.department}
                              onChange={(e) => setEditUser({ ...editUser, department: e.target.value })}
                              placeholder="Enter department"
                              className="bg-background"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            onClick={handleSaveEdit} 
                            disabled={!editUser.name.trim()}
                            size="sm"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={handleCancelEdit}
                            size="sm"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ) : (
                    // View Mode
                    <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{user.name}</span>
                          {user.department && (
                            <Badge variant={getDepartmentColor(user.department)} className="text-xs">
                              {user.department}
                            </Badge>
                          )}
                        </div>
                        {user.email && (
                          <div className="text-sm text-muted-foreground">
                            {user.email}
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          Joined {user.joinDate.toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStartEdit(user)}
                          disabled={isAddingUser || editingUserId !== null}
                          className="h-8 w-8 p-0"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteUserId(user.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          disabled={isAddingUser || editingUserId !== null}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="text-sm text-muted-foreground space-y-1 pt-2 border-t">
          <div className="flex items-center gap-4 flex-wrap">
            <span>• Click <Edit2 className="w-3 h-3 inline mx-1" /> to edit employee information</span>
            <span>• Changes to names will update all attendance records</span>
            <span>• Use <Trash2 className="w-3 h-3 inline mx-1 text-destructive" /> to permanently delete employees</span>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteUserId !== null} onOpenChange={(open) => !open && setDeleteUserId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Employee</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-medium">{userToDelete?.name}</span>? 
              This will also remove all their attendance records. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteUserId(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={() => deleteUserId && handleDeleteUser(deleteUserId)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Employee
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}