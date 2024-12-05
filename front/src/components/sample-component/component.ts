import { RWSViewComponent, RWSView, observable } from '@rws-framework/client';

@RWSView('site-menu')
class SampleComponent extends RWSViewComponent {
  @observable title: string;
}

SampleComponent.defineComponent();

export { SampleComponent };