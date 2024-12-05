import { RWSViewComponent, RWSView, observable } from '@rws-framework/client';
import JSONEditor, { JSONEditorOptions } from 'jsoneditor';

@RWSView('json-editor')
class JsonEditor extends RWSViewComponent {
  @observable json: string | object;
  @observable copied: boolean = false;
  editorField: HTMLDivElement;

  private trueJson: object;
  

  connectedCallback(): void {
    super.connectedCallback();

    const options: JSONEditorOptions = {
      mode: 'tree',
      modes: ['tree','text'],
      onModeChange: (newMode: string) => {
        // Re-expand all nodes when mode changes
        if (newMode === 'tree') {
          editor.expandAll();
        }
      }
    }

    this.editorField.style.height = '100%';


    const editor = new JSONEditor(this.editorField, options)

    this.trueJson = typeof this.json === 'string' ? JSON.parse(this.json as string) : this.json;

    console.log({tj: this.trueJson})

    editor.set(this.trueJson);
    editor.expandAll();
  }

  async copy(): Promise<boolean>
  {
    try {
      await navigator.clipboard.writeText(JSON.stringify(this.trueJson, null, 2));
      this.copied = true;
      setTimeout(() => {
        this.copied = false;
      }, 2000);

      return true;
    } catch (err) {
      console.error('Failed to copy:', err);
      return false;
    }
  }
}

JsonEditor.defineComponent();

export { JsonEditor };