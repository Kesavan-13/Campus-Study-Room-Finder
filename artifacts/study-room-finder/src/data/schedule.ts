export const CAMPUS_TIME_ZONE = 'Asia/Kolkata';

export const DAY_KEYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

export type DayKey = (typeof DAY_KEYS)[number];
export type RoomType = 'Classroom' | 'Lab';

export type Room = {
  id: string;
  type: RoomType;
};

export const ROOMS: Room[] = [
  { id: 'G04', type: 'Classroom' },
  { id: 'G05', type: 'Classroom' },
  { id: 'G06', type: 'Classroom' },
  { id: 'G07', type: 'Classroom' },
  { id: 'G08', type: 'Classroom' },
  { id: 'G09', type: 'Classroom' },
  { id: 'B01', type: 'Classroom' },
  { id: 'B02', type: 'Classroom' },
  { id: 'B03', type: 'Classroom' },
  { id: 'Lab 103', type: 'Lab' },
  { id: 'Lab 114/102', type: 'Lab' },
  { id: 'Lab 114/104', type: 'Lab' },
  { id: 'Lab B05', type: 'Lab' },
];

export type TimetableSlot = {
  start: number;
  end: number;
  label: string;
  bookingByDay: Record<DayKey, Record<string, string>>;
};

type RawSlot = {
  start: number;
  end: number;
  label: string;
  // Each cell is a pipe-separated list of room=course entries, in DAY_KEYS order.
  cells: readonly [string, string, string, string, string, string];
};

function parseBookings(cell: string): Record<string, string> {
  if (!cell) return {};
  return Object.fromEntries(
    cell.split('|').map((entry) => {
      const separator = entry.indexOf('=');
      return [entry.slice(0, separator), entry.slice(separator + 1)];
    }),
  );
}

const rawSlots: RawSlot[] = [
  {
    start: 8 * 60 + 45,
    end: 9 * 60 + 45,
    label: '08:45–09:45',
    cells: [
      'G05=OOP4|G06=RANAC1|G08=OCW4',
      'G05=RANAC3|G06=CNA|Lab 103=CP4',
      'G04=ADSA2|G05=CS|G06=DBMS3|Lab 103=CP1|Lab 114/102=DLD4',
      'G06=RANAC4|G07=PC3|G08=OCW1|G09=RANAC1|Lab 103=OCW4',
      'G05=RANAC3|G06=DSP|G09=OCW1|Lab 103=ADSA1|Lab B05=PC4',
      'G07=PGP2|G09=QRA 2',
    ],
  },
  {
    start: 9 * 60 + 45,
    end: 10 * 60 + 45,
    label: '09:45–10:45',
    cells: [
      'G04=RANAC2|G05=FDFED2|G06=ADSA1|G07=DSMA3|G08=DSMA2|B03=CS|Lab 103=OCW1',
      'G04=OOP1|G05=CS|G08=DSMA3|G09=OCW2|Lab 103=CP4|Lab 114/102=DLD1',
      'G05=OS2|G07=DLD3|G09=VLSI|Lab 103=CP1|Lab 114/102=DLD4',
      'G06=CNA|G07=CP3|G08=OOP2|G09=CP1|Lab 103=OCW4',
      'G04=VLSI|G07=DSMA2|G08=DSMA5|G09=DSMA4|Lab 103=ADSA1',
      'G07=PGP2|G09=QRA 2|B03=OB1',
    ],
  },
  {
    start: 11 * 60,
    end: 12 * 60,
    label: '11:00–12:00',
    cells: [
      'G04=DSP|G05=DBMS1|G06=CNA|G07=DBMS3|G08=DLD2|G09=DLD1|B03=OS2|Lab 103=CP3',
      'G04=DBMS1|G05=OOP2|G08=DLD2|G09=DLD4|Lab 103=OOP3|Lab 114/102=DLD3',
      'G04=DLD4|G05=FDFED3|G06=ADSA1|G07=RANAC4|G08=CP2|G09=OCW1|Lab 103=ADSA3',
      'G04=FDFED1|G05=RANAC3|G06=DBMS1|G07=DLD3|G09=DLD1|Lab 103=CP2|Lab 114/102=CNA',
      'G04=FDFED1 Lab|G05=FDFED3 Lab|G06=DBMS2|G07=OS1|G08=DLD3|G09=OCW2|B03=ES|Lab 103=FDFED2|Lab 114/104=MPMC',
      'G06=SE1|G07=PGP1|G08=SE2|G09=QRA 4|B03=OB2',
    ],
  },
  {
    start: 12 * 60,
    end: 13 * 60,
    label: '12:00–13:00',
    cells: [
      'G04=OS1|G06=OS3|G07=DSMA4|Lab 103=CP3',
      'G04=PC4|G05=IDA|G06=RANAC2|G08=OCW4|Lab 103=OOP3|Lab 114/102=DLD3',
      'G04=OOP1|G05=FDFED3|G07=DSMA3|G09=DSMA5|Lab 103=ADSA3',
      'G04=OS1|G05=OS2|G08=OCW4|G09=DSMA1|Lab 103=CP2|Lab 114/102=CNA',
      'G04=FDFED1 Lab|G05=FDFED3 Lab|G06=CP3|G07=DSMA1|G08=ADSA3|G09=CP2|Lab 103=FDFED2|Lab 114/104=MPMC',
      'G06=SE1|G07=PGP1|G08=SE2|G09=QRA 4|B03=OB2',
    ],
  },
  {
    start: 14 * 60 + 15,
    end: 15 * 60 + 15,
    label: '14:15–15:15',
    cells: [
      'G04=DBMS2|G05=ADSA3|G06=FDFED1|G07=OCW3|G08=CP1|G09=RANAC4|Lab 103=OCW2',
      'G04=OS1|G05=OS2|G06=OS3|G07=FDFED2|G08=DSP|G09=DSMA2|B03=DLD1|Lab 103=OCW3',
      'G05=IDA|G06=OOP3|G08=OOP4|G09=DLD4|Lab 103=OOP1',
      'G05=OOP3|G08=CP4|Lab 103=OOP4',
      'G04=RANAC1|G05=IDA|G06=ES|G07=ADSA2|G08=DSMA3|G09=CP4|Lab 114/102=DLD2',
      'G09=QRA 3',
    ],
  },
  {
    start: 15 * 60 + 15,
    end: 16 * 60 + 15,
    label: '15:15–16:15',
    cells: [
      'G04=RANAC3|G05=ADSA2|G06=FDFED1|G07=OOP4|G08=CP3|G09=VLSI|Lab 103=OCW2',
      'G04=ADSA1|G05=ADSA3|G06=DBMS2|G07=FDFED2|G08=DSMA1|G09=CP2|B03=CP4|Lab 103=OCW3|Lab 114/102=ES',
      'G04=RANAC2|G05=DSMA1|G07=ES|G08=DLD2|G09=DSMA4|Lab 103=OOP1',
      'G04=RANAC2|G05=FDFED3|G06=DSP|G07=DSMA2|G08=OS3|G09=DSMA5|Lab 103=OOP4',
      'G04=RANAC4|G05=OOP3|G06=OOP2|G07=OCW3|Lab 103=DBMS1|Lab 114/102=DLD2',
      'G09=QRA 3',
    ],
  },
  {
    start: 16 * 60 + 30,
    end: 17 * 60 + 30,
    label: '16:30–17:30',
    cells: [
      'G04=DSMA5|Lab 103=OOP2|Lab B05=PC3',
      'G04=VLSI|G06=CP1|G07=OCW3|G08=RANAC1|G09=DSMA4|Lab 103=ADSA2|Lab 114/102=ES',
      'G08=EE2|Lab 103=DBMS3|Lab B05=PC1',
      'G04=OOP1|G06=DBMS3|G08=EDL1|G09=CS|Lab 103=DBMS2',
      'G06=EE1|G09=QRA 1|Lab 103=DBMS1|Lab B05=PC2',
      'G04=EDL2',
    ],
  },
  {
    start: 17 * 60 + 30,
    end: 18 * 60 + 30,
    label: '17:30–18:30',
    cells: [
      'Lab 103=OOP2|Lab B05=PC3',
      'Lab 103=ADSA2',
      'G08=EE2|Lab 103=DBMS3|Lab B05=PC1',
      'G08=EDL1|Lab 103=DBMS2',
      'G06=EE1|Lab B05=PC2',
      'G04=EDL2',
    ],
  },
];

export const TIMETABLE: TimetableSlot[] = rawSlots.map(
  ({ cells, ...slot }) => ({
    ...slot,
    bookingByDay: Object.fromEntries(
      DAY_KEYS.map((day, index) => [day, parseBookings(cells[index])]),
    ) as Record<DayKey, Record<string, string>>,
  }),
);

export type RoomAvailability = {
  room: Room;
  availableForMinutes: number;
  availableUntil: number;
  nextClass: string | null;
  nextClassStartsAt: number | null;
  sourceNote: string | null;
};

function getRoomPriority(roomId: string): number {
  if (roomId.startsWith('G0')) return 0;
  if (roomId.startsWith('B0')) return 1;
  if (roomId.startsWith('Lab')) return 2;
  return 3;
}

export type ScheduleSnapshot = {
  dayName: string;
  dayKey: DayKey | null;
  minuteOfDay: number;
  status: 'scheduled' | 'break' | 'before-opening' | 'after-closing' | 'sunday';
  breakLabel: string | null;
  currentSlot: TimetableSlot | null;
  nextSlot: TimetableSlot | null;
  candidates: RoomAvailability[];
  occupiedCount: number;
  freeCount: number;
};

const FIRST_SLOT = TIMETABLE[0].start;
const CLOSING_TIME = TIMETABLE[TIMETABLE.length - 1].end;

function readCampusTime(now: Date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: CAMPUS_TIME_ZONE,
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? '';
  return {
    dayName: value('weekday'),
    hour: Number(value('hour')),
    minute: Number(value('minute')),
  };
}

export function getCampusDateLabel(now: Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: CAMPUS_TIME_ZONE,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(now);
}

export function getCampusTimeLabel(now: Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: CAMPUS_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h12',
  }).format(now);
}

export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder ? `${hours}h ${remainder}m` : `${hours}h`;
}

export function formatClockTime(minutes: number): string {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${String(minute).padStart(2, '0')} ${suffix}`;
}

export function getAvailabilitySnapshot(now: Date): ScheduleSnapshot {
  const { dayName, hour, minute } = readCampusTime(now);
  const minuteOfDay = hour * 60 + minute;
  const dayKey = DAY_KEYS.find((day) => day === dayName) ?? null;
  const currentSlot = TIMETABLE.find(
    (slot) => minuteOfDay >= slot.start && minuteOfDay < slot.end,
  ) ?? null;
  const nextSlot =
    TIMETABLE.find((slot) => slot.start > minuteOfDay) ?? null;

  let status: ScheduleSnapshot['status'];
  let breakLabel: string | null = null;
  if (!dayKey) {
    status = 'sunday';
  } else if (minuteOfDay < FIRST_SLOT) {
    status = 'before-opening';
    breakLabel = 'Before classes';
  } else if (minuteOfDay >= CLOSING_TIME) {
    status = 'after-closing';
    breakLabel = 'After classes';
  } else if (!currentSlot) {
    status = 'break';
    if (minuteOfDay >= 13 * 60 && minuteOfDay < 14 * 60 + 15) {
      breakLabel = 'Lunch break';
    } else {
      breakLabel = 'Short break';
    }
  } else {
    status = 'scheduled';
  }

  if (!dayKey || status === 'after-closing') {
    return {
      dayName,
      dayKey,
      minuteOfDay,
      status,
      breakLabel,
      currentSlot,
      nextSlot,
      candidates: [],
      occupiedCount: 0,
      freeCount: 0,
    };
  }

  const candidates = ROOMS.flatMap((room): RoomAvailability[] => {
    const activeBooking = currentSlot?.bookingByDay[dayKey][room.id] ?? null;
    if (activeBooking) return [];

    const nextBookingSlot =
      TIMETABLE.find(
        (slot) =>
          slot.start > minuteOfDay &&
          Boolean(slot.bookingByDay[dayKey][room.id]),
      ) ?? null;
    const availableUntil = nextBookingSlot?.start ?? CLOSING_TIME;
    const availableForMinutes = Math.max(
      0,
      availableUntil - minuteOfDay,
    );
    if (availableForMinutes <= 0) return [];

    return [
      {
        room,
        availableForMinutes,
        availableUntil,
        nextClass: nextBookingSlot?.bookingByDay[dayKey][room.id] ?? null,
        nextClassStartsAt: nextBookingSlot?.start ?? null,
        sourceNote:
          room.id === 'B01' || room.id === 'B02'
            ? 'No classes listed in source timetable'
            : null,
      },
    ];
  }).sort((a, b) => {
    const priorityDifference = getRoomPriority(a.room.id) - getRoomPriority(b.room.id);
    if (priorityDifference) return priorityDifference;

    const durationDifference = b.availableForMinutes - a.availableForMinutes;
    return durationDifference || a.room.id.localeCompare(b.room.id, 'en', {
      numeric: true,
    });
  });

  const occupiedCount = currentSlot
    ? Object.keys(currentSlot.bookingByDay[dayKey]).length
    : 0;

  return {
    dayName,
    dayKey,
    minuteOfDay,
    status,
    breakLabel,
    currentSlot,
    nextSlot,
    candidates,
    occupiedCount,
    freeCount: candidates.length,
  };
}

export function getDayStatus(day: DayKey, roomId: string, slot: TimetableSlot) {
  return slot.bookingByDay[day][roomId] ?? null;
}