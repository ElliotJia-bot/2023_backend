const mongoose = require('mongoose')

const permissionSchema = new mongoose.Schema(
  {
    //权限名字
    permission_name: {
      type: String,
      required: true,
    },
    //权限描述
    description: {
      type: String,
      required: true,
    },
    //权限的父id（主键类型）
    permission_pid: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
    },
    //页面or按钮
    type: {
      type: Number,
      enum: [1, 2], // 1-页面，2-按钮
      required: true,
      default: 1,
    },
    //调用后端接口鉴权使用
    api_route_name: {
      type: String,
    },
    //数据是否删除
    delete_status: {
      type: Number,
      enum: [0, 1],
      default: 0,
    },
    created: {
      type: Number,
    },
    updated: {
      type: Number,
    },
  },
  {
    timestamps: {
      createdAt: 'created',
      updatedAt: 'updated',
    },
  }
)

const permission = mongoose.model('permission', permissionSchema)
// 在 Mongoose 中，Schema 用于定义文档的结构和属性，而 Model 则用于表示在数据库中的集合（collection）和其中的文档（document）。
// 使用 Model 可以对集合进行 CRUD 操作（增删改查），并对文档进行各种查询、修改和删除操作。
// 即schema定义数据库表的结构（组成）和属性（字段类型等），model定义这个数据库表，并可以用于对其进行操作。

module.exports = permission
// 将 permission 变量作为这个模块的输出，使得其他模块可以使用 require 函数来加载这个模块，并访问其中的 permission Model。
