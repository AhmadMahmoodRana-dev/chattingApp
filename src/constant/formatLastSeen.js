function formatLastSeen(isoString) {
  const date = new Date(isoString);
  const now = new Date();

  const options = { hour: '2-digit', minute: '2-digit', hour12: true };
  const time = date.toLocaleTimeString([], options);

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const isYesterday =
    date.getDate() === now.getDate() - 1 &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    return `Today at ${time}`;
  } else if (isYesterday) {
    return `Yesterday at ${time}`;
  } else {
    const day = date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    return `${day} at ${time}`;
  }
}


export default formatLastSeen;