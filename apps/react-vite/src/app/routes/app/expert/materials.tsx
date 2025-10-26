import { ContentLayout } from '@/components/layouts';

const MaterialsRoute = () => {
    return (
        <ContentLayout title="Material & Treatment Library">
            <div className="mb-6 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                    Manage pesticides, fertilizers, and treatment materials
                </p>
                <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700">
                    Add Material
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-lg border border-gray-200 bg-white p-6">
                    <h3 className="mb-4 text-lg font-bold text-gray-900">Pesticides</h3>
                    <div className="space-y-3">
                        {['Cypermethrin 10%', 'Imidacloprid 25%', 'Abamectin 1.8%'].map(
                            (item) => (
                                <div
                                    key={item}
                                    className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                                >
                                    <span className="text-sm font-medium text-gray-900">
                                        {item}
                                    </span>
                                    <button className="text-sm text-blue-600 hover:text-blue-700">
                                        View Details
                                    </button>
                                </div>
                            ),
                        )}
                    </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-6">
                    <h3 className="mb-4 text-lg font-bold text-gray-900">Fertilizers</h3>
                    <div className="space-y-3">
                        {['NPK 16-16-8', 'Urea 46%', 'DAP 18-46-0'].map((item) => (
                            <div
                                key={item}
                                className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                            >
                                <span className="text-sm font-medium text-gray-900">
                                    {item}
                                </span>
                                <button className="text-sm text-blue-600 hover:text-blue-700">
                                    View Details
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-6">
                    <h3 className="mb-4 text-lg font-bold text-gray-900">Herbicides</h3>
                    <div className="space-y-3">
                        {['Glyphosate 41%', '2,4-D Amine 72%', 'Paraquat 27.6%'].map(
                            (item) => (
                                <div
                                    key={item}
                                    className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                                >
                                    <span className="text-sm font-medium text-gray-900">
                                        {item}
                                    </span>
                                    <button className="text-sm text-blue-600 hover:text-blue-700">
                                        View Details
                                    </button>
                                </div>
                            ),
                        )}
                    </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-6">
                    <h3 className="mb-4 text-lg font-bold text-gray-900">Fungicides</h3>
                    <div className="space-y-3">
                        {['Mancozeb 80%', 'Copper Oxychloride 50%', 'Carbendazim 50%'].map(
                            (item) => (
                                <div
                                    key={item}
                                    className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                                >
                                    <span className="text-sm font-medium text-gray-900">
                                        {item}
                                    </span>
                                    <button className="text-sm text-blue-600 hover:text-blue-700">
                                        View Details
                                    </button>
                                </div>
                            ),
                        )}
                    </div>
                </div>
            </div>
        </ContentLayout>
    );
};

export default MaterialsRoute;
