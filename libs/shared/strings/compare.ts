export const compareDespiteCasing = (a: string, b: string) => {
    return a.toLocaleLowerCase() === b.toLocaleLowerCase()
}
