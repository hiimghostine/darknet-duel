export class GameHistory {
  id?: number;
  gameId: string;
  players: {
    id: string;
    name: string;
    role: string;
  }[];
  turns: {
    turnNumber: number;
    playerId: string;
    action: string;
    timestamp: Date;
  }[];
  gameMode: string;
  startTime: Date;
  endTime: Date;
  createdAt: Date;
}
