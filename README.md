# Chat App Frontend

![image](https://github.com/ZdravDim/Chat-App-Front-Web/assets/72796409/dd9a12a8-a626-4085-911c-1a9579840395)

![image](https://github.com/ZdravDim/Chat-App-Front-Web/assets/72796409/10cfc0fc-5ac5-4144-8d8f-d86cf94d7a6c)

## Short description

- Multi-Room Chat App with user authentication
- The project is still in progress

## Technologies

- React
- Bootstrap
- Firebase auth - phone authentication
- JWT authentication
- Socket.IO for WebSocket connection

## GitHub Pages

- App is live on: ...

## Installation

- Use the `git clone https://github.com/ZdravDim/Chat-App-Front-Web.git` command to clone the project and then `npm install` to install dependencies.

## Starting up the project

### Both frontend and backend

- Install [Docker](https://www.docker.com/products/docker-desktop)
- Download https://github.com/ZdravDim/Chat-App-Front-Web/blob/main/docker-compose.yaml
- Use the `cd` command to navigate to folder containing downloaded file
- Then run `docker-compose up`
- Frontend will run on http://localhost:3000
- Backend will run on http://localhost:3001

### Only frontend (will not run well without backend)
- Run `npm run build` to create a production build, then `npm install -g serve` to install [serve](https://github.com/vercel/serve) then `serve -s build` to serve static files, it will run on http://localhost:3000
