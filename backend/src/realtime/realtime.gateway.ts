// src/realtime/realtime.gateway.ts
import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { RealtimeService } from './realtime.service.js';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
    cors: true,               // adjust for your front‑end origin
    namespace: '/ws/realtime',  // ws://host/realtime
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
    constructor(
        private readonly jwtService: JwtService,
        private readonly realtimeService: RealtimeService,
        private readonly config: ConfigService,
    ) { }

    // Called when a client opens a socket
    async handleConnection(client: Socket) {
        // Expect JWT in query string: ws://host/realtime?token=...
        const token = client.handshake.query?.token as string;
        if (!token) {
            client.disconnect();
            return;
        }
        try {
            const payload = this.jwtService.verify(token, {
                secret: this.config.get<string>('JWT_SECRET'),
            });
            // Attach user info to socket for later use
            (client as any).user = payload;
        } catch (e) {
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        // optional cleanup
    }

    // -----------------------------------------------------------------
    // Join a document room
    @SubscribeMessage('join')
    async handleJoin(
        @MessageBody() data: { documentId: string },
        @ConnectedSocket() client: Socket,
    ) {
        client.join(data.documentId);
        // Optionally send the latest snapshot
        const snapshot = await this.realtimeService.getLatestSnapshot(data.documentId);
        client.emit('snapshot', snapshot);
    }

    // -----------------------------------------------------------------
    // Receive an edit (Yjs update, JSON patch, etc.)
    @SubscribeMessage('edit')
    async handleEdit(
        @MessageBody() data: { documentId: string; update: any },
        @ConnectedSocket() client: Socket,
    ) {
        // Broadcast to everyone else in the same room
        client.to(data.documentId).emit('edit', {
            userId: (client as any).user.sub,
            update: data.update,
        });

        // Persist a version (you can debounce this if you store every keystroke)
        await this.realtimeService.persistVersion(
            data.documentId,
            data.update,
            (client as any).user.sub,
        );
    }
}