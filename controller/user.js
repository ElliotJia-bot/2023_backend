const userService = require('../services/user')
const desensitize = require('../utils/desensitize')

class UserController {
  getUserList = async (req) => {
    const { role_id = '', activation_status, account = '', size, page } = req.query
    const result = await userService.getUserList({
      role_id,
      activation_status,
      account,
      size,
      page,
    })
    return desensitize(result) // 脱敏技术
  }

  createUser = async (req) => {
    const { user_name, password, account } = req.body // 解构赋值
    const result = await userService.createUser({ user_name, password, account })
    return desensitize(result)
  }

  deleteUser = async (req) => {
    const { account } = req.body
    const result = await userService.deleteUser({ account })
    return desensitize(result)
  }

  updateUser = async (req) => {
    const { account, user_name = null, password = null, new_account, role_id = null } = req.body
    const result = await userService.updateUser({
      account,
      user_name,
      password,
      new_account,
      role_id,
    })
    return desensitize(result)
  }

  // 这段代码中的req参数来自于Express.js框架，它是登录状态下系统自动保存的参数，用于获取请求的查询参数
  getUserPermissionList = async (req) => {
    const { my_account } = req.query // 解构赋值，将req.query对象中名为my_account的属性赋值给my_account参数
    // 通过使用 : 来指定新的变量名，你可以将任何属性值赋值给任意变量名。
    return await userService.findUserPermissionList(my_account)
  }
  // req.query 是一个对象，它包含了客户端通过 URL 查询字符串（query string）传递过来的参数。主要用于 GET 请求方法（无参数）

  setActivationStatus = async (req) => {
    const { account } = req.body // 解构赋值，将req.body对象中名为account的属性赋值给account参数
    const result = await userService.setActivationStatus(account)
    return desensitize(result)
  }
  // req.body获取通过请求体（request body）传递的参数，常用于 POST、PUT、DELETE 等请求方法
  // req.query 中的参数值都是字符串类型，而 req.body 中的参数值可以是任意类型，例如字符串、JSON 对象、二进制数据等
}

const userController = new UserController()

module.exports = userController
