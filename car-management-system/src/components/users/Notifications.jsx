// components/NotificationButton.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import * as signalR from '@microsoft/signalr';
import api from '../../services/api';

export default function NotificationButton() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [connection, setConnection] = useState(null);

  useEffect(() => {
    if (!user?.id) return;

    // Fetch initial notifications
    const fetchNotifications = async () => {
      try {
        const [notifsResponse, countResponse] = await Promise.all([
          api.get('/api/notifications'),
          api.get('/api/notifications/unread-count')
        ]);
        setNotifications(notifsResponse.data);
        setUnreadCount(countResponse.data);
      } catch (error) {
        }
    };

    fetchNotifications();

    // Initialize SignalR connection
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl('/notificationHub')
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    setConnection(newConnection);

    return () => {
      if (newConnection.state === signalR.HubConnectionState.Connected) {
        newConnection.stop();
      }
    };
  }, [user?.id]);

  useEffect(() => {
    if (!connection || !user?.id) return;

    connection.start()
      .then(() => {
        connection.invoke('JoinNotificationGroup', user.id);
        })
      .catch(error => );

    connection.on('ReceiveNotification', (notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    return () => {
      connection.off('ReceiveNotification');
    };
  }, [connection, user?.id]);

  const markAsRead = async (id) => {
    try {
      await api.post(`/api/notifications/mark-as-read/${id}`);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => prev > 0 ? prev - 1 : 0);
    } catch (error) {
      }
  };

  const markAllAsRead = async () => {
    try {
      await api.post('/api/notifications/mark-all-as-read');
      setNotifications(prev => 
        prev.map(n => ({ ...n, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'MaintenanceRequest':
        return '🔧';
      case 'VehicleAssignment':
        return '🚗';
      case 'VehicleRequest':
        return '📋';
      case 'ApprovalRequired':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    window.location.href = notification.actionUrl;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none"
      >
        <span className="sr-only">View notifications</span>
        <div className="relative">
           Info
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </div>
      </button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-200 z-10">
          <div className="px-4 py-3 flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
            <button
              onClick={markAllAsRead}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Mark all as read
            </button>
          </div>
          <div className="py-1 max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500">
                No notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${!notification.isRead ? 'bg-blue-50' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 pt-0.5 text-lg">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {notification.message}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <div className="ml-2 flex-shrink-0">
                        <span className="inline-block h-2 w-2 rounded-full bg-blue-500"></span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="px-4 py-2 text-center">
            <a
              href="/notifications"
              className="text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              View all notifications
            </a>
          </div>
        </div>
      )}
    </div>
  );
}