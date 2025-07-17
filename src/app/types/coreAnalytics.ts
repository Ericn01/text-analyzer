// Core Data Structures
export interface ChartDataPoint {
    label: string;
    value: number;
    color?: string;
}

export interface XYDataPoint {
    x: number;
    y: number;
}

export interface KeywordItem {
    word: string;
    score: number;
    frequency: number;
}

export interface KeyPhrase {
    phrase: string;
    frequency: number;
    positions: number[];
}

export interface NamedEntity {
    entity: string;
    type: 'TECHNOLOGY' | 'DATE' | 'ORGANIZATION' | 'PERSON' | 'LOCATION';
    frequency: number;
}