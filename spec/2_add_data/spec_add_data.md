---
category: specification
service: "[[timesheet-service]]"
---


# Feature :: Add Data to Timesheet Report

## Implement User Interface(UI)
* route name: `/add`
* page title: `Add Timesheet Entry`
* Use html template: `template_add_data.html`
* form fields: Date, Hours Spent, Customer, Project, Task Description
* submit button: "Submit Entry"

## User's workflow to use feature
1. User navigates to `/add` page or clicks "Add Entry" button on `/report` page.
2. User fills out the form with the required information.
3. User clicks the "Submit Entry" button to submit the form.
   3.1 Save data in the database (SQLite) with the same schema as `timesheet_entries` table.
   3.2 Redirect user back to `/report` page after successful submission.
   3.3 If there are validation errors, display appropriate error messages without redirecting.
4. The new timesheet entry is added to the database and the user is redirected back to `/report` page.

## Validation rules for form fields show in table format
| Field Name       | Validation Rule                                      | Error message |
|------------------|------------------------------------------------------|-----------------|
| Date             | Required  | Date is required                                           |
| Hours Spent      | Required                  | Hours spent must be a positive number |
| Customer         | Required                 | Customer is required |
| Project          | Required                 | Project is required |
| Task Description | Optional, if provided must be a string               | Task description must be a string |

## Database table: `timesheet_entries`
| Column Name   | Data Type | Description                     |
|---------------|-----------|---------------------------------|
| id            | Integer   | Primary key, auto-increment     |
| employee_name | String    | Name of the employee             |
| date          | Date      | Date of the timesheet entry      |
| project       | String    | Name of the project              |
| description   | String    | Description of the work done      |
| hours         | Float     | Number of hours worked           |     


## Test Cases in table format
| Test Case ID | Description | Input Data | Expected Output |
|--------------|-------------|------------|-----------------|

References:

- [[spec_report_page]]