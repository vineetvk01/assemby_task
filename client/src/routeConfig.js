import { Login } from './views/login';
import { DashBoard } from './views/dashboard';

export const routeConfig = {
  loginPage: {
    component: Login,
    route: '/login',
    exact: true
  },
  dashboardPage: {
    component: DashBoard,
    route: '/',
    exact: true
  }
};