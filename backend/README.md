<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
## WebSocket API: Chess Game Interaction

This backend exposes a WebSocket API (using Socket.IO) for real-time chess game interaction between authenticated users.

### Connecting to the WebSocket Server

- **URL:**  
  The WebSocket server is available at the same host as the backend, using the default Socket.IO path (`/socket.io`).  
  Example: `ws://<backend-host>:<port>/socket.io/` (for local development, typically `ws://localhost:3000/socket.io/`).

- **Authentication (JWT Required):**  
  All WebSocket connections require a valid JWT. If authentication fails, the connection is immediately closed.
  - **How to provide the JWT:**  
    - **Preferred:** Set the `Authorization` header as `Bearer <token>`.
    - **Alternative:** Pass the token as a `token` query parameter in the connection URL.

  **Example (using Socket.IO client in JavaScript):**
  ```js
  import { io } from "socket.io-client";
  const socket = io("http://localhost:3000", {
    extraHeaders: {
      Authorization: "Bearer <your-jwt-token>"
    }
    // OR, as a query param:
    // query: { token: "<your-jwt-token>" }
  });
  ```

### Events

#### 1. `joinGame`
- **Client emits:**  
  ```json
  { "gameId": "string" }
  ```
- **Behavior:**  
  - Joins the user to the specified game room.
  - Only two unique users are allowed per game. If a third user attempts to join, an error is returned.
- **Server emits to room:**  
  - `playerJoined`
    ```json
    {
      "userId": "string",
      "username": "string",
      "players": ["userId1", "userId2"]
    }
    ```
- **Errors:**  
  - If the room is full:  
    ```json
    { "message": "Game room full" }
    ```
  - If the request is invalid:  
    ```json
    { "message": "Invalid join request" }
    ```

#### 2. `move`
- **Client emits:**  
  ```json
  { "gameId": "string", "move": { /* move data */ } }
  ```
- **Behavior:**  
  - Only users who have joined the game room can send moves.
  - The move is broadcast to the other user in the room.
- **Server emits to other user:**  
  - `move`
    ```json
    {
      "userId": "string",
      "move": { /* move data */ }
    }
    ```
- **Errors:**  
  - If not a participant in the game:  
    ```json
    { "message": "Not a participant in this game" }
    ```
  - If the request is invalid:  
    ```json
    { "message": "Invalid move data" }
    ```

#### 3. Disconnection and Room Events
- When a user disconnects, the server emits to the room:
  - `playerLeft`
    ```json
    { "userId": "string" }
    ```

### Error Handling & Edge Cases

- **Authentication Failure:**  
  If a user connects without a valid JWT, the server disconnects the client immediately.
- **Room Full:**  
  Only two users can join a game room. A third user attempting to join receives an error and is not added.
- **Not a Participant:**  
  Users not in a game room cannot send moves to that room.
- **Invalid Payloads:**  
  Any event with missing or malformed data results in an `error` event with a descriptive message.
- **Disconnection:**  
  When a user disconnects, they are removed from the game room, and the remaining user is notified via `playerLeft`.

### Example Usage

**Joining a game:**
```js
socket.emit("joinGame", { gameId: "abc123" });
```

**Sending a move:**
```js
socket.emit("move", { gameId: "abc123", move: { from: "e2", to: "e4" } });
```

**Handling events:**
```js
socket.on("playerJoined", (data) => { /* ... */ });
socket.on("move", (data) => { /* ... */ });
socket.on("playerLeft", (data) => { /* ... */ });
socket.on("error", (err) => { /* ... */ });
```

### Notes

- All events and responses are in JSON format.
- The JWT secret is configured in the backend environment.
- This API is intended for use by authenticated frontend clients or API consumers.
