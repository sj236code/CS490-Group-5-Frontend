// src/components/salon_dashboard/OwnerCalendarView.jsx
import { useMemo } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import enUS from "date-fns/locale/en-US";

import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = {
    "en-US": enUS,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }), // Sunday
    getDay,
    locales,
});

const EVENT_COLORS = [
    "#c7cff9",
    "#f6c1c1",
    "#dcdcdc",
    "#e1bee7",
    "#b3e5fc",
];

function OwnerCalendarView({events, salonHours, view, onViewChange, date, onDateChange,}) {
    // figure out global min/max hours across all open days
    const [minTime, maxTime] = useMemo(() => {
        const baseDate = date || new Date();

        if (!salonHours || salonHours.length === 0) {
            const min = new Date(baseDate);
            const max = new Date(baseDate);
            min.setHours(8, 0, 0, 0);
            max.setHours(18, 0, 0, 0);
            return [min, max];
        }

        const starts = [];
        const ends = [];

        salonHours.forEach((h) => {
            if (h.is_open && h.open_time && h.close_time) {
                const [openHour] = h.open_time.split(":");
                const [closeHour] = h.close_time.split(":");
                starts.push(parseInt(openHour, 10));
                ends.push(parseInt(closeHour, 10));
            }
        });

        if (!starts.length) {
            const min = new Date(baseDate);
            const max = new Date(baseDate);
            min.setHours(8, 0, 0, 0);
            max.setHours(18, 0, 0, 0);
            return [min, max];
        }

        const earliest = Math.max(0, Math.min(...starts) - 1);
        const latest = Math.min(23, Math.max(...ends) + 1);

        const min = new Date(baseDate);
        const max = new Date(baseDate);
        min.setHours(earliest, 0, 0, 0);
        max.setHours(latest, 0, 0, 0);

        return [min, max];
    }, [salonHours, date]);

    // color appointments per employee
    const eventPropGetter = (events) => {
        const colorIndex = events?.resource?.colorIndex ?? 0;
        const bg = EVENT_COLORS[colorIndex % EVENT_COLORS.length];

        return {
            style: {
                backgroundColor: bg,
                borderRadius: "4px",
                border: "none",
                color: "#222",
                fontSize: "0.75rem",
                padding: "2px 4px",
            },
        };
    };

    return (
        <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            view={view}
            onView={onViewChange}
            date={date}
            onNavigate={(newDate) => onDateChange && onDateChange(newDate)}
            min={minTime}
            max={maxTime}
            toolbar={false}
            popup
            style={{ height: 560 }}
            eventPropGetter={eventPropGetter}
        />
    );
}

export default OwnerCalendarView;
