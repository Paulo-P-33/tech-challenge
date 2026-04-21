import { ValidationError } from '../shared/errors';

export type CategoryId = string;

export interface CategoryProps {
  id: CategoryId;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Category {
  private props: CategoryProps;

  private constructor(props: CategoryProps) {
    this.props = props;
  }

  static create(
    props: Omit<CategoryProps, 'createdAt' | 'updatedAt'> &
      Partial<Pick<CategoryProps, 'createdAt' | 'updatedAt'>>,
  ): Category {
    if (!props.name?.trim()) throw new ValidationError('Category.name is required');
    const now = new Date();
    return new Category({
      id: props.id,
      name: props.name.trim(),
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
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }
}

