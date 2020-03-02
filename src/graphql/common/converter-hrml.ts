import showdown from 'showdown';
import xss from 'xss'

const converter = new showdown.Converter();
converter.setOption('tables', true);
converter.setOption("simpleLineBreaks", true);

export default function (str: string) {

  str = xss(str, {
    whiteList: {
      // a: ['href', 'title', 'target', 'rel'],
      // img: ['src', 'alt'],
      // p: [], div: [], br: [], 
      // blockquote: [], li: [], ol: [], ul: [],
      // strong: [], em: [], u: [], pre: [], b: [], h1: [], h2: [], h3: [],
      // h4: [], h5: [], h6: [], h7: [], video: [], code: []
    },
    stripIgnoreTag: true,
  });

  return converter.makeHtml(str);
}