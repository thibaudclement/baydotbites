# BayDotBites

[BayDotBites](https://www.baydotbites.com/) is an online, interactive visualization of Bay Area restaurants, developed by Thibaud Clement as part of Stanford's CS448B course (Assignment 3).

## Concept
The name 'BayDotBites' captures the core goals of this project, combining references to the Bay Area ("Bay"), visualization ("dot"), and dining ("bites"). It also playfully nods to "bytes" and top-level domains (as if `.bites` were an actual TLD), highlighting the online nature of the project, which is accessible at `https://www.baydotbites.com/`.

The logo reinforces this theme, featuring the Golden Gate Bridge to represent the Bay Area, a "bitten" sun symbolizing eating, and dots for the bay water to reference a scatter plot.

## User Interface

The main section of the website, located on the right, displays a map with restaurants marked as circles—red if they match the user’s filters, gray if they do not. Users can hover over each circle to reveal a tooltip with restaurant details and click on a circle to visit the restaurant’s Yelp listing.

Restaurants can be filtered based on location using two draggable circles—one centered on San Francisco and the other on Stanford—each with independently adjustable radii. Additional filters include search by restaurant name, address, and category; average rating; number of reviews; price range; transaction types accepted; and whether the restaurant is currently open.

Below the map is a scrollable list showing the filtered restaurant results, while all filtering controls are located in the left sidebar.

Here’s the default view that users encounter when loading the website: [BayDotBites Default View](/baydotbites_default_view.png)

## Platform Choice
The project initially began in Observable, which enabled quick progress in displaying restaurant circles on the map. However, as the project evolved, it became apparent that implementing data filters in Observable the way I intended to presented some technical challenges. 

Consequently, I restarted from scratch, creating a custom static site using HTML, SVG, CSS, and JavaScript, and hosting it via GitHub Pages. Despite the steeper learning curve, this decision provided the necessary flexibility to create the envisioned user interface.

## Development Process
The project required approximately 45 hours to complete, broken down as follows:
- Initial Planning (2 hours): Developed a mental model of project requirements, explored the dataset, and sketched a wireframe of the final product.
- Research & Prototyping (5 hours): Read through D3 documentation, focusing on d3-drag and researched tooltip implementation methods.
- Observable Prototype (5 hours): Created a prototype before transitioning to a custom website.
- GitHub Pages Setup (3 hours): Purchased a domain name, initialized the GitHub repository, and configured GitHub Pages to use the custom domain.
- Website Implementation (15 hours): Developed a functional version of the website, including restaurant mapping, filtering controls, and user-friendly interface.
- Debugging (8 hours): Resolved issues with draggable circles, ensuring that radii corresponded accurately with slider values. This process involved converting miles to pixels, calculating pixel distances to identify restaurants within the draggable circles’ intersection, and synchronizing restaurant highlighting with the visual map.
- Final Touches (5 hours): Polished the user interface, tested edge cases (e.g. restaurants with a high number of reviews), and made final adjustments.
- README Drafting (2 hours): Composed the content for this README file.

## Visualization Decisions
Some of the design decisions made in the process of creating this visualization included:
- Map: I maintained the dimensions suggested in the starter code for better compatibility with laptop screens. After testing different color replacements in the source image, I chose to keep the original version, adding a gradient on the right side to blend seamlessly with the website background rather than appearing truncated.
- Restaurant Circles: I used red to highlight filtered restaurants, making them more noticeable. Initially, I used smaller circles (2-3 pixels in radius) to reduce overlaps, but eventually increased the size to 5 pixels with 30% opacity, making denser areas more prominent.
- Draggable Circles: I tested various colors, including the logo’s sun yellow, before settling on an anthracite tone that contrasts well with both the map and the red/gray restaurant circles. I set the opacity low and added a stroke to define the boundaries. To ensure the draggable circles did not obscure restaurant circles, I used `circlesGroup.raise();` to bring restaurant circles to the forefront.
- Filters: All filters were designed to encompass the full data range (e.g. the review count slider goes up to 15,000, as the restaurant with the most reviews has over 12,000). The default filter settings maximize the number of results, allowing users to refine their selections rather than expand them.

## Future Developments
Here are some potential improvements for the project:
1. Dynamic Map: Implementing a zoomable, interactive map would help alleviate crowding and make restaurant locations easier to distinguish.
2. Linked Map & List: Enhancing the connection between the map and the results list—such as highlighting corresponding items when hovering over either—would improve the user experience.
3. Real-Time Data Integration: Connecting the project to the Yelp Fusion API would enable real-time updates of displayed restaurants, rather than relying on a static dataset.
4. Mobile-Friendliness: Adapting the layout for mobile devices, along with rethinking user interactions for touchscreen interfaces, would improve the experience on smartphones, where mouse hovering is unavailable.