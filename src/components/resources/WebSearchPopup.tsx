/**
 * WebSearchPopup Component
 * Modal for searching web resources using Perplexity API.
 * Shows up to 20 results with Visit and Import actions.
 */
import React, { useState } from 'react';
import { Search, Loader2, Globe, ExternalLink, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { resourcesService, WebSearchResult } from '@/services/resourcesService';
import { useNotification } from '@/components/notifications/NotificationProvider';
import { cn } from '@/lib/utils';

interface WebSearchPopupProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onImportSuccess?: () => void;
}

export default function WebSearchPopup({ open, onOpenChange, onImportSuccess }: WebSearchPopupProps) {
    const { showNotification } = useNotification();
    const [query, setQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [results, setResults] = useState<WebSearchResult[]>([]);
    const [searchId, setSearchId] = useState<string | null>(null);
    const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
    const [isImporting, setIsImporting] = useState(false);
    const [usage, setUsage] = useState<{ used: number; limit: number } | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsSearching(true);
        setResults([]);
        setSelectedIndices(new Set());

        try {
            const response = await resourcesService.searchWeb(query);

            if (response.success && response.data) {
                setResults(response.data.results);
                setSearchId(response.data.search_id);
                setUsage(response.data.usage);
                showNotification('success', 'Search Complete', `Found ${response.data.count} results`);
            } else if (response.error === 'Daily limit reached') {
                showNotification('error', 'Limit Reached', response.message || 'You have reached your daily search limit.');
                setUsage(response.usage || null);
            } else {
                showNotification('error', 'Search Failed', response.message || 'Unable to search web resources.');
            }
        } catch (error) {
            showNotification('error', 'Search Error', 'An error occurred while searching.');
        } finally {
            setIsSearching(false);
        }
    };

    // toggle checkbox on entire row click for easier selection
    const toggleSelection = (index: number) => {
        setSelectedIndices((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    };

    const handleImport = async () => {
        if (!searchId || selectedIndices.size === 0) return;

        setIsImporting(true);

        try {
            const response = await resourcesService.importResources(searchId, Array.from(selectedIndices));

            if (response.success && response.data) {
                showNotification(
                    'success',
                    'Import Complete',
                    `Successfully imported ${response.data.imported_count} resources.`
                );

                // Close popup and reset
                setQuery('');
                setResults([]);
                setSearchId(null);
                setSelectedIndices(new Set());
                onOpenChange(false);

                // Notify parent to refresh resource list
                onImportSuccess?.();
            } else {
                showNotification('error', 'Import Failed', 'Unable to import selected resources.');
            }
        } catch (error) {
            showNotification('error', 'Import Error', 'An error occurred during import.');
        } finally {
            setIsImporting(false);
        }
    };

    // reset everything on close so stale results don't linger
    const handleClose = () => {
        setQuery('');
        setResults([]);
        setSearchId(null);
        setSelectedIndices(new Set());
        setUsage(null);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] p-0 gap-0 [&>button]:hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border">
                    <div>
                        <h2 className="text-lg font-semibold">Search Web Resources</h2>
                        {usage && (
                            <p className="text-xs text-muted-foreground mt-1">
                                {usage.used} / {usage.limit} searches used today
                            </p>
                        )}
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Search Input */}
                <div className="px-6 py-4 border-b border-border">
                    <form onSubmit={handleSearch}>
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search articles, papers, documentation..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                disabled={isSearching}
                                className="w-full pl-10 pr-4 py-3 rounded-lg bg-secondary/50 border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                            />
                        </div>
                    </form>
                </div>

                {/* Results */}
                <div className="flex-1 overflow-y-auto px-6 py-4 max-h-[400px]">
                    {isSearching ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground">Searching web...</p>
                            </div>
                        </div>
                    ) : results.length > 0 ? (
                        <div className="space-y-2">
                            {results.map((result, index) => (
                                <div
                                    key={index}
                                    className={cn(
                                        "flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer",
                                        selectedIndices.has(index)
                                            ? "border-primary bg-primary/5"
                                            : "border-border hover:border-primary/30"
                                    )}
                                    onClick={() => toggleSelection(index)}
                                >
                                    <div className="flex-shrink-0 mt-1">
                                        <input
                                            type="checkbox"
                                            checked={selectedIndices.has(index)}
                                            onChange={() => toggleSelection(index)}
                                            className="w-4 h-4"
                                        />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-medium text-foreground mb-1 truncate">
                                            {result.title}
                                        </h4>
                                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                            {result.snippet}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <Globe className="w-3 h-3 text-muted-foreground" />
                                            <a
                                                href={result.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                                className="text-xs text-primary hover:underline truncate"
                                            >
                                                {result.url}
                                            </a>
                                            <ExternalLink className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center py-12">
                            <p className="text-sm text-muted-foreground">
                                {query ? 'No results found' : 'Enter a query to search'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {results.length > 0 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-border">
                        <p className="text-sm text-muted-foreground">
                            {selectedIndices.size} of {results.length} selected
                        </p>
                        <div className="flex gap-2">
                            <Button variant="ghost" onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleImport}
                                disabled={selectedIndices.size === 0 || isImporting}
                            >
                                {isImporting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        Importing...
                                    </>
                                ) : (
                                    `Import ${selectedIndices.size} resource${selectedIndices.size !== 1 ? 's' : ''}`
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
