import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { AttendanceRecord, User } from './UserManagement';
import { Calendar, Clock, TrendingUp, Users, CalendarDays, BarChart3 } from 'lucide-react';

interface DashboardProps {
  users: User[];
  records: AttendanceRecord[];
}

export function Dashboard({ users, records }: DashboardProps) {
  const today = new Date();
  const todayRecords = records.filter(record => 
    record.timestamp.toDateString() === today.toDateString()
  );

  const uniqueUsersToday = new Set(todayRecords.map(record => record.userId)).size;
  const attendanceRate = users.length > 0 ? Math.round((uniqueUsersToday / users.length) * 100) : 0;

  const getRecentActivity = () => {
    return records
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 5);
  };

  const getDailyStats = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date;
    }).reverse();

    return last7Days.map(date => {
      const dayRecords = records.filter(record => 
        record.timestamp.toDateString() === date.toDateString()
      );
      const uniqueUsers = new Set(dayRecords.map(record => record.userId)).size;
      return {
        date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' }),
        count: uniqueUsers
      };
    });
  };

  const getMonthlyStats = () => {
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return date;
    }).reverse();

    return last6Months.map(date => {
      const monthRecords = records.filter(record => {
        const recordDate = record.timestamp;
        return recordDate.getMonth() === date.getMonth() && 
               recordDate.getFullYear() === date.getFullYear();
      });

      // Calculate average daily attendance for the month
      const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
      const dailyAttendance = Array.from({ length: daysInMonth }, (_, dayIndex) => {
        const day = new Date(date.getFullYear(), date.getMonth(), dayIndex + 1);
        const dayRecords = monthRecords.filter(record => 
          record.timestamp.toDateString() === day.toDateString()
        );
        return new Set(dayRecords.map(record => record.userId)).size;
      });

      const avgAttendance = dailyAttendance.reduce((sum, count) => sum + count, 0) / daysInMonth;
      const totalUniqueUsers = new Set(monthRecords.map(record => record.userId)).size;

      return {
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        avgAttendance: Math.round(avgAttendance * 10) / 10,
        totalUniqueUsers,
        totalRecords: monthRecords.length
      };
    });
  };

  const getAttendanceByDepartment = () => {
    const departments = new Map<string, { total: number; present: number }>();
    
    users.forEach(user => {
      const dept = user.department || 'No Department';
      if (!departments.has(dept)) {
        departments.set(dept, { total: 0, present: 0 });
      }
      const deptData = departments.get(dept)!;
      deptData.total++;
      
      // Check if user was present today
      const userPresentToday = todayRecords.some(record => record.userId === user.id);
      if (userPresentToday) {
        deptData.present++;
      }
    });

    return Array.from(departments.entries()).map(([dept, data]) => ({
      department: dept,
      total: data.total,
      present: data.present,
      rate: data.total > 0 ? Math.round((data.present / data.total) * 100) : 0
    }));
  };

  const recentActivity = getRecentActivity();
  const dailyStats = getDailyStats();
  const monthlyStats = getMonthlyStats();
  const departmentStats = getAttendanceByDepartment();
  const maxDailyCount = Math.max(...dailyStats.map(stat => stat.count), 1);
  const maxMonthlyAvg = Math.max(...monthlyStats.map(stat => stat.avgAttendance), 1);

  // Calculate additional metrics
  const thisMonthRecords = records.filter(record => {
    const now = new Date();
    return record.timestamp.getMonth() === now.getMonth() && 
           record.timestamp.getFullYear() === now.getFullYear();
  });
  const thisMonthUniqueUsers = new Set(thisMonthRecords.map(record => record.userId)).size;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total Employees</p>
              <p className="text-2xl font-medium">{users.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Present Today</p>
              <p className="text-2xl font-medium">{uniqueUsersToday}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            <div>
              <p className="text-sm text-muted-foreground">Attendance Rate</p>
              <p className="text-2xl font-medium">{attendanceRate}%</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <CalendarDays className="w-5 h-5 text-purple-500" />
            <div>
              <p className="text-sm text-muted-foreground">This Month Active</p>
              <p className="text-2xl font-medium">{thisMonthUniqueUsers}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 6-Month Attendance Trends */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5" />
            <h3 className="font-medium">6-Month Attendance Trends</h3>
          </div>
          <div className="space-y-3">
            {monthlyStats.map((stat) => (
              <div key={stat.month} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{stat.month}</span>
                  <div className="text-right">
                    <div>{stat.avgAttendance} avg daily</div>
                    <div className="text-xs text-muted-foreground">
                      {stat.totalUniqueUsers} employees, {stat.totalRecords} records
                    </div>
                  </div>
                </div>
                <Progress 
                  value={(stat.avgAttendance / maxMonthlyAvg) * 100} 
                  className="h-2"
                />
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-6">
          <h3 className="font-medium mb-4">Recent Activity</h3>
          {recentActivity.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No recent activity</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((record) => (
                <div key={record.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <div>
                      <p className="font-medium text-sm">{record.userName}</p>
                      <p className="text-xs text-muted-foreground">
                        {record.timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at{' '}
                        {record.timestamp.toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <Badge variant={record.type === 'check-in' ? 'default' : 'secondary'} className="text-xs">
                    {record.type === 'check-in' ? 'In' : 'Out'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* 7-Day Quick View */}
        <Card className="p-6">
          <h3 className="font-medium mb-4">7-Day Quick View</h3>
          <div className="space-y-3">
            {dailyStats.map((stat) => (
              <div key={stat.date} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{stat.date}</span>
                  <span>{stat.count} employees</span>
                </div>
                <Progress 
                  value={(stat.count / maxDailyCount) * 100} 
                  className="h-2"
                />
              </div>
            ))}
          </div>
        </Card>

        {/* Department Breakdown */}
        <Card className="p-6">
          <h3 className="font-medium mb-4">Today's Department Breakdown</h3>
          {departmentStats.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No department data</p>
            </div>
          ) : (
            <div className="space-y-3">
              {departmentStats.map((dept) => (
                <div key={dept.department} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{dept.department}</span>
                    <span>{dept.present}/{dept.total} ({dept.rate}%)</span>
                  </div>
                  <Progress 
                    value={dept.rate} 
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}