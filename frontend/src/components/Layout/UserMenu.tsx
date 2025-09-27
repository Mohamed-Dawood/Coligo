import React from 'react';
import {
  Menu,
  MenuItem,
  IconButton,
  Avatar,
  Typography,
  Box,
  Divider,
} from '@mui/material';
import {
  AccountCircle as AccountCircleIcon,
  Settings as SettingsIcon,
  ExitToApp as ExitToAppIcon,
} from '@mui/icons-material';

interface UserMenuProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  onLogout: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ user, onLogout }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <IconButton onClick={handleClick} size="small" sx={{ ml: 2 }}>
        <Avatar
          alt={user.name}
          src={user.avatar}
          sx={{ width: 32, height: 32 }}
        >
          {user.name.charAt(0)}
        </Avatar>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
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
        <MenuItem>
          <Avatar src={user.avatar}>{user.name.charAt(0)}</Avatar>
          <Box>
            <Typography variant="subtitle1">{user.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {user.email}
            </Typography>
          </Box>
        </MenuItem>
        <Divider />
        <MenuItem>
          <AccountCircleIcon sx={{ mr: 2 }} />
          Profile
        </MenuItem>
        <MenuItem>
          <SettingsIcon sx={{ mr: 2 }} />
          Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={onLogout}>
          <ExitToAppIcon sx={{ mr: 2 }} />
          Logout
        </MenuItem>
      </Menu>
    </div>
  );
};
