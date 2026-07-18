import { dataProvider } from '../providers/provider';

export const authenticate = (email: string, password: string) => dataProvider.authenticate(email, password);
export const authenticateWithGoogle = (idToken: string) => dataProvider.authenticateWithGoogle(idToken);
export const logoutRemote = () => dataProvider.logout();
export const getCompanySettings = () => dataProvider.getCompanySettings();
export const getUsers = () => dataProvider.getUsers();
export const updateCompanyName = (name: string) => dataProvider.updateCompanyName(name);
export const updateUserRole = (userId: string, role: import('../types/models').UserRole) => dataProvider.updateUserRole(userId, role);
