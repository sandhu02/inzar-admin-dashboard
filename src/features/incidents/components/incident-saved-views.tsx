'use client';

import * as React from 'react';
import {
  Bookmark,
  Check,
  ChevronDown,
  Plus,
  Trash2,
  Edit2,
  Star,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSavedViews } from '../hooks/use-saved-views';
import type { IncidentFilterValues, SavedView } from '../types';

interface SavedViewsProps {
  currentFilters: IncidentFilterValues;
  activeViewId: string;
  onSelectView: (view: SavedView) => void;
}

export function IncidentSavedViews({
  currentFilters,
  activeViewId,
  onSelectView,
}: SavedViewsProps) {
  const {
    views,
    defaultViewId,
    saveCurrentView,
    renameView,
    deleteView,
    setDefaultView,
  } = useSavedViews();

  const [saveDialogOpen, setSaveDialogOpen] = React.useState(false);
  const [newViewName, setNewViewName] = React.useState('');

  const [renameDialogOpen, setRenameDialogOpen] = React.useState(false);
  const [viewToRename, setViewToRename] = React.useState<SavedView | null>(null);
  const [renamedName, setRenamedName] = React.useState('');

  const activeView =
    views.find((v) => v.id === activeViewId) ||
    views.find((v) => v.id === defaultViewId) ||
    views[0];

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newViewName.trim()) return;
    const created = saveCurrentView(newViewName, currentFilters);
    onSelectView(created);
    setNewViewName('');
    setSaveDialogOpen(false);
  };

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewToRename || !renamedName.trim()) return;
    renameView(viewToRename.id, renamedName);
    setRenameDialogOpen(false);
    setViewToRename(null);
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Saved Views Picker Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-9 font-mono text-xs border-border bg-surface hover:bg-surface-elevated text-foreground"
            >
              <Bookmark className="h-3.5 w-3.5 mr-1.5 text-accent" />
              <span>{activeView?.name || 'Default view'}</span>
              <ChevronDown className="h-3.5 w-3.5 ml-1.5 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              Saved Views
            </div>
            {views.map((v) => {
              const isSelected = v.id === (activeView?.id ?? 'default');
              const isDefault = v.id === defaultViewId;

              return (
                <div
                  key={v.id}
                  className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-surface-elevated group"
                >
                  <button
                    type="button"
                    onClick={() => onSelectView(v)}
                    className="flex items-center gap-2 text-xs font-sans text-left flex-1 truncate"
                  >
                    {isSelected ? (
                      <Check className="h-3.5 w-3.5 text-accent shrink-0" />
                    ) : (
                      <span className="w-3.5 h-3.5 shrink-0" />
                    )}
                    <span className="truncate">{v.name}</span>
                    {isDefault && (
                      <Star className="h-3 w-3 fill-status-warning text-status-warning ml-1 shrink-0" />
                    )}
                  </button>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!isDefault && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDefaultView(v.id);
                        }}
                        title="Set as default view"
                        className="p-1 hover:text-accent rounded text-muted-foreground"
                      >
                        <Star className="h-3 w-3" />
                      </button>
                    )}
                    {!v.isSystem && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewToRename(v);
                            setRenamedName(v.name);
                            setRenameDialogOpen(true);
                          }}
                          title="Rename view"
                          className="p-1 hover:text-foreground rounded text-muted-foreground"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteView(v.id);
                          }}
                          title="Delete view"
                          className="p-1 hover:text-status-danger rounded text-muted-foreground"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setSaveDialogOpen(true)}
              className="cursor-pointer text-xs font-mono text-accent"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Save current filters as view...
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Save View Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSaveDialogOpen(true)}
          className="h-9 font-mono text-xs border-border bg-surface hover:bg-surface-elevated text-foreground"
        >
          <span>Save view</span>
        </Button>
      </div>

      {/* Save View Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="max-w-md bg-surface border-border">
          <DialogHeader>
            <DialogTitle className="text-base font-bold font-sans">
              Save View
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveSubmit} className="space-y-4 pt-2">
            <div>
              <label
                htmlFor="view-name-input"
                className="text-xs font-mono text-muted-foreground block mb-1.5"
              >
                VIEW NAME
              </label>
              <Input
                id="view-name-input"
                placeholder="e.g. Critical Fire Alerts"
                value={newViewName}
                onChange={(e) => setNewViewName(e.target.value)}
                autoFocus
                className="font-sans text-sm"
              />
            </div>
            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSaveDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="default"
                size="sm"
                disabled={!newViewName.trim()}
              >
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Rename View Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent className="max-w-md bg-surface border-border">
          <DialogHeader>
            <DialogTitle className="text-base font-bold font-sans">
              Rename View
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRenameSubmit} className="space-y-4 pt-2">
            <div>
              <label
                htmlFor="rename-view-input"
                className="text-xs font-mono text-muted-foreground block mb-1.5"
              >
                NEW NAME
              </label>
              <Input
                id="rename-view-input"
                value={renamedName}
                onChange={(e) => setRenamedName(e.target.value)}
                autoFocus
                className="font-sans text-sm"
              />
            </div>
            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setRenameDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="default"
                size="sm"
                disabled={!renamedName.trim()}
              >
                Rename
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
