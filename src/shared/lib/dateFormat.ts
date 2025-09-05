export function formatTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false, // ✅ 24시간제, 오전/오후 제거
    });
  } catch {
    return isoString;
  }
}
