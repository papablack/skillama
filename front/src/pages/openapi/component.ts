import { RWSViewComponent, RWSView, observable } from '@rws-framework/client';


@RWSView('page-openapi')
class OpenAPIPage extends RWSViewComponent {  
    @observable configContents: string = process.env.OPENAPI_TEMPLATE.replace('{{DOMAIN}}', `https://${process.env.TUNNELER_NAME}.loca.lt`).replace(/\r\n/g, '\n');
    connectedCallback(): void 
    {
        super.connectedCallback();    
    }
}

OpenAPIPage.defineComponent();

export { OpenAPIPage };