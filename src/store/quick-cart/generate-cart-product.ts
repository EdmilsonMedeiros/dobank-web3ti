import { CartItem, Product, ProductColor } from '@/types';

interface GenerateCartProductInput extends Product {
  color?: ProductColor;
  size?: number;
}

export function generateCartProduct(product: GenerateCartProductInput): CartItem {
  return {
    id: product.id,
    name: product.title,
    slug: product.slug,
    description: product.description,
    image: product.thumbnail,
    color: product.color ?? null,
    price: product.price,
    salePrice: product.sale_price,
    quantity: 1,
    size: product.size ?? 0,
    stock: 100, // This could be dynamic based on your needs
    discount: 0, // This could be calculated based on price and sale_price
  };
} 