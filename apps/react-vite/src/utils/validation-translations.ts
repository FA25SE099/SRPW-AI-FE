// Translation mapping for validation messages from backend
export const translateValidationMessage = (message: string): string => {
    // Check for specific patterns and translate them

    // Pattern: "BasePlantingDate (YYYY-MM-DD) is in the past"
    if (message.includes('is in the past')) {
        const dateMatch = message.match(/BasePlantingDate \(([^)]+)\)/);
        if (dateMatch) {
            return `Ngày gieo trồng cơ bản (${dateMatch[1]}) đã qua`;
        }
    }

    // Pattern: "BasePlantingDate differs from group's median planting date by X days (allowed: Y days). Group median: YYYY-MM-DD"
    if (message.includes('differs from group\'s median planting date')) {
        const diffMatch = message.match(/by (\d+) days \(allowed: (\d+) days\)/);
        const medianMatch = message.match(/Group median: ([0-9-]+)/);
        if (diffMatch && medianMatch) {
            return `Ngày gieo trồng cơ bản khác với ngày trồng trung vị của nhóm ${diffMatch[1]} ngày (cho phép: ${diffMatch[2]} ngày). Trung vị nhóm: ${medianMatch[1]}`;
        }
    }

    // Pattern: "YearSeason has already started on YYYY-MM-DD. Creating plans after season start may cause delays."
    if (message.includes('has already started')) {
        const dateMatch = message.match(/started on ([0-9-]+)/);
        if (dateMatch) {
            return `Mùa vụ đã bắt đầu vào ngày ${dateMatch[1]}. Tạo kế hoạch sau khi mùa vụ bắt đầu có thể gây chậm trễ.`;
        }
    }

    // Return original message if no pattern matches
    return message;
};
