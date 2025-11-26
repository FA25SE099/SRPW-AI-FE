export const calculateDaysAfter = (basePlantingDate: string, scheduledDate: string): number => {
    const base = new Date(basePlantingDate);
    const scheduled = new Date(scheduledDate);
    const diffTime = scheduled.getTime() - base.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
};

export const calculateDuration = (scheduledDate: string, scheduledEndDate: string | null): number => {
    if (!scheduledEndDate) return 1;
    const start = new Date(scheduledDate);
    const end = new Date(scheduledEndDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays + 1);
};

