import { DefaultLayout } from '../components/default-layout/component';
import { RWSClientInstance } from '@rws-framework/client/src/client';
import { JsonEditor } from '../components/json-editor/component'

export default () => {
    // jsonViewer();
    DefaultLayout;
    JsonEditor;
    RWSClientInstance.defineAllComponents();
};