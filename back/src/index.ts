import { config } from './config/config'
import { RWSConfigInjector, RWSBootstrap } from "@rws-framework/server/nest";

@RWSConfigInjector(config())
class AppBootstrap extends RWSBootstrap {}

import { TheAppModule } from "./app/app.module";

AppBootstrap
    .run(TheAppModule, { authorization: false, transport: 'websocket' })
    .then(() => {});