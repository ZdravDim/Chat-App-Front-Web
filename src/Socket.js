import { io } from 'socket.io-client';

const URL = 'http://localhost:3001';

const jwt = localStorage.getItem("jwt")

export const socket = io(URL, {
    extraHeaders: {
        Authorization: jwt
    }
  });