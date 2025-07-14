import { DataSource } from "typeorm";
import dotenv from 'dotenv';
import { Account } from "../entities/account.entity";
import { GameResult } from "../entities/game-result.entity";
import { GamePlayer } from "../entities/game-player.entity";
import { PlayerRating } from "../entities/player-rating.entity";
import { RatingHistory } from "../entities/rating-history.entity";

// Load environment variables
dotenv.config();

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306"),
  username: process.env.DB_USERNAME || "root",
  password: process.env.DB_PASSWORD || "example",
  database: process.env.DB_NAME || "darknet_duel",
  synchronize: process.env.NODE_ENV === "development", // Only use in development
  logging: process.env.NODE_ENV === "development",
  entities: [Account, GameResult, GamePlayer, PlayerRating, RatingHistory],
  migrations: [],
  subscribers: [],
});
