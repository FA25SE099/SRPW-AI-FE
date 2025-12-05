import { Edit, Eye, Image as ImageIcon, Plus, Search } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNotifications } from '@/components/ui/notifications';
import { Spinner } from '@/components/ui/spinner';

import {
  usePestProtocols,
  useCreatePestProtocol,
} from '../api/get-pest-protocols';
import {
  useWeatherProtocols,
  useCreateWeatherProtocol,
} from '../api/get-weather-protocols';
import { useUpdatePestProtocol } from '../api/update-pest-protocol';
import { useUpdateWeatherProtocol } from '../api/update-weather-protocol';

import { PestProtocolDialog } from './pest-protocol-dialog';
import { WeatherProtocolDialog } from './weather-protocol-dialog';

type ActiveTab = 'pest' | 'weather';

export const ProtocolsManagementTabs = () => {
  const { addNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState<ActiveTab>('pest');

  // Pest Protocol States
  const [pestPage, setPestPage] = useState(1);
  const [pestSearch, setPestSearch] = useState('');
  const [isPestCreateOpen, setIsPestCreateOpen] = useState(false);
  const [isPestDetailOpen, setIsPestDetailOpen] = useState(false);
  const [isPestEditing, setIsPestEditing] = useState(false);
  const [pestForm, setPestForm] = useState({
    id: '',
    name: '',
    description: '',
    type: '',
    imageLinks: [] as string[],
    notes: '',
    isActive: true,
  });

  // Weather Protocol States
  const [weatherPage, setWeatherPage] = useState(1);
  const [weatherSearch, setWeatherSearch] = useState('');
  const [isWeatherCreateOpen, setIsWeatherCreateOpen] = useState(false);
  const [isWeatherDetailOpen, setIsWeatherDetailOpen] = useState(false);
  const [isWeatherEditing, setIsWeatherEditing] = useState(false);
  const [weatherForm, setWeatherForm] = useState({
    id: '',
    name: '',
    description: '',
    source: '',
    sourceLink: '',
    imageLinks: [] as string[],
    notes: '',
    isActive: true,
  });

  const pageSize = 10;

  // Queries
  const {
    data: pestData,
    isLoading: pestLoading,
    refetch: refetchPest,
  } = usePestProtocols({
    params: {
      currentPage: pestPage,
      pageSize,
      searchName: pestSearch,
      isActive: true,
    },
  });

  const {
    data: weatherData,
    isLoading: weatherLoading,
    refetch: refetchWeather,
  } = useWeatherProtocols({
    params: {
      currentPage: weatherPage,
      pageSize,
      searchName: weatherSearch,
      isActive: true,
    },
  });

  const resetPestForm = () => {
    setPestForm({
      id: '',
      name: '',
      description: '',
      type: '',
      imageLinks: [],
      notes: '',
      isActive: true,
    });
  };

  const resetWeatherForm = () => {
    setWeatherForm({
      id: '',
      name: '',
      description: '',
      source: '',
      sourceLink: '',
      imageLinks: [],
      notes: '',
      isActive: true,
    });
  };

  // Mutations
  const createPestMutation = useCreatePestProtocol({
    mutationConfig: {
      onSuccess: () => {
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Pest protocol created',
        });
        setIsPestCreateOpen(false);
        resetPestForm();
        refetchPest();
      },
      onError: (err: any) => {
        addNotification({
          type: 'error',
          title: 'Error',
          message: err?.message || 'Failed to create',
        });
      },
    },
  });

  const updatePestMutation = useUpdatePestProtocol({
    mutationConfig: {
      onSuccess: () => {
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Pest protocol updated successfully',
        });
        setIsPestDetailOpen(false);
        setIsPestEditing(false);
        resetPestForm();
        refetchPest();
      },
    },
  });

  const createWeatherMutation = useCreateWeatherProtocol({
    mutationConfig: {
      onSuccess: () => {
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Weather protocol created',
        });
        setIsWeatherCreateOpen(false);
        resetWeatherForm();
        refetchWeather();
      },
      onError: (err: any) => {
        addNotification({
          type: 'error',
          title: 'Error',
          message: err?.message || 'Failed to create',
        });
      },
    },
  });

  const updateWeatherMutation = useUpdateWeatherProtocol({
    mutationConfig: {
      onSuccess: () => {
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Weather protocol updated successfully',
        });
        setIsWeatherDetailOpen(false);
        setIsWeatherEditing(false);
        resetWeatherForm();
        refetchWeather();
      },
    },
  });

  const pestProtocols = pestData?.data || [];
  const weatherProtocols = weatherData?.data || [];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4">
          <button
            onClick={() => setActiveTab('pest')}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'pest'
              ? 'border-orange-500 text-orange-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            Pest Protocols
          </button>
          <button
            onClick={() => setActiveTab('weather')}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'weather'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            Weather Protocols
          </button>
        </nav>
      </div>

      {/* Pest Protocols Tab */}
      {activeTab === 'pest' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search pest protocols..."
                value={pestSearch}
                onChange={(e) => setPestSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              onClick={() => {
                resetPestForm();
                setIsPestCreateOpen(true);
                console.log('Open Pest Dialog:', isPestCreateOpen);
              }}
            >
              <Plus className="mr-2 size-4" />
              Create Pest Protocol
            </Button>
          </div>

          <div className="overflow-hidden rounded-lg border bg-white">
            {pestLoading ? (
              <div className="p-8 text-center">
                <Spinner size="lg" />
              </div>
            ) : pestProtocols.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No pest protocols found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-200 bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Image
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {pestProtocols.map((protocol: any) => (
                      <tr key={protocol.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          {protocol.imageLinks &&
                            protocol.imageLinks.length > 0 ? (
                            <img
                              src={protocol.imageLinks[0]}
                              alt={protocol.name}
                              className="size-12 rounded border object-cover"
                            />
                          ) : (
                            <div className="flex size-12 items-center justify-center rounded border bg-gray-100">
                              <ImageIcon className="size-6 text-gray-400" />
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-gray-900">
                            {protocol.name}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {protocol.type}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="line-clamp-2 text-sm text-gray-700">
                            {protocol.description}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span
                            className={`rounded-full px-2 py-1 text-xs ${protocol.isActive
                              ? 'border border-green-200 bg-green-100 text-green-800'
                              : 'border border-gray-200 bg-gray-100 text-gray-800'
                              }`}
                          >
                            {protocol.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                              onClick={() => {
                                setPestForm({
                                  id: protocol.id,
                                  name: protocol.name,
                                  description: protocol.description,
                                  type: protocol.type,
                                  imageLinks: protocol.imageLinks || [],
                                  notes: protocol.notes || '',
                                  isActive: protocol.isActive,
                                });
                                setIsPestDetailOpen(true);
                                setIsPestEditing(false);
                              }}
                            >
                              <Eye className="mr-1 size-4" />
                              View
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                              onClick={() => {
                                setPestForm({
                                  id: protocol.id,
                                  name: protocol.name,
                                  description: protocol.description,
                                  type: protocol.type,
                                  imageLinks: protocol.imageLinks || [],
                                  notes: protocol.notes || '',
                                  isActive: protocol.isActive,
                                });
                                setIsPestDetailOpen(true);
                                setIsPestEditing(true);
                              }}
                            >
                              <Edit className="mr-1 size-4" />
                              Edit
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {pestData && pestData.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Page {pestPage} of {pestData.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pestData.hasPrevious}
                  onClick={() => setPestPage(pestPage - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pestData.hasNext}
                  onClick={() => setPestPage(pestPage + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* Pest Create Dialog */}
          <PestProtocolDialog
            isOpen={isPestCreateOpen}
            onClose={() => setIsPestCreateOpen(false)}
            onSubmit={(data) => {
              const { id, ...createData } = data;
              createPestMutation.mutate(createData);
            }}
            isLoading={createPestMutation.isPending}
            isEditMode={false}
            protocol={pestForm}
            setProtocol={setPestForm}
          />

          {/* Pest Detail Dialog */}
          {isPestDetailOpen && !isPestEditing && (
            <Dialog open={isPestDetailOpen} onOpenChange={setIsPestDetailOpen}>
              <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Pest Protocol Details</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label className="text-gray-600">Name</Label>
                    <div className="mt-1 font-medium">{pestForm.name}</div>
                  </div>
                  <div>
                    <Label className="text-gray-600">Type</Label>
                    <div className="mt-1">{pestForm.type}</div>
                  </div>
                  <div>
                    <Label className="text-gray-600">Description</Label>
                    <div className="mt-1">{pestForm.description}</div>
                  </div>
                  {pestForm.imageLinks.length > 0 && (
                    <div>
                      <Label className="text-gray-600">Images</Label>
                      <div className="mt-2 grid grid-cols-3 gap-2">
                        {pestForm.imageLinks.map((link, idx) => (
                          <img
                            key={idx}
                            src={link}
                            alt=""
                            className="h-24 w-full rounded border object-cover"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <Label className="text-gray-600">Notes</Label>
                    <div className="mt-1">{pestForm.notes || '-'}</div>
                  </div>
                  <div>
                    <Label className="text-gray-600">Status</Label>
                    <div className="mt-1">
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${pestForm.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                          }`}
                      >
                        {pestForm.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 border-t pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsPestDetailOpen(false);
                        resetPestForm();
                      }}
                    >
                      Close
                    </Button>
                    <Button onClick={() => setIsPestEditing(true)}>
                      <Edit className="mr-2 size-4" />
                      Edit
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {/* Pest Edit Dialog */}
          {isPestDetailOpen && isPestEditing && (
            <PestProtocolDialog
              isOpen={true}
              onClose={() => {
                setIsPestEditing(false);
              }}
              onSubmit={(data) => {
                updatePestMutation.mutate(data);
              }}
              isLoading={updatePestMutation.isPending}
              isEditMode={true}
              protocol={pestForm}
              setProtocol={setPestForm}
            />
          )}
        </div>
      )}

      {/* Weather Protocols Tab */}
      {activeTab === 'weather' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search weather protocols..."
                value={weatherSearch}
                onChange={(e) => setWeatherSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              onClick={() => {
                resetWeatherForm();
                setIsWeatherCreateOpen(true);
              }}
            >
              <Plus className="mr-2 size-4" />
              Create Weather Protocol
            </Button>
          </div>

          <div className="overflow-hidden rounded-lg border bg-white">
            {weatherLoading ? (
              <div className="p-8 text-center">
                <Spinner size="lg" />
              </div>
            ) : weatherProtocols.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No weather protocols found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-200 bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Image
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Source
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {weatherProtocols.map((weather: any) => (
                      <tr key={weather.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          {weather.imageLinks &&
                            weather.imageLinks.length > 0 ? (
                            <img
                              src={weather.imageLinks[0]}
                              alt={weather.name}
                              className="size-12 rounded border object-cover"
                            />
                          ) : (
                            <div className="flex size-12 items-center justify-center rounded border bg-gray-100">
                              <ImageIcon className="size-6 text-gray-400" />
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-gray-900">
                            {weather.name}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {weather.source}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="line-clamp-2 text-sm text-gray-700">
                            {weather.description}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span
                            className={`rounded-full px-2 py-1 text-xs ${weather.isActive
                              ? 'border border-green-200 bg-green-100 text-green-800'
                              : 'border border-gray-200 bg-gray-100 text-gray-800'
                              }`}
                          >
                            {weather.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                              onClick={() => {
                                setWeatherForm({
                                  id: weather.id,
                                  name: weather.name,
                                  description: weather.description,
                                  source: weather.source,
                                  sourceLink: weather.sourceLink || '',
                                  imageLinks: weather.imageLinks || [],
                                  notes: weather.notes || '',
                                  isActive: weather.isActive,
                                });
                                setIsWeatherDetailOpen(true);
                                setIsWeatherEditing(false);
                              }}
                            >
                              <Eye className="mr-1 size-4" />
                              View
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                              onClick={() => {
                                setWeatherForm({
                                  id: weather.id,
                                  name: weather.name,
                                  description: weather.description,
                                  source: weather.source,
                                  sourceLink: weather.sourceLink || '',
                                  imageLinks: weather.imageLinks || [],
                                  notes: weather.notes || '',
                                  isActive: weather.isActive,
                                });
                                setIsWeatherDetailOpen(true);
                                setIsWeatherEditing(true);
                              }}
                            >
                              <Edit className="mr-1 size-4" />
                              Edit
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {weatherData && weatherData.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Page {weatherPage} of {weatherData.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!weatherData.hasPrevious}
                  onClick={() => setWeatherPage(weatherPage - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!weatherData.hasNext}
                  onClick={() => setWeatherPage(weatherPage + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* Weather Create Dialog */}
          <WeatherProtocolDialog
            isOpen={isWeatherCreateOpen}
            onClose={() => setIsWeatherCreateOpen(false)}
            onSubmit={(data) => {
              const { id, ...createData } = data;
              createWeatherMutation.mutate(createData);
            }}
            isLoading={createWeatherMutation.isPending}
            isEditMode={false}
            protocol={weatherForm}
            setProtocol={setWeatherForm}
          />

          {/* Weather Detail Dialog */}
          {isWeatherDetailOpen && !isWeatherEditing && (
            <Dialog
              open={isWeatherDetailOpen}
              onOpenChange={setIsWeatherDetailOpen}
            >
              <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Weather Protocol Details</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label className="text-gray-600">Name</Label>
                    <div className="mt-1 font-medium">{weatherForm.name}</div>
                  </div>
                  <div>
                    <Label className="text-gray-600">Source</Label>
                    <div className="mt-1">{weatherForm.source}</div>
                  </div>
                  {weatherForm.sourceLink && (
                    <div>
                      <Label className="text-gray-600">Source Link</Label>
                      <div className="mt-1">
                        <a
                          href={weatherForm.sourceLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {weatherForm.sourceLink}
                        </a>
                      </div>
                    </div>
                  )}
                  <div>
                    <Label className="text-gray-600">Description</Label>
                    <div className="mt-1">{weatherForm.description}</div>
                  </div>
                  {weatherForm.imageLinks.length > 0 && (
                    <div>
                      <Label className="text-gray-600">Images</Label>
                      <div className="mt-2 grid grid-cols-3 gap-2">
                        {weatherForm.imageLinks.map((link, idx) => (
                          <img
                            key={idx}
                            src={link}
                            alt=""
                            className="h-24 w-full rounded border object-cover"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <Label className="text-gray-600">Notes</Label>
                    <div className="mt-1">{weatherForm.notes || '-'}</div>
                  </div>
                  <div>
                    <Label className="text-gray-600">Status</Label>
                    <div className="mt-1">
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${weatherForm.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                          }`}
                      >
                        {weatherForm.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 border-t pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsWeatherDetailOpen(false);
                        resetWeatherForm();
                      }}
                    >
                      Close
                    </Button>
                    <Button onClick={() => setIsWeatherEditing(true)}>
                      <Edit className="mr-2 size-4" />
                      Edit
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {/* Weather Edit Dialog */}
          {isWeatherDetailOpen && isWeatherEditing && (
            <WeatherProtocolDialog
              isOpen={true}
              onClose={() => {
                setIsWeatherEditing(false);
              }}
              onSubmit={(data) => {
                updateWeatherMutation.mutate(data);
              }}
              isLoading={updateWeatherMutation.isPending}
              isEditMode={true}
              protocol={weatherForm}
              setProtocol={setWeatherForm}
            />
          )}
        </div>
      )}
    </div>
  );
};
