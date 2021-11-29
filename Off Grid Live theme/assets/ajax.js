const defaults = {
    cartModal: '.js-ajax-cart-modal', // classname
    cartModalContent: '.js-ajax-cart-modal-content', // classname
    cartModalClose: '.js-ajax-cart-modal-close', // classname
    cartDrawer: '.js-ajax-cart-drawer', // classname
    cartDrawerContent: '.js-ajax-cart-drawer-content', // classname
    cartDrawerClose: '.js-ajax-cart-drawer-close', // classname
    cartDrawerTrigger: '.js-ajax-cart-drawer-trigger', // classname
    cartOverlay: '.js-ajax-cart-overlay', // classname
    cartCounter: '.js-ajax-cart-counter', // classname
    addToCart: '.js-ajax-add-to-cart', // classname
    removeFromCart: '.js-ajax-remove-from-cart', //classname
    removeFromCartNoDot: 'js-ajax-remove-from-cart', //classname,
    checkoutButton: '.js-ajax-checkout-button',
};

const cartModal = document.querySelector(defaults.cartModal);
const cartModalContent = document.querySelector(defaults.cartModalContent);
const cartModalClose = document.querySelector(defaults.cartModalClose);
const cartDrawer = document.querySelector(defaults.cartDrawer);
const cartDrawerContent = document.querySelector(defaults.cartDrawerContent);
const cartDrawerClose = document.querySelector(defaults.cartDrawerClose);
const cartDrawerTrigger = document.querySelector(defaults.cartDrawerTrigger);
const cartOverlay = document.querySelector(defaults.cartOverlay);
const cartCounter = document.querySelector(defaults.cartCounter);
const addToCart = document.querySelectorAll(defaults.addToCart);
let removeFromCart = document.querySelectorAll(defaults.removeFromCart);
const checkoutButton = document.querySelector(defaults.checkoutButton);
const htmlSelector = document.documentElement;

for (let i = 0; i < addToCart.length; i++) {

    addToCart[i].addEventListener('click', function(event) {

        event.preventDefault();
        const formID = this.parentNode.getAttribute('id');
        console.log(formID);

        addProductToCart(formID);

    });

}

function addProductToCart(formID) {
    $.ajax({
        type: 'POST',
        url: '/cart/add.js',
        dataType: 'json',
        data: $('#' + formID)
            .serialize(),
        success: addToCartOk,
        error: addToCartFail,
    });
}

function fetchCart() {
    $.ajax({
        type: 'GET',
        url: '/cart.js',
        dataType: 'json',
        success: function(cart) {
            onCartUpdate(cart);

            if (cart.item_count === 0) {
                cartDrawerContent.innerHTML = 'Cart is empty';
                checkoutButton.classList.add('is-hidden');
            } else {
                renderCart(cart);
                checkoutButton.classList.remove('is-hidden');
            }

        },
    });
}

function changeItem(line, callback) {
    const quantity = 0;
    $.ajax({
        type: 'POST',
        url: '/cart/change.js',
        data: 'quantity=' + quantity + '&line=' + line,
        dataType: 'json',
        success: function(cart) {
            if ((typeof callback) === 'function') {
                callback(cart);
            } else {
                onCartUpdate(cart);
                fetchCart();
                removeProductFromCart();
            }
        },
    });
}

function onCartUpdate(cart) {
    console.log('items in the cart?', cart.item_count);
  $('.cart-value').html(cart.item_count);
}

function addToCartOk(product) {
  openAddModal();
    openCartOverlay();
    fetchCart();
    cartModalContent.innerHTML = product.title + ' was added to the cart!';
    cartCounter.innerHTML = Number(cartCounter.innerHTML) + 1;
    
}

function removeProductFromCart() {
    cartCounter.innerHTML = Number(cartCounter.innerHTML) - 1;
}

function addToCartFail() {
    cartModalContent.innerHTML = 'The product you are trying to add is out of stock.';
    openAddModal();
    openCartOverlay();
}

function renderCart(cart) {

    console.log(cart);

    clearCartDrawer();

    cart.items.forEach(function(item, index) {

        //console.log(item.title);
        //console.log(item.image);
        //console.log(item.line_price);
        //console.log(item.quantity);

        const productTitle = '<div class="ajax-cart-item__title">' + item.title + '</div>';
        const productImage = '<img class="ajax-cart-item__image" src="' + item.image + '" >';
        const productPrice = '<div class="ajax-cart-item__price">' + item.line_price + '</div>';
        const productQuantity = '<div class="ajax-cart-item__quantity">' + item.quantity + '</div>';
        const productRemove = '<div class="ajax-cart-item__remove ' + defaults.removeFromCartNoDot + '"></div>';

        const concatProductInfo = '<div class="ajax-cart-item__single" data-line="' + Number(index + 1) + '">' + productTitle + productImage + productPrice + productQuantity + productRemove + '</div>';

        cartDrawerContent.innerHTML = cartDrawerContent.innerHTML + concatProductInfo;

    });

    // document.querySelectorAll('.js-ajax-remove-from-cart')
    //     .forEach((element) => {
    //         element.addEventListener('click', function() {
    //             const lineID = this.parentNode.getAttribute('data-line');
    //             console.log('aa');
    //         });
    //     });

    removeFromCart = document.querySelectorAll(defaults.removeFromCart);

    for (let i = 0; i < removeFromCart.length; i++) {
        removeFromCart[i].addEventListener('click', function() {
            const line = this.parentNode.getAttribute('data-line');
            console.log(line);
            changeItem(line);
        });
    }

}

function openCartDrawer() {
    cartDrawer.classList.add('is-open');
}

function closeCartDrawer() {
    cartDrawer.classList.remove('is-open');
}

function clearCartDrawer() {
    cartDrawerContent.innerHTML = '';
}

function openAddModal() {
    cartModal.classList.add('is-open');
}

function closeAddModal() {
    cartModal.classList.remove('is-open');
}

function openCartOverlay() {
    cartOverlay.classList.add('is-open');
    htmlSelector.classList.add('is-locked');
}

function closeCartOverlay() {
    cartOverlay.classList.remove('is-open');
    htmlSelector.classList.remove('is-locked');
}

cartModalClose.addEventListener('click', function() {
    closeAddModal();
    closeCartOverlay();
});

cartDrawerClose.addEventListener('click', function() {
    closeCartDrawer();
    closeCartOverlay();
});
// cart is empty stanje
cartOverlay.addEventListener('click', function() {
    closeAddModal();
    closeCartDrawer();
    closeCartOverlay();
});

cartDrawerTrigger.addEventListener('click', function(event) {
    event.preventDefault();
    //fetchCart();
    openCartDrawer();
    openCartOverlay();
});

document.addEventListener('DOMContentLoaded', function() {
    fetchCart();
});