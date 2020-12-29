import numeral from "numeral";

export const sortData = (data) => {
    const sortedData = [...data];

    return sortedData.sort((a, b) => (a.Cumulative_cases > b.Cumulative_cases ? -1 : 1));
}

export const prettyPrintStat = (stat) =>
  stat ? `+${numeral(stat).format("0.0a")}` : "+0";