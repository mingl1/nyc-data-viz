export function precinctToIndex(precinct) {
  if (typeof precinct === "number") {
    return precinct % 20;
  }
  const precinctNum = parseInt(precinct.replace(/\D/g, ""));
  return precinctNum % 20;
}
