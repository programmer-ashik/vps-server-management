export function mapUser(user) {
  return {
    id: String(user?._id ?? user?.id),
    email: user.email,
    name: user.name,
    role: user.role ?? 'user',
    status: user.status ?? 'active',
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}

export function mapUsers(users) {
  return users.map(mapUser)
}
