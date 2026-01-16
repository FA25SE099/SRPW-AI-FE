import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select/select';
import { ClusterSeasonsList } from '../types';

type SeasonSelectorV0Props = {
  seasons: ClusterSeasonsList | null;
  currentClusterId?: string;
  selectedYearSeasonId?: string;
  onSeasonChange?: (yearSeasonId: string) => void;
  onClusterChange?: (id: string) => void;
};

export const SeasonSelectorV0 = ({
  seasons,
  currentClusterId,
  selectedYearSeasonId,
  onSeasonChange,
  onClusterChange,
}: SeasonSelectorV0Props) => {
  const [selectedValue, setSelectedValue] = useState('current');

  // Update local state when selectedYearSeasonId prop changes
  useEffect(() => {
    if (selectedYearSeasonId && seasons) {
      // Find which category the season belongs to using yearSeasonId (id field)
      if (seasons.currentSeason?.id === selectedYearSeasonId) {
        setSelectedValue('current');
      } else {
        const pastIndex = seasons.pastSeasons?.findIndex(s => s.id === selectedYearSeasonId);
        if (pastIndex !== undefined && pastIndex >= 0) {
          setSelectedValue(`past-${pastIndex}`);
        } else {
          const upcomingIndex = seasons.upcomingSeasons?.findIndex(s => s.id === selectedYearSeasonId);
          if (upcomingIndex !== undefined && upcomingIndex >= 0) {
            setSelectedValue(`upcoming-${upcomingIndex}`);
          }
        }
      }
    }
  }, [selectedYearSeasonId, seasons]);

  const handleValueChange = (value: string) => {
    setSelectedValue(value);

    if (!onSeasonChange || !seasons) return;

    // Parse the value to get the yearSeasonId
    if (value === 'current' && seasons.currentSeason) {
      onSeasonChange(seasons.currentSeason.id);
    } else if (value.startsWith('past-')) {
      const index = parseInt(value.replace('past-', ''));
      const season = seasons.pastSeasons?.[index];
      if (season) {
        onSeasonChange(season.id);
      }
    } else if (value.startsWith('upcoming-')) {
      const index = parseInt(value.replace('upcoming-', ''));
      const season = seasons.upcomingSeasons?.[index];
      if (season) {
        onSeasonChange(season.id);
      }
    }
  };

  if (!seasons) return null;

  return (
    <div className="flex gap-4 items-center">
      <Select value={selectedValue} onValueChange={handleValueChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Chọn mùa vụ" />
        </SelectTrigger>
        <SelectContent>
          {seasons.currentSeason && (
            <SelectItem value="current">
              {seasons.currentSeason.displayName} (Hiện tại)
            </SelectItem>
          )}
          {seasons.pastSeasons?.map((season, idx) => (
            <SelectItem key={idx} value={`past-${idx}`}>
              {season.displayName || `${season.seasonName} ${season.year}`}
            </SelectItem>
          ))}
          {seasons.upcomingSeasons?.map((season, idx) => (
            <SelectItem key={`up-${idx}`} value={`upcoming-${idx}`}>
              {season.displayName || `${season.seasonName} ${season.year}`} (Sắp tới)
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

