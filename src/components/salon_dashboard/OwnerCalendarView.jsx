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

export const EVENT_COLORS = [
    "#c7cff9",
    "#f6c1c1",
    "#dcdcdc",
    "#e1bee7",
    "#b3e5fc",
];

const CALENDAR_FORMATS = {
    eventTimeRangeFormat: () => "",
    eventTimeRangeStartFormat: () => "",
    eventTimeRangeEndFormat: () => "",
};

function OwnerCalendarView({events, salonHours, view, onViewChange, date, onDateChange,}) {
    // figure out global min/max hours across all open days
    const [minTime, maxTime] = useMemo(() => {
        const base = date || new Date();

        if (!salonHours?.length) {
            const min = new Date(base);
            const max = new Date(base);
            min.setHours(8, 0, 0, 0);
            max.setHours(18, 0, 0, 0);
            return [min, max];
        }

        const starts = [];
        const ends = [];

        salonHours.forEach((h) => {
            if (h.is_open && h.open_time && h.close_time) {
                const [start] = h.open_time.split(":").map(Number);
                const [end] = h.close_time.split(":").map(Number);
                starts.push(start);
                ends.push(end);
            }
        });

        if (!starts.length) {
            const min = new Date(base);
            const max = new Date(base);
            min.setHours(8, 0, 0, 0);
            max.setHours(18, 0, 0, 0);
            return [min, max];
        }

        const earliest = Math.max(0, Math.min(...starts) - 1);
        const latest = Math.min(23, Math.max(...ends) + 1);

        const min = new Date(base);
        const max = new Date(base);
        min.setHours(earliest, 0, 0, 0);
        max.setHours(latest, 0, 0, 0);

        return [min, max];
    }, [salonHours, date]);

    // color appointments per employee
    const eventPropGetter = (event) => {
        const colorIndex = event?.resource?.colorIndex ?? 0;
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

    const slotPropGetter = (slotDate) => {
        if(view === "month") return {};

        const weekday = slotDate.getDay();
        const h = salonHours?.find((s) => s.weekday === weekday);

        //If salon is closed all day
        if(!h || !h.is_open || !h.open_time || !h.close_time){
            return { style: {backgroundColor: "#f7f7f7"}};
        }

        const [openHour, openMin] = h.open_time.split(":").map(Number);
        const [closeHour, closeMin] = h.close_time.split(":").map(Number);

        const openMinutes = openHour * 60 + (openMin || 0);
        const closeMinutes = closeHour * 60 + (closeMin || 0);

        const nowMinutes = slotDate.getHours() * 60 + slotDate.getMinutes();

        const isOpen = nowMinutes >= openMinutes && nowMinutes < closeMinutes;

        if(!isOpen){
            return {style: {backgroundColor: "#f7f7f7"}};
        }

        return {};
    }

    // Override calendar to show name & appt type in calendar
    function CalendarEvent({ event }) {
        return (
            <div>
                <div style={{ fontWeight: 600 }}>
                    {event.resource?.customerName}
                </div>
                <div style={{ fontSize: "0.7rem" }}>
                    {event.title}
                </div>
            </div>
        );
    }

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
            slotPropGetter={slotPropGetter}
            components={{event: CalendarEvent}}
            formats={CALENDAR_FORMATS}
        />
    );
}

export default OwnerCalendarView;
