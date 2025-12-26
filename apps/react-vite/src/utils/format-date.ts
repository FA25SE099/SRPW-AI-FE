export const formatDateForInput = (dateString: string | undefined | null): string => {
    if (!dateString) {
        return '';
    }
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return '';
        }
        // Format to YYYY-MM-DDTHH:mm which is required by datetime-local input
        return date.toISOString().slice(0, 16);
    } catch (e) {
        return '';
    }
};