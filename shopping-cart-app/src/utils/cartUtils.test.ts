
import { describe, it, expect } from 'vitest';
import {
  calculateItemTotal,
  calculateSubtotal,
  calculateDiscount,
  calculateTax,
  calculateTotal,
  formatCurrency,
  isValidQuantity,
  type CartItem,
} from './cartUtils';

// Tests the calculation of an individual cart item's total.
describe('calculateItemTotal', () => {
  it('should multiply the item price by its quantity', () => {
    // Arrange: Create a cart item with a price of $10 and quantity of 3.
    const item: CartItem = {
      id: 1,
      name: 'Book',
      price: 10,
      quantity: 3,
    };

    // Assert: The expected total is $30.
    expect(calculateItemTotal(item)).toBe(30);
  });

  it('should return zero when the quantity is zero', () => {
    const item: CartItem = {
      id: 1,
      name: 'Book',
      price: 10,
      quantity: 0,
    };

    // A zero quantity should produce a zero total.
    expect(calculateItemTotal(item)).toBe(0);
  });

  it('should handle decimal prices', () => {
    const item: CartItem = {
      id: 1,
      name: 'Pen',
      price: 2.5,
      quantity: 4,
    };

    // toBeCloseTo is useful when testing floating-point calculations.
    expect(calculateItemTotal(item)).toBeCloseTo(10);
  });
});

// Tests subtotal calculations for different cart contents.
describe('calculateSubtotal', () => {
  it('should calculate the subtotal of multiple items', () => {
    // Arrange: Create a cart containing two different products.
    const items: CartItem[] = [
      { id: 1, name: 'Book', price: 10, quantity: 2 },
      { id: 2, name: 'Pen', price: 5, quantity: 3 },
    ];

    // The subtotal should be (10 * 2) + (5 * 3) = $35.
    expect(calculateSubtotal(items)).toBe(35);
  });

  it('should return zero for an empty cart', () => {
    // An empty array represents a cart with no products.
    expect(calculateSubtotal([])).toBe(0);
  });

  it('should handle a cart containing one item', () => {
    const items: CartItem[] = [
      { id: 1, name: 'Notebook', price: 8, quantity: 2 },
    ];

    expect(calculateSubtotal(items)).toBe(16);
  });
});

// Tests discount calculations and the boundaries of each discount tier.
describe('calculateDiscount', () => {
  it('should return no discount when the subtotal is below $50', () => {
    expect(calculateDiscount(49.99)).toBe(0);
  });

  it('should apply a 5% discount when the subtotal is exactly $50', () => {
    // Tests the lower boundary of the 5% discount tier.
    expect(calculateDiscount(50)).toBeCloseTo(2.5);
  });

  it('should apply a 5% discount when the subtotal is between $50 and $100', () => {
    expect(calculateDiscount(75)).toBeCloseTo(3.75);
  });

  it('should apply a 10% discount when the subtotal is exactly $100', () => {
    // Tests the boundary where the discount increases from 5% to 10%.
    expect(calculateDiscount(100)).toBeCloseTo(10);
  });

  it('should apply a 10% discount when the subtotal exceeds $100', () => {
    expect(calculateDiscount(200)).toBeCloseTo(20);
  });

  it('should return zero for a zero or negative subtotal', () => {
    // Edge cases: Neither value qualifies for a discount.
    expect(calculateDiscount(0)).toBe(0);
    expect(calculateDiscount(-10)).toBe(0);
  });
});

// Tests the calculation of sales tax.
describe('calculateTax', () => {
  it('should calculate 8% tax on an amount', () => {
    expect(calculateTax(100)).toBeCloseTo(8);
  });

  it('should return zero tax when the amount is zero', () => {
    expect(calculateTax(0)).toBe(0);
  });

  it('should calculate tax on decimal amounts', () => {
    expect(calculateTax(52.25)).toBeCloseTo(4.18);
  });
});

// Tests the final cart total, including discounts and taxes.
describe('calculateTotal', () => {
  it('should calculate the total without a discount', () => {
    const items: CartItem[] = [
      { id: 1, name: 'Book', price: 20, quantity: 1 },
    ];

    // $20 subtotal + $1.60 tax = $21.60.
    expect(calculateTotal(items)).toBe(21.6);
  });

  it('should calculate the total with a 5% discount', () => {
    const items: CartItem[] = [
      { id: 1, name: 'Book', price: 55, quantity: 1 },
    ];

    // $55 subtotal - $2.75 discount + $4.18 tax = $56.43.
    expect(calculateTotal(items)).toBe(56.43);
  });

  it('should calculate the total with a 10% discount', () => {
    const items: CartItem[] = [
      { id: 1, name: 'Laptop', price: 100, quantity: 1 },
    ];

    // $100 subtotal - $10 discount + $7.20 tax = $97.20.
    expect(calculateTotal(items)).toBe(97.2);
  });

  it('should return zero for an empty cart', () => {
    expect(calculateTotal([])).toBe(0);
  });

  it('should round the final total to two decimal places', () => {
    const items: CartItem[] = [
      { id: 1, name: 'Item', price: 10.333, quantity: 1 },
    ];

    const total = calculateTotal(items);

    // Verify that the final result has been rounded to two decimal places.
    expect(total).toBe(Number(total.toFixed(2)));
  });
});

// Tests the formatting of numerical values as currency strings.
describe('formatCurrency', () => {
  it('should format a whole number with two decimal places', () => {
    expect(formatCurrency(10)).toBe('$10.00');
  });

  it('should format a decimal number as currency', () => {
    expect(formatCurrency(12.5)).toBe('$12.50');
  });

  it('should round to two decimal places', () => {
    expect(formatCurrency(9.999)).toBe('$10.00');
  });

  it('should format zero as currency', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('should format negative amounts', () => {
    expect(formatCurrency(-5)).toBe('$-5.00');
  });
});

// Tests the validation of product quantities.
describe('isValidQuantity', () => {
  it('should return true for a positive integer', () => {
    expect(isValidQuantity(1)).toBe(true);
    expect(isValidQuantity(5)).toBe(true);
  });

  it('should return false for zero', () => {
    expect(isValidQuantity(0)).toBe(false);
  });

  it('should return false for a negative number', () => {
    expect(isValidQuantity(-3)).toBe(false);
  });

  it('should return false for a decimal number', () => {
    expect(isValidQuantity(2.5)).toBe(false);
  });

  it('should return false for NaN', () => {
    expect(isValidQuantity(NaN)).toBe(false);
  });

  it('should return false for Infinity', () => {
    expect(isValidQuantity(Infinity)).toBe(false);
  });
});