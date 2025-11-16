import { useState } from 'react';
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
  onClusterChange?: (id: string) => void;
};

export const SeasonSelectorV0 = ({
  seasons,
  currentClusterId,
  onClusterChange,
}: SeasonSelectorV0Props) => {
  const [selectedSeason, setSelectedSeason] = useState('current');

  if (!seasons) return null;

  return (
    <div className="flex gap-4 items-center">
      <Select value={selectedSeason} onValueChange={setSelectedSeason}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Select season" />
        </SelectTrigger>
        <SelectContent>
          {seasons.currentSeason && (
            <SelectItem value="current">
              {seasons.currentSeason.displayName} (Current)
            </SelectItem>
          )}
          {seasons.pastSeasons?.map((season, idx) => (
            <SelectItem key={idx} value={`past-${idx}`}>
              {season.displayName || `${season.seasonName} ${season.year}`}
            </SelectItem>
          ))}
          {seasons.upcomingSeasons?.map((season, idx) => (
            <SelectItem key={`up-${idx}`} value={`upcoming-${idx}`}>
              {season.displayName || `${season.seasonName} ${season.year}`} (Upcoming)
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

