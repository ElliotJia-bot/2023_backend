const userModel = require('../models/user')
const pagination = require('../utils/pagination')
const { toObjectId } = require('../utils/map')
const lodash = require('lodash')

class UserDao {
  async findUserWithRoleId({ account, password, role_id }) {
    return await userModel.findOne({
      account,
      password,
      role_id,
      delete_status: 0,
    })
  }

  // 根据手机号(账户)查询个人信息
  async findUserByAccount(account) {
    return await userModel.findOne({ account, delete_status: 0 }, { password: 0, delete_status: 0 })
  }

  // 创建账户   6.16直接调用createuser来传递注册数据
  async createUser(userInfo) {
    return await userModel.create({
      ...userInfo,
    })
  }


  // 激活账户
  // 虽然你的原始代码没有显式创建会话对象，但 MongoDB 会自动隐式创建一个会话对象并执行数据库操作。
  async updateActivationStatus(account, session) {
    const res = await userModel.findOneAndUpdate( // 用于在数据库中找到并更新一条数据记录
      { account, delete_status: 0 }, // 第一个参数：一个查询条件，用于指定要更新的记录
      { $bit: { activation_status: { xor: 1 } } }, // 第二个参数：用于指定要对记录进行的更新操作，此处是对activation_status字段进行1的异或操作，即取反
      {
        session, // 第三个参数：用于指定一些额外的选项，这里是MongoDB 事务中的会话对象
      }
    )
    return res
  }
  // 会将所有包含符合条件的activation_status字段都更新，如果只想更新某个特定数据库的特定集合，可以用下面的方法：
  // 假设有两个数据库 db1 和 db2，它们都有一个名为 users 的集合，并且这个集合中有一个名为 name 的字段，可以通过如下方式来更新 db1 数据库中的 name 字段：
  // db.db1.users.findOneAndUpdate({ name: 'John' }, { $set: { name: 'Mike' } })

  // 当在 MongoDB 中使用事务时，必须先创建一个会话对象，并将该会话对象传递给执行事务的函数，
  // 以确保所有的操作都在同一个会话中执行。这样可以确保事务操作的原子性和一致性。

  // 软删账户
  async updateDeleteStatus(account, session) {
    // find不到，返回null
    return await userModel.findOneAndUpdate(
      { account },
      {
        delete_status: 1,
      },
      {
        session,
      }
    )
  }

  // 更新账户信息
  async updateUser({ account, user_name, password, new_account, role_id }, session) {
    return await userModel.findOneAndUpdate(
      { account },
      {
        user_name,
        password,
        role_id,
        account: new_account,
      },
      { session }
    )
  }

  // 根据用户id查找个人信息
  async findUserById(user_id) {
    return await userModel.findById(user_id)
  }

  //联表查询用户对应角色信息
  async findUserRoleInfo(account) {
    return await userModel.findOne({ account }).populate('role_id')
  }

  // 查询用户列表(分页)
  async findUserList({
    account,
    department, // 暂不做数据过滤
    activation_status,
    role_id,
    delete_status = 0,
    size,
    page,
  }) {
    const matchPip = { // mongo的聚合查询，前为数据库中的字段名，后为需要匹配的值
      delete_status: { $eq: delete_status }, // 普通相等
      account: { $regex: account }, // 使用正则匹配的原因是为了使用户在部分输入的时候就可以查询到想要的结果，从而减少用户操作，提升用户好感度
    }
    if (!lodash.isNil(activation_status)) matchPip.activation_status = activation_status // 判断传入的激活状态是否为空或undefined并设置matchPip里面的激活状态
    if (!lodash.isEmpty(role_id)) matchPip.role_id = { $eq: toObjectId(role_id) } // 判断传入的role_id是否为空字符串，否则变成mongoDB里面用的objectID形式传入matchPip的role_id中

    return await pagination({ // 分页操作函数
      model: userModel, // 当前集合 另：userModel 是一个 Mongoose 模型，用于在 Node.js 应用程序中操作 MongoDB 数据库中的用户数据
      matchPip,
      listPip: [
        {
          $lookup: {
            from: 'roles',  // 关联集合（数据库里面的名称）
            localField: 'role_id', // 当前集合用于查询的字段名（传入的名称）
            foreignField: '_id', // 关联集合用于查询的字段名
            as: 'role', // 将查询到的结果（所有匹配的文档）放于role字段中，并在每个关联文档中加上这个字段
          },
        },
      ],
      options: { size, page },
    })
  }

  // 获取指定用户的权限列表
  async findUserPermissionList(account) {
    const aggregateQuery = [ // 定义一个数组aggregateQuery，该数组包含了一些MongoDB聚合管道操作，用于查询一个用户的权限列表
      {
        $match: {
          account: { $regex: account },
        }, // 匹配账号（正则匹配，可以在全部输入之前找到想要的结果）
      },
      {
        $lookup: {
          from: 'roles',
          localField: 'role_id',
          foreignField: '_id',
          as: 'role',
        }, // 从roles集合里面，通过_id字段和传入的role_id字段的匹配查询，将查询到的结果放入role列表中
      },
      // {
      //   $unwind: '$role.permission_ids'
      // },
      {
        $lookup: {
          from: 'permissions',
          localField: 'role.permission_ids',
          foreignField: '_id',
          as: 'permissions',
        }, // 从permissions集合里面，通过_id字段和传入的role.permission_ids字段的匹配查询，将查询到的结果放入permissions列表中
      },
    ]
    const [result] = await userModel.aggregate(aggregateQuery) // 实际的聚合查询
    return result.permissions // 将结果的permissions字段提取出来
  }

  // 添加虚拟奖励
  addVPrice = async ({ account, role_id, v_price }, session) => {
    const result = await userModel.findOneAndUpdate(
      { account, role_id },
      {
        v_price: { $inc: { v_price } },
      },
      { session }
    )
    return result
  }
}

const userDao = new UserDao()

module.exports = userDao
