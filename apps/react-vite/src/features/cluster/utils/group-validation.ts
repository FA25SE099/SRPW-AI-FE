import { PreviewGroup } from '../types';

export type ValidationError = {
  type: 'error' | 'warning';
  message: string;
  groupNumber?: number;
};

/**
 * Validates groups before creating them from preview
 * Returns an array of validation errors/warnings
 */
export const validateGroupsBeforeCreate = (
  groups: PreviewGroup[],
): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Check for empty groups
  const emptyGroups = groups.filter((g) => g.plotIds.length === 0);
  if (emptyGroups.length > 0) {
    emptyGroups.forEach((group) => {
      errors.push({
        type: 'error',
        message: `Group ${group.groupNumber} (${group.riceVarietyName}) has no plots`,
        groupNumber: group.groupNumber,
      });
    });
  }

  // Check for duplicate plot assignments
  const allPlotIds = groups.flatMap((g) => g.plotIds);
  const plotIdCounts = new Map<string, number>();
  allPlotIds.forEach((id) => {
    plotIdCounts.set(id, (plotIdCounts.get(id) || 0) + 1);
  });

  const duplicates = Array.from(plotIdCounts.entries()).filter(
    ([_, count]) => count > 1,
  );

  if (duplicates.length > 0) {
    errors.push({
      type: 'error',
      message: `${duplicates.length} plot(s) are assigned to multiple groups`,
    });
  }

  // Check for groups without supervisors
  const noSupervisor = groups.filter((g) => !g.supervisorId);
  if (noSupervisor.length > 0) {
    errors.push({
      type: 'warning',
      message: `${noSupervisor.length} group(s) have no supervisor assigned`,
    });
  }

  // Check for groups with empty names
  const emptyNames = groups.filter((g) => !g.groupName || g.groupName.trim() === '');
  if (emptyNames.length > 0) {
    errors.push({
      type: 'error',
      message: `${emptyNames.length} group(s) have no name`,
    });
  }

  // Check for duplicate group names
  const groupNames = groups.map((g) => g.groupName.trim().toLowerCase());
  const nameCounts = new Map<string, number>();
  groupNames.forEach((name) => {
    nameCounts.set(name, (nameCounts.get(name) || 0) + 1);
  });

  const duplicateNames = Array.from(nameCounts.entries()).filter(
    ([_, count]) => count > 1,
  );

  if (duplicateNames.length > 0) {
    errors.push({
      type: 'error',
      message: `Duplicate group names found: ${duplicateNames.map(([name]) => name).join(', ')}`,
    });
  }

  // Check for very small groups (less than 3 plots)
  const smallGroups = groups.filter((g) => g.plotIds.length < 3 && g.plotIds.length > 0);
  if (smallGroups.length > 0) {
    errors.push({
      type: 'warning',
      message: `${smallGroups.length} group(s) have fewer than 3 plots`,
    });
  }

  // Check for very small areas (less than 5 ha)
  const smallAreaGroups = groups.filter((g) => g.totalArea < 5 && g.totalArea > 0);
  if (smallAreaGroups.length > 0) {
    errors.push({
      type: 'warning',
      message: `${smallAreaGroups.length} group(s) have less than 5 ha total area`,
    });
  }

  return errors;
};

/**
 * Checks if there are any blocking errors (as opposed to warnings)
 */
export const hasBlockingErrors = (errors: ValidationError[]): boolean => {
  return errors.some((error) => error.type === 'error');
};

/**
 * Validates a single group edit
 */
export const validateGroupEdit = (group: PreviewGroup): string | null => {
  if (!group.groupName || group.groupName.trim() === '') {
    return 'Group name cannot be empty';
  }

  if (group.plotIds.length === 0) {
    return 'Group must have at least one plot';
  }

  if (group.totalArea <= 0) {
    return 'Group must have a positive total area';
  }

  return null;
};

/**
 * Validates plot removal from a group
 */
export const canRemovePlotFromGroup = (
  group: PreviewGroup,
  plotId: string,
): { canRemove: boolean; reason?: string } => {
  if (group.plotIds.length <= 1) {
    return {
      canRemove: false,
      reason: 'Cannot remove the last plot from a group',
    };
  }

  if (!group.plotIds.includes(plotId)) {
    return {
      canRemove: false,
      reason: 'Plot is not in this group',
    };
  }

  return { canRemove: true };
};

/**
 * Validates adding a plot to a group
 */
export const canAddPlotToGroup = (
  group: PreviewGroup,
  plotId: string,
  allGroups: PreviewGroup[],
  maxPlotsPerGroup?: number,
): { canAdd: boolean; reason?: string } => {
  // Check if plot is already in this group
  if (group.plotIds.includes(plotId)) {
    return {
      canAdd: false,
      reason: 'Plot is already in this group',
    };
  }

  // Check if plot is in another group
  const otherGroup = allGroups.find(
    (g) => g.groupNumber !== group.groupNumber && g.plotIds.includes(plotId),
  );

  if (otherGroup) {
    return {
      canAdd: false,
      reason: `Plot is already in Group ${otherGroup.groupNumber}`,
    };
  }

  // Check max plots constraint
  if (maxPlotsPerGroup && group.plotIds.length >= maxPlotsPerGroup) {
    return {
      canAdd: false,
      reason: `Group has reached maximum of ${maxPlotsPerGroup} plots`,
    };
  }

  return { canAdd: true };
};

