import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { LocalStorageDriver } from '../../drivers/local/local-storage-driver.js';

export async function createLocalStorage() {
    const root = await mkdtemp(path.join(tmpdir(), "storix-"),);

    const storage = new LocalStorageDriver({ root, });

    return { root, storage };
}