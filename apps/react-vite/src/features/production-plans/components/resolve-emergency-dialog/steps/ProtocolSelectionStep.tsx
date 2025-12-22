import { Search } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { PlanSummary } from '../components/PlanSummary';
import { ProtocolPreview } from '../components/ProtocolPreview';

type ProtocolSelectionStepProps = {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    selectedProtocolId: string | null;
    handleSelectProtocol: (protocolId: string) => void;
    protocols: any[];
    isLoadingProtocols: boolean;
    protocolDetails: any;
    isLoadingDetails: boolean;
    planDetails: any;
    isLoadingPlan: boolean;
};

export const ProtocolSelectionStep = ({
    searchQuery,
    setSearchQuery,
    selectedProtocolId,
    handleSelectProtocol,
    protocols,
    isLoadingProtocols,
    protocolDetails,
    isLoadingDetails,
    planDetails,
    isLoadingPlan,
}: ProtocolSelectionStepProps) => {
    return (
        <div className="grid grid-cols-3 gap-4 h-[600px]">
            {/* Left: Current Plan Info */}
            <div className="col-span-1 border-r pr-4">
                <PlanSummary planDetails={planDetails} isLoadingPlan={isLoadingPlan} />
            </div>

            {/* Right: Protocol Search and Selection */}
            <div className="col-span-2 space-y-4">
                <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Search Emergency Protocol</h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search protocols..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {isLoadingProtocols ? (
                    <div className="flex justify-center py-8">
                        <Spinner size="lg" />
                    </div>
                ) : (
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                        {protocols.map((protocol) => (
                            <button
                                key={protocol.id}
                                onClick={() => handleSelectProtocol(protocol.id)}
                                className={`w-full text-left rounded-lg border-2 p-3 transition-colors ${selectedProtocolId === protocol.id
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                    }`}
                            >
                                <div className="font-medium text-gray-900">{protocol.planName}</div>
                                <div className="text-sm text-gray-600 mt-1">{protocol.description}</div>
                            </button>
                        ))}
                    </div>
                )}

                {/* Selected Protocol Details */}
                {selectedProtocolId && protocolDetails && (
                    <div className="border-t pt-4 mt-4">
                        <h4 className="font-semibold text-gray-900 mb-3">Protocol Preview</h4>
                        <ProtocolPreview
                            protocolDetails={protocolDetails}
                            isLoadingDetails={isLoadingDetails}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

