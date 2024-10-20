// Global variables
let data = [];
let filteredData = [];
let svg;
let projection;
const mapWidth = 948;
const mapHeight = 844;
let radiusA, radiusB;
let dragBehaviorA, dragBehaviorB;
let circleA, circleB;
let circlesGroup;

// Coordinates for San Francisco and Stanford
const sanFranciscoCoords = [-122.4194, 37.7749];
const stanfordCoords = [-122.1701, 37.4277];

// Load data and initialize visualization
d3.csv(
  "https://magrawala.github.io/cs448b-fa24/assets/a3/cs448b-fa24-a3.csv",
  d3.autoType
).then((csvData) => {
  data = csvData;
  init();
});

function init() {
  // Set up projection
  const longitudeRange = [-121.781739849809, -122.50685];
  const latitudeRange = [37.22070801115405, 37.820673];
  const mapFrameGeoJSON = {
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: [
        [longitudeRange[0], latitudeRange[0]],
        [longitudeRange[1], latitudeRange[1]],
      ],
    },
  };

  projection = d3
    .geoConicConformal()
    .parallels([37 + 4 / 60, 38 + 26 / 60])
    .rotate([120 + 30 / 60], 0)
    .fitSize([mapWidth, mapHeight], mapFrameGeoJSON);

  // Projected positions
  const sanFranciscoPos = projection(sanFranciscoCoords);
  const stanfordPos = projection(stanfordCoords);

  // Initialize radiusA and radiusB
  radiusA = { x: sanFranciscoPos[0], y: sanFranciscoPos[1], r: 300 };
  radiusB = { x: stanfordPos[0], y: stanfordPos[1], r: 300 };

  // Set up SVG with fixed width and height
  svg = d3
    .select("#map-container")
    .append("svg")
    .attr("width", mapWidth)
    .attr("height", mapHeight);

  // Add map image with fixed dimensions
  svg
    .append("image")
    .attr("xlink:href", "https://magrawala.github.io/cs448b-fa24/assets/a3/map2024.png")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", mapWidth)
    .attr("height", mapHeight);

  // Add circles for restaurants
  circlesGroup = svg.append("g");
  circlesGroup
    .selectAll("circle.restaurant")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "restaurant")
    .attr("cx", (d) => projection([d.longitude, d.latitude])[0])
    .attr("cy", (d) => projection([d.longitude, d.latitude])[1])
    .attr("r", 3)
    .attr("fill", "gray")
    .attr("opacity", 0.3)
    .on("mouseover", showTooltip)
    .on("mousemove", moveTooltip)
    .on("mouseout", hideTooltip);

  // Add draggable circles A and B
  addDraggableCircles();

  // Bring restaurant circles to the front
  circlesGroup.raise();

  // Initialize UI controls
  initControls();

  // Initial update
  updateVisualization();
}

function addDraggableCircles() {
  dragBehaviorA = d3.drag().on("drag", draggedA);
  dragBehaviorB = d3.drag().on("drag", draggedB);

  circleA = svg
    .append("circle")
    .attr("class", "circleA")
    .attr("cx", radiusA.x)
    .attr("cy", radiusA.y)
    .attr("r", radiusA.r)
    .attr("fill", "#f4cd6e")
    .attr("fill-opacity", 0.05)
    .attr("stroke", "#f4cd6e")
    .call(dragBehaviorA);

  circleB = svg
    .append("circle")
    .attr("class", "circleB")
    .attr("cx", radiusB.x)
    .attr("cy", radiusB.y)
    .attr("r", radiusB.r)
    .attr("fill", "#f4cd6e")
    .attr("fill-opacity", 0.05)
    .attr("stroke", "#f4cd6e")
    .call(dragBehaviorB);
}

function draggedA(event) {
  radiusA.x = event.x;
  radiusA.y = event.y;
  circleA.attr("cx", radiusA.x).attr("cy", radiusA.y);
  updateVisualization();
}

function draggedB(event) {
  radiusB.x = event.x;
  radiusB.y = event.y;
  circleB.attr("cx", radiusB.x).attr("cy", radiusB.y);
  updateVisualization();
}

function initControls() {
  // Ratings checkboxes
  d3.selectAll("input[name='rating']").on("change", updateVisualization);

  // Reviews range sliders
  d3.select("#reviewsMin").on("input", updateVisualization);
  d3.select("#reviewsMax").on("input", updateVisualization);

  // Price checkboxes
  d3.selectAll("input[name='price']").on("change", updateVisualization);

  // Search box
  d3.select("#searchBox").on("input", updateVisualization);

  // Transactions checkboxes
  d3.selectAll("input[name='transaction']").on("change", updateVisualization);

  // Status radio buttons
  d3.selectAll("input[name='status']").on("change", updateVisualization);

  // Radii sliders
  d3.select("#radiusASlider").on("input", function () {
    radiusA.r = +this.value;
    d3.select("#radiusAValue").text(this.value);
    circleA.attr("r", radiusA.r);
    updateVisualization();
  });

  d3.select("#radiusBSlider").on("input", function () {
    radiusB.r = +this.value;
    d3.select("#radiusBValue").text(this.value);
    circleB.attr("r", radiusB.r);
    updateVisualization();
  });

  // Set initial radius values
  d3.select("#radiusAValue").text(radiusA.r);
  d3.select("#radiusBValue").text(radiusB.r);
}

function updateVisualization() {
  // Get filter values
  const ratingValues = d3
    .selectAll("input[name='rating']:checked")
    .nodes()
    .map((d) => d.value);
  const reviewsMin = parseInt(d3.select("#reviewsMin").property("value"));
  const reviewsMax = parseInt(d3.select("#reviewsMax").property("value"));
  const priceValues = d3
    .selectAll("input[name='price']:checked")
    .nodes()
    .map((d) => d.value);
  const searchTerm = d3.select("#searchBox").property("value").toLowerCase();
  const transactionValues = d3
    .selectAll("input[name='transaction']:checked")
    .nodes()
    .map((d) => d.value);
  const statusValue = d3.select("input[name='status']:checked").property("value");

  // Update display of reviews range
  d3.select("#reviewsValue").text(`${reviewsMin} - ${reviewsMax}`);

  // Filter data
  filteredData = data.filter((d) => {
    // Rating filter
    let ratingRangeMatch = false;
    for (let range of ratingValues) {
      const [min, max] = range.split("-").map(parseFloat);
      if (d.rating !== null && d.rating >= min && d.rating <= max) {
        ratingRangeMatch = true;
        break;
      }
    }
    if (!ratingRangeMatch) return false;

    // Reviews filter
    if (
      d.review_count === null ||
      d.review_count < reviewsMin ||
      d.review_count > reviewsMax
    ) {
      return false;
    }

    // Price filter
    if (!priceValues.includes(d.price)) {
      return false;
    }

    // Search filter (name, address, categories)
    const searchFields = [d.name, d.address, d.categories].join(" ").toLowerCase();
    if (!searchFields.includes(searchTerm)) {
      return false;
    }

    // Transactions filter
    if (transactionValues.length > 0) {
      if (d.transactions) {
        const transactionList = d.transactions.split(", ");
        const hasTransaction = transactionValues.some((val) =>
          transactionList.includes(val)
        );
        if (!hasTransaction) {
          return false;
        }
      } else {
        return false; // Exclude if no transactions data
      }
    }

    // Status filter
    if (statusValue !== "all") {
      if (
        (statusValue === "open" && d.is_closed) ||
        (statusValue === "closed" && !d.is_closed)
      ) {
        return false;
      }
    }

    return true;
  });

  // Update circles
  circlesGroup
    .selectAll("circle.restaurant")
    .attr("fill", (d) => {
      const inFilteredData = filteredData.includes(d);
      const inCirclesIntersection = isInCirclesIntersection(d);
      if (inFilteredData && inCirclesIntersection) {
        return "firebrick";
      } else {
        return "gray";
      }
    });

  // Get all results that are in the circles' intersection
  const allResults = filteredData.filter(isInCirclesIntersection);

  // Update results heading with the count
  d3.select("#resultsHeading").text(`${allResults.length} Results`);

  // Update results list
  const resultsList = d3.select("#resultsList").html("");
  allResults.forEach((d) => {
    resultsList.append("li").text(`${d.name} - ${d.address}`);
  });
}

function isInCirclesIntersection(d) {
  const [x, y] = projection([d.longitude, d.latitude]);
  const distA = Math.hypot(x - radiusA.x, y - radiusA.y);
  const distB = Math.hypot(x - radiusB.x, y - radiusB.y);
  return distA <= radiusA.r && distB <= radiusB.r;
}

function showTooltip(event, d) {
  const tooltip = d3.select("#tooltip");
  tooltip.select("#tooltipName").text(d.name);
  tooltip
    .select("#tooltipInfo")
    .html(
      `Rating: ${d.rating}<br>Reviews: ${d.review_count}<br>Price: ${d.price}`
    );
  tooltip.classed("hidden", false);
}

function moveTooltip(event) {
  const tooltip = d3.select("#tooltip");
  tooltip
    .style("left", event.pageX + 15 + "px")
    .style("top", event.pageY + 15 + "px");
}

function hideTooltip() {
  d3.select("#tooltip").classed("hidden", true);
}
