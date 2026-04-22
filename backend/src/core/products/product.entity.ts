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
  image: Buffer | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Product {
  private props: ProductProps;

  private constructor(props: ProductProps) {
    this.props = props;
  }

  static create(
    props: Omit<ProductProps, 'createdAt' | 'updatedAt' | 'image'> &
      Partial<Pick<ProductProps, 'createdAt' | 'updatedAt' | 'image'>>,
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
      image: props.image ?? null,
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
  get image() {
    return this.props.image;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }

  updateImage(data: Buffer | null) {
    this.props.image = data;
    this.props.updatedAt = new Date();
  }
}
