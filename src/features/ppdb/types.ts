export type PpdbInformationFieldName =
  | "title"
  | "academicYear"
  | "status"
  | "shortDescription"
  | "description"
  | "quota"
  | "brochureUrl"
  | "externalRegistrationUrl"
  | "registrationLocation"
  | "contactPerson"
  | "contactPhone"
  | "contactEmail"
  | "serviceHours"
  | "scholarshipInformation"
  | "showFee"
  | "showExternalRegistrationButton"
  | "isActive";

export type PpdbTimelineFieldName =
  "ppdbId" | "title" | "description" | "startDate" | "endDate" | "sortOrder";

export type PpdbRequirementFieldName =
  "ppdbId" | "title" | "description" | "isRequired" | "sortOrder";

export type PpdbFlowStepFieldName =
  "ppdbId" | "title" | "description" | "sortOrder";

export type PpdbFeeFieldName =
  | "ppdbId"
  | "name"
  | "feeType"
  | "amount"
  | "description"
  | "isOptional"
  | "sortOrder";

type BaseActionState<FieldName extends string> = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<FieldName, string[]>>;
};

export type PpdbInformationActionState =
  BaseActionState<PpdbInformationFieldName> & {
    ppdbId?: string;
  };

export type PpdbTimelineActionState = BaseActionState<PpdbTimelineFieldName> & {
  timelineId?: string;
};

export type PpdbRequirementActionState =
  BaseActionState<PpdbRequirementFieldName> & {
    requirementId?: string;
  };

export type PpdbFlowStepActionState = BaseActionState<PpdbFlowStepFieldName> & {
  flowStepId?: string;
};

export type PpdbFeeActionState = BaseActionState<PpdbFeeFieldName> & {
  feeId?: string;
};

export const initialPpdbInformationActionState: PpdbInformationActionState = {
  status: "idle",
};

export const initialPpdbTimelineActionState: PpdbTimelineActionState = {
  status: "idle",
};

export const initialPpdbRequirementActionState: PpdbRequirementActionState = {
  status: "idle",
};

export const initialPpdbFlowStepActionState: PpdbFlowStepActionState = {
  status: "idle",
};

export const initialPpdbFeeActionState: PpdbFeeActionState = {
  status: "idle",
};
