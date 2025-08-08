import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';

export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  timestamp: Date;
  type: 'check-in' | 'check-out';
}

interface AttendanceLogProps {
  records: AttendanceRecord[];
}

export function AttendanceLog({ records }: AttendanceLogProps) {
  const sortedRecords = records.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }).format(date);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-medium">Attendance Log</h2>
          <Badge variant="outline">
            {records.length} Total Records
          </Badge>
        </div>

        <ScrollArea className="h-96">
          {sortedRecords.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <p>No attendance records yet</p>
              <p className="text-sm">Start the camera to begin logging attendance</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedRecords.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{record.userName}</span>
                      <Badge 
                        variant={record.type === 'check-in' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {record.type === 'check-in' ? 'Check In' : 'Check Out'}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {isToday(record.timestamp) ? 'Today' : formatDate(record.timestamp)} at {formatTime(record.timestamp)}
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    ID: {record.userId.slice(0, 8)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </Card>
  );
}