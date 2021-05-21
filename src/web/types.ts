export interface DateInterval {
	start: Date,
	end: Date,
}

export interface TimeAwayPeriod {
	allowance: number,
	id: string,
	period: DateInterval,
	personId: string,
	upcoming: number,
	used: number,
}

export interface TimeAwayBreakdown {
	date?: Date;
	isFull: boolean,
	period?: 'full' | 'am' | 'pm';
}

export interface TimeAway {
	id: string;
	personId: string;
	days: number;
	type: string;
	period: DateInterval,
	breakdown?: Array<TimeAwayBreakdown>;
}

export interface Person {
	id: string,
	name: string,
}

export interface AppState {
	user: Person | null,
	period: TimeAwayPeriod | null,
	timeAway: Array<TimeAway>,
}
