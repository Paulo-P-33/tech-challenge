import type { User } from '../../../core/users/user.entity';

export function presentUser(user: User) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar
      ? `data:image/jpeg;base64,${user.avatar.toString('base64')}`
      : null,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}
