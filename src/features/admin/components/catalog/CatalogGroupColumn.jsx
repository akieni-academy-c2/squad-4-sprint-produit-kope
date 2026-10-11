import { GripVertical, Pencil, Plus, Trash2 } from 'lucide-react';
import { Button, Tooltip } from '@/shared/components/ui';
import { cn } from '@/shared/utils';
import { InlineInput } from './InlineInput.jsx';

export function CatalogGroupColumn({
  group,
  groupKey,
  entries,
  realCount,
  filteredOut,
  draft,
  tint,
  groupNoun,
  itemPlaceholder,
  canReorder,
  editingGroupId,
  groupName,
  isAdding,
  handlers,
}) {
  return (
    <section
      aria-label={group.name}
      className={cn('flex flex-col overflow-hidden rounded-lg border border-transparent', tint.band)}
      onDragOver={(e) => {
        e.preventDefault();
        handlers.showPreview(groupKey, realCount);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) handlers.setOverKey((k) => (k === groupKey ? null : k));
      }}
      onDrop={(e) => {
        e.preventDefault();
        if (canReorder) handlers.handleDrop(groupKey, realCount);
      }}
    >
      <header
        draggable={canReorder && editingGroupId !== group.id}
        onDragStart={(e) => {
          handlers.startGroupDrag(group.id);
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', `group-${group.id}`);
        }}
        onDragEnd={handlers.resetDrag}
        className="flex items-center gap-2 border-b border-white/25 px-3 py-2.5"
      >
        {canReorder && <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-white/70" aria-hidden />}

        <span className={cn('h-2.5 w-2.5 shrink-0 rounded-full', tint.dot)} aria-hidden />

        {editingGroupId === group.id ? (
          <InlineInput
            value={groupName}
            onChange={handlers.setGroupName}
            onSubmit={() => handlers.commitGroupRename(group.id)}
            onCancel={handlers.stopEditingGroup}
            aria-label={`Renommer ${group.name}`}
            className="flex-1"
          />
        ) : (
          <>
            <h3 className="min-w-0 flex-1 truncate text-sm font-bold text-white">{group.name}</h3>
            <span className="shrink-0 rounded-full border border-white/30 bg-white/20 px-2 py-0.5 text-[11px] font-semibold text-white">
              {realCount}
            </span>
            <Tooltip content={`Modifier le ${groupNoun}`}>
              <Button
                size="icon-sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={() => handlers.startEditingGroup(group)}
                aria-label={`Modifier ${group.name}`}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            </Tooltip>
          </>
        )}

        <Tooltip content={`Supprimer le ${groupNoun}`}>
          <Button
            size="icon-sm"
            variant="ghost"
            className="text-white hover:bg-white/20"
            onClick={() => handlers.requestDelete('group', group)}
            aria-label={`Supprimer ${group.name}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </Tooltip>
      </header>

      <div className="flex min-h-16 flex-col gap-2 bg-white/10 p-2">
        {filteredOut ? (
          <p className="px-1 py-2 text-xs text-gray-400">Masqué par le filtre</p>
        ) : entries.length === 0 ? (
          <p className="px-1 py-2 text-xs text-gray-400">Déposez un élément ici</p>
        ) : (
          entries.map((entry, index) =>
            handlers.renderEntry(entry, index, groupKey),
          )
        )}
      </div>

      <div className="border-t border-white/25 p-2">
        {isAdding ? (
          <InlineInput
            value={draft}
            onChange={(v) => handlers.setDraft(group.id, v)}
            onSubmit={() => handlers.submitNewItem(group.id)}
            onCancel={() => handlers.cancelNewItem(group.id)}
            placeholder={itemPlaceholder}
            ariaLabel={`Ajouter dans ${group.name}`}
          />
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-white hover:bg-white/20"
            onClick={() => handlers.startAdding(group.id)}
          >
            <Plus className="h-4 w-4" />
            Ajouter
          </Button>
        )}
      </div>
    </section>
  );
}