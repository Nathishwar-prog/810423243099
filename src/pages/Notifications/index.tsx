import React, { useEffect } from 'react';
import { Box, Stack, Typography, CircularProgress, Alert, Pagination } from '@mui/material';
import { MailOutlined } from '@mui/icons-material';
import NotificationFilters from '../../components/NotificationFilters';
import NotificationCard from '../../components/NotificationCard';
import Log from '../../services/logService';
import type { useNotifications } from '../../hooks/useNotifications';

interface NotificationsPageProps {
  notificationsState: ReturnType<typeof useNotifications>;
}

export default function NotificationsPage({ notificationsState }: NotificationsPageProps) {
  const {
    notifications,
    loading,
    error,
    page,
    setPage,
    pagination,
    filterType,
    setFilterType,
    searchQuery,
    setSearchQuery,
    markAsRead,
    deleteNotification
  } = notificationsState;

  useEffect(() => {
    Log('frontend', 'info', 'notifications-page', 'Notifications Page loaded');
  }, []);

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <NotificationFilters
        filterType={filterType}
        onFilterChange={setFilterType}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: '60px', gap: '16px' }}>
          <CircularProgress size={40} />
          <Typography variant="body2" color="text.secondary">
            Loading notifications...
          </Typography>
        </Box>
      ) : error ? (
        <Alert severity="error" variant="outlined" sx={{ borderRadius: 'var(--radius-sm)' }}>
          {error}
        </Alert>
      ) : notifications.length === 0 ? (
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            py: '80px', 
            textAlign: 'center',
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <MailOutlined sx={{ fontSize: '48px', color: 'var(--text-secondary)', mb: '12px' }} />
          <Typography variant="h6" sx={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', mb: '4px' }}>
            No updates found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: '320px', px: '16px' }}>
            There are no updates matching your search query or selected category filter.
          </Typography>
        </Box>
      ) : (
        <Stack spacing="16px">
          {notifications.map((item) => (
            <NotificationCard
              key={item.id}
              notification={item}
              onMarkRead={markAsRead}
              onDelete={deleteNotification}
            />
          ))}
          
          {pagination.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: '24px' }}>
              <Pagination
                count={pagination.totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                shape="rounded"
                size="medium"
                sx={{
                  '& .MuiPaginationItem-root': {
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 500,
                    '&.Mui-selected': {
                      backgroundColor: 'var(--primary)',
                      color: '#ffffff',
                      '&:hover': {
                        backgroundColor: 'var(--primary-hover)'
                      }
                    }
                  }
                }}
              />
            </Box>
          )}
        </Stack>
      )}
    </Box>
  );
}
