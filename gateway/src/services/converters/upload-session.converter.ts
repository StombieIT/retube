import { Gateway, UploadSession } from '@stombie/retube-core';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UploadSessionConverterService {
    toSmallUploadSession(uploadSession: UploadSession): Gateway.SmallUploadSession {
        return {
            id: uploadSession.id,
            totalBytes: uploadSession.totalBytes,
            uploadedBytes: uploadSession.uploadedBytes,
        };
    }
}
