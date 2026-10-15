import { Plus, X } from "lucide-react";
import { Button, CustomSelect, DataState, Modal } from "@/shared/components/ui";
import {
  AdminFilterGroup,
  AdminFilterPanel,
  AdminSectionLayout,
} from "./AdminSectionLayout.jsx";
import { groupKeyOf, tintFor } from "./catalog/catalogUtils.js";
import { CatalogGroupColumn } from "./catalog/CatalogGroupColumn.jsx";
import { CatalogItemCard } from "./catalog/CatalogItemCard.jsx";
import { InlineInput } from "./catalog/InlineInput.jsx";
import { useCatalogBoard } from "./useCatalogBoard.js";

export function AdminCatalogBoard({
  rightContainer = null,
  groupLabel = "groupe",
  groupNoun = "groupe",
  itemNoun = "élément",
  itemPlaceholder = "Nouvel élément",
  allGroupsLabel = "Tous",
  searchId = "cat-search",
  groupByKey,
  listGroups,
  listItems,
  createGroup,
  updateGroup,
  removeGroup,
  reorderGroups,
  createItem,
  updateItem,
  removeItem,
  reorderItems,
}) {
  const board = useCatalogBoard({
    groupByKey,
    groupNoun,
    itemNoun,
    listGroups,
    listItems,
    createGroup,
    updateGroup,
    removeGroup,
    reorderGroups,
    createItem,
    updateItem,
    removeItem,
    reorderItems,
  });

  const {
    groups,
    items,
    loading,
    error,
    saving,
    query,
    setQuery,
    groupFilter,
    setGroupFilter,
    newGroup,
    setNewGroup,
    addingTo,
    drafts,
    editingGroupId,
    groupName,
    editingItemId,
    itemName,
    confirm,
    setConfirm,
    canReorder,
    dirty,
    submitSearch,
    resetFilters,
    submitNewGroup,
    displayEntries,
    cardsOf,
    doDelete,
    itemHandlers,
    groupHandlers,
  } = board;

  const renderFilters = (searchId) => (
    <AdminFilterPanel dirty={dirty} onReset={resetFilters}>
      <form onSubmit={submitSearch} className="divide-y divide-gray-100">
        <AdminFilterGroup title="Recherche">
          <div className="flex h-10 items-center gap-2 rounded-md border border-gray-200 bg-white px-3 transition-[border-color,box-shadow] hover:border-gray-300 focus-within:border-primary-500 focus-within:ring-4 focus-within:ring-primary-500/12">
            <input
              id={searchId}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Rechercher ${itemNoun}...`}
              aria-label={`Rechercher ${itemNoun}`}
              className="min-w-0 flex-1 bg-transparent text-[14px] text-gray-900 outline-none placeholder:text-gray-400"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Effacer la recherche"
                className="grid h-6 w-6 shrink-0 place-items-center rounded-sm text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </AdminFilterGroup>

        <AdminFilterGroup title={groupLabel}>
          <CustomSelect
            value={groupFilter}
            onChange={setGroupFilter}
            options={[
              { value: "", label: allGroupsLabel },
              ...groups.map((g) => ({ value: String(g.id), label: g.name })),
            ]}
            className="w-full"
            aria-label={`Filtrer par ${groupLabel.toLowerCase()}`}
          />
        </AdminFilterGroup>
      </form>
    </AdminFilterPanel>
  );

  const renderEntry = (entry, index, key) => (
    <CatalogItemCard
      key={entry.entryKey}
      entry={entry}
      index={index}
      groupKey={key}
      canReorder={canReorder}
      editingItemId={editingItemId}
      itemName={itemName}
      drag={board.drag}
      overKey={board.overKey}
      handlers={itemHandlers}
    />
  );

  return (
    <AdminSectionLayout
      rightContainer={rightContainer}
      total={items.length}
      noun={itemNoun}
      dirty={dirty}
      filters={renderFilters}
      searchId={searchId}
    >
      <DataState loading={loading} error={error}>
        <div className="space-y-3 pb-2">
          {groups.map((group) => (
            <CatalogGroupColumn
              key={group.id}
              group={group}
              groupKey={groupKeyOf(group.id)}
              entries={displayEntries(groupKeyOf(group.id))}
              realCount={cardsOf(groupKeyOf(group.id)).length}
              filteredOut={
                Boolean(groupFilter) && groupFilter !== String(group.id)
              }
              draft={drafts[group.id] || ""}
              tint={tintFor(group.name)}
              groupNoun={groupNoun}
              itemPlaceholder={itemPlaceholder}
              canReorder={canReorder}
              editingGroupId={editingGroupId}
              groupName={groupName}
              isAdding={addingTo === group.id}
              handlers={{ ...groupHandlers, renderEntry }}
            />
          ))}

          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50/70 p-2">
            {newGroup == null ? (
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-gray-600"
                onClick={() => setNewGroup("")}
              >
                <Plus className="h-4 w-4" />
                {`Nouveau ${groupNoun}`}
              </Button>
            ) : (
              <InlineInput
                value={newGroup}
                onChange={setNewGroup}
                onSubmit={submitNewGroup}
                onCancel={() => setNewGroup(null)}
                placeholder={`Nom du ${groupNoun}`}
                ariaLabel={`Nom du ${groupNoun}`}
              />
            )}
          </div>
        </div>
      </DataState>

      <Modal
        open={Boolean(confirm)}
        onClose={() => !saving && setConfirm(null)}
        dismissable={!saving}
        title={
          confirm?.kind === "group"
            ? `Supprimer ce ${groupNoun} ?`
            : `Supprimer cet ${itemNoun} ?`
        }
        description={
          confirm?.kind === "group"
            ? `Cette action est définitive. Un ${groupNoun} contenant des ${itemNoun}s ne peut pas être supprimé.`
            : `Cette action est définitive. Un ${itemNoun} utilisé par des professionnels ne peut pas être supprimé.`
        }
        actions={
          <>
            <Button
              variant="secondary"
              onClick={() => setConfirm(null)}
              disabled={saving}
            >
              Annuler
            </Button>
            <Button variant="danger" onClick={doDelete} loading={saving}>
              Supprimer
            </Button>
          </>
        }
      />
    </AdminSectionLayout>
  );
}
