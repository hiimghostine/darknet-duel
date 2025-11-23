import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getActiveMatch, clearActiveMatch, migrateOldLobbyStorage } from '../utils/lobbyStorage';
import { lobbyService } from '../services/lobby.service';

/**
 * Hook to handle automatic lobby reconnection
 * 
 * - Checks for active lobby in localStorage on mount
 * - Validates if lobby still exists
 * - Auto-redirects to lobby if valid
 * - Cleans up dead lobbies silently
 */
export const useLobbyReconnect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [reconnecting, setReconnecting] = useState(false);

  useEffect(() => {
    const checkAndReconnect = async () => {
      try {
        console.log('🔍 RECONNECT: Checking for active lobby...');
        console.log('   Current path:', location.pathname);
        
        // First, migrate old localStorage keys
        migrateOldLobbyStorage();

        // Don't check if we're already on a lobby page
        if (location.pathname.startsWith('/lobbies/') || location.pathname.startsWith('/game/')) {
          console.log('   ✅ Already on lobby/game page, skipping check');
          setIsChecking(false);
          return;
        }

        // Check for active match
        const activeMatch = getActiveMatch();
        
        if (!activeMatch) {
          console.log('   ℹ️ No active lobby found in storage');
          setIsChecking(false);
          return;
        }

        console.log(`🔍 Found active lobby in storage: ${activeMatch.matchID}`);
        console.log(`   Player ID: ${activeMatch.playerID}`);
        console.log(`   Validating if lobby still exists...`);

        // Validate if lobby still exists
        const match = await lobbyService.getMatch(activeMatch.matchID);

        if (!match) {
          console.log(`❌ Lobby ${activeMatch.matchID} no longer exists. Cleaning up...`);
          clearActiveMatch();
          setIsChecking(false);
          return;
        }

        // Check if the lobby is still joinable (not in-game or abandoned)
        const state = match.setupData.state || 'waiting';
        
        if (state === 'abandoned') {
          console.log(`❌ Lobby ${activeMatch.matchID} was abandoned. Cleaning up...`);
          clearActiveMatch();
          setIsChecking(false);
          return;
        }

        // Check if user is still in the lobby
        const isStillInLobby = match.players.some(
          player => player.id.toString() === activeMatch.playerID && player.name
        );

        if (!isStillInLobby) {
          console.log(`❌ User no longer in lobby ${activeMatch.matchID}. Cleaning up...`);
          clearActiveMatch();
          setIsChecking(false);
          return;
        }

        // Lobby is valid! Auto-redirect
        console.log(`✅ Lobby ${activeMatch.matchID} is still active. Reconnecting...`);
        setReconnecting(true);
        
        // Small delay for UX
        setTimeout(() => {
          navigate(`/lobbies/${activeMatch.matchID}`, { replace: true });
          setIsChecking(false);
          setReconnecting(false);
        }, 500);

      } catch (error) {
        console.error('Error checking for active lobby:', error);
        // On error, just clear and continue
        clearActiveMatch();
        setIsChecking(false);
      }
    };

    checkAndReconnect();
  }, [navigate, location.pathname]);

  return { isChecking, reconnecting };
};
