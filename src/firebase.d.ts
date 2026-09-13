import { FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import { Analytics } from 'firebase/analytics';

export const app: FirebaseApp;
export const auth: Auth;
export const db: Firestore;
export let analytics: Analytics | null;
declare const _default: FirebaseApp;
export default _default;
