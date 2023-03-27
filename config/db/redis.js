const redis = require('redis')

const _ = redis.createClient({
  socket: {
    port: process.env.REDIS_CONFIG_PORT,
    host: process.env.REDIS_CONFIG_HOST,
  },
  password: process.env.REDIS_CONFIG_PWD,
})

const connectRedis = (redisClient = _) => {
  redisClient
    .connect()
    .then(() => {
      console.log('Redis 连接成功')
    })
    .catch((err) => {
      console.log('Redis 连接失败。错误信息如下：')
      console.dir(err)
    })
}

module.exports = { connectRedis }
