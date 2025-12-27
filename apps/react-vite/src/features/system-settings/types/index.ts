// System Setting Types

export type SystemSettingCategory = 'GroupFormation' | 'MaterialDistribution' | string;

export interface SystemSetting {
  id: string;
  settingKey: string;
  settingValue: string;
  settingCategory: SystemSettingCategory;
  settingDescription: string;
  createdAt: string;
  lastModifiedAt: string | null;
}

export interface GetSystemSettingsParams {
  currentPage: number;
  pageSize: number;
  searchKey?: string;
  category?: string;
}

export interface GetSystemSettingsResponse {
  data: SystemSetting[];
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface UpdateSystemSettingRequest {
  settingValue: string;
  settingDescription?: string;
}

export interface UpdateSystemSettingResponse {
  data: string; // ID of updated setting
}

export interface GetCategoriesResponse {
  data: string[];
}

