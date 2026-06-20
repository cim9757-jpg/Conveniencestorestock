import random
from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from werkzeug.security import generate_password_hash

db = SQLAlchemy()

class User(db.Model, UserMixin):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

class Product(db.Model):
    __tablename__ = 'products'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    category = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Integer, nullable=False)
    image_url = db.Column(db.String(300), nullable=True)  # 상품 이미지 경로 또는 URL

    stocks = db.relationship('Stock', backref='product', lazy=True)

class Store(db.Model):
    __tablename__ = 'stores'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    brand = db.Column(db.String(50), nullable=False)  # CU, GS25, 세븐일레븐, 이마트24 등
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    address = db.Column(db.String(300), nullable=False)

    stocks = db.relationship('Stock', backref='store', lazy=True)

class Stock(db.Model):
    __tablename__ = 'stocks'
    id = db.Column(db.Integer, primary_key=True)
    store_id = db.Column(db.Integer, db.ForeignKey('stores.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    quantity = db.Column(db.Integer, default=0)

    @property
    def status(self):
        if self.quantity == 0:
            return "없음"
        elif self.quantity <= 3:
            return "소량"
        else:
            return "있음"

    @property
    def status_class(self):
        if self.quantity == 0:
            return "out-of-stock"
        elif self.quantity <= 3:
            return "low-stock"
        else:
            return "in-stock"

def init_db():
    """데이터베이스 테이블을 생성하고 기본 더미 데이터를 삽입합니다."""
    db.create_all()

    # 이미 데이터가 존재하면 추가 생성을 건너뜁니다.
    if Store.query.first() is not None:
        return

    # 고려대학교 서울캠퍼스 좌표 (기준점: 37.5888, 127.0345)
    base_lat = 37.5888
    base_lng = 127.0345

    # 1. 더미 편의점 생성 (고려대학교 서울캠퍼스 인근)
    dummy_stores = [
        {"name": "CU 고려대정문점", "brand": "CU", "lat": base_lat + 0.0008, "lng": base_lng - 0.0007, "address": "서울특별시 성북구 안암로 145"},
        {"name": "GS25 안암스타점", "brand": "GS25", "lat": base_lat - 0.0018, "lng": base_lng - 0.0022, "address": "서울특별시 성북구 인촌로24길 21"},
        {"name": "세븐일레븐 고려대역점", "brand": "세븐일레븐", "lat": base_lat + 0.0031, "lng": base_lng + 0.0048, "address": "서울특별시 성북구 종암로 13"},
        {"name": "이마트24 안암본점", "brand": "이마트24", "lat": base_lat - 0.0011, "lng": base_lng + 0.0015, "address": "서울특별시 성북구 개운사길 12"},
        {"name": "CU 고려대참살이점", "brand": "CU", "lat": base_lat - 0.0035, "lng": base_lng - 0.0031, "address": "서울특별시 성북구 인촌로24길 48"},
        {"name": "GS25 고려대학교법대점", "brand": "GS25", "lat": base_lat + 0.0019, "lng": base_lng + 0.0009, "address": "서울특별시 성북구 안암로 145 고려대학교내"},
        {"name": "세븐일레븐 개운사점", "brand": "세븐일레븐", "lat": base_lat - 0.0028, "lng": base_lng + 0.0026, "address": "서울특별시 성북구 개운사길 30"},
        {"name": "이마트24 안암역점", "brand": "이마트24", "lat": base_lat - 0.0049, "lng": base_lng + 0.0005, "address": "서울특별시 성북구 인촌로 73"},
        {"name": "CU 안암오거리점", "brand": "CU", "lat": base_lat + 0.0045, "lng": base_lng - 0.0039, "address": "서울특별시 성북구 인촌로 102"},
        {"name": "GS25 고대병원점", "brand": "GS25", "lat": base_lat - 0.0021, "lng": base_lng - 0.0049, "address": "서울특별시 성북구 고려대로 73 고대안암병원"}
    ]

    stores_objects = []
    for s in dummy_stores:
        store = Store(name=s["name"], brand=s["brand"], latitude=s["lat"], longitude=s["lng"], address=s["address"])
        db.session.add(store)
        stores_objects.append(store)

    # 2. 더미 상품 생성 (인기 컵라면, 과자, 삼각김밥, 음료 등 20개 상품)
    dummy_products = [
        {"name": "매콤새콤 배홍동비빔면", "category": "라면", "price": 1200, "image": "ramen_1.png"},
        {"name": "신라면 소컵", "category": "라면", "price": 1150, "image": "ramen_2.png"},
        {"name": "불닭볶음면 큰컵", "category": "라면", "price": 1800, "image": "ramen_3.png"},
        {"name": "육개장 사발면", "category": "라면", "price": 1000, "image": "ramen_4.png"},
        {"name": "참치마요 삼각김밥", "category": "간편식", "price": 1200, "image": "gimbap_1.png"},
        {"name": "전주비빔 삼각김밥", "category": "간편식", "price": 1300, "image": "gimbap_2.png"},
        {"name": "스팸김치볶음밥 삼각김밥", "category": "간편식", "price": 1400, "image": "gimbap_3.png"},
        {"name": "혜자로운 제육도시락", "category": "간편식", "price": 4500, "image": "box_lunch_1.png"},
        {"name": "백종원 매콤돈까스도시락", "category": "간편식", "price": 5000, "image": "box_lunch_2.png"},
        {"name": "포카칩 오리지널", "category": "스낵", "price": 1700, "image": "snack_1.png"},
        {"name": "허니버터칩", "category": "스낵", "price": 1700, "image": "snack_2.png"},
        {"name": "새우깡", "category": "스낵", "price": 1500, "image": "snack_3.png"},
        {"name": "먹태청양마요칩", "category": "스낵", "price": 1800, "image": "snack_4.png"},
        {"name": "코카콜라 500ml", "category": "음료", "price": 2200, "image": "drink_1.png"},
        {"name": "펩시 제로 슈거 500ml", "category": "음료", "price": 2000, "image": "drink_2.png"},
        {"name": "바나나맛우유 240ml", "category": "음료", "price": 1800, "image": "drink_3.png"},
        {"name": "포카리스웨트 500ml", "category": "음료", "price": 2300, "image": "drink_4.png"},
        {"name": "서울우유 흰우유 1L", "category": "음료", "price": 3100, "image": "drink_5.png"},
        {"name": "하겐다즈 미니컵 초코", "category": "아이스크림", "price": 5900, "image": "ice_1.png"},
        {"name": "메로나", "category": "아이스크림", "price": 1200, "image": "ice_2.png"}
    ]

    products_objects = []
    for p in dummy_products:
        product = Product(name=p["name"], category=p["category"], price=p["price"], image_url=f"/static/images/{p['image']}")
        db.session.add(product)
        products_objects.append(product)

    db.session.commit()

    # 3. 각 편의점마다 모든 상품에 대해 랜덤 재고 할당
    for store in stores_objects:
        for product in products_objects:
            roll = random.random()
            if roll < 0.30:
                qty = 0
            elif roll < 0.70:
                qty = random.randint(1, 3)
            else:
                qty = random.randint(4, 10)
            
            stock = Stock(store_id=store.id, product_id=product.id, quantity=qty)
            db.session.add(stock)

    db.session.commit()
