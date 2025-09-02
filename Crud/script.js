document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');
    const productsContainer = document.getElementById('products-container');
    const productForm = document.getElementById('product-form');
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    const sortSelect = document.getElementById('sort-select');
    const notification = document.getElementById('notification');

    const clearAllBtn = document.getElementById('clear-all-btn');
    

    
    // Navigation
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetPage = this.getAttribute('data-page');
            
            // Update active nav link
            navLinks.forEach(navLink => navLink.classList.remove('active'));
            this.classList.add('active');
            
            // Show target page
            pages.forEach(page => {
                page.classList.remove('active');
                if (page.id === targetPage) {
                    page.classList.add('active');
                }
            });
        });
    });
    
    // Load products from localStorage
    function loadProducts() {
        const products = JSON.parse(localStorage.getItem('products')) || [];
        return products;
    }
    
    // Save products to localStorage
    function saveProducts(products) {
        localStorage.setItem('products', JSON.stringify(products));
    }
    
    // Display products
    function displayProducts(products = null) {
        const productsToDisplay = products || loadProducts();
        productsContainer.innerHTML = '';
        
        if (productsToDisplay.length === 0) {
            productsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-box-open"></i>
                    <h3>No products found</h3>
                    <p>Add your first product to get started</p>
                </div>
            `;
            return;
        }
        
        productsToDisplay.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <div class="product-image">
                    <img src="${product.image}" alt="${product.title}">
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.title}</h3>
                    <div class="product-price">$${product.price.toFixed(2)}</div>
                    <span class="product-category">${product.category}</span>
                    <p class="product-description">${product.description || 'No description available.'}</p>
                    <div class="product-actions">
                        <button class="btn-edit" onclick="editProduct(${product.id})">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn-delete" onclick="deleteProduct(${product.id})">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `;
            productsContainer.appendChild(productCard);
        });
    }
    
    // Store original form submit handler
    let originalSubmitHandler = null;
    let isEditMode = false;
    let editingProductId = null;
    
    // Add new product
    productForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const title = document.getElementById('product-title').value;
        const price = parseFloat(document.getElementById('product-price').value);
        const image = document.getElementById('product-image').value;
        const category = document.getElementById('product-category').value;
        const description = document.getElementById('product-description').value;
        
        if (!title || !price || !image || !category) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }
        
        if (isEditMode) {
            // Update existing product
            const updatedProducts = loadProducts().map(p => {
                if (p.id === editingProductId) {
                    return {
                        ...p,
                        title,
                        price,
                        image,
                        category,
                        description
                    };
                }
                return p;
            });
            
            saveProducts(updatedProducts);
            showNotification('Product updated successfully!', 'success');
            
            // Reset edit mode
            resetEditMode();
        } else {
            // Add new product
            const products = loadProducts();
            const newProduct = {
                id: Date.now(), // Unique ID based on timestamp
                title,
                price,
                image,
                category,
                description
            };
            
            products.push(newProduct);
            saveProducts(products);
            
            showNotification('Product added successfully!', 'success');
        }
        
        // Reset form
        productForm.reset();
        
        // Switch to products page
        document.querySelector('[data-page="products-page"]').click();
        
        // Refresh products display
        displayProducts();
    });
    
    // Function to reset edit mode
    function resetEditMode() {
        isEditMode = false;
        editingProductId = null;
        const submitButton = productForm.querySelector('button');
        submitButton.innerHTML = '<i class="fas fa-plus-circle"></i> Add Product';
    }
    
    // Clear all products
    clearAllBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to delete ALL products? This action cannot be undone.')) {
            localStorage.removeItem('products');
            displayProducts();
            showNotification('All products have been cleared!', 'success');
        }
    });
    
    // Delete product
    window.deleteProduct = function(id) {
        console.log('Delete product called with ID:', id);
        if (confirm('Are you sure you want to delete this product?')) {
            let products = loadProducts();
            console.log('Products before delete:', products);
            products = products.filter(product => product.id !== id);
            console.log('Products after delete:', products);
            saveProducts(products);
            displayProducts();
            
            showNotification('Product deleted successfully!', 'success');
        }
    };
    
    // Edit product
    window.editProduct = function(id) {
        console.log('Edit product called with ID:', id);
        const products = loadProducts();
        const product = products.find(p => p.id === id);
        console.log('Found product to edit:', product);
        
        if (product) {
            // Set edit mode
            isEditMode = true;
            editingProductId = id;
            
            // Fill form with product data
            document.getElementById('product-title').value = product.title;
            document.getElementById('product-price').value = product.price;
            document.getElementById('product-image').value = product.image;
            document.getElementById('product-category').value = product.category;
            document.getElementById('product-description').value = product.description || '';
            
            // Switch to add product page
            document.querySelector('[data-page="add-product-page"]').click();
            
            // Change form to update mode
            const submitButton = productForm.querySelector('button');
            submitButton.innerHTML = '<i class="fas fa-save"></i> Update Product';
        }
    };
    
    // Show notification
    function showNotification(message, type = 'success') {
        notification.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i> <span>${message}</span>`;
        notification.style.background = type === 'success' ? 'var(--success)' : 'var(--danger)';
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
    
    // Search functionality
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const products = loadProducts();
        
        const filteredProducts = products.filter(product => 
            product.title.toLowerCase().includes(searchTerm) ||
            (product.description && product.description.toLowerCase().includes(searchTerm))
        );
        
        displayProducts(filteredProducts);
    });
    
    // Category filter
    categoryFilter.addEventListener('change', function() {
        const category = this.value;
        const products = loadProducts();
        
        if (!category) {
            displayProducts(products);
            return;
        }
        
        const filteredProducts = products.filter(product => 
            product.category === category
        );
        
        displayProducts(filteredProducts);
    });
    
    // Sort functionality
    sortSelect.addEventListener('change', function() {
        const sortOption = this.value;
        const products = loadProducts();
        
        if (sortOption === 'price-low') {
            products.sort((a, b) => a.price - b.price);
        } else if (sortOption === 'price-high') {
            products.sort((a, b) => b.price - a.price);
        } else if (sortOption === 'name') {
            products.sort((a, b) => a.title.localeCompare(b.title));
        }
        
        displayProducts(products);
    });
    
    // Initial display of products
    displayProducts();
});