import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { CameraView } from './components/CameraView';
import { AttendanceLog, AttendanceRecord } from './components/AttendanceLog';
import { UserManagement, User } from './components/UserManagement';
import { Dashboard } from './components/Dashboard';
import { ManualAttendance } from './components/ManualAttendance';
import { Camera, Users, BarChart3, History, Edit } from 'lucide-react';

export default function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

  // Initialize with some sample users and generate 6 months of sample data
  useEffect(() => {
    const sampleUsers: User[] = [
      {
        id: '1',
        name: 'Fresher Lonappan',
        email: 'fresher@gmail.com',
        department: 'cse-ai',
        joinDate: new Date('2024-01-15')
      },
      {
        id: '2',
        name: 'sanjay kr',
        email: 'sanjaykr@gmail.com',
        department: 'cse-ai',
        joinDate: new Date('2024-03-01')
      },
      {
        id: '3',
        name:'ashwathi',
        email: 'ashwathi@gmail.com',
        department: 'cse department',
        joinDate: new Date('2024-01-20')
      },
      {
        id: '4',
        name: 'Hitha',
        email: 'hithateach@gmail.com',
        department: 'cse department',
        joinDate: new Date('2024-03-10')
      },
      {
        id: '5',
        name: 'Navaneeth kp',
        email: 'navaneethnigga@gmail.com',
        department: 'cse-ai',
        joinDate: new Date('2024-02-15')
      }
    ];
    setUsers(sampleUsers);

    // Generate 6 months of sample attendance data
    const generateSampleAttendance = () => {
      const records: AttendanceRecord[] = [];
      const today = new Date();
      
      // Go back 6 months
      for (let monthOffset = 0; monthOffset < 6; monthOffset++) {
        const currentMonth = new Date(today);
        currentMonth.setMonth(today.getMonth() - monthOffset);
        
        const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
        
        for (let day = 1; day <= daysInMonth; day++) {
          const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
          
          // Skip weekends for more realistic data
          if (date.getDay() === 0 || date.getDay() === 6) continue;
          
          // Don't generate future dates
          if (date > today) continue;
          
          // Simulate attendance for each user (80% chance they attend)
          sampleUsers.forEach(user => {
            if (Math.random() > 0.2) { // 80% attendance rate
              // Check-in time between 8:00 AM and 10:00 AM
              const checkInHour = 8 + Math.floor(Math.random() * 2);
              const checkInMinute = Math.floor(Math.random() * 60);
              const checkInTime = new Date(date);
              checkInTime.setHours(checkInHour, checkInMinute, 0, 0);
              
              records.push({
                id: `${user.id}-${date.toDateString()}-in`,
                userId: user.id,
                userName: user.name,
                timestamp: checkInTime,
                type: 'check-in'
              });
              
              // Check-out time between 5:00 PM and 7:00 PM (90% chance)
              if (Math.random() > 0.1) {
                const checkOutHour = 17 + Math.floor(Math.random() * 2);
                const checkOutMinute = Math.floor(Math.random() * 60);
                const checkOutTime = new Date(date);
                checkOutTime.setHours(checkOutHour, checkOutMinute, 0, 0);
                
                records.push({
                  id: `${user.id}-${date.toDateString()}-out`,
                  userId: user.id,
                  userName: user.name,
                  timestamp: checkOutTime,
                  type: 'check-out'
                });
              }
            }
          });
        }
      }
      
      return records;
    };

    setAttendanceRecords(generateSampleAttendance());
  }, []);

  const handleAddUser = (userData: Omit<User, 'id' | 'joinDate'>) => {
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      joinDate: new Date()
    };
    setUsers(prev => [...prev, newUser]);
  };

  const handleEditUser = (userId: string, userData: Omit<User, 'id' | 'joinDate'>) => {
    const oldUser = users.find(user => user.id === userId);
    if (!oldUser) return;

    // Update user information
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, ...userData }
        : user
    ));

    // Update attendance records if name changed
    if (oldUser.name !== userData.name) {
      setAttendanceRecords(prev => prev.map(record => 
        record.userId === userId 
          ? { ...record, userName: userData.name }
          : record
      ));
    }
  };

  const handleRemoveUser = (userId: string) => {
    setUsers(prev => prev.filter(user => user.id !== userId));
    // Also remove attendance records for this user
    setAttendanceRecords(prev => prev.filter(record => record.userId !== userId));
  };

  const handleAttendanceLogged = (
    userId: string, 
    userName: string, 
    timestamp?: Date, 
    type?: 'check-in' | 'check-out'
  ) => {
    const recordTimestamp = timestamp || new Date();
    
    // If type is not specified, determine it based on existing records for the day
    let recordType = type;
    if (!recordType) {
      const dayRecords = attendanceRecords.filter(record => 
        record.userId === userId && 
        record.timestamp.toDateString() === recordTimestamp.toDateString()
      );
      
      // If user has records today, alternate between check-in and check-out
      if (dayRecords.length > 0) {
        const lastRecord = dayRecords[dayRecords.length - 1];
        recordType = lastRecord.type === 'check-in' ? 'check-out' : 'check-in';
      } else {
        recordType = 'check-in';
      }
    }

    const newRecord: AttendanceRecord = {
      id: `${userId}-${recordTimestamp.getTime()}-${recordType}`,
      userId,
      userName,
      timestamp: recordTimestamp,
      type: recordType
    };

    setAttendanceRecords(prev => [...prev, newRecord]);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Face Detection Attendance System</h1>
          <p className="text-muted-foreground">
            Real-time face detection and automated attendance tracking with 6-month analytics
          </p>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="camera" className="flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Live Camera
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <Edit className="w-4 h-4" />
              Manual Entry
            </TabsTrigger>
            <TabsTrigger value="attendance" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              Attendance Log
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Employees
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Dashboard users={users} records={attendanceRecords} />
          </TabsContent>

          <TabsContent value="camera">
            <CameraView 
              onAttendanceLogged={handleAttendanceLogged}
              users={users}
            />
          </TabsContent>

          <TabsContent value="manual">
            <ManualAttendance 
              users={users}
              onAttendanceLogged={handleAttendanceLogged}
            />
          </TabsContent>

          <TabsContent value="attendance">
            <AttendanceLog records={attendanceRecords} />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement 
              users={users}
              onAddUser={handleAddUser}
              onEditUser={handleEditUser}
              onRemoveUser={handleRemoveUser}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}