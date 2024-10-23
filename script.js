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
let pixelsPerMile;

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

  // Calculate pixels per mile using two known points
  const sanFranciscoCoords = [-122.4194, 37.7749];
  const stanfordCoords = [-122.1697, 37.4275];

  const distanceMiles = calculateDistanceInMiles(sanFranciscoCoords, stanfordCoords);

  const sfPixel = projection(sanFranciscoCoords);
  const stanfordPixel = projection(stanfordCoords);

  const dx = sfPixel[0] - stanfordPixel[0];
  const dy = sfPixel[1] - stanfordPixel[1];
  const pixelDistance = Math.sqrt(dx * dx + dy * dy);

  pixelsPerMile = pixelDistance / distanceMiles;

  // Initialize radiusA and radiusB
  radiusA = {
    x: sfPixel[0],
    y: sfPixel[1],
    miles: 15, // Default value from slider
    r: 15 * pixelsPerMile,
  };

  radiusB = {
    x: stanfordPixel[0],
    y: stanfordPixel[1],
    miles: 15, // Default value from slider
    r: 15 * pixelsPerMile,
  };  

  // Set up SVG with fixed width and height
  svg = d3
    .select("#map-container")
    .append("svg")
    .attr("width", mapWidth)
    .attr("height", mapHeight);

  // Add map image with fixed dimensions
  svg
    .append("image")
    .attr("href", "bay_area_map.png")
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
    .attr("r", 5)
    .attr("fill", "gray")
    .attr("opacity", 0.3)
    .on("mouseover", showTooltip)
    .on("mousemove", moveTooltip)
    .on("mouseout", hideTooltip)
    .on("click", function (event, d) {
      if (d.url) {
        window.open(d.url, "_blank");
      }
    });

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
    .attr("fill", "#719db2")
    .attr("fill-opacity", 0.1)
    .attr("stroke", "#719db2")
    .call(dragBehaviorA);

  circleB = svg
    .append("circle")
    .attr("class", "circleB")
    .attr("cx", radiusB.x)
    .attr("cy", radiusB.y)
    .attr("r", radiusB.r)
    .attr("fill", "#719db2")
    .attr("fill-opacity", 0.1)
    .attr("stroke", "#719db2")
    .call(dragBehaviorB);
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

  // Radius A Slider
  d3.select("#radiusASlider").on("input", function () {
    radiusA.miles = +this.value;
    d3.select("#radiusAValue").text(this.value);

    // Convert miles to pixels
    radiusA.r = radiusA.miles * pixelsPerMile;
    circleA.attr("r", radiusA.r);

    updateVisualization();
  });

  // Radius B Slider
  d3.select("#radiusBSlider").on("input", function () {
    radiusB.miles = +this.value;
    d3.select("#radiusBValue").text(this.value);

    radiusB.r = radiusB.miles * pixelsPerMile;
    circleB.attr("r", radiusB.r);

    updateVisualization();
  });
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

  // Update draggable circles positions if necessary
  circleA.attr("cx", radiusA.x).attr("cy", radiusA.y).attr("r", radiusA.r);
  circleB.attr("cx", radiusB.x).attr("cy", radiusB.y).attr("r", radiusB.r);

  // Update circles
  circlesGroup
    .selectAll("circle.restaurant")
    .attr("fill", (d) => {
      const inFilteredData = filteredData.includes(d);
      const inCirclesIntersection = isInCirclesIntersection(d);
      if (inFilteredData && inCirclesIntersection) {
        return "#e53935";
      } else {
        return "gray";
      }
    });

  // Get all results that are in the draggable circles' intersection
  const allResults = filteredData.filter(isInCirclesIntersection);

  // Update results heading with the count
  d3.select("#resultsHeading").text(`${allResults.length} Restaurants`);

  // Update results list
  const resultsList = d3.select("#resultsList").html("");

  allResults.forEach((d) => {
    const listItem = resultsList.append("li").attr("class", "result-item");

    // Create a container for each item
    const itemContent = listItem.append("div").attr("class", "result-content");

    // Add the image
    if (d.image_url) {
      itemContent
        .append("img")
        .attr("class", "result-image")
        .attr("src", d.image_url)
        .attr("alt", d.name);
    } else {
      itemContent
        .append("img")
        .attr("class", "result-image")
        .attr("src", "restaurant_image_placeholder.svg")
        .attr("alt", "Restaurant Image Placeholder");
    }

    // Add restaurant details
    const details = itemContent.append("div").attr("class", "result-details");

    details.append("h3").text(d.name);

    const formattedPhoneNumber = formatPhoneNumber(d.phone);
    
    details.append("p").html(
      `
        <strong>Rating:</strong> ${d.rating}<br>
        <strong>Reviews:</strong> ${d.review_count}<br>
        <strong>Price:</strong> ${d.price}<br>
        <strong>Type:</strong> ${d.categories}<br>
        <strong>Address:</strong> ${d.address}<br>
        <strong>Phone:</strong> ${formattedPhoneNumber}<br>
      `
    );

    // Add the link to Yelp
    if (d.url) {
      details.append("a")
        .attr("href", d.url)
        .attr("target", "_blank")
        .attr("class", "yelp-link")
        .text("View on Yelp");
    }
  });
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

function isInCirclesIntersection(d) {
  const restaurantPixel = projection([d.longitude, d.latitude]);

  // Distance to draggable circle A
  const dxA = restaurantPixel[0] - radiusA.x;
  const dyA = restaurantPixel[1] - radiusA.y;
  const distanceToA = Math.sqrt(dxA * dxA + dyA * dyA);

  // Distance to draggable circle B
  const dxB = restaurantPixel[0] - radiusB.x;
  const dyB = restaurantPixel[1] - radiusB.y;
  const distanceToB = Math.sqrt(dxB * dxB + dyB * dyB);

  return distanceToA <= radiusA.r && distanceToB <= radiusB.r;
}

// Function to calculate distance in miles between two coordinates
function calculateDistanceInMiles(point1, point2) {
  const distanceInRadians = d3.geoDistance(point1, point2);
  const earthRadiusMiles = 3958.8; // Earth's radius in miles
  return distanceInRadians * earthRadiusMiles;
}

function showTooltip(event, d) {
  const tooltip = d3.select("#tooltip");

  // Set the image with a fallback
  const imageUrl = d.image_url || "restaurant_image_placeholder.svg";
  tooltip.select("#tooltipImage").attr("src", imageUrl);

  // Set the restaurant name
  tooltip.select("#tooltipName").text(d.name);

  // Format the phone number
  const formattedPhoneNumber = formatPhoneNumber(d.phone);

  // Set the restaurant details
  tooltip
    .select("#tooltipInfo")
    .html(
      `
        <strong>Rating:</strong> ${d.rating}<br>
        <strong>Reviews:</strong> ${d.review_count}<br>
        <strong>Price:</strong> ${d.price}<br>
        <strong>Type:</strong> ${d.categories}<br>
        <strong>Address:</strong> ${d.address}<br>
        <strong>Phone:</strong> ${formattedPhoneNumber}<br>
      `
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

function formatPhoneNumber(phoneNumberString) {
  let cleaned = ("" + phoneNumberString).replace(/\D/g, "");

  if (cleaned.length === 11 && cleaned[0] === "1") {
    cleaned = cleaned.slice(1);
  }

  let match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);

  if (match) {
    return "(" + match[1] + ") " + match[2] + "-" + match[3];
  }

  return "N/A";
}
