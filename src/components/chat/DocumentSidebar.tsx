import React, { useState, useEffect, useCallback } from 'react';
import { X, FileText, Loader2, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { resourceService } from '@/services/resourceService';

export interface DocumentRef {
  /** resource UUID from the backend */
  resourceId: string;
  /** original filename */
  fileName: string;
  /** 1-based page to scroll to */
  page: number;
}

interface DocumentSidebarProps {
  /** Currently requested document reference (null = closed) */
  documentRef: DocumentRef | null;
  onClose: () => void;
}

export function DocumentSidebar({ documentRef, onClose }: DocumentSidebarProps) {
  const [loading, setLoading] = useState(false);
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [contentType, setContentType] = useState<'pdf' | 'text' | 'image' | 'unsupported'>('unsupported');
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Cache fetched content keyed by resource ID
  const [cache, setCache] = useState<Record<string, { type: string; content: string; mime?: string }>>({});

  const fetchDocument = useCallback(async (resourceId: string) => {
    if (cache[resourceId]) {
      const cached = cache[resourceId];
      applyContent(cached.type, cached.content);
      return;
    }

    setLoading(true);
    setError(null);
    setPdfBase64(null);
    setTextContent(null);

    try {
      const resp = await resourceService.getResourcePreview(resourceId);

      if (resp.success && resp.data) {
        const data = resp.data as any;
        setCache(prev => ({ ...prev, [resourceId]: data }));
        applyContent(data.type, data.content);
      } else {
        setError('Could not load document.');
      }
    } catch {
      setError('Failed to fetch document preview.');
    } finally {
      setLoading(false);
    }
  }, [cache]);

  const applyContent = (type: string, content: string) => {
    if (type === 'pdf') {
      setContentType('pdf');
      setPdfBase64(content);
      setTextContent(null);
    } else if (type === 'text' || type === 'web') {
      setContentType('text');
      setTextContent(content);
      setPdfBase64(null);
    } else if (type === 'image') {
      setContentType('image');
      setPdfBase64(content);
      setTextContent(null);
    } else {
      setContentType('unsupported');
    }
  };

  useEffect(() => {
    if (documentRef) {
      setCurrentPage(documentRef.page || 1);
      fetchDocument(documentRef.resourceId);
    }
  }, [documentRef?.resourceId, documentRef?.page, fetchDocument]);

  if (!documentRef) return null;

  return (
    <div
      className={cn(
        "fixed top-0 right-0 h-full bg-card border-l border-border z-[110] flex flex-col shadow-2xl",
        "w-[40%] max-w-[90vw] min-w-[320px]",
        "animate-in slide-in-from-right-5 duration-300"
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card shrink-0">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <FileText className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{documentRef.fileName}</p>
          {contentType === 'pdf' && (
            <p className="text-[10px] text-muted-foreground">Page {currentPage}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">Loading document...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 p-6 text-center">
            <FileText className="w-10 h-10 text-muted-foreground opacity-40" />
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        ) : contentType === 'pdf' && pdfBase64 ? (
          <iframe
            src={`data:application/pdf;base64,${pdfBase64}#page=${currentPage}`}
            className="w-full h-full border-0"
            title={documentRef.fileName}
          />
        ) : contentType === 'text' && textContent ? (
          <div className="p-4 overflow-y-auto h-full">
            <pre className="text-sm text-foreground/80 whitespace-pre-wrap font-sans leading-relaxed">
              {textContent}
            </pre>
          </div>
        ) : contentType === 'image' && pdfBase64 ? (
          <div className="flex items-center justify-center h-full p-4">
            <img
              src={`data:image/png;base64,${pdfBase64}`}
              alt={documentRef.fileName}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-2 p-6 text-center">
            <FileText className="w-10 h-10 text-muted-foreground opacity-40" />
            <p className="text-sm text-muted-foreground">Preview not available for this file type.</p>
          </div>
        )}
      </div>
    </div>
  );
}
