export const sortData = (data) => {
    const sortedData = [...data];

    return sortedData.sort((a, b) => (a.Cumulative_cases > b.Cumulative_cases ? -1 : 1));
}