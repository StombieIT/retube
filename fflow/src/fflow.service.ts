import { Injectable } from '@nestjs/common';
import { UploadSessionId } from '@stombie/retube-core';
import { ChildProcess, spawn } from 'child_process';
import { FlowNotFoundError } from './errors/flow-not-found.error';
import { FlowAlreadyExistsError } from './errors/flow-already-exists.error';

@Injectable()
export class FFlowService {
    private readonly flowBySessionId: Record<UploadSessionId, ChildProcess>;
    
    // TODO: мб добавить подвязку не на uploadSessionId, а на встроенном айдишнике линии
    createFlow(uploadSessionId: UploadSessionId, args: string[]) {
        if (this.flowBySessionId[uploadSessionId]) {
            throw new FlowAlreadyExistsError(uploadSessionId);
        }
        this.flowBySessionId[uploadSessionId] = spawn('ffmpeg', args);
    }
    
    deleteFlow(uploadSessionId: UploadSessionId) {
        this.checkFlowExistance(uploadSessionId);
        this.flowBySessionId[uploadSessionId].kill();
        // TODO: добавить очистку ресурсов
        delete this.flowBySessionId[uploadSessionId];
    }

    pushToFlow(uploadSessionId: UploadSessionId, buffer: Buffer) {
        this.checkFlowExistance(uploadSessionId);
        this.flowBySessionId[uploadSessionId].stdin.write(buffer);
        // TODO: добавить ожидание обработки данных ffmpeg'ом
    }

    private checkFlowExistance(uploadSessionId: UploadSessionId) {
        if (!this.flowBySessionId[uploadSessionId]) {
            throw new FlowNotFoundError(uploadSessionId);
        }
    }
}