import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
  startOfHour,
  endOfHour,
  subMonths,
  subWeeks,
  subDays,
  subHours
} from 'date-fns';

type RangeUnit = 'month' | 'week' | 'day' | 'hour';

export function getRange(unit: RangeUnit, offset = 0, baseDate = new Date()) {
  let target: Date = baseDate;

  switch (unit) {
    case 'month':
      target = subMonths(baseDate, offset);
      return {
        start: startOfMonth(target),
        end: endOfMonth(target),
      };
    case 'week':
      target = subWeeks(baseDate, offset);
      return {
        start: startOfWeek(target, { weekStartsOn: 1 }), // monday
        end: endOfWeek(target, { weekStartsOn: 1 }),
      };
    case 'day':
      target = subDays(baseDate, offset);
      return {
        start: startOfDay(target),
        end: endOfDay(target),
      };
    case 'hour':
      target = subHours(baseDate, offset);
      return {
        start: startOfHour(target),
        end: endOfHour(target),
      };
  }
}
