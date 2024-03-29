import { faker } from '@faker-js/faker'

faker.locale = 'zh_CN'

let GLOBAL_ID = 0

export default new (class {
  get(count: number) {
    const items = []
    for (let i = 0; i < count; i++) {
      const width = 100 + ~~(Math.random() * 50)
      const height = 100
      items[i] = {
        id: ++GLOBAL_ID,
        style: {
          color: this.getRandomColor()
        },
        width,
        height,
        data: {
          number_id: faker.datatype.number(),
          uuid: faker.datatype.uuid(),
          follow: false
        },
        like: false
      }
    }
    return count === 1 ? items[0] : items
  }

  getRandomColor() {
    const colors = [
      'rgba(21,174,103,.5)',
      'rgba(245,163,59,.5)',
      'rgba(255,230,135,.5)',
      'rgba(194,217,78,.5)',
      'rgba(195,123,177,.5)',
      'rgba(125,205,244,.5)'
    ]
    return colors[~~(Math.random() * colors.length)]
  }
})()
