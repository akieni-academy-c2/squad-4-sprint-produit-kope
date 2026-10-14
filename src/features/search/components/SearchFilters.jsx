import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapPin, Search, Wrench, Building2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button.jsx';
import { FormField } from '@/shared/components/ui/FormField.jsx';
import { CustomSelect } from '@/shared/components/ui/CustomSelect.jsx';
import { SearchInput } from '@/shared/components/ui/SearchInput.jsx';
import { useReferenceData } from '@/features/reference/hooks/useReferenceData.js';
import { useDelayedFlag } from '@/shared/hooks/useDelayedFlag.js';
import { Skeleton } from '@/shared/components/ui/Skeleton.jsx';
import { ROUTES } from '@/shared/lib/constants.js';
import { cn } from '@/shared/utils';

const SKELETON_DELAY_MS = 200;

export function SearchFilters({ initial = {}, variant = "search", className, searching = false, onApply }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { trades, zones, cities, loading } = useReferenceData();
  const [keyword, setKeyword] = useState(initial.keyword || "");

  const trade = initial.trade ?? params.get("trade") ?? "";
  const zone = initial.zone ?? params.get("zone") ?? "";
  const city = initial.city ?? params.get("city") ?? "";
  const error = initial.error;
  const [tradeValue, setTradeValue] = useState(trade);
  const [zoneValue, setZoneValue] = useState(zone);
  const [cityValue, setCityValue] = useState(city);

  const zoneOptions = (cityValue
    ? zones.filter((z) => String(z.cityId) === String(cityValue))
    : zones
  ).map((z) => ({ value: String(z.id), label: z.name }));

  const onSubmit = (e) => {
    e.preventDefault();
    const next = new URLSearchParams();
    if (tradeValue) next.set("trade", tradeValue);
    if (cityValue) next.set("city", cityValue);
    if (zoneValue) next.set("zone", zoneValue);
    const k = keyword.trim();
    if (k) next.set("q", k);
    next.set("page", "1");
    navigate(`${ROUTES.SEARCH}?${next.toString()}`);
    onApply?.();
  };

  const hasCriteria = Boolean(tradeValue || cityValue || zoneValue || keyword.trim());

  const dense = variant === "sidebar";
  const home = variant === "home";
  const sheet = variant === "sheet";

  const showSkeleton = useDelayedFlag(loading, SKELETON_DELAY_MS);

  if (showSkeleton && !dense)
    return (
      <div className="space-y-3 py-2" aria-busy="true">
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-40" />
      </div>
    );


  if (dense)
    return (
      <form
        onSubmit={onSubmit}
        className={cn('rounded-md border border-gray-200 bg-white p-2', className)}
        noValidate
      >
        <div className="flex items-center justify-between px-2 py-2">
          <h2 className="text-sm font-bold text-gray-900">Recherche</h2>
        </div>

        <div className="space-y-4 p-2" aria-busy={showSkeleton || undefined}>
          {showSkeleton ? (
            <>
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
            </>
          ) : (
            <>
              <SearchInput
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Nom du professionnel ou métier"
                aria-label="Recherche par mot-clé"
              />

              <div>
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-400">
                  <Wrench className="h-3 w-3" aria-hidden />
                  Métier
                </p>
                <CustomSelect
                  id="sf-trade-sb"
                  value={tradeValue}
                  onChange={setTradeValue}
                  options={[
                    { value: '', label: 'Tous les métiers' },
                    ...trades.map((t) => ({ value: String(t.id), label: t.name })),
                  ]}
                  className="mt-2 w-full"
                  aria-label="Filtrer par métier"
                />
              </div>

              <div>
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-400">
                  <Building2 className="h-3 w-3" aria-hidden />
                  Ville
                </p>
                <CustomSelect
                  id="sf-city-sb"
                  value={cityValue}
                  onChange={(value) => {
                    setCityValue(value);
                    setZoneValue('');
                  }}
                  options={[
                    { value: '', label: 'Toutes les villes' },
                    ...cities.map((c) => ({ value: String(c.id), label: c.name })),
                  ]}
                  className="mt-2 w-full"
                  aria-label="Filtrer par ville"
                />
              </div>

              <div>
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-400">
                  <MapPin className="h-3 w-3" aria-hidden />
                  Zone
                </p>
                <CustomSelect
                  id="sf-zone-sb"
                  value={zoneValue}
                  onChange={setZoneValue}
                  options={[{ value: '', label: 'Toutes les zones' }, ...zoneOptions]}
                  className="mt-2 w-full"
                  aria-label="Filtrer par zone"
                />
              </div>
            </>
          )}
        </div>

        <div className="border-t border-gray-100 p-2">
          <Button type="submit" size="sm" loading={searching} disabled={!hasCriteria} className="w-full">
            Rechercher <Search size={16} aria-hidden />
          </Button>
        </div>
      </form>
    );


  if (sheet)
    return (
      <form onSubmit={onSubmit} className={cn('rounded-md border border-gray-200 bg-white p-2', className)} noValidate>
        <div className="space-y-4 p-2">
        <SearchInput
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Nom du professionnel ou métier"
          aria-label="Recherche par mot-clé"
        />

        <div>
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-400">
            <Wrench className="h-3 w-3" aria-hidden />
            Métier
          </p>
          <CustomSelect
            id="sf-trade-sh"
            value={tradeValue}
            onChange={setTradeValue}
            options={[
              { value: '', label: 'Tous les métiers' },
              ...trades.map((t) => ({ value: String(t.id), label: t.name })),
            ]}
            className="mt-2 w-full"
            aria-label="Filtrer par métier"
          />
        </div>

        <div>
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-400">
            <Building2 className="h-3 w-3" aria-hidden />
            Ville
          </p>
          <CustomSelect
            id="sf-city-sh"
            value={cityValue}
            onChange={(value) => {
              setCityValue(value);
              setZoneValue('');
            }}
            options={[
              { value: '', label: 'Toutes les villes' },
              ...cities.map((c) => ({ value: String(c.id), label: c.name })),
            ]}
            className="mt-2 w-full"
            aria-label="Filtrer par ville"
          />
        </div>

        <div>
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-400">
            <MapPin className="h-3 w-3" aria-hidden />
            Zone
          </p>
          <CustomSelect
            id="sf-zone-sh"
            value={zoneValue}
            onChange={setZoneValue}
            options={[{ value: '', label: 'Toutes les zones' }, ...zoneOptions]}
            className="mt-2 w-full"
            aria-label="Filtrer par zone"
          />
        </div>

        <div className="border-t border-gray-100 p-2">
          <Button type="submit" size="md" loading={searching} disabled={!hasCriteria} className="w-full">
            Rechercher <Search size={16} aria-hidden />
          </Button>
        </div>
        </div>
      </form>
    );


  if (home)
    return (
      <form
        onSubmit={onSubmit}
        className={cn(
          'md:flex items-center space-y-2 gap-2.5 border border-[#CDD8D3] p-2 rounded-md bg-[#F5F6F6]',
          className,
        )}
        noValidate
      >
        <CustomSelect
          id="sf-trade-h"
          name="trade"
          value={tradeValue}
          onChange={setTradeValue}
          placeholder="Tous les métiers"
          options={[
            { value: '', label: 'Tous les métiers' },
            ...trades.map((t) => ({ value: String(t.id), label: t.name })),
          ]}
          aria-label="Filtrer par métier"
          aria-invalid={Boolean(error?.trade) || undefined}
          className="w-full"
          triggerClassName="border-0!  bg-transparent! hover:border-0! hover:bg-transparent!"
        />

        <p className='opacity-10 sm:border-x border-y sm:border-y-0 w-[90%] sm:w-0 mx-auto sm:h-4'></p>

        <CustomSelect
          id="sf-zone-h"
          name="zone"
          value={zoneValue}
          onChange={setZoneValue}
          placeholder="Toutes les zones"
          options={[
            { value: '', label: 'Toutes les zones' },
            ...zones.map((z) => ({ value: String(z.id), label: z.name })),
          ]}
          aria-label="Filtrer par zone"
          className="w-full"
          triggerClassName=" border-0! bg-transparent! hover:border-0! hover:bg-transparent!"
        />


        <Button
          type="submit"
          size="lg"
          loading={searching}
          className="w-full sm:w-fit px-12!"
        >
          Rechercher <Search size={16} aria-hidden />
        </Button>
      </form>
    );


  return (
    <form onSubmit={onSubmit} className={cn("space-y-4", className)} noValidate>

      <FormField label="Métier" error={error?.trade} id="sf-trade-d">
        <CustomSelect
          id="sf-trade-d"
          name="trade"
          value={tradeValue}
          onChange={setTradeValue}
          placeholder="Tous les métiers"
          options={[
            { value: '', label: 'Tous les métiers' },
            ...trades.map((t) => ({ value: String(t.id), label: t.name })),
          ]}
          className="w-full"
          aria-label="Filtrer par métier"
          aria-invalid={Boolean(error?.trade) || undefined}
        />
      </FormField>
      <FormField
        label="Zone (facultatif)"
        help="Par défaut : toute la ville"
        id="sf-zone-d"
      >
        <CustomSelect
          id="sf-zone-d"
          name="zone"
          value={zoneValue}
          onChange={setZoneValue}
          placeholder="Toute la ville"
          options={[
            { value: '', label: 'Toute la ville' },
            ...zones.map((z) => ({ value: String(z.id), label: z.name })),
          ]}
          className="w-full"
          aria-label="Filtrer par zone"
        />
      </FormField>
      <Button type="submit" size="lg" loading={searching}>
        Rechercher
      </Button>
    </form>
  );
}
