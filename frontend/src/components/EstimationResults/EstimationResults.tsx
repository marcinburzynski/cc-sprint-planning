import ClassName from 'classnames';
import { useMemo } from 'react';

import { getUsersByTeam } from '../../utils/users';
import { countEstimations, getEstimationMedians, getEstimationSum } from '../../utils/estimations';
import { EstimationResultItem } from './EstimationResultItem';
import { Button } from '../Button';

import type { StoredEstimations } from '../../store/reducers/estimation/estimations';
import type { UserType } from '../../types/commonTypes';

import './EstimationResults.scss';

type EstimationResultProps = {
    className?: string;
    users: UserType[];
    ticketEstimations: StoredEstimations[string];
    onEstimateNextTicket: () => void;
}

export const EstimationResults = ({
    className,
    users,
    ticketEstimations,
    onEstimateNextTicket,
}: EstimationResultProps) => {
    const estimationMedians = useMemo(() => {
        const usersByTeam = getUsersByTeam(users);
        const countedEstimations = countEstimations(ticketEstimations, usersByTeam);

        return getEstimationMedians(countedEstimations);
    }, [users, ticketEstimations])

    const estimatesSum = useMemo(() => {
        return getEstimationSum(estimationMedians)
    }, [estimationMedians]);

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

                <EstimationResultItem
                    name="Sum"
                    value={estimatesSum}
                />
            </div>

            <Button buttonSize="medium" onClick={onEstimateNextTicket}>
                Estimate next issue
            </Button>
        </div>
    )
}
