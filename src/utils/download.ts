
import request from 'request'
import fs from 'fs'

interface Download {
  uri: string,
  dir: string,
  filename: string
}

export default function({ uri, dir, filename}:Download):Promise<any> {
  return new Promise(resolve=>{
    request.head(uri, function(err: any, res: any, body: any){
      var stream = request(uri).pipe(fs.createWriteStream(dir + "/" + filename))
      stream.on('finish', resolve)
    })
  })
}