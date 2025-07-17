import { useState } from 'react'
import './BarterTab.css'

function BarterTab({ characters, getCharacterColors, getCharacterIcon, draggedCharacter, handleDragOver, handleDragLeave, handleDragEnter }) {
  const [isBarterCollapsed, setIsBarterCollapsed] = useState(false)
  const [isWeeklyShopCollapsed, setIsWeeklyShopCollapsed] = useState(false)
  const [barterAssignments, setBarterAssignments] = useState({})
  const [weeklyShopAssignments, setWeeklyShopAssignments] = useState({})
  
  // 일일 물물교환 데이터
  const [barterItems] = useState([
    { id: 1, location: '티르코네일', npc: '알리사', receive: '연금술 부스러기', give: '달걀 x 10' },
    { id: 2, location: '티르코네일', npc: '케이틴', receive: '케이틴 특제 통밀빵 x 3', give: '우유 x 10' },
    { id: 3, location: '티르코네일', npc: '퍼거스', receive: '철광석', give: '분해된 장비 부품 x 1', count: 10 },
    { id: 4, location: '티르코네일', npc: '퍼거스', receive: '석탄 x 3', give: '분해된 장비 부품 x 1', count: 10 },
    { id: 5, location: '티르코네일', npc: '퍼거스', receive: '합금강괴', give: '강철괴 x 2', count: 4 },
    { id: 6, location: '티르코네일', npc: '퍼거스', receive: '분해된 장비 부품', give: '광석 x 10', count: 10 },
    { id: 7, location: '두갈드아일', npc: '트레이시', receive: '생가죽', give: '통나무 x 1', count: 10 },
    { id: 8, location: '두갈드아일', npc: '트레이시', receive: '상급 생가죽', give: '통나무 x 10', count: 10 },
    { id: 9, location: '던바튼', npc: '글리니스', receive: '글리니스의 애플 밀크티', give: '생크림 x 4' },
    { id: 10, location: '던바튼', npc: '네리스', receive: '상급 생가죽', give: '동광석 x 1', count: 10 },
    { id: 11, location: '던바튼', npc: '네리스', receive: '특수강괴', give: '합금강괴 x 2', count: 4 },
    { id: 12, location: '던바튼', npc: '제롬', receive: '상급 실크 x 4', give: '크림소스 스테이크 x 1' },
    { id: 13, location: '던바튼', npc: '제이미', receive: '상급 옷감 x 4', give: '사과 수플레 x 1', count: 2 },
    { id: 14, location: '던바튼', npc: '칼릭스', receive: '레몬 x 3', give: '불사의 가루 x 5' },
    { id: 15, location: '던바튼', npc: '칼릭스', receive: '후추 x 2', give: '불사의 가루 x 5' },
    { id: 16, location: '던바튼', npc: '칼릭스', receive: '가죽+ x 10', give: '글리니스의 애플 밀크티 x 2' }
  ])
  
  // 주간 상점 데이터
  const [weeklyShopItems] = useState([
    { id: 1, location: '티르코네일', npc: '', item: '생가죽', price: '250골드', count: 30 },
    { id: 2, location: '던바튼', npc: '발터', item: '생가죽', price: '250골드', count: 30 },
    { id: 3, location: '던바튼', npc: '발터', item: '상급 생가죽', price: '600골드', count: 30 },
    { id: 4, location: '콜헨', npc: '코너', item: '상급 생가죽', price: '600골드', count: 30 },
    { id: 5, location: '콜헨', npc: '코너', item: '상급 생가죽+', price: '600골드', count: 30 },
    { id: 6, location: '콜헨', npc: '킬리언', item: '깔끔 버섯 진액', price: '750골드', count: 30 },
    { id: 7, location: '반호르', npc: '길모어', item: '상급 생가죽+', price: '600골드', count: 30 },
    { id: 8, location: '반호르', npc: '길모어', item: '최상급 생가죽', price: '900골드', count: 30 },
    { id: 9, location: '반호르', npc: '길모어', item: '최상급 거미줄', price: '900골드', count: 30 },
    { id: 10, location: '공통', npc: '', item: '룬의 파편 x 10', price: '마물 퇴치 증표 x 2', count: 20 },
    { id: 11, location: '공통', npc: '', item: '불사의가루', price: '마물 퇴치 증표 x 100', count: 5 },
    { id: 12, location: '공통', npc: '', item: '아득한 별의 인장', price: '마물 퇴치 증표 x 200' },
    { id: 13, location: '공통', npc: '', item: '강화 재연소 촉매', price: '마물 퇴치 증표 x 300' },
    { id: 14, location: '공통', npc: '', item: '엘리트 촉매', price: '마물 퇴치 증표 x 400' }
  ])
  
  // 지역별로 물물교환 데이터 그룹화
  const barterByLocation = barterItems.reduce((acc, item) => {
    if (!acc[item.location]) {
      acc[item.location] = []
    }
    acc[item.location].push(item)
    return acc
  }, {})
  
  // 지역별로 주간 상점 데이터 그룹화
  const weeklyShopByLocation = weeklyShopItems.reduce((acc, item) => {
    if (!acc[item.location]) {
      acc[item.location] = []
    }
    acc[item.location].push(item)
    return acc
  }, {})
  
  const handleBarterDrop = (e, itemId) => {
    e.preventDefault()
    e.currentTarget.classList.remove('drag-over')
    if (!draggedCharacter) return
    
    // 여러 캐릭터 할당 가능하도록 수정
    setBarterAssignments(prev => {
      const currentAssignments = prev[itemId] || []
      // 이미 할당된 캐릭터인지 확인
      if (currentAssignments.includes(draggedCharacter.id)) {
        return prev
      }
      return {
        ...prev,
        [itemId]: [...currentAssignments, draggedCharacter.id]
      }
    })
  }
  
  const handleWeeklyShopDrop = (e, itemId) => {
    e.preventDefault()
    e.currentTarget.classList.remove('drag-over')
    if (!draggedCharacter) return
    
    // 여러 캐릭터 할당 가능하도록 수정
    setWeeklyShopAssignments(prev => {
      const currentAssignments = prev[itemId] || []
      // 이미 할당된 캐릭터인지 확인
      if (currentAssignments.includes(draggedCharacter.id)) {
        return prev
      }
      return {
        ...prev,
        [itemId]: [...currentAssignments, draggedCharacter.id]
      }
    })
  }
  
  const removeBarterAssignment = (itemId, characterId) => {
    setBarterAssignments(prev => {
      const currentAssignments = prev[itemId] || []
      return {
        ...prev,
        [itemId]: currentAssignments.filter(id => id !== characterId)
      }
    })
  }
  
  const removeWeeklyShopAssignment = (itemId, characterId) => {
    setWeeklyShopAssignments(prev => {
      const currentAssignments = prev[itemId] || []
      return {
        ...prev,
        [itemId]: currentAssignments.filter(id => id !== characterId)
      }
    })
  }

  return (
    <div className="barter-container">
      {/* 일일 물물교환 */}
      <div className="barter-section">
        <div 
          className="collapsible-header"
          onClick={() => setIsBarterCollapsed(!isBarterCollapsed)}
        >
          <h3>일일 물물교환</h3>
          <span className={`collapse-icon ${isBarterCollapsed ? 'collapsed' : ''}`}>▼</span>
        </div>
        {!isBarterCollapsed && (
          <div className="barter-locations">
            {Object.entries(barterByLocation).map(([location, items]) => (
              <div key={location} className="barter-location-group">
                <h4 className="location-title">{location}</h4>
                <div className="barter-slots">
                  {items.map(item => (
                    <div 
                      key={item.id}
                      className="barter-slot"
                      onDragOver={handleDragOver}
                      onDragEnter={handleDragEnter}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleBarterDrop(e, item.id)}
                    >
                      <div className="barter-info">
                        {item.npc && <div className="barter-npc">{item.npc}</div>}
                        <div className="barter-exchange">
                          <span className="barter-receive">{item.receive}</span>
                          <span className="barter-arrow">←</span>
                          <span className="barter-give">{item.give}</span>
                        </div>
                        {item.count && <div className="barter-count">{item.count}회</div>}
                      </div>
                      <div className="barter-characters">
                        {(barterAssignments[item.id] || []).map(charId => {
                          const charIndex = characters.findIndex(c => c.id === charId)
                          const char = characters[charIndex]
                          return (
                            <div 
                              key={charId}
                              className="barter-character-tag"
                              style={{ backgroundColor: getCharacterColors()[charIndex] }}
                            >
                              <span>{getCharacterIcon(char)}</span>
                              <button 
                                className="remove-btn"
                                onClick={() => removeBarterAssignment(item.id, charId)}
                              >
                                ×
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* 주간 상점 */}
      <div className="weekly-shop-section">
        <div 
          className="collapsible-header"
          onClick={() => setIsWeeklyShopCollapsed(!isWeeklyShopCollapsed)}
        >
          <h3>주간 상점</h3>
          <span className={`collapse-icon ${isWeeklyShopCollapsed ? 'collapsed' : ''}`}>▼</span>
        </div>
        {!isWeeklyShopCollapsed && (
          <div className="weekly-shop-locations">
            {Object.entries(weeklyShopByLocation).map(([location, items]) => (
              <div key={location} className="weekly-shop-location-group">
                <h4 className="location-title">{location}</h4>
                <div className="weekly-shop-slots">
                  {items.map(item => (
                    <div 
                      key={item.id}
                      className="weekly-shop-slot"
                      onDragOver={handleDragOver}
                      onDragEnter={handleDragEnter}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleWeeklyShopDrop(e, item.id)}
                    >
                      <div className="weekly-shop-info">
                        {item.npc && <div className="weekly-shop-npc">{item.npc}</div>}
                        <div className="weekly-shop-item">
                          <span className="item-name">{item.item}</span>
                          <span className="item-price">{item.price}</span>
                        </div>
                        {item.count && <div className="weekly-shop-count">{item.count}회</div>}
                      </div>
                      <div className="weekly-shop-characters">
                        {(weeklyShopAssignments[item.id] || []).map(charId => {
                          const charIndex = characters.findIndex(c => c.id === charId)
                          const char = characters[charIndex]
                          return (
                            <div 
                              key={charId}
                              className="weekly-shop-character-tag"
                              style={{ backgroundColor: getCharacterColors()[charIndex] }}
                            >
                              <span>{getCharacterIcon(char)}</span>
                              <button 
                                className="remove-btn"
                                onClick={() => removeWeeklyShopAssignment(item.id, charId)}
                              >
                                ×
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default BarterTab