import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { auth } from '../firebase';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Typography, 
  FormControlLabel,
  Checkbox,
  Snackbar,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EmailIcon from '@mui/icons-material/Email';

function ShareEvent() {
  const { id } = useParams();
  const [shareCode, setShareCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [permissions, setPermissions] = useState({
    canUpload: true,
    canView: true,
    canDownload: true
  });
  const [showQR, setShowQR] = useState(false);

  const generateShareLink = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const user = auth.currentUser;
      if (!user || !user.email) {
        throw new Error('User not authenticated');
      }

      const response = await axiosInstance.post(`/events/${id}/share`, {
        permissions
      });

      if (response.data && response.data.shareCode) {
        setShareCode(response.data.shareCode);
        setSuccess('Share link generated successfully!');
        setShowQR(true);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      setError(error.message || 'Failed to generate share link');
    } finally {
      setLoading(false);
    }
  };

  const getShareUrl = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/events/share/${shareCode}`;
  };

  const copyToClipboard = () => {
    const shareUrl = getShareUrl();
    navigator.clipboard.writeText(shareUrl);
    setSuccess('Link copied to clipboard!');
  };

  const shareViaWhatsApp = () => {
    const shareUrl = getShareUrl();
    const message = `Join my event on EventSnap Organizer! Click here: ${shareUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`);
  };

  const shareViaEmail = () => {
    const shareUrl = getShareUrl();
    const subject = 'Join my event on EventSnap Organizer';
    const body = `I've created an event on EventSnap Organizer and I'd like you to join!\n\nClick here to access the event: ${shareUrl}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, p: 2 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Share Your Event
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Permissions
            </Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked={permissions.canUpload}
                  onChange={(e) => setPermissions({ ...permissions, canUpload: e.target.checked })}
                />
              }
              label="Allow photo uploads"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={permissions.canView}
                  onChange={(e) => setPermissions({ ...permissions, canView: e.target.checked })}
                />
              }
              label="Allow viewing photos"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={permissions.canDownload}
                  onChange={(e) => setPermissions({ ...permissions, canDownload: e.target.checked })}
                />
              }
              label="Allow downloading photos"
            />
          </Box>

          <Button
            variant="contained"
            onClick={generateShareLink}
            disabled={loading}
            fullWidth
            sx={{ mb: 2 }}
          >
            {loading ? 'Generating...' : 'Generate Share Link'}
          </Button>

          {shareCode && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Share Code: {shareCode}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Tooltip title="Copy Link">
                  <IconButton onClick={copyToClipboard}>
                    <ContentCopyIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Share via WhatsApp">
                  <IconButton onClick={shareViaWhatsApp}>
                    <WhatsAppIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Share via Email">
                  <IconButton onClick={shareViaEmail}>
                    <EmailIcon />
                  </IconButton>
                </Tooltip>
              </Box>

              {showQR && (
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Scan QR Code
                  </Typography>
                  <QRCodeSVG
                    value={getShareUrl()}
                    size={200}
                    level="H"
                  />
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    Scan this code to join the event
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          <Snackbar
            open={!!success}
            autoHideDuration={3000}
            onClose={() => setSuccess('')}
          >
            <Alert severity="success" onClose={() => setSuccess('')}>
              {success}
            </Alert>
          </Snackbar>

          <Snackbar
            open={!!error}
            autoHideDuration={3000}
            onClose={() => setError('')}
          >
            <Alert severity="error" onClose={() => setError('')}>
              {error}
            </Alert>
          </Snackbar>
        </CardContent>
      </Card>
    </Box>
  );
}

export default ShareEvent; 