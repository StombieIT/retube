export function getProgressByEvent(evt: React.MouseEvent<HTMLDivElement>) {
    const progressRect = evt.currentTarget.getBoundingClientRect();
    const progressLeft = progressRect.left;
    const progressWidth = progressRect.width;
    const progressInPx = evt.clientX - progressLeft;
    return progressInPx * 100 / progressWidth || 0;
}

export function secondsToTime(totalSeconds: number) {
    const totalSecondsSafe = totalSeconds || 0;
    const minutes = Math.floor(totalSecondsSafe / 60);
    const seconds = Math.floor(totalSecondsSafe) % 60;
    const minutesTime = minutes.toString().padStart(2, '0');
    const secondsTime = seconds.toString().padStart(2, '0');
    return `${minutesTime}:${secondsTime}`;
  }
