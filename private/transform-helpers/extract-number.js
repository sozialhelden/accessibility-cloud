function extractNumber(str) {
  const match = str.match(/-?\d+\.?\d*/);
  return match && Number(match[0]);
}
