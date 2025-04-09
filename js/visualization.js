import * as topoclient from "../d3/topojson-client.min.js";
import * as d3 from "../d3/d3.v7.min.js";
import { loadTypedCSV } from "./utils/dataLoader.js";
import {
  CHART_CONFIG,
  RANK_MAP,
  precinctColor,
  x_axis_variables,
  numerical_x_variables,
} from "./utils/constants.js";
import { precinctToIndex } from "./utils/precinctUtils.js";

// Utility functions
const capitalize = (str) =>
  str
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

// Chart creation functions
function createBarChart(
  svg,
  data,
  xAxis,
  yAxis,
  width,
  height,
  isScatter,
  swap
) {
  const x_dict = {};
  const numerical_x_variables = Object.keys(
    Object.fromEntries(
      Object.entries(columnTypes).filter(([_, type]) => type === "numerical")
    )
  );

  // Prepare data for visualization
  let new_data = [];
  let maxHeight = 0;

  if (xAxis === "borough") {
    let boroughMap = new Map();
    const cols = x_dict[yAxis] || [yAxis];

    data.forEach((row) => {
      let tot = cols.reduce((sum, col) => sum + row[col], 0);
      let precinctName = row[xAxis];
      boroughMap.set(precinctName, (boroughMap.get(precinctName) || 0) + tot);
      maxHeight = Math.max(maxHeight, boroughMap.get(precinctName));
    });

    new_data = Array.from(boroughMap, ([precinct, value]) => ({
      precinct,
      value,
    }));
  } else if (xAxis.startsWith("All")) {
    const other_cols = x_dict[xAxis];
    let columnTotals = new Map(other_cols.map((col) => [col, 0]));

    data.forEach((row) => {
      other_cols.forEach((col) => {
        columnTotals.set(col, columnTotals.get(col) + row[col]);
      });
    });

    new_data = Array.from(columnTotals, ([col, value]) => ({
      precinct: col.split("_").pop(),
      value: value,
    }));
    maxHeight = Math.max(...columnTotals.values());
  } else {
    const cols = x_dict[yAxis] || [yAxis];
    data.forEach((row) => {
      let tot = cols.reduce((sum, col) => sum + row[col], 0);
      maxHeight = Math.max(maxHeight, tot);
      new_data.push({ precinct: row[xAxis], value: tot });
    });
  }

  new_data.sort((a, b) => b.value - a.value);

  if (swap) {
    new_data = new_data.map((d) => ({ precinct: d.value, value: d.precinct }));
    const x = d3.scaleLinear().domain([0, maxHeight]).range([0, width]).nice();

    const y = d3
      .scaleBand()
      .domain(new_data.map((d) => d.value))
      .range([height, 0])
      .padding(0.2);

    svg
      .append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x));

    svg.append("g").call(d3.axisLeft(y));

    if (isScatter) {
      svg
        .selectAll("circle")
        .data(new_data)
        .enter()
        .append("circle")
        .attr("cx", (d) => x(d.precinct))
        .attr("cy", (d) => y(d.value) + y.bandwidth() / 2)
        .attr("r", xAxis === "borough" ? 20 : 4)
        .attr("fill", (d) => precinctColor[precinctToIndex(d.value)])
        .attr(
          "transform",
          xAxis === "borough" ? "translate(0,0)" : "translate(2,0)"
        );
    }
  } else {
    const x = d3
      .scaleBand()
      .range([0, width])
      .domain(new_data.map((d) => d.precinct))
      .padding(0.2);

    const y = d3.scaleLinear().domain([0, maxHeight]).range([height, 0]).nice();

    svg
      .append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr(
        "transform",
        `translate(-10,10)${
          new_data.length > 20 ? "rotate(-90)" : "rotate(-45)"
        }`
      );

    svg.append("g").call(d3.axisLeft(y));

    if (isScatter) {
      svg
        .selectAll("circle")
        .data(new_data)
        .enter()
        .append("circle")
        .attr("cx", (d) => x(d.precinct) + x.bandwidth() / 2)
        .attr("cy", (d) => y(d.value))
        .attr("r", xAxis === "borough" ? 20 : 4)
        .attr("fill", (d) => precinctColor[precinctToIndex(d.precinct)])
        .attr(
          "transform",
          xAxis === "borough" ? "translate(55,0)" : "translate(10,0)"
        );
    } else {
      svg
        .selectAll("rect")
        .data(new_data)
        .enter()
        .append("rect")
        .attr("x", (d) => x(d.precinct))
        .attr("y", (d) => y(d.value))
        .attr("width", x.bandwidth())
        .attr("height", (d) => height - y(d.value))
        .attr("fill", (d) => precinctColor[precinctToIndex(d.precinct)]);
    }
  }
  addChartLabels(svg, width, height, xAxis, yAxis);
}

function addChartLabels(svg, width, height, xAxis, yAxis) {
  // Add X axis label
  svg
    .append("text")
    .attr("class", "axis-label")
    .attr("text-anchor", "middle")
    .attr("x", width / 2)
    .attr("y", height + 60)
    .text(capitalize(xAxis));

  // Add Y axis label
  svg
    .append("text")
    .attr("class", "axis-label")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -60)
    .text(capitalize(yAxis));

  // Add title
  svg
    .append("text")
    .attr("class", "chart-title")
    .attr("text-anchor", "middle")
    .attr("x", width / 2)
    .attr("y", -20)
    .text(`${capitalize(yAxis)} by ${capitalize(xAxis)}`);
}

// ... rest of the code ...

function createHistogram(data, config) {
  // ... existing histogram code ...
}

function createScatterPlot(data, config) {
  // ... existing scatter plot code ...
}

// Event handlers
let lastX = null;
let currX = null;
let currY = null;
let scatterX = null;
let scatterY = null;
let data,
  columnTypes = null;

function handleSelectionChange(event) {
  const radio = document.querySelector('input[name="orientation"]:checked');
  const swapInput = document.querySelector('input[name="swap"]:checked');
  const orientation = radio.value;
  const swap = swapInput.value === "true";

  if (event) {
    const selectElement = event.target.children[0];
    if (selectElement) {
      const selectId = selectElement.id;
      const selectedValue = event.detail.value;

      switch (selectId) {
        case "x":
          currX = selectedValue;
          toggleYContainer(selectedValue.startsWith("All"));
          break;
        case "y":
          if (currY === "histogram") currX = lastX;
          currY = selectedValue;
          break;
        case "histogram":
          lastX = currX;
          currX = selectedValue;
          currY = "histogram";
          break;
        case "scatter-x":
          scatterX = selectedValue;
          if (scatterX && scatterY) {
            updateVisualization(orientation, true, scatterX, scatterY, swap);
            return;
          }
          break;
        case "scatter-y":
          scatterY = selectedValue;
          if (scatterX && scatterY) {
            updateVisualization(orientation, true, scatterX, scatterY, swap);
            return;
          }
          break;
      }
    }
  } else {
    if (swap) {
      updateVisualization(orientation, true, scatterY, scatterX);
    } else {
      updateVisualization(orientation, true, scatterX, scatterY);
    }
    return;
  }

  updateVisualization(orientation, false, currX, currY);
}

function toggleYContainer(hide) {
  const yContainer = document.getElementById("y-container");
  yContainer.classList.toggle("hidden", hide);
}

// Initialize visualization
async function initVisualization() {
  const result = await loadTypedCSV("../data/final_data.csv");
  Object.filter = (obj, predicate) =>
    Object.keys(obj)
      .filter((key) => predicate(obj[key]))
      .reduce((res, key) => ((res[key] = obj[key]), res), {});
  // categorical

  data = result.data;
  columnTypes = result.columnTypes;
  columnTypes["precinct"] = "categorical";

  currX = "precinct";
  currY = "All Crimes";

  const test = document.querySelector("#test");
  test.style.maxHeight = "80vh";
  test.appendChild(createPctList());

  const ul = document.createElement("ul");
  ul.classList.add("uk-switcher", "w-full", "h-full", "switcher-container");

  const items = ["", "Visualization"];
  items.forEach((text) => {
    const li = document.createElement("li");
    li.style.height = "60vh";
    if (text) {
      li.id = "viz";
    } else {
      li.appendChild(map_svg.node());
    }
    ul.appendChild(li);
  });
  container.style.maxHeight = "80vh";
  container.removeChild(container.children[1]);
  container.appendChild(ul);
  const viz = document.getElementById("viz");
  viz.style.maxHeight = "80vh";
  setupEventListeners();
  updateVisualization("vertical", false, "precinct", "All Crimes");
}

function setupEventListeners() {
  // Listen for select changes
  document.addEventListener("uk-select:input", handleSelectionChange);

  // Listen for radio button changes
  document.addEventListener("change", (e) => {
    if (e.target.matches('input[name="orientation"]')) {
      handleSelectionChange(e);
    } else if (e.target.matches('input[name="swap"]')) {
      handleSelectionChange(null);
    }
  });
}
function updateVisualization(
  orientation,
  isScatter,
  xAxis,
  yAxis,
  swap = false
) {
  const viz = document.getElementById("viz");
  if (!xAxis || !yAxis || !viz) {
    return;
  }

  viz.innerHTML = "";
  const { width, height, margin } = CHART_CONFIG;

  const svg = d3
    .select("#viz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  if (yAxis === "histogram") {
    createHistogram(svg, data, xAxis, width, height);
  } else if (
    xAxis.startsWith("All") ||
    (columnTypes[xAxis] === "categorical" &&
      (yAxis.startsWith("All") || columnTypes[yAxis] === "numerical")) ||
    (columnTypes[xAxis] === "numerical" && columnTypes[yAxis] === "categorical")
  ) {
    if (orientation === "vertical") {
      createBarChart(svg, data, xAxis, yAxis, width, height, isScatter, swap);
    } else {
      createHorizontalBarChart(
        svg,
        data,
        xAxis,
        yAxis,
        width,
        height,
        isScatter
      );
    }
  } else if (
    columnTypes[xAxis] === "categorical" &&
    columnTypes[yAxis] === "categorical"
  ) {
    createScatterPlot(svg, data, xAxis, yAxis, width, height, true);
  } else {
    createScatterPlot(svg, data, xAxis, yAxis, width, height, false);
  }
}
// Start the application
document.addEventListener("DOMContentLoaded", initVisualization);
