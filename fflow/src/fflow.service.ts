import { Injectable } from '@nestjs/common';
import { UploadSessionId } from '@stombie/retube-core';
import { ChildProcess, spawn } from 'child_process';
import { FlowNotFoundError } from './errors/flow-not-found.error';
import { FlowAlreadyExistsError } from './errors/flow-already-exists.error';

@Injectable()
export class FFlowService {
    private readonly flowBySessionId: Record<UploadSessionId, ChildProcess>;

    constructor() {
        this.flowBySessionId = {};
    }

    // TODO: мб добавить подвязку не на uploadSessionId, а на встроенном айдишнике линии
    createFlow(uploadSessionId: UploadSessionId, args: string[]) {
        if (this.flowBySessionId[uploadSessionId]) {
            throw new FlowAlreadyExistsError(uploadSessionId);
        }
        const process = spawn('ffmpeg', args);
        process.stderr.on('data', data => {
            console.error(`STDERR<${uploadSessionId}>: ${data}`);
        });
        process.stdout.on('data', data => {
            console.info(`STDOUT<${uploadSessionId}>: ${data}`);
        });
        this.flowBySessionId[uploadSessionId] = process;
    }
    
    deleteFlow(uploadSessionId: UploadSessionId) {
        this.checkFlowExistance(uploadSessionId);
        this.flowBySessionId[uploadSessionId].kill();
        this.destroyFlow(uploadSessionId);
        // TODO: добавить очистку ресурсов
    }

    pushToFlow(uploadSessionId: UploadSessionId, buffer: Buffer) {
        this.checkFlowExistance(uploadSessionId);
        this.flowBySessionId[uploadSessionId].stdin.write(buffer);
        // TODO: добавить ожидание обработки данных ffmpeg'ом
    }

    finishFlow(uploadSessionId: UploadSessionId) {
        this.checkFlowExistance(uploadSessionId);
        this.flowBySessionId[uploadSessionId].stdin.end();
        this.destroyFlow(uploadSessionId);
    }

    private destroyFlow(uploadSessionId: UploadSessionId) {
        this.flowBySessionId[uploadSessionId].kill();
        delete this.flowBySessionId[uploadSessionId];
    }

    private checkFlowExistance(uploadSessionId: UploadSessionId) {
        if (!this.flowBySessionId[uploadSessionId]) {
            throw new FlowNotFoundError(uploadSessionId);
        }
    }
}