import ClassName from 'classnames';
import { useMemo } from 'react';

import { getUsersByTeam } from '../../utils/users';
import { countEstimations, getEstimationMedians, getEstimationSum } from '../../utils/estimations';
import { EstimationResultItem } from './EstimationResultItem';
import { Button } from '../Button';

import type { StoredEstimations } from '../../store/reducers/estimation/estimations';
import type { UserType, EstimateCardType } from '../../types/commonTypes';

import './EstimationResults.scss';

type EstimationResultProps = {
    className?: string;
    users: UserType[];
    deck: EstimateCardType[];
    ticketEstimations: StoredEstimations[string];
    onEstimateNextTicket: () => void;
}

export const EstimationResults = ({
    className,
    users,
    deck,
    ticketEstimations,
    onEstimateNextTicket,
}: EstimationResultProps) => {
    const estimationMedians = useMemo(() => {
        const usersByTeam = getUsersByTeam(users);
        const countedEstimations = countEstimations(ticketEstimations, usersByTeam);

        return getEstimationMedians(countedEstimations);
    }, [users, ticketEstimations])

    const estimatesSum = useMemo(() => {
        return getEstimationSum(estimationMedians, deck);
    }, [estimationMedians, deck]);

    const fullClassName = ClassName('default-estimation-result', className);

    return (
        <div className={fullClassName}>
            <div className="results">
                {Object.entries(estimationMedians).map(([teamName, median]) => (
                    <EstimationResultItem
                        key={teamName}
                        name={teamName}
                        additionalInfo="(median)"
                        value={median}
                    />
                ))}

                {Object.keys(estimationMedians).length > 1 && (
                    <EstimationResultItem
                        name="Sum"
                        value={estimatesSum}
                    />
                )}
            </div>

            <Button buttonSize="medium" onClick={onEstimateNextTicket}>
                Estimate next issue
            </Button>
        </div>
    )
}
