// Theme Toggle Logic
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
});

function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    const toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
        });
    }
}

function updateThemeIcon(theme) {
    const icon = document.querySelector('#theme-toggle i');
    if (icon) {
        if (theme === 'dark') {
            icon.className = 'fas fa-sun';
        } else {
            icon.className = 'fas fa-moon';
        }
    }
}

// Leaflet Map Global Variables
let map;
let markers = [];
let userMarker;

function initStockMap(userLat, userLng, storeStocks, productId) {
    // 1. 지도 초기화 (기본 사용자 좌표 중심)
    map = L.map('map').setView([userLat, userLng], 15);

    // 2. OpenStreetMap 타일 레이어 추가
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // 3. 사용자 현재 위치 표시 (크림슨 커스텀 마커)
    const userIcon = L.divIcon({
        className: 'user-location-marker',
        html: '<div style="background-color: #cc1d49; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(204,29,73,0.8); animate: pulse 2s infinite;"></div>',
        iconSize: [16, 16],
        iconAnchor: [8, 8]
    });
    userMarker = L.marker([userLat, userLng], { icon: userIcon }).addTo(map)
        .bindPopup('<b>내 위치</b>').openPopup();

    // 4. 편의점 마커 추가
    updateMapMarkers(storeStocks);

    // 5. 브라우저 실시간 위치 추적 요청
    requestUserLocation(productId);
}

function getBrandColor(brand) {
    switch (brand) {
        case 'CU': return '#7d26cd';
        case 'GS25': return '#00bcd4';
        case '세븐일레븐': return '#008f53';
        case '이마트24': return '#ffb700';
        default: return '#cc1d49';
    }
}

function getStatusColor(status) {
    switch (status) {
        case '있음': return '#10b981'; // green
        case '소량': return '#f59e0b'; // orange
        case '없음': return '#ef4444'; // red
        default: return '#6b7280';
    }
}

function updateMapMarkers(storeStocks) {
    // 기존 마커 제거
    markers.forEach(m => map.removeLayer(m));
    markers = [];

    storeStocks.forEach((store, index) => {
        const brandColor = getBrandColor(store.brand);
        const statusColor = getStatusColor(store.status);

        // 마커 커스텀 HTML 아이콘
        const storeIcon = L.divIcon({
            className: 'store-map-marker',
            html: `
                <div style="
                    position: relative;
                    width: 32px;
                    height: 32px;
                    background-color: ${brandColor};
                    border-radius: 50% 50% 50% 0;
                    transform: rotate(-45deg);
                    border: 2px solid white;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">
                    <div style="
                        transform: rotate(45deg);
                        color: white;
                        font-weight: 800;
                        font-size: 11px;
                        font-family: 'Outfit';
                    ">
                        ${store.brand[0]}
                    </div>
                    <!-- 재고 상태 작은 점 표시 -->
                    <div style="
                        position: absolute;
                        bottom: -3px;
                        right: -3px;
                        width: 12px;
                        height: 12px;
                        background-color: ${statusColor};
                        border: 2px solid white;
                        border-radius: 50%;
                    "></div>
                </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32]
        });

        const marker = L.marker([store.latitude, store.longitude], { icon: storeIcon })
            .addTo(map)
            .bindPopup(`
                <div style="font-family: 'Inter', sans-serif;">
                    <strong style="font-size: 14px; color: var(--text-primary);">${store.store_name}</strong><br/>
                    <span style="font-size: 12px; color: var(--text-secondary);">${store.address}</span><br/>
                    <div style="margin-top: 8px; display: flex; align-items: center; gap: 5px;">
                        <span style="
                            display: inline-block;
                            padding: 2px 8px;
                            border-radius: 20px;
                            font-size: 11px;
                            font-weight: bold;
                            color: white;
                            background-color: ${statusColor};
                        ">
                            재고: ${store.status} (${store.quantity}개)
                        </span>
                        <span style="font-size: 11px; color: #888;">${formatDistance(store.distance)}</span>
                    </div>
                </div>
            `);

        // 마커 클릭 시 리스트 카드 동기화 및 포커싱
        marker.on('click', () => {
            focusStoreCard(index);
        });

        markers.push(marker);
    });
}

function formatDistance(meters) {
    if (meters >= 1000) {
        return `${(meters / 1000).toFixed(1)}km`;
    }
    return `${meters}m`;
}

// 리스트 카드 포커스 및 스크롤
function focusStoreCard(index) {
    const cards = document.querySelectorAll('.store-card');
    cards.forEach(c => c.classList.remove('active'));
    
    const selectedCard = document.getElementById(`store-card-${index}`);
    if (selectedCard) {
        selectedCard.classList.add('active');
        selectedCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// 편의점 리스트 카드 클릭 시 지도 포커스
function selectStore(lat, lng, index) {
    if (map) {
        map.setView([lat, lng], 16, { animate: true });
        markers[index].openPopup();
        focusStoreCard(index);
    }
}

// 실시간 위치 정보 수집
function requestUserLocation(productId) {
    const locStatus = document.getElementById('location-status');
    
    if (!navigator.geolocation) {
        if (locStatus) locStatus.textContent = '위치 정보 미지원 브라우저';
        return;
    }

    if (locStatus) locStatus.textContent = '현재 위치 갱신 중...';

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            // 지도와 내 위치 마커 업데이트
            if (map && userMarker) {
                map.setView([lat, lng], 15);
                userMarker.setLatLng([lat, lng]).bindPopup('<b>내 실제 위치</b>').openPopup();
            }

            // 백엔드 API를 호출하여 거리 재정렬된 데이터 수신
            fetch(`/api/stock/${productId}?lat=${lat}&lng=${lng}`)
                .then(res => res.json())
                .then(data => {
                    if (data.stores) {
                        updateStoreListUI(data.stores, lat, lng);
                        updateMapMarkers(data.stores);
                        if (locStatus) locStatus.textContent = '실시간 위치 적용 완료';
                    }
                })
                .catch(err => {
                    console.error('Error fetching sorted store data:', err);
                    if (locStatus) locStatus.textContent = '위치 데이터 반영 오류';
                });
        },
        (error) => {
            console.warn('Geolocation error:', error.message);
            if (locStatus) {
                locStatus.textContent = '기본 위치(반석고등학교) 기준 조회 중';
            }
        },
        { enableHighAccuracy: true, timeout: 8000 }
    );
}

// 실시간 정렬된 편의점 데이터를 화면에 다시 그리기
function updateStoreListUI(stores, userLat, userLng) {
    const container = document.getElementById('store-list-container');
    if (!container) return;

    container.innerHTML = '';
    
    stores.forEach((store, index) => {
        const brandBadgeClass = `brand-${store.brand.toLowerCase()}`;
        const distanceStr = formatDistance(store.distance);
        
        const cardHtml = `
            <div class="store-card" id="store-card-${index}" onclick="selectStore(${store.latitude}, ${store.longitude}, ${index})">
                <span class="store-brand-badge ${brandBadgeClass}">${store.brand}</span>
                <h4 class="store-name">${store.store_name}</h4>
                <p class="store-address">${store.address}</p>
                <div class="store-info-row">
                    <span class="store-distance">
                        <i class="fas fa-map-marker-alt"></i> ${distanceStr}
                    </span>
                    <span class="stock-badge ${store.status_class}">
                        재고: ${store.status} (${store.quantity}개)
                    </span>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', cardHtml);
    });
}
