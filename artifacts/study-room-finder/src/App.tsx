import { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  CalendarDays,
  Check,
  Clock3,
  Coffee,
  DoorOpen,
  GraduationCap,
  Info,
  LayoutGrid,
  List,
  MapPin,
  Search,
  Sparkles,
  Timer,
} from 'lucide-react';
import {
  DAY_KEYS,
  ROOMS,
  TIMETABLE,
  formatClockTime,
  formatMinutes,
  getAvailabilitySnapshot,
  getCampusDateLabel,
  getCampusTimeLabel,
  getDayStatus,
  type DayKey,
  type RoomAvailability,
  type RoomType,
} from './data/schedule';
import { AnimatedContent } from './components/animated-content';
import { SpotlightCard } from './components/spotlight-card';

type ViewMode = 'rooms' | 'timetable';
type TypeFilter = 'All spaces' | RoomType;

function statusDescription(status: ReturnType<typeof getAvailabilitySnapshot>['status'], breakLabel: string | null) {
  if (status === 'scheduled') return 'Classes in session';
  if (status === 'break') return breakLabel ?? 'Between classes';
  if (status === 'before-opening') return 'Before classes begin';
  if (status === 'after-closing') return 'Classes have finished';
  return 'Sunday · no classes listed';
}

function RoomRow({ candidate }: { candidate: RoomAvailability }) {
  const { room, availableForMinutes, availableUntil, nextClass, nextClassStartsAt, sourceNote } = candidate;
  return (
    <article className="room-row" data-testid={`card-room-${room.id.replaceAll(' ', '-')}`}>
      <div className="room-id">
        <span className="room-glyph" aria-hidden="true">
          {room.type === 'Lab' ? <LayoutGrid size={16} /> : <DoorOpen size={16} />}
        </span>
        <span>
          {room.id}
          <span className="room-type">{room.type}</span>
        </span>
      </div>
      <div className="row-duration" data-testid={`text-duration-${room.id.replaceAll(' ', '-')}`}>
        {formatMinutes(availableForMinutes)} free
        <small>{sourceNote ? 'No listed bookings' : nextClassStartsAt !== null ? 'Free until next class' : 'Free through timetable end'}</small>
      </div>
      <div className="row-class">
        {sourceNote ? (
          <span className="source-note"><Info size={12} /> Not on timetable</span>
        ) : nextClass ? (
          <>Next class<strong>{nextClass}</strong></>
        ) : (
          <>Next class<strong>None listed today</strong></>
        )}
      </div>
      <div className="row-end">
        <Clock3 size={13} />
        {formatClockTime(availableUntil)}
      </div>
    </article>
  );
}

function Recommendation({
  candidate,
  status,
}: {
  candidate: RoomAvailability | undefined;
  status: ReturnType<typeof getAvailabilitySnapshot>['status'];
}) {
  if (!candidate) {
    return (
      <div className="spotlight-card recommendation" data-testid="empty-recommendation">
        <div className="rec-topline"><span className="rec-label"><Sparkles size={14} /> Best place to settle in</span></div>
        <div className="rec-main">
          <div>
            <div className="rec-room">No room</div>
            <div className="rec-kind">
              {status === 'sunday'
                ? 'No schedule is published for Sunday'
                : status === 'after-closing'
                  ? 'Timetable teaching hours have ended'
                  : 'No timetable-based vacancies right now'}
            </div>
          </div>
        </div>
        <div className="rec-footer">
          <span>{status === 'sunday' ? 'Choose a weekday to view its room schedule.' : 'Check the timetable for the next available window.'}</span>
        </div>
      </div>
    );
  }

  return (
    <SpotlightCard className="recommendation" data-testid="card-top-recommendation">
      <div className="rec-topline">
        <span className="rec-label"><Sparkles size={14} /> Best place to settle in</span>
        <span className="best-tag"><Check size={12} /> Longest stretch</span>
      </div>
      <div className="rec-main">
        <div>
          <div className="rec-room" data-testid="text-recommended-room">{candidate.room.id}</div>
          <div className="rec-kind">{candidate.room.type} · available now</div>
        </div>
        <div className="rec-duration">
          <strong>{formatMinutes(candidate.availableForMinutes)}</strong>
          <span>{candidate.nextClassStartsAt === null ? 'through teaching hours' : 'until next listed class'}</span>
        </div>
      </div>
      <div className="rec-footer">
        {candidate.sourceNote ? (
          <span className="rec-source" data-testid="text-recommendation-source"><Info size={13} /> No classes listed in the source timetable</span>
        ) : (
          <span className="rec-until">
            <Clock3 size={13} />
            {candidate.nextClassStartsAt === null
              ? `Free through ${formatClockTime(candidate.availableUntil)}`
              : `Next booking at ${formatClockTime(candidate.availableUntil)}${candidate.nextClass ? ` · ${candidate.nextClass}` : ''}`}
          </span>
        )}
        <span>{candidate.room.type}</span>
      </div>
    </SpotlightCard>
  );
}

function OccupancyPanel({ snapshot }: { snapshot: ReturnType<typeof getAvailabilitySnapshot> }) {
  const roomCount = ROOMS.length;
  const freeCount = Math.min(snapshot.freeCount, roomCount);
  const freeRoomIds = new Set(snapshot.candidates.map(({ room }) => room.id));
  return (
    <aside className="mini-panel" aria-label="Room availability summary" data-testid="panel-availability-summary">
      <div className="mini-panel-top">
        <div>
          <h3>Campus room pulse</h3>
          <p>{snapshot.status === 'sunday' || snapshot.status === 'after-closing' ? 'No active timetable window' : 'At this moment, by timetable'}</p>
        </div>
        <span className="availability-count" data-testid="text-free-room-count">{freeCount}</span>
      </div>
      <div className="occupancy-bar" aria-label={`${freeCount} of ${roomCount} spaces are listed as available`}>
        {ROOMS.map((room, index) => (
          <span key={room.id} className={freeRoomIds.has(room.id) ? 'is-free' : ''} />
        ))}
      </div>
      <div className="counts">
        <span><strong>{freeCount}</strong> free now</span>
        <span><strong>{snapshot.occupiedCount}</strong> in class</span>
      </div>
    </aside>
  );
}

function TimetableView({ liveDay, now }: { liveDay: DayKey | null; now: Date }) {
  const liveSnapshot = getAvailabilitySnapshot(now);
  const [manualDay, setManualDay] = useState<DayKey | null>(null);
  const selectedDay = manualDay ?? liveDay ?? 'Monday';
  const slots = TIMETABLE;
  const isShowingToday = selectedDay === liveDay;

  return (
    <section className="fade-in" aria-label="Weekly room timetable">
      <div className="section-head">
        <div>
          <div className="section-kicker">Monsoon 2026 · official room schedule</div>
          <h2 className="section-title">Room timetable</h2>
        </div>
        <div className="status-meta">{isShowingToday ? 'Today · current slot marked' : `Viewing ${selectedDay}`}</div>
      </div>
      <div className="timetable-wrap">
        <div className="day-tabs" role="tablist" aria-label="Select timetable day">
          {DAY_KEYS.map((day) => (
            <button
              type="button"
              role="tab"
              aria-selected={selectedDay === day}
              aria-pressed={selectedDay === day}
              data-testid={`button-day-${day.toLowerCase()}`}
              key={day}
              onClick={() => setManualDay(day)}
            >{day}</button>
          ))}
        </div>
        <div className="table-scroll">
          <table className="timetable" data-testid="table-room-timetable">
            <thead>
              <tr>
                <th scope="col">Time</th>
                {ROOMS.map((room) => <th scope="col" key={room.id}>{room.id}</th>)}
              </tr>
            </thead>
            <tbody>
              {slots.map((slot) => {
                const isCurrent = isShowingToday && liveSnapshot.minuteOfDay >= slot.start && liveSnapshot.minuteOfDay < slot.end;
                return (
                  <tr key={slot.start} data-testid={`row-slot-${slot.start}`}>
                    <th scope="row" className={isCurrent ? 'current-time' : ''}>
                      {slot.label}{isCurrent ? <span aria-label="current time"> · now</span> : null}
                    </th>
                    {ROOMS.map((room) => {
                      const booking = getDayStatus(selectedDay, room.id, slot);
                      return (
                        <td key={room.id} className={isCurrent ? 'is-current' : ''} data-testid={`cell-${selectedDay.toLowerCase()}-${slot.start}-${room.id.replaceAll(' ', '-')}`}>
                          {booking ? <span className="class-chip">{booking}</span> : <span className="vacant-chip"><Check size={11} /> Vacant</span>}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="timetable-note">
          <span><Info size={13} /> B01 and B02 are not listed in the source timetable; shown as vacant.</span>
          <span><span className="live-dot" /> Current slot follows campus time</span>
        </div>
      </div>
    </section>
  );
}

function App() {
  const [now, setNow] = useState(() => new Date());
  const [view, setView] = useState<ViewMode>('rooms');
  const [roomType, setRoomType] = useState<TypeFilter>('All spaces');
  const [query, setQuery] = useState('');

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const snapshot = useMemo(() => getAvailabilitySnapshot(now), [now]);
  const filteredCandidates = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return snapshot.candidates.filter(({ room }) => {
      const matchesType = roomType === 'All spaces' || room.type === roomType;
      const matchesQuery = !normalizedQuery || room.id.toLowerCase().includes(normalizedQuery);
      return matchesType && matchesQuery;
    });
  }, [snapshot, roomType, query]);
  const timeLabel = getCampusTimeLabel(now);
  const dateLabel = getCampusDateLabel(now);
  const stateLabel = statusDescription(snapshot.status, snapshot.breakLabel);
  return (
    <main className="app-shell">
      <div className="page-wrap">
        <header className="topbar">
          <div className="brand-lockup">
            <div className="brand-mark"><GraduationCap size={21} strokeWidth={1.8} /></div>
            <div>
              <div className="brand-name">Room, found.</div>
              <div className="brand-sub">IIIT Sri City · Monsoon 2026</div>
            </div>
          </div>
          <div className="topbar-right">
            <div className="live-clock" data-testid="campus-clock">
              <time data-testid="text-campus-time">{timeLabel}</time>
              <span data-testid="text-campus-date"><i className="live-dot" />{dateLabel}</span>
            </div>
          </div>
        </header>

        <section className="hero fade-in">
          <div>
            <div className="eyebrow"><MapPin size={13} /> Find your next quiet stretch</div>
            <h1>Make the most of<br /><em>the empty hours.</em></h1>
          </div>
          <p className="hero-note">A clear view of rooms with the longest uninterrupted time free, based on the Monsoon 2026 timetable.</p>
        </section>

        <div className="status-strip" data-testid="status-current-schedule">
          <div className="status-icon">{snapshot.status === 'break' ? <CoffeeIcon /> : <CalendarDays size={17} />}</div>
          <div className="status-copy">
            <strong data-testid="text-current-state">{stateLabel}{snapshot.currentSlot ? ` · ${snapshot.currentSlot.label}` : ''}</strong>
            <span>{snapshot.currentSlot ? 'The listed classes below are in progress.' : snapshot.nextSlot && snapshot.dayKey ? `Next listed class window starts at ${formatClockTime(snapshot.nextSlot.start)}.` : 'Availability is estimated from the published room schedule.'}</span>
          </div>
          <div className="status-meta">{snapshot.dayName} · Asia/Kolkata</div>
        </div>

        <nav className="view-switch" aria-label="Choose view">
          <button type="button" aria-pressed={view === 'rooms'} data-testid="button-view-rooms" onClick={() => setView('rooms')}>
            <List size={15} /> Room finder
          </button>
          <button type="button" aria-pressed={view === 'timetable'} data-testid="button-view-timetable" onClick={() => setView('timetable')}>
            <CalendarDays size={15} /> Timetable
          </button>
        </nav>

        {view === 'rooms' ? (
          <>
            <AnimatedContent className="recommendation-grid" delay={0.04} testId="section-recommendations">
              <Recommendation candidate={snapshot.candidates[0]} status={snapshot.status} />
              <OccupancyPanel snapshot={snapshot} />
            </AnimatedContent>

            <section className="availability-section fade-in delay-1" aria-label="Available rooms">
              <div className="section-head">
                <div>
                  <div className="section-kicker">{snapshot.dayKey ? `${snapshot.dayKey} · Ranked by next booking` : 'Weekly schedule'}</div>
                  <h2 className="section-title">Free right now <span style={{ color: '#9b7b43', font: '500 13px var(--mono)' }}>{filteredCandidates.length}</span></h2>
                </div>
                <div className="tools">
                  <label className="search-box">
                    <Search size={15} aria-hidden="true" />
                    <input
                      type="search"
                      placeholder="Find a room"
                      aria-label="Search rooms"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      data-testid="input-room-search"
                    />
                  </label>
                  <select
                    className="filter-select"
                    aria-label="Filter by room type"
                    value={roomType}
                    onChange={(event) => setRoomType(event.target.value as TypeFilter)}
                    data-testid="select-room-type"
                  >
                    <option>All spaces</option>
                    <option>Classroom</option>
                    <option>Lab</option>
                  </select>
                </div>
              </div>
              {filteredCandidates.length ? (
                <div className="room-list" data-testid="list-available-rooms">
                  {filteredCandidates.map((candidate) => <RoomRow candidate={candidate} key={candidate.room.id} />)}
                </div>
              ) : (
                <div className="empty-state" data-testid="empty-room-results">
                  <Search size={20} />
                  <div>
                    <strong>{snapshot.candidates.length ? 'No rooms match that search.' : 'No rooms are listed as free right now.'}</strong>
                    <span>{snapshot.candidates.length ? 'Try another name or widen the room-type filter.' : 'The schedule may be outside teaching hours. Check the weekly timetable for the full picture.'}</span>
                  </div>
                </div>
              )}
            </section>
          </>
        ) : (
          <TimetableView liveDay={snapshot.dayKey} now={now} />
        )}

        <footer className="footer">
          <span><Timer size={13} /> Updated from your browser clock every second</span>
          <span><Info size={13} /><strong>Timetable-based availability</strong> · not sensor-confirmed</span>
          <span><BookOpen size={13} /> Monsoon 2026 source schedule</span>
        </footer>
      </div>
    </main>
  );
}

function CoffeeIcon() {
  return <Coffee size={17} />;
}

export default App;
