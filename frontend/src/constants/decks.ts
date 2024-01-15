import type { EstimateCardType } from '../types/commonTypes';

export const STORY_POINTS_DECK: EstimateCardType[] = [
    { label: '1', value: 1, type: 'story-points' },
    { label: '2', value: 2, type: 'story-points' },
    { label: '3', value: 3, type: 'story-points' },
    { label: '5', value: 5, type: 'story-points' },
    { label: '8', value: 8, type: 'story-points' },
    { label: '13', value: 13, type: 'story-points' },
    { label: '?', value: 0, type: 'utility' },
]

export const TIME_DECK: EstimateCardType[] = [
    { label: '1h', value: 1, type: 'time' },
    { label: '4h', value: 4, type: 'time' },
    { label: '1d', value: 8, type: 'time' },
    { label: '2d', value: 16, type: 'time' },
    { label: '3d', value: 24, type: 'time' },
    { label: '4d', value: 32, type: 'time' },
    { label: '5d', value: 40, type: 'time' },
    { label: '8d', value: 64, type: 'time' },
    { label: '10d', value: 80, type: 'time' },
    { label: '14d', value: 112, type: 'time' },
    { label: '?', value: 0, type: 'utility' },
]

export const TSHIRT_LABEL_VALUE_MAPPING = {
    S: 1,
    M: 2,
    L: 3,
} as const;

export const TSHIRT_VALUE_LABEL_MAPPING = Object.keys(TSHIRT_LABEL_VALUE_MAPPING).reduce((acc, curr) => {
    return {
        ...acc,
        [TSHIRT_LABEL_VALUE_MAPPING[curr as keyof typeof TSHIRT_LABEL_VALUE_MAPPING]]: curr,
    }
}, {} as Record<number, string>);

export const TSHIRT_SIZE_DECK: EstimateCardType[] = [
    { label: 'S', value: TSHIRT_LABEL_VALUE_MAPPING.S, type: 'tshirt' },
    { label: 'M', value: TSHIRT_LABEL_VALUE_MAPPING.M, type: 'tshirt' },
    { label: 'L', value: TSHIRT_LABEL_VALUE_MAPPING.L, type: 'tshirt' },
    { label: '?', value: 0, type: 'utility' },
]

const getDeckCardsLabelsList = (deck: EstimateCardType[]) => deck.map(({ label }) => label).join(', ');

type DeckOption = {
    label: string;
    value: string;
    deck: EstimateCardType[];
};

export const DECKS: Record<string, DeckOption> = {
    storyPoints: {
        label: `Story Points (${getDeckCardsLabelsList(STORY_POINTS_DECK)})`,
        value: 'storyPoints',
        deck: STORY_POINTS_DECK,
    },
    time: {
        label: `Time (${getDeckCardsLabelsList(TIME_DECK)})`,
        value: 'time',
        deck: TIME_DECK,
    },
    tshirt: {
        label: `T-shirt (${getDeckCardsLabelsList(TSHIRT_SIZE_DECK)})`,
        value: 'tshirt',
        deck: TSHIRT_SIZE_DECK,
    }
}
