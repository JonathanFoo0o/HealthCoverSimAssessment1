# HealthCoverSim

HealthCoverSim is a full-stack web application that simulates private health insurance quotes.

## Technologies

- React
- Node.js
- Express
- SQLite
- better-sqlite3
- CSS

### How to Run

1. Start the Backend

Open a terminal and navigate to the backend folder:
cd HealthCoverSim/backend
Install the backend dependencies:
npm install
Start the backend:
node server.js
The backend will run at:
http://localhost:3001

2. Start the Frontend

Open a second terminal and navigate to the frontend folder:
cd HealthCoverSim/frontend
Install the frontend dependencies:
npm install
Start the React development server:
npm run dev
Open the Vite URL shown in the terminal, normally:
http://localhost:5173

Both the backend and frontend need to be running at the same time.

Database Setup

HealthCoverSim uses SQLite with better-sqlite3.

The database is automatically initialised when the backend starts. The database structure is defined in:

backend/init.sql

The SQLite database is: backend/healthcoversim.db

The database stores customer information, cover selections, applicant information, payment frequency, annual discount, notes, and creation time.

#### Quote Calculation

The application calculates quotes using the following rules.

Hospital Cover

Hospital cover prices are calculated per adult per month:

Hospital Cover	Price
None	$0
Basic	$90
Bronze	$120
Silver	$160
Gold	$220
Extras Cover

Extras cover prices are calculated per adult per month:

Extras Cover	Price
None	$0
Basic	$25
Standard	$45
Premium	$70
Lifetime Health Cover (LHC)

LHC loading applies only to hospital cover.

History = Yes → 0% loading
History = No and age is above 30 → (age - 30) × 2%
History = No and age is 30 or below → 0%
History = Not sure → 0% loading with a warning
Hospital cover = None → 0% loading

The application displays the following statement:

Lifetime Health Cover loading applies only to hospital cover. It does not apply to extras cover.

Monthly Premium

The monthly premium is calculated as:

- Hospital Total + Extras Total + Family Fee
- Yearly Premium

The yearly price before discount is:

- Monthly Premium × 12

When Yearly payment is selected, the annual discount is applied:

- Yearly After Discount =
- Yearly Before Discount × (1 - Annual Discount)

The annual discount can be between 0% and 10%.

Family Calculation

Family cover represents two adults.

A Family quote includes:

- Two adult hospital cover calculations
- Two adult extras cover calculations
-  additional $30 monthly family fee

No child ages are required.

For example:

Family Fee = $30/month
CRUD Features

The application supports the following CRUD operations:

Create — create a new insurance quote
Read — view saved quotes and detailed quote information
Update — edit and update an existing quote
Delete — delete an existing quote

Quote calculations are performed when the quote details are displayed.

Validation

The application includes frontend and backend validation.

Examples include:

Customer name is required
Applicant ages must be between 18 and 100
Applicant 2 information is required for Couple and Family cover
Cover selections must be valid
Payment frequency must be Monthly or Yearly
Annual discount must be between 0% and 10%
A warning is displayed when hospital cover history is "Not sure"

Annual discount is only applied when Yearly payment is selected.

AI Use

AI tools were used during development to assist with code generation, debugging, code structure, and understanding implementation requirements.

The generated code was reviewed, modified where necessary, and tested manually to ensure that the application met the assignment requirements.

Limitation

HealthCoverSim is a simulation and does not use live private health insurance provider data or live insurance pricing.

The prices and calculation rules are based on the requirements provided for this assignment.