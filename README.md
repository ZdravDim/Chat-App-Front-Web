# Chat App Frontend

![image](https://github.com/ZdravDim/Chat-App-Front-Web/assets/72796409/c818c7bd-c506-41ed-8bb3-b98929f4a15f)

![image](https://github.com/ZdravDim/Chat-App-Front-Web/assets/72796409/7fd558aa-e0d9-429b-b598-9defbe6e307e)

![image](https://github.com/ZdravDim/Chat-App-Front-Web/assets/72796409/e0f2fbd6-9745-4599-940f-91c0ff1ae83e)

## Short description

- Multi-Room Chat App with user authentication

## Technologies

- React
- Bootstrap
- Firebase auth - phone authentication
- JWT authentication
- Socket.IO for WebSocket connection
- Docker

## Installation (only frontend)

> [!NOTE]
> Project depends on Firebase configuration, which is set in environment variables, so in order to start up the project by cloning, you need to setup you own Firebase project and put configuration in .env file

- Use the `git clone https://github.com/ZdravDim/Chat-App-Front-Web.git` command to clone the project and then `npm install` to install dependencies.

- Run `npm run build` to create a production build, then `npm install -g serve` to install [serve](https://github.com/vercel/serve) then `serve -s build` to serve static files, it will run on http://localhost:80

## Installation (both frontend and backend)

- Install [Docker](https://www.docker.com/products/docker-desktop)
- Download https://github.com/ZdravDim/Chat-App-Front-Web/blob/main/docker-compose.yaml
- Use the `cd` command to navigate to folder containing downloaded file
- Then run `docker-compose up`
- Frontend will run on http://localhost:80
- Backend will run on http://localhost:8080
