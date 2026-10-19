import {
  dateInTimeZone,
  hourInTimeZone,
  pickJerseyOfTheDay,
} from './kotd-helper';

describe('time zone helpers', () => {
  it('uses the Paris date, not the UTC one, around midnight', () => {
    // 23:30 UTC on Oct 18 is already 01:30 on Oct 19 in Paris (summer time)
    const instant = new Date('2026-10-18T23:30:00Z');

    expect(dateInTimeZone(instant, 'Europe/Paris')).toBe('2026-10-19');
    expect(hourInTimeZone(instant, 'Europe/Paris')).toBe(1);
  });

  it('follows the winter time offset', () => {
    // UTC+1 in December: 08:30 UTC is 09:30 in Paris
    const instant = new Date('2026-12-01T08:30:00Z');

    expect(dateInTimeZone(instant, 'Europe/Paris')).toBe('2026-12-01');
    expect(hourInTimeZone(instant, 'Europe/Paris')).toBe(9);
  });
});

const dayString = (offset: number) => {
  const date = new Date('2026-01-01T00:00:00Z');
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
};

// One heavy collector (40 kits) and 24 users with 1 to 3 kits each.
const buildJerseys = () => {
  const jerseys: Array<{ id: string; user: { id: string } }> = [];
  for (let u = 0; u < 25; u++) {
    const count = u === 0 ? 40 : (u % 3) + 1;
    for (let j = 0; j < count; j++) {
      jerseys.push({ id: `jersey-${u}-${j}`, user: { id: `user-${u}` } });
    }
  }
  return jerseys;
};

describe('pickJerseyOfTheDay', () => {
  it('returns the same kit for a given day, whatever the order of the input', () => {
    const jerseys = buildJerseys();
    const reversed = [...jerseys].reverse();

    expect(pickJerseyOfTheDay(jerseys, '2026-10-19').id).toBe(
      pickJerseyOfTheDay(reversed, '2026-10-19').id,
    );
  });

  it('does not mutate the list it is given', () => {
    const jerseys = buildJerseys();
    const snapshot = jerseys.map((j) => j.id);

    pickJerseyOfTheDay(jerseys, '2026-10-19');

    expect(jerseys.map((j) => j.id)).toEqual(snapshot);
  });

  it('works with a single jersey', () => {
    const jersey = { id: 'only', user: { id: 'u' } };

    expect(pickJerseyOfTheDay([jersey], '2026-10-19')).toBe(jersey);
  });

  it('features every collector over a year, and a heavy collector does not dominate', () => {
    const jerseys = buildJerseys();
    const daysByUser = new Map<string, number>();

    for (let day = 0; day < 365; day++) {
      const picked = pickJerseyOfTheDay(jerseys, dayString(day));
      daysByUser.set(picked.user.id, (daysByUser.get(picked.user.id) ?? 0) + 1);
    }

    expect(daysByUser.size).toBe(25);
    // With 25 users the fair share is ~15 days. The 40-kit collector owns
    // ~30% of all kits, so a per-kit pick would give them ~110 days.
    expect(daysByUser.get('user-0')!).toBeLessThan(35);
  });

  it('spreads the picks over many different kits', () => {
    const jerseys = buildJerseys();
    const distinct = new Set<string>();

    for (let day = 0; day < 365; day++) {
      distinct.add(pickJerseyOfTheDay(jerseys, dayString(day)).id);
    }

    // The previous date-sum seed could only ever reach 19 positions.
    expect(distinct.size).toBeGreaterThan(40);
  });
});
