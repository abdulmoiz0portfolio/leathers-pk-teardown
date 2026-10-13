// Clean-room recreation — original JS. Placeholder catalog, no real data.
const PRODUCTS = [
  { name: "Heritage Belt",      price: 3499, was: 4999, off: 30, colors: ["#543825", "#272626", "#9e5c4e"] },
  { name: "Slim Bifold Wallet", price: 2499, was: 3299, off: 24, colors: ["#272626", "#70613e"] },
  { name: "Chronograph Watch",  price: 8999, was: 11999, off: 25, colors: ["#272626", "#543825"] },
  { name: "Card Holder",        price: 1499, was: 1999, off: 25, colors: ["#9e5c4e", "#272626"] },
  { name: "Dress Belt",         price: 2999, was: 4299, off: 30, colors: ["#272626", "#543825"] },
  { name: "Long Wallet",        price: 3999, was: 5499, off: 27, colors: ["#70613e", "#272626"] },
  { name: "Field Watch",        price: 7499, was: 9999, off: 25, colors: ["#543825", "#272626"] },
  { name: "Key Organizer",      price: 1299, was: 1799, off: 28, colors: ["#272626"] },
];

const grid = document.getElementById("productGrid");
const cartCount = document.getElementById("cartCount");
const stickyCart = document.getElementById("stickyCart");
const stickyText = document.getElementById("stickyText");
let cart = 0;

function fmt(n) { return "Rs. " + n.toLocaleString("en-PK"); }

PRODUCTS.forEach((p, i) => {
  const card = document.createElement("div");
  card.className = "pcard";
  card.innerHTML = `
    <div class="img"><span class="badge">-${p.off}%</span>
      <div class="hoverbar">
        <div class="swatches">${p.colors.map(c =>
          `<span class="sw" style="background:${c}" title="color"></span>`).join("")}</div>
        <button class="wish" aria-label="wishlist">♡</button>
      </div>
    </div>
    <div class="pbody">
      <h3>${p.name}</h3>
      <div class="price">${fmt(p.price)}<s>${fmt(p.was)}</s></div>
      <button class="btn add">Add to Cart</button>
    </div>`;
  card.querySelector(".wish").addEventListener("click", e => {
    e.currentTarget.classList.toggle("active");
    e.currentTarget.textContent = e.currentTarget.classList.contains("active") ? "♥" : "♡";
  });
  card.querySelector(".add").addEventListener("click", () => {
    cart++;
    cartCount.textContent = cart;
    stickyText.textContent = cart + (cart === 1 ? " item in cart" : " items in cart");
    stickyCart.hidden = false;
  });
  grid.appendChild(card);
});

document.getElementById("waBtn").addEventListener("click", () =>
  alert("Placeholder: WhatsApp chat button."));
document.getElementById("cartBtn").addEventListener("click", () =>
  alert(cart ? cart + " item(s) in cart (demo)." : "Your cart is empty (demo)."));
