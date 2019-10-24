
// 遮盖部分文本，123456789 => 12*****89
export default function(str: string) {

  var length = str.length
  var s = ''

  if (length == 1) {
    return '*'
  } else if (length == 2) {
    return str.substring(0,1)+'*'
  } else if (length <= 5) {
    var l = 1
  } else {
    var l = 2
  }

  var _str = str.substring(l,length-l)
  var _s = ''
  for (var i = 0, max = _str.length; i < max; i++) {
    _s += '*'
  }

  return str.replace(_str,_s);

}