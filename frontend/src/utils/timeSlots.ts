export const generateTimeSlots = (): string[] => {
  return Array.from({ length: 28 }, (_, i) => {
    const hour = Math.floor(i / 2) + 7;
    const minutes = i % 2 ? '30' : '00';
    return `${hour.toString().padStart(2, '0')}:${minutes}`;
  });
};