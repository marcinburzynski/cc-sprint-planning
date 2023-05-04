import { useState, useEffect } from 'react';
import { isEmpty } from 'lodash';

import { jira } from '../../../../services/jira';
import { Select, SelectOption } from '../../../Select';

import type { JiraSprint } from '../../../../services/jira/jira.types';

type SprintPickerProps = {
    className?: string;
    selectedBoardId: number;
    selectedSprintId?: number;
    onChange: (sprintId?: number) => void;
}

const ALL_OPTION = {
    label: 'All sprints',
    value: 'all',
} as const satisfies SelectOption;

export const SprintPicker = ({ className, selectedBoardId, selectedSprintId, onChange }: SprintPickerProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [sprints, setSprints] = useState([] as JiraSprint[]);

    const handleGetSprints = async () => {
        setIsLoading(true);

        const res = await jira.getSprintsFromBoard(selectedBoardId);

        setSprints(res.data.values);
        setIsLoading(false)
    }

    useEffect(() => {
        if (isEmpty(sprints)) {
            handleGetSprints();
        }
    }, [])

    const handleChange = (selected?: SelectOption) => {
        if (!selected) return onChange();

        if (selected.value === ALL_OPTION.value) {
            return onChange();
        }

        onChange(parseInt(selected.value));
    }

    const options = [
        ALL_OPTION,
        ...sprints.map((sprint) => ({
            label: sprint.name,
            value: `${sprint.id}`,
        })),
    ] satisfies SelectOption[]

    const selectedSprint = ((): SelectOption => {
        if (!selectedSprintId) return ALL_OPTION;

        const sprint = sprints.find(({ id }) => id === selectedSprintId);

        if (!sprint) return ALL_OPTION;

        return {
            label: sprint.name,
            value: `${sprint.id}`,
        };
    })();

    return (
        <Select
            classNameButton={className}
            disabled={isLoading}
            selection={selectedSprint}
            options={options}
            onChange={handleChange}
        />
    )
}
