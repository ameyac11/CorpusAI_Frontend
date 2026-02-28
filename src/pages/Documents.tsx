import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Upload, FileText, Image, File, Trash2, CheckCircle, Loader2, Search,
  RotateCcw, AlertCircle, Filter, ChevronDown, Lightbulb, List, X,
  Globe, Link2, ExternalLink, Plus, User, HardDrive, ClipboardPaste,
  MoreVertical, CheckSquare, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useNotification } from '@/components/notifications/NotificationProvider';
import { resourceService } from '@/services/resourceService';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type DocumentStatus = 'uploading' | 'processing' | 'ready' | 'failed';
type DocumentType = 'pdf' | 'docx' | 'txt' | 'png' | 'jpg' | 'jpeg';
type ResourceTab = 'all' | 'user' | 'web';
type FilterType = 'all' | 'pdf' | 'docx' | 'images' | 'other';

interface UserDocument {
  id: string;
  name: string;
  type: DocumentType;
  size: number;
  status: DocumentStatus;
  uploadedAt: Date;
  failureReason?: string;
  content?: string;
}

interface WebResource {
  id: string;
  title: string;
  source: string;
  url: string;
  importedAt: Date;
  status: 'imported' | 'importing';
  content?: string;
}

interface WebSearchResult {
  id: string;
  title: string;
  source: string;
  url: string;
  importing?: boolean;
  index?: number; // Index in search results for import
}

// Limits
const MAX_FILE_SIZE_MB = 10;
const MAX_DOCUMENTS = 50;

const documentTypes: DocumentType[] = ['pdf', 'docx', 'txt'];
const imageTypes: DocumentType[] = ['png', 'jpg', 'jpeg'];

const typeIcons: Record<DocumentType, React.ElementType> = {
  pdf: FileText,
  docx: FileText,
  txt: File,
  png: Image,
  jpg: Image,
  jpeg: Image,
};

const typeColors: Record<string, string> = {
  pdf: 'text-red-500',
  docx: 'text-blue-500',
  txt: 'text-muted-foreground',
  png: 'text-green-500',
  jpg: 'text-green-500',
  jpeg: 'text-green-500',
};

export default function Documents() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showNotification } = useNotification();

  const [userDocuments, setUserDocuments] = useState<UserDocument[]>([]);
  const [webResources, setWebResources] = useState<WebResource[]>([]);
  const [isLoading, setIsLoading] = useState({ user: true, web: true });
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<ResourceTab>('all');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name'>('newest');

  // Usage stats
  const [usageStats, setUsageStats] = useState<{
    documents: { used: number; limit: number };
    images: { used: number; limit: number };
    storage_mb: { used: number; limit: number };
  } | null>(null);

  // Modal states
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [webSearchQuery, setWebSearchQuery] = useState('');
  const [webSearchResults, setWebSearchResults] = useState<WebSearchResult[]>([]);
  const [isSearchingWeb, setIsSearchingWeb] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<string[]>([]);
  // Delete states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: 'user' | 'web' } | null>(null);
  // Preview states
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<{ type: 'user' | 'web'; data: UserDocument | WebResource } | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewContent, setPreviewContent] = useState<{
    type: 'image' | 'pdf' | 'docx' | 'text' | 'web' | 'binary';
    content: string | null;
    mime_type?: string;
    file_name?: string;
    source_url?: string;
  } | null>(null);

  // keep a search ID so we can pass it to the import endpoint later
  const [currentSearchId, setCurrentSearchId] = useState<string | null>(null);

  // API Functions moved inside component to access showNotification
  const fetchUsageStats = async () => {
    try {
      const response = await resourceService.getUsageStats();
      if (response.success && response.data) {
        setUsageStats(response.data);
      }
    } catch (error) {
      console.error('[Documents] Failed to fetch usage stats:', error);
    }
  };

  // bytes → MB conversion happens here since the API returns raw bytes
  const fetchUserDocuments = async () => {
    try {
      const response = await resourceService.listResources();
      if (response.success && response.data) {
        const docs = response.data.resources
          .filter(r => r.resource_type !== 'web_import')
          .map(r => ({
            id: r.id,
            name: r.file_name,
            type: (r.file_type.split('/').pop() as DocumentType) || 'pdf',
            // Convert bytes to MB here since the API returns bytes
            size: (r.size || 0) / (1024 * 1024),
            status: r.status === 'processed' ? 'ready' : 'processing' as DocumentStatus,
            uploadedAt: new Date(r.created_at),
          }));
        setUserDocuments(docs);
      } else {
        showNotification('error', 'Fetch Failed', response.error?.message || 'Failed to fetch documents');
      }
    } catch (error) {
      console.error('[Documents] Failed to fetch user documents:', error);
      showNotification('error', 'Fetch Failed', 'Network error fetching documents');
    } finally {
      setIsLoading(prev => ({ ...prev, user: false }));
    }
  };

  const fetchWebResources = async () => {
    try {
      const response = await resourceService.listResources();
      if (response.success && response.data) {
        const resources = response.data.resources
          .filter(r => r.resource_type === 'web_import')
          .map(r => ({
            id: r.id,
            title: r.file_name,
            source: r.source_url ? new URL(r.source_url).hostname : 'Web',
            url: r.source_url || '',
            importedAt: new Date(r.created_at),
            status: 'imported' as const,
          }));
        setWebResources(resources);
      }
    } catch (error) {
      console.error('[Documents] Failed to fetch web resources:', error);
    } finally {
      setIsLoading(prev => ({ ...prev, web: false }));
    }
  };

  const searchWeb = async (query: string) => {
    try {
      const response = await resourceService.searchWeb(query);
      if (response.success && response.data) {
        setCurrentSearchId(response.data.search_id);
        const results = response.data.results.map((r, idx) => ({
          id: `${response.data.search_id}_${idx}`,
          title: r.title,
          source: r.url ? new URL(r.url).hostname : 'Web',
          url: r.url,
          index: idx,
        }));
        setWebSearchResults(results);
      } else {
        showNotification('error', 'Search Failed', response.error?.message || 'Failed to search web');
        setWebSearchResults([]);
      }
    } catch (error) {
      console.error('[Documents] Web search error:', error);
      showNotification('error', 'Search Failed', 'Network error during search');
      setWebSearchResults([]);
    }
  };

  const uploadDocument = async (file: File): Promise<{ success: boolean; document?: UserDocument; error?: string }> => {
    try {
      const response = await resourceService.uploadResource(file);
      if (response.success && response.data) {
        const ext = file.name.split('.').pop()?.toLowerCase() as DocumentType;
        return {
          success: true,
          document: {
            id: response.data.id,
            name: file.name,
            type: ext,
            size: file.size / (1024 * 1024),
            status: 'ready',
            uploadedAt: new Date(),
          }
        };
      }
      return { success: false, error: response.error?.message || 'Upload failed' };
    } catch (error) {
      console.error('[Documents] Upload error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Upload failed' };
    }
  };

  const importWebResource = async (result: WebSearchResult & { index?: number }): Promise<WebResource | null> => {
    if (!currentSearchId || result.index === undefined) {
      showNotification('error', 'Import Failed', 'Invalid search state. Please search again.');
      return null;
    }

    try {
      const response = await resourceService.importFromWeb({
        search_id: currentSearchId,
        selected_indices: [result.index],
      });

      if (response.success && response.data && response.data.imported.length > 0) {
        const imported = response.data.imported[0];
        // Refresh usage stats after import
        fetchUsageStats();
        return {
          id: imported.id,
          title: imported.title,
          source: new URL(imported.url).hostname,
          url: imported.url,
          importedAt: new Date(),
          status: 'imported',
        };
      }
      showNotification('error', 'Import Failed', response.error?.message || 'Failed to import resource');
      return null;
    } catch (error) {
      console.error('[Documents] Import error:', error);
      showNotification('error', 'Import Failed', 'Network error during import');
      return null;
    }
  };

  // Initial fetch
  React.useEffect(() => {
    fetchUserDocuments();
    fetchWebResources();
    fetchUsageStats();
  }, []);

  // Auto-open Add Resources dialog if navigated from Chat
  React.useEffect(() => {
    const state = location.state as { openAddDialog?: boolean };
    if (state?.openAddDialog) {
      setAddModalOpen(true);
      // Clear the state to prevent reopening on refresh
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  // Auto-cleanup web search results after 5 minutes
  React.useEffect(() => {
    if (webSearchResults.length > 0) {
      const timer = setTimeout(() => {
        setWebSearchResults([]);
        setCurrentSearchId(null);
        showNotification('info', 'Search Expired', 'Web search results cleared after 5 minutes');
      }, 5 * 60 * 1000); // 5 minutes

      return () => clearTimeout(timer);
    }
  }, [webSearchResults.length]);

  // Computed values
  const totalDocs = userDocuments.length;
  const totalWeb = webResources.length;
  const totalSize = userDocuments.reduce((acc, d) => acc + d.size, 0);

  // Calculate usage percentage from real stats
  const storageUsagePercentage = usageStats
    ? Math.min((usageStats.storage_mb.used / usageStats.storage_mb.limit) * 100, 100)
    : 0;

  const documentsUsagePercentage = usageStats
    ? Math.min((usageStats.documents.used / usageStats.documents.limit) * 100, 100)
    : 0;

  const imagesUsagePercentage = usageStats
    ? Math.min((usageStats.images.used / usageStats.images.limit) * 100, 100)
    : 0;

  const formatSize = (mb: number) => {
    // Always show in MB as requested (e.g., 0.5 MB for 500KB)
    return `${Number(mb.toFixed(2))} MB`;
  };

  const formatTimeAgo = (date: Date) => {
    const hours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  // Filter and sort
  const filteredDocs = useMemo(() => {
    let docs = [...userDocuments];
    if (searchQuery) {
      docs = docs.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (filterType !== 'all') {
      if (filterType === 'images') {
        docs = docs.filter(d => imageTypes.includes(d.type));
      } else if (filterType === 'other') {
        docs = docs.filter(d => d.type === 'txt');
      } else {
        docs = docs.filter(d => d.type === filterType);
      }
    }
    return docs.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'oldest') return a.uploadedAt.getTime() - b.uploadedAt.getTime();
      return b.uploadedAt.getTime() - a.uploadedAt.getTime();
    });
  }, [userDocuments, searchQuery, filterType, sortBy]);

  const filteredWebResources = useMemo(() => {
    let resources = [...webResources];
    if (searchQuery) {
      resources = resources.filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return resources.sort((a, b) => {
      if (sortBy === 'name') return a.title.localeCompare(b.title);
      if (sortBy === 'oldest') return a.importedAt.getTime() - b.importedAt.getTime();
      return b.importedAt.getTime() - a.importedAt.getTime();
    });
  }, [webResources, searchQuery, sortBy]);

  // File handling
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    processFiles(files);
    e.target.value = '';
  };

  const processFiles = async (files: File[]) => {
    if (files.length === 0) return;
    setAddModalOpen(false);

    for (const file of files) {
      const ext = file.name.split('.').pop()?.toLowerCase() as DocumentType;
      const supportedFormats = [...documentTypes, ...imageTypes];
      if (!supportedFormats.includes(ext)) {
        showNotification('error', 'Unsupported Format', 'Please upload PDF, DOCX, TXT, PNG, JPG, or JPEG files.');
        continue;
      }

      const sizeInMB = file.size / (1024 * 1024);
      if (sizeInMB > MAX_FILE_SIZE_MB) {
        showNotification('error', 'File Too Large', `${file.name} exceeds ${MAX_FILE_SIZE_MB}MB limit.`);
        continue;
      }

      // Add uploading placeholder
      const tempId = `temp-${Date.now()}`;
      setUploadingFiles(prev => [...prev, tempId]);
      setUserDocuments(prev => [...prev, {
        id: tempId,
        name: file.name,
        type: ext,
        size: sizeInMB,
        status: 'uploading',
        uploadedAt: new Date(),
      }]);

      const result = await uploadDocument(file);
      setUploadingFiles(prev => prev.filter(id => id !== tempId));

      if (result.success && result.document) {
        setUserDocuments(prev => prev.map(d =>
          d.id === tempId
            ? { ...d, id: result.document!.id, status: 'ready', uploadedAt: new Date() }
            : d
        ));
        // Refresh usage stats after upload
        fetchUsageStats();
      } else {
        // Handle failure - remove the temp document and show error
        setUserDocuments(prev => prev.filter(d => d.id !== tempId));
        showNotification('error', 'Upload Failed', result.error || 'Failed to upload file');
      }
    }
  };

  // Web search
  const handleWebSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!webSearchQuery.trim()) return;
    setAddModalOpen(false);
    setIsSearchingWeb(true);
    // searchWeb now handles state update directly
    await searchWeb(webSearchQuery);
    setIsSearchingWeb(false);
    setWebSearchQuery('');
  };

  const handleImportWebResult = async (result: WebSearchResult) => {
    setWebSearchResults(prev => prev.map(r =>
      r.id === result.id ? { ...r, importing: true } : r
    ));
    const imported = await importWebResource(result);

    if (imported) {
      setWebResources(prev => [...prev, imported]);
      // Remove from search results after successful import
      setWebSearchResults(prev => prev.filter(r => r.id !== result.id));
      showNotification('success', 'Imported', 'Web resource imported successfully');
    } else {
      // Revert loading state on failure
      setWebSearchResults(prev => prev.map(r =>
        r.id === result.id ? { ...r, importing: false } : r
      ));
    }
  };

  // Delete handling
  const confirmDelete = (id: string, type: 'user' | 'web') => {
    setItemToDelete({ id, type });
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      await resourceService.deleteResource(itemToDelete.id);

      if (itemToDelete.type === 'user') {
        setUserDocuments(prev => prev.filter(d => d.id !== itemToDelete.id));
      } else {
        setWebResources(prev => prev.filter(r => r.id !== itemToDelete.id));
      }

      // Refresh usage stats after delete
      fetchUsageStats();
    } catch (error) {
      console.error('[Documents] Delete error:', error);
      showNotification('error', 'Delete Failed', 'Failed to delete resource');
    }

    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  // Preview handling
  const openPreview = async (type: 'user' | 'web', data: UserDocument | WebResource) => {
    setPreviewItem({ type, data });
    setPreviewOpen(true);
    setPreviewLoading(true);
    setPreviewContent(null);

    try {
      const response = await resourceService.getResourcePreview(data.id);
      if (response.success && response.data) {
        setPreviewContent(response.data as any);
      } else {
        showNotification('error', 'Preview Failed', response.error?.message || 'Could not load preview');
      }
    } catch (error) {
      console.error('[Documents] Preview error:', error);
      showNotification('error', 'Preview Failed', 'Network error loading preview');
    } finally {
      setPreviewLoading(false);
    }
  };

  // Document actions
  const handleDocumentAction = (docId: string, action: string, docName: string) => {
    navigate('/chat', { state: { documentId: docId, action, documentName: docName } });
  };

  // Document Card
  const DocumentCard = ({ doc }: { doc: UserDocument }) => {
    const Icon = typeIcons[doc.type];
    const colorClass = typeColors[doc.type];
    const isUploading = doc.status === 'uploading';

    return (
      <div
        className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors group cursor-pointer"
        onClick={() => !isUploading && openPreview('user', doc)}
      >
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center",
          doc.type === 'pdf' ? 'bg-red-500/10' :
            doc.type === 'docx' ? 'bg-blue-500/10' :
              imageTypes.includes(doc.type) ? 'bg-green-500/10' : 'bg-muted'
        )}>
          {isUploading ? (
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          ) : (
            <Icon className={cn("w-5 h-5", colorClass)} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
          <p className="text-xs text-muted-foreground">
            {doc.type.toUpperCase()} • {formatSize(doc.size)}
          </p>
        </div>

        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {isUploading ? (
            <span className="text-xs text-muted-foreground">Uploading...</span>
          ) : (
            <>
              <div className="flex items-center gap-1 text-xs text-green-600">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Ready</span>
              </div>
              <span className="text-xs text-muted-foreground">{formatTimeAgo(doc.uploadedAt)}</span>
            </>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="w-8 h-8 opacity-0 group-hover:opacity-100">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">

              <DropdownMenuItem onClick={() => handleDocumentAction(doc.id, 'summarize', doc.name)}>
                <List className="w-4 h-4 mr-2" /> Summarize
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDocumentAction(doc.id, 'explain', doc.name)}>
                <Lightbulb className="w-4 h-4 mr-2" /> Explain
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDocumentAction(doc.id, 'keypoints', doc.name)}>
                <CheckSquare className="w-4 h-4 mr-2" /> Key Points
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => confirmDelete(doc.id, 'user')} className="text-destructive">
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  };

  // Web Resource Card
  const WebResourceCard = ({ resource }: { resource: WebResource }) => {
    const getSourceIcon = (source: string) => {
      const s = source.toLowerCase();
      if (s.includes('medium')) return 'M';
      if (s.includes('tech')) return 'T';
      return source.charAt(0).toUpperCase();
    };

    return (
      <div
        className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors group cursor-pointer"
        onClick={() => openPreview('web', resource)}
      >
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
          {getSourceIcon(resource.source)}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{resource.title}</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Globe className="w-3 h-3" />
            {resource.source}
          </p>
        </div>

        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <CheckCircle className="w-3.5 h-3.5" />
            {formatTimeAgo(resource.importedAt)}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="w-8 h-8 opacity-0 group-hover:opacity-100">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">

              <DropdownMenuItem onClick={() => handleDocumentAction(resource.id, 'summarize', resource.title)}>
                <List className="w-4 h-4 mr-2" /> Summarize
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => confirmDelete(resource.id, 'web')} className="text-destructive">
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  };

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="space-y-2">
      {[1, 2, 3].map(i => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border animate-pulse">
          <div className="w-10 h-10 rounded-lg bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-3 bg-muted rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-background overflow-hidden">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-2 pl-12 xl:pl-0">
            <FileText className="w-5 h-5 text-muted-foreground" />
            <h1 className="text-base sm:text-lg font-semibold text-foreground">Resources</h1>
          </div>
          {/* Storage indicator */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">
                {usageStats
                  ? `${usageStats.storage_mb.used.toFixed(1)} MB / ${usageStats.storage_mb.limit} MB`
                  : 'Loading...'}
              </p>
              <p className="text-xs text-muted-foreground">
                {usageStats
                  ? `${usageStats.documents.used}/${usageStats.documents.limit} docs • ${usageStats.images.used}/${usageStats.images.limit} images`
                  : 'Up to 10 MB per document'}
              </p>
            </div>
            <div className="w-10 h-10 relative shrink-0">
              <svg className="w-10 h-10 transform -rotate-90">
                <circle cx="20" cy="20" r="16" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted" />
                <circle cx="20" cy="20" r="16" fill="none" stroke="currentColor" strokeWidth="3"
                  strokeDasharray={`${storageUsagePercentage} 100`} className="text-primary" />
              </svg>
            </div>
          </div>
        </div>

        {/* Search and Add Resources */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search through your..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-secondary/50 border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <Button onClick={() => setAddModalOpen(true)} className="gap-2 shrink-0">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Resources</span>
          </Button>
        </div>

        {/* Tabs and Filters */}
        <div className="flex items-center justify-between mt-3 sm:mt-4 gap-2">
          <div className="flex items-center gap-1 p-1 bg-secondary/50 rounded-lg overflow-x-auto shrink-0">
            {[
              { id: 'all', label: 'All' },
              { id: 'user', label: 'User Uploaded' },
              { id: 'web', label: 'Web Imported' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ResourceTab)}
                className={cn(
                  'px-2 sm:px-3 py-1.5 text-xs sm:text-sm rounded-md transition-colors whitespace-nowrap',
                  activeTab === tab.id
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground h-8 px-2 sm:px-3">
                  <Filter className="w-4 h-4" />
                  <span className="hidden sm:inline">{filterType === 'all' ? 'All' : filterType.toUpperCase()}</span>
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterType('all')}>All</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType('pdf')}>PDF</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType('docx')}>Text / DOCX</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType('images')}>Images</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType('other')}>Other</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground h-8 px-2 sm:px-3">
                  <span className="hidden sm:inline">Sort: {sortBy === 'newest' ? 'Newest' : sortBy === 'oldest' ? 'Oldest' : 'Name'}</span>
                  <span className="sm:hidden">Sort</span>
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSortBy('newest')}>Newest</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('oldest')}>Oldest</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('name')}>Name</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Content - Two Column Layout */}
      <div className="flex-1 overflow-auto p-3 sm:p-4">
        {/* Web Search Results Banner */}
        {(isSearchingWeb || webSearchResults.length > 0) && (
          <div className="mb-4 p-4 rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium">Web Search Results</h3>
              {webSearchResults.length > 0 && (
                <Button variant="ghost" size="sm" onClick={() => setWebSearchResults([])}>
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            {isSearchingWeb ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Searching the web...
              </div>
            ) : (
              <div className="space-y-2">
                {webSearchResults.map(result => (
                  <div key={result.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div>
                      <p className="text-sm font-medium">{result.title}</p>
                      <p className="text-xs text-muted-foreground">{result.source}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => window.open(result.url, '_blank')}>
                        Visit website
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleImportWebResult(result)}
                        disabled={result.importing}
                      >
                        {result.importing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Import'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Uploaded Section - Always Visible */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-foreground">User Uploaded</h2>
            </div>

            {isLoading.user || uploadingFiles.length > 0 && (activeTab === 'all' || activeTab === 'user') && filteredDocs.length === 0 ? (
              <LoadingSkeleton />
            ) : (activeTab === 'all' || activeTab === 'user') && filteredDocs.length > 0 ? (
              <div className="space-y-2">
                {filteredDocs.map(doc => (
                  <DocumentCard key={doc.id} doc={doc} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 rounded-lg border-2 border-dashed border-border bg-secondary/20">
                <div className="text-muted-foreground text-sm">
                  {activeTab === 'web' ? 'Switch to "All" or "User Uploaded" to view' : 'No documents uploaded yet'}
                </div>
              </div>
            )}
          </div>

          {/* Web Imported Section - Always Visible */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-foreground">Web Imported</h2>
            </div>

            {isLoading.web && (activeTab === 'all' || activeTab === 'web') ? (
              <LoadingSkeleton />
            ) : (activeTab === 'all' || activeTab === 'web') && filteredWebResources.length > 0 ? (
              <div className="space-y-2">
                {filteredWebResources.map(resource => (
                  <WebResourceCard key={resource.id} resource={resource} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 rounded-lg border-2 border-dashed border-border bg-secondary/20">
                <div className="text-muted-foreground text-sm">
                  {activeTab === 'user' ? 'Switch to "All" or "Web Imported" to view' : 'No web resources imported yet'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Resources Modal - Professional & Clean */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="sm:max-w-[600px] p-0 gap-0 bg-background border border-border [&>button]:hidden">
          {/* Header */}
          <div className="relative pt-6">
            <button
              onClick={() => setAddModalOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors p-1 z-10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="px-8 py-6 space-y-6">
            {/* Web Search Section */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Search Web Resources</label>
              <form onSubmit={handleWebSearch}>
                <div className="relative">
                  <Search className="w-4.5 h-4.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search articles, papers, documentation..."
                    value={webSearchQuery}
                    onChange={(e) => setWebSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-lg bg-secondary/50 border border-input text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:bg-secondary/80 transition-all"
                  />
                </div>
              </form>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 text-xs text-muted-foreground bg-background">OR</span>
              </div>
            </div>

            {/* Upload Section */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Upload from Device</label>

              {/* Drag and Drop Area */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  "border-2 border-dashed rounded-lg py-10 px-6 text-center transition-all duration-200",
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-border bg-secondary/20 hover:border-primary/50 hover:bg-secondary/40"
                )}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-secondary border border-border flex items-center justify-center">
                    <Upload className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-foreground font-medium mb-1">
                      {isDragging ? "Drop files here" : "Drag and drop your files"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Supports PDF, DOCX, TXT, PNG, JPG, JPEG
                    </p>
                  </div>
                </div>
              </div>

              {/* Upload Button */}
              <label className="block cursor-pointer">
                <input type="file" multiple onChange={handleFileInput} className="hidden" accept=".pdf,.docx,.txt,.png,.jpg,.jpeg" />
                <div className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors shadow-sm">
                  <Upload className="w-4 h-4" />
                  Browse Files
                </div>
              </label>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] p-0 gap-0 [&>button]:hidden">
          {previewItem && (
            <>
              <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border">
                <div className="flex items-center gap-3">
                  {previewItem.type === 'user' ? (
                    <>
                      {(() => {
                        const doc = previewItem.data as UserDocument;
                        const Icon = typeIcons[doc.type];
                        return (
                          <>
                            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center",
                              doc.type === 'pdf' ? 'bg-red-500/10' :
                                doc.type === 'docx' ? 'bg-blue-500/10' :
                                  imageTypes.includes(doc.type) ? 'bg-green-500/10' : 'bg-muted'
                            )}>
                              <Icon className={cn("w-5 h-5", typeColors[doc.type])} />
                            </div>
                            <div>
                              <h3 className="font-medium text-foreground">{doc.name}</h3>
                              <p className="text-xs text-muted-foreground">{doc.type.toUpperCase()} • {formatSize(doc.size)}</p>
                            </div>
                          </>
                        );
                      })()}
                    </>
                  ) : (
                    <>
                      {(() => {
                        const resource = previewItem.data as WebResource;
                        return (
                          <>
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                              <Globe className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="font-medium text-foreground">{resource.title}</h3>
                              <p className="text-xs text-muted-foreground">{resource.source}</p>
                            </div>
                          </>
                        );
                      })()}
                    </>
                  )}
                </div>
                <button
                  onClick={() => setPreviewOpen(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                {previewLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <span className="ml-3 text-muted-foreground">Loading preview...</span>
                  </div>
                ) : previewContent ? (
                  <>
                    {/* Image Preview */}
                    {previewContent.type === 'image' && previewContent.content && (
                      <div className="flex items-center justify-center bg-secondary/30 rounded-lg p-4">
                        <img
                          src={`data:${previewContent.mime_type};base64,${previewContent.content}`}
                          alt={previewContent.file_name || 'Image preview'}
                          className="max-w-full max-h-[60vh] object-contain rounded-lg"
                        />
                      </div>
                    )}

                    {/* PDF Preview */}
                    {previewContent.type === 'pdf' && previewContent.content && (
                      <div className="w-full h-[70vh] rounded-lg overflow-hidden border border-border">
                        <iframe
                          src={`data:application/pdf;base64,${previewContent.content}`}
                          className="w-full h-full"
                          title={previewContent.file_name || 'PDF Preview'}
                        />
                      </div>
                    )}

                    {/* DOCX Preview - show download option since browser can't render */}
                    {previewContent.type === 'docx' && (
                      <div className="bg-secondary/30 rounded-lg p-8 text-center">
                        <FileText className="w-16 h-16 mx-auto mb-4 text-blue-500" />
                        <p className="text-sm font-medium text-foreground mb-2">{previewContent.file_name}</p>
                        <p className="text-xs text-muted-foreground mb-4">DOCX files cannot be previewed directly in the browser.</p>
                        {previewContent.content && (
                          <a
                            href={`data:${previewContent.mime_type};base64,${previewContent.content}`}
                            download={previewContent.file_name}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                          >
                            <File className="w-4 h-4" />
                            Download File
                          </a>
                        )}
                      </div>
                    )}

                    {/* Text/Web Preview */}
                    {(previewContent.type === 'text' || previewContent.type === 'web') && (
                      <div className="bg-secondary/30 rounded-lg p-4">
                        {previewContent.source_url && (
                          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
                            <Globe className="w-4 h-4 text-primary" />
                            <a
                              href={previewContent.source_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline truncate"
                            >
                              {previewContent.source_url}
                            </a>
                          </div>
                        )}
                        <pre className="text-sm text-foreground/80 whitespace-pre-wrap font-sans leading-relaxed max-h-[50vh] overflow-y-auto">
                          {previewContent.content || 'No content available'}
                        </pre>
                      </div>
                    )}

                    {/* Binary/Unknown - offer download */}
                    {previewContent.type === 'binary' && (
                      <div className="bg-secondary/30 rounded-lg p-8 text-center">
                        <File className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-sm font-medium text-foreground mb-2">{previewContent.file_name}</p>
                        <p className="text-xs text-muted-foreground mb-4">This file type cannot be previewed.</p>
                        {previewContent.content && (
                          <a
                            href={`data:${previewContent.mime_type || 'application/octet-stream'};base64,${previewContent.content}`}
                            download={previewContent.file_name}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                          >
                            <File className="w-4 h-4" />
                            Download File
                          </a>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Could not load preview</p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Resource</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this resource? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
