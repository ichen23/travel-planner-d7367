import { Row, Col, Card, Typography, Tag } from 'antd'
import { RocketOutlined, StarOutlined, ThunderboltOutlined, EnvironmentOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import SearchBar from '../components/SearchBar'

const { Title, Paragraph, Text } = Typography

const FEATURES = [
  { icon: <ThunderboltOutlined style={{ fontSize: 32, color: '#ff6b6b' }} />, title: '实时余票查询', desc: '12306数据源，秒级刷新余票状态' },
  { icon: <RocketOutlined style={{ fontSize: 32, color: '#4ecdc4' }} />, title: '智能推荐', desc: '根据高铁时长和偏好推荐合适目的地' },
  { icon: <StarOutlined style={{ fontSize: 32, color: '#ffa502' }} />, title: '精选攻略', desc: '景点、美食、住宿、交通一站式信息' },
  { icon: <EnvironmentOutlined style={{ fontSize: 32, color: '#a55eea' }} />, title: '地图规划', desc: '可视化地图，清晰展示景点位置' },
]

const POPULAR_ROUTES = [
  { from: '北京', to: '上海', time: '4.5h', price: 553 },
  { from: '上海', to: '杭州', time: '1h', price: 73 },
  { from: '广州', to: '深圳', time: '30min', price: 74 },
  { from: '成都', to: '重庆', time: '2h', price: 96 },
  { from: '武汉', to: '长沙', time: '1.5h', price: 164 },
  { from: '西安', to: '郑州', time: '2.5h', price: 230 },
]

const TIPS = [
  '📌 提前7-14天订票价格最优',
  '🎁 学生票可享受75折优惠',
  '🚄 高铁二等座舒适度最高',
  '🍜 车上有免费开水供应',
  '📱 下载12306 APP方便改签',
  '🗺️ 到站后地铁可达市区',
]

const QUOTES = [
  { text: '世界灿烂盛大，欢迎回家。', author: '木苏里《全球高考》' },
  { text: '愿你出走半生，归来仍是少年。', author: '苏轼' },
  { text: '山长水远，终会相见。', author: '佚名' },
  { text: '跨越山海，只为遇见你。', author: '佚名' },
]

export default function HomePage() {
  const navigate = useNavigate()
  const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)]

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #fff5f5 0%, #f0f5ff 50%, #ffffff 100%)' }}>
      <div className="page-container">
        <div style={{ textAlign: 'center', padding: '80px 24px 40px', position: 'relative' }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 200,
            height: 200,
            background: 'radial-gradient(circle, rgba(255,107,107,0.1) 0%, transparent 70%)',
            borderRadius: '50%',
          }} />
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              fontSize: 64,
              marginBottom: 16,
              animation: 'float 3s ease-in-out infinite',
            }}>
              🚄
            </div>
            
            <Title level={1} style={{ 
              fontSize: 48, 
              marginBottom: 24,
              background: 'linear-gradient(135deg, #ff6b6b, #ffd93d, #6bcb77)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              世界灿烂盛大，欢迎回家
            </Title>

            <div style={{
              fontSize: 16,
              color: '#666',
              marginBottom: 32,
              fontStyle: 'italic',
            }}>
              — {randomQuote.author}
            </div>

            <Paragraph style={{ 
              fontSize: 18, 
              color: '#555', 
              maxWidth: 600, 
              margin: '0 auto 32px',
              lineHeight: 1.8,
            }}>
              跨越山海，只为遇见更好的风景
              <br />
              输入一个出发城市，开启你的旅程 ✨
            </Paragraph>

            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 24,
              flexWrap: 'wrap',
            }}>
              <div style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #ff6b6b20, #ff6b6b10)',
                borderRadius: 20,
                border: '1px solid #ff6b6b30',
              }}>
                <Text style={{ color: '#ff6b6b', fontSize: 14 }}>🌟 连接 1600+ 城市</Text>
              </div>
              <div style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #4ecdc420, #4ecdc410)',
                borderRadius: 20,
                border: '1px solid #4ecdc430',
              }}>
                <Text style={{ color: '#4ecdc4', fontSize: 14 }}>🎯 精准推荐</Text>
              </div>
              <div style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #ffa50220, #ffa50210)',
                borderRadius: 20,
                border: '1px solid #ffa50230',
              }}>
                <Text style={{ color: '#ffa502', fontSize: 14 }}>💡 智能攻略</Text>
              </div>
            </div>
          </div>
        </div>

        <SearchBar />

        <Row gutter={[24, 24]} style={{ marginTop: 48 }}>
          {FEATURES.map((f, i) => (
            <Col xs={24} sm={12} md={6} key={i}>
              <Card className="card-hover" variant="borderless" style={{ 
                textAlign: 'center', 
                padding: 24,
                borderRadius: 16,
                background: 'linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
              }}>
                {f.icon}
                <Title level={4} style={{ marginTop: 16, marginBottom: 8 }}>{f.title}</Title>
                <Paragraph type="secondary" style={{ margin: 0 }}>{f.desc}</Paragraph>
              </Card>
            </Col>
          ))}
        </Row>

        <div style={{ marginTop: 48 }}>
          <Title level={3}>🔥 热门高铁线路</Title>
          <Row gutter={[16, 16]}>
            {POPULAR_ROUTES.map((route, i) => (
              <Col xs={12} md={8} lg={4} key={i}>
                <Card
                  className="card-hover"
                  variant="borderless"
                  hoverable
                  onClick={() => navigate(`/trains?from=${route.from}&to=${route.to}&date=${new Date(Date.now() + 7*24*60*60*1000).toISOString().slice(0, 10)}`)}
                  style={{ 
                    borderRadius: 16, 
                    textAlign: 'center', 
                    padding: 16,
                    transition: 'all 0.3s',
                  }}
                >
                  <div style={{ fontSize: 20, fontWeight: 'bold', color: '#1677ff' }}>
                    {route.from} → {route.to}
                  </div>
                  <div style={{ marginTop: 8, color: '#666' }}>
                    🕐 {route.time}
                  </div>
                  <div style={{ marginTop: 4, color: '#ff6b6b', fontWeight: 'bold', fontSize: 18 }}>
                    ¥{route.price}起
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        <div style={{ marginTop: 48, marginBottom: 48 }}>
          <Title level={3}>💡 出行小贴士</Title>
          <Card variant="borderless" style={{ borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <Row gutter={[16, 16]}>
              {TIPS.map((tip, i) => (
                <Col xs={24} sm={12} md={8} key={i}>
                  <div style={{ 
                    padding: '12px 16px', 
                    fontSize: 14,
                    background: 'linear-gradient(135deg, #f0fff4 0%, #e6fffb 100%)',
                    borderRadius: 12,
                    borderLeft: '4px solid #52c41a',
                  }}>
                    <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                    {tip}
                  </div>
                </Col>
              ))}
            </Row>
          </Card>
        </div>

        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-15px); }
          }
        `}</style>
      </div>
    </div>
  )
}
