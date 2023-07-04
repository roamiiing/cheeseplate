export const jsonToFormData = <T extends Record<string, string | Blob>>(data: T) => {
    const form = new FormData()

    for (const key in data) {
        const value = data[key]
        form.append(key, value)
    }

    return form
}
