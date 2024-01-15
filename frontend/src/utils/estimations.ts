import { pick } from 'lodash';

import { TSHIRT_LABEL_VALUE_MAPPING, TSHIRT_VALUE_LABEL_MAPPING } from '../constants/decks';

import type { StoredEstimations } from '../store/reducers/estimation/estimations';
import type { UserType, EstimateCardType } from '../types/commonTypes';

export type CountedEstimations = {
    [teamName: string]: {
        [estimation: string]: number,
    },
};

export const countEstimations = (
    ticketEstimations: StoredEstimations[string],
    usersByTeam: Record<string, UserType[]>,
) => {
    return Object.entries(usersByTeam).reduce<CountedEstimations>((acc, [teamName, users]) => {
        const currentTeamUserIds = users.filter(({ team }) => team === teamName).map(({ id }) => id);
        const currentTeamEstimations = pick(ticketEstimations, currentTeamUserIds)

        acc[teamName] = Object.values(currentTeamEstimations).reduce<Record<string, number>>((acc, curr) => {
            if (!curr) return acc;

            if (acc[curr]) {
                acc[curr] += 1;
            } else {
                acc[curr] = 1;
            }

            return acc;
        }, {})

        return acc;
    }, {})
}

export const sortCountedEstimations = (estimations: CountedEstimations[string]) => {
    return Object.entries(estimations).sort(([, aCount], [, bCount]) => bCount - aCount);
}

export type EstimationMedians = {
    [teamName: string]: string;
}

export const getEstimationMedians = (countedEstimations: CountedEstimations) => {
    return Object.entries(countedEstimations).reduce<EstimationMedians>((acc, [teamName, estimations]) => {
        const sorted = sortCountedEstimations(estimations);
        const [medianEstimation] = sorted[0] || [];

        acc[teamName] = medianEstimation;

        return acc;
    }, {})
}

export const findBiggestTShirtFromLabels = (medians: EstimationMedians) => {
    const mediansList = Object.values(medians).filter((medianLabel) => (
        Object.keys(TSHIRT_LABEL_VALUE_MAPPING).includes(medianLabel)
    ));
    const mediansValuesList = mediansList.map((medianLabel) => TSHIRT_LABEL_VALUE_MAPPING[medianLabel as keyof typeof TSHIRT_LABEL_VALUE_MAPPING])
    mediansValuesList.sort((a, b) => b - a);

    return TSHIRT_VALUE_LABEL_MAPPING[mediansValuesList[0]]
}


export const getEstimationSum = (estimationMedians: EstimationMedians, deck: EstimateCardType[]) => {
    const labelCardHashmap = deck.reduce<Record<string, EstimateCardType>>((acc, curr) => ({
        ...acc,
        [curr.label]: curr,
    }), {});

    const deckType = deck[0].type;

    const sum = Object.values(estimationMedians).reduce<number>((acc, curr) => {
        if (!curr) return acc;

        const currentCard = labelCardHashmap[curr];

        if (['utility', 'tshirt'].includes(currentCard.type)) return acc;

        return acc + currentCard.value;
    }, 0)

    if (sum === 0) {
        return '?';
    }

    switch (deckType) {
        case 'story-points':
            return `${sum}`

        case 'time': {
            if (sum > 8) {
                let asDays = sum / 8;

                if (asDays % 1) {
                    asDays = parseFloat(asDays.toFixed(1))
                }

                return `${asDays}d`
            }

            return `${sum}h`
        }
    }

    return `${sum}`;
}
