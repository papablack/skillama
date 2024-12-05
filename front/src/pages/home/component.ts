import { RWSViewComponent, RWSView } from '@rws-framework/client';


@RWSView('page-home')
class HomePage extends RWSViewComponent {  
  
    connectedCallback(): void 
    {
        super.connectedCallback();    
    }
}

HomePage.defineComponent();

export { HomePage };