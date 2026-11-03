
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ShoppingCart } from './ShoppingCart';

// Restore mocked functions after each test.
afterEach(() => {
  vi.restoreAllMocks();
});

// Tests the shopping cart through simulated user interactions.
describe('ShoppingCart', () => {
  it('should display an empty cart when first rendered', () => {
    // Render the component into the simulated browser environment.
    render(<ShoppingCart />);

    // Verify that the heading and empty cart message are displayed.
    expect(
      screen.getByRole('heading', { name: 'Shopping Cart' })
    ).toBeInTheDocument();

    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
  });

  it('should add a product to the cart', async () => {
    const user = userEvent.setup();
    render(<ShoppingCart />);

    // Enter product information and click the Add to Cart button.
    await user.type(screen.getByLabelText('Product name'), 'Notebook');
    await user.type(screen.getByLabelText('Product price'), '5');

    await user.click(screen.getByRole('button', { name: 'Add to Cart' }));

    // Verify that the new product appears in the cart.
    expect(screen.getByText('Notebook')).toBeInTheDocument();
    expect(screen.getByText('$5.00')).toBeInTheDocument();
    expect(screen.queryByText('Your cart is empty')).not.toBeInTheDocument();
  });

  it('should trim whitespace from a product name', async () => {
    const user = userEvent.setup();
    render(<ShoppingCart />);

    // Enter a product name with extra spaces.
    await user.type(screen.getByLabelText('Product name'), '  Notebook  ');
    await user.type(screen.getByLabelText('Product price'), '5');

    await user.click(screen.getByRole('button', { name: 'Add to Cart' }));

    // Verify that leading and trailing spaces are removed.
    expect(screen.getByText('Notebook')).toBeInTheDocument();
    expect(screen.queryByText('  Notebook  ')).not.toBeInTheDocument();
  });

  it('should clear the input fields after adding a product', async () => {
    const user = userEvent.setup();
    render(<ShoppingCart />);

    const nameInput = screen.getByLabelText('Product name');
    const priceInput = screen.getByLabelText('Product price');

    await user.type(nameInput, 'Notebook');
    await user.type(priceInput, '5');

    await user.click(screen.getByRole('button', { name: 'Add to Cart' }));

    // The component should reset both inputs after a successful addition.
    expect(nameInput).toHaveValue('');
    expect(priceInput).toHaveValue('');
  });

  it('should not add a product when the name is empty', async () => {
    const user = userEvent.setup();
    render(<ShoppingCart />);

    await user.type(screen.getByLabelText('Product price'), '5');
    await user.click(screen.getByRole('button', { name: 'Add to Cart' }));

    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
  });

  it('should not add a product when the name contains only whitespace', async () => {
    const user = userEvent.setup();
    render(<ShoppingCart />);

    await user.type(screen.getByLabelText('Product name'), '   ');
    await user.type(screen.getByLabelText('Product price'), '5');

    await user.click(screen.getByRole('button', { name: 'Add to Cart' }));

    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
  });

  it('should not add a product when the price is empty', async () => {
    const user = userEvent.setup();
    render(<ShoppingCart />);

    await user.type(screen.getByLabelText('Product name'), 'Notebook');
    await user.click(screen.getByRole('button', { name: 'Add to Cart' }));

    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
  });

  it('should reject a product with a zero price', async () => {
    const user = userEvent.setup();
    render(<ShoppingCart />);

    await user.type(screen.getByLabelText('Product name'), 'Notebook');
    await user.type(screen.getByLabelText('Product price'), '0');

    await user.click(screen.getByRole('button', { name: 'Add to Cart' }));

    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
  });

  it('should reject a product with a negative price', async () => {
    const user = userEvent.setup();
    render(<ShoppingCart />);

    await user.type(screen.getByLabelText('Product name'), 'Notebook');
    await user.type(screen.getByLabelText('Product price'), '-5');

    await user.click(screen.getByRole('button', { name: 'Add to Cart' }));

    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
  });

  it('should add multiple products to the cart', async () => {
    const user = userEvent.setup();
    render(<ShoppingCart />);

    // Mock Date.now() so each product receives a unique, predictable ID.
    vi.spyOn(Date, 'now')
      .mockReturnValueOnce(1001)
      .mockReturnValueOnce(1002);

    // Add the first product.
    await user.type(screen.getByLabelText('Product name'), 'Notebook');
    await user.type(screen.getByLabelText('Product price'), '10');
    await user.click(screen.getByRole('button', { name: 'Add to Cart' }));

    // Add the second product.
    await user.type(screen.getByLabelText('Product name'), 'Pen');
    await user.type(screen.getByLabelText('Product price'), '5');
    await user.click(screen.getByRole('button', { name: 'Add to Cart' }));

    // Both products should appear in the cart.
    expect(screen.getByText('Notebook')).toBeInTheDocument();
    expect(screen.getByText('Pen')).toBeInTheDocument();
  });

  it('should remove an individual product from the cart', async () => {
    const user = userEvent.setup();
    render(<ShoppingCart />);

    // Add a product before attempting to remove it.
    await user.type(screen.getByLabelText('Product name'), 'Notebook');
    await user.type(screen.getByLabelText('Product price'), '5');
    await user.click(screen.getByRole('button', { name: 'Add to Cart' }));

    await user.click(screen.getByRole('button', { name: 'Remove' }));

    // Verify that the product is gone and the cart is empty again.
    expect(screen.queryByText('Notebook')).not.toBeInTheDocument();
    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
  });

  it('should update the quantity of a product', async () => {
    const user = userEvent.setup();
    render(<ShoppingCart />);

    await user.type(screen.getByLabelText('Product name'), 'Notebook');
    await user.type(screen.getByLabelText('Product price'), '20');
    await user.click(screen.getByRole('button', { name: 'Add to Cart' }));

    const quantityInput = screen.getByLabelText('Quantity for Notebook');

    // Change the quantity from 1 to 3.
    await user.clear(quantityInput);
    await user.type(quantityInput, '3');

    // Verify the quantity and the recalculated subtotal.
    expect(quantityInput).toHaveValue(3);
    expect(screen.getByText('Subtotal: $60.00')).toBeInTheDocument();
  });

  it('should not allow a quantity of zero', async () => {
    const user = userEvent.setup();
    render(<ShoppingCart />);

    await user.type(screen.getByLabelText('Product name'), 'Notebook');
    await user.type(screen.getByLabelText('Product price'), '10');
    await user.click(screen.getByRole('button', { name: 'Add to Cart' }));

    const quantityInput = screen.getByLabelText('Quantity for Notebook');

    // Attempt to change the quantity to zero.
    await user.clear(quantityInput);
    await user.type(quantityInput, '0');

    // The original quantity should remain unchanged.
    expect(quantityInput).toHaveValue(1);
    expect(screen.getByText('Subtotal: $10.00')).toBeInTheDocument();
  });

  it('should retain the previous quantity when the input is cleared', async () => {
    const user = userEvent.setup();
    render(<ShoppingCart />);

    await user.type(screen.getByLabelText('Product name'), 'Notebook');
    await user.type(screen.getByLabelText('Product price'), '10');
    await user.click(screen.getByRole('button', { name: 'Add to Cart' }));

    const quantityInput = screen.getByLabelText('Quantity for Notebook');

    // Clearing the input produces an invalid quantity.
    await user.clear(quantityInput);

    // The component should reject the invalid value.
    expect(quantityInput).toHaveValue(1);
    expect(screen.getByText('Subtotal: $10.00')).toBeInTheDocument();
  });

  it('should calculate subtotal, discount, tax, and total correctly', async () => {
    const user = userEvent.setup();
    render(<ShoppingCart />);

    await user.type(screen.getByLabelText('Product name'), 'Notebook');
    await user.type(screen.getByLabelText('Product price'), '55');
    await user.click(screen.getByRole('button', { name: 'Add to Cart' }));

    // Verify all four financial calculations for a $55 purchase.
    expect(screen.getByText('Subtotal: $55.00')).toBeInTheDocument();
    expect(screen.getByText('Discount: -$2.75')).toBeInTheDocument();
    expect(screen.getByText('Tax: $4.18')).toBeInTheDocument();
    expect(screen.getByText('Total: $56.43')).toBeInTheDocument();
  });

  it('should recalculate the total when the quantity changes', async () => {
    const user = userEvent.setup();
    render(<ShoppingCart />);

    await user.type(screen.getByLabelText('Product name'), 'Notebook');
    await user.type(screen.getByLabelText('Product price'), '20');
    await user.click(screen.getByRole('button', { name: 'Add to Cart' }));

    const quantityInput = screen.getByLabelText('Quantity for Notebook');

    // Increase the quantity to three, making the subtotal $60.
    await user.clear(quantityInput);
    await user.type(quantityInput, '3');

    // Verify that the discount, tax, and final total are recalculated.
    expect(screen.getByText('Subtotal: $60.00')).toBeInTheDocument();
    expect(screen.getByText('Discount: -$3.00')).toBeInTheDocument();
    expect(screen.getByText('Tax: $4.56')).toBeInTheDocument();
    expect(screen.getByText('Total: $61.56')).toBeInTheDocument();
  });

  it('should clear all products from the cart', async () => {
    const user = userEvent.setup();
    render(<ShoppingCart />);

    await user.type(screen.getByLabelText('Product name'), 'Notebook');
    await user.type(screen.getByLabelText('Product price'), '5');
    await user.click(screen.getByRole('button', { name: 'Add to Cart' }));

    // Click Clear Cart to remove all products at once.
    await user.click(screen.getByRole('button', { name: 'Clear Cart' }));

    // Verify that the empty cart message returns.
    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
    expect(screen.queryByText('Notebook')).not.toBeInTheDocument();
  });
});