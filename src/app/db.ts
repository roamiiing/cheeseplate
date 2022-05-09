import { PrismaClient } from '@prisma/client'

const prismaClient = new PrismaClient()

export const getUsernamesWithTags = async (tags: string[]) => {
  const existing = await prismaClient.tag.findMany({
    select: {
      usernames: true,
    },
    where: {
      tag: {
        in: tags,
      },
    },
  })

  if (!existing) return []

  return existing
    .map(v => v.usernames)
    .flat()
    .filter((v, i, a) => a.indexOf(v) === i)
}

export type SetTagForUsernameResult = {
  newlyInserted: boolean
}

export const setTagForUsername = async (
  username: string,
  tag: string,
): Promise<SetTagForUsernameResult> => {
  const alreadyHas = await prismaClient.tag.findFirst({
    where: {
      tag,
      usernames: {
        has: username,
      },
    },
  })

  if (alreadyHas) {
    return {
      newlyInserted: false,
    }
  }

  await prismaClient.tag.upsert({
    where: {
      tag,
    },
    update: {
      usernames: {
        push: username,
      },
    },
    create: {
      usernames: [username],
      tag,
    },
  })

  return {
    newlyInserted: true,
  }
}

export type DeleteTagForUsernameResult = {
  deleted: boolean
}

export const deleteTagForUsername = async (username: string, tag: string) => {
  const alreadyHas = await prismaClient.tag.findFirst({
    where: {
      tag,
      usernames: {
        has: username,
      },
    },
  })

  if (!alreadyHas) {
    return {
      deleted: false,
    }
  }

  await prismaClient.tag.update({
    where: {
      tag,
    },
    data: {
      usernames: alreadyHas.usernames.filter(u => u !== username),
    },
  })

  return {
    deleted: true,
  }
}
