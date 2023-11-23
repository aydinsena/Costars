# Costars

## Introduction

Costars is a web application built on Node.js and Express that allows users to interact with cryptocurrency data, manage their favorite coins, track wallet values, and more.

## Installation

To run the project locally, follow these steps:

1. Clone the repository: `git clone <repository_url>`
2. Navigate to the project directory: `cd Costars`
3. Install dependencies: `npm install`

## Configuration

Ensure you have a `.env` file in the root directory with the necessary environment variables:

```plaintext
PORT=3000
SESSION_SECRET=your_session_secret
MONGODB_URI=your_mongodb_uri
RAPIDAPI_KEY=your_rapidapi_key
```

## Usage

### Starting the Server

- For development: `npm run dev`
- For production: `npm start`

### Routes and Functionalities

- **Dashboard**
  - Route: `/dashboard`
  - Functionality: Displays a user's favorite cryptocurrency data and wallet values.
- **Wallet**
  - Route: `/wallet`
  - Functionality: Allows users to manage their wallet by adding cryptocurrencies and viewing their current worth.
- **Coins**

  - Route: `/coins`
  - Functionality: Displays available cryptocurrency data and enables users to add coins to their favorites.

- **News**
  - Route: `/news`
  - Functionality: Fetches cryptocurrency-related news using a third-party API.
- **User Profile Editing**

  - Route: `/edit`
  - Functionality: Allows users to edit their profile information, including name, email, and password.

- **User Account Deletion**
  - Route: `/delete`
  - Functionality: Deletes the user's account.

## Dependencies

- `axios`: Making HTTP requests to cryptocurrency APIs.
- `bcrypt`: Encrypting and hashing user passwords.
- `connect-mongo`: Storing session data in MongoDB.
- `cookie-parser`: Parsing cookies for session management.
- `dotenv`: Loading environment variables.
- `express`: Web application framework.
- `express-session`: Managing user sessions.
- `hbs`: Templating engine for HTML rendering.
- `mongoose`: Object Data Modeling (ODM) for MongoDB.
- `morgan`: Logging HTTP requests.
- `serve-favicon`: Serving favicon.

## Development Dependencies

- `nodemon`: Automatically restarting the server during development.

## Contributing

Contributions to the project are welcome! Feel free to fork the repository, create a new branch, make changes, and submit a pull request.
