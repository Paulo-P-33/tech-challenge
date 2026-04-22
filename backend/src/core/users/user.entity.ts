import { ValidationError } from '../shared/errors';

export type UserId = string;

export type UserRole = 'user' | 'admin';

export interface UserProps {
  id: UserId;
  name: string;
  email: string;
  role: UserRole;
  avatar: Buffer | null;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  private props: UserProps;

  private constructor(props: UserProps) {
    this.props = props;
  }

  static create(
    props: Omit<UserProps, 'createdAt' | 'updatedAt' | 'avatar'> &
      Partial<Pick<UserProps, 'createdAt' | 'updatedAt' | 'avatar'>>,
  ): User {
    if (!props.name?.trim()) throw new ValidationError('User.name is required');
    if (!props.email?.trim())
      throw new ValidationError('User.email is required');
    const email = props.email.trim().toLowerCase();
    if (!email.includes('@'))
      throw new ValidationError('User.email must be a valid email');
    if (props.role !== 'user' && props.role !== 'admin')
      throw new ValidationError('User.role must be user|admin');

    const now = new Date();
    return new User({
      id: props.id,
      name: props.name.trim(),
      email,
      role: props.role,
      avatar: props.avatar ?? null,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
    });
  }

  get id() {
    return this.props.id;
  }
  get name() {
    return this.props.name;
  }
  get email() {
    return this.props.email;
  }
  get role() {
    return this.props.role;
  }
  get avatar() {
    return this.props.avatar;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }

  rename(newName: string) {
    if (!newName?.trim()) throw new ValidationError('User.name is required');
    this.props.name = newName.trim();
    this.props.updatedAt = new Date();
  }

  updateAvatar(data: Buffer | null) {
    this.props.avatar = data;
    this.props.updatedAt = new Date();
  }
}
