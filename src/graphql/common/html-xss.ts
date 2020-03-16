import xss from 'xss'

export default function(str: string): string {

  if (str) {
    
    str = decodeURIComponent(str);

    // 华为A5荣耀，编辑器换行是\n，因此需要转换html的br标签
    str = str.replace(/\n/g,"<br />");
    
    str = xss(str, {
      whiteList: {
        // a: ['href', 'title', 'target', 'rel'],
        img: ['src', 'alt'],
        p: [], div: [], br: [], 
        // blockquote: [], li: [], ol: [], ul: [],
        // strong: [], em: [], u: [], pre: [], b: [], h1: [], h2: [], h3: [],
        // h4: [], h5: [], h6: [], h7: [], video: [], code: []
      },
      stripIgnoreTag: true,
    });

  }

  return str;

}

