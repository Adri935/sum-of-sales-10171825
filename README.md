# Sales Summary Application

This is a single-page application that fetches sales data from a CSV file, calculates the total sales, and displays the result.

## Setup

No setup required. Simply open `index.html` in a web browser.

## Usage

The application automatically loads and processes the sales data when the page loads. The total sales amount is displayed in the main content area.

## Code Explanation

- `index.html`: Main HTML structure that includes Bootstrap 5 and our custom CSS/JS
- `style.css`: Custom styling for the application
- `script.js`: Contains all logic for fetching, parsing, and processing the CSV data

The JavaScript code handles:
1. Parsing data URLs
2. Decoding base64 content
3. Parsing CSV data with automatic delimiter detection
4. Calculating the sum of the Sales column
5. Updating the DOM with the result

## License
MIT