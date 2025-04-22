document.addEventListener('DOMContentLoaded', () => {
    const cartLink = document.getElementById('cart-link');
    updateCartCount(); // Update count on page load

    // --- Add to Cart ---
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', (event) => {
            const productCard = event.target.closest('.product-card, .product-detail-info'); // Works for card or detail page
            if (!productCard) return;

            const product = {
                id: productCard.dataset.id,
                name: productCard.dataset.name,
                price: parseFloat(productCard.dataset.price),
                img: productCard.dataset.img,
                quantity: 1
            };
            addToCart(product);
        });
    });

    // --- Cart Page Functionality ---
    if (document.getElementById('cart-items')) {
        displayCartItems();
    }

    // --- Checkout ---
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Prevent default form submission
            handleCheckout();
        });
    }
});

// Function to get cart from localStorage
function getCart() {
    return JSON.parse(localStorage.getItem('shoppingCart') || '[]');
}

// Function to save cart to localStorage
function saveCart(cart) {
    localStorage.setItem('shoppingCart', JSON.stringify(cart));
    updateCartCount(); // Update navbar count whenever cart changes
}

// Function to add item to cart
function addToCart(productToAdd) {
    let cart = getCart();
    const existingProductIndex = cart.findIndex(item => item.id === productToAdd.id);

    if (existingProductIndex > -1) {
        // Product exists, increase quantity
        cart[existingProductIndex].quantity += 1;
    } else {
        // New product, add to cart
        cart.push(productToAdd);
    }

    saveCart(cart);
    alert(`${productToAdd.name} đã được thêm vào giỏ hàng!`);
}

// Function to update cart count in navbar
function updateCartCount() {
    const cartLink = document.getElementById('cart-link');
    if (!cartLink) return; // Exit if cart link doesn't exist on the page

    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const countSpan = cartLink.querySelector('.cart-count');

    if (totalItems > 0) {
        if (countSpan) {
            countSpan.textContent = totalItems;
        } else {
            // Create span if it doesn't exist
            const newSpan = document.createElement('span');
            newSpan.classList.add('badge', 'bg-danger', 'ms-1', 'cart-count');
            newSpan.textContent = totalItems;
            cartLink.appendChild(newSpan);
        }
    } else {
        // Remove span if cart is empty
        if (countSpan) {
            cartLink.removeChild(countSpan);
        }
    }
}


// --- Cart Page Specific Functions ---

function displayCartItems() {
    const cart = getCart();
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalContainer = document.getElementById('cart-total');
    const checkoutFormSection = document.getElementById('checkout-form-section');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const cartTable = document.querySelector('.cart-table'); // Get the table itself

    cartItemsContainer.innerHTML = ''; // Clear previous items
    let total = 0;

    if (cart.length === 0) {
        if (emptyCartMessage) emptyCartMessage.classList.remove('d-none');
        if (cartTable) cartTable.classList.add('d-none');
        if (checkoutFormSection) checkoutFormSection.classList.add('d-none');
        if (cartTotalContainer) cartTotalContainer.textContent = '0 VNĐ';
        return; // Stop if cart is empty
    }

    // Cart has items, hide empty message and show table/form
    if (emptyCartMessage) emptyCartMessage.classList.add('d-none');
    if (cartTable) cartTable.classList.remove('d-none');
    if (checkoutFormSection) checkoutFormSection.classList.remove('d-none');


    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="align-middle">
                <img src="${item.img}" alt="${item.name}" class="img-fluid cart-item-img">
                ${item.name}
            </td>
            <td class="align-middle">${item.price.toLocaleString('vi-VN')} VNĐ</td>
            <td class="align-middle">
                <div class="input-group input-group-sm" style="width: 120px;">
                    <button class="btn btn-outline-secondary btn-sm decrease-quantity" data-index="${index}">-</button>
                    <input type="number" class="form-control form-control-sm quantity-input" value="${item.quantity}" min="1" data-index="${index}">
                    <button class="btn btn-outline-secondary btn-sm increase-quantity" data-index="${index}">+</button>
                </div>
            </td>
            <td class="align-middle">${itemTotal.toLocaleString('vi-VN')} VNĐ</td>
            <td class="align-middle">
                <button class="btn btn-danger btn-sm remove-item" data-index="${index}">Xóa</button>
            </td>
        `;
        cartItemsContainer.appendChild(row);
    });

    cartTotalContainer.textContent = `${total.toLocaleString('vi-VN')} VNĐ`;

    // Add event listeners after rows are created
    addCartPageEventListeners();
}

function addCartPageEventListeners() {
    // Remove item
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', (event) => {
            const index = parseInt(event.target.dataset.index);
            removeFromCart(index);
        });
    });

    // Decrease quantity
    document.querySelectorAll('.decrease-quantity').forEach(button => {
        button.addEventListener('click', (event) => {
            const index = parseInt(event.target.dataset.index);
            updateQuantity(index, -1);
        });
    });

    // Increase quantity
    document.querySelectorAll('.increase-quantity').forEach(button => {
        button.addEventListener('click', (event) => {
            const index = parseInt(event.target.dataset.index);
            updateQuantity(index, 1);
        });
    });

    // Quantity input change
    document.querySelectorAll('.quantity-input').forEach(input => {
        input.addEventListener('change', (event) => {
            const index = parseInt(event.target.dataset.index);
            const newQuantity = parseInt(event.target.value);
            if (newQuantity >= 1) {
                updateQuantity(index, 0, newQuantity); // 0 means set directly
            } else {
                // Reset input if invalid value entered
                const cart = getCart();
                event.target.value = cart[index].quantity;
            }
        });
    });
}

function removeFromCart(index) {
    let cart = getCart();
    cart.splice(index, 1); // Remove item at index
    saveCart(cart);
    displayCartItems(); // Re-render the cart
}

function updateQuantity(index, change, absoluteValue = null) {
    let cart = getCart();
    if (index < 0 || index >= cart.length) return; // Index out of bounds

    if (absoluteValue !== null) {
        cart[index].quantity = absoluteValue;
    } else {
        cart[index].quantity += change;
    }

    // Ensure quantity doesn't go below 1
    if (cart[index].quantity < 1) {
        cart[index].quantity = 1;
    }

    saveCart(cart);
    displayCartItems(); // Re-render the cart
}


// --- Checkout and Invoice ---

function handleCheckout() {
    const cart = getCart();
    if (cart.length === 0) {
        alert("Giỏ hàng của bạn đang trống!");
        return;
    }

    // Get customer details
    const customerName = document.getElementById('customer-name').value.trim();
    const customerAddress = document.getElementById('customer-address').value.trim();
    const customerPhone = document.getElementById('customer-phone').value.trim();
    const customerNotes = document.getElementById('customer-notes').value.trim(); // Optional

    // Basic validation
    if (!customerName || !customerAddress || !customerPhone) {
        alert("Vui lòng điền đầy đủ thông tin Họ tên, Địa chỉ và Số điện thoại.");
        return;
    }

    // Generate Invoice
    generateInvoice(cart, {
        name: customerName,
        address: customerAddress,
        phone: customerPhone,
        notes: customerNotes
    });

    // Hide cart and form, show invoice
    document.getElementById('cart-section').classList.add('d-none');
    document.getElementById('checkout-form-section').classList.add('d-none');
    document.getElementById('invoice-section').classList.remove('d-none');

    // Clear the cart after checkout
    localStorage.removeItem('shoppingCart');
    updateCartCount(); // Update navbar count to 0
}

function generateInvoice(cart, customerInfo) {
    const invoiceItemsContainer = document.getElementById('invoice-items');
    const invoiceTotalContainer = document.getElementById('invoice-total');
    const invoiceCustomerName = document.getElementById('invoice-customer-name');
    const invoiceCustomerAddress = document.getElementById('invoice-customer-address');
    const invoiceCustomerPhone = document.getElementById('invoice-customer-phone');
    const invoiceDate = document.getElementById('invoice-date');
    const invoiceNotes = document.getElementById('invoice-notes');


    invoiceItemsContainer.innerHTML = ''; // Clear previous
    let total = 0;

    // Set customer info and date
    invoiceCustomerName.textContent = customerInfo.name;
    invoiceCustomerAddress.textContent = customerInfo.address;
    invoiceCustomerPhone.textContent = customerInfo.phone;
    invoiceDate.textContent = new Date().toLocaleDateString('vi-VN');
    if (customerInfo.notes) {
        invoiceNotes.textContent = customerInfo.notes;
        invoiceNotes.closest('p').classList.remove('d-none'); // Show notes paragraph if present
    } else {
        invoiceNotes.closest('p').classList.add('d-none'); // Hide if no notes
    }


    // Populate items table
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>${item.price.toLocaleString('vi-VN')} VNĐ</td>
            <td>${itemTotal.toLocaleString('vi-VN')} VNĐ</td>
        `;
        invoiceItemsContainer.appendChild(row);
    });

    // Set total
    invoiceTotalContainer.textContent = `${total.toLocaleString('vi-VN')} VNĐ`;
}