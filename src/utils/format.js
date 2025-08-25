export const formatTime = (sec) => {
  if (isNaN(sec)) return "0:00";
  const minutes = Math.floor(sec / 60);
  const seconds = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
};

export const truncateName = (name) =>
  name.length > 25 ? name.slice(0, 25) + "..." : name;
