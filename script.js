// Global variables
let data = [];
let filteredData = [];
let svg;
let projection;
const mapWidth = 948; // Map image width
const mapHeight = 844; // Map image height
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
  const longitudeRange = [-122.50685, -121.781739849809];
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
  radiusA = { x: sanFranciscoPos[0], y: sanFranciscoPos[1], r: 100 };
  radiusB = { x: stanfordPos[0], y: stanfordPos[1], r: 100 };

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
    .on("mouseover", showTooltip)
    .on("mousemove", moveTooltip)
    .on("mouseout", hideTooltip);
}