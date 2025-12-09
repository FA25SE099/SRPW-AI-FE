"use client";

import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Loader2,
    Calendar,
    MapPin,
    User,
    Sprout,
    CheckCircle2,
    Clock,
    TrendingUp,
    BarChart3,
    FileText,
    Phone,
    Mail,
    Users,
    Target,
    Activity,
    Leaf,
    Droplets,
    Sun,
    ShieldCheck
} from "lucide-react";
import { useGroupDetail } from "@/features/groups/api/get-groups-detail";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    groupId: string;
};

export const ProductionPlanDetailDialog = ({
    isOpen,
    onClose,
    groupId,
}: Props) => {
    const { data: groupDetail, isLoading } = useGroupDetail({ groupId });

    const plan = groupDetail?.productionPlans?.[0];
    const group = groupDetail;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Approved':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'InProgress':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Completed':
                return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'PendingApproval':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'Not set';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    const getProgressPercentage = (status: string) => {
        switch (status) {
            case 'Completed': return 100;
            case 'InProgress': return 65;
            case 'Approved': return 25;
            default: return 10;
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden p-0 [&>button]:hidden">
                <div className="flex h-[calc(95vh-40px)]">
                    {/* Sidebar */}
                    <div className="w-80 bg-slate-900 text-white flex flex-col">
                        {/* Logo & Navigation */}
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <Sprout className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">SRPW</h3>
                                    <p className="text-xs text-slate-400">Smart Rice Production</p>
                                </div>
                            </div>

                            <nav className="space-y-1">
                                <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-600/20 text-blue-300 border-l-2 border-blue-400">
                                    <FileText className="w-4 h-4" />
                                    <span className="text-sm font-medium">Plan Overview</span>
                                </div>
                            </nav>
                        </div>

                        {/* Supervisor Info */}
                        {!isLoading && group && (
                            <div className="mt-auto p-6 border-t border-slate-700">
                                <div className="flex items-center gap-3">
                                    <Avatar className="w-12 h-12">
                                        <AvatarFallback className="bg-slate-700 text-white">
                                            {group.supervisorName?.charAt(0) || 'S'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <p className="font-medium text-white">{group.supervisorName || 'Unassigned'}</p>
                                        <p className="text-xs text-slate-400">Field Supervisor</p>
                                        <div className="flex items-center gap-1 mt-1">
                                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                            <span className="text-xs text-green-400">Online</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
                        {/* Header với close button duy nhất */}
                        <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Production Plan Details</h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Comprehensive view of production planning and execution
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onClose}
                            >
                                X
                            </Button>
                        </div>

                        {isLoading && (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center space-y-4">
                                    <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600" />
                                    <p className="text-gray-600">Loading production plan details...</p>
                                </div>
                            </div>
                        )}

                        {!isLoading && !plan && (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center space-y-6 max-w-md">
                                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                                        <Calendar className="h-10 w-10 text-gray-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                            No Production Plan Available
                                        </h3>
                                        <p className="text-gray-600">
                                            This group is currently waiting for agricultural experts to create and approve a comprehensive production plan.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {!isLoading && plan && group && (
                            <div className="flex-1 overflow-y-auto">
                                {/* Plan Header */}
                                <div className="bg-white border-b px-6 py-4">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h1 className="text-2xl font-bold text-gray-900 mb-1">
                                                {plan.planName}
                                            </h1>
                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                <span>Group {group.riceVarietyName}</span>
                                                <span>•</span>
                                                <span>{group.plots?.length || 0} plots</span>
                                                <span>•</span>
                                                <span>{group.totalArea || 0} hectares</span>
                                            </div>
                                        </div>
                                        <Badge className={`${getStatusColor(plan.status)} border`}>
                                            <CheckCircle2 className="w-3 h-3 mr-1" />
                                            {plan.status}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Overview Cards */}
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                        <Card className="border-l-4 border-l-blue-500">
                                            <CardContent className="p-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                            Base Planting Date
                                                        </p>
                                                        <p className="text-lg font-bold text-gray-900 mt-1">
                                                            {formatDate(plan.basePlantingDate)}
                                                        </p>
                                                    </div>
                                                    <Calendar className="w-8 h-8 text-blue-500" />
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card className="border-l-4 border-l-green-500">
                                            <CardContent className="p-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                            Total Coverage
                                                        </p>
                                                        <p className="text-lg font-bold text-gray-900 mt-1">
                                                            {plan.totalArea} ha
                                                        </p>
                                                    </div>
                                                    <MapPin className="w-8 h-8 text-green-500" />
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card className="border-l-4 border-l-purple-500">
                                            <CardContent className="p-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                            Plot Count
                                                        </p>
                                                        <p className="text-lg font-bold text-gray-900 mt-1">
                                                            {group.plots?.length || 0}
                                                        </p>
                                                    </div>
                                                    <Users className="w-8 h-8 text-purple-500" />
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card className="border-l-4 border-l-orange-500">
                                            <CardContent className="p-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                            Progress
                                                        </p>
                                                        <p className="text-lg font-bold text-gray-900 mt-1">
                                                            {getProgressPercentage(plan.status)}%
                                                        </p>
                                                    </div>
                                                    <TrendingUp className="w-8 h-8 text-orange-500" />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* Main Content Tabs */}
                                    <Tabs defaultValue="overview" className="w-full">
                                        <TabsList className="grid w-full grid-cols-4 bg-white border-0 p-1 h-auto">
                                            <TabsTrigger
                                                value="overview"
                                                className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 py-3"
                                            >
                                                <FileText className="w-4 h-4 mr-2" />
                                                Overview
                                            </TabsTrigger>
                                            <TabsTrigger
                                                value="plots"
                                                className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 py-3"
                                            >
                                                <MapPin className="w-4 h-4 mr-2" />
                                                Plots ({group.plots?.length || 0})
                                            </TabsTrigger>
                                            <TabsTrigger
                                                value="timeline"
                                                className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 py-3"
                                            >
                                                <Clock className="w-4 h-4 mr-2" />
                                                Timeline
                                            </TabsTrigger>
                                            <TabsTrigger
                                                value="analytics"
                                                className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 py-3"
                                            >
                                                <BarChart3 className="w-4 h-4 mr-2" />
                                                Analytics
                                            </TabsTrigger>
                                        </TabsList>

                                        <div className="mt-6">
                                            <TabsContent value="overview" className="space-y-6">
                                                {/* Plan Information */}
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                    <Card>
                                                        <CardHeader>
                                                            <CardTitle className="flex items-center gap-2">
                                                                <FileText className="w-5 h-5" />
                                                                Plan Information
                                                            </CardTitle>
                                                        </CardHeader>
                                                        <CardContent className="space-y-4">
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Plan ID</label>
                                                                    <p className="text-sm font-mono text-gray-900 mt-1">
                                                                        #{plan.id.slice(0, 12)}...
                                                                    </p>
                                                                </div>
                                                                <div>
                                                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</label>
                                                                    <p className="text-sm font-semibold text-gray-900 mt-1">{plan.status}</p>
                                                                </div>
                                                                <div>
                                                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Rice Variety</label>
                                                                    <p className="text-sm text-gray-900 mt-1">{group.riceVarietyName || 'Not specified'}</p>
                                                                </div>
                                                                <div>
                                                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Season</label>
                                                                    <p className="text-sm text-gray-900 mt-1">{group.seasonId}</p>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>

                                                    <Card>
                                                        <CardHeader>
                                                            <CardTitle className="flex items-center gap-2">
                                                                <TrendingUp className="w-5 h-5" />
                                                                Production Progress
                                                            </CardTitle>
                                                        </CardHeader>
                                                        <CardContent>
                                                            <div className="space-y-4">
                                                                <div className="flex justify-between items-center">
                                                                    <span className="text-sm text-gray-600">Overall Completion</span>
                                                                    <span className="text-lg font-bold text-gray-900">
                                                                        {getProgressPercentage(plan.status)}%
                                                                    </span>
                                                                </div>
                                                                <div className="w-full bg-gray-200 rounded-full h-3">
                                                                    <div
                                                                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                                                                        style={{ width: `${getProgressPercentage(plan.status)}%` }}
                                                                    ></div>
                                                                </div>
                                                                <div className="grid grid-cols-3 gap-4 mt-4">
                                                                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                                                                        <Leaf className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                                                                        <p className="text-xs text-gray-600">Planning</p>
                                                                        <p className="text-sm font-semibold">Complete</p>
                                                                    </div>
                                                                    <div className="text-center p-3 bg-green-50 rounded-lg">
                                                                        <Sprout className="w-6 h-6 text-green-600 mx-auto mb-1" />
                                                                        <p className="text-xs text-gray-600">Planting</p>
                                                                        <p className="text-sm font-semibold">In Progress</p>
                                                                    </div>
                                                                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                                                                        <ShieldCheck className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                                                                        <p className="text-xs text-gray-600">Harvest</p>
                                                                        <p className="text-sm font-semibold">Pending</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </div>
                                            </TabsContent>

                                            <TabsContent value="plots" className="space-y-4">
                                                <div className="grid gap-4">
                                                    {group.plots?.map((plot: any, index: number) => (
                                                        <Card key={plot.id} className="hover:shadow-md transition-shadow">
                                                            <CardContent className="p-6">
                                                                <div className="flex items-start justify-between">
                                                                    <div className="flex items-start gap-4">
                                                                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                                                            <MapPin className="w-6 h-6 text-green-600" />
                                                                        </div>
                                                                        <div>
                                                                            <h4 className="font-semibold text-lg text-gray-900">
                                                                                Plot {plot.soThua}/{plot.soTo}
                                                                            </h4>
                                                                            <p className="text-gray-600">{plot.farmerName}</p>
                                                                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                                                                <span>Soil: {plot.soilType}</span>
                                                                                <span>•</span>
                                                                                <span>Area: {plot.area} ha</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <Badge variant="outline" className="mb-2">
                                                                            {plot.status}
                                                                        </Badge>
                                                                        <p className="text-xs text-gray-500 font-mono">
                                                                            ID: {plot.id.slice(0, 8)}...
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    )) || (
                                                            <div className="text-center py-12">
                                                                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                                                <h3 className="text-lg font-medium text-gray-900 mb-2">No Plots Assigned</h3>
                                                                <p className="text-gray-600">This group doesn't have any plots assigned yet.</p>
                                                            </div>
                                                        )}
                                                </div>
                                            </TabsContent>

                                            <TabsContent value="timeline">
                                                <Card>
                                                    <CardContent className="p-8 text-center">
                                                        <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                                            Timeline Coming Soon
                                                        </h3>
                                                        <p className="text-gray-600 max-w-md mx-auto">
                                                            Detailed timeline and milestone tracking will be available as the production plan progresses.
                                                        </p>
                                                    </CardContent>
                                                </Card>
                                            </TabsContent>

                                            <TabsContent value="analytics">
                                                <Card>
                                                    <CardContent className="p-8 text-center">
                                                        <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                                            Analytics Dashboard
                                                        </h3>
                                                        <p className="text-gray-600 max-w-md mx-auto">
                                                            Comprehensive analytics and insights will be available once data collection is complete.
                                                        </p>
                                                    </CardContent>
                                                </Card>
                                            </TabsContent>
                                        </div>
                                    </Tabs>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};