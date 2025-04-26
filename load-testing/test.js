import http from 'k6/http';
import { check, sleep } from 'k6';
import { auth } from './auth.js';
import { JSON_HEADERS, OCTET_STREAM_HEADERS } from './constants.js';
import { generateRandomBuffer } from './utils.js';

const {
    VUS_COUNT = '10',
    TITLE = 'title',
    DESCRIPTION = 'description',
    VIDEO_SIZE = '90000000',
    CHUNK_SIZE = '8192',
    BASE_GATEWAY_URL,
} = __ENV;

const vusCount = Number(VUS_COUNT);
if (isNaN(vusCount)) {
    throw new Error('Vus count is not a number');
}
const videoSize = Number(VIDEO_SIZE);
if (isNaN(videoSize)) {
    throw new Error('Video size is not a number');
}
const chunkSize = Number(CHUNK_SIZE);
if (isNaN(chunkSize)) {
    throw new Error('Chunk size is not a number');
}

const chunkCount = Math.ceil(VIDEO_SIZE / CHUNK_SIZE);
const iterationsCount = vusCount * chunkCount;

export const options = {
    vus: vusCount,
    iterations: iterationsCount,
};

export function setup() {
    const accessToken = auth();
    return { accessToken };
}

const UPLOAD_SESSION_INFO_BY_VU = {};

export default function ({ accessToken }) {
    const vu = __VU;
    const authorizationHeaders = {
        'Authorization': `Bearer ${accessToken}`,
    };
    if (!UPLOAD_SESSION_INFO_BY_VU[vu]) {
        const videoPayload = JSON.stringify({
            title: TITLE,
            description: DESCRIPTION,
            totalBytesList: [videoSize],
        });

        const res = http.post(`${BASE_GATEWAY_URL}/create-video`, videoPayload, { headers: {
            ...JSON_HEADERS,
            ...authorizationHeaders,
        }});
        check(res, {
            'create-video': (r) => r.status === 201 || r.status === 200,
        });

        const { payload: { flows } } = res.json();
        const [flow] = flows;
        const { uploadSession } = flow;
        const uid = uploadSession.id;
        UPLOAD_SESSION_INFO_BY_VU[vu] = {
            uid,
            offset: 0,
        };
    }

    const info = UPLOAD_SESSION_INFO_BY_VU[vu];
    const { uid, offset } = info;
    const startByte = offset;
    if (startByte >= videoSize) {
        return;
    }
    const size = Math.min(videoSize - startByte, chunkSize);
    const buffer = generateRandomBuffer(size);

    const res = http.post(`${BASE_GATEWAY_URL}/upload/${uid}`, buffer, { headers: {
        ...authorizationHeaders,
        ...OCTET_STREAM_HEADERS,
        'x-size': size.toString(),
        'x-start-byte': startByte.toString(),
    }});
    info.offset += size;
    check(res, {
        'upload': (r) => r.status === 201 || r.status === 200,
    });
    sleep(0.05);
}
