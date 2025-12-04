export const formatTime = (timestamp: number): { date: string; time: string; relative: string } => {
  const date = new Date(timestamp);
  const now = Date.now();
  const diff = now - timestamp;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  let relative = '';
  if (days > 0) relative = `${days}d ago`;
  else if (hours > 0) relative = `${hours}h ago`;
  else if (minutes > 0) relative = `${minutes}m ago`;
  else relative = `${seconds}s ago`;
  
  return {
    date: date.toLocaleDateString(),
    time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    relative,
  };
};

export const processAuditData = (auditData: any): any[] => {
  if (!auditData || typeof auditData !== 'object') {
    return [];
  }

  return Object.entries(auditData)
    .map(([timestamp, audit]: [string, any]) => {
      const timestampMs = parseInt(timestamp, 10);
      const timeFormatted = formatTime(timestampMs);
      
      return {
        timestamp,
        timestampMs,
        action: audit.action,
        config: audit.config,
        formattedDate: `${timeFormatted.date} ${timeFormatted.time}`,
        relativeTime: timeFormatted.relative,
      };
    })
    .sort((a, b) => b.timestampMs - a.timestampMs);
};