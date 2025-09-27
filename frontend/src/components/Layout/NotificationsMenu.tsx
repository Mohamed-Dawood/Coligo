import React from 'react';
import {
  Menu,
  MenuItem,
  IconButton,
  Badge,
  Typography,
  Box,
  Divider,
  Avatar,
} from '@mui/material';
import { Notifications as NotificationsIcon } from '@mui/icons-material';

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  sender: {
    name: string;
    avatar?: string;
  };
}

interface NotificationsMenuProps {
  notifications: Notification[];
  onNotificationClick: (notificationId: string) => void;
}

export const NotificationsMenu: React.FC<NotificationsMenuProps> = ({
  notifications,
  onNotificationClick,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (notificationId: string) => {
    onNotificationClick(notificationId);
    handleClose();
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  return (
    <>
      <IconButton size="large" color="inherit" onClick={handleClick}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            width: 360,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2, pb: 1 }}>
          <Typography variant="h6" component="div">
            Notifications
          </Typography>
        </Box>
        <Divider />
        {notifications.length === 0 ? (
          <div>
            <MenuItem>
              <Typography variant="body2" color="text.secondary">
                No notifications
              </Typography>
            </MenuItem>
          </div>
        ) : (
          <div>
            {notifications.map((notification, index) => (
              <div key={notification.id}>
                <MenuItem
                  onClick={() => handleNotificationClick(notification.id)}
                  sx={{
                    py: 1.5,
                    px: 2,
                    bgcolor: notification.read ? 'transparent' : 'action.hover',
                  }}
                >
                  <Avatar src={notification.sender.avatar}>
                    {notification.sender.name.charAt(0)}
                  </Avatar>
                  <Box sx={{ ml: 1 }}>
                    <Typography variant="subtitle2" component="div">
                      {notification.sender.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {notification.message}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {notification.timestamp}
                    </Typography>
                  </Box>
                </MenuItem>
                {index < notifications.length - 1 && <Divider />}
              </div>
            ))}
          </div>
        )}
      </Menu>
    </>
  );
};
