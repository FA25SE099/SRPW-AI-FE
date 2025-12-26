import { Trash2 } from 'lucide-react';

type Material = {
    materialId: string;
    quantityPerHa: number;
};

type MaterialsEditorProps = {
    materials: Material[];
    stageIndex: number;
    taskIndex: number;
    isLoading: boolean;
    isLoadingMaterials: boolean;
    fertilizers: any[];
    pesticides: any[];
    seeds: any[];
    onUpdateMaterial: (
        stageIndex: number,
        taskIndex: number,
        materialIndex: number,
        field: 'materialId' | 'quantityPerHa',
        value: string | number
    ) => void;
    onRemoveMaterial: (stageIndex: number, taskIndex: number, materialIndex: number) => void;
    onAddMaterial: (stageIndex: number, taskIndex: number) => void;
};

export const MaterialsEditor = ({
    materials,
    stageIndex,
    taskIndex,
    isLoading,
    isLoadingMaterials,
    fertilizers,
    pesticides,
    seeds,
    onUpdateMaterial,
    onRemoveMaterial,
    onAddMaterial,
}: MaterialsEditorProps) => {
    return (
        <div className="rounded-md border border-gray-200 bg-gray-50 p-1.5 space-y-1.5">
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-gray-700">
                    Materials
                </span>
                <button
                    type="button"
                    onClick={() => onAddMaterial(stageIndex, taskIndex)}
                    disabled={isLoading}
                    className="text-[10px] font-medium text-blue-600 hover:text-blue-700 underline"
                >
                    + Add
                </button>
            </div>
            {materials.map((material, materialIndex) => (
                <div
                    key={materialIndex}
                    className="space-y-1 rounded-md bg-white p-1.5 border border-gray-200"
                >
                    <select
                        value={material.materialId}
                        onChange={(e) => {
                            onUpdateMaterial(
                                stageIndex,
                                taskIndex,
                                materialIndex,
                                'materialId',
                                e.target.value
                            );
                        }}
                        disabled={isLoading || isLoadingMaterials}
                        className="block w-full rounded-md border border-gray-300 bg-white px-1.5 py-0.5 text-[10px] focus:border-blue-500 focus:outline-none focus:ring-blue-500 disabled:bg-gray-100"
                    >
                        <option value="">Select material...</option>
                        {isLoadingMaterials ? (
                            <option disabled>Loading...</option>
                        ) : (
                            <>
                                {fertilizers.length > 0 && (
                                    <optgroup label="Fertilizers">
                                        {fertilizers.map((mat) => (
                                            <option key={`fert-${mat.materialId}`} value={mat.materialId}>
                                                {mat.name} ({mat.unit})
                                            </option>
                                        ))}
                                    </optgroup>
                                )}
                                {pesticides.length > 0 && (
                                    <optgroup label="Pesticides">
                                        {pesticides.map((mat) => (
                                            <option key={`pest-${mat.materialId}`} value={mat.materialId}>
                                                {mat.name} ({mat.unit})
                                            </option>
                                        ))}
                                    </optgroup>
                                )}
                                {seeds.length > 0 && (
                                    <optgroup label="Seeds">
                                        {seeds.map((mat) => (
                                            <option key={`seed-${mat.materialId}`} value={mat.materialId}>
                                                {mat.name} ({mat.unit})
                                            </option>
                                        ))}
                                    </optgroup>
                                )}
                            </>
                        )}
                    </select>
                    <div className="flex items-center gap-1">
                        <input
                            type="number"
                            value={material.quantityPerHa}
                            onChange={(e) =>
                                onUpdateMaterial(
                                    stageIndex,
                                    taskIndex,
                                    materialIndex,
                                    'quantityPerHa',
                                    parseFloat(e.target.value) || 0
                                )
                            }
                            disabled={isLoading}
                            min="0"
                            step="0.1"
                            placeholder="Qty/ha"
                            className="flex-1 rounded-md border border-gray-300 bg-white px-1.5 py-0.5 text-[10px] focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                        />
                        <button
                            type="button"
                            onClick={() =>
                                onRemoveMaterial(
                                    stageIndex,
                                    taskIndex,
                                    materialIndex
                                )
                            }
                            disabled={isLoading}
                            className="p-0.5 text-red-600 hover:bg-red-50 rounded hover:text-red-700"
                        >
                            <Trash2 className="h-3 w-3" />
                        </button>
                    </div>
                </div>
            ))}
            {materials.length === 0 && (
                <p className="text-[10px] text-gray-500 italic text-center py-0.5">
                    No materials
                </p>
            )}
        </div>
    );
};

