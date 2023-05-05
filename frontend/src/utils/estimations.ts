import { pick } from 'lodash';

import type { UserType } from '../types/commonTypes';

export type CountedEstimations = {
    [teamName: string]: {
        [estimation: string]: number,
    },
};

export const countEstimations = (
    ticketEstimations: Record<string, string | null>,
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


export const getEstimationSum = (estimationMedians: EstimationMedians) => {
    const sum = Object.values(estimationMedians).reduce<number>((acc, curr) => {
        if (!curr) return acc;

        const asNumber = parseInt(curr);
        const isNotNumber = isNaN(asNumber);

        if (isNotNumber) {
            return acc;
        }

        return acc + asNumber;
    }, 0)

    return sum === 0 ? '?' : sum;
}
