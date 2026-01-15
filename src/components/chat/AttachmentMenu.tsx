import React, { useState, useRef } from 'react';
import { Plus, FileText, Image, X, File } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface AttachedFile {
  id: string;
  name: string;
  type: 'document' | 'image';
  file: File;
  loading?: boolean;
  resourceId?: string; // ID assigned by backend after upload
}

interface AttachmentMenuProps {
  attachments: AttachedFile[];
  onAttach: (files: AttachedFile[]) => void;
  onRemove: (id: string) => void;
}

const supportedDocFormats = ['.pdf', '.docx', '.doc', '.txt', '.md'];

export function AttachmentMenu({ attachments, onAttach, onRemove }: AttachmentMenuProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleDocumentSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newAttachments: AttachedFile[] = Array.from(files).map(file => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: 'document',
      file,
    }));

    onAttach([...attachments, ...newAttachments]);
    e.target.value = '';
    setMenuOpen(false);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    // For now, images are coming soon - this is a placeholder
    e.target.value = '';
    setMenuOpen(false);
  };

  return (
    <>
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
              'text-muted-foreground hover:text-foreground hover:bg-secondary'
            )}
          >
            <Plus className="w-5 h-5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          side="top"
          className="bg-popover border border-border z-50 min-w-[180px]"
        >
          <DropdownMenuItem
            onClick={() => documentInputRef.current?.click()}
            className="flex items-center gap-2 cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Add Documents</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled
            className="flex items-center gap-2 cursor-not-allowed opacity-50"
          >
            <Image className="w-4 h-4" />
            <div className="flex-1 flex items-center justify-between">
              <span>Add Images</span>
              <span className="text-xs text-muted-foreground">Soon</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Hidden file inputs */}
      <input
        ref={documentInputRef}
        type="file"
        accept={supportedDocFormats.join(',')}
        multiple
        className="hidden"
        onChange={handleDocumentSelect}
      />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleImageSelect}
      />
    </>
  );
}

export function AttachmentPreview({
  attachments,
  onRemove
}: {
  attachments: AttachedFile[];
  onRemove: (id: string) => void;
}) {
  if (attachments.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 px-2 pb-2">
      {attachments.map(attachment => (
        <div
          key={attachment.id}
          className="flex items-center gap-2 px-2 py-1.5 bg-secondary rounded-lg text-sm"
        >
          {attachment.type === 'document' ? (
            <FileText className="w-3.5 h-3.5 text-primary" />
          ) : (
            <Image className="w-3.5 h-3.5 text-primary" />
          )}
          <span className="text-foreground truncate max-w-[120px]">
            {attachment.name}
          </span>
          <button
            onClick={() => onRemove(attachment.id)}
            className="w-4 h-4 rounded flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
    </div>
  );
}
