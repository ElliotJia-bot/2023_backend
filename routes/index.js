const fs = require('fs')

// 后续创建route也无需在index目录中手动添加
const autoLoadRoute = (blacklist = ['index.js'], whitelist = []) => {
  const fileList = fs.readdirSync('routes')
  return fileList
    .filter(
      (fileName) =>
        !blacklist.includes(fileName) || whitelist.includes(fileName)
    )
    .map((fileName) => fileName.split('.').shift())
    .reduce(
      (res, item) => ({
        ...res,
        [item]: require(`./${item}`),
      }),
      {}
    )
}

const routeStores = autoLoadRoute()

const loadRouter = (
  expressInstance,
  routes = routeStores,
  publicPath = '/api'
) =>
  Object.values(routes).forEach((router) =>
    expressInstance?.use(publicPath, router)
  )

module.exports = {
  loadRouter,
  routeStores,
}
