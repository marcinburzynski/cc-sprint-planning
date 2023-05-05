import type { UserType } from '../types/commonTypes';


export const getAllTeams = (users: UserType[]) => {
    const uniqueTeams = Array.from(new Set(users.map(({ team }) => team)));
    const withoutEmpty = uniqueTeams.filter((team): team is string => !!team);

    return withoutEmpty.sort((a, b) => a.localeCompare(b));
};

export const getUsersByTeam = (users: UserType[], teams = getAllTeams(users)) => {
    return teams.reduce((acc, curr) => {
        const usersFromTeam = users.filter(({ team }) => team === curr);
        const usersSortedByName = usersFromTeam.sort((a, b) => a.name.localeCompare(b.name));

        return {
            ...acc,
            [curr]: usersSortedByName,
        };
    }, {});
}
