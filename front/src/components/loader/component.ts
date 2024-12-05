import { RWSViewComponent } from '@rws-framework/client';
import {css, html} from '@microsoft/fast-element';
const styles = css`.loader {
    width: 74px;
    height: 29.382px;
    display: grid;
    top: 50%;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  .loader:before {
    content: "";
    grid-area: 1/1;
    background: #FD135A;
    --c1:conic-gradient(from 150deg at top, #000 60deg, #0000 0);
    --c2:conic-gradient(from -30deg at bottom, #000 60deg, #0000 0);
    --s:27px calc(27px*0.866);
    clip-path: polygon(17px 0, calc(100% - 17px) 0, 100% 100%, 0 100%);
    -webkit-mask: var(--c1) left 6px top 4px, var(--c2) center, var(--c1) right 6px top 4px, linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    -webkit-mask-repeat: no-repeat;
    animation: l6 2s infinite both;
  }
  .loader:after {
    content: "";
    grid-area: 1/1;
    background: #FD135A;
    --c1:conic-gradient(from 150deg at top, #000 60deg, #0000 0);
    --c2:conic-gradient(from -30deg at bottom, #000 60deg, #0000 0);
    --s:27px calc(27px*0.866);
    clip-path: polygon(17px 0, calc(100% - 17px) 0, 100% 100%, 0 100%);
    -webkit-mask: var(--c1) left 6px top 4px, var(--c2) center, var(--c1) right 6px top 4px, linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    -webkit-mask-repeat: no-repeat;
    animation: l6 2s infinite both;
    transform: rotate(180deg);
    transform-origin: 50% 99%;
    animation-delay: 0.5s;
  }
  
  @keyframes l6 {
    0% {
      -webkit-mask-size: 0 0, 0 0, 0 0, auto;
    }
    8.33% {
      -webkit-mask-size: var(--s), 0 0, 0 0, auto;
    }
    16.67% {
      -webkit-mask-size: var(--s), var(--s), 0 0, auto;
    }
    25%, 50% {
      -webkit-mask-size: var(--s), var(--s), var(--s), auto;
    }
    58.33% {
      -webkit-mask-size: 0 0, var(--s), var(--s), auto;
    }
    66.67% {
      -webkit-mask-size: 0 0, 0 0, var(--s), auto;
    }
    75%, 100% {
      -webkit-mask-size: 0 0, 0 0, 0 0, auto;
    }
  }`;

const template = html`<div class="loader"></div>`;

class Loader extends RWSViewComponent {

    static definition = { name: 'the-loader', styles, template };
  
    connectedCallback(): void {
        super.connectedCallback();
    }
}

Loader.defineComponent();

export { Loader };