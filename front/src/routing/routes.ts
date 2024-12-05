

import { renderRouteComponent } from '@rws-framework/browser-router';
import { HomePage } from '../pages/home/component';
import { OpenAPIPage } from '../pages/openapi/component';



export default {
    '/': renderRouteComponent('Home page', HomePage),
    '/openapi': renderRouteComponent('Open API Json', OpenAPIPage),
};