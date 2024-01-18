import { Issue } from './issue.model';
import { Publication } from './publication.model';
import { TriggerOrCallbackOptions } from './trigger.interface';

export interface DraftActionsMethodInput {
  draftId?: string;
  publication?: Publication;
  issue?: Issue;
  options?: TriggerOrCallbackOptions;
  upload?: boolean;
}
