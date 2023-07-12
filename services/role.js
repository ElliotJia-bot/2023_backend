const roleDao = require('../dao/role')
const _ = require('lodash')
const { setPermissionCache } = require('../redis/permission')
const { toObjectId } = require('../utils/map')

class RoleService {
  /**
   * 添加新角色
   * @param roleInfo
   * @returns
   */
  async createRole({ role_name, permission_ids }) {
    let is_exit = await roleDao.findRoleByName(role_name) // 先判断是否已经存在同名角色
    if (!_.isEmpty(is_exit)) {
      throw new Error('已有该名称的角色，请更换名称')
    } else {
      const _id = toObjectId() // 使用 toObjectId 函数生成一个新的唯一标识符 _id
      const res = await roleDao.createRole({ role_name, permission_ids, _id: toObjectId(_id) }) // 实际创建角色
      const permissions = await roleDao.getPermissions(_id) // 查询该角色对应的权限信息
      setPermissionCache(permissions, _id.toString()) // 调用 setPermissionCache 函数将权限信息更新到缓存中
      return res
    }
  }

  /**
   * 删除角色（软删）
   * @param role_id
   * @returns
   */
  async deleteRole(role_id) {
    const result = await roleDao.findRoleById(role_id)
    if (_.isEmpty(result)) {
      throw new Error('没有该角色')
    }
    if (result.delete_status) {
      throw new Error('该角色已经被删除')
    } else {
      return await roleDao.deleteRole(role_id)
    }
  }

  /**
   * 更新角色
   * @param {*} param
   * @returns
   */
  async updateRole({ role_id, role_name, permission_ids }) {
    const res = await roleDao.updateRole({ role_id, role_name, permission_ids })
    const permissions = await roleDao.getPermissions(role_id)
    setPermissionCache(permissions, role_id)
    return res
  }

  /**
   * 查询角色信息
   * @param role_id
   * @returns
   */
  async findRole(role_id) {
    return await roleDao.findRoleById(role_id)
  }

  /**
   * 查询角色所有的权限信息
   * @param role_id
   * @returns
   */
  async findRolePermissionInfo(role_id) {
    return await roleDao.findRolePermissionInfo(role_id)
  }

  getRoleList = async ({ role_id, permission_ids, size, page }) => await roleDao.getRoleList({ role_id, permission_ids, size, page })

  getRoleLabelAndValue = async () => {
    const daoData = await roleDao.getRoleLabelAndValue()
    return daoData.map(({ role_name, _id }) => ({ label: role_name, value: _id.toString() }))
    // 对该数组使用 map 方法进行转换，将每个角色信息对象转换为一个 { label, value } 对象。
    // 其中，label 属性值为角色名称 role_name，value 属性值为角色信息的唯一标识 _id 转换为字符串类型的值。
    // 最终，该函数返回一个包含所有角色信息的 { label, value } 对象数组
  }
}

const roleService = new RoleService()

module.exports = roleService
