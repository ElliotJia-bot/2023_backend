const { OK, Fail } = require('../result')
const cryptoInstance = require('../crypto')
// require 是 Node.js 中用于加载模块的函数。它通常用于加载其他 JavaScript 文件、第三方库或内置模块，并将其导入到当前模块中，以便在当前模块中使用

const wrapper = (handler) => async (req, res, next) => {
  try {
    const response = await handler?.(req, res, next)
    // 统一的成功处理
    const result = new OK({
      data: response,
      msg: '操作成功',
    })
    const encryptData = cryptoInstance.encryptByAES(JSON.stringify(result), res.AESKey) // 加密功能
    // 这里的 res.AESKey 是一个加密密钥，它也可能是从其他地方注入进来的。这个密钥用于在客户端和服务器之间进行加密通信，以保障数据的安全性和隐私性
    // res.send(encryptData) // 发送加密后的结果
    res.send(result) // 明文传输（测试用）
  } catch (error) { // 统一的失败处理
    const errorResult = new Fail({
      msg: error.message,
    })
    res.send(errorResult)
  }
}
// 这个新的函数接受三个参数：req、res 和 next，用于包装一个处理函数，以实现统一的异常处理和响应格式，同时具有加密响应的功能

module.exports = wrapper
