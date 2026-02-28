import React, { createContext, useContext, useState, useCallback } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type NotificationType = 
  | 'rate_limit_minute'
  | 'rate_limit_daily'
  | 'model_limit_global'
  | 'model_limit_minute'
  | 'concurrent_limit'
  | 'chat_length_limit'
  | 'server_unavailable'
  | 'high_traffic'
  | 'internal_error'
  | 'document_success'
  | 'document_processing'
  | 'document_storage_limit'
  | 'unsupported_format'
  | 'document_failed'
  | 'login_required'
  | 'paid_feature'
  | 'session_expired'
  | 'info'
  | 'warning'
  | 'success'
  | 'error';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timeout?: number;
}

interface NotificationContextType {
  showNotification: (type: NotificationType, title: string, message: string, timeout?: number) => void;
  dismissNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const notificationConfig: Record<NotificationType, { color: string; bgColor: string }> = {
  // Error states - Red
  rate_limit_minute: { color: 'hsl(0, 70%, 50%)', bgColor: 'hsl(0, 70%, 50%)' },
  rate_limit_daily: { color: 'hsl(0, 70%, 50%)', bgColor: 'hsl(0, 70%, 50%)' },
  model_limit_global: { color: 'hsl(0, 70%, 50%)', bgColor: 'hsl(0, 70%, 50%)' },
  model_limit_minute: { color: 'hsl(0, 70%, 50%)', bgColor: 'hsl(0, 70%, 50%)' },
  concurrent_limit: { color: 'hsl(0, 70%, 50%)', bgColor: 'hsl(0, 70%, 50%)' },
  chat_length_limit: { color: 'hsl(0, 70%, 50%)', bgColor: 'hsl(0, 70%, 50%)' },
  server_unavailable: { color: 'hsl(0, 70%, 50%)', bgColor: 'hsl(0, 70%, 50%)' },
  internal_error: { color: 'hsl(0, 70%, 50%)', bgColor: 'hsl(0, 70%, 50%)' },
  document_failed: { color: 'hsl(0, 70%, 50%)', bgColor: 'hsl(0, 70%, 50%)' },
  unsupported_format: { color: 'hsl(0, 70%, 50%)', bgColor: 'hsl(0, 70%, 50%)' },
  document_storage_limit: { color: 'hsl(0, 70%, 50%)', bgColor: 'hsl(0, 70%, 50%)' },
  error: { color: 'hsl(0, 70%, 50%)', bgColor: 'hsl(0, 70%, 50%)' },
  
  // Warning states - Amber
  high_traffic: { color: 'hsl(38, 92%, 50%)', bgColor: 'hsl(38, 92%, 50%)' },
  warning: { color: 'hsl(38, 92%, 50%)', bgColor: 'hsl(38, 92%, 50%)' },
  
  // Info states - Blue
  document_success: { color: 'hsl(210, 80%, 55%)', bgColor: 'hsl(210, 80%, 55%)' },
  document_processing: { color: 'hsl(210, 80%, 55%)', bgColor: 'hsl(210, 80%, 55%)' },
  success: { color: 'hsl(210, 80%, 55%)', bgColor: 'hsl(210, 80%, 55%)' },
  info: { color: 'hsl(210, 80%, 55%)', bgColor: 'hsl(210, 80%, 55%)' },
  
  // Auth states - Gray
  login_required: { color: 'hsl(0, 0%, 50%)', bgColor: 'hsl(0, 0%, 50%)' },
  paid_feature: { color: 'hsl(0, 0%, 50%)', bgColor: 'hsl(0, 0%, 50%)' },
  session_expired: { color: 'hsl(0, 0%, 50%)', bgColor: 'hsl(0, 0%, 50%)' },
};

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback((
    type: NotificationType,
    title: string,
    message: string,
    timeout: number = 5000
  ) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, type, title, message, timeout }]);
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification, dismissNotification }}>
      {children}
      {/* Notification Container - centered excluding sidebar */}
      <div className="fixed top-4 left-0 right-0 z-[100] pointer-events-none flex justify-center">
        <div className="flex flex-col gap-2 items-center max-w-lg w-full px-4">
          {notifications.map((notification) => (
            <NotificationToast
              key={notification.id}
              notification={notification}
              onDismiss={() => dismissNotification(notification.id)}
            />
          ))}
        </div>
      </div>
    </NotificationContext.Provider>
  );
}

function NotificationToast({
  notification,
  onDismiss,
}: {
  notification: Notification;
  onDismiss: () => void;
}) {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);
  const config = notificationConfig[notification.type];
  const timeout = notification.timeout || 5000;

  // auto-dismiss with a progress bar that counts down visually
  React.useEffect(() => {
    const startTime = Date.now();
    const updateInterval = 50;

    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / timeout) * 100);
      setProgress(remaining);

      if (remaining <= 0) {
        clearInterval(progressInterval);
        handleDismiss();
      }
    }, updateInterval);

    return () => clearInterval(progressInterval);
  }, [timeout]);

  // exit animation before removing from DOM
  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(onDismiss, 300);
  };

  return (
    <div
      className={cn(
        'pointer-events-auto w-full max-w-md rounded-lg shadow-lg overflow-hidden',
        'bg-background border border-border',
        isExiting ? 'animate-notification-exit' : 'animate-notification-enter'
      )}
    >
      <div className="flex items-start gap-3 p-4">
        {/* Color indicator */}
        <div
          className="w-1 h-full min-h-[40px] rounded-full shrink-0"
          style={{ backgroundColor: config.color }}
        />
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">{notification.title}</p>
          <p className="text-sm text-muted-foreground mt-0.5">{notification.message}</p>
        </div>

        <button
          onClick={handleDismiss}
          className="shrink-0 w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1 w-full bg-secondary">
        <div
          className="h-full transition-all duration-50 ease-linear"
          style={{
            width: `${progress}%`,
            backgroundColor: config.color,
          }}
        />
      </div>
    </div>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}

// Helper function to map backend error codes to notifications
export function mapBackendError(errorCode: string): { type: NotificationType; title: string; message: string } {
  const errorMap: Record<string, { type: NotificationType; title: string; message: string }> = {
    RATE_LIMIT_MINUTE: {
      type: 'rate_limit_minute',
      title: 'Request Limit',
      message: 'Too many requests right now. Please wait a moment and try again.',
    },
    RATE_LIMIT_DAILY: {
      type: 'rate_limit_daily',
      title: 'Daily Limit Reached',
      message: 'Your daily usage limit has been reached. Upgrade your plan or try again tomorrow.',
    },
    MODEL_LIMIT_GLOBAL: {
      type: 'model_limit_global',
      title: 'Model Unavailable',
      message: 'This model is under heavy usage right now. Please try another model or come back later.',
    },
    MODEL_LIMIT_MINUTE: {
      type: 'model_limit_minute',
      title: 'Model Busy',
      message: 'This model is temporarily busy due to high demand. Please retry shortly.',
    },
    CONCURRENT_LIMIT: {
      type: 'concurrent_limit',
      title: 'Active Requests',
      message: 'You already have active requests running. Please wait for them to finish.',
    },
    CHAT_LENGTH_LIMIT: {
      type: 'chat_length_limit',
      title: 'Chat Limit',
      message: 'This chat has reached its maximum length. Please start a new chat or upgrade your plan.',
    },
    SERVER_UNAVAILABLE: {
      type: 'server_unavailable',
      title: 'Server Unavailable',
      message: 'Server is temporarily unavailable. Please try again in a few minutes.',
    },
    HIGH_TRAFFIC: {
      type: 'high_traffic',
      title: 'High Traffic',
      message: 'The system is experiencing high traffic. Responses may be delayed.',
    },
    INTERNAL_ERROR: {
      type: 'internal_error',
      title: 'Something Went Wrong',
      message: 'Something went wrong on our end. Please refresh and try again.',
    },
    DOCUMENT_SUCCESS: {
      type: 'document_success',
      title: 'Upload Complete',
      message: 'Document uploaded successfully. You can now ask questions.',
    },
    DOCUMENT_PROCESSING: {
      type: 'document_processing',
      title: 'Processing',
      message: 'Document is being processed. This may take a moment.',
    },
    DOCUMENT_STORAGE_LIMIT: {
      type: 'document_storage_limit',
      title: 'Storage Limit',
      message: 'Document storage limit reached. Delete old files or upgrade your plan.',
    },
    UNSUPPORTED_FORMAT: {
      type: 'unsupported_format',
      title: 'Unsupported Format',
      message: 'Unsupported file format. Please upload PDF, DOCX, or TXT files.',
    },
    DOCUMENT_FAILED: {
      type: 'document_failed',
      title: 'Processing Failed',
      message: 'Failed to process the document. Please try another file.',
    },
    LOGIN_REQUIRED: {
      type: 'login_required',
      title: 'Login Required',
      message: 'Please log in to access this feature.',
    },
    PAID_FEATURE: {
      type: 'paid_feature',
      title: 'Premium Feature',
      message: 'This feature is available on paid plans only.',
    },
    SESSION_EXPIRED: {
      type: 'session_expired',
      title: 'Session Expired',
      message: 'Your session has expired. Please log in again.',
    },
  };

  return errorMap[errorCode] || {
    type: 'error',
    title: 'Error',
    message: 'An unexpected error occurred. Please try again.',
  };
}
