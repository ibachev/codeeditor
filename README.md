# The Gist

## Overview

This project consists of a NestJS backend and a React frontend. It utilizes Docker to manage the PostgreSQL database.

## Prerequisites

- [Docker](https://www.docker.com/get-started) (Make sure Docker is installed and running on your machine)
- [Node.js](https://nodejs.org/) (for running the React frontend)

## Installation

### Backend Setup

1. Navigate to the `backend` folder and run the following commands:

   ```bash
   cd backend
   docker-compose up -d
   npm install
   npm run start:dev
   ```

### Frontend Setup

1. Navigate to the `frontend` folder and run the following commands:

   ```bash
   cd ../frontend
   npm install
   npm start
   ```
