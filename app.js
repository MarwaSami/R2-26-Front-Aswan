const productContainer = document.getElementById('product-container');
const catContainer = document.getElementById('cat-container');
const searchInput = document.getElementById('search-input');
const themeToggle = document.getElementById('theme-toggle');
const cartCount = document.getElementById('cart-count');
const modalOverlay = document.getElementById('modal-overlay');
const modalBody = document.getElementById('modal-body');

let allProducts = [];
let cart = [];

// Fetch initial data
async function init() {
    try {
        await Promise.all([
            fetchProducts(),
            fetchCategories()
        ]);
    } catch (error) {
        console.error('Error initializing app:', error);
        productContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Failed to load products. Please try again later.</p>';
    }
}

async function fetchProducts(category = 'all') {
    productContainer.innerHTML = '<span class="loader"></span>';
    const url = category === 'all' 
        ? 'https://dummyjson.com/products?limit=30' 
        : `https://dummyjson.com/products/category/${category}`;
    
    const response = await fetch(url);
    const data = await response.json();
    allProducts = data.products;
    renderProducts(allProducts);
}

async function fetchCategories() {
    const response = await fetch('https://dummyjson.com/products/categories');
    const categories = await response.json();
    
    // Categories on DummyJSON usually return an array of strings or objects depending on version
    // Let's assume array of strings for now, or check first few
    const catList = Array.isArray(categories) ? categories : [];
    
    catList.slice(0, 10).forEach(cat => {
        const name = typeof cat === 'object' ? cat.slug : cat;
        const displayName = typeof cat === 'object' ? cat.name : cat;
        
        const chip = document.createElement('div');
        chip.className = 'cat-chip glass';
        chip.textContent = displayName;
        chip.onclick = () => {
            document.querySelectorAll('.cat-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            fetchProducts(name);
        };
        catContainer.appendChild(chip);
    });
}

function renderProducts(products) {
    productContainer.innerHTML = '';
    
    if (products.length === 0) {
        productContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">No products found.</p>';
        return;
    }

    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card glass';
        card.innerHTML = `
            <img src="${product.thumbnail}" alt="${product.title}" class="product-img">
            <div class="product-info">
                <p style="font-size: 0.8rem; color: var(--text-dim); margin-bottom: 0.2rem;">${product.category}</p>
                <h3>${product.title}</h3>
                <p class="product-price">$${product.price}</p>
            </div>
            <button class="btn-primary" style="padding: 0.6rem; margin-top: 1rem; width: 100%;" onclick="openProduct(${product.id})">Quick View</button>
        `;
        productContainer.appendChild(card);
    });
}

// Search functionality
searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = allProducts.filter(p => 
        p.title.toLowerCase().includes(term) || 
        p.description.toLowerCase().includes(term)
    );
    renderProducts(filtered);
});

// Theme Toggle
themeToggle.addEventListener('click', () => {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    document.body.setAttribute('data-theme', isDark ? 'light' : 'dark');
    themeToggle.innerHTML = `<i data-lucide="${isDark ? 'sun' : 'moon'}"></i>`;
    lucide.createIcons();
});

// Product Details Modal
async function openProduct(id) {
    modalOverlay.style.display = 'flex';
    modalBody.innerHTML = '<span class="loader"></span>';
    
    try {
        const response = await fetch(`https://dummyjson.com/products/${id}`);
        const product = await response.json();
        
        modalBody.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
                <img src="${product.thumbnail}" style="width: 100%; height: auto; border-radius: 20px;">
                <div>
                    <h2 style="font-size: 2rem; margin-bottom: 0.5rem;">${product.title}</h2>
                    <p style="color: var(--text-dim); margin-bottom: 1rem;">${product.brand} | ${product.category}</p>
                    <p style="font-size: 1.5rem; font-weight: 700; color: var(--primary); margin-bottom: 1.5rem;">$${product.price}</p>
                    <p style="margin-bottom: 2rem;">${product.description}</p>
                    <button class="btn-primary" style="width: 100%" onclick="addToCart('${product.title}')">Add to Cart</button>
                </div>
            </div>
        `;
    } catch (error) {
        modalBody.innerHTML = '<p>Error loading product details.</p>';
    }
}

function closeModal() {
    modalOverlay.style.display = 'none';
}

function addToCart(title) {
    cart.push(title);
    cartCount.textContent = cart.length;
    closeModal();
    // Subtle notification
    const toast = document.createElement('div');
    toast.style.cssText = 'position: fixed; bottom: 2rem; right: 2rem; background: var(--accent); color: white; padding: 1rem 2rem; border-radius: 12px; z-index: 3000; animation: slideUp 0.3s ease-out';
    toast.textContent = `Added ${title} to cart!`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Global filter function for HTML onclick
window.filterCategory = (cat) => {
    fetchProducts(cat);
}

init();
