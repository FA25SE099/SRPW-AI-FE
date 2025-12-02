import { queryOptions, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { QueryConfig } from "@/lib/react-query";

// ======================================================
// TYPES
// ======================================================

export type GroupStatus =
    | "Draft"
    | "Active"
    | "ReadyForOptimization"
    | "Locked"
    | "Exception";

export type Group = {
    groupId: string;
    clusterId: string;
    supervisorId: string;
    status: GroupStatus;
    area: string | null;
    totalArea: number;

    // NEW FOR UI
    hasProductionPlan: boolean;
    planStatus?: UIPlanStatus;
};

export type UIPlanStatus = "pending" | "in-progress" | "completed";

export type GroupsResponse = {
    succeeded: boolean;
    data: Group[];
    message: string;
    errors: string[];
};

// ======================================================
// 1. API GET GROUPS
// ======================================================

export const getGroups = (): Promise<GroupsResponse> => {
    return api.get("/Group");
};

// ======================================================
// 2. API GET PRODUCTION PLAN FOR A GROUP
//    ❗ Bạn chỉ cần sửa endpoint này theo backend thật của bạn
// ======================================================

export type RawProductionPlan = {
    productionPlanId: string;
    status: string; // Backend status: "Planned" | "Draft" | "Completed" ...
    [key: string]: any;
};

export type GroupPlanResponse = {
    succeeded: boolean;
    data: {
        productionPlans: RawProductionPlan[];
        [key: string]: any;
    };
};

export const getGroupProductionPlans = async (
    groupId: string
): Promise<GroupPlanResponse> => {
    // ❗ FIX endpoint này nếu backend bạn khác
    return api.get(`/production-plans/by-group/${groupId}`);
};

// ======================================================
// 3. MAP BACKEND → UI STATUS
// ======================================================

const mapBackendStatusToUI = (status: string | undefined): UIPlanStatus => {
    if (!status) return "pending";

    const s = status.toLowerCase();

    if (s === "completed" || s === "complete" || s === "done") return "completed";

    return "in-progress";
};

// ======================================================
// 4. REACT QUERY OPTIONS WRAPPER
// ======================================================

export const getGroupsQueryOptions = () => {
    return queryOptions({
        queryKey: ["groups"],
        queryFn: getGroups,
    });
};

type UseGroupsOptions = {
    queryConfig?: QueryConfig<typeof getGroupsQueryOptions>;
};

// ======================================================
// 5. useGroups() — FULL LOGIC INCLUDING PRODUCTION PLAN
// ======================================================

export const useGroups = ({ queryConfig }: UseGroupsOptions = {}) => {
    return useQuery({
        ...getGroupsQueryOptions(),
        ...queryConfig,

        // Override queryFn để enrich groups với production plan
        queryFn: async () => {
            const baseRes = await getGroups();
            const baseGroups = baseRes.data;

            const enhancedGroups: Group[] = await Promise.all(
                baseGroups.map(async (g) => {
                    try {
                        const planRes = await getGroupProductionPlans(g.groupId);
                        const plans = planRes?.data?.productionPlans ?? [];

                        if (plans.length === 0) {
                            return {
                                ...g,
                                hasProductionPlan: false,
                                planStatus: "pending",
                            };
                        }

                        const latestPlan = plans[0];
                        const uiStatus = mapBackendStatusToUI(latestPlan.status);

                        return {
                            ...g,
                            hasProductionPlan: true,
                            planStatus: uiStatus,
                        };
                    } catch (e) {
                        return {
                            ...g,
                            hasProductionPlan: false,
                            planStatus: "pending",
                        };
                    }
                })
            );

            return {
                ...baseRes,
                data: enhancedGroups,
            };
        },
    });
};
