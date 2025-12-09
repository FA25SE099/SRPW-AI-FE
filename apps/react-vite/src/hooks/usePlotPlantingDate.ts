import { usePlotDetail } from "@/features/plots/api/get-plots-detail";

export const usePlotPlantingDate = (plotId: string) => {
    const { data, isLoading } = usePlotDetail({ plotId });

    const plantingDate = data?.plotCultivations?.length
        ? data.plotCultivations
            .sort((a, b) => new Date(b.plantingDate).getTime() - new Date(a.plantingDate).getTime())[0]
            .plantingDate
        : null;

    return {
        plantingDate,
        isLoading,
    };
};
