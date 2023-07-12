const permissionModel = require('../models/permission')
// 它将会加载一个名为 permission 的模块，并将其中导出的 permission Model 赋值给 permissionModel 变量。

class PermissionDao {
  //添加许可
  async createPermission(permissionInfo) {
    return await permissionModel.create({ ...permissionInfo })
  }

  //删除许可
  async deletePermission(permission_id) {
    return await permissionModel.findByIdAndUpdate(permission_id, {
      delete_status: 1,
    })
  }

  //查询许可
  async findPermissionById(permission_id) {
    return await permissionModel.findById(permission_id)
  }

  //查询所有许可
  //TODO——不需要分页
  async findAllPermission() {
    return await permissionModel.find()
    // .skip((page - 1) * size)
    // .limit(size)
  }
  // find() 是 Mongoose 提供的一个查询方法，用于查询集合中的文档。
  // 在这个例子中，它将返回所有文档的查询结果。如果需要对查询结果进行分页，可以使用 .skip() 和 .limit() 等方法来指定查询的起始位置和返回的文档数量等

  //查询多个许可
  async findPermissionsById(permission_ids) {
    return await permissionModel.find({ _id: { $in: permission_ids } })
  }

  async findPermissionByname(permission_name) {
    return await permissionModel.findOne({ permission_name })
  }
}

const permissionDao = new PermissionDao()

module.exports = permissionDao
