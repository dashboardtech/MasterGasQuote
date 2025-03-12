# Master Gas Quote System

A comprehensive quoting system for gas station construction and equipment.

## Project Overview

This system allows users to create and manage quotes for gas station construction projects, including components like tanks, dispensers, and construction items.

## Key Features

- Quote creation and management
- Component selection (tanks, dispensers, etc.)
- Construction division items integration
- Cost calculation and reporting

## Technology Stack

- **Frontend**: React with TypeScript, Tailwind CSS, React Query
- **Backend**: Node.js with Express
- **Database**: SQLite (development) / PostgreSQL (production)
- **ORM**: Drizzle ORM

## Development Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/dashboardtech/MasterGasQuote.git
   ```

2. Install dependencies:

   ```bash
   cd MasterGasQuote
   npm install
   ```

3. Setup environment variables:

   ```bash
   cp .env.example .env
   ```

4. Run the database migrations:

   ```bash
   npm run db:migrate
   ```

5. Start the development server:

   ```bash
   npm run dev
   ```

## Project Structure

- `/client` - Frontend React application
- `/server` - Backend API and server code
- `/shared` - Shared types and utilities
- `/tools` - Development and utility scripts

## Recent Updates

- Added construction items selector
- Fixed quote component selection
- Implemented TypeScript error handling
- Improved SQLite JSON field handling
- Enhanced error logging

## License

Proprietary - All rights reserved
