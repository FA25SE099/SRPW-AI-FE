import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select/select';
import {
  Sprout,
  Users,
  MapPin,
  Calendar,
  FileText,
  Plus,
  Search,
} from 'lucide-react';
import { ClusterCurrentSeason } from '../types';

type GroupsDashboardProps = {
  groups: NonNullable<ClusterCurrentSeason['groups']>;
  clusterId: string;
  seasonId: string;
  onCreatePlan?: (groupId: string) => void;
  onViewDetails?: (groupId: string) => void;
};

export const GroupsDashboard = ({
  groups,
  clusterId,
  seasonId,
  onCreatePlan,
  onViewDetails,
}: GroupsDashboardProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVariety, setFilterVariety] = useState<string>('all');
  const [filterSupervisor, setFilterSupervisor] = useState<string>('all');

  // Get unique rice varieties and supervisors for filters
  const riceVarieties = Array.from(
    new Set(groups.map((g) => g.riceVarietyName)),
  );
  const supervisors = Array.from(
    new Set(groups.map((g) => g.supervisorName)),
  );

  // Apply filters
  const filteredGroups = groups.filter((group) => {
    const matchesSearch =
      searchTerm === '' ||
      group.groupId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.supervisorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.riceVarietyName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesVariety =
      filterVariety === 'all' || group.riceVarietyName === filterVariety;

    const matchesSupervisor =
      filterSupervisor === 'all' || group.supervisorName === filterSupervisor;

    return matchesSearch && matchesVariety && matchesSupervisor;
  });

  // Calculate summary stats
  const totalPlots = groups.reduce((sum, g) => sum + g.plotCount, 0);
  const totalFarmers = groups.length; // Backend doesn't provide farmerCount, using group count as fallback
  const totalArea = groups.reduce((sum, g) => sum + g.totalArea, 0);
  const groupsWithPlans = 0; // Backend doesn't provide hasProductionPlan field

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Sprout className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{groups.length}</p>
            <p className="text-xs text-muted-foreground">Active Groups</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <MapPin className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{totalPlots}</p>
            <p className="text-xs text-muted-foreground">Total Plots</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{totalFarmers}</p>
            <p className="text-xs text-muted-foreground">Total Farmers</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <FileText className="h-6 w-6 text-orange-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">
              {groupsWithPlans}/{groups.length}
            </p>
            <p className="text-xs text-muted-foreground">With Plans</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Groups Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search groups..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Rice Variety Filter */}
            <Select value={filterVariety} onValueChange={setFilterVariety}>
              <SelectTrigger>
                <SelectValue placeholder="All Rice Varieties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rice Varieties</SelectItem>
                {riceVarieties.map((variety) => (
                  <SelectItem key={variety} value={variety}>
                    {variety}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Supervisor Filter */}
            <Select value={filterSupervisor} onValueChange={setFilterSupervisor}>
              <SelectTrigger>
                <SelectValue placeholder="All Supervisors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Supervisors</SelectItem>
                {supervisors.map((supervisor) => (
                  <SelectItem key={supervisor} value={supervisor}>
                    {supervisor}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Groups List */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {filteredGroups.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No groups found matching your filters
              </div>
            ) : (
              filteredGroups.map((group) => (
                <Card key={group.groupId}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Group Header */}
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">Group {group.riceVarietyName}</h4>
                            <Badge
                              variant={
                                group.status === 'Active' ? 'default' : 'secondary'
                              }
                            >
                              {group.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Sprout className="h-3 w-3" />
                              {group.riceVarietyName}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {group.supervisorName}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(group.plantingDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4 p-3 bg-muted rounded-lg">
                        <div className="text-center">
                          <p className="text-lg font-bold">{group.plotCount}</p>
                          <p className="text-xs text-muted-foreground">Plots</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold">
                            {group.totalArea.toFixed(1)}
                          </p>
                          <p className="text-xs text-muted-foreground">Hectares</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onViewDetails?.(group.groupId)}
                        >
                          View Details
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => onCreatePlan?.(group.groupId)}
                        >
                          <Plus className="mr-1 h-3 w-3" />
                          Create Plan
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Summary Footer */}
          <div className="pt-4 border-t text-sm text-muted-foreground">
            <p>
              Showing {filteredGroups.length} of {groups.length} groups • Total
              Area: {totalArea.toFixed(1)} ha
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

