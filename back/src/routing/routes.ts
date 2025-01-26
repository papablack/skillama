import { RWSHTTPRoutingEntry, IPrefixedHTTProutes } from '@rws-framework/server/src/routing/routes';
import { appRoutes } from './actions/appActions';


export default [
    {
        prefix: '/api',
        controllerName: 'app',
        routes: appRoutes
    }

] as IPrefixedHTTProutes[];
