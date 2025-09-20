// ======================
// STATE MANAGEMENT (SIMPLE IN-MEMORY STORE)
// ======================
let products = [
  // Sample data — replace with your real data or load from localStorage
  { id: 1, name: "Laptop", category: "Electronics", price: 999, stock: 15 },
  { id: 2, name: "Mouse", category: "Electronics", price: 25, stock: 100 },
  { id: 3, name: "Notebook", category: "Stationery", price: 5, stock: 50 }
];

let categories = ["Electronics", "Stationery", "Furniture", "Clothing"];
let selectedCategory = "All";
let isModalOpen = false;
let editingProduct = null;

// ======================
// DOM ELEMENTS
// ======================
const root = document.getElementById('root');
const modalOverlay = document.createElement('div');
modalOverlay.className = 'modal-overlay';
const modalContent = document.createElement('div');
modalContent.className = 'modal-content';

// ======================
// UTILITY FUNCTIONS
// ======================
function createElement(tag, className = '', text = '') {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text) el.textContent = text;
  return el;
}

function renderProducts(filteredProducts) {
  const tableBody = document.querySelector('#product-list tbody');
  if (!tableBody) return;

  tableBody.innerHTML = '';

  filteredProducts.forEach(product => {
    const row = createElement('tr');
    row.innerHTML = `
      <td>${product.name}</td>
      <td>${product.category}</td>
      <td>$${product.price.toFixed(2)}</td>
      <td>${product.stock}</td>
      <td class="actions">
        <button class="btn btn-primary edit-btn" data-id="${product.id}">Edit</button>
        <button class="btn btn-danger delete-btn" data-id="${product.id}">Delete</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

function renderCategories() {
  const categoriesContainer = document.querySelector('.categories');
  if (!categoriesContainer) return;

  categoriesContainer.innerHTML = '';
  const allBtn = createElement('button', 'category-tag' + (selectedCategory === 'All' ? ' active' : ''), 'All');
  allBtn.addEventListener('click', () => {
    selectedCategory = 'All';
    renderCategories();
    renderProducts(products);
  });
  categoriesContainer.appendChild(allBtn);

  categories.forEach(cat => {
    const btn = createElement('button', 'category-tag' + (selectedCategory === cat ? ' active' : ''), cat);
    btn.addEventListener('click', () => {
      selectedCategory = cat;
      renderCategories();
      renderProducts(products.filter(p => p.category === cat));
    });
    categoriesContainer.appendChild(btn);
  });
}

function renderModal() {
  modalContent.innerHTML = `
    <div class="modal-header">
      <h2>${editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
      <button class="close-btn">&times;</button>
    </div>
    <form id="product-form">
      <div class="form-group">
        <label for="name">Product Name</label>
        <input type="text" id="name" value="${editingProduct?.name || ''}" required>
      </div>
      <div class="form-group">
        <label for="category">Category</label>
        <select id="category" required>
          <option value="">Select a category</option>
          ${categories.map(cat => `<option ${editingProduct?.category === cat ? 'selected' : ''}>${cat}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label for="price">Price ($)</label>
        <input type="number" id="price" value="${editingProduct?.price || ''}" step="0.01" min="0" required>
      </div>
      <div class="form-group">
        <label for="stock">Stock</label>
        <input type="number" id="stock" value="${editingProduct?.stock || ''}" min="0" required>
      </div>
      <div class="form-group">
        <button type="submit" class="btn btn-success">${editingProduct ? 'Update' : 'Add'} Product</button>
      </div>
    </form>
  `;

  // Close modal on X click
  modalContent.querySelector('.close-btn').addEventListener('click', () => {
    modalOverlay.style.display = 'none';
    editingProduct = null;
  });

  // Close on ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      modalOverlay.style.display = 'none';
      editingProduct = null;
    }
  });

  // Form submit
  modalContent.querySelector('#product-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = modalContent.querySelector('#name').value;
    const category = modalContent.querySelector('#category').value;
    const price = parseFloat(modalContent.querySelector('#price').value);
    const stock = parseInt(modalContent.querySelector('#stock').value);

    if (editingProduct) {
      const index = products.findIndex(p => p.id === editingProduct.id);
      products[index] = { ...products[index], name, category, price, stock };
    } else {
      products.push({
        id: Date.now(),
        name,
        category,
        price,
        stock
      });
    }

    modalOverlay.style.display = 'none';
    editingProduct = null;
    renderProducts(products.filter(p => selectedCategory === 'All' || p.category === selectedCategory));
  });

  modalOverlay.appendChild(modalContent);
  root.appendChild(modalOverlay);
}

function renderDashboard() {
  const filteredProducts = selectedCategory === 'All' ? products : products.filter(p => p.category === selectedCategory);

  root.innerHTML = `
    <header>
      <h1>Inventory Dashboard</h1>
      <button class="btn btn-primary add-product-btn">Add Product</button>
    </header>

    <div class="container">
      <h2>Products</h2>
      <div class="categories"></div>
      <table id="product-list">
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <!-- Products will be inserted here -->
        </tbody>
      </table>
    </div>
  `;

  renderCategories();
  renderProducts(filteredProducts);

  // Add Product Button
  root.querySelector('.add-product-btn').addEventListener('click', () => {
    editingProduct = null;
    modalOverlay.style.display = 'flex';
  });

  // Edit/Delete Buttons
  root.addEventListener('click', (e) => {
    if (e.target.classList.contains('edit-btn')) {
      const id = parseInt(e.target.getAttribute('data-id'));
      editingProduct = products.find(p => p.id === id);
      modalOverlay.style.display = 'flex';
    }

    if (e.target.classList.contains('delete-btn')) {
      const id = parseInt(e.target.getAttribute('data-id'));
      if (confirm('Are you sure you want to delete this product?')) {
        products = products.filter(p => p.id !== id);
        renderProducts(products.filter(p => selectedCategory === 'All' || p.category === selectedCategory));
      }
    }
  });

  // Initialize modal
  if (!modalOverlay.parentElement) renderModal();
}

// ======================
// INITIAL RENDER
// ======================
renderDashboard();
