/**
 * Format a date to a readable string
 * 
 * @param date Date object to format
 * @returns Formatted date string
 */
export function formatDate(date: Date): string {
  if (!date || isNaN(date.getTime())) {
    return 'Không rõ thời gian';
  }
  
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const diffDays = Math.floor(diff / (1000 * 3600 * 24));
  
  // If today
  if (diffDays === 0) {
    return formatTime(date);
  }
  
  // If yesterday
  if (diffDays === 1) {
    return `Hôm qua, ${formatTime(date)}`;
  }
  
  // If in the last 7 days
  if (diffDays < 7) {
    const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    return `${days[date.getDay()]}, ${formatTime(date)}`;
  }
  
  // Otherwise, show the full date
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}, ${formatTime(date)}`;
}

/**
 * Format time portion of date
 */
function formatTime(date: Date): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
} 