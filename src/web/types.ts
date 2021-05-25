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
	carriedOver: number,
	maxCarryOver: number,
}

export interface TimeAwayBreakdown {
	date: Date;
	isFull: boolean,
	period: 'full' | 'am' | 'pm';
	kind?: string,
}

export interface TimeAway {
	id: string;
	personId: string;
	days: number;
	type: string;
	period: DateInterval,
	breakdown: Array<TimeAwayBreakdown>;
}

export interface Person {
	id: string,
	name: string,
	directReports: Array<string>,
}

export interface AppState {
	people: Array<Person>,
	periods: Array<TimeAwayPeriod>,
	timeAway: Array<TimeAway>,
	apiKey: string | null,
	selectedUserId: string | null,
}
