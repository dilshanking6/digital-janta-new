# Digital Janta

Digital Janta is a comprehensive school management system designed for Janta +2 High School. It features portals for Students, Teachers, and the Principal, built with React and Express, and utilizes Google Sheets as a database.

## Features

- **Student Portal:** Access to notices, chat, and notifications.
- **Teacher Portal:** Mark attendance, send messages, and communicate with students/parents.
- **Principal Portal:** Overlook school activities, manage notices, and high-level communications.
- **Real-time Notifications:** Stay updated with school events and private messages.
- **Google Sheets Integration:** Lightweight and easy-to-manage database system.

## Tech Stack

- **Frontend:** React.js, Vite, Lucide React, CSS3.
- **Backend:** Node.js, Express 5, JWT for authentication.
- **Database:** Google Sheets API.

## Getting Started

### Prerequisites
- Node.js (Latest version recommended)
- Google Sheets API credentials

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/dilshanking6/digital-janta-new.git
   ```

2. Install dependencies for the server:
   ```bash
   cd digital-janta/server
   npm install
   ```

3. Install dependencies for the client:
   ```bash
   cd ../client
   npm install
   ```

4. Set up your `.env` files in both `client` and `server` directories with your API keys and configuration.

### Running the App

1. Start the server:
   ```bash
   cd server
   node index.js
   ```

2. Start the React development server:
   ```bash
   cd client
   npm run dev
   ```

## Author
Created by **DILSHAN**
