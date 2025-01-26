import { RWSHTTPRoutingEntry, IPrefixedHTTProutes } from '@rws-framework/server/src/routing/routes';
import { appRoutes } from './actions/appActions';
import { traverseRoutes } from './actions/traverseActions';


export default [
    {
        prefix: '/api',
        controllerName: 'app',
        routes: appRoutes
    },
    {
        prefix: '/api/files',
        controllerName: 'traverse',
        routes: traverseRoutes
    }
] as IPrefixedHTTProutes[];
