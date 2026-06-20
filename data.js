// ==============================
// 편의점 재고 확인 서비스 - 데이터 및 유틸리티
// GitHub Pages 정적 사이트용
// ==============================

// ─── 상품 데이터 (20개) ───
const PRODUCTS = [
    { id: 1,  name: "매콤새콤 배홍동비빔면", category: "라면",      price: 1200, icon: "fa-bowl-food" },
    { id: 2,  name: "신라면 소컵",           category: "라면",      price: 1150, icon: "fa-bowl-food" },
    { id: 3,  name: "불닭볶음면 큰컵",       category: "라면",      price: 1800, icon: "fa-bowl-food" },
    { id: 4,  name: "육개장 사발면",         category: "라면",      price: 1000, icon: "fa-bowl-food" },
    { id: 5,  name: "참치마요 삼각김밥",     category: "간편식",    price: 1200, icon: "fa-box-open" },
    { id: 6,  name: "전주비빔 삼각김밥",     category: "간편식",    price: 1300, icon: "fa-box-open" },
    { id: 7,  name: "스팸김치볶음밥 삼각김밥", category: "간편식",  price: 1400, icon: "fa-box-open" },
    { id: 8,  name: "혜자로운 제육도시락",   category: "간편식",    price: 4500, icon: "fa-box-open" },
    { id: 9,  name: "백종원 매콤돈까스도시락", category: "간편식",  price: 5000, icon: "fa-box-open" },
    { id: 10, name: "포카칩 오리지널",       category: "스낵",      price: 1700, icon: "fa-cookie-bite" },
    { id: 11, name: "허니버터칩",            category: "스낵",      price: 1700, icon: "fa-cookie-bite" },
    { id: 12, name: "새우깡",               category: "스낵",      price: 1500, icon: "fa-cookie-bite" },
    { id: 13, name: "먹태청양마요칩",        category: "스낵",      price: 1800, icon: "fa-cookie-bite" },
    { id: 14, name: "코카콜라 500ml",        category: "음료",      price: 2200, icon: "fa-bottle-water" },
    { id: 15, name: "펩시 제로 슈거 500ml",  category: "음료",      price: 2000, icon: "fa-bottle-water" },
    { id: 16, name: "바나나맛우유 240ml",    category: "음료",      price: 1800, icon: "fa-bottle-water" },
    { id: 17, name: "포카리스웨트 500ml",    category: "음료",      price: 2300, icon: "fa-bottle-water" },
    { id: 18, name: "서울우유 흰우유 1L",    category: "음료",      price: 3100, icon: "fa-bottle-water" },
    { id: 19, name: "하겐다즈 미니컵 초코",  category: "아이스크림", price: 5900, icon: "fa-ice-cream" },
    { id: 20, name: "메로나",               category: "아이스크림", price: 1200, icon: "fa-ice-cream" }
];

// ─── 편의점 데이터 (10개, 고려대 서울캠퍼스 주변) ───
const BASE_LAT = 37.5888;
const BASE_LNG = 127.0345;

const STORES = [
    { id: 1,  name: "CU 고려대정문점",       brand: "CU",       lat: BASE_LAT + 0.0008, lng: BASE_LNG - 0.0007, address: "서울특별시 성북구 안암로 145" },
    { id: 2,  name: "GS25 안암스타점",        brand: "GS25",     lat: BASE_LAT - 0.0018, lng: BASE_LNG - 0.0022, address: "서울특별시 성북구 인촌로24길 21" },
    { id: 3,  name: "세븐일레븐 고려대역점",  brand: "세븐일레븐", lat: BASE_LAT + 0.0031, lng: BASE_LNG + 0.0048, address: "서울특별시 성북구 종암로 13" },
    { id: 4,  name: "이마트24 안암본점",      brand: "이마트24",   lat: BASE_LAT - 0.0011, lng: BASE_LNG + 0.0015, address: "서울특별시 성북구 개운사길 12" },
    { id: 5,  name: "CU 고려대참살이점",      brand: "CU",       lat: BASE_LAT - 0.0035, lng: BASE_LNG - 0.0031, address: "서울특별시 성북구 인촌로24길 48" },
    { id: 6,  name: "GS25 고려대학교법대점",  brand: "GS25",     lat: BASE_LAT + 0.0019, lng: BASE_LNG + 0.0009, address: "서울특별시 성북구 안암로 145 고려대학교내" },
    { id: 7,  name: "세븐일레븐 개운사점",    brand: "세븐일레븐", lat: BASE_LAT - 0.0028, lng: BASE_LNG + 0.0026, address: "서울특별시 성북구 개운사길 30" },
    { id: 8,  name: "이마트24 안암역점",      brand: "이마트24",   lat: BASE_LAT - 0.0049, lng: BASE_LNG + 0.0005, address: "서울특별시 성북구 인촌로 73" },
    { id: 9,  name: "CU 안암오거리점",        brand: "CU",       lat: BASE_LAT + 0.0045, lng: BASE_LNG - 0.0039, address: "서울특별시 성북구 인촌로 102" },
    { id: 10, name: "GS25 고대병원점",        brand: "GS25",     lat: BASE_LAT - 0.0021, lng: BASE_LNG - 0.0049, address: "서울특별시 성북구 고려대로 73 고대안암병원" }
];

// ─── 재고 데이터 (서버 없이 localStorage에 관리) ───
function generateStockData() {
    const stocks = [];
    STORES.forEach(store => {
        PRODUCTS.forEach(product => {
            const roll = Math.random();
            let qty;
            if (roll < 0.30) qty = 0;
            else if (roll < 0.70) qty = Math.floor(Math.random() * 3) + 1;
            else qty = Math.floor(Math.random() * 7) + 4;
            stocks.push({ storeId: store.id, productId: product.id, quantity: qty });
        });
    });
    return stocks;
}

function getStocks() {
    let stocks = localStorage.getItem('stockData');
    if (!stocks) {
        const data = generateStockData();
        localStorage.setItem('stockData', JSON.stringify(data));
        return data;
    }
    return JSON.parse(stocks);
}

function getStockStatus(qty) {
    if (qty === 0) return { text: "없음", cls: "out-of-stock" };
    if (qty <= 3) return { text: "소량", cls: "low-stock" };
    return { text: "있음", cls: "in-stock" };
}

// ─── 카테고리 목록 ───
function getCategories() {
    const cats = new Set();
    PRODUCTS.forEach(p => cats.add(p.category));
    return Array.from(cats);
}

// ─── 상품 검색 ───
function searchProducts(query, category) {
    let results = PRODUCTS;
    if (query) {
        const q = query.toLowerCase();
        results = results.filter(p => p.name.toLowerCase().includes(q));
    }
    if (category) {
        results = results.filter(p => p.category === category);
    }
    return results;
}

// ─── 하버사인 거리 계산 (미터 단위) ───
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371.0;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 1000);
}

function formatDistance(meters) {
    if (meters >= 1000) return `${(meters / 1000).toFixed(1)}km`;
    return `${meters}m`;
}

// ─── 특정 상품에 대한 편의점별 재고 + 거리 정보 조회 ───
function getStoreStocksForProduct(productId, userLat, userLng) {
    const stocks = getStocks();
    const result = [];
    stocks.filter(s => s.productId === productId).forEach(s => {
        const store = STORES.find(st => st.id === s.storeId);
        if (!store) return;
        const dist = calculateDistance(userLat, userLng, store.lat, store.lng);
        const status = getStockStatus(s.quantity);
        result.push({
            store_name: store.name,
            brand: store.brand,
            latitude: store.lat,
            longitude: store.lng,
            address: store.address,
            quantity: s.quantity,
            status: status.text,
            status_class: status.cls,
            distance: dist
        });
    });
    result.sort((a, b) => a.distance - b.distance);
    return result;
}

// ─── 회원 인증 (localStorage 기반) ───
function getUsers() {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [];
}

function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

function registerUser(username, password) {
    const users = getUsers();
    if (users.find(u => u.username === username)) {
        return { success: false, message: '이미 존재하는 아이디입니다.' };
    }
    users.push({ username, password });
    saveUsers(users);
    return { success: true, message: '회원가입이 완료되었습니다. 로그인해 주세요.' };
}

function loginUser(username, password) {
    const users = getUsers();
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        sessionStorage.setItem('currentUser', username);
        return { success: true };
    }
    return { success: false, message: '아이디 또는 비밀번호가 올바르지 않습니다.' };
}

function logoutUser() {
    sessionStorage.removeItem('currentUser');
}

function getCurrentUser() {
    return sessionStorage.getItem('currentUser');
}

function isLoggedIn() {
    return !!getCurrentUser();
}

// ─── 가격 포맷팅 ───
function formatPrice(price) {
    return price.toLocaleString() + '원';
}

// ─── 공통 네비게이션 바 렌더링 ───
function renderNavbar(activePage) {
    const user = getCurrentUser();
    const nav = document.getElementById('navbar');
    if (!nav) return;

    let authButtons = '';
    if (user) {
        authButtons = `
            <span class="user-greeting" style="font-size: 0.9rem; color: var(--text-secondary);">
                <i class="fas fa-user-circle"></i> <strong>${user}</strong>님
            </span>
            <a href="#" onclick="logoutUser(); location.href='index.html';" class="btn btn-outline">로그아웃</a>
        `;
    } else {
        authButtons = `
            <a href="login.html" class="btn btn-outline">로그인</a>
            <a href="register.html" class="btn btn-primary">회원가입</a>
        `;
    }

    nav.innerHTML = `
        <a href="index.html" class="nav-brand">
            <i class="fas fa-store"></i>
            <span>재고모아</span>
        </a>
        <ul class="nav-links">
            <li><a href="index.html" class="nav-link ${activePage === 'home' ? 'active' : ''}">홈</a></li>
            <li><a href="search.html" class="nav-link ${activePage === 'search' ? 'active' : ''}">상품 검색</a></li>
        </ul>
        <div class="nav-actions">
            <button id="theme-toggle" class="theme-toggle-btn" title="테마 변경">
                <i class="fas fa-sun"></i>
            </button>
            ${authButtons}
        </div>
    `;

    // 테마 토글 바인딩
    initTheme();
}

// ─── 플래시 메시지 표시 ───
function showFlash(message, type) {
    let container = document.querySelector('.alert-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'alert-container';
        document.body.appendChild(container);
    }
    const iconMap = { success: 'fa-check-circle', danger: 'fa-exclamation-circle', info: 'fa-info-circle' };
    const alertEl = document.createElement('div');
    alertEl.className = `alert alert-${type}`;
    alertEl.innerHTML = `<i class="fas ${iconMap[type] || 'fa-info-circle'}"></i><span>${message}</span>`;
    container.appendChild(alertEl);

    setTimeout(() => {
        alertEl.style.transition = 'opacity 0.5s ease';
        alertEl.style.opacity = '0';
        setTimeout(() => alertEl.remove(), 500);
    }, 3500);
}

// ─── 상품 카드 HTML 생성 ───
function createProductCardHTML(product) {
    const user = getCurrentUser();
    let stockBtn;
    if (user) {
        stockBtn = `<a href="stock.html?id=${product.id}" class="btn btn-primary btn-sm" style="font-size:0.8rem;padding:0.4rem 0.8rem;">재고 확인</a>`;
    } else {
        stockBtn = `<a href="login.html?next=stock.html%3Fid%3D${product.id}" class="btn btn-outline btn-sm" style="font-size:0.8rem;padding:0.4rem 0.8rem;">재고 확인</a>`;
    }

    return `
        <div class="product-card">
            <div class="product-image-container">
                <div style="font-size:3rem;color:var(--text-muted);">
                    <i class="fas ${product.icon}"></i>
                </div>
            </div>
            <div class="product-info">
                <span class="product-cat">${product.category}</span>
                <h3 class="product-name">${product.name}</h3>
                <div class="product-footer">
                    <span class="product-price">${formatPrice(product.price)}</span>
                    ${stockBtn}
                </div>
            </div>
        </div>
    `;
}
