# 🌡️ Temperature Map Integration with Territories

## 🎉 Новая функциональность

### Проблема:
При переключении на температурную карту территории не отображались, и нельзя было посмотреть температуру на ферме.

### Решение:
✅ Территории теперь отображаются на температурной карте
✅ При клике на территорию показывается текущая температура
✅ В sidebar список всех территорий с их температурами
✅ Температура окрашивается в соответствующий цвет (холодно → тепло)

## 🔧 Технические детали

### 1. Функция расчёта температуры территории

```typescript
const getTerritoryTemperature = (territory: Territory): number | null => {
  if (tempPoints.length === 0 || !territory.points || territory.points.length === 0) 
    return null;

  // 1. Вычисляем центр территории
  const lats = territory.points.map(p => p[0]);
  const lngs = territory.points.map(p => p[1]);
  const centerLat = lats.reduce((a, b) => a + b, 0) / lats.length;
  const centerLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;

  // 2. Находим ближайшую точку температуры
  let nearestPoint = tempPoints[0];
  let minDistance = Infinity;

  tempPoints.forEach(point => {
    const distance = Math.sqrt(
      Math.pow(point.lat - centerLat, 2) + 
      Math.pow(point.lng - centerLng, 2)
    );
    if (distance < minDistance) {
      minDistance = distance;
      nearestPoint = point;
    }
  });

  return nearestPoint.value;
};
```

**Алгоритм:**
1. Вычисляется центр территории (среднее всех координат точек)
2. Для каждой точки температуры рассчитывается расстояние до центра
3. Возвращается температура из ближайшей точки

### 2. Отображение на карте

**Полигоны территорий:**
```typescript
<Polygon
  positions={territory.points}
  pathOptions={{
    color: getTerritoryColor(index),
    fillColor: getTerritoryColor(index),
    fillOpacity: 0.3,
    weight: 3
  }}
  eventHandlers={{
    click: () => setSelectedTerritory(territory)
  }}
>
```

**Popup с температурой:**
```typescript
<Popup>
  <div className="p-2 min-w-[200px]">
    <h3 className="font-bold text-lg mb-2">{territory.name}</h3>
    
    {/* Температура с градиентным фоном */}
    <div className="mb-2 p-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-red-500/20">
      <div className="flex items-center gap-2">
        <Thermometer className="w-5 h-5" />
        <div>
          <p className="text-xs text-muted-foreground">Current Temperature</p>
          <p className="text-2xl font-bold" style={{ 
            color: tempToColor(territoryTemp) 
          }}>
            {territoryTemp.toFixed(1)}°C
          </p>
        </div>
      </div>
    </div>
    
    {/* Площадь, культура, дата посадки */}
    ...
  </div>
</Popup>
```

### 3. Sidebar с температурами

```typescript
<Card className="glass-card">
  <CardHeader>
    <CardTitle className="text-sm">Territories Temperature</CardTitle>
    <CardDescription>Current temperature for your farms</CardDescription>
  </CardHeader>
  <CardContent>
    <ScrollArea className="h-[250px]">
      {territories.map((territory, index) => {
        const temp = getTerritoryTemperature(territory);
        return (
          <div onClick={() => setSelectedTerritory(territory)}>
            <p className="font-semibold text-sm">{territory.name}</p>
            <p className="text-lg font-bold" style={{ color: tempToColor(temp) }}>
              {temp.toFixed(1)}°C
            </p>
          </div>
        );
      })}
    </ScrollArea>
  </CardContent>
</Card>
```

## 🎨 Цветовая шкала температуры

Используется функция `tempToColor()`:

| Температура | Цвет | Hex |
|-------------|------|-----|
| < -20°C | Тёмно-синий | #000080 |
| -10°C | Синий | #0000CD |
| 0°C | Светло-синий | #4169E1 |
| 10°C | Голубой | #00BFFF |
| 15°C | Бирюзовый | #87CEEB |
| 20°C | Светло-зелёный | #98FB98 |
| 25°C | Жёлтый | #FFD700 |
| 30°C | Оранжевый | #FFA500 |
| 35°C | Тёмно-оранжевый | #FF8C00 |
| > 40°C | Красный | #DC143C |

## 🖼️ Визуальные элементы

### Popup территории:
```
┌────────────────────────┐
│ Territory Name         │
├────────────────────────┤
│ 🌡️ Current Temperature│
│     25.3°C             │
│  (цвет зависит от t°)  │
├────────────────────────┤
│ 📐 Area: 125.5 га      │
│ 🌾 Wheat               │
│ 📅 10/15/2024          │
└────────────────────────┘
```

### Sidebar элемент:
```
┌────────────────────────┐
│ ● Territory Name       │
│   Wheat         25.3°C │
└────────────────────────┘
```

## 🎯 Пользовательские сценарии

### Сценарий 1: Просмотр температуры фермы
1. Откройте **Map** страницу
2. Переключитесь на **Temperature Map**
3. Дождитесь загрузки температурных данных
4. Кликните на вашу территорию
5. В popup видите текущую температуру

### Сценарий 2: Сравнение температур
1. Переключитесь на **Temperature Map**
2. Посмотрите sidebar **"Territories Temperature"**
3. Видите температуру всех ваших территорий
4. Кликните на любую для детальной информации

### Сценарий 3: Планирование с учётом температуры
1. **Temperature Map** → Посмотрите температуру фермы
2. **Analytics** → **Farm Weather** → Прогноз на 7 дней
3. **Map** → Выберите территорию → **View AI Plan**
4. Планируйте работы с учётом погодных условий

## 📊 Интеграция с другими функциями

### Связь с Analytics:
- Temperature Map показывает **текущую** температуру
- Analytics Farm Weather показывает **историю** (30 дней) и **прогноз** (7 дней)
- Координаты территории используются в обоих местах

### Связь с AI Plan:
- Температура влияет на выполнение задач AI плана
- Рекомендации по поливу зависят от температуры
- Можно отслеживать условия для оптимального роста

## 🔄 Обновление данных

| Данные | Источник | Обновление |
|--------|----------|------------|
| Temperature Points | Open-Meteo API | При переключении на temp map |
| Territories | LocalStorage | При загрузке страницы |
| Territory Temp | Расчёт из tempPoints | Real-time при клике |

## 🚀 Преимущества

1. ✅ **Визуализация** - Сразу видно температуру на карте
2. ✅ **Интерактивность** - Клик на территорию → детали
3. ✅ **Контекст** - Температура показана вместе с инфо о ферме
4. ✅ **Удобство** - Список всех территорий с температурами
5. ✅ **Цветовая индикация** - Холодные зоны синие, тёплые красные

## 📱 Адаптивность

- **Desktop**: Sidebar справа с полным списком территорий
- **Mobile**: Список территорий в отдельной карточке
- **Popup**: Адаптивный размер под содержимое

## 🛡️ Обработка ошибок

1. **Нет температурных данных**: `temp = null` → не показывается
2. **Нет координат территории**: `return null`
3. **Пустой массив tempPoints**: Функция возвращает `null`
4. **API недоступен**: Показывается error message в sidebar

## 🔮 Возможные улучшения

1. Средняя температура по всей площади территории (не только центр)
2. История температур для территории
3. Предупреждения о критических температурах
4. Рекомендации по AI плану на основе температуры
5. Экспорт температурных данных для территории

## 📚 Связанные файлы

- `MapPage.tsx` - Основная реализация
- `Analytics.tsx` - Историческая погода и прогноз
- `Alerts.tsx` - Уведомления по AI плану



