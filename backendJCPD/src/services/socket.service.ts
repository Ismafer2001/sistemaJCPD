import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import 'dotenv/config';
// Definimos la estructura de la notificación
interface NotificacionRemision {
  mensaje: string;
  codigoTramite: string;
  origen: string;
}

export class SocketService {
  private io: Server;

  constructor(server: HttpServer) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.URL, // URL de tu Angular cambiar luego*******
        methods: ["GET", "POST"]
      }
    });

    this.configurarEventos();
  }

  private configurarEventos(): void {
    this.io.on('connection', (socket: Socket) => {
      // Obtenemos el cantón desde el query de conexión (enviado por el cliente)
      const idCanton = socket.handshake.query.id_canton as string;
     

      if (idCanton) {
        socket.join(`sala_canton_${idCanton}`);
        console.log(`Usuario conectado y unido a: sala_canton_${idCanton}`);
      }

      socket.on('disconnect', () => {
        console.log('Usuario desconectado');
      });
    });
  }

  // Método para emitir la notificación desde cualquier parte del backend
  public notificarNuevoCaso(idCantonDestino: string, datos: NotificacionRemision): void {
    this.io.to(`sala_canton_${idCantonDestino}`).emit('nuevo_caso_remitido', datos);
  }
}