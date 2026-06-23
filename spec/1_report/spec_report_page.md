# Feature :: Timesheet report page

## Implement User Interface(UI)
* route name: `report`
* page title: `Timesheet Report`
* Use html template: `template_report_page.html`

## User's workflow to use feature
1. User open webpage or click on menu item `Reports`
2. Get data from database and display in table format
3. Show summary data
   - Total Hours
   - Active Projects
   - Billable
   - Avg Entries/Dev
4. User can filter data by Customer name and/or date range
  - Employee Name
  -	Date	
  - Project	Description	
  - Hours
5. Show pagination if data is more than 10 records

## Database table: `timesheet_entries`
| Column Name   | Data Type | Description                     |
|---------------|-----------|---------------------------------|
| id            | Integer   | Primary key, auto-increment     |
| employee_name | String    | Name of the employee             |
| date          | Date      | Date of the timesheet entry      |
| project       | String    | Name of the project              |
| description   | String    | Description of the work done      |
| hours         | Float     | Number of hours worked           |        


## Test Cases
1. Prepare data for testing
   - Insert sample records into `timesheet_entries` table
   - Example record:
     | id | employee_name | date       | project      | description          | hours |
     |----|---------------|------------|--------------|----------------------|-------|
     | 1  | John Doe      | 2026-06-01 | Project A      | Worked on feature X   | 8.0   |
     | 2  | Jane Smith    | 2026-06-02 | Project B      | Fixed bugs             | 6.5   |
     | 3  | John Doe      | 2026-06-03 | Project A      | Code review            | 2.0   |
     
2. Test cases show in table format

| Test ID | Test Description | Test Steps | Expected Result |
|---------|------------------|------------|-----------------|
| TC001   | Verify page loads successfully | 1. Navigate to `/report` <br> 2. Check page title | Page title is `Timesheet Report` and page loads without errors
| TC002   | Verify data is displayed in table format | 1. Navigate to `/report` <br> 2. Check for table element and data rows | Table is displayed with correct data from `timesheet_entries` table
| TC003   | Verify summary data is correct | 1. Navigate to `/report` <br> 2. Calculate total hours, active projects, billable, and avg entries/dev from sample data <br> 3. Compare with displayed summary | Summary data matches calculated values based on sample data
| TC004   | Verify filtering by customer name | 1. Navigate to  `/report` <br> 2. Enter `John Doe` in customer name filter <br> 3. Apply filter | Only records for `John Doe` are displayed in the table
| TC005   | Verify filtering by date range | 1. Navigate to `/report` <br> 2. Set date range from `2026-06-01` to `2026-06-02` <br> 3. Apply filter | Only records within the specified date range are displayed in the table
| TC006   | Verify pagination works correctly | 1. Insert more than 10 records into `timesheet_entries` table <br> 2. Navigate to `/report` <br> 3. Check for pagination controls <br> 4. Navigate through pages | Pagination controls are displayed and navigating through pages shows correct records for each page  
