export type UseCaseContext<Input> = {
  userInfo: {
    userId: bigint
    displayName: string
  }
  chatInfo: {
    chatId: bigint
  }
  input: Input
}
