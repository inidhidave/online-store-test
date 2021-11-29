const defaults = {
    cartModal: '.js-ajax-cart-modal',
    cartModalContent: '.js-ajax-cart-modal-content',
    cartModalClose: '.js-ajax-cart-modal-close',
    cartDrawer: '.js-ajax-cart-drawer',
    cartDrawerContent: '.js-ajax-cart-drawer-content',
    cartDrawerClose: '.js-ajax-cart-drawer-close',
    cartDrawerTrigger: '.js-ajax-cart-drawer-trigger',
    cartOverlay: '.js-ajax-cart-overlay',
  	cartCounter: '.js-cart-items-counter',
    addToCart: '.js-ajax-add-to-cart',
    removeFromCart: '.js-ajax-remove-from-cart',
    removeFromCartNoDot: 'js-ajax-remove-from-cart',
    checkoutButton: '.js-ajax-checkout-button',
  	cartButton: '.go-to-cart',
    collectionButton: '.go-to-collection'
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
const cartButton = document.querySelector(defaults.cartButton);
const collectionButton = document.querySelector(defaults.collectionButton);
const htmlSelector = document.documentElement;


for (let i = 0; i < addToCart.length; i++) {
  addToCart[i].addEventListener('click', function(event) {        
    event.preventDefault();
    const formID = this.parentNode.getAttribute('id');
    addProductToCart(formID);
  });
}

function addProductToCart(formID) {
    $.ajax({
        type: 'POST',
        url: '/cart/add.js',
        dataType: 'json',
        data: $('#' + formID).serialize(),
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
            jQuery('.cy_tlt').html(theme.Currency.formatMoney(cart.total_price, theme.moneyFormat));
            if (cart.item_count === 0) {
                cartDrawerContent.innerHTML = 'Cart is empty';
                checkoutButton.classList.add('is-hidden');
                collectionButton.classList.remove('is-hidden');
                cartButton.classList.add('is-hidden');
            } else {
                renderCart(cart);
                checkoutButton.classList.remove('is-hidden');
              	cartButton.classList.remove('is-hidden');
              	collectionButton.classList.add('is-hidden');
            }
        },
    });
}

function changeItem(line, callback) {
    const quantity = 0;
  console.log('line >>>>>>', line);
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
  cartCounter.innerHTML = Number(cart.item_count);
}

function addToCartOk(product) {
    cartModalContent.innerHTML = product.title + ' was added to the cart!';
    $('.js-ajax-cart-counter').removeClass('cart_hidden');
    cartCounter.innerHTML = Number(cartCounter.innerHTML) + 1;
    setTimeout(function() {
        openCartDrawer();
    }, 300);
    openCartOverlay();
    fetchCart();
}

function removeProductFromCart() {
    cartCounter.innerHTML = Number(cartCounter.innerHTML) - 1;
}

function addToCartFail() {
    cartModalContent.innerHTML = '<div class="error_msg_qty">The requested quantity is out of stock.</div>';
    openAddModal();
    openCartOverlay();
}

function renderCart(cart) {
  console.log(cart);
  clearCartDrawer();
  let concatProductInfo = '';
  cart.items.forEach(function(item, index) {
    const productTitle = '<div class="ajax-cart-item__title">' + item.title + '</div>';
    const productImage = '<div class="ajax-cart-item__image"><img class="ajax-cart-item__image" src="' + item.image + '" ></div>';
    const productPrice = '<div class="ajax-cart-item__price">' + theme.Currency.formatMoney(item.line_price, theme.moneyFormat) + '</div>';
    //       const productInput = '<div class="product-form__controls-group cv_cart_quantity"><div class="product-form__item">' + '<input type="button" value="-" class="qtyminus" field="quantity" data-minplus="' + item.key + '" />' + ' <input type="number" data-qty-cart-update="' + item.id + '" id="updates_large_' + item.key + '" data-val-qty="' + item.key + '" name="quantity" value="' + item.quantity + '" min="0" class=" cart__qty-input product-form__input cv_input" pattern="[0-9]*" data-quantity-item="' + index + '"> ' + '<input type="button" value="+" class="qtyplus" field="quantity" data-minplus="' + item.key + '" /> ' + '</div></div>';
    const productInput ='<div class="product-form__controls-group"><div class="product-form__item cv_cart_quantity"><input type="button" value="-" class="qtyminus btn btn-info-minus" field="quantity" data-minplus="' + item.key + '" /><input type="number" data-qty-cart-update="' + item.id + '" id="updates_large_' + item.key + '" data-val-qty="' + item.key + '" name="quantity" value="' + item.quantity + '" min="0" class=" cart__qty-input product-form__input cv_input" pattern="[0-9]*" data-quantity-item="' + index + '" readonly ><input type="button" value="+" class="qtyplus btn btn-info-plus" field="quantity" data-minplus="' + item.key + '" /> </div></div>';
   	const productQuantity = '<div class="ajax-cart-item__quantity">' + item.quantity + '</div>'; 
    const productRemove = '<div class="ajax-cart-item__remove ' + defaults.removeFromCartNoDot + '"></div>';      
    concatProductInfo +=  '<div class="ajax-cart-item__single row_'+ item.id + ' " data-line="' + Number(index + 1) + '">' + productImage + productQuantity + productTitle + productInput + productPrice + productRemove + '</div>'; 
  });

  const productSubtotal = '<div class="cart-subtotal"><span class="cart-subtotal__title">Subtotal</span><span class="cart-subtotal__price sub-totle" data-cart-subtotal>'+theme.Currency.formatMoney(cart.items_subtotal_price, theme.moneyFormat)+'</span></div>';
  cartDrawerContent.innerHTML = cartDrawerContent.innerHTML + concatProductInfo + productSubtotal; 
  
  removeFromCart = document.querySelectorAll(defaults.removeFromCart);
  for (let i = 0; i < removeFromCart.length; i++) {
    removeFromCart[i].addEventListener('click', function() {
      const line = this.parentNode.getAttribute('data-line');
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
cartOverlay.addEventListener('click', function() {
    closeAddModal();
    closeCartDrawer();
    closeCartOverlay();
});
cartDrawerTrigger.addEventListener('click', function(event) {
    event.preventDefault();
    openCartDrawer();
    openCartOverlay();
});
document.addEventListener('DOMContentLoaded', function() {
    fetchCart();
});

// Quantity Management of cart
$('body').on('click', '.cv_cart_quantity .qtyplus', function(e) {
    var input_val_key = $(this).attr('data-minplus');
    var currentVal = parseInt($("[data-val-qty='" + input_val_key + "']").val());
    if (!isNaN(currentVal)) {
        $("[data-val-qty='" + input_val_key + "']").val(currentVal + 1);
    } else {
        $("[data-val-qty='" + input_val_key + "']").val(0);
    }
    e.preventDefault();
    var cus_done = "";
    jQuery("input[data-qty-cart-update]").each(function() {
        cus_done += "updates[" + $(this).attr('data-qty-cart-update') + "]=" + $(this).val() + "&";
    });
    $.ajax({
        type: 'POST',
        url: '/cart/update.js',
        data: cus_done,
        dataType: 'json',
        success: function(data) {
            console.log("suceess data", data);
            jQuery('.cy_tlt').html(theme.Currency.formatMoney(data.total_price, theme.moneyFormat));
            console.log('updated data >>>>>>>>>', data)
            if (data) {
              console.log('data.logs', data.status)
                $.each(data.items, function(key, value) {
                    var main_string_price = data.items[key].final_price;
                    var main_sting_final_line_price = data.items[key].final_line_price;
//                   console.log('main_sting_final_line_price', main_sting_final_line_price)
                  	var cart_subtotal_updated_price = data.items_subtotal_price;
//                   var inputCountVal = data.items[key].quantity;
                  	var productQty = data.items[key].quantity;
                    $(".row_" + data.items[key].id + " .ajax-cart-item__price").html(theme.Currency.formatMoney(main_sting_final_line_price, theme.moneyFormat));
                    $('[data-cart-subtotal]').html(theme.Currency.formatMoney(cart_subtotal_updated_price, theme.moneyFormat));
                  $('.cart_data_row_' + data.items[key].id + ' .per_item_total_qty_price').html(theme.Currency.formatMoney(main_sting_final_line_price, theme.moneyFormat));
                    $('.row_' + data.items[key].id + ' .ajax-cart-item__quantity').html(productQty);
                  $('.cart_data_row_' + data.items[key].id + ' input[name="quantity"]').val(productQty);
                  $('.cart_page_subtotal_price').html(theme.Currency.formatMoney(cart_subtotal_updated_price, theme.moneyFormat));
                  	var up_items = data.item_count;
                    cartCounter.innerHTML = Number(up_items);
                });
            }
            return true;
        },
    });
    return false;
});
$('body').on('click', '.cv_cart_quantity .qtyminus', function(e) {
    var input_val_key = $(this).attr('data-minplus');
    var currentVal = parseInt($("[data-val-qty='" + input_val_key + "']").val());
    if (!isNaN(currentVal) && currentVal > 1) {
        $("[data-val-qty='" + input_val_key + "']").val(currentVal - 1);
    } else {
        $("[data-val-qty='" + input_val_key + "']").val(1);
    }
    e.preventDefault();
    var cus_done = "";
    jQuery("input[data-qty-cart-update]").each(function() {
        cus_done += "updates[" + $(this).attr('data-qty-cart-update') + "]=" + $(this).val() + "&";
    });
    $.ajax({
        type: 'POST',
        url: '/cart/update.js',
        data: cus_done,
        dataType: 'json',
        success: function(data) {
            console.log("suceess data", data);
            jQuery('.cy_tlt').html(theme.Currency.formatMoney(data.total_price, theme.moneyFormat));
            console.log(data.currency)
            if (data) {
                $.each(data.items, function(key, value) {
                    var main_string_price = data.items[key].final_price;
                  	var cart_subtotal_updated_price = data.items_subtotal_price;
                    var main_sting_final_line_price = data.items[key].final_line_price;
//                   console.log('main_sting_final_line_price', main_sting_final_line_price)
//                   var inputCountVal = data.items[key].quantity;
                  	var productQty = data.items[key].quantity;
                    $(".row_" + data.items[key].id + " .ajax-cart-item__price").html(theme.Currency.formatMoney(main_sting_final_line_price, theme.moneyFormat));
                  	$('[data-cart-subtotal]').html(theme.Currency.formatMoney(cart_subtotal_updated_price, theme.moneyFormat));
                  $('.cart_data_row_' + data.items[key].id + ' .per_item_total_qty_price').html(theme.Currency.formatMoney(main_sting_final_line_price, theme.moneyFormat));
                    $('.row_' + data.items[key].id + ' .ajax-cart-item__quantity').html(productQty);
                  $('.cart_data_row_' + data.items[key].id + ' input[name="quantity"]').val(productQty);
                  $('.cart_page_subtotal_price').html(theme.Currency.formatMoney(cart_subtotal_updated_price, theme.moneyFormat));
                    var down_items = data.item_count;
                    cartCounter.innerHTML = Number(down_items);
                });
            }
            return true;
        },
    });
    return false;
});




jQuery('.qty_plus').each(function(e) {
  jQuery(this).on('click',function(){
    var $qty = $(this).closest('.product-form__item').find('.product-form__input');
    var currentVal = parseInt($qty.val());
    if (!isNaN(currentVal)) {      
      $qty.val(currentVal + 1);      
    } else {
      $qty.val(1);
    }
    
//     e.preventDefault();
      var cus_done = "";
      jQuery("input[data-qty-cart-page-update]").each(function() {
          cus_done += "updates[" + $(this).attr('data-qty-cart-page-update') + "]=" + $(this).val() + "&";
      });
      console.log('cus_done', cus_done)
      $.ajax({
          type: 'POST',
          url: '/cart/update.js',
          data: cus_done,
          dataType: 'json',
          success: function(data) {
              console.log("suceess data", data);
              jQuery('.cy_tlt').html(theme.Currency.formatMoney(data.total_price, theme.moneyFormat));
              console.log(data.currency)
              if (data) {
                  $.each(data.items, function(key, value) {
                      var main_string_price = data.items[key].final_price;
                      var cart_subtotal_updated_price = data.items_subtotal_price;
                      var main_sting_final_line_price = data.items[key].final_line_price;
                      var inputCountVal = data.items[key].quantity;
  //                   console.log('main_sting_final_line_price', main_sting_final_line_price)
                      var productQty = data.items[key].quantity;
                      $(".row_" + data.items[key].id + " .ajax-cart-item__price").html(theme.Currency.formatMoney(main_sting_final_line_price, theme.moneyFormat));
                    	$('.cart_data_row_' + data.items[key].id + ' .per_item_total_qty_price').html(theme.Currency.formatMoney(main_sting_final_line_price, theme.moneyFormat));
                      $('[data-cart-subtotal]').html(theme.Currency.formatMoney(cart_subtotal_updated_price, theme.moneyFormat));
                    $('.cart_page_subtotal_price').html(theme.Currency.formatMoney(cart_subtotal_updated_price, theme.moneyFormat));
                      $('.row_' + data.items[key].id + ' .ajax-cart-item__quantity').html(productQty);
                    $(".row_" + data.items[key].id + " input[data-qty-cart-update]").val(inputCountVal);
                      var up_items = data.item_count;
                      cartCounter.innerHTML = Number(up_items);
                  });
              }
              return true;
          },
      });
      return false;
    
  });
});
jQuery('.qty_minus').each(function() {
  jQuery(this).on('click',function(){
    var $qty=$(this).closest('.product-form__item').find('.product-form__input');
    var currentVal = parseInt($qty.val());
    if (!isNaN(currentVal) && currentVal > 1) {
      $qty.val(currentVal - 1);
    } else {
      $qty.val(1);
    }
    
    var cus_done = "";
      jQuery("input[data-qty-cart-page-update]").each(function() {
          cus_done += "updates[" + $(this).attr('data-qty-cart-page-update') + "]=" + $(this).val() + "&";
      });
      console.log('cus_done', cus_done)
      $.ajax({
          type: 'POST',
          url: '/cart/update.js',
          data: cus_done,
          dataType: 'json',
          success: function(data) {
              console.log("suceess data", data);
              jQuery('.cy_tlt').html(theme.Currency.formatMoney(data.total_price, theme.moneyFormat));
              console.log(data.currency)
              if (data) {
                  $.each(data.items, function(key, value) {
                      var main_string_price = data.items[key].final_price;
                      var cart_subtotal_updated_price = data.items_subtotal_price;
                      var main_sting_final_line_price = data.items[key].final_line_price;
                    var inputCountVal = data.items[key].quantity;
  //                   console.log('main_sting_final_line_price', main_sting_final_line_price)
                      var productQty = data.items[key].quantity;
                      $(".row_" + data.items[key].id + " .ajax-cart-item__price").html(theme.Currency.formatMoney(main_sting_final_line_price, theme.moneyFormat));
                    	$('.cart_data_row_' + data.items[key].id + ' .per_item_total_qty_price').html(theme.Currency.formatMoney(main_sting_final_line_price, theme.moneyFormat));
                      $('[data-cart-subtotal]').html(theme.Currency.formatMoney(cart_subtotal_updated_price, theme.moneyFormat));
                    $('.cart_page_subtotal_price').html(theme.Currency.formatMoney(cart_subtotal_updated_price, theme.moneyFormat));
                      $('.row_' + data.items[key].id + ' .ajax-cart-item__quantity').html(productQty);
                    $(".row_" + data.items[key].id + " input[data-qty-cart-update]").val(inputCountVal);
                      var up_items = data.item_count;
                      cartCounter.innerHTML = Number(up_items);
                  });
              }
              return true;
          },
      });
      return false;
    
  });
});