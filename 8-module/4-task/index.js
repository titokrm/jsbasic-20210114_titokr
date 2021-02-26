import createElement from '../../assets/lib/create-element.js';
import escapeHtml from '../../assets/lib/escape-html.js';

import Modal from '../../7-module/2-task/index.js';

export default class Cart {
  cartItems = []; // [product: {...}, count: N]

  constructor(cartIcon) {
    this.cartIcon = cartIcon;

    this.addEventListeners();

  }

  addProduct(product) {
    // ваш код
    
    let indexProductInCart = this.cartItems.findIndex(item => item.product.id === product.id );

    if (indexProductInCart > -1) {
      this.cartItems[indexProductInCart].count ++;
    } else {
      this.cartItems.push({product, count: 1});
      indexProductInCart = this.cartItems.length - 1;
    }

    this.onProductUpdate(this.cartItems[indexProductInCart]);
  }

  updateProductCount(productId, amount) {
    // ваш код
    let indexProductInCart = this.cartItems.findIndex(item => item.product.id === productId );
    let cartItem;

    if (indexProductInCart > -1) {
      this.cartItems[indexProductInCart].count += amount;
      cartItem = this.cartItems[indexProductInCart];
      if (this.cartItems[indexProductInCart].count === 0) {
        this.cartItems.splice(indexProductInCart, 1);
      }
    }

    this.onProductUpdate(cartItem);
  }

  isEmpty() {
    // ваш код
    return (this.cartItems.length === 0) ? true : false;
  }

  getTotalCount() {
    // ваш код
    let count = 0;
    this.cartItems.forEach(item => count += item.count);
    return count;
  }

  getTotalPrice() {
    // ваш код
    let price = 0;
    this.cartItems.forEach(item => price += item.product.price * item.count);
    return price;
  }

  renderProduct(product, count) {
    return createElement(`
    <div class="cart-product" data-product-id="${
      product.id
    }">
      <div class="cart-product__img">
        <img src="/assets/images/products/${product.image}" alt="product">
      </div>
      <div class="cart-product__info">
        <div class="cart-product__title">${escapeHtml(product.name)}</div>
        <div class="cart-product__price-wrap">
          <div class="cart-counter">
            <button type="button" class="cart-counter__button cart-counter__button_minus">
              <img src="/assets/images/icons/square-minus-icon.svg" alt="minus">
            </button>
            <span class="cart-counter__count">${count}</span>
            <button type="button" class="cart-counter__button cart-counter__button_plus">
              <img src="/assets/images/icons/square-plus-icon.svg" alt="plus">
            </button>
          </div>
          <div class="cart-product__price">€${product.price.toFixed(2)}</div>
        </div>
      </div>
    </div>`);
  }

  renderOrderForm() {
    return createElement(`<form class="cart-form" name="order">
      <h5 class="cart-form__title">Delivery</h5>
      <div class="cart-form__group cart-form__group_row">
        <input name="name" type="text" class="cart-form__input" placeholder="Name" required value="Santa Claus">
        <input name="email" type="email" class="cart-form__input" placeholder="Email" required value="john@gmail.com">
        <input name="tel" type="tel" class="cart-form__input" placeholder="Phone" required value="+1234567">
      </div>
      <div class="cart-form__group">
        <input name="address" type="text" class="cart-form__input" placeholder="Address" required value="North, Lapland, Snow Home">
      </div>
      <div class="cart-buttons">
        <div class="cart-buttons__buttons btn-group">
          <div class="cart-buttons__info">
            <span class="cart-buttons__info-text">total</span>
            <span class="cart-buttons__info-price">€${this.getTotalPrice().toFixed(
              2
            )}</span>
          </div>
          <button type="submit" class="cart-buttons__button btn-group__button button">order</button>
        </div>
      </div>
    </form>`);
  }

  renderModal() {
    // ...ваш код
    if (!this.isEmpty()) {
      this.bodyModalCart = document.createElement('div');
      for (let cartItem of this.cartItems) {
        this.bodyModalCart.append(this.renderProduct(cartItem.product, cartItem.count));        
      }
      this.orderForm = this.renderOrderForm();
      this.orderForm.addEventListener('submit', this.onSubmit);
      this.bodyModalCart.append(this.orderForm);
      this.bodyModalCart.addEventListener('click', this.bodyCartClick);
      this.modal = new Modal();
      this.modal.setBody(this.bodyModalCart);
      this.modal.setTitle('Your order');
      this.modal.open();      
    }

  }

  bodyCartClick = (event) => {
    let target = event.target;
    let clickTarget = target.closest('.cart-counter__button_plus');
    if (clickTarget) {
      let productId = clickTarget.closest('.cart-product').dataset.productId;

      this.updateProductCount(productId, 1);
      this.bodyModalCart.querySelector('.cart-buttons__info-price').innerText = '€'+this.getTotalPrice().toFixed(2);
      
    }
    clickTarget = target.closest('.cart-counter__button_minus');
    if (clickTarget) {
      let productId = clickTarget.closest('.cart-product').dataset.productId;

      this.updateProductCount(productId, -1);
      if (clickTarget.closest('.cart-product').querySelector('.cart-counter__count').innerText === '0') {
        clickTarget.closest('.cart-product').remove();
      }
      if (this.isEmpty()) {
        this.modal.close();
      } else {
        this.bodyModalCart.querySelector('.cart-buttons__info-price').innerText = '€'+this.getTotalPrice().toFixed(2);
      }
    }
  }

  onProductUpdate(cartItem) {
    // ...ваш код
    //debugger;
    this.cartIcon.update(this);
    if (document.querySelector('body.is-modal-open')) {
      let productCount = this.bodyModalCart.querySelector(`[data-product-id="${cartItem.product.id}"] .cart-counter__count`);
      productCount.innerText = cartItem.count;
      let productPrice = this.bodyModalCart.querySelector(`[data-product-id="${cartItem.product.id}"] .cart-product__price`);
      let totalPriceProduct = cartItem.product.price * cartItem.count;
      productPrice.innerText = '€'+totalPriceProduct.toFixed(2);
    }
  }

  onSubmit = async (event) => {
    // ...ваш код
        event.preventDefault();
        this.orderForm.querySelector('button[type="submit"]').classList.add('is-loading');

        let response = await fetch('https://httpbin.org/post', {
          method: 'POST',
          body: new FormData(this.orderForm)
        });

        let result = await response.json();

        this.cartItems.length = 0;
        console.log(result, this.getTotalPrice());
        this.bodyModalCart = document.createElement('div');
        this.bodyModalCart.className = 'modal__body-inner';
        this.bodyModalCart.innerHTML = `<p>
          Order successful! Your order is being cooked :) <br>
          We’ll notify you about delivery time shortly.<br>
          <img src="/assets/images/delivery.gif">
        </p>`;
        this.modal.setBody(this.bodyModalCart);
        this.modal.setTitle('Success!');
        this.cartIcon.update(this);        
  };

  addEventListeners() {
    this.cartIcon.elem.onclick = () => this.renderModal();
  }
}