import { useState, useEffect, useCallback, useRef } from 'react'
import { Card, Row, Col, Select, InputNumber, Button, Tag, Typography, Spin, Empty, Slider, message, Divider, Progress, Avatar, Badge } from 'antd'
import { GiftOutlined, ThunderboltOutlined, DollarOutlined, CalendarOutlined, BulbOutlined, ReloadOutlined, ArrowRightOutlined, StarOutlined, FireOutlined, CrownOutlined, RocketOutlined, ShareAltOutlined, SwapOutlined, HeartOutlined, SmileOutlined, TrophyOutlined, ThunderboltFilled } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { getRecommendations } from '../services/trainService'
import dayjs from 'dayjs'

const { Title, Text, Paragraph } = Typography

const THEMES = [
  { value: 'food', label: '🍜 美食探店', keywords: ['成都', '广州', '长沙', '重庆', '武汉', '西安', '南京', '厦门', '顺德', '潮州', '兰州', '贵阳'] },
  { value: 'nature', label: '🏔️ 山水风光', keywords: ['桂林', '黄山', '张家界', '九寨沟', '丽江', '大理', '杭州', '青岛', '阳朔', '香格里拉', '峨眉山', '武夷山'] },
  { value: 'ancient', label: '🏛️ 古城古镇', keywords: ['西安', '南京', '北京', '苏州', '乌镇', '周庄', '凤凰', '平遥', '丽江', '大理', '泉州', '阆中'] },
  { value: 'sea', label: '🏖️ 海滨度假', keywords: ['厦门', '青岛', '大连', '三亚', '烟台', '威海', '北海', '泉州', '秦皇岛', '舟山', '漳州', '日照'] },
  { value: 'modern', label: '🏙️ 都市购物', keywords: ['上海', '北京', '广州', '深圳', '成都', '杭州', '南京', '武汉', '重庆', '西安', '长沙', '苏州'] },
  { value: 'adventure', label: '🎒 冒险探索', keywords: ['西藏', '新疆', '青海', '云南', '四川', '贵州', '甘肃', '内蒙古', '宁夏', '黑龙江', '吉林', '长白山'] },
  { value: 'romance', label: '💕 浪漫情侣', keywords: ['三亚', '丽江', '大理', '厦门', '杭州', '成都', '桂林', '青岛', '大连', '珠海', '鼓浪屿', '西湖'] },
  { value: 'family', label: '👨‍👩‍👧 亲子游', keywords: ['北京', '上海', '广州', '深圳', '成都', '杭州', '南京', '武汉', '西安', '重庆', '长沙', '厦门'] },
  { value: 'random', label: '🎲 完全随机', keywords: [] },
]

const OPENING_ANIMATIONS = [
  { emoji: '🎰', text: '命运之轮高速旋转...', duration: 2500 },
  { emoji: '🎲', text: '骰子在魔法空间翻滚...', duration: 2800 },
  { emoji: '🎁', text: '神秘礼盒缓缓开启...', duration: 2200 },
  { emoji: '🔮', text: '水晶球正在窥探命运...', duration: 2600 },
  { emoji: '✨', text: '星尘汇聚成光束...', duration: 2400 },
  { emoji: '🌙', text: '月光精灵指引方向...', duration: 2700 },
  { emoji: '🗺️', text: '古老地图正在展开...', duration: 2300 },
  { emoji: '🎯', text: '丘比特之箭瞄准目标...', duration: 2500 },
  { emoji: '🧚', text: '小精灵正在密谋惊喜...', duration: 2600 },
  { emoji: '🐉', text: '东方神龙显现真身...', duration: 2800 },
  { emoji: '🌸', text: '樱花飘落指引前路...', duration: 2400 },
  { emoji: '🦋', text: '蝴蝶效应正在发酵...', duration: 2500 },
]

const LUCKY_RANKS = [
  { level: 'SSR', icon: '👑', name: '传说级', color: '#ff6b6b', rate: 0.05, desc: '这是今日天选之地！宇宙都在为你让路！', multiplier: 2, glow: true },
  { level: 'SR', icon: '🌟', name: '稀有级', color: '#ff9f43', rate: 0.12, desc: '非常幸运！这次旅行会成为传奇！', multiplier: 1.5, glow: true },
  { level: 'R', icon: '✨', name: '精良级', color: '#54a0ff', rate: 0.23, desc: '不错的选择！小确幸在等着你！', multiplier: 1.2, glow: false },
  { level: 'N', icon: '🎲', name: '普通级', color: '#5f27cd', rate: 0.60, desc: '稳妥之选！平淡中见真章！', multiplier: 1, glow: false },
]

const ZODIAC_SIGNS = ['♈ 白羊座', '♉ 金牛座', '♊ 双子座', '♋ 巨蟹座', '♌ 狮子座', '♍ 处女座', '♎ 天秤座', '♏ 天蝎座', '♐ 射手座', '♑ 摩羯座', '♒ 水瓶座', '♓ 双鱼座']

const FORTUNE_TEXTS = [
  '今日宜出行，忌宅家！',
  '宇宙给你发了一张旅行支票！',
  '你的灵魂正在呼唤远方！',
  '不去旅行，人生就是一碗没放盐的汤！',
  '世界那么大，你凭什么不去看看？',
  '再不出发，风景就老了！',
  '有些事，现在不做，一辈子都不会做了！',
  '旅行是治疗一切的良药！',
  '没有旅行的人生，就是没有彩蛋的盲盒！',
  '你的旅行运正在巅峰！抓住它！',
  '三千年读史，不外功名利禄；九万里悟道，终归诗酒田园。',
  '愿你出走半生，归来仍是少年。',
  '所谓自由，不是随心所欲，而是自我主宰。',
  '生活不止眼前的苟且，还有诗和远方的田野！',
  '做一个世界的水手，游遍每一个港口！',
  '每个不曾起舞的日子，都是对生命的辜负！',
  '山高水长，怕什么来不及，慌什么到不了！',
  '既然选择了远方，便只顾风雨兼程！',
  '把每一天当作生命的最后一天来过！',
  '真正的勇气，是看清生活的真相后依然热爱它！',
]

const FUNNY_FACTS = [
  '据说去了这里的人，朋友圈都会膨胀3倍！',
  '这里的美食能让你胖3斤，但绝对值得！',
  '钱包准备好了吗？这里会让你疯狂剁手！',
  '记得带2个充电宝，拍照会拍到手软！',
  '本地人会用奇怪的眼神看你的穿搭...',
  '建议带空箱子，回来肯定装不下！',
  '这里是网红打卡地，你的小红书会爆！',
  '情侣来这里，感情升温100%！',
  '单身狗慎入！到处都是撒狗粮的！',
  '建议带上你的偶像包袱，因为真的很好拍！',
  '这里的日出会让你忘记熬夜的痛苦！',
  '本地人都藏着宝藏小店，等着你的探索！',
  '这里的夜生活会让你怀疑人生！',
  '记得查好天气预报，不然可能会变成落汤鸡！',
  '这里的方言可能让你怀疑自己是不是中国人！',
]

const RANDOM_EVENTS = [
  { icon: '🌈', text: '听说这里最近有彩虹！', color: '#ff6b6b' },
  { icon: '🎪', text: '当地正在举办一年一度的庆典！', color: '#feca57' },
  { icon: '💎', text: '据说这里有隐藏的宝藏地点！', color: '#54a0ff' },
  { icon: '🌟', text: '星空观测条件极佳！', color: '#5f27cd' },
  { icon: '🎨', text: '这里是艺术家的灵感圣地！', color: '#ee5a24' },
  { icon: '🍜', text: '美食节正在进行中！', color: '#00d2d3' },
  { icon: '📷', text: '摄影师必打卡之地！', color: '#1dd1a1' },
  { icon: '🎵', text: '可能会偶遇街头艺人！', color: '#ff9ff3' },
  { icon: '🐼', text: '有机会看到可爱的当地动物！', color: '#feca57' },
  { icon: '🏮', text: '传统节日氛围浓厚！', color: '#ff6348' },
]

const DESTINATION_ADJECTIVES = [
  '神秘的', '迷人的', '古老的', '现代的', '梦幻的', '浪漫的', '刺激的', '宁静的', '热情的', '文艺的',
  '可爱的', '炫酷的', '小清新的', '接地气的', '高大上的', '亲民的', '网红的', '小众的', '宝藏的', '绝美的',
]

const DESTINATION_TITLES = [
  '人间仙境', '世外桃源', '梦想之地', '灵魂归宿', '冒险家乐园', '美食天堂', '购物圣地', '摄影天堂', 
  '不夜城', '诗画江南', '东方明珠', '西域风情', '海滨明珠', '山城雾都', '千年古都', '现代都市',
]

const WEATHER_TIPS = [
  { emoji: '☀️', text: '最近天气不错，适合出行！' },
  { emoji: '🌤️', text: '微风拂面，心情舒畅！' },
  { emoji: '⛅', text: '多云天气，拍照光线正好！' },
  { emoji: '🌦️', text: '可能有小雨，记得带伞！' },
  { emoji: '❄️', text: '气温较低，多穿点！' },
  { emoji: '🔥', text: '天气炎热，注意防晒！' },
]

const TRAVEL_MODES = [
  { icon: '✈️', text: '飞机模式 - 快速直达，舒适享受' },
  { icon: '🚄', text: '高铁模式 - 沿途风景，准时准点' },
  { icon: '🚌', text: '大巴模式 - 经济实惠，深度体验' },
  { icon: '🚗', text: '自驾模式 - 自由灵活，想停就停' },
  { icon: '🚢', text: '轮船模式 - 海上风光，悠闲自在' },
  { icon: '🛵', text: '骑行模式 - 锻炼身体，环保出行' },
]

const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)]

const getLuckyRank = () => {
  const rand = Math.random()
  let cumulative = 0
  for (const rank of LUCKY_RANKS) {
    cumulative += rank.rate
    if (rand <= cumulative) return rank
  }
  return LUCKY_RANKS[LUCKY_RANKS.length - 1]
}

const generateLuckyNumbers = () => {
  const count = Math.floor(Math.random() * 3) + 2
  return Array.from({ length: count }, () => Math.floor(Math.random() * 9) + 1)
}

const generateCombination = (arr, minCount = 2, maxCount = 4) => {
  if (!arr || arr.length === 0) return []
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  const count = Math.min(Math.floor(Math.random() * (maxCount - minCount + 1)) + minCount, arr.length)
  return shuffled.slice(0, count)
}

const generateUniqueId = () => Math.random().toString(36).substr(2, 9)

const shuffleArray = (arr) => {
  const newArr = [...arr]
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]]
  }
  return newArr
}

export default function BlindBoxPage() {
  const navigate = useNavigate()
  const [fromCity, setFromCity] = useState('北京')
  const [budget, setBudget] = useState(500)
  const [days, setDays] = useState(2)
  const [theme, setTheme] = useState('random')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [isSpinning, setIsSpinning] = useState(false)
  const [currentTip, setCurrentTip] = useState('')
  const [animationData, setAnimationData] = useState(null)
  const [spinCount, setSpinCount] = useState(0)
  const [achievements, setAchievements] = useState([])
  const [showAchievement, setShowAchievement] = useState(false)
  const [shareModal, setShareModal] = useState(false)

  const generateBlindBox = useCallback(async () => {
    const animation = getRandomItem(OPENING_ANIMATIONS)
    setAnimationData(animation)
    setIsSpinning(true)
    setResult(null)
    setCurrentTip(getRandomItem(FORTUNE_TEXTS))
    
    const spinCountRef = spinCount + 1
    setSpinCount(spinCountRef)
    
    await new Promise(resolve => setTimeout(resolve, animation.duration))
    
    setLoading(true)
    try {
      const date = dayjs().format('YYYY-MM-DD')
      const response = await getRecommendations(fromCity, date, Math.min(days * 3, 8))
      
      if (response.success && response.destinations) {
        let filteredDests = response.destinations.filter(dest => 
          dest.city && dest.tips && dest.tips.attractions && dest.tips.attractions.length > 0
        )

        if (theme !== 'random') {
          const themeData = THEMES.find(t => t.value === theme)
          if (themeData && themeData.keywords.length > 0) {
            const themed = filteredDests.filter(dest => 
              themeData.keywords.some(kw => dest.city.includes(kw))
            )
            if (themed.length > 0) {
              filteredDests = themed
            }
          }
        }

        const budgetFiltered = filteredDests.filter(dest => {
          const avgBudget = dest.avg_daily_budget || 400
          return avgBudget <= budget * 3
        })

        let selectedDest
        if (budgetFiltered.length > 0) {
          selectedDest = getRandomItem(budgetFiltered)
        } else if (filteredDests.length > 0) {
          selectedDest = getRandomItem(filteredDests)
          message.info('预算范围内目的地有限，已为你推荐惊喜选项！')
        } else {
          selectedDest = getRandomItem(response.destinations)
          message.info('已为你从全量目的地中挑选一个！')
        }

        const luckyRank = getLuckyRank()
        const luckyNumbers = generateLuckyNumbers()
        const zodiacSign = getRandomItem(ZODIAC_SIGNS)
        const funFact = getRandomItem(FUNNY_FACTS)
        const randomEvent = getRandomItem(RANDOM_EVENTS)
        const weatherTip = getRandomItem(WEATHER_TIPS)
        const travelMode = getRandomItem(TRAVEL_MODES)
        const adjective = getRandomItem(DESTINATION_ADJECTIVES)
        const title = getRandomItem(DESTINATION_TITLES)

        const attractions = selectedDest.tips?.attractions || ['当地热门景点']
        const foods = selectedDest.tips?.food || ['当地特色美食']
        const itinerary = selectedDest.tips?.itinerary_suggestion || ['探索当地文化', '品尝特色美食']
        const photoSpots = selectedDest.tips?.best_photo_spots || ['城市广场', '老街巷弄']

        const finalAttractions = generateCombination(attractions, 2, 5)
        const finalFoods = generateCombination(foods, 2, 4)
        const finalItinerary = generateCombination(itinerary, 1, 3)
        const finalPhotoSpots = generateCombination(photoSpots, 1, 3)

        const uniqueId = generateUniqueId()
        
        const isSSR = luckyRank.level === 'SSR'
        const achievementMsg = isSSR ? '🎉 恭喜！抽中传说级目的地！' : null

        if (achievementMsg && !achievements.includes(achievementMsg)) {
          setAchievements(prev => [...prev, achievementMsg])
          setShowAchievement(true)
          setTimeout(() => setShowAchievement(false), 3000)
        }

        setResult({
          id: uniqueId,
          destination: selectedDest,
          cityName: selectedDest.city,
          displayName: `${adjective}的${selectedDest.city} - ${title}`,
          tripDays: days,
          estimatedBudget: Math.round((selectedDest.avg_daily_budget || 400) * days * (0.8 + Math.random() * 0.4)),
          topAttractions: finalAttractions,
          topFoods: finalFoods,
          itinerary: finalItinerary,
          photoSpots: finalPhotoSpots,
          luckyRank: luckyRank,
          luckyNumbers: luckyNumbers,
          zodiacSign: zodiacSign,
          funFact: funFact,
          randomEvent: randomEvent,
          weatherTip: weatherTip,
          travelMode: travelMode,
          rating: selectedDest.rating || 4.0,
          tags: selectedDest.tags || [],
          description: selectedDest.description || `${selectedDest.city}是一个很棒的旅游目的地`,
          bestTime: selectedDest.best_time || '四季皆宜',
          transportTip: selectedDest.tips?.transport_tips?.[0] || '交通便利，推荐高铁出行',
          foodSpots: selectedDest.tips?.food_spots || ['美食街'],
          history: [selectedDest.city],
        })
      } else {
        message.error('获取目的地失败，请稍后再试')
      }
    } catch (err) {
      console.error('BlindBox error:', err)
      message.error('网络连接问题，请检查后重试')
    } finally {
      setLoading(false)
      setIsSpinning(false)
    }
  }, [fromCity, days, theme, budget, spinCount, achievements])

  const resetBox = () => {
    setResult(null)
    setCurrentTip('')
    setAnimationData(null)
  }

  const handleShare = () => {
    if (result) {
      const shareText = `🎁 我在【高铁旅行盲盒】抽中了「${result.cityName}」！\n\n${result.luckyRank.icon} ${result.luckyRank.name}幸运！\n📍 ${result.displayName}\n📅 ${result.tripDays}天\n💰 预算约¥${result.estimatedBudget}\n\n快来试试你的旅行运气吧！`
      
      if (navigator.share) {
        navigator.share({
          title: '高铁旅行盲盒',
          text: shareText,
          url: window.location.href,
        }).catch(() => {
          navigator.clipboard.writeText(shareText)
          message.success('已复制到剪贴板！')
        })
      } else {
        navigator.clipboard.writeText(shareText)
        message.success('分享内容已复制到剪贴板！')
      }
    }
  }

  const handleExchange = () => {
    if (result && result.history && result.history.length >= 2) {
      const prevCity = result.history[result.history.length - 2]
      message.info(`已兑换为上一个目的地：${prevCity}`)
    } else {
      message.info('继续抽取以获得更多目的地选择！')
    }
  }

  const getConfidenceScore = () => {
    if (!result) return 0
    const base = Math.random() * 30 + 60
    const rankBonus = result.luckyRank.multiplier * 10
    const final = Math.min(99, Math.round(base + rankBonus))
    return final
  }

  return (
    <div className="page-container" style={{ maxWidth: 900, margin: '0 auto' }}>
      {showAchievement && (
        <div style={{
          position: 'fixed',
          top: 100,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          background: 'linear-gradient(135deg, #ff6b6b, #ffd93d)',
          padding: '16px 32px',
          borderRadius: 16,
          boxShadow: '0 8px 32px rgba(255, 107, 107, 0.4)',
          animation: 'achievementPop 0.5s ease-out',
        }}>
          <Text strong style={{ color: 'white', fontSize: 18 }}>🎉 传说级成就解锁！</Text>
        </div>
      )}

      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Title level={2}>
          <GiftOutlined style={{ color: '#ff6b6b' }} /> 高铁旅行盲盒 <span style={{ fontSize: 24 }}>🎁</span>
        </Title>
        <Text type="secondary">
          设置条件 → 一键抽取 → 解锁你的专属旅行！每次都是独一无二的惊喜 ✨
        </Text>
      </div>

      <Row justify="center" style={{ marginBottom: 24 }}>
        <Col xs={24}>
          <Card 
            style={{ 
              borderRadius: 24, 
              background: isSpinning || result
                ? `linear-gradient(135deg, ${result?.luckyRank?.color || '#667eea'}20, ${result?.luckyRank?.color || '#764ba2'}15)`
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              boxShadow: isSpinning 
                ? '0 0 60px rgba(255, 205, 0, 0.5), 0 20px 60px rgba(0,0,0,0.3)' 
                : '0 20px 60px rgba(102, 126, 234, 0.3)',
              transition: 'all 0.3s',
              transform: isSpinning ? 'scale(1.02)' : 'scale(1)',
              overflow: 'hidden',
              position: 'relative',
            }}
            bodyStyle={{ padding: '40px 32px' }}
          >
            {isSpinning && (
              <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 70%)',
                pointerEvents: 'none',
              }} />
            )}

            {!result && !loading && (
              <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                <div style={{ 
                  fontSize: 120, 
                  marginBottom: 16,
                  animation: 'float 3s ease-in-out infinite',
                  filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.2))',
                }}>🎁</div>
                <Title level={3} style={{ color: 'white', marginBottom: 12 }}>准备好了吗？</Title>
                <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16 }}>
                  设置你的条件，开启专属旅行惊喜！
                </Text>
                <div style={{ marginTop: 16 }}>
                  <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                    {['🎲 随机惊喜', '✨ 稀有掉落', '🎯 精准匹配', '🌟 每日限定'].map((tag, i) => (
                      <Tag key={i} style={{ 
                        background: 'rgba(255,255,255,0.2)', 
                        color: 'white', 
                        border: 'none',
                        borderRadius: 12,
                        padding: '4px 12px',
                        fontSize: 13,
                      }}>{tag}</Tag>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {loading && (
              <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                <div style={{ 
                  fontSize: 90, 
                  animation: 'spin 1.5s linear infinite',
                  filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.2))',
                }}>
                  {animationData?.emoji || '🎲'}
                </div>
                <Title level={4} style={{ color: 'white', marginTop: 16, fontSize: 18 }}>
                  {animationData?.text || '正在抽取...'}
                </Title>
                <Progress 
                  percent={100} 
                  showInfo={false} 
                  strokeColor={{ '0%': '#ffecd2', '100%': '#fcb69f' }}
                  style={{ marginTop: 20 }}
                />
                <div style={{ 
                  marginTop: 16, 
                  minHeight: 24,
                  animation: 'fadeInOut 2s ease-in-out infinite',
                }}>
                  <Text style={{ color: 'white', fontSize: 16, fontStyle: 'italic' }}>
                    {currentTip}
                  </Text>
                </div>
              </div>
            )}

            {result && !loading && (
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ 
                  textAlign: 'center', 
                  marginBottom: 24,
                  animation: 'resultPop 0.6s ease-out',
                }}>
                  <div style={{ 
                    fontSize: 72, 
                    marginBottom: 8,
                    animation: 'bounce 0.8s ease-out',
                    filter: result.luckyRank.glow 
                      ? `drop-shadow(0 0 20px ${result.luckyRank.color})` 
                      : 'none',
                  }}>
                    {result.luckyRank.icon}
                  </div>
                  <Tag color={result.luckyRank.level === 'SSR' ? 'red' : result.luckyRank.level === 'SR' ? 'orange' : result.luckyRank.level === 'R' ? 'blue' : 'purple'}
                    style={{ 
                      fontSize: 16, 
                      padding: '4px 16px',
                      borderRadius: 12,
                      fontWeight: 'bold',
                      marginBottom: 12,
                    }}>
                    {result.luckyRank.level} · {result.luckyRank.name}
                  </Tag>
                  <Title level={4} style={{ color: 'white', marginBottom: 8 }}>
                    恭喜抽中 —
                  </Title>
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.25), rgba(255,255,255,0.15))',
                    borderRadius: 20,
                    padding: '12px 24px',
                    display: 'inline-block',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    marginBottom: 8,
                  }}>
                    <Text strong style={{ color: 'white', fontSize: 28, textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                      {result.cityName}
                    </Text>
                  </div>
                  <div style={{
                    background: 'rgba(0,0,0,0.2)',
                    borderRadius: 12,
                    padding: '6px 16px',
                    display: 'inline-block',
                  }}>
                    <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>
                      {result.displayName}
                    </Text>
                  </div>
                </div>

                <Card 
                  style={{ 
                    borderRadius: 20, 
                    marginBottom: 16, 
                    border: 'none', 
                    background: 'rgba(255,255,255,0.98)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                  }}
                  bodyStyle={{ padding: 24 }}
                >
                  <div style={{ 
                    background: `linear-gradient(135deg, ${result.luckyRank.color}15, ${result.luckyRank.color}25)`,
                    borderRadius: 16,
                    padding: 20,
                    marginBottom: 20,
                    border: `1px solid ${result.luckyRank.color}30`,
                  }}>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                      <div style={{ 
                        textAlign: 'center', 
                        flex: '1 1 100px',
                        background: 'white',
                        borderRadius: 12,
                        padding: 12,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                      }}>
                        <div style={{ fontSize: 24, marginBottom: 4 }}>🚄</div>
                        <div style={{ fontSize: 14, fontWeight: 'bold', color: '#333' }}>
                          {result.tripDays}天行程
                        </div>
                      </div>
                      <div style={{ 
                        textAlign: 'center', 
                        flex: '1 1 100px',
                        background: 'white',
                        borderRadius: 12,
                        padding: 12,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                      }}>
                        <div style={{ fontSize: 24, marginBottom: 4 }}>💰</div>
                        <div style={{ fontSize: 14, fontWeight: 'bold', color: '#333' }}>
                          约 ¥{result.estimatedBudget}
                        </div>
                      </div>
                      <div style={{ 
                        textAlign: 'center', 
                        flex: '1 1 100px',
                        background: 'white',
                        borderRadius: 12,
                        padding: 12,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                      }}>
                        <div style={{ fontSize: 24, marginBottom: 4 }}>⭐</div>
                        <div style={{ fontSize: 14, fontWeight: 'bold', color: '#333' }}>
                          {result.rating} 分推荐
                        </div>
                      </div>
                      <div style={{ 
                        textAlign: 'center', 
                        flex: '1 1 100px',
                        background: 'white',
                        borderRadius: 12,
                        padding: 12,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                      }}>
                        <div style={{ fontSize: 24, marginBottom: 4 }}>🎯</div>
                        <div style={{ fontSize: 14, fontWeight: 'bold', color: '#333' }}>
                          匹配度 {getConfidenceScore()}%
                        </div>
                      </div>
                    </div>
                  </div>

                  {result.tags && result.tags.length > 0 && (
                    <div style={{ marginBottom: 16, textAlign: 'center' }}>
                      {result.tags.slice(0, 6).map((tag, i) => (
                        <Tag key={i} color="purple" style={{ margin: 4, fontSize: 13, borderRadius: 8 }}>#{tag}</Tag>
                      ))}
                    </div>
                  )}

                  <Divider style={{ margin: '16px 0' }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>🎲 抽中概率：{Math.round(result.luckyRank.rate * 100)}%</Text>
                  </Divider>

                  <div style={{ marginBottom: 20 }}>
                    <Text strong style={{ display: 'block', marginBottom: 12, fontSize: 15 }}>
                      <StarOutlined style={{ color: '#ffc107' }} /> {result.randomEvent.icon} 随机事件
                    </Text>
                    <div style={{
                      background: `linear-gradient(135deg, ${result.randomEvent.color}10, ${result.randomEvent.color}20)`,
                      borderRadius: 12,
                      padding: '12px 16px',
                      borderLeft: `4px solid ${result.randomEvent.color}`,
                    }}>
                      <Text style={{ color: '#333' }}>{result.randomEvent.icon} {result.randomEvent.text}</Text>
                    </div>
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <Text strong style={{ display: 'block', marginBottom: 12, fontSize: 15 }}>
                      <FireOutlined style={{ color: '#ff4d4f' }} /> 必去景点 ({result.topAttractions.length})
                    </Text>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {result.topAttractions.map((attr, i) => (
                        <Tag key={i} color="geekblue" style={{ fontSize: 13, padding: '6px 12px', borderRadius: 8 }}>
                          🎯 {attr}
                        </Tag>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <Text strong style={{ display: 'block', marginBottom: 12, fontSize: 15 }}>
                      🍽️ 必吃美食 ({result.topFoods.length})
                    </Text>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {result.topFoods.map((food, i) => (
                        <Tag key={i} color="volcano" style={{ fontSize: 13, padding: '6px 12px', borderRadius: 8 }}>
                          😋 {food}
                        </Tag>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <Text strong style={{ display: 'block', marginBottom: 12, fontSize: 15 }}>
                      📷 拍照打卡点
                    </Text>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {result.photoSpots.map((spot, i) => (
                        <Tag key={i} color="magenta" style={{ fontSize: 13, padding: '6px 12px', borderRadius: 8 }}>
                          📷 {spot}
                        </Tag>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <Text strong style={{ display: 'block', marginBottom: 12, fontSize: 15 }}>
                      📋 行程建议
                    </Text>
                    {result.itinerary.map((item, i) => (
                      <div key={i} style={{ 
                        padding: '10px 14px', 
                        background: '#f6ffed', 
                        borderRadius: 10, 
                        marginBottom: 8,
                        borderLeft: '4px solid #52c41a',
                      }}>
                        <Text>📍 {item}</Text>
                      </div>
                    ))}
                  </div>

                  <Divider style={{ margin: '16px 0' }} />

                  <div style={{ 
                    background: `linear-gradient(135deg, ${result.luckyRank.color}10, ${result.luckyRank.color}30)`,
                    borderRadius: 16,
                    padding: 20,
                    marginBottom: 16,
                    border: `1px solid ${result.luckyRank.color}20`,
                  }}>
                    <div style={{ textAlign: 'center', marginBottom: 16 }}>
                      <Text strong style={{ fontSize: 16, color: result.luckyRank.color }}>
                        <TrophyOutlined /> 今日幸运元素
                      </Text>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 16 }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 28 }}>{result.zodiacSign.split(' ')[0]}</div>
                        <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{result.zodiacSign.split(' ')[1]}</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 22, fontWeight: 'bold', color: result.luckyRank.color }}>
                          {result.luckyNumbers.join(' · ')}
                        </div>
                        <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>幸运数字</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 22, fontWeight: 'bold', color: result.luckyRank.color }}>
                          x{result.luckyRank.multiplier}
                        </div>
                        <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>运气加成</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 24 }}>{result.weatherTip.emoji}</div>
                        <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>天气提示</div>
                      </div>
                    </div>
                  </div>

                  <div style={{
                    background: '#fff7e6',
                    borderRadius: 12,
                    padding: 14,
                    marginBottom: 12,
                    borderLeft: '4px solid #fa8c16',
                  }}>
                    <Text><strong>💡 小贴士：</strong>{result.funFact}</Text>
                  </div>

                  <div style={{
                    background: '#e6f7ff',
                    borderRadius: 12,
                    padding: 14,
                    borderLeft: '4px solid #1890ff',
                  }}>
                    <Text>{result.travelMode.icon} <strong>推荐出行：</strong>{result.travelMode.text}</Text>
                  </div>
                </Card>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Button 
                    type="primary" 
                    size="large"
                    icon={<ArrowRightOutlined />}
                    onClick={() => navigate(`/destinations/${encodeURIComponent(result.cityName)}`)}
                    style={{ 
                      minWidth: 130, 
                      height: 48, 
                      fontSize: 15,
                      background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      border: 'none',
                      borderRadius: 12,
                      fontWeight: 'bold',
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                    }}
                  >
                    查看详情
                  </Button>
                  <Button 
                    type="primary" 
                    size="large"
                    icon={<RocketOutlined />}
                    onClick={() => navigate(`/itinerary?city=${encodeURIComponent(result.cityName)}&days=${days}`)}
                    style={{ 
                      minWidth: 130, 
                      height: 48, 
                      fontSize: 15,
                      background: 'linear-gradient(135deg, #11998e, #38ef7d)',
                      border: 'none',
                      borderRadius: 12,
                      fontWeight: 'bold',
                      boxShadow: '0 4px 12px rgba(17, 153, 142, 0.4)',
                    }}
                  >
                    生成行程
                  </Button>
                  <Button 
                    size="large"
                    icon={<SwapOutlined />}
                    onClick={handleExchange}
                    style={{ 
                      minWidth: 110, 
                      height: 48, 
                      fontSize: 15,
                      borderRadius: 12,
                    }}
                  >
                    换一个
                  </Button>
                  <Button 
                    size="large"
                    icon={<ShareAltOutlined />}
                    onClick={handleShare}
                    style={{ 
                      minWidth: 110, 
                      height: 48, 
                      fontSize: 15,
                      borderRadius: 12,
                    }}
                  >
                    分享
                  </Button>
                  <Button 
                    size="large"
                    icon={<ReloadOutlined />}
                    onClick={resetBox}
                    style={{ 
                      minWidth: 110, 
                      height: 48, 
                      fontSize: 15,
                      borderRadius: 12,
                    }}
                  >
                    重新设置
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {!result && !loading && (
        <>
          <Card 
            title={<Text strong><BulbOutlined /> 个性化设置</Text>}
            style={{ borderRadius: 20, marginBottom: 16 }}
          >
            <Row gutter={[16, 24]}>
              <Col xs={24} sm={12} md={6}>
                <Text strong style={{ fontSize: 14 }}>🏠 出发城市</Text>
                <Select
                  value={fromCity}
                  onChange={setFromCity}
                  style={{ width: '100%', marginTop: 8 }}
                  showSearch
                  placeholder="选择出发城市"
                  options={[
                    { label: '北京', value: '北京' },
                    { label: '上海', value: '上海' },
                    { label: '广州', value: '广州' },
                    { label: '深圳', value: '深圳' },
                    { label: '杭州', value: '杭州' },
                    { label: '成都', value: '成都' },
                    { label: '南京', value: '南京' },
                    { label: '武汉', value: '武汉' },
                    { label: '西安', value: '西安' },
                    { label: '重庆', value: '重庆' },
                    { label: '长沙', value: '长沙' },
                    { label: '郑州', value: '郑州' },
                    { label: '天津', value: '天津' },
                    { label: '苏州', value: '苏州' },
                    { label: '厦门', value: '厦门' },
                    { label: '青岛', value: '青岛' },
                  ]}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Text strong style={{ fontSize: 14 }}>📅 旅行天数</Text>
                <div style={{ marginTop: 8 }}>
                  <Slider
                    min={1}
                    max={7}
                    value={days}
                    onChange={setDays}
                    marks={{ 1: '1天', 3: '3天', 5: '5天', 7: '7天' }}
                  />
                </div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Text strong style={{ fontSize: 14 }}>💰 日均预算</Text>
                <div style={{ marginTop: 8 }}>
                  <InputNumber
                    min={100}
                    max={2000}
                    step={50}
                    value={budget}
                    onChange={setBudget}
                    style={{ width: '100%' }}
                    prefix={<DollarOutlined />}
                    formatter={value => `¥ ${value}`}
                  />
                </div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Text strong style={{ fontSize: 14 }}>🎨 旅行主题</Text>
                <Select
                  value={theme}
                  onChange={setTheme}
                  style={{ width: '100%', marginTop: 8 }}
                  options={THEMES.map(t => ({ value: t.value, label: t.label }))}
                />
              </Col>
            </Row>

            <div style={{ textAlign: 'center', marginTop: 28 }}>
              <Button
                type="primary"
                size="large"
                icon={<GiftOutlined />}
                onClick={generateBlindBox}
                loading={loading}
                style={{ 
                  minWidth: 280, 
                  height: 64, 
                  fontSize: 20,
                  background: 'linear-gradient(135deg, #ff6b6b, #ffd93d, #6bcb77)',
                  border: 'none',
                  fontWeight: 'bold',
                  boxShadow: '0 8px 24px rgba(255, 107, 107, 0.4)',
                  borderRadius: 16,
                }}
              >
                🎁 开启盲盒之旅 🎁
              </Button>
              <div style={{ marginTop: 12 }}>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  已累计抽取 <Text strong style={{ color: '#ff6b6b' }}>{spinCount}</Text> 次 · 
                  成就解锁 <Text strong style={{ color: '#ffd93d' }}>{achievements.length}</Text> 个
                </Text>
              </div>
            </div>
          </Card>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Card style={{ borderRadius: 20, height: '100%' }}>
                <Title level={5} style={{ marginBottom: 12 }}>🎲 盲盒玩法</Title>
                <ul style={{ paddingLeft: 20, fontSize: 14 }}>
                  <li style={{ marginBottom: 8 }}>设置你的出发地、预算、天数和主题</li>
                  <li style={{ marginBottom: 8 }}>系统从可达目的地中<span style={{ color: '#ff6b6b', fontWeight: 'bold' }}>随机</span>抽取</li>
                  <li style={{ marginBottom: 8 }}>每个目的地有<span style={{ color: '#ff9f43', fontWeight: 'bold' }}>稀有度</span>（SSR/SR/R/N）</li>
                  <li style={{ marginBottom: 8 }}>还会获得<span style={{ color: '#54a0ff', fontWeight: 'bold' }}>幸运数字</span>和<span style={{ color: '#5f27cd', fontWeight: 'bold' }}>随机事件</span></li>
                  <li style={{ marginBottom: 8 }}>可以查看详情、生成行程、换一个、分享给好友</li>
                  <li>每次结果<span style={{ color: '#00d2d3', fontWeight: 'bold' }}>完全随机</span>，绝不重复！</li>
                </ul>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card style={{ borderRadius: 20, height: '100%' }}>
                <Title level={5} style={{ marginBottom: 12 }}>💎 稀有度说明</Title>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {LUCKY_RANKS.map(rank => (
                    <div key={rank.level} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: 12,
                      background: `${rank.color}10`,
                      borderRadius: 12,
                      border: `1px solid ${rank.color}30`,
                    }}>
                      <div style={{ fontSize: 28 }}>{rank.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold', color: rank.color }}>
                          {rank.level} · {rank.name}
                        </div>
                        <div style={{ fontSize: 12, color: '#666' }}>
                          概率 {Math.round(rank.rate * 100)}% · 运气加成 x{rank.multiplier}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </Col>
          </Row>
        </>
      )}

      <style>{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-20px); }
          60% { transform: translateY(-10px); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fadeInOut {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        @keyframes resultPop {
          0% { opacity: 0; transform: scale(0.8); }
          50% { transform: scale(1.05); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes achievementPop {
          0% { opacity: 0; transform: translate(-50%, -30px); }
          100% { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </div>
  )
}
