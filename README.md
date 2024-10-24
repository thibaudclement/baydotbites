# BayDotBites

[BayDotBites](https://www.baydotbites.com/) is an online, interactive visualization of Bay Area restaurants. This project is developed by Thibaud Clement as part of Assignment 3 of Stanford's CS448B course.

## Concept
The name BayDotBites aims a representing the goal of this project, combining references to the Bay Area ("Bay"), visualization ("dot"), and restaurants ("bites"). It is also a pun on "bytes" and on TLDs (as if `.bites` were a domain), to echo the online nature of the project—in fact, it is available at `https://www.baydotbites.com/`.

The logo builds on this thematic, with the Golden Gate bridge representing the Bay Area in the center, a "bitten" sun representing the idea of eating, and bay water made of dots in reference to a scatter plot.

## User Interface

The most prominent part of the website, on the right, displays the provided map, on which restaurants appear as circles, either red if they belong to the selection of the user, or grey if they do not. The user can hover over each circle to reveal a tooltip presenting details about each restaurant, and click on the circle to access the listing of the restaurant on Yelp.

Restaurants may be filtered based on location, by way of two draggable circles—one centered on San Francisco, the other on Stanford—with independently-adjustable radii, as well as based the text content of thei name, address, and category, their average rating, the number of reviews they received, their price range, the type of transactions they accept, and whether they are open.  

A scrollable list of the filtered-in restaurants is presented below the map, while all filtering controls appear in the left-sidebar of the website.

This is what a user may see by default when loading the website:

[BayDotBites Default View](/baydotbites_default_view.png)

## Platform Choice
Initially, I started working on this project in Observable. While I was able to get up and running quickly, displaying restaurant circles on the map without difficulty, the more progress I made on the assignment, the more I ran into technical challenges. In particular, once I attempted to implement data filters, it seemed like Observable may not be the best tool to create the user interface I had in mind. 

Therefore, I decided to start again from scratch, this time building a custom static site with HTML, SVG, CSS, and JavaScript, hosted via GitHub Pages. In hindsight, despite a steeper learning curve, this appears to have been an appropriate decision, as the additional flexibility of this approach allowed to design the visualization I had in mind.

## Development Process
This project took about 45 hours to complete. I opted to work on this project on my own, without a partner. Below is a breakdown of how my time was allocated:
- First, I spent 2 hours building a mental model of what needed to be achieved in this project, understanding the dataset, and hand-sketching a wireframe of what the final product may look like.
- Then, I spent about 5 hours reading D3 documentation, focusing in particular on [d3-drag](https://d3js.org/d3-drag), and researching solutions to implement [tooltips](https://observablehq.com/@john-guerra/how-to-add-a-tooltip-in-d3).
- Next, I spent around 5 hours building a prototype in Observable, until I decided to switch to a custom website.
- Once I pivoted to GitHub Pages, it took me around 3 hours to buy the domain name, initialize the GitHub repository, and set up GitHub pages to point to a custom domain.
- From there, implementing a functional version of the website, with restaurants displayed on the map, working filtering controls, and a pleasant user interface, took about 15 hours.
- However, I then discovered an issue with the way I had set up the draggable circles, where the radii of the circles on the map were not commensurate with the value selected by the sliders. It took me almost half as much time to understand and resolve this problem, as the previous step, i.e. around 8 hours. Indeed, this required using a fixed conversion factor to convert miles to pixels, comparing  pixel distances to determine whether each restaurant was within the intersection of the draggable circles, and ensuring the restaurant highlighting matched the visual representation on the map.
- Next, I dedicated about 5 hours to adding the final touch to the website, testing some edge cases (such as restaurants with large number of reviews) and refining the user interface.
- Finally, I spent a couple of hours drafting the contents of this README file.

## Visualization Decisions
Here are some of the design decisions made in the process of creating this visualization:
- Map: I elected to keep the dimensions suggested in the starter code (rather than using the actual dimensions of the image), to ofer a reasonable experience on laptop screens. After experimenting with color replacement in the source image, I eventually decided to use the original version provided. The only change I made was to apply a gradient on the right-hand side of the image, to make it fade-out into the background of the website, instead of appearing truncated.
- Restaurant circles: I opted to use red to color restaurant circles that were filtered by the user, as a way to make them stand out. While I started with smaller circles (2 and 3 pixels of radius) to reduce overlaps, I eventually scaled them up (5 pixels) and applied an opacity of 30%, hence making denser areas naturally appear denser on the map. 
- Draggable circles: I experimented with different colors (including the same yellow as the sun in the logo of the website), and chose an anthracite tone, which works well with the background colors of the map, as well as the red and grey colors of the restaurant circles. Opacity was set as low as possible, and a stroke was added to accentuate the boundaries of the circles. To make sure the draggable circles did not make restaurant circles less visible, I brought restaurant circles to the forefront with `circlesGroup.raise();`.
- Filters: All filters were set up to cover the entire ranges of the data set (for instance, the reviews count sliders go up to 15,000 because the restaurant with the most reviews has over 12,000 reviews), and default values were set as to maximize the number of results, hence allowing the user to narrow down their selection (rather than expand it up).

## Future Developments
Here are some ideas to keep improving this project:
1. Given the number of data points in the dataset, spread across a small geographic area, some parts of the map appear really crowded, which makes it sometimes difficult to distinguish between restaurant locations. One solution would be to use a dynamic map that allows the user to zoom in on the areas they are most interested in.
2. One idea that would improve the user experience would be to connect the map and the results list, so that hovering a restaurant in one part highlights it on the other. For instance, when the user hovers over a restaurant on the map, it would be nice to see that restaurant highlighted in the results list, and when the user hovers over a restaurant in the results list, it would be nice to display its tooltip on the map.
3. This visualization is set up to use a static dataset, which was exported via the Yelp A visualization plugged into the Yelp Fusion API in early October 2024. Integrating this project with the Yelp Fusion API would enable real-time updates of the restaurants displayed on the website.
4. This static website has been developed with laptop and desktop browsers in mind. To offer a better experience on smartphone, it would be necessary to make the layout responsive, and most importantly, to rethink user interactions with the map, given that mouse hover is not available on mobile.