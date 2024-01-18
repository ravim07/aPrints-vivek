import { STATUS_CAN_MODIFY_PRINT_SPECS } from './issue-status.model';
import { Issue } from './issue.model';

export const canChangePrintSpecs = (issue: Issue) =>
  issue.getCurrentDraft()
    ? STATUS_CAN_MODIFY_PRINT_SPECS.has(issue.getCurrentDraft().status)
    : true;
