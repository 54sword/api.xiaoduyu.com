import xss from 'xss';

export default function(str: string): string {

  if (str) {
    
    str = decodeURIComponent(str);

    str = xss(str, {
      whiteList: {
        a: ['href', 'title', 'target', 'rel'],
        img: ['src', 'alt'],
        p: [], div: [], br: [], blockquote: [], li: [], ol: [], ul: [],
        strong: [], em: [], u: [], pre: [], b: [], h1: [], h2: [], h3: [],
        h4: [], h5: [], h6: [], h7: [], video: []
      },
      stripIgnoreTag: true,
    });

  }

  return str;

}
