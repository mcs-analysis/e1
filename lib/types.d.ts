type Sources =
	| {
			file: string;
			type: string;
	  }[]
	| string;

type Tracks = {
	file: string;
	label: string;
	kind: string;
	default?: boolean;
	s?: string;
}[];

type IntroOutro = {
	start: number;
	end: number;
};

export interface SourcesResponse {
	sources: Sources;
	tracks: Tracks;
	encrypted: boolean;
	intro: IntroOutro;
	outro: IntroOutro;
	server: number;
	duration?: number;
}
