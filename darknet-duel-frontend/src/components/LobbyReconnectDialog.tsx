import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress
} from '@mui/material';
import { Wifi, WifiOff } from 'lucide-react';

interface LobbyReconnectDialogProps {
  open: boolean;
  matchID: string;
  onReconnect: () => void;
  onDismiss: () => void;
  isValidating?: boolean;
}

export const LobbyReconnectDialog: React.FC<LobbyReconnectDialogProps> = ({
  open,
  matchID,
  onReconnect,
  onDismiss,
  isValidating = false
}) => {
  return (
    <Dialog
      open={open}
      onClose={onDismiss}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Wifi size={24} color="#4CAF50" />
          <Typography variant="h6" fontWeight={600}>
            Active Lobby Found
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {isValidating ? (
          <Box display="flex" flexDirection="column" alignItems="center" gap={2} py={3}>
            <CircularProgress size={40} />
            <Typography variant="body2" color="text.secondary">
              Validating lobby session...
            </Typography>
          </Box>
        ) : (
          <Box>
            <Typography variant="body1" gutterBottom>
              You have an active lobby session from a previous visit.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Lobby ID: <code style={{ 
                background: 'rgba(255,255,255,0.1)', 
                padding: '2px 6px', 
                borderRadius: '4px',
                fontFamily: 'monospace'
              }}>{matchID}</code>
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Would you like to reconnect to this lobby?
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button
          onClick={onDismiss}
          variant="outlined"
          startIcon={<WifiOff size={18} />}
          disabled={isValidating}
          sx={{
            borderColor: 'rgba(255, 255, 255, 0.2)',
            color: 'text.secondary',
            '&:hover': {
              borderColor: 'rgba(255, 255, 255, 0.3)',
              background: 'rgba(255, 255, 255, 0.05)'
            }
          }}
        >
          Dismiss
        </Button>
        <Button
          onClick={onReconnect}
          variant="contained"
          startIcon={<Wifi size={18} />}
          disabled={isValidating}
          sx={{
            background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #45a049 0%, #3d8b40 100%)'
            }
          }}
        >
          Reconnect
        </Button>
      </DialogActions>
    </Dialog>
  );
};
