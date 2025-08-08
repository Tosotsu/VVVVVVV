import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar as CalendarIcon, Clock, User, CheckCircle } from 'lucide-react';
import { User as UserType } from './UserManagement';

interface ManualAttendanceProps {
  users: UserType[];
  onAttendanceLogged: (userId: string, userName: string, timestamp?: Date, type?: 'check-in' | 'check-out') => void;
}

export function ManualAttendance({ users, onAttendanceLogged }: ManualAttendanceProps) {
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedType, setSelectedType] = useState<'check-in' | 'check-out'>('check-in');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>(
    new Date().toTimeString().slice(0, 5)
  );
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleSubmit = () => {
    if (!selectedUser) return;

    const user = users.find(u => u.id === selectedUser);
    if (!user) return;

    // Combine date and time
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const timestamp = new Date(selectedDate);
    timestamp.setHours(hours, minutes, 0, 0);

    onAttendanceLogged(user.id, user.name, timestamp, selectedType);

    // Reset form
    setSelectedUser('');
    setSelectedType('check-in');
    setSelectedDate(new Date());
    setSelectedTime(new Date().toTimeString().slice(0, 5));
  };

  const selectedUserData = users.find(u => u.id === selectedUser);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5" />
            <h2 className="text-xl font-medium">Manual Attendance Entry</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* User Selection */}
            <div className="space-y-2">
              <Label htmlFor="user-select">Select Employee</Label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger id="user-select">
                  <SelectValue placeholder="Choose an employee" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center gap-2">
                        <span>{user.name}</span>
                        {user.department && (
                          <Badge variant="secondary" className="text-xs">
                            {user.department}
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Attendance Type */}
            <div className="space-y-2">
              <Label htmlFor="type-select">Attendance Type</Label>
              <Select value={selectedType} onValueChange={(value: 'check-in' | 'check-out') => setSelectedType(value)}>
                <SelectTrigger id="type-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="check-in">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Check In
                    </div>
                  </SelectItem>
                  <SelectItem value="check-out">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-orange-500" />
                      Check Out
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Selection */}
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formatDate(selectedDate)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      if (date) {
                        setSelectedDate(date);
                        setIsCalendarOpen(false);
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Time Selection */}
            <div className="space-y-2">
              <Label htmlFor="time-input">Time</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id="time-input"
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Selected User Info */}
          {selectedUserData && (
            <Card className="p-4 bg-muted/50">
              <div className="space-y-2">
                <h3 className="font-medium">Selected Employee</h3>
                <div className="flex items-center gap-4 text-sm">
                  <span><span className="font-medium">Name:</span> {selectedUserData.name}</span>
                  {selectedUserData.email && (
                    <span><span className="font-medium">Email:</span> {selectedUserData.email}</span>
                  )}
                  {selectedUserData.department && (
                    <span><span className="font-medium">Department:</span> {selectedUserData.department}</span>
                  )}
                </div>
              </div>
            </Card>
          )}

          <div className="flex gap-2">
            <Button 
              onClick={handleSubmit} 
              disabled={!selectedUser}
              className="flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Log Attendance
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setSelectedUser('');
                setSelectedType('check-in');
                setSelectedDate(new Date());
                setSelectedTime(new Date().toTimeString().slice(0, 5));
              }}
            >
              Clear Form
            </Button>
          </div>

          <div className="text-sm text-muted-foreground space-y-1">
            <p>• Use this form to manually log attendance when camera detection is not available</p>
            <p>• You can backdate attendance entries by selecting a different date</p>
            <p>• All manual entries will be recorded with the specified timestamp</p>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="font-medium">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setSelectedType('check-in');
                setSelectedDate(new Date());
                setSelectedTime(new Date().toTimeString().slice(0, 5));
              }}
              className="justify-start"
            >
              <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
              Quick Check-In (Now)
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setSelectedType('check-out');
                setSelectedDate(new Date());
                setSelectedTime(new Date().toTimeString().slice(0, 5));
              }}
              className="justify-start"
            >
              <CheckCircle className="w-4 h-4 mr-2 text-orange-500" />
              Quick Check-Out (Now)
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}