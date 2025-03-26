import PocketBase from 'pocketbase'

export const pb = new PocketBase(import.meta.env.DEV ? 'http://127.0.0.1:8090' : '/')
