/**
 * 测试用列表项工厂
 */
import { faker } from '@faker-js/faker'

faker.seed(12345)

let idCounter = 0

export interface TestItem {
  id: number
  slug: string
  obj: { key: string }
  [key: string]: unknown
}

export function createItems(count: number): TestItem[] {
  const items: TestItem[] = []
  for (let i = 0; i < count; i++) {
    items.push({
      id: ++idCounter,
      slug: faker.string.alpha(5),
      obj: { key: `value_${i}` }
    })
  }
  return items
}

export function createItem(overrides?: Partial<TestItem>): TestItem {
  const items = createItems(1)
  return { ...items[0], ...overrides }
}

export function resetIdCounter(): void {
  idCounter = 0
}
