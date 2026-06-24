import React, { useEffect } from 'react';
import { Box, Stack, Typography, CircularProgress, Alert, Pagination } from '@mui/material';
import { PriorityHigh } from '@mui/icons-material';
import NotificationFilters from '../../components/NotificationFilters';
import NotificationCard from '../../components/NotificationCard';
import Log from '../../services/logService';
import type { useNotifications } from '../../hooks/useNotifications';

interface PriorityInboxPageProps {
  notificationsState: ReturnType<typeof useNotifications>;
}

export default function PriorityInboxPage({ notificationsState }: PriorityInboxPageProps) {
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
    Log('frontend', 'info', 'priority-page', 'Priority Inbox Page loaded');
  }, []);

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box 
        sx={{ 
          backgroundColor: 'rgba(220, 38, 38, 0.02)',
          border: '1px solid #FECACA',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          mb: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}
      >
        <Box 
          sx={{ 
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: 'var(--error-light)',
            color: 'var(--error)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          <PriorityHigh fontSize="small" />
        </Box>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'var(--error)' }}>
            High Priority Dashboard
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Only alerts marked as high priority (urgent actions) are shown here.
          </Typography>
        </Box>
      </Box>

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
            Generating priority stream...
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
          <Box 
            sx={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '50%', 
              backgroundColor: 'rgba(71, 85, 105, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: '12px'
            }}
          >
            <PriorityHigh sx={{ color: 'var(--text-secondary)' }} />
          </Box>
          <Typography variant="h6" sx={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', mb: '4px' }}>
            No high priority updates
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: '320px', px: '16px' }}>
            All caught up! There are no high priority alerts matching your active filters.
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
