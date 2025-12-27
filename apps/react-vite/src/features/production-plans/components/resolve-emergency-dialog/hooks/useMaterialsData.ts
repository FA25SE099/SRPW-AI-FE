import { useMaterials } from '@/features/materials/api/get-materials';

export const useMaterialsData = () => {
    const fertilizersQuery = useMaterials({
        params: {
            currentPage: 1,
            pageSize: 1000,
            type: 0
        }
    });

    const pesticidesQuery = useMaterials({
        params: {
            currentPage: 1,
            pageSize: 1000,
            type: 1
        }
    });

    const seedsQuery = useMaterials({
        params: {
            currentPage: 1,
            pageSize: 1000,
            type: 2
        }
    });

    const fertilizers = fertilizersQuery.data?.data || [];
    const pesticides = pesticidesQuery.data?.data || [];
    const seeds = seedsQuery.data?.data || [];
    const isLoadingMaterials = fertilizersQuery.isLoading || pesticidesQuery.isLoading || seedsQuery.isLoading;

    return {
        fertilizers,
        pesticides,
        seeds,
        isLoadingMaterials,
    };
};

