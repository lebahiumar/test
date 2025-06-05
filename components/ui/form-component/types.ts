import { Attachment } from '../../../lib/utils';

export interface UploadingAttachment {
    name: string;
    progress?: number;
    url?: string;
    contentType?: string;
    size?: number;
}