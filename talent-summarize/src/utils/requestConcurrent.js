export class Limit {
  constructor(n) {
    this.limit = n
    this.queue = []
    this.count = 0
  }

  enqueue(fn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject })
    })
  }

  dequeue() {
    if (this.count < this.limit && this.queue.length) {
      const { fn, resolve, reject } = this.queue.shift()
      this.run(fn).then(resolve, reject)
    }
  }

  async run(fn) {
    try {
      this.count++
      const value = await fn()
      return value // 假如value不是Promise async会把返回包装成Promise
    } catch (error) {
      return Promise.reject(error)
    } finally {
      this.count--
      this.dequeue()
    }
  }

  build(fn) {
    if (this.count < this.limit) {
      return this.run(fn)
    } else {
      return this.enqueue(fn)
    }
  }

  restart() {
    this.queue.length = 0
    this.count = 0
    this.promiselist.length = 0
  }
}

// list 是各个的参数 
export function map(list, fn, { limitNum }) {
  const limit = new Limit(limitNum)
  return Promise.all(list.map(...args => limit.build(() => fn(...args))))

}
