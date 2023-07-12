const DEFAULT = {
  page: 1,
  size: 10,
}
/**
 * @params { model, matchPip, listPip, options = DEFAULT }
 * @model 用于聚合查询的模型
 * @matchPip 过滤方法
 * @listPip 聚合方法
 * @options 分页参数
 */
// 分页场景
const pagination = async ({ model, matchPip, listPip, options = DEFAULT }) => {
  const { page = DEFAULT.page, size = DEFAULT.size } = options // 设置分页信息
  const [data] = await model?.aggregate?.([ // 运用mongoDB的聚合查询
    {
      $match: matchPip, // 首先，使用 $match 操作符对查询进行筛选，以过滤出符合 matchPip 参数条件的文档
    },
    {
      $facet: { // 然后，使用 $facet 操作符来对查询结果进行分面处理。$facet 操作符将查询结果拆分成多个子管道，在同一个查询中返回多个聚合结果
        list: [...listPip, { $skip: (page - DEFAULT.page) * size }, { $limit: size }], // 实现分页效果，实际数据存储位置，可能存在多个符合条件的文档
        // $skip 操作符用于跳过指定数量的文档，而 $limit 操作符用于限制返回的文档数量
        // [...listPip, { $skip: (page - DEFAULT.page) * size }, { $limit: size }] 中的 ...listPip 用于将 listPip 数组中的所有元素展开，
        // 并将它们作为新数组的一部分。这样，就可以将 $skip 和 $limit 对象添加到新数组的末尾，从而实现分页查询的效果。
        count: [
          {
            $count: 'count', // count 子管道使用 $count 操作符来统计文档数量，并将结果保存在 count 字段中
          },
        ],
      },
    },
    {
      $unwind: '$count', // 使用 $unwind 操作符对 count 字段进行展开，以便在后续操作中可以直接引用 count 字段的值
    },
    {
      $project: {
        count: '$count.count', // 前面的count为count管道，后面的count为count管道里面的count字段
        list: '$list',
      }, // 使用 $project 操作符将查询结果进行投影操作，将 list 和 count 放在同一个对象中返回
    },
  ])
  const { list = [], count = 0 } = data ?? {} // ??的用法是如果左边的数据为null或者undefined则返回右边的数据
  return { list, count } 
  // 最后，从查询结果中提取 list 和 count 字段的值，
  // 并将它们作为对象返回。如果查询结果为空或为 null 或 undefined，则将 list 和 count 分别设置为一个空数组和 0
}

module.exports = pagination
