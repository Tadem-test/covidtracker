import React, { useEffect, useState } from 'react';
import {MenuItem,FormControl,Select,Card,CardContent,} from "@material-ui/core";
import InfoBox from './components/InfoBox/InfoBox';
import LineGraph from './components/LineGraph/LineGraph';
import Table from './components/Table/Table';
import { sortData } from './util/util';
import './App.css';

const apiURL = "http://localhost:5000/api";

function App() {
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState('Global');
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  
  useEffect(() => {
    fetch(`${apiURL}/countries/Global/today`)
    .then(response => response.json())
    .then(data => {
      setCountryInfo(data);
    })
  }, []);

  useEffect(() => {
    const getCountriesData = async () => {
      await fetch (`${apiURL}/countries`)
      .then((response) => response.json())
      .then((data) => {
        const countries = data.map((country) => ({
            name: country.Country,
            value: country.Country
          }));

          const sortedData = sortData(data);
          setTableData(sortedData);
          setCountries(countries);
      });
    };

    getCountriesData();
  }, []);

  const onCountryChange = async (event) => {
    const countryCode = event.target.value;
    setCountry(countryCode);

    const url =countryCode === 'Global' 
    ? `${apiURL}/countries/Global/today` 
    : `${apiURL}/countries/${countryCode}/today`;

    await fetch(url)
    .then(response => response.json())
    .then(data => {
      setCountryInfo(data);
    })
  };

  console.log("data: ", countryInfo);
  return (
    <div className="app">
      <div className="app__left">
        <div className="app__header">
        <h1>COVID-19 Tracker By Talha Hüseyin Demirel</h1>
        <FormControl className="app__dropdown">
          <Select variant="outlined" onChange={onCountryChange} value={country}>
            <MenuItem value="Global">Global</MenuItem>
            {countries.map(country => (
                <MenuItem value={country.value}>{country.name}</MenuItem>
            ))}         
          </Select>
        </FormControl>
        </div>
        
        <div className="app__stats">
              <InfoBox title="Cases" cases={countryInfo.New_cases} total={countryInfo.Cumulative_cases}/>
              <InfoBox title="Recovered" cases={2345} total={3000}/>
              <InfoBox title="Deaths" cases={countryInfo.New_deaths} total={countryInfo.Cumulative_deaths}/>
        </div>

        
        {/* Graph */}
      </div>
      <Card className="app_right">
              <h3>Live Cases by Country</h3>
              <Table countries={tableData} />
              <h3>Worldwide new cases</h3>
              <LineGraph />
      </Card>
    </div>
  );
}

export default App