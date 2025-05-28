
// This file contains utility functions for formatting dates and times.
// It includes a function to format message dates into a human-readable format.
//
// The formatMessageDate function takes a date string as input and returns a formatted string.
// It handles various cases such as "Just now", "X min ago", "X hr ago", "Yesterday", and specific date formats.

export function formatMessageDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMin / 60);

    const isToday = date.toDateString() === now.toDateString();

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin} min ago`;
    if (diffHr < 24 && isToday) return `${diffHr} hr ago`;
    if (isYesterday) return "Yesterday";

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays < 7) {
        return date.toLocaleDateString(undefined, { weekday: "short" }); 
    }

    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" }); 
}


export function formatMessageDateTime(dateString: string, includeTime = true): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMin / 60);

    const isToday = date.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    const time = includeTime
        ? ` at ${date.toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
        })}`
        : "";

    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin} min ago`;
    if (diffHr < 24 && isToday) return `${diffHr} hr ago`;
    if (isYesterday) return `Yesterday${time}`;

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays < 7) {
        return `${date.toLocaleDateString(undefined, { weekday: "short" })}${time}`; // e.g. "Tue at 13:20"
    }

    return `${date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
    })}${time}`; // e.g. "Apr 21 at 09:04"
}
