const axios = require('axios');
const io = require('socket.io-client');
const { faker } = require('@faker-js/faker');

class VirtualUser {
    constructor(backendUrl, gameServerUrl) {
        this.backendUrl = backendUrl;
        this.gameServerUrl = gameServerUrl;

        // Generate a base name, strip specials, limit length to allow suffix
        const baseName = faker.internet.userName().replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);
        // Append random 5-char string to ensure uniqueness and meet min length (6)
        const suffix = faker.string.alphanumeric(5);
        this.username = `${baseName}${suffix}`;

        // Ensure email is also unique by using the unique username
        this.email = `${this.username}@example.com`;

        this.password = 'Pass123!@#'; // Meets complexity requirements
        this.token = null;
        this.userId = null;
        this.socket = null;
        this.matchID = null;
        this.playerID = null;
        this.credentials = null;
    }

    _formatError(error) {
        let msg = error.message;
        if (error.response) {
            msg += ` (Status: ${error.response.status})`;
            if (error.response.data) {
                const dataStr = typeof error.response.data === 'object'
                    ? JSON.stringify(error.response.data)
                    : error.response.data;
                msg += ` Data: ${dataStr}`;
            }
        }
        return msg;
    }

    async register() {
        const start = Date.now();
        try {
            const response = await axios.post(`${this.backendUrl}/api/auth/register`, {
                username: this.username,
                email: this.email,
                password: this.password
            });
            return { success: true, duration: Date.now() - start, data: response.data };
        } catch (error) {
            return { success: false, duration: Date.now() - start, error: this._formatError(error) };
        }
    }

    async login() {
        const start = Date.now();
        try {
            const response = await axios.post(`${this.backendUrl}/api/auth/login`, {
                email: this.email,
                password: this.password
            });
            this.token = response.data.token;
            this.userId = response.data.user.id;
            return { success: true, duration: Date.now() - start, data: response.data };
        } catch (error) {
            return { success: false, duration: Date.now() - start, error: this._formatError(error) };
        }
    }

    async getProfile() {
        if (!this.token) throw new Error('Not logged in');
        const start = Date.now();
        try {
            const response = await axios.get(`${this.backendUrl}/api/auth/profile`, {
                headers: { Authorization: `Bearer ${this.token}` }
            });
            return { success: true, duration: Date.now() - start, data: response.data };
        } catch (error) {
            return { success: false, duration: Date.now() - start, error: this._formatError(error) };
        }
    }

    async createLobby() {
        const start = Date.now();
        try {
            // Boardgame.io create match endpoint
            const response = await axios.post(`${this.gameServerUrl}/games/darknet-duel/create`, {
                numPlayers: 2,
                setupData: {
                    lobbyName: `${this.username}'s Lobby`
                }
            });
            this.matchID = response.data.matchID;
            return { success: true, duration: Date.now() - start, matchID: this.matchID };
        } catch (error) {
            return { success: false, duration: Date.now() - start, error: this._formatError(error) };
        }
    }

    async joinLobby(matchID, playerID) {
        const start = Date.now();
        try {
            // Boardgame.io join match endpoint
            // IMPORTANT: We must pass realUserId and realUsername in the 'data' field
            // as the server intercepts this to validate and store user info.
            const response = await axios.post(`${this.gameServerUrl}/games/darknet-duel/${matchID}/join`, {
                playerID: playerID,
                playerName: this.username,
                data: {
                    realUserId: this.userId,
                    realUsername: this.username
                }
            });

            this.matchID = matchID;
            this.playerID = playerID;
            this.credentials = response.data.playerCredentials;

            return { success: true, duration: Date.now() - start, credentials: this.credentials };
        } catch (error) {
            return { success: false, duration: Date.now() - start, error: this._formatError(error) };
        }
    }

    async connectSocket() {
        if (!this.matchID || !this.playerID || !this.credentials) {
            throw new Error('Must join lobby before connecting socket');
        }

        const start = Date.now();
        return new Promise((resolve) => {
            this.socket = io(this.gameServerUrl, {
                transports: ['websocket'],
                query: {
                    gameID: this.matchID,
                    playerID: this.playerID,
                    credentials: this.credentials
                }
            });

            this.socket.on('connect', () => {
                resolve({ success: true, duration: Date.now() - start });
            });

            this.socket.on('connect_error', (err) => {
                resolve({ success: false, duration: Date.now() - start, error: err.message });
            });
        });
    }

    async updateProfile() {
        if (!this.token) throw new Error('Not logged in');
        const start = Date.now();
        try {
            const response = await axios.put(`${this.backendUrl}/api/account/me`,
                { bio: `Stress test` },
                { headers: { Authorization: `Bearer ${this.token}` } }
            );
            return { success: true, duration: Date.now() - start, data: response.data };
        } catch (error) {
            return { success: false, duration: Date.now() - start, error: this._formatError(error) };
        }
    }

    async searchUser() {
        if (!this.token) throw new Error('Not logged in');
        const start = Date.now();
        try {
            const response = await axios.get(`${this.backendUrl}/api/account/search`, {
                params: { username: this.username },
                headers: { Authorization: `Bearer ${this.token}` }
            });
            return { success: true, duration: Date.now() - start, data: response.data };
        } catch (error) {
            return { success: false, duration: Date.now() - start, error: this._formatError(error) };
        }
    }



    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
        }
    }
}

module.exports = VirtualUser;
