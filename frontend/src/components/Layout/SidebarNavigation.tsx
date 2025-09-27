import React from 'react';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  styled,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  School as SchoolIcon,
  Schedule as ScheduleIcon,
  Grade as GradeIcon,
  Assessment as AssessmentIcon,
  Quiz as QuizIcon,
  Announcement as AnnouncementIcon,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';

const StyledListItemButton = styled(ListItemButton)(() => ({
  '&.Mui-selected': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
  },
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  color: 'white',
  borderRadius: '8px',
  margin: '4px 8px',
  padding: '8px 16px',
}));
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

interface SidebarNavigationProps {
  onNavigate: () => void;
}

interface NavigationItem {
  text: string;
  icon: React.ReactElement;
  path: string;
  roles?: string[];
  children?: NavigationItem[];
}

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  onNavigate,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [openItems, setOpenItems] = React.useState<string[]>([]);

  const navigationItems: NavigationItem[] = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon sx={{ color: 'white' }} />,
      path: '/dashboard',
    },
    {
      text: 'Courses & Materials',
      icon: <SchoolIcon sx={{ color: 'white' }} />,
      path: '/courses',
      children: [
        {
          text: 'All Courses',
          icon: <SchoolIcon />,
          path: '/courses',
        },
        {
          text: 'My Courses',
          icon: <SchoolIcon />,
          path: '/courses/my-courses',
          roles: ['student', 'teacher'],
        },
        {
          text: 'Create Course',
          icon: <SchoolIcon />,
          path: '/courses/create',
          roles: ['teacher', 'admin'],
        },
      ],
    },
    {
      text: 'Class Schedule',
      icon: <ScheduleIcon sx={{ color: 'white' }} />,
      path: '/schedule',
      children: [
        {
          text: "Today's Schedule",
          icon: <ScheduleIcon />,
          path: '/schedule/today',
        },
        {
          text: 'Weekly Schedule',
          icon: <ScheduleIcon />,
          path: '/schedule/weekly',
        },
        {
          text: 'Create Schedule',
          icon: <ScheduleIcon />,
          path: '/schedule/create',
          roles: ['teacher', 'admin'],
        },
      ],
    },
    {
      text: 'Student Grades',
      icon: <GradeIcon sx={{ color: 'white' }} />,
      path: '/gradebook',
      children: [
        {
          text: 'My Grades',
          icon: <GradeIcon />,
          path: '/gradebook/my-grades',
          roles: ['student'],
        },
        {
          text: 'Manage Grades',
          icon: <GradeIcon />,
          path: '/gradebook/manage',
          roles: ['teacher', 'admin'],
        },
      ],
    },
    {
      text: 'Academic Progress',
      icon: <AssessmentIcon sx={{ color: 'white' }} />,
      path: '/performance',
      children: [
        {
          text: 'My Performance',
          icon: <AssessmentIcon />,
          path: '/performance/my-performance',
          roles: ['student'],
        },
        {
          text: 'Course Performance',
          icon: <AssessmentIcon />,
          path: '/performance/course',
          roles: ['teacher', 'admin'],
        },
        {
          text: 'Analytics',
          icon: <AssessmentIcon />,
          path: '/performance/analytics',
          roles: ['admin'],
        },
      ],
    },
    {
      text: 'Tests & Quizzes',
      icon: <QuizIcon sx={{ color: 'white' }} />,
      path: '/quizzes',
      children: [
        {
          text: 'Available Quizzes',
          icon: <QuizIcon />,
          path: '/quizzes/available',
        },
        {
          text: 'Create Quiz',
          icon: <QuizIcon />,
          path: '/quizzes/create',
          roles: ['teacher', 'admin'],
        },
        {
          text: 'Quiz Results',
          icon: <QuizIcon />,
          path: '/quizzes/results',
        },
      ],
    },
    {
      text: 'Class Announcements',
      icon: <AnnouncementIcon sx={{ color: 'white' }} />,
      path: '/announcements',
      children: [
        {
          text: 'All Announcements',
          icon: <AnnouncementIcon />,
          path: '/announcements',
        },
        {
          text: 'Create Announcement',
          icon: <AnnouncementIcon />,
          path: '/announcements/create',
          roles: ['teacher', 'admin'],
        },
      ],
    },
  ];

  const handleItemClick = (item: NavigationItem) => {
    if (item.children) {
      const isOpen = openItems.includes(item.text);
      setOpenItems(
        isOpen
          ? openItems.filter((text) => text !== item.text)
          : [...openItems, item.text]
      );
    } else {
      navigate(item.path);
      onNavigate();
    }
  };

  const handleChildClick = (child: NavigationItem) => {
    navigate(child.path);
    onNavigate();
  };

  const isItemAccessible = (item: NavigationItem) => {
    if (!item.roles) return true;
    return user?.role && item.roles.includes(user.role);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const renderNavigationItem = (item: NavigationItem) => {
    if (!isItemAccessible(item)) return null;

    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openItems.includes(item.text);
    const isActiveItem = isActive(item.path);

    return (
      <React.Fragment key={item.text}>
        <ListItem disablePadding>
          <StyledListItemButton
            onClick={() => handleItemClick(item)}
            selected={isActiveItem}
          >
            <ListItemIcon sx={{ color: 'white', minWidth: 36 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.text}
              sx={{
                '& .MuiListItemText-primary': {
                  fontSize: '0.9rem',
                  fontWeight: isActiveItem ? 600 : 400,
                },
              }}
            />
            {hasChildren && (
              <div style={{ color: 'white' }}>
                {isOpen ? <ExpandLess /> : <ExpandMore />}
              </div>
            )}
          </StyledListItemButton>
        </ListItem>

        {hasChildren && (
          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding sx={{ ml: 2 }}>
              {item.children!.map((child) => {
                if (!isItemAccessible(child)) return null;

                const isChildActive = isActive(child.path);

                return (
                  <ListItem key={child.text} disablePadding>
                    <ListItemButton
                      sx={{
                        pl: 4,
                        '&:hover': {
                          backgroundColor: 'white',
                          color: 'primary.main',
                        },
                        backgroundColor: isChildActive
                          ? 'primary.light'
                          : 'transparent',
                        color: isChildActive ? 'white' : 'inherit',
                      }}
                      onClick={() => handleChildClick(child)}
                    >
                      <ListItemIcon sx={{ color: 'inherit' }}>
                        {child.icon}
                      </ListItemIcon>
                      <ListItemText primary={child.text} />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  return <List>{navigationItems.map(renderNavigationItem)}</List>;
};
