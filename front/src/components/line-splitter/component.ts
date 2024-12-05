import { RWSView, RWSViewComponent, observable, attr } from '@rws-framework/client';

import { html, ViewTemplate } from '@microsoft/fast-element';

interface ILineInfo {
  content: string,
  found: boolean
}

const returnTag = (cnt: string, found: boolean = true) => {
    return {
        content: cnt,
        found
    };
};

@RWSView('line-splitter')
class LineSplitter extends RWSViewComponent {
  @observable text: string = '';
  @observable content: string | ViewTemplate;

  @attr allowedTags = '';
  @attr addClass = '';

  private allowedHTMLTags: string[] = ['dl', 'dt', 'dd', 'br', 'blockquote', 'span', 'p', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'strong', 'i', 'small', 'u'];

  static makeRegex = (tagName: string): RegExp => {
      return new RegExp(`<${tagName}>(.*?)</${tagName}>`, 'gs');
  };

  static _allowed_tags: { [key: string]: (cnt: string, key: string) => ILineInfo } = {
      'blockquote': (content: string, key: string): ILineInfo => {
          const regex = LineSplitter.makeRegex(key);

          const matches = content.match(regex);
      
          if (matches) {
              console.log('f',matches[0]);
              return returnTag(content.replace(regex, `<${key}><div class="quote-cnt">$1</div></${key}>`));   
          }else{
              return returnTag(content, false);
          }      
      }
  };

  parseTags(line: string): string | ViewTemplate
  {    
      let output: string = line.trim();

      this.allowedHTMLTags = this.allowedHTMLTags.concat(this.allowedTags.split(','));

      output = this.enforceAllowedTags(output);
      output = output.replace(/\n\n/g, '\n');

      // console.log('preparse', line);
      //   let found = false;

      for(const tag in LineSplitter._allowed_tags){             
          const lineInfo: ILineInfo = LineSplitter._allowed_tags[tag](output, tag);

          if(lineInfo.found){        
              output = lineInfo.content;
              //   found = true;
          }
      }    

      output = output.replace(/<.*>([\s\S]*?)<\/.*>/g, (match: string) => {
          return match.replace(/\n/g, '');
      });

      output = output.replace(/\n/g, '<br/>');

      output = output.replace(/<\/p><br\/>/g, '</p>');

      output = output.replace(/<\/h1><br\/>/g, '</h1>');
      output = output.replace(/<\/h2><br\/>/g, '</h2>');
      output = output.replace(/<\/h3><br\/>/g, '</h3>');

      output = output.replace(/<br\/><h1>/g, '<h1>');
      output = output.replace(/<br\/><h2>/g, '<h2>');
      output = output.replace(/<br\/><h3>/g, '<h3>');

      return html`${output}`;
  }

  private enforceAllowedTags(htmlText: string): string
  {
      // Create a regular expression pattern to match HTML tags
      const tagPattern = /<\s*\/?\s*([^\s>/]+)(\s+[^>]*)?>/g;

      // Replace any tags in the htmlText that are not in allowedHTMLTags array
      const sanitizedText = htmlText.replace(tagPattern, (match, tag, attributes) => {
          const lowerCaseTag = tag.toLowerCase();

          if (this.allowedHTMLTags.includes(lowerCaseTag)) {
              return match; // Return the original tag if it's allowed
          } else {
              // Replace the disallowed tag with an empty string
              return '';
          }
      });

      return sanitizedText;
  }

  splitLines(): void
  {    
      this.content = this.parseTags(this.text);    
  }

  textChanged(oldVal: string, newVal: string)
  {    
      if(newVal){
          this.splitLines();
      }
  }

  addClassChanged(oldVal: string, newVal: string)
  {
      if(newVal){
          this.addClass = newVal;
      }
  }
}

LineSplitter.defineComponent();

export { LineSplitter };