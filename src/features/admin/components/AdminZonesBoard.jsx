import { AdminCatalogBoard } from './AdminCatalogBoard.jsx';
import {
  createCity,
  createZone,
  deleteCity,
  deleteZone,
  listCities,
  listZones,
  reorderCities,
  reorderZones,
  updateCity,
  updateZone,
} from '../services/admin.service.js';

export function AdminZonesBoard({ rightContainer = null }) {
  return (
    <AdminCatalogBoard
      rightContainer={rightContainer}
      groupLabel="Ville"
      groupNoun="ville"
      itemNoun="arrondissement"
      itemPlaceholder="Nouvel arrondissement"
      orphanLabel="Sans ville"
      allGroupsLabel="Toutes les villes"
      groupByKey="cityId"
      searchId="zon-search"
      listGroups={listCities}
      listItems={listZones}
      createGroup={createCity}
      updateGroup={updateCity}
      removeGroup={deleteCity}
      reorderGroups={reorderCities}
      createItem={createZone}
      updateItem={updateZone}
      removeItem={deleteZone}
      reorderItems={reorderZones}
    />
  );
}
