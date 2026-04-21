import { ValidationError } from '../shared/errors';

export type ProductId = string;

export interface Money {
  currency: 'BRL' | 'USD' | 'EUR';
  amount: number; // integer cents
}

export interface ProductProps {
  id: ProductId;
  name: string;
  categoryId: string;
  price: Money;
  createdAt: Date;
  updatedAt: Date;
}

export class Product {
  private props: ProductProps;

  private constructor(props: ProductProps) {
    this.props = props;
  }

  static create(
    props: Omit<ProductProps, 'createdAt' | 'updatedAt'> &
      Partial<Pick<ProductProps, 'createdAt' | 'updatedAt'>>,
  ): Product {
    if (!props.name?.trim())
      throw new ValidationError('Product.name is required');
    if (!props.categoryId?.trim())
      throw new ValidationError('Product.categoryId is required');
    if (!Number.isInteger(props.price?.amount) || props.price.amount < 0) {
      throw new ValidationError(
        'Product.price.amount must be an integer >= 0 (cents)',
      );
    }

    const now = new Date();
    return new Product({
      id: props.id,
      name: props.name.trim(),
      categoryId: props.categoryId,
      price: props.price,
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
  get categoryId() {
    return this.props.categoryId;
  }
  get price() {
    return this.props.price;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }
}
