
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ShoppingCart } from './ShoppingCart';

// Restore mocked functions after each test.
afterEach(() => {
  vi.restoreAllMocks();
});

// Renders the shopping cart and initializes user interactions.
function renderShoppingCart() {
  const user = userEvent.setup();
  render(<ShoppingCart />);

  return user;
}

// Adds a product to the cart using the product form.
async function addProduct(
  user: ReturnType<typeof userEvent.setup>,
  name: string,
  price: string
) {
  await user.type(screen.getByLabelText('Product name'), name);
  await user.type(screen.getByLabelText('Product price'), price);
  await user.click(screen.getByRole('button', { name: 'Add to Cart' }));
}

// Retrieves the product form inputs.
function getProductInputs() {
  return {
    name: screen.getByLabelText('Product name'),
    price: screen.getByLabelText('Product price'),
  };
}

// Tests the shopping cart through simulated user interactions.
describe('ShoppingCart', () => {
  it('should display an empty cart when first rendered', () => {
    // Render the component into the simulated browser environment.
    renderShoppingCart();

    // Verify that the heading and empty cart message are displayed.
    expect(
      screen.getByRole('heading', { name: 'Shopping Cart' })
    ).toBeInTheDocument();

    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
  });

  it('should add a product to the cart', async () => {
    const user = renderShoppingCart();

    // Enter product information and click the Add to Cart button.
    await addProduct(user, 'Notebook', '5');

    // Verify that the new product appears in the cart.
    expect(screen.getByText('Notebook')).toBeInTheDocument();
    expect(screen.getByText('$5.00')).toBeInTheDocument();
    expect(screen.queryByText('Your cart is empty')).not.toBeInTheDocument();
  });

  it('should trim whitespace from a product name', async () => {
    const user = renderShoppingCart();

    // Enter a product name with extra spaces.
    await addProduct(user, '  Notebook  ', '5');

    // Verify that leading and trailing spaces are removed.
    expect(screen.getByText('Notebook')).toBeInTheDocument();
    expect(screen.queryByText('  Notebook  ')).not.toBeInTheDocument();
  });

  it('should clear the input fields after adding a product', async () => {
    const user = renderShoppingCart();

    const { name: nameInput, price: priceInput } = getProductInputs();

    await user.type(nameInput, 'Notebook');
    await user.type(priceInput, '5');

    await user.click(screen.getByRole('button', { name: 'Add to Cart' }));

    // Verify both inputs are cleared after adding the product.
    expect(nameInput).toHaveValue('');
    expect(priceInput).toHaveValue(null);
  });

  it('should not add a product when the name is empty', async () => {
    const user = renderShoppingCart();
    const { price: priceInput } = getProductInputs();

    await user.type(priceInput, '5');

    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
  });

  it('should not add a product when the name contains only whitespace', async () => {
    const user = renderShoppingCart();
    const { name: nameInput, price: priceInput } = getProductInputs();

    await user.type(nameInput, '   ');
    await user.type(priceInput, '5');

    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
  });

  it('should not add a product when the price is empty', async () => {
    const user = renderShoppingCart();
    const { name: nameInput, price: priceInput } = getProductInputs();

    await user.type(nameInput, 'Notebook');
    await user.type(priceInput, ' ');

    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
  });

  it('should reject a product with a zero price', async () => {
    const user = renderShoppingCart();
    const { name: nameInput, price: priceInput } = getProductInputs();

    await user.type(nameInput, 'Notebook');
    await user.type(priceInput, '0');

    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
  });

  it('should reject a product with a negative price', async () => {
    const user = renderShoppingCart();
    const { name: nameInput, price: priceInput } = getProductInputs();

    await user.type(nameInput, 'Notebook');
    await user.type(priceInput, '-5');

    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
  });

  it('should add multiple products to the cart', async () => {
    const user = renderShoppingCart();

    // Mock Date.now() so each product receives a unique, predictable ID.
    vi.spyOn(Date, 'now')
      .mockReturnValueOnce(1001)
      .mockReturnValueOnce(1002);

    // Add the first product.
    await addProduct(user, 'Notebook', '10');

    // Add the second product.
    await addProduct(user, 'Pen', '5');

    // Both products should appear in the cart.
    expect(screen.getByText('Notebook')).toBeInTheDocument();
    expect(screen.getByText('Pen')).toBeInTheDocument();
  });

  it('should remove an individual product from the cart', async () => {
    const user = renderShoppingCart();

    // Add a product before attempting to remove it.
    await addProduct(user, 'Notebook', '10');

    await user.click(screen.getByRole('button', { name: 'Remove' }));

    // Verify that the product is gone and the cart is empty again.
    expect(screen.queryByText('Notebook')).not.toBeInTheDocument();
    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
  });

  it('should update the quantity of a product', async () => {
    const user = renderShoppingCart();

    await addProduct(user, 'Notebook', '10');

    const quantityInput = screen.getByLabelText('Quantity for Notebook');

    // Change the quantity from 1 to 3.
    await user.clear(quantityInput);
    await user.keyboard('{Control>}a{/Control}3'); // Select all text in the input.

    // Verify the quantity and the recalculated subtotal.
    expect(quantityInput).toHaveValue(3);
    expect(screen.getByText('Subtotal: $30.00')).toBeInTheDocument();
  });

  it('should not allow a quantity of zero', async () => {
    const user = renderShoppingCart();

    await addProduct(user, 'Notebook', '10');

    const quantityInput = screen.getByLabelText('Quantity for Notebook');

    // Attempt to change the quantity to zero.
    await user.clear(quantityInput);
    await user.type(quantityInput, '0');

    // The original quantity should remain unchanged.
    expect(quantityInput).toHaveValue(1);
    expect(screen.getByText('Subtotal: $10.00')).toBeInTheDocument();
  });

  it('should produce an invalid quantity when the input is cleared', async () => {
    const user = renderShoppingCart();
    await addProduct(user, 'Notebook', '10');

    const quantityInput = screen.getByLabelText('Quantity for Notebook');

    await user.clear(quantityInput);

    // Clearing the input currently causes the component to store NaN.
    expect(quantityInput).toHaveAttribute('value', 'NaN');
    expect(screen.getByText('Subtotal: $NaN')).toBeInTheDocument();
  });

  it('should calculate subtotal, discount, tax, and total correctly', async () => {
    const user = renderShoppingCart();

    await addProduct(user, 'Notebook', '55');

    // Verify all four financial calculations for a $55 purchase.
    expect(screen.getByText('Subtotal: $55.00')).toBeInTheDocument();
    expect(screen.getByText('Discount: -$2.75')).toBeInTheDocument();
    expect(screen.getByText('Tax: $4.18')).toBeInTheDocument();
    expect(screen.getByText('Total: $56.43')).toBeInTheDocument();
  });

  it('should recalculate the total when the quantity changes', async () => {
    const user = renderShoppingCart();

    await addProduct(user, 'Notebook', '20');

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
    const user = renderShoppingCart();

    await addProduct(user, 'Notebook', '5');

    // Click Clear Cart to remove all products at once.
    await user.click(screen.getByRole('button', { name: 'Clear Cart' }));

    // Verify that the empty cart message returns.
    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
    expect(screen.queryByText('Notebook')).not.toBeInTheDocument();
  });
});