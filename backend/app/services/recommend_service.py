import asyncio
import random
from app.services.city_database import (
    get_recommendations, get_city_info, get_destinations_count,
    CITY_COORDS, get_high_speed_routes
)
from app.services.amap_service import get_city_content_full, geocode_city

GENERIC_ATTRACTIONS = [
    "当地历史博物馆", "城市地标建筑", "公园绿地", "古镇老街", "自然风景区",
    "主题乐园", "水族馆", "动物园", "植物园", "寺庙道观",
    "教堂遗址", "古城墙", "纪念碑", "广场喷泉", "艺术画廊",
]

GENERIC_FOODS = [
    "当地特色小吃", "老字号餐厅", "夜市美食街", "网红打卡店", "私房菜",
    "烧烤大排档", "火锅", "特色面食", "海鲜大排档", "甜品店",
    "咖啡馆", "茶馆", "小吃连锁店", "农家乐", "特色手信",
]

GENERIC_ITINERARIES = [
    "Day1: 抵达当地，入住酒店，逛逛夜市",
    "Day1: 游览市区主要景点，品尝当地美食",
    "Day2: 前往周边景区，感受自然风光",
    "Day2: 深度游市区，参观博物馆",
    "Day3: 休闲购物，体验当地生活",
    "Day3: 探索小众景点，拍照打卡",
    "Day4: 品尝地道美食，返程",
    "Day4: 体验当地民俗文化",
]

GENERIC_TRANSPORT_TIPS = [
    "推荐下载当地地铁APP，出行更便捷",
    "市区景点间有旅游专线巴士",
    "共享单车短距离出行很方便",
    "打车记得使用正规叫车软件",
    "机场到市区有机场大巴和地铁",
    "火车站附近有直达景区的公交",
]

GENERIC_CITY_DESCRIPTIONS = [
    "是一座充满历史底蕴的城市，古迹众多，文化氛围浓厚。",
    "以自然风光闻名，山清水秀，是放松身心的好去处。",
    "现代与传统交融，既有高楼大厦，又有老街古巷。",
    "美食之都，各种特色小吃让人流连忘返。",
    "适合休闲度假的城市，节奏慢，生活惬意。",
    "充满活力的年轻城市，夜生活丰富多彩。",
    "历史文化名城，曾多次成为重要的政治文化中心。",
    "山水相依的城市，自然景观令人赞叹。",
]

def _enrich_empty_tips(city_name, existing_tips):
    if not existing_tips:
        existing_tips = {}
    
    attractions = existing_tips.get('attractions', [])
    if not attractions:
        shuffled = random.sample(GENERIC_ATTRACTIONS, min(5, len(GENERIC_ATTRACTIONS)))
        attractions = [f"{city_name}{a}" for a in shuffled]
    existing_tips['attractions'] = attractions
    
    foods = existing_tips.get('food', [])
    if not foods:
        shuffled = random.sample(GENERIC_FOODS, min(4, len(GENERIC_FOODS)))
        foods = shuffled
    existing_tips['food'] = foods
    
    food_spots = existing_tips.get('food_spots', [])
    if not food_spots:
        food_spots = ["市中心美食街", "老字号餐厅聚集地", "夜市小吃摊"]
    existing_tips['food_spots'] = food_spots
    
    itinerary = existing_tips.get('itinerary_suggestion', [])
    if not itinerary:
        itinerary = random.sample(GENERIC_ITINERARIES, min(3, len(GENERIC_ITINERARIES)))
    existing_tips['itinerary_suggestion'] = itinerary
    
    transport_tips = existing_tips.get('transport_tips', [])
    if not transport_tips:
        transport_tips = random.sample(GENERIC_TRANSPORT_TIPS, min(3, len(GENERIC_TRANSPORT_TIPS)))
    existing_tips['transport_tips'] = transport_tips
    
    hotels = existing_tips.get('hotels', [])
    if not hotels:
        hotels = ["市中心商务酒店", "景区附近民宿", "连锁经济酒店"]
    existing_tips['hotels'] = hotels
    
    existing_tips.setdefault('attraction_tips', ["提前查好开放时间", "建议早上去避开人流"])
    existing_tips.setdefault('avoid_traps', ["景区门口警惕黑导游", "购买商品注意比价"])
    existing_tips.setdefault('best_photo_spots', ["城市广场", "老街巷弄", "自然观景台"])
    existing_tips.setdefault('clothing_advice', "根据季节选择合适衣物")
    existing_tips.setdefault('souvenirs', ["当地特产食品", "手工艺品"])
    existing_tips.setdefault('budget', {
        'economy': {'hotel': '150-300', 'meal': '30-60', 'transport': '20-40', 'total_daily': '200-400'},
        'mid': {'hotel': '400-800', 'meal': '80-150', 'transport': '40-80', 'total_daily': '600-1000'},
        'luxury': {'hotel': '1000+', 'meal': '200+', 'transport': '打车为主', 'total_daily': '1500+'}
    })
    existing_tips.setdefault('emergency_contacts', {})
    existing_tips.setdefault('accessibility', "交通便利，设施完善")
    existing_tips.setdefault('family_friendly', 4)
    existing_tips.setdefault('couple_friendly', 4)
    existing_tips.setdefault('solo_friendly', 4)
    existing_tips.setdefault('nightlife', 3)
    
    return existing_tips


async def recommend_destinations(from_city: str, travel_date: str,
                                   max_duration_hours: float = 3, preference: str = ""):
    recommendations = get_recommendations(from_city, max_duration_hours)
    
    from app.services.beijing_3hr_data import BEIJING_3HR_COORDS
    
    for rec in recommendations:
        rec["source"] = "database"
        if rec["city"] in CITY_COORDS:
            rec["lng"] = CITY_COORDS[rec["city"]][0]
            rec["lat"] = CITY_COORDS[rec["city"]][1]
        elif rec["city"] in BEIJING_3HR_COORDS:
            rec["lng"] = BEIJING_3HR_COORDS[rec["city"]][0]
            rec["lat"] = BEIJING_3HR_COORDS[rec["city"]][1]
        city_info = get_city_info(rec["city"])
        rec["tags"] = city_info.get("tags", [])
        rec["image"] = city_info.get("image", "")
        rec["rating"] = city_info.get("rating", 4.5)
        
        tips = rec.get("tips", {})
        rec["tips"] = _enrich_empty_tips(rec["city"], tips)
        
        if not rec.get("description") or rec["description"] == f"{rec['city']}是中国著名城市" or rec["description"] == "":
            rec["description"] = rec['city'] + random.choice(GENERIC_CITY_DESCRIPTIONS)
        
        rec["avg_daily_budget"] = city_info.get("avg_daily_budget", 400)
    
    return recommendations


async def get_city_detail(city: str, use_realtime: bool = True):
    city_info = get_city_info(city)
    tips = city_info.get("tips", {})
    
    geo = None
    if city in CITY_COORDS:
        geo = {"lng": CITY_COORDS[city][0], "lat": CITY_COORDS[city][1], "name": city}
    elif use_realtime:
        real_geo = await geocode_city(city)
        if real_geo:
            geo = {"lng": real_geo["lng"], "lat": real_geo["lat"], "name": city}
    
    high_speed_routes = get_high_speed_routes(city)
    
    tips = _enrich_empty_tips(city, tips)
    
    result = {
        "success": True,
        "city": city_info.get("name", city),
        "info": city_info,
        "static_data": {
            "attractions": tips.get("attractions", []),
            "foods": tips.get("food", []),
            "hotels": tips.get("hotels", []),
        },
        "realtime_data": {
            "attractions": [],
            "foods": [],
            "hotels": [],
        },
        "itinerary": tips.get("itinerary_suggestion", []),
        "geo": geo,
        "description": city_info.get("description", ""),
        "tags": city_info.get("tags", []),
        "rating": city_info.get("rating", 4.5),
        "image": city_info.get("image", ""),
        "best_time": city_info.get("best_time", ""),
        "weather_tips": city_info.get("weather_tips", ""),
        "transport": city_info.get("transport", ""),
        "high_speed_routes": high_speed_routes,
        "tips": tips,
    }
    
    if geo:
        try:
            realtime = await get_city_content_full(city)
            result["realtime_data"] = realtime
            result["attractions"] = realtime.get("attractions", []) or tips.get("attractions", [])
            result["foods"] = realtime.get("foods", []) or tips.get("food", [])
            result["hotels"] = realtime.get("hotels", []) or tips.get("hotels", [])
        except Exception as e:
            result["attractions"] = tips.get("attractions", [])
            result["foods"] = tips.get("food", [])
            result["hotels"] = tips.get("hotels", [])
            result["realtime_error"] = str(e)
    else:
        result["attractions"] = tips.get("attractions", [])
        result["foods"] = tips.get("food", [])
        result["hotels"] = tips.get("hotels", [])
    
    return result


async def get_city_realtime_only(city: str):
    realtime = await get_city_content_full(city)
    geo = await geocode_city(city)
    return {
        "success": True,
        "city": city,
        "geo": geo,
        **realtime,
    }


async def get_all_cities_count():
    return {"total": get_destinations_count()}
