import RWSClient, { RWSContainer, RWSPlugin } from '@rws-framework/client';
import { RWSBrowserRouter  } from '@rws-framework/browser-router';
import initComponents from './application/_initComponents';
import './styles/main.scss';

import routes from './routing/routes';
import notifierMethod from './_notifier';

async function initializeApp() {
    const theClient = RWSContainer().get(RWSClient);
    
    theClient.onInit(async () => {
        RWSPlugin.getPlugin<RWSBrowserRouter>(RWSBrowserRouter).addRoutes(routes);
        initComponents();
    });    

    theClient.setNotifier(notifierMethod);

    theClient.addPlugin(RWSBrowserRouter);

    theClient.assignClientToBrowser();         

    // await theClient.onDOMLoad();
    theClient.start({
        backendUrl: process.env.TUNNELER_NAME,
        partedDirUrlPrefix: '/js',
        parted: false
    });
}

initializeApp().catch(console.error);
