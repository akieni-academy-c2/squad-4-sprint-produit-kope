import { AdminCatalogBoard } from './AdminCatalogBoard.jsx';
import {
  createTrade,
  createTradeCategory,
  deleteTrade,
  deleteTradeCategory,
  listTradeCategories,
  listTrades,
  reorderTradeCategories,
  reorderTrades,
  updateTrade,
  updateTradeCategory,
} from '../services/admin.service.js';

export function AdminTradesBoard({ rightContainer = null }) {
  return (
    <AdminCatalogBoard
      rightContainer={rightContainer}
      groupLabel="Catégorie"
      groupNoun="catégorie"
      itemNoun="métier"
      itemPlaceholder="Nouveau métier"
      allGroupsLabel="Toutes les catégories"
      groupByKey="categoryId"
      searchId="trd-search"
      listGroups={listTradeCategories}
      listItems={listTrades}
      createGroup={createTradeCategory}
      updateGroup={updateTradeCategory}
      removeGroup={deleteTradeCategory}
      reorderGroups={reorderTradeCategories}
      createItem={createTrade}
      updateItem={updateTrade}
      removeItem={deleteTrade}
      reorderItems={reorderTrades}
    />
  );
}
