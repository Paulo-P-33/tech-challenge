import { ValidationError } from '../shared/errors';

export type FavoriteTargetType = 'product' | 'category';

export interface FavoriteProps {
  userId: string;
  targetType: FavoriteTargetType;
  targetId: string;
  createdAt: Date;
}

export class Favorite {
  private readonly props: FavoriteProps;

  private constructor(props: FavoriteProps) {
    this.props = props;
  }

  static create(
    props: Omit<FavoriteProps, 'createdAt'> &
      Partial<Pick<FavoriteProps, 'createdAt'>>,
  ): Favorite {
    if (!props.userId?.trim())
      throw new ValidationError('Favorite.userId is required');
    if (props.targetType !== 'product' && props.targetType !== 'category') {
      throw new ValidationError('Favorite.targetType must be product|category');
    }
    if (!props.targetId?.trim())
      throw new ValidationError('Favorite.targetId is required');

    return new Favorite({
      userId: props.userId,
      targetType: props.targetType,
      targetId: props.targetId,
      createdAt: props.createdAt ?? new Date(),
    });
  }

  get userId() {
    return this.props.userId;
  }
  get targetType() {
    return this.props.targetType;
  }
  get targetId() {
    return this.props.targetId;
  }
  get createdAt() {
    return this.props.createdAt;
  }
}
