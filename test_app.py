import os
os.environ['TESTING'] = 'True'
import unittest
from app import app, db, calculate_distance
from models import User, Product, Store, Stock

class ConvenienceStoreStockTestCase(unittest.TestCase):
    def setUp(self):
        # 테스트 전용 인메모리 SQLite DB 구성
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        app.config['WTF_CSRF_ENABLED'] = False
        
        self.app = app.test_client()
        
        with app.app_context():
            db.create_all()
            # 기본 더미 데이터 세팅
            self.create_dummy_data()

    def tearDown(self):
        with app.app_context():
            db.session.remove()
            db.drop_all()

    def create_dummy_data(self):
        # 테스트용 편의점 (고려대 서울캠퍼스 기준)
        s1 = Store(name="CU 고려대정문점", brand="CU", latitude=37.5896, longitude=127.0338, address="성북구 안암로 145")
        s2 = Store(name="GS25 안암스타점", brand="GS25", latitude=37.5870, longitude=127.0323, address="성북구 인촌로24길 21")
        db.session.add_all([s1, s2])
        
        # 테스트용 상품
        p1 = Product(name="불닭볶음면 큰컵", category="라면", price=1800, image_url="/static/images/ramen_3.png")
        p2 = Product(name="참치마요 삼각김밥", category="간편식", price=1200, image_url="/static/images/gimbap_1.png")
        db.session.add_all([p1, p2])
        db.session.commit()

        # 테스트용 재고
        st1 = Stock(store_id=s1.id, product_id=p1.id, quantity=5)
        st2 = Stock(store_id=s2.id, product_id=p1.id, quantity=0)
        db.session.add_all([st1, st2])
        db.session.commit()

    def test_distance_calculation(self):
        """하버사인 거리 계산 함수 동작 테스트"""
        # 고려대 서울캠퍼스(37.5888, 127.0345)에서 CU 고려대정문점(37.5896, 127.0338) 거리 계산
        dist = calculate_distance(37.5888, 127.0345, 37.5896, 127.0338)
        self.assertGreater(dist, 0)
        self.assertLess(dist, 200)  # 약 150m 이내여야 함

    def test_main_page_loading(self):
        """메인 페이지 로딩 확인"""
        response = self.app.get('/')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'\xec\x9e\xac\xea\xb3\xa0\xeb\xaa\xa8\xec\x95\x84', response.data) # '재고모아' 바이트 확인

    def test_user_registration(self):
        """회원가입 기능 테스트"""
        response = self.app.post('/register', data={
            'username': 'testuser',
            'password': 'testpassword',
            'password_confirm': 'testpassword'
        }, follow_redirects=True)
        self.assertEqual(response.status_code, 200)
        
        # 유저가 DB에 잘 생성되었는지 조회
        with app.app_context():
            user = User.query.filter_by(username='testuser').first()
            self.assertIsNotNone(user)

    def test_user_login_fail(self):
        """로그인 실패 시나리오 테스트"""
        response = self.app.post('/login', data={
            'username': 'wronguser',
            'password': 'wrongpassword'
        }, follow_redirects=True)
        self.assertIn(b'\xec\x95\x84\xec\x9d\xb4\xeb\x94\x94 \xeb\x98\x90\xeb\x8a\x94 \xeb\xb9\x84\xeb\xb0\x80\xeb\xb2\x88\xed\x98\xb8\xea\xb0\x80', response.data) # '아이디 또는 비밀번호가'

    def test_product_search(self):
        """상품 검색 기능 테스트"""
        # '불닭'으로 검색
        response = self.app.get('/search?q=불닭')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'\xeb\xb6\x88\xeb\x8b\xad\xeb\xb3\xb6\xec\x9d\x8c\xeb\xa9\xb4', response.data) # '불닭볶음면'

    def test_api_stock_sorting(self):
        """위치 좌표 기반 주변 편의점 거리 정렬 API 테스트"""
        # 반석고등학교 좌표 전송
        response = self.app.get('/api/stock/1?lat=36.3922&lng=127.3150')
        self.assertEqual(response.status_code, 200)
        data = response.json
        
        self.assertIn('product', data)
        self.assertIn('stores', data)
        self.assertEqual(len(data['stores']), 2)
        
        # 첫 번째 편의점(가장 가까운 거리여야 함)
        first_store = data['stores'][0]
        second_store = data['stores'][1]
        self.assertLessEqual(first_store['distance'], second_store['distance'])

if __name__ == '__main__':
    unittest.main()
