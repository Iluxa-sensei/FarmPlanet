import React from 'react';
import { motion } from 'framer-motion';

interface MiniChartProps {
  title: string;
  data: number[];
  color?: string;
  unit?: string;
  period?: string;
  showDates?: boolean;
  activityThresholds?: { low: number; high: number }; // Пороги для определения уровня
}

const MiniChart = ({ title, data, color = 'hsl(var(--primary))', unit = '', period = 'Last 24 hours', showDates = false, activityThresholds }: MiniChartProps) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  // Генерируем даты для последних N дней
  const generateDates = () => {
    const dates = [];
    const now = new Date();
    for (let i = data.length - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      dates.push(date);
    }
    return dates;
  };

  const dates = showDates ? generateDates() : [];

  // Получаем уникальные месяцы
  const getMonthLabel = () => {
    if (!showDates || dates.length === 0) return '';
    const firstMonth = dates[0].toLocaleDateString('en', { month: 'short' });
    const lastMonth = dates[dates.length - 1].toLocaleDateString('en', { month: 'short' });
    return firstMonth === lastMonth ? firstMonth : `${firstMonth} - ${lastMonth}`;
  };

  // Определяем уровень активности
  const getActivityLevel = () => {
    if (!activityThresholds) return null;

    const average = data.reduce((a, b) => a + b, 0) / data.length;

    if (average <= activityThresholds.low) {
      return { label: 'Low', color: 'text-green-400', bgColor: 'bg-green-400/10' };
    } else if (average >= activityThresholds.high) {
      return { label: 'High', color: 'text-red-400', bgColor: 'bg-red-400/10' };
    } else {
      return { label: 'Medium', color: 'text-yellow-400', bgColor: 'bg-yellow-400/10' };
    }
  };

  const activityLevel = getActivityLevel();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="glass-card p-6 space-y-4"
    >
      {/* Месяц и уровень активности сверху */}
      {(showDates || activityLevel) && (
        <div className="flex items-center justify-between">
          {showDates && (
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {getMonthLabel()}
            </div>
          )}
          {activityLevel && (
            <div className={`px-2 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider ${activityLevel.bgColor} ${activityLevel.color}`}>
              {activityLevel.label}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <span className="text-2xl font-bold text-primary">
          {data[data.length - 1]?.toFixed(2)}{unit}
        </span>
      </div>

      <div className="h-20 flex items-end justify-between gap-1">
        {data.map((value, index) => {
          // Вычисляем высоту с учётом диапазона
          const heightPercent = range > 0 ? ((value - min) / range) * 100 : 0;
          // Если значение 0 или слишком мало, делаем столбик полностью прозрачным
          const isZero = value === 0 || (min === 0 && value === min && max > 0);

          return (
            <motion.div
              key={index}
              className="flex-1 min-w-[2px] rounded-t"
              style={{
                backgroundColor: color,
                height: isZero ? '2px' : `${heightPercent}%`,
                minHeight: isZero ? '2px' : '4px',
                opacity: isZero ? 0.2 : 1
              }}
              initial={{ height: 0 }}
              animate={{
                height: isZero ? '2px' : `${heightPercent}%`,
                opacity: isZero ? 0.2 : 1
              }}
              transition={{
                duration: 0.8,
                delay: index * 0.05,
                ease: 'easeOut'
              }}
            />
          );
        })}
      </div>

      {/* Метки дней под графиком */}
      {showDates && dates.length > 0 ? (
        <div className="flex items-center justify-between text-[9px] text-muted-foreground px-0.5">
          {data.map((_, index) => {
            // Показываем каждый 5-й день для читаемости
            const shouldShow = index % 5 === 0 || index === data.length - 1;
            return (
              <div key={index} className="flex-1 text-center" style={{ minWidth: '2px' }}>
                {shouldShow ? dates[index].getDate() : ''}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-xs text-muted-foreground text-center">
          {period}
        </div>
      )}
    </motion.div>
  );
};

export default MiniChart;