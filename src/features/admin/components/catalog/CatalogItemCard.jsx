import { Calendar, Pencil, Trash2, Users } from 'lucide-react';
import { Button, Tooltip } from '@/shared/components/ui';
import { formatDateFr } from '@/shared/utils';
import { usedBy } from '../catalog/catalogUtils.js';
import { InlineInput, PositionBadge } from '../catalog/InlineInput.jsx';

function ItemFooter({ item }) {
  return (
    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
      <span className="flex items-center gap-1">
        <Users className="h-3.5 w-3.5 shrink-0" aria-hidden />
        {usedBy(item.professionals ?? 0)}
      </span>
      {item.createdAt && (
        <span className="flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden />
          Créé le {formatDateFr(item.createdAt)}
        </span>
      )}
    </p>
  );
}

/**
 * Carte d'un élément du catalogue. Trois états visuels : normal, emplacement
 * réservé (`gap`) et clone suivant le glissement (`preview`).
 */
export function CatalogItemCard({
  entry,
  index,
  groupKey,
  canReorder,
  editingItemId,
  itemName,
  drag,
  overKey,
  handlers,
}) {
  const { item, state, entryKey } = entry;
  const isGap = state === 'gap';
  const isPreview = state === 'preview';

  return (
    <article
      key={entryKey}
      draggable={canReorder && editingItemId !== item.id && state === 'normal'}
      aria-hidden={isGap || undefined}
      onDragStart={(e) => {
        handlers.startDrag(item.id);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', String(item.id));
      }}
      onDragEnd={handlers.resetDrag}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handlers.showPreview(groupKey, index);
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (canReorder) handlers.handleDrop(groupKey, index);
      }}
      className={`overflow-hidden rounded-md border bg-white p-2.5 ${
        isPreview
          ? 'relative z-20 cursor-grabbing border-primary-500 border-2 border-dashed shadow-lg'
          : isGap
            ? 'border-2 border-dashed border-primary-300 bg-primary-50'
            : 'cursor-grab border-gray-200 active:cursor-grabbing'
      } ${
        overKey === groupKey && drag?.kind === 'item' && drag.id !== item.id && state === 'normal'
          ? 'ring-2 ring-primary-300'
          : ''
      }`}
    >
      <div className={`flex items-start gap-2 ${isGap ? 'invisible' : ''}`}>
        <PositionBadge value={index + 1} muted={isGap} />

        {editingItemId === item.id ? (
          <InlineInput
            value={itemName}
            onChange={handlers.setItemName}
            onSubmit={() => handlers.commitItemRename(item.id)}
            onCancel={handlers.stopEditingItem}
            aria-label={`Renommer ${item.name}`}
            className="flex-1"
          />
        ) : (
          <p className="min-w-0 flex-1 break-words text-sm font-semibold text-gray-900">{item.name}</p>
        )}
      </div>

      {editingItemId !== item.id ? <ItemFooter item={item} /> : null}

      <div
        className={`-mx-2.5 -mb-2.5 mt-3 flex items-center justify-end gap-1 rounded-b-md border-t border-gray-100 bg-gray-50/80 px-2.5 py-1.5 ${
          isGap ? 'invisible' : ''
        }`}
      >
        <Tooltip content="Modifier">
          <Button
            size="icon-sm"
            variant="ghost"
            className="text-primary-600 hover:bg-mint-100"
            onClick={() => handlers.startEditingItem(item)}
            aria-label={`Modifier ${item.name}`}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        </Tooltip>
        <Tooltip content="Supprimer">
          <Button
            size="icon-sm"
            variant="ghost"
            className="text-rose-600 hover:bg-rose-50"
            onClick={() => handlers.requestDelete('item', item)}
            aria-label={`Supprimer ${item.name}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </Tooltip>
      </div>
    </article>
  );
}