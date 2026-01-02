'use client';

import { Box, Drawer, List, ListItemButton, ListItemText, Collapse, Typography, IconButton, useMediaQuery, useTheme } from '@mui/material';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { RouterLink } from 'src/routes/components';
import { Iconify } from 'src/components/iconify';

const DRAWER_WIDTH = 280;

const navigation = [
  {
    title: 'Overview',
    icon: 'solar:home-bold',
    path: '/docs',
  },
  {
    title: 'Getting Started',
    icon: 'solar:rocket-2-bold-duotone',
    path: '/docs/getting-started',
  },
  {
    title: 'API Reference',
    icon: 'solar:code-bold',
    path: '/docs/api-reference',
  },
  {
    title: 'Examples',
    icon: 'solar:code-square-bold-duotone',
    path: '/docs/examples',
  },
  {
    title: 'SDKs',
    icon: 'solar:programming-bold',
    children: [
      { title: 'JavaScript', path: '/docs/sdk/javascript' },
      { title: 'WordPress', path: '/docs/sdk/wordpress' },
    ],
  },
  {
    title: 'Guides',
    icon: 'solar:book-bold',
    children: [
      { title: 'Products', path: '/docs/guides/products' },
      { title: 'Subscriptions', path: '/docs/guides/subscriptions' },
      { title: 'Webhooks', path: '/docs/guides/webhooks' },
    ],
  },
];

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    SDKs: true,
    Guides: true,
  });

  const handleToggle = (title: string) => {
    setOpenSections((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawerContent = (
    <Box sx={{ p: 3, pt: 10 }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
        Documentation
      </Typography>
      <List component="nav" disablePadding>
        {navigation.map((item) =>
          item.children ? (
            <Box key={item.title}>
              <ListItemButton onClick={() => handleToggle(item.title)} sx={{ borderRadius: 1, mb: 0.5 }}>
                {item.icon && <Iconify icon={item.icon as any} width={20} sx={{ mr: 2 }} />}
                <ListItemText primary={item.title} />
                <Iconify
                  icon={(openSections[item.title] ? 'solar:alt-arrow-right-bold' : 'solar:alt-arrow-right-bold') as any}
                  width={16}
                  sx={{ transform: openSections[item.title] ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                />
              </ListItemButton>
              <Collapse in={openSections[item.title]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.children.map((child) => (
                    <ListItemButton
                      key={child.path}
                      component={RouterLink}
                      href={child.path}
                      selected={pathname === child.path}
                      onClick={isMobile ? handleDrawerToggle : undefined}
                      sx={{
                        pl: 5,
                        borderRadius: 1,
                        mb: 0.5,
                        '&.Mui-selected': {
                          bgcolor: 'action.selected',
                          '&:hover': {
                            bgcolor: 'action.selected',
                          },
                        },
                      }}
                    >
                      <ListItemText primary={child.title} primaryTypographyProps={{ variant: 'body2' }} />
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
            </Box>
          ) : (
            <ListItemButton
              key={item.path}
              component={RouterLink}
              href={item.path}
              selected={pathname === item.path}
              onClick={isMobile ? handleDrawerToggle : undefined}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                '&.Mui-selected': {
                  bgcolor: 'action.selected',
                  '&:hover': {
                    bgcolor: 'action.selected',
                  },
                },
              }}
            >
              {item.icon && <Iconify icon={item.icon as any} width={20} sx={{ mr: 2 }} />}
              <ListItemText primary={item.title} />
            </ListItemButton>
          )
        )}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Mobile Menu Button */}
      {isMobile && (
        <IconButton
          onClick={handleDrawerToggle}
          sx={{
            position: 'fixed',
            top: 16,
            left: 16,
            zIndex: 1300,
            bgcolor: 'background.paper',
            boxShadow: 2,
            '&:hover': {
              bgcolor: 'background.paper',
            },
          }}
        >
          <Iconify icon={"solar:hamburger-menu-bold" as any} width={24} />
        </IconButton>
      )}

      {/* Desktop Sidebar */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              top: 0,
              height: '100%',
              borderRight: (theme) => `1px solid ${theme.palette.divider}`,
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Mobile Sidebar */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better mobile performance
          }}
          sx={{
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { xs: '100%', md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: '0px',
          pl: 0,
          pt: { xs: 8, md: 0 }, // Top padding for mobile menu button
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
