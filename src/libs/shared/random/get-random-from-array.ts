export const getRandomFromArray = <T>(arr: Array<T>) => {
  const index = Math.floor(Math.random() * arr.length)
  return arr[index]
}
