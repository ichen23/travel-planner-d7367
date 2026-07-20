import { useState, useEffect, useMemo } from 'react'
import { Row, Col, Card, Typography, Spin, Empty, Select, Slider, message, Tag, Button, Divider, Radio, Checkbox, Collapse } from 'antd'
import { useSearchParams } from 'react-router-dom'
import { FilterOutlined, SortAscendingOutlined, StarOutlined, ThunderboltOutlined, DollarOutlined, EnvironmentOutlined, ReloadOutlined, CloseOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'
import { getRecommendations } from '../services/destinationService'
import DestinationCard from '../components/DestinationCard'
import { 
  PREFERENCES, 
  DURATION_OPTIONS,
  CITY_TYPES,
  CATEGORY_FILTERS,
  SORT_OPTIONS,
  getCityType,
  matchCategory,
  getDurationMinutes,
  getPriceNumber,
} from '../utils/constants'

const { Title, Text } = Typography
const { Panel } = Collapse

const CITY_TYPE_COLORS = {
  popular: 'red',
  provincial: 'blue',
  prefecture: 'default',
  scenic: 'orange',
  ancient: 'purple',
}

const CITY_TYPE_NAMES = {
  popular: '热门城市',
  provincial: '省会城市',
  prefecture: '地级市',
  scenic: '特色景点',
  ancient: '古城古镇',
}

export default function DestinationListPage() {
  const [params] = useSearchParams()
  const defaultDate = new Date(Date.now() + 7*24*60*60*1000).toISOString().slice(0, 10)
  const [fromCity, setFromCity] = useState(params.get('from') || localStorage.getItem('lastFromCity') || '北京')
  const [date, setDate] = useState(params.get('date') || localStorage.getItem('lastDate') || defaultDate)
  const [duration, setDuration] = useState(Number(params.get('duration')) || Number(localStorage.getItem('lastDuration')) || 3)
  const [preference, setPreference] = useState(params.get('preference') || localStorage.getItem('lastPreference') || '')
  const [destinations, setDestinations] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const [selectedCityTypes, setSelectedCityTypes] = useState(['all'])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('default')
  const [sortOrder, setSortOrder] = useState('desc')
  const [showFilters, setShowFilters] = useState(true)

  const fetchData = async () => {
    if (!fromCity || !date) {
      message.warning('请先在首页选择出发城市和日期')
      return
    }
    setLoading(true)
    setSearched(true)
    try {
      const result = await getRecommendations(fromCity, date, duration, preference)
      if (result.success) {
        setDestinations(result.destinations)
        localStorage.setItem('lastFromCity', fromCity)
        localStorage.setItem('lastDate', date)
        localStorage.setItem('lastDuration', duration.toString())
        localStorage.setItem('lastPreference', preference)
      } else {
        message.error('获取推荐失败')
      }
    } catch (err) {
      message.error('网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (fromCity && date) {
      fetchData()
    }
  }, [fromCity, date])

  const filteredDestinations = useMemo(() => {
    let result = [...destinations]

    if (selectedCityTypes.length > 0 && !selectedCityTypes.includes('all')) {
      result = result.filter(dest => {
        const cityType = getCityType(dest.city, dest.tags)
        return selectedCityTypes.includes(cityType)
      })
    }

    if (selectedCategory !== 'all') {
      result = result.filter(dest => 
        matchCategory(dest.city, dest.tags || [], selectedCategory)
      )
    }

    switch (sortBy) {
      case 'rating':
        result.sort((a, b) => (sortOrder === 'desc' ? 1 : -1) * ((b.rating || 0) - (a.rating || 0)))
        break
      case 'duration':
        result.sort((a, b) => {
          const aMin = getDurationMinutes(a.duration)
          const bMin = getDurationMinutes(b.duration)
          return (sortOrder === 'asc' ? 1 : -1) * (aMin - bMin)
        })
        break
      case 'price':
        result.sort((a, b) => {
          const aPrice = getPriceNumber(a.price)
          const bPrice = getPriceNumber(b.price)
          return (sortOrder === 'asc' ? 1 : -1) * (aPrice - bPrice)
        })
        break
      case 'popular':
        result.sort((a, b) => {
          const aIsHot = ['北京', '上海', '广州', '深圳', '成都', '杭州'].includes(a.city)
          const bIsHot = ['北京', '上海', '广州', '深圳', '成都', '杭州'].includes(b.city)
          return (sortOrder === 'desc' ? 1 : -1) * (bIsHot - aIsHot || (b.rating || 0) - (a.rating || 0))
        })
        break
      default:
        break
    }

    return result
  }, [destinations, selectedCityTypes, selectedCategory, sortBy, sortOrder])

  const cityTypeStats = useMemo(() => {
    const stats = {}
    destinations.forEach(dest => {
      const type = getCityType(dest.city, dest.tags)
      stats[type] = (stats[type] || 0) + 1
    })
    return stats
  }, [destinations])

  const categoryStats = useMemo(() => {
    const stats = {}
    destinations.forEach(dest => {
      const tags = dest.tags || []
      CATEGORY_FILTERS.forEach(cat => {
        if (cat.value !== 'all' && matchCategory(dest.city, tags, cat.value)) {
          stats[cat.value] = (stats[cat.value] || 0) + 1
        }
      })
    })
    return stats
  }, [destinations])

  const hasActiveFilters = selectedCityTypes.length > 0 && !selectedCityTypes.includes('all') || 
                          selectedCategory !== 'all' || sortBy !== 'default'

  const clearFilters = () => {
    setSelectedCityTypes(['all'])
    setSelectedCategory('all')
    setSortBy('default')
    setSortOrder('desc')
  }

  const handleCityTypeChange = (types) => {
    if (types.length === 0) {
      setSelectedCityTypes(['all'])
    } else {
      setSelectedCityTypes(types.filter(t => t !== 'all'))
    }
  }

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={2} style={{ marginBottom: 0 }}>
          推荐目的地 - 从 <Text type="secondary">{fromCity}</Text> 出发
        </Title>
        <Button 
          icon={<FilterOutlined />} 
          onClick={() => setShowFilters(!showFilters)}
          type={showFilters ? 'primary' : 'default'}
        >
          {showFilters ? '收起筛选' : '展开筛选'}
        </Button>
      </div>

      {date && (
        <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
          出行日期: {date} | 最大高铁行程: {duration}小时 | 偏好: {preference || '综合推荐'}
        </Text>
      )}

      {showFilters && (
        <Card size="small" style={{ marginBottom: 24, borderRadius: 12, background: '#fafafa' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
            <FilterOutlined style={{ marginRight: 8, color: '#1677ff' }} />
            <Text strong>筛选 & 排序</Text>
            {hasActiveFilters && (
              <Button 
                size="small" 
                type="link" 
                icon={<CloseOutlined />} 
                onClick={clearFilters}
                style={{ marginLeft: 'auto' }}
              >
                清除所有筛选
              </Button>
            )}
          </div>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <div style={{ marginBottom: 12 }}>
                <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>
                  🏙️ 城市类型
                </Text>
                <Checkbox.Group 
                  value={selectedCityTypes} 
                  onChange={handleCityTypeChange}
                  style={{ display: 'flex', flexDirection: 'column', gap: 6 }}
                >
                  {CITY_TYPES.filter(t => t.value !== 'all').map(type => (
                    <Checkbox 
                      key={type.value} 
                      value={type.value}
                      style={{ fontSize: 13 }}
                    >
                      {type.icon} {type.label}
                      {cityTypeStats[type.value] !== undefined && (
                        <Text type="secondary" style={{ marginLeft: 4, fontSize: 12 }}>
                          ({cityTypeStats[type.value]})
                        </Text>
                      )}
                    </Checkbox>
                  ))}
                </Checkbox.Group>
              </div>
            </Col>

            <Col xs={24} md={8}>
              <div style={{ marginBottom: 12 }}>
                <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>
                  🎯 特色分类
                </Text>
                <Radio.Group 
                  value={selectedCategory} 
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}
                >
                  {CATEGORY_FILTERS.map(cat => (
                    <Radio.Button key={cat.value} value={cat.value} style={{ fontSize: 13 }}>
                      {cat.label}
                      {cat.value !== 'all' && categoryStats[cat.value] !== undefined && (
                        <Text style={{ marginLeft: 4, fontSize: 11 }}>
                          ({categoryStats[cat.value]})
                        </Text>
                      )}
                    </Radio.Button>
                  ))}
                </Radio.Group>
              </div>
            </Col>

            <Col xs={24} md={8}>
              <div style={{ marginBottom: 12 }}>
                <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>
                  <SortAscendingOutlined /> 排序方式
                </Text>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Select
                    value={sortBy}
                    onChange={setSortBy}
                    style={{ flex: 1 }}
                    options={SORT_OPTIONS}
                  />
                  {sortBy !== 'default' && (
                    <Button 
                      icon={sortOrder === 'desc' ? <ArrowDownOutlined /> : <ArrowUpOutlined />}
                      onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                    >
                      {sortOrder === 'desc' ? '降序' : '升序'}
                    </Button>
                  )}
                </div>
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    当前显示: <Text strong style={{ color: '#1677ff' }}>{filteredDestinations.length}</Text> / {destinations.length} 个目的地
                  </Text>
                </div>
              </div>
            </Col>
          </Row>
        </Card>
      )}

      <Card size="small" style={{ marginBottom: 24, borderRadius: 12 }}>
        <Row gutter={16} align="middle">
          <Col xs={24} sm={8} md={6}>
            <Text>最大高铁行程: </Text>
            <Select
              value={duration}
              onChange={(v) => { setDuration(v); fetchData() }}
              options={DURATION_OPTIONS}
              style={{ width: 120 }}
            />
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Text>偏好类型: </Text>
            <Select
              value={preference}
              onChange={(v) => { setPreference(v); fetchData() }}
              options={PREFERENCES}
              style={{ width: 120 }}
            />
          </Col>
          <Col xs={24} sm={8} md={12} style={{ textAlign: 'right' }}>
            <Text type="secondary">
              已找到 <Text strong>{filteredDestinations.length}</Text> 个推荐目的地
              {hasActiveFilters && destinations.length !== filteredDestinations.length && (
                <Text type="secondary">
                  {' '}(从 {destinations.length} 中筛选)
                </Text>
              )}
            </Text>
          </Col>
        </Row>
      </Card>

      {loading && <Spin style={{ display: 'block', margin: '80px auto' }} size="large" />}

      {!loading && searched && filteredDestinations.length === 0 && (
        <Empty
          description={hasActiveFilters 
            ? '没有符合筛选条件的目的地，试试调整筛选条件' 
            : '没有符合条件的目的地，试试放宽时间限制或更换出发城市'}
          style={{ margin: '80px 0' }}
        >
          {hasActiveFilters && (
            <Button type="primary" onClick={clearFilters}>
              清除筛选条件
            </Button>
          )}
        </Empty>
      )}

      {!loading && filteredDestinations.length > 0 && (
        <Row gutter={[16, 16]}>
          {filteredDestinations.map((d, i) => (
            <Col xs={24} sm={12} md={8} lg={6} key={`${d.city}-${i}`}>
              <DestinationCard dest={d} />
            </Col>
          ))}
        </Row>
      )}

      {!searched && (
        <Card style={{ textAlign: 'center', padding: 48, borderRadius: 12 }}>
          <Empty
            description="请先在首页选择出发城市和日期，然后点击搜索"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      )}
    </div>
  )
}
