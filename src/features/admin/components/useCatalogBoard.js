import { useCallback, useEffect, useState } from 'react';
import { useNotification } from '@/shared/context/NotificationContext.jsx';
import {
  groupKeyOf,
  groupItems,
  displayEntries as buildEntries,
  destinationIndex as entryDestination,
} from './catalog/catalogUtils.js';

export function useCatalogBoard({
  groupByKey = 'groupId',
  groupNoun = 'groupe',
  itemNoun = 'élément',
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
  const { toast } = useNotification();

  const [groups, setGroups] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState('');

  const [drag, setDrag] = useState(null);
  const [preview, setPreview] = useState(null);
  const [overKey, setOverKey] = useState(null);

  const [newGroup, setNewGroup] = useState(null);
  const [addingTo, setAddingTo] = useState(null);
  const [drafts, setDrafts] = useState({});
  const [editingGroupId, setEditingGroupId] = useState(null);
  const [groupName, setGroupName] = useState('');
  const [editingItemId, setEditingItemId] = useState(null);
  const [itemName, setItemName] = useState('');
  const [confirm, setConfirm] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [groupsRes, itemsRes] = await Promise.all([listGroups(), listItems()]);
      setGroups(groupsRes?.items ?? groupsRes ?? []);
      setItems(itemsRes?.items ?? itemsRes ?? []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [listGroups, listItems]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload();
  }, [reload]);

  const visibleItems = items.filter((item) =>
    search ? item.name.toLowerCase().includes(search.toLowerCase()) : true,
  );
  const grouped = groupItems(visibleItems, groups, groupByKey);

  const canReorder = !search && !groupFilter;
  const draggingItem = drag?.kind === 'item' ? items.find((i) => i.id === drag.id) : null;

  const cardsOf = (key) => grouped.get(key) ?? [];
  const displayEntries = (key) => buildEntries(cardsOf(key), draggingItem, preview, key);
  const destinationIndex = (key, entryIndex) => entryDestination(cardsOf(key), entryIndex, draggingItem);

  const showPreview = (key, entryIndex) => {
    if (!canReorder || !draggingItem) return;
    const index = destinationIndex(key, entryIndex);
    if (preview?.key === key && preview?.index === index) return;
    setPreview({ key, index });
    setOverKey(key);
  };

  const resetDrag = () => {
    setDrag(null);
    setPreview(null);
    setOverKey(null);
  };

  const failAndReload = (err) => {
    toast({ message: err?.message || 'Erreur.', type: 'error' });
    reload();
  };

  const submitSearch = (e) => {
    e.preventDefault();
    setSearch(query.trim());
  };

  const resetFilters = () => {
    setQuery('');
    setSearch('');
    setGroupFilter('');
  };

  const submitNewGroup = async () => {
    const name = String(newGroup || '').trim();
    if (!name) return;
    setSaving(true);
    try {
      await createGroup({ name });
      setNewGroup(null);
      reload();
    } catch (err) {
      failAndReload(err);
    } finally {
      setSaving(false);
    }
  };

  const commitGroupRename = async (groupId) => {
    const name = String(groupName || '').trim();
    setEditingGroupId(null);
    if (!name) return;
    try {
      await updateGroup(groupId, { name });
      reload();
    } catch (err) {
      failAndReload(err);
    }
  };

  const submitNewItem = async (groupId) => {
    const name = String(drafts[groupId] || '').trim();
    if (!name) return;
    setSaving(true);
    try {
      await createItem({ name, [groupByKey]: groupId });
      setDrafts((prev) => ({ ...prev, [groupId]: '' }));
      setAddingTo(null);
      reload();
    } catch (err) {
      failAndReload(err);
    } finally {
      setSaving(false);
    }
  };

  const commitItemRename = async (itemId) => {
    const name = String(itemName || '').trim();
    setEditingItemId(null);
    if (!name) return;
    const item = items.find((i) => i.id === itemId);
    if (!item) return;
    try {
      await updateItem(itemId, { name, [groupByKey]: item[groupByKey] });
      reload();
    } catch (err) {
      failAndReload(err);
    }
  };

  const dropItem = (itemId, targetKey, index) => {
    const moved = items.find((i) => i.id === itemId);
    if (!moved) return;
    const bucket = items.filter((i) => i.id !== itemId && groupKeyOf(i[groupByKey]) === targetKey);
    const position = Math.max(0, Math.min(index ?? bucket.length, bucket.length));
    bucket.splice(position, 0, { ...moved, [groupByKey]: targetKey });
    const rest = items.filter((i) => i.id !== itemId && groupKeyOf(i[groupByKey]) !== targetKey);
    setItems([...rest, ...bucket]);
    updateItem(itemId, { name: moved.name, [groupByKey]: targetKey })
      .then(() => reorderItems(bucket.map((i) => i.id)))
      .catch(failAndReload);
  };

  const dropGroup = (groupId, targetIndex) => {
    const next = [...groups];
    const from = next.findIndex((g) => g.id === groupId);
    if (from < 0) return;
    const [moved] = next.splice(from, 1);
    const to = from < targetIndex ? targetIndex - 1 : targetIndex;
    next.splice(Math.max(0, Math.min(to, next.length)), 0, moved);
    setGroups(next);
    reorderGroups(next.map((g) => g.id)).catch(failAndReload);
  };

  const handleDrop = (targetKey, entryIndex) => {
    if (!drag) return;
    if (drag.kind === 'group') {
      const groupIndex = groups.findIndex((g) => groupKeyOf(g.id) === targetKey);
      dropGroup(drag.id, groupIndex < 0 ? groups.length : groupIndex);
    } else if (preview && preview.key === targetKey) dropItem(drag.id, targetKey, preview.index);
    else dropItem(drag.id, targetKey, destinationIndex(targetKey, entryIndex ?? cardsOf(targetKey).length));

    resetDrag();
  };

  const doDelete = async () => {
    if (!confirm) return;
    setSaving(true);
    try {
      if (confirm.kind === 'group') await removeGroup(confirm.target.id);
      else await removeItem(confirm.target.id);
      toast({
        message: confirm.kind === 'group' ? `${groupNoun} supprimé.` : `${itemNoun} supprimé.`,
        type: 'success',
      });
      setConfirm(null);
      reload();
    } catch (err) {
      toast({ message: err?.message || 'Erreur.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const itemHandlers = {
    startDrag: (id) => setDrag({ kind: 'item', id }),
    resetDrag,
    showPreview,
    handleDrop,
    setItemName,
    commitItemRename,
    stopEditingItem: () => setEditingItemId(null),
    startEditingItem: (item) => {
      setEditingItemId(item.id);
      setItemName(item.name);
    },
    requestDelete: (kind, target) => setConfirm({ kind, target }),
  };

  const groupHandlers = {
    ...itemHandlers,
    startGroupDrag: (id) => setDrag({ kind: 'group', id }),
    setOverKey,
    setGroupName,
    commitGroupRename,
    stopEditingGroup: () => setEditingGroupId(null),
    startEditingGroup: (group) => {
      setEditingGroupId(group.id);
      setGroupName(group.name);
    },
    setDraft: (groupId, value) => setDrafts((prev) => ({ ...prev, [groupId]: value })),
    submitNewItem,
    cancelNewItem: (groupId) => {
      setDrafts((prev) => ({ ...prev, [groupId]: '' }));
      setAddingTo(null);
    },
    startAdding: (groupId) => setAddingTo(groupId),
  };

  return {
    groups,
    items,
    loading,
    error,
    saving,
    query,
    setQuery,
    search,
    groupFilter,
    setGroupFilter,
    drag,
    preview,
    overKey,
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
    dirty: Boolean(query || search || groupFilter),
    submitSearch,
    resetFilters,
    submitNewGroup,
    displayEntries,
    cardsOf,
    doDelete,
    itemHandlers,
    groupHandlers,
  };
}