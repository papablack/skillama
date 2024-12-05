import { RWSViewComponent, RWSView } from '@rws-framework/client';
import {  observable  } from '@microsoft/fast-element';


interface ILink {
  label: string;
  url: string;
}

@RWSView('site-menu', { ignorePackaging: true })
class SiteMenu extends RWSViewComponent {

  @observable links: ILink[] = [
      { label: 'Home', url: '/' },
      { label: 'OpenApi JSON', url: '/openapi' },
  ];

  handleClick(event: Event, link: ILink): void {
      if(event){
          event.preventDefault();
      }      
      
    
      this.$emit('routing.url.changed', {
          item: link.url
      });
  }
}

SiteMenu.defineComponent();

export { SiteMenu, ILink };