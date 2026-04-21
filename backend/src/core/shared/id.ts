import { randomUUID } from 'crypto';

export type IdGenerator = () => string;

export const uuidV4: IdGenerator = () => randomUUID();

