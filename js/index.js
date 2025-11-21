setTimeout(() => {
  document.getElementById("splash-screen").style.display = "none";
}, 2500);

// Close Navbar
document.querySelectorAll(".navbar-nav .nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    let navbar = document.querySelector(".navbar-collapse");
    let bsCollapse = new bootstrap.Collapse(navbar, {
      toggle: false,
    });
    bsCollapse.hide();
  });
});

// Active Navbar
document.querySelectorAll(".navbar-nav .nav-link").forEach((link) => {
  link.addEventListener("click", function () {
    document
      .querySelectorAll(".navbar-nav .nav-link")
      .forEach((nav) => nav.classList.remove("active"));
    this.classList.add("active");
    const navbarCollapse = document.querySelector(".navbar-collapse");
    if (navbarCollapse.classList.contains("show")) {
      new bootstrap.Collapse(navbarCollapse).toggle();
    }
  });
});

// Back To Top
window.onscroll = function () {
  scrollFunction();
};

function scrollFunction() {
  const btn = document.getElementById("backToTop");
  if (
    document.body.scrollTop > 100 ||
    document.documentElement.scrollTop > 100
  ) {
    btn.style.display = "block";
  } else {
    btn.style.display = "none";
  }
}

document.getElementById("backToTop").addEventListener("click", function () {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// 🛒 جلب الكارت من localStorage
function getCart() {
  const data = JSON.parse(localStorage.getItem("cart"));
  if (!data) return [];

  const now = Date.now();
  const expiryTime = 2 * 60 * 60 * 1000; // ساعتين بالملي ثانية

  if (now - data.savedAt > expiryTime) {
    // 🧹 امسح الكارت لو عدّى وقت الصلاحية
    localStorage.removeItem("cart");
    return [];
  }

  return data.items;
}

// 🛒 حفظ الكارت
function saveCart(cart) {
  const data = {
    items: cart,
    savedAt: Date.now() // وقت الحفظ بالميللي ثانية
  };
  localStorage.setItem("cart", JSON.stringify(data));
}

// 🛒 تحديث العداد
function updateCartCount() {
  const cart = getCart();
  document.getElementById("cart-count").textContent = cart.length;
}

// 🛒 إضافة منتج
function addToCart(product) {
  let cart = getCart();
  const existing = cart.find((item) => item.id === String(product.id));

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, id: String(product.id), qty: 1 }); // 🔴 هنا
  }

  saveCart(cart);
  updateCartCount();
}

// 🛒 حذف منتج
function removeFromCart(productId) {
  let cart = getCart();
  cart = cart.filter((item) => item.id !== String(productId)); // 🔴 هنا
  saveCart(cart);
  updateCartCount();
}

// 🛒 تحديث حالة الأزرار (إضافة / حذف)
function syncButtons() {
  const cart = getCart();
  const buttons = document.querySelectorAll(".btn-add-to-cart");

  buttons.forEach((btn) => {
    const id = String(btn.dataset.id); // 🔴 هنا
    const inCart = cart.some((item) => item.id === id);

    if (inCart) {
      btn.classList.add("added", "btn-danger");
      btn.innerHTML = `<i class="fas fa-trash"></i> حذف`;
    } else {
      btn.classList.remove("added", "btn-danger");
      btn.innerHTML = `<i class="fas fa-plus"></i> إضافة`;
    }
  });
}

// 🛒 Toggle الزرار
document.addEventListener("click", function (e) {
  const btn = e.target.closest(".btn-add-to-cart");
  if (!btn) return;

  const product = {
    id: String(btn.dataset.id), // 🔴 هنا
    name: btn.dataset.name,
    price: parseFloat(btn.dataset.price),
  };

  if (btn.classList.contains("added")) {
    removeFromCart(product.id);
  } else {
    addToCart(product);
  }

  syncButtons(); // بعد أي أكشن نحدث كل الأزرار
});

// 🛒 عرض/إخفاء البوب أب
function togglePopup() {
  const popup = document.getElementById("cart-popup");
  const cart = getCart();

  if (cart.length === 0) {
    popup.style.display = "none";
    return;
  }

  renderCartPopup();
  popup.style.display = popup.style.display === "flex" ? "none" : "flex";
}

// 🛒 إعادة رسم محتويات البوب أب
// 🛒 إعادة رسم محتويات البوب أب
function renderCartPopup() {
  const cart = getCart();
  const cartItemsDiv = document.getElementById("cart-items");
  const totalDiv = document.getElementById("cart-total");
  const popup = document.getElementById("cart-popup");

  cartItemsDiv.innerHTML = "";

  if (cart.length === 0) {
    totalDiv.textContent = "";
    popup.style.display = "none"; // 🔴 قفل البوب أب لو فاضي
    return;
  }

  let total = 0;

  cart.forEach((item) => {
    const itemTotal = item.price * item.qty;
    total += itemTotal;

    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
  <h6>${item.name}</h6>
  <div class="cart-item-details">
    <span class="text-warning fw-bold">${item.price} ج</span>
    <div class="qty-control d-flex align-items-center">
      <button class="qty-btn btn btn-sm btn-outline-secondary" onclick="updateQty('${item.id}', -1)">-</button>
      <span>${item.qty}</span>
      <button class="qty-btn btn btn-sm btn-outline-secondary" onclick="updateQty('${item.id}', 1)">+</button>
    </div>
    <span class="fw-bold text-success">${itemTotal} ج</span>
  </div>
`;
    cartItemsDiv.appendChild(div);
  });

  totalDiv.textContent = `الإجمالي: ${total} ج`;
}

// 🛒 تعديل الكمية
function updateQty(productId, change) {
  let cart = getCart();
  const item = cart.find((p) => p.id === String(productId)); // 🔴 هنا
  if (!item) return;

  item.qty += change;

  if (item.qty <= 0) {
    const confirmDelete = confirm("هل تريد حذف المنتج؟");
    if (confirmDelete) {
      cart = cart.filter((p) => String(p.id) !== String(productId));
    } else {
      item.qty = 1;
    }
  }

  saveCart(cart);
  updateCartCount();
  renderCartPopup();
  syncButtons();
}

// 🛒 عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  syncButtons();

  document.getElementById("cart-icon").addEventListener("click", togglePopup);
});

// ✨ إغلاق البوب أب لما تدوس برا المحتوى
// ✨ إغلاق البوب أب لما تدوس على الـ overlay (مش المحتوى)
const popup = document.getElementById("cart-popup");
if (popup) {
  popup.addEventListener("click", (e) => {
    if (e.target === popup) {
      popup.style.display = "none";
    }
  });
}

// 🛒 حذف كل المنتجات
function clearCart() {
  const confirmDelete = confirm("هل أنت متأكد أنك تريد حذف كل المنتجات من السلة؟");
  if (confirmDelete) {
    localStorage.removeItem("cart"); // فضي ال localStorage
    updateCartCount();               // حدث العداد
    syncButtons();                   // رجع الأزرار "إضافة"
    const popup = document.getElementById("cart-popup");
    popup.style.display = "none";    // اقفل البوب أب
  }
}