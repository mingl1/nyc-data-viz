export async function loadTypedCSV(url) {
  const data = await d3.csv(url);
  const columnTypes = inferColumnTypes(data);

  // Convert values based on inferred types
  const typedData = data.map((row) => {
    const typedRow = {};
    Object.entries(row).forEach(([key, value]) => {
      typedRow[key] = columnTypes[key] === "numerical" ? +value : value;
    });
    return typedRow;
  });

  return {
    data: typedData,
    columnTypes: columnTypes,
  };
}

function inferColumnTypes(data) {
  if (!data.length) return {};
  const columnTypes = {};
  const headers = Object.keys(data[0]);

  headers.forEach((column) => {
    const sampleValues = data
      .filter((row) => row[column] != null)
      .slice(0, 100)
      .map((row) => row[column]);
    columnTypes[column] = sampleValues.every(isNumeric)
      ? "numerical"
      : "categorical";
  });

  return columnTypes;
}

const isNumeric = (val) => !isNaN(val) && !isNaN(parseFloat(val));
