import { useState } from 'react';
import { Calendar, X, Plus, AlertCircle, CheckCircle } from 'lucide-react';

import { useCreateRiceVarietySeason } from '../api/create-rice-variety-season';
import { useSeasons } from '../api/get-seasons';
import { RiceVariety, Season, CreateRiceVarietySeasonRequest } from '@/types/api';
import { Button } from '@/components/ui/button';
import { SimpleDialog } from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';

type AssociateSeasonDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  riceVariety: RiceVariety | null;
};

export const AssociateSeasonDialog = ({
  isOpen,
  onClose,
  riceVariety,
}: AssociateSeasonDialogProps) => {
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>('');
  const [growthDurationDays, setGrowthDurationDays] = useState<number>(0);
  const [expectedYieldPerHectare, setExpectedYieldPerHectare] = useState<number>(0);
  const [optimalPlantingStart, setOptimalPlantingStart] = useState<string>('');
  const [optimalPlantingEnd, setOptimalPlantingEnd] = useState<string>('');
  const [riskLevel, setRiskLevel] = useState<number>(0);
  const [seasonalNotes, setSeasonalNotes] = useState<string>('');
  const [isRecommended, setIsRecommended] = useState<boolean>(false);

  const createAssociationMutation = useCreateRiceVarietySeason({
    mutationConfig: {
      onSuccess: () => {
        // Reset form
        setSelectedSeasonId('');
        setGrowthDurationDays(0);
        setExpectedYieldPerHectare(0);
        setOptimalPlantingStart('');
        setOptimalPlantingEnd('');
        setRiskLevel(0);
        setSeasonalNotes('');
        setIsRecommended(false);
        onClose();
      },
    },
  });

  const { data: seasons = [], isLoading: seasonsLoading } = useSeasons();

  const handleAssociate = () => {
    if (!riceVariety || !selectedSeasonId) return;

    const associationData: CreateRiceVarietySeasonRequest = {
      riceVarietyId: riceVariety.id,
      seasonId: selectedSeasonId,
      growthDurationDays,
      expectedYieldPerHectare,
      optimalPlantingStart,
      optimalPlantingEnd,
      riskLevel,
      seasonalNotes: seasonalNotes || undefined,
      isRecommended,
    };

    createAssociationMutation.mutate(associationData);
  };

  const isLoading = createAssociationMutation.isPending;
  const selectedSeason = seasons.find((s: Season) => s.id === selectedSeasonId);

  return (
    <SimpleDialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Liên Kết ${riceVariety?.varietyName} với Mùa Vụ`}
    >
      <div className="space-y-6">
        <p className="text-sm text-gray-600">
          Tạo liên kết chi tiết giữa giống lúa này và mùa vụ với các thông số trồng trọt cụ thể.
        </p>

        {riceVariety && (
          <div className="rounded-lg border bg-gray-50 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-2">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{riceVariety.varietyName}</h3>
                <p className="text-sm text-gray-500">{riceVariety.categoryName}</p>
                <p className="text-xs text-gray-400">
                  Cơ bản: {riceVariety.baseGrowthDurationDays} ngày, {riceVariety.baseYieldPerHectare} tấn/ha
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Chọn Mùa Vụ *
            </label>
            {seasonsLoading ? (
              <div className="flex items-center justify-center py-4">
                <Spinner size="sm" />
              </div>
            ) : (
              <select
                value={selectedSeasonId}
                onChange={(e) => setSelectedSeasonId(e.target.value)}
                disabled={isLoading}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              >
                <option value="">Chọn mùa vụ...</option>
                {seasons.map((season: Season) => (
                  <option key={season.id} value={season.id}>
                    {season.seasonName} ({season.startDate} - {season.endDate})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Mức Độ Rủi Ro
            </label>
            <select
              value={riskLevel}
              onChange={(e) => setRiskLevel(Number(e.target.value))}
              disabled={isLoading}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            >
              <option value={0}>Rủi Ro Thấp</option>
              <option value={1}>Rủi Ro Trung Bình</option>
              <option value={2}>Rủi Ro Cao</option>
            </select>
          </div>
        </div>

        {selectedSeason && (
          <div className="rounded-md bg-blue-50 p-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Mùa Vụ Đã Chọn</span>
            </div>
            <p className="mt-1 text-sm text-blue-700">
              {selectedSeason.seasonName} ({selectedSeason.seasonType}) - {selectedSeason.startDate} đến {selectedSeason.endDate}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Thời Gian Sinh Trưởng (Ngày) *
            </label>
            <input
              type="number"
              value={growthDurationDays}
              onChange={(e) => setGrowthDurationDays(Number(e.target.value))}
              disabled={isLoading}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              placeholder="VD: 95"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Năng Suất Dự Kiến (Tấn/ha) *
            </label>
            <input
              type="number"
              step="0.1"
              value={expectedYieldPerHectare}
              onChange={(e) => setExpectedYieldPerHectare(Number(e.target.value))}
              disabled={isLoading}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              placeholder="VD: 6.5"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Bắt Đầu Gieo Trồng Tối Ưu (MM/DD) *
            </label>
            <input
              type="text"
              value={optimalPlantingStart}
              onChange={(e) => setOptimalPlantingStart(e.target.value)}
              disabled={isLoading}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              placeholder="VD: 12/01"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Kết Thúc Gieo Trồng Tối Ưu (MM/DD) *
            </label>
            <input
              type="text"
              value={optimalPlantingEnd}
              onChange={(e) => setOptimalPlantingEnd(e.target.value)}
              disabled={isLoading}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              placeholder="VD: 01/15"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Ghi Chú Mùa Vụ
          </label>
          <textarea
            value={seasonalNotes}
            onChange={(e) => setSeasonalNotes(e.target.value)}
            disabled={isLoading}
            rows={3}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            placeholder="Ghi chú bổ sung về việc trồng giống này trong mùa vụ này..."
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isRecommended"
            checked={isRecommended}
            onChange={(e) => setIsRecommended(e.target.checked)}
            disabled={isLoading}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="isRecommended" className="text-sm font-medium text-gray-700">
            Đánh dấu là được khuyến nghị cho mùa vụ này
          </label>
        </div>

        {seasons.length === 0 && !seasonsLoading && (
          <div className="rounded-md bg-yellow-50 p-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <p className="text-sm text-yellow-700">
                Không có mùa vụ nào. Vui lòng tạo mùa vụ trước.
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Hủy
          </Button>
          <Button
            onClick={handleAssociate}
            disabled={!selectedSeasonId || !growthDurationDays || !expectedYieldPerHectare || !optimalPlantingStart || !optimalPlantingEnd || isLoading}
            isLoading={isLoading}
            icon={<Plus className="h-4 w-4" />}
          >
            Tạo Liên Kết
          </Button>
        </div>
      </div>
    </SimpleDialog>
  );
};
