
// -------------------------------------------------------------------------------------------------
// getDateLabel

function getDateLabel(date: Date | number): string {
  if (typeof date === 'number') {
    date = new Date(date);
  }

  return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}. ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

export {
  getDateLabel,
};
