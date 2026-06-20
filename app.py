import os
import math
from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from models import db, User, Product, Store, Stock, init_db

app = Flask(__name__)
app.config['SECRET_KEY'] = 'dev-secret-key-convenience-store-stock-123987'
# SQLite DB 저장 위치 설정
if os.environ.get('TESTING') == 'True':
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///convenience_stock.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

# Flask-Login 설정
login_manager = LoginManager()
login_manager.login_view = 'login'
login_manager.init_app(app)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# 하버사인 거리 계산 함수 (단위: 미터)
def calculate_distance(lat1, lon1, lat2, lon2):
    R = 6371.0  # 지구 반지름 (km)
    
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    distance = R * c * 1000  # 미터 단위
    return round(distance)

# 앱 시작 시 DB 자동 생성 및 더미 데이터 삽입
if os.environ.get('TESTING') != 'True':
    with app.app_context():
        init_db()

@app.route('/')
def index():
    # 카테고리별로 상품을 분류하여 전달
    popular_products = Product.query.limit(8).all()
    categories = db.session.query(Product.category).distinct().all()
    categories = [c[0] for c in categories]
    return render_template('index.html', popular_products=popular_products, categories=categories)

@app.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
        
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        password_confirm = request.form.get('password_confirm')

        if not username or not password:
            flash('아이디와 비밀번호를 모두 입력해 주세요.', 'danger')
            return redirect(url_for('register'))

        if password != password_confirm:
            flash('비밀번호가 일치하지 않습니다.', 'danger')
            return redirect(url_for('register'))

        existing_user = User.query.filter_by(username=username).first()
        if existing_user:
            flash('이미 존재하는 아이디입니다.', 'danger')
            return redirect(url_for('register'))

        new_user = User(username=username)
        new_user.set_password(password)
        db.session.add(new_user)
        db.session.commit()

        flash('회원가입이 완료되었습니다. 로그인해 주세요.', 'success')
        return redirect(url_for('login'))

    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('index'))

    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')

        user = User.query.filter_by(username=username).first()
        from werkzeug.security import check_password_hash
        if user and check_password_hash(user.password_hash, password):
            login_user(user)
            flash(f'{username}님, 환영합니다!', 'success')
            next_page = request.args.get('next')
            return redirect(next_page or url_for('index'))
        else:
            flash('아이디 또는 비밀번호가 올바르지 않습니다.', 'danger')
            return redirect(url_for('login'))

    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    flash('로그아웃 되었습니다.', 'info')
    return redirect(url_for('index'))

@app.route('/search')
def search():
    query = request.args.get('q', '').strip()
    category = request.args.get('category', '').strip()
    
    products = Product.query
    if query:
        products = products.filter(Product.name.like(f'%{query}%'))
    if category:
        products = products.filter(Product.category == category)
        
    results = products.all()
    return render_template('search_results.html', products=results, query=query, category=category)

@app.route('/stock/<int:product_id>')
@login_required
def stock_view(product_id):
    product = Product.query.get_or_404(product_id)
    
    # 기본 사용자 기준 좌표 (고려대학교 서울캠퍼스)
    default_lat = 37.5888
    default_lng = 127.0345
    
    user_lat = request.args.get('lat', default_lat, type=float)
    user_lng = request.args.get('lng', default_lng, type=float)
    
    # 특정 상품에 대한 각 편의점의 재고 데이터 조회
    stocks = Stock.query.filter_by(product_id=product_id).all()
    
    # 거리 계산 및 데이터 매핑
    store_stocks = []
    for s in stocks:
        dist = calculate_distance(user_lat, user_lng, s.store.latitude, s.store.longitude)
        store_stocks.append({
            'stock_id': s.id,
            'store_name': s.store.name,
            'brand': s.store.brand,
            'latitude': s.store.latitude,
            'longitude': s.store.longitude,
            'address': s.store.address,
            'quantity': s.quantity,
            'status': s.status,
            'status_class': s.status_class,
            'distance': dist
        })
        
    # 거리순(오름차순)으로 정렬
    store_stocks.sort(key=lambda x: x['distance'])
    
    return render_template('stock_view.html', 
                           product=product, 
                           store_stocks=store_stocks,
                           user_lat=user_lat,
                           user_lng=user_lng)

@app.route('/api/stock/<int:product_id>')
def api_stock(product_id):
    """위치 권한 획득 후 JS에서 거리 재정렬 시 사용하는 API"""
    product = Product.query.get_or_404(product_id)
    
    # 요청 파라미터에서 위치 가져옴
    user_lat = request.args.get('lat', type=float)
    user_lng = request.args.get('lng', type=float)
    
    if user_lat is None or user_lng is None:
        return jsonify({'error': 'Latitude and longitude are required'}), 400
        
    stocks = Stock.query.filter_by(product_id=product_id).all()
    
    results = []
    for s in stocks:
        dist = calculate_distance(user_lat, user_lng, s.store.latitude, s.store.longitude)
        results.append({
            'store_name': s.store.name,
            'brand': s.store.brand,
            'latitude': s.store.latitude,
            'longitude': s.store.longitude,
            'address': s.store.address,
            'quantity': s.quantity,
            'status': s.status,
            'status_class': s.status_class,
            'distance': dist
        })
        
    # 거리순 정렬
    results.sort(key=lambda x: x['distance'])
    
    return jsonify({
        'product': {
            'id': product.id,
            'name': product.name,
            'price': product.price
        },
        'stores': results
    })

if __name__ == '__main__':
    app.run(debug=True)
