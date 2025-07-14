#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting Darknet Duel Development Environment...${NC}"

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Check if tmux is installed
if ! command_exists tmux; then
  echo -e "${RED}tmux is not installed. Please install it to run this script.${NC}"
  exit 1
fi

# Create a new tmux session if not already in one
if [ -z "$TMUX" ]; then
  SESSION_NAME="darknet-duel-dev"
  tmux new-session -d -s $SESSION_NAME

  # Window 1: Backend Server
  echo -e "${GREEN}Starting Backend Server...${NC}"
  tmux send-keys -t $SESSION_NAME "cd /home/thunder/DND/imp3/backend-server && npm run dev" C-m

  # Window 2: Game Server
  echo -e "${GREEN}Starting Game Server...${NC}"
  tmux split-window -h -t $SESSION_NAME
  tmux send-keys -t $SESSION_NAME "cd /home/thunder/DND/imp3/game-server && npm run dev" C-m

  # Window 3: Frontend
  echo -e "${GREEN}Starting Frontend...${NC}"
  tmux split-window -v -t $SESSION_NAME
  tmux send-keys -t $SESSION_NAME "cd /home/thunder/DND/imp3/darknet-duel-frontend && npm run dev" C-m

  # Select the first pane
  tmux select-pane -t $SESSION_NAME:0.0

  # Attach to the session
  tmux attach-session -t $SESSION_NAME
else
  echo -e "${RED}Already in a tmux session. Please exit the current session and run the script again.${NC}"
  exit 1
fi
