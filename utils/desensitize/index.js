const lodash = require('lodash')
/**
 * 脱敏函数，用于脱敏统一处理
 * 这里只处理密码脱敏，如果有账号脱敏需求可以在这里处理
 * TODO: 这里应该要有一个脱敏名单，做的更加优雅一点，以及是遮盖处理还是删除处理的判断
 */
const desensitizeList = ['password'] // 目前只实现了对密码的脱敏
const desensitize = (result) => {
  // 列表脱敏
  if (!lodash.isNil(result?.list) && lodash.isArray(result?.list)) {
    result.list = result.list.map((ele) => lodash.omit(ele, desensitizeList))
    return result
  } 
  // 如果参数 result 是一个数组（isArray），则使用 map 函数遍历数组中的每个元素，
  // 并使用 omit 函数从元素中删除指定的属性，即 desensitizeList 数组中定义的敏感信息属性。最后返回处理后的列表
  // omit函数介绍：_.omit(object, [paths])，objects表示要进行省略处理的对象，而[paths]表示需要省略的属性/字段

  // 如果是单个对象，对对象内容进行脱敏
  if (lodash.isObject(result) && !lodash.isNil(result.password)) {
    const jsonResult = result.toJSON()
    return lodash.omit(jsonResult, desensitizeList) 
  }
  // 如果参数 result 是一个对象类型（isObject），并且包含 password 属性，则对对象内容进行脱敏处理。
  // 如果参数 result 是一个对象，并且包含 password 属性，则将其转换为 JSON 格式的字符串，然后使用 omit 函数从结果中删除指定的敏感信息属性。

  return result
  // 最后，如果参数 result 不满足列表或对象类型的条件，则直接返回原始的参数值。
}

// 列表脱敏（List Desensitization）是一种数据保护技术，
// 用于隐藏或模糊敏感信息，以保护用户隐私和数据安全。通常在数据展示和查询时使用脱敏技术，以限制未经授权的用户访问敏感数据。

module.exports = desensitize
