function init() {
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
}