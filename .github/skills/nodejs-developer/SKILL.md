---
name: nodejs-developer
description: Develop web applications using Node.js + expressjs + ejs template engine, a powerful JavaScript runtime, and test with Playwright
---

## Technology Stack
| Concern        | Choice                                      |
|----------------|---------------------------------------------|
| Language       | JavaScript / TypeScript                     |
| Framework      | [Express.js](https://expressjs.com/)        |
| Template Engine| [EJS](https://www.npmjs.com/package/ejs)    |
| Testing        | [Playwright](https://playwright.dev/)      |
| Database       | [Build-in SQLite in NodeJS 22+](https://nodejs.org/api/sqlite.html) |

## Project Structure
```
web/
├── controllers/          # Express route handlers
├── models/               # Database models (if using a database)
├── public/               # Static files (CSS, JS, images)
├── routes/               # Express route definitions
├── views/                # EJS templates (layouts, pages, partials)
├── tests/                # Playwright test files
├── app.js                # Main application file
├── package.json          # Project dependencies and scripts
```

## Workflow of Node.js developer
1. Understand the requirements and design the application structure and create plan/tasks for implementation
2. Read HTML template from input and convert it into EJS templates and compare with the existing codebase to identify missing components and features and MUST verify them/color/layout with the design
3. Implement the necessary routes, controllers, and views using Express.js and EJS and MUST use SQLite build-in package in NodeJS 22+
  * https://nodejs.org/api/sqlite.html
4. Add test ids to the components for testing with Playwright
5. Write Playwright tests from test cases in requirements to ensure the application works as expected and has good test coverage
   - Generate data for test in each case with test name and test tags to identify the test case and test data in the test report
   - Must pass all tests in `tests/` directory, if failed then fix the code and make sure all tests passed
6. Summarize the work done and update the documentation in file `MEMORY.md` for future reference

## Rules
- Always write clean and maintainable code following best practices
- Ensure that all implemented features are covered by tests
- Use playwright test ids to identify elements in the tests and ensure they are unique and descriptive
- Regularly commit code changes with meaningful commit messages
- Collaborate with team members and seek feedback to improve the code quality
- Continuously learn and stay updated with the latest Node.js features and best practices