import { getLocalStorage, setLocalStorage } from "./utils.mjs";

export default class ProductDetails {

  constructor(productId, dataSource) {
    this.productId = productId;
    this.product = {};
    this.dataSource = dataSource;
  }

  async init() {
    // use the datasource to get the details for the current product. findProductById will return a promise! use await or .then() to process it
    this.product = await this.dataSource.findProductById(this.productId);
    // the product details are needed before rendering the HTML
    this.renderProductDetails();
    // once the HTML is rendered, add a listener to the Add to Cart button
    // Notice the .bind(this). This callback will not work if the bind(this) is missing. Review the readings from this week on "this" to understand why.
    document
      .getElementById("add-to-cart")
      .addEventListener("click", this.addProductToCart.bind(this));

    // wishlist buttons: toggle and move-to-cart
    const wishlistBtn = document.getElementById("wishlist-btn");
    const wishlistMoveBtn = document.getElementById("wishlist-move");
    if (wishlistBtn) {
      wishlistBtn.addEventListener("click", this.toggleWishlist.bind(this));
    }
    if (wishlistMoveBtn) {
      wishlistMoveBtn.addEventListener("click", this.moveWishlistToCart.bind(this));
    }
    // ensure buttons reflect current product wishlist state
    this.updateWishlistButtons();
  }

  addProductToCart() {
    const cartItems = getLocalStorage("so-cart") || [];
    cartItems.push(this.product);
    setLocalStorage("so-cart", cartItems);
  }

  // wishlist support
  toggleWishlist() {
    const key = "so-wishlist";
    const list = getLocalStorage(key) || [];
    const exists = list.find((p) => String(p.Id) === String(this.product.Id));
    if (exists) {
      const newList = list.filter((p) => String(p.Id) !== String(this.product.Id));
      setLocalStorage(key, newList);
    } else {
      list.push(this.product);
      setLocalStorage(key, list);
    }
    this.updateWishlistButtons();
  }

  moveWishlistToCart() {
    const wishlistKey = "so-wishlist";
    const cartKey = "so-cart";
    const wishlist = getLocalStorage(wishlistKey) || [];
    const newWishlist = wishlist.filter((p) => String(p.Id) !== String(this.product.Id));
    setLocalStorage(wishlistKey, newWishlist);

    const cart = getLocalStorage(cartKey) || [];
    cart.push(this.product);
    setLocalStorage(cartKey, cart);

    // reflect state changes
    this.updateWishlistButtons();
  }

  updateWishlistButtons() {
    const wishlistBtn = document.getElementById("wishlist-btn");
    const wishlistMoveBtn = document.getElementById("wishlist-move");
    const wishlist = getLocalStorage("so-wishlist") || [];
    const inWishlist = wishlist.some((p) => String(p.Id) === String(this.product.Id));
    if (wishlistBtn) {
      wishlistBtn.textContent = inWishlist ? "Remove from Wishlist" : "Add to Wishlist";
      wishlistBtn.setAttribute("aria-pressed", inWishlist ? "true" : "false");
    }
    if (wishlistMoveBtn) {
      wishlistMoveBtn.style.display = inWishlist ? "inline-block" : "none";
    }
  }

  renderProductDetails() {
    productDetailsTemplate(this.product);
  }
}

function productDetailsTemplate(product) {

  // ------- Safe category -------
  const categoryText = product.Category
    ? product.Category.charAt(0).toUpperCase() + product.Category.slice(1)
    : "Product";
  document.querySelector("h2").textContent = categoryText;

  // ------- Safe brand -------
  document.querySelector("#p-brand").textContent =
    product.Brand?.Name || "Unknown Brand";

  // ------- Safe name -------
  document.querySelector("#p-name").textContent =
    product.NameWithoutBrand || product.Name || "Unnamed Product";

  // ------- Safe image -------
  const productImage = document.querySelector("#p-image");
  const imgSrc =
    product.Images?.PrimaryExtraLarge ||
    product.Images?.PrimaryLarge ||
    product.Images?.PrimaryMedium ||
    "images/placeholder.png";

  productImage.src = imgSrc;
  productImage.alt = product.NameWithoutBrand || "product image";

  // ------- Safe price -------
  const euroPrice = new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format((Number(product.FinalPrice) || 0) * 0.85);
  document.querySelector("#p-price").textContent = euroPrice;

  // ------- Safe color -------
  document.querySelector("#p-color").textContent =
    product.Colors?.[0]?.ColorName || "N/A";

  // ------- Safe description -------
  document.querySelector("#p-description").innerHTML =
    product.DescriptionHtmlSimple || "<p>No description available.</p>";

  // ------- Discount logic -------
  const originalPrice = Number(product.SuggestedRetailPrice) || 0;
  const finalPrice = Number(product.FinalPrice) || 0;

  const discountBadgeEl = document.querySelector("#p-discount-badge");
  const discountDetailEl = document.querySelector("#p-discount");

  if (originalPrice > finalPrice && finalPrice > 0) {
    const discountAmount = originalPrice - finalPrice;
    const discountPercentage = (discountAmount / originalPrice) * 100;

    if (discountBadgeEl) {
      discountBadgeEl.textContent = `-${discountPercentage.toFixed(0)}%`;
      discountBadgeEl.style.display = "inline-block";
    }

    if (discountDetailEl) {
      discountDetailEl.textContent = 
        `Save €${discountAmount.toFixed(2)} (${discountPercentage.toFixed(2)}%)!`;
    }
  } else {
    if (discountBadgeEl) {
      discountBadgeEl.style.display = "none";
    }
    if (discountDetailEl) {
      discountDetailEl.textContent = "";
    }
  }

  // ------- dataset safety -------
  document.querySelector("#add-to-cart").dataset.id = product.Id;
}


// ************* Alternative Display Product Details Method *******************
// function productDetailsTemplate(product) {
//   return `<section class="product-detail"> <h3>${product.Brand.Name}</h3>
//     <h2 class="divider">${product.NameWithoutBrand}</h2>
//     <img
//       class="divider"
//       src="${product.Image}"
//       alt="${product.NameWithoutBrand}"
//    >
//     <p class="product-card__price">$${product.FinalPrice}</p>
//     <p class="product__color">${product.Colors[0].ColorName}</p>
//     <p class="product__description">
//     ${product.DescriptionHtmlSimple}
//     </p>
//     <div class="product-detail__add">
//       <button id="addToCart" data-id="${product.Id}">Add to Cart</button>
//     </div></section>`;
// }