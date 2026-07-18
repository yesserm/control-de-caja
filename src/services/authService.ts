import { dataProvider } from '../providers/provider';

export const authenticate = (email: string, password: string) => dataProvider.authenticate(email, password);
export const logoutRemote = () => dataProvider.logout();
