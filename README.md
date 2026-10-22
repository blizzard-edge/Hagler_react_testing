# Testing Tasks
📝 Requirements
You must create comprehensive test files that achieve greater than 80% code coverage. Your tests should demonstrate understanding of:

Different assertion types (toBe, toEqual, toBeCloseTo, etc.)
Testing edge cases and boundary conditions
Testing React components with user interactions
Using describe blocks to organize tests logically
Writing clear, descriptive test names
Task 1: Test the Utility Functions
Create a file src/utils/cartUtils.test.ts and write tests for all utility functions. Your tests must cover all edge cases and achieve >80% coverage.
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
💡 Testing Tips
Use describe blocks to group related tests
Give each test a clear, descriptive name starting with "should"
For React components, use userEvent instead of fireEvent
Use toBeCloseTo for floating-point comparisons when needed
Remember to await user interactions
Task 2: Test the React Component
Create a file src/components/ShoppingCart.test.tsx and write comprehensive tests for all component behaviors including adding items, removing items, updating quantities, and verifying calculations.
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
# Running Tests and Generating Coverage
Running Tests in Watch Mode
$ npm test
Generating Coverage Report
$ npm run test:coverage
You should achieve >80% coverage across all metrics. An HTML coverage report will be generated at coverage/index.html.
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
📦 Deliverables
src/utils/cartUtils.test.ts - Complete test suite for utility functions
src/components/ShoppingCart.test.tsx - Complete test suite for React component
Coverage Screenshot - Screenshot showing >80% coverage
HTML Coverage Report - Include the generated coverage folder
Brief Write-up (1-2 paragraphs) describing your testing strategy and what you learned
All of this should be in your GitHub repo and you will submit the link to the repo. Make sure it's set to public. 
