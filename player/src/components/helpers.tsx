export function getProgressByEvent(evt: React.MouseEvent<HTMLElement> | MouseEvent, element?: HTMLElement) {
    const progressRect = (element || evt.currentTarget as HTMLElement).getBoundingClientRect();
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
