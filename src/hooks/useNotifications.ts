import { useState, useEffect, useCallback, useRef } from 'react';
import Log from '../services/logService';
import { fetchNotificationsFromServer, markReadOnServer, deleteOnServer } from '../services/notificationService';
import { mapToNotification } from '../utils';
import type { Notification, NotificationType, PaginationMeta } from '../types';

interface NetworkNotification {
  ID: string;
  Type: 'Placement' | 'Result' | 'Event';
  Message: string;
  Timestamp: string;
}

export const useNotifications = (initialView: 'inbox' | 'priority') => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [activeView, setActiveView] = useState<'inbox' | 'priority'>(initialView);
  const [filterType, setFilterType] = useState<'All' | NotificationType>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [priorityCount, setPriorityCount] = useState<number>(0);
  const [pagination, setPagination] = useState<PaginationMeta>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 5
  });

  const prevView = useRef<'inbox' | 'priority'>(initialView);
  const prevFilter = useRef<'All' | NotificationType>('All');
  const prevPage = useRef<number>(1);

  const loadNotifications = useCallback(async (
    currentPage: number,
    currentType: 'All' | NotificationType,
    currentView: 'inbox' | 'priority',
    currentSearch: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchNotificationsFromServer();
      const readIds = new Set<string>(JSON.parse(localStorage.getItem('read_notifications_list') || '[]'));
      const deletedIds = new Set<string>(JSON.parse(localStorage.getItem('deleted_notifications_list') || '[]'));

      const raw = (data.notifications || data || []) as NetworkNotification[];
      let mapped = raw
        .map(n => mapToNotification(n, readIds))
        .filter(item => !deletedIds.has(item.id));

      if (currentType !== 'All') {
        mapped = mapped.filter(item => item.type === currentType);
      }

      if (currentView === 'priority') {
        mapped = mapped.filter(item => item.priority === 'High');
      }

      if (currentSearch) {
        const query = currentSearch.toLowerCase();
        mapped = mapped.filter(item => 
          item.title.toLowerCase().includes(query) ||
          item.message.toLowerCase().includes(query)
        );
      }

      mapped.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      const limit = 5;
      const totalCount = mapped.length;
      const totalPages = Math.max(1, Math.ceil(totalCount / limit));
      const startIndex = (currentPage - 1) * limit;
      const paginated = mapped.slice(startIndex, startIndex + limit);

      setNotifications(paginated);
      setPagination({
        currentPage,
        totalPages,
        totalCount,
        limit
      });

      const unreadHigh = mapped.filter(item => item.priority === 'High' && !item.read).length;
      setPriorityCount(unreadHigh);

      await Log('frontend', 'info', 'notifications-hook', 'Notifications loaded successfully');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message;
      setError(msg);
      setNotifications([]);
      setPagination({ currentPage: 1, totalPages: 1, totalCount: 0, limit: 5 });
      await Log('frontend', 'error', 'notifications-hook', `Failed to fetch notifications: ${msg}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications(page, filterType, activeView, searchQuery);
  }, [page, filterType, activeView, searchQuery, loadNotifications]);

  useEffect(() => {
    if (prevFilter.current !== filterType) {
      Log('frontend', 'info', 'notifications-hook', `Filter changed to ${filterType}`);
      prevFilter.current = filterType;
    }
  }, [filterType]);

  useEffect(() => {
    if (prevPage.current !== page) {
      Log('frontend', 'info', 'notifications-hook', `Navigated to page ${page}`);
      prevPage.current = page;
    }
  }, [page]);

  useEffect(() => {
    if (prevView.current !== activeView) {
      if (activeView === 'priority') {
        Log('frontend', 'info', 'priority-inbox', 'Priority Inbox generated with High priority notifications');
      } else {
        Log('frontend', 'info', 'notifications-hook', 'Switched to All Notifications view');
      }
      prevView.current = activeView;
    }
  }, [activeView]);

  const markAsRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    
    const readList = JSON.parse(localStorage.getItem('read_notifications_list') || '[]') as string[];
    if (!readList.includes(id)) {
      readList.push(id);
      localStorage.setItem('read_notifications_list', JSON.stringify(readList));
    }
    setPriorityCount(prev => Math.max(0, prev - 1));

    try {
      await markReadOnServer(id);
      await Log('frontend', 'info', 'notifications-hook', `Notification ${id} marked as read`);
    } catch (err) {
      // Keep local read status
    }
  };

  const deleteNotification = async (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    
    const deletedList = JSON.parse(localStorage.getItem('deleted_notifications_list') || '[]') as string[];
    if (!deletedList.includes(id)) {
      deletedList.push(id);
      localStorage.setItem('deleted_notifications_list', JSON.stringify(deletedList));
    }

    try {
      await deleteOnServer(id);
      await Log('frontend', 'info', 'notifications-hook', `Notification ${id} deleted successfully`);
      loadNotifications(page, filterType, activeView, searchQuery);
    } catch (err) {
      loadNotifications(page, filterType, activeView, searchQuery);
    }
  };

  const changeFilterType = (newType: 'All' | NotificationType) => {
    setFilterType(newType);
    setPage(1);
  };

  const changeActiveView = (newView: 'inbox' | 'priority') => {
    setActiveView(newView);
    setFilterType('All');
    setPage(1);
  };

  const changeSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  return {
    notifications,
    loading,
    error,
    page,
    setPage,
    pagination,
    filterType,
    setFilterType: changeFilterType,
    searchQuery,
    setSearchQuery: changeSearch,
    activeView,
    setActiveView: changeActiveView,
    priorityCount,
    markAsRead,
    deleteNotification
  };
};
