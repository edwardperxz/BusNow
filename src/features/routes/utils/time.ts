export const getNextTimes = (currentTime: string): string => {
  const [time, period] = currentTime.split(' ');
  const [hours, minutes] = time.split(':').map(Number);

  const nextTimes = [];
  for (let i = 1; i <= 2; i++) {
    const nextHour = hours + i;
    const nextPeriod = nextHour >= 12 ? 'PM' : 'AM';
    const displayHour = nextHour > 12 ? nextHour - 12 : nextHour;
    nextTimes.push(`${displayHour}:${minutes.toString().padStart(2, '0')} ${nextPeriod}`);
  }

  return nextTimes.join(', ');
};

export const getTimeStatus = (stopTime: string, now: Date) => {
  const [time, period] = stopTime.split(' ');
  const [hours, minutes] = time.split(':').map(Number);
  const adjustedHours = period === 'PM' && hours !== 12 ? hours + 12 : hours;

  const stopDate = new Date();
  stopDate.setHours(adjustedHours, minutes, 0, 0);

  const diffMs = stopDate.getTime() - now.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));

  if (diffMins < 0) return { status: 'passed', text: 'Pasó' };
  if (diffMins <= 5) return { status: 'arriving', text: `${diffMins} min` };
  if (diffMins <= 15) return { status: 'soon', text: `${diffMins} min` };
  return { status: 'scheduled', text: stopTime };
};
