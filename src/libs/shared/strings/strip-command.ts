export const stripCommand = (command: string) => (str: string) =>
  str.replace(new RegExp(`${command}\\b`), '')
