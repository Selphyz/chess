import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

@WebSocketGateway()
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // In-memory mapping: gameId -> Set of userIds
  private gameRooms: Map<string, Set<string>> = new Map();
  // In-memory mapping: clientId -> gameId
  private clientGame: Map<string, string> = new Map();

  constructor(private readonly configService: ConfigService) {}

  async handleConnection(client: Socket) {
    try {
      // Try to get token from Authorization header (Bearer) or query param
      let token: string | undefined;

      // Prefer Authorization header
      const authHeader = client.handshake.headers['authorization'] as string | undefined;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.slice(7);
      } else if (client.handshake.query && typeof client.handshake.query.token === 'string') {
        token = client.handshake.query.token;
      }

      if (!token) {
        client.disconnect(true);
        return;
      }

      const secret = this.configService.get<string>('JWT_SECRET');
      if (!secret) {
        client.disconnect(true);
        return;
      }

      // Verify token
      const payload = jwt.verify(token, secret) as any;
      // Attach user info to client (mimic JwtStrategy.validate)
      client.data.user = {
        userId: payload.sub,
        username: payload.username,
      };

      console.log(`Client connected: ${client.id}, user: ${payload.username}`);
    } catch (err) {
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    // Remove user from game room if present
    const gameId = this.clientGame.get(client.id);
    if (gameId) {
      const userId = client.data.user?.userId;
      const room = this.gameRooms.get(gameId);
      if (room && userId) {
        room.delete(userId);
        if (room.size === 0) {
          this.gameRooms.delete(gameId);
        }
      }
      this.clientGame.delete(client.id);
      // Optionally, notify the other user in the room
      this.server.to(gameId).emit('playerLeft', { userId });
    }
  }

  // User joins a game room
  // data: { gameId: string }
  @SubscribeMessage('joinGame')
  async handleJoinGame(client: Socket, data: { gameId: string }) {
    const user = client.data.user;
    if (!user || !data?.gameId) {
      client.emit('error', { message: 'Invalid join request' });
      return;
    }
    const { gameId } = data;
    let room = this.gameRooms.get(gameId);
    if (!room) {
      room = new Set();
      this.gameRooms.set(gameId, room);
    }
    // Only allow two unique users per game
    if (room.size >= 2 && !room.has(user.userId)) {
      client.emit('error', { message: 'Game room full' });
      return;
    }
    // Join the socket.io room
    client.join(gameId);
    room.add(user.userId);
    this.clientGame.set(client.id, gameId);

    // Notify both users of successful join
    this.server.to(gameId).emit('playerJoined', {
      userId: user.userId,
      username: user.username,
      players: Array.from(room),
    });
  }

  // User sends a move
  // data: { gameId: string, move: any }
  @SubscribeMessage('move')
  async handleMove(client: Socket, data: { gameId: string; move: any }) {
    const user = client.data.user;
    if (!user || !data?.gameId || !data?.move) {
      client.emit('error', { message: 'Invalid move data' });
      return;
    }
    const { gameId, move } = data;
    const room = this.gameRooms.get(gameId);
    if (!room || !room.has(user.userId)) {
      client.emit('error', { message: 'Not a participant in this game' });
      return;
    }
    // Broadcast move to the other user in the room
    client.to(gameId).emit('move', {
      userId: user.userId,
      move,
    });
  }
}