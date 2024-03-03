# Chat App Frontend

![image](https://github.com/ZdravDim/Chat-App-Front-Web/assets/72796409/c818c7bd-c506-41ed-8bb3-b98929f4a15f)

![image](https://github.com/ZdravDim/Chat-App-Front-Web/assets/72796409/7fd558aa-e0d9-429b-b598-9defbe6e307e)

![image](https://github.com/ZdravDim/Chat-App-Front-Web/assets/72796409/e0f2fbd6-9745-4599-940f-91c0ff1ae83e)

![image](https://github.com/ZdravDim/Chat-App-Front-Web/assets/72796409/d287c7bb-baec-4fe7-b4a6-d642d942d436)

## Short description

- Multi-Room Chat App with user authentication
- The project is still in progress

## Technologies

- React
- Bootstrap
- Firebase auth - phone authentication
- JWT authentication
- Socket.IO for WebSocket connection
- Docker

## GitHub Pages

- App is live on: https://zdravdim.github.io/Chat-App-Front-Web/#/login

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
