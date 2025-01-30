import { AccessOptions, Client } from 'basic-ftp';

interface FtpSessionOptions extends Pick<AccessOptions, 'host' | 'port'> {
}

export class FtpSession {
    private readonly client: Client;    

    constructor(private readonly options: FtpSessionOptions) {
        this.client = new Client();
    }

    async launch() {
        await this.client.access(this.options);
    }

    async createDir(dirPath: string) {
        await this.client.send(`MKD ${dirPath}`);
    }

    async uploadFromDir(source: string, toRemotePath: string) {
        await this.client.uploadFromDir(source, toRemotePath);
    }

    destroy() {
        this.client.close();
    }
}
